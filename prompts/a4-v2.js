(function(){
  function cleanTerms(text){
    return (text||'')
      .replace(/\bChat\b/g,'對話')
      .replace(/\bWork\b/g,'工作')
      .replace(/聊天/g,'對話');
  }

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

  var old=document.getElementById('a4-chat-flow');
  var dialogPrompt='';
  var dialogStarter='';
  if(old){
    var p=old.querySelector('.a4-main-pre');
    var s=old.querySelector('.a4-start-pre');
    dialogPrompt=cleanTerms(p?p.textContent:'');
    dialogStarter=cleanTerms(s?s.textContent:'');
    old.remove();
  }

  var style=document.createElement('style');
  style.textContent='\
#a4-chat-flow,#a4-project-dialog,#a4-project-work,#a4-project-guide{border-color:#d7dfec;background:linear-gradient(180deg,#fff 0%,#fbfcff 100%);box-shadow:0 16px 42px #24335a10}\
#a4-chat-flow:before,#a4-project-dialog:before,#a4-project-work:before,#a4-project-guide:before{height:5px}\
#a4-chat-flow{border-color:#bfe3da;background:linear-gradient(180deg,#fff 0%,#f7fcfa 100%)}\
#a4-chat-flow .a4-flow,.project-flow{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 4px}\
#a4-chat-flow .a4-flow span,.project-flow span{padding:7px 10px;border-radius:999px;background:#eaf8f5;color:#116f61;font-size:12px;font-weight:800}\
#a4-chat-flow .a4-note,.project-note{margin-top:12px;padding:12px 14px;border:1px solid #dbe4ee;border-radius:10px;background:#f7f9fc;color:#44536d;font-size:13px;line-height:1.7}\
.project-mode-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}\
.project-mode{padding:16px;border:1px solid #e1e6ef;border-radius:12px;background:#fff}\
.project-mode b{display:block;margin-bottom:6px}.project-mode p{margin:0;color:var(--muted);font-size:13px;line-height:1.65}\
#a4-project-dialog{border-color:#c9dfef}#a4-project-work{border-color:#ead8b9}\
#a4-project-dialog .code{background:#eaf4fb;color:#2d6e9f}#a4-project-work .code{background:#fff2df;color:#9a641d}\
@media(max-width:700px){.project-mode-grid{grid-template-columns:1fr}}\
';
  document.head.appendChild(style);

  var documentSection=document.getElementById('document');
  if(documentSection&&dialogPrompt){
    var head=documentSection.querySelector('.section-head p');
    if(head)head.textContent='先用三階段完成 A4 多頁提案；需要局部整理、Email 或寄出前檢核時，再使用下方單項指令。';

    var article=document.createElement('article');
    article.className='prompt-card';
    article.id='a4-chat-flow';
    article.dataset.id='A4_DIALOG_FLOW';
    article.dataset.search='A4 多頁提案 對話 三階段 省用量 行程 圖文 報價 HTML PNG JPG PDF 繼續';
    article.innerHTML='\
      <div class="card-top"><span class="code">推薦</span><div><h3>A4 多頁提案｜對話三階段版</h3><p>同一個對話完成：內容架構 → A4 圖文頁面 → PDF</p></div><button class="bookmark" aria-label="收藏">☆</button></div>\
      <div class="a4-flow"><span>① 資料＋頁次</span><span>② 輸入「繼續」</span><span>③ A4 圖文頁面</span><span>④ 再「繼續」</span><span>⑤ PDF 交付</span></div>\
      <div class="a4-note"><b>適合：</b>一般對話、免費版省用量、想在同一個對話一路做到完。正式中文與價格表格使用 HTML／CSS 排版，不直接讓生圖模型畫大量文字。</div>\
      <div class="copy-block long-block"><div class="long-actions"><button class="copy dialog-copy-main" data-label="一鍵複製完整指令">一鍵複製完整指令</button><span>建立專案時貼一次；之後只貼本次商品資料</span></div>\
      <details class="long-prompt"><summary>展開完整指令 <small>對話省用量三階段</small></summary><pre class="dialog-main-pre"></pre></details></div>\
      <details class="custom-prompt"><summary>USER 第一次要怎麼貼？展開啟動版</summary><div class="copy-block"><pre class="dialog-start-pre"></pre><button class="copy dialog-copy-start" data-label="複製啟動版">複製啟動版</button></div></details>\
      <div class="card-foot check-only"><span><b>使用方式：</b>建立專案貼完整指令一次；每個案件只貼商品資料，之後輸入兩次「繼續」</span></div>';
    article.querySelector('.dialog-main-pre').textContent=dialogPrompt;
    article.querySelector('.dialog-start-pre').textContent=dialogStarter;
    article.querySelector('.dialog-copy-main').addEventListener('click',function(e){e.stopPropagation();copyText(dialogPrompt,this,'一鍵複製完整指令')});
    article.querySelector('.dialog-copy-start').addEventListener('click',function(e){e.stopPropagation();copyText(dialogStarter,this,'複製啟動版')});
    var dCards=documentSection.querySelector('.cards');
    if(dCards)dCards.insertBefore(article,dCards.firstChild);
  }

  var workPrompt=String.raw`你是「可樂旅遊 A4 提案頁生成助手｜工作完整交付版」。

這不是單純問答任務，而是一個需要完成正式交付物的多階段工作。收到我提供的旅遊商品資訊、官方網址、行程、報價與素材後，請在同一個「工作」中完成研究、整理、設計、檔案製作與最終 QA。

【最終交付物】
1. 完整 A4 多頁 HTML
2. 每頁 PNG／JPG
3. 完整 PDF
三者的文字、圖片、頁序、價格與內容必須一致。

【固定三階段】
第一階段：研究資料＋確認內容＋規劃頁次 → 完成後停止，等我輸入「繼續」
第二階段：正式完成 A4 圖文頁面＋HTML＋逐頁 PNG／JPG → 完成後停止，等我輸入「繼續」
第三階段：最終 QA＋修正版面＋輸出完整 PDF → 正式交付
未收到「繼續」不得自行跨階段。

【一、啟動資料】
當我提供以下全部或部分資料，即代表開始：出發日期、團號／行程代碼、商品名稱、售價、每席訂金、可樂旅遊商品網址、WebDM、行程網址、行程文件、報價文件、圖片與其他素材。收到後直接開始第一階段；除非缺少資訊會造成事實錯誤，否則不要先問問題。

【二、資料優先順序】
1. 我本次明確輸入的資料
2. 我提供或專案內的正式文件
3. 可樂旅遊官方行程頁
4. 可樂旅遊官方 WebDM
5. 官方供應商／飯店／船公司／景點資料
6. 其他可信公開資訊
若來源不同，不可偷偷修正或自行合併；第一階段列出差異。我本次明確輸入的團號、日期、售價與訂金優先保留，其他來源差異標示待確認。

不得虛構航班、航班時間、飯店、房型、艙房、餐食、景點、門票、價格、優惠條件、稅金、小費、單人房差、自費活動、保險、加價、聯絡資訊或 Logo。

【三、最重要的製作原則】
本任務是 A4 排版工作，不是直接用圖片生成模型畫一張有大量文字的海報。
所有中文、英文、日期、售價、訂金、團號、表格、行程名稱、景點介紹與頁碼，必須使用真實排版文字。
圖片生成只可用於無文字旅遊主視覺、無文字景觀、無文字插圖或裝飾背景，再放入正式 A4 HTML／版面。
正確流程：HTML／CSS 真實文字排版＋正確圖片 → A4 頁面 → PNG／JPG／PDF。

【四、A4 與視覺規格】
・預設 A4 直式 210 × 297 mm
・每頁獨立 page，列印時不可跨頁切斷重要區塊
・整體定位：可樂旅遊 × 精品旅遊提案 × 清楚資訊 × 目的地氛圍
・專業、有質感、有旅行感、留白足夠、資訊層級清楚
・不要制式 Word、廉價促銷 DM、過度 AI 美術感或每頁完全相同版型
・圖片優先使用我提供的正式素材、可樂旅遊官方素材、官方飯店／船公司／目的地／景點素材；必要時才生成無字圖片
・無法確認為實際商品內容時，不得暗示為實際入住、實際艙房或實際餐食

━━━━━━━━━━━━━━━━━━
【第一階段｜研究＋內容架構】
━━━━━━━━━━━━━━━━━━
1. 建立商品資料：商品名稱、團號、日期、天數、售價、訂金、航班、國家／城市、交通、住宿、餐食、主要景點、世界遺產、特殊安排、特色體驗、優惠與費用說明。
2. 比對來源：不同版本建立「差異／待確認」。
3. 提煉 5～8 個真正具有商品差異性的賣點，不使用空泛形容詞。
4. 規劃最合適的 A4 頁數，通常約 6～10 頁；每頁列出頁碼、頁名、核心訊息、主要內容、圖片需求與建議構圖。
5. 第一階段只顯示：已確認資料、差異／待確認、主要賣點、最終頁次規劃。
完成後停止並顯示：「第一階段完成。請輸入『繼續』，我會直接開始正式製作全部 A4 圖文頁面。」

━━━━━━━━━━━━━━━━━━
【第二階段｜正式製作 A4 頁面】
━━━━━━━━━━━━━━━━━━
收到第一次「繼續」後直接開始，不重新詢問第一階段已確認內容。
1. 建立單一完整 A4 HTML：可直接預覽與列印，print CSS 正確，中文正常，圖片與表格不破版。
2. 依各頁內容選擇最適構圖，例如滿版主視覺、左圖右文、雙景點卡、時間軸、路線、特色卡、報價表；不要所有頁面都同一版型。
3. 每日行程保留事實、Day 順序與重要景點；文字改為消費者易讀版本，但不可自行新增內容。
4. 報價匯總至少整理商品名稱、團號、出發日期、團體售價、每席訂金、已確認優惠、費用包含／不包含、其他已知費用與重要備註。所有金額必須有來源並使用千分位。
5. 完成 HTML 後輸出 P01.png、P02.png、P03.png……；PNG／JPG 中的文字必須由正式排版渲染，不可重新用生圖模型畫字。
6. 逐頁 QA：商品名稱、團號、日期、售價、訂金、Day、景點、飯店、餐食、航班、報價、頁碼、圖片對應、文字截斷、跑版與表格。
發現錯誤直接修正，不把問題留給我。
完成後提供可檢視的 HTML 與全部 PNG／JPG，停止並顯示：「第二階段完成。請輸入『繼續』，我會進行最終資料核對、修正版面並輸出完整 PDF。」

━━━━━━━━━━━━━━━━━━
【第三階段｜最終 QA＋PDF】
━━━━━━━━━━━━━━━━━━
收到第二次「繼續」後：
1. 以原始可靠資料重新核對團號、日期、商品名稱、售價、訂金、航班、行程、景點、住宿、餐食、報價、優惠、費用與頁次。
2. 視覺 QA：檢查全案一致性、主標層級、字級、圖片解析度、裁切、表格、留白、文字壓圖、重複圖片與頁面密度；發現問題直接修正 HTML 與相關圖檔。
3. PDF 優先由同一份 HTML／排版來源輸出；若只能用 PNG，依 P01、P02、P03……正確頁序合併，不得漏頁、重複、裁切或變形。
4. 正式交付：PDF、HTML、逐頁 PNG／JPG；最後只簡要列出各檔案是否完成、圖檔頁數與仍待確認資料，不重新貼完整行程。

【五、同一工作狀態規則】
第一次收到商品資料 → 第一階段
第一次收到「繼續」 → 第二階段
第二次收到「繼續」 → 第三階段
若我中途要求修改某頁、換圖、改價格、刪除文字或調整版面，只修改指定內容並維持目前階段，不從頭重做。

【六、工作效率原則】
能讀網址就直接讀取，能讀檔就直接讀取，能建立檔案就直接建立；不要把可完成的工作改成操作教學，不要求我重複貼已提供資料，不在對話中反覆輸出長篇製作說明。

【七、品質優先順序】
商品資料正確 ＞ 售價與報價正確 ＞ 中文文字正確 ＞ 行程順序正確 ＞ 圖片內容正確 ＞ 版面易讀 ＞ 視覺美感。

收到本次商品資料後，立即開始第一階段。`;

  var workStarter=String.raw`請依本專案規則，完成本次「可樂旅遊 A4 多頁提案」。

【本次商品資料】
出發日期：[請填寫]
團號／行程代碼：[請填寫]
商品名稱：[請填寫]
售價：[請填寫]
每席訂金：[請填寫]
可樂旅遊商品／行程網址：[請貼上網址]
WebDM／其他參考網址：[有就貼，沒有可刪除]
本次上傳檔案：[有行程、報價、圖片時直接上傳]
其他補充：[有就填，沒有可刪除]

請直接讀取我提供的網址、上傳檔案與相關資料，依專案規則開始執行「第一階段：研究資料＋確認內容＋規劃頁次」。
請自行完成必要的資料整理與比對，不要要求我重複提供已存在於網址或檔案中的資訊；若來源有差異，列入「待確認／資料差異」，不要自行猜測。
第一階段完成後停止，等我輸入「繼續」再正式製作全部 A4 圖文頁面。`;

  var project=document.getElementById('project');
  if(project){
    var pHead=project.querySelector('.section-head p');
    if(pHead)pHead.textContent='先建立專案、貼一次完整指令；之後每個案件只貼本次資料。可選「對話版」或「工作版」。';
    var cards=project.querySelector('.cards');
    if(cards){
      var guide=document.createElement('article');
      guide.className='prompt-card';guide.id='a4-project-guide';
      guide.innerHTML='\
        <div class="card-top"><span class="code">先看</span><div><h3>A4 提案專案｜建立與使用步驟</h3><p>專案指令只貼一次，之後每一團只換本次商品資料</p></div></div>\
        <div class="project-flow"><span>① 建立專案</span><span>② 選對話版／工作版</span><span>③ 貼完整專案指令</span><span>④ 開啟對話／工作</span><span>⑤ 貼本次商品資料</span><span>⑥「繼續」</span><span>⑦ 再「繼續」完成 PDF</span></div>\
        <div class="project-mode-grid"><div class="project-mode"><b>對話版｜免費版也可用</b><p>適合一般對話與課堂操作。三階段分批執行，較省用量；若當下無法直接輸出 PDF，保留完整 A4 HTML 作為備援。</p></div><div class="project-mode"><b>工作版｜正式交付優先</b><p>適合需要讀網址、整理多份資料、建立 HTML／PNG／PDF 並做完整 QA 的正式案件。</p></div></div>\
        <div class="project-note"><b>使用口訣：</b>建專案 → 貼完整指令一次 → 每次只丟商品資料 →「繼續」→ 再「繼續」。不要每次重貼整份專案指令。</div>';

      var dialog=document.createElement('article');
      dialog.className='prompt-card';dialog.id='a4-project-dialog';dialog.dataset.search='A4 提案 專案 對話版 免費 省用量 三階段';
      dialog.innerHTML='\
        <div class="card-top"><span class="code">A版</span><div><h3>A4 提案專案｜對話版</h3><p>免費版／一般對話：建立專案時貼一次</p></div><button class="bookmark" aria-label="收藏">☆</button></div>\
        <div class="copy-block long-block"><div class="long-actions"><button class="copy project-dialog-copy">一鍵複製完整指令</button><span>之後每個案件只貼本次商品資料</span></div><details class="long-prompt"><summary>展開完整指令 <small>對話三階段＋省用量</small></summary><pre class="project-dialog-pre"></pre></details></div>\
        <details class="custom-prompt"><summary>USER 第一次怎麼丟？展開啟動版</summary><div class="copy-block"><pre class="project-dialog-start"></pre><button class="copy project-dialog-start-copy">複製啟動版</button></div></details>';
      dialog.querySelector('.project-dialog-pre').textContent=dialogPrompt;
      dialog.querySelector('.project-dialog-start').textContent=dialogStarter;
      dialog.querySelector('.project-dialog-copy').addEventListener('click',function(e){e.stopPropagation();copyText(dialogPrompt,this,'一鍵複製完整指令')});
      dialog.querySelector('.project-dialog-start-copy').addEventListener('click',function(e){e.stopPropagation();copyText(dialogStarter,this,'複製啟動版')});

      var work=document.createElement('article');
      work.className='prompt-card';work.id='a4-project-work';work.dataset.search='A4 提案 專案 工作版 完整交付 HTML PNG PDF QA';
      work.innerHTML='\
        <div class="card-top"><span class="code">B版</span><div><h3>A4 提案專案｜工作版</h3><p>正式成品：研究資料 → 完成頁面 → QA → PDF 交付</p></div><button class="bookmark" aria-label="收藏">☆</button></div>\
        <div class="copy-block long-block"><div class="long-actions"><button class="copy project-work-copy">一鍵複製完整指令</button><span>適合希望檔案與 QA 一路做到完</span></div><details class="long-prompt"><summary>展開完整指令 <small>工作三階段＋完整交付</small></summary><pre class="project-work-pre"></pre></details></div>\
        <details class="custom-prompt"><summary>USER 第一次怎麼丟？展開啟動版</summary><div class="copy-block"><pre class="project-work-start"></pre><button class="copy project-work-start-copy">複製啟動版</button></div></details>';
      work.querySelector('.project-work-pre').textContent=workPrompt;
      work.querySelector('.project-work-start').textContent=workStarter;
      work.querySelector('.project-work-copy').addEventListener('click',function(e){e.stopPropagation();copyText(workPrompt,this,'一鍵複製完整指令')});
      work.querySelector('.project-work-start-copy').addEventListener('click',function(e){e.stopPropagation();copyText(workStarter,this,'複製啟動版')});

      cards.insertBefore(work,cards.firstChild);
      cards.insertBefore(dialog,cards.firstChild);
      cards.insertBefore(guide,cards.firstChild);
    }
  }

  var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:function(node){
    var p=node.parentNode;if(!p)return NodeFilter.FILTER_REJECT;
    var tag=p.nodeName;if(tag==='SCRIPT'||tag==='STYLE')return NodeFilter.FILTER_REJECT;
    return node.nodeValue.indexOf('聊天')>-1?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
  }});
  var nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(function(n){n.nodeValue=n.nodeValue.replace(/聊天/g,'對話')});
  document.querySelectorAll('[data-search]').forEach(function(el){if(el.dataset.search)el.dataset.search=el.dataset.search.replace(/聊天/g,'對話')});
})();