# Instrumen uji coba SiapKerja!

**Versi:** 1.5 (25 Agustus 2026) — evaluasi SiapKerja sebagai alat ajar LPS  
**Aplikasi:** SiapKerja! 1.19.1  
**Untuk:** ketua peneliti (pemilik Form) dan fasilitator per perusahaan (rekan penulis).  
**Tujuan paper:** *Civil Engineering Dimension*, Section 6 — mock-up eksploratori.  
**Bahasa pengisian:** Indonesia  

Tiga Microsoft Form milik ketua peneliti — **satu set untuk semua perusahaan**. Fasilitator tidak membuat Form. Responden mengklik tautan; data masuk otomatis.

---

## 0. Peran

| Peran | Tugas |
|---|---|
| Ketua peneliti | Pemilik tiga Form. Memberi kode sesi + tautan ke fasilitator. Menerima Excel otomatis. Menyamarkan nama organisasi di paper. |
| Fasilitator (satu per perusahaan, rekan penulis) | Menjalankan sesi 90 menit. Membagikan tautan. Mengisi Form 3 (satu per laptop). Mengirim JSON email. Tidak membuat Form. Tidak mengirim Excel. |
| Responden | Form 1 sebelum main, Form 2 sesudah. Boleh 1 orang atau beberapa di satu laptop. |

Kontak: `abduh@itb.ac.id`.

---

## 0.2 Kode

| | Pola | Siapa yang memberi |
|---|---|---|
| Sesi `S{yy}{mm}{dd}-{huruf}` | satu perusahaan / satu hari | ketua peneliti → fasilitator |
| Kelompok `G1` … | satu laptop | fasilitator |
| Responden `R01` … | unik dalam sesi | fasilitator |
| Nama organisasi | apa adanya di Form | responden / fasilitator Form 3; disamarkan di paper |
| JSON `{sesi}-G{n}.json` | satu per laptop | fasilitator kirim ke ketua peneliti |

Gabung Excel Form 1 dan Form 2: **sesi + R**. Jangan ulang R01 di G2 dalam sesi yang sama.

### 0.3 Pengaturan wajib

| Setelan | Nilai |
|---|---|
| Durasi desain | **2 minggu** |
| Durasi konstruksi | **8 minggu** |
| Mutu | **standar** (terkunci) |
| Fokus | **waktu** |
| LOD desainer | **standar** |

Satu laptop = satu G. Boleh 1 orang atau beberapa. Jangan meranking.

### 0.4 Alur 90 menit

| Menit | Isi | Form |
|---|---|---|
| 0–8 | Consent + responden mengklik **Form 1**. Laptop simulasi belum disentuh. | 1 |
| 8–15 | Brief 7 menit: LPS di SiapKerja — last planner, pull, PPC = keandalan janji. | — |
| 15–75 | Main. Target: Phase Plan → L1 *SiapKerja!* → WWP → **satu huddle** → Learning + Laporan. | 3 |
| 75–80 | **Fasilitator** unduh JSON, nama `{sesi}-G{n}.json`, kirim ke `abduh@itb.ac.id`. | — |
| 80–90 | Responden mengklik **Form 2**, kode sesi + R sama | 2 |

Jika belum huddle: catat tab terakhir di Form 3. Jangan memaksa 100% rumah.

### 0.6 Yang tidak dilakukan

Tidak membuat Form sendiri. Tidak mengirim Excel. Tidak meranking. Tidak menawar mutu. Tidak mengisi Form untuk orang lain. Tidak menulis nama orang. Tidak mengklaim PPC proyek nyata. Tidak minta responden mengunduh JSON. Tidak membuat kode sesi sendiri.

### 0.7 Etika (dibacakan)

Uji coba **SiapKerja**, alat ajar LPS, untuk paper akademik. Mengevaluasi aplikasi, bukan menilai orang atau organisasi. **Tanpa nama orang.** Nama organisasi diisi dan akan disamarkan di paper. Sukarela, boleh berhenti. Isian Form masuk ke ketua peneliti.

---

## Form (butir untuk ketua peneliti, saat membuat Microsoft Form)

Lihat berkas Word Quick Import jika masih dipakai: `SiapKerja_MSForms_01_Pra.docx` (11), `_02_Pasca.docx` (15), `_03_Pengamat.docx` (12). Fasilitator **tidak** menerima berkas ini.

**Kunci LPS (jangan tampilkan di Form):** Form 1 no. 8–11 dan Form 2 no. 8–11 identik. No. 8, 9, 10 reverse (6−x). No. 11 utuh. Indeks = rata-rata 8–11.

---

## D. Olah untuk paper

*n* aktual. Nama organisasi **disamarkan**. Exploratory; bukan klaim PPC lapangan.

Gabung Form 1 ↔ Form 2: `sesi` + `R`. Excel sudah di akun ketua peneliti.

| Indeks | Butir | Olah |
|---|---|---|
| LPS-view pre / post / Δ | Form 1 no. 8–11 / Form 2 no. 8–11 | reverse 8, 9, 10; mean 1–5; median (IQR) |
| Representasi pekerjaan | Form 2 no. 4–5 | mean |
| Metode terasa | Form 2 no. 6–7 | mean |
| Kegunaan SiapKerja | Form 2 no. 12–13 | mean; % skor 4–5 |
| Perilaku di aplikasi | Form 3 no. 6–10 | % laptop; no. 6 diharapkan **tidak** |
| Jangkauan sesi 90 menit | Form 3 no. 5 dan 8 | sebaran tab terakhir; % sampai huddle |
| Organisasi | Form 1 no. 4–5 | nama → Organisasi A, B, …; jenis sebagai kategori |

Jika *n*≥8: Wilcoxon signed-rank pada Δ, dilabeli exploratory. Jangan *p*-value jika *n* kecil tanpa label itu.

JSON simulator: arsip fasilitator (PPC, tab, L1). Bukan untuk join kuesioner. Jika JSON tidak sampai, Form 3 tetap dipakai.

**Tabel Section 6:** (1) peserta per jenis organisasi dan peran (nama disamarkan); (2) tab terakhir di SiapKerja; (3) perilaku metode; (4) LPS-view pre/post pada 4 butir wajib; (5) persepsi pekerjaan, metode, kegunaan; (6) kutipan terbuka, anonim.

---

*SiapKerja! 1.19.1 — instrumen uji coba v1.5.*
