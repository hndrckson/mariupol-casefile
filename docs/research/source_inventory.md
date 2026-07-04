# Mariupol Casefile Source Inventory

Pre-build research inventory for a standalone Mariupol evidence workspace. This file catalogs source targets only; no ingestion, scraping, or app build is performed in this pass.

## Live Verification Addendum - 2026-07-03

Checked public web targets again before the v0 build. Confirmed:

- HRW/SITU/Truth Hounds published the Mariupol destruction investigation "Our City Was Gone" on 2024-02-08; keep it as the canonical NGO/spatial source target for the app.
- SITU's Mariupol project page is "Beneath the Rubble: Documenting Devastation and Loss in Mariupol"; use it as a partner/data-permission target, not an assumed open geodata feed.
- UNOSAT has Mariupol-specific product pages, including `products/3300` for a Mariupol building damage assessment and `products/3358` for Azovstal. HDX also indexes a UNOSAT Livoberezhnyi District damage overview map. These should move from generic gap to named import candidates.
- OSCE's first Moscow Mechanism expert report remains a legal anchor for IHL/IHRL, war crimes, and crimes-against-humanity analysis in Ukraine since 2022-02-24.
- Amnesty's "CHILDREN" theatre-strike investigation remains the incident anchor for the Drama Theatre memo, with casualty ranges handled as disputed and source-bound.
- OHCHR maintains a dedicated Mariupol update plus HRMMU reports; use them for official casualty caveats and access/occupation context.
- ICC's Ukraine situation page remains the legal source anchor for public case/warrant metadata; do not imply a Mariupol-specific ICC finding unless a cited ICC document says so.
- RD4U reported on 2026-04-30 that the Register had surpassed 45,000 recorded claims and opened additional claim categories. Use RD4U as claims-framework context, not as an evidence feed.
- Meta currently documents Page Public Content Access and the Meta Content Library/API as the compliant public-content paths. Facebook ingestion should stay disabled unless page-owner export, Graph API approval, or approved research access is available.

## Priority Source Targets

| Priority | Source | URL | Category | Import Value | Notes |
|---:|---|---|---|---|---|
| 1 | Human Rights Watch, SITU Research, Truth Hounds - "Our City Was Gone" | https://www.hrw.org/report/2024/02/08/our-city-was-gone/russias-devastation-mariupol-ukraine | NGO investigation; destruction mapping | High | Core source for building destruction, imagery analysis, witness evidence, legal framing, and incident chronology. Request/download any public data supplements if available. |
| 2 | SITU Research project materials on Mariupol | https://situ.nyc/research/projects | Geospatial/forensic investigation | High | Partner-quality spatial evidence workflow; likely requires manual capture or permission for underlying structured data. |
| 3 | Truth Hounds Mariupol documentation | https://truth-hounds.org/en/ | NGO investigation | High | Ukrainian documentation partner with witness and incident evidence. Treat non-public evidentiary data as partner-permission only. |
| 4 | UNOSAT / UNITAR Ukraine damage assessments | https://unosat.org/products | Satellite/geospatial analysis | High | Check for Mariupol-specific maps, PDFs, and geodata packages. If geodata is not public, use PDFs as satellite_reference_import. |
| 5 | OSCE Moscow Mechanism Ukraine reports | https://www.osce.org/odihr/515868 | Legal/investigative report | High | Includes analysis of attacks on Mariupol, civilian infrastructure, maternity hospital, and theatre. |
| 6 | OHCHR Ukraine civilian casualty and Mariupol updates | https://www.ohchr.org/en/countries/ukraine | UN/OHCHR reports | High | Use as legal and casualty context. Capture only official reports and statements. |
| 7 | ICC Situation in Ukraine | https://www.icc-cpi.int/situations/ukraine | ICC/legal source | High | Public arrest warrants, case pages, statements, and filings. Good legal_source_pack anchor. |
| 8 | Amnesty International - Mariupol theatre investigation | https://www.amnesty.org/en/latest/news/2022/06/ukraine-deadly-mariupol-theatre-strike-a-clear-war-crime-by-russian-forces-new-investigation/ | NGO investigation | High | Incident-specific source for theatre strike, with methodology and legal conclusions. |
| 9 | Associated Press / PBS Frontline - 20 Days in Mariupol and AP investigation pages | https://apnews.com/hub/russia-ukraine-war | Media investigation | Medium-high | Strong source for timeline, visual evidence, and named incident narratives. Copyright-sensitive; ingest metadata and summaries, not article bodies. |
| 10 | Mariupol City Council / Mariupol Reborn / I Mariupol official portals | https://mariupolrada.gov.ua/ | Ukrainian official documentation portal | Medium-high | Primary target for official announcements, reconstruction claims, victim lists where public, and public page links. |
| 11 | Mariupol Destruction and Victims Map | https://www.mariupoldestruction.com/map | Public Google My Maps destruction/victim archive | High | Captured public map embed and extracted 4,895 features to CSV/GeoJSON. See `docs/research/mariupoldestruction_capture.md`. |

## Destruction Maps

| Source | URL | Target Use | Access Mode | Format Notes |
|---|---|---|---|---|
| HRW/SITU/Truth Hounds "Our City Was Gone" interactive or report map assets | https://www.hrw.org/report/2024/02/08/our-city-was-gone/russias-devastation-mariupol-ukraine | Core destruction map import | Manual download, partner request, or URL capture | Look for CSV/GeoJSON/vector tiles/source-data endpoints only if publicly linked and permitted. Otherwise ingest report map screenshots and source citations. |
| Mariupol Destruction and Victims Map | https://www.mariupoldestruction.com/map | Public destruction/victim map import | Public My Maps embed capture; owner export preferred | Public embed serialized 4,895 features. KML endpoint returned 403 to command-line client; production should request official owner export. |
| UNOSAT products portal | https://unosat.org/products | Satellite damage reference | Manual PDF/geodata download | Search products for Mariupol, Donetsk oblast, Ukraine conflict damage assessments. |
| Liveuamap Ukraine archive | https://liveuamap.com/ | Event geolocation context | URL capture/manual export where permitted | Not a building-damage dataset; useful event layer and source pointers. |
| OpenStreetMap / HOT Export Tool | https://export.hotosm.org/ | Basemap and building footprint reference | Manual export | Use OSM building footprints as contextual geometry, not as damage evidence. |
| Copernicus EMS Mapping | https://emergency.copernicus.eu/mapping/list-of-components/EMSR | Satellite emergency mapping reference | Manual public product download | Search EMSR Ukraine activations for Mariupol-adjacent products; likely PDF/GPKG/SHP where public. |
| Mediazona / Vertical52 Mariupol demolition and reconstruction mapping | https://en.zona.media/ | Occupation-era demolition/rebuild comparison | URL capture/manual archive | Treat as media investigation; source map layers may not be reusable without permission. |
| Financial Times visual investigations on Mariupol reconstruction/demolition | https://www.ft.com/visual-and-data-journalism | Media map reference | URL capture/manual article archive | Often paywalled; use metadata and citations only unless licensed. |

## Building Damage Datasets

| Source | URL | Dataset Potential | Recommended Connector |
|---|---|---|---|
| HRW/SITU/Truth Hounds | https://www.hrw.org/report/2024/02/08/our-city-was-gone/russias-devastation-mariupol-ukraine | Highest probability for structured building-level damage estimates, methodology, imagery analysis, and source media references | destruction_map_import, ngo_report_import |
| UNOSAT | https://unosat.org/products | Satellite-derived damage polygons or maps if published for Mariupol | satellite_reference_import, geojson_import |
| Copernicus EMS | https://emergency.copernicus.eu/mapping/list-of-components/EMSR | Emergency mapping vector or raster packages when public | satellite_reference_import, geojson_import |
| OSM/HOT Export | https://export.hotosm.org/ | Building footprints for joins/geocoding only | geojson_import |
| Ukrainian official reconstruction/damage registries | https://diia.gov.ua/services/categories/hromadyanam/neruhomist | Claims/damaged-property reporting context | manual_upload, legal_document_import |

## GeoJSON/KML/CSV-Compatible Data Targets

| Data Type | Candidate Source | Import Path | Caveat |
|---|---|---|---|
| Building footprints | OSM/HOT Export | geojson_import | Not damage evidence; preserve OSM license attribution. |
| Damage polygons/points | UNOSAT/Copernicus/HRW-SITU if public | geojson_import, kml_import | Verify license and public download terms before ingestion. |
| Incident points | NGO reports, OSCE/OHCHR annexes, news investigations | csv_geocoder | Manual geocoding must preserve uncertainty radius and source quote limits. |
| Public official notices | Mariupol City Council, Mariupol Reborn, I Mariupol | url_capture/manual_upload | Capture metadata and URLs; avoid private personal data. |
| Social public-page posts | Page-owner exports, Graph API, approved research access, manual social archive | facebook_admin_export, facebook_public_page_authorized, manual_social_archive | No credential bypassing, login scraping, or automated collection against platform terms. |

## NGO Investigations

| Organization | URL | Mariupol Relevance |
|---|---|---|
| Human Rights Watch | https://www.hrw.org/ | Lead destruction report with SITU/Truth Hounds. |
| Truth Hounds | https://truth-hounds.org/en/ | Ukrainian documentation and war-crimes evidence collection. |
| Amnesty International | https://www.amnesty.org/en/location/europe-and-central-asia/ukraine/ | Theatre strike and broader war-crimes reporting. |
| Bellingcat | https://www.bellingcat.com/ | Open-source verification methodology; search for Mariupol-specific posts and source trails. |
| Center for Information Resilience / Eyes on Russia | https://www.info-res.org/ | OSINT archive and geolocated incident leads. |
| Forensic Architecture | https://forensic-architecture.org/ | Methodological reference; check if any Mariupol-specific investigation exists before citing as source. |
| Center for Spatial Technologies | https://spatialtech.info/ | Methodological peer for spatial war-damage analysis; check for Mariupol-specific work before ingestion. |

## UN, OSCE, ICC, and Legal References

| Source | URL | Use |
|---|---|---|
| OHCHR Ukraine country page | https://www.ohchr.org/en/countries/ukraine | Official human-rights reporting, casualty caveats, detention and occupation context. |
| OHCHR Human Rights Monitoring Mission in Ukraine | https://ukraine.ohchr.org/ | Ukraine-specific monitoring reports and updates. |
| OSCE ODIHR Moscow Mechanism reports | https://www.osce.org/odihr/515868 | Legal analysis of IHL/IHRL violations, including Mariupol incidents. |
| ICC Situation in Ukraine | https://www.icc-cpi.int/situations/ukraine | Public case pages, warrants, statements, and procedural materials. |
| ICJ Ukraine v. Russian Federation | https://www.icj-cij.org/case/182 | State responsibility context; not Mariupol-specific but relevant legal background. |
| Council of Europe Register of Damage | https://rd4u.coe.int/ | Claims and damage registry context; individual claims data is not public ingestion material. |

## Ukrainian Official Documentation Portals

| Source | URL | Notes |
|---|---|---|
| Mariupol City Council | https://mariupolrada.gov.ua/ | Official municipal source in exile; search for public archives, victim/missing-person notices, reconstruction statements, and page links. |
| Mariupol Reborn | https://remariupol.com/ | Reconstruction/recovery initiative; useful for official Ukrainian future-state planning and source-owner outreach. |
| I Mariupol support centers | https://imariupol.gov.ua/ | Public support-service documentation and community updates. |
| Diia damaged property service | https://diia.gov.ua/services/categories/hromadyanam/neruhomist | Official damaged-property reporting context; not a public evidence feed. |
| Prosecutor General of Ukraine | https://gp.gov.ua/ | Public war-crimes announcements and case updates. |
| War Crimes portal | https://warcrimes.gov.ua/ | Official reporting portal and public-facing evidence intake context. |

## Local Mariupol Archives

| Source | URL | Use |
|---|---|---|
| Mariupol City Council archive | https://mariupolrada.gov.ua/ | Official local records and announcements. |
| Local history/museum institutions in exile | Search via Mariupol official portals | Cultural heritage and institution-specific loss documentation. |
| Local media archives such as 0629 | https://www.0629.com.ua/ | Local reporting archive; verify current accessibility and copyright constraints. |
| Suspilne Donbas | https://suspilne.media/donbas/ | Regional public broadcaster; source incident articles and interviews by URL. |

## Public Telegram and Archive Mirrors

| Source Type | Target | Access Guidance |
|---|---|---|
| Public Telegram channels | Official Mariupol City Council, I Mariupol, Mariupol Reborn, Ukrainian authorities, local media | Use only channels accessible without login or through authorized export. Store message URLs, timestamps, and summaries. |
| Archive mirrors | Internet Archive, Archive.today-style captures, GDELT, OCCRP Aleph where applicable | Use for preservation and link rot mitigation; respect copyright and platform terms. |
| OSINT archives | CIR Eyes on Russia, Bellingcat source lists | Prefer official or repository-provided exports over scraping. |

## Satellite and Geospatial Analysis Writeups

| Source | URL | Use |
|---|---|---|
| UNOSAT | https://unosat.org/products | Satellite damage references and possible geodata. |
| Copernicus EMS | https://emergency.copernicus.eu/mapping/list-of-components/EMSR | Emergency mapping products. |
| Maxar public newsroom imagery | https://www.maxar.com/news-bureau | Image citations and source confirmation; underlying imagery license required for reuse. |
| Planet Labs newsroom | https://www.planet.com/pulse/ | Satellite writeups; license required for imagery reuse. |
| SITU Research | https://situ.nyc/research/projects | Spatial methodology and partner request target. |

## Media Investigations

| Source | URL | Use |
|---|---|---|
| Associated Press | https://apnews.com/hub/russia-ukraine-war | On-the-ground reporting, AP visual evidence, "20 Days in Mariupol" context. |
| PBS Frontline | https://www.pbs.org/wgbh/frontline/ | Documentary and investigative materials tied to AP. |
| Financial Times visual investigations | https://www.ft.com/visual-and-data-journalism | Reconstruction/demolition mapping references. |
| Mediazona | https://en.zona.media/ | Russian-language/English investigations into occupation, reconstruction, and demolition. |
| BBC Verify | https://www.bbc.com/news/reality_check | Verification pieces and chronology. |
| New York Times Visual Investigations | https://www.nytimes.com/spotlight/visual-investigations | Possible incident-level visual investigation references; license constrained. |

## Russian Official Denial Narratives

Use denial sources for contradiction modeling only, with source labels preserved and no evidentiary equivalence implied.

| Source | URL | Contradiction Use |
|---|---|---|
| Russian Ministry of Defence | https://eng.mil.ru/ | Official denial/alternative-causation statements. |
| Russian Ministry of Foreign Affairs | https://mid.ru/en/ | Diplomatic denial narratives and accusations against Ukraine. |
| TASS | https://tass.com/ | State-aligned narrative timeline and claim extraction. |
| RIA Novosti | https://ria.ru/ | Russian-language state narrative capture. |
| Kremlin | http://en.kremlin.ru/ | Presidential statements and official framing. |

## Initial Reliability Tiers

| Tier | Description | Examples |
|---|---|---|
| A | Official international legal/human-rights source or high-transparency NGO investigation with methodology | ICC, OHCHR, OSCE, HRW/SITU/Truth Hounds, Amnesty |
| B | Official Ukrainian source or well-established media investigation | Mariupol City Council, Prosecutor General, AP, BBC, FT, Mediazona |
| C | Public social/public-page material or archive mirror requiring provenance checks | Facebook public pages, Telegram public channels, Internet Archive captures |
| D | Adversarial or denial narrative source | Russian MOD/MFA, state-aligned outlets |
