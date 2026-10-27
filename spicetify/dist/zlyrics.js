// zLyrics — derlenmiş dosya, düzenleme: spicetify/src
(function zlyrics() {
'use strict';
{ const st = document.createElement('style'); st.id = 'zlyrics-style';
  st.textContent = "@import url(\"https://fonts.googleapis.com/css2?family=Geist:wght@300..900&family=Geist+Mono:wght@400;500&family=Inter+Tight:wght@400..900&family=Fraunces:opsz,wght@9..144,400..900&display=swap\");\n\n@property --nk-dim { syntax: \"<color>\"; inherits: true; initial-value: rgba(255,255,255,.3); }\n\n\n/* ───────────────────────── kök: kapalı / panel içi / tam pencere arasında akar */\n#zlyrics {\n  --accent: #990033;\n  --accent-hi: #ff3d6f;\n  --fg2: rgba(255,255,255,.64);\n  --fg3: rgba(255,255,255,.38);\n  --line: rgba(255,255,255,.09);\n  --ease: cubic-bezier(.22, 1, .36, 1);\n  --sheet: cubic-bezier(.32, .72, 0, 1);\n  --spring: cubic-bezier(.34, 1.5, .64, 1);\n\n  position: fixed;\n  left: var(--x, 0); top: var(--y, 0);\n  width: var(--w, 100vw); height: var(--h, 100vh);\n  z-index: 2147483000;\n  container-type: size;\n  container-name: nk;\n  background: #000;\n  color: #fff;\n  font-family: var(--nk-font, \"Geist\", ui-sans-serif, system-ui, sans-serif);\n  -webkit-font-smoothing: antialiased;\n  user-select: none;\n  overflow: clip;\n  border-radius: 0;\n  /* yalnızca ekran kartında ucuz olan özellikler canlanır: boyut/blur canlandırmak her karede yerleşim yaptırıyordu */\n  transition: opacity .38s var(--ease), transform .55s var(--sheet);\n}\n#zlyrics.jump { transition: none !important; }\n#zlyrics.morph { opacity: 0; transform: scale(.985); transition-duration: .14s, .14s; }\n#zlyrics[data-view=\"closed\"] { opacity: 0; pointer-events: none; transform: translateY(4%) scale(.97); visibility: hidden; transition-property: opacity, transform, visibility; transition-duration: .32s, .45s, 0s; transition-delay: 0s, 0s, .45s; }\nhtml.nk-still #zlyrics .nk-blob, html.nk-still #zlyrics .nk-art { animation: none; }\n#zlyrics[data-view=\"embed\"], #zlyrics[data-view=\"side\"] {\n  z-index: 3;\n  border-radius: var(--l-rad, 28px);\n  box-shadow: inset 0 0 0 1px rgba(255,255,255,.07);\n}\n#zlyrics:not([data-view=\"full\"]) .only-full,\n#zlyrics[data-view=\"full\"] .only-embed { display: none !important; }\n\n#zlyrics *, #zlyrics *::before, #zlyrics *::after { box-sizing: border-box; margin: 0; padding: 0; }\n#zlyrics button { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; }\n#zlyrics img { display: block; }\n#zlyrics svg { width: 22px; height: 22px; flex: none; }\n\n/* Spotify'ın pencere sürükleme şeridi tıklamaları yutmasın */\n#zlyrics { -webkit-app-region: no-drag; }\n#zlyrics[data-view=\"full\"] .nk-top { -webkit-app-region: drag; }\n#zlyrics .nk-top button, #zlyrics .nk-top .nk-modes, #zlyrics .nk-top .nk-tools, #zlyrics .nk-top .nk-now { -webkit-app-region: no-drag; }\n\n/* ───────────────────────── cam */\n#zlyrics .nk-glass {\n  position: relative; isolation: isolate;\n  /* bulanıklık yok: altındaki zaten bulanık, hareketli arka plan; her karede yeniden bulanıklaştırmak\n     görüntüye bir şey katmadan ekran kartını yoruyordu. Biraz daha yoğun degrade aynı camı verir. */\n  background: linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,.04)), rgba(16,16,20,.32);\n  box-shadow: inset 0 1px 0 rgba(255,255,255,.16), inset 0 -1px 0 rgba(255,255,255,.03), 0 20px 50px -18px rgba(0,0,0,.7);\n}\n#zlyrics .nk-glass::after {\n  content: \"\"; position: absolute; inset: 0; border-radius: inherit; padding: 1px;\n  background: linear-gradient(150deg, rgba(255,255,255,.36), rgba(255,255,255,.06) 30%, rgba(255,255,255,0) 55%, rgba(255,255,255,.14) 100%);\n  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);\n  -webkit-mask-composite: xor; mask-composite: exclude;\n  pointer-events: none; z-index: 1;\n}\n#zlyrics .nk-glass::before {\n  content: \"\"; position: absolute; inset: 0; border-radius: inherit;\n  background: radial-gradient(180px circle at var(--mx, 50%) var(--my, -40%), rgba(255,255,255,.13), transparent 70%);\n  opacity: 0; transition: opacity .5s var(--ease); pointer-events: none; z-index: -1;\n}\n#zlyrics .nk-glass:hover::before { opacity: 1; }\n\n#zlyrics .nk-ib {\n  position: relative;\n  width: 46px; height: 46px; border-radius: 50%;\n  display: grid; place-items: center;\n  transition: transform .5s var(--spring), background .3s, color .3s;\n}\n#zlyrics .nk-ib.sm { width: 38px; height: 38px; }\n#zlyrics .nk-ib.sm svg { width: 19px; height: 19px; }\n#zlyrics .nk-ib:hover { transform: scale(1.08); background: rgba(255,255,255,.07); }\n#zlyrics .nk-ib:active { transform: scale(.9); transition-duration: .12s; }\n#zlyrics .nk-ib.ghost { color: var(--fg2); }\n#zlyrics .nk-ib.ghost:hover { color: #fff; }\n#zlyrics .nk-ib.on { color: var(--accent-hi); }\n#zlyrics .nk-ib.on::after {\n  content: \"\"; position: absolute; bottom: 3px; left: 50%; width: 4px; height: 4px; margin-left: -2px;\n  border-radius: 50%; background: currentColor;\n}\n#zlyrics .nk-one { display: none; position: absolute; top: 4px; right: 4px; font-style: normal; font-size: 9px; font-weight: 700; }\n#zlyrics .nk-ib.one .nk-one { display: block; }\n\n/* ───────────────────────── arka plan */\n#zlyrics .nk-amb { position: absolute; inset: 0; overflow: hidden; background: #000; }\n/* Kapak: 40x40 tuvale bir kez bulanık çizilir, burada sadece büyütülür (her karede blur yok) */\n#zlyrics .nk-art {\n  position: absolute; left: -30%; top: -30%; width: 160%; height: 160%;\n  opacity: 0; transition: opacity 2s var(--ease);\n  animation: nk-spin 120s linear infinite;\n  will-change: transform;\n}\n#zlyrics .nk-art.on { opacity: .6; }\n#zlyrics .nk-blobs { position: absolute; inset: 0; will-change: transform; }\n/* renk JS'ten doğrudan \"color\" ile gelir; sadece bu element geçiş yapar */\n#zlyrics .nk-blob {\n  position: absolute; width: 24cqmax; height: 24cqmax; border-radius: 50%;\n  background: radial-gradient(closest-side, currentColor, transparent);\n  color: #3a0014;\n  opacity: .55;\n  transition: color 2.2s var(--ease);\n  animation: nk-drift 28s ease-in-out infinite alternate;\n  will-change: transform;\n}\n#zlyrics .b1 { top: calc(-28% + 23cqmax); left: calc(-18% + 23cqmax); }\n#zlyrics .b2 { bottom: calc(-32% + 23cqmax); right: calc(-20% + 23cqmax); animation-duration: 34s; animation-direction: alternate-reverse; color: #1a0008; }\n#zlyrics .b3 { top: calc(22% + 17cqmax); left: calc(38% + 17cqmax); width: 18cqmax; height: 18cqmax; animation-duration: 41s; color: #22000c; }\n#zlyrics .b4 { color: var(--accent); bottom: calc(-40% + 23cqmax); left: calc(-25% + 23cqmax); animation-duration: 47s; opacity: .45; }\n#zlyrics .nk-pulse {\n  position: absolute; inset: 0;\n  background: radial-gradient(70% 60% at 50% 55%, rgba(255, 61, 111, .2), transparent 70%);\n  opacity: 0;\n  will-change: opacity;\n}\n#zlyrics .nk-shade { position: absolute; inset: 0; background: radial-gradient(120% 90% at 50% 45%, transparent 30%, rgba(0,0,0,.55) 75%, rgba(0,0,0,.85) 100%); }\n#zlyrics .nk-shade::after { content: \"\"; position: absolute; inset: 0; background: #000; opacity: var(--l-shade, .3); }\n#zlyrics[data-lbg=\"color\"] .nk-art { display: none; }\n#zlyrics[data-lbg=\"black\"] .nk-art, #zlyrics[data-lbg=\"black\"] .nk-blobs, #zlyrics[data-lbg=\"black\"] .nk-pulse { display: none; }\n#zlyrics .nk-grain {\n  position: absolute; inset: 0;\n  background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\");\n  opacity: .04; pointer-events: none;\n}\n#zlyrics[data-bg=\"calm\"] .nk-art, #zlyrics[data-bg=\"calm\"] .b3 { opacity: 0 !important; }\n#zlyrics[data-bg=\"calm\"] .nk-blob { animation-play-state: paused; opacity: .35; }\n@keyframes nk-spin { to { transform: rotate(360deg); } }\n@keyframes nk-drift {\n  0% { transform: translate3d(0,0,0) scale(2.9); }\n  50% { transform: translate3d(8cqw,6cqh,0) scale(3.35); }\n  100% { transform: translate3d(-6cqw,10cqh,0) scale(2.65); }\n}\n\n/* ───────────────────────── üst çubuk */\n#zlyrics .nk-chrome { transition: opacity .6s var(--ease), transform .7s var(--ease); }\n#zlyrics.idle .nk-chrome { opacity: 0; pointer-events: none; }\n#zlyrics.idle .nk-top { transform: translateY(-10px); }\n#zlyrics.idle .nk-dock { transform: translateX(-50%) translateY(14px); }\n#zlyrics.idle { cursor: none; }\n\n#zlyrics .nk-top {\n  position: absolute; top: 0; left: 0; right: 0; z-index: 4;\n  display: flex; align-items: center; gap: 12px;\n  padding: 22px 150px 22px 84px; /* solda Spotify'ın ••• menüsü, sağda pencere düğmeleri */\n}\n#zlyrics[data-view=\"embed\"] .nk-top, #zlyrics[data-view=\"side\"] .nk-top { padding: 16px 18px; }\n#zlyrics[data-view=\"side\"] .nk-top { padding: 12px; justify-content: space-between; }\n#zlyrics[data-view=\"side\"] .nk-now { display: none; }\n#zlyrics[data-view=\"side\"] .nk-modes button { padding: 7px 10px !important; font-size: 12px !important; }\n#zlyrics[data-view=\"side\"] .nk-tools .nk-ib.sm { width: 32px; height: 32px; }\n#zlyrics[data-view=\"side\"] .nk-tools .nk-ib.sm svg { width: 17px; height: 17px; }\n#zlyrics[data-view=\"side\"] .nk-panel { top: 60px; right: 10px; left: 10px; width: auto; }\n#zlyrics[data-view=\"side\"] .nk-next { right: 12px; left: 12px; bottom: 12px; max-width: none; }\n#zlyrics .nk-now { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1; }\n#zlyrics .nk-now img { width: 44px; height: 44px; border-radius: 11px; object-fit: cover; background: #111; box-shadow: 0 8px 20px -8px rgba(0,0,0,.8); }\n#zlyrics .nk-now div { min-width: 0; }\n#zlyrics .nk-now b { display: block; font-size: 15px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n#zlyrics .nk-now span { display: block; font-size: 13px; color: var(--fg2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n#zlyrics[data-view=\"embed\"] .nk-now { visibility: hidden; }\n#zlyrics[data-view=\"side\"] .nk-host { top: 52px; }\n#zlyrics.cover[data-view=\"full\"] .nk-now { visibility: hidden; }\n#zlyrics.swap .nk-now img, #zlyrics.swap .nk-cover img { animation: nk-swap .9s var(--spring); }\n@keyframes nk-swap { 0% { transform: scale(.86); opacity: .3; filter: blur(8px); } }\n\n#zlyrics .nk-modes { display: flex; padding: 4px; border-radius: 999px; }\n#zlyrics .nk-modes button { position: relative; z-index: 2; padding: 9px 16px; border-radius: 999px; font-size: 13.5px; font-weight: 550; color: var(--fg2); transition: color .35s; }\n#zlyrics .nk-modes button:hover { color: #fff; }\n#zlyrics .nk-modes button.on { color: #fff; }\n#zlyrics .nk-pill {\n  position: absolute; z-index: 1; top: 4px; bottom: 4px; left: 0; width: 0; border-radius: 999px;\n  background: rgba(255,255,255,.14);\n  box-shadow: inset 0 1px 0 rgba(255,255,255,.22), 0 4px 14px -4px rgba(0,0,0,.5);\n  transition: left .6s var(--spring), width .6s var(--spring);\n}\n#zlyrics .nk-tools { display: flex; align-items: center; gap: 2px; padding: 4px; border-radius: 999px; }\n\n/* ───────────────────────── kapak düzeni (tam ekran) */\n#zlyrics .nk-cover {\n  position: absolute; z-index: 2;\n  left: 7cqw; top: 50%; width: min(30cqw, 62cqh);\n  transform: translate(-30px, -50%);\n  opacity: 0; pointer-events: none;\n  transition: opacity .7s var(--ease), transform .9s var(--sheet);\n}\n#zlyrics .nk-cover img {\n  width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 26px;\n  box-shadow: 0 50px 90px -30px rgba(0,0,0,.95), 0 0 0 1px rgba(255,255,255,.06);\n  margin-bottom: 26px;\n}\n#zlyrics .nk-cover b { display: block; font-size: clamp(20px, 2cqw, 30px); font-weight: 700; letter-spacing: -.02em; }\n#zlyrics .nk-cover span { display: block; font-size: clamp(15px, 1.4cqw, 20px); color: var(--fg2); margin-top: 4px; }\n#zlyrics.cover[data-view=\"full\"] .nk-cover { opacity: 1; transform: translate(0, -50%); }\n#zlyrics .nk-host { transition: left .8s var(--sheet); }\n#zlyrics.cover[data-view=\"full\"] .nk-host { left: 40cqw; }\n\n/* ───────────────────────── alt kontrol (tam ekran) */\n#zlyrics .nk-dock {\n  position: absolute; left: 50%; bottom: 22px; z-index: 4;\n  transform: translateX(-50%);\n  width: min(1060px, calc(100% - 32px));\n  display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 16px;\n  padding: 10px 14px 10px 12px;\n  border-radius: 30px;\n}\n#zlyrics .nk-ctrl, #zlyrics .nk-side { display: flex; align-items: center; gap: 2px; }\n#zlyrics .nk-play { width: 52px; height: 52px; margin: 0 2px; background: #fff; color: #000; box-shadow: 0 8px 26px -8px rgba(255,255,255,.4); }\n#zlyrics .nk-play:hover { background: #fff; }\n#zlyrics .nk-play svg { width: 24px; height: 24px; }\n#zlyrics .nk-time { display: flex; align-items: center; gap: 12px; min-width: 0; }\n#zlyrics .nk-t { font-family: \"Geist Mono\", ui-monospace, monospace; font-size: 12px; color: var(--fg2); font-variant-numeric: tabular-nums; min-width: 38px; }\n#zlyrics .nk-t.dur { text-align: right; }\n#zlyrics .nk-bar { position: relative; flex: 1; height: 22px; cursor: pointer; touch-action: none; }\n#zlyrics .nk-bar::before, #zlyrics .nk-fill {\n  content: \"\"; position: absolute; left: 0; right: 0; top: 50%;\n  height: 5px; margin-top: -2.5px; border-radius: 99px;\n  transition: height .35s var(--spring), margin .35s var(--spring), background .3s, box-shadow .3s;\n}\n#zlyrics .nk-bar::before { background: rgba(255,255,255,.13); }\n#zlyrics .nk-fill { background: #fff; transform-origin: left center; transform: scaleX(0); }\n#zlyrics .nk-bar:hover::before, #zlyrics .nk-bar:hover .nk-fill, #zlyrics .nk-bar.drag::before, #zlyrics .nk-bar.drag .nk-fill { height: 9px; margin-top: -4.5px; }\n#zlyrics .nk-bar:hover .nk-fill, #zlyrics .nk-bar.drag .nk-fill { background: linear-gradient(90deg, #fff, var(--accent-hi)); box-shadow: 0 0 18px -2px rgba(255,61,111,.7); }\n#zlyrics .nk-vol { display: flex; align-items: center; }\n#zlyrics .nk-bar.vol { flex: none; width: 0; opacity: 0; transition: width .5s var(--spring), opacity .3s, margin .5s; }\n#zlyrics .nk-vol:hover .nk-bar.vol, #zlyrics .nk-bar.vol.drag { width: 86px; opacity: 1; margin: 0 8px 0 2px; }\n\n/* ───────────────────────── sıradaki parça */\n#zlyrics .nk-next {\n  position: absolute; z-index: 4; right: 24px; bottom: 112px;\n  display: flex; align-items: center; gap: 12px;\n  padding: 8px 18px 8px 8px; border-radius: 22px;\n  max-width: 320px; cursor: pointer;\n  opacity: 0; transform: translateY(18px) scale(.94); pointer-events: none;\n  transition: opacity .5s var(--ease), transform .7s var(--spring);\n}\n#zlyrics[data-view=\"embed\"] .nk-next { bottom: 18px; right: 18px; }\n#zlyrics .nk-next.show { opacity: 1; transform: none; pointer-events: auto; }\n#zlyrics .nk-next img { width: 48px; height: 48px; border-radius: 12px; object-fit: cover; }\n#zlyrics .nk-next div { min-width: 0; }\n#zlyrics .nk-next small { display: block; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--accent-hi); font-weight: 600; }\n#zlyrics .nk-next b { display: block; font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n#zlyrics .nk-next span { display: block; font-size: 12.5px; color: var(--fg2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n\n/* ───────────────────────── ayarlar */\n#zlyrics .nk-panel {\n  position: absolute; z-index: 5; right: 22px; top: 88px; width: 340px;\n  max-height: calc(100% - 110px); overflow-y: auto; scrollbar-width: none;\n  border-radius: 26px; padding: 8px 16px 12px;\n  transform: translateX(calc(100% + 40px)) scale(.96); opacity: 0;\n  transition: transform .7s var(--sheet), opacity .4s var(--ease);\n}\n#zlyrics[data-view=\"embed\"] .nk-panel { top: 72px; right: 16px; }\n#zlyrics .nk-panel.open { transform: none; opacity: 1; }\n#zlyrics .nk-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px 4px; }\n#zlyrics .nk-row + .nk-row { border-top: 1px solid var(--line); }\n#zlyrics .nk-row label { font-size: 14px; color: var(--fg2); }\n#zlyrics .nk-seg { display: flex; padding: 3px; border-radius: 999px; background: rgba(255,255,255,.06); }\n#zlyrics .nk-seg button { min-width: 38px; height: 30px; padding: 0 12px; border-radius: 999px; font-size: 13px; font-weight: 550; color: var(--fg2); transition: background .3s, color .3s; }\n#zlyrics .nk-seg button:hover { color: #fff; }\n#zlyrics .nk-seg button.on { background: rgba(255,255,255,.14); color: #fff; }\n#zlyrics .nk-seg output { min-width: 56px; display: grid; place-items: center; font-family: \"Geist Mono\", monospace; font-size: 12.5px; }\n#zlyrics .nk-switch { width: 44px; height: 26px; border-radius: 99px; background: rgba(255,255,255,.14); position: relative; transition: background .35s; }\n#zlyrics .nk-switch i { position: absolute; left: 3px; top: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: transform .55s var(--spring); box-shadow: 0 2px 6px rgba(0,0,0,.4); }\n#zlyrics .nk-switch.on { background: var(--accent); }\n#zlyrics .nk-switch.on i { transform: translateX(18px); }\n#zlyrics .nk-keys { font-size: 12px; color: var(--fg3); line-height: 2; padding: 10px 4px 0; border-top: 1px solid var(--line); }\n#zlyrics kbd { font-family: \"Geist Mono\", monospace; font-size: 11px; color: var(--fg2); border: 1px solid var(--line); border-radius: 6px; padding: 1px 6px; margin-right: 2px; }\n#zlyrics .nk-src { font-size: 12px; color: var(--fg3); padding: 4px 4px 0; }\n\n#zlyrics .nk-toast {\n  position: absolute; left: 50%; bottom: 110px; z-index: 6;\n  transform: translateX(-50%) translateY(20px);\n  padding: 12px 20px; border-radius: 999px; font-size: 14px; font-weight: 500;\n  opacity: 0; pointer-events: none;\n  transition: opacity .4s var(--ease), transform .6s var(--spring);\n}\n#zlyrics .nk-toast.show { opacity: 1; transform: translateX(-50%); }\n\n/* ───────────────────────── söz katmanları (boyutlar söz alanına göre: cqw/cqh) */\n#zlyrics .nk-host {\n  position: absolute; inset: 0; left: 0; z-index: 3;\n  container-type: size;\n  font-family: var(--l-font, inherit);\n  --lyr: calc(clamp(22px, 5cqw, 66px) * var(--l-scale, 1));\n  --col-w: min(1080px, 84cqw);\n}\n#zlyrics[data-size=\"s\"] .nk-host { --lyr: calc(clamp(18px, 3.8cqw, 50px) * var(--l-scale, 1)); }\n#zlyrics[data-size=\"l\"] .nk-host { --lyr: calc(clamp(26px, 6.6cqw, 88px) * var(--l-scale, 1)); }\n#zlyrics .nk-layer {\n  position: absolute; inset: 0;\n  opacity: 0; visibility: hidden; transform: scale(.985);\n  transition: opacity .55s var(--ease), visibility .55s, transform .8s var(--ease);\n}\n#zlyrics .nk-layer.on { opacity: 1; visibility: visible; transform: none; }\n\n#zlyrics .nk-loader {\n  position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);\n  display: flex; gap: 10px; opacity: 0; transition: opacity .4s; pointer-events: none;\n}\n#zlyrics.loading .nk-loader { opacity: 1; }\n#zlyrics .nk-loader i { width: 10px; height: 10px; border-radius: 50%; background: #fff; animation: nk-pulse 1.2s ease-in-out infinite; }\n#zlyrics .nk-loader i:nth-child(2) { animation-delay: .15s; }\n#zlyrics .nk-loader i:nth-child(3) { animation-delay: .3s; }\n@keyframes nk-pulse { 0%, 100% { opacity: .2; transform: scale(.8); } 50% { opacity: 1; transform: scale(1); } }\n\n/* Akış */\n#zlyrics .flow {\n  overflow: hidden;\n  -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 16%, #000 76%, transparent 96%);\n}\n#zlyrics .flow-col { position: absolute; top: 0; left: 50%; width: var(--col-w); transform: translateX(-50%); }\n#zlyrics .fl {\n  position: absolute; left: 0; right: 0; top: 0;\n  padding: .16em .32em; margin-left: -.32em;\n  border-radius: 18px;\n  font-size: var(--lyr); font-weight: var(--l-weight, 700); line-height: 1.17; letter-spacing: -.024em;\n  text-wrap: pretty;\n  opacity: var(--l-dim, .3); scale: .955; transform-origin: 0 50%;\n  filter: blur(calc(min(var(--d, 0), 4) * var(--l-blur, .5) * 1px));\n  will-change: transform; cursor: pointer;\n  --nk-dim: #fff;\n  transition: opacity .8s var(--ease), scale 1s var(--ease), background .3s, --nk-dim .7s var(--ease);\n}\n#zlyrics .fl.on { opacity: 1; scale: 1; filter: none; --nk-dim: rgba(255,255,255,.3); }\n#zlyrics .fl.far { visibility: hidden; will-change: auto; } /* ekran dışı satır katman tutmasın */\n#zlyrics[data-lglow] .fl.on { filter: drop-shadow(0 0 calc(var(--l-glow) * .4em) rgba(255,255,255, calc(var(--l-glow) * .45))); }\n#zlyrics .flow.free .fl { filter: none; opacity: .55; }\n#zlyrics .flow.free .fl.on { opacity: 1; }\n#zlyrics .fl:hover { background: rgba(255,255,255,.06); }\n#zlyrics .fl.on:hover, #zlyrics .fl.gap:hover { background: none; }\n#zlyrics .w {\n  --p: 0; --g: 0;\n  display: inline-block; padding: .08em 0; margin: -.08em 0;\n  background-image: linear-gradient(90deg, #fff calc(var(--p) * 135% - 35%), var(--nk-dim) calc(var(--p) * 135%));\n  -webkit-background-clip: text; background-clip: text; color: transparent;\n  transform: translateY(calc(var(--p) * -.045em * var(--l-lift, 1)));\n}\n#zlyrics .w.long {\n  scale: calc(1 + var(--g) * .05);\n  filter: drop-shadow(0 0 calc(var(--g) * .35em) rgba(255,255,255, calc(var(--g) * .55)));\n  transform-origin: 50% 70%;\n}\n#zlyrics .fl .tr, #zlyrics .fo-tr, #zlyrics .k-tr {\n  font-size: .46em; font-weight: 550; letter-spacing: -.005em; line-height: 1.3;\n  color: rgba(255,255,255,.55);\n  margin-top: .3em;\n  animation: nk-tr-in .8s var(--ease) both;\n}\n@keyframes nk-tr-in { from { opacity: 0; transform: translateY(-.3em); filter: blur(6px); } }\n#zlyrics .fl.gap { height: 1.2em; display: flex; align-items: center; cursor: default; }\n#zlyrics .dots { display: flex; gap: .26em; transform-origin: .3em 50%; }\n#zlyrics .dots i { width: .3em; height: .3em; border-radius: 50%; background: #fff; opacity: calc(.22 + var(--k, 0) * .78); }\n#zlyrics.align-center .flow-col { text-align: center; }\n#zlyrics.align-center .fl { transform-origin: 50% 50%; }\n#zlyrics.align-center .fl.gap { justify-content: center; }\n#zlyrics.align-center .dots { transform-origin: 50% 50%; }\n\n/* Karaoke */\n#zlyrics .karaoke { display: grid; place-items: center; }\n#zlyrics .k-stage { width: 88cqw; display: flex; flex-direction: column; gap: .4em; font-size: calc(clamp(24px, 5.6cqw, 78px) * var(--l-scale, 1)); font-weight: var(--l-weight2, 800); letter-spacing: -.032em; line-height: 1.1; font-weight: var(--l-weight2, 800); }\n#zlyrics[data-size=\"s\"] .k-stage { font-size: clamp(20px, 4.2cqw, 58px); }\n#zlyrics[data-size=\"l\"] .k-stage { font-size: clamp(28px, 7cqw, 100px); }\n#zlyrics .k-count { display: flex; gap: .3em; height: .5em; margin-bottom: .2em; }\n#zlyrics .k-count i { width: .32em; height: .32em; border-radius: 50%; background: var(--accent-hi); box-shadow: 0 0 20px var(--accent); transition: opacity .3s, transform .5s var(--spring); }\n#zlyrics .k-count i.off { opacity: 0; transform: scale(.3); }\n#zlyrics .k-slot { position: relative; display: grid; min-height: 2.25em; }\n#zlyrics .k-slot.top { justify-items: start; align-items: end; text-align: left; }\n#zlyrics .k-slot.bot { justify-items: end; align-items: start; text-align: right; }\n#zlyrics .k-line { grid-area: 1 / 1; max-width: 92%; transition: opacity .55s var(--ease), transform .8s var(--ease), filter .6s var(--ease); }\n#zlyrics .k-line.wait { opacity: .5; }\n#zlyrics .k-line.sing { filter: drop-shadow(0 0 34px rgba(153,0,51,.55)); }\n#zlyrics .k-line.enter { opacity: 0; transform: translateY(.45em); filter: blur(10px); }\n#zlyrics .k-line.leave { opacity: 0; transform: translateY(-.3em) scale(.98); filter: blur(12px); }\n#zlyrics .kw {\n  --p: 0; display: inline-block; padding: .08em 0; margin: -.08em 0;\n  background-image: linear-gradient(90deg, var(--kfill, var(--accent-hi)) calc(var(--p) * 125% - 25%), rgba(255,255,255,.94) calc(var(--p) * 125%));\n  -webkit-background-clip: text; background-clip: text; color: transparent;\n}\n\n/* Odak */\n#zlyrics .focus { display: grid; place-items: center; }\n#zlyrics .fo-line {\n  position: absolute; width: 86cqw; text-align: center;\n  font-size: calc(clamp(30px, 8.2cqw, 132px) * var(--l-scale, 1)); font-weight: var(--l-weight2, 800); letter-spacing: -.045em; line-height: 1.02;\n  text-wrap: balance;\n  transition: opacity .7s var(--ease), filter .7s var(--ease), transform 1s var(--ease);\n}\n#zlyrics[data-size=\"s\"] .fo-line { font-size: clamp(26px, 6.2cqw, 100px); }\n#zlyrics[data-size=\"l\"] .fo-line { font-size: clamp(36px, 10cqw, 160px); }\n#zlyrics .fo-line.out { opacity: 0; filter: blur(18px); transform: translateY(-.35em) scale(1.04); }\n#zlyrics .fo-tr { font-size: .3em; letter-spacing: -.01em; margin-top: .6em; }\n#zlyrics .fo-w {\n  display: inline-block; opacity: 0; filter: blur(16px); transform: translateY(.4em) scale(.94);\n  transition: opacity .6s var(--ease), filter .8s var(--ease), transform 1.1s var(--spring), color .8s;\n}\n#zlyrics .fo-w.on { opacity: 1; filter: blur(0); transform: none; }\n#zlyrics .fo-w.done { color: rgba(255,255,255,.82); }\n#zlyrics .fo-dots { position: absolute; display: flex; gap: 18px; transition: opacity .5s var(--ease), filter .5s var(--ease); }\n#zlyrics .fo-dots.out { opacity: 0; filter: blur(10px); }\n#zlyrics .fo-dots i { width: 16px; height: 16px; border-radius: 50%; background: #fff; opacity: calc(.2 + var(--k, 0) * .8); }\n#zlyrics .k-tr { font-size: .4em; }\n\n/* Düz / boş */\n#zlyrics .nk-plain {\n  overflow-y: auto;\n  padding: 110px max(8cqw, calc((100cqw - var(--col-w)) / 2)) 160px;\n  font-size: calc(var(--lyr) * .62); font-weight: 650; letter-spacing: -.015em; line-height: 1.5;\n  color: var(--fg2); white-space: pre-line; user-select: text;\n  scrollbar-width: none;\n  -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 14%, #000 82%, transparent);\n}\n#zlyrics .nk-plain::-webkit-scrollbar { display: none; }\n#zlyrics .nk-plain small { display: block; font-size: 13px; letter-spacing: .08em; text-transform: uppercase; color: var(--fg3); margin-bottom: 26px; font-weight: 600; }\n#zlyrics.align-center .nk-plain { text-align: center; }\n#zlyrics .nk-empty { display: grid; place-content: center; justify-items: center; gap: 26px; text-align: center; }\n#zlyrics .nk-empty img { width: min(320px, 45cqh); aspect-ratio: 1; object-fit: cover; border-radius: 28px; box-shadow: 0 40px 80px -30px rgba(0,0,0,.9), 0 0 0 1px rgba(255,255,255,.06); }\n#zlyrics .nk-empty p { color: var(--fg2); font-size: 16px; }\n\n/* dar alanlar (panel içi, küçük pencere) */\n@container nk (max-width: 820px) {\n  .nk-modes button { padding: 8px 11px !important; font-size: 12.5px !important; }\n  .nk-now div { display: none; }\n  .nk-dock { grid-template-columns: 1fr auto !important; grid-template-areas: \"time time\" \"ctrl side\"; gap: 4px 8px !important; }\n  .nk-time { grid-area: time; }\n  .nk-ctrl { grid-area: ctrl; }\n  .nk-side { grid-area: side; }\n}\n\n/* ───────────────────────── sıra & arama çekmecesi */\n#zlyrics .nk-drawer {\n  position: absolute; z-index: 6; top: 84px; right: 22px; bottom: 116px; width: 380px;\n  display: flex; flex-direction: column;\n  border-radius: 26px; padding: 12px;\n  opacity: 0; transform: translateX(30px) scale(.97); pointer-events: none;\n  transition: opacity .35s var(--ease), transform .55s var(--sheet);\n}\n#zlyrics .nk-drawer.open { opacity: 1; transform: none; pointer-events: auto; }\n#zlyrics:not([data-view=\"full\"]) .nk-drawer { top: 62px; bottom: 12px; right: 12px; width: min(380px, calc(100% - 24px)); }\n#zlyrics .nk-drawer header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }\n#zlyrics .dr-tabs { display: flex; padding: 3px; border-radius: 999px; background: rgba(255,255,255,.06); }\n#zlyrics .dr-tabs button { padding: 7px 14px; border-radius: 999px; font-size: 13px; font-weight: 550; color: var(--fg2); transition: background .3s, color .3s; }\n#zlyrics .dr-tabs button.on { background: rgba(255,255,255,.14); color: #fff; }\n#zlyrics .dr-search { display: none; align-items: center; gap: 10px; height: 44px; padding: 0 14px; margin-bottom: 8px; border-radius: 999px; background: rgba(255,255,255,.07); box-shadow: inset 0 1px 0 rgba(255,255,255,.08); }\n#zlyrics .nk-drawer[data-tab=\"search\"] .dr-search { display: flex; }\n#zlyrics .dr-search:focus-within { box-shadow: inset 0 1px 0 rgba(255,255,255,.1), 0 0 0 1px var(--accent); }\n#zlyrics .dr-search span { display: grid; color: var(--fg3); }\n#zlyrics .dr-search svg { width: 18px; height: 18px; }\n#zlyrics .dr-search input { flex: 1; min-width: 0; background: none; border: 0; outline: 0; color: #fff; font: inherit; font-size: 14.5px; user-select: text; }\n#zlyrics .dr-search input::placeholder { color: var(--fg3); }\n#zlyrics .dr-list { list-style: none; flex: 1; overflow-y: auto; margin: 0 -4px; padding: 0 4px; scrollbar-width: none; }\n#zlyrics .dr-list::-webkit-scrollbar { display: none; }\n#zlyrics .dr-list li { display: flex; align-items: center; gap: 4px; animation: nk-dr-in .45s var(--ease) both; animation-delay: calc(var(--i) * 18ms); }\n@keyframes nk-dr-in { from { opacity: 0; transform: translateY(8px); } }\n#zlyrics .dr-row { flex: 1; min-width: 0; display: grid; grid-template-columns: 44px 1fr; gap: 12px; align-items: center; padding: 6px; border-radius: 14px; text-align: left; transition: background .25s; }\n#zlyrics .dr-row:hover { background: rgba(255,255,255,.07); }\n#zlyrics .dr-row img { width: 44px; height: 44px; border-radius: 10px; object-fit: cover; background: rgba(255,255,255,.06); }\n#zlyrics .dr-row div { min-width: 0; }\n#zlyrics .dr-row b { display: block; font-size: 14px; font-weight: 550; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n#zlyrics .dr-row span { display: block; font-size: 12.5px; color: var(--fg2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n#zlyrics .dr-add { color: var(--fg2); flex: none; }\n#zlyrics .dr-add:hover { color: #fff; }\n#zlyrics .dr-empty { text-align: center; color: var(--fg3); font-size: 13.5px; padding: 6px 0 2px; }\n#zlyrics .dr-empty:empty { display: none; }\n#zlyrics[data-view=\"side\"] .nk-tools [data-a=\"queue\"], #zlyrics[data-view=\"side\"] .nk-tools [data-a=\"search\"] { width: 32px; height: 32px; }\n\n/* ───────────────────────── zLyrics Stüdyo (tema ayarları; orijinal modda da çalışır) */\n#nk-studio {\n  position: fixed; inset: 0; z-index: 2147483600;\n  font-family: \"Geist\", ui-sans-serif, system-ui, sans-serif !important;\n  color: #fff; -webkit-font-smoothing: antialiased;\n  pointer-events: none;\n}\n#nk-studio * { box-sizing: border-box; margin: 0; padding: 0; font-family: inherit !important; }\n#nk-studio.open { pointer-events: auto; }\n#nk-studio .st-card {\n  position: absolute; top: 70px; right: 140px; width: 360px; max-height: calc(100vh - 190px); overflow-y: auto;\n  padding: 18px 18px 16px; border-radius: 26px;\n  background: linear-gradient(180deg, rgba(40,40,46,.86), rgba(20,20,24,.9));\n  backdrop-filter: blur(24px) saturate(160%);\n  box-shadow: inset 0 1px 0 rgba(255,255,255,.14), inset 0 0 0 1px rgba(255,255,255,.07), 0 40px 80px -24px rgba(0,0,0,.9);\n  opacity: 0; transform: translateY(-10px) scale(.96); transform-origin: top right;\n  transition: opacity .25s cubic-bezier(.22,1,.36,1), transform .45s cubic-bezier(.34,1.4,.64,1);\n  scrollbar-width: none;\n}\n#nk-studio.open .st-card { opacity: 1; transform: none; }\n#nk-studio header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }\n#nk-studio header b { font-size: 16px; font-weight: 650; letter-spacing: -.02em; }\n#nk-studio button { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; }\n#nk-studio .st-x { width: 30px; height: 30px; border-radius: 50%; color: rgba(255,255,255,.6); }\n#nk-studio .st-x:hover { background: rgba(255,255,255,.08); color: #fff; }\n#nk-studio section { padding: 12px 0; border-top: 1px solid rgba(255,255,255,.08); }\n#nk-studio section:first-of-type { border-top: 0; }\n#nk-studio h4 { font-size: 11.5px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: rgba(255,255,255,.42); margin-bottom: 10px; }\n#nk-studio .st-sw { display: flex; flex-wrap: wrap; gap: 9px; margin-bottom: 10px; }\n#nk-studio .st-sw button, #nk-studio .st-custom {\n  width: 30px; height: 30px; border-radius: 50%; background: var(--c);\n  box-shadow: inset 0 1px 0 rgba(255,255,255,.25);\n  transition: transform .4s cubic-bezier(.34,1.5,.64,1), box-shadow .25s;\n}\n#nk-studio .st-sw button:hover { transform: scale(1.12); }\n#nk-studio .st-sw button.on { box-shadow: inset 0 1px 0 rgba(255,255,255,.25), 0 0 0 2px #18181c, 0 0 0 4px #fff; }\n#nk-studio .st-custom { position: relative; display: grid; place-items: center; background: conic-gradient(#f43f5e, #f59e0b, #22c55e, #06b6d4, #6366f1, #d946ef, #f43f5e); cursor: pointer; overflow: hidden; }\n#nk-studio .st-custom span { font-size: 16px; font-weight: 700; text-shadow: 0 1px 3px rgba(0,0,0,.6); pointer-events: none; }\n#nk-studio .st-custom input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }\n#nk-studio .st-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 7px 0; font-size: 13.5px; color: rgba(255,255,255,.78); }\n#nk-studio .st-row.col { flex-direction: column; align-items: stretch; gap: 8px; }\n#nk-studio .st-row output { color: rgba(255,255,255,.45); font-variant-numeric: tabular-nums; margin-left: 4px; }\n#nk-studio input[type=\"range\"] { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; border-radius: 99px; background: rgba(255,255,255,.14); outline: 0; }\n#nk-studio input[type=\"range\"]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,.5); cursor: pointer; transition: transform .3s cubic-bezier(.34,1.5,.64,1); }\n#nk-studio input[type=\"range\"]:active::-webkit-slider-thumb { transform: scale(1.2); }\n#nk-studio .st-tg { flex: none; width: 42px; height: 25px; border-radius: 99px; background: rgba(255,255,255,.16); position: relative; transition: background .3s; }\n#nk-studio .st-tg i { position: absolute; left: 3px; top: 3px; width: 19px; height: 19px; border-radius: 50%; background: #fff; transition: transform .45s cubic-bezier(.34,1.5,.64,1); box-shadow: 0 2px 6px rgba(0,0,0,.4); }\n#nk-studio .st-tg.on { background: var(--nk-accent, #990033); }\n#nk-studio .st-tg.on i { transform: translateX(17px); }\n#nk-studio .st-seg { display: flex; padding: 3px; border-radius: 999px; background: rgba(255,255,255,.07); }\n#nk-studio .st-seg button { padding: 6px 12px; border-radius: 999px; font-size: 12.5px; font-weight: 550; color: rgba(255,255,255,.6); transition: background .25s, color .25s; }\n#nk-studio .st-seg button.on { background: rgba(255,255,255,.16); color: #fff; }\n#nk-studio footer { display: flex; flex-direction: column; gap: 8px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,.08); }\n#nk-studio .st-btn { height: 42px; border-radius: 999px; font-size: 13.5px; font-weight: 600; background: rgba(255,255,255,.08); transition: background .25s, transform .4s cubic-bezier(.34,1.5,.64,1); }\n#nk-studio .st-btn:hover { background: rgba(255,255,255,.13); }\n#nk-studio .st-btn:active { transform: scale(.97); }\n#nk-studio .st-btn.warn { background: rgba(255,255,255,.04); box-shadow: inset 0 0 0 1px rgba(255,255,255,.14); }\n#nk-studio.orig .st-btn.warn { background: var(--nk-accent, #990033); box-shadow: none; }\n#nk-studio.orig section { opacity: .4; pointer-events: none; }\n\n/* ───────────────────────── söz ekranı: Stüdyo bağlantısı */\n#zlyrics .nk-more { display: block; width: 100%; margin: 6px 0 2px; padding: 11px 12px; border-radius: 14px; text-align: left; font-size: 13px; color: var(--fg2); background: rgba(255,255,255,.05); transition: background .25s; }\n#zlyrics .nk-more:hover { background: rgba(255,255,255,.09); }\n#zlyrics .nk-more b { color: var(--accent-hi); font-weight: 600; margin-left: 4px; }\n\n/* ───────────────────────── Stüdyo: sekmeler, hazır temalar */\n#nk-studio .st-tabs { position: relative; display: flex; padding: 3px; margin: 8px 0 4px; border-radius: 999px; background: rgba(255,255,255,.06); }\n#nk-studio .st-tabs button { position: relative; z-index: 1; flex: 1; padding: 7px 0; border-radius: 999px; font-size: 12.5px; font-weight: 550; color: rgba(255,255,255,.6); transition: color .3s; }\n#nk-studio .st-tabs button.on { color: #fff; }\n#nk-studio .st-pill { position: absolute; top: 3px; bottom: 3px; left: 3px; width: 0; border-radius: 999px; background: rgba(255,255,255,.15); box-shadow: inset 0 1px 0 rgba(255,255,255,.18); transition: left .5s cubic-bezier(.34,1.4,.64,1), width .5s cubic-bezier(.34,1.4,.64,1); }\n#nk-studio .st-page[hidden] { display: none; }\n#nk-studio .st-page { animation: st-in .35s cubic-bezier(.22,1,.36,1); }\n@keyframes st-in { from { opacity: 0; transform: translateY(6px); } }\n#nk-studio .st-themes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }\n#nk-studio .st-themes button { display: flex; flex-direction: column; gap: 7px; padding: 8px; border-radius: 16px; background: rgba(255,255,255,.05); text-align: left; transition: background .25s, transform .4s cubic-bezier(.34,1.5,.64,1); }\n#nk-studio .st-themes button:hover { background: rgba(255,255,255,.1); transform: translateY(-2px); }\n#nk-studio .st-themes i { height: 34px; border-radius: 10px; background: radial-gradient(120% 140% at 15% 10%, var(--a), var(--b) 75%); box-shadow: inset 0 1px 0 rgba(255,255,255,.2); }\n#nk-studio .st-themes span { font-size: 12px; font-weight: 550; color: rgba(255,255,255,.8); }\n#nk-studio .st-note { font-size: 12px; color: rgba(255,255,255,.4); padding-top: 6px; line-height: 1.5; }\n#nk-studio .st-card { max-height: calc(100vh - 150px); }\n\n/* temanın 'body * { font-family: ... !important }' kuralı söz alanını ezmesin */\n#zlyrics .nk-host, #zlyrics .nk-host * { font-family: var(--l-font, \"Geist\", ui-sans-serif, system-ui, sans-serif) !important; }\n/* uyku: kapalıyken arka plan katmanları ve animasyonlar tamamen dursun (görünmezken bile bellek ve kare harcıyordu) */\n#zlyrics.asleep .nk-amb, #zlyrics.asleep .nk-host, #zlyrics.asleep .nk-cover, #zlyrics.asleep .nk-drawer { display: none; }\n#zlyrics.asleep * { animation: none !important; }\n/* keskin söz metninin üstüne açılan paneller okunur kalsın: bulanıklık sadece bunlarda ve sadece açıkken */\n#zlyrics .nk-panel.open, #zlyrics .nk-drawer.open { backdrop-filter: blur(22px) saturate(160%); }\n\n/* müzik dururken arka plan animasyonları dursun (boştayken pencere her karede yeniden çizilmesin) */\n#zlyrics.paused .nk-blob, #zlyrics.paused .nk-art { animation-play-state: paused; }\n";
  document.head.append(st); }
// ── util.js
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);

function fmt(s) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return m + ':' + String(r).padStart(2, '0');
}

function debounce(fn, ms) {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
}

const store = {
  get(k, d) {
    try {
      const v = localStorage.getItem('nk.' + k);
      return v == null ? d : JSON.parse(v);
    } catch {
      return d;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem('nk.' + k, JSON.stringify(v));
    } catch {}
  },
};

async function api(path, params) {
  const u = new URL(path, location.origin);
  if (params) for (const [k, v] of Object.entries(params)) if (v != null && v !== '') u.searchParams.set(k, v);
  const r = await fetch(u);
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || r.status);
  return j;
}

async function post(path, body) {
  const r = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || r.status);
  return j;
}

/** t anında aktif olan öğenin indeksi (öğeler .t'ye göre sıralı). */
function activeAt(items, t) {
  let lo = 0, hi = items.length - 1, ans = -1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1;
    if (items[m].t <= t) { ans = m; lo = m + 1; } else hi = m - 1;
  }
  return ans;
}

/** Sadece değiştiyse CSS değişkeni yaz — her karede DOM'a dokunmamak için. */
function setVar(node, name, v, cache, key) {
  const r = Math.round(v * 1000) / 1000;
  if (cache[key] === r) return;
  cache[key] = r;
  node.style.setProperty(name, r);
}

// ── lyrics.js

const GAP_MIN = 4.2; // bu kadar boşlukta "• • •" ara gösterilir

/**
 * Sunucudan gelen satırları ({t, end?, text, words?}) zamanlamaya hazırlar:
 *  - her satırın söylenme bitişi (gelmediyse tahmin)
 *  - kelime kelime zamanlama (enhanced LRC yoksa harf uzunluğuna göre dağıtım)
 *  - uzun boşluklar için "ara" öğeleri
 */
function prepare(raw, duration) {
  const lines = raw
    .filter((l) => l.text && l.text.trim())
    .map((l) => ({ kind: 'line', t: l.t, end: l.end, text: l.text.trim(), rawWords: l.words }));

  for (let i = 0; i < lines.length; i++) {
    const L = lines[i];
    const next = lines[i + 1]?.t ?? (duration > L.t ? duration : L.t + 8);
    const est = clamp(L.text.length * 0.12 + 0.5, 1.1, 7);
    L.estimated = !(L.end > L.t);
    if (L.estimated) {
      const avail = next - L.t;
      L.end = L.t + (avail <= est * 1.6 ? avail * 0.94 : est);
    }
    L.end = Math.min(L.end, next);
    L.next = next;
    L.idx = i;
    L.words = buildWords(L);
  }

  const items = [];
  if (lines.length && lines[0].t > GAP_MIN) items.push({ kind: 'gap', t: 0, end: lines[0].t });
  lines.forEach((L, i) => {
    items.push(L);
    const nx = lines[i + 1];
    if (!nx) return;
    const start = L.end + (L.estimated ? 1.2 : 0.35);
    if (nx.t - start > GAP_MIN - 1) items.push({ kind: 'gap', t: start, end: nx.t });
  });

  return { lines, items };
}

function buildWords(L) {
  if (L.rawWords?.length) {
    return L.rawWords.map((w, k, a) => {
      const t1 = a[k + 1]?.t ?? L.end;
      return { text: w.text, t0: w.t, t1, long: t1 - w.t > 1.1 && w.text.length <= 14 };
    });
  }
  const toks = L.text.split(/\s+/).filter(Boolean);
  const weights = toks.map((w) => w.replace(/[^\p{L}\p{N}]/gu, '').length + 1.4);
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  const span = L.end - L.t;
  let acc = 0;
  return toks.map((text, k) => {
    const t0 = L.t + (acc / total) * span;
    acc += weights[k];
    const t1 = L.t + (acc / total) * span;
    return { text, t0, t1, long: t1 - t0 > 1.1 && text.length <= 14 };
  });
}

/** Kelime ilerlemesi 0..1, hafif ease ile — dolgu doğrusal görünmesin. */
function wordProgress(w, t) {
  const p = clamp((t - w.t0) / (w.t1 - w.t0 || 1));
  return p < 1 ? p * (2 - p) * 0.35 + p * 0.65 : 1;
}

/** Ara boyunca üç noktanın doluluğu ve nefes ölçeği. */
function gapState(g, t, now) {
  const len = g.end - g.t;
  const p = clamp((t - g.t) / len);
  const k = [0, 1, 2].map((i) => clamp(p * 3 - i));
  const left = g.end - t;
  let s = 1 + 0.07 * Math.sin(now / 1000 * 2.6);
  if (left < 0.5) s *= clamp(left / 0.5) ** 2;
  return { k, s };
}

// ── flow.js


// Akış modu. Her satır mutlak konumda; dikey kayma her satır için ayrı bir
// yay (spring) ile ilerler ve aktif satırın altındakiler kademeli gecikmeyle
// hedefi alır — satırlar birbirini dalga gibi takip eder.

const LEAD = 0.22;      // satır, söylenmeden biraz önce yerine otursun
const STAGGER = 42;     // ms / satır
const K = 125, C = 21;  // yay sertliği / sönüm
const STEP = 1 / 240;   // sabit fizik adımı: her ekran hızında aynı his
const FREE_MS = 2800;   // elle kaydırmadan sonra senkrona dönüş

class Flow {
  constructor(host, { onSeek }) {
    this.host = host;
    this.onSeek = onSeek;
    this.col = el('div', 'flow-col');
    host.append(this.col);
    this.items = [];
    this.nodes = [];
    this.st = [];
    this.active = -2;
    this.user = 0;
    this.userAt = 0;
    this.lastNow = performance.now();
    this.needSnap = true;

    host.addEventListener('wheel', (e) => {
      e.preventDefault();
      this._nudge(-e.deltaY * (e.deltaMode === 1 ? 32 : 1));
    }, { passive: false });

    let ty = null;
    host.addEventListener('touchstart', (e) => { ty = e.touches[0].clientY; }, { passive: true });
    host.addEventListener('touchmove', (e) => {
      if (ty == null) return;
      const y = e.touches[0].clientY;
      this._nudge(y - ty);
      ty = y;
    }, { passive: true });
    host.addEventListener('touchend', () => { ty = null; });

    this.col.addEventListener('click', (e) => {
      const n = e.target.closest('.fl');
      if (!n || n.classList.contains('gap')) return;
      const it = this.items[+n.dataset.i];
      this.user = 0;
      this.host.classList.remove('free');
      this.onSeek(it.t);
    });

    new ResizeObserver(() => this.measure()).observe(host);
    document.fonts?.ready.then(() => this.measure());
  }

  _nudge(d) {
    if (!this.items.length) return;
    const lim = this.total + this.host.clientHeight;
    this.user = clamp(this.user + d, -lim, lim);
    this.userAt = performance.now();
    this.host.classList.add('free');
  }

  mount(prep) {
    this.col.textContent = '';
    this.items = prep ? prep.items : [];
    this.nodes = [];
    this.st = [];
    this.words = [];
    this.dots = [];
    this.items.forEach((it, i) => {
      const n = el('div', 'fl');
      n.dataset.i = i;
      if (it.kind === 'gap') {
        n.classList.add('gap');
        const d = el('div', 'dots');
        d.style.transform = 'scale(0)';
        d.append(el('i'), el('i'), el('i'));
        n.append(d);
        this.dots[i] = { wrap: d, dots: [...d.children], c: {} };
      } else {
        const ws = it.words.map((w, k) => {
          const s = el('span', 'w' + (w.long ? ' long' : ''), w.text);
          if (k) n.append(' ');
          n.append(s);
          return s;
        });
        if (it.tr) n.append(el('div', 'tr', it.tr));
        this.words[i] = { els: ws, c: {} };
      }
      this.col.append(n);
      this.nodes.push(n);
      this.st.push({ y: 0, v: 0, target: 0, pend: null, pendAt: 0, f: it.kind === 'gap' ? 0 : 1, drawn: Infinity, d: -1 });
    });
    this.active = -2;
    this.user = 0;
    this.host.classList.remove('free');
    this.measure();
    this.needSnap = true;
    this.acc = 0;
  }

  /** Satır altına çeviri ekler; satırlar yeni yerlerine yayla kayar. */
  annotate(trs) {
    this.items.forEach((it, i) => {
      if (it.kind !== 'line') return;
      const n = this.nodes[i];
      n.querySelector('.tr')?.remove();
      if (it.tr) n.append(el('div', 'tr', it.tr));
    });
    this.measure(false);
  }

  measure(instant = true) {
    // görünmezken ölçmek (offsetHeight) tüm sayfanın yerleşimini zorlar; açılınca show() ölçer
    if (this.paused) return;
    if (!this.nodes.length) return;
    this.h = this.nodes.map((n) => n.offsetHeight);
    const fs = parseFloat(getComputedStyle(this.nodes[0]).fontSize) || 40;
    // satır aralığı CSS'ten ayarlanabilir (--l-gap, em cinsinden); yoksa 0.34em
    this.space = fs * (parseFloat(getComputedStyle(this.host).getPropertyValue('--l-gap')) || 0.34);
    this.H = this.host.clientHeight;
    this.anchor = this.H * 0.3;
    this.total = this.h.reduce((a, b) => a + b + this.space, 0);
    this._retarget(performance.now(), instant);
  }

  // Aktif satırı çapaya getiren kaydırma değeri (ara öğeleri hedef boyda sayılır)
  _scrollFor(active) {
    let y = 0;
    const upto = Math.max(0, active);
    for (let i = 0; i < upto; i++) {
      const f = this.items[i].kind === 'gap' ? 0 : 1;
      y += (this.h[i] + this.space) * f;
    }
    return this.anchor - y;
  }

  _retarget(now, instant) {
    if (!this.h) return;
    const S = this._scrollFor(this.active);
    const a = Math.max(0, this.active);
    this.st.forEach((s, i) => {
      const delay = i <= a ? 0 : Math.min(i - a, 10) * STAGGER;
      if (instant || delay === 0) { s.target = S; s.pend = null; }
      else { s.pend = S; s.pendAt = now + delay; }
    });
  }

  _setActive(idx, now) {
    const prev = this.active;
    this.active = idx;
    this.nodes.forEach((n, i) => {
      const d = Math.min(Math.abs(i - idx), 6);
      const s = this.st[i];
      if (s.d !== d) { s.d = d; n.style.setProperty('--d', d); }
      n.classList.toggle('on', i === idx);
    });
    this._retarget(now, Math.abs(idx - prev) > 12);
  }

  show() { this.paused = false; this.needSnap = true; this.measure(); }

  update(t, now) {
    const dt = Math.min(0.05, (now - this.lastNow) / 1000);
    this.lastNow = now;
    if (!this.items.length) return;

    const idx = activeAt(this.items, t + LEAD);
    if (idx !== this.active) this._setActive(idx, now);

    if (this.user && now - this.userAt > FREE_MS) {
      this.user += (0 - this.user) * Math.min(1, dt * 4);
      if (Math.abs(this.user) < 0.5) { this.user = 0; this.host.classList.remove('free'); }
    }

    // ara öğelerinin açılıp kapanması
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].kind !== 'gap') continue;
      const s = this.st[i];
      const was = s.f;
      s.f += ((i === idx ? 1 : 0) - s.f) * Math.min(1, dt * 7);
      if (s.f < 0.002) s.f = 0;
      if (i !== idx && s.f !== was) this.dots[i].wrap.style.transform = `scale(${s.f.toFixed(3)})`;
    }

    // her karede clientHeight okumak, Spotify gibi sürekli değişen bir sayfada tüm yerleşimi zorlar;
    // yükseklik measure()'da (boyut değişince) önbelleğe alınır
    const H = this.H || this.host.clientHeight;
    let pos = 0;
    const snap = this.needSnap;
    this.acc = Math.min(this.acc + dt, 0.1);
    const steps = Math.floor(this.acc / STEP);
    this.acc -= steps * STEP;
    for (let i = 0; i < this.nodes.length; i++) {
      const s = this.st[i];
      if (s.pend != null && (snap || now >= s.pendAt)) { s.target = s.pend; s.pend = null; }
      const goal = s.target + this.user;
      if (snap) { s.y = goal; s.v = 0; }
      else {
        // yarı-örtük Euler, sabit adım
        for (let k = 0; k < steps; k++) {
          s.v += (K * (goal - s.y) - C * s.v) * STEP;
          s.y += s.v * STEP;
        }
      }
      const y = s.y + pos;
      pos += (this.h[i] + this.space) * s.f;

      const far = y < -this.h[i] - 260 || y > H + 260;
      const n = this.nodes[i];
      if (far !== n._far) { n._far = far; n.classList.toggle('far', far); }
      if (!far && Math.abs(y - s.drawn) > 0.05) {
        s.drawn = y;
        n.style.transform = `translate3d(0,${y.toFixed(2)}px,0)`;
      }
    }
    this.needSnap = false;

    // önceki satırın son kelimeleri yarım kalmasın
    const prev = this.items[idx - 1];
    if (prev?.kind === 'line') this._fill(prev, idx - 1, t);

    const it = this.items[idx];
    if (!it) return;
    if (it.kind === 'gap') {
      const g = gapState(it, t, now);
      const d = this.dots[idx];
      d.dots.forEach((e, k) => setVar(e, '--k', g.k[k], d.c, k));
      d.wrap.style.transform = `scale(${(g.s * this.st[idx].f).toFixed(3)})`;
    } else {
      this._fill(it, idx, t);
    }
  }

  _fill(it, i, t) {
    const W = this.words[i];
    it.words.forEach((w, k) => {
      const p = wordProgress(w, t);
      setVar(W.els[k], '--p', p, W.c, k);
      if (w.long) setVar(W.els[k], '--g', p > 0 && p < 1 ? Math.sin(p * Math.PI) : 0, W.c, 'g' + k);
    });
  }
}

// ── karaoke.js


// Klasik karaoke: iki yuva (üst sola, alt sağa yaslı). Çift satırlar üstte,
// tek satırlar altta. Biri söylenirken diğeri sıradakini bekletir.
// Uzun bir aradan sonra gelen satırdan önce 3-2-1 noktaları.

class Karaoke {
  constructor(host) {
    this.host = host;
    const stage = el('div', 'k-stage');
    this.count = el('div', 'k-count');
    for (let i = 0; i < 3; i++) this.count.append(el('i', 'off'));
    this.slots = [el('div', 'k-slot top'), el('div', 'k-slot bot')].map((node) => ({ node, idx: -1, line: null, c: {} }));
    stage.append(this.count, this.slots[0].node, this.slots[1].node);
    host.append(stage);
    this.lines = [];
  }

  mount(prep) {
    this.lines = prep ? prep.lines : [];
    this.slots.forEach((s) => { s.node.textContent = ''; s.idx = -1; s.line = null; });
  }

  show() {}

  annotate() { this.slots.forEach((s) => { s.line?.remove(); s.line = null; s.idx = -1; }); }

  _put(slot, idx) {
    if (slot.idx === idx) return;
    slot.idx = idx;
    const old = slot.line;
    if (old) {
      old.classList.add('leave');
      setTimeout(() => old.remove(), 650);
    }
    slot.line = null;
    slot.c = {};
    if (idx < 0 || !this.lines[idx]) return;
    const L = this.lines[idx];
    const ln = el('div', 'k-line enter');
    slot.words = L.words.map((w, k) => {
      const s = el('span', 'kw', w.text);
      if (k) ln.append(' ');
      ln.append(s);
      return s;
    });
    if (L.tr) ln.append(el('div', 'k-tr', L.tr));
    slot.node.append(ln);
    slot.line = ln;
    requestAnimationFrame(() => requestAnimationFrame(() => ln.classList.remove('enter')));
  }

  update(t) {
    const L = this.lines;
    if (!L.length) return;
    const a = activeAt(L, t + 0.05);
    const from = Math.max(a, 0);
    // her yuvaya kendi paritesinin sıradaki satırı
    for (let p = 0; p < 2; p++) {
      let j = from % 2 === p ? from : from + 1;
      // söylenip biten satırın yuvası hemen iki sonrakini hazırlar
      if (j === a && L[j] && t > L[j].end + 0.6 && L[j + 2]) j += 2;
      this._put(this.slots[p], j < L.length ? j : -1);
    }

    for (const s of this.slots) {
      if (!s.line) continue;
      const ln = L[s.idx];
      const singing = s.idx === a;
      s.line.classList.toggle('sing', singing && t < ln.end + 0.4);
      s.line.classList.toggle('wait', !singing);
      ln.words.forEach((w, k) => setVar(s.words[k], '--p', singing ? wordProgress(w, t) : 0, s.c, k));
    }

    // geri sayım: uzun boşluk sonrası satır
    const nx = L[a + 1];
    const prevEnd = a >= 0 ? L[a].end : 0;
    let n = 0;
    if (nx && nx.t - prevEnd > 4) {
      const left = nx.t - t;
      if (left > 0 && left <= 3) n = Math.ceil(left);
    }
    if (n !== this._n) {
      this._n = n;
      [...this.count.children].forEach((d, i) => d.classList.toggle('off', i >= n));
    }
  }
}

// ── focus.js


// Odak: ekranda tek satır. Kelimeler söylendikleri an bulanıklıktan
// süzülerek belirir; satır biterken yukarı doğru dağılır.

class Focus {
  constructor(host) {
    this.host = host;
    this.items = [];
    this.cur = null;
    this.idx = -2;
  }

  mount(prep) {
    this.items = prep ? prep.items : [];
    this.host.textContent = '';
    this.cur = null;
    this.idx = -2;
  }

  show() {}

  // çeviri gelince mevcut satır çeviriyle yeniden kurulsun
  annotate() { this.cur?.node.remove(); this.cur = null; this.idx = -2; }

  _swap(idx) {
    if (this.cur) {
      const old = this.cur.node;
      old.classList.add('out');
      setTimeout(() => old.remove(), 1000);
    }
    this.cur = null;
    const it = this.items[idx];
    if (!it) return;

    if (it.kind === 'gap') {
      const node = el('div', 'fo-dots');
      node.append(el('i'), el('i'), el('i'));
      this.host.append(node);
      this.cur = { node, it, dots: [...node.children], c: {} };
      return;
    }
    const node = el('div', 'fo-line');
    const inner = el('span');
    if (it.text.length > 70) inner.style.fontSize = '.62em';
    else if (it.text.length > 42) inner.style.fontSize = '.78em';
    const words = it.words.map((w, k) => {
      const s = el('span', 'fo-w', w.text);
      if (k) inner.append(' ');
      inner.append(s);
      return s;
    });
    node.append(inner);
    if (it.tr) node.append(el('div', 'fo-tr', it.tr));
    this.host.append(node);
    this.cur = { node, it, words, state: words.map(() => 0) };
  }

  update(t, now) {
    if (!this.items.length) return;
    const idx = activeAt(this.items, t + 0.12);
    if (idx !== this.idx) { this.idx = idx; this._swap(idx); }
    const c = this.cur;
    if (!c) return;

    if (c.it.kind === 'gap') {
      const g = gapState(c.it, t, now);
      c.dots.forEach((d, k) => setVar(d, '--k', g.k[k], c.c, k));
      c.node.style.transform = `scale(${g.s.toFixed(3)})`;
      return;
    }
    c.it.words.forEach((w, k) => {
      const st = t >= w.t1 + 0.5 ? 2 : t >= w.t0 - 0.1 ? 1 : 0;
      if (st === c.state[k]) return;
      c.state[k] = st;
      c.words[k].classList.toggle('on', st >= 1);
      c.words[k].classList.toggle('done', st === 2);
    });
  }
}

// ── studio.js
// zLyrics Stüdyo: temayı ve söz ekranını canlı özelleştirme paneli (üst çubuktaki palet düğmesi).
// Ayarlar yalnızca değiştiklerinde yazılır: tema değişkenleri :root'a, söz ayarları söz ekranının köküne.

const NK_DEFAULTS = {
  // tema
  accent: '#990033',
  follow: false,      // vurgu rengi çalan şarkının kapağından gelsin
  // arayüz
  panel: 55,          // panel koyuluğu %
  radius: 28,         // panel köşeleri px
  win: 36,            // pencere köşeleri px: alt çubuk 28 + 8 boşluk = eş merkezli (0 = Windows varsayılanı)
  rim: 60,            // kenar ışığı %
  shadow: 70,         // gölge derinliği %
  glow: 80,           // arka plan ışığı %
  art: true,          // arkada bulanık kapak
  font: 'geist',      // geist | inter | spotify
  // sözler
  lfont: 'geist',     // geist | inter | serif
  lsize: 100,         // %
  lweight: 700,
  lgap: 34,           // satır aralığı (em/100)
  ldim: 30,           // pasif satır görünürlüğü %
  lblur: 50,          // pasif satır bulanıklığı %
  lglow: 0,           // aktif satır parlaması %
  llift: true,        // söylenen kelime hafifçe kalksın
  lbg: 'art',         // art | color | black
  lshade: 30,         // arka plan karartma %
  kfill: 'accent',    // karaoke dolum: accent | white
  mic: 'side',        // mikrofon: side | full
  // hareket
  motion: true,       // arka plan hareketi
  anim: true,         // sayfa / kart animasyonları
  original: false,    // Spotify'ın kendi görünümü
};
const NK_SWATCHES = [
  ['Bordo', '#990033'], ['Kızıl', '#d61f45'], ['Gül', '#db2777'], ['Mor', '#7c3aed'],
  ['Gece', '#2563eb'], ['Okyanus', '#0891b2'], ['Orman', '#16a34a'], ['Kehribar', '#d97706'],
];
// hazır temalar: birden çok ayarı birlikte değiştirir
const NK_THEMES = [
  { name: 'Bordo Gece', c: ['#990033', '#2a000e'], set: { accent: '#990033', glow: 80, panel: 55, art: true, lbg: 'art', lshade: 30, rim: 60 } },
  { name: 'Okyanus', c: ['#0891b2', '#032a33'], set: { accent: '#0891b2', glow: 85, panel: 50, art: true, lbg: 'art', lshade: 25, rim: 60 } },
  { name: 'Orman', c: ['#16a34a', '#06260f'], set: { accent: '#16a34a', glow: 70, panel: 60, art: true, lbg: 'color', lshade: 35, rim: 50 } },
  { name: 'Neon', c: ['#a855f7', '#1e0b3a'], set: { accent: '#a855f7', glow: 100, panel: 40, art: true, lbg: 'art', lshade: 15, rim: 90, lglow: 45 } },
  { name: 'Kehribar', c: ['#d97706', '#2b1700'], set: { accent: '#d97706', glow: 75, panel: 55, art: false, lbg: 'color', lshade: 30, rim: 55 } },
  { name: 'Mono', c: ['#e5e5e5', '#111111'], set: { accent: '#d4d4d4', glow: 25, panel: 75, art: false, lbg: 'black', lshade: 50, rim: 40, kfill: 'white' } },
];
const NK_FONTS = {
  geist: '"Geist", ui-sans-serif, system-ui, sans-serif',
  inter: '"Inter Tight", ui-sans-serif, system-ui, sans-serif',
  serif: '"Fraunces", Georgia, serif',
  spotify: 'SpotifyMixUI, "Helvetica Neue", Arial, sans-serif',
};
const NK_PALETTE = '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 1.5a6.5 6.5 0 1 0 0 13c.9 0 1.4-.6 1.4-1.3 0-.4-.2-.7-.4-1-.2-.3-.4-.6-.4-1 0-.7.6-1.3 1.3-1.3h1.5A3.1 3.1 0 0 0 14.5 6.8C14.5 3.8 11.6 1.5 8 1.5ZM4.3 8.4a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1.9-2.8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm3.6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm2 2.8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/></svg>';
const NK_WIN_PORT = 47391; // köşe programı (ZLyricsCorners) bu porttan pencere yarıçapını alır

function nkHex2Hsl(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
function nkHsl2Hex(h, s, l) {
  const f = (n) => {
    const k = (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2, '0');
  };
  return '#' + f(0) + f(8) + f(4);
}
const nkRgb = (hex) => { const n = parseInt(hex.slice(1), 16); return `${n >> 16},${(n >> 8) & 255},${n & 255}`; };

function nkStudio({ root, amb }) {
  let cfg = { ...NK_DEFAULTS, ...store.get('studio', {}) };
  // sürüm 2: pencere köşesi varsayılanı 26 -> 36 (alt çubukla eş merkezli). Elle seçilmiş değere dokunma.
  if (!cfg.v) { if (cfg.win === 26) cfg.win = 36; cfg.v = 2; }
  let albumAccent = null;
  let tab = 'tema';
  const de = document.documentElement;

  const range = (k, label, min, max, unit = '%', step = 1) =>
    `<div class="st-row col"><span>${label} <output data-o="${k}" data-u="${unit}"></output></span><input type="range" min="${min}" max="${max}" step="${step}" data-r="${k}"></div>`;
  const toggleRow = (k, label) => `<div class="st-row"><span>${label}</span><button class="st-tg" data-t="${k}"><i></i></button></div>`;
  const seg = (k, label, opts) => `<div class="st-row"><span>${label}</span><div class="st-seg" data-s="${k}">${opts.map(([v, t]) => `<button data-v="${v}">${t}</button>`).join('')}</div></div>`;

  const ui = el('div', 'nk-studio');
  ui.id = 'nk-studio';
  ui.innerHTML = `
    <div class="st-card">
      <header><b>zLyrics Stüdyo</b><button class="st-x" data-x title="Kapat">✕</button></header>
      <nav class="st-tabs"><i class="st-pill"></i>
        <button data-tab="tema">Tema</button><button data-tab="arayuz">Arayüz</button><button data-tab="sozler">Sözler</button><button data-tab="hareket">Hareket</button>
      </nav>
      <div class="st-page" data-page="tema">
        <section>
          <h4>Hazır temalar</h4>
          <div class="st-themes">${NK_THEMES.map((t, i) => `<button data-theme="${i}" style="--a:${t.c[0]};--b:${t.c[1]}"><i></i><span>${t.name}</span></button>`).join('')}</div>
        </section>
        <section>
          <h4>Vurgu rengi</h4>
          <div class="st-sw">${NK_SWATCHES.map(([n, c]) => `<button data-c="${c}" title="${n}" style="--c:${c}"></button>`).join('')}<label class="st-custom" title="Özel renk"><input type="color"><span>+</span></label></div>
          ${toggleRow('follow', 'Kapak rengine uy')}
        </section>
      </div>
      <div class="st-page" data-page="arayuz">
        <section>
          <h4>Paneller</h4>
          ${range('panel', 'Koyuluk', 15, 95)}
          ${range('radius', 'Panel köşeleri', 6, 40, 'px')}
          ${range('win', 'Pencere köşeleri', 0, 48, 'px')}
          ${range('rim', 'Kenar ışığı', 0, 100)}
          ${range('shadow', 'Gölge derinliği', 0, 100)}
        </section>
        <section>
          <h4>Arka plan</h4>
          ${range('glow', 'Işık', 0, 100)}
          ${toggleRow('art', 'Bulanık kapak')}
        </section>
        <section>
          <h4>Yazı</h4>
          ${seg('font', 'Yazı tipi', [['geist', 'Geist'], ['inter', 'Inter'], ['spotify', 'Spotify']])}
        </section>
      </div>
      <div class="st-page" data-page="sozler">
        <section>
          <h4>Yazı</h4>
          ${seg('lfont', 'Yazı tipi', [['geist', 'Geist'], ['inter', 'Inter'], ['serif', 'Serif']])}
          ${range('lsize', 'Boyut', 70, 140)}
          ${range('lweight', 'Kalınlık', 400, 900, '', 50)}
          ${range('lgap', 'Satır aralığı', 10, 80, '')}
        </section>
        <section>
          <h4>Satırlar</h4>
          ${range('ldim', 'Pasif satır görünürlüğü', 8, 70)}
          ${range('lblur', 'Pasif satır bulanıklığı', 0, 100)}
          ${range('lglow', 'Aktif satır parlaması', 0, 100)}
          ${toggleRow('llift', 'Söylenen kelime kalksın')}
          ${seg('kfill', 'Karaoke dolumu', [['accent', 'Vurgu'], ['white', 'Beyaz']])}
        </section>
        <section>
          <h4>Arka plan</h4>
          ${seg('lbg', 'Tür', [['art', 'Kapak'], ['color', 'Renkli'], ['black', 'Sade']])}
          ${range('lshade', 'Karartma', 0, 80)}
          ${seg('mic', 'Mikrofon butonu', [['side', 'Sağ panel'], ['full', 'Tam ekran']])}
        </section>
      </div>
      <div class="st-page" data-page="hareket">
        <section>
          ${toggleRow('motion', 'Hareketli arka plan')}
          ${toggleRow('anim', 'Sayfa ve kart animasyonları')}
          <p class="st-note">İkisini de kapatmak eski bilgisayarlarda en çok rahatlatan ayardır.</p>
        </section>
      </div>
      <footer>
        <button class="st-btn" data-reset>Varsayılana dön</button>
        <button class="st-btn warn" data-orig></button>
      </footer>
    </div>`;
  document.body.append(ui);
  const $s = (s) => ui.querySelector(s);

  const accentNow = () => (cfg.follow && albumAccent ? albumAccent : cfg.accent);

  // pencere köşesi yerel izleyiciye (round.ps1) iletilir; izleyici yoksa sessizce geçer
  let lastWin = null;
  function sendWin() {
    const r = cfg.original ? 0 : cfg.win;
    if (r === lastWin) return;
    lastWin = r;
    fetch(`http://127.0.0.1:${NK_WIN_PORT}/radius?v=${r}`, { mode: 'no-cors' }).catch(() => {});
  }

  function apply() {
    const html = de.classList;
    const st = de.style;
    html.toggle('nk-original', cfg.original);
    document.querySelectorAll('link.userCSS').forEach((l) => (l.disabled = cfg.original));
    amb.style.display = cfg.original ? 'none' : '';
    const props = ['--nk-accent', '--nk-accent-hi', '--nk-r', '--nk-panel-a', '--nk-glow', '--nk-rim-a', '--nk-shadow-a', '--nk-font',
      '--spice-button', '--spice-rgb-button', '--essential-bright-accent', '--spice-notification'];
    if (cfg.original) {
      props.forEach((p) => st.removeProperty(p));
    } else {
      const a = accentNow();
      const [h, s, l] = nkHex2Hsl(a);
      const hi = s < 0.08 ? '#ffffff' : nkHsl2Hex(h, Math.min(1, s + 0.05), Math.min(0.68, l + 0.22));
      st.setProperty('--nk-accent', a);
      st.setProperty('--nk-accent-hi', hi);
      st.setProperty('--nk-r', cfg.radius + 'px');
      st.setProperty('--nk-panel-a', (cfg.panel / 100).toFixed(2));
      st.setProperty('--nk-glow', (cfg.glow / 100).toFixed(2));
      st.setProperty('--nk-rim-a', (cfg.rim / 100).toFixed(2));
      st.setProperty('--nk-shadow-a', (cfg.shadow / 100).toFixed(2));
      st.setProperty('--nk-font', NK_FONTS[cfg.font] || NK_FONTS.geist);
      st.setProperty('--spice-button', hi);
      st.setProperty('--spice-rgb-button', nkRgb(hi));
      st.setProperty('--essential-bright-accent', hi);
      st.setProperty('--spice-notification', a);

      // söz ekranı: değişkenler yalnızca kendi köküne (Spotify'ın sayfası yeniden hesaplanmaz)
      const rs = root.style;
      rs.setProperty('--accent', a);
      rs.setProperty('--accent-hi', hi);
      rs.setProperty('--l-font', NK_FONTS[cfg.lfont] || NK_FONTS.geist);
      rs.setProperty('--l-scale', (cfg.lsize / 100).toFixed(2));
      rs.setProperty('--l-weight', cfg.lweight);
      rs.setProperty('--l-weight2', Math.min(900, cfg.lweight + 100)); // karaoke/odak bir kademe kalın
      root.toggleAttribute('data-lglow', cfg.lglow > 0); // 0'ken filtre katmanı hiç oluşmasın
      rs.setProperty('--l-gap', (cfg.lgap / 100).toFixed(2));
      rs.setProperty('--l-dim', (cfg.ldim / 100).toFixed(2));
      rs.setProperty('--l-blur', (cfg.lblur / 100).toFixed(2));
      rs.setProperty('--l-glow', (cfg.lglow / 100).toFixed(2));
      rs.setProperty('--l-lift', cfg.llift ? 1 : 0);
      rs.setProperty('--l-shade', (cfg.lshade / 100).toFixed(2));
      rs.setProperty('--l-rad', cfg.radius + 'px');
      rs.setProperty('--kfill', cfg.kfill === 'white' ? '#ffffff' : hi);
      root.dataset.lbg = cfg.lbg;
      root.dispatchEvent(new CustomEvent('zl-style'));
    }
    html.toggle('nk-noart', !cfg.art);
    html.toggle('nk-still', !cfg.motion);
    html.toggle('nk-noanim', !cfg.anim);
    html.toggle('nk-font-spotify', cfg.font === 'spotify');
    sendWin();
    sync();
  }

  function sync() {
    ui.querySelectorAll('.st-sw [data-c]').forEach((b) => b.classList.toggle('on', !cfg.follow && b.dataset.c.toLowerCase() === cfg.accent.toLowerCase()));
    $s('.st-custom input').value = cfg.accent;
    ui.querySelectorAll('[data-t]').forEach((b) => b.classList.toggle('on', !!cfg[b.dataset.t]));
    ui.querySelectorAll('[data-r]').forEach((r) => (r.value = cfg[r.dataset.r]));
    ui.querySelectorAll('[data-o]').forEach((o) => {
      const k = o.dataset.o, v = cfg[k];
      o.textContent = k === 'win' && v <= 8 ? 'Windows' : v + o.dataset.u;
    });
    ui.querySelectorAll('[data-s]').forEach((sg) => sg.querySelectorAll('button').forEach((b) => b.classList.toggle('on', cfg[sg.dataset.s] === b.dataset.v)));
    $s('[data-orig]').textContent = cfg.original ? 'zLyrics temasını geri aç' : "Spotify'ı orijinale al";
    ui.classList.toggle('orig', cfg.original);
    ui.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
    ui.querySelectorAll('[data-page]').forEach((p) => (p.hidden = p.dataset.page !== tab));
    requestAnimationFrame(() => {
      const b = $s(`[data-tab="${tab}"]`), pill = $s('.st-pill');
      if (b && b.offsetWidth) { pill.style.left = b.offsetLeft + 'px'; pill.style.width = b.offsetWidth + 'px'; }
    });
  }

  const set = (patch) => {
    cfg = { ...cfg, ...patch };
    store.set('studio', cfg);
    apply();
  };

  ui.addEventListener('click', (e) => {
    const t = e.target;
    if (t === ui || t.closest('[data-x]')) return toggle(false);
    const tb = t.closest('[data-tab]');
    if (tb) { tab = tb.dataset.tab; return sync(); }
    const th = t.closest('[data-theme]');
    if (th) return set({ ...NK_THEMES[+th.dataset.theme].set, follow: false });
    const c = t.closest('[data-c]');
    if (c) return set({ accent: c.dataset.c, follow: false });
    const tg = t.closest('[data-t]');
    if (tg) return set({ [tg.dataset.t]: !cfg[tg.dataset.t] });
    const sb = t.closest('[data-s] button');
    if (sb) return set({ [sb.parentElement.dataset.s]: sb.dataset.v });
    if (t.closest('[data-reset]')) return set({ ...NK_DEFAULTS });
    if (t.closest('[data-orig]')) return set({ original: !cfg.original });
  });
  // kaydırıcılar: sürüklerken canlı, karede en fazla bir kez
  let raf = 0;
  ui.addEventListener('input', (e) => {
    const r = e.target.closest('[data-r]');
    if (r) {
      cfg[r.dataset.r] = +r.value;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => set({}));
    } else if (e.target.type === 'color') {
      cancelAnimationFrame(raf);
      const v = e.target.value;
      raf = requestAnimationFrame(() => set({ accent: v, follow: false }));
    }
  });

  function toggle(on) {
    ui.classList.toggle('open', typeof on === 'boolean' ? on : !ui.classList.contains('open'));
    if (ui.classList.contains('open')) sync();
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && ui.classList.contains('open')) { e.stopImmediatePropagation(); toggle(false); }
  }, true);

  try {
    new Spicetify.Topbar.Button('zLyrics Stüdyo', NK_PALETTE, () => toggle(), false);
  } catch {}

  apply();
  // izleyici Spotify'dan sonra başlamış olabilir: birkaç kez daha bildir
  [3000, 10000].forEach((ms) => setTimeout(() => { lastWin = null; sendWin(); }, ms));

  return {
    get cfg() { return cfg; },
    toggle,
    open(t) { if (t) tab = t; toggle(true); },
    // kapaktan gelen canlı renk: koyu/soluk olsa bile vurgu olarak okunacak hale getir
    albumColor(hex) {
      if (!hex) return;
      const [h, s, l] = nkHex2Hsl(hex);
      albumAccent = nkHsl2Hex(h, Math.max(0.55, s), Math.min(0.48, Math.max(0.36, l)));
      if (cfg.follow && !cfg.original) apply();
    },
  };
}

// ── drawers.js
// Söz ekranındayken sıra ve arama: sağdan kayan cam çekmeceler.

const DR_SVG = {
  queue: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h12M4 11h12M4 16h7"/><path d="M15 14.2v5.6c0 .5.5.8.9.5l4-2.8c.4-.3.4-.8 0-1.1l-4-2.8c-.4-.2-.9.1-.9.6Z" fill="currentColor" stroke="none"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="m7 7 10 10M17 7 7 17"/></svg>',
};

function nkDrawers({ root, P, toast, img }) {
  const box = el('div', 'nk-drawer nk-glass');
  box.innerHTML = `
    <header>
      <div class="dr-tabs"><button data-tab="queue">Sıradakiler</button><button data-tab="search">Ara</button></div>
      <button class="nk-ib sm" data-dr-close title="Kapat">${DR_SVG.close}</button>
    </header>
    <div class="dr-search"><span>${DR_SVG.search}</span><input type="text" placeholder="Şarkı ya da sanatçı ara" spellcheck="false"></div>
    <ol class="dr-list"></ol>
    <p class="dr-empty"></p>`;
  root.append(box);
  const list = box.querySelector('.dr-list');
  const input = box.querySelector('input');
  const empty = box.querySelector('.dr-empty');
  let tab = 'queue';
  let results = [];
  let qTimer = 0;

  function row(t, i, onPlay, canQueue) {
    const li = el('li');
    li.style.setProperty('--i', Math.min(i, 14));
    const b = el('button', 'dr-row');
    const im = el('img');
    im.loading = 'lazy';
    im.src = t.image || '';
    const m = el('div');
    m.append(el('b', null, t.title), el('span', null, t.artist));
    b.append(im, m);
    b.onclick = onPlay;
    li.append(b);
    if (canQueue) {
      const add = el('button', 'nk-ib sm dr-add');
      add.title = 'Sıraya ekle';
      add.innerHTML = DR_SVG.plus;
      add.onclick = async () => {
        try { await Spicetify.addToQueue([{ uri: t.uri }]); toast('Sıraya eklendi'); } catch { toast('Eklenemedi'); }
      };
      li.append(add);
    }
    return li;
  }

  function renderQueue() {
    const next = (Spicetify.Queue?.nextTracks || []).filter((x) => x?.contextTrack?.uri && !x.contextTrack.uri.includes('delimiter')).slice(0, 60);
    list.textContent = '';
    empty.textContent = next.length ? '' : 'Sırada şarkı yok';
    next.forEach((x, i) => {
      const c = x.contextTrack, m = c.metadata || {};
      list.append(row({ title: m.title, artist: m.artist_name, image: img(m.image_url || m.image_small_url), uri: c.uri }, i, async () => {
        try { await Spicetify.Platform.PlayerAPI.skipTo({ uri: c.uri, uid: c.uid }); } catch { P.playUri(c.uri); }
      }, false));
    });
  }

  async function search(term) {
    if (!term.trim()) { results = []; renderResults(); return; }
    empty.textContent = 'Aranıyor…';
    try {
      const r = await Spicetify.GraphQL.Request(Spicetify.GraphQL.Definitions.searchModalResults, {
        searchTerm: term, offset: 0, limit: 30, numberOfTopResults: 30,
        includeAudiobooks: false, includeArtistHasConcertsField: false, includePreReleases: false,
        includeLocalConcertsField: false, includeAuthors: false,
      });
      if (input.value !== term) return;
      results = (r?.data?.searchV2?.topResultsV2?.itemsV2 || [])
        .map((x) => x?.item?.data)
        .filter((d) => d?.__typename === 'Track' && d.uri)
        .map((d) => ({
          uri: d.uri,
          title: d.name,
          artist: (d.artists?.items || []).map((a) => a.profile?.name).filter(Boolean).join(', '),
          image: d.albumOfTrack?.coverArt?.sources?.[0]?.url,
        }));
    } catch {
      results = [];
    }
    renderResults();
  }

  function renderResults() {
    list.textContent = '';
    empty.textContent = input.value.trim() ? (results.length ? '' : 'Sonuç yok') : 'Bir şey yaz';
    results.forEach((t, i) => list.append(row(t, i, () => P.playUri(t.uri), true)));
  }

  function setTab(t) {
    tab = t;
    box.dataset.tab = t;
    box.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === t));
    if (t === 'queue') renderQueue();
    else { renderResults(); setTimeout(() => input.focus(), 60); }
  }

  box.addEventListener('click', (e) => {
    const tb = e.target.closest('[data-tab]');
    if (tb) setTab(tb.dataset.tab);
    if (e.target.closest('[data-dr-close]')) close();
  });
  input.addEventListener('input', () => { clearTimeout(qTimer); qTimer = setTimeout(() => search(input.value), 280); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && results[0]) P.playUri(results[0].uri);
    if (e.key === 'Escape') { e.stopPropagation(); input.value ? (input.value = '', renderResults()) : close(); }
  });

  function open(t) {
    box.classList.add('open');
    root.classList.add('drawer-open');
    setTab(t || tab);
  }
  function close() {
    box.classList.remove('open');
    root.classList.remove('drawer-open');
    input.blur();
  }
  const isOpen = () => box.classList.contains('open');

  return {
    open, close, isOpen,
    toggle: (t) => (isOpen() && tab === t ? close() : open(t)),
    refresh: () => isOpen() && tab === 'queue' && renderQueue(),
  };
}

// ── app.js
// zLyrics — Spotify (Spicetify) eklentisi.
// Ortak söz motoru (flow/karaoke/focus) build.py ile bu dosyanın önüne eklenir.
//
// Görünümler: closed | side (sağ panelde, Spotify kullanılabilir kalır) |
//            embed (Spotify'ın söz sayfasında, ana panelin içinde) | full (tam pencere)

const sv = (body, fill) => `<svg viewBox="0 0 24 24"${fill ? '' : ' fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'}>${body}</svg>`;
const SVG = {
  play: sv('<path d="M8 5.6v12.8c0 .8.9 1.3 1.6.9l10.2-6.4c.6-.4.6-1.4 0-1.8L9.6 4.7C8.9 4.3 8 4.8 8 5.6Z" fill="currentColor"/>', 1),
  pause: sv('<rect x="6.5" y="5" width="3.6" height="14" rx="1.3" fill="currentColor"/><rect x="13.9" y="5" width="3.6" height="14" rx="1.3" fill="currentColor"/>', 1),
  next: sv('<path d="M4 7.2v9.6c0 .7.8 1.1 1.4.7l7-4.8c.5-.3.5-1.1 0-1.4l-7-4.8C4.8 6.1 4 6.5 4 7.2Zm8.5 0v9.6c0 .7.8 1.1 1.4.7l7-4.8c.5-.3.5-1.1 0-1.4l-7-4.8c-.6-.4-1.4 0-1.4.7Z" fill="currentColor"/>', 1),
  prev: sv('<path d="M20 7.2v9.6c0 .7-.8 1.1-1.4.7l-7-4.8c-.5-.3-.5-1.1 0-1.4l7-4.8c.6-.4 1.4 0 1.4.7Zm-8.5 0v9.6c0 .7-.8 1.1-1.4.7l-7-4.8c-.5-.3-.5-1.1 0-1.4l7-4.8c.6-.4 1.4 0 1.4.7Z" fill="currentColor"/>', 1),
  down: sv('<path d="m6 9.5 6 6 6-6"/>'),
  tune: sv('<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/>'),
  expand: sv('<path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/>'),
  shrink: sv('<path d="M20 10h-6V4M4 14h6v6M14 10l7-7M10 14l-7 7"/>'),
  fs: sv('<path d="M4.5 9V5.8c0-.7.6-1.3 1.3-1.3H9M15 4.5h3.2c.7 0 1.3.6 1.3 1.3V9M19.5 15v3.2c0 .7-.6 1.3-1.3 1.3H15M9 19.5H5.8c-.7 0-1.3-.6-1.3-1.3V15"/>'),
  heart: sv('<path d="M12 20s-7.5-4.6-7.5-10.1A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z"/>'),
  heartOn: sv('<path d="M12 20s-7.5-4.6-7.5-10.1A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z" fill="currentColor"/>', 1),
  shuffle: sv('<path d="M16 4h4v4M4 19 20 4M20 16v4h-4M15 15l5 5M4 5l5 5"/>'),
  repeat: sv('<path d="M17 2.5 20.5 6 17 9.5"/><path d="M3.5 11V9.5A3.5 3.5 0 0 1 7 6h13.5M7 21.5 3.5 18 7 14.5"/><path d="M20.5 13v1.5A3.5 3.5 0 0 1 17 18H3.5"/>'),
  vol: sv('<path d="M4 9.5v5c0 .6.4 1 1 1h2.6l4.1 3.4c.7.5 1.6.1 1.6-.8V5.9c0-.8-.9-1.3-1.6-.8L7.6 8.5H5c-.6 0-1 .4-1 1Z" fill="currentColor" stroke="none"/><path d="M16.3 9a4.2 4.2 0 0 1 0 6M18.8 6.5a7.8 7.8 0 0 1 0 11"/>'),
  mute: sv('<path d="M4 9.5v5c0 .6.4 1 1 1h2.6l4.1 3.4c.7.5 1.6.1 1.6-.8V5.9c0-.8-.9-1.3-1.6-.8L7.6 8.5H5c-.6 0-1 .4-1 1Z" fill="currentColor" stroke="none"/><path d="m16.5 9.5 5 5m0-5-5 5"/>'),
  tr: sv('<path d="M3 5h9M7.5 3v2M5 5c.6 3 2.6 5.4 5.5 6.5M10 5c-.8 3.5-3 6-6.5 7.5M13 21l4-10 4 10M14.4 17.5h5.2"/>'),
  cover: sv('<rect x="3" y="5" width="8" height="8" rx="2"/><path d="M14 7h7M14 11h7M3 17h18M3 21h12"/>'),
};
const MODES = ['flow', 'karaoke', 'focus'];
const MODE_TR = { flow: 'Akış', karaoke: 'Karaoke', focus: 'Odak' };

function nkMain() {
  const P = Spicetify.Player;
  // Spotify yeni açılıp henüz parça yüklenmemişken oynatıcı fonksiyonları hata fırlatıyor;
  // açılışta tek bir hata tüm eklentiyi durduruyordu.
  const safe = (fn, d) => { try { return fn(); } catch { return d; } };
  const playing = () => safe(() => P.isPlaying(), false);
  const H = Spicetify.Platform.History;
  const S = {
    view: 'closed',
    mode: store.get('mode', 'flow'),
    size: store.get('size', 'm'),
    align: store.get('align', 'left'),
    bg: store.get('bg', 'live'),
    pulse: store.get('pulse', true),
    cover: store.get('cover', false),
    tr: store.get('tr', false),
    offsets: store.get('offsets', {}),
    uri: null,
    meta: null,
    lyr: null,
    prep: null,
    token: 0,
    cache: new Map(),
    trCache: new Map(),
    beats: null,
    nextShownFor: null,
  };

  /* ───────────── DOM */
  const root = el('div', 'nk asleep');
  root.id = 'zlyrics';
  root.dataset.view = 'closed';
  root.innerHTML = `
    <div class="nk-amb">
      <canvas class="nk-art" width="40" height="40"></canvas><canvas class="nk-art" width="40" height="40"></canvas>
      <div class="nk-blobs"><div class="nk-blob b1"></div><div class="nk-blob b2"></div><div class="nk-blob b3"></div><div class="nk-blob b4"></div></div>
      <div class="nk-pulse"></div>
      <div class="nk-shade"></div><div class="nk-grain"></div>
    </div>
    <div class="nk-top nk-chrome">
      <button class="nk-ib nk-glass only-full" data-a="shrink" title="Küçült (Esc)">${SVG.down}</button>
      <div class="nk-now"><img alt=""><div><b></b><span></span></div></div>
      <div class="nk-modes nk-glass"><i class="nk-pill"></i>${MODES.map((m) => `<button data-mode="${m}">${MODE_TR[m]}</button>`).join('')}</div>
      <div class="nk-tools nk-glass">
        <button class="nk-ib sm" data-a="queue" title="Sıradakiler (Q)">${DR_SVG.queue}</button>
        <button class="nk-ib sm" data-a="search" title="Ara (/)">${DR_SVG.search}</button>
        <button class="nk-ib sm" data-a="tr" title="Çeviri (T)">${SVG.tr}</button>
        <button class="nk-ib sm" data-a="settings" title="Görünüm">${SVG.tune}</button>
        <button class="nk-ib sm only-embed" data-a="expand" title="Tam ekran (F)">${SVG.expand}</button>
      </div>
    </div>
    <div class="nk-cover"><img alt=""><b></b><span></span></div>
    <div class="nk-host">
      <div class="nk-layer flow" data-l="flow"></div>
      <div class="nk-layer karaoke" data-l="karaoke"></div>
      <div class="nk-layer focus" data-l="focus"></div>
      <div class="nk-layer nk-plain" data-l="plain"></div>
      <div class="nk-layer nk-empty" data-l="empty"><img alt=""><p></p></div>
      <div class="nk-loader"><i></i><i></i><i></i></div>
    </div>
    <div class="nk-dock nk-glass nk-chrome only-full">
      <div class="nk-ctrl">
        <button class="nk-ib ghost sm" data-a="shuffle" title="Karıştır">${SVG.shuffle}</button>
        <button class="nk-ib ghost" data-a="prev">${SVG.prev}</button>
        <button class="nk-ib nk-play" data-a="play">${SVG.play}</button>
        <button class="nk-ib ghost" data-a="next">${SVG.next}</button>
        <button class="nk-ib ghost sm" data-a="repeat" title="Tekrarla">${SVG.repeat}<i class="nk-one">1</i></button>
      </div>
      <div class="nk-time"><span class="nk-t cur">0:00</span><div class="nk-bar seek"><div class="nk-fill"></div></div><span class="nk-t dur">0:00</span></div>
      <div class="nk-side">
        <button class="nk-ib ghost sm" data-a="heart" title="Beğen">${SVG.heart}</button>
        <div class="nk-vol"><button class="nk-ib ghost sm" data-a="mute">${SVG.vol}</button><div class="nk-bar vol"><div class="nk-fill"></div></div></div>
        <button class="nk-ib ghost sm" data-a="coverToggle" title="Kapak düzeni (C)">${SVG.cover}</button>
        <button class="nk-ib ghost sm" data-a="fs" title="Pencereyi tam ekran yap">${SVG.fs}</button>
      </div>
    </div>
    <div class="nk-next nk-glass"><img alt=""><div><small>Sıradaki</small><b></b><span></span></div></div>
    <div class="nk-panel nk-glass">
      <div class="nk-row"><label>Senkron</label><div class="nk-seg"><button data-off="-0.1">−</button><output>0.0s</output><button data-off="0.1">+</button></div></div>
      <div class="nk-row"><label>Yazı boyutu</label><div class="nk-seg" data-k="size"><button data-v="s">S</button><button data-v="m">M</button><button data-v="l">L</button></div></div>
      <div class="nk-row"><label>Hizalama</label><div class="nk-seg" data-k="align"><button data-v="left">Sol</button><button data-v="center">Orta</button></div></div>
      <div class="nk-row"><label>Ritim nabzı</label><button class="nk-switch" data-sw="pulse"><i></i></button></div>
      <div class="nk-row"><label>Kapak düzeni</label><button class="nk-switch" data-sw="cover"><i></i></button></div>
      <div class="nk-row"><label>Çeviri</label><button class="nk-switch" data-sw="tr"><i></i></button></div>
      <button class="nk-more" data-a="studio">Yazı, renk, arka plan… <b>Stüdyo'da aç</b></button>
      <p class="nk-keys"><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> mod · <kbd>T</kbd> çeviri · <kbd>C</kbd> kapak · <kbd>F</kbd> tam ekran · <kbd>[</kbd><kbd>]</kbd> senkron · <kbd>Esc</kbd></p>
      <p class="nk-src"></p>
    </div>
    <div class="nk-toast nk-glass"></div>`;
  document.body.append(root);

  // Tema arka planı: Spotify'ın arkasında, kapak + iki renk ışığı.
  // Renkler sadece bu birkaç elemente yazılır; :root'a yazmak 7000 elementi her karede yeniden hesaplatıyordu.
  const amb = el('div');
  amb.id = 'nk-ambient';
  amb.innerHTML = '<canvas class="art" width="40" height="40"></canvas><canvas class="art" width="40" height="40"></canvas>' +
    '<canvas class="g g1" width="48" height="48"></canvas><canvas class="g g2" width="48" height="48"></canvas><i class="g3"></i>';
  // Hareketli ışıklar küçük tuvale radyal degrade olarak çizilir (CSS büyütür). Renk değişiminde
  // eski -> yeni 0.7 sn'de karışır; yalnızca bu sırada iki 48px tuval güncellenir.
  const glows = [...amb.querySelectorAll('canvas.g')].map((c) => ({ c, x: c.getContext('2d'), from: '#3a0014', to: '#3a0014' }));
  glows[1].from = glows[1].to = '#1a0008';
  const drawGlow = (g, color, alpha) => {
    const s = g.c.width, gr = g.x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    gr.addColorStop(0, color);
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.x.globalAlpha = alpha;
    g.x.fillStyle = gr;
    g.x.fillRect(0, 0, s, s);
  };
  let glowRaf = 0;
  const setGlows = (cols) => {
    cancelAnimationFrame(glowRaf);
    glows.forEach((g, i) => { g.from = g.to; g.to = cols[i] || g.to; });
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / 700);
      for (const g of glows) {
        g.x.clearRect(0, 0, g.c.width, g.c.height);
        drawGlow(g, g.from, 1 - k);
        drawGlow(g, g.to, k);
      }
      if (k < 1) glowRaf = requestAnimationFrame(step);
    };
    glowRaf = requestAnimationFrame(step);
  };
  glows.forEach((g) => drawGlow(g, g.to, 1));
  document.body.prepend(amb);

  const studio = nkStudio({ root, amb });
  // Stüdyo söz ayarlarını değiştirince satır aralığı vs. değişir: Akış yeniden ölçsün
  root.addEventListener('zl-style', () => requestAnimationFrame(() => R.flow.measure(false)));

  const q = (s) => root.querySelector(s);
  const pulseEl = root.querySelector('.nk-pulse');
  const blobsEl = root.querySelector('.nk-blobs');
  const coverImg = root.querySelector('.nk-cover img');
  const seekFill = root.querySelector('.nk-bar.seek .nk-fill');
  const L = {};
  root.querySelectorAll('[data-l]').forEach((n) => (L[n.dataset.l] = n));

  const R = {
    flow: new Flow(L.flow, { onSeek: (t) => seek(t - offset()) }),
    karaoke: new Karaoke(L.karaoke),
    focus: new Focus(L.focus),
  };
  R.flow.paused = true;

  /* ───────────── saat: Spotify'ın ilerlemesini kare kare yumuşat */
  let disp = 0, lastNow = performance.now();
  function tick() {
    const now = performance.now();
    const dt = Math.min(0.25, (now - lastNow) / 1000);
    lastNow = now;
    const raw = (safe(() => P.getProgress(), 0) || 0) / 1000;
    if (playing()) {
      disp += dt;
      const err = raw - disp;
      if (Math.abs(err) > 0.35) disp = raw;
      else disp += err * Math.min(1, dt * 5);
    } else disp = raw;
    return disp;
  }

  const offset = () => S.offsets[S.uri] || 0;
  function seek(t) {
    P.seek(Math.max(0, t) * 1000);
    disp = Math.max(0, t);
    if (!playing()) P.play();
  }

  /* ───────────── parça bilgisi */
  const img = (u) => (u || '').replace(/^spotify:image:/, 'https://i.scdn.co/image/');

  function readMeta() {
    const it = P.data?.item;
    if (!it) return null;
    const m = it.metadata || {};
    return {
      uri: it.uri,
      id: (it.uri || '').split(':')[2],
      title: it.name || m.title || '',
      artist: it.artists?.map((a) => a.name).join(', ') || m.artist_name || '',
      album: it.album?.name || m.album_title || '',
      image: img(m.image_xlarge_url || m.image_large_url || it.album?.images?.[0]?.url || m.image_url),
      duration: (it.duration?.milliseconds || +m.duration || 0) / 1000,
    };
  }

  /* ───────────── sözler */
  function finalize(lines) {
    const out = [];
    for (const l of lines) {
      const txt = (l.text || '').trim();
      if (!txt || /^[♪♫♬\s.…]+$/.test(txt)) {
        if (out.length && !(out[out.length - 1].end > 0)) out[out.length - 1].end = l.t;
        continue;
      }
      out.push({ ...l, text: txt });
    }
    return out;
  }

  function parseLrc(text) {
    const out = [];
    for (const raw of (text || '').split(/\r?\n/)) {
      const st = [...raw.matchAll(/\[(\d+):(\d+(?:[.:]\d+)?)\]/g)];
      if (!st.length) continue;
      const last = st[st.length - 1];
      const body = raw.slice(last.index + last[0].length).replace(/<\d+:\d+(?:[.:]\d+)?>/g, '').replace(/\s+/g, ' ').trim();
      for (const s of st) out.push({ t: +s[1] * 60 + parseFloat(s[2].replace(':', '.')), text: body });
    }
    return finalize(out.sort((a, b) => a.t - b.t));
  }

  // Spotify hece zamanlaması verdiyse kelime başlangıçlarını ondan çıkar
  function syllableWords(line) {
    const syl = line.syllables;
    if (!syl?.length) return undefined;
    const times = [];
    let pos = 0;
    for (const s of syl) {
      const n = +(s.numChars ?? s.charCount ?? 0);
      if (!n) return undefined;
      for (let k = 0; k < n; k++) times[pos + k] = +s.startTimeMs / 1000;
      pos += n;
    }
    const words = [];
    for (const m of line.words.matchAll(/\S+/g)) {
      const t = times[m.index];
      if (t == null) return undefined;
      words.push({ t, text: m[0] });
    }
    return words;
  }

  async function spotifyLyrics(m) {
    const r = await Spicetify.CosmosAsync.get(
      `https://spclient.wg.spotify.com/color-lyrics/v2/track/${m.id}?format=json&vocalRemoval=false&market=from_token`);
    const ly = r?.lyrics;
    if (!ly?.lines?.length) return null;
    const base = { source: ly.providerDisplayName || 'Spotify', lang: ly.language };
    if (ly.syncType === 'UNSYNCED') return { ...base, synced: false, plain: ly.lines.map((l) => l.words).join('\n') };
    const lines = ly.lines.map((l) => {
      const end = +l.endTimeMs / 1000;
      return { t: +l.startTimeMs / 1000, end: end > 0 ? end : undefined, text: l.words, words: syllableWords(l) };
    });
    return { ...base, synced: true, lines: finalize(lines) };
  }

  async function lrclib(m) {
    const p = new URLSearchParams({ track_name: m.title, artist_name: m.artist.split(',')[0], album_name: m.album, duration: Math.round(m.duration) });
    let r = await fetch('https://lrclib.net/api/get?' + p).then((x) => (x.ok ? x.json() : null)).catch(() => null);
    if (!r?.syncedLyrics) {
      const list = await fetch('https://lrclib.net/api/search?' + new URLSearchParams({ track_name: m.title, artist_name: m.artist.split(',')[0] }))
        .then((x) => (x.ok ? x.json() : [])).catch(() => []);
      r = list.find((x) => x.syncedLyrics && Math.abs((x.duration || 0) - m.duration) < 8) || r || list.find((x) => x.plainLyrics);
    }
    if (r?.syncedLyrics) return { synced: true, lines: parseLrc(r.syncedLyrics), source: 'LRCLIB' };
    if (r?.plainLyrics) return { synced: false, plain: r.plainLyrics, source: 'LRCLIB' };
    if (r?.instrumental) return { synced: false, instrumental: true };
    return null;
  }

  async function loadLyrics(m) {
    const token = ++S.token;
    S.lyr = null;
    S.prep = null;
    root.classList.add('loading');
    showLayer();
    let res = S.cache.get(m.uri);
    if (!res) {
      res = await spotifyLyrics(m).catch(() => null);
      if (!res?.synced) res = (await lrclib(m).catch(() => null)) || res;
      res = res || { synced: false };
      S.cache.set(m.uri, res);
      if (S.cache.size > 40) S.cache.delete(S.cache.keys().next().value); // bellek: en eski 40'ı tut
    }
    if (token !== S.token) return;
    root.classList.remove('loading');
    S.lyr = res;
    if (res.synced && res.lines?.length) {
      S.prep = prepare(res.lines, m.duration);
      Object.values(R).forEach((r) => r.mount(S.prep));
      if (S.tr) translate();
    } else {
      res.synced = false;
      Object.values(R).forEach((r) => r.mount(null));
      L.plain.textContent = '';
      if (res.plain) L.plain.append(el('small', null, 'Senkron söz yok · düz metin'), document.createTextNode(res.plain));
    }
    q('.nk-empty p').textContent = res.instrumental ? 'Enstrümantal' : 'Bu şarkı için söz bulunamadı';
    q('.nk-src').textContent = res.source ? `Sözler: ${res.source}` : '';
    showLayer();
  }

  function showLayer() {
    let on = null;
    if (S.lyr) on = S.lyr.synced ? S.mode : S.lyr.plain ? 'plain' : 'empty';
    Object.entries(L).forEach(([k, n]) => n.classList.toggle('on', k === on));
    if (S.lyr?.synced && S.view !== 'closed') R[S.mode].show();
  }

  /* ───────────── çeviri: Türkçe şarkı -> İngilizce, diğerleri -> Türkçe */
  async function gtx(text, tl) {
    const r = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&dt=t&tl=' + tl + '&q=' + encodeURIComponent(text));
    if (!r.ok) throw new Error(r.status);
    const d = await r.json();
    return { text: (d[0] || []).map((x) => x[0]).join(''), src: d[2] };
  }

  async function translate() {
    const prep = S.prep, uri = S.uri;
    if (!prep) return;
    let trs = S.trCache.get(uri);
    if (!trs) {
      const src = prep.lines.map((l) => l.text).join('\n');
      try {
        let tl = S.lyr.lang === 'tr' ? 'en' : 'tr';
        let r = await gtx(src, tl);
        if (r.src === tl) r = await gtx(src, (tl = tl === 'tr' ? 'en' : 'tr'));
        trs = r.text.split('\n').map((x) => x.trim());
        S.trCache.set(uri, trs);
        if (S.trCache.size > 40) S.trCache.delete(S.trCache.keys().next().value);
      } catch {
        toast('Çeviri alınamadı');
        return;
      }
    }
    if (S.prep !== prep || !S.tr) return;
    prep.lines.forEach((l, i) => {
      const t = trs[i];
      l.tr = t && t.toLocaleLowerCase() !== l.text.toLocaleLowerCase() ? t : undefined;
    });
    Object.values(R).forEach((r) => r.annotate?.());
  }

  function setTr(on) {
    S.tr = on;
    store.set('tr', on);
    root.classList.toggle('tr-on', on);
    syncSwitches();
    if (on) translate();
    else if (S.prep) {
      S.prep.lines.forEach((l) => (l.tr = undefined));
      Object.values(R).forEach((r) => r.annotate?.());
    }
  }

  /* ───────────── renkler: kapaktan, koyulaştırılmış; Spotify temasına da yayılır */
  function hexToHsl(hex) {
    const n = parseInt(hex.replace('#', ''), 16);
    const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    if (mx === mn) return [0, 0, l];
    const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h * 60, s, l];
  }
  const deep = (hex, lMin = 16, lMax = 34) => {
    const [h, s, l] = hexToHsl(hex);
    return `hsl(${h.toFixed(0)} ${Math.min(95, s * 100 + 10).toFixed(0)}% ${clamp(l * 60, lMin, lMax).toFixed(0)}%)`;
  };

  // Kapak küçük bir tuvale bir kez bulanık çizilir, CSS ile büyütülür:
  // her karede dev bir katmana blur uygulamaktan yüzlerce kat ucuz.
  function paintArt(canvas, src) {
    return new Promise((res) => {
      const im = new Image();
      im.onload = () => {
        const x = canvas.getContext('2d');
        // parlaklık burada bir kez uygulanır: CSS filter ekran boyutunda ayrı bir yüzey (ekran kartı belleği) istiyordu
        x.filter = 'blur(2px) saturate(1.6) brightness(.55)';
        x.clearRect(0, 0, canvas.width, canvas.height);
        x.drawImage(im, -4, -4, canvas.width + 8, canvas.height + 8);
        // yumuşak kenar tuvalin içine çizilir: CSS maskesi ekran boyutunda ayrı bir katman (bellek) istiyordu
        const w = canvas.width, g = x.createRadialGradient(w / 2, w / 2, w * 0.18, w / 2, w / 2, w / 2);
        g.addColorStop(0, '#000');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        x.filter = 'none';
        x.globalCompositeOperation = 'destination-in';
        x.fillStyle = g;
        x.fillRect(0, 0, w, w);
        x.globalCompositeOperation = 'source-over';
        res(true);
      };
      im.onerror = () => res(false);
      im.src = src;
    });
  }

  let flip = false;
  let colorTok = 0;
  async function setColors(m) {
    const tok = ++colorTok;
    let cols = ['hsl(340 100% 22%)', 'hsl(345 80% 14%)', 'hsl(335 90% 18%)'];
    try {
      const c = await Spicetify.colorExtractor(m.uri);
      if (c && tok === colorTok) {
        cols = [deep(c.VIBRANT || c.PROMINENT), deep(c.DARK_VIBRANT || c.DESATURATED), deep(c.PROMINENT || c.VIBRANT_NON_ALARMING)];
        studio.albumColor(c.VIBRANT || c.PROMINENT);
      }
    } catch {}
    if (tok !== colorTok) return;
    root.querySelectorAll('.nk-blob:not(.b4)').forEach((b, i) => (b.style.color = cols[i]));
    setGlows(cols);
    coverImg.style.boxShadow = `0 50px 90px -30px rgba(0,0,0,.95), 0 0 0 1px rgba(255,255,255,.06), 0 0 120px -20px ${cols[0]}`;
    flip = !flip;
    for (const box of [root, amb]) {
      const arts = box.querySelectorAll(box === amb ? 'canvas.art' : 'canvas.nk-art');
      const on = arts[flip ? 0 : 1], off = arts[flip ? 1 : 0];
      paintArt(on, m.image).then((ok) => {
        if (!ok || tok !== colorTok) return;
        on.classList.add('on');
        off.classList.remove('on');
      });
    }
  }

  /* ───────────── ritim */
  let beatTok = 0;
  async function loadBeats(m) {
    const tok = ++beatTok;
    S.beats = null;
    if (!S.pulse) return;
    try {
      const a = await Spicetify.getAudioData(m.uri);
      if (tok !== beatTok) return;
      S.beats = (a?.beats || []).map((b) => ({ t: b.start, c: b.confidence ?? 0.6 }));
    } catch {}
  }

  function onSong() {
    const m = readMeta();
    if (!m || m.uri === S.uri) return;
    S.uri = m.uri;
    S.meta = m;
    S.nextShownFor = null;
    q('.nk-next').classList.remove('show');
    q('.nk-now img').src = m.image;
    q('.nk-now b').textContent = m.title;
    q('.nk-now span').textContent = m.artist;
    q('.nk-cover img').src = m.image;
    q('.nk-cover b').textContent = m.title;
    q('.nk-cover span').textContent = m.artist;
    q('.nk-empty img').src = m.image;
    root.classList.remove('swap');
    void root.offsetWidth;
    root.classList.add('swap');
    updateOffset();
    setColors(m);
    loadBeats(m);
    loadLyrics(m);
  }

  /* ───────────── görünüm: kapalı / panel içi / tam pencere */
  const mainView = () => document.getElementById('main-view');
  const SIDE_W = 420;

  // sağ panel açıksa onun yerine oturur, kapalıysa sağda yüzen panel olur
  function sideRect() {
    const mv = mainView()?.getBoundingClientRect();
    const rp = document.getElementById('Desktop_PanelContainer_Id')?.getBoundingClientRect();
    const top = mv ? mv.top : 64, h = mv ? mv.height : innerHeight - 160;
    if (rp && rp.width > 240 && rp.height > 200) {
      // sağ panel bazı düzenlerde pencerenin en üstüne uzanıyor: ana alanla aynı hizada kal,
      // yoksa Windows'un küçült/büyüt/kapat düğmeleri panelin araçlarının üstüne biniyor
      const y = Math.max(rp.top, top), b = Math.min(rp.bottom, top + h);
      return { x: rp.left, y, width: rp.width, height: b - y };
    }
    return { x: innerWidth - SIDE_W - 8, y: top, width: SIDE_W, height: h };
  }

  function place() {
    let x = 0, y = 0, w = innerWidth, h = innerHeight;
    if (S.view === 'embed') {
      const mv = mainView();
      if (mv) ({ x, y, width: w, height: h } = mv.getBoundingClientRect());
    } else if (S.view === 'side') {
      ({ x, y, width: w, height: h } = sideRect());
    }
    const st = root.style;
    st.setProperty('--x', x + 'px');
    st.setProperty('--y', y + 'px');
    st.setProperty('--w', w + 'px');
    st.setProperty('--h', h + 'px');
  }

  // zLyrics'in altında kalan Spotify parçalarını çizim ve yerleşimden çıkar.
  // <html>'e sınıf eklemek tüm sayfanın stilini yeniden hesaplatıyordu; doğrudan ilgili elementlere yazılır.
  // content-visibility:hidden içeriği yerleşimden de düşürür (visibility:hidden düşürmüyordu, 6000+ element).
  // Gizleme/gösterme 6000+ elementi bir kez yeniden yerleştirir (~70-100 ms). Bu, panel tamamen
  // saydamken (morph'un ortası) yapılır: ekranda hareket eden bir şey yokken kaçan kare hissedilmez.
  let hideT = 0;
  function hideBehind(v, was) {
    const cv = (n, on) => n && (n.style.contentVisibility = on ? 'hidden' : '');
    clearTimeout(hideT);
    const applyNow = () => {
      if (S.view !== v) return;
      const full = v === 'full';
      cv(document.querySelector('.Root__top-container'), full);
      amb.style.visibility = full ? 'hidden' : '';
      cv(document.querySelector('#main-view .main-view-container'), v === 'embed');
      const rp = document.getElementById('Desktop_PanelContainer_Id');
      if (rp) [...rp.children].forEach((c) => cv(c, v === 'side'));
    };
    const morphing = was !== 'closed' && v !== 'closed';
    if (v === 'full') hideT = setTimeout(applyNow, morphing ? 135 : 450);
    else if (morphing) hideT = setTimeout(applyNow, 135);
    else applyNow();
    const drag = document.querySelector('.body-drag-top');
    if (drag) drag.style.webkitAppRegion = v === 'full' ? 'no-drag' : '';
    const mic = document.querySelector('[data-testid="lyrics-button"]');
    if (mic) mic.style.color = v === 'side' ? 'var(--nk-accent-hi, #ff3d6f)' : '';
  }

  const viewLog = [];
  window.zlyrics = { get view() { return S.view; }, log: viewLog };
  function setView(v) {
    viewLog.push(`${S.view}->${v} ${new Error().stack.split('\n').slice(2, 5).map((l) => l.trim().split(' ')[1]).join('<')}`);
    if (viewLog.length > 30) viewLog.shift();
    if (v === S.view) return;
    const was = S.view;
    S.view = v;
    root.dataset.view = v;
    hideBehind(v, was);
    if (v === 'full' && was !== 'full') S.back = was;
    R.flow.paused = v === 'closed';
    // tam ekrandan çıkınca pencere de tam ekrandan çıksın
    if (v !== 'full' && was === 'full' && document.fullscreenElement) document.exitFullscreen().catch(() => {});
    if (v === 'closed') {
      root.classList.remove('idle');
      q('.nk-panel').classList.remove('open');
      drawers.close();
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      // bellek: kapalıyken söz DOM'u ve katmanları tutulmaz; açılınca önbellekten anında kurulur
      clearTimeout(S.freeT);
      S.freeT = setTimeout(() => {
        if (S.view !== 'closed') return;
        // uyku: görünmezken bile sonsuz animasyonlar katman ve kare üretmeye devam ediyordu (~75 MB)
        root.classList.add('asleep');
        Object.values(R).forEach((r) => r.mount(null));
        L.plain.textContent = '';
        S.prep = null;
        S.lyr = null;
        S.uri = null;
      }, 600);
      return;
    }
    if (was === 'closed') {
      // kapalıyken animasyonsuz yerine otur, sonra görünür ol
      clearTimeout(S.freeT);
      root.classList.remove('asleep');
      root.classList.add('jump');
      place();
      void root.offsetWidth;
      root.classList.remove('jump');
    } else morph();
    onSong();
    startLoop();
    requestAnimationFrame(movePill);
    showLayer();
    poke();
  }

  // Görünümler arası geçiş: boyutu canlandırmak yerine kısa çapraz geçiş.
  // left/top/width/height'i her karede değiştirmek tüm söz yerleşimini yeniden hesaplatıyordu.
  let morphT = 0;
  function morph() {
    clearTimeout(morphT);
    root.classList.add('morph');
    morphT = setTimeout(() => {
      root.classList.add('jump');
      place();
      void root.offsetWidth;
      root.classList.remove('jump');
      if (S.lyr?.synced) R[S.mode].show();
      requestAnimationFrame(() => root.classList.remove('morph'));
    }, 140);
  }

  const onLyricsRoute = () => H.location?.pathname === '/lyrics';
  // tam ekrandan küçülünce geldiği yere döner
  const shrink = () => setView(S.back === 'side' ? 'side' : onLyricsRoute() ? 'embed' : 'closed');
  const toggleFull = () => (S.view === 'full' ? shrink() : setView('full'));

  const docked = () => S.view === 'embed' || S.view === 'side';
  new ResizeObserver(() => docked() && place()).observe(document.body);
  window.addEventListener('resize', () => { if (S.view !== 'closed') place(); movePill(); });
  let mvObs = null;
  const watchMain = () => {
    const mv = mainView();
    if (!mv || mv === mvObs) return;
    mvObs = mv;
    new ResizeObserver(() => docked() && place()).observe(mv);
  };

  /* ───────────── mod & ayarlar */
  function setMode(m) {
    if (!MODES.includes(m)) return;
    S.mode = m;
    store.set('mode', m);
    root.dataset.mode = m;
    root.querySelectorAll('.nk-modes button').forEach((b) => b.classList.toggle('on', b.dataset.mode === m));
    movePill();
    showLayer();
  }
  function movePill() {
    const b = q(`.nk-modes button[data-mode="${S.mode}"]`);
    if (!b || !b.offsetWidth) return;
    const pill = q('.nk-pill');
    pill.style.left = b.offsetLeft + 'px';
    pill.style.width = b.offsetWidth + 'px';
  }
  // butonlar alan daralınca küçülüyor; vurgu her boyut değişiminde yeniden yerleşsin
  new ResizeObserver(() => movePill()).observe(q('.nk-modes'));
  q('.nk-modes').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) setMode(b.dataset.mode);
  });

  function updateOffset() {
    const o = offset();
    q('.nk-panel output').textContent = (o > 0 ? '+' : '') + o.toFixed(1) + 's';
  }
  function nudge(d) {
    if (!S.uri) return;
    const v = Math.round((offset() + d) * 10) / 10;
    if (v) S.offsets[S.uri] = v; else delete S.offsets[S.uri];
    store.set('offsets', S.offsets);
    updateOffset();
    toast(`Senkron ${(v > 0 ? '+' : '') + v.toFixed(1)}s`);
  }
  root.querySelectorAll('[data-off]').forEach((b) => (b.onclick = () => nudge(+b.dataset.off)));
  root.querySelectorAll('.nk-seg[data-k]').forEach((seg) => {
    const k = seg.dataset.k;
    const set = (v) => {
      S[k] = v;
      store.set(k, v);
      seg.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.v === v));
      root.dataset[k] = v;
      root.classList.toggle('align-center', S.align === 'center');
      requestAnimationFrame(() => R.flow.measure(false));
    };
    seg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) set(b.dataset.v); });
    set(S[k]);
  });

  const SW = {
    pulse: (on) => { S.pulse = on; store.set('pulse', on); if (on && S.meta) loadBeats(S.meta); else { S.beats = null; setBeat(0); } },
    cover: (on) => { S.cover = on; store.set('cover', on); root.classList.toggle('cover', on); requestAnimationFrame(() => R.flow.measure(false)); },
    tr: setTr,
  };
  function syncSwitches() {
    root.querySelectorAll('[data-sw]').forEach((b) => b.classList.toggle('on', !!S[b.dataset.sw]));
    q('[data-a="tr"]').classList.toggle('on', S.tr);
    q('[data-a="coverToggle"]').classList.toggle('on', S.cover);
  }
  root.querySelectorAll('[data-sw]').forEach((b) => (b.onclick = () => { SW[b.dataset.sw](!S[b.dataset.sw]); syncSwitches(); }));
  root.classList.toggle('cover', S.cover);
  root.classList.toggle('tr-on', S.tr);
  syncSwitches();

  let toastT;
  function toast(msg) {
    const t = q('.nk-toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('show'), 2200);
  }

  /* ───────────── kontroller */
  const drawers = nkDrawers({ root, P, toast, img });
  let lastVol = safe(() => P.getVolume(), 1) || 1;
  const actions = {
    queue: () => drawers.toggle('queue'),
    search: () => drawers.toggle('search'),
    shrink,
    expand: () => setView('full'),
    play: () => P.togglePlay(),
    next: () => P.next(),
    prev: () => P.back(),
    shuffle: () => P.toggleShuffle(),
    repeat: () => P.toggleRepeat(),
    heart: () => P.toggleHeart(),
    mute: () => { const v = safe(() => P.getVolume(), 1); if (v > 0) { lastVol = v; P.setVolume(0); } else P.setVolume(lastVol || 1); },
    tr: () => setTr(!S.tr),
    coverToggle: () => { SW.cover(!S.cover); syncSwitches(); },
    settings: () => q('.nk-panel').classList.toggle('open'),
    studio: () => { q('.nk-panel').classList.remove('open'); studio.open('sozler'); },
    fs: () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => {}),
  };
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-a]');
    if (b && actions[b.dataset.a]) actions[b.dataset.a]();
  });
  q('.nk-next').addEventListener('click', () => P.next());

  function dragBar(bar, onMove, onEnd) {
    const frac = (e) => { const r = bar.getBoundingClientRect(); return clamp((e.clientX - r.left) / r.width); };
    bar.addEventListener('pointerdown', (e) => {
      bar.setPointerCapture(e.pointerId);
      bar.classList.add('drag');
      onMove(frac(e));
      const mv = (ev) => onMove(frac(ev));
      const up = (ev) => {
        bar.classList.remove('drag');
        bar.removeEventListener('pointermove', mv);
        bar.removeEventListener('pointerup', up);
        onEnd?.(frac(ev));
      };
      bar.addEventListener('pointermove', mv);
      bar.addEventListener('pointerup', up);
    });
  }
  let scrub = null;
  dragBar(q('.nk-bar.seek'), (f) => (scrub = f), (f) => { scrub = null; if (S.meta?.duration) seek(f * S.meta.duration); });
  dragBar(q('.nk-bar.vol'), (f) => P.setVolume(f));

  let idleT;
  let over = false;
  function poke() {
    root.classList.remove('idle');
    clearTimeout(idleT);
    idleT = setTimeout(() => {
      if (S.view === 'full' && playing() && !over && !q('.nk-panel.open')) root.classList.add('idle');
    }, 2800);
  }
  root.addEventListener('pointermove', poke, { passive: true });
  root.querySelectorAll('.nk-chrome').forEach((c) => {
    c.addEventListener('pointerenter', () => (over = true));
    c.addEventListener('pointerleave', () => { over = false; poke(); });
  });
  root.addEventListener('pointermove', (e) => {
    const g = e.target.closest?.('.nk-glass');
    if (!g) return;
    const r = g.getBoundingClientRect();
    g.style.setProperty('--mx', `${e.clientX - r.left}px`);
    g.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive: true });

  // klavye: tam ekranda her şey bizim; panel içindeyken sadece bize ait tuşlar
  window.addEventListener('keydown', (e) => {
    if (S.view === 'closed' || e.ctrlKey || e.metaKey || e.altKey || e.target.matches?.('input, textarea, [contenteditable]')) return;
    const k = e.key;
    const cycle = () => setMode(MODES[(MODES.indexOf(S.mode) + 1) % MODES.length]);
    const ours = {
      1: () => setMode('flow'), 2: () => setMode('karaoke'), 3: () => setMode('focus'),
      m: cycle, M: cycle,
      t: actions.tr, T: actions.tr,
      q: actions.queue, Q: actions.queue, '/': actions.search,
      c: actions.coverToggle, C: actions.coverToggle,
      f: toggleFull, F: toggleFull,
      '[': () => nudge(-0.1), ']': () => nudge(0.1),
    };
    const full = S.view === 'full' ? {
      Escape: () => (drawers.isOpen() ? drawers.close() : q('.nk-panel.open') ? q('.nk-panel').classList.remove('open') : shrink()),
      ' ': () => P.togglePlay(),
      ArrowRight: () => seek(tick() + 5),
      ArrowLeft: () => seek(tick() - 5),
    } : {};
    const fn = full[k] || ours[k];
    if (fn) {
      e.preventDefault();
      e.stopImmediatePropagation();
      fn();
      poke();
    }
  }, true);

  /* ───────────── Spotify'a bağlan */
  const syncPlay = () => { q('[data-a="play"]').innerHTML = playing() ? SVG.pause : SVG.play; };
  P.addEventListener('songchange', () => {
    drawers.refresh();
    if (S.view !== 'closed') onSong();
    else S.uri = null;
    paint();
    // animasyon sınıfı sadece çalma çubuğuna: <html>'e eklemek tüm sayfayı yeniden hesaplatıyordu
    const bar = document.querySelector('.main-nowPlayingBar-container');
    if (bar) {
      bar.classList.remove('nk-swap');
      requestAnimationFrame(() => bar.classList.add('nk-swap'));
    }
  });
  // müzik dururken arka plan animasyonları da dursun: aksi halde Spotify boştayken bile
  // her karede tüm pencere yeniden çiziliyordu. Çalarken görüntü aynı.
  // Spotify odakta değilken (ör. oyun oynarken) süs animasyonları da dursun: aksi halde arka planda
  // saniyede ~180 kare çizip ekran kartını oyunla paylaşıyordu. Sözler açıksa yazı akmaya devam eder;
  // Spotify'a dönünce her şey kaldığı yerden sürer, yani göz önündeyken görüntü aynı.
  S.focused = document.hasFocus();
  const pausedVideos = new Set();
  const syncPaused = () => {
    const p = !playing() || !S.focused;
    amb.classList.toggle('paused', p);
    root.classList.toggle('paused', p);
    if (p) pulseEl.style.opacity = 0; // (setBeat burada henüz tanımsız değişkene dokunur: açılışta çağrılıyor)
    // Spotify'ın kendi döngü videoları (Canvas): odak dışındayken video çözme işini durdur
    if (!S.focused) {
      document.querySelectorAll('video').forEach((v) => { if (!v.paused && !v.closest('#zlyrics')) { v.pause(); pausedVideos.add(v); } });
    } else {
      pausedVideos.forEach((v) => v.isConnected && v.play().catch(() => {}));
      pausedVideos.clear();
    }
  };
  window.addEventListener('focus', () => { S.focused = true; syncPaused(); });
  window.addEventListener('blur', () => { S.focused = false; syncPaused(); });
  P.addEventListener('onplaypause', () => { syncPlay(); syncPaused(); poke(); });
  syncPlay();
  syncPaused();

  // Spotify'ın "Şarkı Sözleri" (mikrofon) butonu zLyrics'ı sağ panelde açıp kapatır.
  // Yakalama aşamasında dinleniyor ki Spotify kendi söz sayfasına gitmesin.
  // Basıldığı an (pointerdown) yakalanır: Spotify butonu hover/basışta yeniden çizdiği için
  // "click" bazen butona değil üst elemente düşüyor ve ıskalanıyordu. Ardından gelen olaylar yutulur.
  const MIC = '[data-testid="lyrics-button"]';
  const toggleMic = () => {
    watchMain();
    if (studio.cfg.mic === 'full') toggleFull();
    else setView(S.view === 'side' ? 'closed' : 'side');
  };
  // Spotify sözünü bulamadığı şarkıda mikrofonu devre dışı bırakıyor; zLyrics LRCLIB'den bulabilir.
  // Devre dışı buton tıklama olayı bile almaz: Spotify her kapattığında yeniden aç.
  const unlockMic = () => {
    if (studio.cfg.original) return;
    const b = document.querySelector(MIC);
    if (b && b.disabled) {
      b.disabled = false;
      b.setAttribute('aria-label', 'Şarkı Sözleri (zLyrics)');
    }
  };
  // yalnızca butonun bulunduğu sağ bölümü izle (ilerleme çubuğu her saniye değişiyor, onu izlemeye gerek yok)
  new MutationObserver(unlockMic).observe(document.querySelector('.main-nowPlayingBar-right') || document.querySelector('.main-nowPlayingBar-container') || document.body,
    { subtree: true, childList: true, attributes: true, attributeFilter: ['disabled'] });
  unlockMic();
  let micSwallow = 0;
  // Spotify'ın "Tam ekrana geç" butonu kendi tam ekran görünümünü açıyordu: zLyrics'in büyüt butonuyla
  // aynı işi yapsın. Pencereyi tarayıcı tam ekranına almıyoruz: Spotify o değişikliği dinleyip
  // kendi tam ekran görünümünü yine açıyordu.
  const FS = '[data-testid="fullscreen-mode-button"]';
  const BUTTONS = [[MIC, toggleMic], [FS, () => { watchMain(); toggleFull(); }]];
  const hit = (e) => BUTTONS.find(([sel]) => e.target.closest?.(sel));
  window.addEventListener('pointerdown', (e) => {
    if (studio.cfg.original || e.button !== 0) return;
    const b = hit(e);
    if (!b) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    micSwallow = performance.now() + 700;
    b[1]();
  }, true);
  for (const type of ['mousedown', 'mouseup', 'click']) {
    window.addEventListener(type, (e) => {
      if (studio.cfg.original) return;
      const b = hit(e);
      const onBar = b || e.target.closest?.('.main-nowPlayingBar-extraControls');
      if (performance.now() < micSwallow && onBar) {
        e.preventDefault();
        e.stopImmediatePropagation();
      } else if (type === 'click' && e.detail === 0 && b) {
        // klavyeyle (Enter/Boşluk) basıldı
        e.preventDefault();
        e.stopImmediatePropagation();
        b[1]();
      }
    }, true);
  }

  // Spotify'ın kendi söz sayfası -> panel içi zLyrics
  const route = (loc) => {
    watchMain();
    if (studio.cfg.original) { if (S.view === 'embed') setView('closed'); return; }
    // Spotify kendi söz sayfasına geçerse (ör. sağdaki söz önizlemesi kartı) onu hiç gösterme:
    // kapalıysa ya da sağ paneldeysek zLyrics ana alana taşınır
    if (loc?.pathname === '/lyrics') { if (S.view === 'closed' || S.view === 'side') setView('embed'); }
    else if (S.view === 'embed') setView('closed');
  };
  H.listen(route);
  route(H.location);

  setMode(S.mode);

  /* ───────────── döngü */
  let lastSec = -1, lastState = 0, lastBeat = -1;
  // nabız sadece 3 elemente yazılır (kökte değişken olarak tüm söz ağacını yeniden hesaplatıyordu)
  function setBeat(r) {
    if (r === lastBeat) return;
    lastBeat = r;
    pulseEl.style.opacity = r;
    blobsEl.style.transform = `scale(${(1 + r * 0.035).toFixed(4)})`;
    if (S.cover) coverImg.style.transform = `scale(${(1 + r * 0.012).toFixed(4)})`;
  }
  // döngü yalnızca söz ekranı açıkken döner; kapalıyken tarayıcı her karede uyandırılmaz
  function startLoop() {
    if (S.looping) return;
    S.looping = true;
    requestAnimationFrame(frame);
  }
  function frame(now) {
    if (S.view === 'closed') { S.looping = false; return; }
    requestAnimationFrame(frame);
    const t = tick();
    if (S.prep && S.lyr?.synced) R[S.mode].update(t + offset(), now);

    const dur = S.meta?.duration || 0;
    const shown = scrub != null ? scrub * dur : t;
    seekFill.style.transform = `scaleX(${dur ? clamp(shown / dur).toFixed(4) : 0})`;
    const sec = Math.floor(shown);
    if (sec !== lastSec) {
      lastSec = sec;
      q('.nk-t.cur').textContent = fmt(shown);
      q('.nk-t.dur').textContent = fmt(dur);
    }

    // ritim nabzı
    if (S.beats?.length && S.focused && playing()) {
      const b = S.beats[activeAt(S.beats, t)];
      const v = b ? Math.exp(-(t - b.t) * 7) * clamp(b.c * 1.4) : 0;
      setBeat(Math.round(v * 100) / 100);
    }

    // sıradaki parça kartı
    const left = dur - t;
    const nx = Spicetify.Queue?.nextTracks?.[0]?.contextTrack?.metadata;
    const card = q('.nk-next');
    if (nx && dur && left < 14 && left > 1.2) {
      if (S.nextShownFor !== S.uri) {
        S.nextShownFor = S.uri;
        card.querySelector('img').src = img(nx.image_url || nx.image_large_url);
        card.querySelector('b').textContent = nx.title || '';
        card.querySelector('span').textContent = nx.artist_name || '';
      }
      card.classList.add('show');
    } else card.classList.remove('show');

    // düşük frekanslı durumlar
    if (now - lastState > 400) {
      lastState = now;
      q('[data-a="shuffle"]').classList.toggle('on', !!safe(() => P.getShuffle(), false));
      const rep = safe(() => P.getRepeat(), 0);
      q('[data-a="repeat"]').classList.toggle('on', rep > 0);
      q('[data-a="repeat"]').classList.toggle('one', rep === 2);
      const h = !!safe(() => P.getHeart(), false);
      const hb = q('[data-a="heart"]');
      if (hb.classList.contains('on') !== h) { hb.classList.toggle('on', h); hb.innerHTML = h ? SVG.heartOn : SVG.heart; }
      const v = safe(() => P.getVolume(), 1);
      q('.nk-bar.vol .nk-fill').style.transform = `scaleX(${v})`;
      q('[data-a="mute"]').innerHTML = v > 0 ? SVG.vol : SVG.mute;
    }
  }
  if (S.view !== 'closed') startLoop();

  // kapalıyken de tema renkleri şarkıyla değişsin
  function paint() { const m = readMeta(); if (m && S.view === 'closed') setColors(m); }
  paint();
}

(function wait() {
  if (!window.Spicetify?.Player?.addEventListener || !Spicetify.CosmosAsync || !Spicetify.Platform?.History || !document.body) {
    setTimeout(wait, 300);
    return;
  }
  nkMain();
})();


})();