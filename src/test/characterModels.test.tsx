import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BotAvatar } from "../lib/BotAvatar";
import {
  buildCharacterModel,
  characterColorProps,
  characterGazeConfig
} from "../lib/characterModels";
import type { CharacterSpec } from "../lib/characterModels";
import { DEFAULT_GAZE_CONFIG } from "../lib/gaze";

const baseSpec: CharacterSpec = {
  id: "test-character",
  name: "Test Character",
  viewBoxSize: 28,
  body: { width: 20, height: 16, roundness: 1, sharpCorner: "none", sharpCornerRadius: 0 },
  eyes: { radiusX: 2, radiusY: 2, spacing: 8, offsetY: 0 },
  colors: { body: "#4f71ff", eye: "#f2efe7", accent: "#73d7c5" }
};

describe("buildCharacterModel", () => {
  it("centers the body and eyes in the viewBox", () => {
    const model = buildCharacterModel(baseSpec);
    expect(model.viewBox).toEqual([0, 0, 28, 28]);
    expect(model.features.leftEye).toEqual({ cx: 10, cy: 14, fillRole: "light" });
    expect(model.features.rightEye).toEqual({ cx: 18, cy: 14, fillRole: "light" });
  });

  it("has no mouth by default", () => {
    const model = buildCharacterModel(baseSpec);
    expect(model.features.mouth).toBeUndefined();
    expect(model.mouthShapesByState).toBeUndefined();
  });

  it("adds a mouth feature when the spec includes one", () => {
    const model = buildCharacterModel({ ...baseSpec, mouth: { radiusX: 3, radiusY: 1.5, offsetY: 4 } });
    expect(model.features.mouth).toEqual({ cx: 14, cy: 18, fillRole: "light" });
    expect(model.mouthShapesByState?.neutral).toEqual({ rx: 3, ry: 1.5, dy: 0, shape: "ellipse" });
  });

  it("tags the body and every accessory with slot: flinchBody", () => {
    const model = buildCharacterModel({
      ...baseSpec,
      accessories: [{ kind: "circle", cx: 14, cy: 3, r: 1, fillRole: "accent" }]
    });
    expect(model.body).toHaveLength(2);
    expect(model.body.every((shape) => shape.slot === "flinchBody")).toBe(true);
  });

  it("applies the sharp corner only to the specified corner", () => {
    const model = buildCharacterModel({
      ...baseSpec,
      body: { width: 20, height: 16, roundness: 1, sharpCorner: "bottomLeft", sharpCornerRadius: 1 }
    });
    const bodyPath = model.body[0];
    expect(bodyPath.kind).toBe("path");
    // A small sharp-corner radius (1) must appear in the path alongside the
    // large rounded radius (8 = min(20,16)/2) used everywhere else.
    if (bodyPath.kind === "path") {
      expect(bodyPath.d).toContain(" 1 1 0 0 1 ");
      expect(bodyPath.d).toContain(" 8 8 0 0 1 ");
    }
  });

  it("scales gaze travel and recoil distance from body size", () => {
    const small = buildCharacterModel({ ...baseSpec, body: { ...baseSpec.body, width: 10, height: 10 } });
    const large = buildCharacterModel({ ...baseSpec, body: { ...baseSpec.body, width: 20, height: 20 } });
    expect(large.gaze!.travel.left).toBeGreaterThan(small.gaze!.travel.left);
    expect(large.gaze!.bodyFlinchRecoilDistance).toBeGreaterThan(small.gaze!.bodyFlinchRecoilDistance);
  });

  it("respects gazeOverrides", () => {
    const model = buildCharacterModel({ ...baseSpec, gazeOverrides: { blinkClosedScaleY: 0.5 } });
    expect(model.gaze!.blinkClosedScaleY).toBe(0.5);
  });

  it("enables bodyFlinch by default (characters are always click-reactive)", () => {
    const model = buildCharacterModel(baseSpec);
    expect(model.gaze!.bodyFlinch).toBe(true);
  });

  it("renders successfully through BotAvatar with gaze active", () => {
    const model = buildCharacterModel(baseSpec);
    const { container } = render(
      <BotAvatar model={model} gaze="auto" neutralIdleMode="static" {...characterColorProps(baseSpec)} />
    );
    expect(container.querySelector("svg")).toBeTruthy();
    expect(container.querySelector(".vultus-gaze")).toBeTruthy();
    expect(container.querySelector(".vultus-flinch-body")).toBeTruthy();
  });
});

describe("characterColorProps", () => {
  it("maps body/eye/accent to shadow/light/accent color props", () => {
    expect(characterColorProps(baseSpec)).toEqual({
      shadowColor: "#4f71ff",
      lightColor: "#f2efe7",
      accentColor: "#73d7c5"
    });
  });

  it("leaves accentColor undefined when the spec has no accent", () => {
    const { accent: _accent, ...colorsWithoutAccent } = baseSpec.colors;
    const props = characterColorProps({ ...baseSpec, colors: colorsWithoutAccent });
    expect(props.accentColor).toBeUndefined();
  });
});

describe("characterGazeConfig", () => {
  it("returns no overrides at temperament 1 (or unset)", () => {
    expect(characterGazeConfig(baseSpec)).toEqual({});
    expect(characterGazeConfig({ ...baseSpec, temperament: 1 })).toEqual({});
  });

  it("shortens gaps for temperament > 1 (more energetic)", () => {
    const config = characterGazeConfig({ ...baseSpec, temperament: 2 });
    expect(config.wanderMinMs).toBe(DEFAULT_GAZE_CONFIG.wanderMinMs / 2);
    expect(config.blinkMinMs).toBe(DEFAULT_GAZE_CONFIG.blinkMinMs / 2);
  });

  it("lengthens gaps for temperament < 1 (calmer)", () => {
    const config = characterGazeConfig({ ...baseSpec, temperament: 0.5 });
    expect(config.wanderMaxMs).toBe(DEFAULT_GAZE_CONFIG.wanderMaxMs / 0.5);
    expect(config.blinkMaxMs).toBe(DEFAULT_GAZE_CONFIG.blinkMaxMs / 0.5);
  });
});
