// ===== DOM Ready =====
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollAnimations();
  initContactForm();
  initSmoothScroll();
  initCountUp();
  initFaq();
});

// ===== Navbar scroll effect =====
function initNavbar() {
  const navbar = document.querySelector('.navbar');

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// ===== Mobile Menu =====
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const navAnchors = document.querySelectorAll('.nav-links a');

  if (!hamburger) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
  });

  navAnchors.forEach(anchor => {
    anchor.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// ===== Scroll Animations (Intersection Observer) =====
function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 100);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

// ===== Contact Form =====
function initContactForm() {
  const form = document.getElementById('contact-form');
  const formBody = document.getElementById('form-body');
  const formSuccess = document.getElementById('form-success');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const message = document.getElementById('message').value.trim();

    // Clear any previous error
    const errorEl = document.getElementById('form-error');
    if (errorEl) errorEl.classList.remove('show');

    // Basic validation
    if (!name || !email || !message) {
      showFieldError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!isValidEmail(email)) {
      showFieldError('Por favor, informe um e-mail válido.');
      return;
    }

    // Validate loading state element exists (create if not)
    let btnSubmit = document.getElementById('btn-submit');
    const originalBtnText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = 'Enviando...';
    btnSubmit.disabled = true;

    // Send data to Cloudflare Worker
    // IMPORTANT: Replace this URL with your deployed Cloudflare Worker URL
    const workerUrl = '/api/contact';

    fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, phone, message })
    })
    .then(response => response.json())
    .then(data => {
      btnSubmit.innerHTML = originalBtnText;
      btnSubmit.disabled = false;

      if (data.error) throw new Error(data.error);

      // Show success state
      formBody.style.display = 'none';
      formSuccess.classList.add('show');
      
      // We removed the WhatsApp redirect popup here, it's just an email now 

      // Reset after 5 seconds
      setTimeout(() => {
        form.reset();
        formBody.style.display = 'block';
        formSuccess.classList.remove('show');
      }, 5000);
    })
    .catch(error => {
      console.error('Error sending message:', error);
      btnSubmit.innerHTML = originalBtnText;
      btnSubmit.disabled = false;
      showFieldError('Houve um erro ao enviar sua mensagem. Tente novamente ou nos chame no WhatsApp.');
    });
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldError(msg) {
  const errorEl = document.getElementById('form-error');
  if (!errorEl) return;
  errorEl.textContent = msg;
  errorEl.classList.add('show');
  setTimeout(() => errorEl.classList.remove('show'), 6000);
}

// ===== Smooth Scroll =====
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const position = target.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({
          top: position,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ===== Number Count-Up Animation =====
function initCountUp() {
  const counters = document.querySelectorAll('[data-count]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'));
        const suffix = el.getAttribute('data-suffix') || '';
        animateCount(el, target, suffix);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

// ===== FAQ Accordion =====
function initFaq() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-answer').classList.remove('open');
        openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      // Open clicked if it was closed
      if (!isOpen) {
        item.classList.add('open');
        answer.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

function animateCount(el, target, suffix) {
  let current = 0;
  const increment = Math.ceil(target / 60);
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = current + suffix;
  }, 25);
}
