import { jsx as p, jsxs as H } from "react/jsx-runtime";
import { useRef as A, useState as re, useEffect as K, useId as ae } from "react";
import { gsap as E } from "gsap";
import oe from "lottie-react";
const v = 0.5522847498, U = /-?\d+(?:\.\d+)?/g, J = (e, n, t, r) => {
  const o = t * v, a = r * v;
  return "M " + (e - t) + " " + n + " C " + (e - t) + " " + (n - a) + " " + (e - o) + " " + (n - r) + " " + e + " " + (n - r) + " C " + (e + o) + " " + (n - r) + " " + (e + t) + " " + (n - a) + " " + (e + t) + " " + n + " C " + (e + t) + " " + (n + a) + " " + (e + o) + " " + (n + r) + " " + e + " " + (n + r) + " C " + (e - o) + " " + (n + r) + " " + (e - t) + " " + (n + a) + " " + (e - t) + " " + n + " Z";
}, ie = (e, n, t, r, o) => {
  const a = t * v, l = 0.18, i = 1.5, h = o === "down", s = h ? r * l : r * i, u = h ? r * i : r * l, c = n - s, m = n + u, y = s * v, b = u * v;
  return "M " + (e - t) + " " + n + " C " + (e - t) + " " + (n - y) + " " + (e - a) + " " + c + " " + e + " " + c + " C " + (e + a) + " " + c + " " + (e + t) + " " + (n - y) + " " + (e + t) + " " + n + " C " + (e + t) + " " + (n + b) + " " + (e + a) + " " + m + " " + e + " " + m + " C " + (e - a) + " " + m + " " + (e - t) + " " + (n + b) + " " + (e - t) + " " + n + " Z";
}, S = (e, n, t) => {
  var l, i;
  const r = ((l = e.match(U)) == null ? void 0 : l.map(Number)) ?? [], o = ((i = n.match(U)) == null ? void 0 : i.map(Number)) ?? [];
  let a = 0;
  return e.replace(U, () => {
    const h = r[a] ?? 0, s = o[a] ?? 0, u = h + (s - h) * t;
    return a += 1, u.toFixed(3);
  });
}, le = [
  "neutral",
  "thinking",
  "deepThinking",
  "toolCalling",
  "toolResponse",
  "speakingOpen",
  "speakingWide",
  "speakingRound",
  "speakingComplete"
], w = {
  leftEyeCenterX: 70,
  rightEyeCenterX: 130,
  eyeBaselineCenterY: 90,
  mouthCenterX: 100,
  mouthBaselineCenterY: 122
}, se = {
  neutral: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  thinking: { rx: 14, ry: 14, dy: -4, shape: "ellipse" },
  deepThinking: { rx: 17, ry: 2, dy: 0, shape: "ellipse" },
  toolCalling: { rx: 5, ry: 16, dy: 0, shape: "ellipse" },
  toolResponse: { rx: 17, ry: 17, dy: 0, shape: "ellipse" },
  speakingOpen: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  speakingWide: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  speakingRound: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  speakingComplete: { rx: 16, ry: 5, dy: -1, shape: "curvedLens", curveDirection: "up" }
}, ue = {
  neutral: { rx: 25, ry: 10, dy: 0, shape: "curvedLens", curveDirection: "down" },
  thinking: { rx: 6, ry: 6, dy: 0, shape: "ellipse" },
  deepThinking: { rx: 24, ry: 2, dy: 0, shape: "ellipse" },
  toolCalling: { rx: 7, ry: 7, dy: 0, shape: "ellipse" },
  toolResponse: { rx: 9, ry: 14, dy: 0, shape: "ellipse" },
  speakingOpen: { rx: 13, ry: 18, dy: 5, shape: "ellipse" },
  speakingWide: { rx: 22, ry: 7, dy: 0, shape: "ellipse" },
  speakingRound: { rx: 10, ry: 13, dy: 0, shape: "ellipse" },
  speakingComplete: { rx: 25, ry: 11, dy: 0, shape: "curvedLens", curveDirection: "down" }
}, V = (e, n, t) => {
  const r = n + t.dy;
  return t.shape === "curvedLens" ? ie(
    e,
    r,
    t.rx,
    t.ry,
    t.curveDirection ?? "down"
  ) : J(e, r, t.rx, t.ry);
}, B = (e) => {
  const n = se[e], t = ue[e];
  return {
    leftEyePathString: V(
      w.leftEyeCenterX,
      w.eyeBaselineCenterY,
      n
    ),
    rightEyePathString: V(
      w.rightEyeCenterX,
      w.eyeBaselineCenterY,
      n
    ),
    mouthPathString: V(
      w.mouthCenterX,
      w.mouthBaselineCenterY,
      t
    )
  };
}, Le = [
  { stateKey: "neutral", buttonLabel: "Neutral", romanNumeralIndex: "I" },
  { stateKey: "thinking", buttonLabel: "Thinking", romanNumeralIndex: "II" },
  { stateKey: "deepThinking", buttonLabel: "Deep Thinking", romanNumeralIndex: "III" },
  { stateKey: "toolCalling", buttonLabel: "Tool Calling", romanNumeralIndex: "IV" },
  { stateKey: "toolResponse", buttonLabel: "Tool Response", romanNumeralIndex: "V" },
  { stateKey: "speakingOpen", buttonLabel: "Speaking · Open", romanNumeralIndex: "VI" },
  { stateKey: "speakingWide", buttonLabel: "Speaking · Wide", romanNumeralIndex: "VII" },
  { stateKey: "speakingRound", buttonLabel: "Speaking · Round", romanNumeralIndex: "VIII" },
  { stateKey: "speakingComplete", buttonLabel: "Speaking Complete", romanNumeralIndex: "IX" }
], Oe = [
  { stateKey: "speakingOpen", holdMilliseconds: 280 },
  { stateKey: "speakingRound", holdMilliseconds: 220 },
  { stateKey: "speakingWide", holdMilliseconds: 260 },
  { stateKey: "speakingOpen", holdMilliseconds: 220 },
  { stateKey: "speakingRound", holdMilliseconds: 200 },
  { stateKey: "speakingWide", holdMilliseconds: 260 },
  { stateKey: "speakingComplete", holdMilliseconds: 900 },
  { stateKey: "neutral", holdMilliseconds: 0 }
], _e = (e) => e.replace(/([A-Z])/g, " $1").replace(/^./, (n) => n.toUpperCase()).trim(), ce = () => typeof window > "u" || typeof window.matchMedia != "function" ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function de({
  model: e,
  state: n,
  size: t,
  lightColor: r,
  ariaLabel: o
}) {
  const a = A(null), [l, i] = re(ce), h = e.stateSegments[n] ?? e.fallbackSegment;
  return K(() => {
    if (typeof window > "u" || typeof window.matchMedia != "function")
      return;
    const s = window.matchMedia("(prefers-reduced-motion: reduce)"), u = () => i(s.matches);
    return s.addEventListener("change", u), () => s.removeEventListener("change", u);
  }, []), K(() => {
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
      "aria-label": o ?? `Bot avatar - ${n} state - ${e.name} model`,
      "data-vultus-model": e.id,
      "data-vultus-renderer": "lottie",
      style: {
        width: t,
        height: t,
        display: "block",
        overflow: "hidden",
        background: r
      },
      children: /* @__PURE__ */ p(
        oe,
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
const Y = Object.freeze({
  id: "vultus-classic",
  name: "Vultus Classic",
  renderer: "procedural"
});
function Ne(e) {
  return Object.freeze({ ...e, renderer: "lottie" });
}
function He(e) {
  const n = e.map((r) => [r.id, r]), t = n.map(([r]) => r);
  if (new Set(t).size !== t.length)
    throw new Error("Vultus model identifiers must be unique.");
  return Object.freeze(Object.fromEntries(n));
}
function Ue(e, n, t = Y) {
  return e[n] ?? t;
}
const he = "dimgray", X = "white", pe = 1e4, me = 2e4, ye = 1e3, ge = 2e3, k = (e, n, t, r) => J(e, n, t, r), L = (e, n, t) => {
  const r = B("neutral"), o = k(70, 90, 13, 1.5), a = k(130, 90, 13, 1.5), l = { value: 0 }, i = (t == null ? void 0 : t.closeDuration) ?? 0.09, h = (t == null ? void 0 : t.closedHoldDuration) ?? 0.03, s = (t == null ? void 0 : t.openDuration) ?? 0.13, u = () => {
    var m, y;
    const c = l.value;
    (m = n.leftEyePathElementRef.current) == null || m.setAttribute(
      "d",
      S(r.leftEyePathString, o, c)
    ), (y = n.rightEyePathElementRef.current) == null || y.setAttribute(
      "d",
      S(r.rightEyePathString, a, c)
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
}, fe = (e, n) => {
  const t = Math.max(n / 1e3, 1), r = Math.max(0.24, t - 0.58), o = E.timeline();
  return L(o, e, {
    closeDuration: 0.1,
    closedHoldDuration: 0.03,
    openDuration: 0.16
  }), o.to({}, { duration: r * 0.45 }), L(o, e, {
    closeDuration: 0.08,
    closedHoldDuration: 0.02,
    openDuration: 0.12
  }), o.to({}, { duration: r * 0.55 }), o;
}, Ee = (e, n) => {
  const t = Math.max(n / 1e3, 1), r = t * 0.24, o = t * 0.14, a = k(70, 90, 14, 14), l = k(130, 90, 14, 14), i = k(75, 90, 14, 14), h = k(135, 90, 14, 14), s = k(65, 90, 14, 14), u = k(125, 90, 14, 14), c = E.timeline(), m = (y, b, M, R, g) => {
    const O = { value: 0 };
    c.to(O, {
      value: 1,
      duration: g,
      ease: "sine.inOut",
      onUpdate: () => {
        var _, d;
        const T = O.value;
        (_ = e.leftEyePathElementRef.current) == null || _.setAttribute(
          "d",
          S(y, b, T)
        ), (d = e.rightEyePathElementRef.current) == null || d.setAttribute(
          "d",
          S(M, R, T)
        );
      }
    });
  };
  return m(a, i, l, h, r), c.to({}, { duration: o * 0.6 }), L(c, e, {
    closeDuration: 0.08,
    closedHoldDuration: 0.02,
    openDuration: 0.1
  }), c.to({}, { duration: o * 0.4 }), m(i, s, h, u, r), c.to({}, { duration: o * 0.6 }), L(c, e, {
    closeDuration: 0.07,
    closedHoldDuration: 0.01,
    openDuration: 0.09
  }), c.to({}, { duration: o * 0.4 }), m(s, a, u, l, r), c.to({}, { duration: Math.max(0.08, t - (r * 3 + o * 2 + 0.37)) }), c;
}, Re = (e, n) => {
  const t = Math.max(n / 1e3, 1), r = E.timeline();
  return e.antennaCircleElementRef.current && r.to(e.antennaCircleElementRef.current, {
    scale: 1.36,
    transformOrigin: "100px 20px",
    duration: t * 0.18,
    yoyo: !0,
    repeat: 3,
    ease: "sine.inOut"
  }, 0), e.innerHeadGroupElementRef.current && r.to(e.innerHeadGroupElementRef.current, {
    y: -1.5,
    duration: t * 0.22,
    yoyo: !0,
    repeat: 3,
    ease: "sine.inOut"
  }, 0), L(r, e, {
    closeDuration: 0.08,
    closedHoldDuration: 0.02,
    openDuration: 0.1
  }), r.to({}, { duration: Math.max(0.08, t * 0.12) }), r;
}, ee = (e, n, t, r) => {
  const a = n.map((i) => ({
    leftEyePath: k(i.leftEyeCenter[0], i.leftEyeCenter[1], 14, 14),
    rightEyePath: k(
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
      duration: t,
      ease: "power2.inOut",
      onUpdate: () => {
        var m, y;
        const c = u.value;
        (m = e.leftEyePathElementRef.current) == null || m.setAttribute(
          "d",
          S(h.leftEyePath, s.leftEyePath, c)
        ), (y = e.rightEyePathElementRef.current) == null || y.setAttribute(
          "d",
          S(h.rightEyePath, s.rightEyePath, c)
        );
      }
    }), l.to({}, { duration: r(i) });
  }
  return l;
}, Pe = (e) => ee(
  e,
  [
    { leftEyeCenter: [70, 86], rightEyeCenter: [130, 86] },
    { leftEyeCenter: [66, 84], rightEyeCenter: [126, 84] },
    { leftEyeCenter: [70, 82], rightEyeCenter: [130, 82] },
    { leftEyeCenter: [74, 84], rightEyeCenter: [134, 84] }
  ],
  0.5,
  () => 1.1 + Math.random() * 0.6
), Ae = (e) => ee(
  e,
  [
    { leftEyeCenter: [66, 90], rightEyeCenter: [126, 90] },
    { leftEyeCenter: [70, 90], rightEyeCenter: [130, 90] },
    { leftEyeCenter: [74, 90], rightEyeCenter: [134, 90] },
    { leftEyeCenter: [70, 90], rightEyeCenter: [130, 90] }
  ],
  0.16,
  () => 0.35
), G = (e, n) => {
  if (!e)
    return { kill: () => {
    } };
  const t = E.to(e, n);
  return {
    kill: () => {
      t.kill(), E.set(e, { clearProps: "transform" });
    }
  };
}, ke = (e) => G(e.innerHeadGroupElementRef.current, {
  scale: 1.025,
  transformOrigin: "100px 100px",
  duration: 2.6,
  yoyo: !0,
  repeat: -1,
  ease: "sine.inOut"
}), Se = (e) => G(e.antennaCircleElementRef.current, {
  scale: 1.45,
  transformOrigin: "100px 20px",
  duration: 0.42,
  yoyo: !0,
  repeat: -1,
  ease: "sine.inOut"
}), be = (e) => G(e.innerHeadGroupElementRef.current, {
  y: -2,
  duration: 0.7,
  yoyo: !0,
  repeat: -1,
  ease: "sine.inOut"
}), F = (e, n, t) => {
  const r = B(n).mouthPathString, o = B(t).mouthPathString, a = { value: 0 };
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
        S(r, o, a.value)
      );
    }
  });
}, q = [
  fe,
  Ee,
  Re
], Te = {
  thinking: (e) => Pe(e),
  deepThinking: (e) => ke(e),
  toolCalling: (e) => Se(e),
  toolResponse: (e) => Ae(e),
  speakingOpen: (e) => F(e, "speakingOpen", "speakingRound"),
  speakingWide: (e) => F(e, "speakingWide", "speakingOpen"),
  speakingRound: (e) => F(e, "speakingRound", "speakingWide"),
  speakingComplete: (e) => be(e)
}, te = (e) => le.includes(e), Q = (e, n) => e + Math.floor(Math.random() * (n - e + 1)), De = () => q[Math.floor(Math.random() * q.length)], Ce = () => typeof window > "u" || typeof window.matchMedia != "function" ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches, we = ({
  state: e = "neutral",
  neutralIdleMode: n = "bored-random",
  size: t = 240,
  transitionDurationSeconds: r = 0.55,
  shadowColor: o = he,
  lightColor: a = X,
  ariaLabel: l
}) => {
  const i = te(e) ? e : "neutral", s = `bot-avatar-head-clip-${ae().replace(/:/g, "")}`, u = A(null), c = A(null), m = A(null), y = A(null), b = A(null), M = A(null), R = A(null), g = A(null), O = A(B(i));
  K(() => {
    var Z, $;
    const d = {
      leftEyePathElementRef: u,
      rightEyePathElementRef: c,
      mouthPathElementRef: m,
      antennaCircleElementRef: y,
      innerHeadGroupElementRef: b
    };
    if (!d.leftEyePathElementRef.current || !d.rightEyePathElementRef.current || !d.mouthPathElementRef.current)
      return;
    (Z = M.current) == null || Z.kill(), ($ = R.current) == null || $.kill(), g.current && (clearTimeout(g.current), g.current = null), d.innerHeadGroupElementRef.current && E.set(d.innerHeadGroupElementRef.current, { clearProps: "transform" }), d.antennaCircleElementRef.current && E.set(d.antennaCircleElementRef.current, { clearProps: "transform" });
    const D = {
      leftEyePathString: d.leftEyePathElementRef.current.getAttribute("d") ?? "",
      rightEyePathString: d.rightEyePathElementRef.current.getAttribute("d") ?? "",
      mouthPathString: d.mouthPathElementRef.current.getAttribute("d") ?? ""
    }, C = B(i), W = (f, P) => {
      g.current && clearTimeout(g.current), g.current = setTimeout(() => {
        g.current = null, P();
      }, f);
    }, ne = () => {
      const f = () => {
        const P = Q(
          pe,
          me
        );
        W(P, () => {
          var x;
          const I = Q(
            ye,
            ge
          ), N = De();
          (x = R.current) == null || x.kill(), R.current = N(d, I), W(I, () => {
            var z;
            (z = R.current) == null || z.kill(), R.current = null, d.innerHeadGroupElementRef.current && E.set(d.innerHeadGroupElementRef.current, { clearProps: "transform" }), d.antennaCircleElementRef.current && E.set(d.antennaCircleElementRef.current, { clearProps: "transform" }), f();
          });
        });
      };
      f();
    }, j = () => {
      if (i === "neutral") {
        if (n === "static" || Ce()) {
          R.current = null;
          return;
        }
        ne();
        return;
      }
      const f = Te[i];
      R.current = f(d);
    };
    if (D.leftEyePathString === C.leftEyePathString && D.rightEyePathString === C.rightEyePathString && D.mouthPathString === C.mouthPathString)
      j();
    else {
      const f = { easedProgress: 0 };
      M.current = E.to(f, {
        easedProgress: 1,
        duration: r,
        ease: "power3.inOut",
        onUpdate: () => {
          var I, N, x;
          const P = f.easedProgress;
          (I = d.leftEyePathElementRef.current) == null || I.setAttribute(
            "d",
            S(
              D.leftEyePathString,
              C.leftEyePathString,
              P
            )
          ), (N = d.rightEyePathElementRef.current) == null || N.setAttribute(
            "d",
            S(
              D.rightEyePathString,
              C.rightEyePathString,
              P
            )
          ), (x = d.mouthPathElementRef.current) == null || x.setAttribute(
            "d",
            S(
              D.mouthPathString,
              C.mouthPathString,
              P
            )
          );
        },
        onComplete: j
      });
    }
    return () => {
      var f, P;
      (f = M.current) == null || f.kill(), (P = R.current) == null || P.kill(), g.current && (clearTimeout(g.current), g.current = null);
    };
  }, [i, n, r]);
  const T = O.current, _ = l ?? `Bot avatar - ${i} state`;
  return /* @__PURE__ */ H(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 200 200",
      width: t,
      height: t,
      role: "img",
      "aria-label": _,
      style: { display: "block" },
      children: [
        /* @__PURE__ */ p("defs", { children: /* @__PURE__ */ p("clipPath", { id: s, children: /* @__PURE__ */ p("circle", { cx: 100, cy: 100, r: 90 }) }) }),
        /* @__PURE__ */ p("rect", { width: 200, height: 200, fill: a }),
        /* @__PURE__ */ H("g", { ref: b, children: [
          /* @__PURE__ */ p("circle", { cx: 100, cy: 100, r: 90, fill: o }),
          /* @__PURE__ */ H("g", { clipPath: `url(#${s})`, children: [
            /* @__PURE__ */ p("circle", { ref: y, cx: 100, cy: 20, r: 10, fill: a }),
            /* @__PURE__ */ p("rect", { x: 95, y: 25, width: 10, height: 25, fill: a }),
            /* @__PURE__ */ p("rect", { x: 15, y: 80, width: 30, height: 40, rx: 8, fill: a }),
            /* @__PURE__ */ p("rect", { x: 155, y: 80, width: 30, height: 40, rx: 8, fill: a }),
            /* @__PURE__ */ p("rect", { x: 35, y: 45, width: 130, height: 100, rx: 30, fill: a }),
            /* @__PURE__ */ p("rect", { x: 80, y: 140, width: 40, height: 20, fill: a }),
            /* @__PURE__ */ p("path", { d: "M 20 200 Q 100 150 180 200 Z", fill: a }),
            /* @__PURE__ */ p("path", { ref: u, d: T.leftEyePathString, fill: o }),
            /* @__PURE__ */ p("path", { ref: c, d: T.rightEyePathString, fill: o }),
            /* @__PURE__ */ p("path", { ref: m, d: T.mouthPathString, fill: o })
          ] })
        ] })
      ]
    }
  );
}, Ve = ({
  model: e = Y,
  state: n = "neutral",
  size: t = 240,
  lightColor: r = X,
  ariaLabel: o,
  ...a
}) => {
  const l = te(n) ? n : "neutral";
  return e.renderer === "lottie" ? /* @__PURE__ */ p(
    de,
    {
      model: e,
      state: l,
      size: t,
      lightColor: r,
      ariaLabel: o
    }
  ) : /* @__PURE__ */ p(
    we,
    {
      ...a,
      state: l,
      size: t,
      lightColor: r,
      ariaLabel: o
    }
  );
};
export {
  le as BOT_AVATAR_STATES,
  Ve as BotAvatar,
  Y as VULTUS_CLASSIC_MODEL,
  Oe as automatedSpeakingPlaybackSequence,
  Ue as avatarModelFromZoo,
  B as computeAllFacialPathsForState,
  He as createBotAvatarModelZoo,
  Ne as defineLottieAvatarModel,
  _e as formatStateKeyAsReadableLabel,
  Le as orderedStateButtonDescriptors
};
