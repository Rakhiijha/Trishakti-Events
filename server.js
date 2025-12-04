/*******************
 * Utilities: sound
 *******************/
const audioCtx = (typeof AudioContext !== 'undefined') ? new AudioContext() : null;

function playClick() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'sine';
  o.frequency.value = 550;
  g.gain.value = 0.0001;
  o.connect(g);
  g.connect(audioCtx.destination);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  o.start(t);
  o.stop(t + 0.2);
}

let audioEnabled = true;
try {
  audioEnabled = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
} catch(e){}

const soundButtons = [
  'consultBtn',
  'viewPackagesBtn',
  'downloadBrochure',
  'attachBrochure',
  'askBtn',
  'paymentForm'
];
soundButtons.forEach(id=>{
  const el = document.getElementById(id);
  if(el) el.addEventListener('click', ()=>{ if(audioEnabled) playClick(); });
});

window.addEventListener('keydown', (ev)=>{
  if (ev.altKey && ev.key.toLowerCase()==='a'){ toggleAssistant(); ev.preventDefault(); }
  if (ev.altKey && ev.key.toLowerCase()==='m'){ toggleMic(); ev.preventDefault(); }
});

/*******************
 * Local lead capture
 *******************/
const leadForm = document.getElementById('leadForm');
leadForm?.addEventListener('submit', (e)=> {
  e.preventDefault();
  const d = {
    name: e.target.name.value.trim(),
    email: e.target.email.value.trim(),
    type: e.target.type.value.trim(),
    message: e.target.message.value.trim(),
    time: new Date().toISOString()
  };
  const l = JSON.parse(localStorage.getItem('trishakti_leads')||'[]');
  l.push(d);
  localStorage.setItem('trishakti_leads', JSON.stringify(l));
  if(audioEnabled) playClick();
  alert('Thanks '+(d.name||'friend')+' — request saved. We will contact you soon.');
  e.target.reset();
});

/*******************
 * Payment form (DEMO)
 *******************/
const paymentForm = document.getElementById('paymentForm');
paymentForm?.addEventListener('submit',(e)=>{
  e.preventDefault();
  const amount = e.target.amount.value || '0';
  const pkg = e.target.package.value;
  if(audioEnabled) playClick();
  alert('Demo payment successful for ₹'+amount+
        ' ('+pkg+' package). In a real site, this would be processed by Stripe/Razorpay on your server.');
  e.target.reset();
});

/*******************
 * Assistant: speech & transcription
 *******************/
const assistantToggle = document.getElementById('assistantToggle');
const assistantPanel = document.getElementById('assistantPanel');
const assistantClose = document.getElementById('assistantClose');
const assistantInput = document.getElementById('assistantInput');
const assistantBody = document.getElementById('assistantBody');
const askBtn = document.getElementById('askBtn');
const micBtn = document.getElementById('micBtn');

let recognizing = false;
let recognition = null;
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang = 'en-IN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.addEventListener('result', (ev)=>{
    const text = ev.results[0][0].transcript;
    assistantInput.value = text;
    handleAsk(text);
  });
  recognition.addEventListener('end', ()=> { recognizing=false; updateMicUI(); });
  recognition.addEventListener('error', (e)=> { recognizing=false; updateMicUI(); console.warn('Speech error',e); });
} else if (micBtn) {
  micBtn.style.opacity = 0.6;
  micBtn.title = 'Microphone not available in this browser';
}

function toggleAssistant(){
  const open = assistantPanel.style.display !== 'none';
  if(open){
    assistantPanel.style.display = 'none';
    assistantToggle.setAttribute('aria-pressed','false');
  } else {
    assistantPanel.style.display = 'flex';
    assistantToggle.setAttribute('aria-pressed','true');
    assistantInput.focus();
  }
  if(audioEnabled) playClick();
}
assistantToggle?.addEventListener('click', toggleAssistant);
assistantClose?.addEventListener('click', toggleAssistant);

function speakText(text){
  if (!('speechSynthesis' in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-IN';
  const voices = speechSynthesis.getVoices();
  if(voices.length) utter.voice = voices.find(v=>/en.*(India|UK|US)/i.test(v.name)) || voices[0];
  utter.rate = 0.95;
  utter.pitch = 1;
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

function appendAssistantMessage(who, text){
  const div = document.createElement('div');
  div.style.marginBottom = '8px';
  div.innerHTML = `<strong style="color:${who==='assistant'?'var(--gold-soft)':'var(--saffron)'}">${who==='assistant'?'Assistant':'You'}:</strong> <span style="color:var(--ivory)">${escapeHtml(text)}</span>`;
  assistantBody.appendChild(div);
  assistantBody.scrollTop = assistantBody.scrollHeight;
}

function escapeHtml(s){
  return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

function fallbackResponder(query){
  const q = query.toLowerCase();
  if(/price|cost|package|rate|how much/.test(q)) return "Our packages range from Standard partner options to Luxury Royal multi-day experiences. Share your date, guest count and preferred package and we'll estimate your budget.";
  if(/wedding|mandap|ritual/.test(q)) return "We design ritual-accurate mandaps and coordinate ghat rituals with priests and local artisans. For wedding planning we recommend booking at least 6–9 months in advance for peak dates.";
  if(/music|shehnai|band/.test(q)) return "We offer classical ensembles (shehnai, tabla), fusion bands and DJs. Tell me your mood and I'll suggest a line-up style.";
  if(/covid|safety|security|permit/.test(q)) return "We handle permits, crowd management and medical/security liaisons. For ghat events, permissions and community liaison are led by founder Bharati.";
  if(/hello|hi|namaste|hey/.test(q)) return "Namaste! I'm Trishakti Assistant — ask me about packages, rituals, venues, or request a consultation.";
  return `Thank you for your question: "${query}". Share your date, guest count and city for a more detailed, personalized response.`;
}

async function sendToAPI(query){
  // connect this to your own backend API later
  return null;
}

async function handleAsk(text){
  if(!text) return;
  appendAssistantMessage('user', text);
  assistantInput.value = '';
  appendAssistantMessage('assistant', 'Thinking...');
  if(audioEnabled) playClick();

  const apiResp = await sendToAPI(text);
  let answer = apiResp || fallbackResponder(text);

  const last = assistantBody.querySelector('div:last-child');
  if(last) last.remove();
  appendAssistantMessage('assistant', answer);
  speakText(answer);
}

askBtn?.addEventListener('click', ()=> { handleAsk(assistantInput.value.trim()); });
assistantInput?.addEventListener('keydown', (ev)=>{ if(ev.key==='Enter'){ ev.preventDefault(); handleAsk(assistantInput.value.trim()); } });

function updateMicUI(){
  if(!micBtn) return;
  micBtn.textContent = recognizing ? '⏺' : '🎙';
  micBtn.style.borderColor = recognizing ? 'rgba(255,120,120,0.9)' : 'rgba(255,255,255,0.16)';
}
function toggleMic(){
  if(!recognition) return;
  if(recognizing){
    recognition.stop();
    recognizing=false;
    updateMicUI();
    return;
  }
  try {
    recognition.start();
    recognizing=true;
    updateMicUI();
  } catch(e){
    console.warn(e);
    recognizing=false;
    updateMicUI();
  }
}
micBtn?.addEventListener('click', toggleMic);

window.toggleMic = toggleMic;
window.toggleAssistant = toggleAssistant;

/*******************
 * Particle canvas (golden lotus petals)
 *******************/
(function(){
  const canvas = document.getElementById('particle-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w=canvas.width = innerWidth;
  let h=canvas.height = innerHeight;
  const petals = [];
  const count = Math.round(Math.min(80, Math.max(30, (w*h)/90000)));
  function rand(a,b){ return a + Math.random()*(b-a); }
  const colors = ['#ffecd3','#ffd9b3','#ffe5b8','#fff4e1'];
  for(let i=0;i<count;i++){
    petals.push({
      x: Math.random()*w,
      y: Math.random()*h,
      vx: rand(-0.25,0.25),
      vy: rand(0.2,1.0),
      r: rand(6,18),
      rot: rand(0,Math.PI*2),
      vr: rand(-0.01,0.01),
      hue: colors[Math.floor(Math.random()*colors.length)],
      alpha: rand(0.12,0.38)
    });
  }
  function drawPetal(p){
    ctx.save();
    ctx.translate(p.x,p.y);
    ctx.rotate(p.rot);
    ctx.beginPath();
    ctx.moveTo(0, -p.r*0.3);
    ctx.quadraticCurveTo(p.r*0.6, -p.r*0.6, p.r, 0);
    ctx.quadraticCurveTo(p.r*0.6, p.r*0.6, 0, p.r*0.9);
    ctx.quadraticCurveTo(-p.r*0.6, p.r*0.6, -p.r, 0);
    ctx.quadraticCurveTo(-p.r*0.6, -p.r*0.6, 0, -p.r*0.3);
    ctx.closePath();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.hue;
    ctx.fill();
    ctx.restore();
  }
  let last = performance.now();
  function loop(now){
    const dt = (now - last)/1000;
    last = now;
    ctx.clearRect(0,0,w,h);
    for(const p of petals){
      p.x += p.vx * 30 * dt;
      p.y += p.vy * 30 * dt;
      p.rot += p.vr * dt * 60;
      if(p.y > h + 30){ p.y = -30; p.x = Math.random()*w; }
      if(p.x < -50) p.x = w + 50;
      if(p.x > w + 50) p.x = -50;
      drawPetal(p);
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  addEventListener('resize', ()=>{ w=canvas.width=innerWidth; h=canvas.height=innerHeight; });
})();

/*******************
 * Accessibility: focus outlines
 *******************/
document.addEventListener('keydown', (e)=> {
  if (e.key === 'Tab') document.documentElement.classList.add('show-focus');
});

/*******************
 * Micro-interactions
 *******************/
document.querySelectorAll('.event, .pkg, .founder-card').forEach(el=>{
  el.addEventListener('click', ()=>{
    if(audioEnabled) playClick();
    el.style.transform = 'translateY(-6px) scale(1.01)';
    setTimeout(()=> el.style.transform = '', 260);
  });
});

document.addEventListener('keydown', (e)=> {
  if(e.key==='Escape' && assistantPanel){
    assistantPanel.style.display='none';
  }
});
