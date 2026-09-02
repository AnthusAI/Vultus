import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BotAvatar } from "../lib/BotAvatar";
import { CHATTICUS_MARK_MODEL } from "../lib/chatticusModels";

describe("CHATTICUS_MARK_MODEL", () => {
  it("renders a mouthless 28x28 mark with exactly two eye paths plus two body paths", () => {
    const { container } = render(<BotAvatar model={CHATTICUS_MARK_MODEL} size={28} neutralIdleMode="static" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 28 28");
    expect(svg).toHaveAttribute("width", "28");
    expect(svg).toHaveAttribute("height", "28");
    // 2 body bubbles + 2 eyes, no mouth.
    expect(container.querySelectorAll("path")).toHaveLength(4);
  });

  it("renders the not-inverse colorway (ink body, clay accent, paper eyes)", () => {
    const { container } = render(
      <BotAvatar
        model={CHATTICUS_MARK_MODEL}
        neutralIdleMode="static"
        shadowColor="#11130f"
        accentColor="#ef6a47"
        lightColor="#f2efe7"
      />
    );
    const fills = Array.from(container.querySelectorAll("path")).map((path) => path.getAttribute("fill"));
    expect(fills).toEqual(["#11130f", "#ef6a47", "#f2efe7", "#f2efe7"]);
  });

  it("renders the inverse colorway (paper body, signal accent, ink eyes)", () => {
    const { container } = render(
      <BotAvatar
        model={CHATTICUS_MARK_MODEL}
        neutralIdleMode="static"
        shadowColor="#f2efe7"
        accentColor="#b8f34a"
        lightColor="#11130f"
      />
    );
    const fills = Array.from(container.querySelectorAll("path")).map((path) => path.getAttribute("fill"));
    expect(fills).toEqual(["#f2efe7", "#b8f34a", "#11130f", "#11130f"]);
  });

  it("supports gaze without crashing and without a mouth ref", () => {
    const { container } = render(
      <BotAvatar model={CHATTICUS_MARK_MODEL} gaze={{ x: 1, y: 1 }} neutralIdleMode="static" />
    );
    const gazeGroup = container.querySelector(".vultus-gaze");
    expect(gazeGroup).toBeTruthy();
    expect(gazeGroup?.querySelectorAll("path")).toHaveLength(2);
    // right=1.4, down=1.1 per the model's travel budget
    expect((gazeGroup as SVGGElement).style.transform).toBe("translate(1.4px, 1.1px)");
  });
});
