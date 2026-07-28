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

/* 이중 축 선 그래프 (외부 라이브러리 없이 SVG로 직접 렌더링) */
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

  const W = Math.max(560, rows.length * 90), H = 340;
  const m = { top: 24, right: 52, bottom: 70, left: 44 };
  const iw = W - m.left - m.right, ih = H - m.top - m.bottom;
  const PAIN_MAX = 40, MANIA_MAX = 7, n = rows.length;

  const x = (i) => (n === 1 ? m.left + iw / 2 : m.left + (iw * i) / (n - 1));
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
    svg.appendChild(el("line", { x1: m.left, y1: yy, x2: m.left + iw, y2: yy, stroke: gridColor, "stroke-width": 1 }));
    svg.appendChild(el("text", { x: m.left - 8, y: yy + 4, "text-anchor": "end", "font-size": 11, fill: painColor },
      Math.round(PAIN_MAX - (PAIN_MAX * s) / steps)));
    svg.appendChild(el("text", { x: m.left + iw + 8, y: yy + 4, "text-anchor": "start", "font-size": 11, fill: maniaColor },
      (MANIA_MAX - (MANIA_MAX * s) / steps).toFixed(1)));
  }
  svg.appendChild(el("text", { x: m.left, y: 14, "text-anchor": "start", "font-size": 11, fill: painColor }, "통증 /40"));
  svg.appendChild(el("text", { x: m.left + iw, y: 14, "text-anchor": "end", "font-size": 11, fill: maniaColor }, "조증 /7"));

  rows.forEach((r, i) => {
    r.datetime.replace("T", "\n").split("\n").forEach((p, k) => {
      svg.appendChild(el("text", { x: x(i), y: m.top + ih + 18 + k * 14, "text-anchor": "middle", "font-size": 10, fill: textColor }, p));
    });
  });

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
      svg.appendChild(el("circle", { cx: x(i), cy: yFn(v), r: 4, fill: color }));
      svg.appendChild(el("text", { x: x(i), y: yFn(v) - 9, "text-anchor": "middle", "font-size": 10, "font-weight": 700, fill: color }, v));
    });
  }
  drawSeries((r) => r.pain, yPain, painColor);
  drawSeries((r) => r.mania, yMania, maniaColor);
  container.appendChild(svg);
}

/* ================= 초기화 ================= */
buildPainItems();
buildManiaQuestions();
$("pain-datetime").value = nowLocalInput();
$("mania-datetime").value = nowLocalInput();
updatePainTotal();
updateManiaTotal();
renderPainTable();
renderManiaTable();
