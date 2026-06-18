# Contributing to InferPay

We are thrilled that you are interested in contributing to InferPay! Together, we are building the next-generation autonomous financial infrastructure for AI-driven organizations.

Please take a moment to review this guide to make the contribution process smooth and successful for everyone.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please report any unacceptable behavior to `security@inferpay.space`.

## How to Contribute

### 1. Reporting Bugs
- Search existing issues to ensure the bug hasn't already been reported.
- If it hasn't, open a new issue with a clear description, reproduction steps, and screenshots or logs.

### 2. Suggesting Enhancements
- Enhance the system by proposing features in our issues tracker.
- Clearly state the use case, the expected behavior, and potential architecture designs.

### 3. Submitting Pull Requests
- Fork the repository and create your branch from `main`:
  ```bash
  git checkout -b feature/my-amazing-feature
  ```
- Make sure dependencies install clean:
  ```bash
  npm install
  ```
- Keep code neat and typecheck compliant:
  ```bash
  npx tsc --noEmit
  ```
- Commit your changes with clear messages (we prefer Conventional Commits):
  ```bash
  git commit -m "feat: add ERC-8183 job execution hook"
  ```
- Push to your branch and open a Pull Request targeting `main`.

## Coding Guidelines

- **TypeScript**: Enforce strict types. Do not use `any` unless absolutely necessary (like handling dynamically fetched contract payloads).
- **Brutalist CSS**: Respect our design token variables declared in `app/globals.css`.
- **EVM Interaction**: Use `viem` for RPC calls and contract reads/writes. Do not hardcode contract addresses; export them from `lib/contracts.ts`.

Thank you for your contributions! 🚀
