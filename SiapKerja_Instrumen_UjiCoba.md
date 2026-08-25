# Instrumen uji coba SiapKerja!

**Versi:** 1.2 (25 Agustus 2026) — evaluasi SiapKerja saja; **tanpa nama organisasi**  
**Aplikasi:** SiapKerja! 1.19.1  
**Untuk:** setiap sesi undangan (kampus, perusahaan, atau individu). Boleh diulang di beberapa tempat; gabungkan dengan kode sesi, bukan merek tuan rumah.  
**Tujuan paper:** *Civil Engineering Dimension*, Section 6 — mock-up eksploratori, bukan uji acak.  
**Bahasa pengisian:** Indonesia  
**Waktu responden:** ±8 menit sebelum main + ±12 menit sesudah main  
**Pengamat:** 1 orang per sesi (bukan harus dosen; cukup yang menjaga protokol)

Jangan mengisi skor “yang diharapkan paper.” Isi apa yang terjadi di SiapKerja.  
Jangan membandingkan SiapKerja dengan alat, permainan, atau merek latihan lain di undangan, brief, maupun kuesioner.

---

## 0. Protokol (fasilitator — tidak dibagikan ke responden)

### 0.1 Siapa yang diundang

Siapa pun yang **perlu belajar menjalankan LPS**: praktisi (perencana, last planner, engineer lapangan, lean specialist), dosen/mahasiswa CM, atau individu.

Per sesi: **6–12 orang**, 2–4 kelompok, **satu laptop per kelompok**. Beberapa sesi boleh dijumlahkan di paper (*n* total, sebut jenis organisasi secara kategori: kontraktor / konsultan / kampus / lain — **tanpa nama firma**).

### 0.2 Kode (jangan pakai nama instansi)

| | Pola | Contoh |
|---|---|---|
| Sesi | `S{yy}{mm}{dd}-{huruf}` | `S260825-A` |
| Kelompok | `G1` … | `G2` |
| Responden | `R01` … | `R07` |
| JSON | `{sesi}-G{n}.json` | `S260825-A-G2.json` |

Kode sesi hanya di lembar fasilitator. Lembar responden: **R__ / G__ / tanggal**.

### 0.3 Pengaturan wajib (semua kelompok, semua sesi)

| Setelan | Nilai |
|---|---|
| Durasi desain | **2 minggu** |
| Durasi konstruksi | **8 minggu** |
| Mutu | **standar** (terkunci) |
| Fokus | **waktu** |
| LOD desainer | **standar** |

Jangan ganti setelan di tengah. Jangan meranking kelompok.

### 0.4 Alur 90 menit

| Menit | Isi | Form |
|---|---|---|
| 0–8 | Consent + **Form 1** (pra). Laptop simulasi belum disentuh. | 1 |
| 8–15 | Brief 7 menit: LPS di SiapKerja — last planner, pull, PPC = keandalan janji. Alur tab sekali, tanpa spoiler make-ready. | — |
| 15–75 | Main. Target: kunci Phase Plan → L1 *SiapKerja!* → kunci WWP → **satu huddle** (Minggu 1) → Learning + Laporan. Jika sempat, gulir ke skrip material (~minggu 3). | 3 |
| 75–80 | Unduh JSON | — |
| 80–90 | **Form 2** (pasca), kode R sama | 2 |

Jika belum huddle: catat tab terakhir di Form 3. Jangan memaksa 100% rumah.

### 0.5 Peran kelompok (5 orang; jika 3–4, gabung)

Fasilitator klik; last planner Pondasi; last planner Struktur; last planner lain + notulen; pengamat “pemilik” (laporan 2 menit dari tab Laporan, tanpa PPT).

### 0.6 Yang tidak dilakukan

Tidak meranking kelompok. Tidak menawar mutu. Tidak mengisi kuesioner untuk orang lain. Tidak menulis nama orang atau nama instansi. Tidak membandingkan SiapKerja dengan alat atau merek latihan lain.

### 0.7 Etika (dibacakan)

Uji coba **SiapKerja**, alat ajar LPS, untuk paper akademik. Mengevaluasi aplikasi, bukan menilai orang atau organisasi. Isian **tanpa nama orang dan tanpa nama instansi**. Sukarela, boleh berhenti. JSON tidak berisi identitas.

---

## Form 1 — sebelum bermain (responden)

**Kode:** `R____`  **Kelompok:** `G____`  **Tanggal:** __________

Lingkari. 1 = sangat tidak setuju … 5 = sangat setuju.

### A1. Latar (kategori, bukan instansi)

| | | Jawaban |
|---|---|---|
| A1.0 | Jenis organisasi (jangan tulis nama) | kontraktor / konsultan / kampus atau politeknik / asosiasi / individu / lain: ___ |
| A1.1 | Peran saat ini | perencana / last planner atau mandor / engineer lapangan / lean specialist / dosen atau mahasiswa / lain: ___ |
| A1.2 | Pengalaman kerja konstruksi | belum / <3 th / 3–7 th / 8–15 th / >15 th |
| A1.3 | Pernah menjalankan LPS di proyek nyata? | tidak / pernah melihat / pernah menjalankan |
| A1.4 | Familiar dengan istilah LPS (last planner, pull, make-ready, PPC)? | belum dengar / pernah dengar / dipelajari di kelas atau kantor / dipakai di lapangan |
| A1.5 | Perencanaan mingguan di tempat Anda | jadwal induk/Gantt / rapat informal / sudah LPS / belum di lapangan / lain |

### A2. Pernyataan LPS — sebelum main

Beberapa butir sengaja terbalik. Isi keyakinan sekarang.

| Kode | Pernyataan | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| A2.1 | Jadwal induk (Gantt/CPM) sudah cukup untuk mengendalikan produksi mingguan. | | | | | |
| A2.2 | Pekerjaan minggu depan boleh dijanjikan meskipun masih ada kendala yang belum dilepas. | | | | | |
| A2.3 | Last planner adalah orang yang paling dekat dengan pekerjaan, bukan hanya planner di kantor lapangan. | | | | | |
| A2.4 | PPC mengukur seberapa cepat bangunan diselesaikan. | | | | | |
| A2.5 | *Pull* berarti memulai setiap kegiatan seawal mungkin sesuai jadwal induk. | | | | | |
| A2.6 | Make-ready (menyiapkan agar pekerjaan *SiapKerja!*) lebih menentukan keandalan janji daripada menambah tenaga di hari H. | | | | | |

**Kunci (jangan tampilkan):** A2.1, A2.2, A2.4, A2.5 = reverse (6−x). A2.3, A2.6 utuh. Indeks *cara pandang LPS* = rata-rata 1–5.

---

## Form 3 — pengamat (satu per kelompok)

**Sesi:** __________  **Kelompok:** G__  **Jumlah orang:** __  **Mulai–selesai:** __:__ – __:__

### B1. Tab tercapai di SiapKerja

| Tab | Selesai? | Hambatan |
|---|---|---|
| Pemilik | ya / tidak | |
| Desainer | ya / tidak | |
| Pemilihan (tanda tangan) | ya / tidak | |
| Master Plan | ya / tidak | |
| Phase Plan (pull Pondasi+Struktur + komitmen) | ya / tidak | |
| Look-ahead, L1 = *SiapKerja!* | ya / tidak | |
| WWP dikunci | ya / tidak | |
| Huddle ≥ 1 hari | ya / tidak | |
| Learning (PPC terlihat) | ya / tidak | |
| Laporan dibuka | ya / tidak | |
| Gulir sampai skrip material (~minggu 3) | ya / tidak | |

### B2. Perilaku metode di SiapKerja (diamati)

| Kode | Indikator | Ya | Tidak | Tidak sempat |
|---|---|---|---|---|
| B2.1 | L1 pernah dikunci **kotor** | | | |
| B2.2 | L1 diperbaiki sebelum berjanji di WWP | | | |
| B2.3 | *Masukkan ke jadwal* dipakai untuk mengisi hari kosong dari Workable | | | |
| B2.4 | Sisa pecahan setelah Sabtu **tidak** diperlakukan sebagai gagal | | | |
| B2.5 | Alasan variansi diisi jika pekerjaan tidak selesai | | | |
| B2.6 | Kelompok membahas **keandalan janji / PPC** di Learning atau Laporan | | | |
| B2.7 | Mutu tidak ditawar turun | | | |

### B3. File sesi

JSON: `________________`  PPC minggu 1 (jika ada): ______ %  
Catatan 3 baris (hambatan di SiapKerja, tanpa nama): ________________________________________________

---

## Form 2 — sesudah bermain (responden)

**Kode:** `R____` (sama dengan Form 1)

### C1. Pekerjaan di SiapKerja

| Kode | Pernyataan | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| C1.1 | Kegiatan di SiapKerja (galian, sloof, kolom, dinding, …) dekat dengan pekerjaan lapangan yang saya kenal. | | | | | |
| C1.2 | Denah dan zonasi rumah Type-36 membantu saya memahami urutan pekerjaan. | | | | | |
| C1.3 | Saya menjalankan urutan lengkap di SiapKerja: value pemilik → desain → pull → make-ready → janji mingguan → huddle → PPC. | | | | | |
| C1.4 | Saya merasakan beda merencana dari Gantt (push) dan merencana dari pekerjaan yang sudah siap (pull). | | | | | |

### C2. Menjalankan LPS lewat SiapKerja

| Kode | Pernyataan | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| C2.1 | Setelah main SiapKerja, last planner merencana dari **pekerjaan**, bukan dari batang Gantt. | | | | | |
| C2.2 | Saya lebih jelas mengapa L1 harus bebas kendala sebelum dijanjikan. | | | | | |
| C2.3 | PPC di SiapKerja mengukur **keandalan janji** mingguan. | | | | | |
| C2.4 | Make-ready terasa sebagai kerja menyiapkan constraint, bukan hanya istilah. | | | | | |
| C2.5 | Daily huddle terasa sebagai rapat lapangan singkat. | | | | | |

### C3. Ulangi 6 butir LPS (selisih pra–pasca)

Sama dengan A2.1–A2.6.

### C4. Kegunaan SiapKerja

| Kode | Pernyataan | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| C4.1 | Saya bisa menjalankan SiapKerja di laptop tanpa server khusus. | | | | | |
| C4.2 | Setelah **satu kali** terhubung internet, saya bisa lanjut memakai SiapKerja **tanpa sinyal**. | | | | | |
| C4.3 | SiapKerja cocok untuk **pelatihan LPS** di organisasi saya. | | | | | |
| C4.4 | SiapKerja bisa dipakai rekan di tempat yang internetnya putus-nyambung. | | | | | |
| C4.5 | Antarmuka SiapKerja cukup jelas untuk sesi sekitar 90 menit. | | | | | |
| C4.6 | Saya akan merekomendasikan SiapKerja untuk latihan LPS di lingkungan saya. | | | | | |

### C5. Terbuka

**C5.1** Satu hal tentang LPS yang baru Anda *rasakan* lewat SiapKerja:  
**C5.2** Yang masih membingungkan atau menghambat di SiapKerja:  
**C5.3** Saran perbaikan SiapKerja (opsional):

---

## D. Olah untuk paper

*n* aktual. Kategori organisasi, **bukan nama**. Exploratory; bukan klaim PPC lapangan. Bukan perbandingan antar-alat.

| Indeks | Butir | Olah |
|---|---|---|
| LPS-view pre / post / Δ | A2 / C3 | reverse 1,2,4,5; mean 1–5; median (IQR) |
| Representasi pekerjaan | C1.1–C1.4 | mean |
| Metode terasa | C2.1–C2.5 | mean |
| Kegunaan SiapKerja | C4.1–C4.6 | mean; % skor 4–5 |
| Perilaku di aplikasi | B2 | % kelompok; B2.1 diharapkan **tidak** |
| Jangkauan sesi 90 menit | B1 | % sampai huddle |

Jika *n*≥8: Wilcoxon signed-rank pada Δ, dilabeli exploratory. Jangan *p*-value jika *n* kecil tanpa label itu.

**Tabel Section 6:** (1) peserta per kategori organisasi dan peran; (2) tab tercapai di SiapKerja; (3) perilaku metode B2; (4) LPS-view pre/post; (5) persepsi C1–C2–C4; (6) tiga kutipan C5, anonim.

---

*SiapKerja! 1.19.1 — instrumen uji coba v1.2.*
