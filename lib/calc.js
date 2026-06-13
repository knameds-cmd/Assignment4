/**
 * 태양광 발전·수익 계산 엔진.
 *
 * 모든 수식은 국내 태양광 사업 검토에서 널리 쓰이는 표준 산정식을 단순화한 것이다.
 * UI(시뮬레이터)와 분리해 두어, 동일한 로직을 지역 비교 페이지에서도 재사용한다.
 */

/** CO2 배출계수 (kgCO2 / kWh) — 국가 전력 배출계수 근사값 */
export const CO2_FACTOR = 0.4594;

/** 소나무 1그루가 1년간 흡수하는 CO2 (kg) — 환경 효과 환산용 */
export const CO2_PER_TREE_KG = 6.6;

/** 입력값의 기본값. 시뮬레이터 폼 초기값이자 계산 시 누락 보정용. */
export const DEFAULTS = {
  capacityKw: 100, // 설비용량 (kW)
  performanceRatio: 0.8, // 성능비(PR): 음영·온도·인버터 손실 등을 반영 (0~1)
  smpPrice: 130, // SMP 단가 (원/kWh)
  recPrice: 70000, // REC 단가 (원/REC, 1REC = 1MWh)
  recWeight: 1.2, // REC 가중치 (설비 유형·규모에 따라 달라짐)
  installCostPerKw: 1_400_000, // 설치 단가 (원/kW)
};

/** 숫자가 아니거나 음수면 기본값으로 대체하는 안전 파서 */
function num(value, fallback) {
  const n = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/**
 * 핵심 계산 함수.
 * @param {object} input
 * @param {number} input.peakSunHours - 지역 일평균 발전시간 (h/day) [필수]
 * @param {number} [input.capacityKw] - 설비용량 (kW)
 * @param {number} [input.performanceRatio] - 성능비 (0~1)
 * @param {number} [input.smpPrice] - SMP 단가 (원/kWh)
 * @param {number} [input.recPrice] - REC 단가 (원/REC)
 * @param {number} [input.recWeight] - REC 가중치
 * @param {number} [input.installCostPerKw] - 설치 단가 (원/kW)
 * @returns {object} 발전량·수익·환경효과·회수기간 결과
 */
export function calculateSolar(input) {
  const peakSunHours = num(input.peakSunHours, 3.5);
  const capacityKw = num(input.capacityKw, DEFAULTS.capacityKw);
  const performanceRatio = Math.min(
    1,
    num(input.performanceRatio, DEFAULTS.performanceRatio)
  );
  const smpPrice = num(input.smpPrice, DEFAULTS.smpPrice);
  const recPrice = num(input.recPrice, DEFAULTS.recPrice);
  const recWeight = num(input.recWeight, DEFAULTS.recWeight);
  const installCostPerKw = num(input.installCostPerKw, DEFAULTS.installCostPerKw);

  // 1) 연간 발전량 (kWh) = 설비용량 × 일평균 발전시간 × 365일 × 성능비
  const annualKwh = capacityKw * peakSunHours * 365 * performanceRatio;
  const annualMwh = annualKwh / 1000;

  // 2) 연간 수익 = SMP(전력 판매) + REC(신재생 공급인증서) 수익
  const smpRevenue = annualKwh * smpPrice;
  const recRevenue = annualMwh * recWeight * recPrice;
  const annualRevenue = smpRevenue + recRevenue;

  // 3) 환경 효과: CO2 절감량 및 소나무 환산 그루 수
  const co2ReductionKg = annualKwh * CO2_FACTOR;
  const co2ReductionTon = co2ReductionKg / 1000;
  const treeEquivalent = co2ReductionKg / CO2_PER_TREE_KG;

  // 4) 초기 투자비 및 단순 회수기간(년) = 투자비 / 연간 수익
  const installCost = capacityKw * installCostPerKw;
  const paybackYears = annualRevenue > 0 ? installCost / annualRevenue : Infinity;

  // 5) 20년 누적 수익 (설비 수명 가정)
  const lifetimeRevenue20yr = annualRevenue * 20;

  return {
    annualKwh,
    annualMwh,
    smpRevenue,
    recRevenue,
    annualRevenue,
    co2ReductionKg,
    co2ReductionTon,
    treeEquivalent,
    installCost,
    paybackYears,
    lifetimeRevenue20yr,
  };
}

/** 천 단위 콤마 + 소수 자리 포맷 (원/숫자 표시용) */
export function formatNumber(value, digits = 0) {
  if (!Number.isFinite(value)) return "-";
  return value.toLocaleString("ko-KR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** 금액을 '억/만원' 단위의 읽기 쉬운 한글 표기로 변환 */
export function formatKrw(value) {
  if (!Number.isFinite(value)) return "-";
  const eok = Math.floor(value / 100_000_000);
  const man = Math.floor((value % 100_000_000) / 10_000);
  if (eok > 0) return `${eok}억 ${man.toLocaleString("ko-KR")}만원`;
  if (man > 0) return `${man.toLocaleString("ko-KR")}만원`;
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}
