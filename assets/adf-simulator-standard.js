/* ADF Simulator Standard v1.0 */
(function(){
  'use strict';
  const operator=/\/operator\.html(?:$|[?#])/.test(location.pathname+location.search);
  const legacy=/\/crumbly-crust-cafe\//.test(location.pathname);
  document.body.classList.add(operator?'adf-sim-operator':'adf-sim-public');

  const badge=document.createElement('aside');
  badge.className='adf-sim-badge';
  badge.setAttribute('aria-label','Aurora Digital Foundry simulator disclosure');
  const label=legacy?'Legacy ADF Prototype':operator?'ADF Operator Suite Demo':'ADF Operator Suite Demo';
  const note=legacy?'Retired prototype. Historical reference only.':operator?'Simulated operations data only. No live customer data.':'Illustrative prototype. Not a live business. No customer data is collected.';
  badge.innerHTML='<strong>'+label+'</strong><span>'+note+'</span><a href="../../">ADF HQ ↗</a>';
  document.body.appendChild(badge);

  document.querySelectorAll('a[target="_blank"]').forEach(function(a){
    const rel=new Set((a.getAttribute('rel')||'').split(/\s+/).filter(Boolean));
    rel.add('noopener'); rel.add('noreferrer'); a.setAttribute('rel',Array.from(rel).join(' '));
  });

  document.querySelectorAll('.nav-item,.sidebar-item,.sb-link,[onclick]').forEach(function(el){
    if(/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) return;
    if(!el.hasAttribute('tabindex')) el.setAttribute('tabindex','0');
    if(!el.hasAttribute('role')) el.setAttribute('role','button');
    el.dataset.adfKeyboardButton='true';
    el.addEventListener('keydown',function(e){
      if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click();}
    });
  });

  document.addEventListener('submit',function(e){
    const form=e.target;
    if(!(form instanceof HTMLFormElement)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    let noteEl=form.querySelector('.adf-demo-form-note');
    if(!noteEl){
      noteEl=document.createElement('div');
      noteEl.className='adf-demo-form-note';
      noteEl.setAttribute('role','status');
      noteEl.setAttribute('aria-live','polite');
      form.appendChild(noteEl);
    }
    noteEl.textContent='Demo interaction only — no data was sent or stored.';
  },true);

  if(operator){
    const gate=document.getElementById('gate');
    if(gate){gate.setAttribute('aria-hidden','true');gate.style.display='none';}
    const app=document.getElementById('app')||document.getElementById('cockpit');
    if(app){
      app.removeAttribute('hidden');
      app.classList.add('visible','active');
      if(getComputedStyle(app).display==='none') app.style.display='block';
    }
    try{
      if(typeof window.enterApp==='function') window.enterApp();
      else{
        if(typeof window.startClock==='function') window.startClock();
        if(typeof window.initDate==='function') window.initDate();
      }
    }catch(_e){}

    document.querySelectorAll('button,a').forEach(function(el){
      if(!/^(sign out|log out|logout)$/i.test((el.textContent||'').trim())) return;
      el.removeAttribute('onclick');
      el.textContent='Back to Site';
      el.addEventListener('click',function(e){e.preventDefault();location.href='index.html';});
    });
  }
})();