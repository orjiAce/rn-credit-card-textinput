# Final release verification gate

Run this gate only after all implementation phases are complete and before any
release, tag, or publication decision. Start from a clean committed checkout.

Record the current commit, clean working-tree status, Node/npm/tool versions,
and then run:

```sh
npm ci
npm run check
npm test
npm run build
npm run pack:check
npm run consumer:test
npm pack
git diff --check
```

Inspect the actual tarball for metadata, root and React Native entry points,
declarations, assets, expected source/build paths, and absence of test/tooling
artifacts. Install that tarball into a fresh external fixture and compile the
two named root imports. Do not substitute repository-source imports.

Run the complete regression matrix for every configured brand, prefix boundary,
length, invalid length, invalid checksum, partial input, unknown input, overlap,
evaluation order, repeated validation, formatter/date behavior, rendering,
callbacks, styles, icons, and errors.

Compare behavior with the documented published `1.1.6` baseline. Classify every
difference as an intentional correction, intentional additive change,
intentional breaking change, or unintentional regression. No unclassified
difference may remain.

The readiness report must include exact PASS/FAIL results, test counts and
skips, tarball size/file count/version/entries/dependencies, all intentional
compatibility differences, and genuinely unverified platforms. Passing this
gate does not authorize npm publication, a GitHub release, or tag changes.
