# Contributing to JSONMap

First off, thank you for considering contributing to JSONMap! It's people like you that make JSONMap such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by the [JSONMap Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

- Check the [Issues page](https://github.com/Boblebol/JSONMap/issues) to see if the bug has already been reported.
- If not, open a new issue using the **Bug Report** template.

### Suggesting Enhancements

- Open a new issue using the **Feature Request** template.

### Pull Requests

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. Ensure the test suite passes (`pnpm test` and `cargo test`).
4. Make sure your code lints.
5. Issue that pull request!

## Development Setup

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/)

### Local Development

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/JSONMap.git
cd JSONMap

# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev
```

## Style Guide

- Use TypeScript for frontend logic.
- Use Tailwind CSS for styling.
- Use Rust for backend commands.
- Follow existing patterns in the codebase.

Thank you for contributing!
