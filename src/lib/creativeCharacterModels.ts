/**
 * The four creative-desk personas (Editor, Reporter, Copy Writer,
 * Illustrator), rebuilt on the parameterized character factory
 * (characterModels.ts) instead of the old Lottie creative-desk models.
 * Same role names and the same color-role mapping as the Lottie
 * originals (so the fuzzy bot-name matching in the app doesn't need to
 * change), but each is a real character with the full gaze/blink/squint/
 * flinch behavior set, not a canned animation loop.
 */
import { buildCharacterModel } from "./characterModels";
import type { CharacterSpec } from "./characterModels";
import type { ProceduralAvatarModel } from "./avatarModels";
import type { CreativeRole } from "./creativeDeskModels";

const INK = "#11130f";
const PAPER = "#f2efe7";
const SIGNAL = "#b8f34a";
const CLAY = "#ef6a47";
const COBALT = "#4f71ff";
const SEA = "#73d7c5";
const AMBER = "#f0bc4d";

const editorSpec: CharacterSpec = {
  id: "creative-editor",
  name: "Editor",
  viewBoxSize: 28,
  body: { width: 16, height: 22, roundness: 1, sharpCorner: "none", sharpCornerRadius: 0 },
  eyes: { radiusX: 2, radiusY: 2, spacing: 8, offsetY: -1 },
  accessories: [
    // A pair of focused, slightly furrowed brows.
    { kind: "rect", x: 8.5, y: 8.5, width: 3, height: 1.2, rx: 0.6, fillRole: "accent" },
    { kind: "rect", x: 16.5, y: 8.5, width: 3, height: 1.2, rx: 0.6, fillRole: "accent" }
  ],
  colors: { body: CLAY, eye: PAPER, accent: SIGNAL },
  temperament: 1
};

const reporterSpec: CharacterSpec = {
  id: "creative-reporter",
  name: "Reporter",
  viewBoxSize: 28,
  body: { width: 20, height: 20, roundness: 1, sharpCorner: "none", sharpCornerRadius: 0 },
  eyes: { radiusX: 2.2, radiusY: 2.2, spacing: 9, offsetY: 0 },
  accessories: [
    // A small "on air" signal dot up top.
    { kind: "circle", cx: 14, cy: 3.2, r: 1.6, fillRole: "accent" }
  ],
  colors: { body: COBALT, eye: PAPER, accent: SEA },
  temperament: 1.2 // a little more alert/energetic
};

const copyWriterSpec: CharacterSpec = {
  id: "creative-copy-writer",
  name: "Copy Writer",
  viewBoxSize: 28,
  body: { width: 22, height: 16, roundness: 0.45, sharpCorner: "bottomLeft", sharpCornerRadius: 1.5 },
  eyes: { radiusX: 2, radiusY: 2, spacing: 9, offsetY: -0.5 },
  colors: { body: SIGNAL, eye: INK, accent: CLAY },
  temperament: 0.85 // calmer, more deliberate
};

const illustratorSpec: CharacterSpec = {
  id: "creative-illustrator",
  name: "Illustrator",
  viewBoxSize: 28,
  body: { width: 18, height: 18, roundness: 0.35, sharpCorner: "none", sharpCornerRadius: 0 },
  eyes: { radiusX: 2, radiusY: 2, spacing: 8, offsetY: 0 },
  accessories: [
    // A little paint-dab accent near the top corner.
    { kind: "circle", cx: 20.5, cy: 6.5, r: 1.8, fillRole: "accent" }
  ],
  colors: { body: SEA, eye: INK, accent: AMBER },
  temperament: 1
};

const specsByRole: Record<CreativeRole, CharacterSpec> = {
  Editor: editorSpec,
  Reporter: reporterSpec,
  "Copy Writer": copyWriterSpec,
  Illustrator: illustratorSpec
};

const modelsByRole: Record<CreativeRole, ProceduralAvatarModel> = {
  Editor: buildCharacterModel(editorSpec),
  Reporter: buildCharacterModel(reporterSpec),
  "Copy Writer": buildCharacterModel(copyWriterSpec),
  Illustrator: buildCharacterModel(illustratorSpec)
};

export function creativeCharacterSpecForRole(role: CreativeRole): CharacterSpec {
  return specsByRole[role];
}

export function creativeCharacterModelForRole(role: CreativeRole): ProceduralAvatarModel {
  return modelsByRole[role];
}
