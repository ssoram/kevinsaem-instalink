// 케빈샘AI코딩학원 — 인스타 링크 페이지
// 바닐라 JS. 외부 라이브러리 없음.
//
// 원칙: 데이터 소스가 없거나 API 가 실패해도 페이지 나머지는 정상 동작한다.
//       광장 버튼과 카드 탭 영역은 어떤 경우에도 살아 있고, 미리보기 칸만 빈 자리로 남는다.

import { CONFIG, SOURCE, recentSource, TRACK, isTodo } from './config.js';

const MAX_ITEMS = 4;
const FETCH_TIMEOUT_MS = 6000;

/* ── TODO 점검 ─────────────────────────────────────────────
   값을 모르면 'TODO_' 문자열 그대로 둔다 (CONTRACT.md 1절).
   남아 있으면 여기서 콘솔에 경고를 띄운다.                    */

function warnTodos() {
  const left = Object.entries(CONFIG).filter(([, v]) => isTodo(v));
  if (left.length) {
    console.warn(
      '[link] 아직 채우지 않은 값이 ' + left.length + '개 남아 있습니다 (CONTRACT.md 1절 / config.js):\n' +
      left.map(([k, v]) => '  - ' + k + ': ' + v).join('\n')
    );
  }
  if (SOURCE.MODE === 'api' && isTodo(CONFIG.API_BASE)) {
    console.warn('[link] SOURCE.MODE 가 "api" 인데 API_BASE 가 아직 TODO 입니다. 미리보기는 빈 상태로 둡니다.');
  }
  const metas = [...document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]')]
    .filter((m) => isTodo(m.getAttribute('content') || ''));
  if (metas.length) {
    console.warn(
      '[link] 오픈그래프 태그가 아직 TODO 입니다 (카톡 공유 미리보기에 영향):\n' +
      metas.map((m) => '  - ' + (m.getAttribute('property') || m.getAttribute('name'))).join('\n')
    );
  }
}

/* ── 클릭 측정 ─────────────────────────────────────────────
   모든 아웃바운드 링크에 ?from=insta_link&target=... (CONTRACT.md 5절)   */

function withTracking(rawUrl, target) {
  try {
    const url = new URL(rawUrl, location.href);
    url.searchParams.set('from', TRACK.FROM);
    url.searchParams.set('target', target);
    return url.toString();
  } catch {
    return null;
  }
}

// tel: 은 파라미터를 붙일 수 없으므로 클릭을 별도로 기록한다.
function trackTelClick() {
  const url = withTracking(TRACK.BEACON_PATH, 'tel');
  if (!url) return;
  try {
    if (navigator.sendBeacon && navigator.sendBeacon(url)) return;
  } catch { /* 무시 — 기록 실패가 전화 걸기를 막으면 안 된다 */ }
  const px = new Image(1, 1); // 1x1 픽셀 대체
  px.src = url;
}

/* ── 텍스트 채우기 ─────────────────────────────────────────
   아직 채우지 않은 값('TODO_...')이나 빈 값은 화면에 절대 내보내지 않는다.
   키가 통째로 없어도 마찬가지다 — '(undefined)' 같은 것이 보이면 안 된다.
   경고는 warnTodos() 의 콘솔 출력이 맡는다.                  */

/** 화면에 내보내도 되는 값이면 그 값을, 아니면 빈 문자열 */
const shown = (v) => (typeof v === 'string' && v.trim() && !isTodo(v) ? v.trim() : '');

function fillText() {
  const set = (field, value) => {
    const node = document.querySelector('[data-field="' + field + '"]');
    if (!node) return null;
    node.textContent = value;
    node.hidden = !value; // 빈 값이면 자리(여백)도 남기지 않는다
    return node;
  };
  set('academyName', shown(CONFIG.ACADEMY_NAME));
  set('academyNameEn', shown(CONFIG.ACADEMY_NAME_EN));
  // 판별 줄: [지역] · 초등~고등 · 코딩 — 빠진 항목이 있으면 그 칸만 빼고 이어 붙인다
  set('qualifier', [CONFIG.AREA, CONFIG.TARGET, CONFIG.SUBJECT].map(shown).filter(Boolean).join(' · '));

  const addr = set('address', shown(CONFIG.ADDRESS));
  // 주소가 없으면 그 옆 중점(·)도 같이 감춘다 — '· 지도' 만 남는 것을 막는다
  const dot = addr && addr.nextElementSibling;
  if (dot && dot.classList.contains('dot')) dot.hidden = addr.hidden;
}

/* ── 링크 연결 ───────────────────────────────────────────── */

const LINKS = {
  plaza: 'PLAZA_URL',
  academy: 'ACADEMY_URL',
  booking: 'BOOKING_URL',
  kakao: 'KAKAO_URL',
  map: 'MAP_URL',
};

function disable(anchor, target, value) {
  anchor.setAttribute('href', '#');
  anchor.setAttribute('data-todo', target);
  anchor.setAttribute('aria-disabled', 'true');
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    console.warn('[link] ' + target + ' 링크가 아직 연결되지 않았습니다: ' + value);
  });
}

function wireLinks() {
  for (const [target, key] of Object.entries(LINKS)) {
    const anchor = document.querySelector('[data-link="' + target + '"]');
    if (!anchor) continue;
    const raw = CONFIG[key];
    const href = isTodo(raw) ? null : withTracking(raw, target);
    if (!href) {
      disable(anchor, target, raw);
      continue;
    }
    anchor.href = href;
    if (new URL(href, location.href).origin !== location.origin) {
      anchor.rel = 'noopener';
    }
  }

  const tel = document.getElementById('tel-link');
  if (!tel) return;
  const digits = String(CONFIG.TEL).replace(/[^0-9+*#]/g, '');
  if (isTodo(CONFIG.TEL) || !digits) {
    disable(tel, 'tel', CONFIG.TEL);
    return;
  }
  tel.href = 'tel:' + digits;
  tel.addEventListener('click', trackTelClick);
}

/* ── 지도 ────────────────────────────────────────────────
   BRIEF 4.6 — 맨 아래, 가장 작게. 주인공이 아니다.
   MAP_EMBED_URL 이 TODO 면 iframe 을 만들지 않고 빈 칸으로 자리만 지킨다.
   제공사에 묶이지 않도록 iframe src 하나만 쓴다. 외부 SDK 없음.       */

function renderMap() {
  const slot = document.getElementById('map-slot');
  if (!slot) return;

  const src = CONFIG.MAP_EMBED_URL;
  if (isTodo(src) || !String(src || '').trim()) {
    console.info('[link] 지도 임베드 URL이 아직 없습니다 (MAP_EMBED_URL). 지도 칸은 빈 상태로 둡니다.');
    return; // 가짜 지도 이미지를 채우지 않는다
  }

  const frame = document.createElement('iframe');
  frame.src = src;
  frame.title = CONFIG.ACADEMY_NAME + ' 위치 지도';
  frame.loading = 'lazy';          // 첫 화면 밖 — 첫 페인트를 막지 않는다
  frame.width = 440;               // 명시적 크기. 실제 크기는 CSS 가 100%로 채운다
  frame.height = 128;
  frame.referrerPolicy = 'no-referrer-when-downgrade';
  slot.replaceChildren(frame);
}

/* ── 광장 미리보기 ───────────────────────────────────────── */

// 제외 조건은 하나뿐이다: 썸네일 없음 (BRIEF 5절 — 깨진 이미지 노출 금지).
// category·grade·title 이 비어도 작품 자체는 버리지 않는다.
const usable = (it) =>
  it && typeof it === 'object' &&
  typeof it.thumbnail === 'string' && it.thumbnail.trim();

const str = (v) => (typeof v === 'string' ? v.trim() : '');

function emptyTile() {
  const span = document.createElement('span');
  span.className = 'tile tile--empty';
  span.setAttribute('aria-hidden', 'true');
  return span;
}

// 썸네일 주소를 데이터 소스 기준으로 해석한다.
// 실 API 는 절대 URL 을 주므로 그대로 통과하고, mock 의 상대 경로만
// recent.json 위치(link/mock/) 기준으로 풀린다 — index.html 이 어디 있든 안 깨진다.
function resolveFrom(url, base) {
  try {
    return new URL(url, base).href;
  } catch {
    return url;
  }
}

function makeTile(item, base) {

  const span = document.createElement('span');
  span.className = 'tile';

  const img = document.createElement('img');
  img.src = resolveFrom(item.thumbnail, base);
  // 썸네일 alt 는 작품 제목. 제목이 없으면 가짜로 지어내지 않고 장식 이미지로 둔다(alt="")
  img.alt = str(item.title);
  img.loading = 'lazy';
  img.decoding = 'async';
  img.width = 400;                 // 명시적 width/height — CLS 방지
  img.height = 300;
  // 이미지가 깨지면 빈 칸으로 떨어뜨린다 (깨진 이미지 노출 금지)
  img.addEventListener('error', () => {
    span.replaceChildren();
    span.className = 'tile tile--empty';
    span.setAttribute('aria-hidden', 'true');
  });

  // 배지는 카테고리·학년이 다 있을 때만. 하나라도 없으면 배지만 감추고 썸네일은 그대로 쓴다
  const category = str(item.category);
  const grade = str(item.grade);
  if (category && grade) {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = category + ' · ' + grade; // 예: 게임 · 중등
    span.append(img, badge);
  } else {
    span.append(img);
  }
  return span;
}

/**
 * 작품이 없으면(소스 없음 / 빈 배열 / 실패) 빈 칸 4개로 자리만 지킨다.
 * 가짜 제목이나 대체 이미지를 채우지 않는다. 버튼은 언제나 그대로.
 */
function renderTiles(result) {
  const grid = document.getElementById('plaza-grid');
  if (!grid) return;

  const items = result && result.items;
  const base = (result && result.base) || location.href;
  const list = (Array.isArray(items) ? items : []).filter(usable).slice(0, MAX_ITEMS);

  // 2열 그리드가 항상 꽉 찬 줄로 끝나게 빈 칸을 채운다 (3건만 와도 안 깨짐)
  const slots = list.length ? Math.ceil(list.length / 2) * 2 : MAX_ITEMS;
  const nodes = list.map((it) => makeTile(it, base));
  while (nodes.length < slots) nodes.push(emptyTile());

  grid.replaceChildren(...nodes);
}

async function loadRecent() {
  const source = recentSource();

  // 배포 기본 상태 — 광장 API 가 아직 없다. 미리보기 칸은 빈 자리로 둔다.
  if (!source) {
    console.info('[link] 광장 데이터 소스가 아직 없습니다 (API_BASE 가 TODO). 미리보기는 빈 상태로 둡니다. ' +
      '개발 중 확인은 주소 뒤에 ?mock=recent / ?mock=recent-3 / ?mock=empty 를 붙이세요.');
    return { items: [], base: location.href };
  }
  if (source.kind === 'mock') {
    console.warn('[link] mock 데이터로 표시 중입니다 (' + source.url + '). 실제 작품이 아닙니다 — 배포 기본값은 빈 미리보기입니다.');
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(source.url, { signal: ctrl.signal, credentials: 'same-origin' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return { items: await res.json(), base: res.url || source.url };
  } catch (err) {
    // 실패해도 페이지는 그대로 산다
    console.warn('[link] 최신 작품을 불러오지 못했습니다 (' + source.url + '):', err && err.message);
    return { items: [], base: source.url };
  } finally {
    clearTimeout(timer);
  }
}

/* ── 시작 ────────────────────────────────────────────────── */

warnTodos();
fillText();
wireLinks();
renderMap();
loadRecent().then(renderTiles);
