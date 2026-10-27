// YouTube IFrame oynatıcısı + pürüzsüz saat.
// getCurrentTime() birkaç yüz ms'de bir güncellenir; tick() bunu kare kare
// ilerletip küçük hataları yumuşakça düzelterek titremesiz bir zaman verir.

let apiReady;
function loadApi() {
  if (apiReady) return apiReady;
  apiReady = new Promise((res) => {
    if (window.YT && window.YT.Player) return res(window.YT);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev && prev(); res(window.YT); };
    const iv = setInterval(() => {
      if (window.YT && window.YT.Player) { clearInterval(iv); res(window.YT); }
    }, 150);
  });
  return apiReady;
}

export class Player extends EventTarget {
  constructor(id) {
    super();
    this.id = id;
    this.p = null;
    this.state = -1;
    this.vol = 80;
    this._disp = 0;
    this._raw = 0;
    this._rawAt = 0;
    this._last = performance.now();
    this.ready = this._init();
  }

  async _init() {
    const YT = await loadApi();
    await new Promise((res) => {
      this.p = new YT.Player(this.id, {
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1, controls: 0, disablekb: 1, fs: 0, iv_load_policy: 3,
          modestbranding: 1, playsinline: 1, rel: 0, origin: location.origin,
        },
        events: {
          onReady: () => { this.p.setVolume(this.vol); res(); },
          onStateChange: (e) => this._onState(e.data),
          onError: (e) => this._emit('error', e.data),
        },
      });
    });
  }

  _emit(name, detail) { this.dispatchEvent(new CustomEvent(name, { detail })); }

  _onState(s) {
    this.state = s;
    this._emit('state', s);
    if (s === 0) this._emit('ended');
  }

  _reset(t) {
    this._disp = t;
    this._raw = t;
    this._rawAt = performance.now();
  }

  load(videoId, start = 0) {
    this._reset(start);
    this.p.loadVideoById({ videoId, startSeconds: start });
  }

  play() { this.p?.playVideo(); }
  pause() { this.p?.pauseVideo(); }
  toggle() { this.playing ? this.pause() : this.play(); }

  seek(t) {
    t = Math.max(0, t);
    this.p?.seekTo(t, true);
    this._reset(t);
  }

  setVolume(v) {
    this.vol = v;
    if (!this.p) return;
    this.p.setVolume(v);
    v > 0 ? this.p.unMute() : this.p.mute();
  }

  get playing() { return this.state === 1; }
  get duration() { return this.p?.getDuration?.() || 0; }
  get loaded() { return this.p?.getVideoLoadedFraction?.() || 0; }

  tick() {
    const now = performance.now();
    const dt = Math.min(0.25, (now - this._last) / 1000);
    this._last = now;
    if (!this.p?.getCurrentTime) return this._disp;

    const raw = this.p.getCurrentTime() || 0;
    if (raw !== this._raw) { this._raw = raw; this._rawAt = now; }

    if (this.state === 1) {
      const rate = this.p.getPlaybackRate?.() || 1;
      const target = this._raw + ((now - this._rawAt) / 1000) * rate;
      this._disp += dt * rate;
      const err = target - this._disp;
      if (Math.abs(err) > 0.35) this._disp = target;
      else this._disp += err * Math.min(1, dt * 5);
    } else {
      this._disp = raw;
    }
    return this._disp;
  }
}
