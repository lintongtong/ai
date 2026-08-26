(function(){
  const q=(s,c=document)=>c.querySelector(s), qa=(s,c=document)=>Array.from(c.querySelectorAll(s));

  qa('.copy-btn[data-copy]').forEach(btn=>{
    btn.addEventListener('click',async()=>{
      const id=btn.getAttribute('data-copy');
      const target=document.getElementById(id);
      if(!target)return;
      const text=target.innerText;
      try{await navigator.clipboard.writeText(text);}catch(e){
        const ta=document.createElement('textarea'); ta.value=text; ta.setAttribute('readonly',''); ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
      }
      const old=btn.textContent; btn.textContent='已複製 ✓'; btn.classList.add('done'); setTimeout(()=>{btn.textContent=old;btn.classList.remove('done')},1400);
    });
  });

  const desktopLinks=qa('.toc a[href^="#"]');
  const mobileLinks=qa('.mobile-toc a[href^="#"]');
  const allLinks=[...desktopLinks,...mobileLinks];
  const sections=qa('.lesson[id]');
  const setActive=id=>{
    allLinks.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+id));
    const active=q('.mobile-toc a.on');
    if(active&&window.innerWidth<=980){
      const nav=q('.mobile-toc');
      const left=Math.max(0,active.offsetLeft-nav.clientWidth/2+active.clientWidth/2);
      nav.scrollTo({left,behavior:'smooth'});
    }
  };
  if('IntersectionObserver' in window){
    const obs=new IntersectionObserver(entries=>{
      const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
      if(visible[0])setActive(visible[0].target.id);
    },{rootMargin:'-22% 0px -62% 0px',threshold:[0,.1,.25]});
    sections.forEach(s=>obs.observe(s));
  }
  allLinks.forEach(a=>a.addEventListener('click',()=>setActive(a.getAttribute('href').slice(1))));

  const dialog=q('#imageDialog'), dialogImg=q('#dialogImage');
  qa('.image-button[data-image]').forEach(btn=>btn.addEventListener('click',()=>{
    if(!dialog||!dialogImg)return;
    dialogImg.src=btn.getAttribute('data-image');
    if(typeof dialog.showModal==='function')dialog.showModal();
  }));
  const closeDialog=()=>{if(dialog&&dialog.open)dialog.close();};
  q('.dialog-close')?.addEventListener('click',closeDialog);
  dialog?.addEventListener('click',e=>{if(e.target===dialog)closeDialog();});

  const initial=(location.hash||'#download').replace('#','');
  if(sections.some(s=>s.id===initial))setActive(initial);
})();