(function(){
  var project=document.getElementById('project');
  if(!project)return;

  var exactTemplate='可樂旅遊團體報價單WORD底圖範本.docx';

  /* 首頁重點：每次一定要帶哪兩個檔案 */
  var strip=project.querySelector('.rule-strip');
  if(strip){
    var items=strip.querySelectorAll('div');
    if(items[0])items[0].innerHTML='<b>每次必傳 2 個檔案</b><br>① 行程／報價原始檔<br>② <strong>'+exactTemplate+'</strong>';
    if(items[1])items[1].innerHTML='<b>固定輸出</b><br>只產出「純文字版」WORD＋PDF，不做有圖版、不做大圖版。';
    if(items[2])items[2].remove();
    strip.style.gridTemplateColumns='repeat(2,minmax(0,1fr))';
  }

  function tidyPlatform(card,kind){
    if(!card)return;
    var boxes=card.querySelectorAll('.platform-box');

    /* ① 專案設定：保留學生需要的設定與下載檔 */
    boxes.forEach(function(box){
      var h=box.querySelector('h4');
      if(!h)return;
      if(h.textContent.indexOf('① 專案設定')===0){
        var settingFile=kind==='claude'?'可樂旅遊_Claude專案設定_v2.txt':'可樂旅遊_ChatGPT專案設定_v2.txt';
        box.innerHTML='<h4>① 專案設定</h4>'+ 
          '<p><b>專案名稱：</b>可樂旅遊｜團體報價單產出</p>'+ 
          '<p><b>'+(kind==='claude'?'Project Knowledge':'資料來源')+'：</b></p>'+ 
          '<ul><li>可樂旅遊_AI報價單產出指令_v3.txt</li><li>可樂旅遊團體報價單PDF底圖範本.pdf <small>（可選，視覺對照）</small></li></ul>'+ 
          '<div class="file-links"><a href="files/'+settingFile+'" target="_blank">下載完整設定 TXT</a><a href="files/可樂旅遊_AI報價單產出指令_v3.txt" target="_blank">下載共用 AI 規範</a></div>';
      }
    });

    /* ② AI 指令：畫面內容固定只出純文字版 */
    card.querySelectorAll('pre').forEach(function(pre){
      var text=pre.textContent
        .replace(/可樂旅遊團體報價單\s*WORD\s*底圖範本\s*\.docx/g,exactTemplate)
        .replace(/WORD\s*底圖範本\s*\.docx/g,exactTemplate)
        .replace(/原始檔可用景點照片\s*≥\s*3\s*張：產出「純文字版＋大圖版」。\s*可用景點照片\s*<\s*3\s*張：只產出「純文字版」。/g,'固定只產出「純文字版」WORD 與 PDF，不製作有圖版或大圖版。')
        .replace(/可用景點照片\s*≥\s*3\s*張[\s\S]*?只產出「純文字版」。/g,'固定只產出「純文字版」WORD 與 PDF，不製作有圖版或大圖版。');
      pre.textContent=text;
    });

    /* 移除僅供維護者看的說明字樣 */
    card.querySelectorAll('p,li,span').forEach(function(el){
      var t=(el.textContent||'').trim();
      if(t.indexOf('不要放：AI 生圖與 DM 指令')===0 || t.indexOf('那是另一個專案')>-1){
        el.remove();
      }
    });
  }

  tidyPlatform(project.querySelector('.platform-card.chatgpt'),'chatgpt');
  tidyPlatform(project.querySelector('.platform-card.claude'),'claude');

  /* ③ 每次怎麼用：只強調要上傳的兩個完整檔名，不再把口令當主角 */
  project.querySelectorAll('.platform-card .quick-use').forEach(function(box){
    box.innerHTML='<b>③ 每次怎麼用</b><br>'+ 
      '<b>每次上傳這 2 個檔案：</b><br>'+ 
      '① 行程／報價原始檔（DOC／DOCX／PDF）<br>'+ 
      '② <strong>'+exactTemplate+'</strong>';
  });

  var intro=project.querySelector('.project-intro p');
  if(intro)intro.textContent='設定一次，以後每一團只要上傳「行程／報價原始檔」＋「'+exactTemplate+'」，即可直接產出純文字版 WORD＋PDF。';
})();