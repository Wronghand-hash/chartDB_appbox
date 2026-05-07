# Changes Summary

This document summarizes what has changed in this repository based on recent local commit history on `main`.

## Current state

- Branch: `main`
- Working tree: clean at time of writing
- Recent activity window reviewed: 2026-05-01 to 2026-05-03

## Major change phases

## 1) Initial app import and setup

Early commits established the full application baseline and project scaffolding:

- added package/config/tooling files,
- imported app source (`src`) in batches (components, context, lib, pages, i18n),
- added templates and template metadata,
- added public assets and example media.

## 2) Infrastructure and release readiness

DevOps-oriented updates followed:

- GitHub workflows for CI/release/publish,
- Husky hooks and quality tooling,
- Supabase config and self-host docs,
- Docker and deployment-related assets.

## 3) Performance and build optimization

Several commits focused on deploy/runtime performance:

- deferred Monaco-related chunking,
- split heavy vendor bundles,
- adjusted Vercel build behavior for faster deploys,
- fixed lint/prettier issues that were blocking Vercel builds.

## 4) Product and UX enhancements

Recent feature work includes:

- auto-save for diagrams,
- shared team organization handling in Supabase auth/storage flow,
- cleanup/removal of Star Us dialog and related config,
- Monaco type import refactor.

## 5) Vercel behavior hardening

Latest deployment commit updated `vercel.json` to improve SPA routing and caching:

- catch-all rewrite to `index.html`,
- long-lived immutable cache headers for static assets,
- revalidation-focused headers for HTML requests.

## Notes

- Upstream project history is also tracked in `CHANGELOG.md`, but this file focuses on repository-local commit activity in this environment.
- If needed, this summary can be expanded into a release-by-release internal changelog with commit hashes and owner tags.

