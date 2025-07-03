(() => {
  const maxShakes = 20;
  let shakeCount = 0, lastShakeTime = 0;
  const readings = [], arcs = [], arcLengths = [];
  let threshold = null;

  function init() {
    document.querySelectorAll('.arc').forEach(arc => {
      const len = arc.getTotalLength();
      arcLengths.push(len); arcs.push(arc);
      arc.style.strokeDasharray = len; arc.style.strokeDashoffset = len;
    });

    window.addEventListener('devicemotion', baselineListener);
    setTimeout(endCalibration, 1500);

    document.getElementById('shakeBtn').addEventListener('click', handleShake);

    setTimeout(() => document.getElementById('splash').style.display = 'none', 3000);
  }

  function baselineListener(e) {
    const acc = e.accelerationIncludingGravity;
    if (!acc) return;
    readings.push(Math.sqrt(acc.x*acc.x + acc.y*acc.y + acc.z*acc.z));
  }

  function endCalibration() {
    window.removeEventListener('devicemotion', baselineListener);
    const mean = readings.reduce((a,b)=>a+b)/readings.length;
    const std = Math.sqrt(readings.reduce((a,b)=>a + Math.pow(b-mean,2),0)/readings.length);
    threshold = mean + std*3;
    window.addEventListener('devicemotion', motionListener);
  }

  function motionListener(e) {
    const acc = e.accelerationIncludingGravity;
    if (!acc) return;
    const mag = Math.sqrt(acc.x*acc.x + acc.y*acc.y + acc.z*acc.z);
    const now = Date.now();
    if (mag > threshold && now - lastShakeTime > 500) {
      lastShakeTime = now; handleShake(); if (navigator.vibrate) navigator.vibrate(100);
    }
  }

  function handleShake() {
    if (shakeCount < maxShakes) { shakeCount++; updateRainbow(); }
  }

  function updateRainbow() {
    document.getElementById('counter').textContent = `${shakeCount}/${maxShakes}`;
    const fill = shakeCount / maxShakes;
    arcs.forEach((arc,i) => {
      const len = arcLengths[i];
      const color = getComputedStyle(document.documentElement)
        .getPropertyValue(`--arc-color-${arcs.length - i}`).trim();
      arc.style.stroke = color; arc.style.strokeDashoffset = len*(1-fill);
    });
    if (shakeCount >= maxShakes) complete();
  }

  function complete() {
    document.getElementById('game-content').style.opacity = '0';
    setTimeout(showOverlay, 500);
  }

  function showOverlay() {
    const petals = ['#EC6FBB','#E383FB'];
    confetti({ particleCount:120,spread:160,origin:{y:0.4},colors:petals });
    confetti({ particleCount:80,spread:120,origin:{y:0.6},colors:petals });
    try {
      const ctx = new (window.AudioContext||window.webkitAudioContext)();
      const o=ctx.createOscillator(), g=ctx.createGain();
      o.type='sine'; o.frequency.setValueAtTime(440,ctx.currentTime);
      o.connect(g); g.connect(ctx.destination); o.start();
      g.gain.exponentialRampToValueAtTime(0.00001,ctx.currentTime+1);
    } catch(e){}
    const phrases=["¡Eres increíble!","¡Sigue brillando!","¡El mundo es tuyo!","¡Hoy es un gran día!","¡Nunca te rindas!","¡Cree en ti!"];
    const phrase = phrases[Math.floor(Math.random()*phrases.length)];
    const msg = document.getElementById('message');
    msg.textContent = phrase;
    document.getElementById('overlay').classList.remove('hidden');
  }

  document.addEventListener('DOMContentLoaded', init);
})();