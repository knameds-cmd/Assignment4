import Link from "next/link";
import styles from "./Footer.module.css";

/** 모든 페이지 하단의 공통 푸터. 데이터 면책과 주요 링크를 안내한다. */
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <div>
            <div className={styles.brand}>☀️ SolarFit</div>
            <p className={styles.desc}>
              지역별 태양광 발전·수익 시뮬레이터 (사업자용)
            </p>
          </div>
          <nav className={styles.links}>
            <Link href="/simulator">수익 시뮬레이터</Link>
            <Link href="/regions">지역별 비교</Link>
            <Link href="/saved">저장한 견적</Link>
            <Link href="/about">계산 방법</Link>
          </nav>
        </div>
        <p className={styles.disclaimer}>
          본 서비스의 발전량·수익은 표준 산정식에 기반한 <strong>추정치</strong>이며,
          실제 사업 수익을 보장하지 않습니다. 정밀 검토는 부지별 일사량 자료를
          사용하세요.
        </p>
        <p className={styles.copy}>
          © 2026 SolarFit · Introduction to AI Programming · Assignment 4
        </p>
      </div>
    </footer>
  );
}
