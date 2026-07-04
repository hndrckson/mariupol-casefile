# Research Gaps and Blockers

## Immediate Gaps

| Gap | Why It Matters | Next Step |
|---|---|---|
| HRW/SITU/Truth Hounds structured destruction data availability | This is the likely best building-level source for Mariupol destruction. | Inspect public report assets; contact HRW/SITU/Truth Hounds for approved GeoJSON/CSV/layer exports. |
| UNOSAT/Copernicus Mariupol-specific product inventory | Needed for independent satellite cross-check. | Partially resolved 2026-07-03: UNOSAT products 3300 and 3358 plus an HDX Livoberezhnyi catalog entry are named targets. Continue Copernicus EMS search and inspect UNOSAT downloads/license terms. |
| Exact Facebook page URLs | Search result URLs are not evidence targets. Exact official public page URLs must be confirmed. | Verify via official websites first, then normal web search; prefer page-owner export. |
| Public Telegram channel list | Useful for official update timelines but high provenance risk. | Confirm no-login public channels and owner identity; archive message URLs only. |
| Mediazona/FT map layer licensing | Demolition/reconstruction layers could be valuable but may be copyrighted or paywalled. | Request permission or use article-level citations only. |
| Ukrainian official municipal archive structure | Public local documentation may be fragmented after occupation/displacement. | Crawl manually by category/date from official portals; preserve source URLs. |
| Local Mariupol cultural/heritage archives | Cultural destruction may need separate institutions and datasets. | Identify museum/library/theatre/archive institutions in exile and public loss reports. |
| Russian denial narrative chronology | Needed for contradiction modeling, but should not pollute evidence layers. | Build separate claim table with source labels, timestamps, and rebuttal links. |
| Licensing matrix | Import readiness depends on reuse terms, not just public access. | Add source-level license/terms fields before any automated ingest. |
| RD4U claim-category status | Claims framework changed after the original research pass. | Add RD4U as reparations/claims context only; do not ingest private claims or imply public access to claim evidence. |

## Blockers

| Blocker | Impact | Resolution |
|---|---|---|
| Facebook/Telegram platform restrictions | Prevents automated scraping or bulk collection. | Use Graph API approved access, page-owner exports, or manual lawful archive imports. |
| Partner-held evidence | High-quality NGO data may not be public. | Outreach to HRW, SITU, Truth Hounds, CIR, Mariupol City Council. |
| Commercial satellite imagery licenses | Public articles may show imagery without granting reuse. | Store citations; obtain imagery license or use public UN/Copernicus derivatives. |
| Paywalled media investigations | Limited reuse and access. | Use citations/metadata; request permission where map layers matter. |
| Sensitive personal data | Victim/witness data may be legally and ethically restricted. | Build review gates and public/private separation before ingestion. |

## Partner-Outreach Targets

| Target | Request |
|---|---|
| Human Rights Watch | Data supplement availability, map-layer reuse terms, citation preferences. |
| SITU Research | Mariupol spatial layers, methodology metadata, permissible export formats. |
| Truth Hounds | Public-safe incident schema, source trust model, and partner data-sharing path. |
| Mariupol City Council | Official public archives, social page owner export, map/damage registries available for public use. |
| Mariupol Reborn / I Mariupol | Public communications archive and page-owner export. |
| UNOSAT/UNITAR | Mariupol product IDs, geodata formats, and reuse terms. |
| Copernicus EMS | Ukraine/Mariupol emergency product availability. |
| Mediazona/Vertical52 | Permission to use demolition/reconstruction datasets. |
| CIR Eyes on Russia | Mariupol geolocated archive export or research access. |

## Connector Build Priority

1. `legal_document_import` for ICC, OSCE, OHCHR, Ukrainian official sources.
2. `ngo_report_import` for HRW/SITU/Truth Hounds, Amnesty, Bellingcat/CIR-style sources.
3. `destruction_map_import` for approved Mariupol damage layers.
4. `geojson_import` and `kml_import` for OSM, UNOSAT, Copernicus, and partner exports.
5. `url_capture` for official portals, media investigations, and contradiction claims.
6. `csv_geocoder` for manually extracted incident/location tables.
7. `facebook_admin_export` and `facebook_public_page_authorized` after page-owner or API approval.
8. `manual_social_archive` for lawful public social exports supplied by users or partners.

## Research Notes

- The build should separate source capture, evidence verification, legal characterization, and public presentation.
- Every imported source should carry: source URL, source type, access date, language, license/terms, reliability tier, and verification status.
- The first app prototype should not depend on Facebook scraping. Social ingestion should be a later connector with explicit authorization checks.
- Russian official denial sources should be ingested as claims for contradiction modeling, never as neutral evidence.
