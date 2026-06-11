/* Letter-scramble hover effect — port of the legacy js/glitch.js.
   Applies to any element with [data-scramble] + a data-text attribute. */

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll<HTMLElement>('[data-scramble]').forEach((el) => {
    const target = el.dataset.text ?? el.textContent ?? '';
    if (!target) return;
    let interval: number | undefined;

    el.addEventListener('mouseenter', () => {
      let iteration = 0;
      window.clearInterval(interval);
      interval = window.setInterval(() => {
        el.textContent = target
          .split('')
          .map((ch, i) => {
            if (ch === ' ') return ' ';
            return i < iteration ? target[i] : LETTERS[Math.floor(Math.random() * LETTERS.length)];
          })
          .join('');
        if (iteration >= target.length) {
          window.clearInterval(interval);
          el.textContent = target;
        }
        iteration += 1 / 3;
      }, 30);
    });

    el.addEventListener('mouseleave', () => {
      window.clearInterval(interval);
      el.textContent = target;
    });
  });
}
