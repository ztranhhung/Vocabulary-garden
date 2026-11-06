saveQueue=syncProgress().catch(()=>{$('saveStatus').textContent='Chưa tải được tiến độ. Bạn vẫn có thể luyện tập.';});
function wordImage(w,size=320){
  const id = Number.isInteger(Number(w.id)) ? Number(w.id) : unique.findIndex(x=>x.en===w.en);
  const src = w.image_url || `./img/word-${id}.webp`;
  return `<img src="${src}" alt="Minh họa: ${w.vi}" loading="lazy" width="320" height="320">`;
}
let visibleWords=12;
const libraryCategory=$('libraryCategory');
categories.forEach(c=>{const option=document.createElement('option');option.value=c;option.textContent=c;libraryCategory.appendChild(option)});
function renderLibrary(){const term=$('wordSearch').value.trim().toLocaleLowerCase('vi');const matches=unique.filter(w=>(libraryCategory.value==='all'||w.category===libraryCategory.value)&&(!term||`${w.en} ${w.vi}`.toLocaleLowerCase('vi').includes(term)));$('libraryCount').textContent=matches.length+' từ để khám phá';$('wordGrid').innerHTML='';matches.slice(0,visibleWords).forEach(w=>{const card=document.createElement('article');card.className='word-card';card.innerHTML=`<div class="word-picture">${wordImage(w)}<span class="ai-label">AI</span></div><div class="word-info"><div><span class="word-topic">${w.category}</span><h3>${w.en}</h3><p>${w.vi}</p></div><button class="sound-button" aria-label="Nghe phát âm ${w.en}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M11 5 6 9H3v6l5 4V5Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg></button></div>`;card.querySelector('button').onclick=()=>speak(w.en);$('wordGrid').appendChild(card)});if(!matches.length)$('wordGrid').innerHTML='<p class="empty">Chưa tìm thấy từ này. Thử một từ hoặc chủ đề khác nhé.</p>';$('loadMore').classList.toggle('hidden',matches.length<=visibleWords);}
$('wordSearch').oninput=()=>{visibleWords=12;renderLibrary()};libraryCategory.onchange=()=>{visibleWords=12;renderLibrary()};$('loadMore').onclick=()=>{visibleWords+=12;renderLibrary()};renderLibrary();

document.querySelectorAll(".site-header nav a").forEach(link=>link.addEventListener("click",()=>goHome()));
