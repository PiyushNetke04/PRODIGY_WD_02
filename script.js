let startTime = 0, elapsed = 0, lapStart = 0;
let animFrame = null, running = false, laps = [];
const CIRC = 2 * Math.PI * 140;
const display     = document.getElementById('display');
const displayMs   = document.getElementById('display-ms');
const lapInd      = document.getElementById('lap-ind');
const btnMain     = document.getElementById('btn-main');
const btnLap      = document.getElementById('btn-lap');
const btnReset    = document.getElementById('btn-reset');
const lapsList    = document.getElementById('laps-list');
const lapsCount   = document.getElementById('laps-count');
const emptyState  = document.getElementById('empty-state');
const ringProg    = document.getElementById('ring-prog');
const ringLap     = document.getElementById('ring-lap');
const statusLabel = document.getElementById('status-label');
const clockEl     = document.getElementById('clock');

function updateClock() {
    clockEl.textContent = new Date().toLocaleTimeString('en-GB', { hour12: false });
}
updateClock();
    setInterval(updateClock, 1000);

    function fmt(ms) {
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
    function fmtMs(ms) {
      return '.' + String(Math.floor(ms % 1000)).padStart(3,'0');
    }
    function fmtLap(ms) {
      const m = Math.floor(ms / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      const c = Math.floor((ms % 1000) / 10);
      return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(c).padStart(2,'0')}`;
    }

    function setRing(ms, mod = 60000) {
      ringProg.style.strokeDashoffset = CIRC * (1 - (ms % mod) / mod);
    }
    function setLapRing(ms, mod = 60000) {
      ringLap.style.strokeDashoffset = CIRC * (1 - (ms % mod) / mod);
    }

    function tick() {
      elapsed = Date.now() - startTime;
      display.textContent = fmt(elapsed);
      displayMs.textContent = fmtMs(elapsed);
      setRing(elapsed);
      setLapRing(elapsed - lapStart);
      animFrame = requestAnimationFrame(tick);
    }

btnMain.addEventListener('click', () => {
      if (!running) {
        startTime = Date.now() - elapsed;
        running = true;
        animFrame = requestAnimationFrame(tick);
        btnMain.textContent = 'PAUSE';
        btnMain.classList.add('paused');
        btnLap.disabled = false;
        btnReset.disabled = false;
        statusLabel.textContent = 'RUNNING';
        statusLabel.style.color = 'var(--cyan)';
        display.classList.add('running');
      } else {
        running = false;
        cancelAnimationFrame(animFrame);
        btnMain.textContent = 'RESUME';
        btnMain.classList.remove('paused');
        statusLabel.textContent = 'PAUSED';
        statusLabel.style.color = 'var(--orange)';
        display.classList.remove('running');
      }
    });

btnLap.addEventListener('click', () => {
    if (!running) return;
    const lapTime = elapsed - lapStart;
    lapStart = elapsed;
    laps.unshift({ num: laps.length + 1, time: lapTime, total: elapsed });
    lapInd.textContent = `— LAP ${laps.length} —`;
    lapInd.classList.add('active');
    setTimeout(() => lapInd.classList.remove('active'), 600);
    flashScreen();
    renderLaps();
    setLapRing(0);
    });

btnReset.addEventListener('click', () => {
    running = false;
    cancelAnimationFrame(animFrame);
    elapsed = 0; lapStart = 0; laps = [];
    display.textContent = '00:00:00';
    displayMs.textContent = '.000';
    lapInd.textContent = '— LAP 0 —';
    display.classList.remove('running');
    btnMain.textContent = 'START';
    btnMain.classList.remove('paused');
    btnLap.disabled = true;
    btnReset.disabled = true;
    statusLabel.textContent = 'READY';
    statusLabel.style.color = 'var(--green)';
    ringProg.style.strokeDashoffset = CIRC;
    ringLap.style.strokeDashoffset = CIRC;
    renderLaps();
});

function renderLaps() {
    if (laps.length === 0) {
    lapsList.innerHTML = '';
    lapsList.appendChild(emptyState);
    lapsCount.textContent = '';
    return;
}
      emptyState.remove();
      lapsCount.textContent = `${laps.length} LAPS`;
      const times = laps.map(l => l.time);
      const minT = Math.min(...times);
      const maxT = Math.max(...times);
      const avgT = times.reduce((a,b) => a+b, 0) / times.length;
      lapsList.innerHTML = '';
      laps.forEach(lap => {
        const isFastest = lap.time === minT && laps.length > 1;
        const isSlowest = lap.time === maxT && laps.length > 1;
        const barW = maxT > 0 ? Math.round((lap.time / maxT) * 100) : 0;
        const delta = lap.time - avgT;
        const deltaStr = (delta >= 0 ? '+' : '') + fmtLap(Math.abs(delta));
        const deltaClass = delta <= 0 ? 'fast' : 'slow';
        const row = document.createElement('div');
        row.className = 'lap-row' + (isFastest ? ' fastest' : isSlowest ? ' slowest' : '');
        row.innerHTML = `
          <span class="lap-num">#${String(lap.num).padStart(2,'0')}</span>
          <div class="lap-bar-wrap"><div class="lap-bar" style="width:${barW}%"></div></div>
          <span class="lap-time">${fmtLap(lap.time)}</span>
          <span class="lap-delta ${laps.length > 1 ? deltaClass : ''}">${laps.length > 1 ? deltaStr : '—'}</span>
        `;
        lapsList.appendChild(row);
      });
    }

    function flashScreen() {
      const el = document.createElement('div');
      el.className = 'flash';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 250);
    }

    document.addEventListener('keydown', e => {
      if (e.code === 'Space') { e.preventDefault(); btnMain.click(); }
      if (e.code === 'KeyL') btnLap.click();
      if (e.code === 'KeyR') btnReset.click();
    });

    ringProg.style.strokeDashoffset = CIRC;
    ringLap.style.strokeDashoffset = CIRC;