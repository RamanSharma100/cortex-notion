# 🧠 Cortex: The AI-Powered Notion CLI for Founders 🚀

[![Notion Challenge](https://img.shields.io/badge/Notion-Challenge%202026-blue)](https://dev.to/challenges/notion-2026-03-04)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Build-Success-green)](https://github.com/RamanSharma100/cortex-notion)

> "The best way to predict the future is to build it. The fastest way to build it is with Cortex." — _Modern Founder Proverb_ 🧘‍♂️

Cortex is a state-of-the-art CLI agent that turns your raw startup ideas into a fully structured, multi-page business workspace in Notion within seconds. Powered by the **Model Context Protocol (MCP)** and a dual-brain architecture (**Gemini 3.0 Flash Preview + GPT-4**), it’s like having a Chief of Staff in your terminal.

---

## ✨ "WOW" Features

### 1. 🚀 CEO Mode (`build:`)

The flagship feature. One command constructs an entire project ecosystem:

- **💡 Core Concept**: AI-drafted business model & values.
- **🔍 Market Analysis**: Real-world trends & segmentation.
- **⚔️ Competitor Landscape**: Mapping the gaps to win.
- **✨ Product Roadmap**: Your MVP timeline from 0 to 1.
- **📋 Tasks & Milestones**: Actionable developer/founder to-dos.

### 2. 🧠 Idea Brainstorm (`brainstorm:`)

Throw a theme at it (e.g., `brainstorm: AI for sustainability`). Cortex will return **20 innovative startup ideas** directly into a new Notion page. No more writer's block.

### 3. 📋 Automatic Task Injection (`tasks:`)

Running a project? `tasks: [Startup Name]` will search your Notion, find the relevant workspace, and **inject 10 fresh MVP tasks** into the roadmap.

### 4. 🏛️ Investor Pitch Draft (`investor:`)

Generates high-impact "Why Now?" insights and competitive moats to help you land that seed round.

---

## 🛠️ The Tech Stack

- **Dual-Brain Powered**: Supports both **Google Gemini** (for ultra-fast free tier generation) and **OpenAI**.
- **Notion MCP**: Deep integration via the Model Context Protocol for secure, structured page management.
- **ESM Architecture**: Modern TypeScript codebase bundled into a single high-performance binary with `tsup`.
- **Automated OAuth**: Zero manual token-hunting. A local callback server handles everything.

---

## 🚦 Getting Started

### Installation (Coming Soon on NPM)

```bash
npm install -g cortex-notion
```

### Manual Installation (Developer Flow)

```bash
git clone https://github.com/RamanSharma100/cortex-notion.git
cd cortex-notion
npm install
npm run build
npm link      # This makes the 'cortex' command available globally
```

### Configuration

1.  **Authorize Notion**:
    `cortex > notion login` (Automatically handles the redirect!)
2.  **Set your Brain**:
    `cortex > ai login` (Choose Gemini for free/fast or OpenAI for logic).

### Usage

```bash
cortex > build: Vertical Farming for Urban Apartments
cortex > brainstorm: Micro-SaaS for TikTokers
cortex > status
```

---

## 🤝 Contributing

We love founder/developer collaboration! Check out [CONTRIBUTING.md](./CONTRIBUTING.md) to learn how to add new agents.

## 📜 License

Cortex is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

_“Why did the startup founder cross the road?”_
_“To find a more sustainable way to disrupt the other side.”_ 😂 🚀

**Built with ❤️ for the Notion 2026 Challenge. Let's build the future together!**
