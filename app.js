const data=window.COURSE_DATA;
let deck="core",index=0;
let completed=JSON.parse(localStorage.getItem("ai-full-completed")||"{}");
const labels={core:"正式課程",extended:"完整延伸"};
const jokes=["如果 AI 把團費少打一個零，客人會不會突然覺得你是全公司最棒的業務？","你有沒有對 AI 說過「幫我漂亮一點」，然後它漂亮到連價格都不見了？","AI 最危險的時候不是答錯，是答錯還排版得很像真的。","如果 Prompt 只寫「幫我整理」，AI 會整理內容，還是整理你的耐心？","同一份資料丟給三個 AI，算比較工具，還是辦 AI 選秀？","如果三個 AI 都說自己最強，你信誰？先都不要信，只看誰把工作做完。","只做一張成交賀圖，要開 Chat 還是 Work？殺雞先不用出動整個專案團隊。","AI 說已完成下載檔，結果沒有檔案——這算完成，還是語言藝術？"];
const $=id=>document.getElementById(id);
function rows(){return data[deck]}
function sections(){return [...new Set(rows().map(x=>x.section))]}
function titleOf(row){return row.content.find(x=>x.length>4&&!/^\d+$/.test(x))||("第 "+row.n+" 頁")}
function bodyOf(row){const title=titleOf(row);let used=false;return row.content.filter(x=>{if(!used&&x===title){used=true;return false}return !/^\d+$/.test(x)})}
function isPrompt(t){return t.length>55||/請讀取|可直接複製|請將|請根據|請依/.test(t)}
function key(){return deck+"-"+rows()[index].n}
function renderNav(){
 const counts={};rows().forEach(x=>counts[x.section]=(counts[x.section]||0)+1);
 $("sectionNav").innerHTML=sections().map(s=>'<button data-section="'+s+'"><span>'+s+'</span><small>'+counts[s]+'</small></button>').join("");
 document.querySelectorAll("[data-section]").forEach(b=>b.onclick=()=>{index=rows().findIndex(x=>x.section===b.dataset.section);render()});
}
function render(){
 const row=rows()[index],body=bodyOf(row),title=titleOf(row);
 $("deckLabel").textContent=labels[deck];$("pageLabel").textContent=String(row.n).padStart(2,"0")+" / "+rows().length;
 $("sectionLabel").textContent=row.section;$("slideNo").textContent="SLIDE "+String(row.n).padStart(3,"0");
 let lead=body.shift()||"";
 let html="<h1>"+title+"</h1>"+(lead?'<p class="lead">'+lead+"</p>":"");
 if(body.length)html+='<div class="content-list">'+body.map(t=>isPrompt(t)?'<div class="copy-row"><p>'+t+'</p><button data-copy="'+encodeURIComponent(t)+'">複製</button></div>':'<div class="content-item">'+t+"</div>").join("")+"</div>";
 $("lessonContent").innerHTML=html;
 document.querySelectorAll("[data-copy]").forEach(b=>b.onclick=async()=>{await navigator.clipboard.writeText(decodeURIComponent(b.dataset.copy));b.textContent="已複製";setTimeout(()=>b.textContent="複製",1200)});
 $("notesContent").innerHTML=row.notes.length?row.notes.map(x=>"<p>"+x+"</p>").join(""):"<p>本頁沒有額外講師備註。</p>";
 $("sourcesContent").innerHTML=row.sources.length?row.sources.map(x=>"<p>"+(x.startsWith("http")?'<a href="'+x+'" target="_blank">'+x+"</a>":x)+"</p>").join(""):"<p>本頁內容來自使用者提供的課程規劃與教材。</p>";
 $("speakerNotes").hidden=!$("instructorMode").checked;
 $("prevBtn").disabled=index===0;$("nextBtn").disabled=index===rows().length-1;
 const done=!!completed[key()];$("completeBtn").classList.toggle("done",done);$("completeBtn").textContent=done?"✓ 已完成":"標記完成";
 const n=Object.keys(completed).filter(k=>k.startsWith(deck+"-")&&completed[k]).length,p=Math.round(n/rows().length*100);
 $("progressText").textContent=p+"%";$("progressBar").style.width=p+"%";
 document.querySelectorAll("[data-section]").forEach(b=>b.classList.toggle("active",b.dataset.section===row.section));
 history.replaceState(null,"","#"+deck+"-"+row.n);
}
function selectDeck(d,n=0){deck=d;index=Math.max(0,Math.min(n,data[d].length-1));document.querySelectorAll("[data-deck]").forEach(b=>b.classList.toggle("active",b.dataset.deck===deck));renderNav();render()}
document.querySelectorAll("[data-deck]").forEach(b=>b.onclick=()=>selectDeck(b.dataset.deck));
$("prevBtn").onclick=()=>{if(index>0){index--;render();scrollTo({top:$("reader").offsetTop-70,behavior:"smooth"})}};
$("nextBtn").onclick=()=>{if(index<rows().length-1){index++;render();scrollTo({top:$("reader").offsetTop-70,behavior:"smooth"})}};
$("completeBtn").onclick=()=>{completed[key()]=!completed[key()];localStorage.setItem("ai-full-completed",JSON.stringify(completed));render()};
$("instructorMode").onchange=render;
$("searchBtn").onclick=()=>{$("searchDialog").showModal();$("searchInput").focus()};
$("searchInput").oninput=e=>{
 const q=e.target.value.trim().toLowerCase();if(!q){$("searchResults").innerHTML="";return}
 const all=[...data.core.map(x=>Object.assign({},x,{deck:"core"})),...data.extended.map(x=>Object.assign({},x,{deck:"extended"}))];
 const hit=all.filter(x=>(x.content.join(" ")+x.notes.join(" ")).toLowerCase().includes(q)).slice(0,60);
 $("searchResults").innerHTML=hit.map(x=>'<button class="result" data-go="'+x.deck+"-"+x.n+'"><b>'+titleOf(x)+"</b><span>"+labels[x.deck]+"｜"+x.section+"｜第 "+x.n+" 頁</span></button>").join("")||"<p>找不到符合內容。</p>";
 document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{const a=b.dataset.go.split("-");$("searchDialog").close();selectDeck(a[0],Number(a[1])-1);$("reader").scrollIntoView()});
};
$("outlineBtn").onclick=()=>{$("outlineTitle").textContent=labels[deck]+"｜所有頁面";$("outlineGrid").innerHTML=rows().map((x,i)=>'<button class="outline-item" data-i="'+i+'"><b>'+String(x.n).padStart(3,"0")+"　"+titleOf(x)+"</b><span>"+x.section+"</span></button>").join("");document.querySelectorAll("[data-i]").forEach(b=>b.onclick=()=>{$("outlineDialog").close();index=Number(b.dataset.i);render()});$("outlineDialog").showModal()};
function draw(){$("randomQuestion").textContent=jokes[Math.floor(Math.random()*jokes.length)]}
$("randomBtn").onclick=()=>{draw();$("randomDialog").showModal()};$("drawAgain").onclick=draw;
document.addEventListener("keydown",e=>{if(document.querySelector("dialog[open]"))return;if(e.key==="ArrowRight")$("nextBtn").click();if(e.key==="ArrowLeft")$("prevBtn").click()});
const introStyle=document.createElement("link");introStyle.rel="stylesheet";introStyle.href="intro.css?v=1";document.head.appendChild(introStyle);
const intro=document.createElement("section");intro.className="practical-intro";intro.innerHTML='<div class="intro-title"><span class="eyebrow dark">開場 15–20 分鐘｜只講工作判斷</span><h2>先把 AI 當成一位需要交辦與驗收的新同事</h2><p>不背理論、不考英文；直接用一份旅遊報價，看什麼能交、什麼不能放手。</p></div><div class="intro-grid"><article><b>01｜怎麼把工作交出去</b><h3>4D 其實就是四個動作</h3><ol><li><strong>交辦：</strong>整理哪份案件？</li><li><strong>說清楚：</strong>給誰看、看完要做什麼？</li><li><strong>判斷：</strong>哪些資料絕對不能改？</li><li><strong>查核：</strong>完成後怎麼逐項驗收？</li></ol><button class="question">只說「幫我漂亮一點」，做錯算誰的？</button></article><article><b>02｜為什麼有時讓人吐血</b><h3>AI 的四個工作特性</h3><ul><li>很會接話，不確定也可能回答得很順</li><li>很吃原始資料，混亂的 Word 不會自動變正確</li><li>同一句話可能有不同結果，正式案件要固定指令</li><li>很會模仿，但不負責最後放行</li></ul><button class="question">最危險不是答錯，是答錯還排得像真的。</button></article><article class="traffic"><b>03｜哪些可以交，哪些不能放手</b><h3>業務版紅綠燈</h3><p class="green"><strong>綠燈</strong>抽欄位、整理行程、Email 初稿</p><p class="yellow"><strong>黃燈</strong>需求摘要、圖片、包含／不包含</p><p class="red"><strong>紅燈</strong>價格、日期、航班、條款、個資、最終寄出</p><button class="question">團費少打一個零，最後誰要道歉？</button></article><article><b>04｜三分鐘現場小測驗</b><h3>把模糊指令改成可交辦</h3><blockquote>「幫我把這份日本團報價整理漂亮一點。」</blockquote><p>請學員找出缺少的五件事：讀者、目的、不可改資料、輸出格式、檢查標準。</p><button class="copy-intro">複製改寫後指令</button></article></div>';document.querySelector(".reader").before(intro);
intro.querySelector(".copy-intro").onclick=async e=>{await navigator.clipboard.writeText("請讀取附件，整理成客戶可閱讀的旅遊報價。報價放在前段，承辦資訊緊接其後，再整理航班與每日行程。價格、日期、航班、飯店、餐食、包含／不包含及取消條款不得自行改動；資料矛盾時先列出並詢問。第一輪只製作適合手機及 A4 閱讀的 HTML。");e.target.textContent="已複製 ✓";setTimeout(()=>e.target.textContent="複製改寫後指令",1200)};
const forms=document.createElement("section");forms.className="forms-section";forms.innerHTML='<div><span class="eyebrow dark">最後一定要完成</span><h2>課後測驗與回饋問卷</h2><p>課程最後預留 8–10 分鐘：先完成 11 題課後測驗，再填寫回饋與下一步行動。</p></div><div class="form-grid"><article><span>01</span><h3>課後測驗</h3><p>確認固定事實、Chat／Work、Word→PDF→Email 與交付檢查是否真的會做。</p><b>11 題｜每題 1 分</b><small>正式連結建立後會放在這裡</small></article><article><span>02</span><h3>課後回饋與行動問卷</h3><p>比較課前／課後能力，回收作品完成度、課程回饋及下週要實際套用的文件。</p><b>約 3–5 分鐘</b><small>正式連結建立後會放在這裡</small></article></div>';document.querySelector(".toolkit").after(forms);
const promptHub=document.createElement("a");promptHub.href="prompts/";promptHub.innerHTML="<b>學生指令大全</b><span>22 組指令＋句型＋圖片風格</span>";document.querySelector(".tool-grid").prepend(promptHub);
const hash=location.hash.slice(1).match(/^(core|extended)-(\d+)$/);selectDeck(hash?hash[1]:"core",hash?Number(hash[2])-1:0);
