---
name: link-frontend
description: Use this agent when building or modifying the /link Instagram landing page — HTML, CSS, JS, mock data, or its config. Owns /link/** exclusively.
tools: Read, Write, Edit, Glob, Grep, Bash
model: inherit
---

# link-frontend — 링크 페이지 구현

## 먼저 읽을 것

`BRIEF.md` 전체, `CONTRACT.md` 1·3·4·5절.

`BRIEF.md`를 건너뛰고 이 문서만 보고 만들면 안 된다.
왜 이 구조인지 모르면 "완성도를 위해" 금지된 섹션을 추가하게 된다.

## 목표

인스타 릴스를 보고 넘어온 사람을 **메이커 광장으로 보내는** 단일 페이지.

성공 기준은 문의 클릭이 아니라 **광장 클릭**이다.

## 소유 파일

```
/link/index.html
/link/style.css
/link/app.js
/link/config.js
/link/mock/recent.json
```

이 밖의 경로를 수정하지 않는다.

---

## 구현 내용

`BRIEF.md` 4절의 구조와 카피를 그대로 따른다. 아래는 코드 관점의 보충.

### 카피 — 수정 금지

```
여기 있는 건 전부 아이들이 만들었어요
공부한 결과가 아니라, 놀다가 만든 것들
```

"더 자연스럽게" 다듬지 말 것. 의도적으로 뾰족하게 잡은 문구다.
버튼 문구도 마찬가지: `메이커 광장에서 직접 해볼 수 있어요`, `놀면서 어떻게 배우는지 궁금하다면 / 학원 페이지 보기`.

### 광장 카드 — 이 페이지의 주인공

- 화면에서 가장 크고 눈에 띄는 요소
- 썸네일 4개 + 각각 `카테고리 · 학년` 배지
- **카드 전체가 하나의 탭 영역.** 개별 썸네일을 각각 링크로 만들지 않는다. 목적지는 광장 한 곳
- 로딩 전에 영역 크기를 확보해 CLS를 막는다
- 응답이 빈 배열이어도 **버튼은 그대로 노출**한다. 썸네일 영역만 비운다

### 문의 영역 위계

```
[수업 예약하기]        ← 중간 크기 버튼
카톡 문의 · 전화        ← 텍스트 링크, 작게
(평일 14~21시)         ← 전화 옆 필수
```

세 개를 같은 크기로 나란히 놓지 않는다.

### 모션

광장 카드 하나에만. `scale 1.00 ↔ 1.02`, 3s ease-in-out 무한.
다른 요소에 fade-up 진입 애니메이션을 붙이지 않는다 — 템플릿 인상을 준다.
`prefers-reduced-motion: reduce` 시 정지.

---

## 기술 제약

| 항목 | 요구 |
|---|---|
| 뷰포트 | 375~430px 기준. 데스크톱은 중앙정렬 max-width 480px |
| 높이 단위 | **`100vh` 금지, `100dvh` 사용.** 인앱 브라우저 하단 UI가 버튼을 가린다 |
| 안전영역 | `padding-bottom: env(safe-area-inset-bottom)` |
| 탭 타겟 | 최소 44px |
| 이미지 | `loading="lazy"`, 명시적 width/height |
| 라이브러리 | 없음. 바닐라 HTML/CSS/JS |
| 폰트 | Pretendard + 로컬 폴백 |

### 오픈그래프

```html
<meta property="og:title" content="케빈샘AI코딩학원 — 아이들이 만든 것들">
<meta property="og:description" content="공부한 결과가 아니라, 놀다가 만든 것들">
<meta property="og:image" content="TODO: 1200x630">
<meta property="og:url" content="TODO">
<meta name="twitter:card" content="summary_large_image">
```

### 접근성

키보드 포커스 표시, 썸네일 `alt`에 작품 제목, `--text-muted` 대비 확인.

---

## 하지 말 것

- `BRIEF.md` 2절의 금지 섹션 추가 (About / 커리큘럼 / 강사진 / 수강료 / FAQ / 후기 / 푸터 / 스크롤 유도)
- `TODO_` 상수를 그럴듯한 값으로 채우기
- 카피 다듬기
- 스크롤을 두 화면 이상으로 늘리기
- 광장 CSS·API 코드 수정

---

## 완료 조건

- [ ] mock 4개 케이스(정상/긴제목/3건/빈배열) 모두 레이아웃이 안 깨진다
- [ ] `100vh`가 코드에 한 군데도 없다
- [ ] 실제 iOS 인스타 인앱 브라우저에서 하단 버튼이 잘리지 않는다
- [ ] 첫 화면에 판별 줄 + 헤드라인 + 광장 카드 일부가 스크롤 없이 보인다
- [ ] 광장 카드가 시각적으로 가장 강한 요소다
- [ ] 모든 아웃바운드 링크에 `from`/`target` 파라미터가 있다
- [ ] 남은 `TODO_` 목록을 리포트에 정리했다
- [ ] 금지 섹션이 하나도 없다
