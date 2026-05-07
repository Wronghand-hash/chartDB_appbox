# Project Goal

## What this project is

`chartDB_appbox` is a web-based database diagram editor built from the ChartDB codebase. The app lets users:

- import schema metadata (or SQL/DBML),
- visualize tables and relationships on an interactive canvas,
- edit structure and documentation fields,
- export DBML/SQL artifacts for migration or sharing.

## Primary goal

The main goal is to provide a fast, installation-light way to understand and evolve database schemas without requiring direct database credentials in the app UI.

## Product direction in this repository

This repository appears focused on:

- preserving the core open-source ChartDB editor experience,
- making deployment practical on Vercel and Docker,
- supporting optional cloud-backed collaboration/auth with Supabase,
- improving frontend performance and reliability for larger diagrams.

## Core user workflow

1. Create or open a diagram.
2. Import schema data (smart query JSON, SQL DDL, or DBML).
3. Refine tables, relationships, areas, and notes.
4. Export or share resulting schema artifacts.

## Technical shape (high level)

- Frontend: React + TypeScript + Vite SPA.
- Main app area: `src/pages/editor-page`.
- Shared state/providers: `src/context`.
- Import/export and schema logic: `src/lib`.
- Infra and deployment: `vercel.json`, `Dockerfile`, `supabase/`.

