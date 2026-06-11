const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const els = document.querySelectorAll<HTMLElement>('[data-reveal]');

if (reduced) {
  els.forEach((el) => el.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -5% 0px' }
  );
  els.forEach((el) => observer.observe(el));
}

/* Scroll progress bar */
const bar = document.getElementById('scroll-progress');
if (bar && !reduced) {
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = max > 0 ? `${(window.scrollY / max) * 100}%` : '0%';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}
