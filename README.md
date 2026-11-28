# GoalGraph

**Turn your goals into a clear, actionable graph.**

GoalGraph is a lightweight, browser-based planner for breaking large goals into smaller steps. Organize learning plans, personal projects, and habits in an interactive graph, then track progress as you work.

## Features

- **Interactive graph:** arrange ideas as a mind map, tree, hierarchical DAG, free canvas, or timeline.
- **Flexible nodes:** create goals, skills, topics, projects, tasks, resources, milestones, and habits.
- **Progress tracking:** set statuses, priorities, deadlines, estimates, and tags. Progress can be calculated from tasks and subgoals.
- **Task lists:** add checklists, recurring tasks, notes, and time estimates; log time spent.
- **Relationships:** connect nodes with parent-child, prerequisite, dependency, blocking, and related links.
- **Dashboard and search:** review activity, find nodes, and filter the graph.
- **Import and export:** work with JSON, CSV, Markdown outlines, OPML, FreeMind (`.mm`), and XML imports. Export your graph as JSON, CSV, or Markdown.
- **Undo and redo:** recover recent changes and use keyboard shortcuts for common actions.

## Getting started

1. Open [GoalGraph](https://bikodoo2010.github.io/GoalGraph/).
2. Start with a main goal or edit the example graph.
3. Break the goal into smaller goals, topics, projects, and tasks.
4. Add deadlines, priorities, resources, and prerequisites where useful.
5. Update tasks as you work, and use the dashboard or timeline to review progress.
6. Export a backup of your graph from time to time.

## Data storage

Your graph is saved automatically in the browser's `localStorage`. There is no account or cloud-sync service, so your data belongs to the browser and device where you use the app. Export your graph before clearing browser data or moving to another device.

## Notes

- Data is stored per browser and device; there is no cloud sync.
- CSV is a simplified format. CSV imports do not restore tasks or node positions, so use JSON for a fuller backup.

## Built with

React, React Flow, Tailwind CSS, Lucide icons, and browser `localStorage`.

## License

[MIT](LICENSE)
