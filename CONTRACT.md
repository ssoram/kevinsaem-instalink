# CONTRACT — 에이전트 간 공유 계약

이 문서는 A·B·C가 서로를 기다리지 않고 병렬로 일하기 위한 접합면이다.
**여기 있는 것을 임의로 바꾸지 않는다.** 바꿔야 하면 사람에게 보고하고, 전원에게 공유한다.

---

## 1. 상수 — 사람이 먼저 채운다

`/link/config.js` 로 만들고 전 에이전트가 이 이름을 쓴다.

```js
export const CONFIG = {
  // 표시 정보
  ACADEMY_NAME: '케빈샘AI코딩학원',
  ACADEMY_NAME_EN: 'KEVINSAEM · THE GAME',
  AREA: 'TODO_지역',              // 예: '초지동', 'OO역 5분'
  TARGET: '초등~고등',
  SUBJECT: '코딩',
  ADDRESS: 'TODO_주소',
  TEL_HOURS: 'TODO_전화_운영시간',  // 예: '평일 14~21시'

  // 링크
  API_BASE: 'TODO_API_BASE',
  PLAZA_URL: 'TODO_광장_URL',
  ACADEMY_URL: 'TODO_학원페이지_URL',
  BOOKING_URL: 'TODO_예약사이트_URL',
  KAKAO_URL: 'TODO_카톡채널_URL',
  TEL: 'TODO_전화번호',
  MAP_URL: 'TODO_지도_URL',
};
```

**값을 모르면 `TODO_` 문자열 그대로 둔다.** 그럴듯한 예시 값으로 채우지 말 것.
빌드 시 `TODO_`가 남아 있으면 콘솔에 경고를 출력한다.

### 성인반 처리 — 미확정

광장에 `성인` 카테고리가 있으나 링크 페이지 `TARGET`은 `초등~고등`으로 잡았다.
헤드라인이 "아이들이 만들었어요"이므로 성인반을 노출하면 톤이 어긋난다.
**사람의 결정 전까지 현재 값을 유지한다.**

---

## 2. API 스키마

### 요청

```
GET {API_BASE}/api/plaza/recent?limit=4&mobile=true
```

| 파라미터 | 타입 | 기본 | 설명 |
|---|---|---|---|
| `limit` | int | 4 | 반환 개수 |
| `mobile` | bool | false | true면 모바일 지원 작품만. **C의 플래그 준비 전에는 무시하고 전체 반환** |

### 응답 200

```json
[
  {
    "title": "ㄹㅈㄷ아이템 알까기",
    "thumbnail": "https://.../thumb-400.webp",
    "url": "https://.../works/123",
    "category": "게임",
    "grade": "중등",
    "mobileSupported": true
  }
]
```

| 필드 | 타입 | 필수 | 비고 |
|---|---|---|---|
| `title` | string | O | `alt` 텍스트로도 쓰임 |
| `thumbnail` | string | O | 400px webp. 없으면 해당 작품 제외 |
| `url` | string | O | 작품 상세 |
| `category` | enum | O | `웹` `앱` `게임` `코드` |
| `grade` | enum | O | `초등` `중등` `고등` `성인` |
| `mobileSupported` | bool | X | C 작업 완료 후 추가. 없으면 `undefined` 취급 |

### 정렬

**최신순.** `BEST 픽`은 갱신 주기가 불규칙해 사용하지 않는다.

### 에러

에러 시에도 **200에 빈 배열**을 반환한다. 프론트가 실패를 특별 처리할 필요 없이 "썸네일 없음" 상태로 자연스럽게 떨어지게 하기 위함.

---

## 3. Mock 데이터

A는 B가 끝나기 전까지 `/link/mock/recent.json` 으로 개발한다.
스키마가 위와 동일해야 교체 시 코드 수정이 없다.

**mock에 반드시 포함할 케이스:**

- 정상 4건
- 제목이 아주 긴 작품 (레이아웃 깨짐 확인)
- 3건만 오는 경우
- 빈 배열 `[]`

---

## 4. 디자인 토큰

**광장에 이미 CSS 변수가 있으면 그쪽이 원본이다.** 아래는 스크린샷 추출값으로, 원본 확인 전까지의 임시값.

```css
:root {
  --bg:          #EDF1F6;
  --surface:     #FFFFFF;
  --text:        #1B2430;
  --text-muted:  #7A8694;
  --accent:      #1FA98A;
  --accent-soft: #DFF3ED;
  --gold:        #C08A2E;
  --pink:        #E8546B;
  --line:        #DCE3EB;
}
```

- 폰트: `Pretendard`, 로컬 폴백 필수
- 학원명·영문 라벨만 `letter-spacing: 0.15em`. 헤드라인은 기본값
- 포인트 컬러는 `--accent` 하나만. 그라데이션 남발 금지

---

## 5. 링크 파라미터

모든 아웃바운드 링크에 붙인다. 서버 로그로 클릭을 확인하기 위함.

```
?from=insta_link&target={plaza|academy|booking|kakao|tel|map}
```

`tel:` 링크는 파라미터를 붙일 수 없으므로 클릭 시 1x1 픽셀 또는 `navigator.sendBeacon` 으로 별도 기록한다.

---

## 6. 변경 절차

이 문서를 고쳐야 하는 상황이 생기면:

1. 임의로 고치지 않는다
2. 무엇을 왜 바꿔야 하는지 사람에게 보고한다
3. 승인 후 이 문서를 먼저 고치고, 그다음 코드를 고친다

특히 **필드명 변경은 A와 B가 동시에 깨진다.**
