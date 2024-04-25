# Development Notes

## Setup

```
npm i
```

## Notes

Each run mode will use a different settings file, e.g. `npm run dev:electron` will use
`settings-dev.yaml`, while `npm run dev:electron:ss` will use `settings-screenshot.yaml`.
Production uses `settings.yaml`.

## Running in dev mode

In two terminals:

```sh
npm run dev
```

```sh
npm run dev:electron
```

## Building

Without dev mode running,

```sh
npm run build:client
npm run build:<platform> # e.g. npm run build:deb
```

Each platform sets different data for build, but the client build may be run just once, regardless
of subsequent platform builds. `build:electron` requires this data be set per platform first.

`build:snap` will publish to snapcraft to `latest/edge`.

The automated workflow does not build the `appx` package for the Microsoft Store. This must be
built separately, `build:appx`, and uploaded manually.

### Running compiled project

In two terminals:

```
npm run start
```

```
npm run start:electron
```

## Tests

Linting:

```sh
npm run lint # // or lint:scss, lint:js
```

Before running tests, build for current platform first, e.g.

```
npm run build:client
npm run build:win
```

Then run tests.

```
npm run test
```

Suites may be run individually, e.g.

```
npm run test:pages
```

Test data will be reset before/after running tests. Settings and data are not persistent.

## Screenshots

To run in screenshot mode:

```
npm run dev:electron:ss
```

This mode will not save some settings.
