# OpenAPI Lens

OpenAPI Lens is a local-only Chrome side-panel extension that turns a raw OpenAPI or Swagger document into an explainable contract-quality report.

## Features

- Extracts paths, HTTP methods, operation IDs, parameters and response codes
- Flags missing operation IDs, responses, success codes, request schemas and examples
- Produces a deterministic contract-debt score with line-free, structured evidence
- Copies a Markdown report or exports versioned JSON
- Runs entirely in the browser without API keys or network uploads

## Development

```bash
pnpm install
pnpm test -- --run
pnpm lint
pnpm build
```

Load `dist/` from `chrome://extensions`, open a raw `openapi.json` or Swagger document, and click **Analyze** in the side panel.

On Windows, future pushes can use `.\publish.ps1`; credentials stay in the ignored project-local `.gh/` directory.

## Engineering narrative

The parser is a pure function with an explicit `ApiReport` contract. The browser adapter only reads the active page; rendering and export consume the typed report. This makes the analyzer testable in CI and gives backend interviews a concrete discussion around API contracts, schema drift and deterministic quality gates.

## Limits

The MVP accepts JSON OpenAPI 3 and Swagger 2 documents. YAML support and live request execution are deliberately out of scope so the extension never sends requests or secrets without an explicit future design.

## License

MIT
