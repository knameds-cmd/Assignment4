import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "SolarFit — 지역별 태양광 발전·수익 시뮬레이터",
  description:
    "태양광 설치 사업자를 위한 지역별 발전량·수익·CO2 절감·투자 회수기간 시뮬레이터. 부지 검토와 고객 제안을 빠르게.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
