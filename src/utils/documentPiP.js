/**
 * Document Picture-in-Picture utilities.
 *
 * Uses the Document PiP API (Chrome/Edge 116+) to open an always-on-top
 * window that floats outside the browser.  Custom HTML controls (maximize,
 * loop, close) are built with vanilla DOM so we avoid React-portal and
 * Web-Component issues.
 */

// ─── Feature detection ───────────────────────────────────────────────
export function isDocumentPiPSupported() {
  return (
    typeof window !== 'undefined' &&
    'documentPictureInPicture' in window &&
    typeof window.documentPictureInPicture.requestWindow === 'function'
  );
}

// ─── SVG icon paths (Feather-icon style) ─────────────────────────────
const ICON = {
  loop: 'M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3',
  maximize: 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7',
  minimize: 'M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7',
  close: 'M18 6L6 18M6 6l12 12',
  play: 'M5 3l14 9-14 9V3z',
};

function createSVG(doc, pathD, size = 16) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = doc.createElementNS(NS, 'svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  const path = doc.createElementNS(NS, 'path');
  path.setAttribute('d', pathD);
  svg.appendChild(path);
  return svg;
}

// ─── Stylesheet for the PiP window ──────────────────────────────────
const PIP_CSS = `
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0f172a;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;color:#fff;width:100vw;height:100vh;display:flex;flex-direction:column}
.wrap{position:relative;flex:1;display:flex;align-items:center;justify-content:center;background:#000}
video{width:100%;height:100%;object-fit:contain}
.top-bar{position:absolute;top:0;left:0;right:0;display:flex;align-items:center;gap:8px;padding:8px 10px;background:linear-gradient(to bottom,rgba(0,0,0,.6),transparent);z-index:10;opacity:0;transition:opacity .2s}
.wrap:hover .top-bar,.top-bar:focus-within{opacity:1}
.badge{display:inline-flex;align-items:center;gap:4px;background:rgba(0,0,0,.55);border-radius:9999px;padding:4px 10px;font-size:12px;font-weight:600}
.right{margin-left:auto;display:flex;align-items:center;gap:6px}
.btn{width:30px;height:30px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.15);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s}
.btn:hover{background:rgba(255,255,255,.3)}
.btn.on{background:rgba(16,185,129,.55);border-color:rgba(16,185,129,.4)}
.btn.max-on{background:rgba(245,158,11,.7);border-color:rgba(245,158,11,.5)}
.bottom-bar{position:absolute;bottom:0;left:0;right:0;padding:8px;display:flex;justify-content:flex-end;background:linear-gradient(to top,rgba(0,0,0,.7),transparent)}
.bottom-label{background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.1);border-radius:9999px;padding:4px 10px;font-size:12px;font-weight:600;letter-spacing:.05em}
.spinner{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:36px;height:36px;border:3px solid rgba(255,255,255,.2);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:translate(-50%,-50%) rotate(360deg)}}
.play-over{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;cursor:pointer;background:rgba(0,0,0,.15);transition:background .15s}
.play-over:hover{background:rgba(0,0,0,.3)}
.play-circle{width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,.9);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,.3)}
.play-circle svg{fill:#1e293b;stroke:none}
.hidden{display:none!important}
`;

// ─── Build the player inside the PiP window ─────────────────────────
/**
 * @param {Window} pipWindow  – the Document PiP window
 * @param {object} opts
 * @param {string} opts.videoUrl
 * @param {string} opts.label       e.g. "2:255"
 * @param {number} [opts.volume]
 * @param {() => void} opts.onClose
 * @param {() => void} opts.onMaximize  – called when user clicks maximize
 * @param {(videoEl: HTMLVideoElement) => void} opts.onEnded
 * @returns {{ video: HTMLVideoElement, updateSource(url:string, lbl:string): void, destroy(): void }}
 */
export function buildPiPPlayer(pipWindow, opts) {
  const {
    videoUrl,
    label = '',
    volume = 0.03,
    onClose,
    onMaximize,
    onEnded,
  } = opts;

  const doc = pipWindow.document;
  doc.title = label ? `${label} — NurulQuran` : 'NurulQuran Video';

  // Inject stylesheet
  const styleEl = doc.createElement('style');
  styleEl.textContent = PIP_CSS;
  doc.head.appendChild(styleEl);

  // --- DOM ---
  const wrap = doc.createElement('div');
  wrap.className = 'wrap';

  // Video
  const video = doc.createElement('video');
  video.src = videoUrl;
  video.autoplay = true;
  video.volume = volume;
  video.playsInline = true;
  video.preload = 'auto';
  wrap.appendChild(video);

  // Spinner
  const spinner = doc.createElement('div');
  spinner.className = 'spinner';
  wrap.appendChild(spinner);

  // Play overlay (shown when paused)
  const playOver = doc.createElement('div');
  playOver.className = 'play-over hidden';
  const playCircle = doc.createElement('div');
  playCircle.className = 'play-circle';
  playCircle.appendChild(createSVG(doc, ICON.play, 22));
  playOver.appendChild(playCircle);
  wrap.appendChild(playOver);

  // Top control bar
  const topBar = doc.createElement('div');
  topBar.className = 'top-bar';

  const badge = doc.createElement('span');
  badge.className = 'badge';
  badge.textContent = label;
  topBar.appendChild(badge);

  const right = doc.createElement('div');
  right.className = 'right';

  // Loop button
  const loopBtn = doc.createElement('button');
  loopBtn.className = 'btn';
  loopBtn.title = 'Toggle repeat';
  loopBtn.appendChild(createSVG(doc, ICON.loop));
  let loopEnabled = false;
  loopBtn.addEventListener('click', () => {
    loopEnabled = !loopEnabled;
    video.loop = loopEnabled;
    loopBtn.classList.toggle('on', loopEnabled);
  });
  right.appendChild(loopBtn);

  // Maximize button
  const maxBtn = doc.createElement('button');
  maxBtn.className = 'btn';
  maxBtn.title = 'Maximize in browser';
  maxBtn.appendChild(createSVG(doc, ICON.maximize));
  maxBtn.addEventListener('click', () => {
    if (typeof onMaximize === 'function') onMaximize();
  });
  right.appendChild(maxBtn);

  // Close button
  const closeBtn = doc.createElement('button');
  closeBtn.className = 'btn';
  closeBtn.title = 'Close';
  closeBtn.appendChild(createSVG(doc, ICON.close));
  closeBtn.addEventListener('click', () => {
    if (typeof onClose === 'function') onClose();
  });
  right.appendChild(closeBtn);

  topBar.appendChild(right);
  wrap.appendChild(topBar);

  // Bottom label
  const bottomBar = doc.createElement('div');
  bottomBar.className = 'bottom-bar';
  const bottomLabel = doc.createElement('span');
  bottomLabel.className = 'bottom-label';
  bottomLabel.textContent = label;
  bottomBar.appendChild(bottomLabel);
  wrap.appendChild(bottomBar);

  doc.body.appendChild(wrap);

  // --- Events ---
  video.addEventListener('waiting', () => { spinner.classList.remove('hidden'); });
  video.addEventListener('playing', () => {
    spinner.classList.add('hidden');
    playOver.classList.add('hidden');
  });
  video.addEventListener('loadeddata', () => { spinner.classList.add('hidden'); });
  video.addEventListener('pause', () => { playOver.classList.remove('hidden'); });
  video.addEventListener('ended', () => {
    if (typeof onEnded === 'function') onEnded(video);
  });
  video.addEventListener('error', () => {
    if (typeof onEnded === 'function') onEnded(video);
  });
  playOver.addEventListener('click', () => { video.play().catch(() => {}); });

  // --- Public helpers ---
  function updateSource(url, lbl) {
    video.src = url;
    video.load();
    video.play().catch(() => {});
    if (lbl !== undefined) {
      badge.textContent = lbl;
      bottomLabel.textContent = lbl;
      doc.title = lbl ? `${lbl} — NurulQuran` : 'NurulQuran Video';
    }
  }

  function destroy() {
    video.pause();
    video.removeAttribute('src');
    video.load();
  }

  return { video, updateSource, destroy };
}
