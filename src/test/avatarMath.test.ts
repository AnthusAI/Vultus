import { describe, expect, it } from "vitest";
import { buildRoundedRectPath } from "../lib/avatarMath";

describe("buildRoundedRectPath", () => {
  it("starts and ends at the same point (closed path)", () => {
    const path = buildRoundedRectPath(0, 4, 20, 16, {
      topLeft: 8,
      topRight: 8,
      bottomRight: 8,
      bottomLeft: 1.85
    });
    expect(path.startsWith("M 8 4")).toBe(true);
    expect(path.endsWith("Z")).toBe(true);
  });

  it("produces two 90-degree arcs (not one 180-degree arc) when adjacent radii sum to the full edge", () => {
    // The Chatticus mark's ink bubble: topRight + bottomRight === height (16),
    // so the right edge is a full semicircular cap with no straight segment.
    const path = buildRoundedRectPath(0, 4, 20, 16, {
      topLeft: 8,
      topRight: 8,
      bottomRight: 8,
      bottomLeft: 1.85
    });
    const arcCommands = path.match(/A [\d.]+ [\d.]+ 0 0 1/g) ?? [];
    expect(arcCommands).toHaveLength(4);
  });

  it("matches the derived clamped geometry for the Chatticus mark's ink bubble", () => {
    const path = buildRoundedRectPath(0, 4, 20, 16, {
      topLeft: 8,
      topRight: 8,
      bottomRight: 8,
      bottomLeft: 1.85
    });
    // Right-side arcs both pivot through (20, 12): a full semicircle.
    expect(path).toContain("20 12");
    // Bottom-right and top-right corner centers coincide at (12, 12).
    expect(path).toContain("12 20");
  });

  it("matches the derived clamped geometry for the Chatticus mark's clay bubble", () => {
    const path = buildRoundedRectPath(8, 8, 20, 16, {
      topLeft: 8,
      topRight: 8,
      bottomRight: 1.85,
      bottomLeft: 8
    });
    // Left-side arcs both pivot through (8, 16): a full semicircle.
    expect(path).toContain("8 16");
  });

  it("degenerates to a plain rect when all radii are zero", () => {
    const path = buildRoundedRectPath(0, 0, 10, 10, {
      topLeft: 0,
      topRight: 0,
      bottomRight: 0,
      bottomLeft: 0
    });
    expect(path).toBe("M 0 0 L 10 0 A 0 0 0 0 1 10 0 L 10 10 A 0 0 0 0 1 10 10 L 0 10 A 0 0 0 0 1 0 10 L 0 0 A 0 0 0 0 1 0 0 Z");
  });
});
