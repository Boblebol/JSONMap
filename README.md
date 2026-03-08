# JSONMap

<div align="center">
  <img src="https://github.com/Boblebol/JSONMap/raw/main/src-tauri/icons/128x128@2x.png" width="128" alt="JSONMap Logo" />
  <h1>JSONMap</h1>
  <p>
    <strong>A high-performance, native macOS visualizer for JSON, YAML, XML, TOML, and CSV.</strong>
  </p>

  [![CI](https://github.com/Boblebol/JSONMap/actions/workflows/ci.yml/badge.svg)](https://github.com/Boblebol/JSONMap/actions/workflows/ci.yml)
  [![Version](https://img.shields.io/github/v/release/Boblebol/JSONMap?style=flat-square&color=blue)](https://github.com/Boblebol/JSONMap/releases)
  [![License](https://img.shields.io/github/license/Boblebol/JSONMap?style=flat-square&color=green)](LICENSE)
  [![Downloads](https://img.shields.io/github/downloads/Boblebol/JSONMap/total?style=flat-square&color=orange)](https://github.com/Boblebol/JSONMap/releases)
  [![Platform](https://img.shields.io/badge/platform-macOS-black?style=flat-square&logo=apple)](https://github.com/Boblebol/JSONMap/releases)
</div>

<br />

<div align="center">
  <a href="https://github.com/Boblebol/JSONMap/releases/latest">
    <img src="https://img.shields.io/badge/Download_for_Mac-3572EE?style=for-the-badge&logo=apple&logoColor=white" alt="Download for Mac" height="40" />
  </a>
</div>

<br />

> **JSONMap** is a developer-first tool designed to make navigating complex data structures intuitive and fast. Built with **Tauri (Rust)** and **React**, it combines native performance with a modern, beautiful UI.

## ✨ Features

- **🚀 Multi-Format Support**: Instantly parse and visualize **JSON**, **YAML**, **XML**, **TOML**, and **CSV**.
- **🕸️ Interactive Graph**: Navigate deep hierarchies with a zoomable, node-based graph view.
- **🔒 Privacy First**: All processing happens **locally**. Your data never leaves your machine.
- **🛠️ Power Tools**:
    - **JQ Querying**: Filter and transform data using JQ syntax.
    - **JWT Decoder**: Inspect tokens without external websites.
    - **Anonymizer**: Mask PII/sensitive data with one click.
    - **Code Generation**: Generate TypeScript, Go, Rust, and Python types from your JSON.
- **🎨 Native Experience**:
    - Dark/Light mode support.
    - Native macOS vibrancy and blur effects.
    - Keyboard shortcuts for efficiency.

## 📸 Screenshots

| Visualizer Graph | Editor & Tools |
|:---:|:---:|
| <img src="docs/screenshots/graph-view.png" alt="Graph View" width="400" /> | <img src="docs/screenshots/editor-view.png" alt="Editor View" width="400" /> |

*(Note: Screenshots are placeholders. Please add `graph-view.png` and `editor-view.png` to `docs/screenshots/`)*

## 📥 Installation

1. Go to the [Releases page](https://github.com/Boblebol/JSONMap/releases).
2. Download the latest `.dmg` file (`JSONMap_x64.dmg` or `JSONMap_aarch64.dmg`).
3. Open the `.dmg` and drag **JSONMap** to your **Applications** folder.

> [!IMPORTANT]
> **MacOS Security Note**: Since the app is currently unsigned, you might see a warning that the "app is damaged" or cannot be opened. To fix this, run the following command in your terminal:
> ```bash
> xattr -cr /Applications/JSONMap.app
> ```

## 🏗️ Development

Prerequisites:
- [Rust](https://www.rust-lang.org/tools/install)
- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/)

```bash
# Clone the repository
git clone https://github.com/Boblebol/JSONMap.git
cd JSONMap

# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev

# Build for production
pnpm tauri build
```

## 🤝 Contributing

Contributions are welcome! Please check our [Contributing Guidelines](CONTRIBUTING.md) and see the [Code of Conduct](CODE_OF_CONDUCT.md).

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## ❤️ Author

Built with passion by **[Alexandre Enouf (Boblebol)](https://github.com/Boblebol)**.
