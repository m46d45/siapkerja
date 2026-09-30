/* Self-test Phase 1 (U2, U3, U5, U6) — jalankan: node js/metrics-phase1.selftest.js */
function stickyKey(item) {
  const id = item && (item.stickyId || item.workId || item.id);
  if (id) return String(id);
  return (item.parentId || '') + '|' + (item.zoneLabel || '');
}
function wwpStickyKeys(wwp) {
  const seen = new Set();
  for (const it of wwp || []) {
    const k = stickyKey(it);
    if (k) seen.add(k);
  }
  return seen;
}
function computeTaTmr(l1Arr, wwp) {
  const l1 = new Set(l1Arr);
  const will = wwpStickyKeys(wwp);
  let overlap = 0;
  will.forEach((k) => { if (l1.has(k)) overlap += 1; });
  if (!l1.size) return { overlap: 0, taDenom: will.size, tmrDenom: 0, ta1: null, tmr1: null };
  return {
    overlap,
    taDenom: will.size,
    tmrDenom: l1.size,
    ta1: will.size ? Math.round((100 * overlap) / will.size) : null,
    tmr1: Math.round((100 * overlap) / l1.size),
  };
}
function rncWeekStats(ppc) {
  const failed = (ppc || []).filter((p) => p.status === 'failed');
  const by = {};
  for (const p of failed) {
    const t = p.reason || 'lain';
    by[t] = (by[t] || 0) + 1;
  }
  return { rncCount: failed.length, rncByType: by };
}

let fail = 0;
function assert(name, cond, detail) {
  if (cond) console.log('PASS', name);
  else { console.log('FAIL', name, detail || ''); fail += 1; }
}

const u2 = computeTaTmr(['A', 'B', 'C', 'D', 'E'], [
  { workId: 'A' }, { workId: 'B' }, { workId: 'E' }, { workId: 'F' },
]);
assert('U2 Gambar22 TMR=60 TA=75', u2.tmr1 === 60 && u2.ta1 === 75, u2);

const u3 = wwpStickyKeys([
  { id: 'wwp1', workId: 's12' },
  { id: 'wwp2', workId: 's12' },
  { id: 'wwp3', workId: 's12' },
]);
assert('U3 sticky pecah 3 hari = 1 kunci', u3.size === 1, u3.size);

const u5 = computeTaTmr([], [{ workId: 'A' }]);
assert('U5 L1 kosong → TA/TMR null', u5.ta1 === null && u5.tmr1 === null, u5);

const u6 = rncWeekStats([
  { status: 'failed', reason: 'material' },
  { status: 'failed', reason: 'weather' },
  { status: 'done' },
]);
assert('U6 rncCount=2 material+weather', u6.rncCount === 2 && u6.rncByType.material === 1 && u6.rncByType.weather === 1, u6);

process.exit(fail ? 1 : 0);
