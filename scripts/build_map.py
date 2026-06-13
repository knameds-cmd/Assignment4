# -*- coding: utf-8 -*-
"""
대한민국 시·도 GeoJSON -> 가벼운 SVG 경로(lib/koreaGeo.js) 변환기.

원본 경계(약 7.5MB)는 너무 상세하므로 (1) 등거리 투영(위도 보정),
(2) Douglas-Peucker 단순화, (3) 작은 섬 제거 를 거쳐 약 수십 KB의
SVG path 데이터로 줄여 프런트엔드에 내장한다. 런타임 네트워크/API 불필요.

원본 출처: github.com/southkorea/southkorea-maps (kostat 2018 provinces)
실행: py -3 scripts/build_map.py
"""
import json
import math
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "scripts", "data", "korea-provinces.json")
OUT = os.path.join(ROOT, "lib", "koreaGeo.js")

# GeoJSON name_eng -> 우리 서비스의 region id
NAME_TO_ID = {
    "Seoul": "seoul", "Incheon": "incheon", "Gyeonggi-do": "gyeonggi",
    "Gangwon-do": "gangwon", "Chungcheongbuk-do": "chungbuk",
    "Chungcheongnam-do": "chungnam", "Daejeon": "daejeon", "Sejongsi": "sejong",
    "Jeollabuk-do": "jeonbuk", "Jeollanam-do": "jeonnam", "Gwangju": "gwangju",
    "Gyeongsangbuk-do": "gyeongbuk", "Daegu": "daegu", "Gyeongsangnam-do": "gyeongnam",
    "Busan": "busan", "Ulsan": "ulsan", "Jeju-do": "jeju",
}

VIEW_W = 760.0          # 목표 SVG 폭
PADDING = 16.0
RDP_EPS = 1.1           # 단순화 강도(px). 클수록 점이 줄고 거칠어진다.
MIN_RING_AREA = 9.0     # 이 면적(px^2) 미만의 섬은 제거 (지역별 최대 링은 항상 유지)


def iter_rings(geom):
    """Polygon/MultiPolygon에서 외곽 링(첫 번째 링)들만 순회."""
    t = geom["type"]
    if t == "Polygon":
        yield geom["coordinates"][0]
    elif t == "MultiPolygon":
        for poly in geom["coordinates"]:
            yield poly[0]


def shoelace_area(pts):
    a = 0.0
    n = len(pts)
    for i in range(n):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % n]
        a += x1 * y2 - x2 * y1
    return abs(a) / 2.0


def perp(p, a, b):
    (px, py), (ax, ay), (bx, by) = p, a, b
    dx, dy = bx - ax, by - ay
    if dx == 0 and dy == 0:
        return math.hypot(px - ax, py - ay)
    t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)
    t = max(0, min(1, t))
    cx, cy = ax + t * dx, ay + t * dy
    return math.hypot(px - cx, py - cy)


def rdp(points, eps):
    """반복(스택) 방식 Douglas-Peucker — 깊은 재귀로 인한 스택오버플로 방지."""
    n = len(points)
    if n < 3:
        return points[:]
    keep = [False] * n
    keep[0] = keep[-1] = True
    stack = [(0, n - 1)]
    while stack:
        s, e = stack.pop()
        dmax, idx = 0.0, -1
        for i in range(s + 1, e):
            d = perp(points[i], points[s], points[e])
            if d > dmax:
                dmax, idx = d, i
        if dmax > eps and idx != -1:
            keep[idx] = True
            stack.append((s, idx))
            stack.append((idx, e))
    return [points[i] for i in range(n) if keep[i]]


def main():
    data = json.load(open(SRC, encoding="utf-8"))
    features = data["features"]

    # 위도 보정용 mid-lat (1차 스캔)
    lo_lat = min(lat for f in features for ring in iter_rings(f["geometry"]) for _, lat in ring)
    hi_lat = max(lat for f in features for ring in iter_rings(f["geometry"]) for _, lat in ring)
    kx = math.cos(math.radians((lo_lat + hi_lat) / 2))

    def raw(lng, lat):
        return lng * kx, -lat  # 북쪽이 위로

    # 모든 링을 raw 좌표로 투영하고 면적 계산 (rid, area, raw_pts)
    rings = []
    global_max = 0.0
    for f in features:
        rid = NAME_TO_ID.get(f["properties"]["name_eng"])
        if not rid:
            continue
        for ring in iter_rings(f["geometry"]):
            pts = [raw(lng, lat) for lng, lat in ring]
            a = shoelace_area(pts)
            rings.append((rid, a, pts))
            global_max = max(global_max, a)

    # 작은 섬 제거: 전체 최대 링 면적의 0.2% 미만은 버리되, 각 지역의 최대 링은 유지
    thr = global_max * 0.002
    region_max = {}
    for rid, a, _ in rings:
        region_max[rid] = max(region_max.get(rid, 0), a)
    kept_rings = [(rid, pts) for rid, a, pts in rings if a >= thr or a == region_max[rid]]

    # 유지된 링만으로 투영 범위 계산 (먼 섬이 범위를 왜곡하지 않도록)
    xs = [x for _, pts in kept_rings for x, _ in pts]
    ys = [y for _, pts in kept_rings for _, y in pts]
    rx0, rx1, ry0, ry1 = min(xs), max(xs), min(ys), max(ys)
    span_x, span_y = rx1 - rx0, ry1 - ry0
    scale = (VIEW_W - 2 * PADDING) / span_x
    view_h = span_y * scale + 2 * PADDING

    def to_view(p):
        return ((p[0] - rx0) * scale + PADDING, (p[1] - ry0) * scale + PADDING)

    # 지역별로 유지된 링을 투영·단순화
    by_region = {}
    for rid, pts in kept_rings:
        by_region.setdefault(rid, []).append(pts)

    regions = {}
    total_pts = 0
    for rid, ring_list in by_region.items():
        kept = []  # (area, simplified_view_points)
        for pts in ring_list:
            view = [to_view(p) for p in pts]
            simp = rdp(view, RDP_EPS)
            if len(simp) < 3:
                continue
            kept.append((shoelace_area(simp), simp))
        if not kept:
            continue
        kept.sort(key=lambda x: x[0], reverse=True)
        biggest = kept[0][0]
        chosen = [pp for area, pp in kept if area >= MIN_RING_AREA or area == biggest]

        # path d 문자열 + 라벨용 중심(가장 큰 링의 무게중심)
        d_parts = []
        for pts in chosen:
            seg = "M" + " ".join(f"{x:.1f},{y:.1f}" for x, y in pts) + "Z"
            d_parts.append(seg)
            total_pts += len(pts)
        main_pts = kept[0][1]
        cx = sum(p[0] for p in main_pts) / len(main_pts)
        cy = sum(p[1] for p in main_pts) / len(main_pts)
        regions[rid] = {"d": "".join(d_parts), "cx": round(cx, 1), "cy": round(cy, 1)}

    out = (
        "// 자동 생성 파일 — scripts/build_map.py 로 생성. 직접 수정 금지.\n"
        "// 대한민국 17개 시·도 경계를 단순화한 SVG 경로(빌드 시점 내장, 런타임 API 불필요).\n"
        f"export const KOREA_VIEWBOX = {{ width: {VIEW_W:.0f}, height: {view_h:.0f} }};\n\n"
        "export const KOREA_GEO = "
        + json.dumps(regions, ensure_ascii=False, indent=0).replace("\n", "")
        + ";\n"
    )
    with open(OUT, "w", encoding="utf-8") as fp:
        fp.write(out)
    print(f"wrote {OUT}")
    print(f"regions: {len(regions)} / total points: {total_pts}")
    print(f"viewBox: {VIEW_W:.0f} x {view_h:.0f}")
    print(f"output size: {os.path.getsize(OUT)/1024:.1f} KB")


if __name__ == "__main__":
    main()
