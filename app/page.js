import Link from "next/link";
import styles from "./Home.module.css";

/** 홈(랜딩) 페이지 — 서비스가 누구를 위해, 어떤 문제를 푸는지 전달하고
 *  핵심 기능(시뮬레이터)으로 유도한다. */

const FEATURES = [
  {
    icon: "📍",
    title: "지역별 발전량 산정",
    desc: "전국 17개 시·도의 일평균 발전시간 데이터로, 부지가 속한 지역의 연간 발전량을 즉시 계산합니다.",
  },
  {
    icon: "💰",
    title: "수익·회수기간 추정",
    desc: "SMP·REC 단가와 가중치를 반영해 연간 수익과 투자 회수기간(payback)을 한 번에 보여줍니다.",
  },
  {
    icon: "🌱",
    title: "환경 효과 환산",
    desc: "연간 CO₂ 절감량과 소나무 식재 효과로 환산해, 고객 제안 자료에 바로 활용할 수 있습니다.",
  },
  {
    icon: "🗂️",
    title: "견적 저장·비교",
    desc: "여러 부지의 계산 결과를 브라우저에 저장하고 한눈에 비교해 최적의 후보지를 고릅니다.",
  },
];

const STEPS = [
  { n: "1", title: "지역·설비 입력", desc: "부지 지역과 설비용량(kW)을 선택합니다." },
  { n: "2", title: "단가·손실 조정", desc: "SMP·REC 단가, 성능비를 현장 조건에 맞게 조정합니다." },
  { n: "3", title: "결과 확인·저장", desc: "발전량·수익·회수기간을 확인하고 견적으로 저장합니다." },
];

export default function HomePage() {
  return (
    <>
      {/* 히어로 */}
      <section className={styles.hero}>
        <div className="container">
          <span className="badge badge-amber">태양광 설치 사업자를 위한 도구</span>
          <h1 className={styles.heroTitle}>
            “이 부지, 설치하면 1년에 얼마 벌까요?”
            <br />
            <span className={styles.accent}>30초 만에 답하세요.</span>
          </h1>
          <p className={styles.heroDesc}>
            SolarFit은 지역별 일사량 데이터와 SMP·REC 단가를 반영해 태양광 발전량과
            예상 수익, 투자 회수기간을 즉시 계산해 주는 사업자용 시뮬레이터입니다.
            복잡한 엑셀 없이 현장에서 바로 고객에게 제안하세요.
          </p>
          <div className={styles.heroActions}>
            <Link href="/simulator" className="btn btn-primary">
              수익 계산 시작하기 →
            </Link>
            <Link href="/regions" className="btn btn-secondary">
              지역별 발전 잠재력 보기
            </Link>
          </div>
        </div>
      </section>

      {/* 문제 정의 */}
      <section className="section">
        <div className="container">
          <div className={styles.problem}>
            <div>
              <h2>견적 한 건에 며칠씩 걸리지 않나요?</h2>
              <p className="text-muted">
                소규모 태양광 사업자는 부지마다 발전량과 수익을 일일이 계산해야
                합니다. 지역 일사량, 손실률, SMP·REC 단가가 매번 달라
                엑셀을 다시 짜고, 고객 문의에 즉답하기 어렵습니다.
              </p>
            </div>
            <div className={styles.problemCard}>
              <p className={styles.problemQuote}>
                “고객이 전화로 물어보는데, 대략적인 수익이라도 바로
                말해줄 수 있으면 좋겠어요.”
              </p>
              <p className={styles.problemWho}>— 지역 태양광 설치 사업자</p>
            </div>
          </div>
        </div>
      </section>

      {/* 기능 */}
      <section className={styles.featuresSection}>
        <div className="container">
          <div className="page-header center">
            <h2>SolarFit이 제공하는 것</h2>
            <p style={{ margin: "0 auto" }}>
              입력 한 번으로 사업 검토에 필요한 핵심 지표를 모두 계산합니다.
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
            <h2>이렇게 사용합니다</h2>
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

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div className={styles.cta}>
            <h2 className={styles.ctaTitle}>지금 부지 수익을 계산해 보세요</h2>
            <p className={styles.ctaDesc}>
              회원가입 없이 바로 사용할 수 있습니다. 결과는 브라우저에 안전하게
              저장됩니다.
            </p>
            <Link href="/simulator" className="btn btn-primary">
              수익 시뮬레이터 열기 →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
