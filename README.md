# anthus-vultus

Reusable animated React avatar component extracted from the original `demo.html`, with Storybook stories and a local standalone demo.

## Install

```bash
npm install anthus-vultus
```

Peer dependencies:

- `react >= 18`
- `react-dom >= 18`

## Usage

```tsx
import { BotAvatar } from "anthus-vultus";

export function Example() {
  return (
    <BotAvatar
      state="thinking"
      size={280}
      shadowColor="dimgray"
      lightColor="white"
      ariaLabel="Assistant avatar"
    />
  );
}
```

## Public API

### `BotAvatarProps`

- `state?: BotAvatarState`
- `size?: number`
- `transitionDurationSeconds?: number`
- `shadowColor?: string`
- `lightColor?: string`
- `ariaLabel?: string`

### Exports

- `BotAvatar`
- `type BotAvatarProps`
- `type BotAvatarState`
- `BOT_AVATAR_STATES`

## Development

```bash
npm install
npm run dev
```

Local demo is served from root `demo.html` and mounts `src/demo/BotAvatarDemo.tsx`.

### Storybook

```bash
npm run storybook
```

Stories include:

- Playground
- States
- SpeakingSequence
- EditorialDemo

## Build and Test

```bash
npm run build
npm run test
npm run build-storybook
```

## Publish

The package is configured for public npm publishing:

```bash
npm publish
```
# Vultus
