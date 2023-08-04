# bun-build-extended ![Test](https://github.com/timnghg/bun-build-extended/actions/workflows/main.yml/badge.svg)

Temporary package to extend `bun build` to support CSS via [`tailwindcss`](https://tailwindui.com/)
or [`postcss-cli`](https://github.com/postcss/postcss-cli)

## Installation

```sh
bun add bun-build-extended
```

## Usage

### CLI

All [`bun build`](https://bun.sh/docs/bundler#api) options are supported.

```sh
bunx build-extended index.css index.tsx --outdir=dist --minify-whitespace
```

### API

```ts
import {buildExtended} from 'bun-build-extended';
import type {BuildOutput} from "bun";

const artifacts: BuildOutput = buildExtended({
    entryPoints: ['index.css', 'index.tsx'],
    outdir: './dist',
    // other options https://bun.sh/docs/bundler#api
});
```