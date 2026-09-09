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
- **CORS 필수.** 링크 페이지는 `http://link.kevinsaem.com`, API 는 `https://game.kevinsaem.com` 이다.
  서브도메인이 다르면 브라우저는 다른 출처로 보므로, 같은 서버라도 아래 헤더가 없으면 요청이 차단되고 미리보기가 영영 빈 채로 남는다.

  ```
  Access-Control-Allow-Origin: http://link.kevinsaem.com
  ```

  인증 정보를 쓰지 않으므로 `Allow-Credentials` 는 불필요하고, 단순 GET 이라 프리플라이트도 뜨지 않는다.

---

## 다 되면 이 양식으로 보내주면 내가 넣는다

````md
API_BASE: https://game.kevinsaem.com

CORS 허용 도메인: (설정한 값 그대로. 예: * 또는 https://...)

/link 배포 도메인: http://link.kevinsaem.com/ (확정)

실제 응답:
```json
(curl "https://game.kevinsaem.com/api/plaza/recent?limit=4" 결과 붙여넣기)
```

mobileSupported 필드: 있음 / 없음
````
