/* SiapKerja! 1.19.2 — konstanta simulasi & instrumen */

const SK = 'siapkerja_project_state';
const VER = '1.19.2';
/** Setelan wajib uji coba (instrumen v1.5). */
const TRIAL_SETTINGS = {
  designDuration: 2,
  constructionDuration: 8,
  qualityLevel: 'standard',
  budgetLevel: 'standard',
  priority: 'time',
  levelOfDetail: 'standar',
};
/* Tempel tautan Microsoft Forms milik ketua peneliti. Kosong = "Tautan disiapkan ketua peneliti". */
const FORM_LINKS = {
  pra: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=gxFu22VMXECCznzVP6bp3GNItEHSPX5Os8c_U2BUyEtUOFUwT0VHRklKRFI3RUdEWEg3S1ZZNzgyVS4u',
  pasca: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=gxFu22VMXECCznzVP6bp3GNItEHSPX5Os8c_U2BUyEtURVVXQzNZSFNEQUJHWEVPM1VZM0NYUTQ1Ri4u',
  pengamat: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=gxFu22VMXECCznzVP6bp3GNItEHSPX5Os8c_U2BUyEtUNjEyTkhOSkY0VjIyNks4M1Y1S0ZKQUdNVC4u',
};
const TRIAL_FORMS = [
  { id:'pra', title:'Form 1 · Pra', who:'Setiap responden · menit 0–8, sebelum main · tautan dari ketua peneliti' },
  { id:'pasca', title:'Form 2 · Pasca', who:'Responden yang sama, sesi + R sama · menit 80–90' },
  { id:'pengamat', title:'Form 3 · Pengamat', who:'Fasilitator · satu isian per laptop, selama main' },
];
const TRIAL_BEAT = [
  { t:'0–8', act:'Consent + responden mengklik tautan Form 1. Laptop simulasi belum disentuh.', form:'Form 1' },
  { t:'8–15', act:'Brief: LPS di SiapKerja — last planner, pull, PPC = keandalan janji. Alur tab sekali.', form:'' },
  { t:'15–75', act:'Main: Phase Plan → L1 SiapKerja! → WWP → satu huddle → Learning + Laporan.', form:'Form 3' },
  { t:'75–80', act:'Fasilitator unduh JSON, nama {sesi}-G{n}.json, kirim ke abduh@itb.ac.id. Bukan tugas responden.', form:'' },
  { t:'80–90', act:'Responden mengklik tautan Form 2 dengan kode sesi + R yang sama.', form:'Form 2' },
];
const TRIAL_ANS_KEY = 'siapkerja_trial_answers';
const FORM_DEFS = {
  pra: {
    id:'pra', kicker:'Form 1 · sebelum main', title:'Kuesioner pra-simulasi',
    lead:'Setiap peserta. Isi sebelum laptop simulasi disentuh. Kode sesi + R dipakai lagi di Form 2. R unik dalam sesi. Mengevaluasi SiapKerja, bukan Anda. Nama orang tidak ditulis. Nama organisasi diisi, disamarkan di paper.',
    sections:[
      { id:'meta', type:'meta', title:'Kode', fields:[
        { id:'sesi', label:'Kode sesi', ph:'S260901-A' },
        { id:'r', label:'Kode responden (unik dalam sesi)', ph:'R01' },
        { id:'g', label:'Kelompok / laptop', ph:'G1' },
        { id:'org', label:'Nama organisasi / perusahaan (disamarkan di paper)', ph:'Jika individu, tulis Individu' },
      ]},
      { id:'a1', type:'choice', title:'A1. Latar', items:[
        { id:'A1.0', q:'Jenis organisasi', opts:['kontraktor','konsultan','kampus / politeknik','asosiasi','individu','lain'], other:true },
        { id:'A1.1', q:'Peran saat ini', opts:['perencana','last planner / mandor','engineer lapangan','lean specialist','dosen / mahasiswa','lain'], other:true },
        { id:'A1.3', q:'Pernah menjalankan LPS di proyek nyata?', opts:['tidak','pernah melihat','pernah menjalankan'] },
      ]},
      { id:'a2', type:'likert', title:'A2. Empat butir LPS — sebelum main (wajib tetap)', hint:'Beberapa butir sengaja terbalik. Isi keyakinan sekarang. Diulang identik di Form 2.', items:[
        { id:'A2.2', q:'Pekerjaan minggu depan boleh dijanjikan meskipun masih ada kendala yang belum dilepas.' },
        { id:'A2.5', q:'Pull berarti memulai setiap kegiatan seawal mungkin sesuai jadwal induk.' },
        { id:'A2.4', q:'PPC mengukur seberapa cepat bangunan diselesaikan.' },
        { id:'A2.6', q:'Make-ready (menyiapkan agar pekerjaan SiapKerja!) lebih menentukan keandalan janji daripada menambah tenaga di hari H.' },
      ]},
    ],
  },
  pasca: {
    id:'pasca', kicker:'Form 2 · sesudah main', title:'Kuesioner pasca-simulasi',
    lead:'Peserta yang sama. Pakai kode sesi dan R yang sama dengan Form 1. Nilai SiapKerja sebagai alat latihan LPS. Isi menit 80–90. Jangan tulis nama orang.',
    sections:[
      { id:'meta', type:'meta', title:'Kode', fields:[
        { id:'sesi', label:'Kode sesi (sama dengan Form 1)', ph:'S260901-A' },
        { id:'r', label:'Kode responden (sama dengan Form 1)', ph:'R01' },
        { id:'g', label:'Kelompok / laptop (sama dengan Form 1)', ph:'G1' },
      ]},
      { id:'c1', type:'likert', title:'C1. Pekerjaan di SiapKerja', items:[
        { id:'C1.1', q:'Kegiatan di SiapKerja (galian, sloof, kolom, dinding, …) dekat dengan pekerjaan lapangan yang saya kenal.' },
        { id:'C1.4', q:'Saya merasakan beda merencana dari Gantt (push) dan merencana dari pekerjaan yang sudah siap (pull).' },
      ]},
      { id:'c2', type:'likert', title:'C2. Menjalankan LPS lewat SiapKerja', items:[
        { id:'C2.2', q:'Saya lebih jelas mengapa L1 harus bebas kendala sebelum dijanjikan.' },
        { id:'C2.4', q:'Make-ready terasa sebagai kerja menyiapkan constraint, bukan hanya istilah.' },
      ]},
      { id:'c3', type:'likert', title:'C3. Ulangi 4 butir LPS (wajib tetap, selisih pra–pasca)', items:[
        { id:'C3.2', q:'Pekerjaan minggu depan boleh dijanjikan meskipun masih ada kendala yang belum dilepas.' },
        { id:'C3.5', q:'Pull berarti memulai setiap kegiatan seawal mungkin sesuai jadwal induk.' },
        { id:'C3.4', q:'PPC mengukur seberapa cepat bangunan diselesaikan.' },
        { id:'C3.6', q:'Make-ready lebih menentukan keandalan janji daripada menambah tenaga di hari H.' },
      ]},
      { id:'c4', type:'likert', title:'C4. Kegunaan SiapKerja', items:[
        { id:'C4.5', q:'Antarmuka SiapKerja cukup jelas untuk sesi sekitar 90 menit.' },
        { id:'C4.6', q:'Saya akan merekomendasikan SiapKerja untuk latihan LPS di lingkungan saya.' },
      ]},
      { id:'c5', type:'text', title:'C5. Terbuka', items:[
        { id:'C5.1', q:'Satu hal tentang LPS yang baru Anda rasakan lewat SiapKerja (bukan hanya ketahui):', ph:'' },
        { id:'C5.2', q:'Yang masih membingungkan atau menghambat di SiapKerja:', ph:'' },
      ]},
    ],
  },
  pengamat: {
    id:'pengamat', kicker:'Form 3 · fasilitator', title:'Lembar pengamat',
    lead:'Satu isian per laptop, selama main. Catat apa yang terjadi di SiapKerja. Jangan meranking kelompok. Nama organisasi diisi; disamarkan di paper. Jangan tulis nama orang.',
    sections:[
      { id:'meta', type:'meta', title:'Kode sesi', fields:[
        { id:'sesi', label:'Kode sesi', ph:'S260901-A' },
        { id:'org', label:'Nama organisasi / perusahaan (disamarkan di paper)', ph:'Jika individu, tulis Individu' },
        { id:'g', label:'Kelompok / laptop', ph:'G1' },
        { id:'n', label:'Jumlah orang', ph:'5' },
      ]},
      { id:'b1', type:'choice', title:'B1. Tab terakhir tercapai', items:[
        { id:'B1.last', q:'Tab terakhir yang tercapai di SiapKerja', opts:['Pemilik','Desainer','Pemilihan','Master Plan','Phase Plan','Look-ahead','Weekly Work Plan','Huddle','Learning','Laporan'] },
      ]},
      { id:'b2', type:'yn', title:'B2. Perilaku metode di SiapKerja', items:[
        { id:'B2.1', q:'L1 pernah dikunci kotor', opts:['ya','tidak','tidak sempat'] },
        { id:'B2.2', q:'L1 diperbaiki sebelum berjanji di WWP', opts:['ya','tidak','tidak sempat'] },
        { id:'B2.huddle', q:'Huddle dijalankan minimal satu hari', opts:['ya','tidak','tidak sempat'] },
        { id:'B2.6', q:'Kelompok membahas keandalan janji / PPC di Learning atau Laporan', opts:['ya','tidak','tidak sempat'] },
        { id:'B2.7', q:'Mutu tidak ditawar turun', opts:['ya','tidak','tidak sempat'] },
      ]},
      { id:'b3', type:'text', title:'B3. File JSON (fasilitator kirim email)', items:[
        { id:'B3.json', q:'Nama file JSON yang akan dikirim ke abduh@itb.ac.id', ph:'S260901-A-G1.json' },
        { id:'B3.note', q:'Catatan hambatan di SiapKerja (tanpa nama orang)', ph:'' },
      ]},
    ],
  },
};
const MANUAL = [
  { id:'alur', title:'Alur lengkap', blurb:'', body:'Satu putaran dari value pemilik sampai laporan, lalu gulir — atau tutup proyek jika semua pekerjaan selesai.', bullets:[
    'Pemilik (value, durasi desain 2/4, konstruksi 8/10/12 default 8) → Desainer (LOD, OE, denah/3D)',
    'Pemilihan: nego harga & waktu, tanda tangan kontrak',
    'Master Plan → Phase Plan (6 tim, zonasi, pull Pondasi + Struktur; atap & finishing given)',
    'Look-ahead L1–L4 (L1 harus SiapKerja!). Skenario: material M3, hujan M6',
    'Weekly Work Plan → Daily Huddle (atau Jalankan sisa hari) → Learning → Laporan → gulir',
    'Jika semua pekerjaan selesai (termasuk serah terima): proyek ditutup, tidak ada look-ahead lagi',
  ]},
  { id:'istilah', title:'Istilah yang dipakai', blurb:'', body:'Beberapa kata sengaja dipilih agar tidak bentrok dengan LPS atau bahasa sehari-hari.', bullets:[
    'SiapKerja! = pekerjaan sudah bebas constraint (siap dikerjakan).',
    'Masukkan ke jadwal = mengambil pekerjaan SiapKerja! dari kotak Workable untuk mengisi hari kosong minggu ini. Bukan “promosi” (naik jabatan) dan bukan “tarik” (itu metode Phase Plan).',
    'Workable = backlog pekerjaan yang sudah SiapKerja! tetapi belum menjadi janji minggu ini.',
    'L1–L4 = jendela look-ahead 4 minggu. L1 = minggu eksekusi berikutnya; harus bersih constraint.',
    'Alasan variansi = alasan komitmen tidak terpenuhi. Dicatat di huddle, dibahas di Learning.',
  ]},
  { id:'owner', title:'1 · Pemilik', blurb:'Tetapkan value. Mutu tidak boleh turun. Durasi desain 2/4, konstruksi 8/10/12 (default 8).', body:'Pemilik wajib menetapkan nilai yang ingin dicapai. Mutu bukan kompensasi — spek yang dipilih harus terpenuhi di nego. Fokus yang boleh dipilih: waktu atau biaya. Budget simulasi 350 jt (desain + konstruksi). Durasi desain 2 atau 4 minggu; konstruksi 8, 10, atau 12 minggu. Default 8 minggu = setelan wajib uji coba; untuk kuliah boleh 10 atau 12. Tombol Uji coba → Terapkan setelan wajib mengunci 2+8, mutu standar, fokus waktu, LOD standar.', bullets:['Pilih durasi, mutu, fokus, budget','Uji coba: Terapkan setelan wajib (2+8)','Tombol: Kunci dan lanjut ke desainer'] },
  { id:'designer', title:'2 · Desainer', blurb:'Terjemahkan value ke denah, 3D, OE, dan LOD. LOD menentukan banyaknya constraint.', body:'Desainer menerjemahkan keinginan pemilik ke tanah, struktur, arsitektur, MEP, denah dan 3D. Kualitas hasil desain (LOD: cepat / standar / sempurna) menentukan biaya konstruksi (OE) dan berapa constraint yang muncul di lapangan. Fee desainer given, tergantung LOD dan budget.', bullets:['LOD kurang detail → constraint banyak','Tombol: Tetapkan desain & undang kontraktor'] },
  { id:'negotiation', title:'3 · Pemilihan', blurb:'Nego harga dan waktu. Mutu harus sesuai permintaan pemilik.', body:'Penunjukan langsung. Tidak ada tawar mutu. Nego dibanding OE, bukan vs budget. Setelah tanda tangan, status kontrak tetap terlihat, lalu eksekusi konstruksi.', bullets:['Tanda tangan kontrak → Eksekusi konstruksi'] },
  { id:'contractor-master', title:'4 · Master Plan', blurb:'Jadwal induk sesuai kontrak: mulai–selesai dan biaya.', body:'Kurva S dan Gantt adalah dokumen kontrak, media komunikasi dengan pemilik. LPS punya jadwal eksekusi sendiri yang nanti dikorelasikan lagi ke kontrak. Lanjut ke milestone (Phase Plan).', bullets:[] },
  { id:'contractor-phase', title:'5 · Phase Plan', blurb:'Enam tim, garis milestone, zonasi. Latihan pull: Pondasi + Struktur.', body:'Kenalkan 6 tim kerja (warna). Milestone = kapan terjadi, ditarik di linimasa. Usulkan zonasi denah, tetapkan. Collaborative pull: latihan pada Pondasi dan Struktur (site, galian, kolom, dinding) agar hands-off Z2 → kolom kelihatan. Atap, MEP, finishing given beserta constraint LOD. L1/M1 bersih dari constraint given. Komitmen semua tim, lalu kunci.', bullets:['Commit semua tim','Kunci Phase Plan → Look-ahead'] },
  { id:'contractor-production', title:'6 · Look-ahead Plan', blurb:'L1–L4 bergulir. L1 tidak boleh ada constraint terbuka. Material M3 = skenario.', body:'Jendela 4 minggu. L1 = minggu eksekusi berikutnya: harus SiapKerja! L2–L4: hilangkan atau commit hilangkan. Tiga pilihan: Dihilangkan sekarang, Commit hilangkan (dicek sesi berikutnya), Tidak bisa dihilangkan. Skenario material di M3 harus make-ready sebelum masuk L1. Pekerjaan yang sudah dimasukkan ke jadwal/selesai tidak muncul lagi di minggu asalnya. Predecessor phase plan berlaku (dinding menunggu struktur, bukan galian).', bullets:['L1 bersih baru susun WWP','Memasukkan ke jadwal tidak menghapus urutan predecessor'] },
  { id:'contractor-wwp', title:'7 · Weekly Work Plan', blurb:'Pecah L1 ke hari. Hari kosong diisi dari Workable (masukkan ke jadwal).', body:'Hanya L1 yang SiapKerja! Pecah: Z1 3 hari → Z1-a-1…Z1-a-3. Z2-a 2 hari → Z2-a-1, Z2-a-2. Sisa setelah Sabtu = rencana minggu depan, bukan gagal. Jika L1 kosong karena sudah dimasukkan ke jadwal, jadwal Sen–Sab tetap tampil — isi dari Workable dengan tombol Masukkan. Tahan = belum predecessor/constraint. Kunci rencana, lalu Daily Huddle.', bullets:[] },
  { id:'contractor-huddle', title:'8 · Daily Huddle', blurb:'15 menit. Selesai / perpanjang / gagal. M6 hujan Sen–Sel. Ada jalankan sisa hari.', body:'Last planner menyampaikan cepat. Centang hijau jika sesuai; perpanjang (1–2 hari) atau tidak bisa (alasan variansi). Masalah tidak didiskusikan di huddle — masuk alasan variansi. Prasyarat zona: site gagal memblok galian di zona itu. Memasukkan ke jadwal hanya sisa hari minggu yang sama, dan successor hanya setelah predecessor selesai. M6: hujan Sen–Sel (skenario) — tidak bisa hijau, perpanjang/gagal alasan Cuaca. Jika tidak ada kunci, tombol Jalankan sisa hari menuntaskan huddle tanpa klik per hari.', bullets:[] },
  { id:'contractor-learning', title:'9 · Learning', blurb:'PPC, alasan variansi, konfirmasi pecahan. Gulir — atau tutup jika proyek selesai.', body:'Konfirmasi selesai/tidak per pecahan. Yang tidak selesai = variansi, dibawa ke L1. Yang tidak muat pecah (dijadwalkan minggu depan) bukan gagal, tidak masuk PPC. Isi pembelajaran. Kunci evaluasi. Jika masih ada pekerjaan: Look-ahead 4 minggu ke depan. Jika semua selesai termasuk serah terima: tombol gulir hilang, buka Laporan proyek ditutup.', bullets:[] },
  { id:'contractor-progress', title:'10 · Laporan', blurb:'Kurva S dulu, lalu Gantt dan batang PPC. Tanda M3/M6. Progres = OE × sticky selesai.', body:'Urutan: ringkasan + tiga kotak (fisik, rencana, PPC) → bakukan progres → Kurva S (garis putus M3 material dan M6 hujan) → Gantt rencana vs aktual (kolom M3/M6; molor +N jika mulai lebih lambat) → batang PPC per minggu. Progres fisik = bobot OE × sticky di phase plan yang selesai (bukan 4 zona tetap). Maksimal 100%. Finishing di OE ≈ 19%. Jika proyek selesai: durasi aktual vs kontrak; tidak ada tombol gulir. Arsip eksekusi di bawah, dilipat.', bullets:[] },
  { id:'skenario', title:'Skenario gangguan', body:'Dua skrip tetap (bukan random) agar kelas bisa diulang.', bullets:[
    'M3 — material (semen/besi telat). Muncul di Look-ahead jendela yang memuat M3. Harus make-ready sebelum L1.',
    'M6 — hujan Sen–Sel. Daily Huddle: tidak bisa centang hijau; perpanjang atau gagal, alasan Cuaca. Setelah Rabu, Jalankan sisa hari boleh dipakai.',
  ]},
  { id:'aturan', title:'Aturan yang sering keliru', body:'', bullets:[
    'L1 harus bebas constraint sebelum kunci WWP.',
    'Commit hilangkan ≠ sudah hilang — dicek di look-ahead berikutnya.',
    'PPC tidak menghitung sisa pecah yang belum jadi janji minggu ini.',
    'Unit minggu Z2-a; pecah hari Z2-a-1. Jangan pecah kartu yang sudah pecah.',
    'M0 = sesi perencanaan; L1 pada M0 = M1 eksekusi.',
    'Mutu pemilik tidak boleh dikompensasi di nego.',
    'Predecessor dari phase plan: dinding setelah struktur, bukan setelah galian.',
    'Progres fisik tidak boleh >100%; finishing yang belum dikerjakan mengurangi %.',
    'Masukkan ke jadwal hanya dari Workable (sudah SiapKerja!), hanya sisa hari minggu ini.',
    'Jangan pakai kata “promosi” — di aplikasi itu “masukkan ke jadwal”.',
  ]},
];
const BB = { hemat:{min:180,max:230}, standard:{min:250,max:320}, premium:{min:400,max:520} };
const OWNER_BUDGET_JT = 350;
const OE_BASE_JT = 250;
const LOD_FEE = { cepat: 0.06, standar: 0.08, sempurna: 0.10 };
const LOD_GIVEN = {
  cepat: [
    { workId:'site',    type:'info',    note:'Gambar site belum lengkap (LOD cepat)' },
    { workId:'found',   type:'info',    note:'Data tanah/sondir belum detail' },
    { workId:'found',   type:'material',note:'Spek beton pondasi belum freeze' },
    { workId:'struct',  type:'info',    note:'Shop drawing kolom & balok belum approve' },
    { workId:'wall',    type:'info',    note:'Detail pasangan & bukaan dinding belum lengkap' },
    { workId:'roofC',   type:'material',note:'Penutup atap masih alternatif' },
    { workId:'mep',     type:'info',    note:'Shop drawing MEP belum ada' },
    { workId:'doors',   type:'material',note:'Schedule pintu/jendela belum final' },
    { workId:'plaster', type:'info',    note:'Detail finishing belum lengkap' },
  ],
  standar: [
    { workId:'found',   type:'info',    note:'Data tanah cukup; sisa detail pondasi dalam' },
    { workId:'struct',  type:'info',    note:'Shop drawing kolom ada; sisa detailing joint' },
    { workId:'mep',     type:'info',    note:'MEP skematik ada, shop drawing menyusul' },
    { workId:'plaster', type:'material',note:'Sample finishing menunggu persetujuan' },
  ],
  sempurna: [
    { workId:'struct',  type:'prereq',  note:'Koordinasi tulangan vs sleeve MEP 1 item' },
    { workId:'mep',     type:'prereq',  note:'Koordinasi MEP–struktur tersisa 1 item' },
  ],
};

const WORKS = [
  { id:'site',    name:'Site clearing & layout',      pred:[],                    dur:1.0, weight:0.03, team:'Pondasi',   color:'#A0522D' },
  { id:'found',   name:'Galian & pondasi',            pred:['site'],              dur:2.5, weight:0.18, team:'Pondasi',   color:'#A0522D' },
  { id:'struct',  name:'Kolom & balok',               pred:['found'],             dur:3.0, weight:0.22, team:'Struktur',  color:'#1E40AF' },
  { id:'wall',    name:'Pasangan dinding',            pred:['struct'],            dur:3.0, weight:0.12, team:'Dinding',   color:'#EA580C' },
  { id:'roofS',   name:'Rangka atap',                 pred:['struct'],            dur:2.0, weight:0.08, team:'Atap',      color:'#15803D' },
  { id:'roofC',   name:'Penutup atap',                pred:['roofS'],             dur:1.2, weight:0.06, team:'Atap',      color:'#15803D' },
  { id:'mep',     name:'MEP rough-in',                pred:['wall'],              dur:2.0, weight:0.08, team:'MEP',       color:'#7C3AED' },
  { id:'plaster', name:'Plesteran',                   pred:['wall','mep'],        dur:2.5, weight:0.08, team:'Finishing', color:'#CA8A04' },
  { id:'floor',   name:'Lantai / keramik',            pred:['plaster'],           dur:1.5, weight:0.06, team:'Finishing', color:'#CA8A04' },
  { id:'doors',   name:'Kusen, pintu, jendela',       pred:['roofC'],             dur:1.2, weight:0.04, team:'Atap',      color:'#15803D' },
  { id:'paint',   name:'Pengecatan',                  pred:['plaster','floor','doors'], dur:1.8, weight:0.04, team:'Finishing', color:'#CA8A04' },
  { id:'close',   name:'Beres-beres & serah terima',  pred:['paint'],             dur:0.8, weight:0.01, team:'Finishing', color:'#CA8A04' },
];

const PHASES = [
  { id:'pondasi',   name:'Pondasi',    works:['site','found'] },
  { id:'struktur',  name:'Struktur',   works:['struct','wall'] },
  { id:'selubung',  name:'Atap & MEP', works:['roofS','roofC','mep','doors'] },
  { id:'finishing', name:'Finishing',  works:['plaster','floor','paint','close'] },
];
const TEAMS = ['Pondasi','Struktur','Dinding','Atap','MEP','Finishing'];
const WWP_DAYS = [{id:'sen',label:'Sen'},{id:'sel',label:'Sel'},{id:'rab',label:'Rab'},{id:'kam',label:'Kam'},{id:'jum',label:'Jum'},{id:'sab',label:'Sab'}];
const PPC_REASONS = ['material','labor','info','access','prereq','weather','lain'];
const TEAM_PHASE = { Pondasi:'pondasi', Struktur:'struktur', Dinding:'struktur', Atap:'selubung', MEP:'selubung', Finishing:'finishing' };
const TEAM_META = [
  { id:'Pondasi',   color:'#A0522D', phase:'Pondasi',    role:'Site, galian, sloof' },
  { id:'Struktur',  color:'#1E40AF', phase:'Struktur',   role:'Kolom & balok' },
  { id:'Dinding',   color:'#EA580C', phase:'Struktur',   role:'Pasangan dinding' },
  { id:'Atap',      color:'#15803D', phase:'Atap & MEP', role:'Rangka, penutup, kusen' },
  { id:'MEP',       color:'#7C3AED', phase:'Atap & MEP', role:'MEP rough-in' },
  { id:'Finishing', color:'#CA8A04', phase:'Finishing',  role:'Plester, lantai, cat, serah terima' },
];
const FOCUS_PHASES = ['pondasi', 'struktur'];
const FOCUS_PHASE = 'struktur';
const SCENARIOS = [
  { id: 'mat3', week: 3, kind: 'material', type: 'material', note: 'Semen/besi telat kirim (skenario). Make-ready sebelum masuk L1.' },
  { id: 'rain6', week: 6, kind: 'weather', type: 'weather', days: 2, note: 'Hujan Sen–Sel (skenario). Daily huddle: perpanjang atau gagal, alasan Cuaca.' },
];
const WORK_ZONES = {
  struct: ['z3','z4','z5','z6'],
  wall:   ['z3','z4','z5','z6'],
  site:   ['z1'],
  found:  ['z2'],
  roofS:  ['z7'],
  roofC:  ['z7'],
  mep:    ['z6'],
  plaster:['z3','z4','z5','z6'],
  floor:  ['z3','z4','z5','z6'],
  doors:  ['z3','z4','z5','z6'],
  paint:  ['z3','z4','z5','z6'],
  close:  ['z1'],
};
const ZONES = [
  { id:'z1', name:'Z1 Site',     hint:'Pekarangan & akses masuk',  color:'#A0522D' },
  { id:'z2', name:'Z2 Pondasi',  hint:'Footprint, galian, sloof',  color:'#8B5E3C' },
  { id:'z3', name:'Z3 Depan',    hint:'Ruang tamu',                color:'#C45C26' },
  { id:'z4', name:'Z4 Kamar 1',  hint:'Kamar tidur barat',         color:'#EA580C' },
  { id:'z5', name:'Z5 Kamar 2',  hint:'Kamar tidur timur',         color:'#D97706' },
  { id:'z6', name:'Z6 Servis',   hint:'Dapur & kamar mandi',       color:'#7C3AED' },
  { id:'z7', name:'Z7 Atap',     hint:'Rangka & penutup atap',     color:'#15803D' },
];
const CONSTRAINT_LABEL = {
  info:'Gambar / info', material:'Material', labor:'Tukang',
  access:'Akses / ruang', prereq:'Pekerjaan sebelumnya', weather:'Cuaca',
  lain:'Lainnya',
};
