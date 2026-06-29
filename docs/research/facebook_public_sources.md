# Facebook and Public Social Source Plan

This file documents compliant public-page discovery and ingestion paths. It does not authorize scraping, credential bypassing, or collection of private/personal data.

## Allowed Paths

| Path | Use | Connector |
|---|---|---|
| Manual cataloging from normal web search | Identify public page names, URLs, owners, and scope | manual_social_archive |
| Meta Graph API with approved access | Authorized collection of public page metadata/posts where permitted | facebook_public_page_authorized |
| Page-owner export | Preferred path for official/partner pages | facebook_admin_export |
| Approved research access | Large-scale public-interest research where platform approval exists | facebook_public_page_authorized |
| Manual archive import | User-provided CSV/JSON/PDF/HTML archive collected lawfully | manual_social_archive |

## Disallowed Paths

- Automated scraping of Facebook pages without authorization.
- Use of fake accounts, credential sharing, or login circumvention.
- Collection of private profiles, closed groups, comments with sensitive personal data, or non-public posts.
- Bulk copying of media without license review.
- Treating Facebook content as verified evidence without corroboration.

## First Public Page Targets to Verify

Use normal web search and official-site links to confirm exact page URLs before ingestion. Search results may vary by region and language.

| Target | Search URL | Expected Owner/Scope | Status | Recommended Path |
|---|---|---|---|---|
| Mariupol City Council / Маріупольська міська рада | https://www.facebook.com/search/pages/?q=%D0%9C%D0%B0%D1%80%D1%96%D1%83%D0%BF%D0%BE%D0%BB%D1%8C%D1%81%D1%8C%D0%BA%D0%B0%20%D0%BC%D1%96%D1%81%D1%8C%D0%BA%D0%B0%20%D1%80%D0%B0%D0%B4%D0%B0 | Official municipal public communications | Exact URL verification required | Page-owner export or Graph API |
| I Mariupol / ЯМаріуполь | https://www.facebook.com/search/pages/?q=%D0%AF%D0%9C%D0%B0%D1%80%D1%96%D1%83%D0%BF%D0%BE%D0%BB%D1%8C | Support-center network for displaced Mariupol residents | Exact URL verification required | Page-owner export or Graph API |
| Mariupol Reborn | https://www.facebook.com/search/pages/?q=Mariupol%20Reborn | Recovery/reconstruction initiative | Exact URL verification required | Page-owner export or Graph API |
| Local Mariupol media 0629 | https://www.facebook.com/search/pages/?q=0629%20Mariupol | Local news archive | Exact URL verification required | Manual archive or authorized API |
| Suspilne Donbas | https://www.facebook.com/search/pages/?q=%D0%A1%D1%83%D1%81%D0%BF%D1%96%D0%BB%D1%8C%D0%BD%D0%B5%20%D0%94%D0%BE%D0%BD%D0%B1%D0%B0%D1%81 | Regional public broadcaster | Exact URL verification required | Authorized API or article URL import |
| Truth Hounds | https://www.facebook.com/search/pages/?q=Truth%20Hounds | NGO documentation updates | Exact URL verification required | Partner/page-owner export |
| Human Rights Watch Ukraine posts | https://www.facebook.com/search/pages/?q=Human%20Rights%20Watch%20Ukraine | NGO report promotion and updates | Exact URL verification required | Use official HRW site first; social only as secondary |
| Amnesty Ukraine | https://www.facebook.com/search/pages/?q=Amnesty%20Ukraine | NGO updates | Exact URL verification required | Use official Amnesty site first; social only as secondary |

## Page-Owner Export Schema

Preferred CSV schema for official page-owner or partner-provided exports:

```csv
page_id,page_name,page_url,post_id,post_url,posted_at,language,author_display_name,post_text,media_urls,external_links,location_text,latitude,longitude,incident_date_start,incident_date_end,source_owner,export_method,license_or_permission,privacy_status,verification_status,notes
```

Preferred JSON shape:

```json
{
  "page": {
    "id": "",
    "name": "",
    "url": "",
    "owner": "",
    "export_method": "page_owner_export"
  },
  "posts": [
    {
      "post_id": "",
      "post_url": "",
      "posted_at": "",
      "language": "",
      "text": "",
      "media": [],
      "external_links": [],
      "locations": [],
      "incident_dates": {
        "start": "",
        "end": ""
      },
      "privacy_status": "public",
      "license_or_permission": "",
      "verification_status": "unverified"
    }
  ]
}
```

## Evidence Handling Notes

- Store only post metadata and short summaries by default.
- Preserve the public post URL, page URL, timestamp, and access date.
- Separate "reported by source" from "verified by casefile".
- Flag posts involving victims, minors, addresses, or family contact details for review before publication.
- Use official website copies of the same content when available; social posts should usually be corroborating context, not the primary legal source.

## Public Telegram and Archive Mirrors

| Target Type | Examples | Ingestion Rule |
|---|---|---|
| Official public channels | Mariupol City Council, I Mariupol, Mariupol Reborn, Ukrainian authorities | Use public no-login message URLs or owner export; store message metadata and summary. |
| Local media public channels | 0629, Suspilne Donbas, other verified outlets | Prefer website article imports; use channel posts as source trail. |
| OSINT/archive mirrors | Internet Archive, GDELT, source-preservation mirrors | Use as preservation/provenance support, not sole verification. |

