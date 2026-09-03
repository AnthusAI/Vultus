import { describe, expect, it } from "vitest";
import { characterColorProps } from "../lib/characterModels";
import { creativeCharacterModelForRole, creativeCharacterSpecForRole } from "../lib/creativeCharacterModels";
import type { CreativeCharacterRole } from "../lib/creativeCharacterModels";

const roles: CreativeCharacterRole[] = [
  "Editor",
  "Reporter",
  "Copy Writer",
  "Illustrator",
  "Producer",
  "Researcher",
  "Archivist",
  "Analyst"
];

describe("creativeCharacterModelForRole", () => {
  it("produces a distinct model id for every role", () => {
    const ids = roles.map((role) => creativeCharacterModelForRole(role).id);
    expect(new Set(ids).size).toBe(roles.length);
  });

  it("gives every role a unique body/eye/accent color combination", () => {
    // The palette is a closed set of seven brand colors shared across eight
    // roles, so a body color alone can repeat (by design -- shape and
    // accessory carry the rest of the distinction); the full three-color
    // combination never does.
    const combos = roles.map((role) => {
      const { shadowColor, lightColor, accentColor } = characterColorProps(creativeCharacterSpecForRole(role));
      return `${shadowColor}/${lightColor}/${accentColor}`;
    });
    expect(new Set(combos).size).toBe(roles.length);
  });

  it("every role opts into bodyFlinch and gaze support", () => {
    for (const role of roles) {
      const model = creativeCharacterModelForRole(role);
      expect(model.gaze).toBeDefined();
      expect(model.gaze!.bodyFlinch).toBe(true);
    }
  });

  it("is stable across calls (same reference, not rebuilt per call)", () => {
    expect(creativeCharacterModelForRole("Editor")).toBe(creativeCharacterModelForRole("Editor"));
  });
});
