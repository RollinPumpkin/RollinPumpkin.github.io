// Interactive Portfolio Script for Septa Puma Surya (RollinPumpkin)

document.addEventListener('DOMContentLoaded', () => {
  initTelemetrySimulator();
  initProjectFilters();
  initContactCopy();
  initMobileMenu();
});

// ==========================================
// 1. LIVE IOT TELEMETRY & ML PREDICTOR SIMULATOR
// ==========================================
function initTelemetrySimulator() {
  const canvas = document.getElementById('telemetryCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let mode = 'normal'; // 'normal', 'warning', 'critical'
  let phaseShift = 0;
  let animationFrameId;

  // Set canvas resolution
  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 160;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Status badges
  const statusBadge = document.getElementById('mlStatusBadge');
  const statusText = document.getElementById('mlStatusText');
  const currentR = document.getElementById('valCurrentR');
  const currentS = document.getElementById('valCurrentS');
  const currentT = document.getElementById('valCurrentT');

  const config = {
    normal: {
      rBase: 38, sBase: 42, tBase: 35,
      noise: 4,
      status: 'NORMAL',
      statusClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      text: 'Semua fasa seimbang. Arus bocor isolator < 50 mA (Aman).'
    },
    warning: {
      rBase: 185, sBase: 55, tBase: 48,
      noise: 15,
      status: 'WARNING (78% Conf)',
      statusClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      text: 'Ketidakseimbangan fasa R terdeteksi. Peringatan dini diaktifkan.'
    },
    critical: {
      rBase: 360, sBase: 290, tBase: 65,
      noise: 35,
      status: 'CRITICAL (96% Conf)',
      statusClass: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      text: 'Lonjakan tajam arus bocor! Segera lakukan inspeksi fisik trafo.'
    }
  };

  // Button switches
  const btnNormal = document.getElementById('btnSimNormal');
  const btnWarning = document.getElementById('btnSimWarning');
  const btnCritical = document.getElementById('btnSimCritical');

  function setMode(newMode) {
    mode = newMode;
    const cfg = config[mode];

    [btnNormal, btnWarning, btnCritical].forEach(btn => {
      if (btn) btn.classList.remove('bg-sky-500/30', 'border-sky-400', 'text-sky-300');
    });

    if (mode === 'normal' && btnNormal) btnNormal.classList.add('bg-sky-500/30', 'border-sky-400', 'text-sky-300');
    if (mode === 'warning' && btnWarning) btnWarning.classList.add('bg-sky-500/30', 'border-sky-400', 'text-sky-300');
    if (mode === 'critical' && btnCritical) btnCritical.classList.add('bg-sky-500/30', 'border-sky-400', 'text-sky-300');

    if (statusBadge) {
      statusBadge.className = `text-xs px-2.5 py-1 rounded-full font-mono font-semibold border ${cfg.statusClass}`;
      statusBadge.textContent = cfg.status;
    }
    if (statusText) statusText.textContent = cfg.text;
  }

  if (btnNormal) btnNormal.addEventListener('click', () => setMode('normal'));
  if (btnWarning) btnWarning.addEventListener('click', () => setMode('warning'));
  if (btnCritical) btnCritical.addEventListener('click', () => setMode('critical'));

  // Animation Loop
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cfg = config[mode];
    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    // Draw background guide lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.moveTo(0, centerY - 40);
    ctx.lineTo(width, centerY - 40);
    ctx.moveTo(0, centerY + 40);
    ctx.lineTo(width, centerY + 40);
    ctx.stroke();

    // Generate simulated dynamic values
    const instantR = Math.max(10, cfg.rBase + (Math.sin(phaseShift * 1.5) * cfg.noise) + (Math.random() * 4 - 2));
    const instantS = Math.max(10, cfg.sBase + (Math.cos(phaseShift * 1.2) * (cfg.noise * 0.8)) + (Math.random() * 4 - 2));
    const instantT = Math.max(10, cfg.tBase + (Math.sin(phaseShift * 0.9 + 2) * (cfg.noise * 0.6)) + (Math.random() * 4 - 2));

    if (currentR) currentR.textContent = `${instantR.toFixed(1)} mA`;
    if (currentS) currentS.textContent = `${instantS.toFixed(1)} mA`;
    if (currentT) currentT.textContent = `${instantT.toFixed(1)} mA`;

    // Draw Waves
    drawWave(ctx, width, centerY, 0.02, phaseShift, (instantR / 6), '#06b6d4'); // Cyan: Phase R
    drawWave(ctx, width, centerY, 0.02, phaseShift + 2.09, (instantS / 6), '#f59e0b'); // Amber: Phase S
    drawWave(ctx, width, centerY, 0.02, phaseShift + 4.18, (instantT / 6), '#a855f7'); // Purple: Phase T

    phaseShift += 0.06;
    animationFrameId = requestAnimationFrame(draw);
  }

  function drawWave(ctx, width, centerY, freq, phase, amp, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < width; x += 4) {
      const y = centerY + Math.sin(x * freq + phase) * amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  draw();
}

// ==========================================
// 2. PROJECT CATEGORY FILTER
// ==========================================
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('bg-sky-500', 'text-white', 'border-transparent'));
      filterBtns.forEach(b => b.classList.add('bg-white/5', 'text-slate-300', 'border-white/10'));

      btn.classList.remove('bg-white/5', 'text-slate-300', 'border-white/10');
      btn.classList.add('bg-sky-500', 'text-white', 'border-transparent');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const categories = card.getAttribute('data-category') || '';
        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });
}

// ==========================================
// 3. COPY EMAIL TO CLIPBOARD WITH TOAST
// ==========================================
function initContactCopy() {
  const copyBtn = document.getElementById('copyEmailBtn');
  const toast = document.getElementById('toast');

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const email = 'septapuma@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        showToast('Email septapuma@gmail.com disalin ke clipboard!');
      }).catch(err => {
        showToast('septapuma@gmail.com');
      });
    });
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// ==========================================
// 4. MOBILE NAVIGATION MENU
// ==========================================
function initMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileNav');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }
}
