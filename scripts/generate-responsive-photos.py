#!/usr/bin/env python3
"""Generate card/banner/slider previews without changing original project photos.

Run from any directory with Python 3, Pillow, and Node installed:
    python3 scripts/generate-responsive-photos.py
The site build uses the checked-in previews; Python is not a build dependency.
Use --missing-only to add preview sizes without regenerating existing files.
"""

import argparse
from io import BytesIO
import json
from pathlib import Path
import subprocess

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
OUTPUT = PUBLIC / "images" / "responsive"
HELPER = ROOT / "src" / "responsive-photos.js"
WIDTHS = (240, 480, 800)
MAX_PRIORITY_WIDTH = 1536
PRIORITY_QUALITY = 82

# Responsive previews preserve original photos as fallbacks at every entry point.
PHOTO_SELECTION = r"""
import { business, services, servicesPageServices, projects } from './src/data.js';
const prioritySources = new Set([
  '/images/hero-asphalt-paving-20261025.jpg',
  '/images/hero-sharp.webp',
  '/images/services-hero.webp',
  '/images/marking-job.webp',
]);
const sources = new Set(prioritySources);
const priority = source => { if (source) { sources.add(source); prioritySources.add(source); } };
const sourceFor = s => s.homeImage || s.image;
for (const service of services.slice(1)) {
  priority(service.slideImage || service.homepageImage || sourceFor(service));
}
for (const service of servicesPageServices) {
  priority(service.homepageCards?.service?.src || service.homepageImage || sourceFor(service));
}
for (const project of projects.filter(p => p.images?.length)) {
  project.images.forEach(photo => priority(photo.src));
  const service = services.find(s => s.id === project.category);
  if (!service) continue;
  const linked = projects.find(p => (service.projectId ? p.id === service.projectId : p.category === service.id) && p.images?.length);
  priority(project.homepagePhoto?.src || (linked?.id === project.id
    ? service.homepageCards?.project?.src || service.homepageImage || sourceFor(service)
    : project.images[0].src));
}
for (const service of servicesPageServices) {
  sources.add(service.servicesPageImage?.src || sourceFor(service));
}
sources.add(business.contactPhotos.main.src);
business.contactPhotos.info.forEach(photo => sources.add(photo.src));
console.log(JSON.stringify({ sources: [...sources].sort(), prioritySources: [...prioritySources].sort() }));
"""

HELPER_FUNCTION = r'''
const escapeAttribute = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

const defaultPhotoSizes = '(min-width: 1304px) 580px, (min-width: 761px) calc((100vw - 96px) / 2), calc(100vw - 32px)';
const sourcePrefix = base => base.endsWith('/') ? base : `${base}/`;

const responsivePhotoSourceSet = (src, base) => {
  const photo = responsivePhotos[src];
  if (!photo) return '';
  const prefix = sourcePrefix(base);
  const stem = src.slice('/images/'.length).replace(/\.[^/.]+$/, '');
  const candidates = photo.widths.map(width => `${prefix}images/responsive/${stem}-${width}.webp ${width}w`);
  if (!photo.maxPreviewWidth && !photo.widths.includes(photo.originalWidth)) {
    candidates.push(`${prefix}${src.replace(/^\//, '')} ${photo.originalWidth}w`);
  }
  return candidates.join(', ');
};

/**
 * Return HTML attributes for responsive cards, banners and homepage slides.
 * Keep the original src/width/height on the img as a fallback.
 */
export function responsivePhotoAttributes(src, sizes = defaultPhotoSizes, base = '/') {
  const srcset = responsivePhotoSourceSet(src, base);
  return srcset ? `srcset="${escapeAttribute(srcset)}" sizes="${escapeAttribute(sizes)}"` : '';
}

/**
 * Configure responsive modal photos before assigning their original fallback.
 * The same candidate list is used by server-rendered HTML and live viewers.
 */
export function setResponsivePhoto(image, src, sizes = defaultPhotoSizes, base = '/') {
  const srcset = responsivePhotoSourceSet(src, base);
  if (srcset) {
    image.setAttribute('sizes', sizes);
    image.setAttribute('srcset', srcset);
  } else {
    image.removeAttribute('srcset');
    image.removeAttribute('sizes');
  }
  const fallback = /^\/(?!\/)/.test(src) ? `${sourcePrefix(base)}${src.slice(1)}` : src;
  image.src = new URL(fallback, image.ownerDocument.baseURI).href;
  return image;
}
'''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--missing-only", action="store_true",
                        help="Create new preview sizes while preserving existing preview files")
    args = parser.parse_args()
    selection = json.loads(subprocess.check_output(
        ["node", "--input-type=module", "-e", PHOTO_SELECTION], cwd=ROOT, text=True
    ))
    sources = selection["sources"]
    priority_sources = set(selection["prioritySources"])
    OUTPUT.mkdir(parents=True, exist_ok=True)
    manifest = {}
    original_bytes = 0
    variant_bytes = {width: 0 for width in WIDTHS}
    priority_bytes = 0
    written = 0
    for src in sources:
        source = PUBLIC / src.lstrip("/")
        original_bytes += source.stat().st_size
        with Image.open(source) as raw:
            photo = ImageOps.exif_transpose(raw).convert("RGB")
            widths = [width for width in WIDTHS if width < photo.width]
            priority_width = min(photo.width, MAX_PRIORITY_WIDTH) if src in priority_sources else None
            if priority_width is not None and priority_width not in widths:
                widths.append(priority_width)
            widths.sort()
            accepted_widths = []
            for width in widths:
                target = OUTPUT / f"{source.stem}-{width}.webp"
                priority_candidate = width == priority_width and width not in WIDTHS
                if not args.missing_only or not target.exists():
                    height = round(photo.height * width / photo.width)
                    preview = photo.resize((width, height), Image.Resampling.LANCZOS)
                    encoded = BytesIO()
                    preview.save(encoded, format="WEBP",
                                 quality=PRIORITY_QUALITY if priority_candidate else 88,
                                 method=6)
                    contents = encoded.getvalue()
                    # A priority candidate must save bytes; otherwise retain the
                    # original fallback instead of publishing a redundant file.
                    if priority_candidate and len(contents) >= source.stat().st_size:
                        target.unlink(missing_ok=True)
                        continue
                    if not target.exists() or target.read_bytes() != contents:
                        target.write_bytes(contents)
                        written += 1
                if priority_candidate and target.stat().st_size >= source.stat().st_size:
                    target.unlink()
                    continue
                accepted_widths.append(width)
                if width in variant_bytes:
                    variant_bytes[width] += target.stat().st_size
                if width == priority_width:
                    priority_bytes += target.stat().st_size
            manifest[src] = {"originalWidth": photo.width, "widths": accepted_widths}
            if priority_width in accepted_widths:
                manifest[src]["maxPreviewWidth"] = priority_width
    helper_contents = (
        "// Generated by scripts/generate-responsive-photos.py; original photos are preserved.\n"
        + "export const responsivePhotos = " + json.dumps(manifest, indent=2) + ";\n"
        + HELPER_FUNCTION
    )
    if not HELPER.exists() or HELPER.read_text(encoding="utf-8") != helper_contents:
        HELPER.write_text(helper_contents, encoding="utf-8")
    print(json.dumps({
        "photos": len(manifest), "originalBytes": original_bytes,
        "priorityPhotos": len(priority_sources), "priorityPreviewBytes": priority_bytes,
        "writtenPreviewFiles": written,
        "previewBytesByWidth": variant_bytes,
        "savedPercentByWidth": {str(width): round(100 * (1 - size / original_bytes), 1)
                                for width, size in variant_bytes.items()},
    }, indent=2))


if __name__ == "__main__":
    main()
