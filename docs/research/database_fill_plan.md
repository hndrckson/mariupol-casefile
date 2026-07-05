# Database Fill Research Plan

Yes: the project should do an additional deep-research pass to fill the database, but it should be a separate source-bound ingestion sprint after the UX/PWA shell is stable.

## Guardrails

- Keep every row tied to a source URL, archived copy, collection method, timestamp, and confidence note.
- Treat genocide-related fields as evidence-coverage indicators, not legal conclusions.
- Do not ingest private or sensitive personal data without a privacy review.
- Prefer official APIs, published datasets, and page-owner exports over scraping brittle public pages.

## Priority Passes

1. MariupolDestruction enrichment: normalize every captured map feature, media reference, category, coordinate, and source note into `map_features` and `media_assets`.
2. Satellite and damage layers: import UNOSAT/HDX/OSM-style public layers into source-bound `map_features` with layer provenance.
3. Legal/documentary source pack: expand OHCHR, OSCE, HRW, Amnesty, AP/Reuters/Bellingcat-style source rows into `evidence`, `incidents`, and `legal_links`.
4. Local official and NGO records: add Ukrainian municipal, police/prosecutor, missing-person, evacuation, filtration, deportation, and victim-record leads where publicly sourceable.
5. Social-source preservation: use Meta Content Library, page-owner exports, and explicitly public Telegram/channel archives only with clear collection metadata.
6. Contradiction graph: encode conflicting claims, casualty estimates, attribution claims, and source limitations as `contradictions` rather than overwriting older records.

## Suggested Tables

- `sources`: publisher, access path, license/access status, archive URL, collection notes.
- `evidence`: source id, title, type, date, reliability tier, claim summary, privacy status.
- `incidents`: event title, date range, location, severity, confidence, linked evidence ids.
- `map_features`: coordinates, category, source layer, media count, confidence, import run id.
- `legal_links`: legal element, incident id, evidence ids, analysis note, caveat.
- `contradictions`: claim A, claim B, source ids, resolution status, reviewer notes.
- `ingestion_runs`: connector, timestamp, records added/updated, failures, reviewer.

## First Fill Target

Start with a 500-record curated pass:

- 250 map features with media/provenance checked.
- 100 evidence rows tied to major incidents.
- 40 incident rows with linked evidence.
- 60 legal-link rows across war crimes, crimes against humanity, and genocide-indicator coverage.
- 50 contradiction/source-limitation rows.

This gives the dashboard enough density for realistic product testing while keeping review and provenance manageable.
