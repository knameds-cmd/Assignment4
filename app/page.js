import Link from "next/link";
import styles from "./Home.module.css";

/** 홈(랜딩) 페이지 — 서비스가 무엇을, 어떤 데이터로 제공하는지 정보 위주로 전달한다. */

const FEATURES = [
  {
    icon: "📍",
    title: "지역별 발전량 산정",
    desc: "전국 17개 시·도의 일평균 발전시간 데이터로, 부지가 속한 지역의 연간 발전량을 계산합니다.",
  },
  {
    icon: "💰",
    title: "수익·회수기간 추정",
    desc: "SMP·REC 단가와 가중치를 반영해 연간 수익과 투자 회수기간(payback)을 함께 보여줍니다.",
  },
  {
    icon: "⚡",
    title: "출력제어 반영",
    desc: "제주 등 계통 제약이 큰 지역의 출력제어율을 반영해, 판매 가능 발전량 기준으로 수익을 보수적으로 추정합니다.",
  },
  {
    icon: "🗂️",
    title: "견적 저장·비교",
    desc: "여러 부지의 계산 결과를 저장하고 비교해 최적의 후보지를 고를 수 있습니다.",
  },
];

const STEPS = [
  { n: "1", title: "지역·설비 입력", desc: "부지 지역과 설비용량(kW)을 선택합니다." },
  { n: "2", title: "단가·손실 조정", desc: "SMP·REC 단가, 성능비, 출력제어율을 현장 조건에 맞게 조정합니다." },
  { n: "3", title: "결과 확인·저장", desc: "발전량·수익·회수기간을 확인하고 견적으로 저장합니다." },
];

export default function HomePage() {
  return (
    <>
      {/* 히어로 — 서비스 정의 */}
      <section className={styles.hero}>
        <div className="container">
          <span className="badge badge-amber">태양광 설치 사업자용 계산 도구</span>
          <h1 className={styles.heroTitle}>
            지역별 태양광 <span className={styles.accent}>발전·수익 시뮬레이터</span>
          </h1>
          <p className={styles.heroDesc}>
            전국 17개 시·도의 일사량 데이터를 바탕으로 설비용량·단가 조건에 따른
            <strong> 연간 발전량, 예상 수익(SMP·REC), 투자 회수기간, CO₂ 절감량</strong>을
            계산합니다. 제주 등 계통 제약 지역의 출력제어도 반영합니다.
          </p>
          <div className={styles.heroActions}>
            <Link href="/simulator" className="btn btn-primary">
              수익 시뮬레이터 →
            </Link>
            <Link href="/regions" className="btn btn-secondary">
              지역별 발전 데이터 보기
            </Link>
          </div>
        </div>
      </section>

      {/* 제공 기능 */}
      <section className={styles.featuresSection}>
        <div className="container">
          <div className="page-header center">
            <h2>제공하는 기능</h2>
            <p style={{ margin: "0 auto" }}>
              입력 한 번으로 사업 검토에 필요한 핵심 지표를 계산합니다.
            </p>
          </div>
          <div className="grid grid-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="card card-pad">
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className="text-muted mt-0">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 사용 방법 */}
      <section className="section">
        <div className="container">
          <div className="page-header center">
            <h2>사용 방법</h2>
          </div>
          <div className="grid grid-3">
            {STEPS.map((s) => (
              <div key={s.n} className={styles.step}>
                <div className={styles.stepNum}>{s.n}</div>
                <h3 className={styles.featureTitle}>{s.title}</h3>
                <p className="text-muted mt-0">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 데이터 & 계산 방법 안내 */}
      <section className="section">
        <div className="container">
          <div className="card card-pad">
            <h2 className="mt-0">데이터와 계산 방법</h2>
            <p className="text-muted">
              발전량·수익 추정은 공개 데이터와 국내 태양광 사업에서 통용되는 표준
              산정식에 기반합니다. 사용한 수식과 기본 가정값, 데이터 출처와 한계는
              모두 공개합니다.
            </p>
            <div className={styles.linkRow}>
              <Link href="/about" className="btn btn-secondary">
                계산 방법·데이터 출처
              </Link>
              <Link href="/regions" className="btn btn-secondary">
                지역별 비교
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
