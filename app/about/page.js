import Link from "next/link";
import { CO2_FACTOR, CO2_PER_TREE_KG, DEFAULTS, formatNumber } from "@/lib/calc";
import styles from "./About.module.css";

/** 계산 방법(About) — 시뮬레이터가 어떤 수식과 가정으로 동작하는지 투명하게 공개한다.
 *  사용자가 결과의 신뢰도를 스스로 판단할 수 있도록 돕는 정적 정보 페이지. */

export const metadata = {
  title: "계산 방법 — SolarFit",
};

export default function AboutPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="page-header">
          <h1>계산 방법과 가정</h1>
          <p>
            SolarFit의 모든 결과는 아래 표준 산정식과 기본 가정에 근거합니다. 값은
            추정치이며, 실제 사업 검토 시 부지별 정밀 데이터로 보정해야 합니다.
          </p>
        </div>

        <div className={styles.wrap}>
          <div className="card card-pad">
            <h2>1. 연간 발전량</h2>
            <p className={styles.formula}>
              연간 발전량(kWh) = 설비용량(kW) × 일평균 발전시간(h) × 365 × 성능비(PR)
            </p>
            <p className="text-muted">
              <strong>일평균 발전시간(등가가동시간)</strong>은 설비가 정격 출력으로
              발전한 것과 같은 시간을 의미하며, 지역 일사량에 따라 달라집니다. 전국
              17개 시·도별 값은 <Link href="/regions">지역별 비교</Link> 페이지에서
              확인할 수 있습니다. <strong>성능비(PR)</strong>는 음영·온도·인버터
              손실 등을 반영하는 계수로 보통 0.75~0.85를 사용합니다.
            </p>
          </div>

          <div className="card card-pad">
            <h2>2. 연간 수익</h2>
            <p className={styles.formula}>
              연간 수익 = (발전량 × SMP단가) + (발전량[MWh] × REC가중치 × REC단가)
            </p>
            <p className="text-muted">
              태양광 수익은 전력 판매 수익(<strong>SMP</strong>, 계통한계가격)과
              신재생에너지 공급인증서(<strong>REC</strong>) 판매 수익의 합으로
              구성됩니다. 1 REC는 가중치 1.0 기준 1MWh에 해당하며, 설비 규모·유형에
              따라 가중치가 달라집니다. SMP·REC 단가는 시장 상황에 따라 변동하므로
              시뮬레이터에서 직접 조정할 수 있습니다.
            </p>
          </div>

          <div className="card card-pad">
            <h2>3. 환경 효과</h2>
            <p className={styles.formula}>
              CO₂ 절감량(kg) = 발전량(kWh) × {CO2_FACTOR} (kgCO₂/kWh)
            </p>
            <p className="text-muted">
              국가 전력 배출계수 근사값 {CO2_FACTOR} kgCO₂/kWh를 적용합니다. 소나무
              식재 효과는 소나무 1그루의 연간 CO₂ 흡수량을 약 {CO2_PER_TREE_KG}
              kg으로 가정해 환산한 값입니다.
            </p>
          </div>

          <div className="card card-pad">
            <h2>4. 투자 회수기간</h2>
            <p className={styles.formula}>
              회수기간(년) = 초기 투자비 ÷ 연간 수익 (초기 투자비 = 설비용량 × 설치
              단가)
            </p>
            <p className="text-muted">
              운영비·금융비용·발전 효율 저하 등을 제외한 단순 회수기간입니다. 실제
              사업성 분석에는 할인율을 반영한 NPV·IRR 분석이 추가로 필요합니다.
            </p>
          </div>

          <div className="card card-pad">
            <h2>기본 가정값</h2>
            <table className="table">
              <tbody>
                <tr>
                  <td>성능비(PR)</td>
                  <td>{DEFAULTS.performanceRatio}</td>
                </tr>
                <tr>
                  <td>SMP 단가</td>
                  <td>{formatNumber(DEFAULTS.smpPrice)} 원/kWh</td>
                </tr>
                <tr>
                  <td>REC 단가</td>
                  <td>{formatNumber(DEFAULTS.recPrice)} 원/REC</td>
                </tr>
                <tr>
                  <td>REC 가중치</td>
                  <td>{DEFAULTS.recWeight}</td>
                </tr>
                <tr>
                  <td>설치 단가</td>
                  <td>{formatNumber(DEFAULTS.installCostPerKw)} 원/kW</td>
                </tr>
              </tbody>
            </table>
            <p className="text-muted" style={{ marginTop: 12 }}>
              위 값은 시뮬레이터에서 모두 수정할 수 있습니다.
            </p>
          </div>

          <div className={`card card-pad ${styles.disclaimer}`}>
            <h2>데이터 출처와 면책</h2>
            <p>
              지역별 일평균 발전시간은 한국에너지공단·기상청에서 공개하는 일사량
              자료를 참고한 <strong>대표 추정치</strong>이며, 학습용 데모를 위해
              단순화되었습니다. 본 서비스가 제시하는 발전량·수익·회수기간은 어떠한
              경우에도 실제 사업 수익을 보장하지 않습니다. 실제 투자 결정 전에는
              부지별 정밀 일사량 측정, 계통 연계 조건, 최신 SMP·REC 시세, 인허가
              비용 등을 반영한 전문가 검토가 반드시 필요합니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
