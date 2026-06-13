# ☀️ SolarFit — 지역별 태양광 발전·수익 시뮬레이터

> 태양광 설치 사업자가 부지의 **연간 발전량·예상 수익·투자 회수기간·CO₂ 절감량**을
> 현장에서 30초 만에 계산하고 고객에게 제안할 수 있게 돕는 웹 서비스.

**Introduction to AI Programming — Assignment 4** (PRD + AI 활용 웹서비스 구현)

- 🔗 **배포 URL (Vercel):** `https://<여기에-배포-주소> ` _(배포 후 업데이트 예정)_
- 📂 **GitHub:** https://github.com/knameds-cmd/Assignment4
- 📄 **PRD & AI 개발 리포트:** [`docs/PRD_SolarFit.pdf`](docs/PRD_SolarFit.pdf)

---

## 1. 프로젝트 개요

소규모 태양광 설치 사업자는 새 부지를 검토할 때마다 *"여기 설치하면 1년에 얼마나
발전하고 얼마를 버는가?"* 를 직접 계산해야 합니다. 지역별 일사량, 손실률, SMP·REC
단가가 매번 달라 엑셀을 다시 짜야 하고, 고객 문의에 즉답하기 어렵습니다.

**SolarFit**은 이 계산을 표준 산정식으로 자동화한 사업자용 도구입니다. 지역과 설비
조건만 입력하면 발전량·수익·회수기간·환경 효과를 즉시 보여주고, 여러 부지의 견적을
저장해 비교할 수 있습니다. 백엔드·데이터베이스 없이 브라우저(localStorage)만으로
동작합니다.

## 2. 주요 기능

| 기능 | 설명 |
|------|------|
| **수익 시뮬레이터** | 지역·설비용량·성능비·SMP/REC 단가를 입력하면 연간 발전량, 예상 수익(SMP+REC), 투자 회수기간, 20년 누적 수익, CO₂ 절감량을 실시간 계산 |
| **지역별 비교** | 전국 17개 시·도의 일평균 발전시간과 연간 발전량을 권역 필터·검색·정렬·막대 그래프로 비교 |
| **견적 저장·비교** | 계산 결과를 브라우저에 저장하고, 최고 수익·최단 회수기간 견적을 자동 하이라이트 |
| **계산 방법 공개** | 모든 수식과 가정값, 데이터 출처·면책을 투명하게 안내 |

## 3. 페이지 구조

- `/` **홈** — 서비스 소개, 문제 정의, 기능 요약, 사용 방법
- `/simulator` **수익 시뮬레이터** — 핵심 인터랙션(입력 → 실시간 계산 → 저장)
- `/regions` **지역별 비교** — 17개 시·도 발전 잠재력 정렬/필터
- `/saved` **저장한 견적** — localStorage 기반 견적 관리·비교
- `/about` **계산 방법** — 수식·가정·데이터 출처·면책

## 4. 기술 스택

- **Next.js 15** (App Router) + **React 19**
- **CSS Modules** + 전역 CSS (디자인 토큰 기반, 외부 UI 라이브러리 미사용)
- **localStorage** (백엔드 없이 견적 저장)
- **Vercel** 배포

## 5. 로컬에서 실행하기

사전 준비: [Node.js](https://nodejs.org) 18 이상

```bash
# 1) 저장소 클론
git clone https://github.com/knameds-cmd/Assignment4.git
cd Assignment4

# 2) 의존성 설치
npm install

# 3) 개발 서버 실행 → http://localhost:3000
npm run dev

# 4) 프로덕션 빌드 / 실행
npm run build
npm start
```

## 6. 프로젝트 구조

```
.
├── app/                  # Next.js App Router
│   ├── layout.js         # 공통 레이아웃(Nav + Footer)
│   ├── page.js           # 홈
│   ├── globals.css       # 디자인 토큰 · 공통 스타일
│   ├── simulator/        # 수익 시뮬레이터 (핵심 인터랙션)
│   ├── regions/          # 지역별 비교
│   ├── saved/            # 저장한 견적
│   └── about/            # 계산 방법
├── components/           # Nav, Footer (공용 컴포넌트)
├── lib/
│   ├── regions.js        # 17개 시·도 일사량 데이터
│   ├── calc.js           # 발전량·수익 계산 엔진
│   └── storage.js        # localStorage 헬퍼
├── docs/
│   └── PRD_SolarFit.pdf  # PRD + AI 개발 리포트
└── README.md
```

## 7. 참고 — 데이터 면책

지역별 일평균 발전시간은 공개 일사량 자료를 참고한 **대표 추정치**이며 학습용
데모로 단순화되었습니다. 발전량·수익·회수기간은 실제 사업 수익을 보장하지 않으며,
실제 투자 결정에는 부지별 정밀 검토가 필요합니다. (자세한 내용은 서비스 내
**계산 방법** 페이지 참조)
