# Project Context: Rozcash

## Stack & Tech
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Database/ORM:** Prisma
- **State Management:** Zustand
- **Internationalization:** custom i18n setup (using `messages/`, `en.json`, `ur.json`, `i18n.ts`, and `middleware.ts`)

## Project Structure
- `app/`: Contains the main application routes.
  - `(app)/`: Main application logic and authenticated views.
  - `(auth)/`: Authentication-related routes (login, register, etc.).
- `components/`: Reusable UI components.
- `lib/`: Utility functions, Prisma client initialization, and shared logic.
- `messages/`: Translation files for i18n (`en.json`, `ur.json`).
- `public/`: Static assets.

## Key Files
- `middleware.ts`: Handles routing and i18n detection.
- `i18n.ts` / `i18n.js`: Configuration for language switching.
- `GEMINI.md`: This context file for AI assistance.

## Development Rules
- Use **functional components** with TypeScript.
- Favor **Zustand** for global state; keep local state within components.
- Ensure all new text strings are added to `messages/en.json` and `messages/ur.json` to maintain translation support.
- Follow the Next.js App Router conventions for layouts and pages.