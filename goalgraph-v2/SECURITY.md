# Security notes

## Implemented protections

- The app does not evaluate user strings as JavaScript or parse user content as HTML.
- User-controlled labels and notes are added with DOM `textContent` or form `.value` properties.
- The page ships a restrictive meta CSP: same-origin scripts/styles only, no remote connections, no objects, no frames, and no base URL override.
- JSON import is limited to 2 MB, 5,000 nodes, 20,000 tasks overall, 200 tasks per node, and 32 hierarchy levels.
- Imported values are type-checked, length-limited, date-checked, and normalized against fixed enums.
- Invalid parent references are discarded; cyclic and over-deep parent chains are broken.
- CSV export prefixes cells that begin with spreadsheet formula markers before quoting them.
- Browser storage failures are shown as failures; they are not marked as successful saves.
- V2 migration reads the old `goalgraph:v1` data and leaves the previous key intact until the user explicitly resets data.

## Important limitations

- Data is stored in browser `localStorage`, not encrypted and not synchronized. Anyone with access to the same browser profile and origin may inspect or change it.
- A browser storage quota or privacy setting can prevent saving. Keep JSON backups.
- Meta CSP cannot set every response header. Configure header-based CSP, `X-Content-Type-Options`, and `Permissions-Policy` at the hosting layer when possible.
- This is a static client-side app, not a multi-user system. It has no login, server authorization, or server-side database.
- The security checks in `tests/security.test.js` are regression tests, not a substitute for an independent penetration test.
