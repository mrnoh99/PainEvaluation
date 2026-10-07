/* ================= 증상 평가 웹앱 ================= */

const STORAGE_KEY = "symptom-assessment-web-v1";

/* ---- 통증 평가 항목별 채점 기준 (iOS PainRubric.swift와 동일) ---- */
const PAIN_ITEMS = [
  {
    key: "pain",
    title: "통증",
    scale: "통증의 정도",
    levels: [
      { lo: 10, hi: 10, text: "움직이기 불가능. 화장실 및 식사 불가능" },
      { lo: 9, hi: 9, text: "해리, 이인증이 동반되어 기억이 잘 나지 않는다" },
      { lo: 7, hi: 8, text: "충동(자살시도, 자해, 폭력성). 주로 집에서만 지낸다" },
      { lo: 5, hi: 6, text: "산책, 뛰기, 담배피기 등으로 전환할 수 있다. 주변에서 변화를 알아차릴 수 있는 수준" },
      { lo: 4, hi: 4, text: "우울하다는 사실을 확실하게 알게 됨. 아르바이트, 공부 등 하기 싫은 일을 피하기 시작함" },
      { lo: 3, hi: 3, text: "친구를 만나 전환할 수 있다. 티가 나지 않으며 굳이 도움을 받고 싶지 않은 수준" },
      { lo: 2, hi: 2, text: "편안한 상태. 하기 싫어도 해야 한다면 아르바이트, 공부를 할 수 있다" },
      { lo: 1, hi: 1, text: "하고 싶은 것이 생기지만 조증 상태는 아니다. 아르바이트 찾기, 적금 들기, 적극적, 잠 안 자기" },
      { lo: 0, hi: 0, text: "해당 없음" },
    ],
  },
  {
    key: "depression",
    title: "우울감",
    scale: "증상의 정도",
    levels: [
      { lo: 10, hi: 10, text: "심리적, 신체적인 에너지 사용이 불가하다. 도움을 필요로 한다" },
      { lo: 8, hi: 9, text: "(이후로는 증상 악화로 도움 청하기가 어려움)" },
      { lo: 7, hi: 7, text: "에너지가 줄어드는 것이 느껴짐" },
      { lo: 5, hi: 6, text: "혼자서 이겨내기 힘든 수준" },
      { lo: 2, hi: 4, text: "그냥저냥 지내며 버틸 만한 우울감" },
      { lo: 0, hi: 1, text: "좋지도 나쁘지도 않음" },
    ],
  },
  {
    key: "dissociation",
    title: "해리, 이인",
    scale: "증상의 정도",
    levels: [
      { lo: 10, hi: 10, text: "기억이 없다. 사고가 난다" },
      { lo: 7, hi: 9, text: "현실과 꿈을 구분할 수 없다" },
      { lo: 5, hi: 6, text: "행동을 통제할 수 없다. 타인과 대화를 하더라도 제3자로 보는 느낌이 든다" },
      { lo: 1, hi: 4, text: "기억력이 저하된다. 멍하다. 꿈을 꾸는 것 같다" },
      { lo: 0, hi: 0, text: "해당 없음" },
    ],
  },
  {
    key: "sleep",
    title: "잠",
    scale: "증상의 정도",
    levels: [
      { lo: 10, hi: 10, text: "화장실에 가거나 식사를 하지 못하고 수면한다" },
      { lo: 7, hi: 9, text: "화장실에 갈 수 있다. 식사할 수 있다" },
      { lo: 0, hi: 6, text: "적절히 수면한다 (12시간 정도)" },
    ],
  },
];

function levelLabel(lv) {
  return lv.lo === lv.hi ? `${lv.lo}` : `${lv.lo}–${lv.hi}`;
}
function rubricText(item, score) {
  const lv = item.levels.find((l) => score >= l.lo && score <= l.hi);
  return lv ? lv.text : "";
}

/* ---- 조증 진단 문항 (예 1점 / 아니요 0점) ---- */
const MANIA_QUESTIONS = [
  "팽창된 자존심 또는 심하게 과장된 자신감이 있다.",
  "수면에 대한 욕구가 감소한다. 예를 들어 단 3시간의 수면으로도 충분하다고 느낀다.",
  "평소보다 말이 많아지거나 계속 말을 하게 된다.",
  "사고의 비약 또는 생각이 쉴 새 없이 빠르게 이어진다.",
  "주의가 산만해진다. 불필요한 외부 자극에 너무 쉽게 주의가 이끌린다.",
  "새로운 일을 많이 벌이고 활동이 증가하거나 초조해서 안절부절 못한다.",
  "흥청망청 물건 사기, 무분별한 성행위, 어리석은 사업투자 등 고통스런 결과를 초래할 수 있는 쾌락 활동에 지나치게 몰두한다.",
];

/* ---- 저장소 ---- */
function loadData() {
  try {
    const d = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { pain: d?.pain || [], mania: d?.mania || [] };
  } catch {
    return { pain: [], mania: [] };
  }
}
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}
let store = loadData();

/* ---- 유틸 ---- */
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
function nowLocalInput() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}
const fmt = (dt) => (dt ? dt.replace("T", " ") : "");
const $ = (id) => document.getElementById(id);

/* ================= 탭 ================= */
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    $(tab.dataset.tab).classList.add("active");
    if (tab.dataset.tab === "analysis") renderAnalysis();
  });
});

/* ================= 통증 평가 UI ================= */
const painScores = { pain: 0, depression: 0, dissociation: 0, sleep: 0 };

function buildPainItems() {
  const wrap = $("pain-items");
  wrap.innerHTML = "";
  PAIN_ITEMS.forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "pain-item";
    const levelsHtml = item.levels
      .map(
        (lv) =>
          `<div class="rubric-level"><span class="lv">${levelLabel(lv)}</span><span class="tx">${lv.text}</span></div>`
      )
      .join("");
    div.innerHTML = `
      <div class="item-head">
        <span><span class="item-title">${i + 1}. ${item.title}</span>
          <span class="item-scale">${item.scale}</span></span>
        <span class="item-score" id="score-${item.key}">0</span>
      </div>
      <div class="slider-row">
        <span class="edge">0</span>
        <input type="range" min="0" max="10" step="1" value="0" id="range-${item.key}" />
        <span class="edge">10</span>
      </div>
      <div class="rubric-desc zero" id="desc-${item.key}"></div>
      <details class="rubric-all">
        <summary>채점 기준 보기</summary>
        ${levelsHtml}
      </details>`;
    wrap.appendChild(div);

    const range = div.querySelector(`#range-${item.key}`);
    range.addEventListener("input", () => {
      painScores[item.key] = parseInt(range.value, 10);
      updatePainItem(item);
      updatePainTotal();
    });
    updatePainItem(item);
  });
}

function updatePainItem(item) {
  const score = painScores[item.key];
  $(`score-${item.key}`).textContent = score;
  const desc = $(`desc-${item.key}`);
  desc.textContent = rubricText(item, score);
  desc.classList.toggle("zero", score === 0);
}

function updatePainTotal() {
  const t = Object.values(painScores).reduce((s, v) => s + v, 0);
  $("pain-total").textContent = t;
}

$("pain-save").addEventListener("click", () => {
  const rec = {
    id: uid(),
    datetime: $("pain-datetime").value || nowLocalInput(),
    ...painScores,
  };
  rec.total = painScores.pain + painScores.depression + painScores.dissociation + painScores.sleep;
  store.pain.push(rec);
  saveData();
  resetPainForm();
  renderPainTable();
});
$("pain-reset").addEventListener("click", resetPainForm);

function resetPainForm() {
  PAIN_ITEMS.forEach((item) => {
    painScores[item.key] = 0;
    const r = $(`range-${item.key}`);
    if (r) r.value = 0;
    updatePainItem(item);
  });
  updatePainTotal();
  $("pain-datetime").value = nowLocalInput();
}

function renderPainTable() {
  const tbody = document.querySelector("#pain-table tbody");
  const rows = [...store.pain].sort((a, b) => a.datetime.localeCompare(b.datetime));
  tbody.innerHTML = "";
  const has = rows.length > 0;
  $("pain-empty").style.display = has ? "none" : "block";
  $("pain-table").style.display = has ? "" : "none";
  rows.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${fmt(r.datetime)}</td>
      <td>${r.pain}</td><td>${r.depression}</td><td>${r.dissociation}</td><td>${r.sleep}</td>
      <td class="total-cell">${r.total}</td>
      <td><button class="btn link" data-del-pain="${r.id}">삭제</button></td>`;
    tbody.appendChild(tr);
  });
}

/* ================= 조증의 진단 UI ================= */
function buildManiaQuestions() {
  const ol = $("mania-questions");
  ol.innerHTML = "";
  MANIA_QUESTIONS.forEach((q, i) => {
    const li = document.createElement("li");
    li.className = "mania-item";
    li.innerHTML = `
      <span class="q-text">${q}</span>
      <span class="yn-group">
        <label><input type="radio" name="m${i}" value="1" /><span class="yn-btn yes">예</span></label>
        <label><input type="radio" name="m${i}" value="0" /><span class="yn-btn no">아니요</span></label>
      </span>`;
    ol.appendChild(li);
  });
  ol.addEventListener("change", updateManiaTotal);
}

function maniaTotal() {
  let t = 0;
  MANIA_QUESTIONS.forEach((_, i) => {
    const sel = document.querySelector(`input[name="m${i}"]:checked`);
    if (sel) t += parseInt(sel.value, 10);
  });
  return t;
}
function updateManiaTotal() {
  $("mania-total").textContent = maniaTotal();
}

$("mania-save").addEventListener("click", () => {
  const answers = MANIA_QUESTIONS.map((_, i) => {
    const sel = document.querySelector(`input[name="m${i}"]:checked`);
    return sel ? parseInt(sel.value, 10) : 0;
  });
  const rec = {
    id: uid(),
    datetime: $("mania-datetime").value || nowLocalInput(),
    answers,
    total: answers.reduce((s, v) => s + v, 0),
  };
  store.mania.push(rec);
  saveData();
  resetManiaForm();
  renderManiaTable();
});
$("mania-reset").addEventListener("click", resetManiaForm);

function resetManiaForm() {
  document.querySelectorAll('#mania-questions input[type="radio"]').forEach((r) => (r.checked = false));
  updateManiaTotal();
  $("mania-datetime").value = nowLocalInput();
}

function renderManiaTable() {
  const tbody = document.querySelector("#mania-table tbody");
  const rows = [...store.mania].sort((a, b) => a.datetime.localeCompare(b.datetime));
  tbody.innerHTML = "";
  const has = rows.length > 0;
  $("mania-empty").style.display = has ? "none" : "block";
  $("mania-table").style.display = has ? "" : "none";
  rows.forEach((r) => {
    const cells = r.answers.map((a) => `<td>${a ? "예" : "아니요"}</td>`).join("");
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${fmt(r.datetime)}</td>${cells}
      <td class="total-cell">${r.total}</td>
      <td><button class="btn link" data-del-mania="${r.id}">삭제</button></td>`;
    tbody.appendChild(tr);
  });
}

/* ================= 삭제 / 전체삭제 ================= */
document.addEventListener("click", (e) => {
  const dp = e.target.getAttribute("data-del-pain");
  const dm = e.target.getAttribute("data-del-mania");
  if (dp) { store.pain = store.pain.filter((r) => r.id !== dp); saveData(); renderPainTable(); }
  if (dm) { store.mania = store.mania.filter((r) => r.id !== dm); saveData(); renderManiaTable(); }
});
$("clear-all").addEventListener("click", () => {
  if (confirm("모든 통증 평가 및 조증 진단 기록을 삭제합니다. 계속할까요?")) {
    store = { pain: [], mania: [] };
    saveData();
    renderPainTable();
    renderManiaTable();
    renderAnalysis();
  }
});

/* ================= 결과 분석 ================= */
function mergedTimeline() {
  const map = new Map();
  store.pain.forEach((r) => {
    if (!map.has(r.datetime)) map.set(r.datetime, { datetime: r.datetime, pain: null, mania: null });
    map.get(r.datetime).pain = r.total;
  });
  store.mania.forEach((r) => {
    if (!map.has(r.datetime)) map.set(r.datetime, { datetime: r.datetime, pain: null, mania: null });
    map.get(r.datetime).mania = r.total;
  });
  return [...map.values()].sort((a, b) => a.datetime.localeCompare(b.datetime));
}

function renderAnalysis() {
  renderAnalysisTable();
  renderChart();
}

function renderAnalysisTable() {
  const tbody = document.querySelector("#analysis-table tbody");
  const rows = mergedTimeline();
  tbody.innerHTML = "";
  const has = rows.length > 0;
  $("analysis-empty").style.display = has ? "none" : "block";
  $("analysis-table").style.display = has ? "" : "none";
  rows.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${fmt(r.datetime)}</td>
      <td>${r.pain !== null ? r.pain : "—"}</td>
      <td>${r.mania !== null ? r.mania : "—"}</td>`;
    tbody.appendChild(tr);
  });
}

/* 이중 축 선 그래프 — 외부 라이브러리 없이 SVG로 직접 렌더링.
   · 기본: 한 화면에 7개 데이터가 보이도록 간격 자동 설정
   · 두 손가락(핀치)으로 데이터 간격을 좁히거나 넓힘
   · 좌우로 밀어서(스크롤) 이동 */
const CHART_M = { top: 24, right: 52, bottom: 76, left: 44 };
const CHART_H = 340;
const CHART_WIDE_BP = 600;    // 이 폭(px) 이상이면 넓은 화면으로 보고 기본 14개 표시
const CHART_MIN_PX = 14;      // 데이터 간 최소 간격(px) — 많이 축소
const CHART_MAX_PX = 240;     // 데이터 간 최대 간격(px) — 많이 확대
let chartPxPerPoint = null;   // null = 자동(화면 폭에 맞춰 기본 개수로)
let chartScrollToEnd = true;  // 렌더 후 최신(오른쪽)으로 스크롤

const clampNum = (v, a, b) => Math.max(a, Math.min(b, v));

// 기본으로 한 화면에 보일 데이터 개수: 세로(좁은 화면) 7개, 넓은 화면 14개
function chartDefaultVisible(cw) { return cw >= CHART_WIDE_BP ? 14 : 7; }

function renderChart() {
  const container = $("chart-container");
  const rows = mergedTimeline();
  container.innerHTML = "";
  if (rows.length === 0) { $("chart-empty").style.display = "block"; return; }
  $("chart-empty").style.display = "none";

  const css = getComputedStyle(document.documentElement);
  const painColor = css.getPropertyValue("--pain").trim() || "#e0553b";
  const maniaColor = css.getPropertyValue("--mania").trim() || "#6c4bd4";
  const gridColor = css.getPropertyValue("--border").trim() || "#dde3ec";
  const textColor = css.getPropertyValue("--muted").trim() || "#6b7688";

  const m = CHART_M, H = CHART_H, n = rows.length;
  const PAIN_MAX = 40, MANIA_MAX = 7;
  const cw = container.clientWidth || 600;
  const availW = Math.max(120, cw - m.left - m.right);

  // 간격(px) 결정: 기본은 화면 폭에 맞춘 개수(세로 7 / 넓으면 14)가 들어오도록
  const visible = chartDefaultVisible(cw);
  const defaultPx = n > 1 ? availW / (visible - 1) : availW;
  if (chartPxPerPoint == null) chartPxPerPoint = defaultPx;
  chartPxPerPoint = clampNum(chartPxPerPoint, CHART_MIN_PX, CHART_MAX_PX);
  const px = chartPxPerPoint;

  const iw = n > 1 ? px * (n - 1) : 0;          // 데이터가 차지하는 폭
  const plotW = Math.max(iw, availW);            // 그리드가 채우는 폭(최소 화면폭)
  const W = m.left + plotW + m.right;
  const ih = H - m.top - m.bottom;

  const x = (i) => (n === 1 ? m.left + plotW / 2 : m.left + px * i);
  const yPain = (v) => m.top + ih - (ih * v) / PAIN_MAX;
  const yMania = (v) => m.top + ih - (ih * v) / MANIA_MAX;

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("width", W);
  svg.setAttribute("height", H);
  const el = (tag, attrs, text) => {
    const e = document.createElementNS(svgNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text !== undefined) e.textContent = text;
    return e;
  };

  const steps = 4;
  for (let s = 0; s <= steps; s++) {
    const yy = m.top + (ih * s) / steps;
    svg.appendChild(el("line", { x1: m.left, y1: yy, x2: m.left + plotW, y2: yy, stroke: gridColor, "stroke-width": 1 }));
    svg.appendChild(el("text", { x: m.left - 8, y: yy + 4, "text-anchor": "end", "font-size": 11, fill: painColor },
      Math.round(PAIN_MAX - (PAIN_MAX * s) / steps)));
    svg.appendChild(el("text", { x: m.left + plotW + 8, y: yy + 4, "text-anchor": "start", "font-size": 11, fill: maniaColor },
      (MANIA_MAX - (MANIA_MAX * s) / steps).toFixed(1)));
  }
  svg.appendChild(el("text", { x: m.left, y: 14, "text-anchor": "start", "font-size": 11, fill: painColor }, "통증 /40"));
  svg.appendChild(el("text", { x: m.left + plotW, y: 14, "text-anchor": "end", "font-size": 11, fill: maniaColor }, "조증 /7"));

  // x축 라벨: 간격이 좁으면 겹치지 않게 일정 간격마다만 표시(마지막은 항상)
  const labelStep = Math.max(1, Math.ceil(68 / px));
  rows.forEach((r, i) => {
    const isLast = i === n - 1;
    // 일정 간격마다 + 마지막은 항상. 단 마지막과 너무 가까운 일반 라벨은 생략(겹침 방지)
    if (!isLast && (i % labelStep !== 0 || (n - 1 - i) < labelStep)) return;
    r.datetime.replace("T", "\n").split("\n").forEach((p, k) => {
      svg.appendChild(el("text", { x: x(i), y: m.top + ih + 18 + k * 14, "text-anchor": "middle", "font-size": 10, fill: textColor }, p));
    });
  });

  const showValues = px >= 34;  // 간격이 넓을 때만 점 위 숫자 표시
  function drawSeries(accessor, yFn, color) {
    let d = "", started = false;
    rows.forEach((r, i) => {
      const v = accessor(r);
      if (v === null || v === undefined) { started = false; return; }
      d += (started ? " L" : " M") + x(i) + " " + yFn(v);
      started = true;
    });
    if (d) svg.appendChild(el("path", { d: d.trim(), fill: "none", stroke: color, "stroke-width": 2.5, "stroke-linejoin": "round", "stroke-linecap": "round" }));
    rows.forEach((r, i) => {
      const v = accessor(r);
      if (v === null || v === undefined) return;
      svg.appendChild(el("circle", { cx: x(i), cy: yFn(v), r: px < 24 ? 3 : 4, fill: color }));
      if (showValues) svg.appendChild(el("text", { x: x(i), y: yFn(v) - 9, "text-anchor": "middle", "font-size": 10, "font-weight": 700, fill: color }, v));
    });
  }
  drawSeries((r) => r.pain, yPain, painColor);
  drawSeries((r) => r.mania, yMania, maniaColor);
  container.appendChild(svg);

  if (chartScrollToEnd) { container.scrollLeft = container.scrollWidth; chartScrollToEnd = false; }
}

/* 뷰포트 중앙을 기준으로 간격 확대/축소(+/− 버튼) */
function zoomChart(factor) {
  const c = $("chart-container");
  const old = chartPxPerPoint || 40;
  const neu = clampNum(old * factor, CHART_MIN_PX, CHART_MAX_PX);
  if (neu === old) return;
  const centerContent = c.scrollLeft + c.clientWidth / 2;
  chartPxPerPoint = neu;
  renderChart();
  const newCenter = CHART_M.left + (centerContent - CHART_M.left) * (neu / old);
  c.scrollLeft = newCenter - c.clientWidth / 2;
}

/* 핀치 중심(focusContent: 핀치 시작 당시 콘텐츠 좌표, focusViewport: 화면 내 x)을
   기준으로 간격을 newPx로 바꾸고, 그 지점이 손가락 아래 그대로 머무르도록 스크롤 보정 */
function applyChartSpacing(newPx, startPx, focusContent, focusViewport) {
  const c = $("chart-container");
  newPx = clampNum(newPx, CHART_MIN_PX, CHART_MAX_PX);
  if (newPx === chartPxPerPoint) return;
  chartPxPerPoint = newPx;
  renderChart();
  const newContent = CHART_M.left + (focusContent - CHART_M.left) * (newPx / startPx);
  c.scrollLeft = newContent - focusViewport;
}

/* 그래프 영역 안에서만 동작 (iOS Safari 포함, Touch 이벤트 기반):
   · 한 손가락 가로 드래그 → 좌우로 이동(팬)  / 세로 드래그는 페이지 스크롤에 양보
   · 두 손가락 핀치 → 데이터 간격 확대/축소(양방향)
   · 마우스 드래그 → 좌우 이동(데스크톱)
   그래프 밖에서는 핸들러가 없어 브라우저 기본 동작(페이지 확대/축소)이 그대로 작동한다. */
function setupChartGestures() {
  const c = $("chart-container");
  if (!c) return;

  const dist2 = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  let mode = 0;                          // 0=없음, 1=팬, 2=핀치
  let startX = 0, startY = 0, startScroll = 0, panLocked = false;
  let pinchDist = 0, pinchPx = 0, focusContent = 0, focusViewport = 0;

  const beginPan = (x, y) => { mode = 1; panLocked = false; startX = x; startY = y; startScroll = c.scrollLeft; };
  const beginPinch = (t) => {
    mode = 2;
    pinchDist = dist2(t);
    pinchPx = chartPxPerPoint || 40;
    const rect = c.getBoundingClientRect();
    focusViewport = (t[0].clientX + t[1].clientX) / 2 - rect.left;
    focusContent = c.scrollLeft + focusViewport;
  };

  c.addEventListener("touchstart", (e) => {
    if (e.touches.length === 2) { e.preventDefault(); beginPinch(e.touches); }
    else if (e.touches.length === 1) { beginPan(e.touches[0].clientX, e.touches[0].clientY); }
  }, { passive: false });

  c.addEventListener("touchmove", (e) => {
    if (mode === 2 && e.touches.length >= 2) {
      e.preventDefault(); // 그래프 위 핀치 → 간격 조절 (페이지 확대 안 함)
      applyChartSpacing(pinchPx * (dist2(e.touches) / pinchDist), pinchPx, focusContent, focusViewport);
    } else if (mode === 1 && e.touches.length === 1) {
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      if (!panLocked) {
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 6) panLocked = true;        // 가로 → 팬 확정
        else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6) { mode = 0; return; } // 세로 → 페이지 스크롤 양보
        else return;
      }
      e.preventDefault();
      c.scrollLeft = startScroll - dx; // 한 손가락 좌우 이동
    }
  }, { passive: false });

  const onTouchEnd = (e) => {
    if (e.touches.length === 1) beginPan(e.touches[0].clientX, e.touches[0].clientY); // 핀치→한 손가락 전환
    else if (e.touches.length === 0) mode = 0;
  };
  c.addEventListener("touchend", onTouchEnd);
  c.addEventListener("touchcancel", onTouchEnd);

  // 데스크톱 마우스 드래그로 좌우 이동
  let mouseDown = false, mStartX = 0, mStartScroll = 0;
  c.addEventListener("mousedown", (e) => { mouseDown = true; mStartX = e.clientX; mStartScroll = c.scrollLeft; e.preventDefault(); });
  window.addEventListener("mousemove", (e) => { if (mouseDown) c.scrollLeft = mStartScroll - (e.clientX - mStartX); });
  window.addEventListener("mouseup", () => { mouseDown = false; });

  // iOS Safari: 그래프 위 핀치가 페이지 확대로 번지지 않도록 차단(간격 조절은 touchmove가 담당)
  ["gesturestart", "gesturechange", "gestureend"].forEach((ev) =>
    c.addEventListener(ev, (e) => e.preventDefault(), { passive: false })
  );
}

/* ================= 데이터 내보내기 / 가져오기 ================= */
$("export-data").addEventListener("click", () => {
  const payload = {
    app: "symptom-assessment",
    version: 1,
    exportedAt: new Date().toISOString(),
    pain: store.pain,
    mania: store.mania,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
  a.href = url;
  a.download = `증상평가-백업-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

$("import-data").addEventListener("click", () => $("import-file").click());

$("import-file").addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const inPain = Array.isArray(data.pain) ? data.pain : [];
      const inMania = Array.isArray(data.mania) ? data.mania : [];
      if (!inPain.length && !inMania.length) {
        alert("가져올 기록이 없습니다. 올바른 백업 파일인지 확인해 주세요.");
        return;
      }
      const merge = confirm(
        `가져올 기록: 통증 평가 ${inPain.length}건, 조증 진단 ${inMania.length}건\n\n` +
        "확인 = 현재 기록에 병합, 취소 = 가져오기 중단"
      );
      if (!merge) return;

      const seenP = new Set(store.pain.map((r) => r.id));
      inPain.forEach((r) => {
        if (r && r.id && !seenP.has(r.id)) { store.pain.push(r); seenP.add(r.id); }
      });
      const seenM = new Set(store.mania.map((r) => r.id));
      inMania.forEach((r) => {
        if (r && r.id && !seenM.has(r.id)) { store.mania.push(r); seenM.add(r.id); }
      });
      store.pain.sort((a, b) => a.datetime.localeCompare(b.datetime));
      store.mania.sort((a, b) => a.datetime.localeCompare(b.datetime));
      saveData();
      renderPainTable();
      renderManiaTable();
      renderAnalysis();
      alert("가져오기가 완료되었습니다.");
    } catch {
      alert("파일을 읽을 수 없습니다. 올바른 JSON 백업 파일인지 확인해 주세요.");
    } finally {
      e.target.value = "";
    }
  };
  reader.readAsText(file);
});

/* ================= CSV 저장 / 메일 보내기 ================= */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function csvEscape(v) {
  v = v == null ? "" : String(v);
  return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
}

function csvFilename() {
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
  return `증상평가-${stamp}.csv`;
}

/* 통증·조증 기록을 날짜/시간 기준으로 합쳐 하나의 CSV로 만든다(Excel용 BOM 포함) */
function buildCSV() {
  const map = new Map();
  store.pain.forEach((r) => {
    const o = map.get(r.datetime) || { datetime: r.datetime };
    o.pain = r.pain; o.dep = r.depression; o.dis = r.dissociation; o.sleep = r.sleep; o.painTotal = r.total;
    map.set(r.datetime, o);
  });
  store.mania.forEach((r) => {
    const o = map.get(r.datetime) || { datetime: r.datetime };
    o.maniaTotal = r.total;
    r.answers.forEach((a, i) => { o["m" + i] = a; });
    map.set(r.datetime, o);
  });
  const rows = [...map.values()].sort((a, b) => a.datetime.localeCompare(b.datetime));
  const headers = ["날짜시간", "통증", "우울감", "해리·이인", "잠", "통증평가총점(/40)", "조증진단총점(/7)",
    "조증1", "조증2", "조증3", "조증4", "조증5", "조증6", "조증7"];
  const lines = [headers.join(",")];
  rows.forEach((o) => {
    const cells = [
      fmt(o.datetime),
      o.pain ?? "", o.dep ?? "", o.dis ?? "", o.sleep ?? "", o.painTotal ?? "", o.maniaTotal ?? "",
      ...[0, 1, 2, 3, 4, 5, 6].map((i) => (o["m" + i] == null ? "" : (o["m" + i] ? "예" : "아니요"))),
    ];
    lines.push(cells.map(csvEscape).join(","));
  });
  return "﻿" + lines.join("\r\n"); // BOM → Excel 한글 깨짐 방지
}

function hasRecords() { return store.pain.length > 0 || store.mania.length > 0; }

$("export-csv").addEventListener("click", () => {
  if (!hasRecords()) { alert("저장된 기록이 없습니다."); return; }
  downloadBlob(new Blob([buildCSV()], { type: "text/csv;charset=utf-8" }), csvFilename());
});

$("email-csv").addEventListener("click", async () => {
  if (!hasRecords()) { alert("보낼 기록이 없습니다."); return; }
  const csv = buildCSV();
  const name = csvFilename();

  // 1) 파일 공유 지원 시(아이폰/안드로이드): 공유 시트 → 메일 앱에 CSV 첨부
  try {
    const file = new File([csv], name, { type: "text/csv" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: "증상 평가 데이터", text: "증상 평가 CSV 데이터입니다." });
      return;
    }
  } catch (err) {
    if (err && err.name === "AbortError") return; // 사용자가 취소
  }

  // 2) 폴백(주로 데스크톱): CSV를 내려받고 메일 작성 창을 연다(첨부는 수동)
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), name);
  const subject = encodeURIComponent("증상 평가 데이터");
  const body = encodeURIComponent(`방금 내려받은 CSV 파일(${name})을 이 메일에 첨부해 보내세요.`);
  location.href = `mailto:?subject=${subject}&body=${body}`;
});

/* ================= PWA: 서비스워커 등록 + 설치 안내 ================= */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  $("install-app").hidden = false;
});
$("install-app").addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  $("install-app").hidden = true;
});
window.addEventListener("appinstalled", () => {
  deferredPrompt = null;
  $("install-app").hidden = true;
});

/* ================= 그래프 확대/축소 버튼 + 제스처 ================= */
$("chart-zoom-in").addEventListener("click", () => zoomChart(1.3));
$("chart-zoom-out").addEventListener("click", () => zoomChart(1 / 1.3));
$("chart-zoom-reset").addEventListener("click", () => {
  chartPxPerPoint = null;     // 기본(7개 맞춤)으로
  chartScrollToEnd = true;
  renderChart();
});
setupChartGestures();

// 창 크기·방향이 바뀌면 그래프를 기본 간격(세로 7 / 넓으면 14)으로 다시 맞춤
function resetChartDefault() {
  chartPxPerPoint = null;
  chartScrollToEnd = true;
  if (document.getElementById("analysis").classList.contains("active")) renderChart();
}
window.addEventListener("resize", resetChartDefault);
window.addEventListener("orientationchange", resetChartDefault);

/* ================= 초기화 ================= */
buildPainItems();
buildManiaQuestions();
$("pain-datetime").value = nowLocalInput();
$("mania-datetime").value = nowLocalInput();
updatePainTotal();
updateManiaTotal();
renderPainTable();
renderManiaTable();
