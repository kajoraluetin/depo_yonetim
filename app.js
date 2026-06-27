/*
  Web frontend iskeleti.
  Backend endpoint URL'lerini ileride Apps Script web app olarak bağlayacağız.

  Şimdilik demo: fetch yerine örnek veri basıyoruz.
*/

const API_BASE = '';

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
}

function closeModal(){
  $('#modal').hidden = true;
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

