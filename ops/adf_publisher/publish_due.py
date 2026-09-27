#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import shutil
from datetime import datetime, timezone
from email.utils import format_datetime
from html import escape
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
QUEUE_PATH = ROOT / "ops/adf_publisher/QUEUE.json"
INDEX_TEMPLATE_PATH = ROOT / "ops/adf_publisher/templates/insights_index.html"
INDEX_PATH = ROOT / "insights/index.html"
FEED_PATH = ROOT / "insights/feed.xml"
SITEMAP_PATH = ROOT / "sitemap.xml"
CANONICAL_INSIGHTS = "https://hirrok.github.io/adf-hq/insights/"
SOURCE_ROOT = (ROOT / "ops/adf_publisher/drafts").resolve()
DEST_ROOT = (ROOT / "insights").resolve()

def parse_dt(value: str) -> datetime:
    value = value.replace("Z", "+00:00")
    dt = datetime.fromisoformat(value)
    if dt.tzinfo is None:
        raise ValueError(f"datetime must include an offset: {value}")
    return dt

def now_utc() -> datetime:
    override = os.getenv("ADF_PUBLISHER_NOW")
    return parse_dt(override).astimezone(timezone.utc) if override else datetime.now(timezone.utc)

def within(path: Path, root: Path) -> bool:
    try:
        path.resolve().relative_to(root)
        return True
    except ValueError:
        return False

def load_queue() -> dict:
    return json.loads(QUEUE_PATH.read_text(encoding="utf-8"))

def validate_common(data: dict) -> None:
    ids = set()
    slugs = set()
    for item in data["items"]:
        if item["id"] in ids:
            raise ValueError(f'duplicate id: {item["id"]}')
        if item["slug"] in slugs:
            raise ValueError(f'duplicate slug: {item["slug"]}')
        ids.add(item["id"])
        slugs.add(item["slug"])
        if item["status"] not in {"draft", "scheduled", "published"}:
            raise ValueError(f'invalid status for {item["id"]}')
        if not item["canonical_url"].startswith(CANONICAL_INSIGHTS):
            raise ValueError(f'non-canonical URL for {item["id"]}')
        parsed = urlparse(item["canonical_url"])
        if parsed.scheme != "https" or parsed.netloc != "hirrok.github.io":
            raise ValueError(f'invalid canonical URL for {item["id"]}')
        dest = (ROOT / item["destination_path"]).resolve()
        if not within(dest, DEST_ROOT):
            raise ValueError(f'destination escapes Insights: {item["id"]}')
        parse_dt(item["publish_at"])

def validate_due(item: dict) -> tuple[Path, Path]:
    source_path = item.get("source_path")
    if not source_path:
        raise ValueError(f'scheduled item lacks source_path: {item["id"]}')
    source = (ROOT / source_path).resolve()
    dest = (ROOT / item["destination_path"]).resolve()
    if not within(source, SOURCE_ROOT):
        raise ValueError(f'source escapes draft root: {item["id"]}')
    if not source.is_file():
        raise FileNotFoundError(f'draft missing: {source_path}')
    if not within(dest, DEST_ROOT):
        raise ValueError(f'destination escapes Insights: {item["id"]}')
    if dest.exists() and source.read_bytes() != dest.read_bytes():
        raise FileExistsError(
            f'destination already exists with different content for {item["id"]}; '
            "publish under a new slug or resolve manually"
        )
    return source, dest

def render_article(source: Path, item: dict, published_at: datetime) -> str:
    text = source.read_text(encoding="utf-8")
    replacements = {
        "{{PUBLISHED_DATE}}": published_at.date().isoformat(),
        "{{PUBLISHED_ISO}}": published_at.isoformat(),
        "{{CANONICAL_URL}}": item["canonical_url"],
        "{{TITLE}}": item["title"],
        "{{DESCRIPTION}}": item["description"],
    }
    for token, value in replacements.items():
        text = text.replace(token, value)
    return text

def relative_href(item: dict) -> str:
    tail = item["canonical_url"][len(CANONICAL_INSIGHTS):]
    return tail or "./"

def render_card(item: dict) -> str:
    published = parse_dt(item["published_at"] or item["publish_at"])
    date_label = published.strftime("%d %b %Y").upper()
    if item.get("season"):
        episode = int(item.get("episode", 0))
        kicker = f'{item["season"].split(" — ", 1)[0]} · Episode {episode:02d} · {item["series"]}'
    else:
        kicker = item["series"]
    return (
        f'<a class="card" href="{escape(relative_href(item), quote=True)}">\n'
        f'  <div class="kicker">{escape(kicker)}</div>\n'
        f'  <h2>{escape(item["title"])}</h2>\n'
        f'  <p>{escape(item["description"])}</p>\n'
        f'  <div class="meta">{date_label} · {escape(item["topic"])}</div>\n'
        f'</a>'
    )

def render_season_sections(items: list[dict]) -> str:
    groups: dict[str, list[dict]] = {}
    for item in items:
        season = item.get("season")
        if season:
            groups.setdefault(season, []).append(item)
    ordered = sorted(
        groups.items(),
        key=lambda pair: max(parse_dt(i["published_at"] or i["publish_at"]) for i in pair[1]),
        reverse=True,
    )
    sections = []
    for season, season_items in ordered:
        season_items.sort(key=lambda i: int(i.get("episode", 0)), reverse=True)
        title = season.split(" — ", 1)
        season_label = title[0]
        season_name = title[1] if len(title) > 1 else season
        sections.append(
            '<section class="section">\n'
            f'  <div class="season-tag">{escape(season_label)} · {escape(season_name)}</div>\n'
            '  <div class="section-head">\n'
            '    <h2 class="section-title">Editorial Series</h2>\n'
            '    <p class="section-copy">Sequential operating arguments from the Foundry. Read each season as a connected system, not isolated posts.</p>\n'
            '  </div>\n'
            '  <div class="grid">\n'
            + "\n".join(render_card(i) for i in season_items)
            + '\n  </div>\n</section>'
        )
    return "\n".join(sections)

def rebuild_index(published_items: list[dict]) -> None:
    template = INDEX_TEMPLATE_PATH.read_text(encoding="utf-8")
    evergreen = [i for i in published_items if not i.get("season")]
    INDEX_PATH.write_text(
        template
        .replace("{{SEASON_SECTIONS}}", render_season_sections(published_items))
        .replace("{{EVERGREEN_CARDS}}", "\n".join(render_card(i) for i in evergreen)),
        encoding="utf-8",
    )

def rebuild_feed(published_items: list[dict], built_at: datetime) -> None:
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
        '<channel>',
        '<title>Aurora Digital Foundry Insights</title>',
        '<link>https://hirrok.github.io/adf-hq/insights/</link>',
        '<description>Field notes, build notes, recon notes, and operating doctrine from Aurora Digital Foundry.</description>',
        '<language>en-PH</language>',
        f'<lastBuildDate>{format_datetime(built_at)}</lastBuildDate>',
        '<atom:link href="https://hirrok.github.io/adf-hq/insights/feed.xml" rel="self" type="application/rss+xml"/>',
    ]
    for item in published_items:
        published = parse_dt(item["published_at"] or item["publish_at"])
        lines.extend([
            '<item>',
            f'<title>{escape(item["title"])}</title>',
            f'<link>{escape(item["canonical_url"])}</link>',
            f'<guid isPermaLink="true">{escape(item["canonical_url"])}</guid>',
            f'<pubDate>{format_datetime(published)}</pubDate>',
            f'<description>{escape(item["description"])}</description>',
        ])
        web_media = item.get("web_media_url")
        if web_media:
            length = int(item.get("web_media_bytes") or 0)
            media_type = item.get("media_type") or "video/mp4"
            lines.append(
                f'<enclosure url="{escape(web_media)}" length="{length}" type="{escape(media_type)}"/>'
            )
        lines.extend([
            '</item>',
        ])
    lines.extend(['</channel>', '</rss>', ''])
    FEED_PATH.write_text("\n".join(lines), encoding="utf-8")


def rebuild_sitemap(published_items: list[dict], built_at: datetime) -> None:
    site_date = built_at.date().isoformat()
    entries = [
        ("https://hirrok.github.io/adf-hq/", site_date, "weekly", "1.0"),
        ("https://hirrok.github.io/adf-hq/insights/", site_date, "weekly", "0.9"),
        ("https://hirrok.github.io/adf-hq/store/", "2026-09-26", "monthly", "0.8"),
        ("https://hirrok.github.io/adf-hq/store/sample-audit.html", "2026-09-26", "monthly", "0.5"),
    ]
    for item in published_items:
        published = parse_dt(item["published_at"] or item["publish_at"])
        entries.append((item["canonical_url"], published.date().isoformat(), "monthly", "0.8"))

    lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    seen = set()
    for url, lastmod, changefreq, priority in entries:
        if url in seen:
            continue
        seen.add(url)
        lines.extend([
            "  <url>",
            f"    <loc>{escape(url)}</loc>",
            f"    <lastmod>{lastmod}</lastmod>",
            f"    <changefreq>{changefreq}</changefreq>",
            f"    <priority>{priority}</priority>",
            "  </url>",
        ])
    lines.extend(["</urlset>", ""])
    SITEMAP_PATH.write_text("\n".join(lines), encoding="utf-8")

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="validate queue without publishing")
    args = parser.parse_args()

    data = load_queue()
    validate_common(data)
    if args.check:
        print(f'validated {len(data["items"])} queue items')
        return 0

    now = now_utc()
    due = []
    for item in data["items"]:
        when = parse_dt(item["publish_at"]).astimezone(timezone.utc)
        if item["approved"] is True and item["status"] == "scheduled" and when <= now:
            due.append(item)

    if not due:
        print("no due releases")
        return 0

    # Validate the whole due set before changing any file.
    paths = {item["id"]: validate_due(item) for item in due}

    for item in due:
        source, dest = paths[item["id"]]
        dest.parent.mkdir(parents=True, exist_ok=True)
        published_at = now.astimezone(parse_dt(item["publish_at"]).tzinfo)
        dest.write_text(render_article(source, item, published_at), encoding="utf-8")
        item["status"] = "published"
        item["published_at"] = published_at.isoformat()

    published_items = [i for i in data["items"] if i["status"] == "published"]
    published_items.sort(
        key=lambda i: parse_dt(i["published_at"] or i["publish_at"]),
        reverse=True,
    )

    rebuild_index(published_items)
    rebuild_feed(published_items, now)
    rebuild_sitemap(published_items, now)
    QUEUE_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print("published:", ", ".join(i["id"] for i in due))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
