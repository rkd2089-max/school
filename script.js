// 나이스 교육정보 개방 포털 API 설정
const API_KEY = "f0c03e9c369b4e2e8f42d7016cc06a09";
const NEIS_BASE_URL = "https://open.neis.go.kr/hub";

// 시·도 교육청 코드 매핑 (ATPT_OFCDC_SC_CODE)
const REGION_OPTIONS = [
  { code: "B10", name: "서울특별시교육청" },
  { code: "C10", name: "부산광역시교육청" },
  { code: "D10", name: "대구광역시교육청" },
  { code: "E10", name: "인천광역시교육청" },
  { code: "F10", name: "광주광역시교육청" },
  { code: "G10", name: "대전광역시교육청" },
  { code: "H10", name: "울산광역시교육청" },
  { code: "I10", name: "세종특별자치시교육청" },
  { code: "J10", name: "경기도교육청" },
  { code: "K10", name: "강원특별자치도교육청" },
  { code: "M10", name: "충청북도교육청" },
  { code: "N10", name: "충청남도교육청" },
  { code: "P10", name: "전라북도교육청" },
  { code: "Q10", name: "전라남도교육청" },
  { code: "R10", name: "경상북도교육청" },
  { code: "S10", name: "경상남도교육청" },
  { code: "T10", name: "제주특별자치도교육청" },
];

// DOM 요소
const regionSelect = document.getElementById("regionSelect");
const schoolLevelSelect = document.getElementById("schoolLevelSelect");
const schoolNameInput = document.getElementById("schoolNameInput");
const searchForm = document.getElementById("searchForm");
const searchButton = document.getElementById("searchButton");
const searchStatus = document.getElementById("searchStatus");
const schoolResults = document.getElementById("schoolResults");

const selectedSchoolNameEl = document.getElementById("selectedSchoolName");
const mealDateInput = document.getElementById("mealDateInput");
const mealDateEl = document.getElementById("mealDate");
const mealContentEl = document.getElementById("mealContent");
const mealStatusEl = document.getElementById("mealStatus");

let currentSelectedSchoolItem = null;

// 날짜를 YYYYMMDD 와 표시용 YYYY.MM.DD 로 포맷
function getTodayDateInfo() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return {
    year,
    month,
    day,
    apiDate: `${year}${month}${day}`,
    display: `${year}.${month}.${day}`,
  };
}

// date input(YYYY-MM-DD)에서 API/표시용 날짜 정보 얻기
function getSelectedDateInfo() {
  const value = mealDateInput?.value;
  if (!value) {
    return getTodayDateInfo();
  }

  const [year, month, day] = value.split("-");

  return {
    year,
    month,
    day,
    apiDate: `${year}${month}${day}`,
    display: `${year}.${month}.${day}`,
  };
}

// 지역(교육청) 드롭다운 채우기
function populateRegionSelect() {
  REGION_OPTIONS.forEach((region) => {
    const option = document.createElement("option");
    option.value = region.code;
    option.textContent = region.name;
    regionSelect.appendChild(option);
  });
}

// 상태 메시지 헬퍼
function setSearchStatus(message, isError = false) {
  if (!searchStatus) return;
  searchStatus.textContent = message || "";
  searchStatus.classList.toggle("error", Boolean(isError));
}

function setMealStatus(message, isError = false) {
  if (!mealStatusEl) return;
  mealStatusEl.textContent = message || "";
  mealStatusEl.classList.toggle("error", Boolean(isError));
}

// 검색 버튼 로딩 상태 관리
function setSearchLoading(isLoading) {
  if (!searchButton) return;
  if (isLoading) {
    searchButton.disabled = true;
    searchButton.textContent = "검색 중...";
  } else {
    searchButton.disabled = false;
    searchButton.textContent = "학교 검색";
  }
}

// 학교 검색
async function searchSchools(event) {
  event.preventDefault();

  const regionCode = regionSelect.value.trim();
  const schoolLevel = schoolLevelSelect.value.trim();
  const schoolName = schoolNameInput.value.trim();

  if (!regionCode || !schoolLevel || !schoolName) {
    setSearchStatus("지역, 학교 유형, 학교명을 모두 입력해 주세요.", true);
    return;
  }

  setSearchStatus("");
  setMealStatus("");
  setSearchLoading(true);
  schoolResults.innerHTML = "";

  const params = new URLSearchParams({
    KEY: API_KEY,
    Type: "json",
    pIndex: "1",
    pSize: "50",
    ATPT_OFCDC_SC_CODE: regionCode,
    SCHUL_NM: schoolName,
    SCHUL_KND_SC_NM: schoolLevel, // 초등학교/중학교/고등학교
  });

  try {
    const url = `${NEIS_BASE_URL}/schoolInfo?${params.toString()}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP 오류: ${res.status}`);
    }

    const data = await res.json();

    const rows = data?.schoolInfo?.[1]?.row ?? [];

    if (!Array.isArray(rows) || rows.length === 0) {
      schoolResults.innerHTML =
        '<p class="placeholder-text">검색 결과가 없습니다. 검색어(학교명)를 조금만 줄여서 다시 시도해 보세요.</p>';
      setSearchStatus("검색 결과가 없습니다.", true);
      return;
    }

    renderSchoolList(rows);
    setSearchStatus(`총 ${rows.length}개 학교를 찾았습니다.`);
  } catch (error) {
    console.error(error);
    schoolResults.innerHTML =
      '<p class="placeholder-text">학교 정보를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.</p>';
    setSearchStatus("학교 정보 조회 중 오류가 발생했습니다.", true);
  } finally {
    setSearchLoading(false);
  }
}

// 검색 결과 리스트 렌더링
function renderSchoolList(rows) {
  schoolResults.innerHTML = "";
  currentSelectedSchoolItem = null;
  selectedSchoolNameEl.textContent = "학교를 먼저 선택해 주세요.";
  mealContentEl.innerHTML =
    '<p class="placeholder-text">학교를 선택하면 오늘의 급식 메뉴가 여기에 표시됩니다.</p>';

  rows.forEach((school) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "school-item";

    item.dataset.regionCode = school.ATPT_OFCDC_SC_CODE;
    item.dataset.schoolCode = school.SD_SCHUL_CODE;
    item.dataset.schoolName = school.SCHUL_NM;

    const nameEl = document.createElement("div");
    nameEl.className = "school-name";
    nameEl.textContent = school.SCHUL_NM;

    const metaEl = document.createElement("div");
    metaEl.className = "school-meta";
    const level = school.SCHUL_KND_SC_NM || "";
    const address = school.ORG_RDNMA || school.ORG_RDNDA || school.ORG_RDNZC || "";
    metaEl.textContent = `${level}${address ? " · " + address : ""}`;

    item.appendChild(nameEl);
    item.appendChild(metaEl);

    item.addEventListener("click", () => {
      handleSchoolClick(item);
    });

    schoolResults.appendChild(item);
  });
}

// 학교 선택 시 처리
function handleSchoolClick(item) {
  if (currentSelectedSchoolItem) {
    currentSelectedSchoolItem.classList.remove("selected");
  }
  currentSelectedSchoolItem = item;
  item.classList.add("selected");

  const schoolName = item.dataset.schoolName;
  const regionCode = item.dataset.regionCode;
  const schoolCode = item.dataset.schoolCode;

  selectedSchoolNameEl.textContent = schoolName || "선택된 학교";

  const dateInfo = getSelectedDateInfo();
  fetchMealForDate(regionCode, schoolCode, schoolName, dateInfo);
}

// 급식 정보 조회 (선택 날짜 기준)
async function fetchMealForDate(regionCode, schoolCode, schoolName, dateInfo) {
  if (!regionCode || !schoolCode) return;

  const { apiDate, display } = dateInfo;

  if (mealDateEl) {
    mealDateEl.textContent = display;
  }

  setMealStatus("");
  mealContentEl.innerHTML =
    '<p class="placeholder-text">급식 정보를 불러오는 중입니다...</p>';

  const params = new URLSearchParams({
    KEY: API_KEY,
    Type: "json",
    pIndex: "1",
    pSize: "10",
    ATPT_OFCDC_SC_CODE: regionCode,
    SD_SCHUL_CODE: schoolCode,
    MLSV_YMD: apiDate,
  });

  try {
    const url = `${NEIS_BASE_URL}/mealServiceDietInfo?${params.toString()}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP 오류: ${res.status}`);
    }

    const data = await res.json();

    const rows = data?.mealServiceDietInfo?.[1]?.row ?? [];

    if (!Array.isArray(rows) || rows.length === 0) {
      mealContentEl.innerHTML =
        '<p class="placeholder-text">선택한 날짜에는 등록된 급식 정보가 없습니다. (방학 또는 휴업일일 수 있어요)</p>';
      setMealStatus(`${schoolName}의 ${display} 급식 정보가 없습니다.`);
      return;
    }

    renderMealList(rows);
    setMealStatus(`${schoolName}의 ${display} 급식 정보를 불러왔습니다.`);
  } catch (error) {
    console.error(error);
    mealContentEl.innerHTML =
      '<p class="placeholder-text">급식 정보를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.</p>';
    setMealStatus("급식 조회 중 오류가 발생했습니다.", true);
  }
}

// 급식 리스트 렌더링
function renderMealList(rows) {
  mealContentEl.innerHTML = "";

  rows.forEach((row) => {
    const item = document.createElement("div");
    item.className = "meal-item";

    const header = document.createElement("div");
    header.className = "meal-item-header";
    header.textContent = row.MMEAL_SC_NM ? `${row.MMEAL_SC_NM} 급식` : "급식";

    const body = document.createElement("div");
    body.className = "meal-item-body";

    let dishText = row.DDISH_NM || "";

    // HTML <br/> 태그를 줄바꿈 문자로 치환
    dishText = dishText
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/[\r]/g, "")
      .trim();

    body.textContent = dishText || "급식 정보가 없습니다.";

    item.appendChild(header);
    item.appendChild(body);
    mealContentEl.appendChild(item);
  });
}

// 초기화
function init() {
  populateRegionSelect();

  // 날짜 입력 기본값: 오늘
  const { year, month, day, display } = getTodayDateInfo();
  if (mealDateInput) {
    mealDateInput.value = `${year}-${month}-${day}`;
  }
  if (mealDateEl) {
    mealDateEl.textContent = display;
  }

  // 날짜 변경 시, 선택된 학교가 있으면 그 날짜의 급식 다시 조회
  if (mealDateInput) {
    mealDateInput.addEventListener("change", () => {
      if (!currentSelectedSchoolItem) return;
      const schoolName = currentSelectedSchoolItem.dataset.schoolName;
      const regionCode = currentSelectedSchoolItem.dataset.regionCode;
      const schoolCode = currentSelectedSchoolItem.dataset.schoolCode;
      const dateInfo = getSelectedDateInfo();
      fetchMealForDate(regionCode, schoolCode, schoolName, dateInfo);
    });
  }

  if (searchForm) {
    searchForm.addEventListener("submit", searchSchools);
  }
}

document.addEventListener("DOMContentLoaded", init);

