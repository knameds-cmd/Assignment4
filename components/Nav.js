"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "./Nav.module.css";

/** 모든 페이지 상단에 표시되는 네비게이션 바.
 *  현재 경로(usePathname)를 읽어 활성 메뉴를 강조한다.
 *  모바일에서는 햄버거 버튼으로 메뉴를 토글한다. */

const LINKS = [
  { href: "/", label: "홈" },
  { href: "/simulator", label: "시뮬레이터" },
  { href: "/regions", label: "지역 비교" },
  { href: "/data", label: "발전 데이터" },
  { href: "/saved", label: "저장 견적" },
  { href: "/about", label: "계산 방법" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand} onClick={() => setOpen(false)}>
          <span className={styles.logo} aria-hidden="true">
            ☀️
          </span>
          <span>
            Solar<strong>Fit</strong>
          </span>
        </Link>

        <button
          className={styles.toggle}
          aria-label="메뉴 열기"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>

        <nav className={`${styles.nav} ${open ? styles.navOpen : ""}`}>
          {LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.link} ${active ? styles.active : ""}`}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
