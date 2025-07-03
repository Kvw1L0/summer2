(() => {
  const maxShakes = 50, threshold = 12;
  let shakeCount = 0, lastShakeTime = 0;
  const arcs = [], arcLengths = [];

  function init() {
    document.querySelectorAll('.arc').forEach(arc => {
      const length = arc.getTotalLength();
      arcLengths.push(length); arcs.push(arc);
      arc.style.strokeDasharray = length; arc.style.strokeDashoffset = length;
    });
    const shakeBtn = document.getElementById('shakeBtn');
    if (typeof DeviceMotionEvent === 'undefined') {
      shakeBtn.style.display = 'block';
    } else {
      window.addEventListener('devicemotion', devicemotionListener);
    }
    shakeBtn.addEventListener('click', handleShake);
    document.getElementById('shareBtn').addEventListener('click', sharePhrase);
    document.getElementById('retry').addEventListener('click', () => location.reload());
    // Logo fade-in bounce
    const logo = document.getElementById('logo');
    setTimeout(() => {
      logo.style.transition = 'transform 0.6s, opacity 0.6s';
      logo.style.transform = 'translateX(-50%) scale(1)';
      logo.style.opacity = '0.8';
    }, 1000);
  }

  function devicemotionListener(e) {
    const acc = e.acceleration || e.accelerationIncludingGravity;
    if (!acc) return;
    const a = Math.sqrt(acc.x*acc.x + acc.y*acc.y + acc.z*acc.z);
    const now = Date.now();
    if (a > threshold && now - lastShakeTime > 500) {
      lastShakeTime = now; handleShake();
      if (navigator.vibrate) navigator.vibrate(100);
    }
  }

  function handleShake() {
    if (shakeCount < maxShakes) {
      shakeCount++; updateRainbow();
    }
  }

  function updateRainbow() {
    document.getElementById('counter').textContent = `${shakeCount}/${maxShakes}`;
    const fill = shakeCount / maxShakes;
    arcs.forEach((arc,i) => {
      const len = arcLengths[i];
      const color = getComputedStyle(document.documentElement)
        .getPropertyValue(`--arc-color-${arcs.length - i}`).trim();
      arc.style.stroke = color; arc.style.strokeDashoffset = len * (1 - fill);
    });
    if (shakeCount >= maxShakes) {
      completeAnimation();
    }
  }

  function completeAnimation() {
    ['rainbow','counter','title','subtitle','shakeBtn'].forEach(id => {
      const el = document.getElementById(id);
      if(el) el.style.opacity = '0';
    });
    setTimeout(showMessage, 500);
  }

  function showMessage() {
    const petalColors = ['#EC6FBB','#E383FB'];
    confetti({ particleCount: 120, spread: 160, origin: { y: 0.4 }, colors: petalColors });
    confetti({ particleCount: 80, spread: 120, origin: { y: 0.6 }, colors: petalColors });
    try {
      const ctx = new (window.AudioContext||window.webkitAudioContext)();
      const o=ctx.createOscillator(), g=ctx.createGain();
      o.type='sine'; o.frequency.setValueAtTime(440,ctx.currentTime);
      o.connect(g); g.connect(ctx.destination); o.start();
      g.gain.exponentialRampToValueAtTime(0.00001,ctx.currentTime+1);
    } catch(e){console.warn(e);}
    const phrases = ["¡Eres increíble!","¡Sigue brillando!","¡El mundo es tuyo!","¡Hoy es un gran día!","¡Nunca te rindas!","¡Cree en ti!"];
    const phrase = phrases[Math.floor(Math.random()*phrases.length)];
    const msg = document.getElementById('message');
    msg.textContent = phrase; msg.classList.add('neon'); msg.style.opacity='1';
    document.getElementById('retry').style.opacity='1';
    document.getElementById('shareBtn').style.opacity='1';
  }

  function sharePhrase() {
    const phrase = document.getElementById('message').textContent;
    if (navigator.share) {
      navigator.share({ text: phrase }).catch(console.error);
    } else {
      alert('Tu frase para compartir: ' + phrase);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
