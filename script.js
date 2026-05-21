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

// ===== Hero Neural Canvas — dots, lines, triangles, pulses (rust/concrete palette) =====
(function () {
  const canvas = document.getElementById('heroNeuralCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  let w, h, nodes = [], pulses = [];
  const DENSITY = 14000;
  const MAX_DIST_BASE = 170;
  const TRI_DIST = 140;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    w = rect.width; h = rect.height;
  }
  function init() {
    resize();
    const count = Math.max(15, Math.round((w * h) / DENSITY));
    nodes = [];
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.3 + 0.8
      });
    }
  }
  function spawnPulse() {
    if (nodes.length < 2) return;
    const a = nodes[Math.floor(Math.random() * nodes.length)];
    let b = null, bd = Infinity;
    for (const n of nodes) {
      if (n === a) continue;
      const d = Math.hypot(a.x - n.x, a.y - n.y);
      if (d < MAX_DIST_BASE && d < bd) { bd = d; b = n; }
    }
    if (b) pulses.push({ a, b, t: 0, speed: 0.014 + Math.random() * 0.008 });
  }
  setInterval(spawnPulse, 450);
  function draw() {
    ctx.clearRect(0, 0, w, h);
    // Triangles
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        for (let k = j + 1; k < nodes.length; k++) {
          const a = nodes[i], b = nodes[j], c = nodes[k];
          const d1 = Math.hypot(a.x - b.x, a.y - b.y); if (d1 >= TRI_DIST) continue;
          const d2 = Math.hypot(b.x - c.x, b.y - c.y); if (d2 >= TRI_DIST) continue;
          const d3 = Math.hypot(c.x - a.x, c.y - a.y); if (d3 >= TRI_DIST) continue;
          const avg = (d1 + d2 + d3) / 3;
          const alpha = 0.05 * (1 - avg / TRI_DIST);
          ctx.fillStyle = `rgba(194,65,12,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y);
          ctx.closePath(); ctx.fill();
        }
      }
    }
    // Lines
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < MAX_DIST_BASE) {
          ctx.strokeStyle = `rgba(46,43,40,${(1 - d / MAX_DIST_BASE) * 0.20})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    // Dots + movement
    nodes.forEach((n) => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(194,65,12,0.7)';
      ctx.shadowBlur = 5; ctx.shadowColor = '#C2410C';
      ctx.fill();
      ctx.shadowBlur = 0;
    });
    // Pulses
    pulses = pulses.filter((p) => p.t <= 1);
    pulses.forEach((p) => {
      const x = p.a.x + (p.b.x - p.a.x) * p.t;
      const y = p.a.y + (p.b.y - p.a.y) * p.t;
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245,241,235,0.95)';
      ctx.shadowBlur = 14; ctx.shadowColor = '#C2410C';
      ctx.fill();
      ctx.shadowBlur = 0;
      p.t += p.speed;
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', init);
  init(); draw();
})();

// ===== Year =====
document.getElementById('year').textContent = new Date().getFullYear();
