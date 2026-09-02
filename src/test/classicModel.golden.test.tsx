import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BotAvatar } from "../lib/BotAvatar";
import { BOT_AVATAR_STATES, computeAllFacialPathsForState } from "../lib/avatarStates";
import { VULTUS_CLASSIC_MODEL } from "../lib/avatarModels";

/**
 * Locks the exact rendered output of VULTUS_CLASSIC_MODEL before the
 * skinnable-model refactor (Part A). Any diff here means the refactor
 * changed what ships today, which must not happen.
 */
describe("VULTUS_CLASSIC_MODEL golden output", () => {
  it("computes identical facial paths for every state", () => {
    for (const state of BOT_AVATAR_STATES) {
      expect(computeAllFacialPathsForState(VULTUS_CLASSIC_MODEL, state)).toMatchSnapshot(state);
    }
  });

  it("renders identical SVG markup for every state", () => {
    for (const state of BOT_AVATAR_STATES) {
      const { container, unmount } = render(<BotAvatar state={state} />);
      expect(container.querySelector("svg")?.outerHTML).toMatchSnapshot(state);
      unmount();
    }
  });

  it("renders identical SVG markup with custom size and colors", () => {
    const { container } = render(
      <BotAvatar state="thinking" size={321} shadowColor="#111111" lightColor="#fafafa" />
    );
    expect(container.querySelector("svg")?.outerHTML).toMatchSnapshot();
  });
});
