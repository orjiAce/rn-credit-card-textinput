# Compatibility baseline

This document records the compatibility surface observed on 2026-09-16. It is
an inventory, not a promise that every listed deep import or runtime works.

## Repository state before this phase

- `master` was clean except for an untracked IntelliJ settings file.
- `package.json` declared version `1.1.5` and used Yarn 1, although the broken
  workflow invoked `npm ci` without an npm lockfile.
- The only script was an obsolete Bob `prepare` build.
- The sole tag is misspelled `lastest` at commit `a6874d7`; it is not a `v1.1.6`
  release tag. This phase does not alter tags or history.
- Repository source differed from the published package in the date input's
  focused border: it hardcoded `blue` instead of using `focusColor`.

## Published npm state

The compatibility reference is `rn-credit-card-textinput@1.1.6`, downloaded
directly with `npm pack`:

- tarball: `rn-credit-card-textinput-1.1.6.tgz`
- SHA-1: `593fe8cf29832e95f4b44c92544dcb567bc439fe`
- integrity:
  `sha512-7dJ+I+JmtJgiYVxTdFdRAFSMaWCYLj2QpNZjAKEOPsZ/DwW6kM4KZqdanlyHAd8GQTjv/KHmwnE68ExBM3XHXw==`
- 44 files, 30,612 bytes packed and 96,690 bytes unpacked
- runtime dependencies: none
- peer dependencies: React `~17.0.1`, React DOM `~17.0.1`, and React Native
  exactly `0.67.1`
- entry points: `main` and `react-native` both `dist/module/index.js`; `types`
  is `dist/typescript/index.d.ts`
- contents: README, `package.json`, `src`, and `dist`; `dist` includes ESM
  JavaScript, source maps, declarations, and card images
- no `module` field, `exports` map, package `type`, Node engine, or CommonJS
  build

The published README is byte-for-byte equivalent to the repository README.
The published source matches the repository except for the `focusColor`
difference above. This phase aligns that line with published `1.1.6` behavior
and aligns the repository version and npm metadata with the external baseline.

## Public entry-point API

The root module has two named exports and no default export:

```ts
CardNumberTextInput;
CardDateTextInput;
```

Both are React function components. Their required callbacks are:

```ts
updateTextVal: (text: string) => void
updateCardDateText: (text: string) => void
```

Both component props extend React Native `TextInputProps`, but the components
override several inherited props internally. The shared package-defined props
are:

- `inputStyle?: StyleProp<TextStyle>`
- `labelStyle?: StyleProp<TextStyle>`
- `inputWrapStyle?: StyleProp<ViewStyle>`
- `cardInputContainerStyle?: StyleProp<ViewStyle>`
- `errorColor?: string`
- `labelColor?: string`
- `focusColor?: string`
- `defaultBorderColor?: string`
- `placeholder?: string`
- `error?: string`
- `label?: string`
- `touched?: boolean`
- `focus?: boolean`
- `value?: string`

`CardNumberTextInput` requires `updateTextVal`; `CardDateTextInput` requires
`updateCardDateText`. The supplied `value` prop is currently consumed by each
wrapper and is not forwarded to the underlying `TextInput`. This broken
controlled-input behavior is characterized in tests and deliberately remains
unchanged. Other inherited props are spread first, after which the components
override `onChangeText`, keyboard/return-key options, placeholder, and style.
The date component also forces `maxLength={5}`.

Card number changes call `updateTextVal` with four-character groups and a
trailing space after every complete group. Date changes call
`updateCardDateText` with the existing regex formatter output. These behaviors
remain unchanged.

## Potential deep imports

There is no `exports` map, and both `src` and `dist` are shipped. Consumers can
therefore potentially import undocumented paths including:

- `rn-credit-card-textinput/src/ValidateCard`
- `rn-credit-card-textinput/src/NumberWithSpaces`
- `rn-credit-card-textinput/src/Normalize`
- `rn-credit-card-textinput/src/CardNumberInput`
- `rn-credit-card-textinput/src/CardDateInput`
- source image paths such as `src/visa.png`
- `dist/module/*`, including JavaScript, maps, and copied images
- `dist/typescript/*` declarations

The repository has no `assets/images` path. These imports are unsupported in
the README but remain compatibility concerns. This phase intentionally adds no
`exports` map and keeps the existing `src` and `dist` package contents.

## Runtime and platform assumptions

- The declared peer baseline remains React 17.0.x, React DOM 17.0.x, and React
  Native 0.67.1. It is narrow and obsolete, but widening it without a tested
  matrix would create an unsupported promise.
- The development and CI baseline is Node 24. The published package declared no
  Node requirement. Runtime code is intended for React Native rather than a
  Node API.
- The generated JavaScript is ESM syntax in `.js` files with extensionless
  imports, without `type: module`. This is compatible with the historical Metro
  route but is not directly loadable as standard Node ESM or CommonJS.
- `react-native` points at the same generated module as `main`, so Metro should
  choose that field. The consumer check validates package resolution and image
  resolution through Metro's resolver; it does not run a device bundle.
- The README claims Expo, bare React Native, and cross-platform support. No Expo
  SDK, native iOS/Android application, or `react-native-web` matrix exists, so
  those claims are not treated as verified compatibility guarantees.
- The components depend only on React and React Native primitives and require
  bundled PNG assets. There is no native module or platform-specific source.

## Known behavior and safety concerns retained

- Card-brand flags leak across iterations in `checkCreditCard`, which can
  combine one brand's prefix with another brand's length. Active regression
  tests document examples rather than fixing them in this phase.
- Visa Electron prefixes are classified as Visa because Visa is checked first.
- The active rules omit Mastercard 2-series and other newer network ranges and
  lengths; those changes belong to the domain-modernization phase.
- A full PAN-like value is hardcoded as a scam check. Git history shows it was
  introduced in the initial source commit (`e8e10a3`, 2022-01-21) with no
  explanatory context. Its real or synthetic origin cannot be established.
  It remains in place for this behavior-preserving phase; no fraud mechanism is
  added.

## Compatibility implications of this phase

Runtime behavior is preserved against published `1.1.6`, including its known
bugs. The repository now uses the published version and focused-date color.
Entry paths and packaged directories remain unchanged. Development tooling,
tests, CI, and lockfile change, and npm becomes the sole package manager. No
package is published and no history is rewritten. Modern Bob also emits six
small declaration-map files under `dist/typescript`; those are the only paths
added to the 44-file published manifest, bringing the generated package to 50
files without removing or relocating any published path.
