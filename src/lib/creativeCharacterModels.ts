/**
 * Eight creative-desk personas, all built on the parameterized character
 * factory (characterModels.ts): the original four (Editor, Reporter, Copy
 * Writer, Illustrator, kept under their original Lottie-era names so the
 * fuzzy bot-name matching in the app doesn't need to change) plus four more
 * (Producer, Researcher, Archivist, Analyst) added so a cast of teammates
 * doesn't have to repeat the same four silhouettes. Each is a real
 * character with the full gaze/blink/squint/flinch behavior set, not a
 * canned animation loop.
 *
 * This is a distinct, wider role set from creativeDeskModels.ts's legacy
 * CreativeRole (which only names the original four, for the old Lottie
 * models) -- CreativeCharacterRole is the one to use for anything on this
 * character factory.
 */
import { buildCharacterModel } from "./characterModels";
import type { CharacterSpec } from "./characterModels";
import type { ProceduralAvatarModel } from "./avatarModels";

export type CreativeCharacterRole =
  | "Editor"
  | "Reporter"
  | "Copy Writer"
  | "Illustrator"
  | "Producer"
  | "Researcher"
  | "Archivist"
  | "Analyst";

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

const producerSpec: CharacterSpec = {
  id: "creative-producer",
  name: "Producer",
  viewBoxSize: 28,
  body: { width: 24, height: 14, roundness: 0.3, sharpCorner: "topRight", sharpCornerRadius: 2 },
  eyes: { radiusX: 2, radiusY: 2, spacing: 10, offsetY: 0 },
  accessories: [
    // A headset-mic bar angled toward the mouth.
    { kind: "rect", x: 20, y: 13, width: 5, height: 1.4, rx: 0.7, fillRole: "accent" }
  ],
  colors: { body: AMBER, eye: INK, accent: CLAY },
  temperament: 1.15 // brisk, always coordinating something
};

const researcherSpec: CharacterSpec = {
  id: "creative-researcher",
  name: "Researcher",
  viewBoxSize: 28,
  body: { width: 14, height: 24, roundness: 1, sharpCorner: "none", sharpCornerRadius: 0 },
  eyes: { radiusX: 1.8, radiusY: 1.8, spacing: 7, offsetY: -2 },
  accessories: [
    // A magnifying-glass lens held up beside the head.
    { kind: "circle", cx: 22, cy: 9, r: 2.4, fillRole: "accent" },
    { kind: "rect", x: 22.8, y: 11, width: 1.1, height: 4, rx: 0.5, fillRole: "accent" }
  ],
  colors: { body: COBALT, eye: PAPER, accent: AMBER },
  temperament: 0.9
};

const archivistSpec: CharacterSpec = {
  id: "creative-archivist",
  name: "Archivist",
  viewBoxSize: 28,
  body: { width: 20, height: 18, roundness: 0.2, sharpCorner: "topLeft", sharpCornerRadius: 2.5 },
  eyes: { radiusX: 2, radiusY: 2, spacing: 9, offsetY: 0.5 },
  accessories: [
    // A filed-tab marker along the top edge.
    { kind: "rect", x: 7, y: 4, width: 6, height: 1.6, rx: 0.4, fillRole: "accent" }
  ],
  colors: { body: CLAY, eye: INK, accent: PAPER },
  temperament: 0.8 // unhurried, methodical
};

const analystSpec: CharacterSpec = {
  id: "creative-analyst",
  name: "Analyst",
  viewBoxSize: 28,
  body: { width: 18, height: 18, roundness: 0.15, sharpCorner: "bottomRight", sharpCornerRadius: 1.2 },
  eyes: { radiusX: 1.8, radiusY: 1.8, spacing: 8, offsetY: 0 },
  accessories: [
    // A small ascending bar-chart tick near the corner.
    { kind: "rect", x: 19, y: 18, width: 1.6, height: 3, fillRole: "accent" },
    { kind: "rect", x: 21.2, y: 15.5, width: 1.6, height: 5.5, fillRole: "accent" }
  ],
  colors: { body: INK, eye: SIGNAL, accent: PAPER },
  temperament: 1.05
};

const specsByRole: Record<CreativeCharacterRole, CharacterSpec> = {
  Editor: editorSpec,
  Reporter: reporterSpec,
  "Copy Writer": copyWriterSpec,
  Illustrator: illustratorSpec,
  Producer: producerSpec,
  Researcher: researcherSpec,
  Archivist: archivistSpec,
  Analyst: analystSpec
};

const modelsByRole: Record<CreativeCharacterRole, ProceduralAvatarModel> = {
  Editor: buildCharacterModel(editorSpec),
  Reporter: buildCharacterModel(reporterSpec),
  "Copy Writer": buildCharacterModel(copyWriterSpec),
  Illustrator: buildCharacterModel(illustratorSpec),
  Producer: buildCharacterModel(producerSpec),
  Researcher: buildCharacterModel(researcherSpec),
  Archivist: buildCharacterModel(archivistSpec),
  Analyst: buildCharacterModel(analystSpec)
};

export function creativeCharacterSpecForRole(role: CreativeCharacterRole): CharacterSpec {
  return specsByRole[role];
}

export function creativeCharacterModelForRole(role: CreativeCharacterRole): ProceduralAvatarModel {
  return modelsByRole[role];
}
