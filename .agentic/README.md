# Agentic System Configuration Template

This directory defines behavior and tool access for an **agentic coding assistant**, tailored for **TypeScript full-stack apps** using modern **Spotify API integrations**, AWS infrastructure, and React-based single-page application architecture.

## Files

- `system_prompt.md`: Defines assistant behavior and responsibilities.
- `tools.json`: Lists the tools the assistant is allowed to use.
- `environment.json`: (Optional) Environment settings like OS, shell, and workspace directory.

---

## How to Use

1. **Connect It to Your Agent System**  
   You may need to:
    - Register the folder path with your agent
    - Point explicitly to `system_prompt.md` and `tools.json`
    - Link with your project's entrypoint or workspace config

---

## When to Update

| File               | When to Update                                                                 |
|--------------------|--------------------------------------------------------------------------------|
| `system_prompt.md` | When your project structure, Spotify flow, AWS stack, or UI logic changes.     |
| `tools.json`       | When adding/removing backend utilities, auth flows, or infrastructure support. |
| `environment.json` | When your shell, OS, or package manager changes.                               |

---

## Assumptions

- TypeScript is used across frontend and backend.
- React + Tailwind + tRPC + Prisma are the core libraries.
- The app integrates with **Spotify's latest Web API** using OAuth.
- Full-stack hosting and backend logic use AWS (Cognito, Lambda, etc.).
- Yarn is the required package manager.
- macOS is the primary development OS; shell is assumed to be ZSH.
- New scripts or CLI tools must update `package.json` and `README.md`.

---

**Note:**  
This template is **agent-agnostic** and designed to be easily adapted for use with **Cascade**, **Claude**, **Copilot**, or other advanced coding agents in full-stack TypeScript projects.