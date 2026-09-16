# Contributing

Use Node 24 and npm. Install the exact dependency graph with:

```sh
npm ci --ignore-scripts
```

Run all local checks with:

```sh
npm run check
```

Individual commands are available for type checking, linting, formatting,
tests, building, package inspection, and the consumer fixture. Build artifacts
under `dist` are generated and should not be edited directly.

Behavioral changes need regression tests. Validation-rule or public API changes
also need compatibility and versioning notes.
