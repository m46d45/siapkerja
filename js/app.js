/* SiapKerja! 1.19.2 — Alpine app */
document.addEventListener('alpine:init', () => {

Alpine.data('app', () => ({
  state: null,
  currentStage: 'owner',
  ZONES,
  TEAMS,
  TEAM_META,
  WWP_DAYS,
  PPC_REASONS,
  MANUAL,
  TRIAL_FORMS,
  TRIAL_BEAT,
  TRIAL_SETTINGS,
  FORM_LINKS,
  FORM_DEFS,
  manualFrom: null,
  manualFocus: null,
  trialFrom: null,
  trialFormId: 'pra',
  trialAnswers: {},
  huddleTimerLeft: 15 * 60,
  huddleTimerOn: false,
  scheduleDraft: null,
  _huddleTimerHandle: null,
  progressDraft: null,

  init() {
    this.state = loadState();
    if (!this.state.owner.budgetLevel) this.state.owner.budgetLevel = 'standard';
    this.state.owner.budgetJt = OWNER_BUDGET_JT;
    if (this.state.owner.priority === 'quality') this.state.owner.priority = 'time';
    const lodMap = { basic: 'cepat', detailed: 'standar', perfect: 'sempurna' };
    if (this.state.designer && lodMap[this.state.designer.levelOfDetail]) {
      this.state.designer.levelOfDetail = lodMap[this.state.designer.levelOfDetail];
    }
    if (this.state.designer && !LOD_FEE[this.state.designer.levelOfDetail]) {
      this.state.designer.levelOfDetail = 'standar';
    }
    if (!this.state.negotiation) this.state.negotiation = emptyNego();
    if (!this.state.contractor) this.state.contractor = emptyContractor();
    if (!this.state.contractor.stickyWeeks) this.state.contractor.stickyWeeks = {};
    if (!Array.isArray(this.state.contractor.carryOver)) this.state.contractor.carryOver = [];
    if (!Array.isArray(this.state.contractor.weekFailedTypes)) this.state.contractor.weekFailedTypes = [];
    if (!Array.isArray(this.state.contractor.actualLog)) this.state.contractor.actualLog = [];
    if (!Array.isArray(this.state.contractor.progressLocks)) this.state.contractor.progressLocks = [];
    this.currentStage = this.state.currentStage || 'owner';
    try {
      this.trialAnswers = JSON.parse(localStorage.getItem(TRIAL_ANS_KEY) || '{}') || {};
    } catch { this.trialAnswers = {}; }
    if (this.currentStage === 'contractor-pm') this.currentStage = 'contractor-master';
    this.recalcPlan();
    this._ensurePpcFromHuddle();
    this._syncDesignFreeze();
  },

  get oeJt() {
    const q = this.state.owner.qualityLevel === 'premium' ? 1.18 : 1;
    const w = Number(this.state.owner.constructionDuration) || 8;
    const t = w <= 12 ? 1.12 : (w >= 20 ? 0.95 : 1);
    return Math.round(OE_BASE_JT * q * t);
  },
  get ownerBudgetJt() { return OWNER_BUDGET_JT; },
  get lodKey() {
    const v = (this.state.designer && this.state.designer.levelOfDetail) || 'standar';
    if (v === 'basic') return 'cepat';
    if (v === 'detailed') return 'standar';
    if (v === 'perfect') return 'sempurna';
    return LOD_FEE[v] ? v : 'standar';
  },
  get designFeePct() { return LOD_FEE[this.lodKey] || 0.08; },
  get designFeeJt() { return Math.round(OWNER_BUDGET_JT * this.designFeePct); },
  get budgetUsedJt() { return this.designFeeJt + this.oeJt; },
  get budgetFit() {
    const used = this.budgetUsedJt;
    if (used > OWNER_BUDGET_JT) {
      return { title: 'Tembus budget', note: 'Fee + OE > 350', box: 'border-red-200 bg-red-50', tone: 'text-red-700' };
    }
    if (used >= OWNER_BUDGET_JT - 15) {
      return { title: 'Mepet budget', note: 'hampir 350', box: 'border-amber-300 bg-amber-50', tone: 'text-amber-800' };
    }
    return { title: 'Muat di budget', note: 'sisa ' + (OWNER_BUDGET_JT - used) + ' jt', box: 'border-forest/20 bg-forest-soft/40', tone: 'text-forest' };
  },
  get lodConstraintHint() {
    const n = (LOD_GIVEN[this.lodKey] || []).length;
    if (this.lodKey === 'cepat') return 'LOD cepat: ' + n + ' constraint given terbuka (gambar, tanah, MEP, spek). Mahasiswa akan banyak make-ready.';
    if (this.lodKey === 'sempurna') return 'LOD sempurna: ' + n + ' constraint given tersisa. Hampir semua dokumen lengkap.';
    return 'LOD standar: ' + n + ' constraint given — cukup untuk latihan make-ready.';
  },
  get budgetLevelLabel() { return ({ hemat:'Hemat', standard:'Standar', premium:'Premium' })[this.state.owner.budgetLevel] || this.state.owner.budgetLevel; },
  get budgetEstimateLabel() {
    const b = BB[this.state.owner.budgetLevel] || BB.standard;
    const m = this.state.owner.qualityLevel === 'premium' ? 1.2 : 1;
    return `Rp ${Math.round(b.min*m)}–${Math.round(b.max*m)} jt`;
  },
  get budgetMidLabel() { return `Rp ${this.oeJt} jt`; },
  get budgetMismatch() { return this.state.owner.qualityLevel === 'premium' && this.state.owner.budgetLevel === 'hemat'; },
  get safeBidJt() { return safeBid(this.oeJt); },
  get voPlus10() { return Math.round((Number(this.state.negotiation.bidPriceJt)||0) * 1.1 * 10) / 10; },
  get voFits() { return this.voPlus10 <= this.oeJt + 0.05; },
  get bidDeltaPct() {
    const p = Number(this.state.negotiation.bidPriceJt)||0;
    return this.oeJt ? Math.round((p - this.oeJt) / this.oeJt * 1000) / 10 : 0;
  },
  get bidDeltaLabel() {
    const d = this.bidDeltaPct;
    if (!d) return 'Setara OE';
    return (d < 0 ? '' : '+') + d + '% vs OE';
  },
  get negoBundle() {
    const n = this.state.negotiation;
    if (n.deal && n.contract && n.contract.sCurve && n.contract.sCurve.length) {
      return { curve: n.contract.sCurve, maxJt: n.contract.price, plan: n.contract.sCurve };
    }
    const weeks = Number(n.bidDuration) || this.state.owner.constructionDuration || 8;
    const price = Number(n.bidPriceJt) || this.safeBidJt;
    const { curve } = buildPlan(weeks, price);
    return { curve, maxJt: price, plan: curve };
  },
  get negoPlan() { return this.negoBundle.plan || []; },
  get negoChartSvg() {
    return makeChart(this.negoBundle.curve, this.negoBundle.maxJt, { color: '#C45C26', fillId: 'scFillNego' }).markup;
  },
  get negoChartSvgPm() {
    return makeChart(this.negoBundle.curve, this.negoBundle.maxJt, { color: '#2F6B4F', fillId: 'scFillPm' }).markup;
  },
  get negoWorkPlan() {
    const n = this.state.negotiation;
    if (n.deal && n.contract && n.contract.workPlan && n.contract.workPlan.length) return n.contract.workPlan;
    const weeks = Number(n.bidDuration) || this.state.owner.constructionDuration || 8;
    const price = Number(n.bidPriceJt) || this.safeBidJt;
    return buildPlan(weeks, price).plan;
  },
  get negoWeeks() {
    const n = this.state.negotiation;
    if (n.deal && n.contract) return Number(n.contract.duration) || 10;
    return Number(n.bidDuration) || this.state.owner.constructionDuration || 8;
  },
  get ganttWeekNums() {
    return Array.from({ length: Math.max(1, this.negoWeeks) }, (_, i) => i + 1);
  },
  ganttColClass(w) {
    const cls = [];
    if (w === this.playWeek) cls.push('bg-terra-soft/30');
    const sc = (SCENARIOS || []).find(s => Number(s.week) === Number(w));
    if (sc && sc.kind === 'weather') cls.push('bg-blue-50');
    else if (sc) cls.push('bg-amber-50');
    return cls.join(' ');
  },
  ganttHeadClass(w) {
    if (w === this.playWeek) return 'text-terra font-bold';
    const sc = (SCENARIOS || []).find(s => Number(s.week) === Number(w));
    if (sc && sc.kind === 'weather') return 'text-blue-700 font-bold';
    if (sc) return 'text-amber-800 font-bold';
    return 'text-ink-mute';
  },
  get ganttRows() {
    const weeks = Math.max(1, this.negoWeeks);
    return this.negoWorkPlan.map(w => {
      const s = Number(w.start0);
      const e = Number(w.end0);
      const left = (Number.isFinite(s) ? s : (w.startWeek - 1)) / weeks * 100;
      const dur = Number.isFinite(e) && Number.isFinite(s) ? (e - s) : Math.max(1, w.finishWeek - w.startWeek + 1);
      return {
        id: w.id, name: w.name, team: w.team, color: w.color,
        startWeek: w.startWeek, finishWeek: w.finishWeek, costJt: w.costJt,
        left: Math.max(0, left),
        width: Math.max(1.8, (dur / weeks) * 100),
      };
    });
  },
  get progressGanttRows() {
    const weeks = Math.max(1, this.negoWeeks);
    const play = this.targetExecWeek;
    const cells = this._zoneCells();
    const log = this._allExecCells();
    return this.ganttRows.map(row => {
      const pid = row.id;
      const fromLog = log.filter(x => (this._workType(x) || x.parentId) === pid && Number(x.week) > 0);
      const fromCells = cells.filter(c => c.parentId === pid && (c.status === 'done' || c.status === 'carry'));
      const weekSet = new Set();
      for (const e of fromLog) weekSet.add(Number(e.week));
      for (const c of fromCells) weekSet.add(Number(c.week));
      const wwp = (this.state.contractor && this.state.contractor.wwp) || [];
      if (wwp.some(it => (this._workType(it) || it.parentId) === pid)) weekSet.add(play);
      const list = [...weekSet].filter(w => w > 0).sort((a, b) => a - b);
      if (!list.length) {
        const planDur0 = Math.max(1, (Number(row.finishWeek) || 1) - (Number(row.startWeek) || 1) + 1);
        return {
          ...row,
          hasActual: false, actLeft: 0, actWidth: 0, actStart: null, actEnd: null, calWeeks: 0,
          delayed: false, slip: 0,
          planLeft: Math.max(0, (row.startWeek - 1) / weeks * 100),
          planWidth: Math.max(0.45, planDur0 / weeks * 100),
          earnedWeeks: 0, actPct: 0,
        };
      }
      const actStart = list[0];
      const actEnd = list[list.length - 1];
      const calWeeks = Math.max(1, actEnd - actStart + 1);
      const planDur = Math.max(1, (Number(row.finishWeek) || 1) - (Number(row.startWeek) || 1) + 1);
      const delayed = actStart > row.startWeek;
      return {
        ...row,
        hasActual: true,
        actStart,
        actEnd,
        calWeeks,
        delayed,
        slip: delayed ? (actStart - row.startWeek) : 0,
        planLeft: Math.max(0, (row.startWeek - 1) / weeks * 100),
        planWidth: Math.max(0.45, planDur / weeks * 100),
        earnedWeeks: calWeeks,
        actPct: Math.round(100 * calWeeks / planDur),
        actLeft: Math.max(0, (actStart - 1) / weeks * 100),
        actWidth: Math.max(0.45, (calWeeks / weeks) * 100),
      };
    });
  },
  get projectComplete() {
    const rows = this.progressGanttRows || [];
    if (rows.length < WORKS.length) return false;
    const close = rows.find(r => r.id === 'close');
    if (!close || !close.hasActual) return false;
    if (rows.some(r => !r.hasActual)) return false;
    const cells = this._zoneCells();
    if (cells.some(c => c.status === 'carry')) return false;
    const pct = Number(this.physicalProgress && this.physicalProgress.pct) || 0;
    return pct >= 99.5;
  },
  get projectCloseStats() {
    const contractWeeks = Number((this.state.negotiation.contract || {}).duration) || this.negoWeeks || 10;
    const rows = this.progressGanttRows || [];
    const ends = rows.filter(r => r.hasActual && r.actEnd).map(r => Number(r.actEnd));
    const actualWeeks = ends.length ? Math.max(...ends) : (this.playWeek || 1);
    const saved = contractWeeks - actualWeeks;
    return {
      contractWeeks,
      actualWeeks,
      contractWorkDays: contractWeeks * 6,
      actualWorkDays: actualWeeks * 6,
      contractCalDays: contractWeeks * 7,
      actualCalDays: actualWeeks * 7,
      savedWeeks: saved,
      ahead: saved > 0,
      late: saved < 0,
    };
  },
  _mergedActualLog() {
    const log = [...((this.state.contractor && this.state.contractor.actualLog) || [])];
    const loggedWeeks = new Set(log.map(x => Number(x.week)));
    const cur = this.targetExecWeek;
    if (!loggedWeeks.has(cur)) {
      const ppc = (this.state.contractor && this.state.contractor.ppc) || [];
      for (const item of ((this.state.contractor && this.state.contractor.wwp) || [])) {
        const p = ppc.find(x => x.workId === item.id);
        log.push({
          week: cur,
          parentId: item.parentId,
          stickyId: item.workId,
          done: !!(p && p.status === 'done'),
        });
      }
    }
    return log;
  },
  get physicalProgress() {
    const plan = this.contractPlan || [];
    const totalCost = plan.reduce((s, w) => s + (Number(w.costJt) || 0), 0) || this.oeJt || 1;
    const cells = this._zoneCells();
    const stickies = this._allStickies();
    const inc = {};
    const parts = [];
    let earnedCost = 0;
    for (const w of WORKS) {
      const row = plan.find(x => x.id === w.id);
      const cost = Number((row && row.costJt) || (totalCost * (Number(w.weight) || 0)) || 0);
      const mineS = stickies.filter(s => s.parentId === w.id);
      const plannedN = Math.max(mineS.length, 1);
      const piece = cost / plannedN;
      let doneN = 0;
      for (const s of mineS) {
        const related = cells.filter(c => c.parentId === w.id && this._zoneMatches(s.zoneLabel, c.zoneLabel));
        if (!related.length) continue;
        const doneC = related.filter(c => c.status === 'done');
        const fracS = doneC.length / related.length;
        if (fracS <= 0) continue;
        doneN += fracS;
        const wk = Math.max(Number(s.startWeek) || 0, ...doneC.map(c => Number(c.week) || 0));
        if (wk) {
          inc[wk] = (inc[wk] || 0) + piece * fracS;
          parts.push({ name: w.name, week: wk, pct: Math.round(piece * fracS / totalCost * 1000) / 10 });
        }
      }
      const frac = mineS.length ? Math.min(1, doneN / mineS.length) : 0;
      earnedCost += cost * frac;
    }
    const pct = Math.min(100, Math.round(earnedCost / totalCost * 1000) / 10);
    const maxW = Math.max(this.playWeek || 1, this.negoWeeks || 1, ...Object.keys(inc).map(Number), 1);
    const curve = [];
    let cumCost = 0;
    for (let week = 1; week <= maxW; week++) {
      cumCost += inc[week] || 0;
      const p = Math.min(100, Math.round(cumCost / totalCost * 1000) / 10);
      curve.push({ week, planned: p, cumJt: Math.round(cumCost * 10) / 10 });
    }
    if (curve.length) {
      curve[curve.length - 1].planned = pct;
      curve[curve.length - 1].cumJt = Math.round(earnedCost * 10) / 10;
    }
    const frozen = (this.negoBundle.curve || []).find(p => p.week === this.playWeek);
    const plannedNow = frozen ? Number(frozen.planned) : 0;
    return { pct, plannedNow, parts, curve, maxW, inc, totalCost, earnedCost };
  },
  get suggestedWeekIncrement() {
    const w = this.playWeek;
    const pp = this.physicalProgress || {};
    const tot = Number(pp.totalCost) || 1;
    const fromInc = Math.round((Number((pp.inc || {})[w]) || 0) / tot * 1000) / 10;
    if (fromInc > 0) return fromInc;
    const fromParts = Math.round((this.physicalProgress.parts || []).filter(p => p.week === w).reduce((s, p) => s + p.pct, 0) * 10) / 10;
    if (fromParts > 0) return fromParts;
    const wp = ((this.state.contractor && this.state.contractor.weeklyProgress) || []).find(r => Number(r.week) === w);
    const curve = (this.negoBundle && this.negoBundle.curve) || [];
    const pNow = Number((curve.find(x => Number(x.week) === w) || {}).planned) || 0;
    const pPrev = Number((curve.find(x => Number(x.week) === w - 1) || {}).planned) || 0;
    const slice = Math.max(0, pNow - pPrev);
    if (wp && Number(wp.planned) > 0 && slice) {
      return Math.round(1000 * (Number(wp.done) / Number(wp.planned)) * slice) / 10;
    }
    return Math.round(slice * 10) / 10;
  },
  get displayedPhysicalPct() {
    const live = Number(this.physicalProgress && this.physicalProgress.pct) || 0;
    return Math.min(100, Math.max(0, Math.round(live * 10) / 10));
  },
  get progressLockForWeek() {
    const w = this.playWeek;
    return ((this.state.contractor && this.state.contractor.progressLocks) || []).find(x => Number(x.week) === w) || null;
  },
  get lockedPhysicalPct() {
    const locks = ((this.state.contractor && this.state.contractor.progressLocks) || []).slice().sort((a, b) => a.week - b.week);
    if (!locks.length) return 0;
    return Math.min(100, Math.round(locks.reduce((s, x) => s + (Number(x.increment) || 0), 0) * 10) / 10);
  },
  get lockedProgressCurve() {
    const locks = ((this.state.contractor && this.state.contractor.progressLocks) || []).slice().sort((a, b) => a.week - b.week);
    const maxJt = this.negoBundle.maxJt || this.oeJt;
    let cum = 0;
    return locks.map(l => {
      cum = Math.min(100, cum + (Number(l.increment) || 0));
      return {
        week: Number(l.week),
        planned: Math.round(cum * 10) / 10,
        cumJt: Math.round(maxJt * (cum / 100) * 10) / 10,
      };
    });
  },
  lockProgress() {
    const week = this.playWeek;
    const incRaw = this.progressDraft == null ? this.suggestedWeekIncrement : Number(this.progressDraft);
    const locks = [...(this.state.contractor.progressLocks || [])].filter(x => Number(x.week) !== week);
    const already = locks.reduce((s, x) => s + (Number(x.increment) || 0), 0);
    const inc = Number.isFinite(incRaw) ? Math.max(0, Math.min(100 - already, Math.round(incRaw * 10) / 10)) : 0;
    locks.push({
      week,
      increment: inc,
      parts: (this.physicalProgress.parts || []).filter(p => p.week === week),
      suggested: this.suggestedWeekIncrement,
    });
    locks.sort((a, b) => a.week - b.week);
    this.state.contractor.progressLocks = locks;
    this.save();
  },
  get ownerReportText() {
    const c = this.state.negotiation.contract || {};
    const ppcRow = (this.state.contractor.weeklyProgress || []).slice(-1)[0];
    const ppc = ppcRow ? ppcRow.ppc : this.ppcPercent;
    const top = (this.problemFrequency || [])[0];
    const topLab = top ? (this.constraintLabel(top.type) + ' (' + top.count + 'x)') : 'belum ada';
    const fisik = this.displayedPhysicalPct;
    const rencana = this.physicalProgress.plannedNow;
    const st = this.projectCloseStats;
    let t = 'Kontrak Rp ' + (c.price || this.oeJt) + ' jt · ' + (c.duration || this.negoWeeks) + ' minggu · quality ' + (c.quality || this.state.owner.qualityLevel)
      + '. Progres fisik ' + fisik + '% (rencana M' + this.playWeek + ' = ' + rencana + '%). PPC minggu ini ' + ppc + '%. Masalah terbanyak: ' + topLab + '.';
    if (this.projectComplete) {
      t += ' PROYEK DITUTUP. Tidak ada kegiatan terjadwal tersisa. Durasi aktual ' + st.actualWeeks + ' minggu kerja (' + st.actualWorkDays + ' hari kerja / ' + st.actualCalDays + ' hari kalender) vs kontrak ' + st.contractWeeks + ' minggu (' + st.contractCalDays + ' hari kalender).'
        + (st.ahead ? (' Lebih cepat ' + st.savedWeeks + ' minggu.') : (st.late ? (' Terlambat ' + (-st.savedWeeks) + ' minggu.') : ' Sesuai kontrak.'));
    }
    return t;
  },
  copyOwnerReport() {
    const t = this.ownerReportText;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(() => alert('Ringkasan Owner disalin.')).catch(() => alert(t));
    } else {
      alert(t);
    }
  },
  get progressChartSvg() {
    const markers = (SCENARIOS || []).map(s => ({
      week: s.week,
      label: s.kind === 'weather' ? ('M' + s.week + ' hujan') : ('M' + s.week + ' material'),
      color: s.kind === 'weather' ? '#2563EB' : '#B45309',
    }));
    return makeChart(this.negoBundle.curve, this.negoBundle.maxJt, {
      color: '#C45C26',
      fillId: 'scFillProg',
      yMode: 'pct',
      actual: (this.physicalProgress && this.physicalProgress.curve) || [],
      markers,
    }).markup;
  },
  get contractPlan() {
    const c = this.state.negotiation.contract;
    return (c && c.workPlan && c.workPlan.length) ? c.workPlan : (this.state.owner.workPlan || []);
  },
     get phasesView() {
    const plan = this.contractPlan;
    const byId = Object.fromEntries(plan.map(w => [w.id, w]));
    const cons = (this.state.contractor && this.state.contractor.constraints) || [];
    const wins = (this.state.contractor && this.state.contractor.phaseWindows) || {};
    const colors = { pondasi:'#A0522D', struktur:'#1E40AF', selubung:'#15803D', finishing:'#CA8A04' };
    const rows = PHASES.map(ph => {
      const works = ph.works.map(id => byId[id]).filter(Boolean);
      const derivedStart = works.length ? Math.min(...works.map(w => w.startWeek)) : 1;
      const derivedFinish = works.length ? Math.max(...works.map(w => w.finishWeek)) : 1;
      const ov = wins[ph.id] || {};
      const week = Number(ov.week) || Number(ov.finishWeek) || derivedFinish;
      return {
        ...ph,
        works,
        week,
        derivedStart,
        derivedFinish,
        derivedWeek: derivedFinish,
        color: colors[ph.id] || '#C45C26',
        costJt: Math.round(works.reduce((s, w) => s + (Number(w.costJt) || 0), 0) * 10) / 10,
        cCount: cons.filter(c => ph.works.includes(c.workId)).length,
      };
    });
    for (let i = 0; i < rows.length; i++) {
      rows[i].startWeek = i === 0 ? 1 : Number(rows[i - 1].week) || 1;
      rows[i].finishWeek = Number(rows[i].week) || rows[i].startWeek;
    }
    return rows;
  },
  get milestoneTimelineWeeks() {
    const n = Number((this.state.negotiation.contract || {}).duration) || this.negoWeeks || 12;
    const weeks = [];
    for (let i = 1; i <= n; i++) weeks.push(i);
    return weeks;
  },
  milestoneBarStyle(ph) {
    const n = (this.milestoneTimelineWeeks || []).length || 12;
    const start = Number(ph.startWeek) || 1;
    const end = Number(ph.week) || start;
    const left = ((start - 1) / n) * 100;
    const width = (Math.max(1, end - start + 1) / n) * 100;
    return 'left:' + left + '%;width:' + width + '%;background:' + (ph.color || '#C45C26');
  },
  milestoneHandleStyle(ph) {
    const n = (this.milestoneTimelineWeeks || []).length || 12;
    const end = Number(ph.week) || 1;
    const left = ((end - 0.5) / n) * 100;
    return 'left:' + left + '%;background:' + (ph.color || '#C45C26');
  },
  startMilestoneDrag(phId, e) {
    if (this.state.contractor.milestonesLocked || this.state.contractor.pullLocked) return;
    const track = e.currentTarget;
    const move = (ev) => this._applyMilestoneDrag(phId, track, ev);
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    if (track.setPointerCapture && e.pointerId != null) {
      try { track.setPointerCapture(e.pointerId); } catch (err) {}
    }
    this._applyMilestoneDrag(phId, track, e);
  },
  _applyMilestoneDrag(phId, track, ev) {
    const rect = track.getBoundingClientRect();
    const n = (this.milestoneTimelineWeeks || []).length || 12;
    const t = (ev.clientX - rect.left) / Math.max(1, rect.width);
    const w = Math.max(1, Math.min(n, Math.ceil(t * n)));
    this.setMilestoneWeek(phId, w);
  },
  _makeStickies(ph) {
    const ov = (this.state.contractor && this.state.contractor.stickyWeeks) || {};
    const p0 = Number(ph.startWeek) || 1;
    const p1 = Number(ph.finishWeek) || p0;
    const isFocus = FOCUS_PHASES.includes(ph.id);
    const stickies = [];
    for (const w of (ph.works || [])) {
      const zones = WORK_ZONES[w.id] || ['z3'];
      const { start, finish } = this._weeksInPhase(ph, w);
      const weeks = [];
      for (let m = start; m <= finish; m++) weeks.push(m);
      weeks.forEach((wk, wi) => {
        const zid = zones[wi % zones.length];
        const sameZoneIdx = weeks.slice(0, wi + 1).filter((_, i) => zones[i % zones.length] === zid).length;
        const zoneLabel = weeks.length > 1 ? (zid.toUpperCase() + '-' + String.fromCharCode(96 + sameZoneIdx)) : zid.toUpperCase();
        const id = w.id + '_' + zid + '_' + sameZoneIdx;
        let week = Number(ov[id]) || wk;
        week = Math.max(p0, Math.min(p1, week));
        stickies.push({
          id,
          parentId: w.id,
          name: w.name,
          team: w.team,
          color: w.color,
          startWeek: week,
          finishWeek: week,
          zoneId: zid,
          zoneLabel,
          costJt: w.costJt,
          isFocus,
          pred: w.pred || [],
        });
      });
    }
    return stickies;
  },
  _weeksInPhase(ph, w) {
    const p0 = Number(ph.startWeek) || 1;
    const p1 = Number(ph.finishWeek) || p0;
    const works = ph.works || [];
    const gMin = works.length ? Math.min(...works.map(x => Number(x.startWeek) || p0)) : p0;
    const gMax = works.length ? Math.max(...works.map(x => Number(x.finishWeek) || p0)) : p1;
    const map = (gw) => {
      const g = Number(gw) || gMin;
      if (gMax === gMin) return p0;
      const t = (g - gMin) / (gMax - gMin);
      return Math.round(p0 + t * (p1 - p0));
    };
    let start = map(w.startWeek);
    let finish = map(w.finishWeek);
    if (finish < start) finish = start;
    start = Math.max(p0, Math.min(p1, start));
    finish = Math.max(p0, Math.min(p1, finish));
    return { start, finish };
  },
  get pullPhasesView() {
    return this.phasesView.slice().reverse().map(ph => {
      const isFocus = FOCUS_PHASES.includes(ph.id);
      const stickies = this._makeStickies(ph).sort((a, b) => (b.startWeek - a.startWeek) || a.name.localeCompare(b.name));
      return { ...ph, isFocus, stickies };
    });
  },
    get forwardPhasesView() {
    return this.phasesView.map(ph => {
      const isFocus = FOCUS_PHASES.includes(ph.id);
      const stickies = this._makeStickies(ph).sort((a, b) => (a.startWeek - b.startWeek) || a.name.localeCompare(b.name));
      return { ...ph, isFocus, stickies };
    });
  },
  _stickyConsumed(s) {
    if (!s) return false;
    if (this._scheduleUsedIdSet().has(s.id)) return true;
    const z = this.prettyZone(s.zoneLabel);
    const pid = s.parentId || this._workType(s);
    if (!z || !pid) return false;
    const cells = this._zoneCells().filter(c => c.parentId === pid && this._zoneMatches(z, c.zoneLabel));
    const done = cells.filter(c => c.status === 'done');
    if (!done.length) return false;
    const lastDone = Math.max(...done.map(c => Number(c.week) || 0));
    return Number(s.startWeek) > lastDone;
  },
    get lookSlots() {
    const off = Number((this.state.contractor && this.state.contractor.lookOffset) || 0);
    const allStickies = [];
    for (const ph of (this.forwardPhasesView || this.pullPhasesView || [])) {
      for (const s of (ph.stickies || [])) allStickies.push(s);
    }
    const cons = (this.state.contractor && this.state.contractor.constraints) || [];
    const mr = (this.state.contractor && this.state.contractor.makeReady) || [];
    const resolved = new Set(mr.filter(x => x.status === 'done').map(x => x.constraintId));
    const carry = this._carryStickies();
    return [1,2,3,4].map(i => {
      const abs = off + i;
      const absLabel = 'M' + abs;
      let stickies = allStickies.filter(s => Number(s.startWeek) === abs && !this._stickyConsumed(s));
      if (i === 1 && carry.length) {
        const haveZ = new Set(stickies.map(s => this.prettyZone(s.zoneLabel)));
        for (const c of carry) {
          const z = this.prettyZone(c.zoneLabel);
          if (z && haveZ.has(z)) continue;
          haveZ.add(z);
          stickies = stickies.concat([{ ...c, id: c.cellId || (c.id + '|' + z) }]);
        }
      }
      const stickyIds = new Set(stickies.map(s => s.id));
      const openConstraints = cons.filter(c => !resolved.has(c.id) && stickyIds.has(c.workId)).length;
      return { rel: 'L' + i, abs, absLabel, isPrep: false, stickies, workCount: stickies.length, openConstraints };
    });
  },
  get carryInItems() {
    return this._carryStickies();
  },
  get scheduledNextItems() {
    const week = this.playWeek;
    const next = week + 1;
    const out = [];
    for (const r of ((this.state.contractor && this.state.contractor.weekRemainder) || [])) {
      if (Number(r.fromWeek) !== week && Number(r.toWeek) !== next) continue;
      const n = Math.max(1, Number(r.days) || 1);
      const base = r.zoneBase || this._zoneUnit(r.zoneLabel);
      const start = Number(r.nextIndex) || 1;
      for (let i = 0; i < n; i++) {
        out.push({
          name: r.name,
          zoneLabel: this.prettyZone(base ? (base + '-' + (start + i)) : r.zoneLabel),
          days: 1,
          toWeek: Number(r.toWeek) || next,
        });
      }
    }
    return out;
  },
  prettyZone(label) {
    if (!label) return '';
    const m = String(label).match(/^(Z\d+)(?:-([0-9]+|[a-zA-Z]))?(?:-(\d+))?$/i);
    if (!m) return String(label);
    const z = m[1].toUpperCase();
    if (!m[2]) return z;
    let mid = m[2];
    if (/^[0-9]+$/.test(mid)) {
      const n = Math.max(1, Math.min(26, Number(mid)));
      mid = String.fromCharCode(96 + n);
    } else {
      mid = mid.toLowerCase();
    }
    return m[3] ? (z + '-' + mid + '-' + m[3]) : (z + '-' + mid);
  },
  _zoneUnit(label) {
    const p = this.prettyZone(label);
    const m = p.match(/^(Z\d+-[a-z])/i);
    if (m) return m[1];
    const z = p.match(/^(Z\d+)/i);
    return z ? z[1].toUpperCase() : p;
  },
  _zoneRoot(label) {
    const m = String(label || '').match(/Z(\d+)/i);
    return m ? ('z' + m[1]) : '';
  },
  _zoneMatches(parentZone, childZone) {
    const p = this.prettyZone(parentZone);
    const c = this.prettyZone(childZone);
    if (!p || !c) return false;
    return c === p || c.startsWith(p + '-');
  },
  _carryStickies() {
    const play = this.targetExecWeek;
    if (play < 2) return [];
    return this._zoneCells()
      .filter(c => c.status === 'carry' || c.fromRemainder)
      .map(c => ({
        ...c,
        id: c.workId || c.id,
        cellId: c.id,
        startWeek: play,
        carry: !c.fromRemainder,
        scheduled: !!c.fromRemainder,
        carryFrom: play - 1,
        days: 1,
      }));
  },
  _huddleEver(id, status) {
    const hr = this.state.contractor.huddleResults || {};
    for (const d of WWP_DAYS) {
      const r = hr[d.id + ':' + id];
      if (r && r.status === status) return true;
    }
    return false;
  },
  _zoneCells() {
    const play = this.targetExecWeek;
    const rank = { done: 3, carry: 2, planned: 1, future: 0 };
    const cells = [];
    const idx = {};
    const add = (raw) => {
      const z = this.prettyZone(raw.zoneLabel);
      const pid = this._workType(raw) || raw.parentId;
      if (!z || !pid) return;
      const status = raw.status || 'future';
      const k = pid + '|' + z;
      const row = {
        id: k,
        workId: raw.workId || raw.stickyId || raw.id,
        parentId: pid,
        name: raw.name,
        team: raw.team,
        zoneLabel: z,
        zoneRoot: this._zoneRoot(z),
        week: Number(raw.week) || play,
        status,
        color: raw.color || ((WORKS.find(w => w.id === pid) || {}).color),
        fromRemainder: !!raw.fromRemainder,
        carryNote: raw.carryNote || '',
      };
      const prev = idx[k];
      if (prev != null) {
        if ((rank[status] || 0) < (rank[cells[prev].status] || 0)) return;
        cells[prev] = row;
        return;
      }
      idx[k] = cells.length;
      cells.push(row);
    };
    for (const arch of ((this.state.contractor && this.state.contractor.execArchive) || [])) {
      for (const it of (arch.wwp || [])) {
        const p = (arch.ppc || []).find(x => x.workId === it.id);
        add({
          ...it,
          week: arch.week,
          status: (p && p.status === 'done') ? 'done' : 'carry',
          carryNote: (p && p.status === 'done') ? '' : ('Tidak selesai M' + arch.week),
        });
      }
      for (const r of (arch.remainder || [])) {
        const n = Math.max(1, Number(r.days) || 1);
        const start = Number(r.nextIndex) || 1;
        const base = r.zoneBase || this._zoneUnit(r.zoneLabel);
        for (let i = 0; i < n; i++) {
          add({
            parentId: this._workType(r) || r.parentId,
            name: r.name, team: r.team, color: r.color,
            zoneLabel: base ? (base + '-' + (start + i)) : r.zoneLabel,
            week: Number(r.toWeek) || (Number(arch.week) + 1),
            status: 'planned',
            fromRemainder: true,
            carryNote: 'Dijadwalkan dari M' + arch.week,
          });
        }
      }
    }
    for (const a of ((this.state.contractor && this.state.contractor.actualLog) || [])) {
      add({
        ...a,
        week: a.week,
        status: a.done ? 'done' : 'carry',
        carryNote: a.done ? '' : ('Tidak selesai M' + a.week),
      });
    }
    for (const r of ((this.state.contractor && this.state.contractor.weekRemainder) || [])) {
      const n = Math.max(1, Number(r.days) || 1);
      const start = Number(r.nextIndex) || 1;
      const base = r.zoneBase || this._zoneUnit(r.zoneLabel);
      for (let i = 0; i < n; i++) {
        add({
          parentId: this._workType(r) || r.parentId,
          name: r.name, team: r.team, color: r.color,
          zoneLabel: base ? (base + '-' + (start + i)) : r.zoneLabel,
          week: Number(r.toWeek) || play,
          status: 'planned',
          fromRemainder: true,
          carryNote: 'Dijadwalkan dari M' + (Number(r.fromWeek) || (play - 1)),
        });
      }
    }
    for (const item of ((this.state.contractor && this.state.contractor.wwp) || [])) {
      let status = 'planned';
      if (this._huddleEver(item.id, 'done')) status = 'done';
      else if (item.carryNote || this._huddleEver(item.id, 'failed') || this._huddleEver(item.id, 'extended')) status = 'carry';
      add({ ...item, week: play, status });
    }
    for (const s of this._allStickies()) {
      const childed = cells.some(c => c.parentId === s.parentId && this._zoneMatches(s.zoneLabel, c.zoneLabel) && this.prettyZone(c.zoneLabel) !== this.prettyZone(s.zoneLabel));
      if (childed) continue;
      const w = Number(s.startWeek);
      let status = 'future';
      if (w < play) status = 'carry';
      else if (w === play) status = 'planned';
      add({ ...s, week: w, status, workId: s.id });
    }
    return cells;
  },
  get zoneBoard() {
    const cells = this._zoneCells();
    const rows = WORKS.map(w => {
      const list = cells.filter(c => c.parentId === w.id)
        .sort((a, b) => (Number(a.week) - Number(b.week)) || String(a.zoneLabel).localeCompare(String(b.zoneLabel)));
      if (!list.length) return null;
      return {
        id: w.id, name: w.name, team: w.team, color: w.color, cells: list,
        done: list.filter(c => c.status === 'done').length,
        total: list.length,
        carryN: list.filter(c => c.status === 'carry').length,
      };
    }).filter(Boolean);
    const fill = {};
    for (const z of ZONES) {
      const zc = cells.filter(c => c.zoneRoot === z.id);
      if (!zc.length) { fill[z.id] = { pct: 0, status: 'empty' }; continue; }
      const done = zc.filter(c => c.status === 'done').length;
      const pct = done / zc.length;
      let status = 'future';
      if (zc.some(c => c.status === 'carry')) status = 'carry';
      else if (pct >= 1) status = 'done';
      else if (zc.some(c => c.status === 'planned') || pct > 0) status = 'planned';
      fill[z.id] = { pct, status };
    }
    return { rows, fill, denah: houseSvg(true, null, fill) };
  },
  get lookConstraints() {
    const cons = (this.state.contractor && this.state.contractor.constraints) || [];
    const mr = (this.state.contractor && this.state.contractor.makeReady) || [];
    const byC = Object.fromEntries(mr.map(x => [x.constraintId, x]));
    const workSlot = {};
    for (const slot of (this.lookSlots || [])) {
      for (const s of (slot.stickies || [])) workSlot[s.id] = slot;
    }
    return cons.map(c => {
      const commit = byC[c.id];
      const slot = workSlot[c.workId];
      return {
        ...c,
        commitStatus: commit ? commit.status : null,
        commitTeam: commit ? commit.team : null,
        commitAtOffset: commit ? Number(commit.atOffset) : null,
        canResolve: !!(commit && (commit.status === 'promised' || commit.status === 'failed') && Number(commit.atOffset) < Number((this.state.contractor && this.state.contractor.lookOffset) || 0)),
        slotRel: slot ? slot.rel : null,
        absLabel: slot ? slot.absLabel : null,
      };
    }).filter(c => c.commitStatus !== 'done')
      .sort((a, b) => {
        const ra = a.slotRel ? Number(a.slotRel.slice(1)) : 99;
        const rb = b.slotRel ? Number(b.slotRel.slice(1)) : 99;
        return ra - rb;
      });
  },
  get openConstraintCount() {
    return (this.lookConstraints || []).filter(c => !c.commitStatus || c.commitStatus === 'promised').length;
  },
    get selectedLookConstraints() {
    return this.selectedWorkConstraints;
  },
  get selectedWorkConstraints() {
    const wid = this.state.contractor && this.state.contractor.selectedLookWorkId;
    if (!wid) return [];
    let sticky = null;
    for (const slot of (this.lookSlots || [])) {
      sticky = (slot.stickies || []).find(x => x.id === wid);
      if (sticky) break;
    }
    const team = (sticky && sticky.team) || this.selectedLookTeam;
    const teamColor = this.teamColor(team);
    const parent = WORKS.find(w => w.id === ((sticky && sticky.parentId) || ''));
    const predTeams = [];
    const seen = {};
    for (const pid of ((parent && parent.pred) || [])) {
      const pw = WORKS.find(w => w.id === pid);
      if (!pw || seen[pw.team]) continue;
      seen[pw.team] = true;
      predTeams.push({ id: pw.team, name: pw.name, color: this.teamColor(pw.team) });
    }
    return (this.lookConstraints || []).filter(c => c.workId === wid).map(c => ({
      ...c,
      team,
      teamColor,
      predTeams,
    }));
  },
  teamColor(id) {
    const m = TEAM_META.find(t => t.id === id);
    return (m && m.color) || '#C45C26';
  },
  get selectedLookWorkLabel() {
    const wid = this.state.contractor && this.state.contractor.selectedLookWorkId;
    if (!wid) return '';
    let sticky = null;
    let slot = null;
    for (const s of (this.lookSlots || [])) {
      sticky = (s.stickies || []).find(x => x.id === wid);
      if (sticky) { slot = s; break; }
    }
    const bits = [];
    if (sticky) bits.push(sticky.name + (sticky.zoneLabel ? (' · ' + this.prettyZone(sticky.zoneLabel)) : ''));
    if (slot) bits.push(slot.rel + ' · ' + slot.absLabel);
    return bits.join(' · ');
  },
  get selectedLookIsL1() {
    const wid = this.state.contractor && this.state.contractor.selectedLookWorkId;
    if (!wid) return false;
    const slot = (this.lookSlots || []).find(s => (s.stickies || []).some(x => x.id === wid));
    return !!(slot && slot.rel === 'L1');
  },
  get selectedLookTeam() {
    const wid = this.state.contractor && this.state.contractor.selectedLookWorkId;
    if (!wid) return '';
    for (const slot of (this.lookSlots || [])) {
      const s = (slot.stickies || []).find(x => x.id === wid);
      if (s) return s.team || '';
    }
    return '';
  },
  get selectedSlotConstraintCount() {
    return (this.selectedWorkConstraints || []).filter(c => !c.commitStatus || c.commitStatus === 'promised').length;
  },

  get sessionWeek() {
    return Number((this.state.contractor && this.state.contractor.lookOffset) || 0);
  },
  get playWeek() {
    return this.targetExecWeek;
  },
  get timelineWeeks() {
    const off = Number((this.state.contractor && this.state.contractor.lookOffset) || 0);
    const l1 = off + 1;
    const maxN = Math.max(12, l1 + 5);
    const out = [];
    for (let n = 1; n <= maxN; n++) {
      const inWindow = n >= l1 && n <= l1 + 3;
      out.push({
        n,
        inWindow,
        isL1: n === l1,
        label: n === l1 ? 'L1' : (n === l1 + 1 ? 'L2' : (n === l1 + 2 ? 'L3' : (n === l1 + 3 ? 'L4' : ''))),
      });
    }
    return out;
  },
  get registryInsight() {
    const freq = this.problemFrequency || [];
    if (!freq.length) return '';
    const top = freq[0];
    const label = this.constraintLabel(top.type);
    const week = this.targetExecWeek;
    return 'Dari registry: masalah terbanyak = ' + label + ' (' + top.count + 'x). Prioritaskan make-ready terkait ' + label + ' untuk L1/M' + week + ' sebelum susun WWP.';
  },
  get ppcBars() {
    const n = Math.max(1, this.negoWeeks);
    const by = {};
    for (const r of (this.state.contractor.weeklyProgress || [])) by[Number(r.week)] = r;
    const cur = this.playWeek;
    if (!by[cur] && ((this.state.contractor.ppc || []).length || this.state.contractor.huddleComplete)) {
      by[cur] = { week: cur, ppc: this.ppcPercent };
    }
    return Array.from({ length: n }, (_, i) => {
      const w = i + 1;
      const row = by[w];
      return {
        week: w,
        ppc: row ? Number(row.ppc) || 0 : 0,
        hasData: !!row,
        isCurrent: w === cur,
      };
    });
  },
  _teamPpcRows(items, ppc) {
    const by = {};
    for (const it of (items || [])) {
      const t = it.team || '—';
      if (!by[t]) by[t] = { team: t, planned: 0, done: 0, color: it.color || '#C45C26' };
      by[t].planned += 1;
      const p = (ppc || []).find(x => x.workId === it.id);
      if (p && p.status === 'done') by[t].done += 1;
    }
    return Object.values(by).map(r => ({
      ...r,
      ppc: r.planned ? Math.round(100 * r.done / r.planned) : 0,
    }));
  },
  get learningTeamPpc() {
    return this._teamPpcRows(this.state.contractor.wwp || [], this.state.contractor.ppc || []);
  },
  get progressTeamPpc() {
    const acc = {};
    const push = (t) => {
      if (!t || !t.team) return;
      if (!acc[t.team]) acc[t.team] = { team: t.team, color: t.color || '#C45C26', vals: [] };
      acc[t.team].vals.push(Number(t.ppc) || 0);
    };
    for (const w of (this.state.contractor.weeklyProgress || [])) {
      let rows = w.teamPpc;
      if (!rows || !rows.length) {
        const logs = (this.state.contractor.actualLog || []).filter(x => Number(x.week) === Number(w.week));
        const by = {};
        for (const e of logs) {
          const work = WORKS.find(x => x.id === e.parentId) || {};
          const t = work.team || '—';
          if (!by[t]) by[t] = { team: t, planned: 0, done: 0, color: work.color || '#C45C26' };
          by[t].planned += 1;
          if (e.done) by[t].done += 1;
        }
        rows = Object.values(by).map(r => ({ ...r, ppc: r.planned ? Math.round(100 * r.done / r.planned) : 0 }));
      }
      rows.forEach(push);
    }
    const cur = this.playWeek;
    const hasCur = (this.state.contractor.weeklyProgress || []).some(r => Number(r.week) === cur);
    if (!hasCur) this.learningTeamPpc.forEach(push);
    return TEAMS.map(id => {
      const a = acc[id];
      if (!a || !a.vals.length) {
        const sample = WORKS.find(w => w.team === id);
        return { team: id, color: (sample && sample.color) || '#C45C26', min: null, max: null, avg: null, n: 0 };
      }
      return {
        team: id,
        color: a.color,
        min: Math.min(...a.vals),
        max: Math.max(...a.vals),
        avg: Math.round(a.vals.reduce((s, v) => s + v, 0) / a.vals.length),
        n: a.vals.length,
      };
    });
  },
  get sCurvePlanPoints() {
    const rows = this.state.contractor.weeklyProgress || [];
    if (!rows.length) return '30,100';
    const maxW = Math.max(...rows.map(r => r.week), 1);
    const pts = ['30,100'];
    let cum = 0;
    const totalPlan = rows.reduce((s, r) => s + (r.planned || 0), 0) || 1;
    for (const r of rows) {
      cum += (r.planned || 0);
      const x = 30 + (280 * r.week / Math.max(maxW, 4));
      const y = 100 - (90 * cum / totalPlan);
      pts.push(x.toFixed(1) + ',' + y.toFixed(1));
    }
    return pts.join(' ');
  },
  get sCurveActualPoints() {
    const rows = this.state.contractor.weeklyProgress || [];
    if (!rows.length) return '30,100';
    const maxW = Math.max(...rows.map(r => r.week), 1);
    const totalPlan = rows.reduce((s, r) => s + (r.planned || 0), 0) || 1;
    const pts = ['30,100'];
    let cum = 0;
    for (const r of rows) {
      cum += (r.done || 0);
      const x = 30 + (280 * r.week / Math.max(maxW, 4));
      const y = 100 - (90 * Math.min(1, cum / totalPlan));
      pts.push(x.toFixed(1) + ',' + y.toFixed(1));
    }
    return pts.join(' ');
  },
  get targetExecWeek() {
    const off = Number((this.state.contractor && this.state.contractor.lookOffset) || 0);
    return off + 1; // L1
  },
  _allStickies() {
    const all = [];
    for (const ph of (this.forwardPhasesView || this.pullPhasesView || [])) {
      for (const s of (ph.stickies || [])) all.push(s);
    }
    return all;
  },
  _isWorkReady(workId) {
    const cons = ((this.state.contractor && this.state.contractor.constraints) || []).filter(c => c.workId === workId);
    if (!cons.length) return true;
    const mr = (this.state.contractor && this.state.contractor.makeReady) || [];
    return cons.every(c => mr.some(x => x.constraintId === c.id && x.status === 'done'));
  },
  _workOpenConstraintCount(workId) {
    const cons = ((this.state.contractor && this.state.contractor.constraints) || []).filter(c => c.workId === workId);
    const mr = (this.state.contractor && this.state.contractor.makeReady) || [];
    return cons.filter(c => !mr.some(x => x.constraintId === c.id && x.status === 'done')).length;
  },
  _workPromisedCount(workId) {
    const cons = ((this.state.contractor && this.state.contractor.constraints) || []).filter(c => c.workId === workId);
    const mr = (this.state.contractor && this.state.contractor.makeReady) || [];
    return cons.filter(c => mr.some(x => x.constraintId === c.id && x.status === 'promised')).length;
  },
  get makeReadyReportRows() {
    return (this.lookSlots || []).map(slot => {
      if (slot.isPrep) {
        return {
          rel: slot.rel,
          absLabel: slot.absLabel,
          isPrep: true,
          ready: 0, promised: 0, open: 0, total: 0,
          summary: 'M0 kosong — fokus hilangkan constraint untuk L2 / M1.',
        };
      }
      const stickies = slot.stickies || [];
      let ready = 0, promised = 0, open = 0;
      for (const s of stickies) {
        const o = this._workOpenConstraintCount(s.id);
        const p = this._workPromisedCount(s.id);
        if (o === 0) ready++;
        else if (p > 0) promised++;
        else open++;
      }
      let summary = '';
      if (!stickies.length) summary = 'Tidak ada pekerjaan.';
      else if (open === 0 && promised === 0) summary = 'Semua SiapKerja!';
      else if (open === 0) summary = promised + ' mengandalkan komitmen make-ready.';
      else summary = open + ' terbuka tanpa pemilik — risiko / backlog.';
      return {
        rel: slot.rel,
        absLabel: slot.absLabel,
        isPrep: false,
        ready, promised, open, total: stickies.length,
        summary,
      };
    });
  },
  get makeReadyReport() {
    // kompatibilitas: ringkas target eksekusi
    const week = this.targetExecWeek;
    const row = (this.makeReadyReportRows || []).find(r => r.absLabel === ('M' + week));
    if (!row) return { ready: 0, promised: 0, open: 0, summary: '', total: 0 };
    return row;
  },
  get backlogHeld() {
    const week = this.targetExecWeek;
    const inWwp = new Set((this.state.contractor.wwp || []).map(x => x.workId));
    return this._allStickies().filter(s => {
      if (inWwp.has(s.id)) return false;
      const w = Number(s.startWeek);
      if (w < week || w > week + 3) return false;
      const pred = this._predBlockReason(s);
      if (w === week && !this._isWorkReady(s.id)) return true;
      if (this._isWorkReady(s.id) && pred) return true;
      return false;
    });
  },
  get backlogWorkable() {
    const week = this.targetExecWeek;
    const blocked = this.scheduleBlockedIds;
    return this._allStickies().filter(s => {
      if (blocked.has(s.id) || this._stickyConsumed(s)) return false;
      if (!this._isWorkReady(s.id)) return false;
      if (this._predBlockReason(s)) return false;
      const w = Number(s.startWeek);
      return w >= week && w <= week + 3;
    });
  },
  get scheduleBlockedIds() {
    const used = this._scheduleUsedIdSet();
    for (const r of (this.state.contractor.weekRemainder || [])) used.add(r.stickyId);
    for (const x of (this.state.contractor.wwp || [])) used.add(x.workId);
    return used;
  },
  _scheduleUsedIdSet() {
    const s = new Set();
    for (const x of (this.state.contractor.scheduleUsed || [])) {
      if (!x) continue;
      s.add(typeof x === 'string' ? x : x.id);
    }
    return s;
  },
  get scheduleDayChoices() {
    const min = this.currentStage === 'contractor-huddle' ? (Number(this.state.contractor.huddleDayIdx) || 0) : 0;
    return WWP_DAYS.filter((_, i) => i >= min);
  },
  get schedulePlan() {
    const d = this.scheduleDraft;
    if (!d) return null;
    const sticky = this._allStickies().find(s => s.id === d.workId);
    if (!sticky) return null;
    const days = WWP_DAYS.map(x => x.id);
    const min = this.currentStage === 'contractor-huddle' ? (Number(this.state.contractor.huddleDayIdx) || 0) : 0;
    let sIdx = days.indexOf(d.startDay);
    if (sIdx < min) sIdx = min;
    if (sIdx < 0) sIdx = min;
    const want = Math.max(1, Math.min(6, Number(d.days) || 1));
    const fit = Math.max(0, Math.min(want, 6 - sIdx));
    const remain = Math.max(0, want - fit);
    const prefix = sticky.zoneLabel || 'Z';
    const split = want > 1 || remain > 0;
    const placed = [];
    for (let i = 0; i < fit; i++) {
      placed.push({
        day: days[sIdx + i],
        dayLabel: (WWP_DAYS[sIdx + i] || {}).label,
        zone: split ? (prefix + '-' + (i + 1)) : prefix,
      });
    }
    return {
      sticky, sIdx, want, fit, remain, placed, prefix,
      nextZone: prefix + '-' + (fit + 1),
      toWeek: this.playWeek + 1,
    };
  },
  get ppcDoneCount() {
    const ids = new Set((this.state.contractor.wwp || []).map(x => x.id));
    return ((this.state.contractor.ppc || []).filter(p => ids.has(p.workId) && p.status === 'done')).length;
  },
  get ppcPercent() {
    const n = (this.state.contractor.wwp || []).length;
    if (!n) return 0;
    return Math.round(100 * this.ppcDoneCount / n);
  },
  get focusStickies() {
    const out = [];
    for (const ph of (this.pullPhasesView || [])) {
      if (!ph.isFocus) continue;
      out.push(...(ph.stickies || []));
    }
    return out;
  },
  get reviewedCount() {
    const r = (this.state.contractor && this.state.contractor.reviewed) || {};
    return this.focusStickies.filter(s => r[s.id]).length;
  },
  get reviewedFocusTotal() {
    return this.focusStickies.length;
  },
  get selectedWorkObj() {
    const id = this.state.contractor && this.state.contractor.selectedWork;
    if (!id) return null;
    const fromPlan = this.contractPlan.find(w => w.id === id);
    if (fromPlan) return fromPlan;
    for (const ph of (this.pullPhasesView || [])) {
      const s = (ph.stickies || []).find(x => x.id === id);
      if (s) return s;
    }
    return null;
  },
  get handoffPredsLabel() {
    const w = this.selectedWorkObj;
    if (!w) return '—';
    const pred = w.pred || [];
    if (!pred.length) return 'Titik awal (tidak ada pendahulu)';
    return pred.map(id => this.workName(id)).join(', ');
  },
  get handoffSuccsLabel() {
    const w = this.selectedWorkObj;
    if (!w) return '—';
    const pid = w.parentId || w.id;
    const succs = this.contractPlan.filter(p => (p.pred || []).includes(pid));
    if (!succs.length) return 'Milestone serah terima';
    return succs.map(p => p.name).join(', ');
  },
  get focusMilestoneWeeks() {
    const w = this.selectedWorkObj;
    const pid = w && (w.parentId || w.id);
    const phId = (PHASES.find(p => (p.works || []).includes(pid)) || {}).id;
    const ph = (this.phasesView || []).find(p => p.id === phId && FOCUS_PHASES.includes(p.id))
      || (this.phasesView || []).find(p => FOCUS_PHASES.includes(p.id));
    const a = Number(ph && ph.startWeek) || 1;
    const b = Number(ph && ph.finishWeek) || a;
    const weeks = [];
    for (let i = a; i <= b; i++) weeks.push(i);
    return weeks;
  },
  get allTeamsCommitted() {
    return this.committedCount >= TEAMS.length;
  },
  get constraintsByMilestone() {
    const cons = this.state.contractor.constraints || [];
    const bySticky = {};
    for (const ph of (this.forwardPhasesView || [])) {
      for (const s of (ph.stickies || [])) bySticky[s.id] = ph.id;
    }
    return (this.phasesView || []).map(ph => {
      const workIds = new Set((ph.works || []).map(w => w.id));
      const items = cons.filter(c => {
        const pid = bySticky[c.workId];
        if (pid) return pid === ph.id;
        const raw = String(c.workId || '');
        return [...workIds].some(id => raw === id || raw.startsWith(id + '_'));
      });
      return { id: ph.id, name: ph.name, startWeek: ph.startWeek, finishWeek: ph.finishWeek, items };
    });
  },
  get designDrawingSvg() { return houseSvg(false, null); },
  get elevationSvg() { return houseElevationSvg(); },
  get phaseDrawingSvg() {
    const c = this.state.contractor;
    return houseSvg(!!(c.zonesLocked || c.zonesPreview), c.selectedZone);
  },
  get teamCommitRows() {
    const phBy = Object.fromEntries(this.phasesView.map(p => [p.id, p]));
    const comm = this.state.contractor.commitments || {};
    return TEAMS.map(id => {
      const pid = TEAM_PHASE[id];
      const ph = phBy[pid] || { name: pid, startWeek: 1, finishWeek: 1 };
      const meta = TEAM_META.find(m => m.id === id) || {};
      return { id, phaseName: ph.name, startWeek: ph.startWeek, finishWeek: ph.finishWeek, committed: !!comm[id], color: meta.color || '#C45C26' };
    });
  },
  get committedCount() {
    const comm = this.state.contractor.commitments || {};
    return TEAMS.filter(t => comm[t]).length;
  },
  get priorityHint() {
    const p = this.state.owner.priority;
    if (p === 'cost') return { title:'Biaya', box:'border-terra/25 bg-terra-soft/40', body:'Harga jadi acuan. Ideal: penawaran ≈ OE ÷ 1,1 agar VO +10% masih ≤ OE. Mutu tidak ditawar.' };
    return { title:'Waktu', box:'border-amber-200 bg-amber-50', body:'Durasi jadi acuan. Molor = tidak bisa tanda tangan. Harga boleh dekat OE, lebih aman jika ada ruang VO 10%. Mutu tidak ditawar.' };
  },
  get canSignContract() {
    const p = Number(this.state.negotiation.bidPriceJt);
    const d = Number(this.state.negotiation.bidDuration);
    const ask = Number(this.state.owner.constructionDuration) || 8;
    if (!(p > 0) || !(d > 0)) return false;
    if (p > this.oeJt + 0.05) return false;
    if (d > ask) return false;
    return true;
  },
  get signBlockReason() {
    const p = Number(this.state.negotiation.bidPriceJt);
    const d = Number(this.state.negotiation.bidDuration);
    const ask = Number(this.state.owner.constructionDuration) || 8;
    const reasons = [];
    if (!(p > 0)) reasons.push('Harga penawaran belum diisi.');
    else if (p > this.oeJt + 0.05) reasons.push('Harga di atas OE Rp ' + this.oeJt + ' jt — tidak bisa tanda tangan.');
    if (!(d > 0)) reasons.push('Durasi belum dipilih.');
    else if (d > ask) reasons.push('Durasi molor dari ' + ask + ' minggu pemilik — tidak bisa tanda tangan.');
    return reasons.join(' ');
  },

  canAccessDesigner() { return this.state.owner.locked === true; },
  canAccessNego() { return this.state.owner.locked && this.state.designer.locked; },
  canAccessContractor() { return this.canAccessNego() && this.state.negotiation.deal === true; },
  openManual(focusId) {
    this.manualFrom = this.currentStage === 'manual' ? (this.manualFrom || 'owner') : this.currentStage;
    this.manualFocus = focusId || null;
    this.currentStage = 'manual';
    this.$nextTick(() => {
      window.scrollTo(0, 0);
      if (focusId) {
        const el = document.getElementById('man-' + focusId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  },
  closeManual() {
    const back = this.manualFrom || 'owner';
    this.manualFocus = null;
    this.setStage(back === 'manual' || back === 'trial' ? 'owner' : back);
  },

  applyTrialSettings(opts = {}) {
    const skipConfirm = opts === true || !!opts.force;
    if (!skipConfirm) {
      const msg = 'Terapkan setelan wajib uji coba (desain 2 minggu, konstruksi 8 minggu, mutu standar, fokus waktu, LOD standar)? Progress proyek saat ini diulang dari awal.';
      if (!confirm(msg)) return false;
    }
    this.state = initState();
    this.state.owner.designDuration = TRIAL_SETTINGS.designDuration;
    this.state.owner.constructionDuration = TRIAL_SETTINGS.constructionDuration;
    this.state.owner.qualityLevel = TRIAL_SETTINGS.qualityLevel;
    this.state.owner.budgetLevel = TRIAL_SETTINGS.budgetLevel;
    this.state.owner.priority = TRIAL_SETTINGS.priority;
    this.state.owner.budgetJt = OWNER_BUDGET_JT;
    this.state.designer.levelOfDetail = TRIAL_SETTINGS.levelOfDetail;
    this.state.designer.designFreezeWeek = TRIAL_SETTINGS.designDuration;
    this.scheduleDraft = null;
    this.trialFrom = 'owner';
    this.currentStage = 'owner';
    this.recalcPlan();
    this._syncDesignFreeze();
    saveState(this.state);
    this.$nextTick(() => window.scrollTo(0, 0));
    return true;
  },
  trialSettingsActive() {
    const o = this.state && this.state.owner;
    const d = this.state && this.state.designer;
    if (!o || !d) return false;
    return Number(o.designDuration) === TRIAL_SETTINGS.designDuration
      && Number(o.constructionDuration) === TRIAL_SETTINGS.constructionDuration
      && o.qualityLevel === TRIAL_SETTINGS.qualityLevel
      && o.priority === TRIAL_SETTINGS.priority
      && ((d.levelOfDetail || 'standar') === TRIAL_SETTINGS.levelOfDetail);
  },
  openTrial() {
    this.trialFrom = (this.currentStage === 'trial' || this.currentStage === 'trial-form') ? (this.trialFrom || 'owner') : this.currentStage;
    this.currentStage = 'trial';
    this.$nextTick(() => window.scrollTo(0, 0));
  },
  closeTrial() {
    const back = this.trialFrom || 'owner';
    this.setStage(back === 'trial' || back === 'manual' || back === 'trial-form' ? 'owner' : back);
  },
  get currentTrialForm() {
    return (FORM_DEFS && FORM_DEFS[this.trialFormId]) || null;
  },
  trialAns(id) {
    const bag = (this.trialAnswers && this.trialAnswers[this.trialFormId]) || {};
    return bag[id] == null ? '' : bag[id];
  },
  setTrialAns(id, val) {
    const form = this.trialFormId;
    const all = { ...(this.trialAnswers || {}) };
    const bag = { ...(all[form] || {}) };
    bag[id] = val;
    all[form] = bag;
    this.trialAnswers = all;
    try { localStorage.setItem(TRIAL_ANS_KEY, JSON.stringify(all)); } catch (e) {}
  },
  openTrialForm(id) {
    if (!FORM_DEFS[id]) return;
    this.trialFrom = (this.currentStage === 'trial' || this.currentStage === 'trial-form') ? (this.trialFrom || 'owner') : this.currentStage;
    this.trialFormId = id;
    this.currentStage = 'trial-form';
    this.$nextTick(() => window.scrollTo(0, 0));
  },
  closeTrialForm() {
    this.closeTrial();
  },
  exportTrialAnswers() {
    const form = this.trialFormId;
    const payload = {
      form,
      title: (FORM_DEFS[form] && FORM_DEFS[form].title) || form,
      savedAt: new Date().toISOString(),
      answers: (this.trialAnswers && this.trialAnswers[form]) || {},
    };
    const code = payload.answers.r || payload.answers.sesi || payload.answers.g || 'anon';
    const b = new Blob([JSON.stringify(payload, null, 2)], { type:'application/json' });
    const u = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = u;
    a.download = 'SiapKerja_' + form + '_' + String(code).replace(/[^\w-]/g, '') + '.json';
    a.click();
    URL.revokeObjectURL(u);
  },
  formUrl(id) {
    const u = (this.FORM_LINKS && this.FORM_LINKS[id]) || '';
    return u.trim();
  },

  setStage(s) {
    if (s === 'designer' && !this.canAccessDesigner()) return;
    if (s === 'negotiation' && !this.canAccessNego()) return;
    if (s.startsWith('contractor') && !this.canAccessContractor()) return;
    if (s === 'contractor-pm') s = 'contractor-master';
    if (s === 'contractor-production' && !this.state.contractor.pullLocked) s = 'contractor-phase';
    if (s === 'contractor-production' && this.state.contractor.pullLocked) {
      this._hydrateFromArchive();
      this._seedGivenConstraints();
    }
    if (s === 'contractor-wwp' && !this.state.contractor.pullLocked) s = 'contractor-phase';
    if (s === 'contractor-wwp' && this.state.contractor.pullLocked && !this.state.contractor.wwpLocked) this.buildWwp();
        if (s === 'contractor-huddle' && !this.state.contractor.wwpLocked) s = 'contractor-wwp';
        if (s === 'contractor-learning' && !this.state.contractor.huddleComplete) s = 'contractor-huddle';
    if (s === 'contractor-progress') this.progressDraft = null;
    this.currentStage = s;
    this.state.currentStage = s;
    if (s === 'contractor-learning') this._ensurePpcFromHuddle();
    this.save();
    this.$nextTick(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  },
  onQualityChange() {
    this.recalcPlan();
  },
  recalcPlan() {
    const weeks = this.state.owner.constructionDuration || 8;
    const mid = this.oeJt;
    const { plan, curve } = buildPlan(weeks, mid);
    this.state.owner.workPlan = plan;
    this.state.owner.plannedSCurve = curve;
    this._syncDesignFreeze();
  },
  lockOwnerAndNext() {
    this.recalcPlan();
    this.state.owner.locked = true;
    this._syncDesignFreeze();
    this.save();
    this.setStage('designer');
  },
  _syncDesignFreeze() {
    if (!this.state || !this.state.designer) return;
    const max = Number(this.state.owner.designDuration) || 2;
    const f = Number(this.state.designer.designFreezeWeek);
    if (!Number.isFinite(f) || f < 1 || f > max) {
      this.state.designer.designFreezeWeek = max;
    }
  },
  unlockOwner() {
    this.state.owner.locked = false;
    this.state.designer = { designFreezeWeek: this.state.owner.designDuration, levelOfDetail: 'standar', locked: false };
    this.state.negotiation = emptyNego();
    this.state.contractor = emptyContractor();
    this.save();
  },
  handoffToNego() {
    this._syncDesignFreeze();
    this.recalcPlan();
    this.state.designer.locked = true;
    this.state.designer.oeJt = this.oeJt;
    this.state.designer.feeJt = this.designFeeJt;
    this.initNegotiation();
    this.save();
    this.setStage('negotiation');
  },
  initNegotiation() {
    const n = emptyNego();
    n.bidPriceJt = this.safeBidJt;
    n.bidDuration = this.state.owner.constructionDuration;
    n.bidQuality = this.state.owner.qualityLevel;
    this.state.negotiation = n;
  },
  applySafeBid() {
    if (this.state.negotiation.deal) return;
    this.state.negotiation.bidPriceJt = this.safeBidJt;
    this.state.negotiation.bidDuration = this.state.owner.constructionDuration;
    this.state.negotiation.bidQuality = this.state.owner.qualityLevel;
  },
  applyOwnerAsk() {
    const ask = this.state.negotiation.lastResult && this.state.negotiation.lastResult.ask;
    if (!ask) return;
    if (ask.field === 'price') this.state.negotiation.bidPriceJt = ask.value;
    if (ask.field === 'duration') this.state.negotiation.bidDuration = ask.value;
    if (ask.field === 'quality') this.state.negotiation.bidQuality = ask.value;
  },
  resetNego() {
    this.initNegotiation();
    this.save();
  },
  signContract() {
    if (!this.canSignContract || this.state.negotiation.deal) return;
    const n = this.state.negotiation;
    n.bidQuality = this.state.owner.qualityLevel;
    const price = Number(n.bidPriceJt);
    const duration = Number(n.bidDuration);
    const contingency = Math.round((this.oeJt - price) * 10) / 10;
    const built = buildPlan(duration, price);
    n.deal = true;
    n.contract = {
      price,
      duration,
      quality: this.state.owner.qualityLevel,
      oe: this.oeJt,
      contingency,
      contingencyPct: this.oeJt ? Math.round(contingency / this.oeJt * 1000) / 10 : 0,
      sCurve: built.curve,
      workPlan: built.plan,
    };
    this.state.contractor = emptyContractor();
    this.save();
  },
  workName(id) {
    const w = this.contractPlan.find(x => x.id === id) || WORKS.find(x => x.id === id);
    if (w) return w.name;
    for (const ph of (this.pullPhasesView || this.forwardPhasesView || [])) {
      const s = (ph.stickies || []).find(x => x.id === id);
      if (s) return s.name + (s.zoneLabel ? (' · ' + this.prettyZone(s.zoneLabel)) : '') + ' · M' + s.startWeek;
    }
    const cons = ((this.state.contractor && this.state.contractor.constraints) || []).find(x => x.workId === id);
    if (cons && cons.workLabel) return cons.workLabel;
    const parent = String(id || '').split('_')[0];
    const w2 = WORKS.find(x => x.id === parent);
    return w2 ? w2.name : id;
  },
  constraintLabel(type) { return CONSTRAINT_LABEL[type] || type; },
  workConstraintCount(id) {
    return ((this.state.contractor && this.state.contractor.constraints) || []).filter(c => c.workId === id).length;
  },
  selectWork(id) {
    this.state.contractor.selectedWork = id;
    if (!this.state.contractor.reviewed) this.state.contractor.reviewed = {};
    this.state.contractor.reviewed[id] = true;
    this.save();
  },
  selectLookWork(id) {
    if (!this._workOpenConstraintCount(id)) {
      this.state.contractor.selectedLookWorkId = null;
    } else {
      this.state.contractor.selectedLookWorkId = id;
    }
    this.save();
  },
  _seedGivenConstraints() {
    const specs = LOD_GIVEN[this.lodKey] || [];
    const stickies = this._allStickies();
    const focusWorks = new Set(PHASES.filter(p => FOCUS_PHASES.includes(p.id)).flatMap(p => p.works || []));
    const extra = [];
    for (const spec of specs) {
      const w = WORKS.find(x => x.id === spec.workId);
      const targets = stickies.filter(s => s.parentId === spec.workId && Number(s.startWeek) >= 2);
      for (const t of targets) {
        extra.push({
          id: 'g' + spec.workId + '_' + t.id,
          workId: t.id,
          parentId: spec.workId,
          type: spec.type,
          note: spec.note,
          given: true,
          editable: focusWorks.has(spec.workId),
          workLabel: (w ? w.name : spec.workId) + ' · ' + this.prettyZone(t.zoneLabel) + ' · M' + t.startWeek,
        });
      }
    }
    const keep = (this.state.contractor.constraints || []).filter(c => !c.given && !c.scenario);
    this.state.contractor.constraints = keep.concat(extra);
    this._applyScenarioConstraints();
  },
  _applyScenarioConstraints() {
    const spec = SCENARIOS.find(s => s.kind === 'material');
    if (!spec) return;
    const stickies = this._allStickies();
    let targets = stickies.filter(s => Number(s.startWeek) === spec.week);
    if (!targets.length && stickies.length) {
      const best = Math.min(...stickies.map(s => Math.abs(Number(s.startWeek) - spec.week)));
      targets = stickies.filter(s => Math.abs(Number(s.startWeek) - spec.week) === best).slice(0, 4);
    }
    const extra = targets.map(t => ({
      id: 'sc-' + spec.id + '-' + t.id,
      workId: t.id,
      parentId: t.parentId,
      type: spec.type,
      note: spec.note,
      given: true,
      scenario: true,
      editable: true,
      workLabel: t.name + ' · ' + this.prettyZone(t.zoneLabel) + ' · M' + t.startWeek,
    }));
    const keep = (this.state.contractor.constraints || []).filter(c => !c.scenario);
    this.state.contractor.constraints = keep.concat(extra);
  },
  get activeLookScenarios() {
    const off = Number((this.state.contractor && this.state.contractor.lookOffset) || 0);
    const weeks = [off + 1, off + 2, off + 3, off + 4];
    return SCENARIOS.filter(s => weeks.includes(s.week));
  },
  get weatherToday() {
    if (this.playWeek !== 6) return false;
    if (this.state.contractor && this.state.contractor.huddleComplete) return false;
    const idx = Number((this.state.contractor && this.state.contractor.huddleDayIdx) || 0);
    return idx <= 1;
  },
  _weatherBlocksDay(dayId) {
    if (this.playWeek !== 6) return false;
    const d = dayId || ((WWP_DAYS[Number(this.state.contractor.huddleDayIdx) || 0] || {}).id);
    return d === 'sen' || d === 'sel';
  },
  addConstraint() {
    const c = this.state.contractor;
    if (c.pullLocked || !c.selectedWork) return;
    c.constraints.push({
      id: 'c' + Date.now(),
      workId: c.selectedWork,
      type: c.draftType || 'material',
      note: (c.draftNote || '').trim(),
    });
    c.draftNote = '';
    this.save();
  },
  removeConstraint(id) {
    if (this.state.contractor.pullLocked) return;
    this.state.contractor.constraints = this.state.contractor.constraints.filter(c => c.id !== id);
    this.save();
  },
  lockPullPlan() {
    if (!this.state.contractor.zonesLocked) {
      alert('Tetapkan zonasi denah dulu.');
      return;
    }
    if (!this.state.contractor.milestonesLocked) {
      alert('Kunci jendela waktu milestone dulu.');
      return;
    }
    if (this.committedCount < TEAMS.length) {
      alert('Semua tim harus commit dulu (collaborative pull planning).');
      return;
    }
    this._seedGivenConstraints();
    this.state.contractor.pullLocked = true;
    this.state.contractor.selectedWork = null;
    this.save();
    this.setStage('contractor-production');
  },
  previewZones() {
    this.state.contractor.zonesPreview = true;
    this.state.contractor.selectedZone = 'z1';
    this.save();
  },
  lockZones() {
    this.state.contractor.zonesLocked = true;
    this.state.contractor.zonesPreview = true;
    this.state.contractor.constraints = (this.state.contractor.constraints || []).filter(c => !c.seeded && !c.given);
    this._seedGivenConstraints();
    this.save();
  },
  toggleCommit(id) {
    if (this.state.contractor.pullLocked || !this.state.contractor.zonesLocked || !this.state.contractor.milestonesLocked) return;
    const c = this.state.contractor.commitments || {};
    c[id] = !c[id];
    this.state.contractor.commitments = c;
    this.save();
  },
  commitAllTeams() {
    if (this.state.contractor.pullLocked || !this.state.contractor.zonesLocked || !this.state.contractor.milestonesLocked) return;
    const c = { ...(this.state.contractor.commitments || {}) };
    TEAMS.forEach(t => { c[t] = true; });
    this.state.contractor.commitments = c;
    this._seedGivenConstraints();
    this.save();
  },
  setStickyWeek(id, week) {
    if (this.state.contractor.pullLocked || !id) return;
    const weeks = this.focusMilestoneWeeks;
    const a = weeks[0] || 1;
    const b = weeks[weeks.length - 1] || a;
    const n = Math.max(a, Math.min(b, Number(week) || a));
    const ov = { ...(this.state.contractor.stickyWeeks || {}) };
    ov[id] = n;
    this.state.contractor.stickyWeeks = ov;
    this.save();
  },
  setMilestoneWeek(phId, week) {
    if (this.state.contractor.milestonesLocked || this.state.contractor.pullLocked) return;
    const rows = this.phasesView;
    const idx = rows.findIndex(p => p.id === phId);
    if (idx < 0) return;
    const dur = (this.milestoneTimelineWeeks || []).length || 12;
    let n = Math.max(1, Math.min(dur, Number(week) || 1));
    if (idx > 0) n = Math.max(n, Number(rows[idx - 1].week) || 1);
    if (idx < rows.length - 1) n = Math.min(n, Number(rows[idx + 1].week) || dur);
    const wins = { ...(this.state.contractor.phaseWindows || {}) };
    const prevWeek = idx === 0 ? 1 : Number(rows[idx - 1].week) || 1;
    wins[phId] = { week: n, startWeek: prevWeek, finishWeek: n };
    this.state.contractor.phaseWindows = wins;
    this.state.contractor.selectedMilestone = phId;
    this.save();
  },
  updatePhaseWindow(phId, field, val) {
    if (field === 'finishWeek' || field === 'week') this.setMilestoneWeek(phId, val);
  },
  lockMilestones() {
    const wins = { ...(this.state.contractor.phaseWindows || {}) };
    for (const ph of this.phasesView) {
      wins[ph.id] = { week: ph.week, startWeek: ph.startWeek, finishWeek: ph.finishWeek };
    }
    this.state.contractor.phaseWindows = wins;
    this.state.contractor.milestonesLocked = true;
    this.save();
  },
  seedGivenConstraints() {
    const c = this.state.contractor;
    if ((c.constraints || []).some(x => x.seeded)) return;
    const all = [];
    for (const ph of (this.pullPhasesView || [])) {
      for (const s of (ph.stickies || [])) all.push(s);
    }
    if (!all.length) return;
    const picks = [];
    all.forEach((s, i) => {
      if (s.isFocus && i % 3 === 1) picks.push(s);
      else if (!s.isFocus && i % 7 === 0) picks.push(s);
    });
    const types = ['material', 'labor', 'info', 'access', 'prereq', 'weather'];
    const notes = [
      'Besi tulangan belum sampai site',
      'Tukang besi baru available minggu depan',
      'Shop drawing kolom belum approve',
      'Akses scaffolding belum aman',
      'Pekerjaan sebelumnya belum serah terima',
      'Prakiraan hujan deras 2 hari',
      'Material keramik masih indent',
      'MEP layout belum final',
    ];
    const seeded = picks.slice(0, 8).map((s, i) => ({
      id: 'seed' + Date.now() + i,
      workId: s.id,
      workLabel: s.name + ' · ' + this.prettyZone(s.zoneLabel) + ' · M' + s.startWeek,
      type: types[i % types.length],
      note: notes[i % notes.length],
      seeded: true,
    }));
    c.constraints = [...(c.constraints || []), ...seeded];
  },
  unlockMilestones() {
    if (this.state.contractor.pullLocked) return;
    this.state.contractor.milestonesLocked = false;
    this.state.contractor.commitments = {};
    this.save();
  },
  unlockPullPlan() {
    this.state.contractor.pullLocked = false;
    this.save();
  },
  _stripWeekLogs(week) {
    const w = Number(week);
    this.state.contractor.weeklyProgress = (this.state.contractor.weeklyProgress || []).filter(r => Number(r.week) !== w);
    this.state.contractor.actualLog = (this.state.contractor.actualLog || []).filter(r => Number(r.week) !== w);
    this.state.contractor.progressLocks = (this.state.contractor.progressLocks || []).filter(r => Number(r.week) !== w);
    this.state.contractor.problemRegistry = (this.state.contractor.problemRegistry || []).filter(r => Number(r.week) !== w);
  },
  _resetWeekOps() {
    const w = this.playWeek;
    this.state.contractor.scheduleUsed = (this.state.contractor.scheduleUsed || []).filter(x => typeof x !== 'string' && Number(x.week) !== w);
    this.state.contractor.weekRemainder = (this.state.contractor.weekRemainder || []).filter(r => Number(r.fromWeek) !== w);
    this.state.contractor.weekFailedTypes = [];
    this.state.contractor.wwp = [];
    this.state.contractor.ppc = [];
    this.state.contractor.weekClosed = false;
    this.state.contractor.wwpLocked = false;
    this.state.contractor.huddleDayIdx = 0;
    this.state.contractor.huddleResults = {};
    this.state.contractor.followUps = [];
    this.state.contractor.huddleComplete = false;
    this.state.contractor.extendId = null;
    this.state.contractor.extendNote = '';
    this.state.contractor.learningNote = '';
    this.state.contractor.wwpSnapshot = null;
    this.progressDraft = null;
    this.stopHuddleTimer();
    this._stripWeekLogs(this.playWeek);
  },
  rewindTo(target) {
    if (!target) return;
    const msgs = {
      huddle: 'Ulang Daily Huddle minggu ini?\nKembali ke WWP saat dikunci. Hasil huddle, pekerjaan yang dimasukkan di huddle, PPC minggu ini dihapus.',
      wwp: 'Ulang WWP minggu ini?\nLook-ahead tetap. Pecah hari, huddle, PPC, dan bakukan minggu ini dihapus.',
      lookahead: 'Ulang Look-ahead minggu ini?\nPhase Plan tetap. Make-ready + WWP + huddle minggu ini dihapus. Minggu sebelumnya tetap.',
      phase: 'Kembali ke Phase Plan?\nLook-ahead dan semua produksi direset. Kontrak nego tetap.',
      contract: 'Kembali ke Master Plan?\nSemua LPS lapangan direset. Kontrak nego tetap.',
      owner: 'Reset ke Pemilik?\nSemua progres (Pemilik → Kontraktor) hilang.',
    };
    if (!msgs[target]) return;
    if (!confirm(msgs[target])) return;
    if (target === 'owner') {
      this.stopHuddleTimer();
      this.state = initState();
      this.currentStage = 'owner';
      this.progressDraft = null;
      this.save();
      return;
    }
    if (target === 'contract') {
      this.stopHuddleTimer();
      this.state.contractor = emptyContractor();
      this.progressDraft = null;
      this.save();
      this.setStage('contractor-master');
      return;
    }
    if (target === 'phase') {
      this.stopHuddleTimer();
      const keep = this.state.contractor;
      this.state.contractor = Object.assign(emptyContractor(), {
        zonesLocked: keep.zonesLocked,
        zonesPreview: keep.zonesPreview,
        selectedZone: keep.selectedZone,
        milestonesLocked: keep.milestonesLocked,
        phaseWindows: keep.phaseWindows || {},
        commitments: keep.commitments || {},
        reviewed: keep.reviewed || {},
        pullLocked: false,
      });
      this._seedGivenConstraints();
      this.progressDraft = null;
      this.save();
      this.setStage('contractor-phase');
      return;
    }
    if (target === 'lookahead') {
      this._resetWeekOps();
      this._seedGivenConstraints();
      const off = Number(this.state.contractor.lookOffset) || 0;
      const l1 = off + 1;
      const futureWork = new Set(this._allStickies().filter(s => Number(s.startWeek) >= l1).map(s => s.id));
      const futureCons = new Set((this.state.contractor.constraints || []).filter(c => futureWork.has(c.workId)).map(c => c.id));
      this.state.contractor.makeReady = (this.state.contractor.makeReady || []).filter(x => {
        if (futureCons.has(x.constraintId)) return false;
        return Number(x.atOffset) < off;
      });
      this.state.contractor.selectedLookRel = 'L1';
      this.state.contractor.selectedLookWorkId = null;
      this.save();
      this.setStage('contractor-production');
      return;
    }
    if (target === 'wwp') {
      this._resetWeekOps();
      this.buildWwp();
      this.save();
      this.setStage('contractor-wwp');
      return;
    }
    if (target === 'huddle') {
      const snap = this.state.contractor.wwpSnapshot;
      if (snap) {
        this.state.contractor.wwp = JSON.parse(JSON.stringify(snap.wwp || []));
        this.state.contractor.weekRemainder = JSON.parse(JSON.stringify(snap.weekRemainder || []));
        this.state.contractor.scheduleUsed = [...(snap.scheduleUsed || [])];
      }
      this.state.contractor.wwpLocked = true;
      this.state.contractor.huddleDayIdx = 0;
      this.state.contractor.huddleResults = {};
      this.state.contractor.followUps = [];
      this.state.contractor.huddleComplete = false;
      this.state.contractor.extendId = null;
      this.state.contractor.extendNote = '';
      this.state.contractor.extendDays = '1';
      this.state.contractor.extendType = 'material';
      this.state.contractor.weekFailedTypes = [];
      this.state.contractor.ppc = [];
      this.state.contractor.weekClosed = false;
      this.state.contractor.learningNote = '';
      this.scheduleDraft = null;
      this.progressDraft = null;
      this._stripWeekLogs(this.playWeek);
      this.resetHuddleTimer();
      this.save();
      this.setStage('contractor-huddle');
      return;
    }
  },
  _upsertMakeReady(constraintId, status) {
    const team = this.selectedLookTeam || 'Struktur';
    const off = this.state.contractor.lookOffset || 0;
    const list = [...(this.state.contractor.makeReady || [])];
    const i = list.findIndex(x => x.constraintId === constraintId);
    const row = { id: (i >= 0 && list[i].id) || ('mr' + Date.now()), constraintId, team, status, atOffset: off };
    if (i >= 0) list[i] = { ...list[i], ...row };
    else list.push(row);
    this.state.contractor.makeReady = list;
  },
  clearConstraintNow(constraintId) {
    this._upsertMakeReady(constraintId, 'done');
    this.save();
  },
  cannotRemoveConstraint(constraintId) {
    this._upsertMakeReady(constraintId, 'failed');
    this.save();
  },
  promiseMakeReady(constraintId) {
    const team = this.selectedLookTeam || 'Struktur';
    const list = [...(this.state.contractor.makeReady || [])];
    const existing = list.find(x => x.constraintId === constraintId);
    if (existing && (existing.status === 'promised' || existing.status === 'done')) return;
    if (existing && existing.status === 'failed') {
      this.state.contractor.makeReady = list.map(x =>
        x.constraintId === constraintId ? { ...x, status: 'promised', team, atOffset: this.state.contractor.lookOffset || 0 } : x
      );
    } else {
      list.push({ id: 'mr' + Date.now(), constraintId, team, status: 'promised', atOffset: this.state.contractor.lookOffset || 0 });
      this.state.contractor.makeReady = list;
    }
    this.save();
  },
  resolveMakeReady(constraintId, ok) {
    this.state.contractor.makeReady = (this.state.contractor.makeReady || []).map(x => {
      if (x.constraintId === constraintId && (x.status === 'promised' || x.status === 'failed')) return { ...x, status: ok ? 'done' : 'failed' };
      return x;
    });
    if (ok) {
      const hit = (this.state.contractor.constraints || []).find(c => c.id === constraintId);
      if (hit && !hit.given) {
        this.state.contractor.constraints = (this.state.contractor.constraints || []).filter(c => c.id !== constraintId);
      }
    }
    this.save();
  },
    wwpByDay(day) {
    return ((this.state.contractor && this.state.contractor.wwp) || []).filter(x => x.day === day);
  },
  _wwpSortKey(s) {
    const parent = s.parentId || (s.id || '').split('_')[0];
    const order = WORKS.findIndex(w => w.id === parent);
    return (order < 0 ? 99 : order) * 100 + (Number(s.startWeek) || 0);
  },
       _makeWwpItem(s, day, zoneLabel, scheduled) {
    const parent = s.parentId || (s.id || '').split('_')[0];
    const base = WORKS.find(w => w.id === parent) || s;
    const zLabel = this.prettyZone(zoneLabel || s.zoneLabel || (s.zoneId || 'Z1').toUpperCase());
    const zBase = String(zLabel).split('-')[0].toUpperCase();
    return {
      id: 'wwp' + Date.now() + Math.random().toString(36).slice(2, 6),
      workId: s.id,
      parentId: parent,
      name: s.name || base.name,
      team: s.team || base.team,
      color: s.color || base.color,
      zoneBase: zBase,
      zoneLabel: zLabel,
      day,
      scheduled: !!scheduled,
      canSplit: true,
      isLead: false,
      origZoneLabel: zLabel,
    };
  },
  buildWwp() {
    if (!this.state.contractor.pullLocked) return;
    const week = this.targetExecWeek;
    const days = WWP_DAYS.map(d => d.id);
    const used = this._scheduleUsedIdSet();
    const remItems = [];
    const placedZones = new Set();
    const placedSticky = new Set();
    for (const c of this._carryStickies()) {
      const z = String(c.zoneLabel || '').toUpperCase();
      if (z && placedZones.has(z)) continue;
      if (z) placedZones.add(z);
      const it = this._makeWwpItem(c, days[Math.min(remItems.length, days.length - 1)], c.zoneLabel, !c.scheduled);
      it.canSplit = false;
      it.isLead = false;
      it.carryNote = c.carryNote || (c.scheduled ? ('Dijadwalkan dari M' + (week - 1)) : ('Tidak selesai M' + (week - 1)));
      remItems.push(it);
      if (c.id) placedSticky.add(c.id);
    }
    const ready = this._allStickies()
      .filter(s => Number(s.startWeek) === week && !used.has(s.id) && !placedSticky.has(s.id) && !this._stickyConsumed(s) && this._isWorkReady(s.id))
      .sort((a, b) => this._wwpSortKey(a) - this._wwpSortKey(b));
    const items = ready.map((s, i) => this._makeWwpItem(s, days[Math.min(i + remItems.length, days.length - 1)], s.zoneLabel, false));
    this.state.contractor.wwp = remItems.concat(items);
    this.state.contractor.ppc = [];
    this.state.contractor.wwpLocked = false;
    this.state.contractor.huddleDayIdx = 0;
    this.state.contractor.huddleResults = {};
    this.state.contractor.followUps = [];
    this.state.contractor.huddleComplete = false;
    this.save();
  },
  openScheduleIn(workId) {
    if (this.state.contractor.weekClosed) return;
    if (!this._isWorkReady(workId)) return;
    const sticky = this._allStickies().find(s => s.id === workId);
    if (sticky && this.scheduleBlockedReason(sticky)) return;
    const min = this.currentStage === 'contractor-huddle' ? (Number(this.state.contractor.huddleDayIdx) || 0) : 0;
    this.scheduleDraft = { workId, startDay: WWP_DAYS[min].id, days: 1 };
  },
  cancelScheduleIn() { this.scheduleDraft = null; },
  confirmScheduleIn() {
    const p = this.schedulePlan;
    if (!p || !p.fit) return;
    if ((this.state.contractor.wwp || []).some(x => x.workId === p.sticky.id)) return;
    const why = this.scheduleBlockedReason(p.sticky);
    if (why) return;
    const list = [...(this.state.contractor.wwp || [])];
    p.placed.forEach((pl, i) => {
      const it = this._makeWwpItem(p.sticky, pl.day, pl.zone, true);
      it.canSplit = false;
      it.isLead = i === 0;
      it.origZoneLabel = p.prefix;
      list.push(it);
    });
    this.state.contractor.wwp = list;
    if (p.remain > 0) {
      this.state.contractor.weekRemainder = [...(this.state.contractor.weekRemainder || []), {
        id: 'rem' + Date.now(),
        stickyId: p.sticky.id,
        parentId: p.sticky.parentId,
        name: p.sticky.name,
        team: p.sticky.team,
        color: p.sticky.color,
        zoneBase: p.prefix,
        nextIndex: p.fit + 1,
        days: p.remain,
        fromWeek: this.playWeek,
        toWeek: this.playWeek + 1,
      }];
    } else if (Number(p.sticky.startWeek) > this.playWeek) {
      this.state.contractor.scheduleUsed = [...(this.state.contractor.scheduleUsed || []), { id: p.sticky.id, week: this.playWeek }];
    }
    this.scheduleDraft = null;
    this.save();
  },
  moveWwpItem(itemId, day) {
    if (this.state.contractor.weekClosed) return;
    this.state.contractor.wwp = (this.state.contractor.wwp || []).map(x => x.id === itemId ? { ...x, day } : x);
    this.save();
  },
    splitWwpItem(itemId) {
    if (this.state.contractor.weekClosed) return;
    const sel = document.getElementById('split-' + itemId);
    const n = Math.max(1, Math.min(6, Number(sel && sel.value) || 1));
    if (n === 1) return;
    const list = [...(this.state.contractor.wwp || [])];
    const idx = list.findIndex(x => x.id === itemId);
    if (idx < 0) return;
    const base = list[idx];
    const days = WWP_DAYS.map(d => d.id);
    const startDayIdx = Math.max(0, days.indexOf(base.day));
    const fit = Math.max(1, Math.min(n, days.length - startDayIdx));
    const remain = n - fit;
    const prefix = this.prettyZone(base.zoneLabel || base.zoneBase || 'Z1');
    const unit = /^Z\d+$/i.test(prefix) ? (prefix + '-a') : prefix;
    const created = [];
    for (let i = 0; i < fit; i++) {
      created.push({
        ...base,
        id: 'wwp' + Date.now() + i + Math.random().toString(36).slice(2, 5),
        day: days[startDayIdx + i],
        zoneLabel: unit + '-' + (i + 1),
        canSplit: false,
        isLead: i === 0,
        origZoneLabel: prefix,
      });
    }
    list.splice(idx, 1, ...created);
    this.state.contractor.wwp = list;
    if (remain > 0) {
      this.state.contractor.weekRemainder = [...(this.state.contractor.weekRemainder || []), {
        id: 'rem' + Date.now(),
        stickyId: base.workId,
        parentId: base.parentId,
        name: base.name,
        team: base.team,
        color: base.color,
        zoneBase: unit,
        nextIndex: fit + 1,
        days: remain,
        fromWeek: this.playWeek,
        toWeek: this.playWeek + 1,
        source: 'split',
      }];
    }
    if (this.state.contractor.wwpLocked) {
      this.state.contractor.wwpSnapshot = {
        wwp: JSON.parse(JSON.stringify(this.state.contractor.wwp || [])),
        weekRemainder: JSON.parse(JSON.stringify(this.state.contractor.weekRemainder || [])),
        scheduleUsed: [...(this.state.contractor.scheduleUsed || [])],
      };
    }
    this.save();
  },
  unsplitWwpItem(itemId) {
    if (this.state.contractor.weekClosed) return;
    const list = [...(this.state.contractor.wwp || [])];
    const lead = list.find(x => x.id === itemId);
    if (!lead || !lead.origZoneLabel) return;
    const workId = lead.workId;
    const orig = lead.origZoneLabel;
    const rest = list.filter(x => !(x.workId === workId && x.origZoneLabel === orig && !x.canSplit));
    const parent = {
      ...lead,
      id: 'wwp' + Date.now() + Math.random().toString(36).slice(2, 6),
      day: lead.day,
      zoneLabel: orig,
      canSplit: true,
      isLead: false,
      origZoneLabel: orig,
    };
    rest.push(parent);
    this.state.contractor.wwp = rest;
    this.state.contractor.weekRemainder = (this.state.contractor.weekRemainder || []).filter(r =>
      !(r.source === 'split' && r.stickyId === workId && r.zoneBase === orig && Number(r.fromWeek) === this.playWeek)
    );
    this.save();
  },
  scheduleToWwp(workId) {
    if (this.state.contractor.weekClosed) return;
    if (!this._isWorkReady(workId)) {
      alert('Hanya pekerjaan SiapKerja! yang boleh dimasukkan ke jadwal.');
      return;
    }
    if ((this.state.contractor.wwp || []).some(x => x.workId === workId)) return;
    const sticky = this._allStickies().find(s => s.id === workId);
    if (!sticky) return;
    const days = WWP_DAYS.map(d => d.id);
    let best = days[0], bestN = 1e9;
    for (const d of days) {
      const n = this.wwpByDay(d).length;
      if (n < bestN) { bestN = n; best = d; }
    }
    this.state.contractor.wwp = [...(this.state.contractor.wwp || []), this._makeWwpItem(sticky, best, sticky.zoneLabel, true)];
    this.save();
  },  
  setPpc(workId, status, reason) {
    if (this.state.contractor.weekClosed) return;
    if (status === 'failed' && !reason) {
      alert('Pilih alasan gagal (constraint lapangan / penyebab).');
      return;
    }
    const list = [...(this.state.contractor.ppc || []).filter(p => p.workId !== workId)];
    list.push({ workId, status, reason: reason || null });
    this.state.contractor.ppc = list;
    this.save();
  },
  ppcLabel(workId) {
    const p = ((this.state.contractor && this.state.contractor.ppc) || []).find(x => x.workId === workId);
    if (!p) return 'Belum dinilai';
    if (p.status === 'done') return 'Selesai';
    return 'Gagal' + (p.reason ? (' · ' + this.constraintLabel(p.reason)) : '');
  },
    lockWwp() {
    if (!(this.state.contractor.wwp || []).length) {
      alert('Masukkan pekerjaan ke hari dulu, atau L1 memang tanpa kerja.');
      return;
    }
    const week = this.targetExecWeek;
    const openL1 = this._allStickies().filter(s => Number(s.startWeek) === week && !this._stickyConsumed(s) && !this._isWorkReady(s.id));
    if (openL1.length) {
      alert('L1 / M' + week + ' masih ada constraint: ' + openL1.map(s => s.name + ' ' + this.prettyZone(s.zoneLabel)).join(', ') + '. Hilangkan dulu di Look-ahead Plan.');
      return;
    }
    this.state.contractor.wwpSnapshot = {
      wwp: JSON.parse(JSON.stringify(this.state.contractor.wwp || [])),
      weekRemainder: JSON.parse(JSON.stringify(this.state.contractor.weekRemainder || [])),
      scheduleUsed: [...(this.state.contractor.scheduleUsed || [])],
    };
    this.state.contractor.wwpLocked = true;
    this.state.contractor.huddleDayIdx = 0;
    this.state.contractor.huddleResults = {};
    this.state.contractor.followUps = [];
    this.state.contractor.huddleComplete = false;
    this.state.contractor.extendId = null;
    this.state.contractor.extendNote = '';
    this.state.contractor.weekFailedTypes = [];
    this.save();
    this.setStage('contractor-huddle');
  },
  get huddleTimerLabel() {
    const s = Math.max(0, Number(this.huddleTimerLeft) || 0);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
  },
  startHuddleTimer() {
    this.stopHuddleTimer();
    this.huddleTimerLeft = 15 * 60;
    this.huddleTimerOn = true;
    this._huddleTimerHandle = setInterval(() => {
      if (this.huddleTimerLeft <= 0) {
        this.huddleTimerLeft = 0;
        this.stopHuddleTimer();
        return;
      }
      this.huddleTimerLeft -= 1;
    }, 1000);
  },
  stopHuddleTimer() {
    if (this._huddleTimerHandle) {
      clearInterval(this._huddleTimerHandle);
      this._huddleTimerHandle = null;
    }
    this.huddleTimerOn = false;
  },
  resetHuddleTimer() {
    this.stopHuddleTimer();
    this.huddleTimerLeft = 15 * 60;
  },
  get huddleDayLabel() {
    const d = WWP_DAYS[this.state.contractor.huddleDayIdx || 0];
    return d ? d.label : 'Sen';
  },
  get huddleTodayItems() {
    const day = (WWP_DAYS[this.state.contractor.huddleDayIdx || 0] || {}).id;
    return this.wwpByDay(day);
  },
    _huddleKey(id) {
    const day = (WWP_DAYS[this.state.contractor.huddleDayIdx || 0] || {}).id || 'sen';
    return day + ':' + id;
  },
  huddleStatus(id) {
    const r = (this.state.contractor.huddleResults || {})[this._huddleKey(id)];
    return r ? r.status : null;
  },
  _zoneKey(label) {
    return this.prettyZone(label).toUpperCase();
  },
  _zonesOverlap(a, b) {
    const na = this._zoneKey(a), nb = this._zoneKey(b);
    if (!na || !nb) return false;
    return na === nb || na.startsWith(nb + '-') || nb.startsWith(na + '-');
  },
  _itemHuddleDone(item) {
    const hr = this.state.contractor.huddleResults || {};
    for (const d of WWP_DAYS) {
      const r = hr[d.id + ':' + item.id];
      if (r && r.status === 'done') return true;
    }
    return false;
  },
  _itemHuddleFailed(item) {
    const hr = this.state.contractor.huddleResults || {};
    for (const d of WWP_DAYS) {
      const r = hr[d.id + ':' + item.id];
      if (r && r.status === 'failed') return true;
    }
    return false;
  },
  _workType(item) {
    if (!item) return '';
    if (item.parentId && WORKS.some(w => w.id === item.parentId)) return item.parentId;
    for (const key of [item.workId, item.id]) {
      const t = String(key || '').split('_')[0];
      if (WORKS.some(w => w.id === t)) return t;
    }
    const byName = WORKS.find(w => w.name === item.name);
    return byName ? byName.id : '';
  },
  _predBlockReason(item) {
    if (!item) return '';
    const pid0 = this._workType(item);
    const wdef = WORKS.find(x => x.id === pid0);
    const preds = (wdef && wdef.pred) || item.pred || [];
    if (!preds.length) return '';
    const cells = this._zoneCells();
    for (const predId of preds) {
      const predW = WORKS.find(x => x.id === predId);
      const name = (predW && predW.name) || predId;
      const pc = cells.filter(c => c.parentId === predId);
      const ov = pc.filter(c => this._zonesOverlap(item.zoneLabel, c.zoneLabel));
      const relevant = ov.length ? ov : pc;
      if (!relevant.length) return 'Menunggu ' + name + ' selesai (urutan phase plan)';
      const undone = relevant.filter(c => c.status !== 'done');
      if (undone.length) {
        const z = this.prettyZone(undone[0].zoneLabel);
        return 'Menunggu ' + name + (z ? (' · ' + z) : '') + ' selesai (urutan phase plan)';
      }
    }
    return '';
  },
  huddleBlockReason(item, forPromo) {
    if (!item) return '';
    if (!forPromo && this._weatherBlocksDay(item.day)) {
      return 'Hujan skenario (Sen–Sel) — perpanjang atau gagal (Cuaca)';
    }
    const hist = this._predBlockReason(item);
    if (hist) return hist;
    const pid0 = this._workType(item);
    const w = WORKS.find(x => x.id === pid0);
    const preds = (w && w.pred) || item.pred || [];
    if (!preds.length) return '';
    const failedTypes = new Set(this.state.contractor.weekFailedTypes || []);
    const wwp = this.state.contractor.wwp || [];
    for (const it of wwp) {
      if (this._itemHuddleFailed(it)) failedTypes.add(this._workType(it));
    }
    const today = Number(this.state.contractor.huddleDayIdx) || 0;
    for (const pid of preds) {
      const predW = WORKS.find(x => x.id === pid);
      const name = (predW && predW.name) || pid;
      if (failedTypes.has(pid)) return name + ' tidak bisa minggu ini (prasyarat)';
      const cands = wwp.filter(x => this._workType(x) === pid);
      if (!cands.length) continue;
      const ov = cands.filter(x => this._zonesOverlap(item.zoneLabel, x.zoneLabel));
      const relevant = ov.length ? ov : cands;
      for (const c of relevant) {
        const z = c.zoneLabel || '';
        const loc = name + (z ? (' · ' + z) : '');
        if (this._itemHuddleFailed(c)) return loc + ' tidak bisa minggu ini (prasyarat)';
        if (this._itemHuddleDone(c)) continue;
        const cidx = WWP_DAYS.findIndex(d => d.id === c.day);
        if (cidx < 0) continue;
        if (cidx < today) return 'Menunggu ' + loc + ' selesai (prasyarat / zona)';
        if (!forPromo && cidx <= today) return 'Menunggu ' + loc + ' selesai (prasyarat / zona)';
      }
    }
    return '';
  },
  scheduleBlockedReason(sticky) {
    if (!sticky) return '';
    const day = (WWP_DAYS[this.state.contractor.huddleDayIdx || 0] || {}).id || 'sen';
    return this.huddleBlockReason({
      parentId: sticky.parentId,
      zoneLabel: sticky.zoneLabel,
      pred: sticky.pred,
      name: sticky.name,
      workId: sticky.id,
      day,
    }, true);
  },
  wasCarriedOver(id) {
    return ((this.state.contractor.followUps || []).some(f => f.workId === id));
  },
  markHuddleDone(id) {
    if (this.state.contractor.huddleComplete) return;
    const item = (this.state.contractor.wwp || []).find(x => x.id === id);
    if (item && this.huddleBlockReason(item)) return;
    const hr = { ...(this.state.contractor.huddleResults || {}) };
    hr[this._huddleKey(id)] = { status: 'done' };
    this.state.contractor.huddleResults = hr;
    this.state.contractor.extendId = null;
    this.save();
  },
  openExtend(id) {
    this.state.contractor.extendId = id;
    this.state.contractor.extendNote = '';
    const item = (this.state.contractor.wwp || []).find(x => x.id === id);
    const blocked = item && this.huddleBlockReason(item);
    this.state.contractor.extendDays = blocked ? 'fail' : (this.weatherToday ? '2' : '1');
    this.state.contractor.extendType = blocked ? 'prereq' : (this.weatherToday ? 'weather' : 'material');
  },
  _addRegistry(entry) {
    const week = this.playWeek;
    this.state.contractor.problemRegistry = [...(this.state.contractor.problemRegistry || []), {
      id: 'pr' + Date.now() + Math.random().toString(36).slice(2, 5),
      week,
      ...entry,
    }];
  },
  extendHuddleItem(id) {
    const note = (this.state.contractor.extendNote || '').trim();
    const type = this.state.contractor.extendType || 'lain';
    const mode = this.state.contractor.extendDays || '1';
    if (!note) {
      alert('Catat masalah/hambatan (wajib). Masuk registry.');
      return;
    }
    const days = WWP_DAYS.map(d => d.id);
    const idx = this.state.contractor.huddleDayIdx || 0;
    const list0 = [...(this.state.contractor.wwp || [])];
    const item = list0.find(x => x.id === id);
    if (!item) return;
    const hr = { ...(this.state.contractor.huddleResults || {}) };
    this._addRegistry({
      workId: id, name: item.name, zoneLabel: item.zoneLabel || '',
      type, note, team: item.team || '',
      dayLabel: (WWP_DAYS[idx] || {}).label || '',
      source: 'huddle',
    });
    this.state.contractor.followUps = [...(this.state.contractor.followUps || []), {
      id: 'fu' + Date.now(),
      workId: id,
      name: item.name,
      zoneLabel: item.zoneLabel,
      dayLabel: (WWP_DAYS[idx] || {}).label || '',
      problem: note,
      type,
    }];
    if (mode === 'fail') {
      hr[this._huddleKey(id)] = { status: 'failed', problem: note, type };
      this.state.contractor.huddleResults = hr;
      const wt = this._workType(item);
      if (wt && !(this.state.contractor.weekFailedTypes || []).includes(wt)) {
        this.state.contractor.weekFailedTypes = [...(this.state.contractor.weekFailedTypes || []), wt];
      }
      this.state.contractor.extendId = null;
      this.state.contractor.extendNote = '';
      this.save();
      return;
    }
    const n = Math.max(1, Math.min(2, Number(mode) || 1));
    hr[this._huddleKey(id)] = { status: 'extended', problem: note, type };
    this.state.contractor.huddleResults = hr;
    const remainingDays = 5 - idx;
    const fit = Math.max(0, Math.min(n, remainingDays));
    const remain = n - fit;
    let list = list0;
    if (fit >= 1) {
      const d1 = days[idx + 1];
      list = list.map(x => x.id === id ? { ...x, day: d1 } : x);
    }
    if (fit >= 2) {
      const base = list.find(x => x.id === id) || item;
      list = [...list, {
        ...base,
        id: 'wwp' + Date.now() + Math.random().toString(36).slice(2, 5),
        day: days[idx + 2],
        canSplit: false,
        isLead: false,
      }];
    }
    this.state.contractor.wwp = list;
    if (remain > 0) {
      const prefix = item.origZoneLabel || item.zoneLabel || 'Z';
      this.state.contractor.weekRemainder = [...(this.state.contractor.weekRemainder || []), {
        id: 'rem' + Date.now(),
        stickyId: item.workId,
        parentId: item.parentId,
        name: item.name,
        team: item.team,
        color: item.color,
        zoneBase: prefix,
        nextIndex: 1,
        days: remain,
        fromWeek: this.playWeek,
        toWeek: this.playWeek + 1,
      }];
    }
    this.state.contractor.extendId = null;
    this.state.contractor.extendNote = '';
    this.save();
  },
  nextHuddleDay() {
    const idx = this.state.contractor.huddleDayIdx || 0;
    if (idx >= 5) return;
    const pending = this.huddleTodayItems.filter(it => !this.huddleStatus(it.id));
    if (pending.length) {
      if (!confirm(pending.length + ' item hari ini belum dinilai. Lanjut tetap?')) return;
    }
    this.state.contractor.huddleDayIdx = idx + 1;
    this.state.contractor.extendId = null;
    this.save();
    this.resetHuddleTimer();
  },
    completeHuddle() {
    const pending = this.huddleTodayItems.filter(it => !this.huddleStatus(it.id));
    if (pending.length) {
      if (!confirm(pending.length + ' item Sabtu belum dinilai. Selesai huddle tetap?')) return;
    }
    this.state.contractor.huddleComplete = true;
    this.applyHuddleToPpc();
    this.stopHuddleTimer();
    this.setStage('contractor-learning');
  },
  get canFastForwardHuddle() {
    if (!this.state.contractor.wwpLocked || this.state.contractor.huddleComplete || this.state.contractor.weekClosed) return false;
    if (this.weatherToday) return false;
    const idx = Number(this.state.contractor.huddleDayIdx) || 0;
    const wwp = this.state.contractor.wwp || [];
    for (let i = idx; i < 6; i++) {
      const day = WWP_DAYS[i].id;
      const items = wwp.filter(x => x.day === day);
      for (const it of items) {
        if (this.huddleStatus(it.id)) continue;
        if (this.huddleBlockReason(it)) return false;
      }
    }
    return true;
  },
  fastForwardHuddle() {
    if (!this.canFastForwardHuddle) {
      alert('Ada item terkunci atau skenario gangguan. Jalankan hari per hari.');
      return;
    }
    const start = Number(this.state.contractor.huddleDayIdx) || 0;
    for (let i = start; i < 6; i++) {
      this.state.contractor.huddleDayIdx = i;
      const items = [...this.huddleTodayItems];
      for (const it of items) {
        if (!this.huddleStatus(it.id) && !this.huddleBlockReason(it)) this.markHuddleDone(it.id);
      }
    }
    this.completeHuddle();
  },
    applyHuddleToPpc() {
    if (this.state.contractor.weekClosed) return;
    const items = this.state.contractor.wwp || [];
    const hr = this.state.contractor.huddleResults || {};
    const list = [];
    for (const item of items) {
      let everDone = false;
      let failReason = 'lain';
      for (const d of WWP_DAYS) {
        const r = hr[d.id + ':' + item.id];
        if (r && r.status === 'done') everDone = true;
        if (r && (r.status === 'failed' || r.status === 'extended') && r.type) failReason = r.type;
      }
      list.push(everDone
        ? { workId: item.id, status: 'done', reason: null }
        : { workId: item.id, status: 'failed', reason: failReason });
    }
    this.state.contractor.ppc = list;
    this.save();
  },
  _hydrateFromArchive() {
    const c = this.state.contractor;
    if (!c) return;
    const arch = c.execArchive || [];
    if (!arch.length) return;
    if (!(c.actualLog || []).length) {
      const log = [];
      for (const a of arch) {
        for (const it of (a.wwp || [])) {
          const p = (a.ppc || []).find(x => x.workId === it.id);
          log.push({
            id: it.id,
            week: a.week,
            parentId: this._workType(it) || it.parentId,
            stickyId: it.workId,
            name: it.name,
            zoneLabel: it.zoneLabel,
            done: !!(p && p.status === 'done'),
          });
        }
      }
      c.actualLog = log;
    }
    const week = this.targetExecWeek;
    const prev = week - 1;
    const hasRem = (c.weekRemainder || []).some(x => Number(x.toWeek) === week);
    if (!hasRem) {
      const a = arch.find(x => Number(x.week) === prev);
      if (a && (a.remainder || []).length) {
        c.weekRemainder = [...(c.weekRemainder || []), ...a.remainder];
      }
    }
  },
  _allExecCells() {
    const out = [];
    const seen = new Set();
    const add = (c) => {
      const z = this.prettyZone(c.zoneLabel);
      const k = z + '|' + Number(c.week);
      if (!z || seen.has(k)) return;
      seen.add(k);
      out.push({ ...c, zoneLabel: z, parentId: this._workType(c) || c.parentId });
    };
    for (const a of ((this.state.contractor && this.state.contractor.actualLog) || [])) add(a);
    for (const arch of ((this.state.contractor && this.state.contractor.execArchive) || [])) {
      for (const it of (arch.wwp || [])) {
        const p = (arch.ppc || []).find(x => x.workId === it.id);
        add({
          id: it.id,
          week: arch.week,
          parentId: it.parentId,
          stickyId: it.workId,
          name: it.name,
          zoneLabel: it.zoneLabel,
          done: !!(p && p.status === 'done'),
          team: it.team,
          color: it.color,
        });
      }
    }
    return out;
  },
  ppcStatus(id) {
    const p = ((this.state.contractor && this.state.contractor.ppc) || []).find(x => x.workId === id);
    return p ? p.status : null;
  },
  setPpcStatus(id, status) {
    if (this.state.contractor.weekClosed) return;
    const list = [...(this.state.contractor.ppc || [])];
    const i = list.findIndex(x => x.workId === id);
    const row = { workId: id, status, reason: status === 'failed' ? (i >= 0 && list[i].reason) || 'lain' : null };
    if (i >= 0) list[i] = { ...list[i], ...row };
    else list.push(row);
    this.state.contractor.ppc = list;
    this.save();
  },
  _ensurePpcFromHuddle() {
    if (!this.state || !this.state.contractor) return;
    if (!this.state.contractor.huddleComplete || this.state.contractor.weekClosed) return;
    if ((this.state.contractor.ppc || []).length) return;
    this.applyHuddleToPpc();
  },
  get problemFrequency() {
    const reg = this.state.contractor.problemRegistry || [];
    const map = {};
    for (const e of reg) {
      const t = e.type || 'lain';
      map[t] = (map[t] || 0) + 1;
    }
    const total = reg.length || 1;
    return Object.keys(map)
      .map(type => ({ type, count: map[type], pct: Math.round(100 * map[type] / total) }))
      .sort((a, b) => b.count - a.count);
  },
  ppcWeekNote(row) {
    const week = row && row.week;
    const fromReg = (this.state.contractor.problemRegistry || [])
      .filter(e => Number(e.week) === Number(week))
      .map(e => this.constraintLabel(e.type) + ': ' + (e.name || '') + (e.zoneLabel ? (' ' + this.prettyZone(e.zoneLabel)) : '') + (e.note ? (' — ' + e.note) : ''))
      .filter(Boolean);
    if (fromReg.length) return fromReg.join('; ');
    return (row && row.note) || '—';
  },
  lockLearning() {
    const items = this.state.contractor.wwp || [];
    const ppc = this.state.contractor.ppc || [];
    const missing = items.filter(i => !ppc.some(p => p.workId === i.id));
    if (missing.length) {
      alert('Centang selesai / tidak selesai untuk semua pecahan dulu (' + missing.length + ' belum).');
      return;
    }
    const reg = [...(this.state.contractor.problemRegistry || [])];
    const week = this.targetExecWeek;
    const have = new Set(reg.filter(r => Number(r.week) === week).map(r => r.workId));
    for (const p of ppc) {
      if (p.status !== 'failed') continue;
      if (have.has(p.workId)) continue;
      const item = items.find(x => x.id === p.workId) || {};
      reg.push({
        id: 'pr' + Date.now() + Math.random().toString(36).slice(2, 5),
        week, workId: p.workId, name: item.name || '', zoneLabel: item.zoneLabel || '',
        type: p.reason || 'lain', note: '', team: item.team || '',
      });
      have.add(p.workId);
    }
    this.state.contractor.problemRegistry = reg;
    const done = ppc.filter(p => p.status === 'done').length;
    const planned = items.length;
    const pct = planned ? Math.round(100 * done / planned) : 0;
    const wp = [...(this.state.contractor.weeklyProgress || [])].filter(r => r.week !== week);
    wp.push({
      week, planned, done, ppc: pct,
      note: this.ppcWeekNote({ week, note: (this.state.contractor.learningNote || '').trim() }),
      teamPpc: this._teamPpcRows(items, ppc),
    });
    wp.sort((a, b) => a.week - b.week);
    this.state.contractor.weeklyProgress = wp;
    const log = [...(this.state.contractor.actualLog || [])].filter(x => Number(x.week) !== week);
    for (const item of items) {
      const p = ppc.find(x => x.workId === item.id);
      log.push({
        id: 'al' + Date.now() + Math.random().toString(36).slice(2, 5),
        week,
        parentId: item.parentId,
        stickyId: item.workId,
        name: item.name || '',
        zoneLabel: item.zoneLabel || '',
        done: !!(p && p.status === 'done'),
      });
    }
    this.state.contractor.actualLog = log;
    const bag = [...(this.state.contractor.carryOver || [])].filter(x => Number(x.fromWeek) !== week);
    const seenBag = new Set(bag.filter(x => Number(x.toWeek) === week + 1).map(x => this.prettyZone(x.zoneLabel)));
    for (const item of items) {
      const p = ppc.find(x => x.workId === item.id);
      if (p && p.status === 'done') continue;
      const zlab = this.prettyZone(item.zoneLabel);
      if (!zlab || seenBag.has(zlab)) continue;
      seenBag.add(zlab);
      bag.push({
        stickyId: item.workId,
        parentId: item.parentId,
        name: item.name,
        team: item.team,
        color: item.color,
        zoneLabel: zlab,
        zoneBase: this._zoneUnit(item.origZoneLabel || item.zoneLabel),
        days: 1,
        fromWeek: week,
        toWeek: week + 1,
        source: 'unfinished',
        note: 'Tidak selesai M' + week,
      });
    }
    this.state.contractor.carryOver = bag;
    const arch = [...(this.state.contractor.execArchive || [])].filter(x => Number(x.week) !== week);
    arch.push({
      week,
      wwp: JSON.parse(JSON.stringify(items)),
      huddleResults: JSON.parse(JSON.stringify(this.state.contractor.huddleResults || {})),
      ppc: JSON.parse(JSON.stringify(ppc)),
      remainder: JSON.parse(JSON.stringify((this.state.contractor.weekRemainder || []).filter(x => Number(x.fromWeek) === week))),
      note: (this.state.contractor.learningNote || '').trim(),
    });
    this.state.contractor.execArchive = arch;
    this.state.contractor.weekClosed = true;
    this.save();
  },
  closeWeek() {
    const items = this.state.contractor.wwp || [];
    const ppc = this.state.contractor.ppc || [];
    const missing = items.filter(i => !ppc.some(p => p.workId === i.id));
    if (missing.length) {
      if (!confirm(missing.length + ' item belum dinilai selesai/gagal. Tutup tetap?')) return;
    }
    this.state.contractor.weekClosed = true;
    this.save();
  },
    rollLookahead() {
    if (this.projectComplete) {
      this.setStage('contractor-progress');
      return;
    }
    if (!this.state.contractor.pullLocked) return;
    if (!this.state.contractor.weekClosed) {
      alert('Tutup minggu (PPC) dulu sebelum gulir.');
      return;
    }
    const bak = ((this.state.contractor.progressLocks || []).some(x => Number(x.week) === this.playWeek));
    if (!bak) {
      if (!confirm('Progres fisik M' + this.playWeek + ' belum dibakukan ke Kurva S. Gulir tetap?')) return;
    }
    const promised = (this.state.contractor.makeReady || []).filter(x => x.status === 'promised');
    if (promised.length) {
      if (!confirm(promised.length + ' komitmen make-ready belum dicek (sudah/gagal). Gulir tetap? Akan dicek di Look-ahead berikutnya.')) return;
    }
    this.state.contractor.lookOffset = (Number(this.state.contractor.lookOffset) || 0) + 1;
    this.state.contractor.selectedLookRel = 'L1';
    this.state.contractor.selectedLookWorkId = null;
        this.state.contractor.wwp = [];
    this.state.contractor.ppc = [];
    this.state.contractor.weekClosed = false;
    this.state.contractor.wwpLocked = false;
    this.state.contractor.huddleDayIdx = 0;
    this.state.contractor.huddleResults = {};
    this.state.contractor.followUps = [];
    this.state.contractor.huddleComplete = false;
    this.state.contractor.extendId = null;
    this.state.contractor.extendNote = '';
    this.state.contractor.learningNote = '';
    this.save();
    this.setStage('contractor-production');
  },
  save() { saveState(this.state); },
  exportJSON() {
    const def = `SiapKerja_${new Date().toISOString().slice(0,10)}`;
    let name = def;
    try {
      const typed = window.prompt('Nama file JSON (contoh S260901-A-G1). Fasilitator kirim ke abduh@itb.ac.id.', def);
      if (typed) name = typed.trim();
    } catch (e) {}
    if (!name.toLowerCase().endsWith('.json')) name += '.json';
    const b = new Blob([JSON.stringify(this.state, null, 2)], { type:'application/json' });
    const u = URL.createObjectURL(b);
    const a = document.createElement('a'); a.href = u; a.download = name; a.click(); URL.revokeObjectURL(u);
  },
  async importJSON(e) {
    const f = e.target.files[0]; if (!f) return;
    try {
      const p = JSON.parse(await f.text());
      if (!p.version) throw new Error('Invalid');
      if (confirm('Import akan menimpa progress. Lanjutkan?')) {
        this.state = p;
        if (!this.state.negotiation) this.state.negotiation = emptyNego();
        if (!this.state.contractor) this.state.contractor = emptyContractor();
        this.currentStage = p.currentStage || 'owner';
        this.recalcPlan();
        saveState(this.state);
        alert('Import berhasil!');
      }
    } catch (err) { alert('Gagal: ' + err.message); }
    e.target.value = '';
  }
}));
});
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('./sw.js?v=1.19.2').catch(function () {});
  });
}
