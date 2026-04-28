# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- In-memory document workspace for imported JSON files.
- Drag and drop import for local files in the web shell.
- Active document reset and export controls.
- Node inspector for graph selection, path/type/value review, and JSON scalar editing.
- In-memory document snapshots with restore, export, and original/current diff preview.
- Snapshot-to-snapshot comparison in the version panel.
- Graph node search with result navigation and focus.
- Explicit graph branch collapse and expand controls for the selected node.
- Manual snapshot naming with named snapshot export filenames.
- Inspector actions to copy the selected JSONPath, copy the selected subtree, and export it as JSON.
- Developer tools drawer that hides advanced tools behind one sidebar action.
- Roadmap with version milestones, ticket backlog, labels, and release checklist.

### Changed
- Graph nodes are now read-only; value edits go through the inspector for a more predictable workflow.

### Fixed
- JQ and JSONPath tools now pass the query and parsed JSON arguments in the correct order.
- Backend tests now run with the Tauri macOS private API feature enabled.

## [1.1.2] - 2026-03-08

### Fixed
- Broken download links on the landing page.
- Improved release automation for predictable asset names.

## [1.1.1] - 2026-03-08

### Fixed
- App freeze when opening large or complex files.
- UI performance improvements in the Visualizer tab.
- Added a node limit (1000) for the graph view with a truncation indicator.

## [1.1.0] - 2026-03-08

### Added
- Comprehensive test suite for both backend and frontend.
- Test coverage reporting (`npm run test:coverage`).
- New premium application logo (integrated in UI and system icons).
- Interactive "About" modal accessible by clicking the app logo.
- Unit tests for JSON schema generation logic.
- Integration tests for standard components.

### Changed
- Refactored `App.tsx` logic for better testability.
- Updated Tauri configuration for improved release management.

## [1.0.1] - 2026-03-08

### Changed
- Improved landing page with website links and clear value propositions.
- Fixed GitHub Actions release workflow (manual build bypass).
- Optimized macOS documentation.

## [1.0.0] - 2026-02-09

### Added
- Initial release of JSONMap.
- Multi-format support (JSON, YAML, XML, TOML, CSV).
- JQ query engine integration.
- Native code generation (TypeScript, Go, Python).
- Privacy-first local data processing.
