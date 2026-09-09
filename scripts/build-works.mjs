// 광장 API 를 받아 dist/works.json 으로 저장한다.
//
// 왜 이렇게 하나:
//   브라우저에서 game.kevinsaem.com 을 직접 부르면 서브도메인이 달라 CORS 에 막힌다.
//   CORS 는 브라우저에만 있는 규칙이므로, 여기서 미리 받아 정적 파일로 두면
//   페이지는 같은 자리의 works.json 만 읽으면 된다. 광장은 건드릴 필요가 없다.
//
// 실행: node scripts/build-works.mjs

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PLAZA_ORIGIN = 'https://game.kevinsaem.com';
const SOURCE_URL = `${PLAZA_ORIGIN}/api/game/plaza/items?sort=popular&limit=4&offset=0`;

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'dist', 'works.json');

// 광장 내부 코드 → 링크 페이지 표기 (CONTRACT.md 2절)
const CATEGORY = { web: '웹', app: '앱', game: '게임', code: '코드' };
const GRADE = { elem: '초등', mid: '중등', high: '고등', adult: '성인' };

const abs = (u) => (!u ? '' : /^https?:\/\//.test(u) ? u : PLAZA_ORIGIN + (u.startsWith('/') ? u : '/' + u));

function toWork(it) {
  const thumbnail = abs(it.thumbnail_url);
  if (!thumbnail) return null; // 썸네일 없는 작품은 제외 — 깨진 이미지 노출 금지
  return {
    title: String(it.title || '').trim(),
    thumbnail,
    url: it.url || `${PLAZA_ORIGIN}/plaza.html`,
    category: CATEGORY[it.category] || '',
    grade: GRADE[it.author_grade_band] || '',
  };
}

const res = await fetch(SOURCE_URL, { headers: { 'User-Agent': 'kevinsaem-link-snapshot' } });
if (!res.ok) throw new Error(`광장 API 응답 ${res.status}`);

const data = await res.json();
const works = (data.items || []).map(toWork).filter(Boolean).slice(0, 4);

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(works, null, 2) + '\n', 'utf8');

console.log(`${works.length}건 저장 → dist/works.json`);
for (const w of works) console.log(`  - ${w.category} · ${w.grade}  ${w.title}`);
