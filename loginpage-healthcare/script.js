/* LIGHT RAYS BACKGROUND */
(function () {
  const canvas = document.getElementById('lightRaysCanvas');
  const ctx = canvas.getContext('2d');
  let width, height;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }
  window.addEventListener('resize', resize);
  resize();

  const rays = [];
  const originOffset = { x: 0, y: -0.2 };
  for (let i = 0; i < 130; i++) {
    const baseAngle = (Math.PI / 2) + (Math.random() - 0.5) * Math.PI * 0.7;
    rays.push({
      baseAngle,
      length: height * (1.1 + Math.random() * 0.7),
      speed: 0.4 + Math.random() * 0.9,
      noiseSeed: Math.random() * 1000,
      width: 1 + Math.random() * 2.6,
      phase: Math.random() * Math.PI * 2
    });
  }

  let mouse = { x: 0.5, y: 0.5 };
  let smoothMouse = { x: 0.5, y: 0.5 };
  const mouseInfluence = 0.15;

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX / width;
    mouse.y = e.clientY / height;
  });

  function loop(ts) {
    const t = ts * 0.001;
    const smoothing = 0.92;
    smoothMouse.x = smoothMouse.x * smoothing + mouse.x * (1 - smoothing);
    smoothMouse.y = smoothMouse.y * smoothing + mouse.y * (1 - smoothing);

    const originX = width * 0.5 + originOffset.x * height;
    const originY = height * (0.0 + originOffset.y);

    const baseDirX = 0, baseDirY = 1;
    const mx = smoothMouse.x * width - originX;
    const my = smoothMouse.y * height - originY;
    const mLen = Math.sqrt(mx * mx + my * my) || 1;
    const mouseDirNormX = mx / mLen;
    const mouseDirNormY = my / mLen;

    const blendX = baseDirX * (1 - mouseInfluence) + mouseDirNormX * mouseInfluence;
    const blendY = baseDirY * (1 - mouseInfluence) + mouseDirNormY * mouseInfluence;
    const blendLen = Math.sqrt(blendX * blendX + blendY * blendY) || 1;
    const dirX = blendX / blendLen;
    const dirY = blendY / blendLen;
    const baseAngleFromDir = Math.atan2(dirY, dirX);

    ctx.clearRect(0, 0, width, height);

    const bgGrad = ctx.createRadialGradient(
      width * 0.5, 0, 0,
      width * 0.5, height * 0.7, height * 1.2
    );
    bgGrad.addColorStop(0, 'rgba(0, 255, 140, 0.24)');
    bgGrad.addColorStop(0.35, 'rgba(2, 40, 18, 0.7)');
    bgGrad.addColorStop(1, 'rgba(0, 3, 1, 1)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'screen';
    for (const ray of rays) {
      const offset = Math.sin(t * ray.speed + ray.phase) * 0.45;
      const angle = baseAngleFromDir + offset * 0.35;
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);
      const maxDist = ray.length;
      const sx = originX;
      const sy = originY;
      const ex = sx + dx * maxDist;
      const ey = sy + dy * maxDist;

      const grad = ctx.createLinearGradient(sx, sy, ex, ey);
      grad.addColorStop(0, 'rgba(0, 255, 140, 0.24)');
      grad.addColorStop(0.18, 'rgba(0, 255, 140, 0.4)');
      grad.addColorStop(0.45, 'rgba(0, 255, 140, 0.15)');
      grad.addColorStop(1, 'rgba(0, 255, 140, 0)');
      ctx.strokeStyle = grad;

      const jitter = Math.sin(t * 2 + ray.noiseSeed) * 0.4;
      const w = ray.width + jitter;
      ctx.lineWidth = Math.max(0.5, w);

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

/* FUZZY TEXT: "LIVE EGG" */
(function () {
  const canvas = document.getElementById('fuzzyCanvas');
  const ctx = canvas.getContext('2d');

  const text = 'LIVE EGG';
  const color = '#ffffff';
  const baseIntensity = 0.18;
  const hoverIntensity = 0.5;
  const fuzzRange = 26;
  const fontSize = 42;
  const fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  const fontWeight = 900;

  const offscreen = document.createElement('canvas');
  const offCtx = offscreen.getContext('2d');

  function setup() {
    offCtx.font = fontWeight + ' ' + fontSize + 'px ' + fontFamily;
    offCtx.textBaseline = 'alphabetic';
    const metrics = offCtx.measureText(text);
    const ascent = metrics.actualBoundingBoxAscent || fontSize;
    const descent = metrics.actualBoundingBoxDescent || fontSize * 0.22;
    const height = Math.ceil(ascent + descent);
    const width = Math.ceil(metrics.width) + 10;

    offscreen.width = width;
    offscreen.height = height;
    offCtx.font = fontWeight + ' ' + fontSize + 'px ' + fontFamily;
    offCtx.textBaseline = 'alphabetic';
    offCtx.fillStyle = color;
    offCtx.fillText(text, 0, ascent);

    const horizontalMargin = 36;
    const verticalMargin = 0;
    canvas.width = width + horizontalMargin * 2;
    canvas.height = height + verticalMargin * 2;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(horizontalMargin, verticalMargin);
  }
  setup();

  let isHovering = false;
  function inside(x, y) {
    const bw = offscreen.width;
    const bh = offscreen.height;
    const left = 36, top = 0;
    return x >= left && x <= left + bw && y >= top && y <= top + bh;
  }

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    isHovering = inside(x, y);
  });
  canvas.addEventListener('mouseleave', () => { isHovering = false; });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    isHovering = inside(x, y);
  }, { passive: false });
  canvas.addEventListener('touchend', () => { isHovering = false; });

  function tick() {
    const bw = offscreen.width;
    const bh = offscreen.height;
    ctx.clearRect(-fuzzRange, -fuzzRange, bw + 2 * fuzzRange, bh + 2 * fuzzRange);
    const intensity = isHovering ? hoverIntensity : baseIntensity;
    for (let j = 0; j < bh; j++) {
      const dx = Math.floor(intensity * (Math.random() - 0.5) * fuzzRange);
      ctx.drawImage(offscreen, 0, j, bw, 1, dx, j, bw, 1);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* AUTH TABS SWITCH */
(function () {
  const tabSignup = document.getElementById('tabSignup');
  const tabSignin = document.getElementById('tabSignin');
  const tabPill = document.getElementById('tabPill');
  const signupForm = document.getElementById('signupForm');
  const signinForm = document.getElementById('signinForm');
  const toSigninLink = document.getElementById('toSigninLink');
  const authTitle = document.getElementById('authTitle');
  const authCaption = document.getElementById('authCaption');

  function setMode(mode) {
    if (mode === 'signup') {
      tabSignup.setAttribute('data-active', 'true');
      tabSignin.setAttribute('data-active', 'false');
      signupForm.setAttribute('data-active', 'true');
      signinForm.setAttribute('data-active', 'false');
      tabPill.setAttribute('data-mode', 'signup');
      authTitle.textContent = 'Create your EGG workspace';
      authCaption.innerHTML =
        'Start by creating an account for your GI lab or research team. <span>Sign up is free.</span>';
    } else {
      tabSignup.setAttribute('data-active', 'false');
      tabSignin.setAttribute('data-active', 'true');
      signupForm.setAttribute('data-active', 'false');
      signinForm.setAttribute('data-active', 'true');
      tabPill.setAttribute('data-mode', 'signin');
      authTitle.textContent = 'Sign in to EGG dashboard';
      authCaption.innerHTML =
        'Securely access live EGG recordings and annotations. <span>Use your clinical email.</span>';
    }
  }

  tabSignup.addEventListener('click', () => setMode('signup'));
  tabSignin.addEventListener('click', () => setMode('signin'));
  toSigninLink.addEventListener('click', () => setMode('signin'));
})();

/* CAPTCHA + MOCK HANDLERS */
(function () {
  const captchaTextEl = document.getElementById('captchaText');
  const captchaRefreshBtn = document.getElementById('captchaRefresh');
  const captchaInput = document.getElementById('captchaInput');
  const signinForm = document.getElementById('signinForm');
  const signinError = document.getElementById('signinError');
  const forgotPassword = document.getElementById('forgotPassword');
  const googleLogin = document.getElementById('googleLogin');
  const instagramLogin = document.getElementById('instagramLogin');
  const signupForm = document.getElementById('signupForm');

  let currentCaptcha = '';

  function generateCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < 5; i++) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    currentCaptcha = out;
    captchaTextEl.textContent = currentCaptcha;
    captchaInput.value = '';
    signinError.style.display = 'none';
  }

  captchaRefreshBtn.addEventListener('click', generateCaptcha);
  generateCaptcha();

  signinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = (captchaInput.value || '').toUpperCase().replace(/\s+/g, '');
    if (value !== currentCaptcha) {
      signinError.style.display = 'block';
      generateCaptcha();
      return;
    }
    signinError.style.display = 'none';
    alert('Sign‑in request accepted (mock). Connect this to your EGG backend.');
  });

  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Signup request accepted (mock). Connect this to your EGG onboarding.');
  });

  forgotPassword.addEventListener('click', () => {
    alert('Forgot password (mock). Implement your reset flow here.');
  });

  googleLogin.addEventListener('click', () => {
    alert('Login with Google (mock). Integrate OAuth 2.0 here.');
  });

  instagramLogin.addEventListener('click', () => {
    alert('Login with Instagram (mock). Integrate OAuth here.');
  });
})();
