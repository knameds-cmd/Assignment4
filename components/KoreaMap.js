"use client";

import { useState } from "react";
import { KOREA_GEO, KOREA_VIEWBOX } from "@/lib/koreaGeo";
import { formatNumber } from "@/lib/calc";
import styles from "./KoreaMap.module.css";

/** 대한민국 17개 시·도 발전 잠재력 지도(choropleth).
 *  일평균 발전시간이 높을수록 색이 진하며, 마우스를 올리거나 클릭하면
 *  해당 지역을 강조하고 우측 패널에 상세 정보를 보여준다. 클릭 시 부모(표)와 동기화. */

const LOW = [255, 233, 179]; // 발전 잠재력 낮음 (연한 노랑)
const HIGH = [194, 65, 12]; // 발전 잠재력 높음 (진한 주황)

function lerpColor(a, b, t) {
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

function shortName(name) {
  return name.replace(/(특별자치도|특별자치시|특별시|광역시|도)$/, "");
}

export default function KoreaMap({ regions, activeGroup, selectedId, onSelect }) {
  const [hoveredId, setHoveredId] = useState(null);

  const values = regions.map((r) => r.peakSunHours);
  const min = Math.min(...values);
  const max = Math.max(...values);

  const focusId = hoveredId || selectedId;
  const focus = regions.find((r) => r.id === focusId);

  function fillFor(r) {
    const inGroup = activeGroup === "전체" || r.group === activeGroup;
    if (!inGroup) return "#e7e2d8"; // 필터에서 제외된 지역은 회색으로 흐리게
    const t = max > min ? (r.peakSunHours - min) / (max - min) : 0.5;
    return lerpColor(LOW, HIGH, t);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.mapBox}>
        <svg
          viewBox={`0 0 ${KOREA_VIEWBOX.width} ${KOREA_VIEWBOX.height}`}
          className={styles.svg}
          role="img"
          aria-label="대한민국 시·도별 태양광 발전 잠재력 지도"
        >
          {regions.map((r) => {
            const geo = KOREA_GEO[r.id];
            if (!geo) return null;
            const active = r.id === focusId;
            return (
              <path
                key={r.id}
                d={geo.d}
                fill={fillFor(r)}
                className={`${styles.region} ${active ? styles.active : ""}`}
                onMouseEnter={() => setHoveredId(r.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onSelect(r.id === selectedId ? null : r.id)}
              />
            );
          })}
          {focus && KOREA_GEO[focus.id] && (
            <text
              x={KOREA_GEO[focus.id].cx}
              y={KOREA_GEO[focus.id].cy}
              className={styles.label}
              textAnchor="middle"
            >
              {shortName(focus.name)}
            </text>
          )}
        </svg>

        <div className={styles.legend}>
          <span>낮음</span>
          <div className={styles.legendBar} />
          <span>높음</span>
          <span className={styles.legendNote}>일평균 발전시간</span>
        </div>
      </div>

      <div className={styles.readout}>
        {focus ? (
          <>
            <span className="badge badge-amber">{focus.group}</span>
            <h3 className={styles.readoutName}>{focus.name}</h3>
            <div className={styles.stat}>
              <span className={styles.statLabel}>일평균 발전시간</span>
              <span className={styles.statValue}>{focus.peakSunHours} h/일</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>연간 발전량</span>
              <span className={styles.statValue}>
                {formatNumber(focus.annualKwh)} kWh
              </span>
            </div>
            <p className={styles.hint}>
              클릭하면 아래 비교 표에서 해당 지역이 강조됩니다.
            </p>
          </>
        ) : (
          <p className={styles.placeholder}>
            지도의 지역에 마우스를 올리거나 클릭해 발전 잠재력을 확인하세요.
            <br />
            색이 <strong>진할수록</strong> 발전 잠재력이 높습니다.
          </p>
        )}
      </div>
    </div>
  );
}
