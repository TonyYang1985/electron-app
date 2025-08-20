# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.45] - 2025-01-20

### Added
- Multi-environment build support (DEV, SIT, DEMO, PROD)
- Automatic environment detection from git tags
- Case-insensitive tag parsing
- Environment-specific release management

### Changed
- Updated GitHub Actions workflow for environment isolation
- Simplified build verification process
- Optimized artifact upload paths
- Enhanced release notes with environment information

### Fixed
- Build verification now checks target environment directory only
- Artifact naming includes environment identifier
- Release strategy based on environment (prerelease for non-PROD)

## [1.0.44] - 2025-01-19

### Added
- Initial release with basic functionality
- Cross-platform support (Windows, macOS, Linux)
- Auto-updater integration
- GitHub Actions CI/CD pipeline

### Features
- Comprehensive middle office solution
- Financial operations management
- Multi-platform desktop application
- Automatic updates support
