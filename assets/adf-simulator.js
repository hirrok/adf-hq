(()=>{if(window.__ADF_SIM_STD__)return;window.__ADF_SIM_STD__=true;
const path=location.pathname;
const isOperator=/\/operator\.html?$/.test(path);
const isLegacy=/\/crumbly-crust-cafe\//.test(path);
const host=document.createElement('aside');
host.id='adf-simulator-provenance';
host.setAttribute('aria-label','Aurora Digital Foundry simulator provenance');
host.innerHTML='<span class="adf-dot" aria-hidden="true"></span><span>ADF</span><span class="adf-mode">'+(isLegacy?'Legacy prototype':isOperator?'Operator simulation':'Business prototype')+'</span><a href="../../">Back to Foundry ↗</a>';
document.body.appendChild(host);

if(!isOperator){
  document.querySelectorAll('form').forEach(form=>{
    if(form.querySelector('.adf-demo-form-note'))return;
    const note=document.createElement('p');
    note.className='adf-demo-form-note';
    note.textContent='Prototype interaction — demonstration only. No production intake is created here.';
    const submit=form.querySelector('button[type="submit"],input[type="submit"],button');
    if(submit)submit.insertAdjacentElement('afterend',note); else form.appendChild(note);
  });
}

if(isOperator){
  const gate=document.querySelector('#gate');
  if(gate){
    const input=gate.querySelector('input[type="password"]');
    if(input){
      const gateText=gate.textContent||'';
      const match=gateText.match(/(?:demo\s+access\s+code|demo\s+code|use\s+code)\s*:?\s*([a-z0-9_-]+)/i);
      if(match){
        input.value=match[1];
        input.type='hidden';
        input.setAttribute('aria-hidden','true');
        const button=gate.querySelector('button');
        if(button){
          button.textContent='Launch Operator Simulation';
          button.addEventListener('click',()=>{input.value=match[1];},true);
        }
        gate.querySelectorAll('.gate-sub').forEach(el=>el.textContent='Interactive operations prototype · simulated data');
        gate.querySelectorAll('.gate-hint,.gate-sim,.gate-sim-note').forEach(el=>el.textContent='ADF Simulator · sample data only · no private system access');
        const note=document.createElement('div');
        note.className='adf-sim-launch-note';
        note.textContent='This is an inspectable prototype, not an authenticated production system.';
        if(button)button.insertAdjacentElement('afterend',note);
      }
    }
  }
  document.querySelectorAll('.tb-signout,.signout,.signout-btn,.logout-btn,.topbar-signout,.tb-out').forEach(el=>{
    if(/sign out|log out/i.test(el.textContent||''))el.textContent='Exit Simulation';
  });
}
})();