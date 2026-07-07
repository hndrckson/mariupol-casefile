# MariupolDestruction.com Capture Note

Capture date: 2026-06-29

## Source

| Field | Value |
|---|---|
| Website | https://www.mariupoldestruction.com/home |
| Map page | https://www.mariupoldestruction.com/map |
| Public My Maps viewer | https://www.google.com/maps/d/viewer?mid=1n0elDNzvK4vQYmWxCn2792ljSXNJK4x3 |
| Public My Maps embed | https://www.google.com/maps/d/embed?mid=1n0elDNzvK4vQYmWxCn2792ljSXNJK4x3 |
| Map ID | `1n0elDNzvK4vQYmWxCn2792ljSXNJK4x3` |
| Project author named on map | Vitaly Shtutman / Штутман Виталий |
| Submission email listed on site | `t9036086711@gmail.com` |
| Telegram bot listed on site | https://telegram.me/MariupolDestructionBot |
| Submission form | https://docs.google.com/forms/d/e/1FAIpQLSeL3BsCrUyPSCwS1ezayFNcYaOPgOzVdHTai-8Yq36eAmV_Gw/viewform |

## Captured Files

| File | Purpose |
|---|---|
| `data/raw/mariupoldestruction/home.html` | Public website homepage HTML capture. |
| `data/raw/mariupoldestruction/map.html` | Public website map page HTML capture. |
| `data/raw/mariupoldestruction/home_links.json` | Link extraction from homepage. |
| `data/raw/mariupoldestruction/google_mymaps_embed.html` | Public Google My Maps embed HTML containing serialized map data. |
| `data/raw/mariupoldestruction/google_mymaps_viewer.html` | Public Google My Maps viewer HTML capture. |
| `data/raw/mariupoldestruction/apps_script_response.html` | Public Google Apps Script endpoint response; returned empty/1-byte response during this pass. |
| `data/processed/mariupoldestruction/mariupol_destruction_mymaps.csv` | Normalized feature table extracted from public My Maps embed. |
| `data/processed/mariupoldestruction/mariupol_destruction_mymaps.geojson` | GeoJSON FeatureCollection extracted from public My Maps embed. |
| `data/processed/mariupoldestruction/mariupol_destruction_mymaps_summary.json` | Extraction counts, layer list, and inferred class counts. |
| `data/processed/mariupoldestruction/mariupol_destruction_target_content.csv` | Per-target text/popup content export joined to map feature IDs. |
| `data/processed/mariupoldestruction/mariupol_destruction_target_content.jsonl` | JSONL version of per-target content with URL arrays preserved. |
| `data/processed/mariupoldestruction/mariupol_destruction_target_content_summary.json` | Per-target text/media extraction summary. |
| `data/processed/mariupoldestruction/mariupol_destruction_media_manifest.csv` | Per-image and per-video-link manifest joined to feature ID, layer, title, and coordinates. |
| `data/raw/mariupoldestruction/media/images/` | Local downloaded image files from public My Maps hosted-image URLs. |
| `data/raw/mariupoldestruction/media/mariupol_destruction_image_download_manifest.csv` | Download manifest with local file path, status, byte count, and original URL. |
| `data/raw/mariupoldestruction/media/mariupol_destruction_image_download_summary.json` | Local image download summary. |
| `scripts/extract_mymaps.js` | Repeatable extractor for `_pageData` from the captured Google My Maps embed HTML. |
| `scripts/extract_mymaps_content.js` | Repeatable extractor for target popup text, descriptions, image URLs, and video links. |
| `scripts/download_mymaps_images.js` | Repeatable downloader for public My Maps hosted image URLs. |

## Extraction Results

| Metric | Count |
|---|---:|
| Total extracted features | 4,895 |
| Point features | 4,837 |
| LineString features | 58 |

## Target Text and Media Extraction

| Metric | Count |
|---|---:|
| Target content rows | 4,895 |
| Targets with image URLs | 3,762 |
| Targets with video links | 9 |
| Public hosted image URLs | 10,593 |
| Public video links | 9 |
| Local image files downloaded | 10,593 |
| Downloaded/existing image bytes | 3,180,458,988 |

The target content export preserves map target title, description text where present, coordinates, layer, inferred class, source URL, My Maps URL, image URL list, video URL list, and other source/project links. The media manifest expands image/video URLs one row per media item.

## Dashboard Resource Matrix

The dashboard now exposes the capture through `seed.resourceCollections` and the `Resources` route. It models the original map as a source archive, each inferred class as a source layer, and the website navigation/resources pages as original-site sections. Counts shown in the UI are source-capture counts for triage and corroboration planning; they are not final verified damage, casualty, or legal findings.

`scripts/build_map_feature_index.py` also derives a public `mapFeatureIndex` review sample from this capture. The generated dashboard overlay contains 300 source-bound rows selected by original layer and media/link density. High-sensitivity grave/victim and humanitarian rows use redacted public titles and rounded coordinates.

`scripts/build_database_fill.py` consumes that public review sample and generates the v0 database-fill overlay: 118 evidence-review packets, 30 incident-review clusters, 118 claim rows, and one contradiction set. These generated rows keep `SRC-MARIUPOL-DESTRUCTION` provenance and lead-review status; they do not expose raw sensitive titles or convert map leads into verified findings.

## Inferred Classes

These classes are inferred from layer names and explicit title text. They should be treated as import labels, not final legal findings.

| Class | Count |
|---|---:|
| residential_damage | 2,259 |
| grave_or_victim | 1,140 |
| battle_or_route | 405 |
| demolished_after_occupation | 395 |
| commerce_or_hotel | 259 |
| humanitarian_problem | 149 |
| school | 110 |
| public_institution | 61 |
| hospital_or_clinic | 47 |
| culture_or_sport | 43 |
| church | 27 |

## Map Layers Found

| Layer ID | Layer Name |
|---|---|
| `njTOiP47MDE` | Жилые дома. Видео и фото разрушенных домов Мариуполя / Residential buildings. Video and photos of destroyed houses in Mariupol |
| `q-xaLC-t1bI` | Могилы (137) и места гибели и ранений (более 600 мест) / Graves and places of death and injury (Over 600 places) |
| `4kC8XkOEing` | Выживание в Мариупольском аду. Места гуманитарных проблем жителей / Places of humanitarian problems of residents |
| `KrOpOzTuT5I` | Бои в городе / Fighting in the city |
| `7F9FVlzeoRE` | Школы, детские сады, институты и колледжи / Destroyed educational institutions |
| `zuPyjcilW0A` | Мед. учреждения Мариуполя / Hospitals |
| `v7s54XqXcXY` | Рынки, магазины, кафе и гостиницы / Markets, shops, cafes and hotels |
| `cPPoRUv24Jw` | Церкви Мариуполя / Churches |
| `13VPnJnxXdw` | Кинотеатры, ДК, музеи и спорт / Cinemas, cultural centers, museums and stadiums |
| `bH5iAa5kyEk` | Гос. учреждения Мариуполя / Public institutions |

## Facebook/Public Social Status

No Facebook URL was found in the captured homepage, map page, or public My Maps embed during this pass. The site does list a Telegram bot, a Google Form, and an email address for submissions.

Recommended public-social path:

- Do not scrape Facebook login surfaces.
- If a matching Facebook page is later confirmed, use `facebook_public_page_authorized` only with approved Meta access or `facebook_admin_export` from the page owner.
- For this source, prioritize the public website, public My Maps embed, Google Form metadata, email contact, and Telegram bot as outreach/source-owner paths.

## KML Export Status

The standard public Google My Maps KML endpoints returned HTTP 403 to the command-line client during this pass:

- `https://www.google.com/maps/d/kml?mid=1n0elDNzvK4vQYmWxCn2792ljSXNJK4x3&forcekml=1`
- `https://www.google.com/maps/d/u/0/kml?mid=1n0elDNzvK4vQYmWxCn2792ljSXNJK4x3&forcekml=1`

Because the public embed HTML contained serialized feature data, the current import path uses `public_google_mymaps_embed_capture` rather than KML export. For production ingestion, request an official KML/CSV/GeoJSON export from the map owner.

## Compliance and Evidence Notes

- The capture used publicly accessible website and My Maps embed HTML.
- The extractor stores feature titles, coordinates, layer names, map ID, source URL, and access mode.
- The resulting data should be treated as an open-source lead set until corroborated.
- Victim/grave-related rows may contain sensitive personal information in titles; any public display needs a privacy review.
- Media references inside titles such as "photo" or "video" were not downloaded.
- Public My Maps hosted images were downloaded locally in this pass. Re-publication still requires legal/privacy review and source-owner permission or a clear public-interest/legal basis.
