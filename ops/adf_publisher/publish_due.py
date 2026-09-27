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

def render_cards(items: list[dict]) -> str:
    cards = []
    for item in items:
        published = parse_dt(item["published_at"] or item["publish_at"])
        date_label = published.strftime("%d %b %Y").upper()
        cards.append(
            f'<a class="card" href="{escape(relative_href(item), quote=True)}">\n'
            f'  <div class="kicker">{escape(item["series"])}</div>\n'
            f'  <h2>{escape(item["title"])}</h2>\n'
            f'  <p>{escape(item["description"])}</p>\n'
            f'  <div class="meta">{date_label} · {escape(item["topic"])}</div>\n'
            f'</a>'
        )
    return "\n".join(cards)

def rebuild_index(published_items: list[dict]) -> None:
    template = INDEX_TEMPLATE_PATH.read_text(encoding="utf-8")
    INDEX_PATH.write_text(
        template.replace("{{CARDS}}", render_cards(published_items)),
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
            '</item>',
        ])
    lines.extend(['</channel>', '</rss>', ''])
    FEED_PATH.write_text("\n".join(lines), encoding="utf-8")

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
    QUEUE_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print("published:", ", ".join(i["id"] for i in due))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
