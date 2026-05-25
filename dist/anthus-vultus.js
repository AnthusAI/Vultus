import { jsxs as w, jsx as s } from "react/jsx-runtime";
import { useId as Z, useRef as m, useEffect as $ } from "react";
import { gsap as E } from "gsap";
const A = 0.5522847498, O = /-?\d+(?:\.\d+)?/g, H = (e, t, n, r) => {
  const i = n * A, a = r * A;
  return "M " + (e - n) + " " + t + " C " + (e - n) + " " + (t - a) + " " + (e - i) + " " + (t - r) + " " + e + " " + (t - r) + " C " + (e + i) + " " + (t - r) + " " + (e + n) + " " + (t - a) + " " + (e + n) + " " + t + " C " + (e + n) + " " + (t + a) + " " + (e + i) + " " + (t + r) + " " + e + " " + (t + r) + " C " + (e - i) + " " + (t + r) + " " + (e - n) + " " + (t + a) + " " + (e - n) + " " + t + " Z";
}, j = (e, t, n, r, i) => {
  const a = n * A, l = 0.18, o = 1.5, h = i === "down", d = h ? r * l : r * o, p = h ? r * o : r * l, c = t - d, y = t + p, g = d * A, R = p * A;
  return "M " + (e - n) + " " + t + " C " + (e - n) + " " + (t - g) + " " + (e - a) + " " + c + " " + e + " " + c + " C " + (e + a) + " " + c + " " + (e + n) + " " + (t - g) + " " + (e + n) + " " + t + " C " + (e + n) + " " + (t + R) + " " + (e + a) + " " + y + " " + e + " " + y + " C " + (e - a) + " " + y + " " + (e - n) + " " + (t + R) + " " + (e - n) + " " + t + " Z";
}, f = (e, t, n) => {
  var l, o;
  const r = ((l = e.match(O)) == null ? void 0 : l.map(Number)) ?? [], i = ((o = t.match(O)) == null ? void 0 : o.map(Number)) ?? [];
  let a = 0;
  return e.replace(O, () => {
    const h = r[a] ?? 0, d = i[a] ?? 0, p = h + (d - h) * n;
    return a += 1, p.toFixed(3);
  });
}, Q = [
  "neutral",
  "thinking",
  "deepThinking",
  "toolCalling",
  "toolResponse",
  "speakingOpen",
  "speakingWide",
  "speakingRound",
  "speakingComplete"
], b = {
  leftEyeCenterX: 70,
  rightEyeCenterX: 130,
  eyeBaselineCenterY: 90,
  mouthCenterX: 100,
  mouthBaselineCenterY: 122
}, q = {
  neutral: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  thinking: { rx: 14, ry: 14, dy: -4, shape: "ellipse" },
  deepThinking: { rx: 17, ry: 2, dy: 0, shape: "ellipse" },
  toolCalling: { rx: 5, ry: 16, dy: 0, shape: "ellipse" },
  toolResponse: { rx: 17, ry: 17, dy: 0, shape: "ellipse" },
  speakingOpen: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  speakingWide: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  speakingRound: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  speakingComplete: { rx: 16, ry: 5, dy: -1, shape: "curvedLens", curveDirection: "up" }
}, z = {
  neutral: { rx: 25, ry: 10, dy: 0, shape: "curvedLens", curveDirection: "down" },
  thinking: { rx: 6, ry: 6, dy: 0, shape: "ellipse" },
  deepThinking: { rx: 24, ry: 2, dy: 0, shape: "ellipse" },
  toolCalling: { rx: 7, ry: 7, dy: 0, shape: "ellipse" },
  toolResponse: { rx: 9, ry: 14, dy: 0, shape: "ellipse" },
  speakingOpen: { rx: 13, ry: 18, dy: 5, shape: "ellipse" },
  speakingWide: { rx: 22, ry: 7, dy: 0, shape: "ellipse" },
  speakingRound: { rx: 10, ry: 13, dy: 0, shape: "ellipse" },
  speakingComplete: { rx: 25, ry: 11, dy: 0, shape: "curvedLens", curveDirection: "down" }
}, B = (e, t, n) => {
  const r = t + n.dy;
  return n.shape === "curvedLens" ? j(
    e,
    r,
    n.rx,
    n.ry,
    n.curveDirection ?? "down"
  ) : H(e, r, n.rx, n.ry);
}, x = (e) => {
  const t = q[e], n = z[e];
  return {
    leftEyePathString: B(
      b.leftEyeCenterX,
      b.eyeBaselineCenterY,
      t
    ),
    rightEyePathString: B(
      b.rightEyeCenterX,
      b.eyeBaselineCenterY,
      t
    ),
    mouthPathString: B(
      b.mouthCenterX,
      b.mouthBaselineCenterY,
      n
    )
  };
}, de = [
  { stateKey: "neutral", buttonLabel: "Neutral", romanNumeralIndex: "I" },
  { stateKey: "thinking", buttonLabel: "Thinking", romanNumeralIndex: "II" },
  { stateKey: "deepThinking", buttonLabel: "Deep Thinking", romanNumeralIndex: "III" },
  { stateKey: "toolCalling", buttonLabel: "Tool Calling", romanNumeralIndex: "IV" },
  { stateKey: "toolResponse", buttonLabel: "Tool Response", romanNumeralIndex: "V" },
  { stateKey: "speakingOpen", buttonLabel: "Speaking · Open", romanNumeralIndex: "VI" },
  { stateKey: "speakingWide", buttonLabel: "Speaking · Wide", romanNumeralIndex: "VII" },
  { stateKey: "speakingRound", buttonLabel: "Speaking · Round", romanNumeralIndex: "VIII" },
  { stateKey: "speakingComplete", buttonLabel: "Speaking Complete", romanNumeralIndex: "IX" }
], pe = [
  { stateKey: "speakingOpen", holdMilliseconds: 280 },
  { stateKey: "speakingRound", holdMilliseconds: 220 },
  { stateKey: "speakingWide", holdMilliseconds: 260 },
  { stateKey: "speakingOpen", holdMilliseconds: 220 },
  { stateKey: "speakingRound", holdMilliseconds: 200 },
  { stateKey: "speakingWide", holdMilliseconds: 260 },
  { stateKey: "speakingComplete", holdMilliseconds: 900 },
  { stateKey: "neutral", holdMilliseconds: 0 }
], ce = (e) => e.replace(/([A-Z])/g, " $1").replace(/^./, (t) => t.toUpperCase()).trim(), J = "dimgray", Y = "white", I = (e, t, n, r) => H(e, t, n, r), X = (e) => {
  const t = x("neutral"), n = I(70, 90, 13, 1.5), r = I(130, 90, 13, 1.5), i = E.timeline({ repeat: -1, repeatDelay: 3.2 }), a = { value: 0 }, l = () => {
    var h, d;
    const o = a.value;
    (h = e.leftEyePathElementRef.current) == null || h.setAttribute(
      "d",
      f(t.leftEyePathString, n, o)
    ), (d = e.rightEyePathElementRef.current) == null || d.setAttribute(
      "d",
      f(t.rightEyePathString, r, o)
    );
  };
  return i.to(a, {
    value: 1,
    duration: 0.1,
    ease: "power2.in",
    onUpdate: l
  }), i.to(a, {
    value: 0,
    duration: 0.16,
    ease: "power2.out",
    onUpdate: l
  }), i;
}, W = (e, t, n, r) => {
  const a = t.map((o) => ({
    leftEyePath: I(o.leftEyeCenter[0], o.leftEyeCenter[1], 14, 14),
    rightEyePath: I(
      o.rightEyeCenter[0],
      o.rightEyeCenter[1],
      14,
      14
    )
  })), l = E.timeline({ repeat: -1 });
  for (let o = 0; o < a.length; o += 1) {
    const h = a[o], d = a[(o + 1) % a.length], p = { value: 0 };
    l.to(p, {
      value: 1,
      duration: n,
      ease: "power2.inOut",
      onUpdate: () => {
        var y, g;
        const c = p.value;
        (y = e.leftEyePathElementRef.current) == null || y.setAttribute(
          "d",
          f(h.leftEyePath, d.leftEyePath, c)
        ), (g = e.rightEyePathElementRef.current) == null || g.setAttribute(
          "d",
          f(h.rightEyePath, d.rightEyePath, c)
        );
      }
    }), l.to({}, { duration: r(o) });
  }
  return l;
}, ee = (e) => W(
  e,
  [
    { leftEyeCenter: [70, 86], rightEyeCenter: [130, 86] },
    { leftEyeCenter: [66, 84], rightEyeCenter: [126, 84] },
    { leftEyeCenter: [70, 82], rightEyeCenter: [130, 82] },
    { leftEyeCenter: [74, 84], rightEyeCenter: [134, 84] }
  ],
  0.5,
  () => 1.1 + Math.random() * 0.6
), te = (e) => W(
  e,
  [
    { leftEyeCenter: [66, 90], rightEyeCenter: [126, 90] },
    { leftEyeCenter: [70, 90], rightEyeCenter: [130, 90] },
    { leftEyeCenter: [74, 90], rightEyeCenter: [134, 90] },
    { leftEyeCenter: [70, 90], rightEyeCenter: [130, 90] }
  ],
  0.16,
  () => 0.35
), N = (e, t) => {
  if (!e)
    return { kill: () => {
    } };
  const n = E.to(e, t);
  return {
    kill: () => {
      n.kill(), E.set(e, { clearProps: "transform" });
    }
  };
}, ne = (e) => N(e.innerHeadGroupElementRef.current, {
  scale: 1.025,
  transformOrigin: "100px 100px",
  duration: 2.6,
  yoyo: !0,
  repeat: -1,
  ease: "sine.inOut"
}), re = (e) => N(e.antennaCircleElementRef.current, {
  scale: 1.45,
  transformOrigin: "100px 20px",
  duration: 0.42,
  yoyo: !0,
  repeat: -1,
  ease: "sine.inOut"
}), ae = (e) => N(e.innerHeadGroupElementRef.current, {
  y: -2,
  duration: 0.7,
  yoyo: !0,
  repeat: -1,
  ease: "sine.inOut"
}), L = (e, t, n) => {
  const r = x(t).mouthPathString, i = x(n).mouthPathString, a = { value: 0 };
  return E.to(a, {
    value: 1,
    duration: 0.18,
    yoyo: !0,
    repeat: -1,
    ease: "sine.inOut",
    onUpdate: () => {
      var l;
      (l = e.mouthPathElementRef.current) == null || l.setAttribute(
        "d",
        f(r, i, a.value)
      );
    }
  });
}, ie = {
  neutral: (e) => X(e),
  thinking: (e) => ee(e),
  deepThinking: (e) => ne(e),
  toolCalling: (e) => re(e),
  toolResponse: (e) => te(e),
  speakingOpen: (e) => L(e, "speakingOpen", "speakingRound"),
  speakingWide: (e) => L(e, "speakingWide", "speakingOpen"),
  speakingRound: (e) => L(e, "speakingRound", "speakingWide"),
  speakingComplete: (e) => ae(e)
}, le = (e) => Q.includes(e), ye = ({
  state: e = "neutral",
  size: t = 240,
  transitionDurationSeconds: n = 0.55,
  shadowColor: r = J,
  lightColor: i = Y,
  ariaLabel: a
}) => {
  const l = le(e) ? e : "neutral", h = `bot-avatar-head-clip-${Z().replace(/:/g, "")}`, d = m(null), p = m(null), c = m(null), y = m(null), g = m(null), R = m(null), T = m(null), U = m(x(l));
  $(() => {
    var _, D;
    const u = {
      leftEyePathElementRef: d,
      rightEyePathElementRef: p,
      mouthPathElementRef: c,
      antennaCircleElementRef: y,
      innerHeadGroupElementRef: g
    };
    if (!u.leftEyePathElementRef.current || !u.rightEyePathElementRef.current || !u.mouthPathElementRef.current)
      return;
    (_ = R.current) == null || _.kill(), (D = T.current) == null || D.kill(), u.innerHeadGroupElementRef.current && E.set(u.innerHeadGroupElementRef.current, { clearProps: "transform" }), u.antennaCircleElementRef.current && E.set(u.antennaCircleElementRef.current, { clearProps: "transform" });
    const k = {
      leftEyePathString: u.leftEyePathElementRef.current.getAttribute("d") ?? "",
      rightEyePathString: u.rightEyePathElementRef.current.getAttribute("d") ?? "",
      mouthPathString: u.mouthPathElementRef.current.getAttribute("d") ?? ""
    }, C = x(l), M = () => {
      const P = ie[l];
      T.current = P(u);
    };
    if (k.leftEyePathString === C.leftEyePathString && k.rightEyePathString === C.rightEyePathString && k.mouthPathString === C.mouthPathString)
      M();
    else {
      const P = { easedProgress: 0 };
      R.current = E.to(P, {
        easedProgress: 1,
        duration: n,
        ease: "power3.inOut",
        onUpdate: () => {
          var K, V, F;
          const S = P.easedProgress;
          (K = u.leftEyePathElementRef.current) == null || K.setAttribute(
            "d",
            f(
              k.leftEyePathString,
              C.leftEyePathString,
              S
            )
          ), (V = u.rightEyePathElementRef.current) == null || V.setAttribute(
            "d",
            f(
              k.rightEyePathString,
              C.rightEyePathString,
              S
            )
          ), (F = u.mouthPathElementRef.current) == null || F.setAttribute(
            "d",
            f(
              k.mouthPathString,
              C.mouthPathString,
              S
            )
          );
        },
        onComplete: M
      });
    }
    return () => {
      var P, S;
      (P = R.current) == null || P.kill(), (S = T.current) == null || S.kill();
    };
  }, [l, n]);
  const v = U.current, G = a ?? `Bot avatar - ${l} state`;
  return /* @__PURE__ */ w(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 200 200",
      width: t,
      height: t,
      role: "img",
      "aria-label": G,
      style: { display: "block" },
      children: [
        /* @__PURE__ */ s("defs", { children: /* @__PURE__ */ s("clipPath", { id: h, children: /* @__PURE__ */ s("circle", { cx: 100, cy: 100, r: 90 }) }) }),
        /* @__PURE__ */ s("rect", { width: 200, height: 200, fill: i }),
        /* @__PURE__ */ w("g", { ref: g, children: [
          /* @__PURE__ */ s("circle", { cx: 100, cy: 100, r: 90, fill: r }),
          /* @__PURE__ */ w("g", { clipPath: `url(#${h})`, children: [
            /* @__PURE__ */ s("circle", { ref: y, cx: 100, cy: 20, r: 10, fill: i }),
            /* @__PURE__ */ s("rect", { x: 95, y: 25, width: 10, height: 25, fill: i }),
            /* @__PURE__ */ s("rect", { x: 15, y: 80, width: 30, height: 40, rx: 8, fill: i }),
            /* @__PURE__ */ s("rect", { x: 155, y: 80, width: 30, height: 40, rx: 8, fill: i }),
            /* @__PURE__ */ s("rect", { x: 35, y: 45, width: 130, height: 100, rx: 30, fill: i }),
            /* @__PURE__ */ s("rect", { x: 80, y: 140, width: 40, height: 20, fill: i }),
            /* @__PURE__ */ s("path", { d: "M 20 200 Q 100 150 180 200 Z", fill: i }),
            /* @__PURE__ */ s("path", { ref: d, d: v.leftEyePathString, fill: r }),
            /* @__PURE__ */ s("path", { ref: p, d: v.rightEyePathString, fill: r }),
            /* @__PURE__ */ s("path", { ref: c, d: v.mouthPathString, fill: r })
          ] })
        ] })
      ]
    }
  );
};
export {
  Q as BOT_AVATAR_STATES,
  ye as BotAvatar,
  pe as automatedSpeakingPlaybackSequence,
  x as computeAllFacialPathsForState,
  ce as formatStateKeyAsReadableLabel,
  de as orderedStateButtonDescriptors
};
