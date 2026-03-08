# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
