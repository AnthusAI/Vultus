import { describe, expect, it } from "vitest";
import {
  avatarModelFromZoo,
  createBotAvatarModelZoo,
  defineLottieAvatarModel,
  VULTUS_CLASSIC_MODEL
} from "../lib/avatarModels";

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
});
