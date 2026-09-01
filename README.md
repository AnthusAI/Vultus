# Vultus

Extensible animated React avatar system with one state contract and a model zoo
of procedural and Lottie renderers.

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
      neutralIdleMode="bored-random"
      size={280}
      shadowColor="dimgray"
      lightColor="white"
      ariaLabel="Assistant avatar"
    />
  );
}
```

## Lottie models and model zoos

Vultus treats the original procedural face as one model, not the product
identity. A Lottie model maps the same Vultus states to frame segments, so an
application can mix very different character designs without rewriting its
turn-state logic.

```tsx
import {
  BotAvatar,
  createBotAvatarModelZoo,
  defineLottieAvatarModel,
  VULTUS_CLASSIC_MODEL,
} from "anthus-vultus";
import reporterAnimation from "./reporter.json";

const reporter = defineLottieAvatarModel({
  id: "newsroom-reporter",
  name: "Newsroom Reporter",
  animationData: reporterAnimation,
  fallbackSegment: [0, 90],
  stateSegments: {
    neutral: [0, 45],
    thinking: [45, 90],
    toolCalling: [90, 135],
    speakingOpen: [135, 180],
  },
});

const zoo = createBotAvatarModelZoo([VULTUS_CLASSIC_MODEL, reporter]);

export function ReporterAvatar() {
  return <BotAvatar model={zoo[reporter.id]} state="thinking" />;
}
```

## Public API

### `BotAvatarProps`

- `state?: BotAvatarState`
- `neutralIdleMode?: "bored-random" | "static"` (default: `"bored-random"`; applies only for `state="neutral"`)
- `size?: number`
- `transitionDurationSeconds?: number`
- `shadowColor?: string`
- `lightColor?: string`
- `ariaLabel?: string`
- `model?: BotAvatarModel` (default: `VULTUS_CLASSIC_MODEL`)

Neutral idle behavior is static by default with optional random bored micro-animations. When `neutralIdleMode` is `"static"` or the OS prefers reduced motion, neutral idle remains fully still.

### Exports

- `BotAvatar`
- `type BotAvatarProps`
- `type BotAvatarState`
- `BOT_AVATAR_STATES`
- `defineLottieAvatarModel`
- `createBotAvatarModelZoo`
- `avatarModelFromZoo`
- `VULTUS_CLASSIC_MODEL`
- `CREATIVE_DESK_MODEL_ZOO`
- `creativeDeskModelForRole`
- `type BotAvatarModel`
- `type LottieAvatarModel`
- `type CreativeRole`

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
