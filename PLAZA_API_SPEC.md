# 광장 API 요청서

광장(`game.kevinsaem.com`) 쪽에 이 파일만 넘기면 된다.

---

## 만들 것

```
GET https://game.kevinsaem.com/api/plaza/recent?limit=4&mobile=true
```

```json
[
  {
    "title": "ㄹㅈㄷ아이템 알까기",
    "thumbnail": "https://game.kevinsaem.com/thumb/123-400.webp",
    "url": "https://game.kevinsaem.com/works/123",
    "category": "게임",
    "grade": "중등",
    "mobileSupported": true
  }
]
```

| 필드 | 필수 | 값 |
|---|---|---|
| `title` | O | 작품 제목 |
| `thumbnail` | O | **400px webp 절대 URL. 사전 생성.** 없는 작품은 목록에서 제외 |
| `url` | O | 작품 상세 |
| `category` | O | `웹` `앱` `게임` `코드` |
| `grade` | O | `초등` `중등` `고등` `성인` |
| `mobileSupported` | X | 없으면 생략 |

**규칙**
- 정렬 최신순 (`BEST 픽` 아님)
- 에러여도 `200` + `[]` (4xx/5xx 금지)
- `limit`이 작품 수보다 커도 에러 없이
- `mobile` 파라미터는 무시하고 전체 반환해도 됨
- 썸네일은 요청 시 변환 금지, 미리 만들어 저장
- **CORS: 링크 페이지가 다른 도메인에 올라간다. `Access-Control-Allow-Origin` 필수.** 없으면 미리보기가 빈 채로 남는다

---

## 다 되면 이 양식으로 보내주면 내가 넣는다

````md
API_BASE: https://game.kevinsaem.com

CORS 허용 도메인: (설정한 값 그대로. 예: * 또는 https://...)

/link 배포 도메인: https://...

실제 응답:
```json
(curl "https://game.kevinsaem.com/api/plaza/recent?limit=4" 결과 붙여넣기)
```

mobileSupported 필드: 있음 / 없음
````
