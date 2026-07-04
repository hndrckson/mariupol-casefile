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
- Real Leaflet map workspace using the captured MariupolDestruction public lead dataset.
- Timeline, incidents, Evidence Vault, Legal Matrix, Contradictions, Report Builder, Imports/Connectors, and Settings views.
- Inspector panel for incidents, evidence, legal elements, connectors, reports, contradictions, and map features.
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

The research inventory was refreshed on 2026-07-03 with named UNOSAT/HDX source targets, official Meta access paths, RD4U status notes, and source-bound legal cautions.

## QA

Design QA artifacts:

- `design-qa.md`
- `docs/qa/implementation-dashboard-1280x720.png`
- `docs/qa/dashboard-reference-vs-implementation.png`

Final QA result: passed.
