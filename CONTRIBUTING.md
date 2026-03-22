# Contributing to Cortex

First off, thank you for considering contributing to Cortex! We appreciate your help in building better startup tools.

## Development Setup

1.  **Clone the repo**: `git clone https://github.com/your-username/cortex-notion.git`
2.  **Install dependencies**: `pnpm install`
3.  **Build**: `pnpm run build`
4.  **Run locally**: `pnpm run start`

## Testing the CLI

Cortex uses **Jest** for unit testing. Before submitting a Pull Request, ensure all tests pass.

### 🧪 Run all tests
```bash
pnpm test
```

### 🧩 Linting & Formatting
We use ESLint and Prettier to keep the code clean. 
- To check: `pnpm run lint`
- To auto-format: `pnpm run format`

## Feature Testing Checklist
When adding a new command or agent, please verify:
1.  **Command Parsing**: Update `src/commands/parser.ts` and ensure it recognizes your new command.
2.  **Notion Logic**: Test with active Notion integration to ensure properties are correctly nested.
3.  **AI Fallback**: Ensure the tool handles OpenAI errors (like 401/429) gracefully.

## Submitting a Pull Request

1.  Fork the repo and create your branch from `main`.
2.  If you've added code that should be tested, add tests.
3.  If you've changed APIs, update the documentation.
4.  Ensure the test suite passes.
5.  Make sure your code lints.
6.  Issue that pull request!

## Need Help?
Contact the maintainers at [INSERT EMAIL].
