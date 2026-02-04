# JSONMap 🗺️

A high-performance, native macOS visualizer for JSON, YAML, XML, TOML, and CSV. Built with **Rust (Tauri)** and **React**.

![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)
![OS](https://img.shields.io/badge/OS-macOS-black?style=flat-square&logo=apple)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

## ✨ Features

- **Multi-Format Support**: Instantly parse and visualize JSON, YAML, XML, TOML, and CSV.
- **Interactive Graph**: Navigate complex data structures with a powerful, zoomable, and interactive graph.
- **Advanced Tools**:
  - 🔍 **JQ Querying**: Run standard JQ filters on your data.
  - 📍 **JSONPath**: Use JSONPath for precise selection.
  - 🔐 **JWT Decoder**: Full header and payload breakdown for tokens.
  - 🛡️ **Anonymizer**: Locally mask sensitive PII with one click.
- **Native macOS Experience**:
  - 🪟 **Vibrancy**: Translucent "UnderWindowBackground" effect.
  - 📁 **Native Menus**: "Open Recent" tracking and standard shortcuts.
  - 🔔 **Notifications**: macOS native alerts for file actions.
- **Power User Tools**:
  - 🏗️ **Code Gen**: Generate TypeScript, Rust (Serde), Go, and Python models.
  - ⚡ **Minify/Format**: Instant compression and beautification.
  - 🎨 **Light/Dark Mode**: Persisted theme engine.

## 🚀 Getting Started

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- [Node.js](https://nodejs.org/) (v18+)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/alexandre/JSONMap.git
   cd JSONMap
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run in development mode:
   ```bash
   npm run tauri dev
   ```

## 🛠️ Tech Stack

- **Backend**: Rust, Tauri
- **Frontend**: React, TypeScript, Tailwind CSS
- **Visualization**: React Flow
- **Editor**: Monaco (VS Code core)
- **Rust Crates**: `jaq`, `serde`, `quick-xml`, `jsonpath_lib`, `window-vibrancy`.

## ⌨️ Shortcuts

- `⌘ + O`: Open File
- `⌘ + S`: Save File
- `⌘ + E`: Export Graph
- `?`: Toggle Shortcut Overlay

## 🛡️ Privacy

JSONMap is built with privacy first. All data processing (parsing, anonymizing, decoding) happens **locally on your machine**. No data is ever sent to external servers.

---

Built with ❤️ by the JSONMap Team.
