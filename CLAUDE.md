# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Google Sheets를 백엔드 DB로 사용하는 순수 HTML/CSS/JS 학생 게시판입니다. 빌드 도구나 프레임워크 없이 브라우저에서 직접 실행됩니다.

## 로컬 실행

```bash
python -m http.server 8765 --directory .
# 브라우저에서 http://localhost:8765/index.html 접속
```

## 아키텍처

### 파일 역할

- `index.html` — 전체 UI 마크업. Tailwind CDN + Pretendard 폰트를 head에서 로드
- `style.css` — Tailwind로 표현할 수 없는 최소한의 커스텀 스타일만 포함 (카드 hover 애니메이션, 스크롤바)
- `script.js` — 클라이언트 로직 전체. DOM 조작, API 호출, 렌더링 담당
- `Code.gs` — Google Apps Script 서버 코드. 이 파일은 GitHub 참조용이며 실제 실행은 Google Apps Script 편집기에서 이루어짐

### 데이터 흐름

```
브라우저 (index.html + script.js)
    ↕ fetch (GET / POST, Content-Type: text/plain)
Google Apps Script Web App (Code.gs의 doGet / doPost)
    ↕ SpreadsheetApp API
Google Sheets ("posts" 시트)
```

- POST 요청은 CORS preflight를 피하기 위해 `Content-Type: text/plain`을 사용하고, body에 JSON을 문자열로 담음
- Apps Script는 302 리다이렉트를 반환하므로 fetch 시 `redirect: 'follow'` 필수
- API 응답에 `error` 필드가 있으면 `apiFetch()`에서 throw하여 상위에서 처리

### Google Sheets 구조

`posts` 시트 (탭명 정확히 일치해야 함):

| 열 | A | B | C | D | E |
|----|---|---|---|---|---|
| 헤더 | id | author | title | content | date |
| 타입 | Number (timestamp ms) | String | String | String | ISO 8601 문자열 |

## Google Apps Script 배포 절차

코드를 수정한 뒤에는 반드시 **새 배포(New Deployment)**를 생성해야 변경사항이 웹앱에 반영됩니다. 기존 배포 URL을 업데이트해도 이전 버전이 캐시될 수 있습니다.

- 실행 계정: **나(본인)**
- 액세스 권한: **모든 사용자**
- `setup()` 함수는 최초 1회만 실행 (시트·헤더 생성). 완료 여부는 Apps Script 편집기의 실행 로그(`Logger.log`)에서 확인

## 테스트

```bash
# Playwright 브라우저 테스트 (로컬 서버가 8765에 실행 중이어야 함)
node test-board.mjs
```

`test-board.mjs`와 `node_modules/`는 테스트 전용 파일로, 프로덕션 동작과 무관합니다.

## 주의사항

- `SCRIPT_URL` (`script.js` 1번째 줄)은 Apps Script 웹앱 배포 URL이며, 재배포 시 URL이 바뀌면 이 값도 업데이트해야 합니다
- Google Sheets에서 새 데이터를 보려면 스프레드시트 탭을 **새로고침(F5)**해야 합니다 (실시간 자동 갱신 안 됨)
- `Code.gs`를 수정한 뒤 GitHub에 push해도 Apps Script 편집기에 수동으로 복붙해야 반영됩니다
