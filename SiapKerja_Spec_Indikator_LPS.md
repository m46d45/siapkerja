# SiapKerja — spesifikasi indikator LPS lanjutan

Tanggal: 30 September 2026  
Berkas sasaran: `siapkerja/index.html`  
Pembaca: pelaksana di Cursor  
Penulis naskah acuan metrik: Glenn Ballard dan Iris D. Tommelein


> **Catatan implementasi (1.20.0):** state di `js/helpers.js` (`emptyContractor`), logika di `js/app.js`, markup di `index.html`. API `promo*` di spek = `schedule*` / `confirmScheduleIn` di kode.

Ini perintah kerja bertahap. Jangan mengubah alur Owner → Desainer → Pull → Look-ahead → Weekly Work Plan → Huddle → Learning. Jangan mengubah rumus PPC yang sudah ada. Satu fase per pull request. Phase 2 tidak dimulai sebelum uji Phase 1 lulus. Phase 3 tidak dimulai sebelum uji Phase 2 lulus.

---

## 0. Cara memakai naskah ini

1. Baca pasal 1 (dokumen rumus) sebelum menulis kode. Angka di layar harus cocok dengan contoh Gambar 22 di bawah, bukan interpretasi lain.
2. Kerjakan pasal 4–12 (Phase 1) sampai U1–U9 lulus.
3. Baru pasal 13 (Phase 2), lalu pasal 14 (Phase 3).
4. State runtime ada di `emptyContractor()` dalam `siapkerja/index.html` (sekitar baris 2724). `js/state.js` tidak dipakai saat aplikasi berjalan. Jangan mengisi `lookAhead.tasks` di berkas itu.

---

## 1. Dokumen rumus yang diacu

Pelaksana wajib mengikuti definisi di sumber primer ini. Sumber lain hanya menjelaskan istilah yang tidak dipakai Ballard–Tommelein (RNC).

### 1.1 Sumber primer — wajib

**Ballard, G. & Tommelein, I. (2021).** *2020 Current Process Benchmark for the Last Planner System of Project Planning and Control.* Lean Construction Journal 2021, hlm. 53–155.

- PDF LCI: https://leanconstruction.org/wp-content/uploads/2022/08/LCJ_21_001.pdf
- Halaman jurnal: https://leanconstruction.org/lean-construction-journal/doi-info-2021-53-155/
- DOI: https://doi.org/10.60164/47e7h7a1b
- Salinan UC Berkeley / eScholarship: https://escholarship.org/uc/item/5t90q8q9

Pasal yang dipakai:

| Metrik | Tempat di naskah 2020 | Yang diambil |
|---|---|---|
| Lima metrik kesehatan perencanaan | §8.2.14, hlm. 85 LCJ | CL, PPC, TA, TMR, Frequency of Plan Failures |
| PPC, TMR, TA, contoh himpunan | §8.2.14 + Gambar 21–22, hlm. 85–86 | rumus dan contoh 60% / 75% |
| Frequency of Plan Failures / Reasons for Variance | §8.2.14, hlm. 86 | klasifikasi kegagalan janji |
| Glosarium PPC, TA, TMR, CL, PRC | Glosarium naskah 2020 | definisi satu kalimat |
| PRC, Milestone Variance | §8.2.13 | Phase 2–3 |
| PPC 100% belum menjamin jadwal | §2 Why Last Planner, hlm. awal | alasan TA/TMR wajib |

### 1.2 Sumber sekunder — istilah RNC dan penandaan required

| Sumber | Pakai untuk |
|---|---|
| Power, W. & Taylor, D. (2019). Last Planner System and Percent Plan Complete: An Examination of Trade Contractor Performance. Lean Construction Journal 2019. PDF: https://leanconstruction.org/wp-content/uploads/2022/08/LCJ_19_016.pdf | Istilah **Reasons for Non-Completion (RNC)** dan tabel kategori. Benchmark 2020 tidak memakai kata RNC; isinya sama dengan Reasons for Variance. |
| Lagos, C. I. & Alarcón, L. F. Composition and impact of reasons for noncompletion in construction projects. Production Planning & Control. | RNC sebagai pecahnya aliran produksi; 2 dari 3 RNC biasanya terkendali kontraktor utama. |
| Christian, D. & Pereira, M. (2020). LPS Metrics 2.0. Laporan tim benchmark, dirujuk Ballard & Tommelein 2021. | Penandaan tugas scheduled sebagai critical / non-critical. Dipakai Phase 2 (CL, PRC). |
| Hamzeh, F. et al. Modeling the Last Planner System metrics. | Rumus operasional TA = anticipated / total on WWP; TMR = made-ready survived / earlier lookahead. Cocokkan ke Gambar 22, jangan ke varian lain jika bentrok. |

### 1.3 Kutipan yang mengikat rumus

Teks berikut disalin dari Ballard & Tommelein (2021), §8.2.14. Implementasi yang menyimpang dari kutipan ini ditolak pada uji U2.

**Lima metrik kesehatan (hlm. 85):**

> There are now five established metrics to measure the effectiveness of LPS implementation with the objective of promoting continuous improvement:  
> 1. Commitment Level (CL): Is capacity being allocated first to required tasks?  
> 2. Percent Plan Complete (PPC): Are commitments being kept?  
> 3. Tasks Anticipated (TA): Are operations being defined in time to identify and remove local constraints?  
> 4. Tasks Made Ready (TMR): Are constraints being removed early enough?  
> 5. Frequency of Plan Failures: Are we learning from plan failures how to prevent reoccurrence?

**PPC (hlm. 85–86):**

> PPC measures workflow reliability; i.e., the predictable release of work between work groups and is generally tracked on a weekly basis… PPC compares the tasks that were completed (Week-1 in Figure 21) against the tasks in the weekly work plan for that week (Week0). … PPC is calculated as the percentage of completed tasks relative to those that were planned at the beginning of the week.

Glosarium 2020 menambah: komitmen dihitung ya/tidak; tidak ada kredit parsial. PPC bukan ukuran progres fisik dan bukan produktivitas.

**TMR (hlm. 86):**

> TMR is the same measurement as PPC, only done earlier in the lookahead process, comparing the weekly work plan (Week0) against an earlier week in the lookahead window (Week n). TMR measures the ability of the team to identify and remove constraints ahead of the scheduled start of specific work tasks.

Glosarium: TMR mengukur persentase tugas pada rencana lebih awal untuk suatu minggu target yang masih termasuk pada rencana kemudian untuk minggu target yang sama.

**TA (hlm. 86):**

> TA measures the percentage of tasks for a target week that were anticipated in an earlier plan for that target week. … TA measures the instances when tasks drop into the WWP that were not shown at the beginning of our lookahead planning window.

**Contoh mengikat — Gambar 22 (hlm. 86):**

> Suppose the task set at Week1 is ABCDE and the task set in the weekly work plan (Week0) is ABEF… Only A, B, and E appear in both Week1 and Week0… so TMR = ABE/ABCDE = 60%. F is in the weekly work plan Week0, but was not in Week1, so TA = ABE/ABEF = 75%.

Uji U2 memakai angka ini apa adanya: TMR = 60, TA = 75.

**Geser horizon (hlm. 86):**

> As TMR and TA approach 100%, measurement shifts to comparison of Week0 against Week2. How far to extend TMR and TA is an empirical question at this point, as we are not aware that anyone has ever measured beyond Week1.

Itu dasar Phase 3: L2 dihitung setelah Phase 1; L3 hanya jika L1 sudah andal.

**Frequency of Plan Failures (hlm. 86):**

> Those not completed when planned are assigned to a category which describes in general the cause of the plan failure or variance. … These categories, often called “Reasons for Variance,” are useful to identify weaknesses in specific support systems or flows.

Di SiapKerja label layar: **Alasan tidak selesai (RNC)**. RNC = Frequency of Plan Failures. Jangan membuat kategori baru di Phase 1–3.

**Mengapa PPC saja tidak cukup (§2):**

> PPC could be 100%, productivity excellent, and a project still be falling behind schedule. … project progress toward scheduled completion dates rises and falls with PPC only when tasks are made ready in the right sequence and rate.

**CL dan PRC (glosarium + §8.2.13–8.2.14):**

- CL: persentase tugas *required* yang dijanjikan pada weekly work plan. Kapasitas dialokasikan dulu ke tugas required/critical.
- PRC: metode menilai keadaan proyek terhadap target; memberi bahan hitung hari lebih awal/lambat, yaitu tugas required yang tidak selesai minggu sebelumnya.

### 1.4 Pemetaan istilah SiapKerja ↔ naskah 2020

| Naskah 2020 | SiapKerja | Catatan |
|---|---|---|
| Week0 | WWP minggu \(T\) (`state.contractor.wwp`) | janji yang dikunci `lockWwp()` |
| Week-1 | status WWP setelah huddle + Learning | `state.contractor.ppc` status `done` / `failed` |
| Week1 (akhir lookahead sebelum eksekusi) | slot L1 (`lookSlots` rel `L1`) | foto ke `lookArchive` |
| Week2, Week3, … | slot L2, L3, L4 | diarsip Phase 1, dihitung Phase 3 |
| Reasons for Variance / plan failures | `problemRegistry` + `problemFrequency` | dilabel RNC |
| Required / critical tasks | belum ada | Phase 2: boolean `required` |
| Workable backlog | `backlogWorkable` + promo | Phase 2: `required: false` |
| Milestone Variance | belum ada | Phase 3 ringkas per fase |
| Laporan Make-Ready (siap / dijanjikan / terbuka) | sudah ada | **bukan** TMR |

---

## 2. Peta fase

| Fase | Isi | Syarat mulai | Hasil di layar |
|---|---|---|---|
| **Phase 1** | Foto jendela L1–L4; TA₁; TMR₁; RNC minggu ini + kumulatif | Sekarang | Learning, Laporan, ringkasan Owner |
| **Phase 2** | Tanda `required`; CL; PRC | U1–U9 lulus | Kartu CL dan PRC; kolom tabel riwayat |
| **Phase 3** | TA₂/TMR₂; TA₃/TMR₃ jika TA₁ dan TMR₁ ≥ 90 dua minggu beruntun; MV ringkas | Uji Phase 2 lulus; `lookArchive` ≥ 3 minggu | Kolom L2 (L3 jika syarat terpenuhi); daftar MV fase |

Make-ready per L1–L4 tidak diganti di fase mana pun.

| Kode | Nama di antarmuka | Phase 1 | Phase 2 | Phase 3 |
|---|---|---|---|---|
| PPC | PPC | tetap | tetap | tetap |
| RNC | Alasan tidak selesai (RNC) | relabel + angka minggu | tetap | tetap |
| TA₁ / TMR₁ | Tugas diantisipasi / dibuat siap (L1) | hitung | tetap | tetap |
| CL | Commitment Level | tempat field saja | hitung | tetap |
| PRC | Percent Required Complete | tidak | hitung | tetap |
| TA₂ / TMR₂ | pembanding L2 | arsip | arsip | hitung |
| MV | Milestone Variance | tidak | tidak | hitung ringkas |

---

## 3. Rumus yang diimplementasikan

Minggu eksekusi berjalan = \(T\) (`playWeek` / `targetExecWeek`).

Himpunan memakai **kunci sticky** (pasal 4), bukan pecahan harian WWP.

### 3.1 PPC — sudah ada, jangan diubah

\[
\mathrm{PPC}=\frac{\text{jumlah item WWP berstatus }done}{\text{jumlah item WWP}}
\]

Tanpa kredit parsial. Satu sticky tiga hari yang salah satu gagal: item gagal itu `failed`, item hari lain mengikuti statusnya sendiri; PPC tetap berbasis item WWP seperti sekarang.

### 3.2 TMR₁ dan TA₁ — Phase 1, Gambar 22

L1\(_T\) = kunci sticky pada slot L1 saat foto minggu \(T\).  
WWP\(_T\) = kunci sticky unik pada `wwp` minggu \(T\).

\[
\mathrm{TMR}_1=\frac{|\mathrm{L1}_T\cap\mathrm{WWP}_T|}{|\mathrm{L1}_T|}
\qquad
\mathrm{TA}_1=\frac{|\mathrm{L1}_T\cap\mathrm{WWP}_T|}{|\mathrm{WWP}_T|}
\]

Penyebut 0 → `null`, tampil "—", bukan 0.

Contoh wajib (Gambar 22):

| Himpunan | Isi | Ukuran |
|---|---|---|
| L1 (Week1) | A B C D E | 5 |
| WWP (Week0) | A B E F | 4 |
| Irisan | A B E | 3 |

TMR = 3/5 = 60%. TA = 3/4 = 75%.  
F tidak ada di L1 (sisa minggu lalu, prioritas baru, atau pekerjaan tak terduga). C dan D ada di L1 tetapi tidak masuk janji.

### 3.3 RNC — Phase 1

Satu item WWP `failed` = satu RNC, satu kategori. Kategori yang sudah ada:

```
info        Gambar / info
material    Material
labor       Tukang
access      Akses / ruang
prereq      Pekerjaan sebelumnya
weather     Cuaca
lain        Lainnya
```

### 3.4 CL dan PRC — Phase 2

\[
\mathrm{CL}=\frac{|\text{required di WWP}_T|}{|\text{required di L1}_T|}
\qquad
\mathrm{PRC}=\frac{|\text{required di WWP}_T\text{ berstatus }done|}{|\text{required di WWP}_T|}
\]

Promo tidak masuk penyebut CL. PPC tetap atas seluruh janji.

### 3.5 TAₙ / TMRₙ — Phase 3

Foto minggu \(T-n+1\), slot \(L_n\), dibanding WWP minggu target yang `abs`-nya sama.

\[
\mathrm{TMR}_n=\frac{|L_n\cap\mathrm{WWP}_T|}{|L_n|}
\qquad
\mathrm{TA}_n=\frac{|L_n\cap\mathrm{WWP}_T|}{|\mathrm{WWP}_T|}
\]

TA₃/TMR₃ hanya jika TA₁ ≥ 90 dan TMR₁ ≥ 90 pada dua minggu tertutup beruntun.

---

## 4. Kunci identitas tugas

Pembanding himpunan memakai kunci sticky.

```js
stickyKey(item) {
  const id = item && (item.stickyId || item.workId || item.id);
  if (id) return String(id);
  const pid = item && (item.parentId || this._workType(item));
  const z = this.prettyZone(item && item.zoneLabel);
  return (pid || '') + '|' + (z || '');
}
```

Satu sticky yang dipecah beberapa hari di WWP = **satu** anggota himpunan. Carry-over unfinished dan `fromRemainder` memakai kunci sticky induk. Jangan memakai `item.id` pecahan harian.

Letakkan fungsi ini dekat `_zoneRoot` / `_makeWwpItem`.

---

## 5. Perubahan state (Phase 1)

Sumber: `emptyContractor()` di `siapkerja/index.html`.

### 5.1 Field baru

```js
lookArchive: [],
```

### 5.2 Entri `lookArchive`

```js
{
  week: 3,
  offset: 2,
  slots: {
    L1: { abs: 3, keys: ["s12", "s15"] },
    L2: { abs: 4, keys: ["s18"] },
    L3: { abs: 5, keys: [] },
    L4: { abs: 6, keys: ["s22"] }
  }
}
```

`keys` = `stickyKey` unik dari `lookSlots[i].stickies`. Satu `week` satu entri; foto ulang menimpa.

Phase 2 boleh menambah `items: [{ key, required }]` tanpa menghapus `keys`.

### 5.3 `weeklyProgress[]`

Sekarang: `{ week, planned, done, ppc, note, teamPpc }`.

Phase 1 menambah:

```js
{
  week, planned, done, ppc, note, teamPpc,
  ta1: 75,
  tmr1: 60,
  taDenom: 4,
  tmrDenom: 5,
  overlap: 3,
  rncCount: 2,
  rncByType: { material: 1, weather: 1 }
}
```

JSON lama tanpa field ini tetap dibuka. `null` tampil "—".

### 5.4 `execArchive[]`

Objek di `lockLearning()` (sekitar baris 5512) ditambah `lookSlots`, `ta1`, `tmr1`, `rncCount`, `rncByType`.

---

## 6. Foto jendela

```js
snapshotLookahead() {
  const week = this.targetExecWeek;
  const slots = {};
  for (const s of (this.lookSlots || [])) {
    const keys = [];
    const seen = new Set();
    for (const st of (s.stickies || [])) {
      const k = this.stickyKey(st);
      if (!k || seen.has(k)) continue;
      seen.add(k);
      keys.push(k);
    }
    slots[s.rel] = { abs: s.abs, keys };
  }
  const list = (this.state.contractor.lookArchive || []).filter(x => Number(x.week) !== week);
  list.push({
    week,
    offset: Number(this.state.contractor.lookOffset) || 0,
    slots
  });
  list.sort((a, b) => a.week - b.week);
  this.state.contractor.lookArchive = list;
}
```

Panggil sebelum jendela berubah:

1. Akhir `lockWwp()` — setelah `wwp` final, sebelum `wwpLocked = true`.
2. Awal `rollLookahead()` — sebelum `lookOffset += 1` dan sebelum `wwp = []`. Entri minggu yang sama ditimpa.

Jangan memfoto di `lockLearning()` setelah WWP dikosongkan atau setelah offset bergeser.

---

## 7. Fungsi hitung Phase 1

```js
wwpStickyKeys(wwp) {
  const seen = new Set();
  for (const it of (wwp || [])) {
    const k = this.stickyKey(it);
    if (k) seen.add(k);
  }
  return seen;
}

lookKeysForWeek(targetWeek, rel) {
  const row = (this.state.contractor.lookArchive || [])
    .find(x => Number(x.week) === Number(targetWeek));
  const keys = row && row.slots && row.slots[rel] && row.slots[rel].keys;
  return new Set(keys || []);
}

computeTaTmr(targetWeek, wwp) {
  const l1 = this.lookKeysForWeek(targetWeek, 'L1');
  const will = this.wwpStickyKeys(wwp);
  let overlap = 0;
  will.forEach(k => { if (l1.has(k)) overlap += 1; });
  return {
    overlap,
    taDenom: will.size,
    tmrDenom: l1.size,
    ta1: will.size ? Math.round(100 * overlap / will.size) : null,
    tmr1: l1.size ? Math.round(100 * overlap / l1.size) : null
  };
}

rncWeekStats(week, ppc, wwp) {
  const failed = (ppc || []).filter(p => p.status === 'failed');
  const by = {};
  for (const p of failed) {
    const t = p.reason || 'lain';
    by[t] = (by[t] || 0) + 1;
  }
  return { rncCount: failed.length, rncByType: by };
}
```

Phase 1 hanya `'L1'`. Tetap tulis `problemRegistry` seperti sekarang. Jangan dobel-catat `workId` yang sudah ada untuk minggu itu.

---

## 8. Titik sunting `lockLearning()`

Setelah PPC dihitung, sebelum `weeklyProgress.push`:

```js
const metrics = this.computeTaTmr(week, items);
const rnc = this.rncWeekStats(week, ppc, items);
```

Masukkan `ta1`, `tmr1`, `taDenom`, `tmrDenom`, `overlap`, `rncCount`, `rncByType` ke `weeklyProgress` dan `execArchive`.

Jika `lookArchive` minggu itu kosong, panggil `snapshotLookahead()` sekali lalu hitung. Jika L1 kosong, TA/TMR = `null`.

---

## 9. Getter tampilan

Jangan hitung di templat.

```js
get learningLookMetrics() {
  const week = this.playWeek;
  const row = (this.state.contractor.weeklyProgress || [])
    .find(r => Number(r.week) === week);
  if (row && (row.ta1 != null || row.tmr1 != null)) {
    return { ta1: row.ta1, tmr1: row.tmr1, overlap: row.overlap, taDenom: row.taDenom, tmrDenom: row.tmrDenom };
  }
  return this.computeTaTmr(week, this.state.contractor.wwp || []);
}

get lookMetricBars() {
  const n = Math.max(1, this.negoWeeks);
  const by = {};
  for (const r of (this.state.contractor.weeklyProgress || [])) by[Number(r.week)] = r;
  return Array.from({ length: n }, (_, i) => {
    const w = i + 1;
    const row = by[w];
    return {
      week: w,
      ppc: row ? Number(row.ppc) || 0 : 0,
      ta1: row && row.ta1 != null ? Number(row.ta1) : null,
      tmr1: row && row.tmr1 != null ? Number(row.tmr1) : null,
      rncCount: row ? Number(row.rncCount) || 0 : 0,
      hasData: !!row
    };
  });
}

get rncThisWeek() {
  const week = this.playWeek;
  const row = (this.state.contractor.weeklyProgress || []).find(r => Number(r.week) === week);
  if (row && row.rncByType) {
    return Object.keys(row.rncByType)
      .map(type => ({ type, count: row.rncByType[type] }))
      .sort((a, b) => b.count - a.count);
  }
  return (this.state.contractor.problemRegistry || [])
    .filter(e => Number(e.week) === week)
    .reduce((acc, e) => {
      const t = e.type || 'lain';
      const hit = acc.find(x => x.type === t);
      if (hit) hit.count += 1;
      else acc.push({ type: t, count: 1 });
      return acc;
    }, [])
    .sort((a, b) => b.count - a.count);
}
```

---

## 10. Perubahan antarmuka Phase 1

### 10.1 Learning (`contractor-learning`)

Di bawah kartu Direncanakan / Selesai / PPC, tiga kartu: TMR₁, TA₁, RNC minggu ini.

Bantuan satu baris:

- TMR: bagian pekerjaan di L1 yang masuk janji minggu ini.
- TA: bagian janji minggu ini yang sudah terlihat di L1.
- RNC: jumlah janji yang tidak selesai, menurut kategori.

Judul blok "Alasan variansi (reasons for variance)" menjadi "Alasan tidak selesai (RNC)". Isi batang dan daftar tidak diubah.

### 10.2 Laporan (`contractor-progress`)

1. Kartu di samping PPC: TMR, TA, RNC minggu terakhir.
2. Tabel riwayat: M, PPC, TMR, TA, jumlah RNC. Sumber `lookMetricBars`.
3. "Top klasifikasi masalah" menjadi "RNC kumulatif".
4. `ownerReportText` setelah PPC: `TMR n%. TA n%. RNC minggu ini k.` Jika `null`: `TMR/TA belum terukur`.

### 10.3 Jangan ubah

Owner, Desainer, Pull, Look-ahead, WWP, Huddle, Laporan Make-Ready, kuesioner, header UJI COBA.

---

## 11. Urutan kerja Phase 1 di kode

1. Tambah `stickyKey`, `snapshotLookahead`, `lookKeysForWeek`, `wwpStickyKeys`, `computeTaTmr`, `rncWeekStats`.
2. Tambah `lookArchive: []` di `emptyContractor()`.
3. Panggil `snapshotLookahead()` di `lockWwp()` dan di awal `rollLookahead()`.
4. Perluas objek `lockLearning()` untuk `weeklyProgress` dan `execArchive`.
5. Getter `learningLookMetrics`, `lookMetricBars`, `rncThisWeek`.
6. Markup Learning (sekitar 1790–1858), Laporan (sekitar 1940–2125), `ownerReportText` (sekitar 3211).
7. `exportJSON()` / `save()` menyimpan seluruh `this.state`; tidak perlu diubah jika field ada di `state.contractor`.

---

## 12. Sesi lama dan uji Phase 1

JSON tanpa `lookArchive` tetap terbuka. PPC dan RNC kumulatif dari `problemRegistry` tetap tampil. TA/TMR minggu tertutup tanpa foto = "—". Jangan mengarang L1 masa lalu dari `execArchive.wwp`.

Proyek Type-36, durasi kontrak ≥ 3 minggu.

**U1.** Kunci WWP minggu 1. `lookArchive` punya `week === 1` dan `slots.L1.keys.length` sama dengan sticky unik L1 di layar.

**U2.** L1 = {A,B,C,D,E}, WWP = {A,B,E,F}. Setelah `lockLearning`, `tmr1 === 60` dan `ta1 === 75`. Ini contoh Gambar 22 Ballard & Tommelein (2021, hlm. 86).

**U3.** Satu sticky tiga hari di WWP. Himpunan WWP bertambah 1, bukan 3.

**U4.** Item gagal M1 tampil di WWP M2 dengan kunci sama. Jika ada di L1 M2, masuk irisan M2.

**U5.** WWP terkunci tanpa foto L1. TA dan TMR = "—". PPC tetap angka.

**U6.** Dua item gagal, `material` dan `weather`. `rncCount === 2`. Pareto memuat keduanya.

**U7.** `rollLookahead` menaikkan `lookOffset` dan tidak menghapus arsip M1.

**U8.** "Salin ringkasan" memuat PPC dan, jika ada, TMR, TA, RNC.

**U9.** PPC, Kurva S, `progressLocks` tidak berubah perilakunya.

---

## 13. Phase 2 — CL dan PRC

Jangan kerjakan sebelum U1–U9 lulus. Acuan: §8.2.14 CL; §8.2.13 PRC; Christian & Pereira (2020) via Ballard & Tommelein (2021).

### 13.1 Tanda `required`

`isRequired(sticky, week)`:

1. `true` jika `Number(sticky.startWeek) === week` dan sticky bukan hasil promo / tidak ada di `promoUsed`.
2. `true` jika carry-over unfinished dari item `required === true` minggu sebelumnya.
3. `false` jika masuk WWP lewat promo.
4. `false` jika `startWeek > week`.

Tulis `required` ke item saat `_makeWwpItem` dan `confirmPromo` (`required: false`). JSON harus bisa dihitung ulang.

Foto L1 (boleh L2–L4) ditambah, `keys` tetap:

```js
items: [
  { key: "s12", required: true },
  { key: "s15", required: false }
]
```

### 13.2 Field `weeklyProgress`

`cl`, `prc`, `clDenom`, `clNumer`, `prcDenom`, `prcNumer` (integer atau `null`).

### 13.3 Antarmuka

Learning: kartu CL dan PRC. Laporan: dua kolom. Owner: `CL n%. PRC n%.`

Bantuan: CL = bagian pekerjaan wajib di L1 yang dijanjikan minggu ini. PRC = bagian pekerjaan wajib yang dijanjikan dan selesai.

### 13.4 Uji Phase 2

**U10.** L1: 5 required + 2 non-required. WWP: 4 required + 1 promo. `cl === 80`.

**U11.** 3 dari 4 required di WWP selesai. `prc === 75`. PPC dihitung atas 5 janji.

**U12.** Semua item WWP promo. `prc === null` jika tidak ada required di WWP.

**U13.** JSON Phase 1 tanpa `required`: CL/PRC = "—" sampai WWP dikunci ulang.

---

## 14. Phase 3 — TA/TMR horizon lebih jauh dan MV

Jangan kerjakan sebelum uji Phase 2 lulus. Acuan: Gambar 21–22 dan kalimat "measurement shifts to … Week2" (hlm. 86); §8.2.13 Milestone Variance.

### 14.1 TAₙ / TMRₙ

Pakai `lookKeysForWeek(weekFoto, 'L2')` dengan `slots.L2.abs === T`. Field: `ta2`, `tmr2`, `ta3`, `tmr3`. Kolom L3 hanya jika syarat geser terpenuhi.

### 14.2 Milestone Variance ringkas

Bukan mesin CPM baru. Per fase di `phasesView` yang jendelanya sudah berjalan:

- `shouldEnd` = `finishWeek`
- `remainingRequired` = sticky required fase itu yang belum `done`
- `mvWeeks` = 0 jika sisa 0 dan `playWeek <= shouldEnd`; `playWeek - shouldEnd` jika sudah lewat dan masih ada sisa; `null` jika fase belum mulai

Daftar di Laporan: nama fase, minggu selesai rencana, sisa required, MV. Masuk ringkasan Owner hanya jika MV ≠ 0.

### 14.3 Uji Phase 3

**U14.** Foto M1 `slots.L2.keys = {A,B,C,D}`. WWP M2 = {A,B,E}. `tmr2 === 50`, `ta2 === 67` (pembulatan).

**U15.** Minggu 1–2 TA₁ atau TMR₁ < 90. Kolom L3 tidak tampil.

**U16.** Fase pondasi `finishWeek = 3`, pada M4 masih 2 required belum selesai. MV = +1 minggu.

**U17.** `lookArchive` < 2 entri. TA₂/TMR₂ = "—". Tidak error.

---

## 15. Di luar ketiga fase

- Kategori RNC baru.
- Memindah logika ke `js/modules/` atau menghidupkan `js/state.js`.
- Mengubah kuesioner, kecuali revisi instrumen terpisah nanti untuk satu butir pengamat tentang pekerjaan wajib versus backlog.
- Mengganti Laporan Make-Ready dengan TMR.

---

## 16. Daftar pustaka singkat

Ballard, G. & Tommelein, I. (2021). 2020 Current Process Benchmark for the Last Planner System of Project Planning and Control. *Lean Construction Journal*, 53–155. https://doi.org/10.60164/47e7h7a1b  
PDF: https://leanconstruction.org/wp-content/uploads/2022/08/LCJ_21_001.pdf

Ballard, G. & Tommelein, I. (2016). Current Process Benchmark for the Last Planner System. *Lean Construction Journal*, 57–89. (pendahulu; definisi PPC dan peringatan PPC 100% sudah ada di sini.)

Christian, D. & Pereira, M. (2020). LPS Metrics 2.0. Laporan tim penyusun benchmark 2020, dirujuk dalam Ballard & Tommelein (2021).

Power, W. & Taylor, D. (2019). Last Planner System and Percent Plan Complete: An Examination of Trade Contractor Performance. *Lean Construction Journal*. https://leanconstruction.org/wp-content/uploads/2022/08/LCJ_19_016.pdf
)
