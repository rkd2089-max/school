# 전국 학교 급식 알리미 (HTML/CSS/JS)

나이스 교육정보 개방 포털(Open NEIS) API를 이용해 **전국 초·중·고등학교의 오늘 급식**을 간단히 조회하는 웹앱입니다.  
서버/DB 없이 **순수 HTML, CSS, JavaScript**만 사용합니다.

## 주요 기능

- **학교 검색**
  - 시·도 교육청(지역) 선택
  - 학교 유형(초/중/고) 선택
  - 학교명 검색
- **검색 결과 리스트**
  - 조건에 맞는 학교 목록 표시
  - 학교 선택(클릭) 가능
- **급식 조회**
  - 선택한 학교의 **오늘 급식** 조회/표시
  - 급식이 없는 경우 안내 문구 표시
  - 메뉴 줄바꿈 처리로 가독성 강화
- **UI/UX**
  - 모바일 우선 반응형 UI
  - 로딩/오류/데이터 없음 상태 메시지 표시

## 실행 방법 (설치 없음)

1. 이 폴더에서 `index.html`을 브라우저(크롬 권장)로 엽니다.
2. 지역/학교유형/학교명을 입력하고 검색 후, 학교를 선택하면 오늘 급식이 표시됩니다.

> 참고: 환경에 따라 브라우저에서 외부 API 호출이 제한될 수 있습니다. 그 경우 로컬 서버로 실행하면 안정적입니다.
>
> - (권장) VS Code 확장 **Live Server**로 `index.html` 실행

## 프로젝트 구조

- `index.html` : 화면(UI) 구성
- `style.css`  : 녹색 그라데이션/카드형 반응형 스타일
- `script.js`  : 나이스 API 호출 및 렌더링 로직

## 사용한 API (나이스 교육정보 개방 포털)

- **학교기본정보 조회**: `schoolInfo`
  - 주요 파라미터: `ATPT_OFCDC_SC_CODE`, `SCHUL_NM`, `SCHUL_KND_SC_NM`
- **급식식단정보 조회**: `mealServiceDietInfo`
  - 주요 파라미터: `ATPT_OFCDC_SC_CODE`, `SD_SCHUL_CODE`, `MLSV_YMD`

기본 호출 형태 예시:

```text
https://open.neis.go.kr/hub/schoolInfo?Type=json&ATPT_OFCDC_SC_CODE=...&SCHUL_NM=...&SCHUL_KND_SC_NM=...
https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json&ATPT_OFCDC_SC_CODE=...&SD_SCHUL_CODE=...&MLSV_YMD=YYYYMMDD
```

## API 인증키

현재 `script.js`에 인증키가 하드코딩되어 있습니다.

- `API_KEY = "f0c03e9c369b4e2e8f42d7016cc06a09"`

> 공개 저장소에 올릴 경우 키가 노출될 수 있으니 주의하세요.

## 라이선스/출처

- 데이터 출처: 나이스 교육정보 개방 포털(Open NEIS)

