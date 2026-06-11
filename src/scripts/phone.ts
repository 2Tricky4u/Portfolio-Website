/* Ringing phone easter egg — clicking it toggles the Matrix rain with a
   random song, mirroring the legacy hack(). The phone hides while active and
   reappears when the rain stops (Escape / click / second toggle). */

import { toggleMatrix } from './matrix';

const phone = document.getElementById('phone-trigger');

phone?.addEventListener('click', (e) => {
  e.stopPropagation();
  const on = toggleMatrix({ song: true, onStop: () => phone.classList.remove('hidden') });
  if (on) phone.classList.add('hidden');
});
