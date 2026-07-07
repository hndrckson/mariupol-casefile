# Mariupol Casefile

Standalone evidence-workspace v0 for Mariupol siege, destruction, displacement, occupation, and accountability research.

## Local Preview

Serve the workspace root and open:

```text
http://127.0.0.1:8765/dashboard/
```

The current workspace already has a local server listening on port 8765.

## Implemented V0

- Dashboard with incident, evidence, map-feature, contradiction, legal-coverage, import, gap, and decay-risk surfaces.
- Case Files route with curated source-backed cases tying incidents, evidence, legal elements, contradictions, and original-map categories together.
- Resources route with the original MariupolDestruction map/source sections, map-layer counts, sensitivity posture, source register, and case/evidence/legal coverage.
- Real Leaflet map workspace using the captured MariupolDestruction public lead dataset.
- Timeline, incidents, Evidence Vault, Legal Matrix, Contradictions, Report Builder, Imports/Connectors, and Settings views.
- Inspector panel for incidents, evidence, legal elements, connectors, reports, contradictions, and map features.
- Mobile app shell with internal scroll panes, burger navigation, scrollable chip/tool rows, and route-specific map sizing.
- PWA manifest, local app icons, local Lucide bundle, and service worker cache shell.
- File-import flow for GeoJSON/JSON/CSV/KML candidate layers.
- Report exports for Markdown, HTML, evidence bundle JSON, and evidence CSV.
- Conservative legal posture: genocide indicators are tracked as evidence coverage, not as legal conclusions.

## Research Inventory

The pre-build research prompt outputs live in `docs/research/`:

- `source_inventory.md`
- `connector_targets.csv`
- `map_import_targets.md`
- `facebook_public_sources.md`
- `legal_source_pack.md`
- `research_gaps.md`
- `database_fill_plan.md`
- `deep_database_research.md`

The research inventory was refreshed on 2026-07-03 with named UNOSAT/HDX source targets, official Meta access paths, RD4U status notes, and source-bound legal cautions.

The first deep database fill pass was added on 2026-07-07. It keeps MariupolDestruction.com as the original backbone lead source, then layers in curated case/evidence/source records from HRW/SITU/Truth Hounds, UNOSAT, OHCHR, OSCE, ICC, Amnesty, GRC, AP/FRONTLINE, MSF, RD4U, and official Ukrainian documentation targets. The current overlay exposes 14 source/resource collections, including the original website section index and the 11 original-map layer categories.

## QA

Design QA artifacts:

- `design-qa.md`
- `docs/qa/implementation-dashboard-1280x720.png`
- `docs/qa/dashboard-reference-vs-implementation.png`
- `docs/qa/implementation-map-1280x720.png`
- `docs/qa/mobile-dashboard-390x844.png`
- `docs/qa/mobile-menu-open-390x844.png`
- `docs/qa/mobile-map-390x844.png`
- `docs/qa/casefiles-route-1280x720.png`
- `docs/qa/casefiles-route-mobile-390x844.png`
- `docs/qa/resources-route-1280x720.png`
- `docs/qa/resources-route-mobile-390x844.png`

Final QA result: passed.
