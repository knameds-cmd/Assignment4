/**
 * 전국 17개 시·도의 태양광 발전 기초 데이터.
 *
 * peakSunHours(일평균 발전시간, 등가가동시간, 단위 h/day)는
 * "설비용량 1kW가 하루에 정격 출력으로 발전한 것과 동일한 시간"을 뜻하며,
 * 연간 발전량 = 설비용량 × peakSunHours × 365 × 성능비 로 계산하는 핵심 변수다.
 *
 * 주의: 아래 값은 한국에너지공단·기상청에서 공개하는 지역별 일사량/발전시간
 * 자료를 참고한 대표 "추정치"이며, 실제 사업 검토 시에는 해당 부지의
 * 정밀 일사량 데이터를 사용해야 한다. (자세한 면책은 /about 참고)
 */

export const REGIONS = [
  { id: "seoul", name: "서울특별시", group: "수도권", peakSunHours: 3.3 },
  { id: "incheon", name: "인천광역시", group: "수도권", peakSunHours: 3.4 },
  { id: "gyeonggi", name: "경기도", group: "수도권", peakSunHours: 3.4 },
  { id: "gangwon", name: "강원특별자치도", group: "강원", peakSunHours: 3.5 },
  { id: "chungbuk", name: "충청북도", group: "충청", peakSunHours: 3.5 },
  { id: "chungnam", name: "충청남도", group: "충청", peakSunHours: 3.6 },
  { id: "daejeon", name: "대전광역시", group: "충청", peakSunHours: 3.5 },
  { id: "sejong", name: "세종특별자치시", group: "충청", peakSunHours: 3.5 },
  { id: "jeonbuk", name: "전북특별자치도", group: "호남", peakSunHours: 3.7 },
  { id: "jeonnam", name: "전라남도", group: "호남", peakSunHours: 3.8 },
  { id: "gwangju", name: "광주광역시", group: "호남", peakSunHours: 3.7 },
  { id: "gyeongbuk", name: "경상북도", group: "영남", peakSunHours: 3.8 },
  { id: "daegu", name: "대구광역시", group: "영남", peakSunHours: 3.7 },
  { id: "gyeongnam", name: "경상남도", group: "영남", peakSunHours: 3.7 },
  { id: "busan", name: "부산광역시", group: "영남", peakSunHours: 3.6 },
  { id: "ulsan", name: "울산광역시", group: "영남", peakSunHours: 3.6 },
  { id: "jeju", name: "제주특별자치도", group: "제주", peakSunHours: 3.4 },
];

/** 권역 목록 (지역 비교 페이지의 필터 옵션으로 사용) */
export const REGION_GROUPS = [
  "전체",
  ...Array.from(new Set(REGIONS.map((r) => r.group))),
];

/** id로 지역 한 건을 찾는다. 없으면 undefined */
export function findRegion(id) {
  return REGIONS.find((r) => r.id === id);
}
