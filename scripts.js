// ===== DOM Ready =====
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollAnimations();
  initContactForm();
  initSmoothScroll();
  initCountUp();
});

// ===== Navbar scroll effect =====
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
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

    // Basic validation
    if (!name || !email || !message) {
      showFieldError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Validate loading state element exists (create if not)
    let btnSubmit = document.getElementById('btn-submit');
    const originalBtnText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = 'Enviando...';
    btnSubmit.disabled = true;

    // Send data to Cloudflare Worker
    // IMPORTANT: Replace this URL with your deployed Cloudflare Worker URL
    const workerUrl = 'https://seu-worker.seu-usuario.workers.dev'; 

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
  // Simple alert — could be replaced with inline errors
  alert(msg);
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
