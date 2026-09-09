# 케빈샘 인스타 링크 페이지 — 멀티 에이전트 작업 계획

## 문서 구성

| 파일 | 역할 | 누가 읽나 |
|---|---|---|
| `BRIEF.md` | 기획 원본. 왜 이렇게 만드는지의 근거 | 전원 |
| `CONTRACT.md` | 에이전트 간 공유 계약. API 스키마·디자인 토큰·상수 | 전원 |
| `.claude/agents/link-frontend.md` | 링크 페이지 구현 | link-frontend |
| `.claude/agents/plaza-api.md` | 광장 API + 썸네일 | plaza-api |
| `.claude/agents/plaza-mobile.md` | 광장 모바일 대응 | plaza-mobile |
| `.claude/agents/link-review.md` | 검수 | link-review |

**`BRIEF.md`가 최종 판단 기준이다.** 개별 지시서와 충돌하면 BRIEF를 따르고 사람에게 보고한다.

---

## 실행 순서

```
[0] 계약 확정 ──── CONTRACT.md 의 TODO 값 채우기 (사람)
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼
   link-frontend  plaza-api  plaza-mobile     ← 병렬
       │           │           │
       └───────────┼───────────┘
                   ▼
              [통합] mock → 실 API 교체
                   ▼
              link-review
```

### 0단계를 건너뛰지 말 것

`CONTRACT.md`의 TODO 값(URL, 전화번호, 주소 등)이 비어 있으면
link-frontend는 그럴듯한 가짜 값을 채워 넣게 되고, 나중에 찾아내기 어렵다.
값을 모르면 **채우지 말고 `TODO_` 상수 그대로 두고 보고**한다.

### link-frontend는 plaza-api를 기다리지 않는다

link-frontend는 `CONTRACT.md`의 스키마에 맞는 mock JSON으로 개발한다.
plaza-api가 끝나면 `config.js`의 엔드포인트만 바꿔 끼운다.

---

## 파일 소유권

**자기 소유가 아닌 파일을 수정하지 않는다.** 필요하면 소유 에이전트에게 요청한다.

| 에이전트 | 소유 경로 |
|---|---|
| link-frontend | `/link/**` |
| plaza-api | `/api/plaza/**`, 썸네일 생성 파이프라인 |
| plaza-mobile | 광장 작품 상세·업로드 화면, 작품 스키마 |
| link-review | 없음 (읽기만, 리포트 작성) |

### 경계에서 주의할 것

- **모바일 지원 플래그** — 스키마 정의는 plaza-mobile, 소비는 plaza-api. plaza-mobile이 먼저 필드명을 확정해 CONTRACT에 반영한다.
- **썸네일 리사이즈** — plaza-api 소유. plaza-mobile은 건드리지 않는다.
- **디자인 토큰** — 광장에 이미 CSS 변수가 있으면 그쪽이 원본. link-frontend는 복제하지 말고 참조한다.

---

## 공통 규칙

전 에이전트가 지킨다.

1. **`BRIEF.md` 2절의 금지 섹션을 추가하지 않는다.** About, FAQ, 푸터, 강사 소개 등. "완성도를 위해" 붙이지 말 것.
2. **모르는 값을 지어내지 않는다.** `TODO_` 로 남기고 보고한다.
3. **범위를 넘지 않는다.** 개선 아이디어는 구현하지 말고 리포트에 적는다.
4. **작업 후 자기 완료 조건을 직접 확인한다.** 각 지시서 마지막의 체크리스트.
5. **막히면 추측해서 진행하지 말고 멈추고 보고한다.**

---

## 우선순위

시간이 부족하면 이 순서로 자른다.

1. **link-frontend + plaza-api** — 이게 없으면 페이지가 없다
2. **plaza-mobile의 PC 전용 배너** — 없으면 최악의 사용자 경험이 발생한다
3. **plaza-mobile의 모바일 플래그** — 있으면 좋지만 배너가 대신 막아준다
4. **link-review** — 사람이 대신할 수 있다

plaza-mobile의 플래그가 늦어지면 plaza-api는 `mobile` 파라미터를 무시하고 전체를 반환한다.
