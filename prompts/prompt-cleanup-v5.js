(function(){
  function copyText(text,btn){
    function done(){var old=btn.textContent;btn.textContent='已複製 ✓';btn.classList.add('done');setTimeout(function(){btn.textContent=old;btn.classList.remove('done')},1400)}
    function fallback(){var t=document.createElement('textarea');t.value=text;document.body.appendChild(t);t.select();try{document.execCommand('copy')}catch(e){}t.remove();done()}
    if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(text).then(done).catch(fallback)}else fallback();
  }

  /* 02｜把通用的讀檔、檢查、比較、翻譯移到萬用區 */
  var daily=document.getElementById('daily');
  if(daily){
    var dp=daily.querySelector('.section-head p');
    if(dp)dp.textContent='讀檔、摘要、檢查、比較、翻譯、改寫與驗收；不必建立專案也能直接用。';
    var dcards=daily.querySelector('.cards');
    if(dcards&&!document.getElementById('generic-file-tools')){
      var wrap=document.createElement('div');
      wrap.id='generic-file-tools';
      wrap.innerHTML=`
        <div class="cards-subhead"><h3>檔案處理</h3><p>拿到 Word、PDF、圖片或兩個版本的檔案時，先從這裡選。</p></div>
        <article class="prompt-card" data-id="GEN_READ" data-search="讀檔確認 Word PDF 圖片 有沒有讀到 欄位">
          <div class="card-top"><span class="code">讀檔</span><div><h3>讀檔確認｜AI 有沒有真的讀到？</h3><p>檔案內容怪怪的、掃描 PDF、表格很多時使用</p></div></div>
          <div class="copy-block"><pre>請先讀完我上傳的檔案，不要改寫。只告訴我：\n1. 你成功讀到哪些主要內容\n2. 哪些部分讀不到、看不清楚或像圖片／掃描內容\n3. 有沒有明顯缺頁或資料斷裂\n正常內容不用逐段重述。</pre><div class="card-foot"><button class="copy">複製</button><span>讀得到就直接做事；有問題才停下來處理</span></div></div>
        </article>
        <article class="prompt-card" data-id="GEN_CHECK" data-search="檔案檢查 矛盾 缺漏 固定資料 價格 日期 航班 飯店 餐食">
          <div class="card-top"><span class="code">檢查</span><div><h3>檔案檢查｜只抓有問題的地方</h3><p>寄出前、改稿後、資料很多怕漏看</p></div></div>
          <div class="copy-block"><pre>請檢查我提供的資料，只列出「矛盾、缺漏、疑似錯誤、來源不明」的項目。\n價格、日期、航班、飯店、餐食、景點、付款與取消條款視為固定事實，不可自行改寫或推測。\n如果沒有異常，只回覆「未發現明顯異常」。</pre><div class="card-foot"><button class="copy">複製</button><span>不再把整份正常資料重列一次</span></div></div>
        </article>
        <article class="prompt-card" data-id="GEN_COMPARE" data-search="檔案比較 版本差異 A B 新舊 改了什麼">
          <div class="card-top"><span class="code">比較</span><div><h3>兩份檔案比較｜哪裡不一樣？</h3><p>新舊版報價、行程、合約或修改稿</p></div></div>
          <div class="copy-block"><pre>請比較我提供的兩份檔案，只列出有差異的地方。\n依「項目／版本 A／版本 B／差異說明」整理。\n特別檢查價格、日期、航班、飯店、餐食、景點、人數、效期與條款。\n相同內容不用列出，也不要自行判定哪一版才正確。</pre><div class="card-foot"><button class="copy">複製</button><span>只看差異，減少重新人工逐頁比對</span></div></div>
        </article>
        <article class="prompt-card" data-id="GEN_TRANSLATE" data-search="檔案翻譯 翻譯 中英 日文 韓文 保留格式 數字 專有名詞">
          <div class="card-top"><span class="code">翻譯</span><div><h3>檔案翻譯｜格式與數字不要亂動</h3><p>行程、報價、Email、說明文件都可用</p></div></div>
          <div class="copy-block"><pre>請把我提供的內容翻譯成[請填寫：語言]。\n保留原本標題、段落、表格與條列結構；日期、時間、金額、航班編號、飯店名、地址、網址與專有名詞不得自行改寫。\n不確定的專有名詞保留原文並標示「待確認」，不要猜譯。</pre><div class="card-foot"><button class="copy">複製</button><span>先保真，再求語句自然</span></div></div>
        </article>`;
      while(wrap.firstChild)dcards.insertBefore(wrap.firstChild,dcards.firstChild);
      dcards.querySelectorAll('[data-id^="GEN_"] .copy').forEach(function(btn){btn.addEventListener('click',function(e){e.stopPropagation();copyText(btn.closest('.copy-block').querySelector('pre').innerText,btn)})});
    }
  }

  /* 04｜只留真正的報價、行程與交付工作；舊的三個前置步驟移除 */
  var doc=document.getElementById('document');
  if(doc){
    ['B0','B1','B2'].forEach(function(id){var el=doc.querySelector('[data-id="'+id+'"]');if(el)el.remove()});
    var p=doc.querySelector('.section-head p');
    if(p)p.textContent='直接做報價、行程、DM、Email 與交付；讀檔、檢查、比較、翻譯請到 02。';
    var guide=doc.querySelector('.travel-style-guide');
    if(guide){
      var gp=guide.querySelector('.style-guide-intro p');
      if(gp)gp.textContent='要做旅遊提案或 DM 時，先選一種主風格；複製後貼到製作指令最後即可。';
    }
  }

  /* 03｜賀成交快速版旁邊補回「建立專案」完整指令 */
  var image=document.getElementById('image');
  var c1=image&&image.querySelector('[data-id="C1"]');
  if(c1&&!document.getElementById('deal-project-setup')){
    var dealPrompt=`你是「旅遊成交回報圖設計助手」。\n\n收到當次成交資訊後，直接生成 1 張適合手機與 LINE 分享的直式 4:5 賀成交圖。\n\n固定欄位只有五項，欄位名稱不可更改：\n承辦業務\n客戶名稱\n出發日期\n旅遊地區\n報名人數\n\n【資料規則】\n每次只使用目前這個對話中最新提供的五項成交資料，不得沿用其他案件、範例圖或之前生成圖片中的姓名、日期、地區、人數與客戶名稱。內容完全照我提供的文字，不自行縮寫、補寫或猜測。\n\n【視覺規則】\n若我有附參考圖片，只參考畫風、構圖、色彩與整體氛圍，不複製其中人物、文字、Logo 或資料。\n若沒有指定風格，依旅遊地區、出發季節與成交情境自行選擇合適的視覺方向，不必再問。\n\n【生成規則】\n使用繁體中文；五項資料都要清楚可讀。不要重問是否生成，收到完整資料就直接生成 1 張。\n生成後簡短列出圖中應出現的五項成交資訊，讓我逐字核對；若中文字、日期或數字有誤，提醒我不要直接對外使用並協助修正。`;
    var details=document.createElement('details');
    details.id='deal-project-setup';
    details.className='custom-prompt';
    details.innerHTML=`<summary>還沒建「賀成交圖」專案？展開專案設定與完整指令</summary>
      <div class="copy-block"><p><b>專案名稱：</b>可樂旅遊｜賀成交圖</p><p>建立一次後，以後只要貼五項成交資料；參考圖可在當次對話一起附上。</p><pre class="deal-project-pre"></pre><button class="copy deal-project-copy" data-label="一鍵複製專案指令">一鍵複製專案指令</button></div>`;
    details.querySelector('.deal-project-pre').textContent=dealPrompt;
    details.querySelector('.deal-project-copy').addEventListener('click',function(e){e.stopPropagation();copyText(dealPrompt,this)});
    c1.appendChild(details);
  }

  /* 05｜提醒成交圖專案的位置，避免學生以為被刪掉 */
  var project=document.getElementById('project');
  if(project){
    var intro=project.querySelector('.project-intro');
    if(intro&&!document.getElementById('project-image-note')){
      var note=document.createElement('div');
      note.id='project-image-note';note.className='quick-use';
      note.innerHTML='<b>圖片專案另外放：</b>「賀成交圖」的專案設定與完整指令已放回 03「圖片生成 → 賀成交圖｜快速版」內，避免跟團體報價單專案混在一起。';
      intro.parentNode.insertBefore(note,intro.nextSibling);
    }
  }

  /* 06｜修掉已不存在指令與舊 HTML 流程的引用 */
  var help=document.getElementById('help');
  if(help){
    help.querySelectorAll('td').forEach(function(td){
      var t=td.textContent;
      if(t.indexOf('上傳後先確認讀取內容')>-1)td.textContent='到 02 使用「讀檔確認｜AI 有沒有真的讀到？」；只處理讀不到或缺漏的部分。';
      else if(t.indexOf('請直接完成並提供可開啟的單一網頁檔')>-1)td.textContent='補一句：「請直接完成並提供可檢視成果，不要只說明做法。」';
      else if(t.indexOf('課堂先完成網頁')>-1)td.textContent='檔案產出能力依帳號與當下功能而異；若目前無法產檔，先保留可檢視成果，再改用可用的工具或方案輸出。';
      else if(t.indexOf('拆成三步：先讀取與確認')>-1)td.textContent='把長任務拆成「讀檔／執行／驗收」三段；不必每一步都重列完整資料。';
    });
  }
})();