(function(){
  function copyText(text,button,label){
    function done(){
      var old=button.textContent;
      button.textContent='已複製';
      button.classList.add('done');
      setTimeout(function(){button.textContent=old||label;button.classList.remove('done')},1400);
    }
    function fallback(value){
      var ta=document.createElement('textarea');
      ta.value=value;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();
      try{document.execCommand('copy')}catch(e){}
      ta.remove();
    }
    if(navigator.clipboard&&window.isSecureContext){
      navigator.clipboard.writeText(text).then(done).catch(function(){fallback(text);done()});
    }else{fallback(text);done()}
  }

  function refineDialogPrompt(text){
    if(!text)return text;
    text=text.replace(
      /A\. 已確認商品資訊[\s\S]*?B\. 資料差異與待確認[\s\S]*?不要自行補猜。\n\nC\. 行程核心賣點/,
      'A. 異常／差異檢查\n先在背景完成商品資料核對，不要把正常資料全部重列一次。第一階段只顯示：不同來源不一致、缺漏、無法確認、疑似錯誤，或會影響後續製作的項目。若全部正常，只顯示「商品資料未發現異常」，不要再重貼商品名稱、團號、日期、售價、訂金、航班、住宿、餐食與景點等完整資料。\n\nB. 行程核心賣點'
    );
    text=text.replace(/D\. A4 頁次規劃/g,'C. A4 頁次規劃');
    text=text.replace(
      /第一階段完成後停止，不要開始製作頁面。/,
      '第一階段完成後停止，不要開始製作頁面。第一階段的確認重點是「只看異常」，正常資料不要逐項重列。'
    );
    return text;
  }

  function refineWorkPrompt(text){
    if(!text)return text;
    text=text.replace(
      /1\. 建立商品資料：[\s\S]*?2\. 比對來源：不同版本建立「差異／待確認」。\n3\. 提煉/,
      '1. 在背景建立並核對完整商品資料：商品名稱、團號、日期、天數、售價、訂金、航班、國家／城市、交通、住宿、餐食、主要景點、世界遺產、特殊安排、特色體驗、優惠與費用說明。這些正常資料不用逐項顯示給我。\n2. 只把不同版本不一致、缺漏、無法確認、疑似錯誤或會影響後續製作的內容列入「異常／差異／待確認」。若全部正常，只顯示「商品資料未發現異常」。\n3. 提煉'
    );
    text=text.replace(
      /5\. 第一階段只顯示：已確認資料、差異／待確認、主要賣點、最終頁次規劃。/,
      '5. 第一階段只顯示：①異常／差異／待確認（若無，僅一句「商品資料未發現異常」）②主要賣點 ③最終頁次規劃。不要再把所有已確認商品資訊完整列一次。'
    );
    return text;
  }

  function resetCopy(card,buttonSelector,preSelector,label){
    if(!card)return;
    var old=card.querySelector(buttonSelector);
    var pre=card.querySelector(preSelector);
    if(!old||!pre)return;
    var fresh=old.cloneNode(true);
    old.parentNode.replaceChild(fresh,old);
    fresh.addEventListener('click',function(e){e.stopPropagation();copyText(pre.textContent,this,label)});
  }

  var dialogCards=[document.getElementById('a4-chat-flow'),document.getElementById('a4-project-dialog')];
  dialogCards.forEach(function(card){
    if(!card)return;
    var pre=card.querySelector('.dialog-main-pre')||card.querySelector('.project-dialog-pre');
    if(pre)pre.textContent=refineDialogPrompt(pre.textContent);
  });
  resetCopy(document.getElementById('a4-chat-flow'),'.dialog-copy-main','.dialog-main-pre','一鍵複製完整指令');
  resetCopy(document.getElementById('a4-project-dialog'),'.project-dialog-copy','.project-dialog-pre','一鍵複製完整指令');

  var work=document.getElementById('a4-project-work');
  if(work){
    var wpre=work.querySelector('.project-work-pre');
    if(wpre)wpre.textContent=refineWorkPrompt(wpre.textContent);
    resetCopy(work,'.project-work-copy','.project-work-pre','一鍵複製完整指令');
  }

  var guide=document.getElementById('a4-project-guide');
  if(guide){
    var note=guide.querySelector('.project-note');
    if(note)note.innerHTML='<b>使用口訣：</b>建專案 → 貼完整指令一次 → 每次只丟商品資料 → 第一階段只看「異常／差異」與頁次 →「繼續」→ 再「繼續」。正常商品資訊不會整份重列。';
    var p=guide.querySelector('.card-top p');
    if(p)p.textContent='專案指令只貼一次；第一次核對只回報異常，不重列整份正常資料';
  }

  var section=document.getElementById('project');
  if(section){
    var head=section.querySelector('.section-head p');
    if(head)head.textContent='先建立專案、貼一次完整指令；之後每個案件只貼本次資料。第一階段只回報異常／差異，不重列全部商品資訊。';
  }
})();