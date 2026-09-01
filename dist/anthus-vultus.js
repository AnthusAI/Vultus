import { jsx as p, jsxs as G } from "react/jsx-runtime";
import { useRef as P, useState as ce, useEffect as z, useId as de } from "react";
import { gsap as E } from "gsap";
import he from "lottie-react";
const N = 0.5522847498, $ = /-?\d+(?:\.\d+)?/g, re = (e, t, n, r) => {
  const o = n * N, a = r * N;
  return "M " + (e - n) + " " + t + " C " + (e - n) + " " + (t - a) + " " + (e - o) + " " + (t - r) + " " + e + " " + (t - r) + " C " + (e + o) + " " + (t - r) + " " + (e + n) + " " + (t - a) + " " + (e + n) + " " + t + " C " + (e + n) + " " + (t + a) + " " + (e + o) + " " + (t + r) + " " + e + " " + (t + r) + " C " + (e - o) + " " + (t + r) + " " + (e - n) + " " + (t + a) + " " + (e - n) + " " + t + " Z";
}, pe = (e, t, n, r, o) => {
  const a = n * N, l = 0.18, i = 1.5, h = o === "down", s = h ? r * l : r * i, u = h ? r * i : r * l, c = t - s, m = t + u, y = s * N, T = u * N;
  return "M " + (e - n) + " " + t + " C " + (e - n) + " " + (t - y) + " " + (e - a) + " " + c + " " + e + " " + c + " C " + (e + a) + " " + c + " " + (e + n) + " " + (t - y) + " " + (e + n) + " " + t + " C " + (e + n) + " " + (t + T) + " " + (e + a) + " " + m + " " + e + " " + m + " C " + (e - a) + " " + m + " " + (e - n) + " " + (t + T) + " " + (e - n) + " " + t + " Z";
}, D = (e, t, n) => {
  var l, i;
  const r = ((l = e.match($)) == null ? void 0 : l.map(Number)) ?? [], o = ((i = t.match($)) == null ? void 0 : i.map(Number)) ?? [];
  let a = 0;
  return e.replace($, () => {
    const h = r[a] ?? 0, s = o[a] ?? 0, u = h + (s - h) * n;
    return a += 1, u.toFixed(3);
  });
}, me = [
  "neutral",
  "thinking",
  "deepThinking",
  "toolCalling",
  "toolResponse",
  "speakingOpen",
  "speakingWide",
  "speakingRound",
  "speakingComplete"
], x = {
  leftEyeCenterX: 70,
  rightEyeCenterX: 130,
  eyeBaselineCenterY: 90,
  mouthCenterX: 100,
  mouthBaselineCenterY: 122
}, ye = {
  neutral: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  thinking: { rx: 14, ry: 14, dy: -4, shape: "ellipse" },
  deepThinking: { rx: 17, ry: 2, dy: 0, shape: "ellipse" },
  toolCalling: { rx: 5, ry: 16, dy: 0, shape: "ellipse" },
  toolResponse: { rx: 17, ry: 17, dy: 0, shape: "ellipse" },
  speakingOpen: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  speakingWide: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  speakingRound: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  speakingComplete: { rx: 16, ry: 5, dy: -1, shape: "curvedLens", curveDirection: "up" }
}, fe = {
  neutral: { rx: 25, ry: 10, dy: 0, shape: "curvedLens", curveDirection: "down" },
  thinking: { rx: 6, ry: 6, dy: 0, shape: "ellipse" },
  deepThinking: { rx: 24, ry: 2, dy: 0, shape: "ellipse" },
  toolCalling: { rx: 7, ry: 7, dy: 0, shape: "ellipse" },
  toolResponse: { rx: 9, ry: 14, dy: 0, shape: "ellipse" },
  speakingOpen: { rx: 13, ry: 18, dy: 5, shape: "ellipse" },
  speakingWide: { rx: 22, ry: 7, dy: 0, shape: "ellipse" },
  speakingRound: { rx: 10, ry: 13, dy: 0, shape: "ellipse" },
  speakingComplete: { rx: 25, ry: 11, dy: 0, shape: "curvedLens", curveDirection: "down" }
}, j = (e, t, n) => {
  const r = t + n.dy;
  return n.shape === "curvedLens" ? pe(
    e,
    r,
    n.rx,
    n.ry,
    n.curveDirection ?? "down"
  ) : re(e, r, n.rx, n.ry);
}, H = (e) => {
  const t = ye[e], n = fe[e];
  return {
    leftEyePathString: j(
      x.leftEyeCenterX,
      x.eyeBaselineCenterY,
      t
    ),
    rightEyePathString: j(
      x.rightEyeCenterX,
      x.eyeBaselineCenterY,
      t
    ),
    mouthPathString: j(
      x.mouthCenterX,
      x.mouthBaselineCenterY,
      n
    )
  };
}, Qe = [
  { stateKey: "neutral", buttonLabel: "Neutral", romanNumeralIndex: "I" },
  { stateKey: "thinking", buttonLabel: "Thinking", romanNumeralIndex: "II" },
  { stateKey: "deepThinking", buttonLabel: "Deep Thinking", romanNumeralIndex: "III" },
  { stateKey: "toolCalling", buttonLabel: "Tool Calling", romanNumeralIndex: "IV" },
  { stateKey: "toolResponse", buttonLabel: "Tool Response", romanNumeralIndex: "V" },
  { stateKey: "speakingOpen", buttonLabel: "Speaking · Open", romanNumeralIndex: "VI" },
  { stateKey: "speakingWide", buttonLabel: "Speaking · Wide", romanNumeralIndex: "VII" },
  { stateKey: "speakingRound", buttonLabel: "Speaking · Round", romanNumeralIndex: "VIII" },
  { stateKey: "speakingComplete", buttonLabel: "Speaking Complete", romanNumeralIndex: "IX" }
], Je = [
  { stateKey: "speakingOpen", holdMilliseconds: 280 },
  { stateKey: "speakingRound", holdMilliseconds: 220 },
  { stateKey: "speakingWide", holdMilliseconds: 260 },
  { stateKey: "speakingOpen", holdMilliseconds: 220 },
  { stateKey: "speakingRound", holdMilliseconds: 200 },
  { stateKey: "speakingWide", holdMilliseconds: 260 },
  { stateKey: "speakingComplete", holdMilliseconds: 900 },
  { stateKey: "neutral", holdMilliseconds: 0 }
], Ye = (e) => e.replace(/([A-Z])/g, " $1").replace(/^./, (t) => t.toUpperCase()).trim(), ge = () => typeof window > "u" || typeof window.matchMedia != "function" ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function Ee({
  model: e,
  state: t,
  size: n,
  lightColor: r,
  ariaLabel: o
}) {
  const a = P(null), [l, i] = ce(ge), h = e.stateSegments[t] ?? e.fallbackSegment;
  return z(() => {
    if (typeof window > "u" || typeof window.matchMedia != "function")
      return;
    const s = window.matchMedia("(prefers-reduced-motion: reduce)"), u = () => i(s.matches);
    return s.addEventListener("change", u), () => s.removeEventListener("change", u);
  }, []), z(() => {
    var s, u;
    if (l) {
      (s = a.current) == null || s.goToAndStop(h[0], !0);
      return;
    }
    (u = a.current) == null || u.playSegments([h[0], h[1]], !0);
  }, [l, h]), /* @__PURE__ */ p(
    "div",
    {
      role: "img",
      "aria-label": o ?? `Bot avatar - ${t} state - ${e.name} model`,
      "data-vultus-model": e.id,
      "data-vultus-renderer": "lottie",
      style: {
        width: n,
        height: n,
        display: "block",
        overflow: "hidden",
        background: r
      },
      children: /* @__PURE__ */ p(
        he,
        {
          lottieRef: a,
          animationData: e.animationData,
          autoplay: !1,
          loop: !l,
          "aria-hidden": "true",
          style: { width: "100%", height: "100%" }
        }
      )
    }
  );
}
const ae = Object.freeze({
  id: "vultus-classic",
  name: "Vultus Classic",
  renderer: "procedural"
});
function ke(e) {
  return Object.freeze({ ...e, renderer: "lottie" });
}
function Re(e) {
  const t = e.map((r) => [r.id, r]), n = t.map(([r]) => r);
  if (new Set(n).size !== n.length)
    throw new Error("Vultus model identifiers must be unique.");
  return Object.freeze(Object.fromEntries(t));
}
function Xe(e, t, n = ae) {
  return e[t] ?? n;
}
const Pe = "dimgray", oe = "white", Ae = 1e4, be = 2e4, Se = 1e3, De = 2e3, S = (e, t, n, r) => re(e, t, n, r), U = (e, t, n) => {
  const r = H("neutral"), o = S(70, 90, 13, 1.5), a = S(130, 90, 13, 1.5), l = { value: 0 }, i = (n == null ? void 0 : n.closeDuration) ?? 0.09, h = (n == null ? void 0 : n.closedHoldDuration) ?? 0.03, s = (n == null ? void 0 : n.openDuration) ?? 0.13, u = () => {
    var m, y;
    const c = l.value;
    (m = t.leftEyePathElementRef.current) == null || m.setAttribute(
      "d",
      D(r.leftEyePathString, o, c)
    ), (y = t.rightEyePathElementRef.current) == null || y.setAttribute(
      "d",
      D(r.rightEyePathString, a, c)
    );
  };
  e.to(l, {
    value: 1,
    duration: i,
    ease: "power2.in",
    onUpdate: u
  }), h > 0 && e.to({}, { duration: h }), e.to(l, {
    value: 0,
    duration: s,
    ease: "power2.out",
    onUpdate: u
  });
}, Ce = (e, t) => {
  const n = Math.max(t / 1e3, 1), r = Math.max(0.24, n - 0.58), o = E.timeline();
  return U(o, e, {
    closeDuration: 0.1,
    closedHoldDuration: 0.03,
    openDuration: 0.16
  }), o.to({}, { duration: r * 0.45 }), U(o, e, {
    closeDuration: 0.08,
    closedHoldDuration: 0.02,
    openDuration: 0.12
  }), o.to({}, { duration: r * 0.55 }), o;
}, Te = (e, t) => {
  const n = Math.max(t / 1e3, 1), r = n * 0.24, o = n * 0.14, a = S(70, 90, 14, 14), l = S(130, 90, 14, 14), i = S(75, 90, 14, 14), h = S(135, 90, 14, 14), s = S(65, 90, 14, 14), u = S(125, 90, 14, 14), c = E.timeline(), m = (y, T, L, k, f) => {
    const V = { value: 0 };
    c.to(V, {
      value: 1,
      duration: f,
      ease: "sine.inOut",
      onUpdate: () => {
        var F, d;
        const w = V.value;
        (F = e.leftEyePathElementRef.current) == null || F.setAttribute(
          "d",
          D(y, T, w)
        ), (d = e.rightEyePathElementRef.current) == null || d.setAttribute(
          "d",
          D(L, k, w)
        );
      }
    });
  };
  return m(a, i, l, h, r), c.to({}, { duration: o * 0.6 }), U(c, e, {
    closeDuration: 0.08,
    closedHoldDuration: 0.02,
    openDuration: 0.1
  }), c.to({}, { duration: o * 0.4 }), m(i, s, h, u, r), c.to({}, { duration: o * 0.6 }), U(c, e, {
    closeDuration: 0.07,
    closedHoldDuration: 0.01,
    openDuration: 0.09
  }), c.to({}, { duration: o * 0.4 }), m(s, a, u, l, r), c.to({}, { duration: Math.max(0.08, n - (r * 3 + o * 2 + 0.37)) }), c;
}, ve = (e, t) => {
  const n = Math.max(t / 1e3, 1), r = E.timeline();
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
  }, 0), U(r, e, {
    closeDuration: 0.08,
    closedHoldDuration: 0.02,
    openDuration: 0.1
  }), r.to({}, { duration: Math.max(0.08, n * 0.12) }), r;
}, ie = (e, t, n, r) => {
  const a = t.map((i) => ({
    leftEyePath: S(i.leftEyeCenter[0], i.leftEyeCenter[1], 14, 14),
    rightEyePath: S(
      i.rightEyeCenter[0],
      i.rightEyeCenter[1],
      14,
      14
    )
  })), l = E.timeline({ repeat: -1 });
  for (let i = 0; i < a.length; i += 1) {
    const h = a[i], s = a[(i + 1) % a.length], u = { value: 0 };
    l.to(u, {
      value: 1,
      duration: n,
      ease: "power2.inOut",
      onUpdate: () => {
        var m, y;
        const c = u.value;
        (m = e.leftEyePathElementRef.current) == null || m.setAttribute(
          "d",
          D(h.leftEyePath, s.leftEyePath, c)
        ), (y = e.rightEyePathElementRef.current) == null || y.setAttribute(
          "d",
          D(h.rightEyePath, s.rightEyePath, c)
        );
      }
    }), l.to({}, { duration: r(i) });
  }
  return l;
}, we = (e) => ie(
  e,
  [
    { leftEyeCenter: [70, 86], rightEyeCenter: [130, 86] },
    { leftEyeCenter: [66, 84], rightEyeCenter: [126, 84] },
    { leftEyeCenter: [70, 82], rightEyeCenter: [130, 82] },
    { leftEyeCenter: [74, 84], rightEyeCenter: [134, 84] }
  ],
  0.5,
  () => 1.1 + Math.random() * 0.6
), Me = (e) => ie(
  e,
  [
    { leftEyeCenter: [66, 90], rightEyeCenter: [126, 90] },
    { leftEyeCenter: [70, 90], rightEyeCenter: [130, 90] },
    { leftEyeCenter: [74, 90], rightEyeCenter: [134, 90] },
    { leftEyeCenter: [70, 90], rightEyeCenter: [130, 90] }
  ],
  0.16,
  () => 0.35
), q = (e, t) => {
  if (!e)
    return { kill: () => {
    } };
  const n = E.to(e, t);
  return {
    kill: () => {
      n.kill(), E.set(e, { clearProps: "transform" });
    }
  };
}, Ie = (e) => q(e.innerHeadGroupElementRef.current, {
  scale: 1.025,
  transformOrigin: "100px 100px",
  duration: 2.6,
  yoyo: !0,
  repeat: -1,
  ease: "sine.inOut"
}), xe = (e) => q(e.antennaCircleElementRef.current, {
  scale: 1.45,
  transformOrigin: "100px 20px",
  duration: 0.42,
  yoyo: !0,
  repeat: -1,
  ease: "sine.inOut"
}), Le = (e) => q(e.innerHeadGroupElementRef.current, {
  y: -2,
  duration: 0.7,
  yoyo: !0,
  repeat: -1,
  ease: "sine.inOut"
}), Z = (e, t, n) => {
  const r = H(t).mouthPathString, o = H(n).mouthPathString, a = { value: 0 };
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
        D(r, o, a.value)
      );
    }
  });
}, te = [
  Ce,
  Te,
  ve
], Oe = {
  thinking: (e) => we(e),
  deepThinking: (e) => Ie(e),
  toolCalling: (e) => xe(e),
  toolResponse: (e) => Me(e),
  speakingOpen: (e) => Z(e, "speakingOpen", "speakingRound"),
  speakingWide: (e) => Z(e, "speakingWide", "speakingOpen"),
  speakingRound: (e) => Z(e, "speakingRound", "speakingWide"),
  speakingComplete: (e) => Le(e)
}, le = (e) => me.includes(e), ne = (e, t) => e + Math.floor(Math.random() * (t - e + 1)), Be = () => te[Math.floor(Math.random() * te.length)], _e = () => typeof window > "u" || typeof window.matchMedia != "function" ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches, Ne = ({
  state: e = "neutral",
  neutralIdleMode: t = "bored-random",
  size: n = 240,
  transitionDurationSeconds: r = 0.55,
  shadowColor: o = Pe,
  lightColor: a = oe,
  ariaLabel: l
}) => {
  const i = le(e) ? e : "neutral", s = `bot-avatar-head-clip-${de().replace(/:/g, "")}`, u = P(null), c = P(null), m = P(null), y = P(null), T = P(null), L = P(null), k = P(null), f = P(null), V = P(H(i));
  z(() => {
    var Y, X;
    const d = {
      leftEyePathElementRef: u,
      rightEyePathElementRef: c,
      mouthPathElementRef: m,
      antennaCircleElementRef: y,
      innerHeadGroupElementRef: T
    };
    if (!d.leftEyePathElementRef.current || !d.rightEyePathElementRef.current || !d.mouthPathElementRef.current)
      return;
    (Y = L.current) == null || Y.kill(), (X = k.current) == null || X.kill(), f.current && (clearTimeout(f.current), f.current = null), d.innerHeadGroupElementRef.current && E.set(d.innerHeadGroupElementRef.current, { clearProps: "transform" }), d.antennaCircleElementRef.current && E.set(d.antennaCircleElementRef.current, { clearProps: "transform" });
    const M = {
      leftEyePathString: d.leftEyePathElementRef.current.getAttribute("d") ?? "",
      rightEyePathString: d.rightEyePathElementRef.current.getAttribute("d") ?? "",
      mouthPathString: d.mouthPathElementRef.current.getAttribute("d") ?? ""
    }, I = H(i), Q = (g, R) => {
      f.current && clearTimeout(f.current), f.current = setTimeout(() => {
        f.current = null, R();
      }, g);
    }, ue = () => {
      const g = () => {
        const R = ne(
          Ae,
          be
        );
        Q(R, () => {
          var B;
          const O = ne(
            Se,
            De
          ), K = Be();
          (B = k.current) == null || B.kill(), k.current = K(d, O), Q(O, () => {
            var ee;
            (ee = k.current) == null || ee.kill(), k.current = null, d.innerHeadGroupElementRef.current && E.set(d.innerHeadGroupElementRef.current, { clearProps: "transform" }), d.antennaCircleElementRef.current && E.set(d.antennaCircleElementRef.current, { clearProps: "transform" }), g();
          });
        });
      };
      g();
    }, J = () => {
      if (i === "neutral") {
        if (t === "static" || _e()) {
          k.current = null;
          return;
        }
        ue();
        return;
      }
      const g = Oe[i];
      k.current = g(d);
    };
    if (M.leftEyePathString === I.leftEyePathString && M.rightEyePathString === I.rightEyePathString && M.mouthPathString === I.mouthPathString)
      J();
    else {
      const g = { easedProgress: 0 };
      L.current = E.to(g, {
        easedProgress: 1,
        duration: r,
        ease: "power3.inOut",
        onUpdate: () => {
          var O, K, B;
          const R = g.easedProgress;
          (O = d.leftEyePathElementRef.current) == null || O.setAttribute(
            "d",
            D(
              M.leftEyePathString,
              I.leftEyePathString,
              R
            )
          ), (K = d.rightEyePathElementRef.current) == null || K.setAttribute(
            "d",
            D(
              M.rightEyePathString,
              I.rightEyePathString,
              R
            )
          ), (B = d.mouthPathElementRef.current) == null || B.setAttribute(
            "d",
            D(
              M.mouthPathString,
              I.mouthPathString,
              R
            )
          );
        },
        onComplete: J
      });
    }
    return () => {
      var g, R;
      (g = L.current) == null || g.kill(), (R = k.current) == null || R.kill(), f.current && (clearTimeout(f.current), f.current = null);
    };
  }, [i, t, r]);
  const w = V.current, F = l ?? `Bot avatar - ${i} state`;
  return /* @__PURE__ */ G(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 200 200",
      width: n,
      height: n,
      role: "img",
      "aria-label": F,
      style: { display: "block" },
      children: [
        /* @__PURE__ */ p("defs", { children: /* @__PURE__ */ p("clipPath", { id: s, children: /* @__PURE__ */ p("circle", { cx: 100, cy: 100, r: 90 }) }) }),
        /* @__PURE__ */ p("rect", { width: 200, height: 200, fill: a }),
        /* @__PURE__ */ G("g", { ref: T, children: [
          /* @__PURE__ */ p("circle", { cx: 100, cy: 100, r: 90, fill: o }),
          /* @__PURE__ */ G("g", { clipPath: `url(#${s})`, children: [
            /* @__PURE__ */ p("circle", { ref: y, cx: 100, cy: 20, r: 10, fill: a }),
            /* @__PURE__ */ p("rect", { x: 95, y: 25, width: 10, height: 25, fill: a }),
            /* @__PURE__ */ p("rect", { x: 15, y: 80, width: 30, height: 40, rx: 8, fill: a }),
            /* @__PURE__ */ p("rect", { x: 155, y: 80, width: 30, height: 40, rx: 8, fill: a }),
            /* @__PURE__ */ p("rect", { x: 35, y: 45, width: 130, height: 100, rx: 30, fill: a }),
            /* @__PURE__ */ p("rect", { x: 80, y: 140, width: 40, height: 20, fill: a }),
            /* @__PURE__ */ p("path", { d: "M 20 200 Q 100 150 180 200 Z", fill: a }),
            /* @__PURE__ */ p("path", { ref: u, d: w.leftEyePathString, fill: o }),
            /* @__PURE__ */ p("path", { ref: c, d: w.rightEyePathString, fill: o }),
            /* @__PURE__ */ p("path", { ref: m, d: w.mouthPathString, fill: o })
          ] })
        ] })
      ]
    }
  );
}, et = ({
  model: e = ae,
  state: t = "neutral",
  size: n = 240,
  lightColor: r = oe,
  ariaLabel: o,
  ...a
}) => {
  const l = le(t) ? t : "neutral";
  return e.renderer === "lottie" ? /* @__PURE__ */ p(
    Ee,
    {
      model: e,
      state: l,
      size: n,
      lightColor: r,
      ariaLabel: o
    }
  ) : /* @__PURE__ */ p(
    Ne,
    {
      ...a,
      state: l,
      size: n,
      lightColor: r,
      ariaLabel: o
    }
  );
}, W = [0.067, 0.075, 0.059, 1], He = [0.949, 0.937, 0.906, 1], se = {
  Editor: {
    body: [0.937, 0.416, 0.278, 1],
    accent: [0.722, 0.953, 0.29, 1],
    shape: "capsule"
  },
  Reporter: {
    body: [0.31, 0.443, 1, 1],
    accent: [0.451, 0.843, 0.773, 1],
    shape: "circle"
  },
  "Copy Writer": {
    body: [0.722, 0.953, 0.29, 1],
    accent: [0.937, 0.416, 0.278, 1],
    shape: "page"
  },
  Illustrator: {
    body: [0.451, 0.843, 0.773, 1],
    accent: [0.941, 0.737, 0.302, 1],
    shape: "diamond"
  }
};
function C(e = [0, 0], t = 0) {
  return {
    ty: "tr",
    p: { a: 0, k: e },
    a: { a: 0, k: [0, 0] },
    s: { a: 0, k: [100, 100] },
    r: { a: 0, k: t },
    o: { a: 0, k: 100 },
    sk: { a: 0, k: 0 },
    sa: { a: 0, k: 0 }
  };
}
function A(e) {
  return {
    ty: "fl",
    c: { a: 0, k: e },
    o: { a: 0, k: 100 },
    r: 1
  };
}
function v(e, t = [0, 0]) {
  return {
    ty: "el",
    d: 1,
    s: { a: 0, k: e },
    p: { a: 0, k: t }
  };
}
function b(e, t, n = [0, 0]) {
  return {
    ty: "rc",
    d: 1,
    s: { a: 0, k: e },
    p: { a: 0, k: n },
    r: { a: 0, k: t }
  };
}
function _(e, t, n, r) {
  return {
    ddd: 0,
    ind: e,
    ty: 4,
    nm: t,
    sr: 1,
    ks: r,
    ao: 0,
    shapes: n,
    ip: 0,
    op: 180,
    st: 0,
    bm: 0
  };
}
function Ue(e) {
  return e.shape === "circle" ? v([128, 128]) : e.shape === "page" ? b([146, 112], 22) : e.shape === "diamond" ? b([116, 116], 34) : b([104, 148], 52);
}
function Ve(e, t) {
  return e === "Editor" ? [
    b([92, 8], 4, [0, -44]),
    A(W),
    b([20, 62], 10, [58, 18]),
    A(t.accent),
    C([0, 0], -16)
  ] : e === "Reporter" ? [
    v([28, 28], [66, -52]),
    A(t.accent),
    b([12, 56], 6, [48, 42]),
    A(He),
    C([0, 0], -24)
  ] : e === "Copy Writer" ? [
    b([76, 7], 4, [-12, -20]),
    b([54, 7], 4, [-23, 0]),
    b([68, 7], 4, [-16, 20]),
    A(W),
    C()
  ] : [
    v([38, 38], [-38, -36]),
    A(t.accent),
    b([16, 96], 8, [52, 18]),
    A(W),
    C([0, 0], 34)
  ];
}
function Fe(e, t) {
  const n = se[e], r = t === "complete" ? 3 : t === "ready" ? 6 : 13, o = e === "Editor" || e === "Illustrator" ? 360 : -360, a = e === "Illustrator" ? -12 : 0;
  return {
    v: "5.12.2",
    fr: 60,
    ip: 0,
    op: 180,
    w: 240,
    h: 240,
    nm: `${e} motion character`,
    ddd: 0,
    assets: [],
    layers: [
      _(
        1,
        "orbit",
        [
          v([198, 198]),
          {
            ty: "st",
            c: { a: 0, k: n.accent },
            o: { a: 0, k: 68 },
            w: { a: 0, k: 4 },
            lc: 2,
            lj: 2,
            d: [
              { n: "d", nm: "dash", v: { a: 0, k: 12 } },
              { n: "g", nm: "gap", v: { a: 0, k: 15 } },
              { n: "o", nm: "offset", v: { a: 0, k: 0 } }
            ]
          },
          C()
        ],
        {
          o: { a: 0, k: 100 },
          r: {
            a: 1,
            k: [
              { t: 0, s: [0], e: [o] },
              { t: 180, s: [o] }
            ]
          },
          p: { a: 0, k: [120, 120, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] }
        }
      ),
      _(
        2,
        "body",
        [Ue(n), A(n.body), C([0, 0], a)],
        {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: {
            a: 1,
            k: [
              { t: 0, s: [120, 120, 0], e: [120, 120 - r, 0] },
              { t: 90, s: [120, 120 - r, 0], e: [120, 120, 0] },
              { t: 180, s: [120, 120, 0] }
            ]
          },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] }
        }
      ),
      _(3, "role object", Ve(e, n), {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [-3], e: [3] },
            { t: 90, s: [3], e: [-3] },
            { t: 180, s: [-3] }
          ]
        },
        p: { a: 0, k: [120, 120, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      }),
      _(
        4,
        "eyes",
        [
          v([18, 22], [-25, -4]),
          v([18, 22], [25, -4]),
          A(W),
          C()
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
              { t: 180, s: [100, 100, 100] }
            ]
          }
        }
      ),
      _(
        5,
        "signal",
        [v([18, 18]), A(n.accent), C()],
        {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: {
            a: 1,
            k: [
              { t: 0, s: [120, 18, 0], e: [204, 120, 0] },
              { t: 90, s: [204, 120, 0], e: [120, 222, 0] },
              { t: 180, s: [120, 222, 0] }
            ]
          },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] }
        }
      )
    ]
  };
}
const Ke = {
  neutral: [0, 45],
  thinking: [0, 90],
  deepThinking: [30, 120],
  toolCalling: [45, 135],
  toolResponse: [90, 180],
  speakingOpen: [0, 120],
  speakingWide: [30, 150],
  speakingRound: [60, 180],
  speakingComplete: [145, 180]
}, We = Object.keys(se).map(
  (e) => ke({
    id: `creative-desk-${e.toLowerCase().replace(/\s+/g, "-")}`,
    name: `Creative Desk ${e}`,
    animationData: Fe(e, "drafting"),
    fallbackSegment: [0, 90],
    stateSegments: Ke
  })
), Ge = Re(We);
function tt(e) {
  const t = `creative-desk-${e.toLowerCase().replace(/\s+/g, "-")}`;
  return Ge[t];
}
export {
  me as BOT_AVATAR_STATES,
  et as BotAvatar,
  Ge as CREATIVE_DESK_MODEL_ZOO,
  ae as VULTUS_CLASSIC_MODEL,
  Je as automatedSpeakingPlaybackSequence,
  Xe as avatarModelFromZoo,
  H as computeAllFacialPathsForState,
  Re as createBotAvatarModelZoo,
  tt as creativeDeskModelForRole,
  Fe as creativeMotionAnimation,
  ke as defineLottieAvatarModel,
  Ye as formatStateKeyAsReadableLabel,
  Qe as orderedStateButtonDescriptors
};
