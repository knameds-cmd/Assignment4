/**
 * 저장된 견적(saved estimates)을 브라우저 localStorage에 보관하는 헬퍼.
 * 백엔드/DB 없이 동작하며, 시뮬레이터와 '저장한 견적' 페이지가 공용으로 사용한다.
 * 서버 렌더링 시점에는 window가 없으므로 항상 typeof window 가드를 둔다.
 */

const STORAGE_KEY = "solarfit:estimates";

/** 저장된 견적 목록을 반환한다. (없거나 파싱 실패 시 빈 배열) */
export function getEstimates() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** 견적 하나를 추가하고 갱신된 목록을 반환한다. */
export function addEstimate(estimate) {
  const list = getEstimates();
  // id는 시간 기반으로 충분히 고유하게 생성 (충돌 방지로 랜덤 일부 결합)
  const id = `${estimate.createdAt}-${list.length}`;
  const next = [{ id, ...estimate }, ...list];
  save(next);
  return next;
}

/** id로 견적 하나를 삭제하고 갱신된 목록을 반환한다. */
export function removeEstimate(id) {
  const next = getEstimates().filter((e) => e.id !== id);
  save(next);
  return next;
}

/** 모든 견적을 삭제한다. */
export function clearEstimates() {
  save([]);
  return [];
}

function save(list) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
