(function(){
  function copyText(value,button){
    function done(){
      var original=button.textContent;
      button.textContent='已複製 ✓';
      button.classList.add('done');
      setTimeout(function(){
        button.textContent=original;
        button.classList.remove('done');
      },1400);
    }

    function fallback(){
      var textarea=document.createElement('textarea');
      textarea.value=value;
      document.body.appendChild(textarea);
      textarea.select();
      try{document.execCommand('copy')}catch(error){}
      textarea.remove();
      done();
    }

    if(navigator.clipboard&&window.isSecureContext){
      navigator.clipboard.writeText(value).then(done).catch(fallback);
    }else{
      fallback();
    }
  }

  var singlePrompt=String.raw`請生成一張可直接作為 PowerPoint 或 Google Slides 背景的高質感「無字旅遊美圖」。

【本次資料】
用途：[請填寫：提案封面／行程介紹／景點介紹／客戶簡報]
目的地或主題：[請填寫]
主要畫面：[請填寫：希望出現的景色、人物或旅遊情境]
投影片比例：[請填寫：16：9 新版寬螢幕／4：3 舊版簡報]
文字預計放在：[請填寫：左側／右側]
預計使用文字顏色：[請填寫：白色／深色]
視覺風格：[請填寫：從本頁「旅遊提案與 DM 風格選單」選一種]

【風格參考】
如果本訊息有上傳課程簡報截圖或其他參考圖片，只參考其中的攝影質感、色彩、光線、畫面氛圍、構圖與留白方式；不要複製參考圖中的文字、Logo、人物或版面內容。

如果選用的課程風格原本包含郵票、印章、票券、地圖、航線或其他排版裝飾，這張無字底圖只取用它的色調、攝影感與旅行氛圍，不要生成文字、圖示或版面元件。

【構圖與留白】
這是一張供後續加字使用的無字背景圖，不是已完成排版的海報、DM、資訊圖表或簡報頁面。

請依照指定比例重新構圖，不要先生成其他比例再裁切。16：9 與 4：3 必須分開生成。

文字放左側時，將主要景物與人物集中在右側；文字放右側時，將主要景物與人物集中在左側。保留約 40% 畫面作為完整、連續的文字安全區，其餘約 60% 安排主要景物。

文字安全區必須明暗均勻、紋理單純、細節較少，不得被人物、建築主體、樹枝、裝飾物或強烈光影穿過。留白請利用天空、海面、霧氣、遠景、牆面、草原、雪地或淺景深自然形成，不要做成純白空白、人工文字框、色塊或半透明面板。

如果預計使用白色文字，文字安全區使用中深色、光線均勻的背景；如果預計使用深色文字，文字安全區使用淺色、乾淨、光線均勻的背景。

主要人物或景物不要置中，也不要填滿整個畫面。重要內容不得貼近邊緣，四周保留投影片裁切安全範圍。

【畫面品質】
使用真實旅遊攝影質感，光線自然、細節真實、具有空氣感與景深。色彩高級但不過度飽和，避免廉價促銷圖、制式圖庫照、卡通、扁平插畫、3D 渲染、幾何山形或拼貼風格。

如果畫面出現旅客，使用自然放鬆的成年亞洲旅客，服裝符合目的地、季節與旅遊情境，不要面對鏡頭刻意擺拍，也不要模仿可辨識的真實人物。

【嚴格限制】
不要生成任何中文、英文、數字、標點、Logo、商標、水印、網址、電話、招牌文字或假資訊。
不要生成標題、文字框、按鈕、圖示、線條、色塊或簡報模板元素。
不得出現錯誤國家、錯誤地標、錯誤季節，或不符合目的地的建築、服飾與文化元素。
不要自行增加我沒有提供的景點、人物或活動。

資料填寫完整後，請直接生成 1 張圖片，不要再重問是否生成。`;

  var projectPrompt=String.raw`你是我的「旅遊簡報無字美圖設計助手」。

本專案只負責生成可放入 PowerPoint 或 Google Slides，並供使用者後續自行加字的無字旅遊背景圖。不要生成已完成排版的簡報、海報、DM 或資訊圖表。

一、每次任務需要的資料

每次依照使用者當次提供的以下資料工作：

用途：提案封面／行程介紹／景點介紹／客戶簡報／其他
目的地或主題
主要畫面
投影片比例：16：9 新版寬螢幕／4：3 舊版簡報
文字位置：左側／右側
預計文字顏色：白色／深色
視覺風格

如果缺少「投影片比例」，先只詢問要使用 16：9 或 4：3，不得自行決定，也不得生成正方形或直式圖片。

如果目的地或主題不足以判斷畫面，才詢問必要資訊。其他不影響主要結果的小細節，可依合理方式完成，不要反覆提問。

資料足夠後直接生成 1 張圖片，不要再詢問是否開始。

二、資料隔離

每次只使用目前這次任務最新提供的目的地、比例、構圖與風格，不得沿用其他案件的國家、景點、人物、季節或比例。

如果使用者的新指示與前一版不同，以最新明確指示為準。

三、風格參考

如果使用者在當次訊息上傳課程簡報截圖或其他參考圖片，只參考其中的攝影質感、色彩、光線、畫面氛圍、構圖與留白方式；不得複製參考圖中的文字、Logo、人物、景點內容或版面資訊。

如果使用者指定課程既有風格，依指定名稱執行。可使用的課程風格包括：

精品旅遊雜誌風、國際旅遊型錄風、企業獎勵旅遊提案風、航空旅誌風、北歐極簡風、現代編輯設計 Editorial 風、度假村型錄風、城市生活誌風、目的地文化藝術風、美食旅誌風、自然紀實風、精品戶外探險風、日系生活雜誌風、復古日系底片風、電影旅行誌風、攝影書／Photo Book 風、郵票／旅行手帳風、護照蓋章旅行風、公路旅行 Road Trip 風、航海探索風。

如果選用的風格原本包含郵票、印章、票券、地圖、航線或其他排版裝飾，本專案只取用它的色調、攝影感與旅行氛圍，不得生成文字、圖示或版面元件。

如果沒有指定風格，依目的地、季節、用途與客戶情境，從上述方向選擇最合適的一種，不必再詢問。每張圖只使用一種主要風格，不混搭不相關的視覺方向。

四、比例規則

只接受以下兩種簡報比例：

16：9：新版寬螢幕簡報。
4：3：舊版簡報。

16：9 與 4：3 必須依最終尺寸分開構圖、分開生成，不得用同一張圖片硬裁、延伸或拉伸成另一種比例。

五、構圖與文字安全區

先決定文字位置，再把主要景物安排到相反方向：

文字放左側：主要景物與人物集中在右側。
文字放右側：主要景物與人物集中在左側。

保留約 40% 畫面作為完整、連續的文字安全區，其餘約 60% 安排主要景物。

文字安全區必須：

1. 明暗均勻。
2. 紋理單純、細節較少。
3. 不被人物、建築主體、樹枝、裝飾物或強烈光影穿過。
4. 可清楚放置標題、副標及 3～5 行說明文字。

留白必須利用天空、海面、霧氣、遠景、牆面、草原、雪地或淺景深自然形成，不得做成純白空白、人工文字框、色塊、半透明面板或簡報模板。

預計使用白色文字時，文字安全區使用中深色、光線均勻的背景；預計使用深色文字時，文字安全區使用淺色、乾淨、光線均勻的背景。

主要人物或景物不要置中，不要填滿整個畫面。重要內容不得貼近邊緣，四周保留投影片裁切安全範圍。

六、畫面品質

使用真實旅遊攝影質感，光線自然、細節真實、具有空氣感與景深。色彩高級但不過度飽和，避免廉價促銷圖與制式圖庫照。

如果畫面出現旅客，使用自然放鬆的成年亞洲旅客，服裝符合目的地、季節與旅遊情境，不要面對鏡頭刻意擺拍，也不要模仿可辨識的真實人物。

同一份簡報需要多張背景圖時，維持一致的主要風格、色調、光線與攝影質感，但依各頁主題更換景物與構圖。除非使用者明確要求，不得在同一份簡報中混用不同風格。

七、嚴格限制

不要生成任何中文、英文、數字、標點、Logo、商標、水印、網址、電話、招牌文字或假資訊。
不要生成標題、文字框、按鈕、圖示、線條、色塊或簡報模板元素。
不要使用卡通、扁平插畫、3D 渲染、幾何山形或拼貼風格。
不得出現錯誤國家、錯誤地標、錯誤季節，或不符合目的地的建築、服飾與文化元素。
不得自行增加使用者沒有提供的景點、人物或活動。

八、修改規則

如果使用者指出局部問題，只修改指定位置，其他已確認的景物、構圖、比例、色調與風格保持原樣，不要把整張圖重新設計。

如果使用者只要求改比例，必須依新比例重新構圖，不能拉伸或直接裁掉重要景物與文字安全區。

九、完成前檢查

生成前確認：

1. 比例是否為使用者指定的 16：9 或 4：3。
2. 主要景物是否在文字位置的相反方向。
3. 文字安全區是否完整、低細節且明暗均勻。
4. 畫面是否符合指定目的地、季節與風格。
5. 是否完全沒有文字、數字、Logo、商標、水印及假資訊。
6. 人物、手指、建築與地標是否自然合理。

確認後直接生成圖片。`;

  var image=document.getElementById('image');
  if(image&&!document.getElementById('slide-background-single')){
    var imageCards=image.querySelector('.cards');
    if(imageCards){
      var guide=document.querySelector('.travel-style-guide');
      if(guide&&!guide.id)guide.id='travel-style-guide';

      var single=document.createElement('article');
      single.id='slide-background-single';
      single.className='prompt-card';
      single.dataset.id='SLIDE_BG_SINGLE';
      single.dataset.search='簡報 無字 美圖 底圖 背景 16：9 4：3 新版 舊版 留白 文字安全區 PowerPoint Google Slides';
      single.innerHTML=`
        <div class="card-top"><span class="code">簡報</span><div><h3>簡報無字美圖｜直接生底圖</h3><p>單次使用：選好 16：9 或 4：3，再指定風格與留白位置</p></div></div>
        <div class="example-label"><b>先選比例</b><span>16：9 與 4：3 要分開生成，不要用同一張圖硬裁</span></div>
        <div class="copy-block">
          <div class="long-actions"><button class="copy slide-single-copy" data-label="一鍵複製底圖指令">一鍵複製底圖指令</button><span>把 [請填寫] 換成本次需求即可使用</span></div>
          <details class="long-prompt"><summary>展開完整指令 <small>${singlePrompt.length.toLocaleString('zh-TW')} 字元</small></summary><pre class="slide-single-pre"></pre></details>
        </div>
        <div class="quick-use"><b>風格怎麼選？</b><br>可到本頁「<a href="#travel-style-guide">旅遊提案與 DM 風格選單</a>」挑一種；有課程範例截圖時，也可以和指令一起上傳。</div>
        <div class="card-foot check-only"><span><b>用完檢查：</b>比例正確、留白沒有被景物穿過、圖片內完全無字</span></div>`;
      single.querySelector('.slide-single-pre').textContent=singlePrompt;
      single.querySelector('.slide-single-copy').addEventListener('click',function(event){
        event.stopPropagation();
        copyText(singlePrompt,this);
      });

      var fun=imageCards.querySelector('.fun-subhead');
      imageCards.insertBefore(single,fun||null);
    }
  }

  var project=document.getElementById('project');
  if(project&&!document.getElementById('slide-background-project')){
    var projectHead=project.querySelector('.section-head p');
    if(projectHead)projectHead.textContent='把固定規則放進專案；圖片與文件各自建立，不要混在同一個專案。';

    var projectCards=project.querySelector('.cards');
    if(projectCards){
      var first=projectCards.firstChild;

      var imageSubhead=document.createElement('div');
      imageSubhead.className='cards-subhead';
      imageSubhead.innerHTML='<h3>圖片專案</h3><p>建立一次，以後只要換目的地、比例、文字位置與風格。</p>';

      var projectCard=document.createElement('article');
      projectCard.id='slide-background-project';
      projectCard.className='prompt-card platform-card chatgpt';
      projectCard.dataset.search='簡報 無字 美圖 Project 專案 建置 指令 16：9 4：3 PowerPoint Google Slides 留白';
      projectCard.innerHTML=`
        <div class="card-top"><span class="code">Project</span><div><h3>簡報無字美圖｜Project 建置指令</h3><p>適合經常製作簡報底圖；固定規則只貼一次</p></div></div>
        <div class="platform-grid">
          <div class="platform-box">
            <h4>① 專案設定</h4>
            <p><b>專案名稱：</b>可樂旅遊｜簡報無字美圖</p>
            <p><b>專案資料可放：</b></p>
            <ul><li>課程中的風格參考截圖</li><li>已確認可沿用的簡報視覺範例</li></ul>
            <p><b>不要放：</b>客戶個資、未公開價格、其他案件資料或需要逐案更換的內容。</p>
          </div>
          <div class="platform-box">
            <h4>② 專案指令</h4>
            <p>將下方完整內容貼進 Project 的「指示」欄位。</p>
            <button class="copy slide-project-copy" data-label="一鍵複製專案指令">一鍵複製專案指令</button>
            <details class="custom-prompt"><summary>展開查看 <small>${projectPrompt.length.toLocaleString('zh-TW')} 字元</small></summary><pre class="slide-project-pre"></pre></details>
          </div>
        </div>
        <div class="quick-use"><b>③ 每次怎麼用</b><br><code>目的地：日本京都｜比例：16：9｜文字放左側、使用白字｜風格：日系生活雜誌風｜主畫面：秋季寺院與自然旅行氛圍。請直接生成。</code></div>`;
      projectCard.querySelector('.slide-project-pre').textContent=projectPrompt;
      projectCard.querySelector('.slide-project-copy').addEventListener('click',function(event){
        event.stopPropagation();
        copyText(projectPrompt,this);
      });

      var documentSubhead=document.createElement('div');
      documentSubhead.className='cards-subhead';
      documentSubhead.innerHTML='<h3>報價與行程文件專案</h3><p>以下專案處理 WORD 與 PDF，不與圖片生成規則混用。</p>';

      projectCards.insertBefore(imageSubhead,first);
      projectCards.insertBefore(projectCard,first);
      projectCards.insertBefore(documentSubhead,first);
    }
  }
})();
