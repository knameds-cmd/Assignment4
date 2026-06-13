"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { REGIONS, REGION_GROUPS } from "@/lib/regions";
import { calculateSolar, DEFAULTS, formatNumber } from "@/lib/calc";
import styles from "./Regions.module.css";

/** 지역별 발전 잠재력 비교 페이지.
 *  - 권역 필터 + 이름 검색 + 정렬(발전시간/발전량) 인터랙션
 *  - 기준 설비용량을 바꾸면 연간 발전량 컬럼이 즉시 갱신
 *  - 막대로 지역 간 상대 발전량을 시각화 */

export default function RegionsPage() {
  const [group, setGroup] = useState("전체");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("peakSunHours"); // 'peakSunHours' | 'name'
  const [sortAsc, setSortAsc] = useState(false);
  const [capacityKw, setCapacityKw] = useState(100);

  // 각 지역의 연간 발전량을 기준 용량으로 미리 계산해 둔다
  const rows = useMemo(() => {
    return REGIONS.map((r) => {
      const { annualKwh } = calculateSolar({
        peakSunHours: r.peakSunHours,
        capacityKw,
        performanceRatio: DEFAULTS.performanceRatio,
      });
      return { ...r, annualKwh };
    });
  }, [capacityKw]);

  // 필터(권역/검색) → 정렬 순으로 가공
  const visible = useMemo(() => {
    let list = rows;
    if (group !== "전체") list = list.filter((r) => r.group === group);
    if (query.trim()) {
      const q = query.trim();
      list = list.filter((r) => r.name.includes(q));
    }
    const sorted = [...list].sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name, "ko");
      return a.peakSunHours - b.peakSunHours; // 발전시간 = 발전량 기준
    });
    if (!sortAsc) sorted.reverse();
    return sorted;
  }, [rows, group, query, sortKey, sortAsc]);

  // 막대 길이 정규화를 위한 전체 최대 발전량
  const maxKwh = Math.max(...rows.map((r) => r.annualKwh));

  function toggleSort(key) {
    if (sortKey === key) {
      setSortAsc((v) => !v);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  return (
    <section className="section">
      <div className="container">
        <div className="page-header">
          <h1>지역별 발전 잠재력 비교</h1>
          <p>
            전국 17개 시·도의 일평균 발전시간과 그에 따른 연간 발전량을
            비교합니다. 권역·검색·정렬로 후보 지역을 빠르게 좁혀 보세요.
          </p>
        </div>

        {/* 컨트롤 바 */}
        <div className={styles.controls}>
          <div className={styles.groups}>
            {REGION_GROUPS.map((g) => (
              <button
                key={g}
                className={`${styles.chip} ${group === g ? styles.chipActive : ""}`}
                onClick={() => setGroup(g)}
              >
                {g}
              </button>
            ))}
          </div>
          <div className={styles.controlRight}>
            <input
              className={styles.search}
              type="text"
              placeholder="지역명 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <label className={styles.capacity}>
              기준 용량
              <input
                type="number"
                min="1"
                value={capacityKw}
                onChange={(e) => setCapacityKw(e.target.value)}
              />
              kW
            </label>
          </div>
        </div>

        {/* 비교 표 */}
        <div className="card" style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>순위</th>
                <th>지역</th>
                <th>권역</th>
                <th
                  className={styles.sortable}
                  onClick={() => toggleSort("peakSunHours")}
                >
                  일평균 발전시간{" "}
                  {sortKey === "peakSunHours" ? (sortAsc ? "▲" : "▼") : ""}
                </th>
                <th>연간 발전량 ({formatNumber(capacityKw)}kW 기준)</th>
                <th>상대 비교</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r, i) => (
                <tr key={r.id}>
                  <td className={styles.rank}>{i + 1}</td>
                  <td className={styles.name}>{r.name}</td>
                  <td>
                    <span className="badge badge-amber">{r.group}</span>
                  </td>
                  <td>{r.peakSunHours} h/일</td>
                  <td>{formatNumber(r.annualKwh)} kWh</td>
                  <td className={styles.barCell}>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{ width: `${(r.annualKwh / maxKwh) * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan="6" className="center text-muted">
                    조건에 맞는 지역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className={styles.note}>
          관심 지역을 정했다면{" "}
          <Link href="/simulator">수익 시뮬레이터</Link>에서 상세 조건으로 수익을
          계산해 보세요. · 데이터는 추정치입니다 (
          <Link href="/about">계산 방법</Link>).
        </p>
      </div>
    </section>
  );
}
