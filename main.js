/* ── NAV SCROLL ─────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
const hamburgerBtn = document.querySelector('.hamburger');
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY > 10;
  if (navbar) navbar.classList.toggle('scrolled', scrolled);
  if (hamburgerBtn) hamburgerBtn.classList.toggle('scrolled', scrolled);
});

/* ── MOBILE MENU ────────────────────────────────────────── */
function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  const hamburger = document.querySelector('.hamburger');
  if (menu) menu.classList.toggle('open');
  if (hamburger) hamburger.classList.toggle('open');
  document.body.style.overflow = menu && menu.classList.contains('open') ? 'hidden' : '';
}

/* ── REVEALS ────────────────────────────────────────────── */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
  revealObs.observe(el);
});
