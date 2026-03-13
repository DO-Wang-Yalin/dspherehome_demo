# Development Instructions & Operating Principles

This document serves as the mandatory operating guideline for the AI assistant when modifying the **Design Voyage Platform** codebase.

## 1. Single Page Modification Principle (隔离修改原则)
- **Rule**: The assistant MUST only modify one page or one specific component at a time.
- **Scope**: Changes must be contained within the requested file and its immediate private sub-components.
- **Constraint**: Do NOT modify global configurations, routing (`App.tsx`), global contexts, or other unrelated pages unless explicitly instructed to do so for a cross-cutting feature.
- **Verification**: Before finishing a task, the assistant must verify that no unintended files were touched.

## 2. Logic Preservation Principle (逻辑保留原则)
- **Rule**: Do NOT alter existing business logic, API call structures, or state management flows unless the primary goal of the request is to fix or change that logic.
- **Focus**: Prioritize UI/UX adjustments, styling, and content updates without breaking the underlying functionality.
- **Safety**: If a UI change requires a logic change, the assistant must explain this to the user and seek confirmation before proceeding.

## 3. Communication Protocol (沟通协议)
- **NN Prefix Rule (NN 前缀规则)**: If a user message starts with `NN` (case-insensitive), the assistant MUST NOT call any code-editing tools. It must only respond with text.
- **Pre-Action**: State clearly which page/file is being targeted.
- **Post-Action**: Summarize exactly what was changed in that specific file.
- **No Mocking**: Maintain the real API integration structures already present in the `services/` directory.

## 4. Visual Consistency (视觉一致性)
- Use the established Tailwind theme variables defined in `src/index.css` (e.g., `--color-brand`, `--color-dark`).
- Maintain the "Design Voyage" aesthetic: Professional, clean, and user-centric.

---
*This file is a binding contract for AI-driven development on this project.*
