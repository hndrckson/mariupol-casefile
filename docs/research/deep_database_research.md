# Deep Database Research Pass - 2026-07-07

This pass turns the Mariupol Casefile from a demo seed into a source-backed v1 casefile database layer. It does not claim to exhaust every Mariupol resource. It prioritizes a credible backbone: original-site leads, high-transparency NGO/spatial investigations, UN/OSCE/ICC legal context, media field documentation, humanitarian reporting, and claims/remedy context.

## Inserted Database Layer

The new overlay lives in `dashboard/casefile-extra-data.js` and is loaded after the original seed. It adds:

- 8 curated case files.
- 10 additional source records.
- 20 additional evidence records.
- 3 additional incident/pattern records.
- 2 additional contradiction records.
- 3 additional legal matrix entries.
- A research import run and new source gaps.

The original MariupolDestruction capture remains the core map lead source:

- 4,895 extracted original-map features.
- 4,837 point features shown in the map workspace.
- 10,593 locally downloaded public hosted image references.
- Source-owner export and reuse terms still need outreach before treating the map as a production evidence feed.

## Source Hierarchy

| Tier | Source | Role in database |
|---|---|---|
| A | HRW / SITU / Truth Hounds, "Our City Was Gone" | Citywide destruction, spatial methodology, legal framing. |
| A | SITU Research, "Beneath the Rubble" | Spatial/forensic methodology and partner-data target. |
| A | UNOSAT product 3300 and 3358 | Satellite damage anchors for Mariupol and Azovstal. |
| A | OHCHR / HRMMU Ukraine reporting | Casualty caveats, access restrictions, occupation and monitoring context. |
| A | OSCE Moscow Mechanism report | IHL/IHRL legal context for key Mariupol incidents. |
| A | ICC Situation in Ukraine | Court/procedural context; not treated as a Mariupol-specific finding. |
| A | Amnesty theatre investigation | Drama Theatre exemplar case evidence. |
| A | Global Rights Compliance, "The Hope Left Us" | Siege, starvation, and essential-infrastructure legal theory. |
| A | Register of Damage for Ukraine | Remedies/claims framework; individual claims are not public evidence rows. |
| B | Mariupol City Council / Mariupol Justice | Official Ukrainian documentation and justice pathway context. |
| B | Associated Press and FRONTLINE/AP "20 Days in Mariupol" | Field reporting and documentary metadata, copyright-limited. |
| B | Medecins Sans Frontieres | Medical and humanitarian access reporting. |
| C | MariupolDestruction.com original map | Backbone public lead index requiring corroboration and privacy review. |

## Case Files Added

| Case | Status | Core purpose |
|---|---|---|
| Drama Theatre strike | Exemplar case | Strongly sourced incident file with casualty and denial contradictions. |
| Maternity Hospital strike | Exemplar case | Medical-facility attack file anchored to OSCE/AP/OHCHR-type sources. |
| Citywide destruction and residential damage | Backbone case | Original map plus HRW/SITU/UNOSAT corroboration path. |
| Siege conditions and humanitarian deprivation | Pattern case | Humanitarian access, medical collapse, and starvation/legal-theory file. |
| Azovstal assault and siege endpoint | Complex context | Industrial-site endpoint with mixed civilian/military context. |
| Casualty, burial, and cemetery evidence | Restricted/public summary only | Sensitive death/burial rows with privacy restrictions. |
| Filtration, displacement, and transfer | Under review | Displacement and transfer context with court/legal links. |
| Damage claims and remedies context | Context case | RD4U and official claims/remedy framing without individual claims data. |

## Data-Quality Rules

- Original-map records are leads until corroborated.
- Sensitive burial, victim, witness, and claims records stay summarized in public mode.
- Media sources are stored as metadata and citations, not copied article bodies.
- Genocide-related fields remain "indicator coverage" and "missing evidence" surfaces, not conclusions.
- Command responsibility is separate from incident attribution unless a source explicitly supports it.

## Next Research Sprint

1. Request official export and reuse terms from the MariupolDestruction map owner.
2. Build a row-level corroboration table joining original map features to HRW/SITU, UNOSAT, OHCHR/OSCE, and Mariupol Justice sources.
3. Add a redaction layer for grave/victim, survivor, witness, and claims-related records.
4. Replace AP/PBS metadata placeholders with exact article/documentary segment citation rows where licensing allows.
5. Add official Ukrainian prosecutor/court updates and public Mariupol Justice case pages as separate source rows.
