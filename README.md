# Quest Tracker

Quest Tracker is a lightweight task manager built with React, TypeScript, and Vite. It helps you stay focused by organizing tasks by category, priority, and due date while keeping everything saved locally in the browser.

## Features

- Create, edit, and delete tasks
- Add notes, categories, priority levels, and due dates
- Mark tasks complete or incomplete
- Filter by task view: All tasks, Today, Upcoming, and Completed
- Narrow results by category and priority
- Search tasks by title or notes
- Sort by due date, priority, or most recently added
- Persist data locally with browser storage so tasks remain available after refresh

## App overview

The interface is designed to feel calm, focused, and mission-driven, with a sidebar for task views and category filters and a main panel for managing the active list.

## Tech stack

- React 19
- TypeScript
- Vite
- CSS for styling

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open the local URL shown in the terminal, usually:

```text
http://localhost:5173
```

## Production build

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Project structure

```text
src/
  App.tsx        - main app logic and task management UI
  App.css       - styling for the task manager interface
  main.tsx      - app entry point
```

## Notes

- Tasks are stored in browser localStorage so the app remembers them on the same device and browser.
- The app includes a few starter tasks on first load to demonstrate the task manager workflow.

## License

This project is for educational/demo use.
