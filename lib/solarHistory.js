/**
 * 과거·평년 태양광 발전 데이터 (국내 공개 통계 기반).
 *
 * 아래 값은 다음 공개 자료를 참고해 정리한 "대표값/근사치"이며, 학습용 데모를
 * 위해 단순화되었다. 실제 분석에는 원자료(공공데이터포털 API, 기상청
 * 기상자료개방포털, KOSIS 등)를 사용해야 한다.
 *  - 월별 일사량 패턴: 기상청 월별 수평면 일사량 평년값(대표값)
 *  - 전국 태양광 발전량 추이: 한국에너지공단 신·재생에너지 보급통계 /
 *    전력거래소(KPX) 전력시장통계 공표치 근사
 */

export const SOLAR_DATA_SOURCE = {
  irradiance: "기상청 월별 수평면 일사량 평년값 (대표값)",
  generation:
    "한국에너지공단 신·재생에너지 보급통계 · 전력거래소(KPX) 전력시장통계 (공표치 근사)",
  curtailment:
    "전력거래소(KPX) 비중앙 출력제어 정보 · 공공데이터포털(제주 태양광·풍력 제어량/횟수) · 언론 공표치",
};

/** 제주 재생에너지 출력제어(curtailment) 횟수 추이 (연간, 공표치 근사).
 *  계통 제약으로 발전을 강제로 줄인 횟수로, 제주에서 매년 급증해 왔다.
 *  현재 의미 있는 출력제어는 사실상 제주에 집중되어 있다(육지는 2024년부터 호남 일부). */
export const JEJU_CURTAILMENT = [
  { year: 2020, count: 77 },
  { year: 2021, count: 64 },
  { year: 2022, count: 132 },
  { year: 2023, count: 181 },
];

export const MONTH_LABELS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

/** 전국 월별 수평면 일사량 평년 패턴 (kWh/m²/day, 대표값).
 *  5월 최대, 장마철 7월 소폭 감소, 겨울 최저의 국내 전형적 패턴을 반영. */
export const MONTHLY_IRRADIANCE = [
  2.3, 3.0, 3.8, 4.6, 5.0, 4.7, 4.0, 4.2, 3.8, 3.3, 2.4, 2.1,
];

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const NATIONAL_AVG =
  MONTHLY_IRRADIANCE.reduce((a, b) => a + b, 0) / MONTHLY_IRRADIANCE.length;

/**
 * 특정 지역(연평균 일평균 발전시간 기준)·설비용량의 월별 예상 발전량(kWh).
 * 전국 월별 패턴을 지역 연평균값으로 스케일링한다.
 * 연간 합계는 시뮬레이터의 연간 발전량 공식과 일관된다.
 */
export function monthlyGeneration(peakSunHours, capacityKw, pr = 0.8) {
  const factor = peakSunHours / NATIONAL_AVG;
  return MONTHLY_IRRADIANCE.map(
    (g, i) => capacityKw * g * factor * DAYS_IN_MONTH[i] * pr
  );
}

/** 전국 태양광 연간 발전량 추이 (GWh, 공표 통계 근사치). */
export const ANNUAL_PV_GENERATION = [
  { year: 2016, gwh: 5100 },
  { year: 2017, gwh: 7100 },
  { year: 2018, gwh: 9200 },
  { year: 2019, gwh: 12900 },
  { year: 2020, gwh: 17100 },
  { year: 2021, gwh: 21800 },
  { year: 2022, gwh: 24800 },
  { year: 2023, gwh: 27800 },
];
