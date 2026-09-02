import { describe, expect, it } from "vitest";
import {
  avatarModelFromZoo,
  createBotAvatarModelZoo,
  defineLottieAvatarModel,
  defineProceduralAvatarModel,
  VULTUS_CLASSIC_MODEL
} from "../lib/avatarModels";
import { computeAllFacialPathsForState } from "../lib/avatarStates";

const animationData = {
  v: "5.12.2",
  fr: 60,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  assets: [],
  layers: []
};

const mouthlessModel = defineProceduralAvatarModel({
  id: "test-mouthless",
  name: "Test Mouthless",
  viewBox: [0, 0, 28, 28],
  body: [],
  features: {
    leftEye: { cx: 10, cy: 14, fillRole: "shadow" },
    rightEye: { cx: 18, cy: 14, fillRole: "shadow" }
  },
  eyeShapesByState: {
    neutral: { rx: 2, ry: 2, dy: 0, shape: "ellipse" },
    thinking: { rx: 2, ry: 2, dy: 0, shape: "ellipse" },
    deepThinking: { rx: 2, ry: 2, dy: 0, shape: "ellipse" },
    toolCalling: { rx: 2, ry: 2, dy: 0, shape: "ellipse" },
    toolResponse: { rx: 2, ry: 2, dy: 0, shape: "ellipse" },
    speakingOpen: { rx: 2, ry: 2, dy: 0, shape: "ellipse" },
    speakingWide: { rx: 2, ry: 2, dy: 0, shape: "ellipse" },
    speakingRound: { rx: 2, ry: 2, dy: 0, shape: "ellipse" },
    speakingComplete: { rx: 2, ry: 2, dy: 0, shape: "ellipse" }
  },
  blink: { closedRx: 2, closedRy: 0.3 }
});

describe("Vultus model zoo", () => {
  it("registers procedural and Lottie models by stable identifier", () => {
    const lottie = defineLottieAvatarModel({
      id: "reporter",
      name: "Reporter",
      animationData,
      fallbackSegment: [0, 60],
      stateSegments: { thinking: [5, 20] }
    });
    const zoo = createBotAvatarModelZoo([VULTUS_CLASSIC_MODEL, lottie]);
    expect(avatarModelFromZoo(zoo, "reporter")).toBe(lottie);
    expect(avatarModelFromZoo(zoo, "missing")).toBe(VULTUS_CLASSIC_MODEL);
  });

  it("rejects duplicate model identifiers", () => {
    expect(() =>
      createBotAvatarModelZoo([VULTUS_CLASSIC_MODEL, VULTUS_CLASSIC_MODEL])
    ).toThrow("Vultus model identifiers must be unique.");
  });

  it("registers a custom procedural model alongside the classic one", () => {
    const zoo = createBotAvatarModelZoo([VULTUS_CLASSIC_MODEL, mouthlessModel]);
    expect(avatarModelFromZoo(zoo, "test-mouthless")).toBe(mouthlessModel);
    expect(mouthlessModel.renderer).toBe("procedural");
  });
});

describe("computeAllFacialPathsForState with a mouthless model", () => {
  it("returns an empty mouth path instead of throwing", () => {
    const paths = computeAllFacialPathsForState(mouthlessModel, "neutral");
    expect(paths.leftEyePathString).toContain("M");
    expect(paths.rightEyePathString).toContain("M");
    expect(paths.mouthPathString).toBe("");
  });
});
