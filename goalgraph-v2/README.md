# GoalGraph V2

A modular, multilingual goal and task planner designed for static hosting on GitHub Pages.

## What's new in V2

- Modular JavaScript architecture (`app`, `model`, `storage`, `security`, `i18n`).
- Kazakh, English, and Russian interface translations.
- Safer JSON import with a 2 MB file-size limit, node/task limits, field validation, and hierarchy cycle/depth checks.
- Formula-safe CSV export for spreadsheet use.
- Correct save-state handling: failed browser storage writes remain visible as failures instead of being reported as saved.
- Automatic migration from the previous `goalgraph:v1` localStorage key. The old key is not deleted.
- A restrictive Content Security Policy meta tag; no inline scripts, inline styles, remote fonts, or third-party runtime dependencies.
- All user-provided text is inserted through DOM `textContent` rather than HTML parsing.

## Run locally

Because the app uses ES modules, serve this folder through a local HTTP server:

```bash
cd v2
python -m http.server 8000
```

Open `http://localhost:8000`.

## Deploy

The folder is static and can be served directly by GitHub Pages at `/GoalGraph/v2/`.

## Data and privacy

- GoalGraph V2 does not require an account, backend, or server-side database.
- Plan data is stored in the browser's `localStorage`.
- Use **Export JSON** for a complete backup before clearing browser data or switching devices.
- CSV is intended as a spreadsheet summary and is not a complete restorable backup.

## Security boundaries

- JSON imports are capped at 2 MB, 5,000 nodes, 20,000 total tasks, 200 tasks per node, and 32 hierarchy levels.
- Imported strings are length-limited and normalized; invalid dates and enum values are discarded.
- Parent cycles and excessive hierarchy depth are broken during import.
- CSV cells beginning with spreadsheet formula markers are prefixed to reduce formula-injection risk.
- Browser storage can still be unavailable or full. In that case the app reports a save failure; export a JSON backup.

The CSP meta policy improves browser-side restrictions, but response headers such as `X-Content-Type-Options`, `Permissions-Policy`, and a header-based CSP should be configured at the hosting layer if the hosting provider supports them.


## Scope note

V2 currently focuses on the core hierarchical goal and task workflow. The previous version's advanced free-canvas positioning, dependency connectors, DAG, and timeline views have not yet been ported. The original root app remains available while V2 is tested.
