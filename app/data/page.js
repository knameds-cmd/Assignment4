"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { REGIONS, findRegion } from "@/lib/regions";
import { formatNumber } from "@/lib/calc";
import {
  MONTH_LABELS,
  monthlyGeneration,
  ANNUAL_PV_GENERATION,
  JEJU_CURTAILMENT,
  SOLAR_DATA_SOURCE,
} from "@/lib/solarHistory";
import styles from "./Data.module.css";

/** 발전 데이터 페이지 — 공개 통계 기반의 (1) 지역별 월별 발전 패턴,
 *  (2) 전국 태양광 연간 발전량 추이를 시각화한다. */

export default function DataPage() {
  const [regionId, setRegionId] = useState("jeonnam");
  const [capacityKw, setCapacityKw] = useState(100);

  const region = findRegion(regionId);
  const monthly = useMemo(
    () => monthlyGeneration(region.peakSunHours, Number(capacityKw) || 0),
    [region, capacityKw]
  );
  const annualTotal = monthly.reduce((a, b) => a + b, 0);

  return (
    <section className="section">
      <div className="container">
        <div className="page-header">
          <h1>발전 데이터</h1>
          <p>
            국내 공개 통계를 기반으로 한 월별 발전 패턴과 전국 태양광 발전량 추이입니다.
            지역과 설비용량을 바꾸면 월별 예상 발전량이 갱신됩니다.
          </p>
        </div>

        {/* (1) 지역별 월별 발전 패턴 */}
        <div className="card card-pad" style={{ marginBottom: 24 }}>
          <div className={styles.head}>
            <div>
              <h2 className="mt-0">월별 예상 발전량</h2>
              <p className={styles.sub}>
                {region.name} · 연간 합계 약{" "}
                <strong>{formatNumber(annualTotal)} kWh</strong>
              </p>
            </div>
            <div className={styles.controls}>
              <label className={styles.ctl}>
                지역
                <select
                  value={regionId}
                  onChange={(e) => setRegionId(e.target.value)}
                >
                  {REGIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.ctl}>
                설비용량(kW)
                <input
                  type="number"
                  min="1"
                  value={capacityKw}
                  onChange={(e) => setCapacityKw(e.target.value)}
                />
              </label>
            </div>
          </div>

          <BarChart
            values={monthly}
            labels={MONTH_LABELS}
            unit="kWh"
            highlightPeak
          />
          <p className={styles.source}>
            출처: {SOLAR_DATA_SOURCE.irradiance}. 5월 전후로 발전량이 가장 높고
            장마철(7월)에 소폭 감소하는 국내 전형적 패턴을 보입니다.
          </p>
        </div>

        {/* (2) 전국 태양광 연간 발전량 추이 */}
        <div className="card card-pad">
          <h2 className="mt-0">전국 태양광 연간 발전량 추이</h2>
          <p className={styles.sub}>
            국내 태양광 발전량은 보급 확대에 따라 매년 빠르게 증가해 왔습니다.
          </p>
          <BarChart
            values={ANNUAL_PV_GENERATION.map((d) => d.gwh)}
            labels={ANNUAL_PV_GENERATION.map((d) => `${d.year}`)}
            unit="GWh"
          />
          <p className={styles.source}>
            출처: {SOLAR_DATA_SOURCE.generation}. 표기 수치는 공표 통계 기반
            <strong> 근사치</strong>로, 자료·연도 기준에 따라 차이가 있을 수 있습니다.
          </p>
        </div>

        {/* (3) 제주 출력제어 추이 */}
        <div className="card card-pad" style={{ marginTop: 24 }}>
          <h2 className="mt-0">제주 재생에너지 출력제어 횟수 추이</h2>
          <p className={styles.sub}>
            계통 제약으로 발전을 강제로 줄인 횟수입니다. 제주는 재생에너지 과밀로
            출력제어가 매년 급증해, 시뮬레이터의 <strong>출력제어율</strong>로
            수익에 반영됩니다.
          </p>
          <BarChart
            values={JEJU_CURTAILMENT.map((d) => d.count)}
            labels={JEJU_CURTAILMENT.map((d) => `${d.year}`)}
            unit="회"
          />
          <p className={styles.source}>
            출처: {SOLAR_DATA_SOURCE.curtailment}. 출력제어는 현재 사실상 제주에
            집중되어 있으며(육지는 2024년부터 호남 일부), 수치는 공표치
            <strong> 근사</strong>입니다.
          </p>
        </div>

        <p className={styles.note}>
          관심 지역의 상세 수익은{" "}
          <Link href="/simulator">수익 시뮬레이터</Link>에서 계산하고, 데이터의
          가정·한계는 <Link href="/about">계산 방법</Link>에서 확인하세요.
        </p>
      </div>
    </section>
  );
}

/** 의존성 없는 간단한 SVG 막대 차트. 막대에 마우스를 올리면 값이 보인다. */
function BarChart({ values, labels, unit, highlightPeak = false }) {
  const W = 680;
  const H = 280;
  const padL = 16;
  const padR = 16;
  const padTop = 24;
  const padBottom = 34;
  const plotW = W - padL - padR;
  const plotH = H - padTop - padBottom;
  const max = Math.max(...values, 1);
  const peakIdx = highlightPeak ? values.indexOf(Math.max(...values)) : -1;

  const n = values.length;
  const slot = plotW / n;
  const barW = Math.min(slot * 0.62, 46);

  return (
    <div className={styles.chartWrap}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={styles.chart}
        role="img"
        aria-label="막대 차트"
      >
        {/* 기준선 */}
        <line
          x1={padL}
          y1={padTop + plotH}
          x2={W - padR}
          y2={padTop + plotH}
          stroke="#e7e2d8"
        />
        {values.map((v, i) => {
          const h = (v / max) * plotH;
          const x = padL + slot * i + (slot - barW) / 2;
          const y = padTop + plotH - h;
          const isPeak = i === peakIdx;
          return (
            <g key={i} className={styles.barGroup}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx="4"
                className={`${styles.bar} ${isPeak ? styles.barPeak : ""}`}
              >
                <title>
                  {labels[i]}: {formatNumber(v)} {unit}
                </title>
              </rect>
              <text x={x + barW / 2} y={y - 6} className={styles.barValue}>
                {formatNumber(v)}
              </text>
              <text
                x={x + barW / 2}
                y={padTop + plotH + 20}
                className={styles.barLabel}
              >
                {labels[i]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
