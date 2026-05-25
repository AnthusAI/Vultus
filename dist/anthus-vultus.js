import { jsxs as D, jsx as m } from "react/jsx-runtime";
import { useId as Y, useRef as S, useEffect as X } from "react";
import { gsap as f } from "gsap";
const _ = 0.5522847498, U = /-?\d+(?:\.\d+)?/g, q = (e, t, n, r) => {
  const o = n * _, a = r * _;
  return "M " + (e - n) + " " + t + " C " + (e - n) + " " + (t - a) + " " + (e - o) + " " + (t - r) + " " + e + " " + (t - r) + " C " + (e + o) + " " + (t - r) + " " + (e + n) + " " + (t - a) + " " + (e + n) + " " + t + " C " + (e + n) + " " + (t + a) + " " + (e + o) + " " + (t + r) + " " + e + " " + (t + r) + " C " + (e - o) + " " + (t + r) + " " + (e - n) + " " + (t + a) + " " + (e - n) + " " + t + " Z";
}, ee = (e, t, n, r, o) => {
  const a = n * _, s = 0.18, i = 1.5, u = o === "down", c = u ? r * s : r * i, h = u ? r * i : r * s, d = t - c, p = t + h, E = c * _, b = h * _;
  return "M " + (e - n) + " " + t + " C " + (e - n) + " " + (t - E) + " " + (e - a) + " " + d + " " + e + " " + d + " C " + (e + a) + " " + d + " " + (e + n) + " " + (t - E) + " " + (e + n) + " " + t + " C " + (e + n) + " " + (t + b) + " " + (e + a) + " " + p + " " + e + " " + p + " C " + (e - a) + " " + p + " " + (e - n) + " " + (t + b) + " " + (e - n) + " " + t + " Z";
}, k = (e, t, n) => {
  var s, i;
  const r = ((s = e.match(U)) == null ? void 0 : s.map(Number)) ?? [], o = ((i = t.match(U)) == null ? void 0 : i.map(Number)) ?? [];
  let a = 0;
  return e.replace(U, () => {
    const u = r[a] ?? 0, c = o[a] ?? 0, h = u + (c - u) * n;
    return a += 1, h.toFixed(3);
  });
}, te = [
  "neutral",
  "thinking",
  "deepThinking",
  "toolCalling",
  "toolResponse",
  "speakingOpen",
  "speakingWide",
  "speakingRound",
  "speakingComplete"
], I = {
  leftEyeCenterX: 70,
  rightEyeCenterX: 130,
  eyeBaselineCenterY: 90,
  mouthCenterX: 100,
  mouthBaselineCenterY: 122
}, ne = {
  neutral: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  thinking: { rx: 14, ry: 14, dy: -4, shape: "ellipse" },
  deepThinking: { rx: 17, ry: 2, dy: 0, shape: "ellipse" },
  toolCalling: { rx: 5, ry: 16, dy: 0, shape: "ellipse" },
  toolResponse: { rx: 17, ry: 17, dy: 0, shape: "ellipse" },
  speakingOpen: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  speakingWide: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  speakingRound: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  speakingComplete: { rx: 16, ry: 5, dy: -1, shape: "curvedLens", curveDirection: "up" }
}, re = {
  neutral: { rx: 25, ry: 10, dy: 0, shape: "curvedLens", curveDirection: "down" },
  thinking: { rx: 6, ry: 6, dy: 0, shape: "ellipse" },
  deepThinking: { rx: 24, ry: 2, dy: 0, shape: "ellipse" },
  toolCalling: { rx: 7, ry: 7, dy: 0, shape: "ellipse" },
  toolResponse: { rx: 9, ry: 14, dy: 0, shape: "ellipse" },
  speakingOpen: { rx: 13, ry: 18, dy: 5, shape: "ellipse" },
  speakingWide: { rx: 22, ry: 7, dy: 0, shape: "ellipse" },
  speakingRound: { rx: 10, ry: 13, dy: 0, shape: "ellipse" },
  speakingComplete: { rx: 25, ry: 11, dy: 0, shape: "curvedLens", curveDirection: "down" }
}, V = (e, t, n) => {
  const r = t + n.dy;
  return n.shape === "curvedLens" ? ee(
    e,
    r,
    n.rx,
    n.ry,
    n.curveDirection ?? "down"
  ) : q(e, r, n.rx, n.ry);
}, w = (e) => {
  const t = ne[e], n = re[e];
  return {
    leftEyePathString: V(
      I.leftEyeCenterX,
      I.eyeBaselineCenterY,
      t
    ),
    rightEyePathString: V(
      I.rightEyeCenterX,
      I.eyeBaselineCenterY,
      t
    ),
    mouthPathString: V(
      I.mouthCenterX,
      I.mouthBaselineCenterY,
      n
    )
  };
}, Te = [
  { stateKey: "neutral", buttonLabel: "Neutral", romanNumeralIndex: "I" },
  { stateKey: "thinking", buttonLabel: "Thinking", romanNumeralIndex: "II" },
  { stateKey: "deepThinking", buttonLabel: "Deep Thinking", romanNumeralIndex: "III" },
  { stateKey: "toolCalling", buttonLabel: "Tool Calling", romanNumeralIndex: "IV" },
  { stateKey: "toolResponse", buttonLabel: "Tool Response", romanNumeralIndex: "V" },
  { stateKey: "speakingOpen", buttonLabel: "Speaking · Open", romanNumeralIndex: "VI" },
  { stateKey: "speakingWide", buttonLabel: "Speaking · Wide", romanNumeralIndex: "VII" },
  { stateKey: "speakingRound", buttonLabel: "Speaking · Round", romanNumeralIndex: "VIII" },
  { stateKey: "speakingComplete", buttonLabel: "Speaking Complete", romanNumeralIndex: "IX" }
], xe = [
  { stateKey: "speakingOpen", holdMilliseconds: 280 },
  { stateKey: "speakingRound", holdMilliseconds: 220 },
  { stateKey: "speakingWide", holdMilliseconds: 260 },
  { stateKey: "speakingOpen", holdMilliseconds: 220 },
  { stateKey: "speakingRound", holdMilliseconds: 200 },
  { stateKey: "speakingWide", holdMilliseconds: 260 },
  { stateKey: "speakingComplete", holdMilliseconds: 900 },
  { stateKey: "neutral", holdMilliseconds: 0 }
], Ie = (e) => e.replace(/([A-Z])/g, " $1").replace(/^./, (t) => t.toUpperCase()).trim(), ae = "dimgray", ie = "white", oe = 1e4, le = 2e4, se = 1e3, ue = 2e3, A = (e, t, n, r) => q(e, t, n, r), ce = (e, t) => {
  const n = w("neutral"), r = A(70, 90, 13, 1.5), o = A(130, 90, 13, 1.5), a = Math.max(t / 1e3, 1), s = Math.max(0.3, a - 0.52), i = f.timeline(), u = { value: 0 }, c = () => {
    var d, p;
    const h = u.value;
    (d = e.leftEyePathElementRef.current) == null || d.setAttribute(
      "d",
      k(n.leftEyePathString, r, h)
    ), (p = e.rightEyePathElementRef.current) == null || p.setAttribute(
      "d",
      k(n.rightEyePathString, o, h)
    );
  };
  return i.to(u, {
    value: 1,
    duration: 0.1,
    ease: "power2.in",
    onUpdate: c
  }), i.to(u, {
    value: 0,
    duration: 0.16,
    ease: "power2.out",
    onUpdate: c
  }), i.to({}, { duration: s * 0.45 }), i.to(u, {
    value: 1,
    duration: 0.08,
    ease: "power2.in",
    onUpdate: c
  }), i.to(u, {
    value: 0,
    duration: 0.12,
    ease: "power2.out",
    onUpdate: c
  }), i.to({}, { duration: s * 0.55 }), i;
}, de = (e, t) => {
  const n = Math.max(t / 1e3, 1), r = n * 0.24, o = n * 0.14, a = A(70, 90, 14, 14), s = A(130, 90, 14, 14), i = A(75, 90, 14, 14), u = A(135, 90, 14, 14), c = A(65, 90, 14, 14), h = A(125, 90, 14, 14), d = f.timeline(), p = (E, b, M, R, y) => {
    const v = { value: 0 };
    d.to(v, {
      value: 1,
      duration: y,
      ease: "sine.inOut",
      onUpdate: () => {
        var L, l;
        const C = v.value;
        (L = e.leftEyePathElementRef.current) == null || L.setAttribute(
          "d",
          k(E, b, C)
        ), (l = e.rightEyePathElementRef.current) == null || l.setAttribute(
          "d",
          k(M, R, C)
        );
      }
    });
  };
  return p(a, i, s, u, r), d.to({}, { duration: o }), p(i, c, u, h, r), d.to({}, { duration: o }), p(c, a, h, s, r), d.to({}, { duration: Math.max(0.08, n - (r * 3 + o * 2)) }), d;
}, he = (e, t) => {
  const n = Math.max(t / 1e3, 1), r = f.timeline();
  return e.antennaCircleElementRef.current && r.to(e.antennaCircleElementRef.current, {
    scale: 1.36,
    transformOrigin: "100px 20px",
    duration: n * 0.18,
    yoyo: !0,
    repeat: 3,
    ease: "sine.inOut"
  }, 0), e.innerHeadGroupElementRef.current && r.to(e.innerHeadGroupElementRef.current, {
    y: -1.5,
    duration: n * 0.22,
    yoyo: !0,
    repeat: 3,
    ease: "sine.inOut"
  }, 0), r.to({}, { duration: Math.max(0.08, n * 0.12) }), r;
}, z = (e, t, n, r) => {
  const a = t.map((i) => ({
    leftEyePath: A(i.leftEyeCenter[0], i.leftEyeCenter[1], 14, 14),
    rightEyePath: A(
      i.rightEyeCenter[0],
      i.rightEyeCenter[1],
      14,
      14
    )
  })), s = f.timeline({ repeat: -1 });
  for (let i = 0; i < a.length; i += 1) {
    const u = a[i], c = a[(i + 1) % a.length], h = { value: 0 };
    s.to(h, {
      value: 1,
      duration: n,
      ease: "power2.inOut",
      onUpdate: () => {
        var p, E;
        const d = h.value;
        (p = e.leftEyePathElementRef.current) == null || p.setAttribute(
          "d",
          k(u.leftEyePath, c.leftEyePath, d)
        ), (E = e.rightEyePathElementRef.current) == null || E.setAttribute(
          "d",
          k(u.rightEyePath, c.rightEyePath, d)
        );
      }
    }), s.to({}, { duration: r(i) });
  }
  return s;
}, pe = (e) => z(
  e,
  [
    { leftEyeCenter: [70, 86], rightEyeCenter: [130, 86] },
    { leftEyeCenter: [66, 84], rightEyeCenter: [126, 84] },
    { leftEyeCenter: [70, 82], rightEyeCenter: [130, 82] },
    { leftEyeCenter: [74, 84], rightEyeCenter: [134, 84] }
  ],
  0.5,
  () => 1.1 + Math.random() * 0.6
), me = (e) => z(
  e,
  [
    { leftEyeCenter: [66, 90], rightEyeCenter: [126, 90] },
    { leftEyeCenter: [70, 90], rightEyeCenter: [130, 90] },
    { leftEyeCenter: [74, 90], rightEyeCenter: [134, 90] },
    { leftEyeCenter: [70, 90], rightEyeCenter: [130, 90] }
  ],
  0.16,
  () => 0.35
), K = (e, t) => {
  if (!e)
    return { kill: () => {
    } };
  const n = f.to(e, t);
  return {
    kill: () => {
      n.kill(), f.set(e, { clearProps: "transform" });
    }
  };
}, ye = (e) => K(e.innerHeadGroupElementRef.current, {
  scale: 1.025,
  transformOrigin: "100px 100px",
  duration: 2.6,
  yoyo: !0,
  repeat: -1,
  ease: "sine.inOut"
}), ge = (e) => K(e.antennaCircleElementRef.current, {
  scale: 1.45,
  transformOrigin: "100px 20px",
  duration: 0.42,
  yoyo: !0,
  repeat: -1,
  ease: "sine.inOut"
}), fe = (e) => K(e.innerHeadGroupElementRef.current, {
  y: -2,
  duration: 0.7,
  yoyo: !0,
  repeat: -1,
  ease: "sine.inOut"
}), F = (e, t, n) => {
  const r = w(t).mouthPathString, o = w(n).mouthPathString, a = { value: 0 };
  return f.to(a, {
    value: 1,
    duration: 0.18,
    yoyo: !0,
    repeat: -1,
    ease: "sine.inOut",
    onUpdate: () => {
      var s;
      (s = e.mouthPathElementRef.current) == null || s.setAttribute(
        "d",
        k(r, o, a.value)
      );
    }
  });
}, j = [
  ce,
  de,
  he
], Ee = {
  thinking: (e) => pe(e),
  deepThinking: (e) => ye(e),
  toolCalling: (e) => ge(e),
  toolResponse: (e) => me(e),
  speakingOpen: (e) => F(e, "speakingOpen", "speakingRound"),
  speakingWide: (e) => F(e, "speakingWide", "speakingOpen"),
  speakingRound: (e) => F(e, "speakingRound", "speakingWide"),
  speakingComplete: (e) => fe(e)
}, Re = (e) => te.includes(e), Q = (e, t) => e + Math.floor(Math.random() * (t - e + 1)), Pe = () => j[Math.floor(Math.random() * j.length)], Ae = () => typeof window > "u" || typeof window.matchMedia != "function" ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches, Me = ({
  state: e = "neutral",
  neutralIdleMode: t = "bored-random",
  size: n = 240,
  transitionDurationSeconds: r = 0.55,
  shadowColor: o = ae,
  lightColor: a = ie,
  ariaLabel: s
}) => {
  const i = Re(e) ? e : "neutral", c = `bot-avatar-head-clip-${Y().replace(/:/g, "")}`, h = S(null), d = S(null), p = S(null), E = S(null), b = S(null), M = S(null), R = S(null), y = S(null), v = S(w(i));
  X(() => {
    var W, Z;
    const l = {
      leftEyePathElementRef: h,
      rightEyePathElementRef: d,
      mouthPathElementRef: p,
      antennaCircleElementRef: E,
      innerHeadGroupElementRef: b
    };
    if (!l.leftEyePathElementRef.current || !l.rightEyePathElementRef.current || !l.mouthPathElementRef.current)
      return;
    (W = M.current) == null || W.kill(), (Z = R.current) == null || Z.kill(), y.current && (clearTimeout(y.current), y.current = null), l.innerHeadGroupElementRef.current && f.set(l.innerHeadGroupElementRef.current, { clearProps: "transform" }), l.antennaCircleElementRef.current && f.set(l.antennaCircleElementRef.current, { clearProps: "transform" });
    const T = {
      leftEyePathString: l.leftEyePathElementRef.current.getAttribute("d") ?? "",
      rightEyePathString: l.rightEyePathElementRef.current.getAttribute("d") ?? "",
      mouthPathString: l.mouthPathElementRef.current.getAttribute("d") ?? ""
    }, x = w(i), H = (g, P) => {
      y.current && clearTimeout(y.current), y.current = setTimeout(() => {
        y.current = null, P();
      }, g);
    }, J = () => {
      const g = () => {
        const P = Q(
          oe,
          le
        );
        H(P, () => {
          var N;
          const B = Q(
            se,
            ue
          ), O = Pe();
          (N = R.current) == null || N.kill(), R.current = O(l, B), H(B, () => {
            var $;
            ($ = R.current) == null || $.kill(), R.current = null, l.innerHeadGroupElementRef.current && f.set(l.innerHeadGroupElementRef.current, { clearProps: "transform" }), l.antennaCircleElementRef.current && f.set(l.antennaCircleElementRef.current, { clearProps: "transform" }), g();
          });
        });
      };
      g();
    }, G = () => {
      if (i === "neutral") {
        if (t === "static" || Ae()) {
          R.current = null;
          return;
        }
        J();
        return;
      }
      const g = Ee[i];
      R.current = g(l);
    };
    if (T.leftEyePathString === x.leftEyePathString && T.rightEyePathString === x.rightEyePathString && T.mouthPathString === x.mouthPathString)
      G();
    else {
      const g = { easedProgress: 0 };
      M.current = f.to(g, {
        easedProgress: 1,
        duration: r,
        ease: "power3.inOut",
        onUpdate: () => {
          var B, O, N;
          const P = g.easedProgress;
          (B = l.leftEyePathElementRef.current) == null || B.setAttribute(
            "d",
            k(
              T.leftEyePathString,
              x.leftEyePathString,
              P
            )
          ), (O = l.rightEyePathElementRef.current) == null || O.setAttribute(
            "d",
            k(
              T.rightEyePathString,
              x.rightEyePathString,
              P
            )
          ), (N = l.mouthPathElementRef.current) == null || N.setAttribute(
            "d",
            k(
              T.mouthPathString,
              x.mouthPathString,
              P
            )
          );
        },
        onComplete: G
      });
    }
    return () => {
      var g, P;
      (g = M.current) == null || g.kill(), (P = R.current) == null || P.kill(), y.current && (clearTimeout(y.current), y.current = null);
    };
  }, [i, t, r]);
  const C = v.current, L = s ?? `Bot avatar - ${i} state`;
  return /* @__PURE__ */ D(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 200 200",
      width: n,
      height: n,
      role: "img",
      "aria-label": L,
      style: { display: "block" },
      children: [
        /* @__PURE__ */ m("defs", { children: /* @__PURE__ */ m("clipPath", { id: c, children: /* @__PURE__ */ m("circle", { cx: 100, cy: 100, r: 90 }) }) }),
        /* @__PURE__ */ m("rect", { width: 200, height: 200, fill: a }),
        /* @__PURE__ */ D("g", { ref: b, children: [
          /* @__PURE__ */ m("circle", { cx: 100, cy: 100, r: 90, fill: o }),
          /* @__PURE__ */ D("g", { clipPath: `url(#${c})`, children: [
            /* @__PURE__ */ m("circle", { ref: E, cx: 100, cy: 20, r: 10, fill: a }),
            /* @__PURE__ */ m("rect", { x: 95, y: 25, width: 10, height: 25, fill: a }),
            /* @__PURE__ */ m("rect", { x: 15, y: 80, width: 30, height: 40, rx: 8, fill: a }),
            /* @__PURE__ */ m("rect", { x: 155, y: 80, width: 30, height: 40, rx: 8, fill: a }),
            /* @__PURE__ */ m("rect", { x: 35, y: 45, width: 130, height: 100, rx: 30, fill: a }),
            /* @__PURE__ */ m("rect", { x: 80, y: 140, width: 40, height: 20, fill: a }),
            /* @__PURE__ */ m("path", { d: "M 20 200 Q 100 150 180 200 Z", fill: a }),
            /* @__PURE__ */ m("path", { ref: h, d: C.leftEyePathString, fill: o }),
            /* @__PURE__ */ m("path", { ref: d, d: C.rightEyePathString, fill: o }),
            /* @__PURE__ */ m("path", { ref: p, d: C.mouthPathString, fill: o })
          ] })
        ] })
      ]
    }
  );
};
export {
  te as BOT_AVATAR_STATES,
  Me as BotAvatar,
  xe as automatedSpeakingPlaybackSequence,
  w as computeAllFacialPathsForState,
  Ie as formatStateKeyAsReadableLabel,
  Te as orderedStateButtonDescriptors
};
