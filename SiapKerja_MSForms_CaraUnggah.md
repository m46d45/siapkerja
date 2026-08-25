# Cara unggah ke Microsoft Forms

Quick Import **hanya** membaca: judul, soal bernomor, pilihan A. B. C., dan soal tanpa pilihan (isian). Likert di Word ini sudah diubah jadi pilihan A–E (1–5). Jangan unggah berkas markdown.

Draf butir (baca dulu, lalu import Word): `SiapKerja_Draft_Kuesioner.docx` (v1.4, ramping).

## Tiga formulir (jangan digabung)

| File | Siapa | Kapan | Butir |
|---|---|---|---|
| `SiapKerja_MSForms_01_Pra.docx` | Peserta | **Sebelum** main | 11 |
| `SiapKerja_MSForms_02_Pasca.docx` | Peserta (sesi + R sama) | **Sesudah** main | 15 |
| `SiapKerja_MSForms_03_Pengamat.docx` | Fasilitator | 1× per laptop, selama main | 12 |

Pra dan pasca terpisah agar indeks cara pandang LPS tidak diisi setelah tahu jawabannya.  
Isian mengevaluasi **SiapKerja**. Nama organisasi diisi; di paper disamarkan. Jangan minta nama orang.

Gabung Excel: kolom **sesi + R**. R unik dalam satu sesi.

## Langkah

1. Buka [forms.office.com](https://forms.office.com) → **New Form** (bukan Quiz).  
2. **…** atau **Quick import** → **From Word** → pilih satu file di atas.  
3. Tinjau hasil: setiap nomor harus jadi 1 pertanyaan; A–E jadi pilihan.  
4. Set **Required** pada kode sesi, kode R, kode G, dan nama organisasi (Form 1 dan Form 3).  
5. Matikan penskoran / kunci jawaban jika terlanjur jadi Quiz.  
6. Ulangi untuk dua file sisanya.  
7. Bagikan tautan. Jangan minta nama orang.

Jika import menggabungkan dua soal: di Word, pastikan ada baris kosong antar soal (sudah disetel). Unggah ulang.

Setelah sesi: Excel dari Forms. File JSON simulator dikirim **fasilitator** ke `abduh@itb.ac.id` (bukan peserta). Olah menurut `SiapKerja_Instrumen_UjiCoba.md` bagian D.
