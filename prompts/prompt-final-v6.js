(function(){
  /* 02｜翻譯固定為繁體中文（台灣用語） */
  var daily=document.getElementById('daily');
  if(daily){
    var trans=daily.querySelector('[data-id="GEN_TRANSLATE"]');
    if(trans){
      trans.dataset.search='檔案翻譯 繁體中文 台灣用語 台灣常用語 保留格式 數字 專有名詞';
      var th=trans.querySelector('h3'); if(th)th.textContent='檔案翻譯｜繁體中文・台灣用語';
      var tp=trans.querySelector('.card-top p'); if(tp)tp.textContent='簡體中文、外文資料、行程與說明文件都可用';
      var tpre=trans.querySelector('pre');
      if(tpre)tpre.textContent='請將我提供的內容翻譯成繁體中文，使用台灣常用語與自然書面用語。\n保留原本標題、段落、表格與條列結構；日期、時間、金額、航班編號、飯店名、地址、網址與專有名詞不得自行改寫。\n旅行業相關名詞優先使用台灣常用說法；不確定的專有名詞保留原文並標示「待確認」，不要猜譯。';
    }

    /* 換工具續跑改成通用，不再依賴已刪除的兩張表／HTML流程 */
    var b9=daily.querySelector('[data-id="B9"]');
    if(b9){
      b9.dataset.search='換工具 換對話 續跑 額度用完 接續工作 已確認資料';
      var h=b9.querySelector('h3'); if(h)h.textContent='換工具／換對話續跑';
      var p=b9.querySelector('.card-top p'); if(p)p.textContent='額度用完或需要換 AI 時';
      var pre=b9.querySelector('pre');
      if(pre)pre.textContent='這是上一個 AI 已完成並由我確認過的內容：\n\n[請填寫：貼上已確認資料、成果摘要或必要內容]\n\n現在請從這裡接續完成：\n[請填寫：這次唯一要做的工作]\n\n只以我上面提供的已確認內容為準，不得引用其他案件或自行補資料。價格、日期、航班、飯店、餐食、景點與條款如未提供，不得推測。';
      var foot=b9.querySelector('.card-foot span'); if(foot)foot.innerHTML='<b>用完檢查：</b>只帶已確認內容，不必把整段舊對話全部搬過去';
    }

    /* 自己拼指令：輸出格式不要再把 HTML 當預設答案 */
    daily.querySelectorAll('details.parts .part').forEach(function(part){
      var b=part.querySelector('b');
      if(b&&b.textContent.indexOf('⑤ 輸出格式')===0){
        var d=part.querySelector('div');
        if(d)d.textContent='表格呈現／條列整理／Email／主管摘要／每點 25 字內／全文 200 字內／直式適合 LINE／需要檔案時直接建立可檢視成果';
      }
    });
  }

  /* 03｜名稱更直覺 */
  var image=document.getElementById('image');
  if(image){
    var c1=image.querySelector('[data-id="C1"]');
    if(c1){var h1=c1.querySelector('h3');if(h1)h1.textContent='賀成交圖｜已建專案';var p1=c1.querySelector('.card-top p');if(p1)p1.textContent='只貼當次五項成交資料，最快開始';}
    var c2=image.querySelector('[data-id="C2"]');
    if(c2){var h2=c2.querySelector('h3');if(h2)h2.textContent='賀成交圖｜沒有專案也能用';var p2=c2.querySelector('.card-top p');if(p2)p2.textContent='第一次試用或臨時生成，直接貼完整指令';}
  }

  /* 04｜移除已失去用途的中間 HTML 步驟 */
  var doc=document.getElementById('document');
  if(doc){
    ['B3','B4'].forEach(function(id){var el=doc.querySelector('[data-id="'+id+'"]');if(el)el.remove()});
    var sp=doc.querySelector('.section-head p');
    if(sp)sp.textContent='單次出件：DM、Email 與寄出前檢核；讀檔、檢查、比較、翻譯請到 02，重複出件請到 05 建立專案。';

    var full=doc.querySelector('[data-id="DM_FULL"]');
    if(full){
      var fh=full.querySelector('h3');if(fh)fh.textContent='資料正確版｜完整旅遊 DM（網頁）';
      var fp=full.querySelector('.card-top p');if(fp)fp.textContent='從本次附件直接製作；文字與數字正確優先';
      var fpre=full.querySelector('pre');
      if(fpre)fpre.textContent='請直接讀取我這次上傳的報價單、行程表或官方行程資料，製作一份完整旅遊 DM，不需要先建立報價網頁或每日行程網頁。\n\n【資料規則】\n・只使用我本次提供的資料，不得自行新增、推測或更動價格、日期、航班、飯店、餐食、景點、條款與聯絡資訊。\n・若資料互相矛盾或關鍵欄位缺漏，先在對話中列出問題並停止製作，不把「待確認」寫進 DM。\n\n【內容】\n・第一部分：團名、目的地、天數、出發日期、航班、價格級距、行程亮點、包含／不包含、重要提醒及承辦業務。\n・後續頁面：依實際天數整理每日行程、餐食、住宿與必要提醒，不得刪減重要行程。\n\n【版面】\n・直式、適合手機與 LINE 閱讀；視覺依目的地、實際景點與出發季節設計。\n・這是「資料正確版」，文字與數字清楚優先，不使用 AI 全圖生成方式處理大量正式文字。\n・圖片只使用本次資料中可取得的圖片；沒有可用圖片時，以乾淨排版完成，不自行亂抓或生成不確定的景點照片。\n\n【交付】\n輸出為可直接開啟的單一網頁檔（HTML），並提供下載 PNG 與列印／另存 PDF 功能。完成後逐項核對價格、日期、航班、飯店、餐食與條款再交付。';
      var fc=full.querySelector('.code');if(fc)fc.textContent='01';
    }

    var one=doc.querySelector('[data-id="DM_ONE"]');
    if(one){
      var oh=one.querySelector('h3');if(oh)oh.textContent='資料正確版｜單張報價 DM（網頁）';
      var op=one.querySelector('.card-top p');if(op)op.textContent='只需要一張重點圖，快速傳給客戶';
      var opre=one.querySelector('pre');
      if(opre)opre.textContent='請直接讀取我這次上傳的報價單、行程表或官方行程資料，製作一張直式旅遊報價 DM。\n\n內容包含：團名、目的地、天數、出發日期、航班、價格級距、3～5 項行程亮點、重要提醒與承辦業務。\n\n只使用我本次提供的資料，不得自行新增、推測或更動價格、日期、航班、飯店、餐食、景點、條款與聯絡資訊。若資料矛盾或關鍵欄位缺漏，先在對話中詢問。\n\n版面適合手機與 LINE 閱讀，第一眼先看到團名、日期與價格；視覺依目的地、實際景點與出發季節設計。這是「資料正確版」，文字與數字清楚優先。\n\n輸出為可直接開啟的單一網頁檔（HTML），提供下載 PNG 與列印／另存 PDF 功能。完成後逐項核對固定資訊再交付。';
      var oc=one.querySelector('.code');if(oc)oc.textContent='02';
    }

    var email=doc.querySelector('[data-id="B6"]');if(email){var ec=email.querySelector('.code');if(ec)ec.textContent='03';}
    var check=doc.querySelector('[data-id="B8"]');if(check){var cc=check.querySelector('.code');if(cc)cc.textContent='04';}
  }

  /* 06｜避免再引用舊專案名稱與舊流程 */
  var help=document.getElementById('help');
  if(help){
    help.querySelectorAll('td').forEach(function(td){
      var t=td.textContent;
      if(t.indexOf('把「專案完整指令」貼在每次新對話')>-1){
        td.textContent='若目前找不到專案功能，可先在一般對話貼上同一份 AI 指令執行；下次使用時需重新貼一次。';
      }
    });
  }

  /* 全頁統一產品用語：聊天 → 對話 */
  var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:function(node){
    var p=node.parentNode;if(!p)return NodeFilter.FILTER_REJECT;
    var tag=p.nodeName;if(tag==='SCRIPT'||tag==='STYLE')return NodeFilter.FILTER_REJECT;
    return node.nodeValue.indexOf('聊天')>-1?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
  }});
  var nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(function(n){n.nodeValue=n.nodeValue.replace(/聊天/g,'對話')});
  document.querySelectorAll('[data-search]').forEach(function(el){if(el.dataset.search)el.dataset.search=el.dataset.search.replace(/聊天/g,'對話')});
})();