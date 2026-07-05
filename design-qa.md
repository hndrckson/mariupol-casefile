**Source Visual Truth**
- Reference dashboard: `C:\Users\Administrator\.codex\attachments\0a75078f-f600-431d-b434-b45e2c26663d\image-6.png`
- Additional reference states reviewed: images 1-5 and 7 in the same attachment folder.
- New interaction requirements from 2026-07-05: internal app scrolling rather than body/window scrolling, mobile-friendly PWA shell, burger navigation, usable map route, and horizontally scrollable chips/tool rows.

**Implementation Evidence**
- Local URL: `http://127.0.0.1:8765/dashboard/`
- Desktop dashboard screenshot: `C:\Users\Administrator\Documents\Codex\mariupol case file\docs\qa\implementation-dashboard-1280x720.png`
- Desktop map screenshot: `C:\Users\Administrator\Documents\Codex\mariupol case file\docs\qa\implementation-map-1280x720.png`
- Mobile dashboard screenshot: `C:\Users\Administrator\Documents\Codex\mariupol case file\docs\qa\mobile-dashboard-390x844.png`
- Mobile menu-open screenshot: `C:\Users\Administrator\Documents\Codex\mariupol case file\docs\qa\mobile-menu-open-390x844.png`
- Mobile map screenshot: `C:\Users\Administrator\Documents\Codex\mariupol case file\docs\qa\mobile-map-390x844.png`
- Full-view comparison evidence from prior reference pass: `C:\Users\Administrator\Documents\Codex\mariupol case file\docs\qa\dashboard-reference-vs-implementation.png`
- Viewports: 1280x720 desktop, 390x844 mobile.
- States: Dashboard, Map, and mobile navigation drawer.

**Findings**
- No actionable P0/P1/P2 findings remain.
- Internal scrolling: passed. Browser/body scrolling is locked (`body overflow: hidden`, document not scrollable) and the workspace routes, inspector, tables, map layer stack, chips, and toolbar rows own their scroll behavior.
- Mobile navigation: passed. The burger is hidden on desktop and visible on mobile; the sidebar opens as an off-canvas drawer with a scrim, vertical nav, evidence-posture note, and data-integrity footer.
- Mobile map: passed. At 390x844 the map route keeps document scrolling disabled, renders loaded Leaflet tiles, gives the map a 324px viewport, and keeps the map toolbar/layer stack/legend/inspector as internal scroll surfaces.
- PWA shell: passed. The app now includes a manifest, theme metadata, local PNG icons, local Lucide bundle, and a same-origin service worker cache list. In-app browser service-worker APIs were not exposed for runtime registration verification, so install behavior should still be smoke-tested in Chrome/Safari.
- Fonts and typography: passed. The implementation keeps the compact case-management hierarchy, zero letter spacing, readable dense controls, and button text that fits mobile containers.
- Spacing and layout rhythm: passed. The desktop composition remains dense and inspector-forward; mobile uses a fixed app viewport with a short bottom inspector row and route-specific map sizing.
- Colors and visual tokens: passed. The graphite, off-white, mint, amber, and coral tokens remain aligned with the reference language.
- Image quality and asset fidelity: passed. The map uses real Leaflet/CARTO/OSM tiles; PWA icons are bitmap assets; UI icons are from the vendored Lucide library.
- Copy and content: passed. The app still preserves the conservative legal posture and source-bound evidence language.

**Open Questions**
- Native PWA install and service-worker activation should be verified in a real Chrome/Safari browser because the in-app browser did not expose `navigator.serviceWorker`.
- Additional deep research should be handled as a separate database-ingestion sprint, not mixed into this UX patch.

**Implementation Checklist**
- Completed: replaced mobile body/page scroll with fixed app shell and internal scroll panes.
- Completed: added off-canvas burger navigation and responsive mobile command/map tool rows.
- Completed: made chips, filters, tables, inspector, map legend, and map layer stack scroll internally.
- Completed: added PWA manifest, service worker, local app icons, and local Lucide bundle.
- Completed: validated desktop/mobile shell behavior with browser screenshots and zero console errors in the desktop map pass.

**Follow-up Polish**
- P3: Real-device PWA install smoke test in Chrome on Android and Safari on iOS.
- P3: Add a collapsible map legend control if the field workflow prefers more map canvas over always-visible legend details.

final result: passed
