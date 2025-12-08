// ===============
// SOUND UTILITIES
// ===============
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

function smoothScrollTo(selector) {
  const el = document.querySelector(selector);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===============
// DOM REFERENCES
// ===============
const consultBtn = document.getElementById('consultBtn');
const viewPackagesBtn = document.getElementById('viewPackagesBtn');
const downloadBrochure = document.getElementById('downloadBrochure');
const attachBrochure = document.getElementById('attachBrochure');

// ===============
// CLICK SOUNDS
// ===============
[
  'consultBtn',
  'viewPackagesBtn',
  'downloadBrochure',
  'attachBrochure',
  'askBtn',
  'payNowButton',
  'plannerForm',
  'copyPlanBtn',
  'usePlanInFormBtn'
].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', () => { if (audioEnabled) playClick(); });
});

window.addEventListener('keydown', (ev)=>{
  if (ev.altKey && ev.key.toLowerCase()==='a'){ toggleAssistant(); ev.preventDefault(); }
  if (ev.altKey && ev.key.toLowerCase()==='m'){ toggleMic(); ev.preventDefault(); }
});

// Hero buttons
consultBtn?.addEventListener('click', ()=> smoothScrollTo('#planner'));
viewPackagesBtn?.addEventListener('click', ()=> smoothScrollTo('#packages'));

// Attach brochure note
attachBrochure?.addEventListener('click', () => {
  const msg = document.getElementById('message');
  if (!msg) return;
  const note = '\n\nAttached: Trishakti services & packages brochure.';
  if (!msg.value.includes('Attached: Trishakti')) {
    msg.value += note;
  }
  if (audioEnabled) playClick();
  msg.focus();
});

// ===============
// LOCAL LEAD CAPTURE
// ===============
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
  alert('Thanks '+(d.name||'friend')+' — your request is saved locally for this demo.');
  e.target.reset();
});

// ===============
// PAYMENT FORM (DEMO)
// ===============
const paymentForm = document.getElementById('paymentForm');
paymentForm?.addEventListener('submit',(e)=>{
  e.preventDefault();
  const amount = e.target.amount.value || '0';
  const pkg = e.target.package.value;
  if(audioEnabled) playClick();
  alert('Demo payment: ₹'+amount+
        ' for '+pkg+' package. In a real live site, this would open Razorpay/Stripe secure checkout.');
  e.target.reset();
});

// ===============
// PACKAGES -> PAYMENT SHORTCUT
// ===============
const packageCards = document.querySelectorAll('.pkg');
const paymentPackageSelect = document.getElementById('package');

packageCards.forEach((card)=>{
  card.addEventListener('click', ()=>{
    const tag = card.querySelector('.tag');
    if(tag && paymentPackageSelect){
      const label = (tag.textContent || '').toLowerCase();
      if(label.includes('royal')) paymentPackageSelect.value = 'royal';
      else if(label.includes('popular')) paymentPackageSelect.value = 'premium';
      else if(label.includes('partner')) paymentPackageSelect.value = 'standard';
    }
    smoothScrollTo('#payment');
    if(audioEnabled) playClick();
  });
});

// ===============
// PLANNER LOGIC
// ===============
const plannerForm = document.getElementById('plannerForm');
const plannerScrollToContact = document.getElementById('plannerScrollToContact');
const planSummaryCard = document.getElementById('planSummaryCard');
const planSummaryText = document.getElementById('planSummaryText');
const copyPlanBtn = document.getElementById('copyPlanBtn');
const usePlanInFormBtn = document.getElementById('usePlanInFormBtn');

plannerForm?.addEventListener('submit', (e)=>{
  e.preventDefault();

  const eventType = document.getElementById('plannerEventType').value;
  const guests = document.getElementById('plannerGuests').value;
  const budget = document.getElementById('plannerBudget').value;

  const menu = Array.from(
    plannerForm.querySelectorAll('input[name="menu"]:checked')
  ).map(c=>c.value);

  const themeInput = plannerForm.querySelector('input[name="theme"]:checked');
  const theme = themeInput ? themeInput.value : 'Not selected';

  const addons = Array.from(
    plannerForm.querySelectorAll('input[name="addons"]:checked')
  ).map(c=>c.value);

  const summaryLines = [
    `Event Type: ${eventType}`,
    `Guests: ${guests}`,
    `Menu Preferences: ${menu.length ? menu.join(', ') : 'Not specified'}`,
    `Setup & Theme: ${theme}`,
    `Premium Experiences: ${addons.length ? addons.join(', ') : 'None selected'}`,
    `Budget Mood: ${budget}`,
    '',
    'Notes for Trishakti Team:',
    '- Please review this plan and suggest venues, decor options and an estimated budget range.'
  ];

  const summary = summaryLines.join('\n');
  if (planSummaryText) planSummaryText.textContent = summary;
  if (planSummaryCard) planSummaryCard.style.display = 'block';

  const contactMessage = document.getElementById('message');
  if (contactMessage && !contactMessage.value) contactMessage.value = summary;

  if (audioEnabled) playClick();
});

plannerScrollToContact?.addEventListener('click', ()=>{
  smoothScrollTo('#contact');
  if(audioEnabled) playClick();
});

copyPlanBtn?.addEventListener('click', async ()=>{
  if (!planSummaryText) return;
  try{
    await navigator.clipboard.writeText(planSummaryText.textContent || '');
    alert('Plan copied! You can paste it into WhatsApp, email, etc.');
  }catch(e){
    alert('Could not copy automatically. Please select and copy manually.');
  }
  if(audioEnabled) playClick();
});

usePlanInFormBtn?.addEventListener('click', ()=>{
  const contactMessage = document.getElementById('message');
  if (contactMessage && planSummaryText){
    contactMessage.value = planSummaryText.textContent || '';
    smoothScrollTo('#contact');
  }
  if(audioEnabled) playClick();
});

// ===============
// ASSISTANT: speech & AI responder
// ===============
const assistantToggle = document.getElementById('assistantToggle');
const assistantPanel  = document.getElementById('assistantPanel');
const assistantClose  = document.getElementById('assistantClose');
const assistantInput  = document.getElementById('assistantInput');
const assistantBody   = document.getElementById('assistantBody');
const askBtn          = document.getElementById('askBtn');
const micBtn          = document.getElementById('micBtn');

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

function openAssistant(){
  if(!assistantPanel) return;
  assistantPanel.style.display = 'flex';
  assistantToggle?.setAttribute('aria-pressed','true');
  assistantInput?.focus();
}
function closeAssistant(){
  if(!assistantPanel) return;
  assistantPanel.style.display = 'none';
  assistantToggle?.setAttribute('aria-pressed','false');
}
function toggleAssistant(){
  const open = assistantPanel && assistantPanel.style.display !== 'none';
  if(open) closeAssistant(); else openAssistant();
  if(audioEnabled) playClick();
}
assistantToggle?.addEventListener('click', toggleAssistant);
assistantClose?.addEventListener('click', toggleAssistant);

// text-to-speech
function speakText(text){
  if (!('speechSynthesis' in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-IN';
  const voices = speechSynthesis.getVoices();
  if(voices.length) utter.voice = voices.find(v=>/en.*(India|UK|US)/i.test(v.name)) || voices[0];
  utter.rate = 0.98;
  utter.pitch = 1;
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

// assistant bubbles
function appendAssistantMessage(who, text){
  if(!assistantBody) return;
  const div = document.createElement('div');
  div.classList.add('assistant-msg');
  div.classList.add(who === 'assistant' ? 'assistant-msg-assistant' : 'assistant-msg-user');
  div.textContent = text;
  assistantBody.appendChild(div);
  assistantBody.scrollTop = assistantBody.scrollHeight;
}

function fallbackResponder(query){
  const q = query.toLowerCase();
  if(/price|cost|package|rate|how much|budget/.test(q))
    return 'Our pricing depends on guests, venue city and experience level (Standard, Premium or Luxury Royal). Share your date, guest count and city, and we suggest an approximate range.';
  if(/wedding|mandap|ritual|phera|shaadi/.test(q))
    return 'For weddings, we start with your guest count, rituals, venue mood (palace, ghat, temple) and budget mood. Then we design mandap, decor, food and premium experiences around it.';
  if(/music|shehnai|band|dj|sound/.test(q))
    return 'We offer classical shehnai, light classical, fusion bands and DJs. You can mix live shehnai for rituals with DJ/band for sangeet and reception.';
  if(/venue|banaras|varanasi|ghat|palace/.test(q))
    return 'In Banaras we specialise in ghat-side rituals, heritage venues and palace-style banquet settings. For outstation venues we coordinate with your chosen property or suggest partners.';
  if(/hello|hi|namaste|hey/.test(q))
    return 'Namaste! I am Trishakti AI Assistant. Ask me anything about weddings, rituals, decor, venues, pricing, or planning your event.';
  if(/payment|advance|upi|card|razorpay|stripe/.test(q))
    return 'Advance can be made through UPI, cards or netbanking via secure gateways like Razorpay/Stripe. Your card/UPI details are handled only by the payment partner, not stored on our site.';
  return `Thank you for your question: "${query}". Give me your event type, date, guest count and city, and I can guide you step-by-step.`;
}

// OPTIONAL: real OpenAI API (fill key to use)
const OPENAI_API_KEY = ""; // put your key here if you want real AI

async function generateAIResponse(query) {
  if (!OPENAI_API_KEY) return null;
  try{
    const systemPrompt = `You are TRISHAKTI EVENT AI ASSISTANT. 
You help Indian clients plan weddings, festivals and corporate events with a devotional, royal and professional tone.
Always keep answers practical and specific, and if relevant, invite them to share: date, city, guest count and budget mood.
`;
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Authorization":`Bearer ${OPENAI_API_KEY}`
      },
      body:JSON.stringify({
        model:"gpt-4o-mini",
        messages:[
          {role:"system", content:systemPrompt},
          {role:"user", content:query}
        ]
      })
    });
    const data = await resp.json();
    return data.choices?.[0]?.message?.content || null;
  }catch(err){
    console.warn('AI error', err);
    return null;
  }
}

async function handleAsk(rawText){
  const text = (rawText || assistantInput?.value || '').trim();
  if(!text) return;
  appendAssistantMessage('user', text);
  if(assistantInput) assistantInput.value = '';

  const thinkingMsg = 'Thinking about the best options for your event...';
  appendAssistantMessage('assistant', thinkingMsg);

  if(audioEnabled) playClick();

  let answer = await generateAIResponse(text);
  if(!answer) answer = fallbackResponder(text);

  // replace last assistant message
  const bubbles = assistantBody?.querySelectorAll('.assistant-msg-assistant');
  if(bubbles && bubbles.length){
    const last = bubbles[bubbles.length - 1];
    last.textContent = answer;
  }else{
    appendAssistantMessage('assistant', answer);
  }

  speakText(answer);
}

askBtn?.addEventListener('click', ()=> handleAsk());
assistantInput?.addEventListener('keydown', (ev)=>{
  if(ev.key === 'Enter'){
    ev.preventDefault();
    handleAsk();
  }
});

function updateMicUI(){
  if(!micBtn) return;
  micBtn.textContent = recognizing ? '⏺' : '🎙';
  micBtn.dataset.active = recognizing ? 'true' : 'false';
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
  if(audioEnabled) playClick();
}
micBtn?.addEventListener('click', toggleMic);

window.toggleMic = toggleMic;
window.toggleAssistant = toggleAssistant;

// ===============
// PARTICLE CANVAS (lotus petals)
// ===============
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

// ===============
// ACCESSIBILITY + MICRO-INTERACTIONS
// ===============
document.addEventListener('keydown', (e)=> {
  if (e.key === 'Tab') document.documentElement.classList.add('show-focus');
  if(e.key==='Escape' && assistantPanel){
    assistantPanel.style.display='none';
  }
});

document.querySelectorAll('.event, .pkg, .founder-card').forEach(el=>{
  el.addEventListener('click', ()=>{
    if(audioEnabled) playClick();
    el.style.transform = 'translateY(-6px) scale(1.01)';
    setTimeout(()=> el.style.transform = '', 260);
  });
});
