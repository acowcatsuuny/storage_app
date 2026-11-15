(()=>{'use strict';
const KEY='daily_pantry_wireframe_v1';const SHOP_KEY='daily_pantry_manual_shop_v1';const CAT_KEY='daily_pantry_custom_categories_v1';const LOC_KEY='daily_pantry_custom_locations_v1';const BASE_LOCATIONS=['浴室','廚房','冰箱','冷凍庫','客廳','臥室','書桌','儲物櫃','玄關'];const PEN_FIX_KEY='daily_pantry_pen_emoji_fix_v15';const BASE_CATEGORIES=['個人護理','食品飲料','清潔用品','文具用品','其他'];const $=id=>document.getElementById(id);const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const two=n=>String(n).padStart(2,'0');const shifted=d=>{const x=new Date();x.setDate(x.getDate()+d);return `${x.getFullYear()}-${two(x.getMonth()+1)}-${two(x.getDate())}`};
const APP_VERSION=document.documentElement.dataset.appVersion;
const EMOJI_OPTIONS=['📦','🧻','🪥','🧴','🧼','🧽','🧹','🧺','🧦','👕','👟','🛁','🥛','🍞','🍎','🍌','🥚','🍚','🍜','🥫','☕','💊','🩹','🖊️','🖋️','✏️','📚','🔋','💡','🐱','🐶','🦖'];
const EMOJI_BY_CATEGORY={'個人護理':'🧴','食品飲料':'🥛','清潔用品':'🧽','文具用品':'✏️','其他':'📦'};
const EMOJI_BY_ITEM=[['衛生紙','🧻'],['面紙','🧻'],['擦手紙','🧻'],['紙巾','🧻'],['牙刷','🪥'],['牙膏','🪥'],['洗面乳','🧴'],['洗髮','🧴'],['沐浴乳','🧴'],['肥皂','🧼'],['海綿','🧽'],['菜瓜布','🧽'],['牛奶','🥛'],['吐司','🍞'],['麵包','🍞'],['原子筆','🖊️'],['鋼珠筆','🖊️'],['中性筆','🖊️'],['簽字筆','🖊️'],['鋼筆','🖋️'],['鉛筆','✏️']];
function defaultEmoji(category,name=''){const match=EMOJI_BY_ITEM.find(([word])=>String(name).includes(word));return match?match[1]:(EMOJI_BY_CATEGORY[category]||'📦')}
function emojiOf(i){return i.emoji===undefined?defaultEmoji(i.category,i.name):String(i.emoji||'')}
function emojiHtml(i){const em=emojiOf(i);return em?`<span class="item-emoji" aria-hidden="true">${safe(em)}</span>`:''}
function setEmoji(value){$('itemEmoji').value=String(value||'');syncEmoji()}
function syncEmoji(){const e=$('itemEmoji').value.trim();$('emojiPreview').textContent=e||'—';$('emojiCurrentLabel').textContent=e?'目前選擇：'+e:'目前選擇：不使用';document.querySelectorAll('#emojiChoices [data-emoji]').forEach(b=>{const active=b.dataset.emoji===e;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active))})}
const demo=[{id:'a1',name:'洗面乳',qty:1,target:2,category:'個人護理',location:'浴室',expiry:'',price:180,barcode:'',url:'',favorite:true,photo:''},{id:'a2',name:'衛生紙',qty:5,target:2,category:'清潔用品',location:'儲物櫃',expiry:'',price:150,barcode:'',url:'',favorite:true,photo:''},{id:'a3',name:'牛奶',qty:2,target:1,category:'食品飲料',location:'冰箱',expiry:shifted(3),price:95,barcode:'',url:'',favorite:true,photo:''},{id:'a4',name:'原子筆',qty:3,target:1,category:'文具用品',location:'書桌',expiry:'',price:30,barcode:'',url:'',favorite:false,photo:''}];
function load(key, fallback){try{let s=localStorage.getItem(key);return s?JSON.parse(s):fallback}catch{return fallback}}
let stock=load(KEY,demo),shopping=load(SHOP_KEY,[]),customCategories=load(CAT_KEY,[]),customLocations=load(LOC_KEY,[]);
if(!Array.isArray(stock))stock=demo;
if(!Array.isArray(shopping))shopping=[];
if(!Array.isArray(customCategories))customCategories=[];
customCategories=[...new Set(customCategories.filter(c=>typeof c==='string').map(c=>c.trim()).filter(c=>c&&!BASE_CATEGORIES.includes(c)))];
if(!Array.isArray(customLocations))customLocations=[];
customLocations=[...new Set(customLocations.filter(c=>typeof c==='string').map(c=>c.trim()).filter(c=>c&&!BASE_LOCATIONS.includes(c)))];
// 修正早期版本把「原子筆」當成鉛筆的舊資料；僅執行一次，不覆蓋未來的手動選擇。
try{if(!localStorage.getItem(PEN_FIX_KEY)){
  stock.forEach(i=>{if(typeof i.name==='string'&&i.name.includes('原子筆')&&i.emoji==='✏️')i.emoji='🖊️'});
  localStorage.setItem(PEN_FIX_KEY,'1');localStorage.setItem(KEY,JSON.stringify(stock));
}}catch(e){};
function allCategories(){
  const found=stock.map(i=>i.category).filter(c=>typeof c==='string'&&c.trim());
  const list=[...new Set([...BASE_CATEGORIES.filter(c=>c!=='其他'),...customCategories,...found.filter(c=>c!=='其他'),'其他'])];
  return list;
}
function updateCategorySelect(wanted){
  const select=$('itemCategory');const value=wanted??select.value;
  select.innerHTML=allCategories().map(c=>`<option value="${safe(c)}">${safe(c)}</option>`).join('');
  if(value&&allCategories().includes(value))select.value=value;
}
function createCategory(){
  dialog('新增自訂分類',`<p>輸入新分類名稱，例如「寵物用品」、「保健用品」、「廚房用品」。</p><input id="newCategoryName" class="new-cat-input" maxlength="24" placeholder="請輸入分類名稱" aria-label="新分類名稱"><p class="hint">新增的分類會保存在此瀏覽器，並出現在分類選單與庫存篩選。</p>`,[
    {label:'取消',onClick:closeDialog},
    {label:'新增分類',className:'solid',onClick:()=>{
      const value=$('newCategoryName').value.trim().replace(/\s+/g,' ');
      if(!value){notify('請輸入分類名稱');return}
      if(allCategories().some(c=>c.toLocaleLowerCase()===value.toLocaleLowerCase())){notify('此分類已存在，請直接選擇');return}
      customCategories.push(value);
      try{localStorage.setItem(CAT_KEY,JSON.stringify(customCategories))}catch(e){notify('無法儲存分類，請確認瀏覽器儲存空間')}
      updateCategorySelect(value);suggestEmoji();closeDialog();render();notify('已新增分類「'+value+'」');
    }}]);
  $('newCategoryName').focus();
  $('newCategoryName').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('modalActions').lastElementChild.click()}});
}
function allLocations(){
  const found=stock.map(i=>i.location).filter(c=>typeof c==='string'&&c.trim());
  return [...new Set([...BASE_LOCATIONS,...customLocations,...found])];
}
function updateLocationSelect(wanted){
  const select=$('itemLocation');const value=wanted??select.value;
  select.innerHTML='<option value="">未設定位置</option>'+allLocations().map(c=>`<option value="${safe(c)}">${safe(c)}</option>`).join('');
  if(value&&allLocations().includes(value))select.value=value;
}
function updateLocationFilter(){
  const select=$('locationFilter');const value=select.value;
  select.innerHTML='<option value="全部">全部位置</option><option value="未設定">未設定位置</option>'+allLocations().map(c=>`<option value="${safe(c)}">${safe(c)}</option>`).join('');
  select.value=Array.from(select.options).some(o=>o.value===value)?value:'全部';
}
function createLocation(){
  dialog('新增收納位置',`<p>輸入新收納位置，例如「書桌抽屜」、「浴室鏡櫃」、「衣櫃第二層」。</p><input id="newLocationName" class="new-cat-input" maxlength="32" placeholder="請輸入收納位置名稱" aria-label="新收納位置名稱"><p class="hint">新增後會自動儲存在此瀏覽器，也可在庫存清單依位置篩選。</p>`,[
    {label:'取消',onClick:closeDialog},
    {label:'新增位置',className:'solid',onClick:()=>{
      const value=$('newLocationName').value.trim().replace(/\s+/g,' ');
      if(!value){notify('請輸入收納位置名稱');return}
      if(allLocations().some(c=>c.toLocaleLowerCase()===value.toLocaleLowerCase())){notify('此收納位置已存在，請直接選擇');return}
      customLocations.push(value);
      try{localStorage.setItem(LOC_KEY,JSON.stringify(customLocations))}catch(e){notify('無法儲存位置，請確認瀏覽器儲存空間')}
      updateLocationSelect(value);closeDialog();render();notify('已新增收納位置「'+value+'」');
    }}]);
  $('newLocationName').focus();
  $('newLocationName').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('modalActions').lastElementChild.click()}});
}
let page='home',filter='全部',statusFilter='',selected=null,editId=null,formPhoto='',toastHandle=null,scanState=null,lastPage='inventory',detailReturnPage='inventory',emojiTouched=false;
function suggestEmoji(){if(!emojiTouched)setEmoji(defaultEmoji($('itemCategory').value,$('itemName').value.trim()))}
function notify(msg){$('toast').textContent=msg;$('toast').classList.remove('hidden');clearTimeout(toastHandle);toastHandle=setTimeout(()=>$('toast').classList.add('hidden'),2700)}
function save(){try{localStorage.setItem(KEY,JSON.stringify(stock));localStorage.setItem(SHOP_KEY,JSON.stringify(shopping));localStorage.setItem(CAT_KEY,JSON.stringify(customCategories));localStorage.setItem(LOC_KEY,JSON.stringify(customLocations))}catch{notify('儲存空間不足，請先匯出備份或移除圖片')}render()}
function days(date){if(!date)return Infinity;const [y,m,d]=date.split('-').map(Number),t=new Date();return Math.round((new Date(y,m-1,d)-new Date(t.getFullYear(),t.getMonth(),t.getDate()))/86400000)}
const low=i=>Number(i.qty)<=Number(i.target),near=i=>days(i.expiry)<=7;
const expiredFood = item => item.category === '食品飲料' && days(item.expiry) < 0;
const needsRestock = item => low(item) || expiredFood(item);

function shoppingGroups() {
  const auto = stock.filter(needsRestock);
  const manual = shopping.filter(item => !auto.some(entry => entry.name === item.name));
  return { auto, manual };
}

function status(i){if(Number(i.qty)===0)return ['已用完','out'];if(days(i.expiry)<0)return ['已過期','expired'];if(low(i))return ['需要補貨','low'];if(near(i))return ['即將到期','low'];return ['庫存正常','']}
function get(id){return stock.find(i=>String(i.id)===String(id))}
function nav(destination){if(destination==='add'){editId=null;resetForm()}if(destination==='detail'&&!get(selected)){destination='inventory'}if(destination==='shop'&&page!=='shop')lastPage=page;page=destination;if(destination==='shop'){$('backFromShop').textContent='← 返回'+({home:'首頁',inventory:'庫存清單',detail:'物品資訊',backup:'資料備份'}[lastPage]||'首頁')};document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('show',s.id===destination+'Screen'));document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===destination));const titles={home:['重要物品','常用與即將需要補貨的物品，一眼掌握。'],inventory:['庫存清單','你擁有的日用品與剩餘數量。'],detail:['物品資訊','查看商品細節、更新數量與期限。'],add:[editId?'編輯物品':'新增物品','新增庫存資訊，從此不再忘記。'],shop:['購物清單','低庫存自動提醒，補貨更有效率。'],backup:['資料備份','保留資料，換裝置也能延續使用。']};$('pageTitle').textContent=titles[destination][0];$('pageSubtitle').textContent=titles[destination][1];render();window.scrollTo({top:0,behavior:'instant'})}
function row(i){const st=status(i);return `<article class="item ${Number(i.qty)===0?'is-out':low(i)?'is-low':''}"><div class="item-upper"><button class="favorite ${i.favorite?'on':''}" title="${i.favorite?'取消重要物品':'標為重要物品'}" aria-label="${i.favorite?'取消重要物品':'標為重要物品'}：${safe(i.name)}" data-action="favorite" data-id="${safe(i.id)}">${i.favorite?'★':'☆'}</button><div class="item-name"><div class="item-title">${emojiHtml(i)}${safe(i.name)}</div><div class="item-sub">${safe(i.category)} · ${safe(i.location||'未設定位置')}</div></div><button class="small-btn" data-action="detail" data-id="${safe(i.id)}">物品資訊 ›</button></div><div class="item-bottom"><span class="status ${st[1]}">${st[0]}${near(i)?' · '+(days(i.expiry)<0?'過期':'剩 '+days(i.expiry)+' 天'):''}</span><div class="qty-controls"><button data-action="minus" data-id="${safe(i.id)}" aria-label="減少 ${safe(i.name)} 數量" ${Number(i.qty)<=0?'disabled':''}>−</button><span>${Number(i.qty)}</span><button data-action="plus" data-id="${safe(i.id)}" aria-label="增加 ${safe(i.name)} 數量">＋</button></div></div><div class="link-row"><button class="small-btn" data-action="shop-item" data-id="${safe(i.id)}">＋ 加入購物清單</button></div></article>`}
function render(){
$('totalCount').textContent=stock.length;$('lowCount').textContent=stock.filter(needsRestock).length;$('soonCount').textContent=stock.filter(near).length;
const favorites=stock.filter(i=>i.favorite);$('favoriteItems').innerHTML=favorites.length?favorites.map(row).join(''):'<div class="empty"><div class="visual">☆</div>尚未標記重要物品。<br>到庫存清單點星號即可加入。</div>';
updateLocationFilter();const cats=['全部',...allCategories()];$('categoryFilters').innerHTML=cats.map(c=>`<button class="chip ${c===filter?'current':''}" data-filter="${c}">${c}</button>`).join('');const q=$('searchInput').value.trim().toLowerCase();let locFilter=$('locationFilter').value;let filtered=stock.filter(i=>(filter==='全部'||i.category===filter)&&(locFilter==='全部'||(locFilter==='未設定'?!i.location:i.location===locFilter))&&(!statusFilter||(statusFilter==='expiry'&&near(i)))&&[i.name,i.location,i.barcode].join(' ').toLowerCase().includes(q));$('statusFilterBadge').innerHTML=statusFilter==='expiry'?'<button class="chip current status-filter-badge" data-action="clear-status-filter">到期提醒 ✕</button>':'';$('inventoryItems').innerHTML=filtered.length?filtered.map(row).join(''):'<div class="empty"><div class="visual">📦</div>目前沒有符合條件的物品。</div>';
if(page==='detail'){const i=get(selected);if(i)detail(i)}
const { auto, manual } = shoppingGroups();
const autoRows = auto.map(item => {
  const reason = expiredFood(item) ? '食品已過期，自動補貨' : '庫存不足，自動補貨';
  return shopRow(item.name, true, item.id, item.url, Number(item.qty), reason);
});
const manualRows = manual.map(item => {
  const matches = stock.filter(i => i.name === item.name);
  const quantity = matches.length ? matches.reduce((sum, i) => sum + Number(i.qty), 0) : null;
  return shopRow(item.name, false, item.id, '', quantity, '手動新增項目');
});
$('shoppingItems').innerHTML = [...autoRows, ...manualRows].join('') || '<div class="empty"><div class="visual">🛒</div>購物清單目前是空的。</div>';
}
function shopRow(name, auto, id, url, quantity, reason) {
  const quantityLabel = quantity === null ? '尚未建立庫存' : `目前庫存：${quantity}`;
  const link=url&&/^https?:\/\//i.test(url)?url:'https://www.google.com/search?tbm=shop&q='+encodeURIComponent(name);
  return `<div class="shopping-row">
    <button style="font-size:20px" data-action="shop-done" data-id="${safe(id)}" data-auto="${auto}" aria-label="完成購買 ${safe(name)}">☐</button>
    <div class="fill"><div class="buy-name">${safe(name)}</div><div class="detail-sub">${reason}</div><div class="shop-quantity">${quantityLabel}</div></div>
    <a href="${safe(link)}" target="_blank" rel="noopener noreferrer">搜尋購買 ↗</a>
    ${auto?'':`<button class="small-btn alert" data-action="shop-remove" data-id="${safe(id)}">移除</button>`}
  </div>`;
}
function detail(i){const st=status(i);$('detailContent').innerHTML=`<div class="detail"><div class="tiny">${safe(i.category)} · ${safe(i.location||'未設定位置')}</div><div class="big-name">${emojiHtml(i)}${safe(i.name)}</div><div style="margin-top:7px"><span class="status ${st[1]}">${st[0]}</span></div><div class="detail-data"><div><div class="label">到期日期</div><div class="value">${safe(i.expiry||'未設定')}</div></div><div><div class="label">商品價格</div><div class="value">${i.price!==''&&i.price!=null?'NT$ '+Number(i.price):'未設定'}</div></div><div><div class="label">目標存量</div><div class="value">${Number(i.target)}</div></div><div><div class="label">商品條碼</div><div class="value" style="font-size:12px;word-break:break-word">${safe(i.barcode||'未設定')}</div></div></div>${i.photo?`<img src="${safe(i.photo.startsWith('data:image/jpeg;base64,')?i.photo:'')}" alt="${safe(i.name)} 的照片" style="max-width:100%;max-height:180px;object-fit:cover;border-radius:10px;margin-top:14px">`:''}</div><div class="detail-qty"><div><strong>目前庫存</strong><div class="tiny">點選－或＋更新數量</div></div><div class="qty-controls"><button data-action="minus" data-id="${safe(i.id)}" ${Number(i.qty)<=0?'disabled':''}>−</button><span>${i.qty}</span><button data-action="plus" data-id="${safe(i.id)}">＋</button></div></div><div class="tiny" style="margin:0 0 8px;font-weight:750">物品管理</div><div class="stack"><button class="action solid" data-action="edit" data-id="${safe(i.id)}">✎ 編輯物品資訊</button><button class="action" data-action="shop-item" data-id="${safe(i.id)}">加入購物清單</button></div><div class="stack" style="margin-top:9px"><button class="action line" data-action="favorite" data-id="${safe(i.id)}">${i.favorite?'★ 取消重要標記':'☆ 標記重要'}</button><button class="action danger" data-action="delete" data-id="${safe(i.id)}">🗑 刪除物品</button></div><div class="notice">刪除功能位於「物品資訊」，點選後會再次要求確認，避免誤刪。</div>`}
function resetForm(){ updateCategorySelect();updateLocationSelect();$('itemForm').reset();emojiTouched=false;setEmoji(defaultEmoji($('itemCategory').value,''));$('itemQty').value=1;$('itemTarget').value=2;$('itemFavorite').checked=true;formPhoto='';$('photoStatus').textContent='圖片會縮小後儲存在目前瀏覽器；可選擇不拍攝。';$('receiptStatus').textContent='可附上發票照片作參考；目前不支援自動 OCR 擷取品名。';$('formHeading').textContent='新增物品'; }
function edit(id){const i=get(id);if(!i)return;page='add';nav('add');editId=i.id;const fields={itemName:i.name,itemQty:i.qty,itemTarget:i.target,itemCategory:i.category,itemLocation:i.location,itemExpiry:i.expiry,itemPrice:i.price,itemBarcode:i.barcode,itemShopUrl:i.url};Object.entries(fields).forEach(([key,v])=>$(key).value=v??'');$('itemFavorite').checked=!!i.favorite;setEmoji(emojiOf(i));emojiTouched=true;updateCategorySelect(i.category);updateLocationSelect(i.location);formPhoto=i.photo||'';$('formHeading').textContent='編輯物品';$('pageTitle').textContent='編輯物品'}
function dialog(title,html,buttons){$('modalTitle').textContent=title;$('modalBody').innerHTML=html;$('modalActions').innerHTML='';buttons.forEach(b=>{const el=document.createElement('button');el.className='action '+(b.className||'');el.textContent=b.label;el.onclick=b.onClick;$('modalActions').append(el)});$('modalShade').classList.remove('hidden')}
function closeDialog(){stopScanner();$('modalShade').classList.add('hidden')}
function remove(id){const i=get(id);if(!i)return;dialog('刪除物品',`<p>確定刪除「${safe(i.name)}」？刪除後無法復原。</p>`,[{label:'取消',onClick:closeDialog},{label:'確認刪除',className:'danger',onClick:()=>{stock=stock.filter(x=>x.id!==id);closeDialog();save();nav('inventory');notify('已刪除物品')}}])}
function change(id,diff){const i=get(id);if(!i)return;i.qty=Math.max(0,Number(i.qty)+diff);save();notify(`${i.name}：目前數量 ${i.qty}`)}
function addShopping(i){if(!shopping.some(s=>s.name===i.name)&&!needsRestock(i)){shopping.push({id:'s'+Date.now()+Math.random().toString(36).slice(2),name:i.name})}save();notify('已加入購物清單');nav('shop')}
function addManualShop(){const name=$('shopInput').value.trim();if(!name)return notify('請輸入購物項目');if(shopping.some(i=>i.name===name)||stock.some(i=>i.name===name&&needsRestock(i)))return notify('此項目已在購物清單');shopping.push({id:'s'+Date.now()+Math.random().toString(36).slice(2),name});$('shopInput').value='';save();notify('已加入購物清單')}
function completeRestock(item) {
  const replaceExpired = expiredFood(item);
  const instructions = replaceExpired
    ? '確認後會用新買的數量取代這筆過期庫存。未填寫新到期日會清除舊日期。'
    : '確認後會把新買的數量加到目前庫存。';
  const expiryField = replaceExpired
    ? `<div class="field"><label for="restockExpiry">新到期日（選填）</label><input id="restockExpiry" type="date" min="${shifted(0)}"></div>`
    : '';

  dialog('完成補貨', `<p>請輸入「${safe(item.name)}」這次買回來的數量。${instructions}</p>
    <div class="field"><label for="restockQty">補貨數量</label><input id="restockQty" type="number" min="1" step="1" value="1"></div>
    ${expiryField}`, [
    { label: '取消', onClick: closeDialog },
    { label: replaceExpired ? '取代過期庫存' : '更新庫存', className: 'solid', onClick: () => {
      const quantity = Number($('restockQty').value);
      if (!Number.isSafeInteger(quantity) || quantity <= 0) {
        notify('請輸入正整數');
        return;
      }
      if (replaceExpired) {
        const expiry = $('restockExpiry').value;
        if (expiry && days(expiry) < 0) {
          notify('新到期日不可早於今天');
          return;
        }
        item.expiry = expiry;
      }
      item.qty = replaceExpired ? quantity : Number(item.qty) + quantity;
      closeDialog();
      save();
      notify('已更新庫存');
    }}
  ]);
}

function sendShop(){const { auto, manual } = shoppingGroups();const content=['🛒 日日庫存購物清單',...[...auto, ...manual].map(i=>'☐ '+i.name)].join('\n');if(navigator.share){navigator.share({title:'日日庫存購物清單',text:content}).catch(()=>{})}else if(navigator.clipboard?.writeText){navigator.clipboard.writeText(content).then(()=>notify('購物清單已複製')).catch(()=>downloadText(content,'購物清單.txt','text/plain'))}else{downloadText(content,'購物清單.txt','text/plain')}}
function downloadText(content,name,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)}
function exportData(){downloadText(JSON.stringify({version:'wireframe-'+APP_VERSION,stock,shopping,categories:customCategories,locations:customLocations},null,2),'日日庫存-備份.json','application/json');notify('已匯出備份')}
function stopScanner(){if(scanState){scanState.stop=true;scanState.stream?.getTracks().forEach(t=>t.stop());scanState=null}}
async function scan(){if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia){dialog('條碼掃描尚不可用','<p>相機掃描需要 HTTPS 網站與相機權限。你可以先在表單中手動輸入條碼。</p>',[{label:'知道了',className:'solid',onClick:closeDialog}]);return}if(!('BarcodeDetector' in window)){dialog('瀏覽器不支援條碼辨識','<p>此裝置的瀏覽器沒有條碼辨識功能。你仍可手動輸入商品條碼。</p>',[{label:'知道了',className:'solid',onClick:closeDialog}]);return}try{const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}}});scanState={stream,stop:false};dialog('掃描商品條碼','<video id="camVideo" class="cam" autoplay muted playsinline></video><p class="hint">將商品條碼置中；若無法辨識，可手動輸入條碼。</p>',[{label:'關閉相機',className:'solid',onClick:closeDialog}]);const video=$('camVideo');video.srcObject=stream;await video.play();const all=await BarcodeDetector.getSupportedFormats();const formats=['ean_13','ean_8','upc_a','code_128'].filter(f=>all.includes(f));if(!formats.length)throw Error('此瀏覽器未支援常見商品條碼格式');const detector=new BarcodeDetector({formats});for(let n=0;n<160&&scanState&&!scanState.stop;n++){let found=await detector.detect(video);if(found.length){$('itemBarcode').value=found[0].rawValue;closeDialog();notify('已帶入商品條碼；請繼續填寫商品資訊');return}await new Promise(r=>setTimeout(r,150))}if(scanState){closeDialog();notify('目前無法辨識條碼，請改用手動輸入')}}catch(err){closeDialog();dialog('掃描失敗',`<p>${safe(err.message)}。可改用手動輸入條碼。</p>`,[{label:'知道了',className:'solid',onClick:closeDialog}])}}
$('addCategory').addEventListener('click',createCategory);updateCategorySelect();$('addLocation').addEventListener('click',createLocation);updateLocationSelect();$('locationFilter').addEventListener('change',render);
$('emojiChoices').innerHTML=EMOJI_OPTIONS.map(e=>`<button type="button" data-emoji="${safe(e)}" aria-label="選擇 ${safe(e)}" aria-pressed="false">${safe(e)}</button>`).join('');
$('emojiChoices').addEventListener('click',e=>{const b=e.target.closest('[data-emoji]');if(b){emojiTouched=true;setEmoji(b.dataset.emoji)}});
$('itemEmoji').addEventListener('input',()=>{emojiTouched=true;syncEmoji()});
$('itemName').addEventListener('input',suggestEmoji);$('itemCategory').addEventListener('change',suggestEmoji);
$('emojiClear').addEventListener('click',()=>{emojiTouched=true;setEmoji('')});
syncEmoji();
$('itemPhoto').addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;const img=new Image(),url=URL.createObjectURL(f);img.onload=()=>{const c=document.createElement('canvas');const s=Math.min(1,700/Math.max(img.width,img.height));c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);c.getContext('2d').drawImage(img,0,0,c.width,c.height);formPhoto=c.toDataURL('image/jpeg',.64);URL.revokeObjectURL(url);$('photoStatus').textContent=`已選取 ${f.name}，照片將隨庫存記錄儲存。`};img.onerror=()=>{$('photoStatus').textContent='無法讀取圖片，請換一張試試';URL.revokeObjectURL(url)};img.src=url});
$('itemReceipt').addEventListener('change',e=>{const f=e.target.files?.[0];$('receiptStatus').textContent=f?`已選取「${f.name}」。MVP 目前不會自動辨識發票，也不會保存發票照片。`:'可附上發票照片作參考；目前不支援自動 OCR 擷取品名。'});
$('itemForm').addEventListener('submit',e=>{e.preventDefault();const name=$('itemName').value.trim(),qty=Number($('itemQty').value),target=Number($('itemTarget').value);if(!name||!Number.isSafeInteger(qty)||qty<0||!Number.isSafeInteger(target)||target<0){notify('請填寫有效名稱與整數數量');return}const i={id:editId||'i'+Date.now()+Math.random().toString(36).slice(2),name,emoji:$('itemEmoji').value.trim(),qty,target,category:$('itemCategory').value,location:$('itemLocation').value.trim(),expiry:$('itemExpiry').value,price:$('itemPrice').value.trim(),barcode:$('itemBarcode').value.trim(),url:$('itemShopUrl').value.trim(),favorite:$('itemFavorite').checked,photo:formPhoto};if(editId){stock=stock.map(x=>x.id===editId?i:x)}else{stock.unshift(i)}save();editId=null;resetForm();nav('inventory');notify('物品已儲存')});
$('backFromDetail').addEventListener('click',()=>nav(detailReturnPage));
$('backFromShop').addEventListener('click',()=>{const destination=['home','inventory','detail','backup'].includes(lastPage)?lastPage:'home';nav(destination)});
$('searchInput').addEventListener('input',render);$('shopInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addManualShop()}});$('addShop').addEventListener('click',addManualShop);$('shareShop').addEventListener('click',sendShop);$('scanBarcode').addEventListener('click',scan);$('exportData').addEventListener('click',exportData);$('importButton').addEventListener('click',()=>$('importFile').click());
$('importFile').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{const d=JSON.parse(await f.text());if(!Array.isArray(d.stock)||!Array.isArray(d.shopping))throw Error('檔案格式不符合');dialog('匯入庫存備份',`<p>匯入 ${d.stock.length} 筆庫存資料會覆蓋目前資料。確定嗎？</p>`,[{label:'取消',onClick:closeDialog},{label:'確認匯入',className:'solid',onClick:()=>{stock=d.stock.filter(i=>i&&typeof i.name==='string'&&i.name.trim()).map(i=>({...i,id:i.id||'i'+Math.random(),qty:Math.max(0,Number(i.qty)||0),target:Math.max(0,Number(i.target)||0)}));shopping=d.shopping.filter(i=>i&&typeof i.name==='string');customCategories=[...new Set([...(Array.isArray(d.categories)?d.categories:[]),...stock.map(i=>i.category)].filter(c=>typeof c==='string').map(c=>c.trim()).filter(c=>c&&!BASE_CATEGORIES.includes(c)))];customLocations=[...new Set([...(Array.isArray(d.locations)?d.locations:[]),...stock.map(i=>i.location)].filter(c=>typeof c==='string').map(c=>c.trim()).filter(c=>c&&!BASE_LOCATIONS.includes(c)))];updateCategorySelect();updateLocationSelect();closeDialog();save();nav('inventory');notify('匯入完成')}}])}catch(err){notify('無法匯入：'+err.message)}finally{e.target.value=''}});
$('modalShade').addEventListener('click',e=>{if(e.target===$('modalShade'))closeDialog()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDialog()});
document.addEventListener('click',e=>{const b=e.target.closest('[data-nav],[data-view],[data-filter],[data-action]');if(!b)return;const {nav:n,view,filter:f,action,id}=b.dataset;if(n){if(n==='inventory')statusFilter='';nav(n);return}if(view){if(view==='inventory')statusFilter='';nav(view);return}if(f){filter=f;render();return}const i=get(id);switch(action){case 'soon':statusFilter='expiry';filter='全部';$('searchInput').value='';$('locationFilter').value='全部';nav('inventory');break;case 'clear-status-filter':statusFilter='';render();break;case 'favorite':if(i){i.favorite=!i.favorite;save()}break;case 'minus':change(id,-1);break;case 'plus':change(id,1);break;case 'detail':selected=id;detailReturnPage=page;nav('detail');break;case 'edit':edit(id);break;case 'delete':remove(id);break;case 'shop-item':if(i)addShopping(i);break;case 'shop-remove':shopping=shopping.filter(s=>String(s.id)!==String(id));save();notify('已移除購物項目');break;case 'shop-done':if(b.dataset.auto==='true'){if(i)completeRestock(i)}else{shopping=shopping.filter(s=>String(s.id)!==String(id));save();notify('購物項目已完成')}break;}}
);
render();
})();
