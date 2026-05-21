// ===== Local dev: route portal links to local Vite server =====
(function () {
  const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if (!isLocal) return;
  const PROD = 'https://urban.ai-lab.co.il/portal/';
  const LOCAL = 'http://localhost:5175/portal/';
  document.querySelectorAll('a[href^="' + PROD + '"]').forEach((a) => {
    a.href = a.href.replace(PROD, LOCAL);
  });
})();

// ===== Mobile menu =====
const menuBtn = document.getElementById('menuBtn');
const closeBtn = document.getElementById('menuCloseBtn');
const panel = document.getElementById('mobileMenuPanel');
const overlay = document.getElementById('mobileOverlay');

function openMenu() {
  panel.classList.add('open');
  overlay.classList.add('open');
  menuBtn?.classList.add('menu-open');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  panel.classList.remove('open');
  overlay.classList.remove('open');
  menuBtn?.classList.remove('menu-open');
  document.body.style.overflow = '';
}

menuBtn?.addEventListener('click', openMenu);
closeBtn?.addEventListener('click', closeMenu);
overlay?.addEventListener('click', closeMenu);
panel?.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));

// ===== Syllabus toggle =====
function toggleLesson(n) {
  const rows = document.querySelectorAll('.lesson-row');
  const row = rows[n - 1];
  const detail = document.getElementById('lesson-' + n);
  if (!row || !detail) return;
  row.classList.toggle('open');
  detail.classList.toggle('open');
}
window.toggleLesson = toggleLesson;

// ===== FAQ toggle =====
function toggleFaq(btn) {
  btn.parentElement.classList.toggle('open');
}
window.toggleFaq = toggleFaq;

// ===== Reveal on scroll =====
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  },
  { threshold: 0.1 }
);
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// ===== Lead form (Web3Forms → laviemb@gmail.com) =====
async function submitForm(e) {
  e.preventDefault();
  const form = e.target;
  const successEl = document.getElementById('formSuccess');
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;

  submitBtn.disabled = true;
  submitBtn.innerHTML = 'שולח...';

  try {
    const formData = new FormData(form);
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    });
    const result = await response.json();
    if (result.success) {
      successEl.classList.add('show');
      form.reset();
      submitBtn.innerHTML = '✓ נשלח';
      setTimeout(() => { submitBtn.disabled = false; submitBtn.innerHTML = originalText; }, 3000);
    } else throw new Error(result.message);
  } catch (err) {
    alert('שגיאה בשליחת הטופס. נסה שוב או צור קשר ב-WhatsApp.');
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
  return false;
}
window.submitForm = submitForm;

function sendWhatsApp() {
  const name = document.getElementById('name')?.value || '';
  const phone = document.getElementById('phone')?.value || '';
  const msg = `שלום מאיר! אני ${name} (טלפון ${phone}) ורוצה לשמוע על קורס AI Lab נדל״ן להתחדשות עירונית.`;
  window.open(`https://wa.me/972546500795?text=${encodeURIComponent(msg)}`, '_blank');
}
window.sendWhatsApp = sendWhatsApp;

// ===== Hero Terminal — Typewriter =====
(function () {
  const body = document.getElementById('termBody');
  if (!body) return;
  const script = [
    { id: 't-cmd-1', text: 'claude "סכם לי את פרוטוקול אסיפת הדיירים"', speed: 34, caret: 't-caret-1', pause: 600 },
    { id: 't-cmd-2', text: 'הבנתי. קורא את הפרוטוקול ומסכם...',       speed: 30, caret: 't-caret-2', pause: 500 },
    { id: 't-cmd-3', text: '⚙  מאתר החלטות · נושאים פתוחים · משימות',  speed: 18, pause: 400 },
    { id: 't-cmd-4', text: '✓ 6 החלטות   ✓ 3 נושאים פתוחים   ✓ 5 משימות', speed: 20, pause: 400 },
    { id: 't-cmd-5', text: '✓ הסיכום מוכן. ערב עבודה — בדקה אחת.',     speed: 26, pause: 1200 }
  ];
  const lines = body.querySelectorAll('.t-line');
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  async function type(el, str, speed) {
    for (let i = 0; i < str.length; i++) {
      el.textContent += str[i];
      await sleep(speed + Math.random() * 30);
    }
  }
  async function run() {
    await sleep(700);
    for (let i = 0; i < script.length; i++) {
      lines[i].classList.remove('t-line--hidden');
      lines[i].classList.add('t-line--visible');
      const target = document.getElementById(script[i].id);
      if (target) await type(target, script[i].text, script[i].speed);
      if (script[i].caret) {
        const c = document.getElementById(script[i].caret);
        if (c) c.classList.add('t-caret--off');
      }
      await sleep(script[i].pause);
    }
  }
  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { io.disconnect(); run(); }
  }, { threshold: 0.25 });
  io.observe(body);
})();

// ===== Hero Neural Canvas (subtle particle network) =====
(function () {
  const canvas = document.getElementById('heroNeuralCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, points;
  const NUM = 60;
  const MAX_DIST = 140;

  function resize() {
    w = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    h = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(1, 1);
    points = Array.from({ length: NUM }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    points.forEach((p) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    });
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < MAX_DIST) {
          ctx.strokeStyle = `rgba(179,171,157,${(1 - dist/MAX_DIST) * 0.15})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[j].x, points[j].y);
          ctx.stroke();
        }
      }
    }
    points.forEach((p) => {
      ctx.fillStyle = 'rgba(179,171,157,0.4)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  resize();
  draw();
  window.addEventListener('resize', resize);
})();

// ===== Year =====
document.getElementById('year').textContent = new Date().getFullYear();
