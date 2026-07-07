import csv
import json
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data/processed/mariupoldestruction/mariupol_destruction_target_content.csv"
OUTPUT = ROOT / "dashboard/casefile-map-index.js"

TARGETS = {
    "residential_damage": 115,
    "grave_or_victim": 50,
    "demolished_after_occupation": 30,
    "battle_or_route": 30,
    "commerce_or_hotel": 20,
    "humanitarian_problem": 20,
    "school": 12,
    "public_institution": 8,
    "hospital_or_clinic": 7,
    "culture_or_sport": 5,
    "church": 3,
}

LABELS = {
    "residential_damage": "Residential damage",
    "grave_or_victim": "Grave or victim-location",
    "demolished_after_occupation": "Demolished after occupation",
    "battle_or_route": "Battle or route",
    "commerce_or_hotel": "Commerce or hotel",
    "humanitarian_problem": "Humanitarian problem",
    "school": "School or education",
    "public_institution": "Public institution",
    "hospital_or_clinic": "Hospital or clinic",
    "culture_or_sport": "Culture or sport",
    "church": "Church or religious site",
}

RESOURCE_IDS = {
    "residential_damage": "RES-MD-RESIDENTIAL",
    "grave_or_victim": "RES-MD-GRAVES",
    "demolished_after_occupation": "RES-MD-DEMOLITION",
    "battle_or_route": "RES-MD-BATTLE",
    "commerce_or_hotel": "RES-MD-COMMERCE",
    "humanitarian_problem": "RES-MD-HUMANITARIAN",
    "school": "RES-MD-SCHOOLS",
    "public_institution": "RES-MD-PUBLIC",
    "hospital_or_clinic": "RES-MD-HOSPITALS",
    "culture_or_sport": "RES-MD-CULTURE",
    "church": "RES-MD-CHURCHES",
}

CASE_IDS = {
    "residential_damage": ["CASE-CITYWIDE-DESTRUCTION", "CASE-CLAIMS-REMEDIES"],
    "grave_or_victim": ["CASE-BURIALS-CASUALTY"],
    "demolished_after_occupation": ["CASE-CITYWIDE-DESTRUCTION", "CASE-CLAIMS-REMEDIES"],
    "battle_or_route": ["CASE-AZOVSTAL", "CASE-FORCED-TRANSFER"],
    "commerce_or_hotel": ["CASE-CITYWIDE-DESTRUCTION", "CASE-CLAIMS-REMEDIES"],
    "humanitarian_problem": ["CASE-SIEGE-DEPRIVATION"],
    "school": ["CASE-CITYWIDE-DESTRUCTION"],
    "public_institution": ["CASE-CITYWIDE-DESTRUCTION"],
    "hospital_or_clinic": ["CASE-MATERNITY", "CASE-SIEGE-DEPRIVATION"],
    "culture_or_sport": ["CASE-DRAMA", "CASE-CITYWIDE-DESTRUCTION"],
    "church": ["CASE-CITYWIDE-DESTRUCTION"],
}

EVIDENCE_IDS = {
    "grave_or_victim": ["E-0918"],
    "humanitarian_problem": ["E-0911", "E-0922"],
    "school": ["E-0906", "E-0901"],
    "hospital_or_clinic": ["E-0906", "E-0912"],
    "culture_or_sport": ["E-0906", "E-0915"],
    "church": ["E-0906"],
    "public_institution": ["E-0906"],
}

SENSITIVE_CLASSES = {"grave_or_victim", "humanitarian_problem"}


def to_int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return 0


def to_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def public_title(row, ordinal):
    category = row["inferred_class"]
    label = LABELS.get(category, category.replace("_", " ").title())
    suffix = row["feature_id"][-6:]
    if category in SENSITIVE_CLASSES:
        return f"Redacted {label.lower()} lead {ordinal:03d}"
    return f"{label} lead {suffix}"


def rounded_coordinate(value, sensitive):
    precision = 3 if sensitive else 5
    return round(value, precision)


def build_record(row, ordinal):
    category = row["inferred_class"]
    sensitive = category in SENSITIVE_CLASSES
    latitude = to_float(row["latitude"])
    longitude = to_float(row["longitude"])
    image_count = to_int(row["image_count"])
    video_count = to_int(row["video_count"])
    link_count = to_int(row["link_count"])
    evidence_ids = EVIDENCE_IDS.get(category, ["E-0905"])

    return {
        "id": f"MF-{row['feature_id']}",
        "featureId": row["feature_id"],
        "sourceId": "SRC-MARIUPOL-DESTRUCTION",
        "resourceId": RESOURCE_IDS[category],
        "category": category,
        "label": LABELS[category],
        "publicTitle": public_title(row, ordinal),
        "geometryType": row["geometry_type"],
        "latitude": rounded_coordinate(latitude, sensitive),
        "longitude": rounded_coordinate(longitude, sensitive),
        "coordinatePrecision": "rounded-3-decimal" if sensitive else "rounded-5-decimal",
        "imageCount": image_count,
        "videoCount": video_count,
        "linkCount": link_count,
        "mediaCount": image_count + video_count,
        "layerId": row["layer_id"],
        "sourceUrl": row["source_url"],
        "mymapsUrl": row["mymaps_url"],
        "accessMode": row["access_mode"],
        "capturedAt": row["extracted_at"],
        "privacy": "High - public title redacted" if sensitive else "Public lead - title withheld pending review",
        "titlePolicy": "redacted_sensitive" if sensitive else "withheld_pending_row_review",
        "reviewStatus": "Needs row-level corroboration",
        "caseIds": CASE_IDS[category],
        "evidenceIds": evidence_ids,
        "notes": "Source-bound lead from public My Maps capture; not a verified legal finding.",
    }


def main():
    rows_by_class = defaultdict(list)
    all_rows = []
    with SOURCE.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            category = row["inferred_class"]
            if category not in TARGETS:
                continue
            if to_float(row["latitude"]) is None or to_float(row["longitude"]) is None:
                continue
            all_rows.append(row)
            rows_by_class[category].append(row)

    records = []
    for category, target in TARGETS.items():
        candidates = sorted(
            rows_by_class[category],
            key=lambda row: (
                -(to_int(row["image_count"]) + (to_int(row["video_count"]) * 3) + to_int(row["link_count"])),
                row["feature_id"],
            ),
        )
        for index, row in enumerate(candidates[:target], start=1):
            records.append(build_record(row, index))

    by_class = Counter(record["category"] for record in records)
    sensitive_count = sum(1 for record in records if record["category"] in SENSITIVE_CLASSES)
    media_refs = sum(record["mediaCount"] for record in records)

    payload = {
        "records": records,
        "stats": {
            "sampleSize": len(records),
            "sourceFeatureCount": len(all_rows),
            "targetFeatureCount": 4895,
            "mediaReferences": media_refs,
            "sensitiveRedactions": sensitive_count,
            "byClass": dict(sorted(by_class.items())),
            "selectionRule": "stratified_by_original_layer_then_highest_media_and_link_count",
            "privacyRule": "grave_or_victim and humanitarian_problem rows use redacted public titles and 3-decimal coordinates",
            "generatedAt": "2026-07-07",
        },
    }

    js = (
        "(() => {\n"
        "  const seed = window.CASEFILE_SEED;\n"
        "  if (!seed) return;\n\n"
        "  const payload = "
        + json.dumps(payload, ensure_ascii=True, indent=2)
        + ";\n\n"
        "  seed.mapFeatureIndex = payload.records;\n"
        "  seed.mapFeatureStats = payload.stats;\n"
        "  seed.demoStats = {\n"
        "    ...seed.demoStats,\n"
        "    mapFeatureIndex: payload.records.length,\n"
        "    mapFeatureSourceRows: payload.stats.targetFeatureCount,\n"
        "  };\n"
        "})();\n"
    )
    OUTPUT.write_text(js, encoding="utf-8", newline="\n")
    print(f"Wrote {OUTPUT} with {len(records)} records")


if __name__ == "__main__":
    main()
