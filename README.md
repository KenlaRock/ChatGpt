# Data Viewer & Converter v2.2
[![Netlify Status](https://api.netlify.com/api/v1/badges/679b85e1-7631-44b3-a3af-72d258120832/deploy-status)](https://app.netlify.com/projects/conceptvangard/deploys)

Single-file web app for viewing and converting data between JSON, XML, YAML, CSV, Markdown and HTML.

## Prerequisites
- Node.js 20+

## Setup
Install dependencies for tests:
```sh
npm install
```

## Scripts
- `npm test` – run unit tests with Jest
- `npm run build` – generate `dist/app.html` and supporting files in `dist/` for deployment

## Netlify
Pushes to `main` or `File-Viewer-App` deploy via GitHub Actions.
Set `NETLIFY_AUTH_TOKEN` in repository secrets for deployment.

## Contributing
1. Fork and clone the repo.
2. Create a branch from `main` and make your changes.
3. Run `npm test` and open a pull request.

## Samples
Sample files (`small.json`, `medium.csv`, `medium.xml`) are available for manual testing.
