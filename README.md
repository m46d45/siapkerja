# SiapKerja! – LPS Simulator untuk Kontraktor Kecil

Bahan ajar interaktif **Last Planner System (LPS)** untuk mahasiswa teknik sipil / manajemen konstruksi.

**Live:** https://siapkerja-lps.vercel.app

## Fitur
- **Owner**: set durasi desain & konstruksi, quality, budget, prioritas
- **Designer**: Design Freeze, Level of Detail, Planned Kurva S
- **Kontraktor**: Manajemen Proyek + Manajemen Produksi (LPS)
  - Phase Planning (Sticky Notes)
  - Look-ahead 4 minggu, Make-Ready, Weekly Work Plan, PPC

## Cara pakai
Buka langsung di browser (static, offline-capable setelah load CDN sekali).
State disimpan di `localStorage`. Support Export/Import JSON.

## Tech
Vanilla JS + Alpine.js + Tailwind CSS (CDN). Tidak perlu build step.

## Deploy
Static site — Vercel production: `siapkerja-lps` (repo `m46d45/siapkerja`, branch `main`).
