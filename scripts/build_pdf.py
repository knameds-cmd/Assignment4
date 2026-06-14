# -*- coding: utf-8 -*-
"""
docs/PRD.md (Markdown) -> docs/PRD_SolarFit.pdf 변환 스크립트.

reportlab + Windows 기본 한글 폰트(맑은 고딕)를 임베딩해, 외부 의존성 없이
한글 PRD/리포트를 깔끔한 PDF로 만든다. 지원 문법: 제목(#/##/###), 문단,
글머리표(-)/번호 목록(1.), 표(|), 인용(>), 수평선(---), 굵게(**)/기울임(*)/인라인코드(`).

실행: py -3 scripts/build_pdf.py [input.md] [output.pdf] [title]
"""
import os
import re
import sys
import html

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
    Preformatted,
)
from reportlab.platypus.flowables import HRFlowable

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "docs", "PRD.md")
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, "docs", "PRD_SolarFit.pdf")
DOC_TITLE = sys.argv[3] if len(sys.argv) > 3 else "SolarFit PRD"

# --- 한글 폰트 등록 (맑은 고딕) ---
FONT, FONT_BD = "Malgun", "MalgunBd"
pdfmetrics.registerFont(TTFont(FONT, r"C:\Windows\Fonts\malgun.ttf"))
pdfmetrics.registerFont(TTFont(FONT_BD, r"C:\Windows\Fonts\malgunbd.ttf"))
pdfmetrics.registerFontFamily(FONT, normal=FONT, bold=FONT_BD, italic=FONT, boldItalic=FONT_BD)

NAVY = colors.HexColor("#0f2540")
AMBER = colors.HexColor("#d97706")
AMBER_TINT = colors.HexColor("#fef3c7")
BORDER = colors.HexColor("#e7e2d8")
MUTED = colors.HexColor("#4b5563")

styles = getSampleStyleSheet()


def style(name, **kw):
    base = dict(fontName=FONT, fontSize=10.5, leading=16, textColor=colors.HexColor("#1f2937"))
    base.update(kw)
    return ParagraphStyle(name, **base)


S = {
    "title": style("t", fontName=FONT_BD, fontSize=21, leading=27, textColor=NAVY, spaceAfter=4),
    "h1": style("h1", fontName=FONT_BD, fontSize=17, leading=23, textColor=NAVY, spaceBefore=8, spaceAfter=8),
    "h2": style("h2", fontName=FONT_BD, fontSize=13.5, leading=19, textColor=NAVY, spaceBefore=14, spaceAfter=6),
    "h3": style("h3", fontName=FONT_BD, fontSize=11.5, leading=17, textColor=AMBER, spaceBefore=10, spaceAfter=4),
    "body": style("body", spaceAfter=7),
    "li": style("li", leftIndent=14, spaceAfter=3),
    "quote": style("quote", leftIndent=12, textColor=MUTED, fontName=FONT, spaceBefore=4, spaceAfter=8, borderPadding=(2, 2, 2, 8)),
    "cell": style("cell", fontSize=9.5, leading=13),
    "cellh": style("cellh", fontName=FONT_BD, fontSize=9.5, leading=13, textColor=NAVY),
    "code": style("code", fontName=FONT, fontSize=8.5, leading=12.5, textColor=colors.HexColor("#1f2937")),
}


def code_block(text):
    """코드블록을 연한 배경의 박스로 렌더링 (줄바꿈/들여쓰기 보존)."""
    avail = A4[0] - 4.0 * cm
    pre = Preformatted(text if text.strip() else " ", S["code"])
    t = Table([[pre]], colWidths=[avail])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f6f3ec")),
        ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    return t


def inline(text):
    """마크다운 인라인 -> reportlab 마크업. 링크는 'text (url)'로, 그 외는 이스케이프 후 치환."""
    t = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"\1 (\2)", text)
    t = html.escape(t)
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
    t = re.sub(r"\*(.+?)\*", r"<i>\1</i>", t)
    t = re.sub(r"`(.+?)`", r'<font face="Courier" color="#b45309">\1</font>', t)
    return t


def split_row(line):
    cells = [c.strip() for c in line.strip().strip("|").split("|")]
    return cells


def build():
    with open(SRC, encoding="utf-8") as f:
        lines = f.read().split("\n")

    flow = []
    i = 0
    seen_h1 = False
    n = len(lines)

    while i < n:
        line = lines[i]
        stripped = line.strip()

        # 빈 줄
        if not stripped:
            i += 1
            continue

        # 코드블록 (```)
        if stripped.startswith("```"):
            i += 1
            buf = []
            while i < n and not lines[i].strip().startswith("```"):
                buf.append(lines[i])
                i += 1
            i += 1  # 닫는 ``` 건너뜀
            flow.append(code_block("\n".join(buf)))
            flow.append(Spacer(1, 6))
            continue

        # 수평선
        if re.fullmatch(r"-{3,}", stripped):
            flow.append(Spacer(1, 4))
            flow.append(HRFlowable(width="100%", thickness=0.8, color=BORDER))
            flow.append(Spacer(1, 4))
            i += 1
            continue

        # 제목
        m = re.match(r"^(#{1,3})\s+(.*)", stripped)
        if m:
            level = len(m.group(1))
            text = m.group(2)
            if level == 1:
                if seen_h1:
                    flow.append(PageBreak())
                flow.append(Paragraph(inline(text), S["title"] if not seen_h1 else S["h1"]))
                seen_h1 = True
            elif level == 2:
                flow.append(Paragraph(inline(text), S["h2"]))
            else:
                flow.append(Paragraph(inline(text), S["h3"]))
            i += 1
            continue

        # 표 (다음 줄이 구분선이면 표로 처리)
        if stripped.startswith("|") and i + 1 < n and re.search(r"\|\s*-{2,}", lines[i + 1]):
            header = split_row(lines[i])
            rows = [header]
            i += 2  # 헤더 + 구분선 건너뜀
            while i < n and lines[i].strip().startswith("|"):
                rows.append(split_row(lines[i]))
                i += 1
            flow.append(make_table(rows))
            flow.append(Spacer(1, 6))
            continue

        # 인용
        if stripped.startswith(">"):
            buf = []
            while i < n and lines[i].strip().startswith(">"):
                buf.append(lines[i].strip()[1:].strip())
                i += 1
            qs = ParagraphStyle("q", parent=S["quote"], backColor=colors.HexColor("#fffaf2"),
                                borderColor=AMBER, borderWidth=0, leftIndent=14)
            flow.append(Paragraph(inline(" ".join(buf)), qs))
            continue

        # 번호 목록
        if re.match(r"^\d+\.\s", stripped):
            while i < n and re.match(r"^\d+\.\s", lines[i].strip()):
                num, rest = lines[i].strip().split(".", 1)
                flow.append(Paragraph(f"<b>{num}.</b> {inline(rest.strip())}", S["li"]))
                i += 1
            flow.append(Spacer(1, 3))
            continue

        # 글머리표
        if stripped.startswith("- "):
            while i < n and lines[i].strip().startswith("- "):
                item = lines[i].strip()[2:]
                flow.append(Paragraph(f"&bull;&nbsp;&nbsp;{inline(item)}", S["li"]))
                i += 1
            flow.append(Spacer(1, 3))
            continue

        # 일반 문단
        flow.append(Paragraph(inline(stripped), S["body"]))
        i += 1

    doc = SimpleDocTemplate(
        OUT, pagesize=A4,
        leftMargin=2.0 * cm, rightMargin=2.0 * cm,
        topMargin=1.8 * cm, bottomMargin=1.8 * cm,
        title=DOC_TITLE, author="knameds",
    )
    doc.build(flow)
    print("PDF generated:", OUT)


def make_table(rows):
    ncol = len(rows[0])
    avail = A4[0] - 4.0 * cm
    if ncol == 2:
        weights = [0.30, 0.70]
    elif ncol == 3:
        weights = [0.26, 0.54, 0.20]
    else:
        weights = [1.0 / ncol] * ncol
    col_widths = [w * avail for w in weights]

    data = []
    for r_idx, row in enumerate(rows):
        prow = []
        for c in row:
            st = S["cellh"] if r_idx == 0 else S["cell"]
            prow.append(Paragraph(inline(c), st))
        data.append(prow)

    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), AMBER_TINT),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#fcfbf8")]),
    ]))
    return t


if __name__ == "__main__":
    build()
