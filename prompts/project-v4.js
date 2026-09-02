(function(){
  function copyText(text,btn){
    function ok(){
      var old=btn.textContent;
      btn.textContent='已複製 ✓';
      btn.classList.add('done');
      setTimeout(function(){btn.textContent=old;btn.classList.remove('done')},1400);
    }
    if(navigator.clipboard&&window.isSecureContext){
      navigator.clipboard.writeText(text).then(ok).catch(function(){
        var t=document.createElement('textarea');t.value=text;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();ok();
      });
    }else{
      var t=document.createElement('textarea');t.value=text;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();ok();
    }
  }

  var style=document.createElement('style');
  style.textContent=`
  .project-intro{padding:18px 20px;border:1px solid #d9e2ef;border-radius:14px;background:linear-gradient(135deg,#f8fbff,#fff);margin-bottom:14px}
  .project-intro b{font-size:18px}.project-intro p{margin:7px 0 0;color:var(--muted);line-height:1.75}
  .steps{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.steps span{padding:7px 10px;border-radius:999px;background:#eef3ff;color:#3658df;font-size:12px;font-weight:900}
  .platform-card{border-width:2px}.platform-card.chatgpt{border-color:#b9d6ff}.platform-card.claude{border-color:#e8cfb0}
  .platform-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:15px}
  .platform-box{padding:14px;border:1px solid #e1e6ef;border-radius:12px;background:#fafbfe}
  .platform-box h4{margin:0 0 8px;font-size:16px}.platform-box p,.platform-box li{font-size:13px;line-height:1.75;color:#4a5870}
  .platform-box ul{margin:6px 0 0;padding-left:20px}.platform-box .copy{margin-top:10px}
  .quick-use{padding:14px;border-radius:12px;background:#eef9f6;border:1px solid #cfe9e2;margin-top:14px}
  .quick-use b{color:#116f61}.quick-use code{display:inline-block;margin-top:8px;padding:8px 10px;background:#fff;border:1px solid #dbe7e3;border-radius:8px;font-family:inherit;font-weight:900}
  .rule-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px}
  .rule-strip div{padding:12px;border-radius:10px;background:#f7f8fc;border:1px solid #e1e5ef;font-size:13px;line-height:1.65}
  .risk-card{border-color:#f0c8cf!important;background:linear-gradient(180deg,#fff,#fff9fa)!important}
  .risk-badge{display:inline-block;padding:5px 8px;border-radius:7px;background:#ffe7eb;color:#b52b45;font-size:12px;font-weight:900}
  .risk-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin:14px 0}
  .risk-grid div{padding:11px;border-radius:10px;background:#fff;border:1px solid #efd8dd;font-size:12px;line-height:1.55}.risk-grid b{display:block;color:#b52b45;margin-bottom:4px}
  .risk-example{padding:12px 14px;border-radius:10px;background:#fff3f5;border-left:4px solid #d40f7d;font-size:13px;line-height:1.8}
  .file-links{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.file-links a{display:inline-block;padding:8px 10px;border-radius:8px;background:#f0f3fb;color:#3658df;text-decoration:none;font-size:12px;font-weight:900}
  @media(max-width:760px){.platform-grid,.rule-strip,.risk-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  var documentSection=document.getElementById('document');
  if(documentSection){
    var oldA4=document.getElementById('a4-chat-flow'); if(oldA4) oldA4.remove();
    var p=documentSection.querySelector('.section-head p');
    if(p)p.textContent='單次任務直接用；需要固定規則、重複出件，再到 05 建立專案。';

    var full=documentSection.querySelector('[data-id="DM_FULL"]');
    if(full){
      var h=full.querySelector('h3'); if(h)h.textContent='網頁版完整旅遊 DM｜文字正確優先';
      var sub=full.querySelector('.card-top p'); if(sub)sub.textContent='適合正式資料交付；用網頁排版確保文字與數字正確，不是 AI 全圖生圖';
    }
    var one=documentSection.querySelector('[data-id="DM_ONE"]');
    if(one){
      var h2=one.querySelector('h3'); if(h2)h2.textContent='網頁版單張報價 DM｜文字正確優先';
      var sub2=one.querySelector('.card-top p'); if(sub2)sub2.textContent='只做一張報價重點頁；文字正確優先';
    }

    var riskPrompt=`單張 A4 直式旅遊 DM（比例 1:1.414，至少 1240×1754 像素）。

風格：請依本次目的地、景點與季節，採高質感旅遊型錄／旅遊提案 DM／雜誌型錄感。

版面包含：主視覺、團名、副標、3 項特色標籤、出發資訊、3～4 則行程亮點、每日行程簡表、航班資訊與團費。

【嚴格限制】
不要生成任何 LOGO、商標、網址或電話。
品牌區保留乾淨留白，供後製放正式品牌素材。
不要出現我沒有提供的數字、日期或航班；資料不足就留白，不可編造。
攝影感、寫實、自然光，不要插畫或 3D 風格。

重要：這張圖只用於風格探索／內部草稿。生成後必須放大 100% 檢查中文字、價格、日期、航班與景點，不可直接對外。`;

    var risk=document.createElement('article');
    risk.className='prompt-card risk-card';
    risk.dataset.id='DM_AI_FULL_RISK';
    risk.dataset.search='AI 全圖生成 DM 風險 錯字 LOGO 數字 風格探索';
    risk.innerHTML=`
      <div class="card-top"><span class="risk-badge">實驗／風險示範</span><div><h3>AI 全圖生成 DM｜只用來看風格</h3><p>版面很漂亮，但中文、數字、LOGO 與景點細節不可靠；不可直接對外。</p></div></div>
      <div class="risk-grid">
        <div><b>版面設計</b>★★★★★<br>很適合快速看方向</div>
        <div><b>中文正確率</b>★☆☆☆☆<br>實測大量近似錯字</div>
        <div><b>數字／航班</b>★★☆☆☆<br>缺資料可能亂補</div>
        <div><b>LOGO／CI</b>★☆☆☆☆<br>可能變色或生成假字</div>
      </div>
      <div class="risk-example"><b>實測：</b>「機上簡餐」→「槻上蒿餐」、「飯店早餐」→「飯庖旱餐」、「飛驒牛料理」→「飛驛牛枓理」。<br><b>記住：</b>AI 排版能力強，中文寫字能力弱；全圖生成負責「快」，後製負責「對」。</div>
      <div class="copy-block"><pre class="risk-pre"></pre><div class="card-foot"><button class="copy risk-copy" data-label="複製展示用指令">複製展示用指令</button><span><b>用完檢查：</b>放大 100% 逐字核對；不能直接給客戶</span></div></div>
      <div class="file-links"><a href="files/可樂旅遊_AI全圖生成DM指令與風險說明_v1.txt" target="_blank">完整風險說明 TXT</a></div>`;
    risk.querySelector('.risk-pre').textContent=riskPrompt;
    risk.querySelector('.risk-copy').addEventListener('click',function(e){e.stopPropagation();copyText(riskPrompt,this)});

    var cards=documentSection.querySelector('.cards');
    if(cards){
      var anchor=full||one||cards.firstChild;
      cards.insertBefore(risk,anchor);
    }
  }

  var project=document.getElementById('project');
  if(project){
    var nav=document.querySelector('.side a[href="#project"]');
    if(nav){
      var textNodes=[].slice.call(nav.childNodes).filter(function(n){return n.nodeType===3});
      if(textNodes.length)textNodes[textNodes.length-1].nodeValue=' 專案設定與 AI 指令';
    }
    var h2=project.querySelector('.section-head h2'); if(h2)h2.textContent='專案設定與 AI 指令';
    var hp=project.querySelector('.section-head p'); if(hp)hp.textContent='設定一次，以後同類案件只要丟檔案。先選你使用 ChatGPT 或 Claude。';

    var cards=project.querySelector('.cards');
    if(cards){
      cards.innerHTML='';

      var intro=document.createElement('article');
      intro.className='prompt-card';
      intro.dataset.search='專案 入門 設定 ChatGPT Claude';
      intro.innerHTML=`
        <div class="project-intro"><b>專案＝把固定規則先放好，以後不用每次重講。</b><p>這堂課只記一個流程：選平台 → 建專案 → 放共用規範 → 貼一次 AI 指令 → 每次丟 2 個檔案 → 一句話產出。</p>
        <div class="steps"><span>① 選平台</span><span>② 建專案</span><span>③ 放規範</span><span>④ 貼 AI 指令</span><span>⑤ 每次上傳 2 檔</span><span>⑥ 一句話產出</span></div></div>
        <div class="rule-strip">
          <div><b>WORD 底圖</b><br>課堂統一：每個案件都和行程原檔一起上傳。</div>
          <div><b>景點照片</b><br>≥ 3 張：純文字版＋大圖版；<br>&lt; 3 張：純文字版。</div>
          <div><b>方案限制</b><br>功能會更新，不在教材寫死免費／付費能不能產檔。</div>
        </div>`;
      cards.appendChild(intro);

      var chatPrompt=`你是可樂旅遊的團體報價文件處理助理。

本專案資料來源中有《可樂旅遊_AI報價單產出指令_v3》，每次案件都必須先讀取並依照該文件完整執行。

每次開工前確認使用者已提供：
1. 行程／報價原始檔
2. 可樂旅遊團體報價單 WORD 底圖範本 .docx

缺少 WORD 底圖範本時，只提醒使用者補上，不要自行重畫。

資料只使用本次附件與本專案資料來源；原檔沒有的內容不可編造，矛盾內容不可自行決定。

一次完成需要的 WORD 與 PDF，不分階段、不要求使用者先確認。

原始檔可用景點照片 ≥ 3 張：產出「純文字版＋大圖版」。
可用景點照片 < 3 張：只產出「純文字版」。

產檔完成後，再以白話列出：
【原檔矛盾，需要你判斷】
【原檔沒有，需要業務填】

本專案只製作團體報價單，不製作 DM 或 AI 生圖。`;

      var chat=document.createElement('article');
      chat.className='prompt-card platform-card chatgpt';
      chat.dataset.search='ChatGPT 專案設定 AI 指令 報價單';
      chat.innerHTML=`
        <div class="card-top"><span class="code">ChatGPT</span><div><h3>ChatGPT｜專案設定＋AI 指令</h3><p>照著設定一次，以後每一團只要上傳兩個檔案。</p></div></div>
        <div class="platform-grid">
          <div class="platform-box"><h4>① 專案設定</h4>
            <p><b>專案名稱：</b>可樂旅遊｜團體報價單產出</p>
            <p><b>資料來源必放：</b></p>
            <ul><li>可樂旅遊_AI報價單產出指令_v3.txt</li></ul>
            <p><b>可放：</b>WORD 底圖範本、PDF 底圖範本。<br>但課堂統一仍建議：WORD 底圖每次與案件一起上傳，避免抓錯版本。</p>
            <p><b>不要放：</b>AI 生圖與 DM 指令；那是另一個專案。</p>
            <div class="file-links"><a href="files/可樂旅遊_ChatGPT專案設定_v2.txt" target="_blank">下載完整設定 TXT</a><a href="files/可樂旅遊_AI報價單產出指令_v3.txt" target="_blank">下載共用 AI 規範</a></div>
          </div>
          <div class="platform-box"><h4>② 專案 AI 指令</h4>
            <p>貼進專案的「指示」欄位。細節不要重複寫，全部交給共用規範檔管理。</p>
            <button class="copy chat-copy">一鍵複製 AI 指令</button>
            <details class="custom-prompt"><summary>展開查看</summary><pre class="chat-pre"></pre></details>
          </div>
        </div>
        <div class="quick-use"><b>③ 每次怎麼用</b><br>上傳「行程／報價原始檔」＋「WORD 底圖範本」，輸入：<br><code>依專案規範產出報價單</code></div>`;
      chat.querySelector('.chat-pre').textContent=chatPrompt;
      chat.querySelector('.chat-copy').addEventListener('click',function(e){e.stopPropagation();copyText(chatPrompt,this)});
      cards.appendChild(chat);

      var claudePrompt=`你是可樂旅遊的團體報價文件處理助理。

Project Knowledge 中有《可樂旅遊_AI報價單產出指令_v3》，每次案件都必須先讀取並依照該文件完整執行。

每次開工前確認使用者已提供：
1. 行程／報價原始檔
2. 可樂旅遊團體報價單 WORD 底圖範本 .docx

Project Knowledge 中的 PDF 底圖只供視覺對照，真正產檔仍以本次上傳的 WORD 底圖範本為準。

缺少 WORD 底圖範本時，只提醒使用者補上，不要自行重畫。

資料只使用本次附件與 Project Knowledge；原檔沒有的內容不可編造，矛盾內容不可自行決定。

一次完成需要的 WORD 與 PDF，不分階段、不要求使用者先確認。

原始檔可用景點照片 ≥ 3 張：產出「純文字版＋大圖版」。
可用景點照片 < 3 張：只產出「純文字版」。

產檔完成後，再以白話列出：
【原檔矛盾，需要你判斷】
【原檔沒有，需要業務填】

本專案只製作團體報價單，不製作 DM 或 AI 生圖。`;

      var claude=document.createElement('article');
      claude.className='prompt-card platform-card claude';
      claude.dataset.search='Claude Project 專案設定 AI 指令 報價單';
      claude.innerHTML=`
        <div class="card-top"><span class="code">Claude</span><div><h3>Claude｜Project 設定＋AI 指令</h3><p>版型與 ChatGPT 一樣，學生不用重新學一套。</p></div></div>
        <div class="platform-grid">
          <div class="platform-box"><h4>① Project 設定</h4>
            <p><b>名稱：</b>可樂旅遊｜團體報價單產出</p>
            <p><b>Description：</b>把格式不一的行程／報價原始檔，轉成套用可樂底圖範本的團體報價單 WORD 與 PDF。不做 DM 與生圖。</p>
            <p><b>Project Knowledge 必放：</b></p>
            <ul><li>可樂旅遊_AI報價單產出指令_v3.txt</li></ul>
            <p><b>選放：</b>PDF 底圖範本（視覺對照）。</p>
            <p><b>不要放 WORD 底圖：</b>它主要資訊在頁首頁尾，Claude 專案知識不適合作為產檔結構來源；每次案件直接上傳。</p>
            <div class="file-links"><a href="files/可樂旅遊_Claude專案設定_v2.txt" target="_blank">下載完整設定 TXT</a><a href="files/可樂旅遊_AI報價單產出指令_v3.txt" target="_blank">下載共用 AI 規範</a></div>
          </div>
          <div class="platform-box"><h4>② 專案 AI 指令</h4>
            <p>貼進 Project 的 Instructions。詳細排版與技術規則只放在共用規範檔。</p>
            <button class="copy claude-copy">一鍵複製 AI 指令</button>
            <details class="custom-prompt"><summary>展開查看</summary><pre class="claude-pre"></pre></details>
          </div>
        </div>
        <div class="quick-use"><b>③ 每次怎麼用</b><br>上傳「行程／報價原始檔」＋「WORD 底圖範本」，輸入：<br><code>依專案規範產出報價單</code></div>`;
      claude.querySelector('.claude-pre').textContent=claudePrompt;
      claude.querySelector('.claude-copy').addEventListener('click',function(e){e.stopPropagation();copyText(claudePrompt,this)});
      cards.appendChild(claude);
    }
  }
})();