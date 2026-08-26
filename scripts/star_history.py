#!/usr/bin/env python3
"""Build local stargazer charts from the public repo star count.

GitHub locked GET /repos/{owner}/{repo}/stargazers to collaborators in 2026.
Services such as starchart.cc and star-history.com hit that list endpoint and
return rate-limit / restriction errors in READMEs.

This script only reads stargazers_count from GET /repos/{owner}/{repo}, which
stays public, appends today's count, and writes static SVGs into media/.
"""

from __future__ import annotations

import argparse
import json
import os
import urllib.request
from datetime import date, datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "media" / "stargazers.json"
REPO = "EmadHelmi/BiDiSense"
CREATED = date(2026, 8, 17)


def fetch_star_count() -> int:
    request = urllib.request.Request(
        f"https://api.github.com/repos/{REPO}",
        headers={
            "Accept": "application/vnd.github+json",
            "User-Agent": "BiDiSense-star-history",
            **(
                {"Authorization": f"Bearer {token}"}
                if (token := os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN"))
                else {}
            ),
        },
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        payload = json.load(response)
    return int(payload["stargazers_count"])


def load_history() -> dict:
    if DATA_PATH.exists():
        return json.loads(DATA_PATH.read_text(encoding="utf-8"))
    return {
        "repo": REPO,
        "points": [{"date": CREATED.isoformat(), "stars": 0}],
    }


def upsert_today(history: dict, stars: int) -> dict:
    today = datetime.now(timezone.utc).date().isoformat()
    points = [point for point in history.get("points", []) if point.get("date")]
    if points and points[-1]["date"] == today:
        points[-1]["stars"] = stars
    else:
        points.append({"date": today, "stars": stars})
    history["repo"] = REPO
    history["points"] = points
    return history


def chart_svg(points: list[dict], *, dark: bool) -> str:
    width, height = 880, 320
    left, right, top, bottom = 56, 28, 52, 52
    plot_w = width - left - right
    plot_h = height - top - bottom

    values = [int(point["stars"]) for point in points] or [0]
    ymax = max(5, max(values))
    n = max(1, len(points) - 1)

    def x_at(index: int) -> float:
        return left + (plot_w * index / n if n else 0)

    def y_at(stars: int) -> float:
        return top + plot_h * (1 - stars / ymax)

    coords = [
        (x_at(index), y_at(int(point["stars"])))
        for index, point in enumerate(points)
    ]
    polyline = " ".join(f"{x:.1f},{y:.1f}" for x, y in coords)
    area = f"{left:.1f},{top + plot_h:.1f} " + polyline + f" {coords[-1][0]:.1f},{top + plot_h:.1f}"

    if dark:
        bg, grid, axis, line, fill, title, muted = (
            "#0b0b0b",
            "#1f2933",
            "#9aa5b1",
            "#00e5c3",
            "#00e5c333",
            "#f5f7fa",
            "#7b8794",
        )
    else:
        bg, grid, axis, line, fill, title, muted = (
            "#f7f7f7",
            "#e4e7eb",
            "#52606d",
            "#0d9488",
            "#0d948826",
            "#1f2933",
            "#7b8794",
        )

    grid_lines = []
    ticks = 5
    for step in range(ticks + 1):
        y = top + plot_h * step / ticks
        value = ymax - ymax * step / ticks
        label = str(int(round(value)))
        grid_lines.append(
            f'<line x1="{left}" y1="{y:.1f}" x2="{width - right}" y2="{y:.1f}" '
            f'stroke="{grid}" stroke-width="1"/>'
            f'<text x="{left - 10}" y="{y:.1f}" fill="{axis}" font-size="12" '
            f'text-anchor="end" dominant-baseline="middle" '
            f'font-family="ui-sans-serif, system-ui, sans-serif">{label}</text>'
        )

    first = points[0]["date"]
    last = points[-1]["date"]
    latest = values[-1]
    x_labels = (
        f'<text x="{left}" y="{height - 18}" fill="{muted}" font-size="12" '
        f'font-family="ui-sans-serif, system-ui, sans-serif">{first}</text>'
        f'<text x="{width - right}" y="{height - 18}" fill="{muted}" font-size="12" '
        f'text-anchor="end" font-family="ui-sans-serif, system-ui, sans-serif">{last}</text>'
    )

    return f"""\
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}" role="img" aria-label="Stargazers over time">
  <rect width="{width}" height="{height}" rx="12" fill="{bg}"/>
  <text x="{left}" y="28" fill="{title}" font-size="18" font-weight="700" font-family="ui-sans-serif, system-ui, sans-serif">Stargazers</text>
  <text x="{width - right}" y="28" fill="{line}" font-size="18" font-weight="700" text-anchor="end" font-family="ui-sans-serif, system-ui, sans-serif">{latest}</text>
  {''.join(grid_lines)}
  <polygon points="{area}" fill="{fill}"/>
  <polyline points="{polyline}" fill="none" stroke="{line}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="{coords[-1][0]:.1f}" cy="{coords[-1][1]:.1f}" r="4.5" fill="{line}"/>
  {x_labels}
</svg>
"""


def write_outputs(history: dict) -> None:
    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    DATA_PATH.write_text(json.dumps(history, indent=2) + "\n", encoding="utf-8")
    points = history["points"]
    (ROOT / "media" / "stargazers-light.svg").write_text(
        chart_svg(points, dark=False), encoding="utf-8"
    )
    (ROOT / "media" / "stargazers-dark.svg").write_text(
        chart_svg(points, dark=True), encoding="utf-8"
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--offline",
        action="store_true",
        help="Regenerate SVGs from media/stargazers.json without calling GitHub.",
    )
    args = parser.parse_args()

    history = load_history()
    if not args.offline:
        history = upsert_today(history, fetch_star_count())
    elif not history.get("points"):
        history = upsert_today(history, 0)
    write_outputs(history)


if __name__ == "__main__":
    main()
