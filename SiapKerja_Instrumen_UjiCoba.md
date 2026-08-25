# Instrumen uji coba SiapKerja!

**Versi:** 1.4 (25 Agustus 2026) — evaluasi SiapKerja sebagai alat ajar LPS  
**Aplikasi:** SiapKerja! 1.19.1  
**Untuk:** sesi undangan (kampus, perusahaan, atau individu). Boleh diulang; gabungkan dengan kode sesi.  
**Tujuan paper:** *Civil Engineering Dimension*, Section 6 — mock-up eksploratori.  
**Bahasa pengisian:** Indonesia  
**Waktu responden:** ±5 menit sebelum main + ±8 menit sesudah main  
**Pengamat:** 1 orang per sesi (menjaga protokol; tidak harus dosen)

Isi apa yang terjadi di SiapKerja. Jangan mengisi skor “yang diharapkan paper.”  
Jangan minta nama orang. Nama organisasi diisi, **disamarkan di paper**.

---

## 0. Protokol (fasilitator — tidak dibagikan ke responden)

### 0.1 Siapa yang diundang

Siapa pun yang perlu belajar menjalankan LPS: praktisi (perencana, last planner, engineer lapangan, lean specialist), dosen/mahasiswa CM, atau individu.

Per sesi: **6–12 orang**, 2–4 kelompok, **satu laptop per kelompok**. Beberapa sesi boleh dijumlahkan (*n* total). Nama organisasi dikumpulkan lalu disamarkan (Organisasi A, B, …) plus jenis (kontraktor / konsultan / kampus / …).

### 0.2 Kode

| | Pola | Contoh |
|---|---|---|
| Sesi | `S{yy}{mm}{dd}-{huruf}` | `S260901-A` |
| Kelompok | `G1` … (satu laptop) | `G2` |
| Responden | `R01` … **unik dalam sesi** | `R07` |
| Organisasi | Nama apa adanya di Form | disamarkan di paper |
| JSON | `{sesi}-G{n}.json` | `S260901-A-G2.json` |

Gabung Excel Form 1 dan Form 2: **sesi + R**. Jangan ulang R01 di G2 dalam sesi yang sama.

Kode sesi dan kartu R/G disiapkan fasilitator. JSON diunduh dan dikirim **hanya fasilitator** (bukan peserta) ke `abduh@itb.ac.id`.

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
| 75–80 | **Fasilitator** unduh JSON, nama `{sesi}-G{n}.json`, kirim ke `abduh@itb.ac.id`. Bukan tugas peserta. | — |
| 80–90 | **Form 2** (pasca), kode sesi + R sama | 2 |

Jika belum huddle: catat tab terakhir di Form 3. Jangan memaksa 100% rumah.

### 0.5 Peran kelompok (5 orang; jika 3–4, gabung)

Fasilitator klik; last planner Pondasi; last planner Struktur; last planner lain + notulen; pengamat “pemilik” (laporan 2 menit dari tab Laporan, tanpa PPT).

### 0.6 Yang tidak dilakukan

Tidak meranking kelompok. Tidak menawar mutu. Tidak mengisi kuesioner untuk orang lain. Tidak menulis nama orang (nama organisasi boleh, disamarkan di paper). Tidak mengklaim bahwa sesi ini menaikkan PPC proyek nyata. Tidak minta peserta mengunduh JSON.

### 0.7 Etika (dibacakan)

Uji coba **SiapKerja**, alat ajar LPS, untuk paper akademik. Mengevaluasi aplikasi, bukan menilai orang atau organisasi. **Tanpa nama orang.** Nama organisasi diisi dan akan disamarkan di paper. Sukarela, boleh berhenti. JSON tidak berisi nama orang.

---

## Form 1 — sebelum bermain (responden)

Lihat `SiapKerja_Draft_Kuesioner.md` Form 1 (butir 1–11).

**Kunci (jangan tampilkan):** no. 8, 9, 10 = reverse (6−x). No. 11 utuh. Indeks *cara pandang LPS* = rata-rata 8–11.

Empat butir LPS (8–11) **wajib tetap** dan diulang identik di Form 2 no. 8–11.

---

## Form 3 — pengamat (satu per laptop)

Lihat `SiapKerja_Draft_Kuesioner.md` Form 3 (butir 1–12).

---

## Form 2 — sesudah bermain (responden)

Lihat `SiapKerja_Draft_Kuesioner.md` Form 2 (butir 1–15).

---

## D. Olah untuk paper

*n* aktual. Nama organisasi **disamarkan**. Exploratory; bukan klaim PPC lapangan.

Gabung Form 1 ↔ Form 2: `sesi` + `R`.

| Indeks | Butir | Olah |
|---|---|---|
| LPS-view pre / post / Δ | Form 1 no. 8–11 / Form 2 no. 8–11 | reverse 8, 9, 10; mean 1–5; median (IQR) |
| Representasi pekerjaan | Form 2 no. 4–5 | mean |
| Metode terasa | Form 2 no. 6–7 | mean |
| Kegunaan SiapKerja | Form 2 no. 12–13 | mean; % skor 4–5 |
| Perilaku di aplikasi | Form 3 no. 6–10 | % kelompok; no. 6 diharapkan **tidak** |
| Jangkauan sesi 90 menit | Form 3 no. 5 dan 8 | sebaran tab terakhir; % sampai huddle |
| Organisasi | Form 1 no. 4–5 | nama → Organisasi A, B, …; jenis sebagai kategori |

Jika *n*≥8: Wilcoxon signed-rank pada Δ, dilabeli exploratory. Jangan *p*-value jika *n* kecil tanpa label itu.

JSON simulator: arsip fasilitator (PPC, tab, L1). Bukan untuk join kuesioner. Jika JSON tidak sampai, Form 3 tetap dipakai.

**Tabel Section 6:** (1) peserta per jenis organisasi dan peran (nama disamarkan); (2) tab terakhir di SiapKerja; (3) perilaku metode; (4) LPS-view pre/post pada 4 butir wajib; (5) persepsi pekerjaan, metode, kegunaan; (6) kutipan terbuka, anonim.

---

*SiapKerja! 1.19.1 — instrumen uji coba v1.4.*
