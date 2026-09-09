# 광장 API 요청서

광장(`game.kevinsaem.com`) 쪽에 이 파일만 넘기면 된다.

---

## 만들 것

```
GET https://game.kevinsaem.com/api/plaza/best?limit=4&mobile=true
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
- **정렬: `BEST 픽` — 좋아요 수 내림차순** (광장에서 이미 자동 갱신되는 기준)
- 에러여도 `200` + `[]` (4xx/5xx 금지)
- `limit`이 작품 수보다 커도 에러 없이
- `mobile` 파라미터는 무시하고 전체 반환해도 됨
- 썸네일은 요청 시 변환 금지, 미리 만들어 저장
- **CORS 필수.** 링크 페이지는 `http://link.kevinsaem.com`, API 는 `https://game.kevinsaem.com` 이다.
  서브도메인이 다르면 브라우저는 다른 출처로 보므로, 같은 서버라도 아래 헤더가 없으면 요청이 차단되고 미리보기가 영영 빈 채로 남는다.

  ```
  Access-Control-Allow-Origin: http://link.kevinsaem.com
  ```

  인증 정보를 쓰지 않으므로 `Allow-Credentials` 는 불필요하고, 단순 GET 이라 프리플라이트도 뜨지 않는다.

---

## 다 되면 이것만 보내주면 내가 넣는다

1. 아래 명령 결과를 그대로 붙여넣기

   ```bash
   curl -i "https://game.kevinsaem.com/api/plaza/best?limit=4&mobile=true"
   ```

   `-i` 를 붙이면 응답 본문과 함께 CORS 헤더까지 한 번에 확인된다.

2. `mobileSupported` 필드를 넣었는지 여부 (안 넣었으면 안 넣었다고만)

이 둘이면 `config.js` 에 `API_BASE` 를 채우고 실제로 뜨는지까지 확인할 수 있다.
