// zLyrics köşe izleyicisi: Spotify penceresinin köşelerini yuvarlatır.
//
// Yoklama yapmaz: Windows olay kancası (SetWinEventHook) yalnızca Spotify sürecine bağlanır ve sadece
// pencere taşınınca / boyutu değişince / öne gelince / küçültülüp açılınca uyanır. 5 sn'de bir yedek kontrol.
// Oyun oynarken Spotify'a dokunulmadığı sürece hiç çalışmaz.
//
// Yaptıkları (round.ps1 ile aynı mantık):
//  - pencereye yuvarlatılmış bölge (SetWindowRgn), boyut değişince yenilenir
//  - Windows'un kendi köşesi, kenar çizgisi, çerçeve çizimi ve Mica dolgusu kapatılır (köşede saydam kare kalmasın)
//  - Chromium'un gölge için yaptığı çerçeve genişletmesi sıfırlanır
//  - tam ekran / maximize olunca hepsi Windows varsayılanına döner
//  - 127.0.0.1:47391/radius?v=N -> yarıçap (zLyrics Stüdyo'daki kaydırıcı)
//
// Derleme: csc /target:winexe /out:zlyrics-koseler.exe ZLyricsCorners.cs

using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;

static class ZLyricsCorners
{
    // ── Win32
    delegate void WinEventProc(IntPtr hook, uint ev, IntPtr hwnd, int idObject, int idChild, uint thread, uint time);
    [StructLayout(LayoutKind.Sequential)] struct RECT { public int L, T, R, B; }
    [StructLayout(LayoutKind.Sequential)] struct MARGINS { public int L, R, T, B; }
    [StructLayout(LayoutKind.Sequential)] struct MONITORINFO { public int cbSize; public RECT rcMonitor; public RECT rcWork; public int dwFlags; }
    [StructLayout(LayoutKind.Sequential)] struct MSG { public IntPtr hwnd; public uint message; public IntPtr wParam; public IntPtr lParam; public uint time; public int x, y; }

    [DllImport("user32")] static extern IntPtr SetWinEventHook(uint min, uint max, IntPtr hmod, WinEventProc proc, uint pid, uint tid, uint flags);
    [DllImport("user32")] static extern bool UnhookWinEvent(IntPtr h);
    [DllImport("user32")] static extern int GetMessage(out MSG m, IntPtr h, uint a, uint b);
    [DllImport("user32")] static extern bool TranslateMessage(ref MSG m);
    [DllImport("user32")] static extern IntPtr DispatchMessage(ref MSG m);
    [DllImport("user32")] static extern bool PostThreadMessage(uint tid, uint msg, IntPtr w, IntPtr l);
    [DllImport("user32")] static extern IntPtr SetTimer(IntPtr h, IntPtr id, uint ms, IntPtr proc);
    [DllImport("kernel32")] static extern uint GetCurrentThreadId();
    [DllImport("user32")] static extern bool GetWindowRect(IntPtr h, out RECT r);
    [DllImport("user32")] static extern bool IsZoomed(IntPtr h);
    [DllImport("user32")] static extern bool IsIconic(IntPtr h);
    [DllImport("user32")] static extern bool IsWindow(IntPtr h);
    [DllImport("user32")] static extern int SetWindowRgn(IntPtr h, IntPtr rgn, bool redraw);
    [DllImport("user32")] static extern int GetWindowRgn(IntPtr h, IntPtr rgn);
    [DllImport("user32")] static extern uint GetDpiForWindow(IntPtr h);
    [DllImport("user32")] static extern IntPtr MonitorFromWindow(IntPtr h, uint f);
    [DllImport("user32")] static extern bool GetMonitorInfo(IntPtr m, ref MONITORINFO i);
    [DllImport("gdi32")] static extern IntPtr CreateRoundRectRgn(int x1, int y1, int x2, int y2, int w, int h);
    [DllImport("gdi32")] static extern IntPtr CreateRectRgn(int a, int b, int c, int d);
    [DllImport("gdi32")] static extern bool DeleteObject(IntPtr o);
    [DllImport("dwmapi")] static extern int DwmSetWindowAttribute(IntPtr h, int a, ref int v, int s);
    [DllImport("dwmapi")] static extern int DwmGetWindowAttribute(IntPtr h, int a, out int v, int s);
    [DllImport("dwmapi")] static extern int DwmExtendFrameIntoClientArea(IntPtr h, ref MARGINS m);

    const uint EVENT_SYSTEM_FOREGROUND = 0x0003, EVENT_SYSTEM_MINIMIZEEND = 0x0017;
    const uint EVENT_OBJECT_SHOW = 0x8002, EVENT_OBJECT_LOCATIONCHANGE = 0x800B;
    const uint WINEVENT_OUTOFCONTEXT = 0, WM_TIMER = 0x0113, WM_APP_RADIUS = 0x8001;
    const int DWMWA_NCRENDERING_POLICY = 2, DWMWA_CORNER = 33, DWMWA_BORDER = 34, DWMWA_BACKDROP = 38;

    static readonly string Dir = AppDomain.CurrentDomain.BaseDirectory;
    static readonly string CfgFile = Path.Combine(Dir, "..", "round.json");
    static uint mainThread;
    static int radius = 36;
    static IntPtr win = IntPtr.Zero;
    static uint hookedPid;
    static IntPtr hook1 = IntPtr.Zero, hook2 = IntPtr.Zero;
    static string lastSig = "";
    static readonly WinEventProc Proc = OnWinEvent; // GC'ye karşı tutulur

    static void Main()
    {
        bool created;
        using (var mutex = new Mutex(true, "zLyricsCorners", out created))
        {
            if (!created) return; // zaten çalışıyor
            mainThread = GetCurrentThreadId();
            radius = ReadRadius();
            new Thread(Listen) { IsBackground = true }.Start();
            SetTimer(IntPtr.Zero, IntPtr.Zero, 5000, IntPtr.Zero); // yedek kontrol
            Rescan();

            MSG m;
            while (GetMessage(out m, IntPtr.Zero, 0, 0) > 0)
            {
                if (m.message == WM_TIMER) { Rescan(); Apply(true); }
                else if (m.message == WM_APP_RADIUS) { radius = (int)m.wParam; lastSig = ""; Apply(true); }
                TranslateMessage(ref m);
                DispatchMessage(ref m);
            }
        }
    }

    static int ReadRadius()
    {
        try
        {
            var mm = Regex.Match(File.ReadAllText(CfgFile), "\"radius\"\\s*:\\s*(\\d+)");
            if (mm.Success) return Math.Min(48, int.Parse(mm.Groups[1].Value));
        }
        catch { }
        return 36;
    }

    // Spotify'ın ana penceresini bul; süreç değiştiyse olay kancasını yeni sürece bağla
    static void Rescan()
    {
        try
        {
            if (win != IntPtr.Zero && IsWindow(win)) return;
            foreach (var p in Process.GetProcessesByName("Spotify"))
            {
                using (p)
                {
                    if (p.MainWindowHandle == IntPtr.Zero) continue;
                    win = p.MainWindowHandle;
                    lastSig = "";
                    if (hookedPid != (uint)p.Id)
                    {
                        if (hook1 != IntPtr.Zero) UnhookWinEvent(hook1);
                        if (hook2 != IntPtr.Zero) UnhookWinEvent(hook2);
                        hook1 = SetWinEventHook(EVENT_SYSTEM_FOREGROUND, EVENT_SYSTEM_MINIMIZEEND, IntPtr.Zero, Proc, (uint)p.Id, 0, WINEVENT_OUTOFCONTEXT);
                        hook2 = SetWinEventHook(EVENT_OBJECT_SHOW, EVENT_OBJECT_LOCATIONCHANGE, IntPtr.Zero, Proc, (uint)p.Id, 0, WINEVENT_OUTOFCONTEXT);
                        hookedPid = (uint)p.Id;
                    }
                    Apply(true);
                    return;
                }
            }
            win = IntPtr.Zero;
        }
        catch { }
    }

    static void OnWinEvent(IntPtr hook, uint ev, IntPtr hwnd, int idObject, int idChild, uint thread, uint time)
    {
        if (idObject != 0) return; // yalnızca pencerenin kendisi (imleç vb. değil)
        if (win == IntPtr.Zero || !IsWindow(win)) { win = IntPtr.Zero; Rescan(); return; }
        if (hwnd != win) return;
        // öne gelince Chromium Mica / çerçeveyi geri açabiliyor: tam kontrol; taşıma/boyutta yalnızca boyut değiştiyse
        Apply(ev == EVENT_SYSTEM_FOREGROUND || ev == EVENT_SYSTEM_MINIMIZEEND || ev == EVENT_OBJECT_SHOW);
    }

    static void Set(IntPtr h, int attr, int v) { DwmSetWindowAttribute(h, attr, ref v, 4); }

    static void Apply(bool heal)
    {
        IntPtr h = win;
        if (h == IntPtr.Zero || !IsWindow(h) || IsIconic(h)) return;
        RECT rc;
        if (!GetWindowRect(h, out rc)) return;
        int w = rc.R - rc.L, hh = rc.B - rc.T;
        bool zoom = IsZoomed(h);
        var mi = new MONITORINFO { cbSize = Marshal.SizeOf(typeof(MONITORINFO)) };
        if (GetMonitorInfo(MonitorFromWindow(h, 2), ref mi))
        {
            var mon = mi.rcMonitor;
            if (rc.L <= mon.L && rc.T <= mon.T && rc.R >= mon.R && rc.B >= mon.B) zoom = true; // gerçek tam ekran
        }
        bool want = !zoom && radius > 8;
        string sig = w + "x" + hh + (zoom ? "z" : "") + radius;

        bool lost = false;
        if (want && heal)
        {
            IntPtr probe = CreateRectRgn(0, 0, 0, 0);
            lost = GetWindowRgn(h, probe) != 3;
            DeleteObject(probe);
            int bd, cp;
            DwmGetWindowAttribute(h, DWMWA_BACKDROP, out bd, 4);
            DwmGetWindowAttribute(h, DWMWA_CORNER, out cp, 4);
            if (bd != 1 || cp != 1) lost = true;
            var zero = new MARGINS();
            DwmExtendFrameIntoClientArea(h, ref zero);
        }
        if (sig == lastSig && !lost) return;
        lastSig = sig;

        if (!want)
        {
            Set(h, DWMWA_CORNER, 2); Set(h, DWMWA_BORDER, -1); Set(h, DWMWA_NCRENDERING_POLICY, 0); Set(h, DWMWA_BACKDROP, 2);
            SetWindowRgn(h, IntPtr.Zero, true);
            return;
        }
        Set(h, DWMWA_CORNER, 1); Set(h, DWMWA_BORDER, -2); Set(h, DWMWA_NCRENDERING_POLICY, 2); Set(h, DWMWA_BACKDROP, 1);
        var z = new MARGINS();
        DwmExtendFrameIntoClientArea(h, ref z);
        uint dpi = GetDpiForWindow(h);
        if (dpi == 0) dpi = 96;
        int d = (int)Math.Round(radius * 2.0 * dpi / 96);
        SetWindowRgn(h, CreateRoundRectRgn(0, 0, w + 1, hh + 1, d, d), true); // bölgenin sahibi artık pencere
    }

    // Stüdyo'daki kaydırıcı: GET /radius?v=N (yalnızca bu bilgisayardan)
    static void Listen()
    {
        TcpListener l;
        try { l = new TcpListener(IPAddress.Loopback, 47391); l.Start(); }
        catch { return; }
        while (true)
        {
            try
            {
                using (var c = l.AcceptTcpClient())
                {
                    c.ReceiveTimeout = 500;
                    var s = c.GetStream();
                    var buf = new byte[2048];
                    int n = s.Read(buf, 0, buf.Length);
                    var req = Encoding.ASCII.GetString(buf, 0, n);
                    var mm = Regex.Match(req, @"^GET /radius\?v=(\d{1,2})\s");
                    if (mm.Success)
                    {
                        int v = Math.Min(48, int.Parse(mm.Groups[1].Value));
                        try { File.WriteAllText(CfgFile, "{ \"radius\": " + v + " }"); } catch { }
                        PostThreadMessage(mainThread, WM_APP_RADIUS, (IntPtr)v, IntPtr.Zero);
                    }
                    var resp = Encoding.ASCII.GetBytes("HTTP/1.1 204 No Content\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Private-Network: true\r\nContent-Length: 0\r\nConnection: close\r\n\r\n");
                    s.Write(resp, 0, resp.Length);
                }
            }
            catch { }
        }
    }
}
