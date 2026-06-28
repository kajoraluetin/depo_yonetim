/*
  Web frontend iskeleti.
  Backend endpoint URL'lerini ileride Apps Script web app olarak bağlayacağız.

  Şimdilik demo: fetch yerine örnek veri basıyoruz.
*/

const API_BASE = '';

// upload sonrası excel parser (SheetJS) varsayımı yapılır.
// (index.html içinde script tag ile yüklü.)



const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function setActive(viewId){
  $$('.view').forEach(v=>v.classList.remove('active'));
  $(`#${viewId}`).classList.add('active');
}

function formatMoneyTR(v){
  const n = typeof v === 'number' ? v : Number(v);
  if (!isFinite(n)) return v ?? '';
  return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function renderMissing(products){
  const body = $('#missingBody');
  body.innerHTML = '';
  if(!products?.length){
    body.innerHTML = `<tr><td colspan="8" style="padding:18px;color:#718096">Kayıt bulunamadı.</td></tr>`;
    return;
  }

  for(const p of products){
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.abasKodu ?? ''}</td>
      <td>${p.malAdi ?? ''}</td>
      <td>${p.aramaKelimesi ?? ''}</td>
      <td>${p.stokBirimi ?? ''}</td>
      <td>${p.toplamStok ?? 0}</td>
      <td>${formatMoneyTR(p.ortalamaFiyat)} ₺</td>
      <td>${p.lot ?? ''}</td>
      <td>${p.eksikSayfa ?? ''}</td>
    `;
    body.appendChild(tr);
  }
}

function renderMismatched(products){
  const body = $('#mismatchedBody');
  body.innerHTML = '';
  if(!products?.length){
    body.innerHTML = `<tr><td colspan="7" style="padding:18px;color:#718096">Kayıt bulunamadı.</td></tr>`;
    return;
  }

  for(const p of products){
    const durum = Number(p.rafStok) > Number(p.toplamStok) ?
      {cls:'green', text:'▲ Fazla'} : {cls:'red', text:'▼ Eksik'};

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.abasKodu ?? ''}</td>
      <td>${p.malAdi ?? ''}</td>
      <td>${p.rafNo ?? ''}</td>
      <td>${p.rafAdresi ?? ''}</td>
      <td>${p.rafStok ?? 0}</td>
      <td>${p.toplamStok ?? 0}</td>
      <td><span class="badge ${durum.cls}">${durum.text}</span></td>
    `;

    // Detay için (ileride tık ile çağıracağız)
    tr.style.cursor = 'pointer';
    tr.addEventListener('click', () => openProductModal(p.abasKodu));

    body.appendChild(tr);
  }
}

function openModal(html){
  const modal = $('#modal');
  const body = $('#modalBody');
  body.innerHTML = html;
  modal.hidden = false;
  // overlay taşınmazsa (bazı tarayıcılarda) ek garanti
  modal.style.display = 'flex';
  // body scroll kilidi
  document.body.style.overflow = 'hidden';
}


function closeModal(){
  $('#modal').hidden = true;
  // body scroll'u geri al
  document.body.style.overflow = '';
}


$('#modalClose').addEventListener('click', closeModal);
$('#modal').addEventListener('click', (e)=>{
  if(e.target === $('#modal')) closeModal();
});

async function openProductModal(abasKodu){
  // demo data
  const demo = {
    abasKodu,
    imageUrl: '',
    malAdi: 'Mal Adı (Demo)',
    aramaKelimesi: 'Arama Kelimesi',
    stokBirimi: 'ADET',
    toplamStokMiktari: 0,
    ortalamaFiyat: '0.00'
  };

  // ileride: const res = await fetch(`${API_BASE}/product-details?abasKodu=${encodeURIComponent(abasKodu)}`)
  // render modal from res.json()

  openModal(`
    <div class="modal-grid">
      <div class="modal-imgWrap">
        ${demo.imageUrl ? `<img src="${demo.imageUrl}" alt="${demo.abasKodu}" />` : `<div style="padding:26px;color:#718096">Resim bulunamadı</div>`}
      </div>
      <div class="details">
        <p><strong>🔍 ABAS Kodu:</strong> <span>${demo.abasKodu}</span></p>
        <p><strong>📝 Mal Adı:</strong> <span>${demo.malAdi}</span></p>
        <p><strong>🔎 Arama Kelimesi:</strong> <span>${demo.aramaKelimesi}</span></p>
        <p><strong>📊 Stok Birimi:</strong> <span>${demo.stokBirimi}</span></p>
        <p><strong>📦 Toplam Stok Miktarı:</strong> <span>${demo.toplamStokMiktari}</span></p>
        <p><strong>💰 Ortalama Fiyat:</strong> <span>${demo.ortalamaFiyat} ₺</span></p>
      </div>
    </div>
  `);
}

// Toolbar actions
$('#btnMissing').addEventListener('click', async ()=>{
  setActive('viewMissing');
  const demoMissing = [
    {abasKodu:'100001', malAdi:'Mal 1', aramaKelimesi:'Arama 1', stokBirimi:'ADET', toplamStok:10, ortalamaFiyat:12.5, lot:'L-1', eksikSayfa:'2025 GÜNCEL LİSTE'}
  ];
  renderMissing(demoMissing);
});

$('#btnMismatched').addEventListener('click', async ()=>{
  setActive('viewMismatched');
  const demoMismatched = [
    {abasKodu:'100001', malAdi:'Mal 1', rafNo:'R-1', rafAdresi:'A-1', rafStok:5, toplamStok:10}
  ];
  renderMismatched(demoMismatched);
});

function addSearchHandler(inputId, tableBodyId, getText){
  const input = $(`#${inputId}`);
  input.addEventListener('input', ()=>{
    const q = input.value.trim().toLowerCase();
    const rows = $(`#${tableBodyId}`).querySelectorAll('tr');
    rows.forEach(r=>{
      const txt = getText(r).toLowerCase();
      r.style.display = txt.includes(q) ? '' : 'none';
    })
  });
}

addSearchHandler('missingSearch','missingBody', (row)=> row.textContent);
addSearchHandler('mismatchSearch','mismatchedBody', (row)=> row.textContent);

$('#btnExportMissing').addEventListener('click', ()=>alert('Export eklenecek (TODO).'));
$('#btnExportMismatched').addEventListener('click', ()=>alert('Export eklenecek (TODO).'));

// --- Depo seçimi ---
const DEPO_KEYS = {
  ABAS: 'abas',
  FIZIKI: 'fiziki'
};

const depoState = {
  aktif: DEPO_KEYS.ABAS
};

function updateDepoButtons(){
  const abasBtn = $('#btnDepoAbas');
  const fizBtn = $('#btnDepoFiziki');
  const isAbas = depoState.aktif === DEPO_KEYS.ABAS;
  if(isAbas){
    abasBtn.classList.add('pill-accent');
    fizBtn.classList.remove('pill-accent');
  }else{
    fizBtn.classList.add('pill-accent');
    abasBtn.classList.remove('pill-accent');
  }
}

$('#btnDepoAbas').addEventListener('click', ()=>{
  depoState.aktif = DEPO_KEYS.ABAS;
  updateDepoButtons();
  // demo için: dashboard'a dön
  setActive('viewDashboard');
});

$('#btnDepoFiziki').addEventListener('click', ()=>{
  depoState.aktif = DEPO_KEYS.FIZIKI;
  updateDepoButtons();
  setActive('viewDashboard');
});

updateDepoButtons();

// --- Top bar routing ---
$('#btnGoDashboard').addEventListener('click', ()=>{
  setActive('viewDashboard');
});


$('#btnUpload').addEventListener('click', ()=>{
  closeModal();
  setActive('viewUpload');
});



// --- Upload + Preview ---
function normalizeHeader(h){
  return (h ?? '').toString().replace(/\s+/g,' ').trim();
}


const PREVIEW_COLUMNS_MAX = 16;
const REQUIRED_UPLOAD_COLUMNS = [
  'Ambar-konumu','Ambar grubu','Sorumlu Personel','No','Mal','Ürün Açıklaması','Atık',
  'Min.Stok.Seviyesi','Minimum Temin Miktarı','Ortalama fiyat','Toplam Stok Miktarı',
  'Stok Kırılım Miktarı','Malzeme Alım Tarihi','Ambar birimi','Proje','İşletim dilinde tanım','Lot'
];

function pickPreviewColumns(keys){
  const normalizedKeys = keys.map(normalizeHeader);
  const requiredSet = new Set(REQUIRED_UPLOAD_COLUMNS.map(normalizeHeader));

  // Önce required kolonları sırayla al
  const requiredInFile = REQUIRED_UPLOAD_COLUMNS.map(normalizeHeader).filter(k => requiredSet.has(k) && normalizedKeys.includes(k));
  const rest = normalizedKeys.filter(k => !requiredInFile.includes(k));

  const final = [...requiredInFile, ...rest];
  return final.slice(0, PREVIEW_COLUMNS_MAX);
}

function makePreviewColumns(keys){
  const head = $('#uploadHead');
  head.innerHTML = '';

  const cols = pickPreviewColumns(keys);
  head.innerHTML = cols.map(c => `<th title="${c}">${c}</th>`).join('');
}

function renderPreviewRows(rows, columns){
  const tbody = $('#uploadPreview');
  tbody.innerHTML = '';

  const cols = columns;
  for(const r of rows){
    const tr = document.createElement('tr');
    for(const c of cols){
      const td = document.createElement('td');
      const v = r[c];
      td.textContent = (v === null || v === undefined) ? '' : String(v);
      td.title = td.textContent; // tooltip için
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
}


async function handleUpload(file){
  if(!file) return;
  const meta = $('#uploadMeta');
  meta.textContent = 'Dosya okunuyor...';

  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, {type:'array'});
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];

  // header row'u ilk satır kabul et
  const json = XLSX.utils.sheet_to_json(ws, {defval:'', raw:true});
  const keys = Array.from(new Set(json.flatMap(o=>Object.keys(o))));

  $('#uploadHead').innerHTML = '';
  makePreviewColumns(keys);

  const preview = json.slice(0, 30);
  const previewCols = pickPreviewColumns(keys);
  renderPreviewRows(preview, previewCols);

  meta.textContent = `Önizleme: ${json.length} satır (kolon: ${previewCols.length}, ilk 30 satır)`;
}

$('#btnProcessUpload').addEventListener('click', async ()=>{
  const input = $('#uploadFile');
  const file = input.files?.[0];

  if(!file){
    $('#uploadMeta').textContent = 'Lütfen bir .xlsx/.xls/.csv dosyası seçin.';
    return;
  }

  try{
    // UX
    $('#uploadMeta').textContent = 'Okunuyor...';
    await handleUpload(file);
  }catch(e){
    console.error(e);
    $('#uploadMeta').textContent = 'Dosya okunamadı. Biçimi kontrol edin.';
  }
});


