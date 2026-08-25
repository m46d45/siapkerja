# Instrumen uji coba SiapKerja!

**Versi:** 1.3 (25 Agustus 2026) — evaluasi SiapKerja sebagai alat ajar LPS  
**Aplikasi:** SiapKerja! 1.19.1  
**Untuk:** sesi undangan (kampus, perusahaan, atau individu). Boleh diulang; gabungkan dengan kode sesi.  
**Tujuan paper:** *Civil Engineering Dimension*, Section 6 — mock-up eksploratori.  
**Bahasa pengisian:** Indonesia  
**Waktu responden:** ±8 menit sebelum main + ±12 menit sesudah main  
**Pengamat:** 1 orang per sesi (menjaga protokol; tidak harus dosen)

Isi apa yang terjadi di SiapKerja. Jangan mengisi skor “yang diharapkan paper.”  
Jangan minta nama orang atau nama instansi.

---

## 0. Protokol (fasilitator — tidak dibagikan ke responden)

### 0.1 Siapa yang diundang

Siapa pun yang perlu belajar menjalankan LPS: praktisi (perencana, last planner, engineer lapangan, lean specialist), dosen/mahasiswa CM, atau individu.

Per sesi: **6–12 orang**, 2–4 kelompok, **satu laptop per kelompok**. Beberapa sesi boleh dijumlahkan (*n* total; jenis organisasi sebagai kategori: kontraktor / konsultan / kampus / lain — tanpa nama firma).

### 0.2 Kode

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

Tidak meranking kelompok. Tidak menawar mutu. Tidak mengisi kuesioner untuk orang lain. Tidak menulis nama orang atau nama instansi. Tidak mengklaim bahwa sesi ini menaikkan PPC proyek nyata.

### 0.7 Etika (dibacakan)

Uji coba **SiapKerja**, alat ajar LPS, untuk paper akademik. Mengevaluasi aplikasi, bukan menilai orang atau organisasi. Isian **tanpa nama orang dan tanpa nama instansi**. Sukarela, boleh berhenti. JSON tidak berisi identitas.

---

## Form 1 — sebelum bermain (responden)

Lihat `SiapKerja_Draft_Kuesioner.md` Form 1 (butir 1–14).

**Kunci (jangan tampilkan):** A2.1, A2.2, A2.4, A2.5 = reverse (6−x). A2.3, A2.6 utuh. Indeks *cara pandang LPS* = rata-rata 1–5.

---

## Form 3 — pengamat (satu per kelompok)

Lihat `SiapKerja_Draft_Kuesioner.md` Form 3 (butir 1–26).

---

## Form 2 — sesudah bermain (responden)

Lihat `SiapKerja_Draft_Kuesioner.md` Form 2 (butir 1–26).

---

## D. Olah untuk paper

*n* aktual. Kategori organisasi, **bukan nama**. Exploratory; bukan klaim PPC lapangan.

| Indeks | Butir | Olah |
|---|---|---|
| LPS-view pre / post / Δ | Form 1 no. 9–14 / Form 2 no. 12–17 | reverse 9,10,12,13 (dan 12,13,15,16 pasca); mean 1–5; median (IQR) |
| Representasi pekerjaan | Form 2 no. 3–6 | mean |
| Metode terasa | Form 2 no. 7–11 | mean |
| Kegunaan SiapKerja | Form 2 no. 18–23 | mean; % skor 4–5 |
| Perilaku di aplikasi | Form 3 no. 17–23 | % kelompok; no. 17 diharapkan **tidak** |
| Jangkauan sesi 90 menit | Form 3 no. 6–16 | % sampai huddle (no. 13) |

Jika *n*≥8: Wilcoxon signed-rank pada Δ, dilabeli exploratory. Jangan *p*-value jika *n* kecil tanpa label itu.

**Tabel Section 6:** (1) peserta per kategori organisasi dan peran; (2) tab tercapai di SiapKerja; (3) perilaku metode; (4) LPS-view pre/post; (5) persepsi pekerjaan, metode, kegunaan; (6) tiga kutipan terbuka, anonim.

---

*SiapKerja! 1.19.1 — instrumen uji coba v1.3.*
