/* Contact form → Google Apps Script (same endpoint and field names as the
   legacy site; the Sheet's columns depend on them) + email de-obfuscation. */

const SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwtaKGUTL0FXl7m_hIMPhFAj_RnJ0k5Yb2qR84FIUBE4sIkvsGvYAyLXkO2MvZNtiTe/exec';

const form = document.forms.namedItem('submit-to-google-sheet');
const msg = document.getElementById('form-msg');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!msg) return;
  msg.textContent = 'sending...';
  msg.className = 'mono';
  try {
    await fetch(SCRIPT_URL, { method: 'POST', body: new FormData(form) });
    msg.textContent = 'message sent!';
    msg.classList.add('ok');
    form.reset();
  } catch {
    msg.textContent = 'error — please email me directly.';
    msg.classList.add('err');
  }
  setTimeout(() => {
    msg.textContent = '';
    msg.className = 'mono';
  }, 10000);
});

const emailLink = document.getElementById('email-link');
if (emailLink) {
  const user = emailLink.dataset.user;
  const domain = emailLink.dataset.domain;
  if (user && domain) {
    const addr = `${user}@${domain}`;
    emailLink.textContent = addr;
    emailLink.setAttribute('href', `mailto:${addr}`);
  }
}
