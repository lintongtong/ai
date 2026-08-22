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
const hash=location.hash.slice(1).match(/^(core|extended)-(\d+)$/);selectDeck(hash?hash[1]:"core",hash?Number(hash[2])-1:0);
