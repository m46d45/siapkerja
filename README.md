# SiapKerja! — Simulator LPS untuk pembelajaran

Bahan ajar interaktif **Last Planner System (LPS)** untuk mahasiswa teknik sipil / manajemen konstruksi dan untuk **uji coba lapangan** (evaluasi aplikasi sebagai alat ajar).

**Live:** https://siapkerja-lps.vercel.app  
**Versi aplikasi:** 1.19.2  
**Repo:** `m46d45/siapkerja` (branch `main`)

## Fitur simulasi

Alur berurutan (kunci tahap demi tahap):

1. **Pemilik** — durasi desain & konstruksi, mutu, fokus nego, budget Rp 350 jt  
2. **Desainer** — Design Freeze, Level of Detail (LOD), Owner’s Estimate, denah/3D Type-36  
3. **Pemilihan kontraktor** — penawaran vs OE, negosiasi singkat  
4. **Kontraktor (LPS)**  
   - Master Plan  
   - Phase Plan (sticky notes, 6 tim, zonasi, pull)  
   - Look-ahead 4 minggu + make-ready (L1 harus SiapKerja!)  
   - Weekly Work Plan  
   - Daily Huddle  
   - Learning (PPC & variansi)  
   - Laporan (Kurva S, Gantt, PPC)

Skenario tetap: **M3** material telat, **M6** hujan. State di `localStorage`. Unduh/unggah JSON sesi.

## Setelan default & uji coba

| | Desain | Konstruksi | Mutu | Fokus | LOD |
|---|---|---|---|---|---|
| **Default app / wajib uji coba** | 2 minggu | **8 minggu** | standar | waktu | standar |
| Opsi kuliah | 2 atau 4 | 8 / 10 / 12 | standar / premium | waktu / biaya | cepat / standar / sempurna |

Di menu **Uji coba** → tombol **Terapkan setelan wajib & mulai** mengulang proyek dengan baris “wajib uji coba” di atas.

Protokol lengkap: `SiapKerja_Instrumen_UjiCoba.md` dan `SiapKerja_Pedoman_UjiCoba.docx`.

## Cara pakai

Buka di browser (static). Libs Alpine + Tailwind di-vendor di `libs/` — offline setelah kunjungan pertama (service worker).  
PWA: `manifest.webmanifest` + `sw.js`.

## Struktur teknis

Tanpa build step. Vanilla JS + Alpine.js + Tailwind (Play CDN binary di `libs/`).

| Path | Isi |
|---|---|
| `index.html` | Markup & UI |
| `js/data.js` | Konstanta simulasi, manual, Form, `TRIAL_SETTINGS` |
| `js/helpers.js` | Perencanaan, chart, SVG, state I/O |
| `js/app.js` | `Alpine.data('app')` |
| `libs/` | alpine.min.js, tailwindcss.js |
| `assets/brand/` | **Sumber brand** (mark, lockup, poster, sosmed) |
| `SiapKerja-Logo-Poster-Sosmed.zip` | Paket unduhan = salinan `assets/brand/` untuk desainer |

## Dokumen uji coba & ajar

| Berkas | Untuk |
|---|---|
| `SiapKerja_Instrumen_UjiCoba.md` | Protokol, kode S/G/R, olah data |
| `SiapKerja_Draft_Kuesioner.md` (+ `.docx`) | Butir Form 1–3 |
| `SiapKerja_MSForms_0{1,2,3}_*.docx` | Quick Import Microsoft Forms |
| `SiapKerja_MSForms_CaraUnggah.md` | Langkah unggah Form |
| `SiapKerja_Pedoman_UjiCoba.docx` | Pedoman fasilitator |
| `SiapKerja_Lembar_Responden.md` | Cadangan kertas |
| `Modul-Praktikum-SiapKerja-Pengajar.docx` | Modul praktikum (satu file) |
| `manual-siapkerja.pdf` | Manual ringkas |

Tiga Form Microsoft milik ketua peneliti. Kontak: `abduh@itb.ac.id`.

## Deploy

Static — Vercel project `siapkerja-lps`, production dari branch `main`.
