# JSONMap Roadmap

This roadmap describes the product direction, release strategy, and implementation tickets for JSONMap.

JSONMap aims to be a native, local-first application for opening, visualizing, editing, versioning, converting, and exporting structured data. The first-class workflow is JSON, with developer-grade tools available when needed.

## Product Direction

### Vision

Build a native desktop app that makes structured data easy to understand and safe to modify.

The core promise:

> Drop a JSON file, understand it visually, edit it safely, keep versions, and export the result.

### Target Users

- Product managers, designers, QA, and support teams who need to inspect API payloads without reading raw JSON.
- Developers who need graph exploration, format conversion, query tools, schema tools, and type generation.
- Teams handling private data who need local processing instead of browser-based upload flows.

### Product Principles

- Local-first: data is processed locally by default.
- Simple by default: the first screen should be usable without technical knowledge.
- Powerful on demand: advanced developer tools should be available without cluttering the main flow.
- Safe editing: users should always know what changed and how to revert it.
- Native performance: large files should remain usable through progressive loading and focused graph rendering.
- Open source friendly: releases, issues, docs, and contribution paths should be clear.

## Competitive Goal

JSONCrack is the main reference point for JSON graph visualization. JSONMap should compete by being:

- Native rather than web-first.
- Stronger for local/private files.
- Better at editing and versioning modified data.
- Better for large files through native parsing and progressive graph loading.
- Friendlier for non-technical users while preserving advanced tools for developers.

## Release Strategy

JSONMap follows Semantic Versioning and Keep a Changelog.

- Patch releases: bug fixes, test fixes, small UI fixes.
- Minor releases: user-facing features and workflow improvements.
- Major releases: breaking changes to storage format, plugin APIs, or supported platform assumptions.

Recommended release cadence:

- Patch: as needed.
- Minor: every 2 to 4 weeks while the product is actively moving toward v2.
- Major: only when the product model or compatibility contract changes.

## Version Milestones

### v1.2.0 - Stability and Product Cleanup

Goal: make the current app reliable enough to build on.

Scope:

- Fix backend build/test configuration.
- Fix broken developer tools.
- Remove placeholder product surfaces.
- Reduce obvious security risk.
- Improve test coverage for critical workflows.

Exit criteria:

- Frontend build passes.
- Frontend tests cover the main tool flows.
- Backend tests run locally and in CI.
- No visible "coming soon" tabs in the app.
- JQ and JSONPath work from the UI.

### v1.3.0 - Local File Workspace MVP

Goal: support drag and drop files into an in-memory workspace and export modified versions.

Scope:

- Drag and drop JSON files into the app.
- Maintain files in an in-memory workspace.
- Track original vs current document state.
- Mark modified files clearly.
- Export modified JSON.
- Reset a document to its original version.

Exit criteria:

- A user can drag a JSON file, edit a value, and export the modified JSON.
- The original content remains available.
- The app makes unsaved changes obvious.

### v1.4.0 - Graph Editing UX

Goal: make graph exploration and editing simple for non-technical users.

Scope:

- Replace inline node editing with a right-side inspector.
- Add selected node details.
- Add JSON path breadcrumb.
- Support simple value editing from the inspector.
- Add search and focus node.
- Add expand/collapse branch controls.

Exit criteria:

- A non-technical user can find and edit a value without touching raw JSON.
- Editing a value updates the graph and raw JSON consistently.
- Invalid edits are blocked with a clear message.

### v1.5.0 - Versioning and Diff

Goal: make JSONMap safe for iterative modifications.

Scope:

- Add manual snapshots.
- Add document version list.
- Add original vs current diff.
- Add version vs version diff.
- Add revert document, branch, and single value.
- Export a selected version.

Exit criteria:

- A user can create at least two modified versions and compare them.
- A user can revert a mistake without reopening the file.
- A user can export any saved version.

### v1.6.0 - Developer Tools Drawer

Goal: expose power features without cluttering the simple workflow.

Scope:

- Move advanced tools into a developer tools drawer.
- Add format, validate, beautify, and minify.
- Add JQ and JSONPath query execution.
- Add JWT decode.
- Add anonymization.
- Add copy JSON path, copy subtree, and selected subtree export.

Exit criteria:

- The default UI remains simple with advanced tools hidden behind a developer drawer.
- A developer can query and transform the current document without leaving the app.

### v1.7.0 - Conversion and Type Generation

Goal: make JSONMap useful for API and data modeling workflows.

Scope:

- Convert between JSON, YAML, TOML, XML, and CSV.
- Generate TypeScript types.
- Generate Python dataclasses.
- Generate Pydantic v2 models.
- Generate Go structs.
- Generate Rust serde structs.
- Generate JSON Schema.

Exit criteria:

- A developer can generate usable code descriptors from the active document.
- Conversion results can be copied or exported.
- Type generation handles nested objects and arrays.

### v1.8.0 - Large File Experience

Goal: outperform browser-first tools on larger local files.

Scope:

- Move parsing and graph transformation out of the React render path.
- Add progressive graph loading.
- Add branch-level lazy expansion.
- Add large-file mode.
- Add performance benchmarks.

Exit criteria:

- Files above typical browser viewer comfort limits remain inspectable.
- The app stays responsive while loading large data.
- Benchmarks are documented.

### v2.0.0 - Native JSONMap

Goal: a polished, native, local-first JSON graph editor ready for broad public release.

Scope:

- Stable document model.
- Stable snapshot/versioning model.
- Polished native UI.
- Complete contribution docs.
- Signed and notarized macOS builds if possible.
- Updated screenshots and website.

Exit criteria:

- The app can be recommended as a serious alternative to web JSON graph viewers.
- New contributors can understand the architecture and open focused issues.
- Releases are reproducible from CI.

## Ticket Backlog

Tickets use the following format:

- ID: stable roadmap ticket identifier.
- Type: feature, bug, chore, docs, test, security, performance, design.
- Milestone: target release.
- Priority: P0, P1, P2, P3.
- Status: planned, in progress, blocked, done.

### v1.2.0 Tickets

| ID | Type | Priority | Title | Acceptance Criteria |
| --- | --- | --- | --- | --- |
| JM-001 | bug | P0 | Fix Tauri macOS private API build config | `cargo test --locked` runs without the current Tauri feature mismatch. |
| JM-002 | bug | P0 | Fix JQ argument order in UI | Running `.foo` against `{ "foo": 1 }` returns `1` from the Tools UI. |
| JM-003 | bug | P0 | Fix JSONPath argument order in UI | Running `$.foo` against `{ "foo": 1 }` returns `1` from the Tools UI. |
| JM-004 | test | P0 | Add UI tests for JQ and JSONPath | Tests fail on the current bug and pass after the fix. |
| JM-005 | security | P0 | Add a strict Tauri CSP | App runs with `csp` enabled instead of `null`. |
| JM-006 | security | P1 | Reduce Tauri global API exposure | App no longer relies on `withGlobalTauri` for normal operation. |
| JM-007 | security | P1 | Harden URL import | URL import validates scheme, response status, timeout, and max response size. |
| JM-008 | design | P1 | Remove placeholder tabs | No visible app navigation leads to a placeholder screen. |
| JM-009 | performance | P1 | Lazy-load heavy panels | Code generation, schema, converter, and tools panels are loaded on demand. |
| JM-010 | docs | P2 | Update README screenshots note | README no longer says screenshots are placeholders when screenshots exist. |

### v1.3.0 Tickets

| ID | Type | Priority | Title | Acceptance Criteria |
| --- | --- | --- | --- | --- |
| JM-011 | feature | P0 | Add document workspace model | Documents track id, name, format, original content, current content, parsed data, dirty state, and errors. |
| JM-012 | feature | P0 | Add drag and drop JSON import | Dropping one or more JSON files adds them to the workspace. |
| JM-013 | feature | P0 | Add workspace file list | Users can switch between imported documents. |
| JM-014 | feature | P0 | Track modified state | Modified files show a clear dirty indicator. |
| JM-015 | feature | P0 | Export modified JSON | Users can export the active document's current JSON. |
| JM-016 | feature | P1 | Reset to original | Users can discard all changes and restore the imported content. |
| JM-017 | test | P1 | Add document workspace tests | Import, switch, modify, export, and reset are covered. |
| JM-018 | design | P1 | Add empty drop state | First launch clearly invites users to drop or paste JSON. |

### v1.4.0 Tickets

| ID | Type | Priority | Title | Acceptance Criteria |
| --- | --- | --- | --- | --- |
| JM-019 | design | P0 | Replace inline node editing with inspector | Clicking a graph node opens details in a right-side inspector. |
| JM-020 | feature | P0 | Add JSON path breadcrumb | Inspector shows the selected node path in readable form. |
| JM-021 | feature | P0 | Edit scalar values in inspector | String, number, boolean, and null edits update the document safely. |
| JM-022 | feature | P1 | Add node search | Search matches keys and scalar values, then focuses selected results. |
| JM-023 | feature | P1 | Add branch expand/collapse controls | Users can collapse or expand branches predictably. |
| JM-024 | design | P1 | Redesign graph toolbar | Export and graph controls are compact, readable, and consistent. |
| JM-025 | test | P1 | Add graph edit integration tests | Selecting and editing a node updates raw JSON and graph state. |

### v1.5.0 Tickets

| ID | Type | Priority | Title | Acceptance Criteria |
| --- | --- | --- | --- | --- |
| JM-026 | feature | P0 | Add snapshot model | A document can store named snapshots with timestamp and content. |
| JM-027 | feature | P0 | Save current version | Users can create a snapshot from the current document. |
| JM-028 | feature | P0 | Export selected version | Users can export any snapshot as JSON. |
| JM-029 | feature | P0 | Compare original and current | Users can view a readable diff between original and current content. |
| JM-030 | feature | P1 | Compare two snapshots | Users can select two versions and compare them. |
| JM-031 | feature | P1 | Revert to snapshot | Users can restore a document from a snapshot. |
| JM-032 | feature | P1 | Revert selected value or branch | Users can revert only a selected path from original or a snapshot. |
| JM-033 | test | P1 | Add versioning tests | Snapshot, diff, export, and revert workflows are covered. |

### v1.6.0 Tickets

| ID | Type | Priority | Title | Acceptance Criteria |
| --- | --- | --- | --- | --- |
| JM-034 | design | P0 | Add developer tools drawer | Advanced tools are hidden by default behind one sidebar action but easy to access. |
| JM-035 | feature | P0 | Add format, validate, beautify, minify | JSON actions operate on the active document and report errors clearly. |
| JM-036 | feature | P0 | Add JQ tool for active document | JQ results can be viewed, copied, and created as a selected in-memory JSON document. |
| JM-037 | feature | P0 | Add JSONPath tool for active document | JSONPath results can be viewed, copied, and created as a selected in-memory JSON document. |
| JM-038 | feature | P1 | Add JWT decoder | Users can decode a pasted token and copy or create a selected in-memory JSON document from the decoded output. |
| JM-039 | feature | P1 | Add anonymizer | Users can anonymize sensitive fields and automatically save the redacted document as a named snapshot. |
| JM-040 | feature | P1 | Copy JSON path | Users can copy the selected node path as JSONPath from the inspector. |
| JM-041 | feature | P1 | Copy subtree | Users can copy or export the selected branch as formatted JSON. |

### v1.7.0 Tickets

| ID | Type | Priority | Title | Acceptance Criteria |
| --- | --- | --- | --- | --- |
| JM-042 | feature | P0 | Add conversion workspace action | Users can convert the active document to JSON, YAML, TOML, XML, or CSV and create the result as a selected in-memory document. |
| JM-043 | feature | P0 | Add TypeScript generation | Generated TypeScript handles nested objects and arrays and can be created as a selected `.ts` workspace document. |
| JM-044 | feature | P0 | Add Python dataclass generation | Generated dataclasses are valid Python syntax and can be created as a selected `.py` workspace document. |
| JM-045 | feature | P0 | Add Pydantic v2 generation | Generated models use Pydantic v2 conventions and can be created as a selected `.pydantic.py` workspace document. |
| JM-046 | feature | P1 | Add Go struct generation | Generated Go types are formatted, usable, and can be created as a selected `.go` workspace document. |
| JM-047 | feature | P1 | Add Rust serde generation | Generated Rust structs include serde derives and can be created as a selected `.rs` workspace document. |
| JM-048 | feature | P1 | Add JSON Schema generation | Generated schemas can validate the source document and can be created as a selected `.schema.json` workspace document. |
| JM-049 | test | P1 | Add codegen snapshot tests | Generated output is covered by stable fixtures. |

### v1.8.0 Tickets

| ID | Type | Priority | Title | Acceptance Criteria |
| --- | --- | --- | --- | --- |
| JM-050 | performance | P0 | Move parsing off the React render path | Large files do not block typing or UI interactions during parsing. |
| JM-051 | performance | P0 | Add progressive graph rendering | The graph renders useful top-level structure before the full graph is ready. |
| JM-052 | performance | P0 | Add lazy branch loading | Large arrays and objects can expand on demand. |
| JM-053 | performance | P1 | Add large-file mode | App switches to structure-first mode for large inputs. |
| JM-054 | performance | P1 | Add benchmark fixtures | Benchmarks cover 1 MB, 5 MB, and 20 MB JSON files. |
| JM-055 | docs | P2 | Document performance limits | README explains tested file sizes and expected behavior. |

### v2.0.0 Tickets

| ID | Type | Priority | Title | Acceptance Criteria |
| --- | --- | --- | --- | --- |
| JM-056 | design | P0 | Polish main application shell | Navigation, workspace, graph, inspector, and tools feel like one native product. |
| JM-057 | docs | P0 | Add architecture documentation | Contributors can understand the document, graph, versioning, and export modules. |
| JM-058 | docs | P0 | Add contributor issue labels | Repository documents labels for type, priority, status, and milestone. |
| JM-059 | release | P0 | Make releases reproducible | CI can build release artifacts from tags. |
| JM-060 | release | P1 | Add signing and notarization plan | macOS release process documents signing requirements and fallback path. |
| JM-061 | docs | P1 | Update public website and screenshots | Website reflects the current product and core workflows. |

## Recommended GitHub Labels

Type labels:

- type:bug
- type:feature
- type:design
- type:docs
- type:test
- type:security
- type:performance
- type:release
- type:chore

Priority labels:

- priority:P0
- priority:P1
- priority:P2
- priority:P3

Status labels:

- status:planned
- status:in-progress
- status:blocked
- status:needs-review

Area labels:

- area:workspace
- area:graph
- area:editor
- area:versioning
- area:developer-tools
- area:conversion
- area:codegen
- area:tauri
- area:docs
- area:ci

## Definition of Done

Every ticket should satisfy these rules before it is closed:

- The behavior is implemented or the documented change is made.
- The user-facing flow has been manually verified.
- Relevant automated tests are added or updated.
- Errors are handled with clear user-facing messages.
- The change does not introduce unrelated UI or architecture churn.
- Documentation is updated when behavior changes.
- The changelog is updated for user-facing changes.

## Release Checklist

Before creating a release:

- Confirm all milestone tickets are closed or explicitly moved.
- Run frontend tests.
- Run backend tests.
- Run frontend build.
- Run Tauri build.
- Verify the app manually with a sample JSON file.
- Update `CHANGELOG.md`.
- Update screenshots if UI changed materially.
- Create a SemVer tag.
- Verify CI release artifacts.

## Out of Scope Until After v2.0

These ideas may be valuable later, but should not distract the v2 roadmap:

- Cloud accounts.
- Collaborative editing.
- Hosted sharing links.
- Plugin marketplace.
- Database connectors.
- AI-assisted data explanation.
- Team workspaces.
