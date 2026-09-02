import { describe, expect, it } from "vitest";
import { characterColorProps } from "../lib/characterModels";
import { creativeCharacterModelForRole, creativeCharacterSpecForRole } from "../lib/creativeCharacterModels";
import type { CreativeRole } from "../lib/creativeDeskModels";

const roles: CreativeRole[] = ["Editor", "Reporter", "Copy Writer", "Illustrator"];

describe("creativeCharacterModelForRole", () => {
  it("produces a distinct model id for every role", () => {
    const ids = roles.map((role) => creativeCharacterModelForRole(role).id);
    expect(new Set(ids).size).toBe(roles.length);
  });

  it("gives every role a unique body color", () => {
    const colors = roles.map((role) => characterColorProps(creativeCharacterSpecForRole(role)).shadowColor);
    expect(new Set(colors).size).toBe(roles.length);
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
