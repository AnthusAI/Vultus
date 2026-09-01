import { createBotAvatarModelZoo, defineLottieAvatarModel } from "./avatarModels";
import type { BotAvatarModel } from "./avatarModels";
import type { BotAvatarState } from "./avatarStates";

export type CreativeRole = "Editor" | "Reporter" | "Copy Writer" | "Illustrator";

export type CreativeMotionState =
  | "ready"
  | "gathering"
  | "drafting"
  | "drawing"
  | "editing"
  | "complete";

type RoleDesign = {
  body: number[];
  accent: number[];
  shape: "capsule" | "circle" | "page" | "diamond";
};

const ink = [0.067, 0.075, 0.059, 1];
const paper = [0.949, 0.937, 0.906, 1];

const designs: Record<CreativeRole, RoleDesign> = {
  Editor: {
    body: [0.937, 0.416, 0.278, 1],
    accent: [0.722, 0.953, 0.29, 1],
    shape: "capsule",
  },
  Reporter: {
    body: [0.31, 0.443, 1, 1],
    accent: [0.451, 0.843, 0.773, 1],
    shape: "circle",
  },
  "Copy Writer": {
    body: [0.722, 0.953, 0.29, 1],
    accent: [0.937, 0.416, 0.278, 1],
    shape: "page",
  },
  Illustrator: {
    body: [0.451, 0.843, 0.773, 1],
    accent: [0.941, 0.737, 0.302, 1],
    shape: "diamond",
  },
};

function transform(position: number[] = [0, 0], rotation = 0) {
  return {
    ty: "tr",
    p: { a: 0, k: position },
    a: { a: 0, k: [0, 0] },
    s: { a: 0, k: [100, 100] },
    r: { a: 0, k: rotation },
    o: { a: 0, k: 100 },
    sk: { a: 0, k: 0 },
    sa: { a: 0, k: 0 },
  };
}

function fill(color: number[]) {
  return {
    ty: "fl",
    c: { a: 0, k: color },
    o: { a: 0, k: 100 },
    r: 1,
  };
}

function ellipse(size: number[], position: number[] = [0, 0]) {
  return {
    ty: "el",
    d: 1,
    s: { a: 0, k: size },
    p: { a: 0, k: position },
  };
}

function rectangle(size: number[], radius: number, position: number[] = [0, 0]) {
  return {
    ty: "rc",
    d: 1,
    s: { a: 0, k: size },
    p: { a: 0, k: position },
    r: { a: 0, k: radius },
  };
}

function shapeLayer(
  index: number,
  name: string,
  shapes: object[],
  layerTransform: object,
) {
  return {
    ddd: 0,
    ind: index,
    ty: 4,
    nm: name,
    sr: 1,
    ks: layerTransform,
    ao: 0,
    shapes,
    ip: 0,
    op: 180,
    st: 0,
    bm: 0,
  };
}

function bodyShape(design: RoleDesign) {
  if (design.shape === "circle") {
    return ellipse([128, 128]);
  }
  if (design.shape === "page") {
    return rectangle([146, 112], 22);
  }
  if (design.shape === "diamond") {
    return rectangle([116, 116], 34);
  }
  return rectangle([104, 148], 52);
}

function roleDetails(role: CreativeRole, design: RoleDesign) {
  if (role === "Editor") {
    return [
      rectangle([92, 8], 4, [0, -44]),
      fill(ink),
      rectangle([20, 62], 10, [58, 18]),
      fill(design.accent),
      transform([0, 0], -16),
    ];
  }
  if (role === "Reporter") {
    return [
      ellipse([28, 28], [66, -52]),
      fill(design.accent),
      rectangle([12, 56], 6, [48, 42]),
      fill(paper),
      transform([0, 0], -24),
    ];
  }
  if (role === "Copy Writer") {
    return [
      rectangle([76, 7], 4, [-12, -20]),
      rectangle([54, 7], 4, [-23, 0]),
      rectangle([68, 7], 4, [-16, 20]),
      fill(ink),
      transform(),
    ];
  }
  return [
    ellipse([38, 38], [-38, -36]),
    fill(design.accent),
    rectangle([16, 96], 8, [52, 18]),
    fill(ink),
    transform([0, 0], 34),
  ];
}

export function creativeMotionAnimation(
  role: CreativeRole,
  state: CreativeMotionState,
) {
  const design = designs[role];
  const amplitude = state === "complete" ? 3 : state === "ready" ? 6 : 13;
  const orbitDirection = role === "Editor" || role === "Illustrator" ? 360 : -360;
  const bodyRotation = role === "Illustrator" ? -12 : 0;

  return {
    v: "5.12.2",
    fr: 60,
    ip: 0,
    op: 180,
    w: 240,
    h: 240,
    nm: `${role} motion character`,
    ddd: 0,
    assets: [],
    layers: [
      shapeLayer(
        1,
        "orbit",
        [
          ellipse([198, 198]),
          {
            ty: "st",
            c: { a: 0, k: design.accent },
            o: { a: 0, k: 68 },
            w: { a: 0, k: 4 },
            lc: 2,
            lj: 2,
            d: [
              { n: "d", nm: "dash", v: { a: 0, k: 12 } },
              { n: "g", nm: "gap", v: { a: 0, k: 15 } },
              { n: "o", nm: "offset", v: { a: 0, k: 0 } },
            ],
          },
          transform(),
        ],
        {
          o: { a: 0, k: 100 },
          r: {
            a: 1,
            k: [
              { t: 0, s: [0], e: [orbitDirection] },
              { t: 180, s: [orbitDirection] },
            ],
          },
          p: { a: 0, k: [120, 120, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] },
        },
      ),
      shapeLayer(
        2,
        "body",
        [bodyShape(design), fill(design.body), transform([0, 0], bodyRotation)],
        {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: {
            a: 1,
            k: [
              { t: 0, s: [120, 120, 0], e: [120, 120 - amplitude, 0] },
              { t: 90, s: [120, 120 - amplitude, 0], e: [120, 120, 0] },
              { t: 180, s: [120, 120, 0] },
            ],
          },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] },
        },
      ),
      shapeLayer(3, "role object", roleDetails(role, design), {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [-3], e: [3] },
            { t: 90, s: [3], e: [-3] },
            { t: 180, s: [-3] },
          ],
        },
        p: { a: 0, k: [120, 120, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      }),
      shapeLayer(
        4,
        "eyes",
        [
          ellipse([18, 22], [-25, -4]),
          ellipse([18, 22], [25, -4]),
          fill(ink),
          transform(),
        ],
        {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [120, 120, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: {
            a: 1,
            k: [
              { t: 0, s: [100, 100, 100], e: [100, 100, 100] },
              { t: 68, s: [100, 100, 100], e: [100, 12, 100] },
              { t: 72, s: [100, 12, 100], e: [100, 100, 100] },
              { t: 180, s: [100, 100, 100] },
            ],
          },
        },
      ),
      shapeLayer(
        5,
        "signal",
        [ellipse([18, 18]), fill(design.accent), transform()],
        {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: {
            a: 1,
            k: [
              { t: 0, s: [120, 18, 0], e: [204, 120, 0] },
              { t: 90, s: [204, 120, 0], e: [120, 222, 0] },
              { t: 180, s: [120, 222, 0] },
            ],
          },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] },
        },
      ),
    ],
  };
}

const sharedStateSegments: Partial<Record<BotAvatarState, readonly [number, number]>> = {
  neutral: [0, 45],
  thinking: [0, 90],
  deepThinking: [30, 120],
  toolCalling: [45, 135],
  toolResponse: [90, 180],
  speakingOpen: [0, 120],
  speakingWide: [30, 150],
  speakingRound: [60, 180],
  speakingComplete: [145, 180],
};

const creativeDeskModels = (Object.keys(designs) as CreativeRole[]).map((role) =>
  defineLottieAvatarModel({
    id: `creative-desk-${role.toLowerCase().replace(/\s+/g, "-")}`,
    name: `Creative Desk ${role}`,
    animationData: creativeMotionAnimation(role, "drafting"),
    fallbackSegment: [0, 90],
    stateSegments: sharedStateSegments,
  }),
);

export const CREATIVE_DESK_MODEL_ZOO = createBotAvatarModelZoo(creativeDeskModels);

export function creativeDeskModelForRole(role: CreativeRole): BotAvatarModel {
  const identifier = `creative-desk-${role.toLowerCase().replace(/\s+/g, "-")}`;
  return CREATIVE_DESK_MODEL_ZOO[identifier];
}
