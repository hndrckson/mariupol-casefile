# Legal Source Pack

Status: initial public-source pack identified. No documents have been downloaded or ingested in this pass.

## Core International Legal Sources

| Source | URL | Scope | Status |
|---|---|---|---|
| ICC Situation in Ukraine | https://www.icc-cpi.int/situations/ukraine | Public ICC situation page, cases, warrants, statements, procedural updates | Ready for legal_document_import |
| ICC news and statements | https://www.icc-cpi.int/news | Public prosecutor/court announcements | Ready; filter for Ukraine/Mariupol relevance |
| OSCE ODIHR Moscow Mechanism report on Ukraine | https://www.osce.org/odihr/515868 | Expert mission report on violations of IHL/IHRL, including Mariupol incidents | Ready |
| OHCHR Ukraine country page | https://www.ohchr.org/en/countries/ukraine | Official UN human-rights reporting and statements | Ready |
| OHCHR HRMMU Ukraine | https://ukraine.ohchr.org/ | Ukraine monitoring reports | Ready |
| UN Human Rights Council Ukraine materials | https://www.ohchr.org/en/hr-bodies/hrc | Council updates and investigative reporting context | Ready; requires filtering |
| ICJ Ukraine v. Russian Federation | https://www.icj-cij.org/case/182 | State responsibility and provisional measures context | Ready; background only |
| Council of Europe Register of Damage | https://rd4u.coe.int/ | Damage claims framework for Ukraine | Ready; no private claims ingestion |

## Ukrainian Official Legal Sources

| Source | URL | Scope | Status |
|---|---|---|---|
| Prosecutor General of Ukraine | https://gp.gov.ua/ | War-crimes announcements, case updates, official statements | Ready |
| War Crimes portal | https://warcrimes.gov.ua/ | Public reporting portal and evidence-intake information | Ready for informational import only |
| Ministry of Justice of Ukraine | https://minjust.gov.ua/ | Legal policy and international claims context | Ready |
| Diia damaged property services | https://diia.gov.ua/services/categories/hromadyanam/neruhomist | Damaged-property reporting process | Ready as context, not evidence feed |
| Mariupol City Council | https://mariupolrada.gov.ua/ | Public municipal documentation and statements | Ready |

## Incident-Specific Legal and Investigative Anchors

| Incident/Theme | Source | URL | Notes |
|---|---|---|---|
| Citywide destruction | HRW/SITU/Truth Hounds | https://www.hrw.org/report/2024/02/08/our-city-was-gone/russias-devastation-mariupol-ukraine | Primary legal/evidentiary report target. |
| Mariupol theatre strike | Amnesty International | https://www.amnesty.org/en/latest/news/2022/06/ukraine-deadly-mariupol-theatre-strike-a-clear-war-crime-by-russian-forces-new-investigation/ | Clear war-crime allegation and methodology. |
| Mariupol theatre, maternity hospital, siege | OSCE Moscow Mechanism | https://www.osce.org/odihr/515868 | International expert legal analysis. |
| Civilian casualties and detention/occupation | OHCHR/HRMMU | https://ukraine.ohchr.org/ | Official UN monitoring caveats. |
| Deportation/transfer and broader Ukraine cases | ICC | https://www.icc-cpi.int/situations/ukraine | Public warrants and case materials; not all are Mariupol-specific. |

## Legal Metadata Schema

```csv
document_id,source_name,source_url,issuing_body,publication_date,language,document_type,legal_domain,covered_period,covered_location,incident_tags,alleged_violations,procedural_status,download_url,access_date,license_or_terms,notes
```

## Legal Domains

| Domain | Description |
|---|---|
| IHL | International humanitarian law: distinction, proportionality, precautions, siege, attacks on civilians/civilian objects. |
| IHRL | International human-rights law: right to life, detention, displacement, occupation rights. |
| ICL | International criminal law: war crimes, crimes against humanity, command responsibility. |
| Reparations/claims | Damage claims, restitution, compensation, and evidence-preservation frameworks. |

## Handling Rules

- Store official legal documents as immutable source records with download URL and access date.
- Preserve legal posture: allegation, finding, warrant, procedural filing, judgment, or policy statement.
- Do not convert NGO conclusions into court findings.
- Keep Russian official denial narratives in a separate contradiction/claims table, not in the legal source pack except as cited adversarial statements.
- Avoid personal data ingestion from victim or witness submissions unless explicitly public, necessary, and legally cleared.

