import { jsxs as H, jsx as y } from "react/jsx-runtime";
import { useId as X, useRef as S, useEffect as ee } from "react";
import { gsap as E } from "gsap";
const N = 0.5522847498, U = /-?\d+(?:\.\d+)?/g, z = (e, n, t, r) => {
  const o = t * N, a = r * N;
  return "M " + (e - t) + " " + n + " C " + (e - t) + " " + (n - a) + " " + (e - o) + " " + (n - r) + " " + e + " " + (n - r) + " C " + (e + o) + " " + (n - r) + " " + (e + t) + " " + (n - a) + " " + (e + t) + " " + n + " C " + (e + t) + " " + (n + a) + " " + (e + o) + " " + (n + r) + " " + e + " " + (n + r) + " C " + (e - o) + " " + (n + r) + " " + (e - t) + " " + (n + a) + " " + (e - t) + " " + n + " Z";
}, te = (e, n, t, r, o) => {
  const a = t * N, u = 0.18, i = 1.5, h = o === "down", p = h ? r * u : r * i, c = h ? r * i : r * u, l = n - p, d = n + c, g = p * N, b = c * N;
  return "M " + (e - t) + " " + n + " C " + (e - t) + " " + (n - g) + " " + (e - a) + " " + l + " " + e + " " + l + " C " + (e + a) + " " + l + " " + (e + t) + " " + (n - g) + " " + (e + t) + " " + n + " C " + (e + t) + " " + (n + b) + " " + (e + a) + " " + d + " " + e + " " + d + " C " + (e - a) + " " + d + " " + (e - t) + " " + (n + b) + " " + (e - t) + " " + n + " Z";
}, k = (e, n, t) => {
  var u, i;
  const r = ((u = e.match(U)) == null ? void 0 : u.map(Number)) ?? [], o = ((i = n.match(U)) == null ? void 0 : i.map(Number)) ?? [];
  let a = 0;
  return e.replace(U, () => {
    const h = r[a] ?? 0, p = o[a] ?? 0, c = h + (p - h) * t;
    return a += 1, c.toFixed(3);
  });
}, ne = [
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
}, re = {
  neutral: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  thinking: { rx: 14, ry: 14, dy: -4, shape: "ellipse" },
  deepThinking: { rx: 17, ry: 2, dy: 0, shape: "ellipse" },
  toolCalling: { rx: 5, ry: 16, dy: 0, shape: "ellipse" },
  toolResponse: { rx: 17, ry: 17, dy: 0, shape: "ellipse" },
  speakingOpen: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  speakingWide: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  speakingRound: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  speakingComplete: { rx: 16, ry: 5, dy: -1, shape: "curvedLens", curveDirection: "up" }
}, ae = {
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
  return t.shape === "curvedLens" ? te(
    e,
    r,
    t.rx,
    t.ry,
    t.curveDirection ?? "down"
  ) : z(e, r, t.rx, t.ry);
}, _ = (e) => {
  const n = re[e], t = ae[e];
  return {
    leftEyePathString: V(
      x.leftEyeCenterX,
      x.eyeBaselineCenterY,
      n
    ),
    rightEyePathString: V(
      x.rightEyeCenterX,
      x.eyeBaselineCenterY,
      n
    ),
    mouthPathString: V(
      x.mouthCenterX,
      x.mouthBaselineCenterY,
      t
    )
  };
}, Ce = [
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
], Ie = (e) => e.replace(/([A-Z])/g, " $1").replace(/^./, (n) => n.toUpperCase()).trim(), oe = "dimgray", ie = "white", le = 1e4, se = 2e4, ue = 1e3, ce = 2e3, A = (e, n, t, r) => z(e, n, t, r), L = (e, n, t) => {
  const r = _("neutral"), o = A(70, 90, 13, 1.5), a = A(130, 90, 13, 1.5), u = { value: 0 }, i = (t == null ? void 0 : t.closeDuration) ?? 0.09, h = (t == null ? void 0 : t.closedHoldDuration) ?? 0.03, p = (t == null ? void 0 : t.openDuration) ?? 0.13, c = () => {
    var d, g;
    const l = u.value;
    (d = n.leftEyePathElementRef.current) == null || d.setAttribute(
      "d",
      k(r.leftEyePathString, o, l)
    ), (g = n.rightEyePathElementRef.current) == null || g.setAttribute(
      "d",
      k(r.rightEyePathString, a, l)
    );
  };
  e.to(u, {
    value: 1,
    duration: i,
    ease: "power2.in",
    onUpdate: c
  }), h > 0 && e.to({}, { duration: h }), e.to(u, {
    value: 0,
    duration: p,
    ease: "power2.out",
    onUpdate: c
  });
}, de = (e, n) => {
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
}, he = (e, n) => {
  const t = Math.max(n / 1e3, 1), r = t * 0.24, o = t * 0.14, a = A(70, 90, 14, 14), u = A(130, 90, 14, 14), i = A(75, 90, 14, 14), h = A(135, 90, 14, 14), p = A(65, 90, 14, 14), c = A(125, 90, 14, 14), l = E.timeline(), d = (g, b, I, R, m) => {
    const O = { value: 0 };
    l.to(O, {
      value: 1,
      duration: m,
      ease: "sine.inOut",
      onUpdate: () => {
        var w, s;
        const T = O.value;
        (w = e.leftEyePathElementRef.current) == null || w.setAttribute(
          "d",
          k(g, b, T)
        ), (s = e.rightEyePathElementRef.current) == null || s.setAttribute(
          "d",
          k(I, R, T)
        );
      }
    });
  };
  return d(a, i, u, h, r), l.to({}, { duration: o * 0.6 }), L(l, e, {
    closeDuration: 0.08,
    closedHoldDuration: 0.02,
    openDuration: 0.1
  }), l.to({}, { duration: o * 0.4 }), d(i, p, h, c, r), l.to({}, { duration: o * 0.6 }), L(l, e, {
    closeDuration: 0.07,
    closedHoldDuration: 0.01,
    openDuration: 0.09
  }), l.to({}, { duration: o * 0.4 }), d(p, a, c, u, r), l.to({}, { duration: Math.max(0.08, t - (r * 3 + o * 2 + 0.37)) }), l;
}, pe = (e, n) => {
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
}, J = (e, n, t, r) => {
  const a = n.map((i) => ({
    leftEyePath: A(i.leftEyeCenter[0], i.leftEyeCenter[1], 14, 14),
    rightEyePath: A(
      i.rightEyeCenter[0],
      i.rightEyeCenter[1],
      14,
      14
    )
  })), u = E.timeline({ repeat: -1 });
  for (let i = 0; i < a.length; i += 1) {
    const h = a[i], p = a[(i + 1) % a.length], c = { value: 0 };
    u.to(c, {
      value: 1,
      duration: t,
      ease: "power2.inOut",
      onUpdate: () => {
        var d, g;
        const l = c.value;
        (d = e.leftEyePathElementRef.current) == null || d.setAttribute(
          "d",
          k(h.leftEyePath, p.leftEyePath, l)
        ), (g = e.rightEyePathElementRef.current) == null || g.setAttribute(
          "d",
          k(h.rightEyePath, p.rightEyePath, l)
        );
      }
    }), u.to({}, { duration: r(i) });
  }
  return u;
}, ye = (e) => J(
  e,
  [
    { leftEyeCenter: [70, 86], rightEyeCenter: [130, 86] },
    { leftEyeCenter: [66, 84], rightEyeCenter: [126, 84] },
    { leftEyeCenter: [70, 82], rightEyeCenter: [130, 82] },
    { leftEyeCenter: [74, 84], rightEyeCenter: [134, 84] }
  ],
  0.5,
  () => 1.1 + Math.random() * 0.6
), ge = (e) => J(
  e,
  [
    { leftEyeCenter: [66, 90], rightEyeCenter: [126, 90] },
    { leftEyeCenter: [70, 90], rightEyeCenter: [130, 90] },
    { leftEyeCenter: [74, 90], rightEyeCenter: [134, 90] },
    { leftEyeCenter: [70, 90], rightEyeCenter: [130, 90] }
  ],
  0.16,
  () => 0.35
), K = (e, n) => {
  if (!e)
    return { kill: () => {
    } };
  const t = E.to(e, n);
  return {
    kill: () => {
      t.kill(), E.set(e, { clearProps: "transform" });
    }
  };
}, me = (e) => K(e.innerHeadGroupElementRef.current, {
  scale: 1.025,
  transformOrigin: "100px 100px",
  duration: 2.6,
  yoyo: !0,
  repeat: -1,
  ease: "sine.inOut"
}), fe = (e) => K(e.antennaCircleElementRef.current, {
  scale: 1.45,
  transformOrigin: "100px 20px",
  duration: 0.42,
  yoyo: !0,
  repeat: -1,
  ease: "sine.inOut"
}), Ee = (e) => K(e.innerHeadGroupElementRef.current, {
  y: -2,
  duration: 0.7,
  yoyo: !0,
  repeat: -1,
  ease: "sine.inOut"
}), F = (e, n, t) => {
  const r = _(n).mouthPathString, o = _(t).mouthPathString, a = { value: 0 };
  return E.to(a, {
    value: 1,
    duration: 0.18,
    yoyo: !0,
    repeat: -1,
    ease: "sine.inOut",
    onUpdate: () => {
      var u;
      (u = e.mouthPathElementRef.current) == null || u.setAttribute(
        "d",
        k(r, o, a.value)
      );
    }
  });
}, Q = [
  de,
  he,
  pe
], Re = {
  thinking: (e) => ye(e),
  deepThinking: (e) => me(e),
  toolCalling: (e) => fe(e),
  toolResponse: (e) => ge(e),
  speakingOpen: (e) => F(e, "speakingOpen", "speakingRound"),
  speakingWide: (e) => F(e, "speakingWide", "speakingOpen"),
  speakingRound: (e) => F(e, "speakingRound", "speakingWide"),
  speakingComplete: (e) => Ee(e)
}, Pe = (e) => ne.includes(e), q = (e, n) => e + Math.floor(Math.random() * (n - e + 1)), Ae = () => Q[Math.floor(Math.random() * Q.length)], ke = () => typeof window > "u" || typeof window.matchMedia != "function" ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches, Me = ({
  state: e = "neutral",
  neutralIdleMode: n = "bored-random",
  size: t = 240,
  transitionDurationSeconds: r = 0.55,
  shadowColor: o = oe,
  lightColor: a = ie,
  ariaLabel: u
}) => {
  const i = Pe(e) ? e : "neutral", p = `bot-avatar-head-clip-${X().replace(/:/g, "")}`, c = S(null), l = S(null), d = S(null), g = S(null), b = S(null), I = S(null), R = S(null), m = S(null), O = S(_(i));
  ee(() => {
    var Z, $;
    const s = {
      leftEyePathElementRef: c,
      rightEyePathElementRef: l,
      mouthPathElementRef: d,
      antennaCircleElementRef: g,
      innerHeadGroupElementRef: b
    };
    if (!s.leftEyePathElementRef.current || !s.rightEyePathElementRef.current || !s.mouthPathElementRef.current)
      return;
    (Z = I.current) == null || Z.kill(), ($ = R.current) == null || $.kill(), m.current && (clearTimeout(m.current), m.current = null), s.innerHeadGroupElementRef.current && E.set(s.innerHeadGroupElementRef.current, { clearProps: "transform" }), s.antennaCircleElementRef.current && E.set(s.antennaCircleElementRef.current, { clearProps: "transform" });
    const D = {
      leftEyePathString: s.leftEyePathElementRef.current.getAttribute("d") ?? "",
      rightEyePathString: s.rightEyePathElementRef.current.getAttribute("d") ?? "",
      mouthPathString: s.mouthPathElementRef.current.getAttribute("d") ?? ""
    }, C = _(i), G = (f, P) => {
      m.current && clearTimeout(m.current), m.current = setTimeout(() => {
        m.current = null, P();
      }, f);
    }, Y = () => {
      const f = () => {
        const P = q(
          le,
          se
        );
        G(P, () => {
          var B;
          const M = q(
            ue,
            ce
          ), v = Ae();
          (B = R.current) == null || B.kill(), R.current = v(s, M), G(M, () => {
            var j;
            (j = R.current) == null || j.kill(), R.current = null, s.innerHeadGroupElementRef.current && E.set(s.innerHeadGroupElementRef.current, { clearProps: "transform" }), s.antennaCircleElementRef.current && E.set(s.antennaCircleElementRef.current, { clearProps: "transform" }), f();
          });
        });
      };
      f();
    }, W = () => {
      if (i === "neutral") {
        if (n === "static" || ke()) {
          R.current = null;
          return;
        }
        Y();
        return;
      }
      const f = Re[i];
      R.current = f(s);
    };
    if (D.leftEyePathString === C.leftEyePathString && D.rightEyePathString === C.rightEyePathString && D.mouthPathString === C.mouthPathString)
      W();
    else {
      const f = { easedProgress: 0 };
      I.current = E.to(f, {
        easedProgress: 1,
        duration: r,
        ease: "power3.inOut",
        onUpdate: () => {
          var M, v, B;
          const P = f.easedProgress;
          (M = s.leftEyePathElementRef.current) == null || M.setAttribute(
            "d",
            k(
              D.leftEyePathString,
              C.leftEyePathString,
              P
            )
          ), (v = s.rightEyePathElementRef.current) == null || v.setAttribute(
            "d",
            k(
              D.rightEyePathString,
              C.rightEyePathString,
              P
            )
          ), (B = s.mouthPathElementRef.current) == null || B.setAttribute(
            "d",
            k(
              D.mouthPathString,
              C.mouthPathString,
              P
            )
          );
        },
        onComplete: W
      });
    }
    return () => {
      var f, P;
      (f = I.current) == null || f.kill(), (P = R.current) == null || P.kill(), m.current && (clearTimeout(m.current), m.current = null);
    };
  }, [i, n, r]);
  const T = O.current, w = u ?? `Bot avatar - ${i} state`;
  return /* @__PURE__ */ H(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 200 200",
      width: t,
      height: t,
      role: "img",
      "aria-label": w,
      style: { display: "block" },
      children: [
        /* @__PURE__ */ y("defs", { children: /* @__PURE__ */ y("clipPath", { id: p, children: /* @__PURE__ */ y("circle", { cx: 100, cy: 100, r: 90 }) }) }),
        /* @__PURE__ */ y("rect", { width: 200, height: 200, fill: a }),
        /* @__PURE__ */ H("g", { ref: b, children: [
          /* @__PURE__ */ y("circle", { cx: 100, cy: 100, r: 90, fill: o }),
          /* @__PURE__ */ H("g", { clipPath: `url(#${p})`, children: [
            /* @__PURE__ */ y("circle", { ref: g, cx: 100, cy: 20, r: 10, fill: a }),
            /* @__PURE__ */ y("rect", { x: 95, y: 25, width: 10, height: 25, fill: a }),
            /* @__PURE__ */ y("rect", { x: 15, y: 80, width: 30, height: 40, rx: 8, fill: a }),
            /* @__PURE__ */ y("rect", { x: 155, y: 80, width: 30, height: 40, rx: 8, fill: a }),
            /* @__PURE__ */ y("rect", { x: 35, y: 45, width: 130, height: 100, rx: 30, fill: a }),
            /* @__PURE__ */ y("rect", { x: 80, y: 140, width: 40, height: 20, fill: a }),
            /* @__PURE__ */ y("path", { d: "M 20 200 Q 100 150 180 200 Z", fill: a }),
            /* @__PURE__ */ y("path", { ref: c, d: T.leftEyePathString, fill: o }),
            /* @__PURE__ */ y("path", { ref: l, d: T.rightEyePathString, fill: o }),
            /* @__PURE__ */ y("path", { ref: d, d: T.mouthPathString, fill: o })
          ] })
        ] })
      ]
    }
  );
};
export {
  ne as BOT_AVATAR_STATES,
  Me as BotAvatar,
  xe as automatedSpeakingPlaybackSequence,
  _ as computeAllFacialPathsForState,
  Ie as formatStateKeyAsReadableLabel,
  Ce as orderedStateButtonDescriptors
};
