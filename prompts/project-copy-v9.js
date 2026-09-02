(function(){
  var project=document.getElementById('project');
  if(!project)return;

  function bindCurrentPre(button){
    var box=button.closest('.platform-box');
    var pre=box&&box.querySelector('pre');
    if(!pre)return;

    var fresh=button.cloneNode(true);
    button.parentNode.replaceChild(fresh,button);
    fresh.addEventListener('click',function(e){
      e.stopPropagation();
      var value=pre.innerText;
      var done=function(){
        var old=fresh.textContent;
        fresh.textContent='已複製 ✓';
        fresh.classList.add('done');
        setTimeout(function(){fresh.textContent=old;fresh.classList.remove('done')},1400);
      };
      var fallback=function(){
        var t=document.createElement('textarea');
        t.value=value;
        document.body.appendChild(t);
        t.select();
        try{document.execCommand('copy')}catch(err){}
        t.remove();
        done();
      };
      if(navigator.clipboard&&window.isSecureContext){
        navigator.clipboard.writeText(value).then(done).catch(fallback);
      }else{
        fallback();
      }
    });
  }

  project.querySelectorAll('button.copy').forEach(function(button){
    if((button.textContent||'').trim()==='一鍵複製 AI 指令'){
      bindCurrentPre(button);
    }
  });
})();