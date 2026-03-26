# 🧠 Cortex: The AI-Powered Notion CLI for Founders 🚀

[![Notion Challenge](https://img.shields.io/badge/Notion-Challenge%202026-blue)](https://dev.to/challenges/notion-2026-03-04)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Build-Success-green)](https://github.com/RamanSharma100/cortex-notion)

> "The best way to predict the future is to build it. The fastest way to build it is with Cortex." — _Modern Founder Proverb_ 🧘‍♂️

[Blog Link](https://dev.to/techraman100/cortex-the-ai-powered-notion-cli-that-builds-your-entire-startup-workspace-in-30-seconds-4b42) [Demo Video](https://youtu.be/i5BSp_Dg-IA)

Cortex is a state-of-the-art CLI agent that turns your raw startup ideas into a fully structured, multi-page business workspace in Notion within seconds. Powered by the **Model Context Protocol (MCP)** and a **Resilient Multi-Model & Dual Brain Architecture** (**Gemini Array + GPT-4.1**), it’s like having a Chief of Staff in your terminal.

### 🏗️ Status: In Active Development

> **Built exclusively for the [Notion MCP Challenge 2026](https://dev.to/challenges/notion-2026-03-04).**
> Currently in the "Pre-Alpha" stage. We are refining the AI-to-Notion block conversion and adding more niche strategy agents (e.g., Legal, HR).

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

- **Dual-Brain Powered**: Supports both **Google Gemini** (for ultra-fast generation with 3.1/2.5 Array) and **OpenAI**.
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
2.  **Clear Session**:
    `cortex > notion logout` (To switch workspaces or log out).
3.  **Set your Brain**:
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
