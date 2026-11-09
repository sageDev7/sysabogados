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

/* ── FORMULARIOS (contacto / trabajar en S&S) ──────────────
   Cada <form class="lead-form"> define su endpoint en data-endpoint.
   Ajustar esa URL al backend real antes de publicar (PHP, Formspree, etc). */
const FORM_MESSAGES = {
  required: 'Este campo es obligatorio.',
  invalidEmail: 'Ingresá una dirección de correo válida.',
  invalidFile: 'Adjuntá un archivo Word o PDF.',
  sending: 'ENVIANDO…',
  success: '¡Listo! Recibimos tu mensaje, te vamos a contactar a la brevedad.',
  error: 'No se pudo enviar el formulario. Intentá nuevamente más tarde.'
};

/* El backend devuelve errores de campo con sus ids semánticos
   (fullName, email, resume, telephone, comments), no con los
   nombres legacy (nya, ema, doc, tel, com) que usan nuestros inputs. */
const SERVER_FIELD_NAME = {
  fullName: 'nya',
  email: 'ema',
  resume: 'doc',
  telephone: 'tel',
  comments: 'com'
};

function validateLeadForm(form) {
  const errors = new Map();
  form.querySelectorAll('[required]').forEach(field => {
    if (field.type === 'file') {
      if (!field.files.length) {
        errors.set(field, FORM_MESSAGES.required);
      } else if (field.accept) {
        const allowed = field.accept.split(',').map(ext => ext.trim().toLowerCase());
        const name = field.files[0].name.toLowerCase();
        if (!allowed.some(ext => name.endsWith(ext))) errors.set(field, FORM_MESSAGES.invalidFile);
      }
      return;
    }
    const value = field.value.trim();
    if (!value) { errors.set(field, FORM_MESSAGES.required); return; }
    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.set(field, FORM_MESSAGES.invalidEmail);
    }
  });
  return errors;
}

function setFieldError(field, message) {
  const group = field.closest('.form-group');
  if (!group) return;
  group.classList.toggle('has-error', !!message);
  let hint = group.querySelector('.field-error');
  if (message) {
    if (!hint) {
      hint = document.createElement('span');
      hint.className = 'field-error';
      group.appendChild(hint);
    }
    hint.textContent = message;
  } else if (hint) {
    hint.remove();
  }
}

function setFormStatus(form, message, isError) {
  let status = form.querySelector('.form-status');
  if (!message) { if (status) status.remove(); return; }
  if (!status) {
    status = document.createElement('p');
    status.className = 'form-status';
    form.appendChild(status);
  }
  status.classList.toggle('is-error', !!isError);
  status.textContent = message;
}

document.querySelectorAll('form.lead-form').forEach(form => {
  const endpoint = form.dataset.endpoint;
  const submitBtn = form.querySelector('button[type="submit"]');
  const submitLabel = submitBtn ? submitBtn.textContent : '';

  form.addEventListener('submit', async e => {
    e.preventDefault();
    return; // VERSIÓN DEMO: el botón de envío no hace nada
    setFormStatus(form, '');
    form.querySelectorAll('.form-group').forEach(g => setFieldError(g.querySelector('input, textarea'), ''));

    const errors = validateLeadForm(form);
    errors.forEach((message, field) => setFieldError(field, message));
    if (errors.size) {
      errors.keys().next().value.focus();
      return;
    }

    if (!endpoint) {
      setFormStatus(form, FORM_MESSAGES.error, true);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = FORM_MESSAGES.sending;
    try {
      const body = new FormData(form);
      if (form.dataset.formId) body.set('form_id', form.dataset.formId);
      body.set('locale', 'es');
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || !data.ok) {
        let firstField = null;
        if (data && data.errors) {
          Object.entries(data.errors).forEach(([key, message]) => {
            const field = form.querySelector(`[name="${SERVER_FIELD_NAME[key] || key}"]`);
            if (field) {
              setFieldError(field, message);
              firstField = firstField || field;
            }
          });
        }
        setFormStatus(form, (data && data.message) || FORM_MESSAGES.error, true);
        if (firstField) firstField.focus();
        return;
      }
      setFormStatus(form, FORM_MESSAGES.success, false);
      form.reset();
    } catch (err) {
      setFormStatus(form, FORM_MESSAGES.error, true);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = submitLabel;
    }
  });
});
