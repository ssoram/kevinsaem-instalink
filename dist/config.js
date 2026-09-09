// CONTRACT.md 1절 — 상수는 사람이 채운다.
// 값을 모르면 'TODO_...' 문자열 그대로 둔다. 그럴듯한 예시 값으로 채우지 말 것.
// TODO_ 가 남아 있으면 app.js 가 로드 시 콘솔에 경고를 출력한다.

export const CONFIG = {
  // 표시 정보
  ACADEMY_NAME: '케빈샘AI코딩학원',
  ACADEMY_NAME_EN: 'KEVINSAEM',
  AREA: '안산 선부동',              // 예: '초지동', 'OO역 5분'
  TARGET: '초등~고등',
  SUBJECT: '코딩',
  ADDRESS: '선부로 183 화성프라자 8층',

  // 링크
  API_BASE: 'TODO_API_BASE',
  PLAZA_URL: 'https://game.kevinsaem.com/plaza.html',
  ACADEMY_URL: 'https://booking.kevinsaem.com/',
  BOOKING_URL: 'https://booking.naver.com/booking/13/bizes/535076',
  KAKAO_URL: 'http://pf.kakao.com/_xgnxoUj',
  TEL: '050713079398',
  MAP_URL: 'https://map.naver.com/p/entry/place/1190226352?c=15.00,0,0,0,dh&placePath=%2Fhome%3Ffrom%3Dmap%26fromPanelNum%3D1%26additionalHeight%3D76%26timestamp%3D202609091429%26locale%3Dko%26svcName%3Dmap_pcv5',            // 지도 앱으로 넘어가는 링크
  // 구글 지도 keyless 임베드(`output=embed`). API 키·좌표 불필요.
  // 다른 지도로 바꾸려면 제공사의 '지도 퍼가기' iframe 코드에서 src 값만 이 자리에 넣으면 된다.
  // 핀 위치가 부정확하면 q= 뒤를 정확한 주소나 '위도,경도' 로 바꾸면 된다.
  MAP_EMBED_URL: 'https://maps.google.com/maps?q=%EC%84%A0%EB%B6%80%EB%A1%9C%20183%20%ED%99%94%EC%84%B1%ED%94%84%EB%9D%BC%EC%9E%90&z=17&output=embed',
};

/** 아직 사람이 채우지 않은 값인지 */
export const isTodo = (v) => typeof v === 'string' && /^TODO(_|:|$)/.test(v.trim());

// ---------------------------------------------------------------------------
// 데이터 소스 — 여기 한 곳에서만 분기한다.
//
// 배포 기본값은 'auto' = "API_BASE 가 채워지기 전까지는 데이터 소스 없음".
// 이때 미리보기 칸은 자리(크기)만 확보한 채 비어 있고, 광장 버튼과 카드 탭 영역은
// 그대로 살아 있다. 가짜 작품을 진짜처럼 보여주지 않기 위한 것이다.
//
// 광장 API 가 뜨면 CONFIG.API_BASE 만 실제 값으로 채우면 끝. 여기는 손대지 않는다.
// ---------------------------------------------------------------------------

/** 개발용 mock 파일 화이트리스트. 키는 ?mock=<키> 로 쓴다 (CONTRACT.md 3절 케이스) */
export const MOCK_FILES = {
  'recent': 'recent.json',        // 정상 4건 (그중 1건은 아주 긴 제목)
  'recent-3': 'recent-3.json',    // 3건만 오는 경우
  'empty': 'recent-empty.json',   // 빈 배열
};

export const SOURCE = {
  // 'auto' | 'api' | 'mock'
  //   auto : API_BASE 가 TODO_ 면 소스 없음(빈 미리보기), 채워져 있으면 실 API. ← 배포 기본값
  //   api  : 무조건 실 API
  //   mock : 무조건 mock (개발 중에만 쓴다. 배포 상태로 두지 말 것)
  MODE: 'auto',

  // MODE: 'mock' 일 때 쓸 MOCK_FILES 의 키
  MOCK_FILE: 'recent',

  // 개발 편의 스위치. true 면 주소 뒤에 ?mock=recent / ?mock=recent-3 / ?mock=empty 를
  // 붙였을 때만 mock 이 켜진다. 파라미터가 없으면 항상 꺼진 상태다.
  ALLOW_MOCK_QUERY: true,

  // MODE 가 실 API 로 갈 때 쓰는 쿼리 파라미터 (CONTRACT.md 2절)
  LIMIT: 4,
  MOBILE_ONLY: true,
};

/** ?mock=<키> 개발 스위치. 켜져 있으면 mock 파일명을, 아니면 null */
function mockFromQuery() {
  if (!SOURCE.ALLOW_MOCK_QUERY || typeof location === 'undefined') return null;
  const key = new URLSearchParams(location.search).get('mock');
  return key && Object.prototype.hasOwnProperty.call(MOCK_FILES, key) ? MOCK_FILES[key] : null;
}

// mock 파일은 이 모듈(link/)을 기준으로 찾는다.
// index.html 이 어느 위치에 있든(루트 배포 포함) 경로가 깨지지 않게 하기 위함이다.
function mockUrl(file) {
  return new URL(`./mock/${file}`, import.meta.url).href;
}

function apiUrl() {
  // GET {API_BASE}/api/plaza/recent?limit=4&mobile=true
  const base = String(CONFIG.API_BASE).replace(/\/+$/, '');
  const qs = new URLSearchParams({
    limit: String(SOURCE.LIMIT),
    mobile: String(Boolean(SOURCE.MOBILE_ONLY)),
  });
  return `${base}/api/plaza/recent?${qs}`;
}

/**
 * 최신 작품 목록을 가져올 URL. 데이터 소스 분기는 이 함수 하나뿐이다.
 * @returns {{url: string, kind: 'api'|'mock'} | null}  null 이면 소스 없음 = 빈 미리보기
 */
export function recentSource() {
  const mock = mockFromQuery();
  if (mock) return { url: mockUrl(mock), kind: 'mock' };

  if (SOURCE.MODE === 'mock') {
    const file = MOCK_FILES[SOURCE.MOCK_FILE];
    if (file) return { url: mockUrl(file), kind: 'mock' };
  }

  // MODE 가 'api' 여도 API_BASE 가 TODO_ 면 요청하지 않는다.
  // 'TODO_API_BASE/api/plaza/recent...' 같은 엉뚱한 URL 로 실제 요청이 나가는 것을 막는다.
  if ((SOURCE.MODE === 'api' || SOURCE.MODE === 'auto') && !isTodo(CONFIG.API_BASE)) {
    return { url: apiUrl(), kind: 'api' };
  }

  return null; // 데이터 소스 없음 — 미리보기 칸은 빈 자리로 둔다
}

// 클릭 측정 파라미터 (CONTRACT.md 5절)
export const TRACK = {
  FROM: 'insta_link',
  // tel: 링크는 파라미터를 붙일 수 없으므로 이 경로로 별도 기록한다.
  // 같은 도메인이라 학원 서버 로그에 그대로 남는다.
  // TODO: 전용 수집 엔드포인트가 생기면 이 값을 그쪽으로 바꾼다.
  BEACON_PATH: './',
};
