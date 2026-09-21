/* SiapKerja! 1.19.2 — fungsi murni & state I/O */

function budgetMid(level, quality) {
  const b = BB[level] || BB.standard;
  const m = quality === 'premium' ? 1.2 : 1;
  return Math.round(((b.min + b.max) / 2) * m);
}
function safeBid(oe) { return Math.round((oe / 1.1) * 10) / 10; }

function buildPlan(totalWeeks, midJt) {
  const byId = Object.fromEntries(WORKS.map(w => [w.id, { ...w }]));
  const start = {};
  function startOf(id) {
    if (start[id] != null) return start[id];
    const a = byId[id];
    start[id] = a.pred.length === 0 ? 0 : Math.max(...a.pred.map(p => startOf(p) + byId[p].dur));
    return start[id];
  }
  WORKS.forEach(w => startOf(w.id));
  const rawEnd = Math.max(...WORKS.map(w => start[w.id] + w.dur));
  const scale = totalWeeks / rawEnd;
  const plan = WORKS.map(w => {
    const s0 = start[w.id] * scale;
    const e0 = (start[w.id] + w.dur) * scale;
    return {
      ...w, start0: s0, end0: e0,
      startWeek: Math.floor(s0) + 1,
      finishWeek: Math.min(totalWeeks, Math.max(Math.floor(s0) + 1, Math.ceil(e0 - 1e-6))),
      costJt: Math.round(midJt * w.weight * 10) / 10,
    };
  });
  const weekly = Array.from({ length: totalWeeks }, () => 0);
  for (const a of plan) {
    const dur = a.end0 - a.start0;
    for (let i = 0; i < totalWeeks; i++) {
      const ov = Math.max(0, Math.min(i + 1, a.end0) - Math.max(i, a.start0));
      if (ov > 0 && dur > 0) weekly[i] += a.weight * (ov / dur);
    }
  }
  const sum = weekly.reduce((s, x) => s + x, 0) || 1;
  let cum = 0;
  const curve = weekly.map((v, i) => {
    const wv = v / sum; cum += wv;
    return { week: i + 1, weeklyPct: Math.round(wv * 1000) / 10, planned: Math.round(cum * 1000) / 10, weeklyJt: Math.round(midJt * wv * 10) / 10, cumJt: Math.round(midJt * cum * 10) / 10 };
  });
  if (curve.length) { curve[curve.length - 1].planned = 100; curve[curve.length - 1].cumJt = midJt; }
  return { plan, curve };
}

function smoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

function makeChart(curve, maxJt, opts = {}) {
  const color = opts.color || '#C45C26';
  const fillId = opts.fillId || 'scFillN';
  const padL = 58, padR = 18, padT = 28, padB = 48;
  const W = 640, H = 292;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const n = Math.max(1, (curve || []).length);
  const yMode = opts.yMode || 'rp';
  const ymax = yMode === 'pct' ? 100 : Math.max(1, maxJt || 1);
  const yVal = (p) => yMode === 'pct' ? Number(p && p.planned) || 0 : Number(p && p.cumJt) || 0;
  const xOf = (week) => padL + (week / n) * innerW;
  const yOf = (v) => padT + (1 - v / ymax) * innerH;
  const pts = [{ week: 0, planned: 0, cumJt: 0, x: xOf(0), y: yOf(0) }].concat(
    (curve || []).map((p) => ({
      ...p,
      x: xOf(p.week),
      y: yOf(yVal(p)),
    }))
  );
  const last = pts[pts.length - 1];
  const line = smoothPath(pts);
  const area = line + ` L ${last.x} ${yOf(0)} L ${padL} ${yOf(0)} Z`;
  const yFracs = [0, 0.25, 0.5, 0.75, 1];
  const xWeeks = [];
  for (let w = 0; w <= n; w++) if (w === 0 || w === n || w % 2 === 0) xWeeks.push(w);

  let grid = '';
  for (const f of yFracs) {
    const y = yOf(ymax * f);
    const label = yMode === 'pct' ? (Math.round(f * 100) + '%') : String(Math.round(ymax * f));
    grid += `<line x1="${padL}" x2="${W - padR}" y1="${y}" y2="${y}" stroke="#E8E0D5" stroke-width="1"/>`;
    grid += `<line x1="${padL - 4}" x2="${padL}" y1="${y}" y2="${y}" stroke="#8B5E3C" stroke-width="1.4"/>`;
    grid += `<text x="${padL - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="#44403C" font-family="ui-sans-serif,system-ui,sans-serif">${label}</text>`;
  }
  let xt = '';
  for (const w of xWeeks) {
    const x = xOf(w);
    xt += `<line x1="${x}" x2="${x}" y1="${yOf(0)}" y2="${yOf(0) + 5}" stroke="#8B5E3C" stroke-width="1.4"/>`;
    xt += `<text x="${x}" y="${yOf(0) + 18}" text-anchor="middle" font-size="11" fill="#44403C" font-family="ui-sans-serif,system-ui,sans-serif">${w}</text>`;
  }
  let dots = '';
  for (const d of pts) {
    if (d.week === 0) continue;
    dots += `<circle cx="${d.x.toFixed(1)}" cy="${d.y.toFixed(1)}" r="3.1" fill="#9A4519" stroke="#FFFcf8" stroke-width="1.2"><title>Mgg ${d.week} · rencana ${d.planned}%</title></circle>`;
  }

  let actualMarkup = '';
  const actual = opts.actual || [];
  if (actual.length) {
    const apts = [{ week: 0, cumJt: 0, x: xOf(0), y: yOf(0) }].concat(
      actual.map((p) => ({
        ...p,
        x: xOf(p.week),
        y: yOf(yVal(p)),
      }))
    );
    const aline = smoothPath(apts);
    actualMarkup += `<path d="${aline}" fill="none" stroke="#15803D" stroke-width="2.6" stroke-dasharray="7 5" stroke-linecap="round" stroke-linejoin="round"></path>`;
    for (const d of apts) {
      if (!d.week) continue;
      actualMarkup += `<circle cx="${d.x.toFixed(1)}" cy="${d.y.toFixed(1)}" r="3.3" fill="#15803D" stroke="#FFFcf8" stroke-width="1.2"><title>Mgg ${d.week} · aktual ${d.planned}%</title></circle>`;
    }
  }

  let mark = '';
  for (const m of (opts.markers || [])) {
    const w = Number(m.week);
    if (!w || w < 1 || w > n) continue;
    const x = xOf(w);
    const col = m.color || '#B45309';
    const lab = String(m.label || ('M' + w)).replace(/&/g, '&').replace(/</g, '<');
    mark += `<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${padT}" y2="${yOf(0)}" stroke="${col}" stroke-width="1.3" stroke-dasharray="3 4" opacity="0.85"/>`;
    mark += `<text x="${(x + 5).toFixed(1)}" y="${padT + 12}" font-size="10" font-weight="700" fill="${col}" font-family="ui-sans-serif,system-ui,sans-serif">${lab}</text>`;
  }

  const yTitle = yMode === 'pct' ? 'Progres (%)' : 'Rp (juta)';
  const markup = `<svg class="w-full" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Kurva S">
    <defs>
      <linearGradient id="${fillId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0.02"/>
      </linearGradient>
    </defs>
    <text x="10" y="16" font-size="11" fill="#8B5E3C" font-weight="700" font-family="ui-sans-serif,system-ui,sans-serif">${yTitle}</text>
    ${grid}
    ${mark}
    <path d="${area}" fill="url(#${fillId})"></path>
    <path d="${line}" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"></path>
    ${actualMarkup}
    <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${yOf(0)}" stroke="#8B5E3C" stroke-width="1.6"/>
    <line x1="${padL}" y1="${yOf(0)}" x2="${W - padR}" y2="${yOf(0)}" stroke="#8B5E3C" stroke-width="1.6"/>
    ${xt}
    ${dots}
    <text x="${(padL + W - padR) / 2}" y="${H - 8}" text-anchor="middle" font-size="11" fill="#8B5E3C" font-weight="700" font-family="ui-sans-serif,system-ui,sans-serif">Minggu konstruksi</text>
  </svg>`;
  return { markup, padL, padR, line, area, ymax };
}

function houseSvg(showZones, selectedId, fillMap) {
  const ff = 'ui-sans-serif,system-ui,sans-serif';
  const rgba = (hex, a) => {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  };
  const room = (id, hex) => {
    if (!showZones) return '#FFFcf8';
    const st = fillMap && fillMap[id];
    if (st) {
      if (st.status === 'done') return rgba('#15803D', 0.38);
      if (st.status === 'carry') return rgba('#B91C1C', 0.22);
      if (st.status === 'planned') return rgba('#C45C26', 0.30);
      if (st.pct > 0) return rgba('#15803D', 0.12 + 0.28 * st.pct);
    }
    return rgba(hex, selectedId === id ? 0.48 : 0.22);
  };
  const lab = (txt, x, y, fill, size = 11) =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="${showZones ? 700 : 500}" fill="${fill}" font-family="${ff}">${txt}</text>`;
  const wH = (x1, x2, y) => `<rect x="${Math.min(x1,x2)}" y="${y - 2.5}" width="${Math.abs(x2 - x1)}" height="5" fill="#1C1917"/>`;
  const wV = (y1, y2, x) => `<rect x="${x - 2.5}" y="${Math.min(y1,y2)}" width="5" height="${Math.abs(y2 - y1)}" fill="#1C1917"/>`;
  // hinge (hx,hy), open tip (ox,oy), closed tip along wall (cx,cy)
  const door = (hx, hy, ox, oy, cx, cy, sweep) => {
    const r = Math.hypot(ox - hx, oy - hy);
    return `<path d="M ${cx} ${cy} A ${r.toFixed(1)} ${r.toFixed(1)} 0 0 ${sweep} ${ox} ${oy}" fill="rgba(196,92,38,.12)" stroke="#C45C26" stroke-width="1.15"/>
      <line x1="${hx}" y1="${hy}" x2="${ox}" y2="${oy}" stroke="#1C1917" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="${hx}" cy="${hy}" r="1.6" fill="#1C1917"/>`;
  };
  const winH = (x, w, y) => `<rect x="${x}" y="${y - 2.5}" width="${w}" height="5" fill="#FFFcf8"/><line x1="${x}" y1="${y}" x2="${x + w}" y2="${y}" stroke="#6B8AAB" stroke-width="2"/>`;
  const winV = (y, h, x) => `<rect x="${x - 2.5}" y="${y}" width="5" height="${h}" fill="#FFFcf8"/><line x1="${x}" y1="${y}" x2="${x}" y2="${y + h}" stroke="#6B8AAB" stroke-width="2"/>`;

  return `<svg viewBox="0 0 400 360" role="img" aria-label="Denah Type 36 dengan bukaan pintu">
    <defs>
      <pattern id="${fillMap ? 'hatchAtapStat' : 'hatchAtap'}" patternUnits="userSpaceOnUse" width="8" height="8">
        <path d="M0 8 L8 0" stroke="#15803D" stroke-width="1" opacity="0.45"/>
      </pattern>
    </defs>
    <rect x="10" y="10" width="380" height="340" fill="${showZones ? room('z1','#A0522D') : '#EFE8DC'}" stroke="#C4B8A8" stroke-dasharray="5 4" stroke-width="1.3"/>
    ${lab(showZones ? 'Z1 · SITE' : 'Pekarangan', 200, 26, showZones ? '#A0522D' : '#78716C', 10)}
    <rect x="50" y="54" width="296" height="256" fill="#E4D9CB"/>
    <!-- lantai: tamu + dapur menyatu (open plan), KM tertutup -->
    <rect x="48" y="50" width="148" height="128" fill="${room('z3','#C45C26')}"/>
    <rect x="196" y="50" width="148" height="64" fill="${room('z6','#7C3AED')}"/>
    <rect x="196" y="114" width="148" height="64" fill="${room('z6','#7C3AED')}"/>
    <rect x="48" y="178" width="148" height="128" fill="${room('z4','#EA580C')}"/>
    <rect x="196" y="178" width="148" height="128" fill="${room('z5','#D97706')}"/>
    ${showZones ? `<rect x="48" y="50" width="296" height="256" fill="url(#${fillMap ? 'hatchAtapStat' : 'hatchAtap'})" opacity="${selectedId==='z7' ? 0.45 : (fillMap && fillMap.z7 && fillMap.z7.status==='done' ? 0.28 : 0.12)}"/>` : ''}
    <!-- dinding luar: pintu depan saja, dapur ke luar = jendela -->
    ${wH(48, 100, 50)}${wH(140, 344, 50)}
    ${wV(50, 306, 48)}
    ${wH(48, 344, 306)}
    ${wV(50, 306, 344)}
    <!-- partisi: KM tertutup dari tamu; tamu↔dapur terbuka; KM↔dapur berpintu -->
    ${wV(50, 114, 196)}
    ${wH(48, 78, 178)}${wH(118, 230, 178)}${wH(270, 344, 178)}
    ${wV(178, 306, 196)}
    ${wH(196, 248, 114)}${wH(288, 344, 114)}
    ${showZones ? `<rect x="48" y="50" width="296" height="256" fill="none" stroke="${selectedId==='z2' ? '#8B5E3C' : 'transparent'}" stroke-width="6"/>` : ''}
    <!-- pintu: depan, kamar 1, kamar 2, KM dari dapur -->
    ${door(100, 50, 100, 90, 140, 50, 1)}
    ${door(78, 178, 78, 218, 118, 178, 1)}
    ${door(230, 178, 230, 218, 270, 178, 1)}
    ${door(248, 114, 248, 74, 288, 114, 0)}
    <!-- jendela luar -->
    ${winV(86, 32, 48)}
    ${winH(86, 36, 306)}
    ${winH(248, 36, 306)}
    ${winV(58, 24, 344)}
    ${winV(128, 32, 344)}
    ${lab(showZones ? 'Z3 · DEPAN' : 'Ruang Tamu', 122, 116, showZones ? '#9A4519' : '#57534E')}
    ${lab(showZones ? 'Z6 · SERVIS' : 'KM', 270, 80, showZones ? '#6D28D9' : '#57534E')}
    ${showZones ? '' : lab('Dapur (terbuka)', 270, 150, '#57534E')}
    ${lab(showZones ? 'Z4 · KAMAR 1' : 'Kamar 1', 122, 246, showZones ? '#C2410C' : '#57534E')}
    ${lab(showZones ? 'Z5 · KAMAR 2' : 'Kamar 2', 270, 246, showZones ? '#B45309' : '#57534E')}
    ${showZones ? lab('Z7 · ATAP', 200, 44, '#15803D', 10) : ''}
    ${showZones ? lab('Z2 · PONDASI', 200, 320, '#8B5E3C', 10) : ''}
    <text x="120" y="42" text-anchor="middle" font-size="8" fill="#8B5E3C" font-family="${ff}">pintu depan</text>
    <text x="54" y="338" font-size="9" fill="#A8A29E" font-family="${ff}">Type 36 · denah + bukaan</text>
    <text x="346" y="338" text-anchor="end" font-size="9" fill="#A8A29E" font-family="${ff}">U ↑</text>
  </svg>`;
}

function houseElevationSvg() {
  const ff = 'ui-sans-serif,system-ui,sans-serif';
  const W = 160, D = 138, H = 56, RH = 28, E = 14;
  const raw = (x, y, z) => {
    const u = W - x;
    return [u * 0.86 - z * 0.86, -u * 0.5 - z * 0.5 - y];
  };
  const keys = [
    [-E - 8, 0, -E - 16], [W + E + 8, 0, -E - 16], [W + E + 8, 0, D + E + 10], [-E - 8, 0, D + E + 10],
    [0, 0, 0], [W, 0, 0], [0, 0, D], [W, 0, D],
    [0, H, 0], [W, H, 0], [0, H, D], [W, H, D],
    [-E, H, -E], [W + E, H, -E], [-E, H, D + E], [W + E, H, D + E],
    [W / 2, H + RH, D / 2],
  ];
  let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
  for (const p of keys) {
    const [X, Y] = raw(...p);
    minX = Math.min(minX, X); maxX = Math.max(maxX, X);
    minY = Math.min(minY, Y); maxY = Math.max(maxY, Y);
  }
  const VB_W = 400, VB_H = 310, pad = 18;
  const sc = Math.min((VB_W - pad * 2) / (maxX - minX), (VB_H - pad * 2 - 16) / (maxY - minY));
  const ox = (VB_W - (maxX - minX) * sc) / 2 - minX * sc;
  const oy = pad + 4 - minY * sc;
  const iso = (x, y, z) => {
    const [X, Y] = raw(x, y, z);
    return [ox + X * sc, oy + Y * sc];
  };
  const pts = (arr) => arr.map(p => iso(p[0], p[1], p[2]).map(n => n.toFixed(1)).join(',')).join(' ');
  const poly = (arr, fill, sw = 1.45) =>
    `<polygon points="${pts(arr)}" fill="${fill}" stroke="#1C1917" stroke-width="${sw}" stroke-linejoin="round"/>`;
  const line = (a, b, sw = 1.1) => {
    const p = iso(...a), q = iso(...b);
    return `<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}" stroke="#1C1917" stroke-width="${sw}"/>`;
  };
  const Lx = 80;
  const x0 = -E, x1 = W + E, z0 = -E, z1 = D + E;
  const cz = D / 2, py = H + RH;
  const rx0 = W * 0.30, rx1 = W * 0.70;
  let out = `<svg viewBox="0 0 ${VB_W} ${VB_H}" role="img" aria-label="Axonometri Type 36 dari timur laut">
    <rect width="${VB_W}" height="${VB_H}" fill="#EFE8DC"/>`;
  out += poly([[-E - 8, 0, -E - 16], [W + E + 8, 0, -E - 16], [W + E + 8, 0, D + E + 10], [-E - 8, 0, D + E + 10]], '#D9CDB8', 0);
  out += poly([[0, 0, -16], [Lx, 0, -16], [Lx, 0, 0], [0, 0, 0]], '#CABBAA', 1.1);
  out += poly([[W, 0, 0], [W, H, 0], [W, H, D], [W, 0, D]], '#E8D4B8');
  out += poly([[W, 30, 7], [W, 44, 7], [W, 44, 20], [W, 30, 20]], '#FFFcf8');
  out += line([W, 37, 7], [W, 37, 20], 1);
  out += poly([[W, 18, 38], [W, 42, 38], [W, 42, 60], [W, 18, 60]], '#FFFcf8');
  out += line([W, 30, 38], [W, 30, 60], 1);
  out += poly([[0, 0, 0], [W, 0, 0], [W, H, 0], [0, H, 0]], '#F6E7D2');
  out += line([Lx, 0, 0], [Lx, H, 0], 1.05);
  out += poly([[18, 0, 0], [44, 0, 0], [44, 42, 0], [18, 42, 0]], '#6B3F24');
  const knob = iso(40, 20, 0);
  out += `<circle cx="${knob[0].toFixed(1)}" cy="${knob[1].toFixed(1)}" r="1.5" fill="#E8D5BC"/>`;
  out += poly([[x0, H - 3, z0], [x1, H - 3, z0], [x1, H, z0], [x0, H, z0]], '#6B3F24');
  out += poly([[x1, H - 3, z0], [x1, H - 3, z1], [x1, H, z1], [x1, H, z0]], '#5C341F');
  out += poly([[x0, H, z1], [x1, H, z1], [rx1, py, cz], [rx0, py, cz]], '#7A4A2A');
  out += poly([[x0, H, z0], [x0, H, z1], [rx0, py, cz]], '#8B5E3C');
  out += poly([[x1, H, z0], [x1, H, z1], [rx1, py, cz]], '#8B5E3C');
  out += poly([[x0, H, z0], [x1, H, z0], [rx1, py, cz], [rx0, py, cz]], '#A0522D');
  return out + `</svg>`;
}

function emptyNego() {
  return { bidPriceJt: null, bidDuration: null, bidQuality: 'standard', round: 0, maxRounds: 3, deal: false, lastResult: null, history: [], contract: null };
}
function emptyContractor() {
  return {
    pullLocked:false, selectedWork:null, constraints:[], reviewed:{},
    draftType:'material', draftNote:'',
    zonesLocked:false, zonesPreview:false, selectedZone:null, commitments:{},
    milestonesLocked:false, phaseWindows:{}, selectedMilestone:'pondasi', stickyWeeks:{},
    lookOffset:0, selectedLookRel:null, selectedLookWorkId:null,
    makeReady:[],
    wwp:[],
    ppc:[],
    weekClosed:false,
    wwpLocked:false,
    huddleDayIdx:0,
    huddleResults:{},
    followUps:[],
    huddleComplete:false,
    extendId:null,
    extendNote:'',
    extendDays:'1',
    extendType:'material',
    problemRegistry:[],
    weeklyProgress:[],
    scenarioApplied:[],
    learningNote:'',
    actualLog:[],
    progressLocks:[],
    weekRemainder:[],
    carryOver:[],
    scheduleUsed:[],
    wwpSnapshot:null,
    weekFailedTypes:[],
    execArchive:[],
  };
}

function evaluateOwner(owner, nego, oe) {
  const price = Number(nego.bidPriceJt);
  const dur = Number(nego.bidDuration);
  const q = nego.bidQuality;
  const target = safeBid(oe);
  const voIf10 = Math.round(price * 1.1 * 10) / 10;
  const voFits = voIf10 <= oe + 0.05;
  const ratio = price / oe;
  const dDur = dur - owner.constructionDuration;
  const issues = [];
  const praises = [];
  const prio = owner.priority;

  if (!(price > 0)) issues.push({ type:'cost', text:'Harga penawaran belum diisi.' });
  if (price > oe) issues.push({ type:'cost', text:'Penawaran melebihi Owner\'s Estimate.' });
  else if (!voFits) issues.push({ type:'cost', text:`VO +10% = Rp ${voIf10} jt, melebihi OE Rp ${oe} jt.` });
  else if (ratio < 0.82) issues.push({ type:'cost', text:'Terlalu murah — Owner curiga spek dipangkas atau klaim VO agresif.' });
  else if (Math.abs(price - target) <= oe * 0.03) praises.push('Harga menyisakan ~10% untuk pekerjaan tambah.');
  else if (price < target) praises.push('Harga di bawah OE/1,1 — ruang VO lebih longgar.');

  if (dDur > 0) issues.push({ type:'time', text:`Durasi molor ${dDur} minggu dari constraint Owner.` });
  else if (dDur < 0) praises.push(`Lebih cepat ${-dDur} minggu.`);
  else praises.push('Durasi sesuai constraint Owner.');

  if (owner.qualityLevel === 'premium' && q !== 'premium') issues.push({ type:'quality', text:'Owner menetapkan Premium — spek tidak boleh diturunkan.' });
  else if (q === 'premium' && owner.qualityLevel === 'standard') praises.push('Quality di atas constraint.');
  else praises.push('Quality sesuai Owner.');

  if (price > oe) {
    return { status:'reject', title:'Ditolak — di atas OE', body:'Owner tidak tanda tangan di atas OE. Tidak ada ruang pekerjaan tambah.', issues, praises, ask:{ field:'price', value:target, label:`Turunkan ke Rp ${target} jt (target aman).` } };
  }
  if (prio === 'time' && dDur > 0) {
    return { status:'counter', title:'Owner minta nego durasi', body:'Fokus Owner: TIME. Molor tidak diterima.', issues, praises, ask:{ field:'duration', value:owner.constructionDuration, label:`Kembalikan durasi ke ${owner.constructionDuration} minggu.` } };
  }
  if (prio === 'quality' && owner.qualityLevel === 'premium' && q !== 'premium') {
    return { status:'counter', title:'Owner minta pertahankan spek', body:'Fokus Owner: QUALITY. Jangan turunkan Premium demi harga.', issues, praises, ask:{ field:'quality', value:'premium', label:'Kembalikan Quality ke Premium.' } };
  }
  if (prio === 'cost' && !voFits && price <= oe) {
    return { status:'counter', title:'Owner minta turun harga', body:'Fokus Owner: COST. Harga terlalu dekat OE — pekerjaan tambah 10% akan overflow.', issues, praises, ask:{ field:'price', value:target, label:`Turunkan ke Rp ${target} jt (OE ÷ 1,1).` } };
  }
  if ((prio === 'cost' || prio === 'quality') && ratio < 0.82) {
    return { status:'counter', title:'Owner curiga harga dumping', body:'Terlalu murah. Owner khawatir kualitas dan klaim VO.', issues, praises, ask:{ field:'price', value:target, label:`Naikkan ke kisaran Rp ${target} jt.` } };
  }
  if (prio === 'quality' && !voFits) {
    return { status:'counter', title:'Catatan budget', body:'Quality OK, tapi tanpa cadangan VO 10% Owner tetap ragu.', issues, praises, ask:{ field:'price', value:target, label:`Sesuaikan ke Rp ${target} jt.` } };
  }

  const durationOk = dDur <= 0 || (prio !== 'time' && dDur <= 1);
  const qualityOk = !(owner.qualityLevel === 'premium' && q !== 'premium');
  if (price <= oe && durationOk && qualityOk && (voFits || prio !== 'cost')) {
    return { status:'accept', title:'Deal', body:'Owner menerima. Nilai kontrak dikunci; sisa OE jadi cadangan pekerjaan tambah.', issues, praises, ask:null };
  }
  if (issues.length) {
    return { status:'counter', title:'Owner minta penyesuaian', body:`Fokus Owner: ${prio.toUpperCase()}. Ada poin yang belum pas.`, issues, praises, ask:null };
  }
  return { status:'accept', title:'Deal', body:'Owner menerima penawaran.', issues, praises, ask:null };
}

function initState() {
  return {
    version: VER,
    currentStage: 'owner',
    owner: { designDuration:2, constructionDuration:8, qualityLevel:'standard', budgetLevel:'standard', priority:'time', plannedSCurve:[], workPlan:[], locked:false },
    designer: { designFreezeWeek:null, levelOfDetail:'standar', locked:false },
    negotiation: emptyNego(),
    contractor: emptyContractor(),
  };
}
function loadState() {
  try {
    const r = localStorage.getItem(SK);
    if (!r) return initState();
    const p = JSON.parse(r);
    if (p.version !== VER) return initState();
    if (!p.negotiation) p.negotiation = emptyNego();
    if (!p.contractor) p.contractor = emptyContractor();
    return p;
  } catch { return initState(); }
}
function saveState(s) { try { localStorage.setItem(SK, JSON.stringify(s)); } catch {} }
