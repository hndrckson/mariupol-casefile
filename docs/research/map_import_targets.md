# Map and Geospatial Import Targets

## Best Destruction-Map Import Path

1. Start with the HRW/SITU/Truth Hounds "Our City Was Gone" report as the canonical Mariupol destruction source.
2. Inspect public report assets for any explicitly linked data supplements, tables, map layer downloads, or methodology appendices.
3. If structured layers are not publicly downloadable, contact HRW/SITU/Truth Hounds for permission to use building-level or neighborhood-level layers.
4. Ingest public report pages first as `ngo_report_import` and `url_capture`, then ingest approved geospatial exports as `destruction_map_import`.
5. Cross-reference with UNOSAT/Copernicus satellite products and OSM/HOT building footprints for basemap/context layers.

## Candidate Import Layers

| Layer | Preferred Source | Connector | Expected Format | Status |
|---|---|---|---|---|
| Building-level damage points/polygons | HRW/SITU/Truth Hounds | destruction_map_import | GeoJSON/CSV/vector tiles if licensed | Permission/public-data check required |
| Mariupol building damage assessment | UNOSAT product 3300 | satellite_reference_import | Product page/PDF; inspect for downloadable geodata | Named public source verified 2026-07-03 |
| Azovstal industrial site building damage assessment | UNOSAT product 3358 | satellite_reference_import | Product page/PDF; inspect for downloadable geodata | Named public source verified 2026-07-03 |
| Livoberezhnyi District damage overview | HDX catalog entry for UNOSAT product | satellite_reference_import | PDF/catalog metadata | Public catalog target verified 2026-07-03 |
| Public open-source destruction/victim points | MariupolDestruction.com Google My Maps | destruction_map_import, geojson_import | Public embed-derived CSV/GeoJSON | Captured 4,895 features; needs corroboration and privacy review before publication |
| Neighborhood/zone destruction estimates | HRW/SITU/Truth Hounds; UNOSAT | destruction_map_import | GeoJSON/KML/CSV/PDF-derived table | Public report available; data layer unknown |
| Satellite damage rasters/maps | UNOSAT, Copernicus EMS, Maxar/Planet writeups | satellite_reference_import | PDF/GeoTIFF/raster screenshots | Public-product search required |
| Building footprints | OSM/HOT Export Tool | geojson_import | GeoJSON/SHP/KML | Public export available |
| Incident points | OSCE/OHCHR/Amnesty/AP/BBC/local media | csv_geocoder | CSV with confidence radius | Manual extraction/geocoding required |
| Demolition/reconstruction tracking | Mediazona/Vertical52, FT | url_capture/news_article_import | HTML/interactive map/manual CSV if permission granted | License/permission required for layers |
| Official city locations | Mariupol City Council/I Mariupol/Mariupol Reborn | url_capture/csv_geocoder | HTML/CSV/manual table | Public URLs first |

## Proposed Geometry Schema

```csv
case_id,source_name,source_url,source_date,event_date_start,event_date_end,geometry_type,latitude,longitude,geometry_geojson,address,admin_area,damage_class,confidence,confidence_radius_m,method,license,notes
```

## Damage Classification Draft

| Class | Meaning | Compatible Source Mapping |
|---|---|---|
| destroyed | Building or object assessed as destroyed or beyond repair | HRW/SITU, UNOSAT, Copernicus, official municipal data |
| severe_damage | Major structural damage visible or reported | HRW/SITU, satellite analysis, verified media |
| moderate_damage | Partial/visible damage but not destroyed | Satellite/visual reports |
| affected_area | Area-level destruction estimate without building-level certainty | Report maps and satellite products |
| demolished_after_occupation | Building removed/demolished during occupation/reconstruction | Mediazona/FT/official occupation-source contradiction layer |
| reconstructed_or_new_build | New or repaired structure after damage | Mediazona/FT/official statements; label separately from original damage |
| unverified_claim | Claim requiring corroboration | Public social, local reports, denial narratives |

## Import QA Rules

- Preserve each source URL and access date on every imported row.
- Keep source geometry separate from derived/geocoded geometry.
- Store uncertainty radius for geocoded incidents and approximate report-map extraction.
- Do not merge Russian official denial claims into evidence layers; store them as contradiction-model claims.
- Never infer building damage from OSM footprints alone.
- For satellite imagery, store citation and license status; do not embed commercial imagery unless licensed.

## Partner Outreach Targets

| Partner | Ask |
|---|---|
| HRW | Permission to ingest report tables, appendices, and any Mariupol damage map layers. |
| SITU Research | Structured map export, methodology metadata, and reuse terms. |
| Truth Hounds | Public/partner-safe incident exports and evidence schema guidance. |
| UNOSAT/UNITAR | Confirmation of Mariupol geodata availability and reuse terms. |
| Copernicus EMS | Mariupol or Donetsk-oblast activation products and vector download guidance. |
| Mediazona/Vertical52 | Permission to use demolition/reconstruction map layers or derived metadata. |
| Mariupol City Council/Mariupol Reborn | Official public datasets, page-owner social exports, and archive links. |
