/* Matrix rain easter egg — lazily created canvases. Triggered by the ringing
   phone in the hero (with a random song) or the terminal's hidden `hack`
   command. Escape or click turns it off. */

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const FONT_SIZE = 10;
const SONGS = ['/audio/1.mp3', '/audio/2.mp3', '/audio/3.mp3'];

let active = false;
let canvasFront: HTMLCanvasElement | null = null;
let canvasBack: HTMLCanvasElement | null = null;
let startAudio: HTMLAudioElement | null = null;
let stopAudio: HTMLAudioElement | null = null;
let songAudio: HTMLAudioElement | null = null;
let onStopCb: (() => void) | null = null;

interface ToggleOptions {
  song?: boolean;
  onStop?: () => void;
}

interface Drop {
  x: number;
  y: number;
  speed: number;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function makeCanvas(z: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  c.style.cssText = `position:fixed;inset:0;z-index:${z};pointer-events:none;`;
  document.body.appendChild(c);
  return c;
}

export function isMatrixActive(): boolean {
  return active;
}

export function toggleMatrix(opts: ToggleOptions = {}): boolean {
  // Explicitly user-triggered (phone click / `hack` command), so it runs even
  // when the OS requests reduced motion — the user asked for it.
  active ? stop() : start(opts);
  return active;
}

function start({ song = false, onStop }: ToggleOptions): void {
  active = true;
  onStopCb = onStop ?? null;
  canvasBack = makeCanvas(998);
  canvasFront = makeCanvas(999);
  const ctx = canvasBack.getContext('2d')!;
  const ctx2 = canvasFront.getContext('2d')!;
  const cw = canvasBack.width;
  const ch = canvasBack.height;

  startAudio ??= new Audio('/audio/ander.mp3');
  startAudio.volume = 0.6;
  startAudio.currentTime = 0;
  startAudio.play().catch(() => {});

  if (song) {
    songAudio = new Audio(SONGS[Math.floor(Math.random() * SONGS.length)]);
    songAudio.volume = 0.2;
    songAudio.play().catch(() => {});
  }

  const drops: Drop[] = [];
  for (let i = 0; i < cw / FONT_SIZE; i++) {
    drops.push({ x: i * FONT_SIZE, y: randomFloat(-500, 0), speed: randomFloat(1, 5) });
  }

  const update = () => {
    if (!active) return;
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.fillRect(0, 0, cw, ch);
    ctx2.clearRect(0, 0, cw, ch);

    for (const d of drops) {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];
      ctx2.fillStyle = 'rgba(255,255,255,0.8)';
      ctx2.font = `${FONT_SIZE}px monospace`;
      ctx2.fillText(char!, d.x, d.y);
      ctx.fillStyle = '#0F0';
      ctx.font = `${FONT_SIZE}px monospace`;
      ctx.fillText(char!, d.x, d.y);
      d.y += d.speed;
      if (d.y > ch) {
        d.y = randomFloat(-100, 0);
        d.speed = randomFloat(2, 5);
      }
    }
    requestAnimationFrame(update);
  };
  update();

  document.addEventListener('keydown', onKey);
  document.addEventListener('click', onClick);
}

function stop(): void {
  active = false;
  canvasFront?.remove();
  canvasBack?.remove();
  canvasFront = canvasBack = null;

  startAudio?.pause();
  if (startAudio) startAudio.currentTime = 0;
  if (songAudio) {
    songAudio.pause();
    songAudio = null;
  }
  stopAudio ??= new Audio('/audio/bye.mp3');
  stopAudio.currentTime = 0;
  stopAudio.play().catch(() => {});

  document.removeEventListener('keydown', onKey);
  document.removeEventListener('click', onClick);

  onStopCb?.();
  onStopCb = null;
}

function onKey(e: KeyboardEvent): void {
  if (e.key === 'Escape' && active) stop();
}

function onClick(): void {
  if (active) stop();
}
