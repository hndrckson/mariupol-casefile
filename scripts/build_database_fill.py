import json
import math
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MAP_INDEX = ROOT / "dashboard" / "casefile-map-index.js"
OUTPUT = ROOT / "dashboard" / "casefile-generated-fill.js"

EVIDENCE_QUOTAS = {
    "residential_damage": 40,
    "grave_or_victim": 18,
    "demolished_after_occupation": 14,
    "battle_or_route": 12,
    "humanitarian_problem": 10,
    "commerce_or_hotel": 8,
    "school": 5,
    "public_institution": 4,
    "hospital_or_clinic": 3,
    "culture_or_sport": 2,
    "church": 2,
}

INCIDENT_QUOTAS = {
    "residential_damage": 7,
    "grave_or_victim": 5,
    "demolished_after_occupation": 4,
    "battle_or_route": 4,
    "humanitarian_problem": 3,
    "commerce_or_hotel": 2,
    "school": 1,
    "public_institution": 1,
    "hospital_or_clinic": 1,
    "culture_or_sport": 1,
    "church": 1,
}

CATEGORY_META = {
    "residential_damage": {
        "code": "RES",
        "label": "Residential damage",
        "evidence_type": "Map feature packet",
        "incident_type": "Area destruction review cluster",
        "case_ids": ["CASE-CITYWIDE-DESTRUCTION", "CASE-CLAIMS-REMEDIES"],
        "legal_tags": ["Lead set", "Civilian objects", "Damage analysis"],
        "protected_site": "Residential areas",
        "severity": "High",
        "status": "Under review",
        "pii": "No",
        "confidence_base": 0.45,
        "confidence_cap": 0.64,
        "contradictions": ["CON-LOCATION", "CON-SOURCE-TIER", "CON-MAP-REVIEW-SCOPE"],
    },
    "grave_or_victim": {
        "code": "BURIAL",
        "label": "Burial/victim-sensitive",
        "evidence_type": "Sensitive map lead",
        "incident_type": "Burial and casualty review cluster",
        "case_ids": ["CASE-BURIALS-CASUALTY"],
        "legal_tags": ["Mass death indicator", "Sensitive site", "Privacy review"],
        "protected_site": "Sensitive burial or victim-associated locations",
        "severity": "High",
        "status": "Privacy review",
        "pii": "Sensitive",
        "confidence_base": 0.36,
        "confidence_cap": 0.54,
        "contradictions": ["CON-CASUALTY", "CON-PRIVACY", "CON-MAP-REVIEW-SCOPE"],
    },
    "demolished_after_occupation": {
        "code": "DEMO",
        "label": "Post-occupation demolition",
        "evidence_type": "Demolition map lead",
        "incident_type": "Demolition and evidence-preservation cluster",
        "case_ids": ["CASE-CITYWIDE-DESTRUCTION", "CASE-CLAIMS-REMEDIES"],
        "legal_tags": ["Post-occupation demolition", "Evidence preservation", "Property destruction"],
        "protected_site": "Civilian buildings and damaged property",
        "severity": "High",
        "status": "Under review",
        "pii": "No",
        "confidence_base": 0.43,
        "confidence_cap": 0.61,
        "contradictions": ["CON-LOCATION", "CON-SOURCE-TIER", "CON-MAP-REVIEW-SCOPE"],
    },
    "battle_or_route": {
        "code": "BATTLE",
        "label": "Battle or route",
        "evidence_type": "Route/timing map lead",
        "incident_type": "Battle-route sequencing cluster",
        "case_ids": ["CASE-CITYWIDE-DESTRUCTION", "CASE-AZOVSTAL"],
        "legal_tags": ["Route of attack", "Temporal sequencing", "Source-map lead"],
        "protected_site": "Citywide civilian environment",
        "severity": "Medium",
        "status": "Under review",
        "pii": "No",
        "confidence_base": 0.40,
        "confidence_cap": 0.58,
        "contradictions": ["CON-ATTRIBUTION", "CON-SOURCE-TIER", "CON-MAP-REVIEW-SCOPE"],
    },
    "humanitarian_problem": {
        "code": "HUM",
        "label": "Humanitarian problem",
        "evidence_type": "Humanitarian map lead",
        "incident_type": "Humanitarian deprivation review cluster",
        "case_ids": ["CASE-SIEGE-DEPRIVATION"],
        "legal_tags": ["Humanitarian deprivation", "Civilian survival", "Privacy review"],
        "protected_site": "Civilian population",
        "severity": "High",
        "status": "Privacy review",
        "pii": "Possible",
        "confidence_base": 0.38,
        "confidence_cap": 0.55,
        "contradictions": ["CON-ACCESS", "CON-PRIVACY", "CON-MAP-REVIEW-SCOPE"],
    },
    "commerce_or_hotel": {
        "code": "COMMERCE",
        "label": "Commerce or hotel",
        "evidence_type": "Civilian infrastructure map lead",
        "incident_type": "Commercial infrastructure damage cluster",
        "case_ids": ["CASE-CITYWIDE-DESTRUCTION", "CASE-CLAIMS-REMEDIES"],
        "legal_tags": ["Civilian infrastructure", "Economic harm", "Damage analysis"],
        "protected_site": "Civilian commercial property",
        "severity": "Medium",
        "status": "Under review",
        "pii": "No",
        "confidence_base": 0.40,
        "confidence_cap": 0.58,
        "contradictions": ["CON-LOCATION", "CON-SOURCE-TIER", "CON-MAP-REVIEW-SCOPE"],
    },
    "school": {
        "code": "SCHOOL",
        "label": "School",
        "evidence_type": "Protected-site map lead",
        "incident_type": "School and education-site damage cluster",
        "case_ids": ["CASE-CITYWIDE-DESTRUCTION"],
        "legal_tags": ["Protected site", "Education facility", "Civilian object"],
        "protected_site": "Education facility",
        "severity": "High",
        "status": "Under review",
        "pii": "Possible",
        "confidence_base": 0.42,
        "confidence_cap": 0.60,
        "contradictions": ["CON-LOCATION", "CON-SOURCE-TIER", "CON-MAP-REVIEW-SCOPE"],
    },
    "public_institution": {
        "code": "CIVIC",
        "label": "Public institution",
        "evidence_type": "Civic building map lead",
        "incident_type": "Public institution damage cluster",
        "case_ids": ["CASE-CITYWIDE-DESTRUCTION"],
        "legal_tags": ["Public institution", "Civilian administration", "Damage analysis"],
        "protected_site": "Civilian public institution",
        "severity": "Medium",
        "status": "Under review",
        "pii": "No",
        "confidence_base": 0.40,
        "confidence_cap": 0.58,
        "contradictions": ["CON-LOCATION", "CON-SOURCE-TIER", "CON-MAP-REVIEW-SCOPE"],
    },
    "hospital_or_clinic": {
        "code": "MED",
        "label": "Hospital or clinic",
        "evidence_type": "Medical-site map lead",
        "incident_type": "Medical-site damage cluster",
        "case_ids": ["CASE-CITYWIDE-DESTRUCTION", "CASE-SIEGE-DEPRIVATION"],
        "legal_tags": ["Medical facility", "Protected site", "Civilian harm"],
        "protected_site": "Medical facility",
        "severity": "High",
        "status": "Under review",
        "pii": "Possible",
        "confidence_base": 0.43,
        "confidence_cap": 0.62,
        "contradictions": ["CON-DENIAL", "CON-SOURCE-TIER", "CON-MAP-REVIEW-SCOPE"],
    },
    "culture_or_sport": {
        "code": "CULTURE",
        "label": "Culture or sport",
        "evidence_type": "Cultural-site map lead",
        "incident_type": "Cultural and sport-site damage cluster",
        "case_ids": ["CASE-CITYWIDE-DESTRUCTION"],
        "legal_tags": ["Cultural property", "Protected site", "Damage analysis"],
        "protected_site": "Cultural or sports facility",
        "severity": "High",
        "status": "Under review",
        "pii": "No",
        "confidence_base": 0.42,
        "confidence_cap": 0.60,
        "contradictions": ["CON-LOCATION", "CON-SOURCE-TIER", "CON-MAP-REVIEW-SCOPE"],
    },
    "church": {
        "code": "CHURCH",
        "label": "Church",
        "evidence_type": "Religious-site map lead",
        "incident_type": "Religious-site damage cluster",
        "case_ids": ["CASE-CITYWIDE-DESTRUCTION"],
        "legal_tags": ["Religious property", "Protected site", "Civilian object"],
        "protected_site": "Religious property",
        "severity": "High",
        "status": "Under review",
        "pii": "No",
        "confidence_base": 0.41,
        "confidence_cap": 0.59,
        "contradictions": ["CON-LOCATION", "CON-SOURCE-TIER", "CON-MAP-REVIEW-SCOPE"],
    },
}


def extract_payload():
    text = MAP_INDEX.read_text(encoding="utf-8")
    match = re.search(r"const payload = (\{.*?\n\});\n\n  seed\.mapFeatureIndex", text, re.S)
    if not match:
        raise RuntimeError("Could not locate map index payload")
    return json.loads(match.group(1))


def round_coord(value, category):
    precision = 3 if category in {"grave_or_victim", "humanitarian_problem"} else 5
    return round(value, precision)


def confidence_for(lead, meta):
    media_component = min(0.09, (lead.get("mediaCount") or 0) * 0.003)
    link_component = min(0.05, (lead.get("linkCount") or 0) * 0.01)
    confidence = meta["confidence_base"] + media_component + link_component
    return round(min(meta["confidence_cap"], confidence), 2)


def chunk_by_space(leads, count):
    ordered = sorted(leads, key=lambda item: (item["latitude"], item["longitude"], item["featureId"]))
    chunks = []
    for index in range(count):
        start = math.floor(index * len(ordered) / count)
        end = math.floor((index + 1) * len(ordered) / count)
        chunks.append(ordered[start:end])
    return chunks


def category_title(meta, index):
    return f"{meta['label']} review cluster {index:02d}"


def build_payload():
    source = extract_payload()
    records = source["records"]
    by_category = {}
    for record in records:
        by_category.setdefault(record["category"], []).append(record)

    selected = []
    for category, quota in EVIDENCE_QUOTAS.items():
        candidates = sorted(
            by_category.get(category, []),
            key=lambda item: (-(item.get("mediaCount") or 0), -(item.get("linkCount") or 0), item["featureId"]),
        )
        if len(candidates) < quota:
            raise RuntimeError(f"Category {category} has {len(candidates)} leads; expected {quota}")
        selected.extend(candidates[:quota])

    incident_chunks = []
    lead_to_incident = {}
    incident_index = 1
    for category, quota in INCIDENT_QUOTAS.items():
        meta = CATEGORY_META[category]
        category_leads = [lead for lead in selected if lead["category"] == category]
        for local_index, chunk in enumerate(chunk_by_space(category_leads, quota), start=1):
            incident_id = f"INC-MF-{meta['code']}-{local_index:02d}"
            for lead in chunk:
                lead_to_incident[lead["id"]] = incident_id
            incident_chunks.append(
                {
                    "id": incident_id,
                    "category": category,
                    "localIndex": local_index,
                    "globalIndex": incident_index,
                    "leads": chunk,
                }
            )
            incident_index += 1

    lead_to_evidence = {}
    evidence = []
    claims = []
    case_links = {}
    map_lead_evidence_links = []
    evidence_index = 1
    for category in EVIDENCE_QUOTAS:
        meta = CATEGORY_META[category]
        category_leads = [lead for lead in selected if lead["category"] == category]
        for lead in category_leads:
            evidence_id = f"E-MF-{evidence_index:04d}"
            claim_id = f"C-MF-{evidence_index:04d}"
            lead_to_evidence[lead["id"]] = evidence_id
            confidence = confidence_for(lead, meta)
            title = f"{lead['publicTitle']} source review packet"
            status = "Privacy review" if meta["status"] == "Privacy review" else "In review"
            evidence.append(
                {
                    "id": evidence_id,
                    "sourceId": "SRC-MARIUPOL-DESTRUCTION",
                    "source": "Original MariupolDestruction map feature review index",
                    "title": title,
                    "type": meta["evidence_type"],
                    "published": "2022-2026",
                    "captured": lead["capturedAt"][:10],
                    "language": "Russian/Ukrainian",
                    "reliability": "C",
                    "confidence": confidence,
                    "status": status,
                    "pii": meta["pii"],
                    "linkedIncident": lead_to_incident[lead["id"]],
                    "legalTags": meta["legal_tags"],
                    "claims": [claim_id],
                    "archive": "Local My Maps capture; row-level public metadata only",
                }
            )
            claims.append(
                {
                    "id": claim_id,
                    "text": (
                        f"Original map feature {lead['featureId']} is a {meta['label'].lower()} lead at "
                        "privacy-adjusted coordinates; corroboration is required before factual or legal use."
                    ),
                    "evidenceIds": [evidence_id],
                    "confidence": confidence,
                }
            )
            map_lead_evidence_links.append({"leadId": lead["id"], "evidenceId": evidence_id})
            for case_id in meta["case_ids"]:
                case_links.setdefault(case_id, {"caseId": case_id, "evidenceIds": [], "incidentIds": [], "contradictionIds": []})
                case_links[case_id]["evidenceIds"].append(evidence_id)
            evidence_index += 1

    incidents = []
    for chunk in incident_chunks:
        meta = CATEGORY_META[chunk["category"]]
        leads = chunk["leads"]
        evidence_ids = [lead_to_evidence[lead["id"]] for lead in leads]
        avg_lat = sum(lead["latitude"] for lead in leads) / len(leads)
        avg_lon = sum(lead["longitude"] for lead in leads) / len(leads)
        avg_confidence = round(sum(confidence_for(lead, meta) for lead in leads) / len(leads), 2)
        location = [round_coord(avg_lat, chunk["category"]), round_coord(avg_lon, chunk["category"])]
        confidence_label = "Low" if meta["status"] == "Privacy review" and avg_confidence < 0.46 else "Medium"
        incidents.append(
            {
                "id": chunk["id"],
                "title": category_title(meta, chunk["localIndex"]),
                "type": meta["incident_type"],
                "date": "2022-2026 source range",
                "time": "Source range",
                "district": "Mariupol source-map cluster",
                "location": location,
                "severity": meta["severity"],
                "confidence": confidence_label,
                "confidenceValue": avg_confidence,
                "status": meta["status"],
                "casualty": "Unknown / not asserted from map lead alone",
                "note": (
                    f"Generated from {len(leads)} original-map feature leads; row-level corroboration "
                    "is required before legal or factual assertion."
                ),
                "protectedSite": meta["protected_site"],
                "evidenceIds": evidence_ids,
                "legalTags": meta["legal_tags"],
                "contradictionIds": meta["contradictions"],
            }
        )
        for case_id in meta["case_ids"]:
            case_links.setdefault(case_id, {"caseId": case_id, "evidenceIds": [], "incidentIds": [], "contradictionIds": []})
            case_links[case_id]["incidentIds"].append(chunk["id"])
            case_links[case_id]["contradictionIds"].append("CON-MAP-REVIEW-SCOPE")

    contradiction = {
        "id": "CON-MAP-REVIEW-SCOPE",
        "title": "Original-map row review scope",
        "type": "Source status",
        "impact": "Medium",
        "status": "Open",
        "claimA": "The original public map provides a large, structured set of location, category, media, and link leads.",
        "claimB": "A public map row is not by itself a verified incident finding and needs corroboration against independent records.",
        "evidenceIds": ["E-0905", *[item["id"] for item in evidence[:12]]],
        "resolution": "Keep generated rows in lead-review status until source-owner exports, archive snapshots, imagery, and independent reports are matched.",
    }

    timeline = [
        {
            "date": "2026-07-07",
            "lane": "Evidence imports",
            "title": "Generated map-feature evidence packets and incident clusters added",
            "evidenceIds": [evidence[0]["id"], evidence[-1]["id"], "E-0905"],
            "confidence": "Medium",
        }
    ]

    imports = [
        {
            "id": "IMP-2026-07-07-MAPFILL",
            "connector": "map_feature_generated_database_fill",
            "status": "Completed",
            "records": len(evidence) + len(incidents) + len(claims) + 1,
            "failures": 0,
            "duration": "00:18:00",
            "startedBy": "codex",
            "created": "Generated evidence-review rows, incident clusters, claims, and source-status contradiction from public map leads",
        }
    ]

    research_gaps = [
        {
            "id": "GAP-MAP-FILL-ROW-CORROBORATION",
            "topic": "Generated map-lead row corroboration",
            "type": "Corroboration",
            "priority": "High",
            "next": "For each E-MF record, attach archived source media, independent imagery/report cross-checks, and reviewer notes before promoting beyond lead-review status.",
        }
    ]

    meta = {
        "generatedAt": "2026-07-07",
        "source": "dashboard/casefile-map-index.js",
        "evidenceRows": len(evidence),
        "incidentRows": len(incidents),
        "claimRows": len(claims),
        "contradictionRows": 1,
        "selectionRule": "category quotas from stratified map lead index, then highest media/link count",
        "privacyRule": "sensitive categories retain redacted public titles and rounded coordinates",
        "targetCounts": {"evidence": 150, "incidents": 40, "contradictions": 8},
    }

    return {
        "meta": meta,
        "claims": claims,
        "evidence": evidence,
        "incidents": incidents,
        "contradictions": [contradiction],
        "timeline": timeline,
        "imports": imports,
        "researchGaps": research_gaps,
        "caseLinks": list(case_links.values()),
        "mapLeadEvidenceLinks": map_lead_evidence_links,
    }


def write_output(payload):
    json_payload = json.dumps(payload, indent=2, ensure_ascii=True)
    contents = f"""(() => {{
  const seed = window.CASEFILE_SEED;
  if (!seed) return;

  const payload = {json_payload};

  const upsertById = (target, rows) => {{
    rows.forEach((row) => {{
      const index = target.findIndex((item) => item.id === row.id);
      if (index >= 0) {{
        target[index] = {{ ...target[index], ...row }};
      }} else {{
        target.push(row);
      }}
    }});
  }};

  const pushUnique = (target, values) => {{
    values.forEach((value) => {{
      if (!target.includes(value)) target.push(value);
    }});
  }};

  const uniquePush = (target, rows, keyFn) => {{
    rows.forEach((row) => {{
      const key = keyFn(row);
      if (!target.some((item) => keyFn(item) === key)) target.push(row);
    }});
  }};

  seed.claims = seed.claims || [];
  seed.evidence = seed.evidence || [];
  seed.incidents = seed.incidents || [];
  seed.contradictions = seed.contradictions || [];
  seed.timeline = seed.timeline || [];
  seed.imports = seed.imports || [];
  seed.researchGaps = seed.researchGaps || [];
  seed.cases = seed.cases || [];
  seed.mapFeatureIndex = seed.mapFeatureIndex || [];

  upsertById(seed.claims, payload.claims);
  upsertById(seed.evidence, payload.evidence);
  upsertById(seed.incidents, payload.incidents);
  upsertById(seed.contradictions, payload.contradictions);
  uniquePush(seed.timeline, payload.timeline, (item) => `${{item.date}}|${{item.title}}`);
  upsertById(seed.imports, payload.imports);
  upsertById(seed.researchGaps, payload.researchGaps);

  payload.caseLinks.forEach((link) => {{
    const caseFile = seed.cases.find((item) => item.id === link.caseId);
    if (!caseFile) return;
    caseFile.evidenceIds = caseFile.evidenceIds || [];
    caseFile.incidentIds = caseFile.incidentIds || [];
    caseFile.contradictionIds = caseFile.contradictionIds || [];
    pushUnique(caseFile.evidenceIds, link.evidenceIds);
    pushUnique(caseFile.incidentIds, link.incidentIds);
    pushUnique(caseFile.contradictionIds, link.contradictionIds);
  }});

  payload.mapLeadEvidenceLinks.forEach((link) => {{
    const lead = seed.mapFeatureIndex.find((item) => item.id === link.leadId);
    if (!lead) return;
    lead.evidenceIds = lead.evidenceIds || [];
    pushUnique(lead.evidenceIds, [link.evidenceId]);
  }});

  seed.generatedDatabaseFill = payload.meta;
  seed.demoStats = {{
    ...seed.demoStats,
    cases: seed.cases.length,
    incidents: seed.incidents.length,
    evidenceRecords: seed.evidence.length,
    sources: seed.sources.length,
    legalMatrices: seed.legalElements.length,
    contradictionSets: seed.contradictions.length,
    reports: seed.reports.length,
    resources: seed.resourceCollections.length,
    mapFeatureIndex: seed.mapFeatureIndex.length,
    generatedEvidenceRows: payload.meta.evidenceRows,
    generatedIncidentRows: payload.meta.incidentRows,
    generatedClaimRows: payload.meta.claimRows,
  }};
}})();
"""
    OUTPUT.write_text(contents, encoding="utf-8")


if __name__ == "__main__":
    write_output(build_payload())
    print(f"Wrote {OUTPUT}")
