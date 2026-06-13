"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { REGIONS, findRegion } from "@/lib/regions";
import {
  calculateSolar,
  DEFAULTS,
  formatNumber,
  formatKrw,
} from "@/lib/calc";
import { addEstimate, getEstimates } from "@/lib/storage";
import styles from "./Simulator.module.css";

/** 수익 시뮬레이터 — 이 서비스의 핵심 인터랙션.
 *  입력값이 바뀔 때마다 useMemo로 결과를 재계산하고,
 *  '견적 저장' 시 localStorage에 보관한다. */

export default function SimulatorPage() {
  // 입력 상태 (지역은 기본값으로 가장 발전량이 높은 전남 선택)
  const [regionId, setRegionId] = useState("jeonnam");
  const [capacityKw, setCapacityKw] = useState(DEFAULTS.capacityKw);
  const [performanceRatio, setPerformanceRatio] = useState(
    DEFAULTS.performanceRatio
  );
  const [smpPrice, setSmpPrice] = useState(DEFAULTS.smpPrice);
  const [recPrice, setRecPrice] = useState(DEFAULTS.recPrice);
  const [recWeight, setRecWeight] = useState(DEFAULTS.recWeight);
  const [installCostPerKw, setInstallCostPerKw] = useState(
    DEFAULTS.installCostPerKw
  );
  const [siteName, setSiteName] = useState("");
  const [savedCount, setSavedCount] = useState(() => getEstimates().length);
  const [justSaved, setJustSaved] = useState(false);

  const region = findRegion(regionId);

  // 입력이 바뀔 때마다 결과를 다시 계산 (의존성 배열의 값이 변할 때만 실행)
  const result = useMemo(
    () =>
      calculateSolar({
        peakSunHours: region.peakSunHours,
        capacityKw,
        performanceRatio,
        smpPrice,
        recPrice,
        recWeight,
        installCostPerKw,
      }),
    [
      region,
      capacityKw,
      performanceRatio,
      smpPrice,
      recPrice,
      recWeight,
      installCostPerKw,
    ]
  );

  function handleSave() {
    const estimate = {
      siteName: siteName.trim() || `${region.name} ${capacityKw}kW`,
      regionId,
      regionName: region.name,
      capacityKw: Number(capacityKw),
      performanceRatio: Number(performanceRatio),
      smpPrice: Number(smpPrice),
      recPrice: Number(recPrice),
      recWeight: Number(recWeight),
      installCostPerKw: Number(installCostPerKw),
      annualKwh: result.annualKwh,
      annualRevenue: result.annualRevenue,
      paybackYears: result.paybackYears,
      co2ReductionTon: result.co2ReductionTon,
      createdAt: Date.now(),
    };
    const next = addEstimate(estimate);
    setSavedCount(next.length);
    setSiteName("");
    setJustSaved(true);
    // 2.5초 후 안내 메시지를 자동으로 숨긴다
    setTimeout(() => setJustSaved(false), 2500);
  }

  return (
    <section className="section">
      <div className="container">
        <div className="page-header">
          <h1>태양광 수익 시뮬레이터</h1>
          <p>
            부지 지역과 설비 조건을 입력하면 연간 발전량·예상 수익·투자 회수기간을
            즉시 계산합니다. 값을 바꾸면 결과가 실시간으로 갱신됩니다.
          </p>
        </div>

        <div className={styles.layout}>
          {/* ---------- 입력 폼 ---------- */}
          <div className="card card-pad">
            <h2 className={styles.formTitle}>입력 조건</h2>

            <div className="field">
              <label htmlFor="region">
                설치 지역
                <span className="hint"> · 지역별 일평균 발전시간이 반영됩니다</span>
              </label>
              <select
                id="region"
                value={regionId}
                onChange={(e) => setRegionId(e.target.value)}
              >
                {REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.peakSunHours}h/일)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-2">
              <div className="field">
                <label htmlFor="capacity">설비용량 (kW)</label>
                <input
                  id="capacity"
                  type="number"
                  min="1"
                  value={capacityKw}
                  onChange={(e) => setCapacityKw(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="pr">
                  성능비 (PR)
                  <span className="hint"> · 0.75~0.85 권장</span>
                </label>
                <input
                  id="pr"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={performanceRatio}
                  onChange={(e) => setPerformanceRatio(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-2">
              <div className="field">
                <label htmlFor="smp">SMP 단가 (원/kWh)</label>
                <input
                  id="smp"
                  type="number"
                  min="0"
                  value={smpPrice}
                  onChange={(e) => setSmpPrice(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="rec">REC 단가 (원/REC)</label>
                <input
                  id="rec"
                  type="number"
                  min="0"
                  value={recPrice}
                  onChange={(e) => setRecPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-2">
              <div className="field">
                <label htmlFor="weight">
                  REC 가중치
                  <span className="hint"> · 설비 규모/유형별</span>
                </label>
                <input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="0"
                  value={recWeight}
                  onChange={(e) => setRecWeight(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="cost">설치 단가 (원/kW)</label>
                <input
                  id="cost"
                  type="number"
                  min="0"
                  step="10000"
                  value={installCostPerKw}
                  onChange={(e) => setInstallCostPerKw(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="site">
                견적 이름 <span className="hint"> · 선택 (저장 시 구분용)</span>
              </label>
              <input
                id="site"
                type="text"
                placeholder="예) 나주 한빛마을 지붕형"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
              />
            </div>

            <button className="btn btn-primary" onClick={handleSave} style={{ width: "100%" }}>
              이 견적 저장하기
            </button>
            {justSaved && (
              <p className={styles.savedMsg}>
                ✅ 저장되었습니다. <Link href="/saved">저장한 견적 보기 →</Link>
              </p>
            )}
            <p className={styles.savedCount}>
              현재 저장된 견적: <strong>{savedCount}</strong>건
            </p>
          </div>

          {/* ---------- 결과 ---------- */}
          <div className={styles.results}>
            <div className={styles.highlightGrid}>
              <div className={`card card-pad ${styles.highlight}`}>
                <span className={styles.metricLabel}>연간 예상 발전량</span>
                <span className={styles.metricValue}>
                  {formatNumber(result.annualKwh)}
                  <small> kWh</small>
                </span>
                <span className={styles.metricSub}>
                  {formatNumber(result.annualMwh, 1)} MWh / 년
                </span>
              </div>
              <div className={`card card-pad ${styles.highlight} ${styles.highlightAmber}`}>
                <span className={styles.metricLabel}>연간 예상 수익</span>
                <span className={styles.metricValue}>
                  {formatKrw(result.annualRevenue)}
                </span>
                <span className={styles.metricSub}>
                  SMP {formatKrw(result.smpRevenue)} + REC{" "}
                  {formatKrw(result.recRevenue)}
                </span>
              </div>
            </div>

            <div className="grid grid-2">
              <div className="card card-pad">
                <span className={styles.metricLabel}>투자 회수기간</span>
                <span className={styles.metricValueSm}>
                  {Number.isFinite(result.paybackYears)
                    ? `${formatNumber(result.paybackYears, 1)} 년`
                    : "-"}
                </span>
                <span className={styles.metricSub}>
                  초기 투자비 {formatKrw(result.installCost)}
                </span>
              </div>
              <div className="card card-pad">
                <span className={styles.metricLabel}>20년 누적 수익</span>
                <span className={styles.metricValueSm}>
                  {formatKrw(result.lifetimeRevenue20yr)}
                </span>
                <span className={styles.metricSub}>설비 수명 20년 가정</span>
              </div>
              <div className="card card-pad">
                <span className={styles.metricLabel}>연간 CO₂ 절감</span>
                <span className={styles.metricValueSm}>
                  {formatNumber(result.co2ReductionTon, 1)} 톤
                </span>
                <span className={styles.metricSub}>
                  배출계수 0.4594 kg/kWh 기준
                </span>
              </div>
              <div className="card card-pad">
                <span className={styles.metricLabel}>소나무 식재 효과</span>
                <span className={styles.metricValueSm}>
                  {formatNumber(result.treeEquivalent)} 그루
                </span>
                <span className={styles.metricSub}>연간 흡수량 환산</span>
              </div>
            </div>

            <p className={styles.note}>
              ※ 위 수치는 표준 산정식에 기반한 <strong>추정치</strong>입니다. 계산
              방법과 가정은 <Link href="/about">계산 방법</Link> 페이지에서 확인하세요.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
