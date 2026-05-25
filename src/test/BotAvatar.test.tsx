import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BotAvatar } from "../lib/BotAvatar";
import { BOT_AVATAR_STATES } from "../lib/avatarStates";

describe("BotAvatar", () => {
  it("renders an SVG with the default aria label", () => {
    render(<BotAvatar state="thinking" />);
    expect(screen.getByRole("img", { name: "Bot avatar - thinking state" })).toBeInTheDocument();
  });

  it("applies size and colors", () => {
    const { container } = render(<BotAvatar size={321} shadowColor="#111111" lightColor="#fafafa" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "321");
    expect(svg).toHaveAttribute("height", "321");
    expect(container.querySelector('circle[fill="#111111"]')).toBeTruthy();
    expect(container.querySelector('rect[fill="#fafafa"]')).toBeTruthy();
  });

  it("accepts all exported state keys", () => {
    BOT_AVATAR_STATES.forEach((state) => {
      const { unmount } = render(<BotAvatar state={state} />);
      expect(screen.getByRole("img", { name: `Bot avatar - ${state} state` })).toBeInTheDocument();
      unmount();
    });
  });

  it("handles state transitions", () => {
    const { rerender } = render(<BotAvatar state="neutral" transitionDurationSeconds={0.01} />);
    rerender(<BotAvatar state="toolResponse" transitionDurationSeconds={0.01} />);
    expect(screen.getByRole("img", { name: "Bot avatar - toolResponse state" })).toBeInTheDocument();
  });
});
