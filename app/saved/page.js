"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getEstimates,
  removeEstimate,
  clearEstimates,
} from "@/lib/storage";
import { formatNumber, formatKrw } from "@/lib/calc";
import styles from "./Saved.module.css";

/** 저장한 견적 페이지 — localStorage에 보관된 견적을 불러와
 *  표로 비교하고, 개별 삭제/전체 삭제할 수 있다.
 *  localStorage는 클라이언트에만 있으므로 useEffect에서 읽어 hydration 불일치를 피한다. */

export default function SavedPage() {
  const [estimates, setEstimates] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setEstimates(getEstimates());
    setMounted(true);
  }, []);

  function handleRemove(id) {
    setEstimates(removeEstimate(id));
  }

  function handleClear() {
    if (window.confirm("저장된 모든 견적을 삭제할까요?")) {
      setEstimates(clearEstimates());
    }
  }

  // 비교 하이라이트: 최고 수익 / 최단 회수기간 견적의 id
  const bestRevenueId = estimates.reduce(
    (best, e) => (best === null || e.annualRevenue > best.annualRevenue ? e : best),
    null
  )?.id;
  const bestPaybackId = estimates.reduce(
    (best, e) =>
      best === null || e.paybackYears < best.paybackYears ? e : best,
    null
  )?.id;

  // SSR/최초 렌더에서는 빈 상태를 그려 hydration 불일치를 방지
  if (!mounted) {
    return (
      <section className="section">
        <div className="container">
          <div className="page-header">
            <h1>저장한 견적</h1>
            <p>불러오는 중…</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <div className="page-header">
          <h1>저장한 견적</h1>
          <p>
            시뮬레이터에서 저장한 부지별 계산 결과를 한눈에 비교합니다. 최고 수익과
            최단 회수기간 견적을 자동으로 표시합니다.
          </p>
        </div>

        {estimates.length === 0 ? (
          <div className={`card card-pad ${styles.empty}`}>
            <div className={styles.emptyIcon}>🗂️</div>
            <h2 className="mt-0">아직 저장된 견적이 없습니다</h2>
            <p className="text-muted">
              시뮬레이터에서 부지 조건을 계산하고 “이 견적 저장하기”를 눌러보세요.
            </p>
            <Link href="/simulator" className="btn btn-primary">
              시뮬레이터로 이동 →
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.toolbar}>
              <span className="text-muted">
                총 <strong>{estimates.length}</strong>건
              </span>
              <button className="btn btn-ghost" onClick={handleClear}>
                전체 삭제
              </button>
            </div>

            <div className="grid grid-2">
              {estimates.map((e) => (
                <div key={e.id} className="card card-pad">
                  <div className={styles.cardHead}>
                    <h3 className="mt-0" style={{ marginBottom: 4 }}>
                      {e.siteName}
                    </h3>
                    <button
                      className={styles.removeBtn}
                      aria-label="삭제"
                      onClick={() => handleRemove(e.id)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className={styles.tags}>
                    <span className="badge badge-amber">{e.regionName}</span>
                    <span className="badge badge-amber">
                      {formatNumber(e.capacityKw)}kW
                    </span>
                    {e.id === bestRevenueId && (
                      <span className={styles.bestTag}>💰 최고 수익</span>
                    )}
                    {e.id === bestPaybackId && (
                      <span className={styles.bestTagGreen}>⚡ 최단 회수</span>
                    )}
                  </div>

                  <div className={styles.metrics}>
                    <div>
                      <span className={styles.mLabel}>연간 발전량</span>
                      <span className={styles.mValue}>
                        {formatNumber(e.annualKwh)} kWh
                      </span>
                    </div>
                    <div>
                      <span className={styles.mLabel}>연간 수익</span>
                      <span className={styles.mValue}>
                        {formatKrw(e.annualRevenue)}
                      </span>
                    </div>
                    <div>
                      <span className={styles.mLabel}>회수기간</span>
                      <span className={styles.mValue}>
                        {Number.isFinite(e.paybackYears)
                          ? `${formatNumber(e.paybackYears, 1)}년`
                          : "-"}
                      </span>
                    </div>
                    <div>
                      <span className={styles.mLabel}>연간 CO₂ 절감</span>
                      <span className={styles.mValue}>
                        {formatNumber(e.co2ReductionTon, 1)}톤
                      </span>
                    </div>
                  </div>

                  <p className={styles.date}>
                    {new Date(e.createdAt).toLocaleString("ko-KR")}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
