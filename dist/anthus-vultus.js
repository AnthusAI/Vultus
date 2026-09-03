import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import React, { useEffect, useState, useRef, useId } from "react";
import { gsap } from "gsap";
const QUARTER_ARC_BEZIER_HANDLE = 0.5522847498, SIGNED_DECIMAL_NUMBER_PATTERN = /-?\d+(?:\.\d+)?/g, buildFourSegmentEllipsePath = (e, t, r, i) => {
  const s = r * QUARTER_ARC_BEZIER_HANDLE, n = i * QUARTER_ARC_BEZIER_HANDLE;
  return "M " + (e - r) + " " + t + " C " + (e - r) + " " + (t - n) + " " + (e - s) + " " + (t - i) + " " + e + " " + (t - i) + " C " + (e + s) + " " + (t - i) + " " + (e + r) + " " + (t - n) + " " + (e + r) + " " + t + " C " + (e + r) + " " + (t + n) + " " + (e + s) + " " + (t + i) + " " + e + " " + (t + i) + " C " + (e - s) + " " + (t + i) + " " + (e - r) + " " + (t + n) + " " + (e - r) + " " + t + " Z";
}, buildFourSegmentCurvedLensPath = (e, t, r, i, s) => {
  const n = r * QUARTER_ARC_BEZIER_HANDLE, a = 0.18, l = 1.5, o = s === "down", p = o ? i * a : i * l, u = o ? i * l : i * a, S = t - p, f = t + u, b = p * QUARTER_ARC_BEZIER_HANDLE, v = u * QUARTER_ARC_BEZIER_HANDLE;
  return "M " + (e - r) + " " + t + " C " + (e - r) + " " + (t - b) + " " + (e - n) + " " + S + " " + e + " " + S + " C " + (e + n) + " " + S + " " + (e + r) + " " + (t - b) + " " + (e + r) + " " + t + " C " + (e + r) + " " + (t + v) + " " + (e + n) + " " + f + " " + e + " " + f + " C " + (e - n) + " " + f + " " + (e - r) + " " + (t + v) + " " + (e - r) + " " + t + " Z";
}, buildRoundedRectPath = (e, t, r, i, s) => {
  const { topLeft: n, topRight: a, bottomRight: l, bottomLeft: o } = s;
  return "M " + (e + n) + " " + t + " L " + (e + r - a) + " " + t + " A " + a + " " + a + " 0 0 1 " + (e + r) + " " + (t + a) + " L " + (e + r) + " " + (t + i - l) + " A " + l + " " + l + " 0 0 1 " + (e + r - l) + " " + (t + i) + " L " + (e + o) + " " + (t + i) + " A " + o + " " + o + " 0 0 1 " + e + " " + (t + i - o) + " L " + e + " " + (t + n) + " A " + n + " " + n + " 0 0 1 " + (e + n) + " " + t + " Z";
}, interpolateNumericValuesBetweenPathStrings = (e, t, r) => {
  var a, l;
  const i = ((a = e.match(SIGNED_DECIMAL_NUMBER_PATTERN)) == null ? void 0 : a.map(Number)) ?? [], s = ((l = t.match(SIGNED_DECIMAL_NUMBER_PATTERN)) == null ? void 0 : l.map(Number)) ?? [];
  let n = 0;
  return e.replace(SIGNED_DECIMAL_NUMBER_PATTERN, () => {
    const o = i[n] ?? 0, p = s[n] ?? 0, u = o + (p - o) * r;
    return n += 1, u.toFixed(3);
  });
}, BOT_AVATAR_STATES = [
  "neutral",
  "thinking",
  "deepThinking",
  "toolCalling",
  "toolResponse",
  "speakingOpen",
  "speakingWide",
  "speakingRound",
  "speakingComplete"
], classicEyeShapeDefinitionsByState = {
  neutral: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  thinking: { rx: 14, ry: 14, dy: -4, shape: "ellipse" },
  deepThinking: { rx: 17, ry: 2, dy: 0, shape: "ellipse" },
  toolCalling: { rx: 5, ry: 16, dy: 0, shape: "ellipse" },
  toolResponse: { rx: 17, ry: 17, dy: 0, shape: "ellipse" },
  speakingOpen: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  speakingWide: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  speakingRound: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  speakingComplete: { rx: 16, ry: 5, dy: -1, shape: "curvedLens", curveDirection: "up" }
}, classicMouthShapeDefinitionsByState = {
  neutral: { rx: 25, ry: 10, dy: 0, shape: "curvedLens", curveDirection: "down" },
  thinking: { rx: 6, ry: 6, dy: 0, shape: "ellipse" },
  deepThinking: { rx: 24, ry: 2, dy: 0, shape: "ellipse" },
  toolCalling: { rx: 7, ry: 7, dy: 0, shape: "ellipse" },
  toolResponse: { rx: 9, ry: 14, dy: 0, shape: "ellipse" },
  speakingOpen: { rx: 13, ry: 18, dy: 5, shape: "ellipse" },
  speakingWide: { rx: 22, ry: 7, dy: 0, shape: "ellipse" },
  speakingRound: { rx: 10, ry: 13, dy: 0, shape: "ellipse" },
  speakingComplete: { rx: 25, ry: 11, dy: 0, shape: "curvedLens", curveDirection: "down" }
}, buildPathStringFromDefinition = (e, t, r) => {
  const i = t + r.dy;
  return r.shape === "curvedLens" ? buildFourSegmentCurvedLensPath(
    e,
    i,
    r.rx,
    r.ry,
    r.curveDirection ?? "down"
  ) : buildFourSegmentEllipsePath(e, i, r.rx, r.ry);
}, computeAllFacialPathsForState = (e, t) => {
  var l;
  const r = e.eyeShapesByState[t], i = (l = e.mouthShapesByState) == null ? void 0 : l[t], s = buildPathStringFromDefinition(
    e.features.leftEye.cx,
    e.features.leftEye.cy,
    r
  ), n = buildPathStringFromDefinition(
    e.features.rightEye.cx,
    e.features.rightEye.cy,
    r
  ), a = e.features.mouth && i ? buildPathStringFromDefinition(e.features.mouth.cx, e.features.mouth.cy, i) : "";
  return { leftEyePathString: s, rightEyePathString: n, mouthPathString: a };
}, orderedStateButtonDescriptors = [
  { stateKey: "neutral", buttonLabel: "Neutral", romanNumeralIndex: "I" },
  { stateKey: "thinking", buttonLabel: "Thinking", romanNumeralIndex: "II" },
  { stateKey: "deepThinking", buttonLabel: "Deep Thinking", romanNumeralIndex: "III" },
  { stateKey: "toolCalling", buttonLabel: "Tool Calling", romanNumeralIndex: "IV" },
  { stateKey: "toolResponse", buttonLabel: "Tool Response", romanNumeralIndex: "V" },
  { stateKey: "speakingOpen", buttonLabel: "Speaking · Open", romanNumeralIndex: "VI" },
  { stateKey: "speakingWide", buttonLabel: "Speaking · Wide", romanNumeralIndex: "VII" },
  { stateKey: "speakingRound", buttonLabel: "Speaking · Round", romanNumeralIndex: "VIII" },
  { stateKey: "speakingComplete", buttonLabel: "Speaking Complete", romanNumeralIndex: "IX" }
], automatedSpeakingPlaybackSequence = [
  { stateKey: "speakingOpen", holdMilliseconds: 280 },
  { stateKey: "speakingRound", holdMilliseconds: 220 },
  { stateKey: "speakingWide", holdMilliseconds: 260 },
  { stateKey: "speakingOpen", holdMilliseconds: 220 },
  { stateKey: "speakingRound", holdMilliseconds: 200 },
  { stateKey: "speakingWide", holdMilliseconds: 260 },
  { stateKey: "speakingComplete", holdMilliseconds: 900 },
  { stateKey: "neutral", holdMilliseconds: 0 }
], formatStateKeyAsReadableLabel = (e) => e.replace(/([A-Z])/g, " $1").replace(/^./, (t) => t.toUpperCase()).trim();
function getDefaultExportFromCjs(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var lottie$2 = { exports: {} }, lottie$1 = lottie$2.exports, hasRequiredLottie;
function requireLottie() {
  return hasRequiredLottie || (hasRequiredLottie = 1, (function(module, exports) {
    typeof document < "u" && typeof navigator < "u" && (function(e, t) {
      module.exports = t();
    })(lottie$1, (function() {
      var svgNS = "http://www.w3.org/2000/svg", locationHref = "", _useWebWorker = !1, initialDefaultFrame = -999999, setWebWorker = function(t) {
        _useWebWorker = !!t;
      }, getWebWorker = function() {
        return _useWebWorker;
      }, setLocationHref = function(t) {
        locationHref = t;
      }, getLocationHref = function() {
        return locationHref;
      };
      function createTag(e) {
        return document.createElement(e);
      }
      function extendPrototype(e, t) {
        var r, i = e.length, s;
        for (r = 0; r < i; r += 1) {
          s = e[r].prototype;
          for (var n in s)
            Object.prototype.hasOwnProperty.call(s, n) && (t.prototype[n] = s[n]);
        }
      }
      function getDescriptor(e, t) {
        return Object.getOwnPropertyDescriptor(e, t);
      }
      function createProxyFunction(e) {
        function t() {
        }
        return t.prototype = e, t;
      }
      var audioControllerFactory = (function() {
        function e(t) {
          this.audios = [], this.audioFactory = t, this._volume = 1, this._isMuted = !1;
        }
        return e.prototype = {
          addAudio: function(r) {
            this.audios.push(r);
          },
          pause: function() {
            var r, i = this.audios.length;
            for (r = 0; r < i; r += 1)
              this.audios[r].pause();
          },
          resume: function() {
            var r, i = this.audios.length;
            for (r = 0; r < i; r += 1)
              this.audios[r].resume();
          },
          setRate: function(r) {
            var i, s = this.audios.length;
            for (i = 0; i < s; i += 1)
              this.audios[i].setRate(r);
          },
          createAudio: function(r) {
            return this.audioFactory ? this.audioFactory(r) : window.Howl ? new window.Howl({
              src: [r]
            }) : {
              isPlaying: !1,
              play: function() {
                this.isPlaying = !0;
              },
              seek: function() {
                this.isPlaying = !1;
              },
              playing: function() {
              },
              rate: function() {
              },
              setVolume: function() {
              }
            };
          },
          setAudioFactory: function(r) {
            this.audioFactory = r;
          },
          setVolume: function(r) {
            this._volume = r, this._updateVolume();
          },
          mute: function() {
            this._isMuted = !0, this._updateVolume();
          },
          unmute: function() {
            this._isMuted = !1, this._updateVolume();
          },
          getVolume: function() {
            return this._volume;
          },
          _updateVolume: function() {
            var r, i = this.audios.length;
            for (r = 0; r < i; r += 1)
              this.audios[r].volume(this._volume * (this._isMuted ? 0 : 1));
          }
        }, function() {
          return new e();
        };
      })(), createTypedArray = /* @__PURE__ */ (function() {
        function e(r, i) {
          var s = 0, n = [], a;
          switch (r) {
            case "int16":
            case "uint8c":
              a = 1;
              break;
            default:
              a = 1.1;
              break;
          }
          for (s = 0; s < i; s += 1)
            n.push(a);
          return n;
        }
        function t(r, i) {
          return r === "float32" ? new Float32Array(i) : r === "int16" ? new Int16Array(i) : r === "uint8c" ? new Uint8ClampedArray(i) : e(r, i);
        }
        return typeof Uint8ClampedArray == "function" && typeof Float32Array == "function" ? t : e;
      })();
      function createSizedArray(e) {
        return Array.apply(null, {
          length: e
        });
      }
      function _typeof$6(e) {
        "@babel/helpers - typeof";
        return _typeof$6 = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
          return typeof t;
        } : function(t) {
          return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
        }, _typeof$6(e);
      }
      var subframeEnabled = !0, expressionsPlugin = null, expressionsInterfaces = null, idPrefix$1 = "", isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent), bmPow = Math.pow, bmSqrt = Math.sqrt, bmFloor = Math.floor, bmMax = Math.max, bmMin = Math.min, BMMath = {};
      (function() {
        var e = ["abs", "acos", "acosh", "asin", "asinh", "atan", "atanh", "atan2", "ceil", "cbrt", "expm1", "clz32", "cos", "cosh", "exp", "floor", "fround", "hypot", "imul", "log", "log1p", "log2", "log10", "max", "min", "pow", "random", "round", "sign", "sin", "sinh", "sqrt", "tan", "tanh", "trunc", "E", "LN10", "LN2", "LOG10E", "LOG2E", "PI", "SQRT1_2", "SQRT2"], t, r = e.length;
        for (t = 0; t < r; t += 1)
          BMMath[e[t]] = Math[e[t]];
      })(), BMMath.random = Math.random, BMMath.abs = function(e) {
        var t = _typeof$6(e);
        if (t === "object" && e.length) {
          var r = createSizedArray(e.length), i, s = e.length;
          for (i = 0; i < s; i += 1)
            r[i] = Math.abs(e[i]);
          return r;
        }
        return Math.abs(e);
      };
      var defaultCurveSegments = 150, degToRads = Math.PI / 180, roundCorner = 0.5519;
      function styleDiv(e) {
        e.style.position = "absolute", e.style.top = 0, e.style.left = 0, e.style.display = "block", e.style.transformOrigin = "0 0", e.style.webkitTransformOrigin = "0 0", e.style.backfaceVisibility = "visible", e.style.webkitBackfaceVisibility = "visible", e.style.transformStyle = "preserve-3d", e.style.webkitTransformStyle = "preserve-3d", e.style.mozTransformStyle = "preserve-3d";
      }
      function BMEnterFrameEvent(e, t, r, i) {
        this.type = e, this.currentTime = t, this.totalTime = r, this.direction = i < 0 ? -1 : 1;
      }
      function BMCompleteEvent(e, t) {
        this.type = e, this.direction = t < 0 ? -1 : 1;
      }
      function BMCompleteLoopEvent(e, t, r, i) {
        this.type = e, this.currentLoop = r, this.totalLoops = t, this.direction = i < 0 ? -1 : 1;
      }
      function BMSegmentStartEvent(e, t, r) {
        this.type = e, this.firstFrame = t, this.totalFrames = r;
      }
      function BMDestroyEvent(e, t) {
        this.type = e, this.target = t;
      }
      function BMRenderFrameErrorEvent(e, t) {
        this.type = "renderFrameError", this.nativeError = e, this.currentTime = t;
      }
      function BMConfigErrorEvent(e) {
        this.type = "configError", this.nativeError = e;
      }
      var createElementID = /* @__PURE__ */ (function() {
        var e = 0;
        return function() {
          return e += 1, idPrefix$1 + "__lottie_element_" + e;
        };
      })();
      function HSVtoRGB(e, t, r) {
        var i, s, n, a, l, o, p, u;
        switch (a = Math.floor(e * 6), l = e * 6 - a, o = r * (1 - t), p = r * (1 - l * t), u = r * (1 - (1 - l) * t), a % 6) {
          case 0:
            i = r, s = u, n = o;
            break;
          case 1:
            i = p, s = r, n = o;
            break;
          case 2:
            i = o, s = r, n = u;
            break;
          case 3:
            i = o, s = p, n = r;
            break;
          case 4:
            i = u, s = o, n = r;
            break;
          case 5:
            i = r, s = o, n = p;
            break;
        }
        return [i, s, n];
      }
      function RGBtoHSV(e, t, r) {
        var i = Math.max(e, t, r), s = Math.min(e, t, r), n = i - s, a, l = i === 0 ? 0 : n / i, o = i / 255;
        switch (i) {
          case s:
            a = 0;
            break;
          case e:
            a = t - r + n * (t < r ? 6 : 0), a /= 6 * n;
            break;
          case t:
            a = r - e + n * 2, a /= 6 * n;
            break;
          case r:
            a = e - t + n * 4, a /= 6 * n;
            break;
        }
        return [a, l, o];
      }
      function addSaturationToRGB(e, t) {
        var r = RGBtoHSV(e[0] * 255, e[1] * 255, e[2] * 255);
        return r[1] += t, r[1] > 1 ? r[1] = 1 : r[1] <= 0 && (r[1] = 0), HSVtoRGB(r[0], r[1], r[2]);
      }
      function addBrightnessToRGB(e, t) {
        var r = RGBtoHSV(e[0] * 255, e[1] * 255, e[2] * 255);
        return r[2] += t, r[2] > 1 ? r[2] = 1 : r[2] < 0 && (r[2] = 0), HSVtoRGB(r[0], r[1], r[2]);
      }
      function addHueToRGB(e, t) {
        var r = RGBtoHSV(e[0] * 255, e[1] * 255, e[2] * 255);
        return r[0] += t / 360, r[0] > 1 ? r[0] -= 1 : r[0] < 0 && (r[0] += 1), HSVtoRGB(r[0], r[1], r[2]);
      }
      var rgbToHex = (function() {
        var e = [], t, r;
        for (t = 0; t < 256; t += 1)
          r = t.toString(16), e[t] = r.length === 1 ? "0" + r : r;
        return function(i, s, n) {
          return i < 0 && (i = 0), s < 0 && (s = 0), n < 0 && (n = 0), "#" + e[i] + e[s] + e[n];
        };
      })(), setSubframeEnabled = function(t) {
        subframeEnabled = !!t;
      }, getSubframeEnabled = function() {
        return subframeEnabled;
      }, setExpressionsPlugin = function(t) {
        expressionsPlugin = t;
      }, getExpressionsPlugin = function() {
        return expressionsPlugin;
      }, setExpressionInterfaces = function(t) {
        expressionsInterfaces = t;
      }, getExpressionInterfaces = function() {
        return expressionsInterfaces;
      }, setDefaultCurveSegments = function(t) {
        defaultCurveSegments = t;
      }, getDefaultCurveSegments = function() {
        return defaultCurveSegments;
      }, setIdPrefix = function(t) {
        idPrefix$1 = t;
      };
      function createNS(e) {
        return document.createElementNS(svgNS, e);
      }
      function _typeof$5(e) {
        "@babel/helpers - typeof";
        return _typeof$5 = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
          return typeof t;
        } : function(t) {
          return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
        }, _typeof$5(e);
      }
      var dataManager = /* @__PURE__ */ (function() {
        var e = 1, t = [], r, i, s = {
          onmessage: function() {
          },
          postMessage: function(b) {
            r({
              data: b
            });
          }
        }, n = {
          postMessage: function(b) {
            s.onmessage({
              data: b
            });
          }
        };
        function a(f) {
          if (window.Worker && window.Blob && getWebWorker()) {
            var b = new Blob(["var _workerSelf = self; self.onmessage = ", f.toString()], {
              type: "text/javascript"
            }), v = URL.createObjectURL(b);
            return new Worker(v);
          }
          return r = f, s;
        }
        function l() {
          i || (i = a(function(b) {
            function v() {
              function x(I, C) {
                var T, g, E = I.length, F, k, L, O;
                for (g = 0; g < E; g += 1)
                  if (T = I[g], "ks" in T && !T.completed) {
                    if (T.completed = !0, T.hasMask) {
                      var G = T.masksProperties;
                      for (k = G.length, F = 0; F < k; F += 1)
                        if (G[F].pt.k.i)
                          P(G[F].pt.k);
                        else
                          for (O = G[F].pt.k.length, L = 0; L < O; L += 1)
                            G[F].pt.k[L].s && P(G[F].pt.k[L].s[0]), G[F].pt.k[L].e && P(G[F].pt.k[L].e[0]);
                    }
                    T.ty === 0 ? (T.layers = h(T.refId, C), x(T.layers, C)) : T.ty === 4 ? y(T.shapes) : T.ty === 5 && D(T);
                  }
              }
              function c(I, C) {
                if (I) {
                  var T = 0, g = I.length;
                  for (T = 0; T < g; T += 1)
                    I[T].t === 1 && (I[T].data.layers = h(I[T].data.refId, C), x(I[T].data.layers, C));
                }
              }
              function d(I, C) {
                for (var T = 0, g = C.length; T < g; ) {
                  if (C[T].id === I)
                    return C[T];
                  T += 1;
                }
                return null;
              }
              function h(I, C) {
                var T = d(I, C);
                return T ? T.layers.__used ? JSON.parse(JSON.stringify(T.layers)) : (T.layers.__used = !0, T.layers) : null;
              }
              function y(I) {
                var C, T = I.length, g, E;
                for (C = T - 1; C >= 0; C -= 1)
                  if (I[C].ty === "sh")
                    if (I[C].ks.k.i)
                      P(I[C].ks.k);
                    else
                      for (E = I[C].ks.k.length, g = 0; g < E; g += 1)
                        I[C].ks.k[g].s && P(I[C].ks.k[g].s[0]), I[C].ks.k[g].e && P(I[C].ks.k[g].e[0]);
                  else I[C].ty === "gr" && y(I[C].it);
              }
              function P(I) {
                var C, T = I.i.length;
                for (C = 0; C < T; C += 1)
                  I.i[C][0] += I.v[C][0], I.i[C][1] += I.v[C][1], I.o[C][0] += I.v[C][0], I.o[C][1] += I.v[C][1];
              }
              function A(I, C) {
                var T = C ? C.split(".") : [100, 100, 100];
                return I[0] > T[0] ? !0 : T[0] > I[0] ? !1 : I[1] > T[1] ? !0 : T[1] > I[1] ? !1 : I[2] > T[2] ? !0 : T[2] > I[2] ? !1 : null;
              }
              var _ = /* @__PURE__ */ (function() {
                var I = [4, 4, 14];
                function C(g) {
                  var E = g.t.d;
                  g.t.d = {
                    k: [{
                      s: E,
                      t: 0
                    }]
                  };
                }
                function T(g) {
                  var E, F = g.length;
                  for (E = 0; E < F; E += 1)
                    g[E].ty === 5 && C(g[E]);
                }
                return function(g) {
                  if (A(I, g.v) && (T(g.layers), g.assets)) {
                    var E, F = g.assets.length;
                    for (E = 0; E < F; E += 1)
                      g.assets[E].layers && T(g.assets[E].layers);
                  }
                };
              })(), M = /* @__PURE__ */ (function() {
                var I = [4, 7, 99];
                return function(C) {
                  if (C.chars && !A(I, C.v)) {
                    var T, g = C.chars.length;
                    for (T = 0; T < g; T += 1) {
                      var E = C.chars[T];
                      E.data && E.data.shapes && (y(E.data.shapes), E.data.ip = 0, E.data.op = 99999, E.data.st = 0, E.data.sr = 1, E.data.ks = {
                        p: {
                          k: [0, 0],
                          a: 0
                        },
                        s: {
                          k: [100, 100],
                          a: 0
                        },
                        a: {
                          k: [0, 0],
                          a: 0
                        },
                        r: {
                          k: 0,
                          a: 0
                        },
                        o: {
                          k: 100,
                          a: 0
                        }
                      }, C.chars[T].t || (E.data.shapes.push({
                        ty: "no"
                      }), E.data.shapes[0].it.push({
                        p: {
                          k: [0, 0],
                          a: 0
                        },
                        s: {
                          k: [100, 100],
                          a: 0
                        },
                        a: {
                          k: [0, 0],
                          a: 0
                        },
                        r: {
                          k: 0,
                          a: 0
                        },
                        o: {
                          k: 100,
                          a: 0
                        },
                        sk: {
                          k: 0,
                          a: 0
                        },
                        sa: {
                          k: 0,
                          a: 0
                        },
                        ty: "tr"
                      })));
                    }
                  }
                };
              })(), w = /* @__PURE__ */ (function() {
                var I = [5, 7, 15];
                function C(g) {
                  var E = g.t.p;
                  typeof E.a == "number" && (E.a = {
                    a: 0,
                    k: E.a
                  }), typeof E.p == "number" && (E.p = {
                    a: 0,
                    k: E.p
                  }), typeof E.r == "number" && (E.r = {
                    a: 0,
                    k: E.r
                  });
                }
                function T(g) {
                  var E, F = g.length;
                  for (E = 0; E < F; E += 1)
                    g[E].ty === 5 && C(g[E]);
                }
                return function(g) {
                  if (A(I, g.v) && (T(g.layers), g.assets)) {
                    var E, F = g.assets.length;
                    for (E = 0; E < F; E += 1)
                      g.assets[E].layers && T(g.assets[E].layers);
                  }
                };
              })(), V = /* @__PURE__ */ (function() {
                var I = [4, 1, 9];
                function C(g) {
                  var E, F = g.length, k, L;
                  for (E = 0; E < F; E += 1)
                    if (g[E].ty === "gr")
                      C(g[E].it);
                    else if (g[E].ty === "fl" || g[E].ty === "st")
                      if (g[E].c.k && g[E].c.k[0].i)
                        for (L = g[E].c.k.length, k = 0; k < L; k += 1)
                          g[E].c.k[k].s && (g[E].c.k[k].s[0] /= 255, g[E].c.k[k].s[1] /= 255, g[E].c.k[k].s[2] /= 255, g[E].c.k[k].s[3] /= 255), g[E].c.k[k].e && (g[E].c.k[k].e[0] /= 255, g[E].c.k[k].e[1] /= 255, g[E].c.k[k].e[2] /= 255, g[E].c.k[k].e[3] /= 255);
                      else
                        g[E].c.k[0] /= 255, g[E].c.k[1] /= 255, g[E].c.k[2] /= 255, g[E].c.k[3] /= 255;
                }
                function T(g) {
                  var E, F = g.length;
                  for (E = 0; E < F; E += 1)
                    g[E].ty === 4 && C(g[E].shapes);
                }
                return function(g) {
                  if (A(I, g.v) && (T(g.layers), g.assets)) {
                    var E, F = g.assets.length;
                    for (E = 0; E < F; E += 1)
                      g.assets[E].layers && T(g.assets[E].layers);
                  }
                };
              })(), B = /* @__PURE__ */ (function() {
                var I = [4, 4, 18];
                function C(g) {
                  var E, F = g.length, k, L;
                  for (E = F - 1; E >= 0; E -= 1)
                    if (g[E].ty === "sh")
                      if (g[E].ks.k.i)
                        g[E].ks.k.c = g[E].closed;
                      else
                        for (L = g[E].ks.k.length, k = 0; k < L; k += 1)
                          g[E].ks.k[k].s && (g[E].ks.k[k].s[0].c = g[E].closed), g[E].ks.k[k].e && (g[E].ks.k[k].e[0].c = g[E].closed);
                    else g[E].ty === "gr" && C(g[E].it);
                }
                function T(g) {
                  var E, F, k = g.length, L, O, G, W;
                  for (F = 0; F < k; F += 1) {
                    if (E = g[F], E.hasMask) {
                      var q = E.masksProperties;
                      for (O = q.length, L = 0; L < O; L += 1)
                        if (q[L].pt.k.i)
                          q[L].pt.k.c = q[L].cl;
                        else
                          for (W = q[L].pt.k.length, G = 0; G < W; G += 1)
                            q[L].pt.k[G].s && (q[L].pt.k[G].s[0].c = q[L].cl), q[L].pt.k[G].e && (q[L].pt.k[G].e[0].c = q[L].cl);
                    }
                    E.ty === 4 && C(E.shapes);
                  }
                }
                return function(g) {
                  if (A(I, g.v) && (T(g.layers), g.assets)) {
                    var E, F = g.assets.length;
                    for (E = 0; E < F; E += 1)
                      g.assets[E].layers && T(g.assets[E].layers);
                  }
                };
              })();
              function R(I) {
                I.__complete || (V(I), _(I), M(I), w(I), B(I), x(I.layers, I.assets), c(I.chars, I.assets), I.__complete = !0);
              }
              function D(I) {
                I.t.a.length === 0 && "m" in I.t.p;
              }
              var N = {};
              return N.completeData = R, N.checkColors = V, N.checkChars = M, N.checkPathProperties = w, N.checkShapes = B, N.completeLayers = x, N;
            }
            if (n.dataManager || (n.dataManager = v()), n.assetLoader || (n.assetLoader = /* @__PURE__ */ (function() {
              function x(d) {
                var h = d.getResponseHeader("content-type");
                return h && d.responseType === "json" && h.indexOf("json") !== -1 || d.response && _typeof$5(d.response) === "object" ? d.response : d.response && typeof d.response == "string" ? JSON.parse(d.response) : d.responseText ? JSON.parse(d.responseText) : null;
              }
              function c(d, h, y, P) {
                var A, _ = new XMLHttpRequest();
                try {
                  _.responseType = "json";
                } catch {
                }
                _.onreadystatechange = function() {
                  if (_.readyState === 4)
                    if (_.status === 200)
                      A = x(_), y(A);
                    else
                      try {
                        A = x(_), y(A);
                      } catch (M) {
                        P && P(M);
                      }
                };
                try {
                  _.open(["G", "E", "T"].join(""), d, !0);
                } catch {
                  _.open(["G", "E", "T"].join(""), h + "/" + d, !0);
                }
                _.send();
              }
              return {
                load: c
              };
            })()), b.data.type === "loadAnimation")
              n.assetLoader.load(b.data.path, b.data.fullPath, function(x) {
                n.dataManager.completeData(x), n.postMessage({
                  id: b.data.id,
                  payload: x,
                  status: "success"
                });
              }, function() {
                n.postMessage({
                  id: b.data.id,
                  status: "error"
                });
              });
            else if (b.data.type === "complete") {
              var m = b.data.animation;
              n.dataManager.completeData(m), n.postMessage({
                id: b.data.id,
                payload: m,
                status: "success"
              });
            } else b.data.type === "loadData" && n.assetLoader.load(b.data.path, b.data.fullPath, function(x) {
              n.postMessage({
                id: b.data.id,
                payload: x,
                status: "success"
              });
            }, function() {
              n.postMessage({
                id: b.data.id,
                status: "error"
              });
            });
          }), i.onmessage = function(f) {
            var b = f.data, v = b.id, m = t[v];
            t[v] = null, b.status === "success" ? m.onComplete(b.payload) : m.onError && m.onError();
          });
        }
        function o(f, b) {
          e += 1;
          var v = "processId_" + e;
          return t[v] = {
            onComplete: f,
            onError: b
          }, v;
        }
        function p(f, b, v) {
          l();
          var m = o(b, v);
          i.postMessage({
            type: "loadAnimation",
            path: f,
            fullPath: window.location.origin + window.location.pathname,
            id: m
          });
        }
        function u(f, b, v) {
          l();
          var m = o(b, v);
          i.postMessage({
            type: "loadData",
            path: f,
            fullPath: window.location.origin + window.location.pathname,
            id: m
          });
        }
        function S(f, b, v) {
          l();
          var m = o(b, v);
          i.postMessage({
            type: "complete",
            animation: f,
            id: m
          });
        }
        return {
          loadAnimation: p,
          loadData: u,
          completeAnimation: S
        };
      })(), ImagePreloader = (function() {
        var e = (function() {
          var c = createTag("canvas");
          c.width = 1, c.height = 1;
          var d = c.getContext("2d");
          return d.fillStyle = "rgba(0,0,0,0)", d.fillRect(0, 0, 1, 1), c;
        })();
        function t() {
          this.loadedAssets += 1, this.loadedAssets === this.totalImages && this.loadedFootagesCount === this.totalFootages && this.imagesLoadedCb && this.imagesLoadedCb(null);
        }
        function r() {
          this.loadedFootagesCount += 1, this.loadedAssets === this.totalImages && this.loadedFootagesCount === this.totalFootages && this.imagesLoadedCb && this.imagesLoadedCb(null);
        }
        function i(c, d, h) {
          var y = "";
          if (c.e)
            y = c.p;
          else if (d) {
            var P = c.p;
            P.indexOf("images/") !== -1 && (P = P.split("/")[1]), y = d + P;
          } else
            y = h, y += c.u ? c.u : "", y += c.p;
          return y;
        }
        function s(c) {
          var d = 0, h = setInterval((function() {
            var y = c.getBBox();
            (y.width || d > 500) && (this._imageLoaded(), clearInterval(h)), d += 1;
          }).bind(this), 50);
        }
        function n(c) {
          var d = i(c, this.assetsPath, this.path), h = createNS("image");
          isSafari ? this.testImageLoaded(h) : h.addEventListener("load", this._imageLoaded, !1), h.addEventListener("error", (function() {
            y.img = e, this._imageLoaded();
          }).bind(this), !1), h.setAttributeNS("http://www.w3.org/1999/xlink", "href", d), this._elementHelper.append ? this._elementHelper.append(h) : this._elementHelper.appendChild(h);
          var y = {
            img: h,
            assetData: c
          };
          return y;
        }
        function a(c) {
          var d = i(c, this.assetsPath, this.path), h = createTag("img");
          h.crossOrigin = "anonymous", h.addEventListener("load", this._imageLoaded, !1), h.addEventListener("error", (function() {
            y.img = e, this._imageLoaded();
          }).bind(this), !1), h.src = d;
          var y = {
            img: h,
            assetData: c
          };
          return y;
        }
        function l(c) {
          var d = {
            assetData: c
          }, h = i(c, this.assetsPath, this.path);
          return dataManager.loadData(h, (function(y) {
            d.img = y, this._footageLoaded();
          }).bind(this), (function() {
            d.img = {}, this._footageLoaded();
          }).bind(this)), d;
        }
        function o(c, d) {
          this.imagesLoadedCb = d;
          var h, y = c.length;
          for (h = 0; h < y; h += 1)
            c[h].layers || (!c[h].t || c[h].t === "seq" ? (this.totalImages += 1, this.images.push(this._createImageData(c[h]))) : c[h].t === 3 && (this.totalFootages += 1, this.images.push(this.createFootageData(c[h]))));
        }
        function p(c) {
          this.path = c || "";
        }
        function u(c) {
          this.assetsPath = c || "";
        }
        function S(c) {
          for (var d = 0, h = this.images.length; d < h; ) {
            if (this.images[d].assetData === c)
              return this.images[d].img;
            d += 1;
          }
          return null;
        }
        function f() {
          this.imagesLoadedCb = null, this.images.length = 0;
        }
        function b() {
          return this.totalImages === this.loadedAssets;
        }
        function v() {
          return this.totalFootages === this.loadedFootagesCount;
        }
        function m(c, d) {
          c === "svg" ? (this._elementHelper = d, this._createImageData = this.createImageData.bind(this)) : this._createImageData = this.createImgData.bind(this);
        }
        function x() {
          this._imageLoaded = t.bind(this), this._footageLoaded = r.bind(this), this.testImageLoaded = s.bind(this), this.createFootageData = l.bind(this), this.assetsPath = "", this.path = "", this.totalImages = 0, this.totalFootages = 0, this.loadedAssets = 0, this.loadedFootagesCount = 0, this.imagesLoadedCb = null, this.images = [];
        }
        return x.prototype = {
          loadAssets: o,
          setAssetsPath: u,
          setPath: p,
          loadedImages: b,
          loadedFootages: v,
          destroy: f,
          getAsset: S,
          createImgData: a,
          createImageData: n,
          imageLoaded: t,
          footageLoaded: r,
          setCacheType: m
        }, x;
      })();
      function BaseEvent() {
      }
      BaseEvent.prototype = {
        triggerEvent: function(t, r) {
          if (this._cbs[t])
            for (var i = this._cbs[t], s = 0; s < i.length; s += 1)
              i[s](r);
        },
        addEventListener: function(t, r) {
          return this._cbs[t] || (this._cbs[t] = []), this._cbs[t].push(r), (function() {
            this.removeEventListener(t, r);
          }).bind(this);
        },
        removeEventListener: function(t, r) {
          if (!r)
            this._cbs[t] = null;
          else if (this._cbs[t]) {
            for (var i = 0, s = this._cbs[t].length; i < s; )
              this._cbs[t][i] === r && (this._cbs[t].splice(i, 1), i -= 1, s -= 1), i += 1;
            this._cbs[t].length || (this._cbs[t] = null);
          }
        }
      };
      var markerParser = /* @__PURE__ */ (function() {
        function e(t) {
          for (var r = t.split(`\r
`), i = {}, s, n = 0, a = 0; a < r.length; a += 1)
            s = r[a].split(":"), s.length === 2 && (i[s[0]] = s[1].trim(), n += 1);
          if (n === 0)
            throw new Error();
          return i;
        }
        return function(t) {
          for (var r = [], i = 0; i < t.length; i += 1) {
            var s = t[i], n = {
              time: s.tm,
              duration: s.dr
            };
            try {
              n.payload = JSON.parse(t[i].cm);
            } catch {
              try {
                n.payload = e(t[i].cm);
              } catch {
                n.payload = {
                  name: t[i].cm
                };
              }
            }
            r.push(n);
          }
          return r;
        };
      })(), ProjectInterface = /* @__PURE__ */ (function() {
        function e(t) {
          this.compositions.push(t);
        }
        return function() {
          function t(r) {
            for (var i = 0, s = this.compositions.length; i < s; ) {
              if (this.compositions[i].data && this.compositions[i].data.nm === r)
                return this.compositions[i].prepareFrame && this.compositions[i].data.xt && this.compositions[i].prepareFrame(this.currentFrame), this.compositions[i].compInterface;
              i += 1;
            }
            return null;
          }
          return t.compositions = [], t.currentFrame = 0, t.registerComposition = e, t;
        };
      })(), renderers = {}, registerRenderer = function(t, r) {
        renderers[t] = r;
      };
      function getRenderer(e) {
        return renderers[e];
      }
      function getRegisteredRenderer() {
        if (renderers.canvas)
          return "canvas";
        for (var e in renderers)
          if (renderers[e])
            return e;
        return "";
      }
      function _typeof$4(e) {
        "@babel/helpers - typeof";
        return _typeof$4 = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
          return typeof t;
        } : function(t) {
          return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
        }, _typeof$4(e);
      }
      var AnimationItem = function() {
        this._cbs = [], this.name = "", this.path = "", this.isLoaded = !1, this.currentFrame = 0, this.currentRawFrame = 0, this.firstFrame = 0, this.totalFrames = 0, this.frameRate = 0, this.frameMult = 0, this.playSpeed = 1, this.playDirection = 1, this.playCount = 0, this.animationData = {}, this.assets = [], this.isPaused = !0, this.autoplay = !1, this.loop = !0, this.renderer = null, this.animationID = createElementID(), this.assetsPath = "", this.timeCompleted = 0, this.segmentPos = 0, this.isSubframeEnabled = getSubframeEnabled(), this.segments = [], this._idle = !0, this._completedLoop = !1, this.projectInterface = ProjectInterface(), this.imagePreloader = new ImagePreloader(), this.audioController = audioControllerFactory(), this.markers = [], this.configAnimation = this.configAnimation.bind(this), this.onSetupError = this.onSetupError.bind(this), this.onSegmentComplete = this.onSegmentComplete.bind(this), this.drawnFrameEvent = new BMEnterFrameEvent("drawnFrame", 0, 0, 0), this.expressionsPlugin = getExpressionsPlugin();
      };
      extendPrototype([BaseEvent], AnimationItem), AnimationItem.prototype.setParams = function(e) {
        (e.wrapper || e.container) && (this.wrapper = e.wrapper || e.container);
        var t = "svg";
        e.animType ? t = e.animType : e.renderer && (t = e.renderer);
        var r = getRenderer(t);
        this.renderer = new r(this, e.rendererSettings), this.imagePreloader.setCacheType(t, this.renderer.globalData.defs), this.renderer.setProjectInterface(this.projectInterface), this.animType = t, e.loop === "" || e.loop === null || e.loop === void 0 || e.loop === !0 ? this.loop = !0 : e.loop === !1 ? this.loop = !1 : this.loop = parseInt(e.loop, 10), this.autoplay = "autoplay" in e ? e.autoplay : !0, this.name = e.name ? e.name : "", this.autoloadSegments = Object.prototype.hasOwnProperty.call(e, "autoloadSegments") ? e.autoloadSegments : !0, this.assetsPath = e.assetsPath, this.initialSegment = e.initialSegment, e.audioFactory && this.audioController.setAudioFactory(e.audioFactory), e.animationData ? this.setupAnimation(e.animationData) : e.path && (e.path.lastIndexOf("\\") !== -1 ? this.path = e.path.substr(0, e.path.lastIndexOf("\\") + 1) : this.path = e.path.substr(0, e.path.lastIndexOf("/") + 1), this.fileName = e.path.substr(e.path.lastIndexOf("/") + 1), this.fileName = this.fileName.substr(0, this.fileName.lastIndexOf(".json")), dataManager.loadAnimation(e.path, this.configAnimation, this.onSetupError));
      }, AnimationItem.prototype.onSetupError = function() {
        this.trigger("data_failed");
      }, AnimationItem.prototype.setupAnimation = function(e) {
        dataManager.completeAnimation(e, this.configAnimation);
      }, AnimationItem.prototype.setData = function(e, t) {
        t && _typeof$4(t) !== "object" && (t = JSON.parse(t));
        var r = {
          wrapper: e,
          animationData: t
        }, i = e.attributes;
        r.path = i.getNamedItem("data-animation-path") ? i.getNamedItem("data-animation-path").value : i.getNamedItem("data-bm-path") ? i.getNamedItem("data-bm-path").value : i.getNamedItem("bm-path") ? i.getNamedItem("bm-path").value : "", r.animType = i.getNamedItem("data-anim-type") ? i.getNamedItem("data-anim-type").value : i.getNamedItem("data-bm-type") ? i.getNamedItem("data-bm-type").value : i.getNamedItem("bm-type") ? i.getNamedItem("bm-type").value : i.getNamedItem("data-bm-renderer") ? i.getNamedItem("data-bm-renderer").value : i.getNamedItem("bm-renderer") ? i.getNamedItem("bm-renderer").value : getRegisteredRenderer() || "canvas";
        var s = i.getNamedItem("data-anim-loop") ? i.getNamedItem("data-anim-loop").value : i.getNamedItem("data-bm-loop") ? i.getNamedItem("data-bm-loop").value : i.getNamedItem("bm-loop") ? i.getNamedItem("bm-loop").value : "";
        s === "false" ? r.loop = !1 : s === "true" ? r.loop = !0 : s !== "" && (r.loop = parseInt(s, 10));
        var n = i.getNamedItem("data-anim-autoplay") ? i.getNamedItem("data-anim-autoplay").value : i.getNamedItem("data-bm-autoplay") ? i.getNamedItem("data-bm-autoplay").value : i.getNamedItem("bm-autoplay") ? i.getNamedItem("bm-autoplay").value : !0;
        r.autoplay = n !== "false", r.name = i.getNamedItem("data-name") ? i.getNamedItem("data-name").value : i.getNamedItem("data-bm-name") ? i.getNamedItem("data-bm-name").value : i.getNamedItem("bm-name") ? i.getNamedItem("bm-name").value : "";
        var a = i.getNamedItem("data-anim-prerender") ? i.getNamedItem("data-anim-prerender").value : i.getNamedItem("data-bm-prerender") ? i.getNamedItem("data-bm-prerender").value : i.getNamedItem("bm-prerender") ? i.getNamedItem("bm-prerender").value : "";
        a === "false" && (r.prerender = !1), r.path ? this.setParams(r) : this.trigger("destroy");
      }, AnimationItem.prototype.includeLayers = function(e) {
        e.op > this.animationData.op && (this.animationData.op = e.op, this.totalFrames = Math.floor(e.op - this.animationData.ip));
        var t = this.animationData.layers, r, i = t.length, s = e.layers, n, a = s.length;
        for (n = 0; n < a; n += 1)
          for (r = 0; r < i; ) {
            if (t[r].id === s[n].id) {
              t[r] = s[n];
              break;
            }
            r += 1;
          }
        if ((e.chars || e.fonts) && (this.renderer.globalData.fontManager.addChars(e.chars), this.renderer.globalData.fontManager.addFonts(e.fonts, this.renderer.globalData.defs)), e.assets)
          for (i = e.assets.length, r = 0; r < i; r += 1)
            this.animationData.assets.push(e.assets[r]);
        this.animationData.__complete = !1, dataManager.completeAnimation(this.animationData, this.onSegmentComplete);
      }, AnimationItem.prototype.onSegmentComplete = function(e) {
        this.animationData = e;
        var t = getExpressionsPlugin();
        t && t.initExpressions(this), this.loadNextSegment();
      }, AnimationItem.prototype.loadNextSegment = function() {
        var e = this.animationData.segments;
        if (!e || e.length === 0 || !this.autoloadSegments) {
          this.trigger("data_ready"), this.timeCompleted = this.totalFrames;
          return;
        }
        var t = e.shift();
        this.timeCompleted = t.time * this.frameRate;
        var r = this.path + this.fileName + "_" + this.segmentPos + ".json";
        this.segmentPos += 1, dataManager.loadData(r, this.includeLayers.bind(this), (function() {
          this.trigger("data_failed");
        }).bind(this));
      }, AnimationItem.prototype.loadSegments = function() {
        var e = this.animationData.segments;
        e || (this.timeCompleted = this.totalFrames), this.loadNextSegment();
      }, AnimationItem.prototype.imagesLoaded = function() {
        this.trigger("loaded_images"), this.checkLoaded();
      }, AnimationItem.prototype.preloadImages = function() {
        this.imagePreloader.setAssetsPath(this.assetsPath), this.imagePreloader.setPath(this.path), this.imagePreloader.loadAssets(this.animationData.assets, this.imagesLoaded.bind(this));
      }, AnimationItem.prototype.configAnimation = function(e) {
        if (this.renderer)
          try {
            this.animationData = e, this.initialSegment ? (this.totalFrames = Math.floor(this.initialSegment[1] - this.initialSegment[0]), this.firstFrame = Math.round(this.initialSegment[0])) : (this.totalFrames = Math.floor(this.animationData.op - this.animationData.ip), this.firstFrame = Math.round(this.animationData.ip)), this.renderer.configAnimation(e), e.assets || (e.assets = []), this.assets = this.animationData.assets, this.frameRate = this.animationData.fr, this.frameMult = this.animationData.fr / 1e3, this.renderer.searchExtraCompositions(e.assets), this.markers = markerParser(e.markers || []), this.trigger("config_ready"), this.preloadImages(), this.loadSegments(), this.updaFrameModifier(), this.waitForFontsLoaded(), this.isPaused && this.audioController.pause();
          } catch (t) {
            this.triggerConfigError(t);
          }
      }, AnimationItem.prototype.waitForFontsLoaded = function() {
        this.renderer && (this.renderer.globalData.fontManager.isLoaded ? this.checkLoaded() : setTimeout(this.waitForFontsLoaded.bind(this), 20));
      }, AnimationItem.prototype.checkLoaded = function() {
        if (!this.isLoaded && this.renderer.globalData.fontManager.isLoaded && (this.imagePreloader.loadedImages() || this.renderer.rendererType !== "canvas") && this.imagePreloader.loadedFootages()) {
          this.isLoaded = !0;
          var e = getExpressionsPlugin();
          e && e.initExpressions(this), this.renderer.initItems(), setTimeout((function() {
            this.trigger("DOMLoaded");
          }).bind(this), 0), this.gotoFrame(), this.autoplay && this.play();
        }
      }, AnimationItem.prototype.resize = function(e, t) {
        var r = typeof e == "number" ? e : void 0, i = typeof t == "number" ? t : void 0;
        this.renderer.updateContainerSize(r, i);
      }, AnimationItem.prototype.setSubframe = function(e) {
        this.isSubframeEnabled = !!e;
      }, AnimationItem.prototype.gotoFrame = function() {
        this.currentFrame = this.isSubframeEnabled ? this.currentRawFrame : ~~this.currentRawFrame, this.timeCompleted !== this.totalFrames && this.currentFrame > this.timeCompleted && (this.currentFrame = this.timeCompleted), this.trigger("enterFrame"), this.renderFrame(), this.trigger("drawnFrame");
      }, AnimationItem.prototype.renderFrame = function() {
        if (!(this.isLoaded === !1 || !this.renderer))
          try {
            this.expressionsPlugin && this.expressionsPlugin.resetFrame(), this.renderer.renderFrame(this.currentFrame + this.firstFrame);
          } catch (e) {
            this.triggerRenderFrameError(e);
          }
      }, AnimationItem.prototype.play = function(e) {
        e && this.name !== e || this.isPaused === !0 && (this.isPaused = !1, this.trigger("_play"), this.audioController.resume(), this._idle && (this._idle = !1, this.trigger("_active")));
      }, AnimationItem.prototype.pause = function(e) {
        e && this.name !== e || this.isPaused === !1 && (this.isPaused = !0, this.trigger("_pause"), this._idle = !0, this.trigger("_idle"), this.audioController.pause());
      }, AnimationItem.prototype.togglePause = function(e) {
        e && this.name !== e || (this.isPaused === !0 ? this.play() : this.pause());
      }, AnimationItem.prototype.stop = function(e) {
        e && this.name !== e || (this.pause(), this.playCount = 0, this._completedLoop = !1, this.setCurrentRawFrameValue(0));
      }, AnimationItem.prototype.getMarkerData = function(e) {
        for (var t, r = 0; r < this.markers.length; r += 1)
          if (t = this.markers[r], t.payload && t.payload.name === e)
            return t;
        return null;
      }, AnimationItem.prototype.goToAndStop = function(e, t, r) {
        if (!(r && this.name !== r)) {
          var i = Number(e);
          if (isNaN(i)) {
            var s = this.getMarkerData(e);
            s && this.goToAndStop(s.time, !0);
          } else t ? this.setCurrentRawFrameValue(e) : this.setCurrentRawFrameValue(e * this.frameModifier);
          this.pause();
        }
      }, AnimationItem.prototype.goToAndPlay = function(e, t, r) {
        if (!(r && this.name !== r)) {
          var i = Number(e);
          if (isNaN(i)) {
            var s = this.getMarkerData(e);
            s && (s.duration ? this.playSegments([s.time, s.time + s.duration], !0) : this.goToAndStop(s.time, !0));
          } else
            this.goToAndStop(i, t, r);
          this.play();
        }
      }, AnimationItem.prototype.advanceTime = function(e) {
        if (!(this.isPaused === !0 || this.isLoaded === !1)) {
          var t = this.currentRawFrame + e * this.frameModifier, r = !1;
          t >= this.totalFrames - 1 && this.frameModifier > 0 ? !this.loop || this.playCount === this.loop ? this.checkSegments(t > this.totalFrames ? t % this.totalFrames : 0) || (r = !0, t = this.totalFrames - 1) : t >= this.totalFrames ? (this.playCount += 1, this.checkSegments(t % this.totalFrames) || (this.setCurrentRawFrameValue(t % this.totalFrames), this._completedLoop = !0, this.trigger("loopComplete"))) : this.setCurrentRawFrameValue(t) : t < 0 ? this.checkSegments(t % this.totalFrames) || (this.loop && !(this.playCount-- <= 0 && this.loop !== !0) ? (this.setCurrentRawFrameValue(this.totalFrames + t % this.totalFrames), this._completedLoop ? this.trigger("loopComplete") : this._completedLoop = !0) : (r = !0, t = 0)) : this.setCurrentRawFrameValue(t), r && (this.setCurrentRawFrameValue(t), this.pause(), this.trigger("complete"));
        }
      }, AnimationItem.prototype.adjustSegment = function(e, t) {
        this.playCount = 0, e[1] < e[0] ? (this.frameModifier > 0 && (this.playSpeed < 0 ? this.setSpeed(-this.playSpeed) : this.setDirection(-1)), this.totalFrames = e[0] - e[1], this.timeCompleted = this.totalFrames, this.firstFrame = e[1], this.setCurrentRawFrameValue(this.totalFrames - 1e-3 - t)) : e[1] > e[0] && (this.frameModifier < 0 && (this.playSpeed < 0 ? this.setSpeed(-this.playSpeed) : this.setDirection(1)), this.totalFrames = e[1] - e[0], this.timeCompleted = this.totalFrames, this.firstFrame = e[0], this.setCurrentRawFrameValue(1e-3 + t)), this.trigger("segmentStart");
      }, AnimationItem.prototype.setSegment = function(e, t) {
        var r = -1;
        this.isPaused && (this.currentRawFrame + this.firstFrame < e ? r = e : this.currentRawFrame + this.firstFrame > t && (r = t - e)), this.firstFrame = e, this.totalFrames = t - e, this.timeCompleted = this.totalFrames, r !== -1 && this.goToAndStop(r, !0);
      }, AnimationItem.prototype.playSegments = function(e, t) {
        if (t && (this.segments.length = 0), _typeof$4(e[0]) === "object") {
          var r, i = e.length;
          for (r = 0; r < i; r += 1)
            this.segments.push(e[r]);
        } else
          this.segments.push(e);
        this.segments.length && t && this.adjustSegment(this.segments.shift(), 0), this.isPaused && this.play();
      }, AnimationItem.prototype.resetSegments = function(e) {
        this.segments.length = 0, this.segments.push([this.animationData.ip, this.animationData.op]), e && this.checkSegments(0);
      }, AnimationItem.prototype.checkSegments = function(e) {
        return this.segments.length ? (this.adjustSegment(this.segments.shift(), e), !0) : !1;
      }, AnimationItem.prototype.destroy = function(e) {
        e && this.name !== e || !this.renderer || (this.renderer.destroy(), this.imagePreloader.destroy(), this.trigger("destroy"), this._cbs = null, this.onEnterFrame = null, this.onLoopComplete = null, this.onComplete = null, this.onSegmentStart = null, this.onDestroy = null, this.renderer = null, this.expressionsPlugin = null, this.imagePreloader = null, this.projectInterface = null);
      }, AnimationItem.prototype.setCurrentRawFrameValue = function(e) {
        this.currentRawFrame = e, this.gotoFrame();
      }, AnimationItem.prototype.setSpeed = function(e) {
        this.playSpeed = e, this.updaFrameModifier();
      }, AnimationItem.prototype.setDirection = function(e) {
        this.playDirection = e < 0 ? -1 : 1, this.updaFrameModifier();
      }, AnimationItem.prototype.setLoop = function(e) {
        this.loop = e;
      }, AnimationItem.prototype.setVolume = function(e, t) {
        t && this.name !== t || this.audioController.setVolume(e);
      }, AnimationItem.prototype.getVolume = function() {
        return this.audioController.getVolume();
      }, AnimationItem.prototype.mute = function(e) {
        e && this.name !== e || this.audioController.mute();
      }, AnimationItem.prototype.unmute = function(e) {
        e && this.name !== e || this.audioController.unmute();
      }, AnimationItem.prototype.updaFrameModifier = function() {
        this.frameModifier = this.frameMult * this.playSpeed * this.playDirection, this.audioController.setRate(this.playSpeed * this.playDirection);
      }, AnimationItem.prototype.getPath = function() {
        return this.path;
      }, AnimationItem.prototype.getAssetsPath = function(e) {
        var t = "";
        if (e.e)
          t = e.p;
        else if (this.assetsPath) {
          var r = e.p;
          r.indexOf("images/") !== -1 && (r = r.split("/")[1]), t = this.assetsPath + r;
        } else
          t = this.path, t += e.u ? e.u : "", t += e.p;
        return t;
      }, AnimationItem.prototype.getAssetData = function(e) {
        for (var t = 0, r = this.assets.length; t < r; ) {
          if (e === this.assets[t].id)
            return this.assets[t];
          t += 1;
        }
        return null;
      }, AnimationItem.prototype.hide = function() {
        this.renderer.hide();
      }, AnimationItem.prototype.show = function() {
        this.renderer.show();
      }, AnimationItem.prototype.getDuration = function(e) {
        return e ? this.totalFrames : this.totalFrames / this.frameRate;
      }, AnimationItem.prototype.updateDocumentData = function(e, t, r) {
        try {
          var i = this.renderer.getElementByPath(e);
          i.updateDocumentData(t, r);
        } catch {
        }
      }, AnimationItem.prototype.trigger = function(e) {
        if (this._cbs && this._cbs[e])
          switch (e) {
            case "enterFrame":
              this.triggerEvent(e, new BMEnterFrameEvent(e, this.currentFrame, this.totalFrames, this.frameModifier));
              break;
            case "drawnFrame":
              this.drawnFrameEvent.currentTime = this.currentFrame, this.drawnFrameEvent.totalTime = this.totalFrames, this.drawnFrameEvent.direction = this.frameModifier, this.triggerEvent(e, this.drawnFrameEvent);
              break;
            case "loopComplete":
              this.triggerEvent(e, new BMCompleteLoopEvent(e, this.loop, this.playCount, this.frameMult));
              break;
            case "complete":
              this.triggerEvent(e, new BMCompleteEvent(e, this.frameMult));
              break;
            case "segmentStart":
              this.triggerEvent(e, new BMSegmentStartEvent(e, this.firstFrame, this.totalFrames));
              break;
            case "destroy":
              this.triggerEvent(e, new BMDestroyEvent(e, this));
              break;
            default:
              this.triggerEvent(e);
          }
        e === "enterFrame" && this.onEnterFrame && this.onEnterFrame.call(this, new BMEnterFrameEvent(e, this.currentFrame, this.totalFrames, this.frameMult)), e === "loopComplete" && this.onLoopComplete && this.onLoopComplete.call(this, new BMCompleteLoopEvent(e, this.loop, this.playCount, this.frameMult)), e === "complete" && this.onComplete && this.onComplete.call(this, new BMCompleteEvent(e, this.frameMult)), e === "segmentStart" && this.onSegmentStart && this.onSegmentStart.call(this, new BMSegmentStartEvent(e, this.firstFrame, this.totalFrames)), e === "destroy" && this.onDestroy && this.onDestroy.call(this, new BMDestroyEvent(e, this));
      }, AnimationItem.prototype.triggerRenderFrameError = function(e) {
        var t = new BMRenderFrameErrorEvent(e, this.currentFrame);
        this.triggerEvent("error", t), this.onError && this.onError.call(this, t);
      }, AnimationItem.prototype.triggerConfigError = function(e) {
        var t = new BMConfigErrorEvent(e, this.currentFrame);
        this.triggerEvent("error", t), this.onError && this.onError.call(this, t);
      };
      var animationManager = (function() {
        var e = {}, t = [], r = 0, i = 0, s = 0, n = !0, a = !1;
        function l(C) {
          for (var T = 0, g = C.target; T < i; )
            t[T].animation === g && (t.splice(T, 1), T -= 1, i -= 1, g.isPaused || S()), T += 1;
        }
        function o(C, T) {
          if (!C)
            return null;
          for (var g = 0; g < i; ) {
            if (t[g].elem === C && t[g].elem !== null)
              return t[g].animation;
            g += 1;
          }
          var E = new AnimationItem();
          return f(E, C), E.setData(C, T), E;
        }
        function p() {
          var C, T = t.length, g = [];
          for (C = 0; C < T; C += 1)
            g.push(t[C].animation);
          return g;
        }
        function u() {
          s += 1, V();
        }
        function S() {
          s -= 1;
        }
        function f(C, T) {
          C.addEventListener("destroy", l), C.addEventListener("_active", u), C.addEventListener("_idle", S), t.push({
            elem: T,
            animation: C
          }), i += 1;
        }
        function b(C) {
          var T = new AnimationItem();
          return f(T, null), T.setParams(C), T;
        }
        function v(C, T) {
          var g;
          for (g = 0; g < i; g += 1)
            t[g].animation.setSpeed(C, T);
        }
        function m(C, T) {
          var g;
          for (g = 0; g < i; g += 1)
            t[g].animation.setDirection(C, T);
        }
        function x(C) {
          var T;
          for (T = 0; T < i; T += 1)
            t[T].animation.play(C);
        }
        function c(C) {
          var T = C - r, g;
          for (g = 0; g < i; g += 1)
            t[g].animation.advanceTime(T);
          r = C, s && !a ? window.requestAnimationFrame(c) : n = !0;
        }
        function d(C) {
          r = C, window.requestAnimationFrame(c);
        }
        function h(C) {
          var T;
          for (T = 0; T < i; T += 1)
            t[T].animation.pause(C);
        }
        function y(C, T, g) {
          var E;
          for (E = 0; E < i; E += 1)
            t[E].animation.goToAndStop(C, T, g);
        }
        function P(C) {
          var T;
          for (T = 0; T < i; T += 1)
            t[T].animation.stop(C);
        }
        function A(C) {
          var T;
          for (T = 0; T < i; T += 1)
            t[T].animation.togglePause(C);
        }
        function _(C) {
          var T;
          for (T = i - 1; T >= 0; T -= 1)
            t[T].animation.destroy(C);
        }
        function M(C, T, g) {
          var E = [].concat([].slice.call(document.getElementsByClassName("lottie")), [].slice.call(document.getElementsByClassName("bodymovin"))), F, k = E.length;
          for (F = 0; F < k; F += 1)
            g && E[F].setAttribute("data-bm-type", g), o(E[F], C);
          if (T && k === 0) {
            g || (g = "svg");
            var L = document.getElementsByTagName("body")[0];
            L.innerText = "";
            var O = createTag("div");
            O.style.width = "100%", O.style.height = "100%", O.setAttribute("data-bm-type", g), L.appendChild(O), o(O, C);
          }
        }
        function w() {
          var C;
          for (C = 0; C < i; C += 1)
            t[C].animation.resize();
        }
        function V() {
          !a && s && n && (window.requestAnimationFrame(d), n = !1);
        }
        function B() {
          a = !0;
        }
        function R() {
          a = !1, V();
        }
        function D(C, T) {
          var g;
          for (g = 0; g < i; g += 1)
            t[g].animation.setVolume(C, T);
        }
        function N(C) {
          var T;
          for (T = 0; T < i; T += 1)
            t[T].animation.mute(C);
        }
        function I(C) {
          var T;
          for (T = 0; T < i; T += 1)
            t[T].animation.unmute(C);
        }
        return e.registerAnimation = o, e.loadAnimation = b, e.setSpeed = v, e.setDirection = m, e.play = x, e.pause = h, e.stop = P, e.togglePause = A, e.searchAnimations = M, e.resize = w, e.goToAndStop = y, e.destroy = _, e.freeze = B, e.unfreeze = R, e.setVolume = D, e.mute = N, e.unmute = I, e.getRegisteredAnimations = p, e;
      })(), BezierFactory = (function() {
        var e = {};
        e.getBezierEasing = r;
        var t = {};
        function r(d, h, y, P, A) {
          var _ = A || ("bez_" + d + "_" + h + "_" + y + "_" + P).replace(/\./g, "p");
          if (t[_])
            return t[_];
          var M = new c([d, h, y, P]);
          return t[_] = M, M;
        }
        var i = 4, s = 1e-3, n = 1e-7, a = 10, l = 11, o = 1 / (l - 1), p = typeof Float32Array == "function";
        function u(d, h) {
          return 1 - 3 * h + 3 * d;
        }
        function S(d, h) {
          return 3 * h - 6 * d;
        }
        function f(d) {
          return 3 * d;
        }
        function b(d, h, y) {
          return ((u(h, y) * d + S(h, y)) * d + f(h)) * d;
        }
        function v(d, h, y) {
          return 3 * u(h, y) * d * d + 2 * S(h, y) * d + f(h);
        }
        function m(d, h, y, P, A) {
          var _, M, w = 0;
          do
            M = h + (y - h) / 2, _ = b(M, P, A) - d, _ > 0 ? y = M : h = M;
          while (Math.abs(_) > n && ++w < a);
          return M;
        }
        function x(d, h, y, P) {
          for (var A = 0; A < i; ++A) {
            var _ = v(h, y, P);
            if (_ === 0) return h;
            var M = b(h, y, P) - d;
            h -= M / _;
          }
          return h;
        }
        function c(d) {
          this._p = d, this._mSampleValues = p ? new Float32Array(l) : new Array(l), this._precomputed = !1, this.get = this.get.bind(this);
        }
        return c.prototype = {
          get: function(h) {
            var y = this._p[0], P = this._p[1], A = this._p[2], _ = this._p[3];
            return this._precomputed || this._precompute(), y === P && A === _ ? h : h === 0 ? 0 : h === 1 ? 1 : b(this._getTForX(h), P, _);
          },
          // Private part
          _precompute: function() {
            var h = this._p[0], y = this._p[1], P = this._p[2], A = this._p[3];
            this._precomputed = !0, (h !== y || P !== A) && this._calcSampleValues();
          },
          _calcSampleValues: function() {
            for (var h = this._p[0], y = this._p[2], P = 0; P < l; ++P)
              this._mSampleValues[P] = b(P * o, h, y);
          },
          /**
               * getTForX chose the fastest heuristic to determine the percentage value precisely from a given X projection.
               */
          _getTForX: function(h) {
            for (var y = this._p[0], P = this._p[2], A = this._mSampleValues, _ = 0, M = 1, w = l - 1; M !== w && A[M] <= h; ++M)
              _ += o;
            --M;
            var V = (h - A[M]) / (A[M + 1] - A[M]), B = _ + V * o, R = v(B, y, P);
            return R >= s ? x(h, B, y, P) : R === 0 ? B : m(h, _, _ + o, y, P);
          }
        }, e;
      })(), pooling = /* @__PURE__ */ (function() {
        function e(t) {
          return t.concat(createSizedArray(t.length));
        }
        return {
          double: e
        };
      })(), poolFactory = /* @__PURE__ */ (function() {
        return function(e, t, r) {
          var i = 0, s = e, n = createSizedArray(s), a = {
            newElement: l,
            release: o
          };
          function l() {
            var p;
            return i ? (i -= 1, p = n[i]) : p = t(), p;
          }
          function o(p) {
            i === s && (n = pooling.double(n), s *= 2), r && r(p), n[i] = p, i += 1;
          }
          return a;
        };
      })(), bezierLengthPool = (function() {
        function e() {
          return {
            addedLength: 0,
            percents: createTypedArray("float32", getDefaultCurveSegments()),
            lengths: createTypedArray("float32", getDefaultCurveSegments())
          };
        }
        return poolFactory(8, e);
      })(), segmentsLengthPool = (function() {
        function e() {
          return {
            lengths: [],
            totalLength: 0
          };
        }
        function t(r) {
          var i, s = r.lengths.length;
          for (i = 0; i < s; i += 1)
            bezierLengthPool.release(r.lengths[i]);
          r.lengths.length = 0;
        }
        return poolFactory(8, e, t);
      })();
      function bezFunction() {
        var e = Math;
        function t(f, b, v, m, x, c) {
          var d = f * m + b * x + v * c - x * m - c * f - v * b;
          return d > -1e-3 && d < 1e-3;
        }
        function r(f, b, v, m, x, c, d, h, y) {
          if (v === 0 && c === 0 && y === 0)
            return t(f, b, m, x, d, h);
          var P = e.sqrt(e.pow(m - f, 2) + e.pow(x - b, 2) + e.pow(c - v, 2)), A = e.sqrt(e.pow(d - f, 2) + e.pow(h - b, 2) + e.pow(y - v, 2)), _ = e.sqrt(e.pow(d - m, 2) + e.pow(h - x, 2) + e.pow(y - c, 2)), M;
          return P > A ? P > _ ? M = P - A - _ : M = _ - A - P : _ > A ? M = _ - A - P : M = A - P - _, M > -1e-4 && M < 1e-4;
        }
        var i = /* @__PURE__ */ (function() {
          return function(f, b, v, m) {
            var x = getDefaultCurveSegments(), c, d, h, y, P, A = 0, _, M = [], w = [], V = bezierLengthPool.newElement();
            for (h = v.length, c = 0; c < x; c += 1) {
              for (P = c / (x - 1), _ = 0, d = 0; d < h; d += 1)
                y = bmPow(1 - P, 3) * f[d] + 3 * bmPow(1 - P, 2) * P * v[d] + 3 * (1 - P) * bmPow(P, 2) * m[d] + bmPow(P, 3) * b[d], M[d] = y, w[d] !== null && (_ += bmPow(M[d] - w[d], 2)), w[d] = M[d];
              _ && (_ = bmSqrt(_), A += _), V.percents[c] = P, V.lengths[c] = A;
            }
            return V.addedLength = A, V;
          };
        })();
        function s(f) {
          var b = segmentsLengthPool.newElement(), v = f.c, m = f.v, x = f.o, c = f.i, d, h = f._length, y = b.lengths, P = 0;
          for (d = 0; d < h - 1; d += 1)
            y[d] = i(m[d], m[d + 1], x[d], c[d + 1]), P += y[d].addedLength;
          return v && h && (y[d] = i(m[d], m[0], x[d], c[0]), P += y[d].addedLength), b.totalLength = P, b;
        }
        function n(f) {
          this.segmentLength = 0, this.points = new Array(f);
        }
        function a(f, b) {
          this.partialLength = f, this.point = b;
        }
        var l = /* @__PURE__ */ (function() {
          var f = {};
          return function(b, v, m, x) {
            var c = (b[0] + "_" + b[1] + "_" + v[0] + "_" + v[1] + "_" + m[0] + "_" + m[1] + "_" + x[0] + "_" + x[1]).replace(/\./g, "p");
            if (!f[c]) {
              var d = getDefaultCurveSegments(), h, y, P, A, _, M = 0, w, V, B = null;
              b.length === 2 && (b[0] !== v[0] || b[1] !== v[1]) && t(b[0], b[1], v[0], v[1], b[0] + m[0], b[1] + m[1]) && t(b[0], b[1], v[0], v[1], v[0] + x[0], v[1] + x[1]) && (d = 2);
              var R = new n(d);
              for (P = m.length, h = 0; h < d; h += 1) {
                for (V = createSizedArray(P), _ = h / (d - 1), w = 0, y = 0; y < P; y += 1)
                  A = bmPow(1 - _, 3) * b[y] + 3 * bmPow(1 - _, 2) * _ * (b[y] + m[y]) + 3 * (1 - _) * bmPow(_, 2) * (v[y] + x[y]) + bmPow(_, 3) * v[y], V[y] = A, B !== null && (w += bmPow(V[y] - B[y], 2));
                w = bmSqrt(w), M += w, R.points[h] = new a(w, V), B = V;
              }
              R.segmentLength = M, f[c] = R;
            }
            return f[c];
          };
        })();
        function o(f, b) {
          var v = b.percents, m = b.lengths, x = v.length, c = bmFloor((x - 1) * f), d = f * b.addedLength, h = 0;
          if (c === x - 1 || c === 0 || d === m[c])
            return v[c];
          for (var y = m[c] > d ? -1 : 1, P = !0; P; )
            if (m[c] <= d && m[c + 1] > d ? (h = (d - m[c]) / (m[c + 1] - m[c]), P = !1) : c += y, c < 0 || c >= x - 1) {
              if (c === x - 1)
                return v[c];
              P = !1;
            }
          return v[c] + (v[c + 1] - v[c]) * h;
        }
        function p(f, b, v, m, x, c) {
          var d = o(x, c), h = 1 - d, y = e.round((h * h * h * f[0] + (d * h * h + h * d * h + h * h * d) * v[0] + (d * d * h + h * d * d + d * h * d) * m[0] + d * d * d * b[0]) * 1e3) / 1e3, P = e.round((h * h * h * f[1] + (d * h * h + h * d * h + h * h * d) * v[1] + (d * d * h + h * d * d + d * h * d) * m[1] + d * d * d * b[1]) * 1e3) / 1e3;
          return [y, P];
        }
        var u = createTypedArray("float32", 8);
        function S(f, b, v, m, x, c, d) {
          x < 0 ? x = 0 : x > 1 && (x = 1);
          var h = o(x, d);
          c = c > 1 ? 1 : c;
          var y = o(c, d), P, A = f.length, _ = 1 - h, M = 1 - y, w = _ * _ * _, V = h * _ * _ * 3, B = h * h * _ * 3, R = h * h * h, D = _ * _ * M, N = h * _ * M + _ * h * M + _ * _ * y, I = h * h * M + _ * h * y + h * _ * y, C = h * h * y, T = _ * M * M, g = h * M * M + _ * y * M + _ * M * y, E = h * y * M + _ * y * y + h * M * y, F = h * y * y, k = M * M * M, L = y * M * M + M * y * M + M * M * y, O = y * y * M + M * y * y + y * M * y, G = y * y * y;
          for (P = 0; P < A; P += 1)
            u[P * 4] = e.round((w * f[P] + V * v[P] + B * m[P] + R * b[P]) * 1e3) / 1e3, u[P * 4 + 1] = e.round((D * f[P] + N * v[P] + I * m[P] + C * b[P]) * 1e3) / 1e3, u[P * 4 + 2] = e.round((T * f[P] + g * v[P] + E * m[P] + F * b[P]) * 1e3) / 1e3, u[P * 4 + 3] = e.round((k * f[P] + L * v[P] + O * m[P] + G * b[P]) * 1e3) / 1e3;
          return u;
        }
        return {
          getSegmentsLength: s,
          getNewSegment: S,
          getPointInSegment: p,
          buildBezierData: l,
          pointOnLine2D: t,
          pointOnLine3D: r
        };
      }
      var bez = bezFunction(), initFrame = initialDefaultFrame, mathAbs = Math.abs;
      function interpolateValue(e, t) {
        var r = this.offsetTime, i;
        this.propType === "multidimensional" && (i = createTypedArray("float32", this.pv.length));
        for (var s = t.lastIndex, n = s, a = this.keyframes.length - 1, l = !0, o, p, u; l; ) {
          if (o = this.keyframes[n], p = this.keyframes[n + 1], n === a - 1 && e >= p.t - r) {
            o.h && (o = p), s = 0;
            break;
          }
          if (p.t - r > e) {
            s = n;
            break;
          }
          n < a - 1 ? n += 1 : (s = 0, l = !1);
        }
        u = this.keyframesMetadata[n] || {};
        var S, f, b, v, m, x, c = p.t - r, d = o.t - r, h;
        if (o.to) {
          u.bezierData || (u.bezierData = bez.buildBezierData(o.s, p.s || o.e, o.to, o.ti));
          var y = u.bezierData;
          if (e >= c || e < d) {
            var P = e >= c ? y.points.length - 1 : 0;
            for (f = y.points[P].point.length, S = 0; S < f; S += 1)
              i[S] = y.points[P].point[S];
          } else {
            u.__fnct ? x = u.__fnct : (x = BezierFactory.getBezierEasing(o.o.x, o.o.y, o.i.x, o.i.y, o.n).get, u.__fnct = x), b = x((e - d) / (c - d));
            var A = y.segmentLength * b, _, M = t.lastFrame < e && t._lastKeyframeIndex === n ? t._lastAddedLength : 0;
            for (m = t.lastFrame < e && t._lastKeyframeIndex === n ? t._lastPoint : 0, l = !0, v = y.points.length; l; ) {
              if (M += y.points[m].partialLength, A === 0 || b === 0 || m === y.points.length - 1) {
                for (f = y.points[m].point.length, S = 0; S < f; S += 1)
                  i[S] = y.points[m].point[S];
                break;
              } else if (A >= M && A < M + y.points[m + 1].partialLength) {
                for (_ = (A - M) / y.points[m + 1].partialLength, f = y.points[m].point.length, S = 0; S < f; S += 1)
                  i[S] = y.points[m].point[S] + (y.points[m + 1].point[S] - y.points[m].point[S]) * _;
                break;
              }
              m < v - 1 ? m += 1 : l = !1;
            }
            t._lastPoint = m, t._lastAddedLength = M - y.points[m].partialLength, t._lastKeyframeIndex = n;
          }
        } else {
          var w, V, B, R, D;
          if (a = o.s.length, h = p.s || o.e, this.sh && o.h !== 1)
            if (e >= c)
              i[0] = h[0], i[1] = h[1], i[2] = h[2];
            else if (e <= d)
              i[0] = o.s[0], i[1] = o.s[1], i[2] = o.s[2];
            else {
              var N = createQuaternion(o.s), I = createQuaternion(h), C = (e - d) / (c - d);
              quaternionToEuler(i, slerp(N, I, C));
            }
          else
            for (n = 0; n < a; n += 1)
              o.h !== 1 && (e >= c ? b = 1 : e < d ? b = 0 : (o.o.x.constructor === Array ? (u.__fnct || (u.__fnct = []), u.__fnct[n] ? x = u.__fnct[n] : (w = o.o.x[n] === void 0 ? o.o.x[0] : o.o.x[n], V = o.o.y[n] === void 0 ? o.o.y[0] : o.o.y[n], B = o.i.x[n] === void 0 ? o.i.x[0] : o.i.x[n], R = o.i.y[n] === void 0 ? o.i.y[0] : o.i.y[n], x = BezierFactory.getBezierEasing(w, V, B, R).get, u.__fnct[n] = x)) : u.__fnct ? x = u.__fnct : (w = o.o.x, V = o.o.y, B = o.i.x, R = o.i.y, x = BezierFactory.getBezierEasing(w, V, B, R).get, o.keyframeMetadata = x), b = x((e - d) / (c - d)))), h = p.s || o.e, D = o.h === 1 ? o.s[n] : o.s[n] + (h[n] - o.s[n]) * b, this.propType === "multidimensional" ? i[n] = D : i = D;
        }
        return t.lastIndex = s, i;
      }
      function slerp(e, t, r) {
        var i = [], s = e[0], n = e[1], a = e[2], l = e[3], o = t[0], p = t[1], u = t[2], S = t[3], f, b, v, m, x;
        return b = s * o + n * p + a * u + l * S, b < 0 && (b = -b, o = -o, p = -p, u = -u, S = -S), 1 - b > 1e-6 ? (f = Math.acos(b), v = Math.sin(f), m = Math.sin((1 - r) * f) / v, x = Math.sin(r * f) / v) : (m = 1 - r, x = r), i[0] = m * s + x * o, i[1] = m * n + x * p, i[2] = m * a + x * u, i[3] = m * l + x * S, i;
      }
      function quaternionToEuler(e, t) {
        var r = t[0], i = t[1], s = t[2], n = t[3], a = Math.atan2(2 * i * n - 2 * r * s, 1 - 2 * i * i - 2 * s * s), l = Math.asin(2 * r * i + 2 * s * n), o = Math.atan2(2 * r * n - 2 * i * s, 1 - 2 * r * r - 2 * s * s);
        e[0] = a / degToRads, e[1] = l / degToRads, e[2] = o / degToRads;
      }
      function createQuaternion(e) {
        var t = e[0] * degToRads, r = e[1] * degToRads, i = e[2] * degToRads, s = Math.cos(t / 2), n = Math.cos(r / 2), a = Math.cos(i / 2), l = Math.sin(t / 2), o = Math.sin(r / 2), p = Math.sin(i / 2), u = s * n * a - l * o * p, S = l * o * a + s * n * p, f = l * n * a + s * o * p, b = s * o * a - l * n * p;
        return [S, f, b, u];
      }
      function getValueAtCurrentTime() {
        var e = this.comp.renderedFrame - this.offsetTime, t = this.keyframes[0].t - this.offsetTime, r = this.keyframes[this.keyframes.length - 1].t - this.offsetTime;
        if (!(e === this._caching.lastFrame || this._caching.lastFrame !== initFrame && (this._caching.lastFrame >= r && e >= r || this._caching.lastFrame < t && e < t))) {
          this._caching.lastFrame >= e && (this._caching._lastKeyframeIndex = -1, this._caching.lastIndex = 0);
          var i = this.interpolateValue(e, this._caching);
          this.pv = i;
        }
        return this._caching.lastFrame = e, this.pv;
      }
      function setVValue(e) {
        var t;
        if (this.propType === "unidimensional")
          t = e * this.mult, mathAbs(this.v - t) > 1e-5 && (this.v = t, this._mdf = !0);
        else
          for (var r = 0, i = this.v.length; r < i; )
            t = e[r] * this.mult, mathAbs(this.v[r] - t) > 1e-5 && (this.v[r] = t, this._mdf = !0), r += 1;
      }
      function processEffectsSequence() {
        if (!(this.elem.globalData.frameId === this.frameId || !this.effectsSequence.length)) {
          if (this.lock) {
            this.setVValue(this.pv);
            return;
          }
          this.lock = !0, this._mdf = this._isFirstFrame;
          var e, t = this.effectsSequence.length, r = this.kf ? this.pv : this.data.k;
          for (e = 0; e < t; e += 1)
            r = this.effectsSequence[e](r);
          this.setVValue(r), this._isFirstFrame = !1, this.lock = !1, this.frameId = this.elem.globalData.frameId;
        }
      }
      function addEffect(e) {
        this.effectsSequence.push(e), this.container.addDynamicProperty(this);
      }
      function ValueProperty(e, t, r, i) {
        this.propType = "unidimensional", this.mult = r || 1, this.data = t, this.v = r ? t.k * r : t.k, this.pv = t.k, this._mdf = !1, this.elem = e, this.container = i, this.comp = e.comp, this.k = !1, this.kf = !1, this.vel = 0, this.effectsSequence = [], this._isFirstFrame = !0, this.getValue = processEffectsSequence, this.setVValue = setVValue, this.addEffect = addEffect;
      }
      function MultiDimensionalProperty(e, t, r, i) {
        this.propType = "multidimensional", this.mult = r || 1, this.data = t, this._mdf = !1, this.elem = e, this.container = i, this.comp = e.comp, this.k = !1, this.kf = !1, this.frameId = -1;
        var s, n = t.k.length;
        for (this.v = createTypedArray("float32", n), this.pv = createTypedArray("float32", n), this.vel = createTypedArray("float32", n), s = 0; s < n; s += 1)
          this.v[s] = t.k[s] * this.mult, this.pv[s] = t.k[s];
        this._isFirstFrame = !0, this.effectsSequence = [], this.getValue = processEffectsSequence, this.setVValue = setVValue, this.addEffect = addEffect;
      }
      function KeyframedValueProperty(e, t, r, i) {
        this.propType = "unidimensional", this.keyframes = t.k, this.keyframesMetadata = [], this.offsetTime = e.data.st, this.frameId = -1, this._caching = {
          lastFrame: initFrame,
          lastIndex: 0,
          value: 0,
          _lastKeyframeIndex: -1
        }, this.k = !0, this.kf = !0, this.data = t, this.mult = r || 1, this.elem = e, this.container = i, this.comp = e.comp, this.v = initFrame, this.pv = initFrame, this._isFirstFrame = !0, this.getValue = processEffectsSequence, this.setVValue = setVValue, this.interpolateValue = interpolateValue, this.effectsSequence = [getValueAtCurrentTime.bind(this)], this.addEffect = addEffect;
      }
      function KeyframedMultidimensionalProperty(e, t, r, i) {
        this.propType = "multidimensional";
        var s, n = t.k.length, a, l, o, p;
        for (s = 0; s < n - 1; s += 1)
          t.k[s].to && t.k[s].s && t.k[s + 1] && t.k[s + 1].s && (a = t.k[s].s, l = t.k[s + 1].s, o = t.k[s].to, p = t.k[s].ti, (a.length === 2 && !(a[0] === l[0] && a[1] === l[1]) && bez.pointOnLine2D(a[0], a[1], l[0], l[1], a[0] + o[0], a[1] + o[1]) && bez.pointOnLine2D(a[0], a[1], l[0], l[1], l[0] + p[0], l[1] + p[1]) || a.length === 3 && !(a[0] === l[0] && a[1] === l[1] && a[2] === l[2]) && bez.pointOnLine3D(a[0], a[1], a[2], l[0], l[1], l[2], a[0] + o[0], a[1] + o[1], a[2] + o[2]) && bez.pointOnLine3D(a[0], a[1], a[2], l[0], l[1], l[2], l[0] + p[0], l[1] + p[1], l[2] + p[2])) && (t.k[s].to = null, t.k[s].ti = null), a[0] === l[0] && a[1] === l[1] && o[0] === 0 && o[1] === 0 && p[0] === 0 && p[1] === 0 && (a.length === 2 || a[2] === l[2] && o[2] === 0 && p[2] === 0) && (t.k[s].to = null, t.k[s].ti = null));
        this.effectsSequence = [getValueAtCurrentTime.bind(this)], this.data = t, this.keyframes = t.k, this.keyframesMetadata = [], this.offsetTime = e.data.st, this.k = !0, this.kf = !0, this._isFirstFrame = !0, this.mult = r || 1, this.elem = e, this.container = i, this.comp = e.comp, this.getValue = processEffectsSequence, this.setVValue = setVValue, this.interpolateValue = interpolateValue, this.frameId = -1;
        var u = t.k[0].s.length;
        for (this.v = createTypedArray("float32", u), this.pv = createTypedArray("float32", u), s = 0; s < u; s += 1)
          this.v[s] = initFrame, this.pv[s] = initFrame;
        this._caching = {
          lastFrame: initFrame,
          lastIndex: 0,
          value: createTypedArray("float32", u)
        }, this.addEffect = addEffect;
      }
      var PropertyFactory = /* @__PURE__ */ (function() {
        function e(r, i, s, n, a) {
          i.sid && (i = r.globalData.slotManager.getProp(i));
          var l;
          if (!i.k.length)
            l = new ValueProperty(r, i, n, a);
          else if (typeof i.k[0] == "number")
            l = new MultiDimensionalProperty(r, i, n, a);
          else
            switch (s) {
              case 0:
                l = new KeyframedValueProperty(r, i, n, a);
                break;
              case 1:
                l = new KeyframedMultidimensionalProperty(r, i, n, a);
                break;
            }
          return l.effectsSequence.length && a.addDynamicProperty(l), l;
        }
        var t = {
          getProp: e
        };
        return t;
      })();
      function DynamicPropertyContainer() {
      }
      DynamicPropertyContainer.prototype = {
        addDynamicProperty: function(t) {
          this.dynamicProperties.indexOf(t) === -1 && (this.dynamicProperties.push(t), this.container.addDynamicProperty(this), this._isAnimated = !0);
        },
        iterateDynamicProperties: function() {
          this._mdf = !1;
          var t, r = this.dynamicProperties.length;
          for (t = 0; t < r; t += 1)
            this.dynamicProperties[t].getValue(), this.dynamicProperties[t]._mdf && (this._mdf = !0);
        },
        initDynamicPropertyContainer: function(t) {
          this.container = t, this.dynamicProperties = [], this._mdf = !1, this._isAnimated = !1;
        }
      };
      var pointPool = (function() {
        function e() {
          return createTypedArray("float32", 2);
        }
        return poolFactory(8, e);
      })();
      function ShapePath() {
        this.c = !1, this._length = 0, this._maxLength = 8, this.v = createSizedArray(this._maxLength), this.o = createSizedArray(this._maxLength), this.i = createSizedArray(this._maxLength);
      }
      ShapePath.prototype.setPathData = function(e, t) {
        this.c = e, this.setLength(t);
        for (var r = 0; r < t; )
          this.v[r] = pointPool.newElement(), this.o[r] = pointPool.newElement(), this.i[r] = pointPool.newElement(), r += 1;
      }, ShapePath.prototype.setLength = function(e) {
        for (; this._maxLength < e; )
          this.doubleArrayLength();
        this._length = e;
      }, ShapePath.prototype.doubleArrayLength = function() {
        this.v = this.v.concat(createSizedArray(this._maxLength)), this.i = this.i.concat(createSizedArray(this._maxLength)), this.o = this.o.concat(createSizedArray(this._maxLength)), this._maxLength *= 2;
      }, ShapePath.prototype.setXYAt = function(e, t, r, i, s) {
        var n;
        switch (this._length = Math.max(this._length, i + 1), this._length >= this._maxLength && this.doubleArrayLength(), r) {
          case "v":
            n = this.v;
            break;
          case "i":
            n = this.i;
            break;
          case "o":
            n = this.o;
            break;
          default:
            n = [];
            break;
        }
        (!n[i] || n[i] && !s) && (n[i] = pointPool.newElement()), n[i][0] = e, n[i][1] = t;
      }, ShapePath.prototype.setTripleAt = function(e, t, r, i, s, n, a, l) {
        this.setXYAt(e, t, "v", a, l), this.setXYAt(r, i, "o", a, l), this.setXYAt(s, n, "i", a, l);
      }, ShapePath.prototype.reverse = function() {
        var e = new ShapePath();
        e.setPathData(this.c, this._length);
        var t = this.v, r = this.o, i = this.i, s = 0;
        this.c && (e.setTripleAt(t[0][0], t[0][1], i[0][0], i[0][1], r[0][0], r[0][1], 0, !1), s = 1);
        var n = this._length - 1, a = this._length, l;
        for (l = s; l < a; l += 1)
          e.setTripleAt(t[n][0], t[n][1], i[n][0], i[n][1], r[n][0], r[n][1], l, !1), n -= 1;
        return e;
      }, ShapePath.prototype.length = function() {
        return this._length;
      };
      var shapePool = (function() {
        function e() {
          return new ShapePath();
        }
        function t(s) {
          var n = s._length, a;
          for (a = 0; a < n; a += 1)
            pointPool.release(s.v[a]), pointPool.release(s.i[a]), pointPool.release(s.o[a]), s.v[a] = null, s.i[a] = null, s.o[a] = null;
          s._length = 0, s.c = !1;
        }
        function r(s) {
          var n = i.newElement(), a, l = s._length === void 0 ? s.v.length : s._length;
          for (n.setLength(l), n.c = s.c, a = 0; a < l; a += 1)
            n.setTripleAt(s.v[a][0], s.v[a][1], s.o[a][0], s.o[a][1], s.i[a][0], s.i[a][1], a);
          return n;
        }
        var i = poolFactory(4, e, t);
        return i.clone = r, i;
      })();
      function ShapeCollection() {
        this._length = 0, this._maxLength = 4, this.shapes = createSizedArray(this._maxLength);
      }
      ShapeCollection.prototype.addShape = function(e) {
        this._length === this._maxLength && (this.shapes = this.shapes.concat(createSizedArray(this._maxLength)), this._maxLength *= 2), this.shapes[this._length] = e, this._length += 1;
      }, ShapeCollection.prototype.releaseShapes = function() {
        var e;
        for (e = 0; e < this._length; e += 1)
          shapePool.release(this.shapes[e]);
        this._length = 0;
      };
      var shapeCollectionPool = (function() {
        var e = {
          newShapeCollection: s,
          release: n
        }, t = 0, r = 4, i = createSizedArray(r);
        function s() {
          var a;
          return t ? (t -= 1, a = i[t]) : a = new ShapeCollection(), a;
        }
        function n(a) {
          var l, o = a._length;
          for (l = 0; l < o; l += 1)
            shapePool.release(a.shapes[l]);
          a._length = 0, t === r && (i = pooling.double(i), r *= 2), i[t] = a, t += 1;
        }
        return e;
      })(), ShapePropertyFactory = (function() {
        var e = -999999;
        function t(c, d, h) {
          var y = h.lastIndex, P, A, _, M, w, V, B, R, D, N = this.keyframes;
          if (c < N[0].t - this.offsetTime)
            P = N[0].s[0], _ = !0, y = 0;
          else if (c >= N[N.length - 1].t - this.offsetTime)
            P = N[N.length - 1].s ? N[N.length - 1].s[0] : N[N.length - 2].e[0], _ = !0;
          else {
            for (var I = y, C = N.length - 1, T = !0, g, E, F; T && (g = N[I], E = N[I + 1], !(E.t - this.offsetTime > c)); )
              I < C - 1 ? I += 1 : T = !1;
            if (F = this.keyframesMetadata[I] || {}, _ = g.h === 1, y = I, !_) {
              if (c >= E.t - this.offsetTime)
                R = 1;
              else if (c < g.t - this.offsetTime)
                R = 0;
              else {
                var k;
                F.__fnct ? k = F.__fnct : (k = BezierFactory.getBezierEasing(g.o.x, g.o.y, g.i.x, g.i.y).get, F.__fnct = k), R = k((c - (g.t - this.offsetTime)) / (E.t - this.offsetTime - (g.t - this.offsetTime)));
              }
              A = E.s ? E.s[0] : g.e[0];
            }
            P = g.s[0];
          }
          for (V = d._length, B = P.i[0].length, h.lastIndex = y, M = 0; M < V; M += 1)
            for (w = 0; w < B; w += 1)
              D = _ ? P.i[M][w] : P.i[M][w] + (A.i[M][w] - P.i[M][w]) * R, d.i[M][w] = D, D = _ ? P.o[M][w] : P.o[M][w] + (A.o[M][w] - P.o[M][w]) * R, d.o[M][w] = D, D = _ ? P.v[M][w] : P.v[M][w] + (A.v[M][w] - P.v[M][w]) * R, d.v[M][w] = D;
        }
        function r() {
          var c = this.comp.renderedFrame - this.offsetTime, d = this.keyframes[0].t - this.offsetTime, h = this.keyframes[this.keyframes.length - 1].t - this.offsetTime, y = this._caching.lastFrame;
          return y !== e && (y < d && c < d || y > h && c > h) || (this._caching.lastIndex = y < c ? this._caching.lastIndex : 0, this.interpolateShape(c, this.pv, this._caching)), this._caching.lastFrame = c, this.pv;
        }
        function i() {
          this.paths = this.localShapeCollection;
        }
        function s(c, d) {
          if (c._length !== d._length || c.c !== d.c)
            return !1;
          var h, y = c._length;
          for (h = 0; h < y; h += 1)
            if (c.v[h][0] !== d.v[h][0] || c.v[h][1] !== d.v[h][1] || c.o[h][0] !== d.o[h][0] || c.o[h][1] !== d.o[h][1] || c.i[h][0] !== d.i[h][0] || c.i[h][1] !== d.i[h][1])
              return !1;
          return !0;
        }
        function n(c) {
          s(this.v, c) || (this.v = shapePool.clone(c), this.localShapeCollection.releaseShapes(), this.localShapeCollection.addShape(this.v), this._mdf = !0, this.paths = this.localShapeCollection);
        }
        function a() {
          if (this.elem.globalData.frameId !== this.frameId) {
            if (!this.effectsSequence.length) {
              this._mdf = !1;
              return;
            }
            if (this.lock) {
              this.setVValue(this.pv);
              return;
            }
            this.lock = !0, this._mdf = !1;
            var c;
            this.kf ? c = this.pv : this.data.ks ? c = this.data.ks.k : c = this.data.pt.k;
            var d, h = this.effectsSequence.length;
            for (d = 0; d < h; d += 1)
              c = this.effectsSequence[d](c);
            this.setVValue(c), this.lock = !1, this.frameId = this.elem.globalData.frameId;
          }
        }
        function l(c, d, h) {
          this.propType = "shape", this.comp = c.comp, this.container = c, this.elem = c, this.data = d, this.k = !1, this.kf = !1, this._mdf = !1;
          var y = h === 3 ? d.pt.k : d.ks.k;
          this.v = shapePool.clone(y), this.pv = shapePool.clone(this.v), this.localShapeCollection = shapeCollectionPool.newShapeCollection(), this.paths = this.localShapeCollection, this.paths.addShape(this.v), this.reset = i, this.effectsSequence = [];
        }
        function o(c) {
          this.effectsSequence.push(c), this.container.addDynamicProperty(this);
        }
        l.prototype.interpolateShape = t, l.prototype.getValue = a, l.prototype.setVValue = n, l.prototype.addEffect = o;
        function p(c, d, h) {
          this.propType = "shape", this.comp = c.comp, this.elem = c, this.container = c, this.offsetTime = c.data.st, this.keyframes = h === 3 ? d.pt.k : d.ks.k, this.keyframesMetadata = [], this.k = !0, this.kf = !0;
          var y = this.keyframes[0].s[0].i.length;
          this.v = shapePool.newElement(), this.v.setPathData(this.keyframes[0].s[0].c, y), this.pv = shapePool.clone(this.v), this.localShapeCollection = shapeCollectionPool.newShapeCollection(), this.paths = this.localShapeCollection, this.paths.addShape(this.v), this.lastFrame = e, this.reset = i, this._caching = {
            lastFrame: e,
            lastIndex: 0
          }, this.effectsSequence = [r.bind(this)];
        }
        p.prototype.getValue = a, p.prototype.interpolateShape = t, p.prototype.setVValue = n, p.prototype.addEffect = o;
        var u = (function() {
          var c = roundCorner;
          function d(h, y) {
            this.v = shapePool.newElement(), this.v.setPathData(!0, 4), this.localShapeCollection = shapeCollectionPool.newShapeCollection(), this.paths = this.localShapeCollection, this.localShapeCollection.addShape(this.v), this.d = y.d, this.elem = h, this.comp = h.comp, this.frameId = -1, this.initDynamicPropertyContainer(h), this.p = PropertyFactory.getProp(h, y.p, 1, 0, this), this.s = PropertyFactory.getProp(h, y.s, 1, 0, this), this.dynamicProperties.length ? this.k = !0 : (this.k = !1, this.convertEllToPath());
          }
          return d.prototype = {
            reset: i,
            getValue: function() {
              this.elem.globalData.frameId !== this.frameId && (this.frameId = this.elem.globalData.frameId, this.iterateDynamicProperties(), this._mdf && this.convertEllToPath());
            },
            convertEllToPath: function() {
              var y = this.p.v[0], P = this.p.v[1], A = this.s.v[0] / 2, _ = this.s.v[1] / 2, M = this.d !== 3, w = this.v;
              w.v[0][0] = y, w.v[0][1] = P - _, w.v[1][0] = M ? y + A : y - A, w.v[1][1] = P, w.v[2][0] = y, w.v[2][1] = P + _, w.v[3][0] = M ? y - A : y + A, w.v[3][1] = P, w.i[0][0] = M ? y - A * c : y + A * c, w.i[0][1] = P - _, w.i[1][0] = M ? y + A : y - A, w.i[1][1] = P - _ * c, w.i[2][0] = M ? y + A * c : y - A * c, w.i[2][1] = P + _, w.i[3][0] = M ? y - A : y + A, w.i[3][1] = P + _ * c, w.o[0][0] = M ? y + A * c : y - A * c, w.o[0][1] = P - _, w.o[1][0] = M ? y + A : y - A, w.o[1][1] = P + _ * c, w.o[2][0] = M ? y - A * c : y + A * c, w.o[2][1] = P + _, w.o[3][0] = M ? y - A : y + A, w.o[3][1] = P - _ * c;
            }
          }, extendPrototype([DynamicPropertyContainer], d), d;
        })(), S = (function() {
          function c(d, h) {
            this.v = shapePool.newElement(), this.v.setPathData(!0, 0), this.elem = d, this.comp = d.comp, this.data = h, this.frameId = -1, this.d = h.d, this.initDynamicPropertyContainer(d), h.sy === 1 ? (this.ir = PropertyFactory.getProp(d, h.ir, 0, 0, this), this.is = PropertyFactory.getProp(d, h.is, 0, 0.01, this), this.convertToPath = this.convertStarToPath) : this.convertToPath = this.convertPolygonToPath, this.pt = PropertyFactory.getProp(d, h.pt, 0, 0, this), this.p = PropertyFactory.getProp(d, h.p, 1, 0, this), this.r = PropertyFactory.getProp(d, h.r, 0, degToRads, this), this.or = PropertyFactory.getProp(d, h.or, 0, 0, this), this.os = PropertyFactory.getProp(d, h.os, 0, 0.01, this), this.localShapeCollection = shapeCollectionPool.newShapeCollection(), this.localShapeCollection.addShape(this.v), this.paths = this.localShapeCollection, this.dynamicProperties.length ? this.k = !0 : (this.k = !1, this.convertToPath());
          }
          return c.prototype = {
            reset: i,
            getValue: function() {
              this.elem.globalData.frameId !== this.frameId && (this.frameId = this.elem.globalData.frameId, this.iterateDynamicProperties(), this._mdf && this.convertToPath());
            },
            convertStarToPath: function() {
              var h = Math.floor(this.pt.v) * 2, y = Math.PI * 2 / h, P = !0, A = this.or.v, _ = this.ir.v, M = this.os.v, w = this.is.v, V = 2 * Math.PI * A / (h * 2), B = 2 * Math.PI * _ / (h * 2), R, D, N, I, C = -Math.PI / 2;
              C += this.r.v;
              var T = this.data.d === 3 ? -1 : 1;
              for (this.v._length = 0, R = 0; R < h; R += 1) {
                D = P ? A : _, N = P ? M : w, I = P ? V : B;
                var g = D * Math.cos(C), E = D * Math.sin(C), F = g === 0 && E === 0 ? 0 : E / Math.sqrt(g * g + E * E), k = g === 0 && E === 0 ? 0 : -g / Math.sqrt(g * g + E * E);
                g += +this.p.v[0], E += +this.p.v[1], this.v.setTripleAt(g, E, g - F * I * N * T, E - k * I * N * T, g + F * I * N * T, E + k * I * N * T, R, !0), P = !P, C += y * T;
              }
            },
            convertPolygonToPath: function() {
              var h = Math.floor(this.pt.v), y = Math.PI * 2 / h, P = this.or.v, A = this.os.v, _ = 2 * Math.PI * P / (h * 4), M, w = -Math.PI * 0.5, V = this.data.d === 3 ? -1 : 1;
              for (w += this.r.v, this.v._length = 0, M = 0; M < h; M += 1) {
                var B = P * Math.cos(w), R = P * Math.sin(w), D = B === 0 && R === 0 ? 0 : R / Math.sqrt(B * B + R * R), N = B === 0 && R === 0 ? 0 : -B / Math.sqrt(B * B + R * R);
                B += +this.p.v[0], R += +this.p.v[1], this.v.setTripleAt(B, R, B - D * _ * A * V, R - N * _ * A * V, B + D * _ * A * V, R + N * _ * A * V, M, !0), w += y * V;
              }
              this.paths.length = 0, this.paths[0] = this.v;
            }
          }, extendPrototype([DynamicPropertyContainer], c), c;
        })(), f = (function() {
          function c(d, h) {
            this.v = shapePool.newElement(), this.v.c = !0, this.localShapeCollection = shapeCollectionPool.newShapeCollection(), this.localShapeCollection.addShape(this.v), this.paths = this.localShapeCollection, this.elem = d, this.comp = d.comp, this.frameId = -1, this.d = h.d, this.initDynamicPropertyContainer(d), this.p = PropertyFactory.getProp(d, h.p, 1, 0, this), this.s = PropertyFactory.getProp(d, h.s, 1, 0, this), this.r = PropertyFactory.getProp(d, h.r, 0, 0, this), this.dynamicProperties.length ? this.k = !0 : (this.k = !1, this.convertRectToPath());
          }
          return c.prototype = {
            convertRectToPath: function() {
              var h = this.p.v[0], y = this.p.v[1], P = this.s.v[0] / 2, A = this.s.v[1] / 2, _ = bmMin(P, A, this.r.v), M = _ * (1 - roundCorner);
              this.v._length = 0, this.d === 2 || this.d === 1 ? (this.v.setTripleAt(h + P, y - A + _, h + P, y - A + _, h + P, y - A + M, 0, !0), this.v.setTripleAt(h + P, y + A - _, h + P, y + A - M, h + P, y + A - _, 1, !0), _ !== 0 ? (this.v.setTripleAt(h + P - _, y + A, h + P - _, y + A, h + P - M, y + A, 2, !0), this.v.setTripleAt(h - P + _, y + A, h - P + M, y + A, h - P + _, y + A, 3, !0), this.v.setTripleAt(h - P, y + A - _, h - P, y + A - _, h - P, y + A - M, 4, !0), this.v.setTripleAt(h - P, y - A + _, h - P, y - A + M, h - P, y - A + _, 5, !0), this.v.setTripleAt(h - P + _, y - A, h - P + _, y - A, h - P + M, y - A, 6, !0), this.v.setTripleAt(h + P - _, y - A, h + P - M, y - A, h + P - _, y - A, 7, !0)) : (this.v.setTripleAt(h - P, y + A, h - P + M, y + A, h - P, y + A, 2), this.v.setTripleAt(h - P, y - A, h - P, y - A + M, h - P, y - A, 3))) : (this.v.setTripleAt(h + P, y - A + _, h + P, y - A + M, h + P, y - A + _, 0, !0), _ !== 0 ? (this.v.setTripleAt(h + P - _, y - A, h + P - _, y - A, h + P - M, y - A, 1, !0), this.v.setTripleAt(h - P + _, y - A, h - P + M, y - A, h - P + _, y - A, 2, !0), this.v.setTripleAt(h - P, y - A + _, h - P, y - A + _, h - P, y - A + M, 3, !0), this.v.setTripleAt(h - P, y + A - _, h - P, y + A - M, h - P, y + A - _, 4, !0), this.v.setTripleAt(h - P + _, y + A, h - P + _, y + A, h - P + M, y + A, 5, !0), this.v.setTripleAt(h + P - _, y + A, h + P - M, y + A, h + P - _, y + A, 6, !0), this.v.setTripleAt(h + P, y + A - _, h + P, y + A - _, h + P, y + A - M, 7, !0)) : (this.v.setTripleAt(h - P, y - A, h - P + M, y - A, h - P, y - A, 1, !0), this.v.setTripleAt(h - P, y + A, h - P, y + A - M, h - P, y + A, 2, !0), this.v.setTripleAt(h + P, y + A, h + P - M, y + A, h + P, y + A, 3, !0)));
            },
            getValue: function() {
              this.elem.globalData.frameId !== this.frameId && (this.frameId = this.elem.globalData.frameId, this.iterateDynamicProperties(), this._mdf && this.convertRectToPath());
            },
            reset: i
          }, extendPrototype([DynamicPropertyContainer], c), c;
        })();
        function b(c, d, h) {
          var y;
          if (h === 3 || h === 4) {
            var P = h === 3 ? d.pt : d.ks, A = P.k;
            A.length ? y = new p(c, d, h) : y = new l(c, d, h);
          } else h === 5 ? y = new f(c, d) : h === 6 ? y = new u(c, d) : h === 7 && (y = new S(c, d));
          return y.k && c.addDynamicProperty(y), y;
        }
        function v() {
          return l;
        }
        function m() {
          return p;
        }
        var x = {};
        return x.getShapeProp = b, x.getConstructorFunction = v, x.getKeyframedConstructorFunction = m, x;
      })();
      /*!
       Transformation Matrix v2.0
       (c) Epistemex 2014-2015
       www.epistemex.com
       By Ken Fyrstenberg
       Contributions by leeoniya.
       License: MIT, header required.
       */
      var Matrix = /* @__PURE__ */ (function() {
        var e = Math.cos, t = Math.sin, r = Math.tan, i = Math.round;
        function s() {
          return this.props[0] = 1, this.props[1] = 0, this.props[2] = 0, this.props[3] = 0, this.props[4] = 0, this.props[5] = 1, this.props[6] = 0, this.props[7] = 0, this.props[8] = 0, this.props[9] = 0, this.props[10] = 1, this.props[11] = 0, this.props[12] = 0, this.props[13] = 0, this.props[14] = 0, this.props[15] = 1, this;
        }
        function n(g) {
          if (g === 0)
            return this;
          var E = e(g), F = t(g);
          return this._t(E, -F, 0, 0, F, E, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        }
        function a(g) {
          if (g === 0)
            return this;
          var E = e(g), F = t(g);
          return this._t(1, 0, 0, 0, 0, E, -F, 0, 0, F, E, 0, 0, 0, 0, 1);
        }
        function l(g) {
          if (g === 0)
            return this;
          var E = e(g), F = t(g);
          return this._t(E, 0, F, 0, 0, 1, 0, 0, -F, 0, E, 0, 0, 0, 0, 1);
        }
        function o(g) {
          if (g === 0)
            return this;
          var E = e(g), F = t(g);
          return this._t(E, -F, 0, 0, F, E, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        }
        function p(g, E) {
          return this._t(1, E, g, 1, 0, 0);
        }
        function u(g, E) {
          return this.shear(r(g), r(E));
        }
        function S(g, E) {
          var F = e(E), k = t(E);
          return this._t(F, k, 0, 0, -k, F, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)._t(1, 0, 0, 0, r(g), 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)._t(F, -k, 0, 0, k, F, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        }
        function f(g, E, F) {
          return !F && F !== 0 && (F = 1), g === 1 && E === 1 && F === 1 ? this : this._t(g, 0, 0, 0, 0, E, 0, 0, 0, 0, F, 0, 0, 0, 0, 1);
        }
        function b(g, E, F, k, L, O, G, W, q, Y, ee, te, j, $, K, U) {
          return this.props[0] = g, this.props[1] = E, this.props[2] = F, this.props[3] = k, this.props[4] = L, this.props[5] = O, this.props[6] = G, this.props[7] = W, this.props[8] = q, this.props[9] = Y, this.props[10] = ee, this.props[11] = te, this.props[12] = j, this.props[13] = $, this.props[14] = K, this.props[15] = U, this;
        }
        function v(g, E, F) {
          return F = F || 0, g !== 0 || E !== 0 || F !== 0 ? this._t(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, g, E, F, 1) : this;
        }
        function m(g, E, F, k, L, O, G, W, q, Y, ee, te, j, $, K, U) {
          var H = this.props;
          if (g === 1 && E === 0 && F === 0 && k === 0 && L === 0 && O === 1 && G === 0 && W === 0 && q === 0 && Y === 0 && ee === 1 && te === 0)
            return H[12] = H[12] * g + H[15] * j, H[13] = H[13] * O + H[15] * $, H[14] = H[14] * ee + H[15] * K, H[15] *= U, this._identityCalculated = !1, this;
          var se = H[0], le = H[1], ne = H[2], re = H[3], ie = H[4], J = H[5], z = H[6], Z = H[7], X = H[8], Q = H[9], ae = H[10], oe = H[11], he = H[12], fe = H[13], pe = H[14], ce = H[15];
          return H[0] = se * g + le * L + ne * q + re * j, H[1] = se * E + le * O + ne * Y + re * $, H[2] = se * F + le * G + ne * ee + re * K, H[3] = se * k + le * W + ne * te + re * U, H[4] = ie * g + J * L + z * q + Z * j, H[5] = ie * E + J * O + z * Y + Z * $, H[6] = ie * F + J * G + z * ee + Z * K, H[7] = ie * k + J * W + z * te + Z * U, H[8] = X * g + Q * L + ae * q + oe * j, H[9] = X * E + Q * O + ae * Y + oe * $, H[10] = X * F + Q * G + ae * ee + oe * K, H[11] = X * k + Q * W + ae * te + oe * U, H[12] = he * g + fe * L + pe * q + ce * j, H[13] = he * E + fe * O + pe * Y + ce * $, H[14] = he * F + fe * G + pe * ee + ce * K, H[15] = he * k + fe * W + pe * te + ce * U, this._identityCalculated = !1, this;
        }
        function x(g) {
          var E = g.props;
          return this.transform(E[0], E[1], E[2], E[3], E[4], E[5], E[6], E[7], E[8], E[9], E[10], E[11], E[12], E[13], E[14], E[15]);
        }
        function c() {
          return this._identityCalculated || (this._identity = !(this.props[0] !== 1 || this.props[1] !== 0 || this.props[2] !== 0 || this.props[3] !== 0 || this.props[4] !== 0 || this.props[5] !== 1 || this.props[6] !== 0 || this.props[7] !== 0 || this.props[8] !== 0 || this.props[9] !== 0 || this.props[10] !== 1 || this.props[11] !== 0 || this.props[12] !== 0 || this.props[13] !== 0 || this.props[14] !== 0 || this.props[15] !== 1), this._identityCalculated = !0), this._identity;
        }
        function d(g) {
          for (var E = 0; E < 16; ) {
            if (g.props[E] !== this.props[E])
              return !1;
            E += 1;
          }
          return !0;
        }
        function h(g) {
          var E;
          for (E = 0; E < 16; E += 1)
            g.props[E] = this.props[E];
          return g;
        }
        function y(g) {
          var E;
          for (E = 0; E < 16; E += 1)
            this.props[E] = g[E];
        }
        function P(g, E, F) {
          return {
            x: g * this.props[0] + E * this.props[4] + F * this.props[8] + this.props[12],
            y: g * this.props[1] + E * this.props[5] + F * this.props[9] + this.props[13],
            z: g * this.props[2] + E * this.props[6] + F * this.props[10] + this.props[14]
          };
        }
        function A(g, E, F) {
          return g * this.props[0] + E * this.props[4] + F * this.props[8] + this.props[12];
        }
        function _(g, E, F) {
          return g * this.props[1] + E * this.props[5] + F * this.props[9] + this.props[13];
        }
        function M(g, E, F) {
          return g * this.props[2] + E * this.props[6] + F * this.props[10] + this.props[14];
        }
        function w() {
          var g = this.props[0] * this.props[5] - this.props[1] * this.props[4], E = this.props[5] / g, F = -this.props[1] / g, k = -this.props[4] / g, L = this.props[0] / g, O = (this.props[4] * this.props[13] - this.props[5] * this.props[12]) / g, G = -(this.props[0] * this.props[13] - this.props[1] * this.props[12]) / g, W = new Matrix();
          return W.props[0] = E, W.props[1] = F, W.props[4] = k, W.props[5] = L, W.props[12] = O, W.props[13] = G, W;
        }
        function V(g) {
          var E = this.getInverseMatrix();
          return E.applyToPointArray(g[0], g[1], g[2] || 0);
        }
        function B(g) {
          var E, F = g.length, k = [];
          for (E = 0; E < F; E += 1)
            k[E] = V(g[E]);
          return k;
        }
        function R(g, E, F) {
          var k = createTypedArray("float32", 6);
          if (this.isIdentity())
            k[0] = g[0], k[1] = g[1], k[2] = E[0], k[3] = E[1], k[4] = F[0], k[5] = F[1];
          else {
            var L = this.props[0], O = this.props[1], G = this.props[4], W = this.props[5], q = this.props[12], Y = this.props[13];
            k[0] = g[0] * L + g[1] * G + q, k[1] = g[0] * O + g[1] * W + Y, k[2] = E[0] * L + E[1] * G + q, k[3] = E[0] * O + E[1] * W + Y, k[4] = F[0] * L + F[1] * G + q, k[5] = F[0] * O + F[1] * W + Y;
          }
          return k;
        }
        function D(g, E, F) {
          var k;
          return this.isIdentity() ? k = [g, E, F] : k = [g * this.props[0] + E * this.props[4] + F * this.props[8] + this.props[12], g * this.props[1] + E * this.props[5] + F * this.props[9] + this.props[13], g * this.props[2] + E * this.props[6] + F * this.props[10] + this.props[14]], k;
        }
        function N(g, E) {
          if (this.isIdentity())
            return g + "," + E;
          var F = this.props;
          return Math.round((g * F[0] + E * F[4] + F[12]) * 100) / 100 + "," + Math.round((g * F[1] + E * F[5] + F[13]) * 100) / 100;
        }
        function I() {
          for (var g = 0, E = this.props, F = "matrix3d(", k = 1e4; g < 16; )
            F += i(E[g] * k) / k, F += g === 15 ? ")" : ",", g += 1;
          return F;
        }
        function C(g) {
          var E = 1e4;
          return g < 1e-6 && g > 0 || g > -1e-6 && g < 0 ? i(g * E) / E : g;
        }
        function T() {
          var g = this.props, E = C(g[0]), F = C(g[1]), k = C(g[4]), L = C(g[5]), O = C(g[12]), G = C(g[13]);
          return "matrix(" + E + "," + F + "," + k + "," + L + "," + O + "," + G + ")";
        }
        return function() {
          this.reset = s, this.rotate = n, this.rotateX = a, this.rotateY = l, this.rotateZ = o, this.skew = u, this.skewFromAxis = S, this.shear = p, this.scale = f, this.setTransform = b, this.translate = v, this.transform = m, this.multiply = x, this.applyToPoint = P, this.applyToX = A, this.applyToY = _, this.applyToZ = M, this.applyToPointArray = D, this.applyToTriplePoints = R, this.applyToPointStringified = N, this.toCSS = I, this.to2dCSS = T, this.clone = h, this.cloneFromProps = y, this.equals = d, this.inversePoints = B, this.inversePoint = V, this.getInverseMatrix = w, this._t = this.transform, this.isIdentity = c, this._identity = !0, this._identityCalculated = !1, this.props = createTypedArray("float32", 16), this.reset();
        };
      })();
      function _typeof$3(e) {
        "@babel/helpers - typeof";
        return _typeof$3 = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
          return typeof t;
        } : function(t) {
          return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
        }, _typeof$3(e);
      }
      var lottie = {};
      function setLocation(e) {
        setLocationHref(e);
      }
      function searchAnimations() {
        animationManager.searchAnimations();
      }
      function setSubframeRendering(e) {
        setSubframeEnabled(e);
      }
      function setPrefix(e) {
        setIdPrefix(e);
      }
      function loadAnimation(e) {
        return animationManager.loadAnimation(e);
      }
      function setQuality(e) {
        if (typeof e == "string")
          switch (e) {
            case "high":
              setDefaultCurveSegments(200);
              break;
            default:
            case "medium":
              setDefaultCurveSegments(50);
              break;
            case "low":
              setDefaultCurveSegments(10);
              break;
          }
        else !isNaN(e) && e > 1 && setDefaultCurveSegments(e);
      }
      function inBrowser() {
        return typeof navigator < "u";
      }
      function installPlugin(e, t) {
        e === "expressions" && setExpressionsPlugin(t);
      }
      function getFactory(e) {
        switch (e) {
          case "propertyFactory":
            return PropertyFactory;
          case "shapePropertyFactory":
            return ShapePropertyFactory;
          case "matrix":
            return Matrix;
          default:
            return null;
        }
      }
      lottie.play = animationManager.play, lottie.pause = animationManager.pause, lottie.setLocationHref = setLocation, lottie.togglePause = animationManager.togglePause, lottie.setSpeed = animationManager.setSpeed, lottie.setDirection = animationManager.setDirection, lottie.stop = animationManager.stop, lottie.searchAnimations = searchAnimations, lottie.registerAnimation = animationManager.registerAnimation, lottie.loadAnimation = loadAnimation, lottie.setSubframeRendering = setSubframeRendering, lottie.resize = animationManager.resize, lottie.goToAndStop = animationManager.goToAndStop, lottie.destroy = animationManager.destroy, lottie.setQuality = setQuality, lottie.inBrowser = inBrowser, lottie.installPlugin = installPlugin, lottie.freeze = animationManager.freeze, lottie.unfreeze = animationManager.unfreeze, lottie.setVolume = animationManager.setVolume, lottie.mute = animationManager.mute, lottie.unmute = animationManager.unmute, lottie.getRegisteredAnimations = animationManager.getRegisteredAnimations, lottie.useWebWorker = setWebWorker, lottie.setIDPrefix = setPrefix, lottie.__getFactory = getFactory, lottie.version = "5.13.0";
      function checkReady() {
        document.readyState === "complete" && (clearInterval(readyStateCheckInterval), searchAnimations());
      }
      function getQueryVariable(e) {
        for (var t = queryString.split("&"), r = 0; r < t.length; r += 1) {
          var i = t[r].split("=");
          if (decodeURIComponent(i[0]) == e)
            return decodeURIComponent(i[1]);
        }
        return null;
      }
      var queryString = "";
      {
        var scripts = document.getElementsByTagName("script"), index = scripts.length - 1, myScript = scripts[index] || {
          src: ""
        };
        queryString = myScript.src ? myScript.src.replace(/^[^\?]+\??/, "") : "", getQueryVariable("renderer");
      }
      var readyStateCheckInterval = setInterval(checkReady, 100);
      try {
        _typeof$3(exports) !== "object" && (window.bodymovin = lottie);
      } catch (e) {
      }
      var ShapeModifiers = (function() {
        var e = {}, t = {};
        e.registerModifier = r, e.getModifier = i;
        function r(s, n) {
          t[s] || (t[s] = n);
        }
        function i(s, n, a) {
          return new t[s](n, a);
        }
        return e;
      })();
      function ShapeModifier() {
      }
      ShapeModifier.prototype.initModifierProperties = function() {
      }, ShapeModifier.prototype.addShapeToModifier = function() {
      }, ShapeModifier.prototype.addShape = function(e) {
        if (!this.closed) {
          e.sh.container.addDynamicProperty(e.sh);
          var t = {
            shape: e.sh,
            data: e,
            localShapeCollection: shapeCollectionPool.newShapeCollection()
          };
          this.shapes.push(t), this.addShapeToModifier(t), this._isAnimated && e.setAsAnimated();
        }
      }, ShapeModifier.prototype.init = function(e, t) {
        this.shapes = [], this.elem = e, this.initDynamicPropertyContainer(e), this.initModifierProperties(e, t), this.frameId = initialDefaultFrame, this.closed = !1, this.k = !1, this.dynamicProperties.length ? this.k = !0 : this.getValue(!0);
      }, ShapeModifier.prototype.processKeys = function() {
        this.elem.globalData.frameId !== this.frameId && (this.frameId = this.elem.globalData.frameId, this.iterateDynamicProperties());
      }, extendPrototype([DynamicPropertyContainer], ShapeModifier);
      function TrimModifier() {
      }
      extendPrototype([ShapeModifier], TrimModifier), TrimModifier.prototype.initModifierProperties = function(e, t) {
        this.s = PropertyFactory.getProp(e, t.s, 0, 0.01, this), this.e = PropertyFactory.getProp(e, t.e, 0, 0.01, this), this.o = PropertyFactory.getProp(e, t.o, 0, 0, this), this.sValue = 0, this.eValue = 0, this.getValue = this.processKeys, this.m = t.m, this._isAnimated = !!this.s.effectsSequence.length || !!this.e.effectsSequence.length || !!this.o.effectsSequence.length;
      }, TrimModifier.prototype.addShapeToModifier = function(e) {
        e.pathsData = [];
      }, TrimModifier.prototype.calculateShapeEdges = function(e, t, r, i, s) {
        var n = [];
        t <= 1 ? n.push({
          s: e,
          e: t
        }) : e >= 1 ? n.push({
          s: e - 1,
          e: t - 1
        }) : (n.push({
          s: e,
          e: 1
        }), n.push({
          s: 0,
          e: t - 1
        }));
        var a = [], l, o = n.length, p;
        for (l = 0; l < o; l += 1)
          if (p = n[l], !(p.e * s < i || p.s * s > i + r)) {
            var u, S;
            p.s * s <= i ? u = 0 : u = (p.s * s - i) / r, p.e * s >= i + r ? S = 1 : S = (p.e * s - i) / r, a.push([u, S]);
          }
        return a.length || a.push([0, 0]), a;
      }, TrimModifier.prototype.releasePathsData = function(e) {
        var t, r = e.length;
        for (t = 0; t < r; t += 1)
          segmentsLengthPool.release(e[t]);
        return e.length = 0, e;
      }, TrimModifier.prototype.processShapes = function(e) {
        var t, r;
        if (this._mdf || e) {
          var i = this.o.v % 360 / 360;
          if (i < 0 && (i += 1), this.s.v > 1 ? t = 1 + i : this.s.v < 0 ? t = 0 + i : t = this.s.v + i, this.e.v > 1 ? r = 1 + i : this.e.v < 0 ? r = 0 + i : r = this.e.v + i, t > r) {
            var s = t;
            t = r, r = s;
          }
          t = Math.round(t * 1e4) * 1e-4, r = Math.round(r * 1e4) * 1e-4, this.sValue = t, this.eValue = r;
        } else
          t = this.sValue, r = this.eValue;
        var n, a, l = this.shapes.length, o, p, u, S, f, b = 0;
        if (r === t)
          for (a = 0; a < l; a += 1)
            this.shapes[a].localShapeCollection.releaseShapes(), this.shapes[a].shape._mdf = !0, this.shapes[a].shape.paths = this.shapes[a].localShapeCollection, this._mdf && (this.shapes[a].pathsData.length = 0);
        else if (r === 1 && t === 0 || r === 0 && t === 1) {
          if (this._mdf)
            for (a = 0; a < l; a += 1)
              this.shapes[a].pathsData.length = 0, this.shapes[a].shape._mdf = !0;
        } else {
          var v = [], m, x;
          for (a = 0; a < l; a += 1)
            if (m = this.shapes[a], !m.shape._mdf && !this._mdf && !e && this.m !== 2)
              m.shape.paths = m.localShapeCollection;
            else {
              if (n = m.shape.paths, p = n._length, f = 0, !m.shape._mdf && m.pathsData.length)
                f = m.totalShapeLength;
              else {
                for (u = this.releasePathsData(m.pathsData), o = 0; o < p; o += 1)
                  S = bez.getSegmentsLength(n.shapes[o]), u.push(S), f += S.totalLength;
                m.totalShapeLength = f, m.pathsData = u;
              }
              b += f, m.shape._mdf = !0;
            }
          var c = t, d = r, h = 0, y;
          for (a = l - 1; a >= 0; a -= 1)
            if (m = this.shapes[a], m.shape._mdf) {
              for (x = m.localShapeCollection, x.releaseShapes(), this.m === 2 && l > 1 ? (y = this.calculateShapeEdges(t, r, m.totalShapeLength, h, b), h += m.totalShapeLength) : y = [[c, d]], p = y.length, o = 0; o < p; o += 1) {
                c = y[o][0], d = y[o][1], v.length = 0, d <= 1 ? v.push({
                  s: m.totalShapeLength * c,
                  e: m.totalShapeLength * d
                }) : c >= 1 ? v.push({
                  s: m.totalShapeLength * (c - 1),
                  e: m.totalShapeLength * (d - 1)
                }) : (v.push({
                  s: m.totalShapeLength * c,
                  e: m.totalShapeLength
                }), v.push({
                  s: 0,
                  e: m.totalShapeLength * (d - 1)
                }));
                var P = this.addShapes(m, v[0]);
                if (v[0].s !== v[0].e) {
                  if (v.length > 1) {
                    var A = m.shape.paths.shapes[m.shape.paths._length - 1];
                    if (A.c) {
                      var _ = P.pop();
                      this.addPaths(P, x), P = this.addShapes(m, v[1], _);
                    } else
                      this.addPaths(P, x), P = this.addShapes(m, v[1]);
                  }
                  this.addPaths(P, x);
                }
              }
              m.shape.paths = x;
            }
        }
      }, TrimModifier.prototype.addPaths = function(e, t) {
        var r, i = e.length;
        for (r = 0; r < i; r += 1)
          t.addShape(e[r]);
      }, TrimModifier.prototype.addSegment = function(e, t, r, i, s, n, a) {
        s.setXYAt(t[0], t[1], "o", n), s.setXYAt(r[0], r[1], "i", n + 1), a && s.setXYAt(e[0], e[1], "v", n), s.setXYAt(i[0], i[1], "v", n + 1);
      }, TrimModifier.prototype.addSegmentFromArray = function(e, t, r, i) {
        t.setXYAt(e[1], e[5], "o", r), t.setXYAt(e[2], e[6], "i", r + 1), i && t.setXYAt(e[0], e[4], "v", r), t.setXYAt(e[3], e[7], "v", r + 1);
      }, TrimModifier.prototype.addShapes = function(e, t, r) {
        var i = e.pathsData, s = e.shape.paths.shapes, n, a = e.shape.paths._length, l, o, p = 0, u, S, f, b, v = [], m, x = !0;
        for (r ? (S = r._length, m = r._length) : (r = shapePool.newElement(), S = 0, m = 0), v.push(r), n = 0; n < a; n += 1) {
          for (f = i[n].lengths, r.c = s[n].c, o = s[n].c ? f.length : f.length + 1, l = 1; l < o; l += 1)
            if (u = f[l - 1], p + u.addedLength < t.s)
              p += u.addedLength, r.c = !1;
            else if (p > t.e) {
              r.c = !1;
              break;
            } else
              t.s <= p && t.e >= p + u.addedLength ? (this.addSegment(s[n].v[l - 1], s[n].o[l - 1], s[n].i[l], s[n].v[l], r, S, x), x = !1) : (b = bez.getNewSegment(s[n].v[l - 1], s[n].v[l], s[n].o[l - 1], s[n].i[l], (t.s - p) / u.addedLength, (t.e - p) / u.addedLength, f[l - 1]), this.addSegmentFromArray(b, r, S, x), x = !1, r.c = !1), p += u.addedLength, S += 1;
          if (s[n].c && f.length) {
            if (u = f[l - 1], p <= t.e) {
              var c = f[l - 1].addedLength;
              t.s <= p && t.e >= p + c ? (this.addSegment(s[n].v[l - 1], s[n].o[l - 1], s[n].i[0], s[n].v[0], r, S, x), x = !1) : (b = bez.getNewSegment(s[n].v[l - 1], s[n].v[0], s[n].o[l - 1], s[n].i[0], (t.s - p) / c, (t.e - p) / c, f[l - 1]), this.addSegmentFromArray(b, r, S, x), x = !1, r.c = !1);
            } else
              r.c = !1;
            p += u.addedLength, S += 1;
          }
          if (r._length && (r.setXYAt(r.v[m][0], r.v[m][1], "i", m), r.setXYAt(r.v[r._length - 1][0], r.v[r._length - 1][1], "o", r._length - 1)), p > t.e)
            break;
          n < a - 1 && (r = shapePool.newElement(), x = !0, v.push(r), S = 0);
        }
        return v;
      };
      function PuckerAndBloatModifier() {
      }
      extendPrototype([ShapeModifier], PuckerAndBloatModifier), PuckerAndBloatModifier.prototype.initModifierProperties = function(e, t) {
        this.getValue = this.processKeys, this.amount = PropertyFactory.getProp(e, t.a, 0, null, this), this._isAnimated = !!this.amount.effectsSequence.length;
      }, PuckerAndBloatModifier.prototype.processPath = function(e, t) {
        var r = t / 100, i = [0, 0], s = e._length, n = 0;
        for (n = 0; n < s; n += 1)
          i[0] += e.v[n][0], i[1] += e.v[n][1];
        i[0] /= s, i[1] /= s;
        var a = shapePool.newElement();
        a.c = e.c;
        var l, o, p, u, S, f;
        for (n = 0; n < s; n += 1)
          l = e.v[n][0] + (i[0] - e.v[n][0]) * r, o = e.v[n][1] + (i[1] - e.v[n][1]) * r, p = e.o[n][0] + (i[0] - e.o[n][0]) * -r, u = e.o[n][1] + (i[1] - e.o[n][1]) * -r, S = e.i[n][0] + (i[0] - e.i[n][0]) * -r, f = e.i[n][1] + (i[1] - e.i[n][1]) * -r, a.setTripleAt(l, o, p, u, S, f, n);
        return a;
      }, PuckerAndBloatModifier.prototype.processShapes = function(e) {
        var t, r, i = this.shapes.length, s, n, a = this.amount.v;
        if (a !== 0) {
          var l, o;
          for (r = 0; r < i; r += 1) {
            if (l = this.shapes[r], o = l.localShapeCollection, !(!l.shape._mdf && !this._mdf && !e))
              for (o.releaseShapes(), l.shape._mdf = !0, t = l.shape.paths.shapes, n = l.shape.paths._length, s = 0; s < n; s += 1)
                o.addShape(this.processPath(t[s], a));
            l.shape.paths = l.localShapeCollection;
          }
        }
        this.dynamicProperties.length || (this._mdf = !1);
      };
      var TransformPropertyFactory = (function() {
        var e = [0, 0];
        function t(o) {
          var p = this._mdf;
          this.iterateDynamicProperties(), this._mdf = this._mdf || p, this.a && o.translate(-this.a.v[0], -this.a.v[1], this.a.v[2]), this.s && o.scale(this.s.v[0], this.s.v[1], this.s.v[2]), this.sk && o.skewFromAxis(-this.sk.v, this.sa.v), this.r ? o.rotate(-this.r.v) : o.rotateZ(-this.rz.v).rotateY(this.ry.v).rotateX(this.rx.v).rotateZ(-this.or.v[2]).rotateY(this.or.v[1]).rotateX(this.or.v[0]), this.data.p.s ? this.data.p.z ? o.translate(this.px.v, this.py.v, -this.pz.v) : o.translate(this.px.v, this.py.v, 0) : o.translate(this.p.v[0], this.p.v[1], -this.p.v[2]);
        }
        function r(o) {
          if (this.elem.globalData.frameId !== this.frameId) {
            if (this._isDirty && (this.precalculateMatrix(), this._isDirty = !1), this.iterateDynamicProperties(), this._mdf || o) {
              var p;
              if (this.v.cloneFromProps(this.pre.props), this.appliedTransformations < 1 && this.v.translate(-this.a.v[0], -this.a.v[1], this.a.v[2]), this.appliedTransformations < 2 && this.v.scale(this.s.v[0], this.s.v[1], this.s.v[2]), this.sk && this.appliedTransformations < 3 && this.v.skewFromAxis(-this.sk.v, this.sa.v), this.r && this.appliedTransformations < 4 ? this.v.rotate(-this.r.v) : !this.r && this.appliedTransformations < 4 && this.v.rotateZ(-this.rz.v).rotateY(this.ry.v).rotateX(this.rx.v).rotateZ(-this.or.v[2]).rotateY(this.or.v[1]).rotateX(this.or.v[0]), this.autoOriented) {
                var u, S;
                if (p = this.elem.globalData.frameRate, this.p && this.p.keyframes && this.p.getValueAtTime)
                  this.p._caching.lastFrame + this.p.offsetTime <= this.p.keyframes[0].t ? (u = this.p.getValueAtTime((this.p.keyframes[0].t + 0.01) / p, 0), S = this.p.getValueAtTime(this.p.keyframes[0].t / p, 0)) : this.p._caching.lastFrame + this.p.offsetTime >= this.p.keyframes[this.p.keyframes.length - 1].t ? (u = this.p.getValueAtTime(this.p.keyframes[this.p.keyframes.length - 1].t / p, 0), S = this.p.getValueAtTime((this.p.keyframes[this.p.keyframes.length - 1].t - 0.05) / p, 0)) : (u = this.p.pv, S = this.p.getValueAtTime((this.p._caching.lastFrame + this.p.offsetTime - 0.01) / p, this.p.offsetTime));
                else if (this.px && this.px.keyframes && this.py.keyframes && this.px.getValueAtTime && this.py.getValueAtTime) {
                  u = [], S = [];
                  var f = this.px, b = this.py;
                  f._caching.lastFrame + f.offsetTime <= f.keyframes[0].t ? (u[0] = f.getValueAtTime((f.keyframes[0].t + 0.01) / p, 0), u[1] = b.getValueAtTime((b.keyframes[0].t + 0.01) / p, 0), S[0] = f.getValueAtTime(f.keyframes[0].t / p, 0), S[1] = b.getValueAtTime(b.keyframes[0].t / p, 0)) : f._caching.lastFrame + f.offsetTime >= f.keyframes[f.keyframes.length - 1].t ? (u[0] = f.getValueAtTime(f.keyframes[f.keyframes.length - 1].t / p, 0), u[1] = b.getValueAtTime(b.keyframes[b.keyframes.length - 1].t / p, 0), S[0] = f.getValueAtTime((f.keyframes[f.keyframes.length - 1].t - 0.01) / p, 0), S[1] = b.getValueAtTime((b.keyframes[b.keyframes.length - 1].t - 0.01) / p, 0)) : (u = [f.pv, b.pv], S[0] = f.getValueAtTime((f._caching.lastFrame + f.offsetTime - 0.01) / p, f.offsetTime), S[1] = b.getValueAtTime((b._caching.lastFrame + b.offsetTime - 0.01) / p, b.offsetTime));
                } else
                  S = e, u = S;
                this.v.rotate(-Math.atan2(u[1] - S[1], u[0] - S[0]));
              }
              this.data.p && this.data.p.s ? this.data.p.z ? this.v.translate(this.px.v, this.py.v, -this.pz.v) : this.v.translate(this.px.v, this.py.v, 0) : this.v.translate(this.p.v[0], this.p.v[1], -this.p.v[2]);
            }
            this.frameId = this.elem.globalData.frameId;
          }
        }
        function i() {
          if (this.appliedTransformations = 0, this.pre.reset(), !this.a.effectsSequence.length)
            this.pre.translate(-this.a.v[0], -this.a.v[1], this.a.v[2]), this.appliedTransformations = 1;
          else
            return;
          if (!this.s.effectsSequence.length)
            this.pre.scale(this.s.v[0], this.s.v[1], this.s.v[2]), this.appliedTransformations = 2;
          else
            return;
          if (this.sk)
            if (!this.sk.effectsSequence.length && !this.sa.effectsSequence.length)
              this.pre.skewFromAxis(-this.sk.v, this.sa.v), this.appliedTransformations = 3;
            else
              return;
          this.r ? this.r.effectsSequence.length || (this.pre.rotate(-this.r.v), this.appliedTransformations = 4) : !this.rz.effectsSequence.length && !this.ry.effectsSequence.length && !this.rx.effectsSequence.length && !this.or.effectsSequence.length && (this.pre.rotateZ(-this.rz.v).rotateY(this.ry.v).rotateX(this.rx.v).rotateZ(-this.or.v[2]).rotateY(this.or.v[1]).rotateX(this.or.v[0]), this.appliedTransformations = 4);
        }
        function s() {
        }
        function n(o) {
          this._addDynamicProperty(o), this.elem.addDynamicProperty(o), this._isDirty = !0;
        }
        function a(o, p, u) {
          if (this.elem = o, this.frameId = -1, this.propType = "transform", this.data = p, this.v = new Matrix(), this.pre = new Matrix(), this.appliedTransformations = 0, this.initDynamicPropertyContainer(u || o), p.p && p.p.s ? (this.px = PropertyFactory.getProp(o, p.p.x, 0, 0, this), this.py = PropertyFactory.getProp(o, p.p.y, 0, 0, this), p.p.z && (this.pz = PropertyFactory.getProp(o, p.p.z, 0, 0, this))) : this.p = PropertyFactory.getProp(o, p.p || {
            k: [0, 0, 0]
          }, 1, 0, this), p.rx) {
            if (this.rx = PropertyFactory.getProp(o, p.rx, 0, degToRads, this), this.ry = PropertyFactory.getProp(o, p.ry, 0, degToRads, this), this.rz = PropertyFactory.getProp(o, p.rz, 0, degToRads, this), p.or.k[0].ti) {
              var S, f = p.or.k.length;
              for (S = 0; S < f; S += 1)
                p.or.k[S].to = null, p.or.k[S].ti = null;
            }
            this.or = PropertyFactory.getProp(o, p.or, 1, degToRads, this), this.or.sh = !0;
          } else
            this.r = PropertyFactory.getProp(o, p.r || {
              k: 0
            }, 0, degToRads, this);
          p.sk && (this.sk = PropertyFactory.getProp(o, p.sk, 0, degToRads, this), this.sa = PropertyFactory.getProp(o, p.sa, 0, degToRads, this)), this.a = PropertyFactory.getProp(o, p.a || {
            k: [0, 0, 0]
          }, 1, 0, this), this.s = PropertyFactory.getProp(o, p.s || {
            k: [100, 100, 100]
          }, 1, 0.01, this), p.o ? this.o = PropertyFactory.getProp(o, p.o, 0, 0.01, o) : this.o = {
            _mdf: !1,
            v: 1
          }, this._isDirty = !0, this.dynamicProperties.length || this.getValue(!0);
        }
        a.prototype = {
          applyToMatrix: t,
          getValue: r,
          precalculateMatrix: i,
          autoOrient: s
        }, extendPrototype([DynamicPropertyContainer], a), a.prototype.addDynamicProperty = n, a.prototype._addDynamicProperty = DynamicPropertyContainer.prototype.addDynamicProperty;
        function l(o, p, u) {
          return new a(o, p, u);
        }
        return {
          getTransformProperty: l
        };
      })();
      function RepeaterModifier() {
      }
      extendPrototype([ShapeModifier], RepeaterModifier), RepeaterModifier.prototype.initModifierProperties = function(e, t) {
        this.getValue = this.processKeys, this.c = PropertyFactory.getProp(e, t.c, 0, null, this), this.o = PropertyFactory.getProp(e, t.o, 0, null, this), this.tr = TransformPropertyFactory.getTransformProperty(e, t.tr, this), this.so = PropertyFactory.getProp(e, t.tr.so, 0, 0.01, this), this.eo = PropertyFactory.getProp(e, t.tr.eo, 0, 0.01, this), this.data = t, this.dynamicProperties.length || this.getValue(!0), this._isAnimated = !!this.dynamicProperties.length, this.pMatrix = new Matrix(), this.rMatrix = new Matrix(), this.sMatrix = new Matrix(), this.tMatrix = new Matrix(), this.matrix = new Matrix();
      }, RepeaterModifier.prototype.applyTransforms = function(e, t, r, i, s, n) {
        var a = n ? -1 : 1, l = i.s.v[0] + (1 - i.s.v[0]) * (1 - s), o = i.s.v[1] + (1 - i.s.v[1]) * (1 - s);
        e.translate(i.p.v[0] * a * s, i.p.v[1] * a * s, i.p.v[2]), t.translate(-i.a.v[0], -i.a.v[1], i.a.v[2]), t.rotate(-i.r.v * a * s), t.translate(i.a.v[0], i.a.v[1], i.a.v[2]), r.translate(-i.a.v[0], -i.a.v[1], i.a.v[2]), r.scale(n ? 1 / l : l, n ? 1 / o : o), r.translate(i.a.v[0], i.a.v[1], i.a.v[2]);
      }, RepeaterModifier.prototype.init = function(e, t, r, i) {
        for (this.elem = e, this.arr = t, this.pos = r, this.elemsData = i, this._currentCopies = 0, this._elements = [], this._groups = [], this.frameId = -1, this.initDynamicPropertyContainer(e), this.initModifierProperties(e, t[r]); r > 0; )
          r -= 1, this._elements.unshift(t[r]);
        this.dynamicProperties.length ? this.k = !0 : this.getValue(!0);
      }, RepeaterModifier.prototype.resetElements = function(e) {
        var t, r = e.length;
        for (t = 0; t < r; t += 1)
          e[t]._processed = !1, e[t].ty === "gr" && this.resetElements(e[t].it);
      }, RepeaterModifier.prototype.cloneElements = function(e) {
        var t = JSON.parse(JSON.stringify(e));
        return this.resetElements(t), t;
      }, RepeaterModifier.prototype.changeGroupRender = function(e, t) {
        var r, i = e.length;
        for (r = 0; r < i; r += 1)
          e[r]._render = t, e[r].ty === "gr" && this.changeGroupRender(e[r].it, t);
      }, RepeaterModifier.prototype.processShapes = function(e) {
        var t, r, i, s, n, a = !1;
        if (this._mdf || e) {
          var l = Math.ceil(this.c.v);
          if (this._groups.length < l) {
            for (; this._groups.length < l; ) {
              var o = {
                it: this.cloneElements(this._elements),
                ty: "gr"
              };
              o.it.push({
                a: {
                  a: 0,
                  ix: 1,
                  k: [0, 0]
                },
                nm: "Transform",
                o: {
                  a: 0,
                  ix: 7,
                  k: 100
                },
                p: {
                  a: 0,
                  ix: 2,
                  k: [0, 0]
                },
                r: {
                  a: 1,
                  ix: 6,
                  k: [{
                    s: 0,
                    e: 0,
                    t: 0
                  }, {
                    s: 0,
                    e: 0,
                    t: 1
                  }]
                },
                s: {
                  a: 0,
                  ix: 3,
                  k: [100, 100]
                },
                sa: {
                  a: 0,
                  ix: 5,
                  k: 0
                },
                sk: {
                  a: 0,
                  ix: 4,
                  k: 0
                },
                ty: "tr"
              }), this.arr.splice(0, 0, o), this._groups.splice(0, 0, o), this._currentCopies += 1;
            }
            this.elem.reloadShapes(), a = !0;
          }
          n = 0;
          var p;
          for (i = 0; i <= this._groups.length - 1; i += 1) {
            if (p = n < l, this._groups[i]._render = p, this.changeGroupRender(this._groups[i].it, p), !p) {
              var u = this.elemsData[i].it, S = u[u.length - 1];
              S.transform.op.v !== 0 ? (S.transform.op._mdf = !0, S.transform.op.v = 0) : S.transform.op._mdf = !1;
            }
            n += 1;
          }
          this._currentCopies = l;
          var f = this.o.v, b = f % 1, v = f > 0 ? Math.floor(f) : Math.ceil(f), m = this.pMatrix.props, x = this.rMatrix.props, c = this.sMatrix.props;
          this.pMatrix.reset(), this.rMatrix.reset(), this.sMatrix.reset(), this.tMatrix.reset(), this.matrix.reset();
          var d = 0;
          if (f > 0) {
            for (; d < v; )
              this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, 1, !1), d += 1;
            b && (this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, b, !1), d += b);
          } else if (f < 0) {
            for (; d > v; )
              this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, 1, !0), d -= 1;
            b && (this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, -b, !0), d -= b);
          }
          i = this.data.m === 1 ? 0 : this._currentCopies - 1, s = this.data.m === 1 ? 1 : -1, n = this._currentCopies;
          for (var h, y; n; ) {
            if (t = this.elemsData[i].it, r = t[t.length - 1].transform.mProps.v.props, y = r.length, t[t.length - 1].transform.mProps._mdf = !0, t[t.length - 1].transform.op._mdf = !0, t[t.length - 1].transform.op.v = this._currentCopies === 1 ? this.so.v : this.so.v + (this.eo.v - this.so.v) * (i / (this._currentCopies - 1)), d !== 0) {
              for ((i !== 0 && s === 1 || i !== this._currentCopies - 1 && s === -1) && this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, 1, !1), this.matrix.transform(x[0], x[1], x[2], x[3], x[4], x[5], x[6], x[7], x[8], x[9], x[10], x[11], x[12], x[13], x[14], x[15]), this.matrix.transform(c[0], c[1], c[2], c[3], c[4], c[5], c[6], c[7], c[8], c[9], c[10], c[11], c[12], c[13], c[14], c[15]), this.matrix.transform(m[0], m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8], m[9], m[10], m[11], m[12], m[13], m[14], m[15]), h = 0; h < y; h += 1)
                r[h] = this.matrix.props[h];
              this.matrix.reset();
            } else
              for (this.matrix.reset(), h = 0; h < y; h += 1)
                r[h] = this.matrix.props[h];
            d += 1, n -= 1, i += s;
          }
        } else
          for (n = this._currentCopies, i = 0, s = 1; n; )
            t = this.elemsData[i].it, r = t[t.length - 1].transform.mProps.v.props, t[t.length - 1].transform.mProps._mdf = !1, t[t.length - 1].transform.op._mdf = !1, n -= 1, i += s;
        return a;
      }, RepeaterModifier.prototype.addShape = function() {
      };
      function RoundCornersModifier() {
      }
      extendPrototype([ShapeModifier], RoundCornersModifier), RoundCornersModifier.prototype.initModifierProperties = function(e, t) {
        this.getValue = this.processKeys, this.rd = PropertyFactory.getProp(e, t.r, 0, null, this), this._isAnimated = !!this.rd.effectsSequence.length;
      }, RoundCornersModifier.prototype.processPath = function(e, t) {
        var r = shapePool.newElement();
        r.c = e.c;
        var i, s = e._length, n, a, l, o, p, u, S = 0, f, b, v, m, x, c;
        for (i = 0; i < s; i += 1)
          n = e.v[i], l = e.o[i], a = e.i[i], n[0] === l[0] && n[1] === l[1] && n[0] === a[0] && n[1] === a[1] ? (i === 0 || i === s - 1) && !e.c ? (r.setTripleAt(n[0], n[1], l[0], l[1], a[0], a[1], S), S += 1) : (i === 0 ? o = e.v[s - 1] : o = e.v[i - 1], p = Math.sqrt(Math.pow(n[0] - o[0], 2) + Math.pow(n[1] - o[1], 2)), u = p ? Math.min(p / 2, t) / p : 0, x = n[0] + (o[0] - n[0]) * u, f = x, c = n[1] - (n[1] - o[1]) * u, b = c, v = f - (f - n[0]) * roundCorner, m = b - (b - n[1]) * roundCorner, r.setTripleAt(f, b, v, m, x, c, S), S += 1, i === s - 1 ? o = e.v[0] : o = e.v[i + 1], p = Math.sqrt(Math.pow(n[0] - o[0], 2) + Math.pow(n[1] - o[1], 2)), u = p ? Math.min(p / 2, t) / p : 0, v = n[0] + (o[0] - n[0]) * u, f = v, m = n[1] + (o[1] - n[1]) * u, b = m, x = f - (f - n[0]) * roundCorner, c = b - (b - n[1]) * roundCorner, r.setTripleAt(f, b, v, m, x, c, S), S += 1) : (r.setTripleAt(e.v[i][0], e.v[i][1], e.o[i][0], e.o[i][1], e.i[i][0], e.i[i][1], S), S += 1);
        return r;
      }, RoundCornersModifier.prototype.processShapes = function(e) {
        var t, r, i = this.shapes.length, s, n, a = this.rd.v;
        if (a !== 0) {
          var l, o;
          for (r = 0; r < i; r += 1) {
            if (l = this.shapes[r], o = l.localShapeCollection, !(!l.shape._mdf && !this._mdf && !e))
              for (o.releaseShapes(), l.shape._mdf = !0, t = l.shape.paths.shapes, n = l.shape.paths._length, s = 0; s < n; s += 1)
                o.addShape(this.processPath(t[s], a));
            l.shape.paths = l.localShapeCollection;
          }
        }
        this.dynamicProperties.length || (this._mdf = !1);
      };
      function floatEqual(e, t) {
        return Math.abs(e - t) * 1e5 <= Math.min(Math.abs(e), Math.abs(t));
      }
      function floatZero(e) {
        return Math.abs(e) <= 1e-5;
      }
      function lerp(e, t, r) {
        return e * (1 - r) + t * r;
      }
      function lerpPoint(e, t, r) {
        return [lerp(e[0], t[0], r), lerp(e[1], t[1], r)];
      }
      function quadRoots(e, t, r) {
        if (e === 0) return [];
        var i = t * t - 4 * e * r;
        if (i < 0) return [];
        var s = -t / (2 * e);
        if (i === 0) return [s];
        var n = Math.sqrt(i) / (2 * e);
        return [s - n, s + n];
      }
      function polynomialCoefficients(e, t, r, i) {
        return [-e + 3 * t - 3 * r + i, 3 * e - 6 * t + 3 * r, -3 * e + 3 * t, e];
      }
      function singlePoint(e) {
        return new PolynomialBezier(e, e, e, e, !1);
      }
      function PolynomialBezier(e, t, r, i, s) {
        s && pointEqual(e, t) && (t = lerpPoint(e, i, 1 / 3)), s && pointEqual(r, i) && (r = lerpPoint(e, i, 2 / 3));
        var n = polynomialCoefficients(e[0], t[0], r[0], i[0]), a = polynomialCoefficients(e[1], t[1], r[1], i[1]);
        this.a = [n[0], a[0]], this.b = [n[1], a[1]], this.c = [n[2], a[2]], this.d = [n[3], a[3]], this.points = [e, t, r, i];
      }
      PolynomialBezier.prototype.point = function(e) {
        return [((this.a[0] * e + this.b[0]) * e + this.c[0]) * e + this.d[0], ((this.a[1] * e + this.b[1]) * e + this.c[1]) * e + this.d[1]];
      }, PolynomialBezier.prototype.derivative = function(e) {
        return [(3 * e * this.a[0] + 2 * this.b[0]) * e + this.c[0], (3 * e * this.a[1] + 2 * this.b[1]) * e + this.c[1]];
      }, PolynomialBezier.prototype.tangentAngle = function(e) {
        var t = this.derivative(e);
        return Math.atan2(t[1], t[0]);
      }, PolynomialBezier.prototype.normalAngle = function(e) {
        var t = this.derivative(e);
        return Math.atan2(t[0], t[1]);
      }, PolynomialBezier.prototype.inflectionPoints = function() {
        var e = this.a[1] * this.b[0] - this.a[0] * this.b[1];
        if (floatZero(e)) return [];
        var t = -0.5 * (this.a[1] * this.c[0] - this.a[0] * this.c[1]) / e, r = t * t - 1 / 3 * (this.b[1] * this.c[0] - this.b[0] * this.c[1]) / e;
        if (r < 0) return [];
        var i = Math.sqrt(r);
        return floatZero(i) ? i > 0 && i < 1 ? [t] : [] : [t - i, t + i].filter(function(s) {
          return s > 0 && s < 1;
        });
      }, PolynomialBezier.prototype.split = function(e) {
        if (e <= 0) return [singlePoint(this.points[0]), this];
        if (e >= 1) return [this, singlePoint(this.points[this.points.length - 1])];
        var t = lerpPoint(this.points[0], this.points[1], e), r = lerpPoint(this.points[1], this.points[2], e), i = lerpPoint(this.points[2], this.points[3], e), s = lerpPoint(t, r, e), n = lerpPoint(r, i, e), a = lerpPoint(s, n, e);
        return [new PolynomialBezier(this.points[0], t, s, a, !0), new PolynomialBezier(a, n, i, this.points[3], !0)];
      };
      function extrema(e, t) {
        var r = e.points[0][t], i = e.points[e.points.length - 1][t];
        if (r > i) {
          var s = i;
          i = r, r = s;
        }
        for (var n = quadRoots(3 * e.a[t], 2 * e.b[t], e.c[t]), a = 0; a < n.length; a += 1)
          if (n[a] > 0 && n[a] < 1) {
            var l = e.point(n[a])[t];
            l < r ? r = l : l > i && (i = l);
          }
        return {
          min: r,
          max: i
        };
      }
      PolynomialBezier.prototype.bounds = function() {
        return {
          x: extrema(this, 0),
          y: extrema(this, 1)
        };
      }, PolynomialBezier.prototype.boundingBox = function() {
        var e = this.bounds();
        return {
          left: e.x.min,
          right: e.x.max,
          top: e.y.min,
          bottom: e.y.max,
          width: e.x.max - e.x.min,
          height: e.y.max - e.y.min,
          cx: (e.x.max + e.x.min) / 2,
          cy: (e.y.max + e.y.min) / 2
        };
      };
      function intersectData(e, t, r) {
        var i = e.boundingBox();
        return {
          cx: i.cx,
          cy: i.cy,
          width: i.width,
          height: i.height,
          bez: e,
          t: (t + r) / 2,
          t1: t,
          t2: r
        };
      }
      function splitData(e) {
        var t = e.bez.split(0.5);
        return [intersectData(t[0], e.t1, e.t), intersectData(t[1], e.t, e.t2)];
      }
      function boxIntersect(e, t) {
        return Math.abs(e.cx - t.cx) * 2 < e.width + t.width && Math.abs(e.cy - t.cy) * 2 < e.height + t.height;
      }
      function intersectsImpl(e, t, r, i, s, n) {
        if (boxIntersect(e, t)) {
          if (r >= n || e.width <= i && e.height <= i && t.width <= i && t.height <= i) {
            s.push([e.t, t.t]);
            return;
          }
          var a = splitData(e), l = splitData(t);
          intersectsImpl(a[0], l[0], r + 1, i, s, n), intersectsImpl(a[0], l[1], r + 1, i, s, n), intersectsImpl(a[1], l[0], r + 1, i, s, n), intersectsImpl(a[1], l[1], r + 1, i, s, n);
        }
      }
      PolynomialBezier.prototype.intersections = function(e, t, r) {
        t === void 0 && (t = 2), r === void 0 && (r = 7);
        var i = [];
        return intersectsImpl(intersectData(this, 0, 1), intersectData(e, 0, 1), 0, t, i, r), i;
      }, PolynomialBezier.shapeSegment = function(e, t) {
        var r = (t + 1) % e.length();
        return new PolynomialBezier(e.v[t], e.o[t], e.i[r], e.v[r], !0);
      }, PolynomialBezier.shapeSegmentInverted = function(e, t) {
        var r = (t + 1) % e.length();
        return new PolynomialBezier(e.v[r], e.i[r], e.o[t], e.v[t], !0);
      };
      function crossProduct(e, t) {
        return [e[1] * t[2] - e[2] * t[1], e[2] * t[0] - e[0] * t[2], e[0] * t[1] - e[1] * t[0]];
      }
      function lineIntersection(e, t, r, i) {
        var s = [e[0], e[1], 1], n = [t[0], t[1], 1], a = [r[0], r[1], 1], l = [i[0], i[1], 1], o = crossProduct(crossProduct(s, n), crossProduct(a, l));
        return floatZero(o[2]) ? null : [o[0] / o[2], o[1] / o[2]];
      }
      function polarOffset(e, t, r) {
        return [e[0] + Math.cos(t) * r, e[1] - Math.sin(t) * r];
      }
      function pointDistance(e, t) {
        return Math.hypot(e[0] - t[0], e[1] - t[1]);
      }
      function pointEqual(e, t) {
        return floatEqual(e[0], t[0]) && floatEqual(e[1], t[1]);
      }
      function ZigZagModifier() {
      }
      extendPrototype([ShapeModifier], ZigZagModifier), ZigZagModifier.prototype.initModifierProperties = function(e, t) {
        this.getValue = this.processKeys, this.amplitude = PropertyFactory.getProp(e, t.s, 0, null, this), this.frequency = PropertyFactory.getProp(e, t.r, 0, null, this), this.pointsType = PropertyFactory.getProp(e, t.pt, 0, null, this), this._isAnimated = this.amplitude.effectsSequence.length !== 0 || this.frequency.effectsSequence.length !== 0 || this.pointsType.effectsSequence.length !== 0;
      };
      function setPoint(e, t, r, i, s, n, a) {
        var l = r - Math.PI / 2, o = r + Math.PI / 2, p = t[0] + Math.cos(r) * i * s, u = t[1] - Math.sin(r) * i * s;
        e.setTripleAt(p, u, p + Math.cos(l) * n, u - Math.sin(l) * n, p + Math.cos(o) * a, u - Math.sin(o) * a, e.length());
      }
      function getPerpendicularVector(e, t) {
        var r = [t[0] - e[0], t[1] - e[1]], i = -Math.PI * 0.5, s = [Math.cos(i) * r[0] - Math.sin(i) * r[1], Math.sin(i) * r[0] + Math.cos(i) * r[1]];
        return s;
      }
      function getProjectingAngle(e, t) {
        var r = t === 0 ? e.length() - 1 : t - 1, i = (t + 1) % e.length(), s = e.v[r], n = e.v[i], a = getPerpendicularVector(s, n);
        return Math.atan2(0, 1) - Math.atan2(a[1], a[0]);
      }
      function zigZagCorner(e, t, r, i, s, n, a) {
        var l = getProjectingAngle(t, r), o = t.v[r % t._length], p = t.v[r === 0 ? t._length - 1 : r - 1], u = t.v[(r + 1) % t._length], S = n === 2 ? Math.sqrt(Math.pow(o[0] - p[0], 2) + Math.pow(o[1] - p[1], 2)) : 0, f = n === 2 ? Math.sqrt(Math.pow(o[0] - u[0], 2) + Math.pow(o[1] - u[1], 2)) : 0;
        setPoint(e, t.v[r % t._length], l, a, i, f / ((s + 1) * 2), S / ((s + 1) * 2));
      }
      function zigZagSegment(e, t, r, i, s, n) {
        for (var a = 0; a < i; a += 1) {
          var l = (a + 1) / (i + 1), o = s === 2 ? Math.sqrt(Math.pow(t.points[3][0] - t.points[0][0], 2) + Math.pow(t.points[3][1] - t.points[0][1], 2)) : 0, p = t.normalAngle(l), u = t.point(l);
          setPoint(e, u, p, n, r, o / ((i + 1) * 2), o / ((i + 1) * 2)), n = -n;
        }
        return n;
      }
      ZigZagModifier.prototype.processPath = function(e, t, r, i) {
        var s = e._length, n = shapePool.newElement();
        if (n.c = e.c, e.c || (s -= 1), s === 0) return n;
        var a = -1, l = PolynomialBezier.shapeSegment(e, 0);
        zigZagCorner(n, e, 0, t, r, i, a);
        for (var o = 0; o < s; o += 1)
          a = zigZagSegment(n, l, t, r, i, -a), o === s - 1 && !e.c ? l = null : l = PolynomialBezier.shapeSegment(e, (o + 1) % s), zigZagCorner(n, e, o + 1, t, r, i, a);
        return n;
      }, ZigZagModifier.prototype.processShapes = function(e) {
        var t, r, i = this.shapes.length, s, n, a = this.amplitude.v, l = Math.max(0, Math.round(this.frequency.v)), o = this.pointsType.v;
        if (a !== 0) {
          var p, u;
          for (r = 0; r < i; r += 1) {
            if (p = this.shapes[r], u = p.localShapeCollection, !(!p.shape._mdf && !this._mdf && !e))
              for (u.releaseShapes(), p.shape._mdf = !0, t = p.shape.paths.shapes, n = p.shape.paths._length, s = 0; s < n; s += 1)
                u.addShape(this.processPath(t[s], a, l, o));
            p.shape.paths = p.localShapeCollection;
          }
        }
        this.dynamicProperties.length || (this._mdf = !1);
      };
      function linearOffset(e, t, r) {
        var i = Math.atan2(t[0] - e[0], t[1] - e[1]);
        return [polarOffset(e, i, r), polarOffset(t, i, r)];
      }
      function offsetSegment(e, t) {
        var r, i, s, n, a, l, o;
        o = linearOffset(e.points[0], e.points[1], t), r = o[0], i = o[1], o = linearOffset(e.points[1], e.points[2], t), s = o[0], n = o[1], o = linearOffset(e.points[2], e.points[3], t), a = o[0], l = o[1];
        var p = lineIntersection(r, i, s, n);
        p === null && (p = i);
        var u = lineIntersection(a, l, s, n);
        return u === null && (u = a), new PolynomialBezier(r, p, u, l);
      }
      function joinLines(e, t, r, i, s) {
        var n = t.points[3], a = r.points[0];
        if (i === 3 || pointEqual(n, a)) return n;
        if (i === 2) {
          var l = -t.tangentAngle(1), o = -r.tangentAngle(0) + Math.PI, p = lineIntersection(n, polarOffset(n, l + Math.PI / 2, 100), a, polarOffset(a, l + Math.PI / 2, 100)), u = p ? pointDistance(p, n) : pointDistance(n, a) / 2, S = polarOffset(n, l, 2 * u * roundCorner);
          return e.setXYAt(S[0], S[1], "o", e.length() - 1), S = polarOffset(a, o, 2 * u * roundCorner), e.setTripleAt(a[0], a[1], a[0], a[1], S[0], S[1], e.length()), a;
        }
        var f = pointEqual(n, t.points[2]) ? t.points[0] : t.points[2], b = pointEqual(a, r.points[1]) ? r.points[3] : r.points[1], v = lineIntersection(f, n, a, b);
        return v && pointDistance(v, n) < s ? (e.setTripleAt(v[0], v[1], v[0], v[1], v[0], v[1], e.length()), v) : n;
      }
      function getIntersection(e, t) {
        var r = e.intersections(t);
        return r.length && floatEqual(r[0][0], 1) && r.shift(), r.length ? r[0] : null;
      }
      function pruneSegmentIntersection(e, t) {
        var r = e.slice(), i = t.slice(), s = getIntersection(e[e.length - 1], t[0]);
        return s && (r[e.length - 1] = e[e.length - 1].split(s[0])[0], i[0] = t[0].split(s[1])[1]), e.length > 1 && t.length > 1 && (s = getIntersection(e[0], t[t.length - 1]), s) ? [[e[0].split(s[0])[0]], [t[t.length - 1].split(s[1])[1]]] : [r, i];
      }
      function pruneIntersections(e) {
        for (var t, r = 1; r < e.length; r += 1)
          t = pruneSegmentIntersection(e[r - 1], e[r]), e[r - 1] = t[0], e[r] = t[1];
        return e.length > 1 && (t = pruneSegmentIntersection(e[e.length - 1], e[0]), e[e.length - 1] = t[0], e[0] = t[1]), e;
      }
      function offsetSegmentSplit(e, t) {
        var r = e.inflectionPoints(), i, s, n, a;
        if (r.length === 0)
          return [offsetSegment(e, t)];
        if (r.length === 1 || floatEqual(r[1], 1))
          return n = e.split(r[0]), i = n[0], s = n[1], [offsetSegment(i, t), offsetSegment(s, t)];
        n = e.split(r[0]), i = n[0];
        var l = (r[1] - r[0]) / (1 - r[0]);
        return n = n[1].split(l), a = n[0], s = n[1], [offsetSegment(i, t), offsetSegment(a, t), offsetSegment(s, t)];
      }
      function OffsetPathModifier() {
      }
      extendPrototype([ShapeModifier], OffsetPathModifier), OffsetPathModifier.prototype.initModifierProperties = function(e, t) {
        this.getValue = this.processKeys, this.amount = PropertyFactory.getProp(e, t.a, 0, null, this), this.miterLimit = PropertyFactory.getProp(e, t.ml, 0, null, this), this.lineJoin = t.lj, this._isAnimated = this.amount.effectsSequence.length !== 0;
      }, OffsetPathModifier.prototype.processPath = function(e, t, r, i) {
        var s = shapePool.newElement();
        s.c = e.c;
        var n = e.length();
        e.c || (n -= 1);
        var a, l, o, p = [];
        for (a = 0; a < n; a += 1)
          o = PolynomialBezier.shapeSegment(e, a), p.push(offsetSegmentSplit(o, t));
        if (!e.c)
          for (a = n - 1; a >= 0; a -= 1)
            o = PolynomialBezier.shapeSegmentInverted(e, a), p.push(offsetSegmentSplit(o, t));
        p = pruneIntersections(p);
        var u = null, S = null;
        for (a = 0; a < p.length; a += 1) {
          var f = p[a];
          for (S && (u = joinLines(s, S, f[0], r, i)), S = f[f.length - 1], l = 0; l < f.length; l += 1)
            o = f[l], u && pointEqual(o.points[0], u) ? s.setXYAt(o.points[1][0], o.points[1][1], "o", s.length() - 1) : s.setTripleAt(o.points[0][0], o.points[0][1], o.points[1][0], o.points[1][1], o.points[0][0], o.points[0][1], s.length()), s.setTripleAt(o.points[3][0], o.points[3][1], o.points[3][0], o.points[3][1], o.points[2][0], o.points[2][1], s.length()), u = o.points[3];
        }
        return p.length && joinLines(s, S, p[0][0], r, i), s;
      }, OffsetPathModifier.prototype.processShapes = function(e) {
        var t, r, i = this.shapes.length, s, n, a = this.amount.v, l = this.miterLimit.v, o = this.lineJoin;
        if (a !== 0) {
          var p, u;
          for (r = 0; r < i; r += 1) {
            if (p = this.shapes[r], u = p.localShapeCollection, !(!p.shape._mdf && !this._mdf && !e))
              for (u.releaseShapes(), p.shape._mdf = !0, t = p.shape.paths.shapes, n = p.shape.paths._length, s = 0; s < n; s += 1)
                u.addShape(this.processPath(t[s], a, o, l));
            p.shape.paths = p.localShapeCollection;
          }
        }
        this.dynamicProperties.length || (this._mdf = !1);
      };
      function getFontProperties(e) {
        for (var t = e.fStyle ? e.fStyle.split(" ") : [], r = "normal", i = "normal", s = t.length, n, a = 0; a < s; a += 1)
          switch (n = t[a].toLowerCase(), n) {
            case "italic":
              i = "italic";
              break;
            case "bold":
              r = "700";
              break;
            case "black":
              r = "900";
              break;
            case "medium":
              r = "500";
              break;
            case "regular":
            case "normal":
              r = "400";
              break;
            case "light":
            case "thin":
              r = "200";
              break;
          }
        return {
          style: i,
          weight: e.fWeight || r
        };
      }
      var FontManager = (function() {
        var e = 5e3, t = {
          w: 0,
          size: 0,
          shapes: [],
          data: {
            shapes: []
          }
        }, r = [];
        r = r.concat([2304, 2305, 2306, 2307, 2362, 2363, 2364, 2364, 2366, 2367, 2368, 2369, 2370, 2371, 2372, 2373, 2374, 2375, 2376, 2377, 2378, 2379, 2380, 2381, 2382, 2383, 2387, 2388, 2389, 2390, 2391, 2402, 2403]);
        var i = 127988, s = 917631, n = 917601, a = 917626, l = 65039, o = 8205, p = 127462, u = 127487, S = ["d83cdffb", "d83cdffc", "d83cdffd", "d83cdffe", "d83cdfff"];
        function f(C) {
          var T = C.split(","), g, E = T.length, F = [];
          for (g = 0; g < E; g += 1)
            T[g] !== "sans-serif" && T[g] !== "monospace" && F.push(T[g]);
          return F.join(",");
        }
        function b(C, T) {
          var g = createTag("span");
          g.setAttribute("aria-hidden", !0), g.style.fontFamily = T;
          var E = createTag("span");
          E.innerText = "giItT1WQy@!-/#", g.style.position = "absolute", g.style.left = "-10000px", g.style.top = "-10000px", g.style.fontSize = "300px", g.style.fontVariant = "normal", g.style.fontStyle = "normal", g.style.fontWeight = "normal", g.style.letterSpacing = "0", g.appendChild(E), document.body.appendChild(g);
          var F = E.offsetWidth;
          return E.style.fontFamily = f(C) + ", " + T, {
            node: E,
            w: F,
            parent: g
          };
        }
        function v() {
          var C, T = this.fonts.length, g, E, F = T;
          for (C = 0; C < T; C += 1)
            this.fonts[C].loaded ? F -= 1 : this.fonts[C].fOrigin === "n" || this.fonts[C].origin === 0 ? this.fonts[C].loaded = !0 : (g = this.fonts[C].monoCase.node, E = this.fonts[C].monoCase.w, g.offsetWidth !== E ? (F -= 1, this.fonts[C].loaded = !0) : (g = this.fonts[C].sansCase.node, E = this.fonts[C].sansCase.w, g.offsetWidth !== E && (F -= 1, this.fonts[C].loaded = !0)), this.fonts[C].loaded && (this.fonts[C].sansCase.parent.parentNode.removeChild(this.fonts[C].sansCase.parent), this.fonts[C].monoCase.parent.parentNode.removeChild(this.fonts[C].monoCase.parent)));
          F !== 0 && Date.now() - this.initTime < e ? setTimeout(this.checkLoadedFontsBinded, 20) : setTimeout(this.setIsLoadedBinded, 10);
        }
        function m(C, T) {
          var g = document.body && T ? "svg" : "canvas", E, F = getFontProperties(C);
          if (g === "svg") {
            var k = createNS("text");
            k.style.fontSize = "100px", k.setAttribute("font-family", C.fFamily), k.setAttribute("font-style", F.style), k.setAttribute("font-weight", F.weight), k.textContent = "1", C.fClass ? (k.style.fontFamily = "inherit", k.setAttribute("class", C.fClass)) : k.style.fontFamily = C.fFamily, T.appendChild(k), E = k;
          } else {
            var L = new OffscreenCanvas(500, 500).getContext("2d");
            L.font = F.style + " " + F.weight + " 100px " + C.fFamily, E = L;
          }
          function O(G) {
            return g === "svg" ? (E.textContent = G, E.getComputedTextLength()) : E.measureText(G).width;
          }
          return {
            measureText: O
          };
        }
        function x(C, T) {
          if (!C) {
            this.isLoaded = !0;
            return;
          }
          if (this.chars) {
            this.isLoaded = !0, this.fonts = C.list;
            return;
          }
          if (!document.body) {
            this.isLoaded = !0, C.list.forEach(function(ee) {
              ee.helper = m(ee), ee.cache = {};
            }), this.fonts = C.list;
            return;
          }
          var g = C.list, E, F = g.length, k = F;
          for (E = 0; E < F; E += 1) {
            var L = !0, O, G;
            if (g[E].loaded = !1, g[E].monoCase = b(g[E].fFamily, "monospace"), g[E].sansCase = b(g[E].fFamily, "sans-serif"), !g[E].fPath)
              g[E].loaded = !0, k -= 1;
            else if (g[E].fOrigin === "p" || g[E].origin === 3) {
              if (O = document.querySelectorAll('style[f-forigin="p"][f-family="' + g[E].fFamily + '"], style[f-origin="3"][f-family="' + g[E].fFamily + '"]'), O.length > 0 && (L = !1), L) {
                var W = createTag("style");
                W.setAttribute("f-forigin", g[E].fOrigin), W.setAttribute("f-origin", g[E].origin), W.setAttribute("f-family", g[E].fFamily), W.type = "text/css", W.innerText = "@font-face {font-family: " + g[E].fFamily + "; font-style: normal; src: url('" + g[E].fPath + "');}", T.appendChild(W);
              }
            } else if (g[E].fOrigin === "g" || g[E].origin === 1) {
              for (O = document.querySelectorAll('link[f-forigin="g"], link[f-origin="1"]'), G = 0; G < O.length; G += 1)
                O[G].href.indexOf(g[E].fPath) !== -1 && (L = !1);
              if (L) {
                var q = createTag("link");
                q.setAttribute("f-forigin", g[E].fOrigin), q.setAttribute("f-origin", g[E].origin), q.type = "text/css", q.rel = "stylesheet", q.href = g[E].fPath, document.body.appendChild(q);
              }
            } else if (g[E].fOrigin === "t" || g[E].origin === 2) {
              for (O = document.querySelectorAll('script[f-forigin="t"], script[f-origin="2"]'), G = 0; G < O.length; G += 1)
                g[E].fPath === O[G].src && (L = !1);
              if (L) {
                var Y = createTag("link");
                Y.setAttribute("f-forigin", g[E].fOrigin), Y.setAttribute("f-origin", g[E].origin), Y.setAttribute("rel", "stylesheet"), Y.setAttribute("href", g[E].fPath), T.appendChild(Y);
              }
            }
            g[E].helper = m(g[E], T), g[E].cache = {}, this.fonts.push(g[E]);
          }
          k === 0 ? this.isLoaded = !0 : setTimeout(this.checkLoadedFonts.bind(this), 100);
        }
        function c(C) {
          if (C) {
            this.chars || (this.chars = []);
            var T, g = C.length, E, F = this.chars.length, k;
            for (T = 0; T < g; T += 1) {
              for (E = 0, k = !1; E < F; )
                this.chars[E].style === C[T].style && this.chars[E].fFamily === C[T].fFamily && this.chars[E].ch === C[T].ch && (k = !0), E += 1;
              k || (this.chars.push(C[T]), F += 1);
            }
          }
        }
        function d(C, T, g) {
          for (var E = 0, F = this.chars.length; E < F; ) {
            if (this.chars[E].ch === C && this.chars[E].style === T && this.chars[E].fFamily === g)
              return this.chars[E];
            E += 1;
          }
          return (typeof C == "string" && C.charCodeAt(0) !== 13 || !C) && console && console.warn && !this._warned && (this._warned = !0, console.warn("Missing character from exported characters list: ", C, T, g)), t;
        }
        function h(C, T, g) {
          var E = this.getFontByName(T), F = C;
          if (!E.cache[F]) {
            var k = E.helper;
            if (C === " ") {
              var L = k.measureText("|" + C + "|"), O = k.measureText("||");
              E.cache[F] = (L - O) / 100;
            } else
              E.cache[F] = k.measureText(C) / 100;
          }
          return E.cache[F] * g;
        }
        function y(C) {
          for (var T = 0, g = this.fonts.length; T < g; ) {
            if (this.fonts[T].fName === C)
              return this.fonts[T];
            T += 1;
          }
          return this.fonts[0];
        }
        function P(C) {
          var T = 0, g = C.charCodeAt(0);
          if (g >= 55296 && g <= 56319) {
            var E = C.charCodeAt(1);
            E >= 56320 && E <= 57343 && (T = (g - 55296) * 1024 + E - 56320 + 65536);
          }
          return T;
        }
        function A(C, T) {
          var g = C.toString(16) + T.toString(16);
          return S.indexOf(g) !== -1;
        }
        function _(C) {
          return C === o;
        }
        function M(C) {
          return C === l;
        }
        function w(C) {
          var T = P(C);
          return T >= p && T <= u;
        }
        function V(C) {
          return w(C.substr(0, 2)) && w(C.substr(2, 2));
        }
        function B(C) {
          return r.indexOf(C) !== -1;
        }
        function R(C, T) {
          var g = P(C.substr(T, 2));
          if (g !== i)
            return !1;
          var E = 0;
          for (T += 2; E < 5; ) {
            if (g = P(C.substr(T, 2)), g < n || g > a)
              return !1;
            E += 1, T += 2;
          }
          return P(C.substr(T, 2)) === s;
        }
        function D() {
          this.isLoaded = !0;
        }
        var N = function() {
          this.fonts = [], this.chars = null, this.typekitLoaded = 0, this.isLoaded = !1, this._warned = !1, this.initTime = Date.now(), this.setIsLoadedBinded = this.setIsLoaded.bind(this), this.checkLoadedFontsBinded = this.checkLoadedFonts.bind(this);
        };
        N.isModifier = A, N.isZeroWidthJoiner = _, N.isFlagEmoji = V, N.isRegionalCode = w, N.isCombinedCharacter = B, N.isRegionalFlag = R, N.isVariationSelector = M, N.BLACK_FLAG_CODE_POINT = i;
        var I = {
          addChars: c,
          addFonts: x,
          getCharData: d,
          getFontByName: y,
          measureText: h,
          checkLoadedFonts: v,
          setIsLoaded: D
        };
        return N.prototype = I, N;
      })();
      function SlotManager(e) {
        this.animationData = e;
      }
      SlotManager.prototype.getProp = function(e) {
        return this.animationData.slots && this.animationData.slots[e.sid] ? Object.assign(e, this.animationData.slots[e.sid].p) : e;
      };
      function slotFactory(e) {
        return new SlotManager(e);
      }
      function RenderableElement() {
      }
      RenderableElement.prototype = {
        initRenderable: function() {
          this.isInRange = !1, this.hidden = !1, this.isTransparent = !1, this.renderableComponents = [];
        },
        addRenderableComponent: function(t) {
          this.renderableComponents.indexOf(t) === -1 && this.renderableComponents.push(t);
        },
        removeRenderableComponent: function(t) {
          this.renderableComponents.indexOf(t) !== -1 && this.renderableComponents.splice(this.renderableComponents.indexOf(t), 1);
        },
        prepareRenderableFrame: function(t) {
          this.checkLayerLimits(t);
        },
        checkTransparency: function() {
          this.finalTransform.mProp.o.v <= 0 ? !this.isTransparent && this.globalData.renderConfig.hideOnTransparent && (this.isTransparent = !0, this.hide()) : this.isTransparent && (this.isTransparent = !1, this.show());
        },
        /**
           * @function
           * Initializes frame related properties.
           *
           * @param {number} num
           * current frame number in Layer's time
           *
           */
        checkLayerLimits: function(t) {
          this.data.ip - this.data.st <= t && this.data.op - this.data.st > t ? this.isInRange !== !0 && (this.globalData._mdf = !0, this._mdf = !0, this.isInRange = !0, this.show()) : this.isInRange !== !1 && (this.globalData._mdf = !0, this.isInRange = !1, this.hide());
        },
        renderRenderable: function() {
          var t, r = this.renderableComponents.length;
          for (t = 0; t < r; t += 1)
            this.renderableComponents[t].renderFrame(this._isFirstFrame);
        },
        sourceRectAtTime: function() {
          return {
            top: 0,
            left: 0,
            width: 100,
            height: 100
          };
        },
        getLayerSize: function() {
          return this.data.ty === 5 ? {
            w: this.data.textData.width,
            h: this.data.textData.height
          } : {
            w: this.data.width,
            h: this.data.height
          };
        }
      };
      var getBlendMode = /* @__PURE__ */ (function() {
        var e = {
          0: "source-over",
          1: "multiply",
          2: "screen",
          3: "overlay",
          4: "darken",
          5: "lighten",
          6: "color-dodge",
          7: "color-burn",
          8: "hard-light",
          9: "soft-light",
          10: "difference",
          11: "exclusion",
          12: "hue",
          13: "saturation",
          14: "color",
          15: "luminosity"
        };
        return function(t) {
          return e[t] || "";
        };
      })();
      function SliderEffect(e, t, r) {
        this.p = PropertyFactory.getProp(t, e.v, 0, 0, r);
      }
      function AngleEffect(e, t, r) {
        this.p = PropertyFactory.getProp(t, e.v, 0, 0, r);
      }
      function ColorEffect(e, t, r) {
        this.p = PropertyFactory.getProp(t, e.v, 1, 0, r);
      }
      function PointEffect(e, t, r) {
        this.p = PropertyFactory.getProp(t, e.v, 1, 0, r);
      }
      function LayerIndexEffect(e, t, r) {
        this.p = PropertyFactory.getProp(t, e.v, 0, 0, r);
      }
      function MaskIndexEffect(e, t, r) {
        this.p = PropertyFactory.getProp(t, e.v, 0, 0, r);
      }
      function CheckboxEffect(e, t, r) {
        this.p = PropertyFactory.getProp(t, e.v, 0, 0, r);
      }
      function NoValueEffect() {
        this.p = {};
      }
      function EffectsManager(e, t) {
        var r = e.ef || [];
        this.effectElements = [];
        var i, s = r.length, n;
        for (i = 0; i < s; i += 1)
          n = new GroupEffect(r[i], t), this.effectElements.push(n);
      }
      function GroupEffect(e, t) {
        this.init(e, t);
      }
      extendPrototype([DynamicPropertyContainer], GroupEffect), GroupEffect.prototype.getValue = GroupEffect.prototype.iterateDynamicProperties, GroupEffect.prototype.init = function(e, t) {
        this.data = e, this.effectElements = [], this.initDynamicPropertyContainer(t);
        var r, i = this.data.ef.length, s, n = this.data.ef;
        for (r = 0; r < i; r += 1) {
          switch (s = null, n[r].ty) {
            case 0:
              s = new SliderEffect(n[r], t, this);
              break;
            case 1:
              s = new AngleEffect(n[r], t, this);
              break;
            case 2:
              s = new ColorEffect(n[r], t, this);
              break;
            case 3:
              s = new PointEffect(n[r], t, this);
              break;
            case 4:
            case 7:
              s = new CheckboxEffect(n[r], t, this);
              break;
            case 10:
              s = new LayerIndexEffect(n[r], t, this);
              break;
            case 11:
              s = new MaskIndexEffect(n[r], t, this);
              break;
            case 5:
              s = new EffectsManager(n[r], t);
              break;
            // case 6:
            default:
              s = new NoValueEffect(n[r]);
              break;
          }
          s && this.effectElements.push(s);
        }
      };
      function BaseElement() {
      }
      BaseElement.prototype = {
        checkMasks: function() {
          if (!this.data.hasMask)
            return !1;
          for (var t = 0, r = this.data.masksProperties.length; t < r; ) {
            if (this.data.masksProperties[t].mode !== "n" && this.data.masksProperties[t].cl !== !1)
              return !0;
            t += 1;
          }
          return !1;
        },
        initExpressions: function() {
          var t = getExpressionInterfaces();
          if (t) {
            var r = t("layer"), i = t("effects"), s = t("shape"), n = t("text"), a = t("comp");
            this.layerInterface = r(this), this.data.hasMask && this.maskManager && this.layerInterface.registerMaskInterface(this.maskManager);
            var l = i.createEffectsInterface(this, this.layerInterface);
            this.layerInterface.registerEffectsInterface(l), this.data.ty === 0 || this.data.xt ? this.compInterface = a(this) : this.data.ty === 4 ? (this.layerInterface.shapeInterface = s(this.shapesData, this.itemsData, this.layerInterface), this.layerInterface.content = this.layerInterface.shapeInterface) : this.data.ty === 5 && (this.layerInterface.textInterface = n(this), this.layerInterface.text = this.layerInterface.textInterface);
          }
        },
        setBlendMode: function() {
          var t = getBlendMode(this.data.bm), r = this.baseElement || this.layerElement;
          r.style["mix-blend-mode"] = t;
        },
        initBaseData: function(t, r, i) {
          this.globalData = r, this.comp = i, this.data = t, this.layerId = createElementID(), this.data.sr || (this.data.sr = 1), this.effectsManager = new EffectsManager(this.data, this, this.dynamicProperties);
        },
        getType: function() {
          return this.type;
        },
        sourceRectAtTime: function() {
        }
      };
      function FrameElement() {
      }
      FrameElement.prototype = {
        /**
           * @function
           * Initializes frame related properties.
           *
           */
        initFrame: function() {
          this._isFirstFrame = !1, this.dynamicProperties = [], this._mdf = !1;
        },
        /**
           * @function
           * Calculates all dynamic values
           *
           * @param {number} num
           * current frame number in Layer's time
           * @param {boolean} isVisible
           * if layers is currently in range
           *
           */
        prepareProperties: function(t, r) {
          var i, s = this.dynamicProperties.length;
          for (i = 0; i < s; i += 1)
            (r || this._isParent && this.dynamicProperties[i].propType === "transform") && (this.dynamicProperties[i].getValue(), this.dynamicProperties[i]._mdf && (this.globalData._mdf = !0, this._mdf = !0));
        },
        addDynamicProperty: function(t) {
          this.dynamicProperties.indexOf(t) === -1 && this.dynamicProperties.push(t);
        }
      };
      function FootageElement(e, t, r) {
        this.initFrame(), this.initRenderable(), this.assetData = t.getAssetData(e.refId), this.footageData = t.imageLoader.getAsset(this.assetData), this.initBaseData(e, t, r);
      }
      FootageElement.prototype.prepareFrame = function() {
      }, extendPrototype([RenderableElement, BaseElement, FrameElement], FootageElement), FootageElement.prototype.getBaseElement = function() {
        return null;
      }, FootageElement.prototype.renderFrame = function() {
      }, FootageElement.prototype.destroy = function() {
      }, FootageElement.prototype.initExpressions = function() {
        var e = getExpressionInterfaces();
        if (e) {
          var t = e("footage");
          this.layerInterface = t(this);
        }
      }, FootageElement.prototype.getFootageData = function() {
        return this.footageData;
      };
      function AudioElement(e, t, r) {
        this.initFrame(), this.initRenderable(), this.assetData = t.getAssetData(e.refId), this.initBaseData(e, t, r), this._isPlaying = !1, this._canPlay = !1;
        var i = this.globalData.getAssetsPath(this.assetData);
        this.audio = this.globalData.audioController.createAudio(i), this._currentTime = 0, this.globalData.audioController.addAudio(this), this._volumeMultiplier = 1, this._volume = 1, this._previousVolume = null, this.tm = e.tm ? PropertyFactory.getProp(this, e.tm, 0, t.frameRate, this) : {
          _placeholder: !0
        }, this.lv = PropertyFactory.getProp(this, e.au && e.au.lv ? e.au.lv : {
          k: [100]
        }, 1, 0.01, this);
      }
      AudioElement.prototype.prepareFrame = function(e) {
        if (this.prepareRenderableFrame(e, !0), this.prepareProperties(e, !0), this.tm._placeholder)
          this._currentTime = e / this.data.sr;
        else {
          var t = this.tm.v;
          this._currentTime = t;
        }
        this._volume = this.lv.v[0];
        var r = this._volume * this._volumeMultiplier;
        this._previousVolume !== r && (this._previousVolume = r, this.audio.volume(r));
      }, extendPrototype([RenderableElement, BaseElement, FrameElement], AudioElement), AudioElement.prototype.renderFrame = function() {
        this.isInRange && this._canPlay && (this._isPlaying ? (!this.audio.playing() || Math.abs(this._currentTime / this.globalData.frameRate - this.audio.seek()) > 0.1) && this.audio.seek(this._currentTime / this.globalData.frameRate) : (this.audio.play(), this.audio.seek(this._currentTime / this.globalData.frameRate), this._isPlaying = !0));
      }, AudioElement.prototype.show = function() {
      }, AudioElement.prototype.hide = function() {
        this.audio.pause(), this._isPlaying = !1;
      }, AudioElement.prototype.pause = function() {
        this.audio.pause(), this._isPlaying = !1, this._canPlay = !1;
      }, AudioElement.prototype.resume = function() {
        this._canPlay = !0;
      }, AudioElement.prototype.setRate = function(e) {
        this.audio.rate(e);
      }, AudioElement.prototype.volume = function(e) {
        this._volumeMultiplier = e, this._previousVolume = e * this._volume, this.audio.volume(this._previousVolume);
      }, AudioElement.prototype.getBaseElement = function() {
        return null;
      }, AudioElement.prototype.destroy = function() {
      }, AudioElement.prototype.sourceRectAtTime = function() {
      }, AudioElement.prototype.initExpressions = function() {
      };
      function BaseRenderer() {
      }
      BaseRenderer.prototype.checkLayers = function(e) {
        var t, r = this.layers.length, i;
        for (this.completeLayers = !0, t = r - 1; t >= 0; t -= 1)
          this.elements[t] || (i = this.layers[t], i.ip - i.st <= e - this.layers[t].st && i.op - i.st > e - this.layers[t].st && this.buildItem(t)), this.completeLayers = this.elements[t] ? this.completeLayers : !1;
        this.checkPendingElements();
      }, BaseRenderer.prototype.createItem = function(e) {
        switch (e.ty) {
          case 2:
            return this.createImage(e);
          case 0:
            return this.createComp(e);
          case 1:
            return this.createSolid(e);
          case 3:
            return this.createNull(e);
          case 4:
            return this.createShape(e);
          case 5:
            return this.createText(e);
          case 6:
            return this.createAudio(e);
          case 13:
            return this.createCamera(e);
          case 15:
            return this.createFootage(e);
          default:
            return this.createNull(e);
        }
      }, BaseRenderer.prototype.createCamera = function() {
        throw new Error("You're using a 3d camera. Try the html renderer.");
      }, BaseRenderer.prototype.createAudio = function(e) {
        return new AudioElement(e, this.globalData, this);
      }, BaseRenderer.prototype.createFootage = function(e) {
        return new FootageElement(e, this.globalData, this);
      }, BaseRenderer.prototype.buildAllItems = function() {
        var e, t = this.layers.length;
        for (e = 0; e < t; e += 1)
          this.buildItem(e);
        this.checkPendingElements();
      }, BaseRenderer.prototype.includeLayers = function(e) {
        this.completeLayers = !1;
        var t, r = e.length, i, s = this.layers.length;
        for (t = 0; t < r; t += 1)
          for (i = 0; i < s; ) {
            if (this.layers[i].id === e[t].id) {
              this.layers[i] = e[t];
              break;
            }
            i += 1;
          }
      }, BaseRenderer.prototype.setProjectInterface = function(e) {
        this.globalData.projectInterface = e;
      }, BaseRenderer.prototype.initItems = function() {
        this.globalData.progressiveLoad || this.buildAllItems();
      }, BaseRenderer.prototype.buildElementParenting = function(e, t, r) {
        for (var i = this.elements, s = this.layers, n = 0, a = s.length; n < a; )
          s[n].ind == t && (!i[n] || i[n] === !0 ? (this.buildItem(n), this.addPendingElement(e)) : (r.push(i[n]), i[n].setAsParent(), s[n].parent !== void 0 ? this.buildElementParenting(e, s[n].parent, r) : e.setHierarchy(r))), n += 1;
      }, BaseRenderer.prototype.addPendingElement = function(e) {
        this.pendingElements.push(e);
      }, BaseRenderer.prototype.searchExtraCompositions = function(e) {
        var t, r = e.length;
        for (t = 0; t < r; t += 1)
          if (e[t].xt) {
            var i = this.createComp(e[t]);
            i.initExpressions(), this.globalData.projectInterface.registerComposition(i);
          }
      }, BaseRenderer.prototype.getElementById = function(e) {
        var t, r = this.elements.length;
        for (t = 0; t < r; t += 1)
          if (this.elements[t].data.ind === e)
            return this.elements[t];
        return null;
      }, BaseRenderer.prototype.getElementByPath = function(e) {
        var t = e.shift(), r;
        if (typeof t == "number")
          r = this.elements[t];
        else {
          var i, s = this.elements.length;
          for (i = 0; i < s; i += 1)
            if (this.elements[i].data.nm === t) {
              r = this.elements[i];
              break;
            }
        }
        return e.length === 0 ? r : r.getElementByPath(e);
      }, BaseRenderer.prototype.setupGlobalData = function(e, t) {
        this.globalData.fontManager = new FontManager(), this.globalData.slotManager = slotFactory(e), this.globalData.fontManager.addChars(e.chars), this.globalData.fontManager.addFonts(e.fonts, t), this.globalData.getAssetData = this.animationItem.getAssetData.bind(this.animationItem), this.globalData.getAssetsPath = this.animationItem.getAssetsPath.bind(this.animationItem), this.globalData.imageLoader = this.animationItem.imagePreloader, this.globalData.audioController = this.animationItem.audioController, this.globalData.frameId = 0, this.globalData.frameRate = e.fr, this.globalData.nm = e.nm, this.globalData.compSize = {
          w: e.w,
          h: e.h
        };
      };
      var effectTypes = {
        TRANSFORM_EFFECT: "transformEFfect"
      };
      function TransformElement() {
      }
      TransformElement.prototype = {
        initTransform: function() {
          var t = new Matrix();
          this.finalTransform = {
            mProp: this.data.ks ? TransformPropertyFactory.getTransformProperty(this, this.data.ks, this) : {
              o: 0
            },
            _matMdf: !1,
            _localMatMdf: !1,
            _opMdf: !1,
            mat: t,
            localMat: t,
            localOpacity: 1
          }, this.data.ao && (this.finalTransform.mProp.autoOriented = !0), this.data.ty;
        },
        renderTransform: function() {
          if (this.finalTransform._opMdf = this.finalTransform.mProp.o._mdf || this._isFirstFrame, this.finalTransform._matMdf = this.finalTransform.mProp._mdf || this._isFirstFrame, this.hierarchy) {
            var t, r = this.finalTransform.mat, i = 0, s = this.hierarchy.length;
            if (!this.finalTransform._matMdf)
              for (; i < s; ) {
                if (this.hierarchy[i].finalTransform.mProp._mdf) {
                  this.finalTransform._matMdf = !0;
                  break;
                }
                i += 1;
              }
            if (this.finalTransform._matMdf)
              for (t = this.finalTransform.mProp.v.props, r.cloneFromProps(t), i = 0; i < s; i += 1)
                r.multiply(this.hierarchy[i].finalTransform.mProp.v);
          }
          (!this.localTransforms || this.finalTransform._matMdf) && (this.finalTransform._localMatMdf = this.finalTransform._matMdf), this.finalTransform._opMdf && (this.finalTransform.localOpacity = this.finalTransform.mProp.o.v);
        },
        renderLocalTransform: function() {
          if (this.localTransforms) {
            var t = 0, r = this.localTransforms.length;
            if (this.finalTransform._localMatMdf = this.finalTransform._matMdf, !this.finalTransform._localMatMdf || !this.finalTransform._opMdf)
              for (; t < r; )
                this.localTransforms[t]._mdf && (this.finalTransform._localMatMdf = !0), this.localTransforms[t]._opMdf && !this.finalTransform._opMdf && (this.finalTransform.localOpacity = this.finalTransform.mProp.o.v, this.finalTransform._opMdf = !0), t += 1;
            if (this.finalTransform._localMatMdf) {
              var i = this.finalTransform.localMat;
              for (this.localTransforms[0].matrix.clone(i), t = 1; t < r; t += 1) {
                var s = this.localTransforms[t].matrix;
                i.multiply(s);
              }
              i.multiply(this.finalTransform.mat);
            }
            if (this.finalTransform._opMdf) {
              var n = this.finalTransform.localOpacity;
              for (t = 0; t < r; t += 1)
                n *= this.localTransforms[t].opacity * 0.01;
              this.finalTransform.localOpacity = n;
            }
          }
        },
        searchEffectTransforms: function() {
          if (this.renderableEffectsManager) {
            var t = this.renderableEffectsManager.getEffects(effectTypes.TRANSFORM_EFFECT);
            if (t.length) {
              this.localTransforms = [], this.finalTransform.localMat = new Matrix();
              var r = 0, i = t.length;
              for (r = 0; r < i; r += 1)
                this.localTransforms.push(t[r]);
            }
          }
        },
        globalToLocal: function(t) {
          var r = [];
          r.push(this.finalTransform);
          for (var i = !0, s = this.comp; i; )
            s.finalTransform ? (s.data.hasMask && r.splice(0, 0, s.finalTransform), s = s.comp) : i = !1;
          var n, a = r.length, l;
          for (n = 0; n < a; n += 1)
            l = r[n].mat.applyToPointArray(0, 0, 0), t = [t[0] - l[0], t[1] - l[1], 0];
          return t;
        },
        mHelper: new Matrix()
      };
      function MaskElement(e, t, r) {
        this.data = e, this.element = t, this.globalData = r, this.storedData = [], this.masksProperties = this.data.masksProperties || [], this.maskElement = null;
        var i = this.globalData.defs, s, n = this.masksProperties ? this.masksProperties.length : 0;
        this.viewData = createSizedArray(n), this.solidPath = "";
        var a, l = this.masksProperties, o = 0, p = [], u, S, f = createElementID(), b, v, m, x, c = "clipPath", d = "clip-path";
        for (s = 0; s < n; s += 1)
          if ((l[s].mode !== "a" && l[s].mode !== "n" || l[s].inv || l[s].o.k !== 100 || l[s].o.x) && (c = "mask", d = "mask"), (l[s].mode === "s" || l[s].mode === "i") && o === 0 ? (b = createNS("rect"), b.setAttribute("fill", "#ffffff"), b.setAttribute("width", this.element.comp.data.w || 0), b.setAttribute("height", this.element.comp.data.h || 0), p.push(b)) : b = null, a = createNS("path"), l[s].mode === "n")
            this.viewData[s] = {
              op: PropertyFactory.getProp(this.element, l[s].o, 0, 0.01, this.element),
              prop: ShapePropertyFactory.getShapeProp(this.element, l[s], 3),
              elem: a,
              lastPath: ""
            }, i.appendChild(a);
          else {
            o += 1, a.setAttribute("fill", l[s].mode === "s" ? "#000000" : "#ffffff"), a.setAttribute("clip-rule", "nonzero");
            var h;
            if (l[s].x.k !== 0 ? (c = "mask", d = "mask", x = PropertyFactory.getProp(this.element, l[s].x, 0, null, this.element), h = createElementID(), v = createNS("filter"), v.setAttribute("id", h), m = createNS("feMorphology"), m.setAttribute("operator", "erode"), m.setAttribute("in", "SourceGraphic"), m.setAttribute("radius", "0"), v.appendChild(m), i.appendChild(v), a.setAttribute("stroke", l[s].mode === "s" ? "#000000" : "#ffffff")) : (m = null, x = null), this.storedData[s] = {
              elem: a,
              x,
              expan: m,
              lastPath: "",
              lastOperator: "",
              filterId: h,
              lastRadius: 0
            }, l[s].mode === "i") {
              S = p.length;
              var y = createNS("g");
              for (u = 0; u < S; u += 1)
                y.appendChild(p[u]);
              var P = createNS("mask");
              P.setAttribute("mask-type", "alpha"), P.setAttribute("id", f + "_" + o), P.appendChild(a), i.appendChild(P), y.setAttribute("mask", "url(" + getLocationHref() + "#" + f + "_" + o + ")"), p.length = 0, p.push(y);
            } else
              p.push(a);
            l[s].inv && !this.solidPath && (this.solidPath = this.createLayerSolidPath()), this.viewData[s] = {
              elem: a,
              lastPath: "",
              op: PropertyFactory.getProp(this.element, l[s].o, 0, 0.01, this.element),
              prop: ShapePropertyFactory.getShapeProp(this.element, l[s], 3),
              invRect: b
            }, this.viewData[s].prop.k || this.drawPath(l[s], this.viewData[s].prop.v, this.viewData[s]);
          }
        for (this.maskElement = createNS(c), n = p.length, s = 0; s < n; s += 1)
          this.maskElement.appendChild(p[s]);
        o > 0 && (this.maskElement.setAttribute("id", f), this.element.maskedElement.setAttribute(d, "url(" + getLocationHref() + "#" + f + ")"), i.appendChild(this.maskElement)), this.viewData.length && this.element.addRenderableComponent(this);
      }
      MaskElement.prototype.getMaskProperty = function(e) {
        return this.viewData[e].prop;
      }, MaskElement.prototype.renderFrame = function(e) {
        var t = this.element.finalTransform.mat, r, i = this.masksProperties.length;
        for (r = 0; r < i; r += 1)
          if ((this.viewData[r].prop._mdf || e) && this.drawPath(this.masksProperties[r], this.viewData[r].prop.v, this.viewData[r]), (this.viewData[r].op._mdf || e) && this.viewData[r].elem.setAttribute("fill-opacity", this.viewData[r].op.v), this.masksProperties[r].mode !== "n" && (this.viewData[r].invRect && (this.element.finalTransform.mProp._mdf || e) && this.viewData[r].invRect.setAttribute("transform", t.getInverseMatrix().to2dCSS()), this.storedData[r].x && (this.storedData[r].x._mdf || e))) {
            var s = this.storedData[r].expan;
            this.storedData[r].x.v < 0 ? (this.storedData[r].lastOperator !== "erode" && (this.storedData[r].lastOperator = "erode", this.storedData[r].elem.setAttribute("filter", "url(" + getLocationHref() + "#" + this.storedData[r].filterId + ")")), s.setAttribute("radius", -this.storedData[r].x.v)) : (this.storedData[r].lastOperator !== "dilate" && (this.storedData[r].lastOperator = "dilate", this.storedData[r].elem.setAttribute("filter", null)), this.storedData[r].elem.setAttribute("stroke-width", this.storedData[r].x.v * 2));
          }
      }, MaskElement.prototype.getMaskelement = function() {
        return this.maskElement;
      }, MaskElement.prototype.createLayerSolidPath = function() {
        var e = "M0,0 ";
        return e += " h" + this.globalData.compSize.w, e += " v" + this.globalData.compSize.h, e += " h-" + this.globalData.compSize.w, e += " v-" + this.globalData.compSize.h + " ", e;
      }, MaskElement.prototype.drawPath = function(e, t, r) {
        var i = " M" + t.v[0][0] + "," + t.v[0][1], s, n;
        for (n = t._length, s = 1; s < n; s += 1)
          i += " C" + t.o[s - 1][0] + "," + t.o[s - 1][1] + " " + t.i[s][0] + "," + t.i[s][1] + " " + t.v[s][0] + "," + t.v[s][1];
        if (t.c && n > 1 && (i += " C" + t.o[s - 1][0] + "," + t.o[s - 1][1] + " " + t.i[0][0] + "," + t.i[0][1] + " " + t.v[0][0] + "," + t.v[0][1]), r.lastPath !== i) {
          var a = "";
          r.elem && (t.c && (a = e.inv ? this.solidPath + i : i), r.elem.setAttribute("d", a)), r.lastPath = i;
        }
      }, MaskElement.prototype.destroy = function() {
        this.element = null, this.globalData = null, this.maskElement = null, this.data = null, this.masksProperties = null;
      };
      var filtersFactory = (function() {
        var e = {};
        e.createFilter = t, e.createAlphaToLuminanceFilter = r;
        function t(i, s) {
          var n = createNS("filter");
          return n.setAttribute("id", i), s !== !0 && (n.setAttribute("filterUnits", "objectBoundingBox"), n.setAttribute("x", "0%"), n.setAttribute("y", "0%"), n.setAttribute("width", "100%"), n.setAttribute("height", "100%")), n;
        }
        function r() {
          var i = createNS("feColorMatrix");
          return i.setAttribute("type", "matrix"), i.setAttribute("color-interpolation-filters", "sRGB"), i.setAttribute("values", "0 0 0 1 0  0 0 0 1 0  0 0 0 1 0  0 0 0 1 1"), i;
        }
        return e;
      })(), featureSupport = (function() {
        var e = {
          maskType: !0,
          svgLumaHidden: !0,
          offscreenCanvas: typeof OffscreenCanvas < "u"
        };
        return (/MSIE 10/i.test(navigator.userAgent) || /MSIE 9/i.test(navigator.userAgent) || /rv:11.0/i.test(navigator.userAgent) || /Edge\/\d./i.test(navigator.userAgent)) && (e.maskType = !1), /firefox/i.test(navigator.userAgent) && (e.svgLumaHidden = !1), e;
      })(), registeredEffects$1 = {}, idPrefix = "filter_result_";
      function SVGEffects(e) {
        var t, r = "SourceGraphic", i = e.data.ef ? e.data.ef.length : 0, s = createElementID(), n = filtersFactory.createFilter(s, !0), a = 0;
        this.filters = [];
        var l;
        for (t = 0; t < i; t += 1) {
          l = null;
          var o = e.data.ef[t].ty;
          if (registeredEffects$1[o]) {
            var p = registeredEffects$1[o].effect;
            l = new p(n, e.effectsManager.effectElements[t], e, idPrefix + a, r), r = idPrefix + a, registeredEffects$1[o].countsAsEffect && (a += 1);
          }
          l && this.filters.push(l);
        }
        a && (e.globalData.defs.appendChild(n), e.layerElement.setAttribute("filter", "url(" + getLocationHref() + "#" + s + ")")), this.filters.length && e.addRenderableComponent(this);
      }
      SVGEffects.prototype.renderFrame = function(e) {
        var t, r = this.filters.length;
        for (t = 0; t < r; t += 1)
          this.filters[t].renderFrame(e);
      }, SVGEffects.prototype.getEffects = function(e) {
        var t, r = this.filters.length, i = [];
        for (t = 0; t < r; t += 1)
          this.filters[t].type === e && i.push(this.filters[t]);
        return i;
      };
      function registerEffect$1(e, t, r) {
        registeredEffects$1[e] = {
          effect: t,
          countsAsEffect: r
        };
      }
      function SVGBaseElement() {
      }
      SVGBaseElement.prototype = {
        initRendererElement: function() {
          this.layerElement = createNS("g");
        },
        createContainerElements: function() {
          this.matteElement = createNS("g"), this.transformedElement = this.layerElement, this.maskedElement = this.layerElement, this._sizeChanged = !1;
          var t = null;
          if (this.data.td) {
            this.matteMasks = {};
            var r = createNS("g");
            r.setAttribute("id", this.layerId), r.appendChild(this.layerElement), t = r, this.globalData.defs.appendChild(r);
          } else this.data.tt ? (this.matteElement.appendChild(this.layerElement), t = this.matteElement, this.baseElement = this.matteElement) : this.baseElement = this.layerElement;
          if (this.data.ln && this.layerElement.setAttribute("id", this.data.ln), this.data.cl && this.layerElement.setAttribute("class", this.data.cl), this.data.ty === 0 && !this.data.hd) {
            var i = createNS("clipPath"), s = createNS("path");
            s.setAttribute("d", "M0,0 L" + this.data.w + ",0 L" + this.data.w + "," + this.data.h + " L0," + this.data.h + "z");
            var n = createElementID();
            if (i.setAttribute("id", n), i.appendChild(s), this.globalData.defs.appendChild(i), this.checkMasks()) {
              var a = createNS("g");
              a.setAttribute("clip-path", "url(" + getLocationHref() + "#" + n + ")"), a.appendChild(this.layerElement), this.transformedElement = a, t ? t.appendChild(this.transformedElement) : this.baseElement = this.transformedElement;
            } else
              this.layerElement.setAttribute("clip-path", "url(" + getLocationHref() + "#" + n + ")");
          }
          this.data.bm !== 0 && this.setBlendMode();
        },
        renderElement: function() {
          this.finalTransform._localMatMdf && this.transformedElement.setAttribute("transform", this.finalTransform.localMat.to2dCSS()), this.finalTransform._opMdf && this.transformedElement.setAttribute("opacity", this.finalTransform.localOpacity);
        },
        destroyBaseElement: function() {
          this.layerElement = null, this.matteElement = null, this.maskManager.destroy();
        },
        getBaseElement: function() {
          return this.data.hd ? null : this.baseElement;
        },
        createRenderableComponents: function() {
          this.maskManager = new MaskElement(this.data, this, this.globalData), this.renderableEffectsManager = new SVGEffects(this), this.searchEffectTransforms();
        },
        getMatte: function(t) {
          if (this.matteMasks || (this.matteMasks = {}), !this.matteMasks[t]) {
            var r = this.layerId + "_" + t, i, s, n, a;
            if (t === 1 || t === 3) {
              var l = createNS("mask");
              l.setAttribute("id", r), l.setAttribute("mask-type", t === 3 ? "luminance" : "alpha"), n = createNS("use"), n.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#" + this.layerId), l.appendChild(n), this.globalData.defs.appendChild(l), !featureSupport.maskType && t === 1 && (l.setAttribute("mask-type", "luminance"), i = createElementID(), s = filtersFactory.createFilter(i), this.globalData.defs.appendChild(s), s.appendChild(filtersFactory.createAlphaToLuminanceFilter()), a = createNS("g"), a.appendChild(n), l.appendChild(a), a.setAttribute("filter", "url(" + getLocationHref() + "#" + i + ")"));
            } else if (t === 2) {
              var o = createNS("mask");
              o.setAttribute("id", r), o.setAttribute("mask-type", "alpha");
              var p = createNS("g");
              o.appendChild(p), i = createElementID(), s = filtersFactory.createFilter(i);
              var u = createNS("feComponentTransfer");
              u.setAttribute("in", "SourceGraphic"), s.appendChild(u);
              var S = createNS("feFuncA");
              S.setAttribute("type", "table"), S.setAttribute("tableValues", "1.0 0.0"), u.appendChild(S), this.globalData.defs.appendChild(s);
              var f = createNS("rect");
              f.setAttribute("width", this.comp.data.w), f.setAttribute("height", this.comp.data.h), f.setAttribute("x", "0"), f.setAttribute("y", "0"), f.setAttribute("fill", "#ffffff"), f.setAttribute("opacity", "0"), p.setAttribute("filter", "url(" + getLocationHref() + "#" + i + ")"), p.appendChild(f), n = createNS("use"), n.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#" + this.layerId), p.appendChild(n), featureSupport.maskType || (o.setAttribute("mask-type", "luminance"), s.appendChild(filtersFactory.createAlphaToLuminanceFilter()), a = createNS("g"), p.appendChild(f), a.appendChild(this.layerElement), p.appendChild(a)), this.globalData.defs.appendChild(o);
            }
            this.matteMasks[t] = r;
          }
          return this.matteMasks[t];
        },
        setMatte: function(t) {
          this.matteElement && this.matteElement.setAttribute("mask", "url(" + getLocationHref() + "#" + t + ")");
        }
      };
      function HierarchyElement() {
      }
      HierarchyElement.prototype = {
        /**
           * @function
           * Initializes hierarchy properties
           *
           */
        initHierarchy: function() {
          this.hierarchy = [], this._isParent = !1, this.checkParenting();
        },
        /**
           * @function
           * Sets layer's hierarchy.
           * @param {array} hierarch
           * layer's parent list
           *
           */
        setHierarchy: function(t) {
          this.hierarchy = t;
        },
        /**
           * @function
           * Sets layer as parent.
           *
           */
        setAsParent: function() {
          this._isParent = !0;
        },
        /**
           * @function
           * Searches layer's parenting chain
           *
           */
        checkParenting: function() {
          this.data.parent !== void 0 && this.comp.buildElementParenting(this, this.data.parent, []);
        }
      };
      function RenderableDOMElement() {
      }
      (function() {
        var e = {
          initElement: function(r, i, s) {
            this.initFrame(), this.initBaseData(r, i, s), this.initTransform(r, i, s), this.initHierarchy(), this.initRenderable(), this.initRendererElement(), this.createContainerElements(), this.createRenderableComponents(), this.createContent(), this.hide();
          },
          hide: function() {
            if (!this.hidden && (!this.isInRange || this.isTransparent)) {
              var r = this.baseElement || this.layerElement;
              r.style.display = "none", this.hidden = !0;
            }
          },
          show: function() {
            if (this.isInRange && !this.isTransparent) {
              if (!this.data.hd) {
                var r = this.baseElement || this.layerElement;
                r.style.display = "block";
              }
              this.hidden = !1, this._isFirstFrame = !0;
            }
          },
          renderFrame: function() {
            this.data.hd || this.hidden || (this.renderTransform(), this.renderRenderable(), this.renderLocalTransform(), this.renderElement(), this.renderInnerContent(), this._isFirstFrame && (this._isFirstFrame = !1));
          },
          renderInnerContent: function() {
          },
          prepareFrame: function(r) {
            this._mdf = !1, this.prepareRenderableFrame(r), this.prepareProperties(r, this.isInRange), this.checkTransparency();
          },
          destroy: function() {
            this.innerElem = null, this.destroyBaseElement();
          }
        };
        extendPrototype([RenderableElement, createProxyFunction(e)], RenderableDOMElement);
      })();
      function IImageElement(e, t, r) {
        this.assetData = t.getAssetData(e.refId), this.assetData && this.assetData.sid && (this.assetData = t.slotManager.getProp(this.assetData)), this.initElement(e, t, r), this.sourceRect = {
          top: 0,
          left: 0,
          width: this.assetData.w,
          height: this.assetData.h
        };
      }
      extendPrototype([BaseElement, TransformElement, SVGBaseElement, HierarchyElement, FrameElement, RenderableDOMElement], IImageElement), IImageElement.prototype.createContent = function() {
        var e = this.globalData.getAssetsPath(this.assetData);
        this.innerElem = createNS("image"), this.innerElem.setAttribute("width", this.assetData.w + "px"), this.innerElem.setAttribute("height", this.assetData.h + "px"), this.innerElem.setAttribute("preserveAspectRatio", this.assetData.pr || this.globalData.renderConfig.imagePreserveAspectRatio), this.innerElem.setAttributeNS("http://www.w3.org/1999/xlink", "href", e), this.layerElement.appendChild(this.innerElem);
      }, IImageElement.prototype.sourceRectAtTime = function() {
        return this.sourceRect;
      };
      function ProcessedElement(e, t) {
        this.elem = e, this.pos = t;
      }
      function IShapeElement() {
      }
      IShapeElement.prototype = {
        addShapeToModifiers: function(t) {
          var r, i = this.shapeModifiers.length;
          for (r = 0; r < i; r += 1)
            this.shapeModifiers[r].addShape(t);
        },
        isShapeInAnimatedModifiers: function(t) {
          for (var r = 0, i = this.shapeModifiers.length; r < i; )
            if (this.shapeModifiers[r].isAnimatedWithShape(t))
              return !0;
          return !1;
        },
        renderModifiers: function() {
          if (this.shapeModifiers.length) {
            var t, r = this.shapes.length;
            for (t = 0; t < r; t += 1)
              this.shapes[t].sh.reset();
            r = this.shapeModifiers.length;
            var i;
            for (t = r - 1; t >= 0 && (i = this.shapeModifiers[t].processShapes(this._isFirstFrame), !i); t -= 1)
              ;
          }
        },
        searchProcessedElement: function(t) {
          for (var r = this.processedElements, i = 0, s = r.length; i < s; ) {
            if (r[i].elem === t)
              return r[i].pos;
            i += 1;
          }
          return 0;
        },
        addProcessedElement: function(t, r) {
          for (var i = this.processedElements, s = i.length; s; )
            if (s -= 1, i[s].elem === t) {
              i[s].pos = r;
              return;
            }
          i.push(new ProcessedElement(t, r));
        },
        prepareFrame: function(t) {
          this.prepareRenderableFrame(t), this.prepareProperties(t, this.isInRange);
        }
      };
      var lineCapEnum = {
        1: "butt",
        2: "round",
        3: "square"
      }, lineJoinEnum = {
        1: "miter",
        2: "round",
        3: "bevel"
      };
      function SVGShapeData(e, t, r) {
        this.caches = [], this.styles = [], this.transformers = e, this.lStr = "", this.sh = r, this.lvl = t, this._isAnimated = !!r.k;
        for (var i = 0, s = e.length; i < s; ) {
          if (e[i].mProps.dynamicProperties.length) {
            this._isAnimated = !0;
            break;
          }
          i += 1;
        }
      }
      SVGShapeData.prototype.setAsAnimated = function() {
        this._isAnimated = !0;
      };
      function SVGStyleData(e, t) {
        this.data = e, this.type = e.ty, this.d = "", this.lvl = t, this._mdf = !1, this.closed = e.hd === !0, this.pElem = createNS("path"), this.msElem = null;
      }
      SVGStyleData.prototype.reset = function() {
        this.d = "", this._mdf = !1;
      };
      function DashProperty(e, t, r, i) {
        this.elem = e, this.frameId = -1, this.dataProps = createSizedArray(t.length), this.renderer = r, this.k = !1, this.dashStr = "", this.dashArray = createTypedArray("float32", t.length ? t.length - 1 : 0), this.dashoffset = createTypedArray("float32", 1), this.initDynamicPropertyContainer(i);
        var s, n = t.length || 0, a;
        for (s = 0; s < n; s += 1)
          a = PropertyFactory.getProp(e, t[s].v, 0, 0, this), this.k = a.k || this.k, this.dataProps[s] = {
            n: t[s].n,
            p: a
          };
        this.k || this.getValue(!0), this._isAnimated = this.k;
      }
      DashProperty.prototype.getValue = function(e) {
        if (!(this.elem.globalData.frameId === this.frameId && !e) && (this.frameId = this.elem.globalData.frameId, this.iterateDynamicProperties(), this._mdf = this._mdf || e, this._mdf)) {
          var t = 0, r = this.dataProps.length;
          for (this.renderer === "svg" && (this.dashStr = ""), t = 0; t < r; t += 1)
            this.dataProps[t].n !== "o" ? this.renderer === "svg" ? this.dashStr += " " + this.dataProps[t].p.v : this.dashArray[t] = this.dataProps[t].p.v : this.dashoffset[0] = this.dataProps[t].p.v;
        }
      }, extendPrototype([DynamicPropertyContainer], DashProperty);
      function SVGStrokeStyleData(e, t, r) {
        this.initDynamicPropertyContainer(e), this.getValue = this.iterateDynamicProperties, this.o = PropertyFactory.getProp(e, t.o, 0, 0.01, this), this.w = PropertyFactory.getProp(e, t.w, 0, null, this), this.d = new DashProperty(e, t.d || {}, "svg", this), this.c = PropertyFactory.getProp(e, t.c, 1, 255, this), this.style = r, this._isAnimated = !!this._isAnimated;
      }
      extendPrototype([DynamicPropertyContainer], SVGStrokeStyleData);
      function SVGFillStyleData(e, t, r) {
        this.initDynamicPropertyContainer(e), this.getValue = this.iterateDynamicProperties, this.o = PropertyFactory.getProp(e, t.o, 0, 0.01, this), this.c = PropertyFactory.getProp(e, t.c, 1, 255, this), this.style = r;
      }
      extendPrototype([DynamicPropertyContainer], SVGFillStyleData);
      function SVGNoStyleData(e, t, r) {
        this.initDynamicPropertyContainer(e), this.getValue = this.iterateDynamicProperties, this.style = r;
      }
      extendPrototype([DynamicPropertyContainer], SVGNoStyleData);
      function GradientProperty(e, t, r) {
        this.data = t, this.c = createTypedArray("uint8c", t.p * 4);
        var i = t.k.k[0].s ? t.k.k[0].s.length - t.p * 4 : t.k.k.length - t.p * 4;
        this.o = createTypedArray("float32", i), this._cmdf = !1, this._omdf = !1, this._collapsable = this.checkCollapsable(), this._hasOpacity = i, this.initDynamicPropertyContainer(r), this.prop = PropertyFactory.getProp(e, t.k, 1, null, this), this.k = this.prop.k, this.getValue(!0);
      }
      GradientProperty.prototype.comparePoints = function(e, t) {
        for (var r = 0, i = this.o.length / 2, s; r < i; ) {
          if (s = Math.abs(e[r * 4] - e[t * 4 + r * 2]), s > 0.01)
            return !1;
          r += 1;
        }
        return !0;
      }, GradientProperty.prototype.checkCollapsable = function() {
        if (this.o.length / 2 !== this.c.length / 4)
          return !1;
        if (this.data.k.k[0].s)
          for (var e = 0, t = this.data.k.k.length; e < t; ) {
            if (!this.comparePoints(this.data.k.k[e].s, this.data.p))
              return !1;
            e += 1;
          }
        else if (!this.comparePoints(this.data.k.k, this.data.p))
          return !1;
        return !0;
      }, GradientProperty.prototype.getValue = function(e) {
        if (this.prop.getValue(), this._mdf = !1, this._cmdf = !1, this._omdf = !1, this.prop._mdf || e) {
          var t, r = this.data.p * 4, i, s;
          for (t = 0; t < r; t += 1)
            i = t % 4 === 0 ? 100 : 255, s = Math.round(this.prop.v[t] * i), this.c[t] !== s && (this.c[t] = s, this._cmdf = !e);
          if (this.o.length)
            for (r = this.prop.v.length, t = this.data.p * 4; t < r; t += 1)
              i = t % 2 === 0 ? 100 : 1, s = t % 2 === 0 ? Math.round(this.prop.v[t] * 100) : this.prop.v[t], this.o[t - this.data.p * 4] !== s && (this.o[t - this.data.p * 4] = s, this._omdf = !e);
          this._mdf = !e;
        }
      }, extendPrototype([DynamicPropertyContainer], GradientProperty);
      function SVGGradientFillStyleData(e, t, r) {
        this.initDynamicPropertyContainer(e), this.getValue = this.iterateDynamicProperties, this.initGradientData(e, t, r);
      }
      SVGGradientFillStyleData.prototype.initGradientData = function(e, t, r) {
        this.o = PropertyFactory.getProp(e, t.o, 0, 0.01, this), this.s = PropertyFactory.getProp(e, t.s, 1, null, this), this.e = PropertyFactory.getProp(e, t.e, 1, null, this), this.h = PropertyFactory.getProp(e, t.h || {
          k: 0
        }, 0, 0.01, this), this.a = PropertyFactory.getProp(e, t.a || {
          k: 0
        }, 0, degToRads, this), this.g = new GradientProperty(e, t.g, this), this.style = r, this.stops = [], this.setGradientData(r.pElem, t), this.setGradientOpacity(t, r), this._isAnimated = !!this._isAnimated;
      }, SVGGradientFillStyleData.prototype.setGradientData = function(e, t) {
        var r = createElementID(), i = createNS(t.t === 1 ? "linearGradient" : "radialGradient");
        i.setAttribute("id", r), i.setAttribute("spreadMethod", "pad"), i.setAttribute("gradientUnits", "userSpaceOnUse");
        var s = [], n, a, l;
        for (l = t.g.p * 4, a = 0; a < l; a += 4)
          n = createNS("stop"), i.appendChild(n), s.push(n);
        e.setAttribute(t.ty === "gf" ? "fill" : "stroke", "url(" + getLocationHref() + "#" + r + ")"), this.gf = i, this.cst = s;
      }, SVGGradientFillStyleData.prototype.setGradientOpacity = function(e, t) {
        if (this.g._hasOpacity && !this.g._collapsable) {
          var r, i, s, n = createNS("mask"), a = createNS("path");
          n.appendChild(a);
          var l = createElementID(), o = createElementID();
          n.setAttribute("id", o);
          var p = createNS(e.t === 1 ? "linearGradient" : "radialGradient");
          p.setAttribute("id", l), p.setAttribute("spreadMethod", "pad"), p.setAttribute("gradientUnits", "userSpaceOnUse"), s = e.g.k.k[0].s ? e.g.k.k[0].s.length : e.g.k.k.length;
          var u = this.stops;
          for (i = e.g.p * 4; i < s; i += 2)
            r = createNS("stop"), r.setAttribute("stop-color", "rgb(255,255,255)"), p.appendChild(r), u.push(r);
          a.setAttribute(e.ty === "gf" ? "fill" : "stroke", "url(" + getLocationHref() + "#" + l + ")"), e.ty === "gs" && (a.setAttribute("stroke-linecap", lineCapEnum[e.lc || 2]), a.setAttribute("stroke-linejoin", lineJoinEnum[e.lj || 2]), e.lj === 1 && a.setAttribute("stroke-miterlimit", e.ml)), this.of = p, this.ms = n, this.ost = u, this.maskId = o, t.msElem = a;
        }
      }, extendPrototype([DynamicPropertyContainer], SVGGradientFillStyleData);
      function SVGGradientStrokeStyleData(e, t, r) {
        this.initDynamicPropertyContainer(e), this.getValue = this.iterateDynamicProperties, this.w = PropertyFactory.getProp(e, t.w, 0, null, this), this.d = new DashProperty(e, t.d || {}, "svg", this), this.initGradientData(e, t, r), this._isAnimated = !!this._isAnimated;
      }
      extendPrototype([SVGGradientFillStyleData, DynamicPropertyContainer], SVGGradientStrokeStyleData);
      function ShapeGroupData() {
        this.it = [], this.prevViewData = [], this.gr = createNS("g");
      }
      function SVGTransformData(e, t, r) {
        this.transform = {
          mProps: e,
          op: t,
          container: r
        }, this.elements = [], this._isAnimated = this.transform.mProps.dynamicProperties.length || this.transform.op.effectsSequence.length;
      }
      var buildShapeString = function(t, r, i, s) {
        if (r === 0)
          return "";
        var n = t.o, a = t.i, l = t.v, o, p = " M" + s.applyToPointStringified(l[0][0], l[0][1]);
        for (o = 1; o < r; o += 1)
          p += " C" + s.applyToPointStringified(n[o - 1][0], n[o - 1][1]) + " " + s.applyToPointStringified(a[o][0], a[o][1]) + " " + s.applyToPointStringified(l[o][0], l[o][1]);
        return i && r && (p += " C" + s.applyToPointStringified(n[o - 1][0], n[o - 1][1]) + " " + s.applyToPointStringified(a[0][0], a[0][1]) + " " + s.applyToPointStringified(l[0][0], l[0][1]), p += "z"), p;
      }, SVGElementsRenderer = (function() {
        var e = new Matrix(), t = new Matrix(), r = {
          createRenderFunction: i
        };
        function i(S) {
          switch (S.ty) {
            case "fl":
              return l;
            case "gf":
              return p;
            case "gs":
              return o;
            case "st":
              return u;
            case "sh":
            case "el":
            case "rc":
            case "sr":
              return a;
            case "tr":
              return s;
            case "no":
              return n;
            default:
              return null;
          }
        }
        function s(S, f, b) {
          (b || f.transform.op._mdf) && f.transform.container.setAttribute("opacity", f.transform.op.v), (b || f.transform.mProps._mdf) && f.transform.container.setAttribute("transform", f.transform.mProps.v.to2dCSS());
        }
        function n() {
        }
        function a(S, f, b) {
          var v, m, x, c, d, h, y = f.styles.length, P = f.lvl, A, _, M, w;
          for (h = 0; h < y; h += 1) {
            if (c = f.sh._mdf || b, f.styles[h].lvl < P) {
              for (_ = t.reset(), M = P - f.styles[h].lvl, w = f.transformers.length - 1; !c && M > 0; )
                c = f.transformers[w].mProps._mdf || c, M -= 1, w -= 1;
              if (c)
                for (M = P - f.styles[h].lvl, w = f.transformers.length - 1; M > 0; )
                  _.multiply(f.transformers[w].mProps.v), M -= 1, w -= 1;
            } else
              _ = e;
            if (A = f.sh.paths, m = A._length, c) {
              for (x = "", v = 0; v < m; v += 1)
                d = A.shapes[v], d && d._length && (x += buildShapeString(d, d._length, d.c, _));
              f.caches[h] = x;
            } else
              x = f.caches[h];
            f.styles[h].d += S.hd === !0 ? "" : x, f.styles[h]._mdf = c || f.styles[h]._mdf;
          }
        }
        function l(S, f, b) {
          var v = f.style;
          (f.c._mdf || b) && v.pElem.setAttribute("fill", "rgb(" + bmFloor(f.c.v[0]) + "," + bmFloor(f.c.v[1]) + "," + bmFloor(f.c.v[2]) + ")"), (f.o._mdf || b) && v.pElem.setAttribute("fill-opacity", f.o.v);
        }
        function o(S, f, b) {
          p(S, f, b), u(S, f, b);
        }
        function p(S, f, b) {
          var v = f.gf, m = f.g._hasOpacity, x = f.s.v, c = f.e.v;
          if (f.o._mdf || b) {
            var d = S.ty === "gf" ? "fill-opacity" : "stroke-opacity";
            f.style.pElem.setAttribute(d, f.o.v);
          }
          if (f.s._mdf || b) {
            var h = S.t === 1 ? "x1" : "cx", y = h === "x1" ? "y1" : "cy";
            v.setAttribute(h, x[0]), v.setAttribute(y, x[1]), m && !f.g._collapsable && (f.of.setAttribute(h, x[0]), f.of.setAttribute(y, x[1]));
          }
          var P, A, _, M;
          if (f.g._cmdf || b) {
            P = f.cst;
            var w = f.g.c;
            for (_ = P.length, A = 0; A < _; A += 1)
              M = P[A], M.setAttribute("offset", w[A * 4] + "%"), M.setAttribute("stop-color", "rgb(" + w[A * 4 + 1] + "," + w[A * 4 + 2] + "," + w[A * 4 + 3] + ")");
          }
          if (m && (f.g._omdf || b)) {
            var V = f.g.o;
            for (f.g._collapsable ? P = f.cst : P = f.ost, _ = P.length, A = 0; A < _; A += 1)
              M = P[A], f.g._collapsable || M.setAttribute("offset", V[A * 2] + "%"), M.setAttribute("stop-opacity", V[A * 2 + 1]);
          }
          if (S.t === 1)
            (f.e._mdf || b) && (v.setAttribute("x2", c[0]), v.setAttribute("y2", c[1]), m && !f.g._collapsable && (f.of.setAttribute("x2", c[0]), f.of.setAttribute("y2", c[1])));
          else {
            var B;
            if ((f.s._mdf || f.e._mdf || b) && (B = Math.sqrt(Math.pow(x[0] - c[0], 2) + Math.pow(x[1] - c[1], 2)), v.setAttribute("r", B), m && !f.g._collapsable && f.of.setAttribute("r", B)), f.s._mdf || f.e._mdf || f.h._mdf || f.a._mdf || b) {
              B || (B = Math.sqrt(Math.pow(x[0] - c[0], 2) + Math.pow(x[1] - c[1], 2)));
              var R = Math.atan2(c[1] - x[1], c[0] - x[0]), D = f.h.v;
              D >= 1 ? D = 0.99 : D <= -1 && (D = -0.99);
              var N = B * D, I = Math.cos(R + f.a.v) * N + x[0], C = Math.sin(R + f.a.v) * N + x[1];
              v.setAttribute("fx", I), v.setAttribute("fy", C), m && !f.g._collapsable && (f.of.setAttribute("fx", I), f.of.setAttribute("fy", C));
            }
          }
        }
        function u(S, f, b) {
          var v = f.style, m = f.d;
          m && (m._mdf || b) && m.dashStr && (v.pElem.setAttribute("stroke-dasharray", m.dashStr), v.pElem.setAttribute("stroke-dashoffset", m.dashoffset[0])), f.c && (f.c._mdf || b) && v.pElem.setAttribute("stroke", "rgb(" + bmFloor(f.c.v[0]) + "," + bmFloor(f.c.v[1]) + "," + bmFloor(f.c.v[2]) + ")"), (f.o._mdf || b) && v.pElem.setAttribute("stroke-opacity", f.o.v), (f.w._mdf || b) && (v.pElem.setAttribute("stroke-width", f.w.v), v.msElem && v.msElem.setAttribute("stroke-width", f.w.v));
        }
        return r;
      })();
      function SVGShapeElement(e, t, r) {
        this.shapes = [], this.shapesData = e.shapes, this.stylesList = [], this.shapeModifiers = [], this.itemsData = [], this.processedElements = [], this.animatedContents = [], this.initElement(e, t, r), this.prevViewData = [];
      }
      extendPrototype([BaseElement, TransformElement, SVGBaseElement, IShapeElement, HierarchyElement, FrameElement, RenderableDOMElement], SVGShapeElement), SVGShapeElement.prototype.initSecondaryElement = function() {
      }, SVGShapeElement.prototype.identityMatrix = new Matrix(), SVGShapeElement.prototype.buildExpressionInterface = function() {
      }, SVGShapeElement.prototype.createContent = function() {
        this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, this.layerElement, 0, [], !0), this.filterUniqueShapes();
      }, SVGShapeElement.prototype.filterUniqueShapes = function() {
        var e, t = this.shapes.length, r, i, s = this.stylesList.length, n, a = [], l = !1;
        for (i = 0; i < s; i += 1) {
          for (n = this.stylesList[i], l = !1, a.length = 0, e = 0; e < t; e += 1)
            r = this.shapes[e], r.styles.indexOf(n) !== -1 && (a.push(r), l = r._isAnimated || l);
          a.length > 1 && l && this.setShapesAsAnimated(a);
        }
      }, SVGShapeElement.prototype.setShapesAsAnimated = function(e) {
        var t, r = e.length;
        for (t = 0; t < r; t += 1)
          e[t].setAsAnimated();
      }, SVGShapeElement.prototype.createStyleElement = function(e, t) {
        var r, i = new SVGStyleData(e, t), s = i.pElem;
        if (e.ty === "st")
          r = new SVGStrokeStyleData(this, e, i);
        else if (e.ty === "fl")
          r = new SVGFillStyleData(this, e, i);
        else if (e.ty === "gf" || e.ty === "gs") {
          var n = e.ty === "gf" ? SVGGradientFillStyleData : SVGGradientStrokeStyleData;
          r = new n(this, e, i), this.globalData.defs.appendChild(r.gf), r.maskId && (this.globalData.defs.appendChild(r.ms), this.globalData.defs.appendChild(r.of), s.setAttribute("mask", "url(" + getLocationHref() + "#" + r.maskId + ")"));
        } else e.ty === "no" && (r = new SVGNoStyleData(this, e, i));
        return (e.ty === "st" || e.ty === "gs") && (s.setAttribute("stroke-linecap", lineCapEnum[e.lc || 2]), s.setAttribute("stroke-linejoin", lineJoinEnum[e.lj || 2]), s.setAttribute("fill-opacity", "0"), e.lj === 1 && s.setAttribute("stroke-miterlimit", e.ml)), e.r === 2 && s.setAttribute("fill-rule", "evenodd"), e.ln && s.setAttribute("id", e.ln), e.cl && s.setAttribute("class", e.cl), e.bm && (s.style["mix-blend-mode"] = getBlendMode(e.bm)), this.stylesList.push(i), this.addToAnimatedContents(e, r), r;
      }, SVGShapeElement.prototype.createGroupElement = function(e) {
        var t = new ShapeGroupData();
        return e.ln && t.gr.setAttribute("id", e.ln), e.cl && t.gr.setAttribute("class", e.cl), e.bm && (t.gr.style["mix-blend-mode"] = getBlendMode(e.bm)), t;
      }, SVGShapeElement.prototype.createTransformElement = function(e, t) {
        var r = TransformPropertyFactory.getTransformProperty(this, e, this), i = new SVGTransformData(r, r.o, t);
        return this.addToAnimatedContents(e, i), i;
      }, SVGShapeElement.prototype.createShapeElement = function(e, t, r) {
        var i = 4;
        e.ty === "rc" ? i = 5 : e.ty === "el" ? i = 6 : e.ty === "sr" && (i = 7);
        var s = ShapePropertyFactory.getShapeProp(this, e, i, this), n = new SVGShapeData(t, r, s);
        return this.shapes.push(n), this.addShapeToModifiers(n), this.addToAnimatedContents(e, n), n;
      }, SVGShapeElement.prototype.addToAnimatedContents = function(e, t) {
        for (var r = 0, i = this.animatedContents.length; r < i; ) {
          if (this.animatedContents[r].element === t)
            return;
          r += 1;
        }
        this.animatedContents.push({
          fn: SVGElementsRenderer.createRenderFunction(e),
          element: t,
          data: e
        });
      }, SVGShapeElement.prototype.setElementStyles = function(e) {
        var t = e.styles, r, i = this.stylesList.length;
        for (r = 0; r < i; r += 1)
          t.indexOf(this.stylesList[r]) === -1 && !this.stylesList[r].closed && t.push(this.stylesList[r]);
      }, SVGShapeElement.prototype.reloadShapes = function() {
        this._isFirstFrame = !0;
        var e, t = this.itemsData.length;
        for (e = 0; e < t; e += 1)
          this.prevViewData[e] = this.itemsData[e];
        for (this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, this.layerElement, 0, [], !0), this.filterUniqueShapes(), t = this.dynamicProperties.length, e = 0; e < t; e += 1)
          this.dynamicProperties[e].getValue();
        this.renderModifiers();
      }, SVGShapeElement.prototype.searchShapes = function(e, t, r, i, s, n, a) {
        var l = [].concat(n), o, p = e.length - 1, u, S, f = [], b = [], v, m, x;
        for (o = p; o >= 0; o -= 1) {
          if (x = this.searchProcessedElement(e[o]), x ? t[o] = r[x - 1] : e[o]._render = a, e[o].ty === "fl" || e[o].ty === "st" || e[o].ty === "gf" || e[o].ty === "gs" || e[o].ty === "no")
            x ? t[o].style.closed = e[o].hd : t[o] = this.createStyleElement(e[o], s), e[o]._render && t[o].style.pElem.parentNode !== i && i.appendChild(t[o].style.pElem), f.push(t[o].style);
          else if (e[o].ty === "gr") {
            if (!x)
              t[o] = this.createGroupElement(e[o]);
            else
              for (S = t[o].it.length, u = 0; u < S; u += 1)
                t[o].prevViewData[u] = t[o].it[u];
            this.searchShapes(e[o].it, t[o].it, t[o].prevViewData, t[o].gr, s + 1, l, a), e[o]._render && t[o].gr.parentNode !== i && i.appendChild(t[o].gr);
          } else e[o].ty === "tr" ? (x || (t[o] = this.createTransformElement(e[o], i)), v = t[o].transform, l.push(v)) : e[o].ty === "sh" || e[o].ty === "rc" || e[o].ty === "el" || e[o].ty === "sr" ? (x || (t[o] = this.createShapeElement(e[o], l, s)), this.setElementStyles(t[o])) : e[o].ty === "tm" || e[o].ty === "rd" || e[o].ty === "ms" || e[o].ty === "pb" || e[o].ty === "zz" || e[o].ty === "op" ? (x ? (m = t[o], m.closed = !1) : (m = ShapeModifiers.getModifier(e[o].ty), m.init(this, e[o]), t[o] = m, this.shapeModifiers.push(m)), b.push(m)) : e[o].ty === "rp" && (x ? (m = t[o], m.closed = !0) : (m = ShapeModifiers.getModifier(e[o].ty), t[o] = m, m.init(this, e, o, t), this.shapeModifiers.push(m), a = !1), b.push(m));
          this.addProcessedElement(e[o], o + 1);
        }
        for (p = f.length, o = 0; o < p; o += 1)
          f[o].closed = !0;
        for (p = b.length, o = 0; o < p; o += 1)
          b[o].closed = !0;
      }, SVGShapeElement.prototype.renderInnerContent = function() {
        this.renderModifiers();
        var e, t = this.stylesList.length;
        for (e = 0; e < t; e += 1)
          this.stylesList[e].reset();
        for (this.renderShape(), e = 0; e < t; e += 1)
          (this.stylesList[e]._mdf || this._isFirstFrame) && (this.stylesList[e].msElem && (this.stylesList[e].msElem.setAttribute("d", this.stylesList[e].d), this.stylesList[e].d = "M0 0" + this.stylesList[e].d), this.stylesList[e].pElem.setAttribute("d", this.stylesList[e].d || "M0 0"));
      }, SVGShapeElement.prototype.renderShape = function() {
        var e, t = this.animatedContents.length, r;
        for (e = 0; e < t; e += 1)
          r = this.animatedContents[e], (this._isFirstFrame || r.element._isAnimated) && r.data !== !0 && r.fn(r.data, r.element, this._isFirstFrame);
      }, SVGShapeElement.prototype.destroy = function() {
        this.destroyBaseElement(), this.shapesData = null, this.itemsData = null;
      };
      function LetterProps(e, t, r, i, s, n) {
        this.o = e, this.sw = t, this.sc = r, this.fc = i, this.m = s, this.p = n, this._mdf = {
          o: !0,
          sw: !!t,
          sc: !!r,
          fc: !!i,
          m: !0,
          p: !0
        };
      }
      LetterProps.prototype.update = function(e, t, r, i, s, n) {
        this._mdf.o = !1, this._mdf.sw = !1, this._mdf.sc = !1, this._mdf.fc = !1, this._mdf.m = !1, this._mdf.p = !1;
        var a = !1;
        return this.o !== e && (this.o = e, this._mdf.o = !0, a = !0), this.sw !== t && (this.sw = t, this._mdf.sw = !0, a = !0), this.sc !== r && (this.sc = r, this._mdf.sc = !0, a = !0), this.fc !== i && (this.fc = i, this._mdf.fc = !0, a = !0), this.m !== s && (this.m = s, this._mdf.m = !0, a = !0), n.length && (this.p[0] !== n[0] || this.p[1] !== n[1] || this.p[4] !== n[4] || this.p[5] !== n[5] || this.p[12] !== n[12] || this.p[13] !== n[13]) && (this.p = n, this._mdf.p = !0, a = !0), a;
      };
      function TextProperty(e, t) {
        this._frameId = initialDefaultFrame, this.pv = "", this.v = "", this.kf = !1, this._isFirstFrame = !0, this._mdf = !1, t.d && t.d.sid && (t.d = e.globalData.slotManager.getProp(t.d)), this.data = t, this.elem = e, this.comp = this.elem.comp, this.keysIndex = 0, this.canResize = !1, this.minimumFontSize = 1, this.effectsSequence = [], this.currentData = {
          ascent: 0,
          boxWidth: this.defaultBoxWidth,
          f: "",
          fStyle: "",
          fWeight: "",
          fc: "",
          j: "",
          justifyOffset: "",
          l: [],
          lh: 0,
          lineWidths: [],
          ls: "",
          of: "",
          s: "",
          sc: "",
          sw: 0,
          t: 0,
          tr: 0,
          sz: 0,
          ps: null,
          fillColorAnim: !1,
          strokeColorAnim: !1,
          strokeWidthAnim: !1,
          yOffset: 0,
          finalSize: 0,
          finalText: [],
          finalLineHeight: 0,
          __complete: !1
        }, this.copyData(this.currentData, this.data.d.k[0].s), this.searchProperty() || this.completeTextData(this.currentData);
      }
      TextProperty.prototype.defaultBoxWidth = [0, 0], TextProperty.prototype.copyData = function(e, t) {
        for (var r in t)
          Object.prototype.hasOwnProperty.call(t, r) && (e[r] = t[r]);
        return e;
      }, TextProperty.prototype.setCurrentData = function(e) {
        e.__complete || this.completeTextData(e), this.currentData = e, this.currentData.boxWidth = this.currentData.boxWidth || this.defaultBoxWidth, this._mdf = !0;
      }, TextProperty.prototype.searchProperty = function() {
        return this.searchKeyframes();
      }, TextProperty.prototype.searchKeyframes = function() {
        return this.kf = this.data.d.k.length > 1, this.kf && this.addEffect(this.getKeyframeValue.bind(this)), this.kf;
      }, TextProperty.prototype.addEffect = function(e) {
        this.effectsSequence.push(e), this.elem.addDynamicProperty(this);
      }, TextProperty.prototype.getValue = function(e) {
        if (!((this.elem.globalData.frameId === this.frameId || !this.effectsSequence.length) && !e)) {
          this.currentData.t = this.data.d.k[this.keysIndex].s.t;
          var t = this.currentData, r = this.keysIndex;
          if (this.lock) {
            this.setCurrentData(this.currentData);
            return;
          }
          this.lock = !0, this._mdf = !1;
          var i, s = this.effectsSequence.length, n = e || this.data.d.k[this.keysIndex].s;
          for (i = 0; i < s; i += 1)
            r !== this.keysIndex ? n = this.effectsSequence[i](n, n.t) : n = this.effectsSequence[i](this.currentData, n.t);
          t !== n && this.setCurrentData(n), this.v = this.currentData, this.pv = this.v, this.lock = !1, this.frameId = this.elem.globalData.frameId;
        }
      }, TextProperty.prototype.getKeyframeValue = function() {
        for (var e = this.data.d.k, t = this.elem.comp.renderedFrame, r = 0, i = e.length; r <= i - 1 && !(r === i - 1 || e[r + 1].t > t); )
          r += 1;
        return this.keysIndex !== r && (this.keysIndex = r), this.data.d.k[this.keysIndex].s;
      }, TextProperty.prototype.buildFinalText = function(e) {
        for (var t = [], r = 0, i = e.length, s, n, a = !1, l = !1, o = ""; r < i; )
          a = l, l = !1, s = e.charCodeAt(r), o = e.charAt(r), FontManager.isCombinedCharacter(s) ? a = !0 : s >= 55296 && s <= 56319 ? FontManager.isRegionalFlag(e, r) ? o = e.substr(r, 14) : (n = e.charCodeAt(r + 1), n >= 56320 && n <= 57343 && (FontManager.isModifier(s, n) ? (o = e.substr(r, 2), a = !0) : FontManager.isFlagEmoji(e.substr(r, 4)) ? o = e.substr(r, 4) : o = e.substr(r, 2))) : s > 56319 ? (n = e.charCodeAt(r + 1), FontManager.isVariationSelector(s) && (a = !0)) : FontManager.isZeroWidthJoiner(s) && (a = !0, l = !0), a ? (t[t.length - 1] += o, a = !1) : t.push(o), r += o.length;
        return t;
      }, TextProperty.prototype.completeTextData = function(e) {
        e.__complete = !0;
        var t = this.elem.globalData.fontManager, r = this.data, i = [], s, n, a, l = 0, o, p = r.m.g, u = 0, S = 0, f = 0, b = [], v = 0, m = 0, x, c, d = t.getFontByName(e.f), h, y = 0, P = getFontProperties(d);
        e.fWeight = P.weight, e.fStyle = P.style, e.finalSize = e.s, e.finalText = this.buildFinalText(e.t), n = e.finalText.length, e.finalLineHeight = e.lh;
        var A = e.tr / 1e3 * e.finalSize, _;
        if (e.sz)
          for (var M = !0, w = e.sz[0], V = e.sz[1], B, R; M; ) {
            R = this.buildFinalText(e.t), B = 0, v = 0, n = R.length, A = e.tr / 1e3 * e.finalSize;
            var D = -1;
            for (s = 0; s < n; s += 1)
              _ = R[s].charCodeAt(0), a = !1, R[s] === " " ? D = s : (_ === 13 || _ === 3) && (v = 0, a = !0, B += e.finalLineHeight || e.finalSize * 1.2), t.chars ? (h = t.getCharData(R[s], d.fStyle, d.fFamily), y = a ? 0 : h.w * e.finalSize / 100) : y = t.measureText(R[s], e.f, e.finalSize), v + y > w && R[s] !== " " ? (D === -1 ? n += 1 : s = D, B += e.finalLineHeight || e.finalSize * 1.2, R.splice(s, D === s ? 1 : 0, "\r"), D = -1, v = 0) : (v += y, v += A);
            B += d.ascent * e.finalSize / 100, this.canResize && e.finalSize > this.minimumFontSize && V < B ? (e.finalSize -= 1, e.finalLineHeight = e.finalSize * e.lh / e.s) : (e.finalText = R, n = e.finalText.length, M = !1);
          }
        v = -A, y = 0;
        var N = 0, I;
        for (s = 0; s < n; s += 1)
          if (a = !1, I = e.finalText[s], _ = I.charCodeAt(0), _ === 13 || _ === 3 ? (N = 0, b.push(v), m = v > m ? v : m, v = -2 * A, o = "", a = !0, f += 1) : o = I, t.chars ? (h = t.getCharData(I, d.fStyle, t.getFontByName(e.f).fFamily), y = a ? 0 : h.w * e.finalSize / 100) : y = t.measureText(o, e.f, e.finalSize), I === " " ? N += y + A : (v += y + A + N, N = 0), i.push({
            l: y,
            an: y,
            add: u,
            n: a,
            anIndexes: [],
            val: o,
            line: f,
            animatorJustifyOffset: 0
          }), p == 2) {
            if (u += y, o === "" || o === " " || s === n - 1) {
              for ((o === "" || o === " ") && (u -= y); S <= s; )
                i[S].an = u, i[S].ind = l, i[S].extra = y, S += 1;
              l += 1, u = 0;
            }
          } else if (p == 3) {
            if (u += y, o === "" || s === n - 1) {
              for (o === "" && (u -= y); S <= s; )
                i[S].an = u, i[S].ind = l, i[S].extra = y, S += 1;
              u = 0, l += 1;
            }
          } else
            i[l].ind = l, i[l].extra = 0, l += 1;
        if (e.l = i, m = v > m ? v : m, b.push(v), e.sz)
          e.boxWidth = e.sz[0], e.justifyOffset = 0;
        else
          switch (e.boxWidth = m, e.j) {
            case 1:
              e.justifyOffset = -e.boxWidth;
              break;
            case 2:
              e.justifyOffset = -e.boxWidth / 2;
              break;
            default:
              e.justifyOffset = 0;
          }
        e.lineWidths = b;
        var C = r.a, T, g;
        c = C.length;
        var E, F, k = [];
        for (x = 0; x < c; x += 1) {
          for (T = C[x], T.a.sc && (e.strokeColorAnim = !0), T.a.sw && (e.strokeWidthAnim = !0), (T.a.fc || T.a.fh || T.a.fs || T.a.fb) && (e.fillColorAnim = !0), F = 0, E = T.s.b, s = 0; s < n; s += 1)
            g = i[s], g.anIndexes[x] = F, (E == 1 && g.val !== "" || E == 2 && g.val !== "" && g.val !== " " || E == 3 && (g.n || g.val == " " || s == n - 1) || E == 4 && (g.n || s == n - 1)) && (T.s.rn === 1 && k.push(F), F += 1);
          r.a[x].s.totalChars = F;
          var L = -1, O;
          if (T.s.rn === 1)
            for (s = 0; s < n; s += 1)
              g = i[s], L != g.anIndexes[x] && (L = g.anIndexes[x], O = k.splice(Math.floor(Math.random() * k.length), 1)[0]), g.anIndexes[x] = O;
        }
        e.yOffset = e.finalLineHeight || e.finalSize * 1.2, e.ls = e.ls || 0, e.ascent = d.ascent * e.finalSize / 100;
      }, TextProperty.prototype.updateDocumentData = function(e, t) {
        t = t === void 0 ? this.keysIndex : t;
        var r = this.copyData({}, this.data.d.k[t].s);
        r = this.copyData(r, e), this.data.d.k[t].s = r, this.recalculate(t), this.setCurrentData(r), this.elem.addDynamicProperty(this);
      }, TextProperty.prototype.recalculate = function(e) {
        var t = this.data.d.k[e].s;
        t.__complete = !1, this.keysIndex = 0, this._isFirstFrame = !0, this.getValue(t);
      }, TextProperty.prototype.canResizeFont = function(e) {
        this.canResize = e, this.recalculate(this.keysIndex), this.elem.addDynamicProperty(this);
      }, TextProperty.prototype.setMinimumFontSize = function(e) {
        this.minimumFontSize = Math.floor(e) || 1, this.recalculate(this.keysIndex), this.elem.addDynamicProperty(this);
      };
      var TextSelectorProp = (function() {
        var e = Math.max, t = Math.min, r = Math.floor;
        function i(n, a) {
          this._currentTextLength = -1, this.k = !1, this.data = a, this.elem = n, this.comp = n.comp, this.finalS = 0, this.finalE = 0, this.initDynamicPropertyContainer(n), this.s = PropertyFactory.getProp(n, a.s || {
            k: 0
          }, 0, 0, this), "e" in a ? this.e = PropertyFactory.getProp(n, a.e, 0, 0, this) : this.e = {
            v: 100
          }, this.o = PropertyFactory.getProp(n, a.o || {
            k: 0
          }, 0, 0, this), this.xe = PropertyFactory.getProp(n, a.xe || {
            k: 0
          }, 0, 0, this), this.ne = PropertyFactory.getProp(n, a.ne || {
            k: 0
          }, 0, 0, this), this.sm = PropertyFactory.getProp(n, a.sm || {
            k: 100
          }, 0, 0, this), this.a = PropertyFactory.getProp(n, a.a, 0, 0.01, this), this.dynamicProperties.length || this.getValue();
        }
        i.prototype = {
          getMult: function(a) {
            this._currentTextLength !== this.elem.textProperty.currentData.l.length && this.getValue();
            var l = 0, o = 0, p = 1, u = 1;
            this.ne.v > 0 ? l = this.ne.v / 100 : o = -this.ne.v / 100, this.xe.v > 0 ? p = 1 - this.xe.v / 100 : u = 1 + this.xe.v / 100;
            var S = BezierFactory.getBezierEasing(l, o, p, u).get, f = 0, b = this.finalS, v = this.finalE, m = this.data.sh;
            if (m === 2)
              v === b ? f = a >= v ? 1 : 0 : f = e(0, t(0.5 / (v - b) + (a - b) / (v - b), 1)), f = S(f);
            else if (m === 3)
              v === b ? f = a >= v ? 0 : 1 : f = 1 - e(0, t(0.5 / (v - b) + (a - b) / (v - b), 1)), f = S(f);
            else if (m === 4)
              v === b ? f = 0 : (f = e(0, t(0.5 / (v - b) + (a - b) / (v - b), 1)), f < 0.5 ? f *= 2 : f = 1 - 2 * (f - 0.5)), f = S(f);
            else if (m === 5) {
              if (v === b)
                f = 0;
              else {
                var x = v - b;
                a = t(e(0, a + 0.5 - b), v - b);
                var c = -x / 2 + a, d = x / 2;
                f = Math.sqrt(1 - c * c / (d * d));
              }
              f = S(f);
            } else m === 6 ? (v === b ? f = 0 : (a = t(e(0, a + 0.5 - b), v - b), f = (1 + Math.cos(Math.PI + Math.PI * 2 * a / (v - b))) / 2), f = S(f)) : (a >= r(b) && (a - b < 0 ? f = e(0, t(t(v, 1) - (b - a), 1)) : f = e(0, t(v - a, 1))), f = S(f));
            if (this.sm.v !== 100) {
              var h = this.sm.v * 0.01;
              h === 0 && (h = 1e-8);
              var y = 0.5 - h * 0.5;
              f < y ? f = 0 : (f = (f - y) / h, f > 1 && (f = 1));
            }
            return f * this.a.v;
          },
          getValue: function(a) {
            this.iterateDynamicProperties(), this._mdf = a || this._mdf, this._currentTextLength = this.elem.textProperty.currentData.l.length || 0, a && this.data.r === 2 && (this.e.v = this._currentTextLength);
            var l = this.data.r === 2 ? 1 : 100 / this.data.totalChars, o = this.o.v / l, p = this.s.v / l + o, u = this.e.v / l + o;
            if (p > u) {
              var S = p;
              p = u, u = S;
            }
            this.finalS = p, this.finalE = u;
          }
        }, extendPrototype([DynamicPropertyContainer], i);
        function s(n, a, l) {
          return new i(n, a);
        }
        return {
          getTextSelectorProp: s
        };
      })();
      function TextAnimatorDataProperty(e, t, r) {
        var i = {
          propType: !1
        }, s = PropertyFactory.getProp, n = t.a;
        this.a = {
          r: n.r ? s(e, n.r, 0, degToRads, r) : i,
          rx: n.rx ? s(e, n.rx, 0, degToRads, r) : i,
          ry: n.ry ? s(e, n.ry, 0, degToRads, r) : i,
          sk: n.sk ? s(e, n.sk, 0, degToRads, r) : i,
          sa: n.sa ? s(e, n.sa, 0, degToRads, r) : i,
          s: n.s ? s(e, n.s, 1, 0.01, r) : i,
          a: n.a ? s(e, n.a, 1, 0, r) : i,
          o: n.o ? s(e, n.o, 0, 0.01, r) : i,
          p: n.p ? s(e, n.p, 1, 0, r) : i,
          sw: n.sw ? s(e, n.sw, 0, 0, r) : i,
          sc: n.sc ? s(e, n.sc, 1, 0, r) : i,
          fc: n.fc ? s(e, n.fc, 1, 0, r) : i,
          fh: n.fh ? s(e, n.fh, 0, 0, r) : i,
          fs: n.fs ? s(e, n.fs, 0, 0.01, r) : i,
          fb: n.fb ? s(e, n.fb, 0, 0.01, r) : i,
          t: n.t ? s(e, n.t, 0, 0, r) : i
        }, this.s = TextSelectorProp.getTextSelectorProp(e, t.s, r), this.s.t = t.s.t;
      }
      function TextAnimatorProperty(e, t, r) {
        this._isFirstFrame = !0, this._hasMaskedPath = !1, this._frameId = -1, this._textData = e, this._renderType = t, this._elem = r, this._animatorsData = createSizedArray(this._textData.a.length), this._pathData = {}, this._moreOptions = {
          alignment: {}
        }, this.renderedLetters = [], this.lettersChangedFlag = !1, this.initDynamicPropertyContainer(r);
      }
      TextAnimatorProperty.prototype.searchProperties = function() {
        var e, t = this._textData.a.length, r, i = PropertyFactory.getProp;
        for (e = 0; e < t; e += 1)
          r = this._textData.a[e], this._animatorsData[e] = new TextAnimatorDataProperty(this._elem, r, this);
        this._textData.p && "m" in this._textData.p ? (this._pathData = {
          a: i(this._elem, this._textData.p.a, 0, 0, this),
          f: i(this._elem, this._textData.p.f, 0, 0, this),
          l: i(this._elem, this._textData.p.l, 0, 0, this),
          r: i(this._elem, this._textData.p.r, 0, 0, this),
          p: i(this._elem, this._textData.p.p, 0, 0, this),
          m: this._elem.maskManager.getMaskProperty(this._textData.p.m)
        }, this._hasMaskedPath = !0) : this._hasMaskedPath = !1, this._moreOptions.alignment = i(this._elem, this._textData.m.a, 1, 0, this);
      }, TextAnimatorProperty.prototype.getMeasures = function(e, t) {
        if (this.lettersChangedFlag = t, !(!this._mdf && !this._isFirstFrame && !t && (!this._hasMaskedPath || !this._pathData.m._mdf))) {
          this._isFirstFrame = !1;
          var r = this._moreOptions.alignment.v, i = this._animatorsData, s = this._textData, n = this.mHelper, a = this._renderType, l = this.renderedLetters.length, o, p, u, S, f = e.l, b, v, m, x, c, d, h, y, P, A, _, M, w, V, B;
          if (this._hasMaskedPath) {
            if (B = this._pathData.m, !this._pathData.n || this._pathData._mdf) {
              var R = B.v;
              this._pathData.r.v && (R = R.reverse()), b = {
                tLength: 0,
                segments: []
              }, S = R._length - 1;
              var D;
              for (M = 0, u = 0; u < S; u += 1)
                D = bez.buildBezierData(R.v[u], R.v[u + 1], [R.o[u][0] - R.v[u][0], R.o[u][1] - R.v[u][1]], [R.i[u + 1][0] - R.v[u + 1][0], R.i[u + 1][1] - R.v[u + 1][1]]), b.tLength += D.segmentLength, b.segments.push(D), M += D.segmentLength;
              u = S, B.v.c && (D = bez.buildBezierData(R.v[u], R.v[0], [R.o[u][0] - R.v[u][0], R.o[u][1] - R.v[u][1]], [R.i[0][0] - R.v[0][0], R.i[0][1] - R.v[0][1]]), b.tLength += D.segmentLength, b.segments.push(D), M += D.segmentLength), this._pathData.pi = b;
            }
            if (b = this._pathData.pi, v = this._pathData.f.v, h = 0, d = 1, x = 0, c = !0, A = b.segments, v < 0 && B.v.c)
              for (b.tLength < Math.abs(v) && (v = -Math.abs(v) % b.tLength), h = A.length - 1, P = A[h].points, d = P.length - 1; v < 0; )
                v += P[d].partialLength, d -= 1, d < 0 && (h -= 1, P = A[h].points, d = P.length - 1);
            P = A[h].points, y = P[d - 1], m = P[d], _ = m.partialLength;
          }
          S = f.length, o = 0, p = 0;
          var N = e.finalSize * 1.2 * 0.714, I = !0, C, T, g, E, F;
          E = i.length;
          var k, L = -1, O, G, W, q = v, Y = h, ee = d, te = -1, j, $, K, U, H, se, le, ne, re = "", ie = this.defaultPropsArray, J;
          if (e.j === 2 || e.j === 1) {
            var z = 0, Z = 0, X = e.j === 2 ? -0.5 : -1, Q = 0, ae = !0;
            for (u = 0; u < S; u += 1)
              if (f[u].n) {
                for (z && (z += Z); Q < u; )
                  f[Q].animatorJustifyOffset = z, Q += 1;
                z = 0, ae = !0;
              } else {
                for (g = 0; g < E; g += 1)
                  C = i[g].a, C.t.propType && (ae && e.j === 2 && (Z += C.t.v * X), T = i[g].s, k = T.getMult(f[u].anIndexes[g], s.a[g].s.totalChars), k.length ? z += C.t.v * k[0] * X : z += C.t.v * k * X);
                ae = !1;
              }
            for (z && (z += Z); Q < u; )
              f[Q].animatorJustifyOffset = z, Q += 1;
          }
          for (u = 0; u < S; u += 1) {
            if (n.reset(), j = 1, f[u].n)
              o = 0, p += e.yOffset, p += I ? 1 : 0, v = q, I = !1, this._hasMaskedPath && (h = Y, d = ee, P = A[h].points, y = P[d - 1], m = P[d], _ = m.partialLength, x = 0), re = "", ne = "", se = "", J = "", ie = this.defaultPropsArray;
            else {
              if (this._hasMaskedPath) {
                if (te !== f[u].line) {
                  switch (e.j) {
                    case 1:
                      v += M - e.lineWidths[f[u].line];
                      break;
                    case 2:
                      v += (M - e.lineWidths[f[u].line]) / 2;
                      break;
                  }
                  te = f[u].line;
                }
                L !== f[u].ind && (f[L] && (v += f[L].extra), v += f[u].an / 2, L = f[u].ind), v += r[0] * f[u].an * 5e-3;
                var oe = 0;
                for (g = 0; g < E; g += 1)
                  C = i[g].a, C.p.propType && (T = i[g].s, k = T.getMult(f[u].anIndexes[g], s.a[g].s.totalChars), k.length ? oe += C.p.v[0] * k[0] : oe += C.p.v[0] * k), C.a.propType && (T = i[g].s, k = T.getMult(f[u].anIndexes[g], s.a[g].s.totalChars), k.length ? oe += C.a.v[0] * k[0] : oe += C.a.v[0] * k);
                for (c = !0, this._pathData.a.v && (v = f[0].an * 0.5 + (M - this._pathData.f.v - f[0].an * 0.5 - f[f.length - 1].an * 0.5) * L / (S - 1), v += this._pathData.f.v); c; )
                  x + _ >= v + oe || !P ? (w = (v + oe - x) / m.partialLength, G = y.point[0] + (m.point[0] - y.point[0]) * w, W = y.point[1] + (m.point[1] - y.point[1]) * w, n.translate(-r[0] * f[u].an * 5e-3, -(r[1] * N) * 0.01), c = !1) : P && (x += m.partialLength, d += 1, d >= P.length && (d = 0, h += 1, A[h] ? P = A[h].points : B.v.c ? (d = 0, h = 0, P = A[h].points) : (x -= m.partialLength, P = null)), P && (y = m, m = P[d], _ = m.partialLength));
                O = f[u].an / 2 - f[u].add, n.translate(-O, 0, 0);
              } else
                O = f[u].an / 2 - f[u].add, n.translate(-O, 0, 0), n.translate(-r[0] * f[u].an * 5e-3, -r[1] * N * 0.01, 0);
              for (g = 0; g < E; g += 1)
                C = i[g].a, C.t.propType && (T = i[g].s, k = T.getMult(f[u].anIndexes[g], s.a[g].s.totalChars), (o !== 0 || e.j !== 0) && (this._hasMaskedPath ? k.length ? v += C.t.v * k[0] : v += C.t.v * k : k.length ? o += C.t.v * k[0] : o += C.t.v * k));
              for (e.strokeWidthAnim && (K = e.sw || 0), e.strokeColorAnim && (e.sc ? $ = [e.sc[0], e.sc[1], e.sc[2]] : $ = [0, 0, 0]), e.fillColorAnim && e.fc && (U = [e.fc[0], e.fc[1], e.fc[2]]), g = 0; g < E; g += 1)
                C = i[g].a, C.a.propType && (T = i[g].s, k = T.getMult(f[u].anIndexes[g], s.a[g].s.totalChars), k.length ? n.translate(-C.a.v[0] * k[0], -C.a.v[1] * k[1], C.a.v[2] * k[2]) : n.translate(-C.a.v[0] * k, -C.a.v[1] * k, C.a.v[2] * k));
              for (g = 0; g < E; g += 1)
                C = i[g].a, C.s.propType && (T = i[g].s, k = T.getMult(f[u].anIndexes[g], s.a[g].s.totalChars), k.length ? n.scale(1 + (C.s.v[0] - 1) * k[0], 1 + (C.s.v[1] - 1) * k[1], 1) : n.scale(1 + (C.s.v[0] - 1) * k, 1 + (C.s.v[1] - 1) * k, 1));
              for (g = 0; g < E; g += 1) {
                if (C = i[g].a, T = i[g].s, k = T.getMult(f[u].anIndexes[g], s.a[g].s.totalChars), C.sk.propType && (k.length ? n.skewFromAxis(-C.sk.v * k[0], C.sa.v * k[1]) : n.skewFromAxis(-C.sk.v * k, C.sa.v * k)), C.r.propType && (k.length ? n.rotateZ(-C.r.v * k[2]) : n.rotateZ(-C.r.v * k)), C.ry.propType && (k.length ? n.rotateY(C.ry.v * k[1]) : n.rotateY(C.ry.v * k)), C.rx.propType && (k.length ? n.rotateX(C.rx.v * k[0]) : n.rotateX(C.rx.v * k)), C.o.propType && (k.length ? j += (C.o.v * k[0] - j) * k[0] : j += (C.o.v * k - j) * k), e.strokeWidthAnim && C.sw.propType && (k.length ? K += C.sw.v * k[0] : K += C.sw.v * k), e.strokeColorAnim && C.sc.propType)
                  for (H = 0; H < 3; H += 1)
                    k.length ? $[H] += (C.sc.v[H] - $[H]) * k[0] : $[H] += (C.sc.v[H] - $[H]) * k;
                if (e.fillColorAnim && e.fc) {
                  if (C.fc.propType)
                    for (H = 0; H < 3; H += 1)
                      k.length ? U[H] += (C.fc.v[H] - U[H]) * k[0] : U[H] += (C.fc.v[H] - U[H]) * k;
                  C.fh.propType && (k.length ? U = addHueToRGB(U, C.fh.v * k[0]) : U = addHueToRGB(U, C.fh.v * k)), C.fs.propType && (k.length ? U = addSaturationToRGB(U, C.fs.v * k[0]) : U = addSaturationToRGB(U, C.fs.v * k)), C.fb.propType && (k.length ? U = addBrightnessToRGB(U, C.fb.v * k[0]) : U = addBrightnessToRGB(U, C.fb.v * k));
                }
              }
              for (g = 0; g < E; g += 1)
                C = i[g].a, C.p.propType && (T = i[g].s, k = T.getMult(f[u].anIndexes[g], s.a[g].s.totalChars), this._hasMaskedPath ? k.length ? n.translate(0, C.p.v[1] * k[0], -C.p.v[2] * k[1]) : n.translate(0, C.p.v[1] * k, -C.p.v[2] * k) : k.length ? n.translate(C.p.v[0] * k[0], C.p.v[1] * k[1], -C.p.v[2] * k[2]) : n.translate(C.p.v[0] * k, C.p.v[1] * k, -C.p.v[2] * k));
              if (e.strokeWidthAnim && (se = K < 0 ? 0 : K), e.strokeColorAnim && (le = "rgb(" + Math.round($[0] * 255) + "," + Math.round($[1] * 255) + "," + Math.round($[2] * 255) + ")"), e.fillColorAnim && e.fc && (ne = "rgb(" + Math.round(U[0] * 255) + "," + Math.round(U[1] * 255) + "," + Math.round(U[2] * 255) + ")"), this._hasMaskedPath) {
                if (n.translate(0, -e.ls), n.translate(0, r[1] * N * 0.01 + p, 0), this._pathData.p.v) {
                  V = (m.point[1] - y.point[1]) / (m.point[0] - y.point[0]);
                  var he = Math.atan(V) * 180 / Math.PI;
                  m.point[0] < y.point[0] && (he += 180), n.rotate(-he * Math.PI / 180);
                }
                n.translate(G, W, 0), v -= r[0] * f[u].an * 5e-3, f[u + 1] && L !== f[u + 1].ind && (v += f[u].an / 2, v += e.tr * 1e-3 * e.finalSize);
              } else {
                switch (n.translate(o, p, 0), e.ps && n.translate(e.ps[0], e.ps[1] + e.ascent, 0), e.j) {
                  case 1:
                    n.translate(f[u].animatorJustifyOffset + e.justifyOffset + (e.boxWidth - e.lineWidths[f[u].line]), 0, 0);
                    break;
                  case 2:
                    n.translate(f[u].animatorJustifyOffset + e.justifyOffset + (e.boxWidth - e.lineWidths[f[u].line]) / 2, 0, 0);
                    break;
                }
                n.translate(0, -e.ls), n.translate(O, 0, 0), n.translate(r[0] * f[u].an * 5e-3, r[1] * N * 0.01, 0), o += f[u].l + e.tr * 1e-3 * e.finalSize;
              }
              a === "html" ? re = n.toCSS() : a === "svg" ? re = n.to2dCSS() : ie = [n.props[0], n.props[1], n.props[2], n.props[3], n.props[4], n.props[5], n.props[6], n.props[7], n.props[8], n.props[9], n.props[10], n.props[11], n.props[12], n.props[13], n.props[14], n.props[15]], J = j;
            }
            l <= u ? (F = new LetterProps(J, se, le, ne, re, ie), this.renderedLetters.push(F), l += 1, this.lettersChangedFlag = !0) : (F = this.renderedLetters[u], this.lettersChangedFlag = F.update(J, se, le, ne, re, ie) || this.lettersChangedFlag);
          }
        }
      }, TextAnimatorProperty.prototype.getValue = function() {
        this._elem.globalData.frameId !== this._frameId && (this._frameId = this._elem.globalData.frameId, this.iterateDynamicProperties());
      }, TextAnimatorProperty.prototype.mHelper = new Matrix(), TextAnimatorProperty.prototype.defaultPropsArray = [], extendPrototype([DynamicPropertyContainer], TextAnimatorProperty);
      function ITextElement() {
      }
      ITextElement.prototype.initElement = function(e, t, r) {
        this.lettersChangedFlag = !0, this.initFrame(), this.initBaseData(e, t, r), this.textProperty = new TextProperty(this, e.t, this.dynamicProperties), this.textAnimator = new TextAnimatorProperty(e.t, this.renderType, this), this.initTransform(e, t, r), this.initHierarchy(), this.initRenderable(), this.initRendererElement(), this.createContainerElements(), this.createRenderableComponents(), this.createContent(), this.hide(), this.textAnimator.searchProperties(this.dynamicProperties);
      }, ITextElement.prototype.prepareFrame = function(e) {
        this._mdf = !1, this.prepareRenderableFrame(e), this.prepareProperties(e, this.isInRange);
      }, ITextElement.prototype.createPathShape = function(e, t) {
        var r, i = t.length, s, n = "";
        for (r = 0; r < i; r += 1)
          t[r].ty === "sh" && (s = t[r].ks.k, n += buildShapeString(s, s.i.length, !0, e));
        return n;
      }, ITextElement.prototype.updateDocumentData = function(e, t) {
        this.textProperty.updateDocumentData(e, t);
      }, ITextElement.prototype.canResizeFont = function(e) {
        this.textProperty.canResizeFont(e);
      }, ITextElement.prototype.setMinimumFontSize = function(e) {
        this.textProperty.setMinimumFontSize(e);
      }, ITextElement.prototype.applyTextPropertiesToMatrix = function(e, t, r, i, s) {
        switch (e.ps && t.translate(e.ps[0], e.ps[1] + e.ascent, 0), t.translate(0, -e.ls, 0), e.j) {
          case 1:
            t.translate(e.justifyOffset + (e.boxWidth - e.lineWidths[r]), 0, 0);
            break;
          case 2:
            t.translate(e.justifyOffset + (e.boxWidth - e.lineWidths[r]) / 2, 0, 0);
            break;
        }
        t.translate(i, s, 0);
      }, ITextElement.prototype.buildColor = function(e) {
        return "rgb(" + Math.round(e[0] * 255) + "," + Math.round(e[1] * 255) + "," + Math.round(e[2] * 255) + ")";
      }, ITextElement.prototype.emptyProp = new LetterProps(), ITextElement.prototype.destroy = function() {
      }, ITextElement.prototype.validateText = function() {
        (this.textProperty._mdf || this.textProperty._isFirstFrame) && (this.buildNewText(), this.textProperty._isFirstFrame = !1, this.textProperty._mdf = !1);
      };
      var emptyShapeData = {
        shapes: []
      };
      function SVGTextLottieElement(e, t, r) {
        this.textSpans = [], this.renderType = "svg", this.initElement(e, t, r);
      }
      extendPrototype([BaseElement, TransformElement, SVGBaseElement, HierarchyElement, FrameElement, RenderableDOMElement, ITextElement], SVGTextLottieElement), SVGTextLottieElement.prototype.createContent = function() {
        this.data.singleShape && !this.globalData.fontManager.chars && (this.textContainer = createNS("text"));
      }, SVGTextLottieElement.prototype.buildTextContents = function(e) {
        for (var t = 0, r = e.length, i = [], s = ""; t < r; )
          e[t] === "\r" || e[t] === "" ? (i.push(s), s = "") : s += e[t], t += 1;
        return i.push(s), i;
      }, SVGTextLottieElement.prototype.buildShapeData = function(e, t) {
        if (e.shapes && e.shapes.length) {
          var r = e.shapes[0];
          if (r.it) {
            var i = r.it[r.it.length - 1];
            i.s && (i.s.k[0] = t, i.s.k[1] = t);
          }
        }
        return e;
      }, SVGTextLottieElement.prototype.buildNewText = function() {
        this.addDynamicProperty(this);
        var e, t, r = this.textProperty.currentData;
        this.renderedLetters = createSizedArray(r ? r.l.length : 0), r.fc ? this.layerElement.setAttribute("fill", this.buildColor(r.fc)) : this.layerElement.setAttribute("fill", "rgba(0,0,0,0)"), r.sc && (this.layerElement.setAttribute("stroke", this.buildColor(r.sc)), this.layerElement.setAttribute("stroke-width", r.sw)), this.layerElement.setAttribute("font-size", r.finalSize);
        var i = this.globalData.fontManager.getFontByName(r.f);
        if (i.fClass)
          this.layerElement.setAttribute("class", i.fClass);
        else {
          this.layerElement.setAttribute("font-family", i.fFamily);
          var s = r.fWeight, n = r.fStyle;
          this.layerElement.setAttribute("font-style", n), this.layerElement.setAttribute("font-weight", s);
        }
        this.layerElement.setAttribute("aria-label", r.t);
        var a = r.l || [], l = !!this.globalData.fontManager.chars;
        t = a.length;
        var o, p = this.mHelper, u = "", S = this.data.singleShape, f = 0, b = 0, v = !0, m = r.tr * 1e-3 * r.finalSize;
        if (S && !l && !r.sz) {
          var x = this.textContainer, c = "start";
          switch (r.j) {
            case 1:
              c = "end";
              break;
            case 2:
              c = "middle";
              break;
            default:
              c = "start";
              break;
          }
          x.setAttribute("text-anchor", c), x.setAttribute("letter-spacing", m);
          var d = this.buildTextContents(r.finalText);
          for (t = d.length, b = r.ps ? r.ps[1] + r.ascent : 0, e = 0; e < t; e += 1)
            o = this.textSpans[e].span || createNS("tspan"), o.textContent = d[e], o.setAttribute("x", 0), o.setAttribute("y", b), o.style.display = "inherit", x.appendChild(o), this.textSpans[e] || (this.textSpans[e] = {
              span: null,
              glyph: null
            }), this.textSpans[e].span = o, b += r.finalLineHeight;
          this.layerElement.appendChild(x);
        } else {
          var h = this.textSpans.length, y;
          for (e = 0; e < t; e += 1) {
            if (this.textSpans[e] || (this.textSpans[e] = {
              span: null,
              childSpan: null,
              glyph: null
            }), !l || !S || e === 0) {
              if (o = h > e ? this.textSpans[e].span : createNS(l ? "g" : "text"), h <= e) {
                if (o.setAttribute("stroke-linecap", "butt"), o.setAttribute("stroke-linejoin", "round"), o.setAttribute("stroke-miterlimit", "4"), this.textSpans[e].span = o, l) {
                  var P = createNS("g");
                  o.appendChild(P), this.textSpans[e].childSpan = P;
                }
                this.textSpans[e].span = o, this.layerElement.appendChild(o);
              }
              o.style.display = "inherit";
            }
            if (p.reset(), S && (a[e].n && (f = -m, b += r.yOffset, b += v ? 1 : 0, v = !1), this.applyTextPropertiesToMatrix(r, p, a[e].line, f, b), f += a[e].l || 0, f += m), l) {
              y = this.globalData.fontManager.getCharData(r.finalText[e], i.fStyle, this.globalData.fontManager.getFontByName(r.f).fFamily);
              var A;
              if (y.t === 1)
                A = new SVGCompElement(y.data, this.globalData, this);
              else {
                var _ = emptyShapeData;
                y.data && y.data.shapes && (_ = this.buildShapeData(y.data, r.finalSize)), A = new SVGShapeElement(_, this.globalData, this);
              }
              if (this.textSpans[e].glyph) {
                var M = this.textSpans[e].glyph;
                this.textSpans[e].childSpan.removeChild(M.layerElement), M.destroy();
              }
              this.textSpans[e].glyph = A, A._debug = !0, A.prepareFrame(0), A.renderFrame(), this.textSpans[e].childSpan.appendChild(A.layerElement), y.t === 1 && this.textSpans[e].childSpan.setAttribute("transform", "scale(" + r.finalSize / 100 + "," + r.finalSize / 100 + ")");
            } else
              S && o.setAttribute("transform", "translate(" + p.props[12] + "," + p.props[13] + ")"), o.textContent = a[e].val, o.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve");
          }
          S && o && o.setAttribute("d", u);
        }
        for (; e < this.textSpans.length; )
          this.textSpans[e].span.style.display = "none", e += 1;
        this._sizeChanged = !0;
      }, SVGTextLottieElement.prototype.sourceRectAtTime = function() {
        if (this.prepareFrame(this.comp.renderedFrame - this.data.st), this.renderInnerContent(), this._sizeChanged) {
          this._sizeChanged = !1;
          var e = this.layerElement.getBBox();
          this.bbox = {
            top: e.y,
            left: e.x,
            width: e.width,
            height: e.height
          };
        }
        return this.bbox;
      }, SVGTextLottieElement.prototype.getValue = function() {
        var e, t = this.textSpans.length, r;
        for (this.renderedFrame = this.comp.renderedFrame, e = 0; e < t; e += 1)
          r = this.textSpans[e].glyph, r && (r.prepareFrame(this.comp.renderedFrame - this.data.st), r._mdf && (this._mdf = !0));
      }, SVGTextLottieElement.prototype.renderInnerContent = function() {
        if (this.validateText(), (!this.data.singleShape || this._mdf) && (this.textAnimator.getMeasures(this.textProperty.currentData, this.lettersChangedFlag), this.lettersChangedFlag || this.textAnimator.lettersChangedFlag)) {
          this._sizeChanged = !0;
          var e, t, r = this.textAnimator.renderedLetters, i = this.textProperty.currentData.l;
          t = i.length;
          var s, n, a;
          for (e = 0; e < t; e += 1)
            i[e].n || (s = r[e], n = this.textSpans[e].span, a = this.textSpans[e].glyph, a && a.renderFrame(), s._mdf.m && n.setAttribute("transform", s.m), s._mdf.o && n.setAttribute("opacity", s.o), s._mdf.sw && n.setAttribute("stroke-width", s.sw), s._mdf.sc && n.setAttribute("stroke", s.sc), s._mdf.fc && n.setAttribute("fill", s.fc));
        }
      };
      function ISolidElement(e, t, r) {
        this.initElement(e, t, r);
      }
      extendPrototype([IImageElement], ISolidElement), ISolidElement.prototype.createContent = function() {
        var e = createNS("rect");
        e.setAttribute("width", this.data.sw), e.setAttribute("height", this.data.sh), e.setAttribute("fill", this.data.sc), this.layerElement.appendChild(e);
      };
      function NullElement(e, t, r) {
        this.initFrame(), this.initBaseData(e, t, r), this.initFrame(), this.initTransform(e, t, r), this.initHierarchy();
      }
      NullElement.prototype.prepareFrame = function(e) {
        this.prepareProperties(e, !0);
      }, NullElement.prototype.renderFrame = function() {
      }, NullElement.prototype.getBaseElement = function() {
        return null;
      }, NullElement.prototype.destroy = function() {
      }, NullElement.prototype.sourceRectAtTime = function() {
      }, NullElement.prototype.hide = function() {
      }, extendPrototype([BaseElement, TransformElement, HierarchyElement, FrameElement], NullElement);
      function SVGRendererBase() {
      }
      extendPrototype([BaseRenderer], SVGRendererBase), SVGRendererBase.prototype.createNull = function(e) {
        return new NullElement(e, this.globalData, this);
      }, SVGRendererBase.prototype.createShape = function(e) {
        return new SVGShapeElement(e, this.globalData, this);
      }, SVGRendererBase.prototype.createText = function(e) {
        return new SVGTextLottieElement(e, this.globalData, this);
      }, SVGRendererBase.prototype.createImage = function(e) {
        return new IImageElement(e, this.globalData, this);
      }, SVGRendererBase.prototype.createSolid = function(e) {
        return new ISolidElement(e, this.globalData, this);
      }, SVGRendererBase.prototype.configAnimation = function(e) {
        this.svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg"), this.svgElement.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink"), this.renderConfig.viewBoxSize ? this.svgElement.setAttribute("viewBox", this.renderConfig.viewBoxSize) : this.svgElement.setAttribute("viewBox", "0 0 " + e.w + " " + e.h), this.renderConfig.viewBoxOnly || (this.svgElement.setAttribute("width", e.w), this.svgElement.setAttribute("height", e.h), this.svgElement.style.width = "100%", this.svgElement.style.height = "100%", this.svgElement.style.transform = "translate3d(0,0,0)", this.svgElement.style.contentVisibility = this.renderConfig.contentVisibility), this.renderConfig.width && this.svgElement.setAttribute("width", this.renderConfig.width), this.renderConfig.height && this.svgElement.setAttribute("height", this.renderConfig.height), this.renderConfig.className && this.svgElement.setAttribute("class", this.renderConfig.className), this.renderConfig.id && this.svgElement.setAttribute("id", this.renderConfig.id), this.renderConfig.focusable !== void 0 && this.svgElement.setAttribute("focusable", this.renderConfig.focusable), this.svgElement.setAttribute("preserveAspectRatio", this.renderConfig.preserveAspectRatio), this.animationItem.wrapper.appendChild(this.svgElement);
        var t = this.globalData.defs;
        this.setupGlobalData(e, t), this.globalData.progressiveLoad = this.renderConfig.progressiveLoad, this.data = e;
        var r = createNS("clipPath"), i = createNS("rect");
        i.setAttribute("width", e.w), i.setAttribute("height", e.h), i.setAttribute("x", 0), i.setAttribute("y", 0);
        var s = createElementID();
        r.setAttribute("id", s), r.appendChild(i), this.layerElement.setAttribute("clip-path", "url(" + getLocationHref() + "#" + s + ")"), t.appendChild(r), this.layers = e.layers, this.elements = createSizedArray(e.layers.length);
      }, SVGRendererBase.prototype.destroy = function() {
        this.animationItem.wrapper && (this.animationItem.wrapper.innerText = ""), this.layerElement = null, this.globalData.defs = null;
        var e, t = this.layers ? this.layers.length : 0;
        for (e = 0; e < t; e += 1)
          this.elements[e] && this.elements[e].destroy && this.elements[e].destroy();
        this.elements.length = 0, this.destroyed = !0, this.animationItem = null;
      }, SVGRendererBase.prototype.updateContainerSize = function() {
      }, SVGRendererBase.prototype.findIndexByInd = function(e) {
        var t = 0, r = this.layers.length;
        for (t = 0; t < r; t += 1)
          if (this.layers[t].ind === e)
            return t;
        return -1;
      }, SVGRendererBase.prototype.buildItem = function(e) {
        var t = this.elements;
        if (!(t[e] || this.layers[e].ty === 99)) {
          t[e] = !0;
          var r = this.createItem(this.layers[e]);
          if (t[e] = r, getExpressionsPlugin() && (this.layers[e].ty === 0 && this.globalData.projectInterface.registerComposition(r), r.initExpressions()), this.appendElementInPos(r, e), this.layers[e].tt) {
            var i = "tp" in this.layers[e] ? this.findIndexByInd(this.layers[e].tp) : e - 1;
            if (i === -1)
              return;
            if (!this.elements[i] || this.elements[i] === !0)
              this.buildItem(i), this.addPendingElement(r);
            else {
              var s = t[i], n = s.getMatte(this.layers[e].tt);
              r.setMatte(n);
            }
          }
        }
      }, SVGRendererBase.prototype.checkPendingElements = function() {
        for (; this.pendingElements.length; ) {
          var e = this.pendingElements.pop();
          if (e.checkParenting(), e.data.tt)
            for (var t = 0, r = this.elements.length; t < r; ) {
              if (this.elements[t] === e) {
                var i = "tp" in e.data ? this.findIndexByInd(e.data.tp) : t - 1, s = this.elements[i], n = s.getMatte(this.layers[t].tt);
                e.setMatte(n);
                break;
              }
              t += 1;
            }
        }
      }, SVGRendererBase.prototype.renderFrame = function(e) {
        if (!(this.renderedFrame === e || this.destroyed)) {
          e === null ? e = this.renderedFrame : this.renderedFrame = e, this.globalData.frameNum = e, this.globalData.frameId += 1, this.globalData.projectInterface.currentFrame = e, this.globalData._mdf = !1;
          var t, r = this.layers.length;
          for (this.completeLayers || this.checkLayers(e), t = r - 1; t >= 0; t -= 1)
            (this.completeLayers || this.elements[t]) && this.elements[t].prepareFrame(e - this.layers[t].st);
          if (this.globalData._mdf)
            for (t = 0; t < r; t += 1)
              (this.completeLayers || this.elements[t]) && this.elements[t].renderFrame();
        }
      }, SVGRendererBase.prototype.appendElementInPos = function(e, t) {
        var r = e.getBaseElement();
        if (r) {
          for (var i = 0, s; i < t; )
            this.elements[i] && this.elements[i] !== !0 && this.elements[i].getBaseElement() && (s = this.elements[i].getBaseElement()), i += 1;
          s ? this.layerElement.insertBefore(r, s) : this.layerElement.appendChild(r);
        }
      }, SVGRendererBase.prototype.hide = function() {
        this.layerElement.style.display = "none";
      }, SVGRendererBase.prototype.show = function() {
        this.layerElement.style.display = "block";
      };
      function ICompElement() {
      }
      extendPrototype([BaseElement, TransformElement, HierarchyElement, FrameElement, RenderableDOMElement], ICompElement), ICompElement.prototype.initElement = function(e, t, r) {
        this.initFrame(), this.initBaseData(e, t, r), this.initTransform(e, t, r), this.initRenderable(), this.initHierarchy(), this.initRendererElement(), this.createContainerElements(), this.createRenderableComponents(), (this.data.xt || !t.progressiveLoad) && this.buildAllItems(), this.hide();
      }, ICompElement.prototype.prepareFrame = function(e) {
        if (this._mdf = !1, this.prepareRenderableFrame(e), this.prepareProperties(e, this.isInRange), !(!this.isInRange && !this.data.xt)) {
          if (this.tm._placeholder)
            this.renderedFrame = e / this.data.sr;
          else {
            var t = this.tm.v;
            t === this.data.op && (t = this.data.op - 1), this.renderedFrame = t;
          }
          var r, i = this.elements.length;
          for (this.completeLayers || this.checkLayers(this.renderedFrame), r = i - 1; r >= 0; r -= 1)
            (this.completeLayers || this.elements[r]) && (this.elements[r].prepareFrame(this.renderedFrame - this.layers[r].st), this.elements[r]._mdf && (this._mdf = !0));
        }
      }, ICompElement.prototype.renderInnerContent = function() {
        var e, t = this.layers.length;
        for (e = 0; e < t; e += 1)
          (this.completeLayers || this.elements[e]) && this.elements[e].renderFrame();
      }, ICompElement.prototype.setElements = function(e) {
        this.elements = e;
      }, ICompElement.prototype.getElements = function() {
        return this.elements;
      }, ICompElement.prototype.destroyElements = function() {
        var e, t = this.layers.length;
        for (e = 0; e < t; e += 1)
          this.elements[e] && this.elements[e].destroy();
      }, ICompElement.prototype.destroy = function() {
        this.destroyElements(), this.destroyBaseElement();
      };
      function SVGCompElement(e, t, r) {
        this.layers = e.layers, this.supports3d = !0, this.completeLayers = !1, this.pendingElements = [], this.elements = this.layers ? createSizedArray(this.layers.length) : [], this.initElement(e, t, r), this.tm = e.tm ? PropertyFactory.getProp(this, e.tm, 0, t.frameRate, this) : {
          _placeholder: !0
        };
      }
      extendPrototype([SVGRendererBase, ICompElement, SVGBaseElement], SVGCompElement), SVGCompElement.prototype.createComp = function(e) {
        return new SVGCompElement(e, this.globalData, this);
      };
      function SVGRenderer(e, t) {
        this.animationItem = e, this.layers = null, this.renderedFrame = -1, this.svgElement = createNS("svg");
        var r = "";
        if (t && t.title) {
          var i = createNS("title"), s = createElementID();
          i.setAttribute("id", s), i.textContent = t.title, this.svgElement.appendChild(i), r += s;
        }
        if (t && t.description) {
          var n = createNS("desc"), a = createElementID();
          n.setAttribute("id", a), n.textContent = t.description, this.svgElement.appendChild(n), r += " " + a;
        }
        r && this.svgElement.setAttribute("aria-labelledby", r);
        var l = createNS("defs");
        this.svgElement.appendChild(l);
        var o = createNS("g");
        this.svgElement.appendChild(o), this.layerElement = o, this.renderConfig = {
          preserveAspectRatio: t && t.preserveAspectRatio || "xMidYMid meet",
          imagePreserveAspectRatio: t && t.imagePreserveAspectRatio || "xMidYMid slice",
          contentVisibility: t && t.contentVisibility || "visible",
          progressiveLoad: t && t.progressiveLoad || !1,
          hideOnTransparent: !(t && t.hideOnTransparent === !1),
          viewBoxOnly: t && t.viewBoxOnly || !1,
          viewBoxSize: t && t.viewBoxSize || !1,
          className: t && t.className || "",
          id: t && t.id || "",
          focusable: t && t.focusable,
          filterSize: {
            width: t && t.filterSize && t.filterSize.width || "100%",
            height: t && t.filterSize && t.filterSize.height || "100%",
            x: t && t.filterSize && t.filterSize.x || "0%",
            y: t && t.filterSize && t.filterSize.y || "0%"
          },
          width: t && t.width,
          height: t && t.height,
          runExpressions: !t || t.runExpressions === void 0 || t.runExpressions
        }, this.globalData = {
          _mdf: !1,
          frameNum: -1,
          defs: l,
          renderConfig: this.renderConfig
        }, this.elements = [], this.pendingElements = [], this.destroyed = !1, this.rendererType = "svg";
      }
      extendPrototype([SVGRendererBase], SVGRenderer), SVGRenderer.prototype.createComp = function(e) {
        return new SVGCompElement(e, this.globalData, this);
      };
      function ShapeTransformManager() {
        this.sequences = {}, this.sequenceList = [], this.transform_key_count = 0;
      }
      ShapeTransformManager.prototype = {
        addTransformSequence: function(t) {
          var r, i = t.length, s = "_";
          for (r = 0; r < i; r += 1)
            s += t[r].transform.key + "_";
          var n = this.sequences[s];
          return n || (n = {
            transforms: [].concat(t),
            finalTransform: new Matrix(),
            _mdf: !1
          }, this.sequences[s] = n, this.sequenceList.push(n)), n;
        },
        processSequence: function(t, r) {
          for (var i = 0, s = t.transforms.length, n = r; i < s && !r; ) {
            if (t.transforms[i].transform.mProps._mdf) {
              n = !0;
              break;
            }
            i += 1;
          }
          if (n)
            for (t.finalTransform.reset(), i = s - 1; i >= 0; i -= 1)
              t.finalTransform.multiply(t.transforms[i].transform.mProps.v);
          t._mdf = n;
        },
        processSequences: function(t) {
          var r, i = this.sequenceList.length;
          for (r = 0; r < i; r += 1)
            this.processSequence(this.sequenceList[r], t);
        },
        getNewKey: function() {
          return this.transform_key_count += 1, "_" + this.transform_key_count;
        }
      };
      var lumaLoader = function() {
        var t = "__lottie_element_luma_buffer", r = null, i = null, s = null;
        function n() {
          var o = createNS("svg"), p = createNS("filter"), u = createNS("feColorMatrix");
          return p.setAttribute("id", t), u.setAttribute("type", "matrix"), u.setAttribute("color-interpolation-filters", "sRGB"), u.setAttribute("values", "0.3, 0.3, 0.3, 0, 0, 0.3, 0.3, 0.3, 0, 0, 0.3, 0.3, 0.3, 0, 0, 0.3, 0.3, 0.3, 0, 0"), p.appendChild(u), o.appendChild(p), o.setAttribute("id", t + "_svg"), featureSupport.svgLumaHidden && (o.style.display = "none"), o;
        }
        function a() {
          r || (s = n(), document.body.appendChild(s), r = createTag("canvas"), i = r.getContext("2d"), i.filter = "url(#" + t + ")", i.fillStyle = "rgba(0,0,0,0)", i.fillRect(0, 0, 1, 1));
        }
        function l(o) {
          return r || a(), r.width = o.width, r.height = o.height, i.filter = "url(#" + t + ")", r;
        }
        return {
          load: a,
          get: l
        };
      };
      function createCanvas(e, t) {
        if (featureSupport.offscreenCanvas)
          return new OffscreenCanvas(e, t);
        var r = createTag("canvas");
        return r.width = e, r.height = t, r;
      }
      var assetLoader = (function() {
        return {
          loadLumaCanvas: lumaLoader.load,
          getLumaCanvas: lumaLoader.get,
          createCanvas
        };
      })(), registeredEffects = {};
      function CVEffects(e) {
        var t, r = e.data.ef ? e.data.ef.length : 0;
        this.filters = [];
        var i;
        for (t = 0; t < r; t += 1) {
          i = null;
          var s = e.data.ef[t].ty;
          if (registeredEffects[s]) {
            var n = registeredEffects[s].effect;
            i = new n(e.effectsManager.effectElements[t], e);
          }
          i && this.filters.push(i);
        }
        this.filters.length && e.addRenderableComponent(this);
      }
      CVEffects.prototype.renderFrame = function(e) {
        var t, r = this.filters.length;
        for (t = 0; t < r; t += 1)
          this.filters[t].renderFrame(e);
      }, CVEffects.prototype.getEffects = function(e) {
        var t, r = this.filters.length, i = [];
        for (t = 0; t < r; t += 1)
          this.filters[t].type === e && i.push(this.filters[t]);
        return i;
      };
      function registerEffect(e, t) {
        registeredEffects[e] = {
          effect: t
        };
      }
      function CVMaskElement(e, t) {
        this.data = e, this.element = t, this.masksProperties = this.data.masksProperties || [], this.viewData = createSizedArray(this.masksProperties.length);
        var r, i = this.masksProperties.length, s = !1;
        for (r = 0; r < i; r += 1)
          this.masksProperties[r].mode !== "n" && (s = !0), this.viewData[r] = ShapePropertyFactory.getShapeProp(this.element, this.masksProperties[r], 3);
        this.hasMasks = s, s && this.element.addRenderableComponent(this);
      }
      CVMaskElement.prototype.renderFrame = function() {
        if (this.hasMasks) {
          var e = this.element.finalTransform.mat, t = this.element.canvasContext, r, i = this.masksProperties.length, s, n, a;
          for (t.beginPath(), r = 0; r < i; r += 1)
            if (this.masksProperties[r].mode !== "n") {
              this.masksProperties[r].inv && (t.moveTo(0, 0), t.lineTo(this.element.globalData.compSize.w, 0), t.lineTo(this.element.globalData.compSize.w, this.element.globalData.compSize.h), t.lineTo(0, this.element.globalData.compSize.h), t.lineTo(0, 0)), a = this.viewData[r].v, s = e.applyToPointArray(a.v[0][0], a.v[0][1], 0), t.moveTo(s[0], s[1]);
              var l, o = a._length;
              for (l = 1; l < o; l += 1)
                n = e.applyToTriplePoints(a.o[l - 1], a.i[l], a.v[l]), t.bezierCurveTo(n[0], n[1], n[2], n[3], n[4], n[5]);
              n = e.applyToTriplePoints(a.o[l - 1], a.i[0], a.v[0]), t.bezierCurveTo(n[0], n[1], n[2], n[3], n[4], n[5]);
            }
          this.element.globalData.renderer.save(!0), t.clip();
        }
      }, CVMaskElement.prototype.getMaskProperty = MaskElement.prototype.getMaskProperty, CVMaskElement.prototype.destroy = function() {
        this.element = null;
      };
      function CVBaseElement() {
      }
      var operationsMap = {
        1: "source-in",
        2: "source-out",
        3: "source-in",
        4: "source-out"
      };
      CVBaseElement.prototype = {
        createElements: function() {
        },
        initRendererElement: function() {
        },
        createContainerElements: function() {
          if (this.data.tt >= 1) {
            this.buffers = [];
            var t = this.globalData.canvasContext, r = assetLoader.createCanvas(t.canvas.width, t.canvas.height);
            this.buffers.push(r);
            var i = assetLoader.createCanvas(t.canvas.width, t.canvas.height);
            this.buffers.push(i), this.data.tt >= 3 && !document._isProxy && assetLoader.loadLumaCanvas();
          }
          this.canvasContext = this.globalData.canvasContext, this.transformCanvas = this.globalData.transformCanvas, this.renderableEffectsManager = new CVEffects(this), this.searchEffectTransforms();
        },
        createContent: function() {
        },
        setBlendMode: function() {
          var t = this.globalData;
          if (t.blendMode !== this.data.bm) {
            t.blendMode = this.data.bm;
            var r = getBlendMode(this.data.bm);
            t.canvasContext.globalCompositeOperation = r;
          }
        },
        createRenderableComponents: function() {
          this.maskManager = new CVMaskElement(this.data, this), this.transformEffects = this.renderableEffectsManager.getEffects(effectTypes.TRANSFORM_EFFECT);
        },
        hideElement: function() {
          !this.hidden && (!this.isInRange || this.isTransparent) && (this.hidden = !0);
        },
        showElement: function() {
          this.isInRange && !this.isTransparent && (this.hidden = !1, this._isFirstFrame = !0, this.maskManager._isFirstFrame = !0);
        },
        clearCanvas: function(t) {
          t.clearRect(this.transformCanvas.tx, this.transformCanvas.ty, this.transformCanvas.w * this.transformCanvas.sx, this.transformCanvas.h * this.transformCanvas.sy);
        },
        prepareLayer: function() {
          if (this.data.tt >= 1) {
            var t = this.buffers[0], r = t.getContext("2d");
            this.clearCanvas(r), r.drawImage(this.canvasContext.canvas, 0, 0), this.currentTransform = this.canvasContext.getTransform(), this.canvasContext.setTransform(1, 0, 0, 1, 0, 0), this.clearCanvas(this.canvasContext), this.canvasContext.setTransform(this.currentTransform);
          }
        },
        exitLayer: function() {
          if (this.data.tt >= 1) {
            var t = this.buffers[1], r = t.getContext("2d");
            this.clearCanvas(r), r.drawImage(this.canvasContext.canvas, 0, 0), this.canvasContext.setTransform(1, 0, 0, 1, 0, 0), this.clearCanvas(this.canvasContext), this.canvasContext.setTransform(this.currentTransform);
            var i = this.comp.getElementById("tp" in this.data ? this.data.tp : this.data.ind - 1);
            if (i.renderFrame(!0), this.canvasContext.setTransform(1, 0, 0, 1, 0, 0), this.data.tt >= 3 && !document._isProxy) {
              var s = assetLoader.getLumaCanvas(this.canvasContext.canvas), n = s.getContext("2d");
              n.drawImage(this.canvasContext.canvas, 0, 0), this.clearCanvas(this.canvasContext), this.canvasContext.drawImage(s, 0, 0);
            }
            this.canvasContext.globalCompositeOperation = operationsMap[this.data.tt], this.canvasContext.drawImage(t, 0, 0), this.canvasContext.globalCompositeOperation = "destination-over", this.canvasContext.drawImage(this.buffers[0], 0, 0), this.canvasContext.setTransform(this.currentTransform), this.canvasContext.globalCompositeOperation = "source-over";
          }
        },
        renderFrame: function(t) {
          if (!(this.hidden || this.data.hd) && !(this.data.td === 1 && !t)) {
            this.renderTransform(), this.renderRenderable(), this.renderLocalTransform(), this.setBlendMode();
            var r = this.data.ty === 0;
            this.prepareLayer(), this.globalData.renderer.save(r), this.globalData.renderer.ctxTransform(this.finalTransform.localMat.props), this.globalData.renderer.ctxOpacity(this.finalTransform.localOpacity), this.renderInnerContent(), this.globalData.renderer.restore(r), this.exitLayer(), this.maskManager.hasMasks && this.globalData.renderer.restore(!0), this._isFirstFrame && (this._isFirstFrame = !1);
          }
        },
        destroy: function() {
          this.canvasContext = null, this.data = null, this.globalData = null, this.maskManager.destroy();
        },
        mHelper: new Matrix()
      }, CVBaseElement.prototype.hide = CVBaseElement.prototype.hideElement, CVBaseElement.prototype.show = CVBaseElement.prototype.showElement;
      function CVShapeData(e, t, r, i) {
        this.styledShapes = [], this.tr = [0, 0, 0, 0, 0, 0];
        var s = 4;
        t.ty === "rc" ? s = 5 : t.ty === "el" ? s = 6 : t.ty === "sr" && (s = 7), this.sh = ShapePropertyFactory.getShapeProp(e, t, s, e);
        var n, a = r.length, l;
        for (n = 0; n < a; n += 1)
          r[n].closed || (l = {
            transforms: i.addTransformSequence(r[n].transforms),
            trNodes: []
          }, this.styledShapes.push(l), r[n].elements.push(l));
      }
      CVShapeData.prototype.setAsAnimated = SVGShapeData.prototype.setAsAnimated;
      function CVShapeElement(e, t, r) {
        this.shapes = [], this.shapesData = e.shapes, this.stylesList = [], this.itemsData = [], this.prevViewData = [], this.shapeModifiers = [], this.processedElements = [], this.transformsManager = new ShapeTransformManager(), this.initElement(e, t, r);
      }
      extendPrototype([BaseElement, TransformElement, CVBaseElement, IShapeElement, HierarchyElement, FrameElement, RenderableElement], CVShapeElement), CVShapeElement.prototype.initElement = RenderableDOMElement.prototype.initElement, CVShapeElement.prototype.transformHelper = {
        opacity: 1,
        _opMdf: !1
      }, CVShapeElement.prototype.dashResetter = [], CVShapeElement.prototype.createContent = function() {
        this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, !0, []);
      }, CVShapeElement.prototype.createStyleElement = function(e, t) {
        var r = {
          data: e,
          type: e.ty,
          preTransforms: this.transformsManager.addTransformSequence(t),
          transforms: [],
          elements: [],
          closed: e.hd === !0
        }, i = {};
        if (e.ty === "fl" || e.ty === "st" ? (i.c = PropertyFactory.getProp(this, e.c, 1, 255, this), i.c.k || (r.co = "rgb(" + bmFloor(i.c.v[0]) + "," + bmFloor(i.c.v[1]) + "," + bmFloor(i.c.v[2]) + ")")) : (e.ty === "gf" || e.ty === "gs") && (i.s = PropertyFactory.getProp(this, e.s, 1, null, this), i.e = PropertyFactory.getProp(this, e.e, 1, null, this), i.h = PropertyFactory.getProp(this, e.h || {
          k: 0
        }, 0, 0.01, this), i.a = PropertyFactory.getProp(this, e.a || {
          k: 0
        }, 0, degToRads, this), i.g = new GradientProperty(this, e.g, this)), i.o = PropertyFactory.getProp(this, e.o, 0, 0.01, this), e.ty === "st" || e.ty === "gs") {
          if (r.lc = lineCapEnum[e.lc || 2], r.lj = lineJoinEnum[e.lj || 2], e.lj == 1 && (r.ml = e.ml), i.w = PropertyFactory.getProp(this, e.w, 0, null, this), i.w.k || (r.wi = i.w.v), e.d) {
            var s = new DashProperty(this, e.d, "canvas", this);
            i.d = s, i.d.k || (r.da = i.d.dashArray, r.do = i.d.dashoffset[0]);
          }
        } else
          r.r = e.r === 2 ? "evenodd" : "nonzero";
        return this.stylesList.push(r), i.style = r, i;
      }, CVShapeElement.prototype.createGroupElement = function() {
        var e = {
          it: [],
          prevViewData: []
        };
        return e;
      }, CVShapeElement.prototype.createTransformElement = function(e) {
        var t = {
          transform: {
            opacity: 1,
            _opMdf: !1,
            key: this.transformsManager.getNewKey(),
            op: PropertyFactory.getProp(this, e.o, 0, 0.01, this),
            mProps: TransformPropertyFactory.getTransformProperty(this, e, this)
          }
        };
        return t;
      }, CVShapeElement.prototype.createShapeElement = function(e) {
        var t = new CVShapeData(this, e, this.stylesList, this.transformsManager);
        return this.shapes.push(t), this.addShapeToModifiers(t), t;
      }, CVShapeElement.prototype.reloadShapes = function() {
        this._isFirstFrame = !0;
        var e, t = this.itemsData.length;
        for (e = 0; e < t; e += 1)
          this.prevViewData[e] = this.itemsData[e];
        for (this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, !0, []), t = this.dynamicProperties.length, e = 0; e < t; e += 1)
          this.dynamicProperties[e].getValue();
        this.renderModifiers(), this.transformsManager.processSequences(this._isFirstFrame);
      }, CVShapeElement.prototype.addTransformToStyleList = function(e) {
        var t, r = this.stylesList.length;
        for (t = 0; t < r; t += 1)
          this.stylesList[t].closed || this.stylesList[t].transforms.push(e);
      }, CVShapeElement.prototype.removeTransformFromStyleList = function() {
        var e, t = this.stylesList.length;
        for (e = 0; e < t; e += 1)
          this.stylesList[e].closed || this.stylesList[e].transforms.pop();
      }, CVShapeElement.prototype.closeStyles = function(e) {
        var t, r = e.length;
        for (t = 0; t < r; t += 1)
          e[t].closed = !0;
      }, CVShapeElement.prototype.searchShapes = function(e, t, r, i, s) {
        var n, a = e.length - 1, l, o, p = [], u = [], S, f, b, v = [].concat(s);
        for (n = a; n >= 0; n -= 1) {
          if (S = this.searchProcessedElement(e[n]), S ? t[n] = r[S - 1] : e[n]._shouldRender = i, e[n].ty === "fl" || e[n].ty === "st" || e[n].ty === "gf" || e[n].ty === "gs")
            S ? t[n].style.closed = !1 : t[n] = this.createStyleElement(e[n], v), p.push(t[n].style);
          else if (e[n].ty === "gr") {
            if (!S)
              t[n] = this.createGroupElement(e[n]);
            else
              for (o = t[n].it.length, l = 0; l < o; l += 1)
                t[n].prevViewData[l] = t[n].it[l];
            this.searchShapes(e[n].it, t[n].it, t[n].prevViewData, i, v);
          } else e[n].ty === "tr" ? (S || (b = this.createTransformElement(e[n]), t[n] = b), v.push(t[n]), this.addTransformToStyleList(t[n])) : e[n].ty === "sh" || e[n].ty === "rc" || e[n].ty === "el" || e[n].ty === "sr" ? S || (t[n] = this.createShapeElement(e[n])) : e[n].ty === "tm" || e[n].ty === "rd" || e[n].ty === "pb" || e[n].ty === "zz" || e[n].ty === "op" ? (S ? (f = t[n], f.closed = !1) : (f = ShapeModifiers.getModifier(e[n].ty), f.init(this, e[n]), t[n] = f, this.shapeModifiers.push(f)), u.push(f)) : e[n].ty === "rp" && (S ? (f = t[n], f.closed = !0) : (f = ShapeModifiers.getModifier(e[n].ty), t[n] = f, f.init(this, e, n, t), this.shapeModifiers.push(f), i = !1), u.push(f));
          this.addProcessedElement(e[n], n + 1);
        }
        for (this.removeTransformFromStyleList(), this.closeStyles(p), a = u.length, n = 0; n < a; n += 1)
          u[n].closed = !0;
      }, CVShapeElement.prototype.renderInnerContent = function() {
        this.transformHelper.opacity = 1, this.transformHelper._opMdf = !1, this.renderModifiers(), this.transformsManager.processSequences(this._isFirstFrame), this.renderShape(this.transformHelper, this.shapesData, this.itemsData, !0);
      }, CVShapeElement.prototype.renderShapeTransform = function(e, t) {
        (e._opMdf || t.op._mdf || this._isFirstFrame) && (t.opacity = e.opacity, t.opacity *= t.op.v, t._opMdf = !0);
      }, CVShapeElement.prototype.drawLayer = function() {
        var e, t = this.stylesList.length, r, i, s, n, a, l, o = this.globalData.renderer, p = this.globalData.canvasContext, u, S;
        for (e = 0; e < t; e += 1)
          if (S = this.stylesList[e], u = S.type, !((u === "st" || u === "gs") && S.wi === 0 || !S.data._shouldRender || S.coOp === 0 || this.globalData.currentGlobalAlpha === 0)) {
            for (o.save(), a = S.elements, u === "st" || u === "gs" ? (o.ctxStrokeStyle(u === "st" ? S.co : S.grd), o.ctxLineWidth(S.wi), o.ctxLineCap(S.lc), o.ctxLineJoin(S.lj), o.ctxMiterLimit(S.ml || 0)) : o.ctxFillStyle(u === "fl" ? S.co : S.grd), o.ctxOpacity(S.coOp), u !== "st" && u !== "gs" && p.beginPath(), o.ctxTransform(S.preTransforms.finalTransform.props), i = a.length, r = 0; r < i; r += 1) {
              for ((u === "st" || u === "gs") && (p.beginPath(), S.da && (p.setLineDash(S.da), p.lineDashOffset = S.do)), l = a[r].trNodes, n = l.length, s = 0; s < n; s += 1)
                l[s].t === "m" ? p.moveTo(l[s].p[0], l[s].p[1]) : l[s].t === "c" ? p.bezierCurveTo(l[s].pts[0], l[s].pts[1], l[s].pts[2], l[s].pts[3], l[s].pts[4], l[s].pts[5]) : p.closePath();
              (u === "st" || u === "gs") && (o.ctxStroke(), S.da && p.setLineDash(this.dashResetter));
            }
            u !== "st" && u !== "gs" && this.globalData.renderer.ctxFill(S.r), o.restore();
          }
      }, CVShapeElement.prototype.renderShape = function(e, t, r, i) {
        var s, n = t.length - 1, a;
        for (a = e, s = n; s >= 0; s -= 1)
          t[s].ty === "tr" ? (a = r[s].transform, this.renderShapeTransform(e, a)) : t[s].ty === "sh" || t[s].ty === "el" || t[s].ty === "rc" || t[s].ty === "sr" ? this.renderPath(t[s], r[s]) : t[s].ty === "fl" ? this.renderFill(t[s], r[s], a) : t[s].ty === "st" ? this.renderStroke(t[s], r[s], a) : t[s].ty === "gf" || t[s].ty === "gs" ? this.renderGradientFill(t[s], r[s], a) : t[s].ty === "gr" ? this.renderShape(a, t[s].it, r[s].it) : t[s].ty;
        i && this.drawLayer();
      }, CVShapeElement.prototype.renderStyledShape = function(e, t) {
        if (this._isFirstFrame || t._mdf || e.transforms._mdf) {
          var r = e.trNodes, i = t.paths, s, n, a, l = i._length;
          r.length = 0;
          var o = e.transforms.finalTransform;
          for (a = 0; a < l; a += 1) {
            var p = i.shapes[a];
            if (p && p.v) {
              for (n = p._length, s = 1; s < n; s += 1)
                s === 1 && r.push({
                  t: "m",
                  p: o.applyToPointArray(p.v[0][0], p.v[0][1], 0)
                }), r.push({
                  t: "c",
                  pts: o.applyToTriplePoints(p.o[s - 1], p.i[s], p.v[s])
                });
              n === 1 && r.push({
                t: "m",
                p: o.applyToPointArray(p.v[0][0], p.v[0][1], 0)
              }), p.c && n && (r.push({
                t: "c",
                pts: o.applyToTriplePoints(p.o[s - 1], p.i[0], p.v[0])
              }), r.push({
                t: "z"
              }));
            }
          }
          e.trNodes = r;
        }
      }, CVShapeElement.prototype.renderPath = function(e, t) {
        if (e.hd !== !0 && e._shouldRender) {
          var r, i = t.styledShapes.length;
          for (r = 0; r < i; r += 1)
            this.renderStyledShape(t.styledShapes[r], t.sh);
        }
      }, CVShapeElement.prototype.renderFill = function(e, t, r) {
        var i = t.style;
        (t.c._mdf || this._isFirstFrame) && (i.co = "rgb(" + bmFloor(t.c.v[0]) + "," + bmFloor(t.c.v[1]) + "," + bmFloor(t.c.v[2]) + ")"), (t.o._mdf || r._opMdf || this._isFirstFrame) && (i.coOp = t.o.v * r.opacity);
      }, CVShapeElement.prototype.renderGradientFill = function(e, t, r) {
        var i = t.style, s;
        if (!i.grd || t.g._mdf || t.s._mdf || t.e._mdf || e.t !== 1 && (t.h._mdf || t.a._mdf)) {
          var n = this.globalData.canvasContext, a = t.s.v, l = t.e.v;
          if (e.t === 1)
            s = n.createLinearGradient(a[0], a[1], l[0], l[1]);
          else {
            var o = Math.sqrt(Math.pow(a[0] - l[0], 2) + Math.pow(a[1] - l[1], 2)), p = Math.atan2(l[1] - a[1], l[0] - a[0]), u = t.h.v;
            u >= 1 ? u = 0.99 : u <= -1 && (u = -0.99);
            var S = o * u, f = Math.cos(p + t.a.v) * S + a[0], b = Math.sin(p + t.a.v) * S + a[1];
            s = n.createRadialGradient(f, b, 0, a[0], a[1], o);
          }
          var v, m = e.g.p, x = t.g.c, c = 1;
          for (v = 0; v < m; v += 1)
            t.g._hasOpacity && t.g._collapsable && (c = t.g.o[v * 2 + 1]), s.addColorStop(x[v * 4] / 100, "rgba(" + x[v * 4 + 1] + "," + x[v * 4 + 2] + "," + x[v * 4 + 3] + "," + c + ")");
          i.grd = s;
        }
        i.coOp = t.o.v * r.opacity;
      }, CVShapeElement.prototype.renderStroke = function(e, t, r) {
        var i = t.style, s = t.d;
        s && (s._mdf || this._isFirstFrame) && (i.da = s.dashArray, i.do = s.dashoffset[0]), (t.c._mdf || this._isFirstFrame) && (i.co = "rgb(" + bmFloor(t.c.v[0]) + "," + bmFloor(t.c.v[1]) + "," + bmFloor(t.c.v[2]) + ")"), (t.o._mdf || r._opMdf || this._isFirstFrame) && (i.coOp = t.o.v * r.opacity), (t.w._mdf || this._isFirstFrame) && (i.wi = t.w.v);
      }, CVShapeElement.prototype.destroy = function() {
        this.shapesData = null, this.globalData = null, this.canvasContext = null, this.stylesList.length = 0, this.itemsData.length = 0;
      };
      function CVTextElement(e, t, r) {
        this.textSpans = [], this.yOffset = 0, this.fillColorAnim = !1, this.strokeColorAnim = !1, this.strokeWidthAnim = !1, this.stroke = !1, this.fill = !1, this.justifyOffset = 0, this.currentRender = null, this.renderType = "canvas", this.values = {
          fill: "rgba(0,0,0,0)",
          stroke: "rgba(0,0,0,0)",
          sWidth: 0,
          fValue: ""
        }, this.initElement(e, t, r);
      }
      extendPrototype([BaseElement, TransformElement, CVBaseElement, HierarchyElement, FrameElement, RenderableElement, ITextElement], CVTextElement), CVTextElement.prototype.tHelper = createTag("canvas").getContext("2d"), CVTextElement.prototype.buildNewText = function() {
        var e = this.textProperty.currentData;
        this.renderedLetters = createSizedArray(e.l ? e.l.length : 0);
        var t = !1;
        e.fc ? (t = !0, this.values.fill = this.buildColor(e.fc)) : this.values.fill = "rgba(0,0,0,0)", this.fill = t;
        var r = !1;
        e.sc && (r = !0, this.values.stroke = this.buildColor(e.sc), this.values.sWidth = e.sw);
        var i = this.globalData.fontManager.getFontByName(e.f), s, n, a = e.l, l = this.mHelper;
        this.stroke = r, this.values.fValue = e.finalSize + "px " + this.globalData.fontManager.getFontByName(e.f).fFamily, n = e.finalText.length;
        var o, p, u, S, f, b, v, m, x, c, d = this.data.singleShape, h = e.tr * 1e-3 * e.finalSize, y = 0, P = 0, A = !0, _ = 0;
        for (s = 0; s < n; s += 1) {
          o = this.globalData.fontManager.getCharData(e.finalText[s], i.fStyle, this.globalData.fontManager.getFontByName(e.f).fFamily), p = o && o.data || {}, l.reset(), d && a[s].n && (y = -h, P += e.yOffset, P += A ? 1 : 0, A = !1), f = p.shapes ? p.shapes[0].it : [], v = f.length, l.scale(e.finalSize / 100, e.finalSize / 100), d && this.applyTextPropertiesToMatrix(e, l, a[s].line, y, P), x = createSizedArray(v - 1);
          var M = 0;
          for (b = 0; b < v; b += 1)
            if (f[b].ty === "sh") {
              for (S = f[b].ks.k.i.length, m = f[b].ks.k, c = [], u = 1; u < S; u += 1)
                u === 1 && c.push(l.applyToX(m.v[0][0], m.v[0][1], 0), l.applyToY(m.v[0][0], m.v[0][1], 0)), c.push(l.applyToX(m.o[u - 1][0], m.o[u - 1][1], 0), l.applyToY(m.o[u - 1][0], m.o[u - 1][1], 0), l.applyToX(m.i[u][0], m.i[u][1], 0), l.applyToY(m.i[u][0], m.i[u][1], 0), l.applyToX(m.v[u][0], m.v[u][1], 0), l.applyToY(m.v[u][0], m.v[u][1], 0));
              c.push(l.applyToX(m.o[u - 1][0], m.o[u - 1][1], 0), l.applyToY(m.o[u - 1][0], m.o[u - 1][1], 0), l.applyToX(m.i[0][0], m.i[0][1], 0), l.applyToY(m.i[0][0], m.i[0][1], 0), l.applyToX(m.v[0][0], m.v[0][1], 0), l.applyToY(m.v[0][0], m.v[0][1], 0)), x[M] = c, M += 1;
            }
          d && (y += a[s].l, y += h), this.textSpans[_] ? this.textSpans[_].elem = x : this.textSpans[_] = {
            elem: x
          }, _ += 1;
        }
      }, CVTextElement.prototype.renderInnerContent = function() {
        this.validateText();
        var e = this.canvasContext;
        e.font = this.values.fValue, this.globalData.renderer.ctxLineCap("butt"), this.globalData.renderer.ctxLineJoin("miter"), this.globalData.renderer.ctxMiterLimit(4), this.data.singleShape || this.textAnimator.getMeasures(this.textProperty.currentData, this.lettersChangedFlag);
        var t, r, i, s, n, a, l = this.textAnimator.renderedLetters, o = this.textProperty.currentData.l;
        r = o.length;
        var p, u = null, S = null, f = null, b, v, m = this.globalData.renderer;
        for (t = 0; t < r; t += 1)
          if (!o[t].n) {
            if (p = l[t], p && (m.save(), m.ctxTransform(p.p), m.ctxOpacity(p.o)), this.fill) {
              for (p && p.fc ? u !== p.fc && (m.ctxFillStyle(p.fc), u = p.fc) : u !== this.values.fill && (u = this.values.fill, m.ctxFillStyle(this.values.fill)), b = this.textSpans[t].elem, s = b.length, this.globalData.canvasContext.beginPath(), i = 0; i < s; i += 1)
                for (v = b[i], a = v.length, this.globalData.canvasContext.moveTo(v[0], v[1]), n = 2; n < a; n += 6)
                  this.globalData.canvasContext.bezierCurveTo(v[n], v[n + 1], v[n + 2], v[n + 3], v[n + 4], v[n + 5]);
              this.globalData.canvasContext.closePath(), m.ctxFill();
            }
            if (this.stroke) {
              for (p && p.sw ? f !== p.sw && (f = p.sw, m.ctxLineWidth(p.sw)) : f !== this.values.sWidth && (f = this.values.sWidth, m.ctxLineWidth(this.values.sWidth)), p && p.sc ? S !== p.sc && (S = p.sc, m.ctxStrokeStyle(p.sc)) : S !== this.values.stroke && (S = this.values.stroke, m.ctxStrokeStyle(this.values.stroke)), b = this.textSpans[t].elem, s = b.length, this.globalData.canvasContext.beginPath(), i = 0; i < s; i += 1)
                for (v = b[i], a = v.length, this.globalData.canvasContext.moveTo(v[0], v[1]), n = 2; n < a; n += 6)
                  this.globalData.canvasContext.bezierCurveTo(v[n], v[n + 1], v[n + 2], v[n + 3], v[n + 4], v[n + 5]);
              this.globalData.canvasContext.closePath(), m.ctxStroke();
            }
            p && this.globalData.renderer.restore();
          }
      };
      function CVImageElement(e, t, r) {
        this.assetData = t.getAssetData(e.refId), this.img = t.imageLoader.getAsset(this.assetData), this.initElement(e, t, r);
      }
      extendPrototype([BaseElement, TransformElement, CVBaseElement, HierarchyElement, FrameElement, RenderableElement], CVImageElement), CVImageElement.prototype.initElement = SVGShapeElement.prototype.initElement, CVImageElement.prototype.prepareFrame = IImageElement.prototype.prepareFrame, CVImageElement.prototype.createContent = function() {
        if (this.img.width && (this.assetData.w !== this.img.width || this.assetData.h !== this.img.height)) {
          var e = createTag("canvas");
          e.width = this.assetData.w, e.height = this.assetData.h;
          var t = e.getContext("2d"), r = this.img.width, i = this.img.height, s = r / i, n = this.assetData.w / this.assetData.h, a, l, o = this.assetData.pr || this.globalData.renderConfig.imagePreserveAspectRatio;
          s > n && o === "xMidYMid slice" || s < n && o !== "xMidYMid slice" ? (l = i, a = l * n) : (a = r, l = a / n), t.drawImage(this.img, (r - a) / 2, (i - l) / 2, a, l, 0, 0, this.assetData.w, this.assetData.h), this.img = e;
        }
      }, CVImageElement.prototype.renderInnerContent = function() {
        this.canvasContext.drawImage(this.img, 0, 0);
      }, CVImageElement.prototype.destroy = function() {
        this.img = null;
      };
      function CVSolidElement(e, t, r) {
        this.initElement(e, t, r);
      }
      extendPrototype([BaseElement, TransformElement, CVBaseElement, HierarchyElement, FrameElement, RenderableElement], CVSolidElement), CVSolidElement.prototype.initElement = SVGShapeElement.prototype.initElement, CVSolidElement.prototype.prepareFrame = IImageElement.prototype.prepareFrame, CVSolidElement.prototype.renderInnerContent = function() {
        this.globalData.renderer.ctxFillStyle(this.data.sc), this.globalData.renderer.ctxFillRect(0, 0, this.data.sw, this.data.sh);
      };
      function CanvasRendererBase() {
      }
      extendPrototype([BaseRenderer], CanvasRendererBase), CanvasRendererBase.prototype.createShape = function(e) {
        return new CVShapeElement(e, this.globalData, this);
      }, CanvasRendererBase.prototype.createText = function(e) {
        return new CVTextElement(e, this.globalData, this);
      }, CanvasRendererBase.prototype.createImage = function(e) {
        return new CVImageElement(e, this.globalData, this);
      }, CanvasRendererBase.prototype.createSolid = function(e) {
        return new CVSolidElement(e, this.globalData, this);
      }, CanvasRendererBase.prototype.createNull = SVGRenderer.prototype.createNull, CanvasRendererBase.prototype.ctxTransform = function(e) {
        e[0] === 1 && e[1] === 0 && e[4] === 0 && e[5] === 1 && e[12] === 0 && e[13] === 0 || this.canvasContext.transform(e[0], e[1], e[4], e[5], e[12], e[13]);
      }, CanvasRendererBase.prototype.ctxOpacity = function(e) {
        this.canvasContext.globalAlpha *= e < 0 ? 0 : e;
      }, CanvasRendererBase.prototype.ctxFillStyle = function(e) {
        this.canvasContext.fillStyle = e;
      }, CanvasRendererBase.prototype.ctxStrokeStyle = function(e) {
        this.canvasContext.strokeStyle = e;
      }, CanvasRendererBase.prototype.ctxLineWidth = function(e) {
        this.canvasContext.lineWidth = e;
      }, CanvasRendererBase.prototype.ctxLineCap = function(e) {
        this.canvasContext.lineCap = e;
      }, CanvasRendererBase.prototype.ctxLineJoin = function(e) {
        this.canvasContext.lineJoin = e;
      }, CanvasRendererBase.prototype.ctxMiterLimit = function(e) {
        this.canvasContext.miterLimit = e;
      }, CanvasRendererBase.prototype.ctxFill = function(e) {
        this.canvasContext.fill(e);
      }, CanvasRendererBase.prototype.ctxFillRect = function(e, t, r, i) {
        this.canvasContext.fillRect(e, t, r, i);
      }, CanvasRendererBase.prototype.ctxStroke = function() {
        this.canvasContext.stroke();
      }, CanvasRendererBase.prototype.reset = function() {
        if (!this.renderConfig.clearCanvas) {
          this.canvasContext.restore();
          return;
        }
        this.contextData.reset();
      }, CanvasRendererBase.prototype.save = function() {
        this.canvasContext.save();
      }, CanvasRendererBase.prototype.restore = function(e) {
        if (!this.renderConfig.clearCanvas) {
          this.canvasContext.restore();
          return;
        }
        e && (this.globalData.blendMode = "source-over"), this.contextData.restore(e);
      }, CanvasRendererBase.prototype.configAnimation = function(e) {
        if (this.animationItem.wrapper) {
          this.animationItem.container = createTag("canvas");
          var t = this.animationItem.container.style;
          t.width = "100%", t.height = "100%";
          var r = "0px 0px 0px";
          t.transformOrigin = r, t.mozTransformOrigin = r, t.webkitTransformOrigin = r, t["-webkit-transform"] = r, t.contentVisibility = this.renderConfig.contentVisibility, this.animationItem.wrapper.appendChild(this.animationItem.container), this.canvasContext = this.animationItem.container.getContext("2d"), this.renderConfig.className && this.animationItem.container.setAttribute("class", this.renderConfig.className), this.renderConfig.id && this.animationItem.container.setAttribute("id", this.renderConfig.id);
        } else
          this.canvasContext = this.renderConfig.context;
        this.contextData.setContext(this.canvasContext), this.data = e, this.layers = e.layers, this.transformCanvas = {
          w: e.w,
          h: e.h,
          sx: 0,
          sy: 0,
          tx: 0,
          ty: 0
        }, this.setupGlobalData(e, document.body), this.globalData.canvasContext = this.canvasContext, this.globalData.renderer = this, this.globalData.isDashed = !1, this.globalData.progressiveLoad = this.renderConfig.progressiveLoad, this.globalData.transformCanvas = this.transformCanvas, this.elements = createSizedArray(e.layers.length), this.updateContainerSize();
      }, CanvasRendererBase.prototype.updateContainerSize = function(e, t) {
        this.reset();
        var r, i;
        e ? (r = e, i = t, this.canvasContext.canvas.width = r, this.canvasContext.canvas.height = i) : (this.animationItem.wrapper && this.animationItem.container ? (r = this.animationItem.wrapper.offsetWidth, i = this.animationItem.wrapper.offsetHeight) : (r = this.canvasContext.canvas.width, i = this.canvasContext.canvas.height), this.canvasContext.canvas.width = r * this.renderConfig.dpr, this.canvasContext.canvas.height = i * this.renderConfig.dpr);
        var s, n;
        if (this.renderConfig.preserveAspectRatio.indexOf("meet") !== -1 || this.renderConfig.preserveAspectRatio.indexOf("slice") !== -1) {
          var a = this.renderConfig.preserveAspectRatio.split(" "), l = a[1] || "meet", o = a[0] || "xMidYMid", p = o.substr(0, 4), u = o.substr(4);
          s = r / i, n = this.transformCanvas.w / this.transformCanvas.h, n > s && l === "meet" || n < s && l === "slice" ? (this.transformCanvas.sx = r / (this.transformCanvas.w / this.renderConfig.dpr), this.transformCanvas.sy = r / (this.transformCanvas.w / this.renderConfig.dpr)) : (this.transformCanvas.sx = i / (this.transformCanvas.h / this.renderConfig.dpr), this.transformCanvas.sy = i / (this.transformCanvas.h / this.renderConfig.dpr)), p === "xMid" && (n < s && l === "meet" || n > s && l === "slice") ? this.transformCanvas.tx = (r - this.transformCanvas.w * (i / this.transformCanvas.h)) / 2 * this.renderConfig.dpr : p === "xMax" && (n < s && l === "meet" || n > s && l === "slice") ? this.transformCanvas.tx = (r - this.transformCanvas.w * (i / this.transformCanvas.h)) * this.renderConfig.dpr : this.transformCanvas.tx = 0, u === "YMid" && (n > s && l === "meet" || n < s && l === "slice") ? this.transformCanvas.ty = (i - this.transformCanvas.h * (r / this.transformCanvas.w)) / 2 * this.renderConfig.dpr : u === "YMax" && (n > s && l === "meet" || n < s && l === "slice") ? this.transformCanvas.ty = (i - this.transformCanvas.h * (r / this.transformCanvas.w)) * this.renderConfig.dpr : this.transformCanvas.ty = 0;
        } else this.renderConfig.preserveAspectRatio === "none" ? (this.transformCanvas.sx = r / (this.transformCanvas.w / this.renderConfig.dpr), this.transformCanvas.sy = i / (this.transformCanvas.h / this.renderConfig.dpr), this.transformCanvas.tx = 0, this.transformCanvas.ty = 0) : (this.transformCanvas.sx = this.renderConfig.dpr, this.transformCanvas.sy = this.renderConfig.dpr, this.transformCanvas.tx = 0, this.transformCanvas.ty = 0);
        this.transformCanvas.props = [this.transformCanvas.sx, 0, 0, 0, 0, this.transformCanvas.sy, 0, 0, 0, 0, 1, 0, this.transformCanvas.tx, this.transformCanvas.ty, 0, 1], this.ctxTransform(this.transformCanvas.props), this.canvasContext.beginPath(), this.canvasContext.rect(0, 0, this.transformCanvas.w, this.transformCanvas.h), this.canvasContext.closePath(), this.canvasContext.clip(), this.renderFrame(this.renderedFrame, !0);
      }, CanvasRendererBase.prototype.destroy = function() {
        this.renderConfig.clearCanvas && this.animationItem.wrapper && (this.animationItem.wrapper.innerText = "");
        var e, t = this.layers ? this.layers.length : 0;
        for (e = t - 1; e >= 0; e -= 1)
          this.elements[e] && this.elements[e].destroy && this.elements[e].destroy();
        this.elements.length = 0, this.globalData.canvasContext = null, this.animationItem.container = null, this.destroyed = !0;
      }, CanvasRendererBase.prototype.renderFrame = function(e, t) {
        if (!(this.renderedFrame === e && this.renderConfig.clearCanvas === !0 && !t || this.destroyed || e === -1)) {
          this.renderedFrame = e, this.globalData.frameNum = e - this.animationItem._isFirstFrame, this.globalData.frameId += 1, this.globalData._mdf = !this.renderConfig.clearCanvas || t, this.globalData.projectInterface.currentFrame = e;
          var r, i = this.layers.length;
          for (this.completeLayers || this.checkLayers(e), r = i - 1; r >= 0; r -= 1)
            (this.completeLayers || this.elements[r]) && this.elements[r].prepareFrame(e - this.layers[r].st);
          if (this.globalData._mdf) {
            for (this.renderConfig.clearCanvas === !0 ? this.canvasContext.clearRect(0, 0, this.transformCanvas.w, this.transformCanvas.h) : this.save(), r = i - 1; r >= 0; r -= 1)
              (this.completeLayers || this.elements[r]) && this.elements[r].renderFrame();
            this.renderConfig.clearCanvas !== !0 && this.restore();
          }
        }
      }, CanvasRendererBase.prototype.buildItem = function(e) {
        var t = this.elements;
        if (!(t[e] || this.layers[e].ty === 99)) {
          var r = this.createItem(this.layers[e], this, this.globalData);
          t[e] = r, r.initExpressions();
        }
      }, CanvasRendererBase.prototype.checkPendingElements = function() {
        for (; this.pendingElements.length; ) {
          var e = this.pendingElements.pop();
          e.checkParenting();
        }
      }, CanvasRendererBase.prototype.hide = function() {
        this.animationItem.container.style.display = "none";
      }, CanvasRendererBase.prototype.show = function() {
        this.animationItem.container.style.display = "block";
      };
      function CanvasContext() {
        this.opacity = -1, this.transform = createTypedArray("float32", 16), this.fillStyle = "", this.strokeStyle = "", this.lineWidth = "", this.lineCap = "", this.lineJoin = "", this.miterLimit = "", this.id = Math.random();
      }
      function CVContextData() {
        this.stack = [], this.cArrPos = 0, this.cTr = new Matrix();
        var e, t = 15;
        for (e = 0; e < t; e += 1) {
          var r = new CanvasContext();
          this.stack[e] = r;
        }
        this._length = t, this.nativeContext = null, this.transformMat = new Matrix(), this.currentOpacity = 1, this.currentFillStyle = "", this.appliedFillStyle = "", this.currentStrokeStyle = "", this.appliedStrokeStyle = "", this.currentLineWidth = "", this.appliedLineWidth = "", this.currentLineCap = "", this.appliedLineCap = "", this.currentLineJoin = "", this.appliedLineJoin = "", this.appliedMiterLimit = "", this.currentMiterLimit = "";
      }
      CVContextData.prototype.duplicate = function() {
        var e = this._length * 2, t = 0;
        for (t = this._length; t < e; t += 1)
          this.stack[t] = new CanvasContext();
        this._length = e;
      }, CVContextData.prototype.reset = function() {
        this.cArrPos = 0, this.cTr.reset(), this.stack[this.cArrPos].opacity = 1;
      }, CVContextData.prototype.restore = function(e) {
        this.cArrPos -= 1;
        var t = this.stack[this.cArrPos], r = t.transform, i, s = this.cTr.props;
        for (i = 0; i < 16; i += 1)
          s[i] = r[i];
        if (e) {
          this.nativeContext.restore();
          var n = this.stack[this.cArrPos + 1];
          this.appliedFillStyle = n.fillStyle, this.appliedStrokeStyle = n.strokeStyle, this.appliedLineWidth = n.lineWidth, this.appliedLineCap = n.lineCap, this.appliedLineJoin = n.lineJoin, this.appliedMiterLimit = n.miterLimit;
        }
        this.nativeContext.setTransform(r[0], r[1], r[4], r[5], r[12], r[13]), (e || t.opacity !== -1 && this.currentOpacity !== t.opacity) && (this.nativeContext.globalAlpha = t.opacity, this.currentOpacity = t.opacity), this.currentFillStyle = t.fillStyle, this.currentStrokeStyle = t.strokeStyle, this.currentLineWidth = t.lineWidth, this.currentLineCap = t.lineCap, this.currentLineJoin = t.lineJoin, this.currentMiterLimit = t.miterLimit;
      }, CVContextData.prototype.save = function(e) {
        e && this.nativeContext.save();
        var t = this.cTr.props;
        this._length <= this.cArrPos && this.duplicate();
        var r = this.stack[this.cArrPos], i;
        for (i = 0; i < 16; i += 1)
          r.transform[i] = t[i];
        this.cArrPos += 1;
        var s = this.stack[this.cArrPos];
        s.opacity = r.opacity, s.fillStyle = r.fillStyle, s.strokeStyle = r.strokeStyle, s.lineWidth = r.lineWidth, s.lineCap = r.lineCap, s.lineJoin = r.lineJoin, s.miterLimit = r.miterLimit;
      }, CVContextData.prototype.setOpacity = function(e) {
        this.stack[this.cArrPos].opacity = e;
      }, CVContextData.prototype.setContext = function(e) {
        this.nativeContext = e;
      }, CVContextData.prototype.fillStyle = function(e) {
        this.stack[this.cArrPos].fillStyle !== e && (this.currentFillStyle = e, this.stack[this.cArrPos].fillStyle = e);
      }, CVContextData.prototype.strokeStyle = function(e) {
        this.stack[this.cArrPos].strokeStyle !== e && (this.currentStrokeStyle = e, this.stack[this.cArrPos].strokeStyle = e);
      }, CVContextData.prototype.lineWidth = function(e) {
        this.stack[this.cArrPos].lineWidth !== e && (this.currentLineWidth = e, this.stack[this.cArrPos].lineWidth = e);
      }, CVContextData.prototype.lineCap = function(e) {
        this.stack[this.cArrPos].lineCap !== e && (this.currentLineCap = e, this.stack[this.cArrPos].lineCap = e);
      }, CVContextData.prototype.lineJoin = function(e) {
        this.stack[this.cArrPos].lineJoin !== e && (this.currentLineJoin = e, this.stack[this.cArrPos].lineJoin = e);
      }, CVContextData.prototype.miterLimit = function(e) {
        this.stack[this.cArrPos].miterLimit !== e && (this.currentMiterLimit = e, this.stack[this.cArrPos].miterLimit = e);
      }, CVContextData.prototype.transform = function(e) {
        this.transformMat.cloneFromProps(e);
        var t = this.cTr;
        this.transformMat.multiply(t), t.cloneFromProps(this.transformMat.props);
        var r = t.props;
        this.nativeContext.setTransform(r[0], r[1], r[4], r[5], r[12], r[13]);
      }, CVContextData.prototype.opacity = function(e) {
        var t = this.stack[this.cArrPos].opacity;
        t *= e < 0 ? 0 : e, this.stack[this.cArrPos].opacity !== t && (this.currentOpacity !== e && (this.nativeContext.globalAlpha = e, this.currentOpacity = e), this.stack[this.cArrPos].opacity = t);
      }, CVContextData.prototype.fill = function(e) {
        this.appliedFillStyle !== this.currentFillStyle && (this.appliedFillStyle = this.currentFillStyle, this.nativeContext.fillStyle = this.appliedFillStyle), this.nativeContext.fill(e);
      }, CVContextData.prototype.fillRect = function(e, t, r, i) {
        this.appliedFillStyle !== this.currentFillStyle && (this.appliedFillStyle = this.currentFillStyle, this.nativeContext.fillStyle = this.appliedFillStyle), this.nativeContext.fillRect(e, t, r, i);
      }, CVContextData.prototype.stroke = function() {
        this.appliedStrokeStyle !== this.currentStrokeStyle && (this.appliedStrokeStyle = this.currentStrokeStyle, this.nativeContext.strokeStyle = this.appliedStrokeStyle), this.appliedLineWidth !== this.currentLineWidth && (this.appliedLineWidth = this.currentLineWidth, this.nativeContext.lineWidth = this.appliedLineWidth), this.appliedLineCap !== this.currentLineCap && (this.appliedLineCap = this.currentLineCap, this.nativeContext.lineCap = this.appliedLineCap), this.appliedLineJoin !== this.currentLineJoin && (this.appliedLineJoin = this.currentLineJoin, this.nativeContext.lineJoin = this.appliedLineJoin), this.appliedMiterLimit !== this.currentMiterLimit && (this.appliedMiterLimit = this.currentMiterLimit, this.nativeContext.miterLimit = this.appliedMiterLimit), this.nativeContext.stroke();
      };
      function CVCompElement(e, t, r) {
        this.completeLayers = !1, this.layers = e.layers, this.pendingElements = [], this.elements = createSizedArray(this.layers.length), this.initElement(e, t, r), this.tm = e.tm ? PropertyFactory.getProp(this, e.tm, 0, t.frameRate, this) : {
          _placeholder: !0
        };
      }
      extendPrototype([CanvasRendererBase, ICompElement, CVBaseElement], CVCompElement), CVCompElement.prototype.renderInnerContent = function() {
        var e = this.canvasContext;
        e.beginPath(), e.moveTo(0, 0), e.lineTo(this.data.w, 0), e.lineTo(this.data.w, this.data.h), e.lineTo(0, this.data.h), e.lineTo(0, 0), e.clip();
        var t, r = this.layers.length;
        for (t = r - 1; t >= 0; t -= 1)
          (this.completeLayers || this.elements[t]) && this.elements[t].renderFrame();
      }, CVCompElement.prototype.destroy = function() {
        var e, t = this.layers.length;
        for (e = t - 1; e >= 0; e -= 1)
          this.elements[e] && this.elements[e].destroy();
        this.layers = null, this.elements = null;
      }, CVCompElement.prototype.createComp = function(e) {
        return new CVCompElement(e, this.globalData, this);
      };
      function CanvasRenderer(e, t) {
        this.animationItem = e, this.renderConfig = {
          clearCanvas: t && t.clearCanvas !== void 0 ? t.clearCanvas : !0,
          context: t && t.context || null,
          progressiveLoad: t && t.progressiveLoad || !1,
          preserveAspectRatio: t && t.preserveAspectRatio || "xMidYMid meet",
          imagePreserveAspectRatio: t && t.imagePreserveAspectRatio || "xMidYMid slice",
          contentVisibility: t && t.contentVisibility || "visible",
          className: t && t.className || "",
          id: t && t.id || "",
          runExpressions: !t || t.runExpressions === void 0 || t.runExpressions
        }, this.renderConfig.dpr = t && t.dpr || 1, this.animationItem.wrapper && (this.renderConfig.dpr = t && t.dpr || window.devicePixelRatio || 1), this.renderedFrame = -1, this.globalData = {
          frameNum: -1,
          _mdf: !1,
          renderConfig: this.renderConfig,
          currentGlobalAlpha: -1
        }, this.contextData = new CVContextData(), this.elements = [], this.pendingElements = [], this.transformMat = new Matrix(), this.completeLayers = !1, this.rendererType = "canvas", this.renderConfig.clearCanvas && (this.ctxTransform = this.contextData.transform.bind(this.contextData), this.ctxOpacity = this.contextData.opacity.bind(this.contextData), this.ctxFillStyle = this.contextData.fillStyle.bind(this.contextData), this.ctxStrokeStyle = this.contextData.strokeStyle.bind(this.contextData), this.ctxLineWidth = this.contextData.lineWidth.bind(this.contextData), this.ctxLineCap = this.contextData.lineCap.bind(this.contextData), this.ctxLineJoin = this.contextData.lineJoin.bind(this.contextData), this.ctxMiterLimit = this.contextData.miterLimit.bind(this.contextData), this.ctxFill = this.contextData.fill.bind(this.contextData), this.ctxFillRect = this.contextData.fillRect.bind(this.contextData), this.ctxStroke = this.contextData.stroke.bind(this.contextData), this.save = this.contextData.save.bind(this.contextData));
      }
      extendPrototype([CanvasRendererBase], CanvasRenderer), CanvasRenderer.prototype.createComp = function(e) {
        return new CVCompElement(e, this.globalData, this);
      };
      function HBaseElement() {
      }
      HBaseElement.prototype = {
        checkBlendMode: function() {
        },
        initRendererElement: function() {
          this.baseElement = createTag(this.data.tg || "div"), this.data.hasMask ? (this.svgElement = createNS("svg"), this.layerElement = createNS("g"), this.maskedElement = this.layerElement, this.svgElement.appendChild(this.layerElement), this.baseElement.appendChild(this.svgElement)) : this.layerElement = this.baseElement, styleDiv(this.baseElement);
        },
        createContainerElements: function() {
          this.renderableEffectsManager = new CVEffects(this), this.transformedElement = this.baseElement, this.maskedElement = this.layerElement, this.data.ln && this.layerElement.setAttribute("id", this.data.ln), this.data.cl && this.layerElement.setAttribute("class", this.data.cl), this.data.bm !== 0 && this.setBlendMode();
        },
        renderElement: function() {
          var t = this.transformedElement ? this.transformedElement.style : {};
          if (this.finalTransform._matMdf) {
            var r = this.finalTransform.mat.toCSS();
            t.transform = r, t.webkitTransform = r;
          }
          this.finalTransform._opMdf && (t.opacity = this.finalTransform.mProp.o.v);
        },
        renderFrame: function() {
          this.data.hd || this.hidden || (this.renderTransform(), this.renderRenderable(), this.renderElement(), this.renderInnerContent(), this._isFirstFrame && (this._isFirstFrame = !1));
        },
        destroy: function() {
          this.layerElement = null, this.transformedElement = null, this.matteElement && (this.matteElement = null), this.maskManager && (this.maskManager.destroy(), this.maskManager = null);
        },
        createRenderableComponents: function() {
          this.maskManager = new MaskElement(this.data, this, this.globalData);
        },
        addEffects: function() {
        },
        setMatte: function() {
        }
      }, HBaseElement.prototype.getBaseElement = SVGBaseElement.prototype.getBaseElement, HBaseElement.prototype.destroyBaseElement = HBaseElement.prototype.destroy, HBaseElement.prototype.buildElementParenting = BaseRenderer.prototype.buildElementParenting;
      function HSolidElement(e, t, r) {
        this.initElement(e, t, r);
      }
      extendPrototype([BaseElement, TransformElement, HBaseElement, HierarchyElement, FrameElement, RenderableDOMElement], HSolidElement), HSolidElement.prototype.createContent = function() {
        var e;
        this.data.hasMask ? (e = createNS("rect"), e.setAttribute("width", this.data.sw), e.setAttribute("height", this.data.sh), e.setAttribute("fill", this.data.sc), this.svgElement.setAttribute("width", this.data.sw), this.svgElement.setAttribute("height", this.data.sh)) : (e = createTag("div"), e.style.width = this.data.sw + "px", e.style.height = this.data.sh + "px", e.style.backgroundColor = this.data.sc), this.layerElement.appendChild(e);
      };
      function HShapeElement(e, t, r) {
        this.shapes = [], this.shapesData = e.shapes, this.stylesList = [], this.shapeModifiers = [], this.itemsData = [], this.processedElements = [], this.animatedContents = [], this.shapesContainer = createNS("g"), this.initElement(e, t, r), this.prevViewData = [], this.currentBBox = {
          x: 999999,
          y: -999999,
          h: 0,
          w: 0
        };
      }
      extendPrototype([BaseElement, TransformElement, HSolidElement, SVGShapeElement, HBaseElement, HierarchyElement, FrameElement, RenderableElement], HShapeElement), HShapeElement.prototype._renderShapeFrame = HShapeElement.prototype.renderInnerContent, HShapeElement.prototype.createContent = function() {
        var e;
        if (this.baseElement.style.fontSize = 0, this.data.hasMask)
          this.layerElement.appendChild(this.shapesContainer), e = this.svgElement;
        else {
          e = createNS("svg");
          var t = this.comp.data ? this.comp.data : this.globalData.compSize;
          e.setAttribute("width", t.w), e.setAttribute("height", t.h), e.appendChild(this.shapesContainer), this.layerElement.appendChild(e);
        }
        this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, this.shapesContainer, 0, [], !0), this.filterUniqueShapes(), this.shapeCont = e;
      }, HShapeElement.prototype.getTransformedPoint = function(e, t) {
        var r, i = e.length;
        for (r = 0; r < i; r += 1)
          t = e[r].mProps.v.applyToPointArray(t[0], t[1], 0);
        return t;
      }, HShapeElement.prototype.calculateShapeBoundingBox = function(e, t) {
        var r = e.sh.v, i = e.transformers, s, n = r._length, a, l, o, p;
        if (!(n <= 1)) {
          for (s = 0; s < n - 1; s += 1)
            a = this.getTransformedPoint(i, r.v[s]), l = this.getTransformedPoint(i, r.o[s]), o = this.getTransformedPoint(i, r.i[s + 1]), p = this.getTransformedPoint(i, r.v[s + 1]), this.checkBounds(a, l, o, p, t);
          r.c && (a = this.getTransformedPoint(i, r.v[s]), l = this.getTransformedPoint(i, r.o[s]), o = this.getTransformedPoint(i, r.i[0]), p = this.getTransformedPoint(i, r.v[0]), this.checkBounds(a, l, o, p, t));
        }
      }, HShapeElement.prototype.checkBounds = function(e, t, r, i, s) {
        this.getBoundsOfCurve(e, t, r, i);
        var n = this.shapeBoundingBox;
        s.x = bmMin(n.left, s.x), s.xMax = bmMax(n.right, s.xMax), s.y = bmMin(n.top, s.y), s.yMax = bmMax(n.bottom, s.yMax);
      }, HShapeElement.prototype.shapeBoundingBox = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }, HShapeElement.prototype.tempBoundingBox = {
        x: 0,
        xMax: 0,
        y: 0,
        yMax: 0,
        width: 0,
        height: 0
      }, HShapeElement.prototype.getBoundsOfCurve = function(e, t, r, i) {
        for (var s = [[e[0], i[0]], [e[1], i[1]]], n, a, l, o, p, u, S, f = 0; f < 2; ++f)
          a = 6 * e[f] - 12 * t[f] + 6 * r[f], n = -3 * e[f] + 9 * t[f] - 9 * r[f] + 3 * i[f], l = 3 * t[f] - 3 * e[f], a |= 0, n |= 0, l |= 0, n === 0 && a === 0 || (n === 0 ? (o = -l / a, o > 0 && o < 1 && s[f].push(this.calculateF(o, e, t, r, i, f))) : (p = a * a - 4 * l * n, p >= 0 && (u = (-a + bmSqrt(p)) / (2 * n), u > 0 && u < 1 && s[f].push(this.calculateF(u, e, t, r, i, f)), S = (-a - bmSqrt(p)) / (2 * n), S > 0 && S < 1 && s[f].push(this.calculateF(S, e, t, r, i, f)))));
        this.shapeBoundingBox.left = bmMin.apply(null, s[0]), this.shapeBoundingBox.top = bmMin.apply(null, s[1]), this.shapeBoundingBox.right = bmMax.apply(null, s[0]), this.shapeBoundingBox.bottom = bmMax.apply(null, s[1]);
      }, HShapeElement.prototype.calculateF = function(e, t, r, i, s, n) {
        return bmPow(1 - e, 3) * t[n] + 3 * bmPow(1 - e, 2) * e * r[n] + 3 * (1 - e) * bmPow(e, 2) * i[n] + bmPow(e, 3) * s[n];
      }, HShapeElement.prototype.calculateBoundingBox = function(e, t) {
        var r, i = e.length;
        for (r = 0; r < i; r += 1)
          e[r] && e[r].sh ? this.calculateShapeBoundingBox(e[r], t) : e[r] && e[r].it ? this.calculateBoundingBox(e[r].it, t) : e[r] && e[r].style && e[r].w && this.expandStrokeBoundingBox(e[r].w, t);
      }, HShapeElement.prototype.expandStrokeBoundingBox = function(e, t) {
        var r = 0;
        if (e.keyframes) {
          for (var i = 0; i < e.keyframes.length; i += 1) {
            var s = e.keyframes[i].s;
            s > r && (r = s);
          }
          r *= e.mult;
        } else
          r = e.v * e.mult;
        t.x -= r, t.xMax += r, t.y -= r, t.yMax += r;
      }, HShapeElement.prototype.currentBoxContains = function(e) {
        return this.currentBBox.x <= e.x && this.currentBBox.y <= e.y && this.currentBBox.width + this.currentBBox.x >= e.x + e.width && this.currentBBox.height + this.currentBBox.y >= e.y + e.height;
      }, HShapeElement.prototype.renderInnerContent = function() {
        if (this._renderShapeFrame(), !this.hidden && (this._isFirstFrame || this._mdf)) {
          var e = this.tempBoundingBox, t = 999999;
          if (e.x = t, e.xMax = -t, e.y = t, e.yMax = -t, this.calculateBoundingBox(this.itemsData, e), e.width = e.xMax < e.x ? 0 : e.xMax - e.x, e.height = e.yMax < e.y ? 0 : e.yMax - e.y, this.currentBoxContains(e))
            return;
          var r = !1;
          if (this.currentBBox.w !== e.width && (this.currentBBox.w = e.width, this.shapeCont.setAttribute("width", e.width), r = !0), this.currentBBox.h !== e.height && (this.currentBBox.h = e.height, this.shapeCont.setAttribute("height", e.height), r = !0), r || this.currentBBox.x !== e.x || this.currentBBox.y !== e.y) {
            this.currentBBox.w = e.width, this.currentBBox.h = e.height, this.currentBBox.x = e.x, this.currentBBox.y = e.y, this.shapeCont.setAttribute("viewBox", this.currentBBox.x + " " + this.currentBBox.y + " " + this.currentBBox.w + " " + this.currentBBox.h);
            var i = this.shapeCont.style, s = "translate(" + this.currentBBox.x + "px," + this.currentBBox.y + "px)";
            i.transform = s, i.webkitTransform = s;
          }
        }
      };
      function HTextElement(e, t, r) {
        this.textSpans = [], this.textPaths = [], this.currentBBox = {
          x: 999999,
          y: -999999,
          h: 0,
          w: 0
        }, this.renderType = "svg", this.isMasked = !1, this.initElement(e, t, r);
      }
      extendPrototype([BaseElement, TransformElement, HBaseElement, HierarchyElement, FrameElement, RenderableDOMElement, ITextElement], HTextElement), HTextElement.prototype.createContent = function() {
        if (this.isMasked = this.checkMasks(), this.isMasked) {
          this.renderType = "svg", this.compW = this.comp.data.w, this.compH = this.comp.data.h, this.svgElement.setAttribute("width", this.compW), this.svgElement.setAttribute("height", this.compH);
          var e = createNS("g");
          this.maskedElement.appendChild(e), this.innerElem = e;
        } else
          this.renderType = "html", this.innerElem = this.layerElement;
        this.checkParenting();
      }, HTextElement.prototype.buildNewText = function() {
        var e = this.textProperty.currentData;
        this.renderedLetters = createSizedArray(e.l ? e.l.length : 0);
        var t = this.innerElem.style, r = e.fc ? this.buildColor(e.fc) : "rgba(0,0,0,0)";
        t.fill = r, t.color = r, e.sc && (t.stroke = this.buildColor(e.sc), t.strokeWidth = e.sw + "px");
        var i = this.globalData.fontManager.getFontByName(e.f);
        if (!this.globalData.fontManager.chars)
          if (t.fontSize = e.finalSize + "px", t.lineHeight = e.finalSize + "px", i.fClass)
            this.innerElem.className = i.fClass;
          else {
            t.fontFamily = i.fFamily;
            var s = e.fWeight, n = e.fStyle;
            t.fontStyle = n, t.fontWeight = s;
          }
        var a, l, o = e.l;
        l = o.length;
        var p, u, S, f = this.mHelper, b, v = "", m = 0;
        for (a = 0; a < l; a += 1) {
          if (this.globalData.fontManager.chars ? (this.textPaths[m] ? p = this.textPaths[m] : (p = createNS("path"), p.setAttribute("stroke-linecap", lineCapEnum[1]), p.setAttribute("stroke-linejoin", lineJoinEnum[2]), p.setAttribute("stroke-miterlimit", "4")), this.isMasked || (this.textSpans[m] ? (u = this.textSpans[m], S = u.children[0]) : (u = createTag("div"), u.style.lineHeight = 0, S = createNS("svg"), S.appendChild(p), styleDiv(u)))) : this.isMasked ? p = this.textPaths[m] ? this.textPaths[m] : createNS("text") : this.textSpans[m] ? (u = this.textSpans[m], p = this.textPaths[m]) : (u = createTag("span"), styleDiv(u), p = createTag("span"), styleDiv(p), u.appendChild(p)), this.globalData.fontManager.chars) {
            var x = this.globalData.fontManager.getCharData(e.finalText[a], i.fStyle, this.globalData.fontManager.getFontByName(e.f).fFamily), c;
            if (x ? c = x.data : c = null, f.reset(), c && c.shapes && c.shapes.length && (b = c.shapes[0].it, f.scale(e.finalSize / 100, e.finalSize / 100), v = this.createPathShape(f, b), p.setAttribute("d", v)), this.isMasked)
              this.innerElem.appendChild(p);
            else {
              if (this.innerElem.appendChild(u), c && c.shapes) {
                document.body.appendChild(S);
                var d = S.getBBox();
                S.setAttribute("width", d.width + 2), S.setAttribute("height", d.height + 2), S.setAttribute("viewBox", d.x - 1 + " " + (d.y - 1) + " " + (d.width + 2) + " " + (d.height + 2));
                var h = S.style, y = "translate(" + (d.x - 1) + "px," + (d.y - 1) + "px)";
                h.transform = y, h.webkitTransform = y, o[a].yOffset = d.y - 1;
              } else
                S.setAttribute("width", 1), S.setAttribute("height", 1);
              u.appendChild(S);
            }
          } else if (p.textContent = o[a].val, p.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve"), this.isMasked)
            this.innerElem.appendChild(p);
          else {
            this.innerElem.appendChild(u);
            var P = p.style, A = "translate3d(0," + -e.finalSize / 1.2 + "px,0)";
            P.transform = A, P.webkitTransform = A;
          }
          this.isMasked ? this.textSpans[m] = p : this.textSpans[m] = u, this.textSpans[m].style.display = "block", this.textPaths[m] = p, m += 1;
        }
        for (; m < this.textSpans.length; )
          this.textSpans[m].style.display = "none", m += 1;
      }, HTextElement.prototype.renderInnerContent = function() {
        this.validateText();
        var e;
        if (this.data.singleShape) {
          if (!this._isFirstFrame && !this.lettersChangedFlag)
            return;
          if (this.isMasked && this.finalTransform._matMdf) {
            this.svgElement.setAttribute("viewBox", -this.finalTransform.mProp.p.v[0] + " " + -this.finalTransform.mProp.p.v[1] + " " + this.compW + " " + this.compH), e = this.svgElement.style;
            var t = "translate(" + -this.finalTransform.mProp.p.v[0] + "px," + -this.finalTransform.mProp.p.v[1] + "px)";
            e.transform = t, e.webkitTransform = t;
          }
        }
        if (this.textAnimator.getMeasures(this.textProperty.currentData, this.lettersChangedFlag), !(!this.lettersChangedFlag && !this.textAnimator.lettersChangedFlag)) {
          var r, i, s = 0, n = this.textAnimator.renderedLetters, a = this.textProperty.currentData.l;
          i = a.length;
          var l, o, p;
          for (r = 0; r < i; r += 1)
            a[r].n ? s += 1 : (o = this.textSpans[r], p = this.textPaths[r], l = n[s], s += 1, l._mdf.m && (this.isMasked ? o.setAttribute("transform", l.m) : (o.style.webkitTransform = l.m, o.style.transform = l.m)), o.style.opacity = l.o, l.sw && l._mdf.sw && p.setAttribute("stroke-width", l.sw), l.sc && l._mdf.sc && p.setAttribute("stroke", l.sc), l.fc && l._mdf.fc && (p.setAttribute("fill", l.fc), p.style.color = l.fc));
          if (this.innerElem.getBBox && !this.hidden && (this._isFirstFrame || this._mdf)) {
            var u = this.innerElem.getBBox();
            this.currentBBox.w !== u.width && (this.currentBBox.w = u.width, this.svgElement.setAttribute("width", u.width)), this.currentBBox.h !== u.height && (this.currentBBox.h = u.height, this.svgElement.setAttribute("height", u.height));
            var S = 1;
            if (this.currentBBox.w !== u.width + S * 2 || this.currentBBox.h !== u.height + S * 2 || this.currentBBox.x !== u.x - S || this.currentBBox.y !== u.y - S) {
              this.currentBBox.w = u.width + S * 2, this.currentBBox.h = u.height + S * 2, this.currentBBox.x = u.x - S, this.currentBBox.y = u.y - S, this.svgElement.setAttribute("viewBox", this.currentBBox.x + " " + this.currentBBox.y + " " + this.currentBBox.w + " " + this.currentBBox.h), e = this.svgElement.style;
              var f = "translate(" + this.currentBBox.x + "px," + this.currentBBox.y + "px)";
              e.transform = f, e.webkitTransform = f;
            }
          }
        }
      };
      function HCameraElement(e, t, r) {
        this.initFrame(), this.initBaseData(e, t, r), this.initHierarchy();
        var i = PropertyFactory.getProp;
        if (this.pe = i(this, e.pe, 0, 0, this), e.ks.p.s ? (this.px = i(this, e.ks.p.x, 1, 0, this), this.py = i(this, e.ks.p.y, 1, 0, this), this.pz = i(this, e.ks.p.z, 1, 0, this)) : this.p = i(this, e.ks.p, 1, 0, this), e.ks.a && (this.a = i(this, e.ks.a, 1, 0, this)), e.ks.or.k.length && e.ks.or.k[0].to) {
          var s, n = e.ks.or.k.length;
          for (s = 0; s < n; s += 1)
            e.ks.or.k[s].to = null, e.ks.or.k[s].ti = null;
        }
        this.or = i(this, e.ks.or, 1, degToRads, this), this.or.sh = !0, this.rx = i(this, e.ks.rx, 0, degToRads, this), this.ry = i(this, e.ks.ry, 0, degToRads, this), this.rz = i(this, e.ks.rz, 0, degToRads, this), this.mat = new Matrix(), this._prevMat = new Matrix(), this._isFirstFrame = !0, this.finalTransform = {
          mProp: this
        };
      }
      extendPrototype([BaseElement, FrameElement, HierarchyElement], HCameraElement), HCameraElement.prototype.setup = function() {
        var e, t = this.comp.threeDElements.length, r, i, s;
        for (e = 0; e < t; e += 1)
          if (r = this.comp.threeDElements[e], r.type === "3d") {
            i = r.perspectiveElem.style, s = r.container.style;
            var n = this.pe.v + "px", a = "0px 0px 0px", l = "matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)";
            i.perspective = n, i.webkitPerspective = n, s.transformOrigin = a, s.mozTransformOrigin = a, s.webkitTransformOrigin = a, i.transform = l, i.webkitTransform = l;
          }
      }, HCameraElement.prototype.createElements = function() {
      }, HCameraElement.prototype.hide = function() {
      }, HCameraElement.prototype.renderFrame = function() {
        var e = this._isFirstFrame, t, r;
        if (this.hierarchy)
          for (r = this.hierarchy.length, t = 0; t < r; t += 1)
            e = this.hierarchy[t].finalTransform.mProp._mdf || e;
        if (e || this.pe._mdf || this.p && this.p._mdf || this.px && (this.px._mdf || this.py._mdf || this.pz._mdf) || this.rx._mdf || this.ry._mdf || this.rz._mdf || this.or._mdf || this.a && this.a._mdf) {
          if (this.mat.reset(), this.hierarchy)
            for (r = this.hierarchy.length - 1, t = r; t >= 0; t -= 1) {
              var i = this.hierarchy[t].finalTransform.mProp;
              this.mat.translate(-i.p.v[0], -i.p.v[1], i.p.v[2]), this.mat.rotateX(-i.or.v[0]).rotateY(-i.or.v[1]).rotateZ(i.or.v[2]), this.mat.rotateX(-i.rx.v).rotateY(-i.ry.v).rotateZ(i.rz.v), this.mat.scale(1 / i.s.v[0], 1 / i.s.v[1], 1 / i.s.v[2]), this.mat.translate(i.a.v[0], i.a.v[1], i.a.v[2]);
            }
          if (this.p ? this.mat.translate(-this.p.v[0], -this.p.v[1], this.p.v[2]) : this.mat.translate(-this.px.v, -this.py.v, this.pz.v), this.a) {
            var s;
            this.p ? s = [this.p.v[0] - this.a.v[0], this.p.v[1] - this.a.v[1], this.p.v[2] - this.a.v[2]] : s = [this.px.v - this.a.v[0], this.py.v - this.a.v[1], this.pz.v - this.a.v[2]];
            var n = Math.sqrt(Math.pow(s[0], 2) + Math.pow(s[1], 2) + Math.pow(s[2], 2)), a = [s[0] / n, s[1] / n, s[2] / n], l = Math.sqrt(a[2] * a[2] + a[0] * a[0]), o = Math.atan2(a[1], l), p = Math.atan2(a[0], -a[2]);
            this.mat.rotateY(p).rotateX(-o);
          }
          this.mat.rotateX(-this.rx.v).rotateY(-this.ry.v).rotateZ(this.rz.v), this.mat.rotateX(-this.or.v[0]).rotateY(-this.or.v[1]).rotateZ(this.or.v[2]), this.mat.translate(this.globalData.compSize.w / 2, this.globalData.compSize.h / 2, 0), this.mat.translate(0, 0, this.pe.v);
          var u = !this._prevMat.equals(this.mat);
          if ((u || this.pe._mdf) && this.comp.threeDElements) {
            r = this.comp.threeDElements.length;
            var S, f, b;
            for (t = 0; t < r; t += 1)
              if (S = this.comp.threeDElements[t], S.type === "3d") {
                if (u) {
                  var v = this.mat.toCSS();
                  b = S.container.style, b.transform = v, b.webkitTransform = v;
                }
                this.pe._mdf && (f = S.perspectiveElem.style, f.perspective = this.pe.v + "px", f.webkitPerspective = this.pe.v + "px");
              }
            this.mat.clone(this._prevMat);
          }
        }
        this._isFirstFrame = !1;
      }, HCameraElement.prototype.prepareFrame = function(e) {
        this.prepareProperties(e, !0);
      }, HCameraElement.prototype.destroy = function() {
      }, HCameraElement.prototype.getBaseElement = function() {
        return null;
      };
      function HImageElement(e, t, r) {
        this.assetData = t.getAssetData(e.refId), this.initElement(e, t, r);
      }
      extendPrototype([BaseElement, TransformElement, HBaseElement, HSolidElement, HierarchyElement, FrameElement, RenderableElement], HImageElement), HImageElement.prototype.createContent = function() {
        var e = this.globalData.getAssetsPath(this.assetData), t = new Image();
        this.data.hasMask ? (this.imageElem = createNS("image"), this.imageElem.setAttribute("width", this.assetData.w + "px"), this.imageElem.setAttribute("height", this.assetData.h + "px"), this.imageElem.setAttributeNS("http://www.w3.org/1999/xlink", "href", e), this.layerElement.appendChild(this.imageElem), this.baseElement.setAttribute("width", this.assetData.w), this.baseElement.setAttribute("height", this.assetData.h)) : this.layerElement.appendChild(t), t.crossOrigin = "anonymous", t.src = e, this.data.ln && this.baseElement.setAttribute("id", this.data.ln);
      };
      function HybridRendererBase(e, t) {
        this.animationItem = e, this.layers = null, this.renderedFrame = -1, this.renderConfig = {
          className: t && t.className || "",
          imagePreserveAspectRatio: t && t.imagePreserveAspectRatio || "xMidYMid slice",
          hideOnTransparent: !(t && t.hideOnTransparent === !1),
          filterSize: {
            width: t && t.filterSize && t.filterSize.width || "400%",
            height: t && t.filterSize && t.filterSize.height || "400%",
            x: t && t.filterSize && t.filterSize.x || "-100%",
            y: t && t.filterSize && t.filterSize.y || "-100%"
          }
        }, this.globalData = {
          _mdf: !1,
          frameNum: -1,
          renderConfig: this.renderConfig
        }, this.pendingElements = [], this.elements = [], this.threeDElements = [], this.destroyed = !1, this.camera = null, this.supports3d = !0, this.rendererType = "html";
      }
      extendPrototype([BaseRenderer], HybridRendererBase), HybridRendererBase.prototype.buildItem = SVGRenderer.prototype.buildItem, HybridRendererBase.prototype.checkPendingElements = function() {
        for (; this.pendingElements.length; ) {
          var e = this.pendingElements.pop();
          e.checkParenting();
        }
      }, HybridRendererBase.prototype.appendElementInPos = function(e, t) {
        var r = e.getBaseElement();
        if (r) {
          var i = this.layers[t];
          if (!i.ddd || !this.supports3d)
            if (this.threeDElements)
              this.addTo3dContainer(r, t);
            else {
              for (var s = 0, n, a, l; s < t; )
                this.elements[s] && this.elements[s] !== !0 && this.elements[s].getBaseElement && (a = this.elements[s], l = this.layers[s].ddd ? this.getThreeDContainerByPos(s) : a.getBaseElement(), n = l || n), s += 1;
              n ? (!i.ddd || !this.supports3d) && this.layerElement.insertBefore(r, n) : (!i.ddd || !this.supports3d) && this.layerElement.appendChild(r);
            }
          else
            this.addTo3dContainer(r, t);
        }
      }, HybridRendererBase.prototype.createShape = function(e) {
        return this.supports3d ? new HShapeElement(e, this.globalData, this) : new SVGShapeElement(e, this.globalData, this);
      }, HybridRendererBase.prototype.createText = function(e) {
        return this.supports3d ? new HTextElement(e, this.globalData, this) : new SVGTextLottieElement(e, this.globalData, this);
      }, HybridRendererBase.prototype.createCamera = function(e) {
        return this.camera = new HCameraElement(e, this.globalData, this), this.camera;
      }, HybridRendererBase.prototype.createImage = function(e) {
        return this.supports3d ? new HImageElement(e, this.globalData, this) : new IImageElement(e, this.globalData, this);
      }, HybridRendererBase.prototype.createSolid = function(e) {
        return this.supports3d ? new HSolidElement(e, this.globalData, this) : new ISolidElement(e, this.globalData, this);
      }, HybridRendererBase.prototype.createNull = SVGRenderer.prototype.createNull, HybridRendererBase.prototype.getThreeDContainerByPos = function(e) {
        for (var t = 0, r = this.threeDElements.length; t < r; ) {
          if (this.threeDElements[t].startPos <= e && this.threeDElements[t].endPos >= e)
            return this.threeDElements[t].perspectiveElem;
          t += 1;
        }
        return null;
      }, HybridRendererBase.prototype.createThreeDContainer = function(e, t) {
        var r = createTag("div"), i, s;
        styleDiv(r);
        var n = createTag("div");
        if (styleDiv(n), t === "3d") {
          i = r.style, i.width = this.globalData.compSize.w + "px", i.height = this.globalData.compSize.h + "px";
          var a = "50% 50%";
          i.webkitTransformOrigin = a, i.mozTransformOrigin = a, i.transformOrigin = a, s = n.style;
          var l = "matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)";
          s.transform = l, s.webkitTransform = l;
        }
        r.appendChild(n);
        var o = {
          container: n,
          perspectiveElem: r,
          startPos: e,
          endPos: e,
          type: t
        };
        return this.threeDElements.push(o), o;
      }, HybridRendererBase.prototype.build3dContainers = function() {
        var e, t = this.layers.length, r, i = "";
        for (e = 0; e < t; e += 1)
          this.layers[e].ddd && this.layers[e].ty !== 3 ? (i !== "3d" && (i = "3d", r = this.createThreeDContainer(e, "3d")), r.endPos = Math.max(r.endPos, e)) : (i !== "2d" && (i = "2d", r = this.createThreeDContainer(e, "2d")), r.endPos = Math.max(r.endPos, e));
        for (t = this.threeDElements.length, e = t - 1; e >= 0; e -= 1)
          this.resizerElem.appendChild(this.threeDElements[e].perspectiveElem);
      }, HybridRendererBase.prototype.addTo3dContainer = function(e, t) {
        for (var r = 0, i = this.threeDElements.length; r < i; ) {
          if (t <= this.threeDElements[r].endPos) {
            for (var s = this.threeDElements[r].startPos, n; s < t; )
              this.elements[s] && this.elements[s].getBaseElement && (n = this.elements[s].getBaseElement()), s += 1;
            n ? this.threeDElements[r].container.insertBefore(e, n) : this.threeDElements[r].container.appendChild(e);
            break;
          }
          r += 1;
        }
      }, HybridRendererBase.prototype.configAnimation = function(e) {
        var t = createTag("div"), r = this.animationItem.wrapper, i = t.style;
        i.width = e.w + "px", i.height = e.h + "px", this.resizerElem = t, styleDiv(t), i.transformStyle = "flat", i.mozTransformStyle = "flat", i.webkitTransformStyle = "flat", this.renderConfig.className && t.setAttribute("class", this.renderConfig.className), r.appendChild(t), i.overflow = "hidden";
        var s = createNS("svg");
        s.setAttribute("width", "1"), s.setAttribute("height", "1"), styleDiv(s), this.resizerElem.appendChild(s);
        var n = createNS("defs");
        s.appendChild(n), this.data = e, this.setupGlobalData(e, s), this.globalData.defs = n, this.layers = e.layers, this.layerElement = this.resizerElem, this.build3dContainers(), this.updateContainerSize();
      }, HybridRendererBase.prototype.destroy = function() {
        this.animationItem.wrapper && (this.animationItem.wrapper.innerText = ""), this.animationItem.container = null, this.globalData.defs = null;
        var e, t = this.layers ? this.layers.length : 0;
        for (e = 0; e < t; e += 1)
          this.elements[e] && this.elements[e].destroy && this.elements[e].destroy();
        this.elements.length = 0, this.destroyed = !0, this.animationItem = null;
      }, HybridRendererBase.prototype.updateContainerSize = function() {
        var e = this.animationItem.wrapper.offsetWidth, t = this.animationItem.wrapper.offsetHeight, r = e / t, i = this.globalData.compSize.w / this.globalData.compSize.h, s, n, a, l;
        i > r ? (s = e / this.globalData.compSize.w, n = e / this.globalData.compSize.w, a = 0, l = (t - this.globalData.compSize.h * (e / this.globalData.compSize.w)) / 2) : (s = t / this.globalData.compSize.h, n = t / this.globalData.compSize.h, a = (e - this.globalData.compSize.w * (t / this.globalData.compSize.h)) / 2, l = 0);
        var o = this.resizerElem.style;
        o.webkitTransform = "matrix3d(" + s + ",0,0,0,0," + n + ",0,0,0,0,1,0," + a + "," + l + ",0,1)", o.transform = o.webkitTransform;
      }, HybridRendererBase.prototype.renderFrame = SVGRenderer.prototype.renderFrame, HybridRendererBase.prototype.hide = function() {
        this.resizerElem.style.display = "none";
      }, HybridRendererBase.prototype.show = function() {
        this.resizerElem.style.display = "block";
      }, HybridRendererBase.prototype.initItems = function() {
        if (this.buildAllItems(), this.camera)
          this.camera.setup();
        else {
          var e = this.globalData.compSize.w, t = this.globalData.compSize.h, r, i = this.threeDElements.length;
          for (r = 0; r < i; r += 1) {
            var s = this.threeDElements[r].perspectiveElem.style;
            s.webkitPerspective = Math.sqrt(Math.pow(e, 2) + Math.pow(t, 2)) + "px", s.perspective = s.webkitPerspective;
          }
        }
      }, HybridRendererBase.prototype.searchExtraCompositions = function(e) {
        var t, r = e.length, i = createTag("div");
        for (t = 0; t < r; t += 1)
          if (e[t].xt) {
            var s = this.createComp(e[t], i, this.globalData.comp, null);
            s.initExpressions(), this.globalData.projectInterface.registerComposition(s);
          }
      };
      function HCompElement(e, t, r) {
        this.layers = e.layers, this.supports3d = !e.hasMask, this.completeLayers = !1, this.pendingElements = [], this.elements = this.layers ? createSizedArray(this.layers.length) : [], this.initElement(e, t, r), this.tm = e.tm ? PropertyFactory.getProp(this, e.tm, 0, t.frameRate, this) : {
          _placeholder: !0
        };
      }
      extendPrototype([HybridRendererBase, ICompElement, HBaseElement], HCompElement), HCompElement.prototype._createBaseContainerElements = HCompElement.prototype.createContainerElements, HCompElement.prototype.createContainerElements = function() {
        this._createBaseContainerElements(), this.data.hasMask ? (this.svgElement.setAttribute("width", this.data.w), this.svgElement.setAttribute("height", this.data.h), this.transformedElement = this.baseElement) : this.transformedElement = this.layerElement;
      }, HCompElement.prototype.addTo3dContainer = function(e, t) {
        for (var r = 0, i; r < t; )
          this.elements[r] && this.elements[r].getBaseElement && (i = this.elements[r].getBaseElement()), r += 1;
        i ? this.layerElement.insertBefore(e, i) : this.layerElement.appendChild(e);
      }, HCompElement.prototype.createComp = function(e) {
        return this.supports3d ? new HCompElement(e, this.globalData, this) : new SVGCompElement(e, this.globalData, this);
      };
      function HybridRenderer(e, t) {
        this.animationItem = e, this.layers = null, this.renderedFrame = -1, this.renderConfig = {
          className: t && t.className || "",
          imagePreserveAspectRatio: t && t.imagePreserveAspectRatio || "xMidYMid slice",
          hideOnTransparent: !(t && t.hideOnTransparent === !1),
          filterSize: {
            width: t && t.filterSize && t.filterSize.width || "400%",
            height: t && t.filterSize && t.filterSize.height || "400%",
            x: t && t.filterSize && t.filterSize.x || "-100%",
            y: t && t.filterSize && t.filterSize.y || "-100%"
          },
          runExpressions: !t || t.runExpressions === void 0 || t.runExpressions
        }, this.globalData = {
          _mdf: !1,
          frameNum: -1,
          renderConfig: this.renderConfig
        }, this.pendingElements = [], this.elements = [], this.threeDElements = [], this.destroyed = !1, this.camera = null, this.supports3d = !0, this.rendererType = "html";
      }
      extendPrototype([HybridRendererBase], HybridRenderer), HybridRenderer.prototype.createComp = function(e) {
        return this.supports3d ? new HCompElement(e, this.globalData, this) : new SVGCompElement(e, this.globalData, this);
      };
      var CompExpressionInterface = /* @__PURE__ */ (function() {
        return function(e) {
          function t(r) {
            for (var i = 0, s = e.layers.length; i < s; ) {
              if (e.layers[i].nm === r || e.layers[i].ind === r)
                return e.elements[i].layerInterface;
              i += 1;
            }
            return null;
          }
          return Object.defineProperty(t, "_name", {
            value: e.data.nm
          }), t.layer = t, t.pixelAspect = 1, t.height = e.data.h || e.globalData.compSize.h, t.width = e.data.w || e.globalData.compSize.w, t.pixelAspect = 1, t.frameDuration = 1 / e.globalData.frameRate, t.displayStartTime = 0, t.numLayers = e.layers.length, t;
        };
      })();
      function _typeof$2(e) {
        "@babel/helpers - typeof";
        return _typeof$2 = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
          return typeof t;
        } : function(t) {
          return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
        }, _typeof$2(e);
      }
      function seedRandom(e, t) {
        var r = this, i = 256, s = 6, n = 52, a = "random", l = t.pow(i, s), o = t.pow(2, n), p = o * 2, u = i - 1, S;
        function f(h, y, P) {
          var A = [];
          y = y === !0 ? {
            entropy: !0
          } : y || {};
          var _ = x(m(y.entropy ? [h, d(e)] : h === null ? c() : h, 3), A), M = new b(A), w = function() {
            for (var B = M.g(s), R = l, D = 0; B < o; )
              B = (B + D) * i, R *= i, D = M.g(1);
            for (; B >= p; )
              B /= 2, R /= 2, D >>>= 1;
            return (B + D) / R;
          };
          return w.int32 = function() {
            return M.g(4) | 0;
          }, w.quick = function() {
            return M.g(4) / 4294967296;
          }, w.double = w, x(d(M.S), e), (y.pass || P || function(V, B, R, D) {
            return D && (D.S && v(D, M), V.state = function() {
              return v(M, {});
            }), R ? (t[a] = V, B) : V;
          })(w, _, "global" in y ? y.global : this == t, y.state);
        }
        t["seed" + a] = f;
        function b(h) {
          var y, P = h.length, A = this, _ = 0, M = A.i = A.j = 0, w = A.S = [];
          for (P || (h = [P++]); _ < i; )
            w[_] = _++;
          for (_ = 0; _ < i; _++)
            w[_] = w[M = u & M + h[_ % P] + (y = w[_])], w[M] = y;
          A.g = function(V) {
            for (var B, R = 0, D = A.i, N = A.j, I = A.S; V--; )
              B = I[D = u & D + 1], R = R * i + I[u & (I[D] = I[N = u & N + B]) + (I[N] = B)];
            return A.i = D, A.j = N, R;
          };
        }
        function v(h, y) {
          return y.i = h.i, y.j = h.j, y.S = h.S.slice(), y;
        }
        function m(h, y) {
          var P = [], A = _typeof$2(h), _;
          if (y && A == "object")
            for (_ in h)
              try {
                P.push(m(h[_], y - 1));
              } catch {
              }
          return P.length ? P : A == "string" ? h : h + "\0";
        }
        function x(h, y) {
          for (var P = h + "", A, _ = 0; _ < P.length; )
            y[u & _] = u & (A ^= y[u & _] * 19) + P.charCodeAt(_++);
          return d(y);
        }
        function c() {
          try {
            var h = new Uint8Array(i);
            return (r.crypto || r.msCrypto).getRandomValues(h), d(h);
          } catch {
            var y = r.navigator, P = y && y.plugins;
            return [+/* @__PURE__ */ new Date(), r, P, r.screen, d(e)];
          }
        }
        function d(h) {
          return String.fromCharCode.apply(0, h);
        }
        x(t.random(), e);
      }
      function initialize$2(e) {
        seedRandom([], e);
      }
      var propTypes = {
        SHAPE: "shape"
      };
      function _typeof$1(e) {
        "@babel/helpers - typeof";
        return _typeof$1 = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
          return typeof t;
        } : function(t) {
          return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
        }, _typeof$1(e);
      }
      var ExpressionManager = (function() {
        var ob = {}, Math = BMMath, window = null, document = null, XMLHttpRequest = null, fetch = null, frames = null, _lottieGlobal = {};
        initialize$2(BMMath);
        function resetFrame() {
          _lottieGlobal = {};
        }
        function $bm_isInstanceOfArray(e) {
          return e.constructor === Array || e.constructor === Float32Array;
        }
        function isNumerable(e, t) {
          return e === "number" || t instanceof Number || e === "boolean" || e === "string";
        }
        function $bm_neg(e) {
          var t = _typeof$1(e);
          if (t === "number" || e instanceof Number || t === "boolean")
            return -e;
          if ($bm_isInstanceOfArray(e)) {
            var r, i = e.length, s = [];
            for (r = 0; r < i; r += 1)
              s[r] = -e[r];
            return s;
          }
          return e.propType ? e.v : -e;
        }
        var easeInBez = BezierFactory.getBezierEasing(0.333, 0, 0.833, 0.833, "easeIn").get, easeOutBez = BezierFactory.getBezierEasing(0.167, 0.167, 0.667, 1, "easeOut").get, easeInOutBez = BezierFactory.getBezierEasing(0.33, 0, 0.667, 1, "easeInOut").get;
        function sum(e, t) {
          var r = _typeof$1(e), i = _typeof$1(t);
          if (isNumerable(r, e) && isNumerable(i, t) || r === "string" || i === "string")
            return e + t;
          if ($bm_isInstanceOfArray(e) && isNumerable(i, t))
            return e = e.slice(0), e[0] += t, e;
          if (isNumerable(r, e) && $bm_isInstanceOfArray(t))
            return t = t.slice(0), t[0] = e + t[0], t;
          if ($bm_isInstanceOfArray(e) && $bm_isInstanceOfArray(t)) {
            for (var s = 0, n = e.length, a = t.length, l = []; s < n || s < a; )
              (typeof e[s] == "number" || e[s] instanceof Number) && (typeof t[s] == "number" || t[s] instanceof Number) ? l[s] = e[s] + t[s] : l[s] = t[s] === void 0 ? e[s] : e[s] || t[s], s += 1;
            return l;
          }
          return 0;
        }
        var add = sum;
        function sub(e, t) {
          var r = _typeof$1(e), i = _typeof$1(t);
          if (isNumerable(r, e) && isNumerable(i, t))
            return r === "string" && (e = parseInt(e, 10)), i === "string" && (t = parseInt(t, 10)), e - t;
          if ($bm_isInstanceOfArray(e) && isNumerable(i, t))
            return e = e.slice(0), e[0] -= t, e;
          if (isNumerable(r, e) && $bm_isInstanceOfArray(t))
            return t = t.slice(0), t[0] = e - t[0], t;
          if ($bm_isInstanceOfArray(e) && $bm_isInstanceOfArray(t)) {
            for (var s = 0, n = e.length, a = t.length, l = []; s < n || s < a; )
              (typeof e[s] == "number" || e[s] instanceof Number) && (typeof t[s] == "number" || t[s] instanceof Number) ? l[s] = e[s] - t[s] : l[s] = t[s] === void 0 ? e[s] : e[s] || t[s], s += 1;
            return l;
          }
          return 0;
        }
        function mul(e, t) {
          var r = _typeof$1(e), i = _typeof$1(t), s;
          if (isNumerable(r, e) && isNumerable(i, t))
            return e * t;
          var n, a;
          if ($bm_isInstanceOfArray(e) && isNumerable(i, t)) {
            for (a = e.length, s = createTypedArray("float32", a), n = 0; n < a; n += 1)
              s[n] = e[n] * t;
            return s;
          }
          if (isNumerable(r, e) && $bm_isInstanceOfArray(t)) {
            for (a = t.length, s = createTypedArray("float32", a), n = 0; n < a; n += 1)
              s[n] = e * t[n];
            return s;
          }
          return 0;
        }
        function div(e, t) {
          var r = _typeof$1(e), i = _typeof$1(t), s;
          if (isNumerable(r, e) && isNumerable(i, t))
            return e / t;
          var n, a;
          if ($bm_isInstanceOfArray(e) && isNumerable(i, t)) {
            for (a = e.length, s = createTypedArray("float32", a), n = 0; n < a; n += 1)
              s[n] = e[n] / t;
            return s;
          }
          if (isNumerable(r, e) && $bm_isInstanceOfArray(t)) {
            for (a = t.length, s = createTypedArray("float32", a), n = 0; n < a; n += 1)
              s[n] = e / t[n];
            return s;
          }
          return 0;
        }
        function mod(e, t) {
          return typeof e == "string" && (e = parseInt(e, 10)), typeof t == "string" && (t = parseInt(t, 10)), e % t;
        }
        var $bm_sum = sum, $bm_sub = sub, $bm_mul = mul, $bm_div = div, $bm_mod = mod;
        function clamp(e, t, r) {
          if (t > r) {
            var i = r;
            r = t, t = i;
          }
          return Math.min(Math.max(e, t), r);
        }
        function radiansToDegrees(e) {
          return e / degToRads;
        }
        var radians_to_degrees = radiansToDegrees;
        function degreesToRadians(e) {
          return e * degToRads;
        }
        var degrees_to_radians = radiansToDegrees, helperLengthArray = [0, 0, 0, 0, 0, 0];
        function length(e, t) {
          if (typeof e == "number" || e instanceof Number)
            return t = t || 0, Math.abs(e - t);
          t || (t = helperLengthArray);
          var r, i = Math.min(e.length, t.length), s = 0;
          for (r = 0; r < i; r += 1)
            s += Math.pow(t[r] - e[r], 2);
          return Math.sqrt(s);
        }
        function normalize(e) {
          return div(e, length(e));
        }
        function rgbToHsl(e) {
          var t = e[0], r = e[1], i = e[2], s = Math.max(t, r, i), n = Math.min(t, r, i), a, l, o = (s + n) / 2;
          if (s === n)
            a = 0, l = 0;
          else {
            var p = s - n;
            switch (l = o > 0.5 ? p / (2 - s - n) : p / (s + n), s) {
              case t:
                a = (r - i) / p + (r < i ? 6 : 0);
                break;
              case r:
                a = (i - t) / p + 2;
                break;
              case i:
                a = (t - r) / p + 4;
                break;
            }
            a /= 6;
          }
          return [a, l, o, e[3]];
        }
        function hue2rgb(e, t, r) {
          return r < 0 && (r += 1), r > 1 && (r -= 1), r < 1 / 6 ? e + (t - e) * 6 * r : r < 1 / 2 ? t : r < 2 / 3 ? e + (t - e) * (2 / 3 - r) * 6 : e;
        }
        function hslToRgb(e) {
          var t = e[0], r = e[1], i = e[2], s, n, a;
          if (r === 0)
            s = i, a = i, n = i;
          else {
            var l = i < 0.5 ? i * (1 + r) : i + r - i * r, o = 2 * i - l;
            s = hue2rgb(o, l, t + 1 / 3), n = hue2rgb(o, l, t), a = hue2rgb(o, l, t - 1 / 3);
          }
          return [s, n, a, e[3]];
        }
        function linear(e, t, r, i, s) {
          if ((i === void 0 || s === void 0) && (i = t, s = r, t = 0, r = 1), r < t) {
            var n = r;
            r = t, t = n;
          }
          if (e <= t)
            return i;
          if (e >= r)
            return s;
          var a = r === t ? 0 : (e - t) / (r - t);
          if (!i.length)
            return i + (s - i) * a;
          var l, o = i.length, p = createTypedArray("float32", o);
          for (l = 0; l < o; l += 1)
            p[l] = i[l] + (s[l] - i[l]) * a;
          return p;
        }
        function random(e, t) {
          if (t === void 0 && (e === void 0 ? (e = 0, t = 1) : (t = e, e = void 0)), t.length) {
            var r, i = t.length;
            e || (e = createTypedArray("float32", i));
            var s = createTypedArray("float32", i), n = BMMath.random();
            for (r = 0; r < i; r += 1)
              s[r] = e[r] + n * (t[r] - e[r]);
            return s;
          }
          e === void 0 && (e = 0);
          var a = BMMath.random();
          return e + a * (t - e);
        }
        function createPath(e, t, r, i) {
          var s, n = e.length, a = shapePool.newElement();
          a.setPathData(!!i, n);
          var l = [0, 0], o, p;
          for (s = 0; s < n; s += 1)
            o = t && t[s] ? t[s] : l, p = r && r[s] ? r[s] : l, a.setTripleAt(e[s][0], e[s][1], p[0] + e[s][0], p[1] + e[s][1], o[0] + e[s][0], o[1] + e[s][1], s, !0);
          return a;
        }
        function initiateExpression(elem, data, property) {
          function noOp(e) {
            return e;
          }
          if (!elem.globalData.renderConfig.runExpressions)
            return noOp;
          var val = data.x, needsVelocity = /velocity(?![\w\d])/.test(val), _needsRandom = val.indexOf("random") !== -1, elemType = elem.data.ty, transform, $bm_transform, content, effect, thisProperty = property;
          thisProperty._name = elem.data.nm, thisProperty.valueAtTime = thisProperty.getValueAtTime, Object.defineProperty(thisProperty, "value", {
            get: function() {
              return thisProperty.v;
            }
          }), elem.comp.frameDuration = 1 / elem.comp.globalData.frameRate, elem.comp.displayStartTime = 0;
          var inPoint = elem.data.ip / elem.comp.globalData.frameRate, outPoint = elem.data.op / elem.comp.globalData.frameRate, width = elem.data.sw ? elem.data.sw : 0, height = elem.data.sh ? elem.data.sh : 0, name = elem.data.nm, loopIn, loop_in, loopOut, loop_out, smooth, toWorld, fromWorld, fromComp, toComp, fromCompToSurface, position, rotation, anchorPoint, scale, thisLayer, thisComp, mask, valueAtTime, velocityAtTime, scoped_bm_rt, expression_function = eval("[function _expression_function(){" + val + ";scoped_bm_rt=$bm_rt}]")[0], numKeys = property.kf ? data.k.length : 0, active = !this.data || this.data.hd !== !0, wiggle = (function e(t, r) {
            var i, s, n = this.pv.length ? this.pv.length : 1, a = createTypedArray("float32", n);
            t = 5;
            var l = Math.floor(time * t);
            for (i = 0, s = 0; i < l; ) {
              for (s = 0; s < n; s += 1)
                a[s] += -r + r * 2 * BMMath.random();
              i += 1;
            }
            var o = time * t, p = o - Math.floor(o), u = createTypedArray("float32", n);
            if (n > 1) {
              for (s = 0; s < n; s += 1)
                u[s] = this.pv[s] + a[s] + (-r + r * 2 * BMMath.random()) * p;
              return u;
            }
            return this.pv + a[0] + (-r + r * 2 * BMMath.random()) * p;
          }).bind(this);
          thisProperty.loopIn && (loopIn = thisProperty.loopIn.bind(thisProperty), loop_in = loopIn), thisProperty.loopOut && (loopOut = thisProperty.loopOut.bind(thisProperty), loop_out = loopOut), thisProperty.smooth && (smooth = thisProperty.smooth.bind(thisProperty));
          function loopInDuration(e, t) {
            return loopIn(e, t, !0);
          }
          function loopOutDuration(e, t) {
            return loopOut(e, t, !0);
          }
          this.getValueAtTime && (valueAtTime = this.getValueAtTime.bind(this)), this.getVelocityAtTime && (velocityAtTime = this.getVelocityAtTime.bind(this));
          var comp = elem.comp.globalData.projectInterface.bind(elem.comp.globalData.projectInterface);
          function lookAt(e, t) {
            var r = [t[0] - e[0], t[1] - e[1], t[2] - e[2]], i = Math.atan2(r[0], Math.sqrt(r[1] * r[1] + r[2] * r[2])) / degToRads, s = -Math.atan2(r[1], r[2]) / degToRads;
            return [s, i, 0];
          }
          function easeOut(e, t, r, i, s) {
            return applyEase(easeOutBez, e, t, r, i, s);
          }
          function easeIn(e, t, r, i, s) {
            return applyEase(easeInBez, e, t, r, i, s);
          }
          function ease(e, t, r, i, s) {
            return applyEase(easeInOutBez, e, t, r, i, s);
          }
          function applyEase(e, t, r, i, s, n) {
            s === void 0 ? (s = r, n = i) : t = (t - r) / (i - r), t > 1 ? t = 1 : t < 0 && (t = 0);
            var a = e(t);
            if ($bm_isInstanceOfArray(s)) {
              var l, o = s.length, p = createTypedArray("float32", o);
              for (l = 0; l < o; l += 1)
                p[l] = (n[l] - s[l]) * a + s[l];
              return p;
            }
            return (n - s) * a + s;
          }
          function nearestKey(e) {
            var t, r = data.k.length, i, s;
            if (!data.k.length || typeof data.k[0] == "number")
              i = 0, s = 0;
            else if (i = -1, e *= elem.comp.globalData.frameRate, e < data.k[0].t)
              i = 1, s = data.k[0].t;
            else {
              for (t = 0; t < r - 1; t += 1)
                if (e === data.k[t].t) {
                  i = t + 1, s = data.k[t].t;
                  break;
                } else if (e > data.k[t].t && e < data.k[t + 1].t) {
                  e - data.k[t].t > data.k[t + 1].t - e ? (i = t + 2, s = data.k[t + 1].t) : (i = t + 1, s = data.k[t].t);
                  break;
                }
              i === -1 && (i = t + 1, s = data.k[t].t);
            }
            var n = {};
            return n.index = i, n.time = s / elem.comp.globalData.frameRate, n;
          }
          function key(e) {
            var t, r, i;
            if (!data.k.length || typeof data.k[0] == "number")
              throw new Error("The property has no keyframe at index " + e);
            e -= 1, t = {
              time: data.k[e].t / elem.comp.globalData.frameRate,
              value: []
            };
            var s = Object.prototype.hasOwnProperty.call(data.k[e], "s") ? data.k[e].s : data.k[e - 1].e;
            for (i = s.length, r = 0; r < i; r += 1)
              t[r] = s[r], t.value[r] = s[r];
            return t;
          }
          function framesToTime(e, t) {
            return t || (t = elem.comp.globalData.frameRate), e / t;
          }
          function timeToFrames(e, t) {
            return !e && e !== 0 && (e = time), t || (t = elem.comp.globalData.frameRate), e * t;
          }
          function seedRandom(e) {
            BMMath.seedrandom(randSeed + e);
          }
          function sourceRectAtTime() {
            return elem.sourceRectAtTime();
          }
          function substring(e, t) {
            return typeof value == "string" ? t === void 0 ? value.substring(e) : value.substring(e, t) : "";
          }
          function substr(e, t) {
            return typeof value == "string" ? t === void 0 ? value.substr(e) : value.substr(e, t) : "";
          }
          function posterizeTime(e) {
            time = e === 0 ? 0 : Math.floor(time * e) / e, value = valueAtTime(time);
          }
          var time, velocity, value, text, textIndex, textTotal, selectorValue, index = elem.data.ind, hasParent = !!(elem.hierarchy && elem.hierarchy.length), parent, randSeed = Math.floor(Math.random() * 1e6), globalData = elem.globalData;
          function executeExpression(e) {
            return value = e, this.frameExpressionId === elem.globalData.frameId && this.propType !== "textSelector" ? value : (this.propType === "textSelector" && (textIndex = this.textIndex, textTotal = this.textTotal, selectorValue = this.selectorValue), thisLayer || (text = elem.layerInterface.text, thisLayer = elem.layerInterface, thisComp = elem.comp.compInterface, toWorld = thisLayer.toWorld.bind(thisLayer), fromWorld = thisLayer.fromWorld.bind(thisLayer), fromComp = thisLayer.fromComp.bind(thisLayer), toComp = thisLayer.toComp.bind(thisLayer), mask = thisLayer.mask ? thisLayer.mask.bind(thisLayer) : null, fromCompToSurface = fromComp), transform || (transform = elem.layerInterface("ADBE Transform Group"), $bm_transform = transform, transform && (anchorPoint = transform.anchorPoint)), elemType === 4 && !content && (content = thisLayer("ADBE Root Vectors Group")), effect || (effect = thisLayer(4)), hasParent = !!(elem.hierarchy && elem.hierarchy.length), hasParent && !parent && (parent = elem.hierarchy[0].layerInterface), time = this.comp.renderedFrame / this.comp.globalData.frameRate, _needsRandom && seedRandom(randSeed + time), needsVelocity && (velocity = velocityAtTime(time)), expression_function(), this.frameExpressionId = elem.globalData.frameId, scoped_bm_rt = scoped_bm_rt.propType === propTypes.SHAPE ? scoped_bm_rt.v : scoped_bm_rt, scoped_bm_rt);
          }
          return executeExpression.__preventDeadCodeRemoval = [$bm_transform, anchorPoint, time, velocity, inPoint, outPoint, width, height, name, loop_in, loop_out, smooth, toComp, fromCompToSurface, toWorld, fromWorld, mask, position, rotation, scale, thisComp, numKeys, active, wiggle, loopInDuration, loopOutDuration, comp, lookAt, easeOut, easeIn, ease, nearestKey, key, text, textIndex, textTotal, selectorValue, framesToTime, timeToFrames, sourceRectAtTime, substring, substr, posterizeTime, index, globalData], executeExpression;
        }
        return ob.initiateExpression = initiateExpression, ob.__preventDeadCodeRemoval = [window, document, XMLHttpRequest, fetch, frames, $bm_neg, add, $bm_sum, $bm_sub, $bm_mul, $bm_div, $bm_mod, clamp, radians_to_degrees, degreesToRadians, degrees_to_radians, normalize, rgbToHsl, hslToRgb, linear, random, createPath, _lottieGlobal], ob.resetFrame = resetFrame, ob;
      })(), Expressions = (function() {
        var e = {};
        e.initExpressions = t, e.resetFrame = ExpressionManager.resetFrame;
        function t(r) {
          var i = 0, s = [];
          function n() {
            i += 1;
          }
          function a() {
            i -= 1, i === 0 && o();
          }
          function l(p) {
            s.indexOf(p) === -1 && s.push(p);
          }
          function o() {
            var p, u = s.length;
            for (p = 0; p < u; p += 1)
              s[p].release();
            s.length = 0;
          }
          r.renderer.compInterface = CompExpressionInterface(r.renderer), r.renderer.globalData.projectInterface.registerComposition(r.renderer), r.renderer.globalData.pushExpression = n, r.renderer.globalData.popExpression = a, r.renderer.globalData.registerExpressionProperty = l;
        }
        return e;
      })(), MaskManagerInterface = (function() {
        function e(r, i) {
          this._mask = r, this._data = i;
        }
        Object.defineProperty(e.prototype, "maskPath", {
          get: function() {
            return this._mask.prop.k && this._mask.prop.getValue(), this._mask.prop;
          }
        }), Object.defineProperty(e.prototype, "maskOpacity", {
          get: function() {
            return this._mask.op.k && this._mask.op.getValue(), this._mask.op.v * 100;
          }
        });
        var t = function(i) {
          var s = createSizedArray(i.viewData.length), n, a = i.viewData.length;
          for (n = 0; n < a; n += 1)
            s[n] = new e(i.viewData[n], i.masksProperties[n]);
          var l = function(p) {
            for (n = 0; n < a; ) {
              if (i.masksProperties[n].nm === p)
                return s[n];
              n += 1;
            }
            return null;
          };
          return l;
        };
        return t;
      })(), ExpressionPropertyInterface = /* @__PURE__ */ (function() {
        var e = {
          pv: 0,
          v: 0,
          mult: 1
        }, t = {
          pv: [0, 0, 0],
          v: [0, 0, 0],
          mult: 1
        };
        function r(a, l, o) {
          Object.defineProperty(a, "velocity", {
            get: function() {
              return l.getVelocityAtTime(l.comp.currentFrame);
            }
          }), a.numKeys = l.keyframes ? l.keyframes.length : 0, a.key = function(p) {
            if (!a.numKeys)
              return 0;
            var u = "";
            "s" in l.keyframes[p - 1] ? u = l.keyframes[p - 1].s : "e" in l.keyframes[p - 2] ? u = l.keyframes[p - 2].e : u = l.keyframes[p - 2].s;
            var S = o === "unidimensional" ? new Number(u) : Object.assign({}, u);
            return S.time = l.keyframes[p - 1].t / l.elem.comp.globalData.frameRate, S.value = o === "unidimensional" ? u[0] : u, S;
          }, a.valueAtTime = l.getValueAtTime, a.speedAtTime = l.getSpeedAtTime, a.velocityAtTime = l.getVelocityAtTime, a.propertyGroup = l.propertyGroup;
        }
        function i(a) {
          (!a || !("pv" in a)) && (a = e);
          var l = 1 / a.mult, o = a.pv * l, p = new Number(o);
          return p.value = o, r(p, a, "unidimensional"), function() {
            return a.k && a.getValue(), o = a.v * l, p.value !== o && (p = new Number(o), p.value = o, p[0] = o, r(p, a, "unidimensional")), p;
          };
        }
        function s(a) {
          (!a || !("pv" in a)) && (a = t);
          var l = 1 / a.mult, o = a.data && a.data.l || a.pv.length, p = createTypedArray("float32", o), u = createTypedArray("float32", o);
          return p.value = u, r(p, a, "multidimensional"), function() {
            a.k && a.getValue();
            for (var S = 0; S < o; S += 1)
              u[S] = a.v[S] * l, p[S] = u[S];
            return p;
          };
        }
        function n() {
          return e;
        }
        return function(a) {
          return a ? a.propType === "unidimensional" ? i(a) : s(a) : n;
        };
      })(), TransformExpressionInterface = /* @__PURE__ */ (function() {
        return function(e) {
          function t(a) {
            switch (a) {
              case "scale":
              case "Scale":
              case "ADBE Scale":
              case 6:
                return t.scale;
              case "rotation":
              case "Rotation":
              case "ADBE Rotation":
              case "ADBE Rotate Z":
              case 10:
                return t.rotation;
              case "ADBE Rotate X":
                return t.xRotation;
              case "ADBE Rotate Y":
                return t.yRotation;
              case "position":
              case "Position":
              case "ADBE Position":
              case 2:
                return t.position;
              case "ADBE Position_0":
                return t.xPosition;
              case "ADBE Position_1":
                return t.yPosition;
              case "ADBE Position_2":
                return t.zPosition;
              case "anchorPoint":
              case "AnchorPoint":
              case "Anchor Point":
              case "ADBE AnchorPoint":
              case 1:
                return t.anchorPoint;
              case "opacity":
              case "Opacity":
              case 11:
                return t.opacity;
              default:
                return null;
            }
          }
          Object.defineProperty(t, "rotation", {
            get: ExpressionPropertyInterface(e.r || e.rz)
          }), Object.defineProperty(t, "zRotation", {
            get: ExpressionPropertyInterface(e.rz || e.r)
          }), Object.defineProperty(t, "xRotation", {
            get: ExpressionPropertyInterface(e.rx)
          }), Object.defineProperty(t, "yRotation", {
            get: ExpressionPropertyInterface(e.ry)
          }), Object.defineProperty(t, "scale", {
            get: ExpressionPropertyInterface(e.s)
          });
          var r, i, s, n;
          return e.p ? n = ExpressionPropertyInterface(e.p) : (r = ExpressionPropertyInterface(e.px), i = ExpressionPropertyInterface(e.py), e.pz && (s = ExpressionPropertyInterface(e.pz))), Object.defineProperty(t, "position", {
            get: function() {
              return e.p ? n() : [r(), i(), s ? s() : 0];
            }
          }), Object.defineProperty(t, "xPosition", {
            get: ExpressionPropertyInterface(e.px)
          }), Object.defineProperty(t, "yPosition", {
            get: ExpressionPropertyInterface(e.py)
          }), Object.defineProperty(t, "zPosition", {
            get: ExpressionPropertyInterface(e.pz)
          }), Object.defineProperty(t, "anchorPoint", {
            get: ExpressionPropertyInterface(e.a)
          }), Object.defineProperty(t, "opacity", {
            get: ExpressionPropertyInterface(e.o)
          }), Object.defineProperty(t, "skew", {
            get: ExpressionPropertyInterface(e.sk)
          }), Object.defineProperty(t, "skewAxis", {
            get: ExpressionPropertyInterface(e.sa)
          }), Object.defineProperty(t, "orientation", {
            get: ExpressionPropertyInterface(e.or)
          }), t;
        };
      })(), LayerExpressionInterface = /* @__PURE__ */ (function() {
        function e(p) {
          var u = new Matrix();
          if (p !== void 0) {
            var S = this._elem.finalTransform.mProp.getValueAtTime(p);
            S.clone(u);
          } else {
            var f = this._elem.finalTransform.mProp;
            f.applyToMatrix(u);
          }
          return u;
        }
        function t(p, u) {
          var S = this.getMatrix(u);
          return S.props[12] = 0, S.props[13] = 0, S.props[14] = 0, this.applyPoint(S, p);
        }
        function r(p, u) {
          var S = this.getMatrix(u);
          return this.applyPoint(S, p);
        }
        function i(p, u) {
          var S = this.getMatrix(u);
          return S.props[12] = 0, S.props[13] = 0, S.props[14] = 0, this.invertPoint(S, p);
        }
        function s(p, u) {
          var S = this.getMatrix(u);
          return this.invertPoint(S, p);
        }
        function n(p, u) {
          if (this._elem.hierarchy && this._elem.hierarchy.length) {
            var S, f = this._elem.hierarchy.length;
            for (S = 0; S < f; S += 1)
              this._elem.hierarchy[S].finalTransform.mProp.applyToMatrix(p);
          }
          return p.applyToPointArray(u[0], u[1], u[2] || 0);
        }
        function a(p, u) {
          if (this._elem.hierarchy && this._elem.hierarchy.length) {
            var S, f = this._elem.hierarchy.length;
            for (S = 0; S < f; S += 1)
              this._elem.hierarchy[S].finalTransform.mProp.applyToMatrix(p);
          }
          return p.inversePoint(u);
        }
        function l(p) {
          var u = new Matrix();
          if (u.reset(), this._elem.finalTransform.mProp.applyToMatrix(u), this._elem.hierarchy && this._elem.hierarchy.length) {
            var S, f = this._elem.hierarchy.length;
            for (S = 0; S < f; S += 1)
              this._elem.hierarchy[S].finalTransform.mProp.applyToMatrix(u);
            return u.inversePoint(p);
          }
          return u.inversePoint(p);
        }
        function o() {
          return [1, 1, 1, 1];
        }
        return function(p) {
          var u;
          function S(m) {
            b.mask = new MaskManagerInterface(m, p);
          }
          function f(m) {
            b.effect = m;
          }
          function b(m) {
            switch (m) {
              case "ADBE Root Vectors Group":
              case "Contents":
              case 2:
                return b.shapeInterface;
              case 1:
              case 6:
              case "Transform":
              case "transform":
              case "ADBE Transform Group":
                return u;
              case 4:
              case "ADBE Effect Parade":
              case "effects":
              case "Effects":
                return b.effect;
              case "ADBE Text Properties":
                return b.textInterface;
              default:
                return null;
            }
          }
          b.getMatrix = e, b.invertPoint = a, b.applyPoint = n, b.toWorld = r, b.toWorldVec = t, b.fromWorld = s, b.fromWorldVec = i, b.toComp = r, b.fromComp = l, b.sampleImage = o, b.sourceRectAtTime = p.sourceRectAtTime.bind(p), b._elem = p, u = TransformExpressionInterface(p.finalTransform.mProp);
          var v = getDescriptor(u, "anchorPoint");
          return Object.defineProperties(b, {
            hasParent: {
              get: function() {
                return p.hierarchy.length;
              }
            },
            parent: {
              get: function() {
                return p.hierarchy[0].layerInterface;
              }
            },
            rotation: getDescriptor(u, "rotation"),
            scale: getDescriptor(u, "scale"),
            position: getDescriptor(u, "position"),
            opacity: getDescriptor(u, "opacity"),
            anchorPoint: v,
            anchor_point: v,
            transform: {
              get: function() {
                return u;
              }
            },
            active: {
              get: function() {
                return p.isInRange;
              }
            }
          }), b.startTime = p.data.st, b.index = p.data.ind, b.source = p.data.refId, b.height = p.data.ty === 0 ? p.data.h : 100, b.width = p.data.ty === 0 ? p.data.w : 100, b.inPoint = p.data.ip / p.comp.globalData.frameRate, b.outPoint = p.data.op / p.comp.globalData.frameRate, b._name = p.data.nm, b.registerMaskInterface = S, b.registerEffectsInterface = f, b;
        };
      })(), propertyGroupFactory = /* @__PURE__ */ (function() {
        return function(e, t) {
          return function(r) {
            return r = r === void 0 ? 1 : r, r <= 0 ? e : t(r - 1);
          };
        };
      })(), PropertyInterface = /* @__PURE__ */ (function() {
        return function(e, t) {
          var r = {
            _name: e
          };
          function i(s) {
            return s = s === void 0 ? 1 : s, s <= 0 ? r : t(s - 1);
          }
          return i;
        };
      })(), EffectsExpressionInterface = /* @__PURE__ */ (function() {
        var e = {
          createEffectsInterface: t
        };
        function t(s, n) {
          if (s.effectsManager) {
            var a = [], l = s.data.ef, o, p = s.effectsManager.effectElements.length;
            for (o = 0; o < p; o += 1)
              a.push(r(l[o], s.effectsManager.effectElements[o], n, s));
            var u = s.data.ef || [], S = function(b) {
              for (o = 0, p = u.length; o < p; ) {
                if (b === u[o].nm || b === u[o].mn || b === u[o].ix)
                  return a[o];
                o += 1;
              }
              return null;
            };
            return Object.defineProperty(S, "numProperties", {
              get: function() {
                return u.length;
              }
            }), S;
          }
          return null;
        }
        function r(s, n, a, l) {
          function o(b) {
            for (var v = s.ef, m = 0, x = v.length; m < x; ) {
              if (b === v[m].nm || b === v[m].mn || b === v[m].ix)
                return v[m].ty === 5 ? u[m] : u[m]();
              m += 1;
            }
            throw new Error();
          }
          var p = propertyGroupFactory(o, a), u = [], S, f = s.ef.length;
          for (S = 0; S < f; S += 1)
            s.ef[S].ty === 5 ? u.push(r(s.ef[S], n.effectElements[S], n.effectElements[S].propertyGroup, l)) : u.push(i(n.effectElements[S], s.ef[S].ty, l, p));
          return s.mn === "ADBE Color Control" && Object.defineProperty(o, "color", {
            get: function() {
              return u[0]();
            }
          }), Object.defineProperties(o, {
            numProperties: {
              get: function() {
                return s.np;
              }
            },
            _name: {
              value: s.nm
            },
            propertyGroup: {
              value: p
            }
          }), o.enabled = s.en !== 0, o.active = o.enabled, o;
        }
        function i(s, n, a, l) {
          var o = ExpressionPropertyInterface(s.p);
          function p() {
            return n === 10 ? a.comp.compInterface(s.p.v) : o();
          }
          return s.p.setGroupProperty && s.p.setGroupProperty(PropertyInterface("", l)), p;
        }
        return e;
      })(), ShapePathInterface = /* @__PURE__ */ (function() {
        return function(t, r, i) {
          var s = r.sh;
          function n(l) {
            return l === "Shape" || l === "shape" || l === "Path" || l === "path" || l === "ADBE Vector Shape" || l === 2 ? n.path : null;
          }
          var a = propertyGroupFactory(n, i);
          return s.setGroupProperty(PropertyInterface("Path", a)), Object.defineProperties(n, {
            path: {
              get: function() {
                return s.k && s.getValue(), s;
              }
            },
            shape: {
              get: function() {
                return s.k && s.getValue(), s;
              }
            },
            _name: {
              value: t.nm
            },
            ix: {
              value: t.ix
            },
            propertyIndex: {
              value: t.ix
            },
            mn: {
              value: t.mn
            },
            propertyGroup: {
              value: i
            }
          }), n;
        };
      })(), ShapeExpressionInterface = /* @__PURE__ */ (function() {
        function e(v, m, x) {
          var c = [], d, h = v ? v.length : 0;
          for (d = 0; d < h; d += 1)
            v[d].ty === "gr" ? c.push(r(v[d], m[d], x)) : v[d].ty === "fl" ? c.push(i(v[d], m[d], x)) : v[d].ty === "st" ? c.push(a(v[d], m[d], x)) : v[d].ty === "tm" ? c.push(l(v[d], m[d], x)) : v[d].ty === "tr" || (v[d].ty === "el" ? c.push(p(v[d], m[d], x)) : v[d].ty === "sr" ? c.push(u(v[d], m[d], x)) : v[d].ty === "sh" ? c.push(ShapePathInterface(v[d], m[d], x)) : v[d].ty === "rc" ? c.push(S(v[d], m[d], x)) : v[d].ty === "rd" ? c.push(f(v[d], m[d], x)) : v[d].ty === "rp" ? c.push(b(v[d], m[d], x)) : v[d].ty === "gf" ? c.push(s(v[d], m[d], x)) : c.push(n(v[d], m[d])));
          return c;
        }
        function t(v, m, x) {
          var c, d = function(P) {
            for (var A = 0, _ = c.length; A < _; ) {
              if (c[A]._name === P || c[A].mn === P || c[A].propertyIndex === P || c[A].ix === P || c[A].ind === P)
                return c[A];
              A += 1;
            }
            return typeof P == "number" ? c[P - 1] : null;
          };
          d.propertyGroup = propertyGroupFactory(d, x), c = e(v.it, m.it, d.propertyGroup), d.numProperties = c.length;
          var h = o(v.it[v.it.length - 1], m.it[m.it.length - 1], d.propertyGroup);
          return d.transform = h, d.propertyIndex = v.cix, d._name = v.nm, d;
        }
        function r(v, m, x) {
          var c = function(P) {
            switch (P) {
              case "ADBE Vectors Group":
              case "Contents":
              case 2:
                return c.content;
              // Not necessary for now. Keeping them here in case a new case appears
              // case 'ADBE Vector Transform Group':
              // case 3:
              default:
                return c.transform;
            }
          };
          c.propertyGroup = propertyGroupFactory(c, x);
          var d = t(v, m, c.propertyGroup), h = o(v.it[v.it.length - 1], m.it[m.it.length - 1], c.propertyGroup);
          return c.content = d, c.transform = h, Object.defineProperty(c, "_name", {
            get: function() {
              return v.nm;
            }
          }), c.numProperties = v.np, c.propertyIndex = v.ix, c.nm = v.nm, c.mn = v.mn, c;
        }
        function i(v, m, x) {
          function c(d) {
            return d === "Color" || d === "color" ? c.color : d === "Opacity" || d === "opacity" ? c.opacity : null;
          }
          return Object.defineProperties(c, {
            color: {
              get: ExpressionPropertyInterface(m.c)
            },
            opacity: {
              get: ExpressionPropertyInterface(m.o)
            },
            _name: {
              value: v.nm
            },
            mn: {
              value: v.mn
            }
          }), m.c.setGroupProperty(PropertyInterface("Color", x)), m.o.setGroupProperty(PropertyInterface("Opacity", x)), c;
        }
        function s(v, m, x) {
          function c(d) {
            return d === "Start Point" || d === "start point" ? c.startPoint : d === "End Point" || d === "end point" ? c.endPoint : d === "Opacity" || d === "opacity" ? c.opacity : null;
          }
          return Object.defineProperties(c, {
            startPoint: {
              get: ExpressionPropertyInterface(m.s)
            },
            endPoint: {
              get: ExpressionPropertyInterface(m.e)
            },
            opacity: {
              get: ExpressionPropertyInterface(m.o)
            },
            type: {
              get: function() {
                return "a";
              }
            },
            _name: {
              value: v.nm
            },
            mn: {
              value: v.mn
            }
          }), m.s.setGroupProperty(PropertyInterface("Start Point", x)), m.e.setGroupProperty(PropertyInterface("End Point", x)), m.o.setGroupProperty(PropertyInterface("Opacity", x)), c;
        }
        function n() {
          function v() {
            return null;
          }
          return v;
        }
        function a(v, m, x) {
          var c = propertyGroupFactory(_, x), d = propertyGroupFactory(A, c);
          function h(M) {
            Object.defineProperty(A, v.d[M].nm, {
              get: ExpressionPropertyInterface(m.d.dataProps[M].p)
            });
          }
          var y, P = v.d ? v.d.length : 0, A = {};
          for (y = 0; y < P; y += 1)
            h(y), m.d.dataProps[y].p.setGroupProperty(d);
          function _(M) {
            return M === "Color" || M === "color" ? _.color : M === "Opacity" || M === "opacity" ? _.opacity : M === "Stroke Width" || M === "stroke width" ? _.strokeWidth : null;
          }
          return Object.defineProperties(_, {
            color: {
              get: ExpressionPropertyInterface(m.c)
            },
            opacity: {
              get: ExpressionPropertyInterface(m.o)
            },
            strokeWidth: {
              get: ExpressionPropertyInterface(m.w)
            },
            dash: {
              get: function() {
                return A;
              }
            },
            _name: {
              value: v.nm
            },
            mn: {
              value: v.mn
            }
          }), m.c.setGroupProperty(PropertyInterface("Color", c)), m.o.setGroupProperty(PropertyInterface("Opacity", c)), m.w.setGroupProperty(PropertyInterface("Stroke Width", c)), _;
        }
        function l(v, m, x) {
          function c(h) {
            return h === v.e.ix || h === "End" || h === "end" ? c.end : h === v.s.ix ? c.start : h === v.o.ix ? c.offset : null;
          }
          var d = propertyGroupFactory(c, x);
          return c.propertyIndex = v.ix, m.s.setGroupProperty(PropertyInterface("Start", d)), m.e.setGroupProperty(PropertyInterface("End", d)), m.o.setGroupProperty(PropertyInterface("Offset", d)), c.propertyIndex = v.ix, c.propertyGroup = x, Object.defineProperties(c, {
            start: {
              get: ExpressionPropertyInterface(m.s)
            },
            end: {
              get: ExpressionPropertyInterface(m.e)
            },
            offset: {
              get: ExpressionPropertyInterface(m.o)
            },
            _name: {
              value: v.nm
            }
          }), c.mn = v.mn, c;
        }
        function o(v, m, x) {
          function c(h) {
            return v.a.ix === h || h === "Anchor Point" ? c.anchorPoint : v.o.ix === h || h === "Opacity" ? c.opacity : v.p.ix === h || h === "Position" ? c.position : v.r.ix === h || h === "Rotation" || h === "ADBE Vector Rotation" ? c.rotation : v.s.ix === h || h === "Scale" ? c.scale : v.sk && v.sk.ix === h || h === "Skew" ? c.skew : v.sa && v.sa.ix === h || h === "Skew Axis" ? c.skewAxis : null;
          }
          var d = propertyGroupFactory(c, x);
          return m.transform.mProps.o.setGroupProperty(PropertyInterface("Opacity", d)), m.transform.mProps.p.setGroupProperty(PropertyInterface("Position", d)), m.transform.mProps.a.setGroupProperty(PropertyInterface("Anchor Point", d)), m.transform.mProps.s.setGroupProperty(PropertyInterface("Scale", d)), m.transform.mProps.r.setGroupProperty(PropertyInterface("Rotation", d)), m.transform.mProps.sk && (m.transform.mProps.sk.setGroupProperty(PropertyInterface("Skew", d)), m.transform.mProps.sa.setGroupProperty(PropertyInterface("Skew Angle", d))), m.transform.op.setGroupProperty(PropertyInterface("Opacity", d)), Object.defineProperties(c, {
            opacity: {
              get: ExpressionPropertyInterface(m.transform.mProps.o)
            },
            position: {
              get: ExpressionPropertyInterface(m.transform.mProps.p)
            },
            anchorPoint: {
              get: ExpressionPropertyInterface(m.transform.mProps.a)
            },
            scale: {
              get: ExpressionPropertyInterface(m.transform.mProps.s)
            },
            rotation: {
              get: ExpressionPropertyInterface(m.transform.mProps.r)
            },
            skew: {
              get: ExpressionPropertyInterface(m.transform.mProps.sk)
            },
            skewAxis: {
              get: ExpressionPropertyInterface(m.transform.mProps.sa)
            },
            _name: {
              value: v.nm
            }
          }), c.ty = "tr", c.mn = v.mn, c.propertyGroup = x, c;
        }
        function p(v, m, x) {
          function c(y) {
            return v.p.ix === y ? c.position : v.s.ix === y ? c.size : null;
          }
          var d = propertyGroupFactory(c, x);
          c.propertyIndex = v.ix;
          var h = m.sh.ty === "tm" ? m.sh.prop : m.sh;
          return h.s.setGroupProperty(PropertyInterface("Size", d)), h.p.setGroupProperty(PropertyInterface("Position", d)), Object.defineProperties(c, {
            size: {
              get: ExpressionPropertyInterface(h.s)
            },
            position: {
              get: ExpressionPropertyInterface(h.p)
            },
            _name: {
              value: v.nm
            }
          }), c.mn = v.mn, c;
        }
        function u(v, m, x) {
          function c(y) {
            return v.p.ix === y ? c.position : v.r.ix === y ? c.rotation : v.pt.ix === y ? c.points : v.or.ix === y || y === "ADBE Vector Star Outer Radius" ? c.outerRadius : v.os.ix === y ? c.outerRoundness : v.ir && (v.ir.ix === y || y === "ADBE Vector Star Inner Radius") ? c.innerRadius : v.is && v.is.ix === y ? c.innerRoundness : null;
          }
          var d = propertyGroupFactory(c, x), h = m.sh.ty === "tm" ? m.sh.prop : m.sh;
          return c.propertyIndex = v.ix, h.or.setGroupProperty(PropertyInterface("Outer Radius", d)), h.os.setGroupProperty(PropertyInterface("Outer Roundness", d)), h.pt.setGroupProperty(PropertyInterface("Points", d)), h.p.setGroupProperty(PropertyInterface("Position", d)), h.r.setGroupProperty(PropertyInterface("Rotation", d)), v.ir && (h.ir.setGroupProperty(PropertyInterface("Inner Radius", d)), h.is.setGroupProperty(PropertyInterface("Inner Roundness", d))), Object.defineProperties(c, {
            position: {
              get: ExpressionPropertyInterface(h.p)
            },
            rotation: {
              get: ExpressionPropertyInterface(h.r)
            },
            points: {
              get: ExpressionPropertyInterface(h.pt)
            },
            outerRadius: {
              get: ExpressionPropertyInterface(h.or)
            },
            outerRoundness: {
              get: ExpressionPropertyInterface(h.os)
            },
            innerRadius: {
              get: ExpressionPropertyInterface(h.ir)
            },
            innerRoundness: {
              get: ExpressionPropertyInterface(h.is)
            },
            _name: {
              value: v.nm
            }
          }), c.mn = v.mn, c;
        }
        function S(v, m, x) {
          function c(y) {
            return v.p.ix === y ? c.position : v.r.ix === y ? c.roundness : v.s.ix === y || y === "Size" || y === "ADBE Vector Rect Size" ? c.size : null;
          }
          var d = propertyGroupFactory(c, x), h = m.sh.ty === "tm" ? m.sh.prop : m.sh;
          return c.propertyIndex = v.ix, h.p.setGroupProperty(PropertyInterface("Position", d)), h.s.setGroupProperty(PropertyInterface("Size", d)), h.r.setGroupProperty(PropertyInterface("Rotation", d)), Object.defineProperties(c, {
            position: {
              get: ExpressionPropertyInterface(h.p)
            },
            roundness: {
              get: ExpressionPropertyInterface(h.r)
            },
            size: {
              get: ExpressionPropertyInterface(h.s)
            },
            _name: {
              value: v.nm
            }
          }), c.mn = v.mn, c;
        }
        function f(v, m, x) {
          function c(y) {
            return v.r.ix === y || y === "Round Corners 1" ? c.radius : null;
          }
          var d = propertyGroupFactory(c, x), h = m;
          return c.propertyIndex = v.ix, h.rd.setGroupProperty(PropertyInterface("Radius", d)), Object.defineProperties(c, {
            radius: {
              get: ExpressionPropertyInterface(h.rd)
            },
            _name: {
              value: v.nm
            }
          }), c.mn = v.mn, c;
        }
        function b(v, m, x) {
          function c(y) {
            return v.c.ix === y || y === "Copies" ? c.copies : v.o.ix === y || y === "Offset" ? c.offset : null;
          }
          var d = propertyGroupFactory(c, x), h = m;
          return c.propertyIndex = v.ix, h.c.setGroupProperty(PropertyInterface("Copies", d)), h.o.setGroupProperty(PropertyInterface("Offset", d)), Object.defineProperties(c, {
            copies: {
              get: ExpressionPropertyInterface(h.c)
            },
            offset: {
              get: ExpressionPropertyInterface(h.o)
            },
            _name: {
              value: v.nm
            }
          }), c.mn = v.mn, c;
        }
        return function(v, m, x) {
          var c;
          function d(y) {
            if (typeof y == "number")
              return y = y === void 0 ? 1 : y, y === 0 ? x : c[y - 1];
            for (var P = 0, A = c.length; P < A; ) {
              if (c[P]._name === y)
                return c[P];
              P += 1;
            }
            return null;
          }
          function h() {
            return x;
          }
          return d.propertyGroup = propertyGroupFactory(d, h), c = e(v, m, d.propertyGroup), d.numProperties = c.length, d._name = "Contents", d;
        };
      })(), TextExpressionInterface = /* @__PURE__ */ (function() {
        return function(e) {
          var t;
          function r(i) {
            switch (i) {
              case "ADBE Text Document":
                return r.sourceText;
              default:
                return null;
            }
          }
          return Object.defineProperty(r, "sourceText", {
            get: function() {
              e.textProperty.getValue();
              var s = e.textProperty.currentData.t;
              return (!t || s !== t.value) && (t = new String(s), t.value = s || new String(s), Object.defineProperty(t, "style", {
                get: function() {
                  return {
                    fillColor: e.textProperty.currentData.fc
                  };
                }
              })), t;
            }
          }), r;
        };
      })();
      function _typeof(e) {
        "@babel/helpers - typeof";
        return _typeof = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
          return typeof t;
        } : function(t) {
          return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
        }, _typeof(e);
      }
      var FootageInterface = /* @__PURE__ */ (function() {
        var e = function(i) {
          var s = "", n = i.getFootageData();
          function a() {
            return s = "", n = i.getFootageData(), l;
          }
          function l(o) {
            if (n[o])
              return s = o, n = n[o], _typeof(n) === "object" ? l : n;
            var p = o.indexOf(s);
            if (p !== -1) {
              var u = parseInt(o.substr(p + s.length), 10);
              return n = n[u], _typeof(n) === "object" ? l : n;
            }
            return "";
          }
          return a;
        }, t = function(i) {
          function s(n) {
            return n === "Outline" ? s.outlineInterface() : null;
          }
          return s._name = "Outline", s.outlineInterface = e(i), s;
        };
        return function(r) {
          function i(s) {
            return s === "Data" ? i.dataInterface : null;
          }
          return i._name = "Data", i.dataInterface = t(r), i;
        };
      })(), interfaces = {
        layer: LayerExpressionInterface,
        effects: EffectsExpressionInterface,
        comp: CompExpressionInterface,
        shape: ShapeExpressionInterface,
        text: TextExpressionInterface,
        footage: FootageInterface
      };
      function getInterface(e) {
        return interfaces[e] || null;
      }
      var expressionHelpers = /* @__PURE__ */ (function() {
        function e(a, l, o) {
          l.x && (o.k = !0, o.x = !0, o.initiateExpression = ExpressionManager.initiateExpression, o.effectsSequence.push(o.initiateExpression(a, l, o).bind(o)));
        }
        function t(a) {
          return a *= this.elem.globalData.frameRate, a -= this.offsetTime, a !== this._cachingAtTime.lastFrame && (this._cachingAtTime.lastIndex = this._cachingAtTime.lastFrame < a ? this._cachingAtTime.lastIndex : 0, this._cachingAtTime.value = this.interpolateValue(a, this._cachingAtTime), this._cachingAtTime.lastFrame = a), this._cachingAtTime.value;
        }
        function r(a) {
          var l = -0.01, o = this.getValueAtTime(a), p = this.getValueAtTime(a + l), u = 0;
          if (o.length) {
            var S;
            for (S = 0; S < o.length; S += 1)
              u += Math.pow(p[S] - o[S], 2);
            u = Math.sqrt(u) * 100;
          } else
            u = 0;
          return u;
        }
        function i(a) {
          if (this.vel !== void 0)
            return this.vel;
          var l = -1e-3, o = this.getValueAtTime(a), p = this.getValueAtTime(a + l), u;
          if (o.length) {
            u = createTypedArray("float32", o.length);
            var S;
            for (S = 0; S < o.length; S += 1)
              u[S] = (p[S] - o[S]) / l;
          } else
            u = (p - o) / l;
          return u;
        }
        function s() {
          return this.pv;
        }
        function n(a) {
          this.propertyGroup = a;
        }
        return {
          searchExpressions: e,
          getSpeedAtTime: r,
          getVelocityAtTime: i,
          getValueAtTime: t,
          getStaticValueAtTime: s,
          setGroupProperty: n
        };
      })();
      function addPropertyDecorator() {
        function e(f, b, v) {
          if (!this.k || !this.keyframes)
            return this.pv;
          f = f ? f.toLowerCase() : "";
          var m = this.comp.renderedFrame, x = this.keyframes, c = x[x.length - 1].t;
          if (m <= c)
            return this.pv;
          var d, h;
          v ? (b ? d = Math.abs(c - this.elem.comp.globalData.frameRate * b) : d = Math.max(0, c - this.elem.data.ip), h = c - d) : ((!b || b > x.length - 1) && (b = x.length - 1), h = x[x.length - 1 - b].t, d = c - h);
          var y, P, A;
          if (f === "pingpong") {
            var _ = Math.floor((m - h) / d);
            if (_ % 2 !== 0)
              return this.getValueAtTime((d - (m - h) % d + h) / this.comp.globalData.frameRate, 0);
          } else if (f === "offset") {
            var M = this.getValueAtTime(h / this.comp.globalData.frameRate, 0), w = this.getValueAtTime(c / this.comp.globalData.frameRate, 0), V = this.getValueAtTime(((m - h) % d + h) / this.comp.globalData.frameRate, 0), B = Math.floor((m - h) / d);
            if (this.pv.length) {
              for (A = new Array(M.length), P = A.length, y = 0; y < P; y += 1)
                A[y] = (w[y] - M[y]) * B + V[y];
              return A;
            }
            return (w - M) * B + V;
          } else if (f === "continue") {
            var R = this.getValueAtTime(c / this.comp.globalData.frameRate, 0), D = this.getValueAtTime((c - 1e-3) / this.comp.globalData.frameRate, 0);
            if (this.pv.length) {
              for (A = new Array(R.length), P = A.length, y = 0; y < P; y += 1)
                A[y] = R[y] + (R[y] - D[y]) * ((m - c) / this.comp.globalData.frameRate) / 5e-4;
              return A;
            }
            return R + (R - D) * ((m - c) / 1e-3);
          }
          return this.getValueAtTime(((m - h) % d + h) / this.comp.globalData.frameRate, 0);
        }
        function t(f, b, v) {
          if (!this.k)
            return this.pv;
          f = f ? f.toLowerCase() : "";
          var m = this.comp.renderedFrame, x = this.keyframes, c = x[0].t;
          if (m >= c)
            return this.pv;
          var d, h;
          v ? (b ? d = Math.abs(this.elem.comp.globalData.frameRate * b) : d = Math.max(0, this.elem.data.op - c), h = c + d) : ((!b || b > x.length - 1) && (b = x.length - 1), h = x[b].t, d = h - c);
          var y, P, A;
          if (f === "pingpong") {
            var _ = Math.floor((c - m) / d);
            if (_ % 2 === 0)
              return this.getValueAtTime(((c - m) % d + c) / this.comp.globalData.frameRate, 0);
          } else if (f === "offset") {
            var M = this.getValueAtTime(c / this.comp.globalData.frameRate, 0), w = this.getValueAtTime(h / this.comp.globalData.frameRate, 0), V = this.getValueAtTime((d - (c - m) % d + c) / this.comp.globalData.frameRate, 0), B = Math.floor((c - m) / d) + 1;
            if (this.pv.length) {
              for (A = new Array(M.length), P = A.length, y = 0; y < P; y += 1)
                A[y] = V[y] - (w[y] - M[y]) * B;
              return A;
            }
            return V - (w - M) * B;
          } else if (f === "continue") {
            var R = this.getValueAtTime(c / this.comp.globalData.frameRate, 0), D = this.getValueAtTime((c + 1e-3) / this.comp.globalData.frameRate, 0);
            if (this.pv.length) {
              for (A = new Array(R.length), P = A.length, y = 0; y < P; y += 1)
                A[y] = R[y] + (R[y] - D[y]) * (c - m) / 1e-3;
              return A;
            }
            return R + (R - D) * (c - m) / 1e-3;
          }
          return this.getValueAtTime((d - ((c - m) % d + c)) / this.comp.globalData.frameRate, 0);
        }
        function r(f, b) {
          if (!this.k)
            return this.pv;
          if (f = (f || 0.4) * 0.5, b = Math.floor(b || 5), b <= 1)
            return this.pv;
          var v = this.comp.renderedFrame / this.comp.globalData.frameRate, m = v - f, x = v + f, c = b > 1 ? (x - m) / (b - 1) : 1, d = 0, h = 0, y;
          this.pv.length ? y = createTypedArray("float32", this.pv.length) : y = 0;
          for (var P; d < b; ) {
            if (P = this.getValueAtTime(m + d * c), this.pv.length)
              for (h = 0; h < this.pv.length; h += 1)
                y[h] += P[h];
            else
              y += P;
            d += 1;
          }
          if (this.pv.length)
            for (h = 0; h < this.pv.length; h += 1)
              y[h] /= b;
          else
            y /= b;
          return y;
        }
        function i(f) {
          this._transformCachingAtTime || (this._transformCachingAtTime = {
            v: new Matrix()
          });
          var b = this._transformCachingAtTime.v;
          if (b.cloneFromProps(this.pre.props), this.appliedTransformations < 1) {
            var v = this.a.getValueAtTime(f);
            b.translate(-v[0] * this.a.mult, -v[1] * this.a.mult, v[2] * this.a.mult);
          }
          if (this.appliedTransformations < 2) {
            var m = this.s.getValueAtTime(f);
            b.scale(m[0] * this.s.mult, m[1] * this.s.mult, m[2] * this.s.mult);
          }
          if (this.sk && this.appliedTransformations < 3) {
            var x = this.sk.getValueAtTime(f), c = this.sa.getValueAtTime(f);
            b.skewFromAxis(-x * this.sk.mult, c * this.sa.mult);
          }
          if (this.r && this.appliedTransformations < 4) {
            var d = this.r.getValueAtTime(f);
            b.rotate(-d * this.r.mult);
          } else if (!this.r && this.appliedTransformations < 4) {
            var h = this.rz.getValueAtTime(f), y = this.ry.getValueAtTime(f), P = this.rx.getValueAtTime(f), A = this.or.getValueAtTime(f);
            b.rotateZ(-h * this.rz.mult).rotateY(y * this.ry.mult).rotateX(P * this.rx.mult).rotateZ(-A[2] * this.or.mult).rotateY(A[1] * this.or.mult).rotateX(A[0] * this.or.mult);
          }
          if (this.data.p && this.data.p.s) {
            var _ = this.px.getValueAtTime(f), M = this.py.getValueAtTime(f);
            if (this.data.p.z) {
              var w = this.pz.getValueAtTime(f);
              b.translate(_ * this.px.mult, M * this.py.mult, -w * this.pz.mult);
            } else
              b.translate(_ * this.px.mult, M * this.py.mult, 0);
          } else {
            var V = this.p.getValueAtTime(f);
            b.translate(V[0] * this.p.mult, V[1] * this.p.mult, -V[2] * this.p.mult);
          }
          return b;
        }
        function s() {
          return this.v.clone(new Matrix());
        }
        var n = TransformPropertyFactory.getTransformProperty;
        TransformPropertyFactory.getTransformProperty = function(f, b, v) {
          var m = n(f, b, v);
          return m.dynamicProperties.length ? m.getValueAtTime = i.bind(m) : m.getValueAtTime = s.bind(m), m.setGroupProperty = expressionHelpers.setGroupProperty, m;
        };
        var a = PropertyFactory.getProp;
        PropertyFactory.getProp = function(f, b, v, m, x) {
          var c = a(f, b, v, m, x);
          c.kf ? c.getValueAtTime = expressionHelpers.getValueAtTime.bind(c) : c.getValueAtTime = expressionHelpers.getStaticValueAtTime.bind(c), c.setGroupProperty = expressionHelpers.setGroupProperty, c.loopOut = e, c.loopIn = t, c.smooth = r, c.getVelocityAtTime = expressionHelpers.getVelocityAtTime.bind(c), c.getSpeedAtTime = expressionHelpers.getSpeedAtTime.bind(c), c.numKeys = b.a === 1 ? b.k.length : 0, c.propertyIndex = b.ix;
          var d = 0;
          return v !== 0 && (d = createTypedArray("float32", b.a === 1 ? b.k[0].s.length : b.k.length)), c._cachingAtTime = {
            lastFrame: initialDefaultFrame,
            lastIndex: 0,
            value: d
          }, expressionHelpers.searchExpressions(f, b, c), c.k && x.addDynamicProperty(c), c;
        };
        function l(f) {
          return this._cachingAtTime || (this._cachingAtTime = {
            shapeValue: shapePool.clone(this.pv),
            lastIndex: 0,
            lastTime: initialDefaultFrame
          }), f *= this.elem.globalData.frameRate, f -= this.offsetTime, f !== this._cachingAtTime.lastTime && (this._cachingAtTime.lastIndex = this._cachingAtTime.lastTime < f ? this._caching.lastIndex : 0, this._cachingAtTime.lastTime = f, this.interpolateShape(f, this._cachingAtTime.shapeValue, this._cachingAtTime)), this._cachingAtTime.shapeValue;
        }
        var o = ShapePropertyFactory.getConstructorFunction(), p = ShapePropertyFactory.getKeyframedConstructorFunction();
        function u() {
        }
        u.prototype = {
          vertices: function(b, v) {
            this.k && this.getValue();
            var m = this.v;
            v !== void 0 && (m = this.getValueAtTime(v, 0));
            var x, c = m._length, d = m[b], h = m.v, y = createSizedArray(c);
            for (x = 0; x < c; x += 1)
              b === "i" || b === "o" ? y[x] = [d[x][0] - h[x][0], d[x][1] - h[x][1]] : y[x] = [d[x][0], d[x][1]];
            return y;
          },
          points: function(b) {
            return this.vertices("v", b);
          },
          inTangents: function(b) {
            return this.vertices("i", b);
          },
          outTangents: function(b) {
            return this.vertices("o", b);
          },
          isClosed: function() {
            return this.v.c;
          },
          pointOnPath: function(b, v) {
            var m = this.v;
            v !== void 0 && (m = this.getValueAtTime(v, 0)), this._segmentsLength || (this._segmentsLength = bez.getSegmentsLength(m));
            for (var x = this._segmentsLength, c = x.lengths, d = x.totalLength * b, h = 0, y = c.length, P = 0, A; h < y; ) {
              if (P + c[h].addedLength > d) {
                var _ = h, M = m.c && h === y - 1 ? 0 : h + 1, w = (d - P) / c[h].addedLength;
                A = bez.getPointInSegment(m.v[_], m.v[M], m.o[_], m.i[M], w, c[h]);
                break;
              } else
                P += c[h].addedLength;
              h += 1;
            }
            return A || (A = m.c ? [m.v[0][0], m.v[0][1]] : [m.v[m._length - 1][0], m.v[m._length - 1][1]]), A;
          },
          vectorOnPath: function(b, v, m) {
            b == 1 ? b = this.v.c : b == 0 && (b = 0.999);
            var x = this.pointOnPath(b, v), c = this.pointOnPath(b + 1e-3, v), d = c[0] - x[0], h = c[1] - x[1], y = Math.sqrt(Math.pow(d, 2) + Math.pow(h, 2));
            if (y === 0)
              return [0, 0];
            var P = m === "tangent" ? [d / y, h / y] : [-h / y, d / y];
            return P;
          },
          tangentOnPath: function(b, v) {
            return this.vectorOnPath(b, v, "tangent");
          },
          normalOnPath: function(b, v) {
            return this.vectorOnPath(b, v, "normal");
          },
          setGroupProperty: expressionHelpers.setGroupProperty,
          getValueAtTime: expressionHelpers.getStaticValueAtTime
        }, extendPrototype([u], o), extendPrototype([u], p), p.prototype.getValueAtTime = l, p.prototype.initiateExpression = ExpressionManager.initiateExpression;
        var S = ShapePropertyFactory.getShapeProp;
        ShapePropertyFactory.getShapeProp = function(f, b, v, m, x) {
          var c = S(f, b, v, m, x);
          return c.propertyIndex = b.ix, c.lock = !1, v === 3 ? expressionHelpers.searchExpressions(f, b.pt, c) : v === 4 && expressionHelpers.searchExpressions(f, b.ks, c), c.k && f.addDynamicProperty(c), c;
        };
      }
      function initialize$1() {
        addPropertyDecorator();
      }
      function addDecorator() {
        function e() {
          return this.data.d.x ? (this.calculateExpression = ExpressionManager.initiateExpression.bind(this)(this.elem, this.data.d, this), this.addEffect(this.getExpressionValue.bind(this)), !0) : null;
        }
        TextProperty.prototype.getExpressionValue = function(t, r) {
          var i = this.calculateExpression(r);
          if (t.t !== i) {
            var s = {};
            return this.copyData(s, t), s.t = i.toString(), s.__complete = !1, s;
          }
          return t;
        }, TextProperty.prototype.searchProperty = function() {
          var t = this.searchKeyframes(), r = this.searchExpressions();
          return this.kf = t || r, this.kf;
        }, TextProperty.prototype.searchExpressions = e;
      }
      function initialize() {
        addDecorator();
      }
      function SVGComposableEffect() {
      }
      SVGComposableEffect.prototype = {
        createMergeNode: function e(t, r) {
          var i = createNS("feMerge");
          i.setAttribute("result", t);
          var s, n;
          for (n = 0; n < r.length; n += 1)
            s = createNS("feMergeNode"), s.setAttribute("in", r[n]), i.appendChild(s), i.appendChild(s);
          return i;
        }
      };
      var linearFilterValue = "0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0";
      function SVGTintFilter(e, t, r, i, s) {
        this.filterManager = t;
        var n = createNS("feColorMatrix");
        n.setAttribute("type", "matrix"), n.setAttribute("color-interpolation-filters", "linearRGB"), n.setAttribute("values", linearFilterValue + " 1 0"), this.linearFilter = n, n.setAttribute("result", i + "_tint_1"), e.appendChild(n), n = createNS("feColorMatrix"), n.setAttribute("type", "matrix"), n.setAttribute("color-interpolation-filters", "sRGB"), n.setAttribute("values", "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"), n.setAttribute("result", i + "_tint_2"), e.appendChild(n), this.matrixFilter = n;
        var a = this.createMergeNode(i, [s, i + "_tint_1", i + "_tint_2"]);
        e.appendChild(a);
      }
      extendPrototype([SVGComposableEffect], SVGTintFilter), SVGTintFilter.prototype.renderFrame = function(e) {
        if (e || this.filterManager._mdf) {
          var t = this.filterManager.effectElements[0].p.v, r = this.filterManager.effectElements[1].p.v, i = this.filterManager.effectElements[2].p.v / 100;
          this.linearFilter.setAttribute("values", linearFilterValue + " " + i + " 0"), this.matrixFilter.setAttribute("values", r[0] - t[0] + " 0 0 0 " + t[0] + " " + (r[1] - t[1]) + " 0 0 0 " + t[1] + " " + (r[2] - t[2]) + " 0 0 0 " + t[2] + " 0 0 0 1 0");
        }
      };
      function SVGFillFilter(e, t, r, i) {
        this.filterManager = t;
        var s = createNS("feColorMatrix");
        s.setAttribute("type", "matrix"), s.setAttribute("color-interpolation-filters", "sRGB"), s.setAttribute("values", "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"), s.setAttribute("result", i), e.appendChild(s), this.matrixFilter = s;
      }
      SVGFillFilter.prototype.renderFrame = function(e) {
        if (e || this.filterManager._mdf) {
          var t = this.filterManager.effectElements[2].p.v, r = this.filterManager.effectElements[6].p.v;
          this.matrixFilter.setAttribute("values", "0 0 0 0 " + t[0] + " 0 0 0 0 " + t[1] + " 0 0 0 0 " + t[2] + " 0 0 0 " + r + " 0");
        }
      };
      function SVGStrokeEffect(e, t, r) {
        this.initialized = !1, this.filterManager = t, this.elem = r, this.paths = [];
      }
      SVGStrokeEffect.prototype.initialize = function() {
        var e = this.elem.layerElement.children || this.elem.layerElement.childNodes, t, r, i, s;
        for (this.filterManager.effectElements[1].p.v === 1 ? (s = this.elem.maskManager.masksProperties.length, i = 0) : (i = this.filterManager.effectElements[0].p.v - 1, s = i + 1), r = createNS("g"), r.setAttribute("fill", "none"), r.setAttribute("stroke-linecap", "round"), r.setAttribute("stroke-dashoffset", 1), i; i < s; i += 1)
          t = createNS("path"), r.appendChild(t), this.paths.push({
            p: t,
            m: i
          });
        if (this.filterManager.effectElements[10].p.v === 3) {
          var n = createNS("mask"), a = createElementID();
          n.setAttribute("id", a), n.setAttribute("mask-type", "alpha"), n.appendChild(r), this.elem.globalData.defs.appendChild(n);
          var l = createNS("g");
          for (l.setAttribute("mask", "url(" + getLocationHref() + "#" + a + ")"); e[0]; )
            l.appendChild(e[0]);
          this.elem.layerElement.appendChild(l), this.masker = n, r.setAttribute("stroke", "#fff");
        } else if (this.filterManager.effectElements[10].p.v === 1 || this.filterManager.effectElements[10].p.v === 2) {
          if (this.filterManager.effectElements[10].p.v === 2)
            for (e = this.elem.layerElement.children || this.elem.layerElement.childNodes; e.length; )
              this.elem.layerElement.removeChild(e[0]);
          this.elem.layerElement.appendChild(r), this.elem.layerElement.removeAttribute("mask"), r.setAttribute("stroke", "#fff");
        }
        this.initialized = !0, this.pathMasker = r;
      }, SVGStrokeEffect.prototype.renderFrame = function(e) {
        this.initialized || this.initialize();
        var t, r = this.paths.length, i, s;
        for (t = 0; t < r; t += 1)
          if (this.paths[t].m !== -1 && (i = this.elem.maskManager.viewData[this.paths[t].m], s = this.paths[t].p, (e || this.filterManager._mdf || i.prop._mdf) && s.setAttribute("d", i.lastPath), e || this.filterManager.effectElements[9].p._mdf || this.filterManager.effectElements[4].p._mdf || this.filterManager.effectElements[7].p._mdf || this.filterManager.effectElements[8].p._mdf || i.prop._mdf)) {
            var n;
            if (this.filterManager.effectElements[7].p.v !== 0 || this.filterManager.effectElements[8].p.v !== 100) {
              var a = Math.min(this.filterManager.effectElements[7].p.v, this.filterManager.effectElements[8].p.v) * 0.01, l = Math.max(this.filterManager.effectElements[7].p.v, this.filterManager.effectElements[8].p.v) * 0.01, o = s.getTotalLength();
              n = "0 0 0 " + o * a + " ";
              var p = o * (l - a), u = 1 + this.filterManager.effectElements[4].p.v * 2 * this.filterManager.effectElements[9].p.v * 0.01, S = Math.floor(p / u), f;
              for (f = 0; f < S; f += 1)
                n += "1 " + this.filterManager.effectElements[4].p.v * 2 * this.filterManager.effectElements[9].p.v * 0.01 + " ";
              n += "0 " + o * 10 + " 0 0";
            } else
              n = "1 " + this.filterManager.effectElements[4].p.v * 2 * this.filterManager.effectElements[9].p.v * 0.01;
            s.setAttribute("stroke-dasharray", n);
          }
        if ((e || this.filterManager.effectElements[4].p._mdf) && this.pathMasker.setAttribute("stroke-width", this.filterManager.effectElements[4].p.v * 2), (e || this.filterManager.effectElements[6].p._mdf) && this.pathMasker.setAttribute("opacity", this.filterManager.effectElements[6].p.v), (this.filterManager.effectElements[10].p.v === 1 || this.filterManager.effectElements[10].p.v === 2) && (e || this.filterManager.effectElements[3].p._mdf)) {
          var b = this.filterManager.effectElements[3].p.v;
          this.pathMasker.setAttribute("stroke", "rgb(" + bmFloor(b[0] * 255) + "," + bmFloor(b[1] * 255) + "," + bmFloor(b[2] * 255) + ")");
        }
      };
      function SVGTritoneFilter(e, t, r, i) {
        this.filterManager = t;
        var s = createNS("feColorMatrix");
        s.setAttribute("type", "matrix"), s.setAttribute("color-interpolation-filters", "linearRGB"), s.setAttribute("values", "0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0"), e.appendChild(s);
        var n = createNS("feComponentTransfer");
        n.setAttribute("color-interpolation-filters", "sRGB"), n.setAttribute("result", i), this.matrixFilter = n;
        var a = createNS("feFuncR");
        a.setAttribute("type", "table"), n.appendChild(a), this.feFuncR = a;
        var l = createNS("feFuncG");
        l.setAttribute("type", "table"), n.appendChild(l), this.feFuncG = l;
        var o = createNS("feFuncB");
        o.setAttribute("type", "table"), n.appendChild(o), this.feFuncB = o, e.appendChild(n);
      }
      SVGTritoneFilter.prototype.renderFrame = function(e) {
        if (e || this.filterManager._mdf) {
          var t = this.filterManager.effectElements[0].p.v, r = this.filterManager.effectElements[1].p.v, i = this.filterManager.effectElements[2].p.v, s = i[0] + " " + r[0] + " " + t[0], n = i[1] + " " + r[1] + " " + t[1], a = i[2] + " " + r[2] + " " + t[2];
          this.feFuncR.setAttribute("tableValues", s), this.feFuncG.setAttribute("tableValues", n), this.feFuncB.setAttribute("tableValues", a);
        }
      };
      function SVGProLevelsFilter(e, t, r, i) {
        this.filterManager = t;
        var s = this.filterManager.effectElements, n = createNS("feComponentTransfer");
        (s[10].p.k || s[10].p.v !== 0 || s[11].p.k || s[11].p.v !== 1 || s[12].p.k || s[12].p.v !== 1 || s[13].p.k || s[13].p.v !== 0 || s[14].p.k || s[14].p.v !== 1) && (this.feFuncR = this.createFeFunc("feFuncR", n)), (s[17].p.k || s[17].p.v !== 0 || s[18].p.k || s[18].p.v !== 1 || s[19].p.k || s[19].p.v !== 1 || s[20].p.k || s[20].p.v !== 0 || s[21].p.k || s[21].p.v !== 1) && (this.feFuncG = this.createFeFunc("feFuncG", n)), (s[24].p.k || s[24].p.v !== 0 || s[25].p.k || s[25].p.v !== 1 || s[26].p.k || s[26].p.v !== 1 || s[27].p.k || s[27].p.v !== 0 || s[28].p.k || s[28].p.v !== 1) && (this.feFuncB = this.createFeFunc("feFuncB", n)), (s[31].p.k || s[31].p.v !== 0 || s[32].p.k || s[32].p.v !== 1 || s[33].p.k || s[33].p.v !== 1 || s[34].p.k || s[34].p.v !== 0 || s[35].p.k || s[35].p.v !== 1) && (this.feFuncA = this.createFeFunc("feFuncA", n)), (this.feFuncR || this.feFuncG || this.feFuncB || this.feFuncA) && (n.setAttribute("color-interpolation-filters", "sRGB"), e.appendChild(n)), (s[3].p.k || s[3].p.v !== 0 || s[4].p.k || s[4].p.v !== 1 || s[5].p.k || s[5].p.v !== 1 || s[6].p.k || s[6].p.v !== 0 || s[7].p.k || s[7].p.v !== 1) && (n = createNS("feComponentTransfer"), n.setAttribute("color-interpolation-filters", "sRGB"), n.setAttribute("result", i), e.appendChild(n), this.feFuncRComposed = this.createFeFunc("feFuncR", n), this.feFuncGComposed = this.createFeFunc("feFuncG", n), this.feFuncBComposed = this.createFeFunc("feFuncB", n));
      }
      SVGProLevelsFilter.prototype.createFeFunc = function(e, t) {
        var r = createNS(e);
        return r.setAttribute("type", "table"), t.appendChild(r), r;
      }, SVGProLevelsFilter.prototype.getTableValue = function(e, t, r, i, s) {
        for (var n = 0, a = 256, l, o = Math.min(e, t), p = Math.max(e, t), u = Array.call(null, {
          length: a
        }), S, f = 0, b = s - i, v = t - e; n <= 256; )
          l = n / 256, l <= o ? S = v < 0 ? s : i : l >= p ? S = v < 0 ? i : s : S = i + b * Math.pow((l - e) / v, 1 / r), u[f] = S, f += 1, n += 256 / (a - 1);
        return u.join(" ");
      }, SVGProLevelsFilter.prototype.renderFrame = function(e) {
        if (e || this.filterManager._mdf) {
          var t, r = this.filterManager.effectElements;
          this.feFuncRComposed && (e || r[3].p._mdf || r[4].p._mdf || r[5].p._mdf || r[6].p._mdf || r[7].p._mdf) && (t = this.getTableValue(r[3].p.v, r[4].p.v, r[5].p.v, r[6].p.v, r[7].p.v), this.feFuncRComposed.setAttribute("tableValues", t), this.feFuncGComposed.setAttribute("tableValues", t), this.feFuncBComposed.setAttribute("tableValues", t)), this.feFuncR && (e || r[10].p._mdf || r[11].p._mdf || r[12].p._mdf || r[13].p._mdf || r[14].p._mdf) && (t = this.getTableValue(r[10].p.v, r[11].p.v, r[12].p.v, r[13].p.v, r[14].p.v), this.feFuncR.setAttribute("tableValues", t)), this.feFuncG && (e || r[17].p._mdf || r[18].p._mdf || r[19].p._mdf || r[20].p._mdf || r[21].p._mdf) && (t = this.getTableValue(r[17].p.v, r[18].p.v, r[19].p.v, r[20].p.v, r[21].p.v), this.feFuncG.setAttribute("tableValues", t)), this.feFuncB && (e || r[24].p._mdf || r[25].p._mdf || r[26].p._mdf || r[27].p._mdf || r[28].p._mdf) && (t = this.getTableValue(r[24].p.v, r[25].p.v, r[26].p.v, r[27].p.v, r[28].p.v), this.feFuncB.setAttribute("tableValues", t)), this.feFuncA && (e || r[31].p._mdf || r[32].p._mdf || r[33].p._mdf || r[34].p._mdf || r[35].p._mdf) && (t = this.getTableValue(r[31].p.v, r[32].p.v, r[33].p.v, r[34].p.v, r[35].p.v), this.feFuncA.setAttribute("tableValues", t));
        }
      };
      function SVGDropShadowEffect(e, t, r, i, s) {
        var n = t.container.globalData.renderConfig.filterSize, a = t.data.fs || n;
        e.setAttribute("x", a.x || n.x), e.setAttribute("y", a.y || n.y), e.setAttribute("width", a.width || n.width), e.setAttribute("height", a.height || n.height), this.filterManager = t;
        var l = createNS("feGaussianBlur");
        l.setAttribute("in", "SourceAlpha"), l.setAttribute("result", i + "_drop_shadow_1"), l.setAttribute("stdDeviation", "0"), this.feGaussianBlur = l, e.appendChild(l);
        var o = createNS("feOffset");
        o.setAttribute("dx", "25"), o.setAttribute("dy", "0"), o.setAttribute("in", i + "_drop_shadow_1"), o.setAttribute("result", i + "_drop_shadow_2"), this.feOffset = o, e.appendChild(o);
        var p = createNS("feFlood");
        p.setAttribute("flood-color", "#00ff00"), p.setAttribute("flood-opacity", "1"), p.setAttribute("result", i + "_drop_shadow_3"), this.feFlood = p, e.appendChild(p);
        var u = createNS("feComposite");
        u.setAttribute("in", i + "_drop_shadow_3"), u.setAttribute("in2", i + "_drop_shadow_2"), u.setAttribute("operator", "in"), u.setAttribute("result", i + "_drop_shadow_4"), e.appendChild(u);
        var S = this.createMergeNode(i, [i + "_drop_shadow_4", s]);
        e.appendChild(S);
      }
      extendPrototype([SVGComposableEffect], SVGDropShadowEffect), SVGDropShadowEffect.prototype.renderFrame = function(e) {
        if (e || this.filterManager._mdf) {
          if ((e || this.filterManager.effectElements[4].p._mdf) && this.feGaussianBlur.setAttribute("stdDeviation", this.filterManager.effectElements[4].p.v / 4), e || this.filterManager.effectElements[0].p._mdf) {
            var t = this.filterManager.effectElements[0].p.v;
            this.feFlood.setAttribute("flood-color", rgbToHex(Math.round(t[0] * 255), Math.round(t[1] * 255), Math.round(t[2] * 255)));
          }
          if ((e || this.filterManager.effectElements[1].p._mdf) && this.feFlood.setAttribute("flood-opacity", this.filterManager.effectElements[1].p.v / 255), e || this.filterManager.effectElements[2].p._mdf || this.filterManager.effectElements[3].p._mdf) {
            var r = this.filterManager.effectElements[3].p.v, i = (this.filterManager.effectElements[2].p.v - 90) * degToRads, s = r * Math.cos(i), n = r * Math.sin(i);
            this.feOffset.setAttribute("dx", s), this.feOffset.setAttribute("dy", n);
          }
        }
      };
      var _svgMatteSymbols = [];
      function SVGMatte3Effect(e, t, r) {
        this.initialized = !1, this.filterManager = t, this.filterElem = e, this.elem = r, r.matteElement = createNS("g"), r.matteElement.appendChild(r.layerElement), r.matteElement.appendChild(r.transformedElement), r.baseElement = r.matteElement;
      }
      SVGMatte3Effect.prototype.findSymbol = function(e) {
        for (var t = 0, r = _svgMatteSymbols.length; t < r; ) {
          if (_svgMatteSymbols[t] === e)
            return _svgMatteSymbols[t];
          t += 1;
        }
        return null;
      }, SVGMatte3Effect.prototype.replaceInParent = function(e, t) {
        var r = e.layerElement.parentNode;
        if (r) {
          for (var i = r.children, s = 0, n = i.length; s < n && i[s] !== e.layerElement; )
            s += 1;
          var a;
          s <= n - 2 && (a = i[s + 1]);
          var l = createNS("use");
          l.setAttribute("href", "#" + t), a ? r.insertBefore(l, a) : r.appendChild(l);
        }
      }, SVGMatte3Effect.prototype.setElementAsMask = function(e, t) {
        if (!this.findSymbol(t)) {
          var r = createElementID(), i = createNS("mask");
          i.setAttribute("id", t.layerId), i.setAttribute("mask-type", "alpha"), _svgMatteSymbols.push(t);
          var s = e.globalData.defs;
          s.appendChild(i);
          var n = createNS("symbol");
          n.setAttribute("id", r), this.replaceInParent(t, r), n.appendChild(t.layerElement), s.appendChild(n);
          var a = createNS("use");
          a.setAttribute("href", "#" + r), i.appendChild(a), t.data.hd = !1, t.show();
        }
        e.setMatte(t.layerId);
      }, SVGMatte3Effect.prototype.initialize = function() {
        for (var e = this.filterManager.effectElements[0].p.v, t = this.elem.comp.elements, r = 0, i = t.length; r < i; )
          t[r] && t[r].data.ind === e && this.setElementAsMask(this.elem, t[r]), r += 1;
        this.initialized = !0;
      }, SVGMatte3Effect.prototype.renderFrame = function() {
        this.initialized || this.initialize();
      };
      function SVGGaussianBlurEffect(e, t, r, i) {
        e.setAttribute("x", "-100%"), e.setAttribute("y", "-100%"), e.setAttribute("width", "300%"), e.setAttribute("height", "300%"), this.filterManager = t;
        var s = createNS("feGaussianBlur");
        s.setAttribute("result", i), e.appendChild(s), this.feGaussianBlur = s;
      }
      SVGGaussianBlurEffect.prototype.renderFrame = function(e) {
        if (e || this.filterManager._mdf) {
          var t = 0.3, r = this.filterManager.effectElements[0].p.v * t, i = this.filterManager.effectElements[1].p.v, s = i == 3 ? 0 : r, n = i == 2 ? 0 : r;
          this.feGaussianBlur.setAttribute("stdDeviation", s + " " + n);
          var a = this.filterManager.effectElements[2].p.v == 1 ? "wrap" : "duplicate";
          this.feGaussianBlur.setAttribute("edgeMode", a);
        }
      };
      function TransformEffect() {
      }
      TransformEffect.prototype.init = function(e) {
        this.effectsManager = e, this.type = effectTypes.TRANSFORM_EFFECT, this.matrix = new Matrix(), this.opacity = -1, this._mdf = !1, this._opMdf = !1;
      }, TransformEffect.prototype.renderFrame = function(e) {
        if (this._opMdf = !1, this._mdf = !1, e || this.effectsManager._mdf) {
          var t = this.effectsManager.effectElements, r = t[0].p.v, i = t[1].p.v, s = t[2].p.v === 1, n = t[3].p.v, a = s ? n : t[4].p.v, l = t[5].p.v, o = t[6].p.v, p = t[7].p.v;
          this.matrix.reset(), this.matrix.translate(-r[0], -r[1], r[2]), this.matrix.scale(a * 0.01, n * 0.01, 1), this.matrix.rotate(-p * degToRads), this.matrix.skewFromAxis(-l * degToRads, (o + 90) * degToRads), this.matrix.translate(i[0], i[1], 0), this._mdf = !0, this.opacity !== t[8].p.v && (this.opacity = t[8].p.v, this._opMdf = !0);
        }
      };
      function SVGTransformEffect(e, t) {
        this.init(t);
      }
      extendPrototype([TransformEffect], SVGTransformEffect);
      function CVTransformEffect(e) {
        this.init(e);
      }
      return extendPrototype([TransformEffect], CVTransformEffect), registerRenderer("canvas", CanvasRenderer), registerRenderer("html", HybridRenderer), registerRenderer("svg", SVGRenderer), ShapeModifiers.registerModifier("tm", TrimModifier), ShapeModifiers.registerModifier("pb", PuckerAndBloatModifier), ShapeModifiers.registerModifier("rp", RepeaterModifier), ShapeModifiers.registerModifier("rd", RoundCornersModifier), ShapeModifiers.registerModifier("zz", ZigZagModifier), ShapeModifiers.registerModifier("op", OffsetPathModifier), setExpressionsPlugin(Expressions), setExpressionInterfaces(getInterface), initialize$1(), initialize(), registerEffect$1(20, SVGTintFilter, !0), registerEffect$1(21, SVGFillFilter, !0), registerEffect$1(22, SVGStrokeEffect, !1), registerEffect$1(23, SVGTritoneFilter, !0), registerEffect$1(24, SVGProLevelsFilter, !0), registerEffect$1(25, SVGDropShadowEffect, !0), registerEffect$1(28, SVGMatte3Effect, !1), registerEffect$1(29, SVGGaussianBlurEffect, !0), registerEffect$1(35, SVGTransformEffect, !1), registerEffect(35, CVTransformEffect), lottie;
    }));
  })(lottie$2, lottie$2.exports)), lottie$2.exports;
}
var lottieExports = /* @__PURE__ */ requireLottie();
const lottie = /* @__PURE__ */ getDefaultExportFromCjs(lottieExports);
function _arrayLikeToArray(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, i = Array(t); r < t; r++) i[r] = e[r];
  return i;
}
function _arrayWithHoles(e) {
  if (Array.isArray(e)) return e;
}
function _defineProperty(e, t, r) {
  return (t = _toPropertyKey(t)) in e ? Object.defineProperty(e, t, {
    value: r,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[t] = r, e;
}
function _iterableToArrayLimit(e, t) {
  var r = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r != null) {
    var i, s, n, a, l = [], o = !0, p = !1;
    try {
      if (n = (r = r.call(e)).next, t !== 0) for (; !(o = (i = n.call(r)).done) && (l.push(i.value), l.length !== t); o = !0) ;
    } catch (u) {
      p = !0, s = u;
    } finally {
      try {
        if (!o && r.return != null && (a = r.return(), Object(a) !== a)) return;
      } finally {
        if (p) throw s;
      }
    }
    return l;
  }
}
function _nonIterableRest() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ownKeys(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(e);
    t && (i = i.filter(function(s) {
      return Object.getOwnPropertyDescriptor(e, s).enumerable;
    })), r.push.apply(r, i);
  }
  return r;
}
function _objectSpread2(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? ownKeys(Object(r), !0).forEach(function(i) {
      _defineProperty(e, i, r[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : ownKeys(Object(r)).forEach(function(i) {
      Object.defineProperty(e, i, Object.getOwnPropertyDescriptor(r, i));
    });
  }
  return e;
}
function _objectWithoutProperties(e, t) {
  if (e == null) return {};
  var r, i, s = _objectWithoutPropertiesLoose(e, t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    for (i = 0; i < n.length; i++) r = n[i], t.includes(r) || {}.propertyIsEnumerable.call(e, r) && (s[r] = e[r]);
  }
  return s;
}
function _objectWithoutPropertiesLoose(e, t) {
  if (e == null) return {};
  var r = {};
  for (var i in e) if ({}.hasOwnProperty.call(e, i)) {
    if (t.includes(i)) continue;
    r[i] = e[i];
  }
  return r;
}
function _slicedToArray(e, t) {
  return _arrayWithHoles(e) || _iterableToArrayLimit(e, t) || _unsupportedIterableToArray(e, t) || _nonIterableRest();
}
function _toPrimitive(e, t) {
  if (typeof e != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var i = r.call(e, t);
    if (typeof i != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function _toPropertyKey(e) {
  var t = _toPrimitive(e, "string");
  return typeof t == "symbol" ? t : t + "";
}
function _unsupportedIterableToArray(e, t) {
  if (e) {
    if (typeof e == "string") return _arrayLikeToArray(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? _arrayLikeToArray(e, t) : void 0;
  }
}
var _excluded$1 = ["animationData", "loop", "autoplay", "initialSegment", "onComplete", "onLoopComplete", "onEnterFrame", "onSegmentStart", "onConfigReady", "onDataReady", "onDataFailed", "onLoadedImages", "onDOMLoaded", "onDestroy", "lottieRef", "renderer", "name", "assetsPath", "rendererSettings"], useLottie = function e(t, r) {
  var i = t.animationData, s = t.loop, n = t.autoplay, a = t.initialSegment, l = t.onComplete, o = t.onLoopComplete, p = t.onEnterFrame, u = t.onSegmentStart, S = t.onConfigReady, f = t.onDataReady, b = t.onDataFailed, v = t.onLoadedImages, m = t.onDOMLoaded, x = t.onDestroy;
  t.lottieRef, t.renderer, t.name, t.assetsPath, t.rendererSettings;
  var c = _objectWithoutProperties(t, _excluded$1), d = useState(!1), h = _slicedToArray(d, 2), y = h[0], P = h[1], A = useRef(), _ = useRef(null), M = function() {
    var L;
    (L = A.current) === null || L === void 0 || L.play();
  }, w = function() {
    var L;
    (L = A.current) === null || L === void 0 || L.stop();
  }, V = function() {
    var L;
    (L = A.current) === null || L === void 0 || L.pause();
  }, B = function(L) {
    var O;
    (O = A.current) === null || O === void 0 || O.setSpeed(L);
  }, R = function(L, O) {
    var G;
    (G = A.current) === null || G === void 0 || G.goToAndPlay(L, O);
  }, D = function(L, O) {
    var G;
    (G = A.current) === null || G === void 0 || G.goToAndStop(L, O);
  }, N = function(L) {
    var O;
    (O = A.current) === null || O === void 0 || O.setDirection(L);
  }, I = function(L, O) {
    var G;
    (G = A.current) === null || G === void 0 || G.playSegments(L, O);
  }, C = function(L) {
    var O;
    (O = A.current) === null || O === void 0 || O.setSubframe(L);
  }, T = function(L) {
    var O;
    return (O = A.current) === null || O === void 0 ? void 0 : O.getDuration(L);
  }, g = function() {
    var L;
    (L = A.current) === null || L === void 0 || L.destroy(), A.current = void 0;
  }, E = function() {
    var L = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, O;
    if (_.current) {
      (O = A.current) === null || O === void 0 || O.destroy();
      var G = _objectSpread2(_objectSpread2(_objectSpread2({}, t), L), {}, {
        container: _.current
      });
      return A.current = lottie.loadAnimation(G), P(!!A.current), function() {
        var W;
        (W = A.current) === null || W === void 0 || W.destroy(), A.current = void 0;
      };
    }
  };
  useEffect(function() {
    var k = E();
    return function() {
      return k == null ? void 0 : k();
    };
  }, [i, s]), useEffect(function() {
    A.current && (A.current.autoplay = !!n);
  }, [n]), useEffect(function() {
    if (A.current) {
      if (!a) {
        A.current.resetSegments(!0);
        return;
      }
      !Array.isArray(a) || !a.length || ((A.current.currentRawFrame < a[0] || A.current.currentRawFrame > a[1]) && (A.current.currentRawFrame = a[0]), A.current.setSegment(a[0], a[1]));
    }
  }, [a]), useEffect(function() {
    var k = [{
      name: "complete",
      handler: l
    }, {
      name: "loopComplete",
      handler: o
    }, {
      name: "enterFrame",
      handler: p
    }, {
      name: "segmentStart",
      handler: u
    }, {
      name: "config_ready",
      handler: S
    }, {
      name: "data_ready",
      handler: f
    }, {
      name: "data_failed",
      handler: b
    }, {
      name: "loaded_images",
      handler: v
    }, {
      name: "DOMLoaded",
      handler: m
    }, {
      name: "destroy",
      handler: x
    }], L = k.filter(function(G) {
      return G.handler != null;
    });
    if (L.length) {
      var O = L.map(
        /**
         * Handle the process of adding an event listener
         * @param {Listener} listener
         * @return {Function} Function that deregister the listener
         */
        function(G) {
          var W;
          return (W = A.current) === null || W === void 0 || W.addEventListener(G.name, G.handler), function() {
            var q;
            (q = A.current) === null || q === void 0 || q.removeEventListener(G.name, G.handler);
          };
        }
      );
      return function() {
        O.forEach(function(G) {
          return G();
        });
      };
    }
  }, [l, o, p, u, S, f, b, v, m, x]);
  var F = /* @__PURE__ */ React.createElement("div", _objectSpread2({
    style: r,
    ref: _
  }, c));
  return {
    View: F,
    play: M,
    stop: w,
    pause: V,
    setSpeed: B,
    goToAndStop: D,
    goToAndPlay: R,
    setDirection: N,
    playSegments: I,
    setSubframe: C,
    getDuration: T,
    destroy: g,
    animationContainerRef: _,
    animationLoaded: y,
    animationItem: A.current
  };
};
function getContainerVisibility(e) {
  var t = e.getBoundingClientRect(), r = t.top, i = t.height, s = window.innerHeight - r, n = window.innerHeight + i;
  return s / n;
}
function getContainerCursorPosition(e, t, r) {
  var i = e.getBoundingClientRect(), s = i.top, n = i.left, a = i.width, l = i.height, o = (t - n) / a, p = (r - s) / l;
  return {
    x: o,
    y: p
  };
}
var useInitInteractivity = function e(t) {
  var r = t.wrapperRef, i = t.animationItem, s = t.mode, n = t.actions;
  useEffect(function() {
    var a = r.current;
    if (!(!a || !i || !n.length)) {
      i.stop();
      var l = function() {
        var u = null, S = function() {
          var b = getContainerVisibility(a), v = n.find(function(x) {
            var c = x.visibility;
            return c && b >= c[0] && b <= c[1];
          });
          if (v) {
            if (v.type === "seek" && v.visibility && v.frames.length === 2) {
              var m = v.frames[0] + Math.ceil((b - v.visibility[0]) / (v.visibility[1] - v.visibility[0]) * v.frames[1]);
              //! goToAndStop must be relative to the start of the current segment
              i.goToAndStop(m - i.firstFrame - 1, !0);
            }
            v.type === "loop" && (u === null || u !== v.frames || i.isPaused) && (i.playSegments(v.frames, !0), u = v.frames), v.type === "play" && i.isPaused && (i.resetSegments(!0), i.play()), v.type === "stop" && i.goToAndStop(v.frames[0] - i.firstFrame - 1, !0);
          }
        };
        return document.addEventListener("scroll", S), function() {
          document.removeEventListener("scroll", S);
        };
      }, o = function() {
        var u = function(v, m) {
          var x = v, c = m;
          if (x !== -1 && c !== -1) {
            var d = getContainerCursorPosition(a, x, c);
            x = d.x, c = d.y;
          }
          var h = n.find(function(A) {
            var _ = A.position;
            return _ && Array.isArray(_.x) && Array.isArray(_.y) ? x >= _.x[0] && x <= _.x[1] && c >= _.y[0] && c <= _.y[1] : _ && !Number.isNaN(_.x) && !Number.isNaN(_.y) ? x === _.x && c === _.y : !1;
          });
          if (h) {
            if (h.type === "seek" && h.position && Array.isArray(h.position.x) && Array.isArray(h.position.y) && h.frames.length === 2) {
              var y = (x - h.position.x[0]) / (h.position.x[1] - h.position.x[0]), P = (c - h.position.y[0]) / (h.position.y[1] - h.position.y[0]);
              i.playSegments(h.frames, !0), i.goToAndStop(Math.ceil((y + P) / 2 * (h.frames[1] - h.frames[0])), !0);
            }
            h.type === "loop" && i.playSegments(h.frames, !0), h.type === "play" && (i.isPaused && i.resetSegments(!1), i.playSegments(h.frames)), h.type === "stop" && i.goToAndStop(h.frames[0], !0);
          }
        }, S = function(v) {
          u(v.clientX, v.clientY);
        }, f = function() {
          u(-1, -1);
        };
        return a.addEventListener("mousemove", S), a.addEventListener("mouseout", f), function() {
          a.removeEventListener("mousemove", S), a.removeEventListener("mouseout", f);
        };
      };
      switch (s) {
        case "scroll":
          return l();
        case "cursor":
          return o();
      }
    }
  }, [s, i]);
}, useLottieInteractivity = function e(t) {
  var r = t.actions, i = t.mode, s = t.lottieObj, n = s.animationItem, a = s.View, l = s.animationContainerRef;
  return useInitInteractivity({
    actions: r,
    animationItem: n,
    mode: i,
    wrapperRef: l
  }), a;
}, _excluded = ["style", "interactivity"], Lottie = function e(t) {
  var r, i, s, n = t.style, a = t.interactivity, l = _objectWithoutProperties(t, _excluded), o = useLottie(l, n), p = o.View, u = o.play, S = o.stop, f = o.pause, b = o.setSpeed, v = o.goToAndStop, m = o.goToAndPlay, x = o.setDirection, c = o.playSegments, d = o.setSubframe, h = o.getDuration, y = o.destroy, P = o.animationContainerRef, A = o.animationLoaded, _ = o.animationItem;
  return useEffect(function() {
    t.lottieRef && (t.lottieRef.current = {
      play: u,
      stop: S,
      pause: f,
      setSpeed: b,
      goToAndPlay: m,
      goToAndStop: v,
      setDirection: x,
      playSegments: c,
      setSubframe: d,
      getDuration: h,
      destroy: y,
      animationContainerRef: P,
      animationLoaded: A,
      animationItem: _
    });
  }, [(r = t.lottieRef) === null || r === void 0 ? void 0 : r.current]), useLottieInteractivity({
    lottieObj: {
      View: p,
      play: u,
      stop: S,
      pause: f,
      setSpeed: b,
      goToAndStop: v,
      goToAndPlay: m,
      setDirection: x,
      playSegments: c,
      setSubframe: d,
      getDuration: h,
      destroy: y,
      animationContainerRef: P,
      animationLoaded: A,
      animationItem: _
    },
    actions: (i = a == null ? void 0 : a.actions) !== null && i !== void 0 ? i : [],
    mode: (s = a == null ? void 0 : a.mode) !== null && s !== void 0 ? s : "scroll"
  });
};
const browserPrefersReducedMotion$2 = () => typeof window > "u" || typeof window.matchMedia != "function" ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function LottieBotAvatar({
  model: e,
  state: t,
  size: r,
  lightColor: i,
  ariaLabel: s,
  paused: n = !1
}) {
  const a = useRef(null), [l, o] = useState(browserPrefersReducedMotion$2), [p, u] = useState(!1), S = e.stateSegments[t] ?? e.fallbackSegment;
  return useEffect(() => {
    if (typeof window > "u" || typeof window.matchMedia != "function")
      return;
    const f = window.matchMedia("(prefers-reduced-motion: reduce)"), b = () => o(f.matches);
    return f.addEventListener("change", b), () => f.removeEventListener("change", b);
  }, []), useEffect(() => {
    var f, b, v, m, x;
    if (p) {
      if (l) {
        (f = a.current) == null || f.goToAndStop(S[0], !0);
        return;
      }
      if (n) {
        (b = a.current) == null || b.pause();
        return;
      }
      (m = (v = a.current) == null ? void 0 : v.animationItem) == null || m.setSegment(S[0], S[1]), (x = a.current) == null || x.goToAndPlay(S[0], !0);
    }
  }, [p, n, l, S]), /* @__PURE__ */ jsx(
    "div",
    {
      role: "img",
      "aria-label": s ?? `Bot avatar - ${t} state - ${e.name} model`,
      "data-vultus-model": e.id,
      "data-vultus-renderer": "lottie",
      "data-vultus-paused": n ? "true" : "false",
      style: {
        width: r,
        height: r,
        display: "block",
        overflow: "hidden",
        background: i
      },
      children: /* @__PURE__ */ jsx(
        Lottie,
        {
          lottieRef: a,
          animationData: e.animationData,
          autoplay: !l && !n,
          loop: !l,
          onDOMLoaded: () => u(!0),
          "aria-hidden": "true",
          style: { width: "100%", height: "100%" }
        }
      )
    }
  );
}
function defineProceduralAvatarModel(e) {
  return Object.freeze({ ...e, renderer: "procedural" });
}
function defineLottieAvatarModel(e) {
  return Object.freeze({ ...e, renderer: "lottie" });
}
function createBotAvatarModelZoo(e) {
  const t = e.map((i) => [i.id, i]), r = t.map(([i]) => i);
  if (new Set(r).size !== r.length)
    throw new Error("Vultus model identifiers must be unique.");
  return Object.freeze(Object.fromEntries(t));
}
const VULTUS_CLASSIC_MODEL = defineProceduralAvatarModel({
  id: "vultus-classic",
  name: "Vultus Classic",
  viewBox: [0, 0, 200, 200],
  background: "light",
  clipShape: { cx: 100, cy: 100, r: 90 },
  underlayShapes: [{ kind: "circle", cx: 100, cy: 100, r: 90, fillRole: "shadow" }],
  body: [
    { kind: "circle", cx: 100, cy: 20, r: 10, fillRole: "light", slot: "accent" },
    { kind: "rect", x: 95, y: 25, width: 10, height: 25, fillRole: "light" },
    { kind: "rect", x: 15, y: 80, width: 30, height: 40, rx: 8, fillRole: "light" },
    { kind: "rect", x: 155, y: 80, width: 30, height: 40, rx: 8, fillRole: "light" },
    { kind: "rect", x: 35, y: 45, width: 130, height: 100, rx: 30, fillRole: "light" },
    { kind: "rect", x: 80, y: 140, width: 40, height: 20, fillRole: "light" },
    { kind: "path", d: "M 20 200 Q 100 150 180 200 Z", fillRole: "light" }
  ],
  features: {
    leftEye: { cx: 70, cy: 90, fillRole: "shadow" },
    rightEye: { cx: 130, cy: 90, fillRole: "shadow" },
    mouth: { cx: 100, cy: 122, fillRole: "shadow" }
  },
  eyeShapesByState: classicEyeShapeDefinitionsByState,
  mouthShapesByState: classicMouthShapeDefinitionsByState,
  blink: { closedRx: 13, closedRy: 1.5 },
  rootTransformOrigin: "100px 100px"
});
function avatarModelFromZoo(e, t, r = VULTUS_CLASSIC_MODEL) {
  return e[t] ?? r;
}
const DEFAULT_GAZE_CONFIG = {
  trackMs: 220,
  driftBackMs: 480,
  pointerRestMs: 900,
  proximityPx: 240,
  wanderMinMs: 4e3,
  wanderMaxMs: 9e3,
  wanderHoldMs: 900,
  wanderMagnitude: 0.55,
  blinkMinMs: 2500,
  blinkMaxMs: 6500,
  blinkSubsequentMinMs: 3500,
  blinkSubsequentMaxMs: 11e3,
  blinkCloseMs: 90,
  blinkHoldMs: 40,
  blinkOpenMs: 130,
  defensiveSquintEyelid: 0.6,
  defensiveSquintInMs: 90,
  defensiveSquintOutMs: 160,
  bodyFlinchSquashScale: 0.85,
  bodyFlinchOvershootScale: 1.06,
  bodyFlinchRotationDeg: 7,
  bodyFlinchInMs: 70,
  bodyFlinchOvershootMs: 140,
  bodyFlinchSettleMs: 120,
  easing: "cubic-bezier(0.22, 0.75, 0.18, 1)"
}, NEUTRAL_GAZE_VECTOR = { x: 0, y: 0 }, clampUnit = (e) => Math.max(-1, Math.min(1, e));
function makeSeededRandom(e) {
  let t = e >>> 0;
  return () => {
    t = t + 1831565813 | 0;
    let r = Math.imul(t ^ t >>> 15, 1 | t);
    return r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r, ((r ^ r >>> 14) >>> 0) / 4294967296;
  };
}
function computePointerGazeVector(e, t) {
  if (e.width <= 0 || e.height <= 0)
    return { ...NEUTRAL_GAZE_VECTOR };
  const r = e.left + e.width / 2, i = e.top + e.height / 2;
  return {
    x: clampUnit((t.x - r) / (e.width / 2)),
    y: clampUnit((t.y - i) / (e.height / 2))
  };
}
function isPointerWithinProximity(e, t, r) {
  const i = Math.max(e.left, Math.min(t.x, e.left + e.width)), s = Math.max(e.top, Math.min(t.y, e.top + e.height)), n = t.x - i, a = t.y - s;
  return Math.sqrt(n * n + a * a) <= r;
}
function applyGazeTravel(e, t) {
  return {
    dx: e.x >= 0 ? e.x * t.right : e.x * t.left,
    dy: e.y >= 0 ? e.y * t.down : e.y * t.up
  };
}
function applyBlinkScale(e, t) {
  return 1 - e * (1 - t);
}
const randomInitialBlinkGapMs = (e, t) => t.blinkMinMs + e() * (t.blinkMaxMs - t.blinkMinMs), randomSubsequentBlinkGapMs = (e, t) => t.blinkSubsequentMinMs + e() * (t.blinkSubsequentMaxMs - t.blinkSubsequentMinMs);
function createBlinkState(e, t, r = DEFAULT_GAZE_CONFIG) {
  return { phase: "open", eyelid: 0, nextChangeAt: e + randomInitialBlinkGapMs(t, r) };
}
function advanceBlinkState(e, t, r, i = DEFAULT_GAZE_CONFIG) {
  return t < e.nextChangeAt ? e : e.phase === "open" ? { phase: "closing", eyelid: 1, nextChangeAt: t + i.blinkCloseMs + i.blinkHoldMs } : e.phase === "closing" ? { phase: "opening", eyelid: 0, nextChangeAt: t + i.blinkOpenMs } : { phase: "open", eyelid: 0, nextChangeAt: t + randomSubsequentBlinkGapMs(r, i) };
}
function buildBodyFlinchSteps(e = DEFAULT_GAZE_CONFIG) {
  return [
    {
      scale: e.bodyFlinchSquashScale,
      recoilFactor: 1,
      durationMs: e.bodyFlinchInMs,
      waitMs: e.bodyFlinchInMs
    },
    {
      scale: e.bodyFlinchOvershootScale,
      recoilFactor: -0.35,
      durationMs: e.bodyFlinchOvershootMs,
      waitMs: e.bodyFlinchOvershootMs
    },
    { scale: 1, recoilFactor: 0, durationMs: e.bodyFlinchSettleMs, waitMs: e.bodyFlinchSettleMs }
  ];
}
function applyBodyFlinchRecoil(e, t, r, i) {
  return {
    dx: t.x * r * e,
    dy: t.y * r * e,
    rotation: t.x * i * e
  };
}
const randomRestGapMs = (e, t) => t.wanderMinMs + e() * (t.wanderMaxMs - t.wanderMinMs);
function createGazeWanderState(e, t, r = DEFAULT_GAZE_CONFIG) {
  return {
    phase: "resting",
    vector: { ...NEUTRAL_GAZE_VECTOR },
    nextChangeAt: e + randomRestGapMs(t, r)
  };
}
function advanceGazeWander(e, t, r, i = DEFAULT_GAZE_CONFIG) {
  if (t < e.nextChangeAt)
    return e;
  if (e.phase === "resting") {
    const s = r() * Math.PI * 2, n = i.wanderMagnitude * (0.5 + r() * 0.5);
    return {
      phase: "glancing",
      vector: { x: clampUnit(Math.cos(s) * n), y: clampUnit(Math.sin(s) * n) },
      nextChangeAt: t + i.wanderHoldMs
    };
  }
  return {
    phase: "resting",
    vector: { ...NEUTRAL_GAZE_VECTOR },
    nextChangeAt: t + randomRestGapMs(r, i)
  };
}
const browserPrefersReducedMotion$1 = () => typeof window > "u" || typeof window.matchMedia != "function" ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches, browserHasFinePointer = () => typeof window > "u" || typeof window.matchMedia != "function" ? !1 : window.matchMedia("(pointer: fine)").matches, isFixedVector = (e) => typeof e == "object";
function useGazeBehavior({
  svgElementRef: e,
  gazeGroupElementRef: t,
  eyelidGroupElementRef: r,
  bodyElementRef: i,
  gaze: s,
  geometry: n,
  config: a,
  focusElement: l
}) {
  const o = useRef({ ...DEFAULT_GAZE_CONFIG, ...a });
  o.current = { ...DEFAULT_GAZE_CONFIG, ...a };
  const p = isFixedVector(s) ? `${s.x}:${s.y}` : null;
  useEffect(() => {
    const u = t.current, S = r.current, f = e.current;
    if (s === "none" || !n || !u || !S || !f)
      return;
    let b = !1, v = browserPrefersReducedMotion$1(), m = browserHasFinePointer(), x = null, c = !1, d = !1, h = !0, y = typeof document < "u" && document.hidden, P = null, A = null, _ = null, M = null, w = !1, V = null, B = createGazeWanderState(Date.now(), Math.random, o.current), R = createBlinkState(Date.now(), Math.random, o.current);
    const D = () => b || v || y || !h, N = (z, Z) => {
      if (!n)
        return;
      const { dx: X, dy: Q } = applyGazeTravel(z, n.travel);
      u.style.transition = v ? "none" : `transform ${Z}ms ${o.current.easing}`, u.style.transform = `translate(${X}px, ${Q}px)`;
    }, I = (z, Z) => {
      if (!n)
        return;
      const X = applyBlinkScale(z, n.blinkClosedScaleY);
      S.style.transition = v ? "none" : `transform ${Z}ms ${o.current.easing}`, S.style.transform = `scaleY(${X})`;
    }, C = (z) => N(NEUTRAL_GAZE_VECTOR, z), T = () => {
      P !== null && (clearTimeout(P), P = null);
    }, g = () => {
      A !== null && (clearTimeout(A), A = null);
    }, E = () => {
      _ !== null && (clearTimeout(_), _ = null);
    }, F = () => {
      M !== null && (clearTimeout(M), M = null);
    }, k = () => {
      T(), P = setTimeout(() => {
        P = null, c = !1, D() || C(o.current.driftBackMs), Y();
      }, o.current.pointerRestMs);
    }, L = () => {
      if (V = null, D() || s !== "pointer" || !m || !x)
        return;
      const z = f.getBoundingClientRect();
      N(computePointerGazeVector(z, x), o.current.trackMs), c = !0, k();
    }, O = (z) => {
      z.pointerType !== "mouse" && z.pointerType !== "pen" || (m = !0, x = { x: z.clientX, y: z.clientY }, g(), V === null && (V = typeof requestAnimationFrame == "function" ? requestAnimationFrame(L) : setTimeout(L, 16)));
    }, G = (z) => {
      if (z.pointerType !== "touch" || s !== "pointer" || D())
        return;
      x = { x: z.clientX, y: z.clientY }, g();
      const Z = f.getBoundingClientRect();
      N(computePointerGazeVector(Z, x), o.current.trackMs), c = !0, k();
    }, W = () => {
      x = null, c = !1, T(), !D() && s === "pointer" && (C(o.current.driftBackMs), Y());
    }, q = () => {
      const z = Date.now();
      B = advanceGazeWander(B, z, Math.random, o.current), D() || N(B.vector, o.current.wanderHoldMs);
      const Z = Math.max(16, B.nextChangeAt - z);
      A = setTimeout(q, Z);
    };
    function Y() {
      if (g(), isFixedVector(s) || D())
        return;
      if (s === "auto" || s === "pointer" && !c) {
        const Z = Date.now();
        B = createGazeWanderState(Z, Math.random, o.current), A = setTimeout(q, Math.max(16, B.nextChangeAt - Z));
      }
    }
    const ee = () => {
      const z = Date.now();
      if (R = advanceBlinkState(R, z, Math.random, o.current), !D()) {
        const X = R.phase === "closing" ? o.current.blinkCloseMs : R.phase === "opening" ? o.current.blinkOpenMs : o.current.blinkCloseMs;
        I(R.eyelid, X);
      }
      const Z = Math.max(16, R.nextChangeAt - z);
      _ = setTimeout(ee, Z);
    };
    function te() {
      if (E(), d || D())
        return;
      const z = Date.now();
      R = createBlinkState(z, Math.random, o.current), _ = setTimeout(ee, Math.max(16, R.nextChangeAt - z));
    }
    const j = (z) => {
      z.pointerType !== "mouse" && z.pointerType !== "pen" || d || D() || (d = !0, E(), I(o.current.defensiveSquintEyelid, o.current.defensiveSquintInMs));
    }, $ = (z) => {
      z.pointerType !== "mouse" && z.pointerType !== "pen" || d && (d = !1, D() || I(0, o.current.defensiveSquintOutMs), te());
    }, K = n.bodyFlinch ? (i == null ? void 0 : i.current) ?? null : null, U = (z) => {
      if (!K || w || D() || !n)
        return;
      const Z = K.getBoundingClientRect(), X = computePointerGazeVector(Z, { x: z.clientX, y: z.clientY }), Q = { x: -X.x, y: -X.y };
      w = !0;
      const ae = buildBodyFlinchSteps(o.current), oe = (he) => {
        if (he >= ae.length) {
          w = !1;
          return;
        }
        const fe = ae[he];
        if (!D()) {
          const { dx: pe, dy: ce, rotation: ue } = applyBodyFlinchRecoil(
            fe.recoilFactor,
            Q,
            n.bodyFlinchRecoilDistance,
            o.current.bodyFlinchRotationDeg
          );
          K.style.transition = v ? "none" : `transform ${fe.durationMs}ms ${o.current.easing}`, K.style.transform = `translate(${pe}px, ${ce}px) rotate(${ue}deg) scale(${fe.scale})`;
        }
        M = setTimeout(() => {
          M = null, oe(he + 1);
        }, fe.waitMs);
      };
      oe(0);
    }, H = () => {
      d = !1, S.style.transition = "none", S.style.transform = "scaleY(1)", K && (K.style.transition = "none", K.style.transform = "translate(0px, 0px) rotate(0deg) scale(1)");
    }, se = (z) => {
      v = z.matches, v ? (T(), g(), E(), F(), w = !1, u.style.transition = "none", u.style.transform = "translate(0px, 0px)", H()) : (Y(), te());
    }, le = (z) => {
      m = z.matches, Y();
    }, ne = () => {
      y = typeof document < "u" && document.hidden, y ? (T(), g(), E(), F(), w = !1) : (Y(), te());
    };
    let re = null;
    typeof IntersectionObserver == "function" && (re = new IntersectionObserver(
      (z) => {
        const Z = z[z.length - 1];
        h = (Z == null ? void 0 : Z.isIntersecting) ?? !0, h ? (Y(), te()) : (T(), g(), E(), F(), w = !1);
      },
      { threshold: 0 }
    ), re.observe(f));
    const ie = typeof window.matchMedia == "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null, J = typeof window.matchMedia == "function" ? window.matchMedia("(pointer: fine)") : null;
    return ie == null || ie.addEventListener("change", se), J == null || J.addEventListener("change", le), window.addEventListener("pointermove", O, { passive: !0 }), window.addEventListener("pointerdown", G, { passive: !0 }), document.addEventListener("mouseleave", W), document.addEventListener("visibilitychange", ne), f.addEventListener("pointerenter", j), f.addEventListener("pointerleave", $), K && K.addEventListener("click", U), isFixedVector(s) ? N(s, o.current.trackMs) : C(0), I(0, 0), v ? H() : (Y(), te()), () => {
      b = !0, T(), g(), E(), F(), V !== null && (typeof cancelAnimationFrame == "function" ? cancelAnimationFrame(V) : clearTimeout(V)), re == null || re.disconnect(), ie == null || ie.removeEventListener("change", se), J == null || J.removeEventListener("change", le), window.removeEventListener("pointermove", O), window.removeEventListener("pointerdown", G), document.removeEventListener("mouseleave", W), document.removeEventListener("visibilitychange", ne), f.removeEventListener("pointerenter", j), f.removeEventListener("pointerleave", $), K && K.removeEventListener("click", U);
    };
  }, [
    s === "none" ? "none" : s === "auto" ? "auto" : s === "pointer" ? "pointer" : p,
    n,
    t,
    r,
    e
  ]), useEffect(() => {
    if (!l || s === "none" || !n)
      return;
    const u = e.current, S = t.current;
    if (!u || !S)
      return;
    const f = browserPrefersReducedMotion$1(), b = () => {
      const m = u.getBoundingClientRect(), x = l.getBoundingClientRect(), c = {
        x: x.left + x.width / 2,
        y: x.top + x.height / 2
      }, { dx: d, dy: h } = applyGazeTravel(computePointerGazeVector(m, c), n.travel);
      S.style.transition = f ? "none" : `transform ${o.current.trackMs}ms ${o.current.easing}`, S.style.transform = `translate(${d}px, ${h}px)`;
    };
    b();
    const v = setInterval(b, 400);
    return () => clearInterval(v);
  }, [l, s, n, e, t]);
}
const DEFAULT_BOT_AVATAR_SHADOW_COLOR_NAME = "dimgray", DEFAULT_BOT_AVATAR_LIGHT_COLOR_NAME = "white", DEFAULT_NEUTRAL_BORED_INTERVAL_MIN_MS = 1e4, DEFAULT_NEUTRAL_BORED_INTERVAL_MAX_MS = 2e4, DEFAULT_NEUTRAL_BORED_VARIANT_DURATION_MIN_MS = 1e3, DEFAULT_NEUTRAL_BORED_VARIANT_DURATION_MAX_MS = 2e3, ellipsePathAtPosition = (e, t, r, i) => buildFourSegmentEllipsePath(e, t, r, i), appendBlinkToTimeline = (e, t, r) => {
  const { leftEye: i, rightEye: s } = t.model.features, { closedRx: n, closedRy: a } = t.model.blink, l = computeAllFacialPathsForState(t.model, "neutral"), o = ellipsePathAtPosition(i.cx, i.cy, n, a), p = ellipsePathAtPosition(s.cx, s.cy, n, a), u = { value: 0 }, S = (r == null ? void 0 : r.closeDuration) ?? 0.09, f = (r == null ? void 0 : r.closedHoldDuration) ?? 0.03, b = (r == null ? void 0 : r.openDuration) ?? 0.13, v = () => {
    var x, c;
    const m = u.value;
    (x = t.leftEyePathElementRef.current) == null || x.setAttribute(
      "d",
      interpolateNumericValuesBetweenPathStrings(l.leftEyePathString, o, m)
    ), (c = t.rightEyePathElementRef.current) == null || c.setAttribute(
      "d",
      interpolateNumericValuesBetweenPathStrings(l.rightEyePathString, p, m)
    );
  };
  e.to(u, {
    value: 1,
    duration: S,
    ease: "power2.in",
    onUpdate: v
  }), f > 0 && e.to({}, { duration: f }), e.to(u, {
    value: 0,
    duration: b,
    ease: "power2.out",
    onUpdate: v
  });
}, buildNeutralBlinkBoredAnimation = (e, t) => {
  const r = Math.max(t / 1e3, 1), i = Math.max(0.24, r - 0.58), s = gsap.timeline();
  return appendBlinkToTimeline(s, e, {
    closeDuration: 0.1,
    closedHoldDuration: 0.03,
    openDuration: 0.16
  }), s.to({}, { duration: i * 0.45 }), appendBlinkToTimeline(s, e, {
    closeDuration: 0.08,
    closedHoldDuration: 0.02,
    openDuration: 0.12
  }), s.to({}, { duration: i * 0.55 }), s;
}, buildNeutralEyeGlanceBoredAnimation = (e, t) => {
  const r = Math.max(t / 1e3, 1), i = r * 0.24, s = r * 0.14, { leftEye: n, rightEye: a } = e.model.features, o = e.model.eyeShapesByState.neutral.rx, p = o * (5 / 14), u = ellipsePathAtPosition(n.cx, n.cy, o, o), S = ellipsePathAtPosition(a.cx, a.cy, o, o), f = ellipsePathAtPosition(n.cx + p, n.cy, o, o), b = ellipsePathAtPosition(a.cx + p, a.cy, o, o), v = ellipsePathAtPosition(n.cx - p, n.cy, o, o), m = ellipsePathAtPosition(a.cx - p, a.cy, o, o), x = gsap.timeline(), c = (d, h, y, P, A) => {
    const _ = { value: 0 };
    x.to(_, {
      value: 1,
      duration: A,
      ease: "sine.inOut",
      onUpdate: () => {
        var w, V;
        const M = _.value;
        (w = e.leftEyePathElementRef.current) == null || w.setAttribute(
          "d",
          interpolateNumericValuesBetweenPathStrings(d, h, M)
        ), (V = e.rightEyePathElementRef.current) == null || V.setAttribute(
          "d",
          interpolateNumericValuesBetweenPathStrings(y, P, M)
        );
      }
    });
  };
  return c(u, f, S, b, i), x.to({}, { duration: s * 0.6 }), appendBlinkToTimeline(x, e, {
    closeDuration: 0.08,
    closedHoldDuration: 0.02,
    openDuration: 0.1
  }), x.to({}, { duration: s * 0.4 }), c(f, v, b, m, i), x.to({}, { duration: s * 0.6 }), appendBlinkToTimeline(x, e, {
    closeDuration: 0.07,
    closedHoldDuration: 0.01,
    openDuration: 0.09
  }), x.to({}, { duration: s * 0.4 }), c(v, u, m, S, i), x.to({}, { duration: Math.max(0.08, r - (i * 3 + s * 2 + 0.37)) }), x;
}, buildNeutralAntennaFidgetBoredAnimation = (e, t) => {
  const r = Math.max(t / 1e3, 1), i = gsap.timeline();
  return e.antennaCircleElementRef.current && i.to(e.antennaCircleElementRef.current, {
    scale: 1.36,
    transformOrigin: "100px 20px",
    duration: r * 0.18,
    yoyo: !0,
    repeat: 3,
    ease: "sine.inOut"
  }, 0), e.innerHeadGroupElementRef.current && i.to(e.innerHeadGroupElementRef.current, {
    y: -1.5,
    duration: r * 0.22,
    yoyo: !0,
    repeat: 3,
    ease: "sine.inOut"
  }, 0), appendBlinkToTimeline(i, e, {
    closeDuration: 0.08,
    closedHoldDuration: 0.02,
    openDuration: 0.1
  }), i.to({}, { duration: Math.max(0.08, r * 0.12) }), i;
}, buildEyeWanderIdleAnimation = (e, t, r, i, s) => {
  const { leftEye: n, rightEye: a } = e.model.features, l = t / 14, o = r.map(({ dx: u, dy: S }) => ({
    leftEyePath: ellipsePathAtPosition(
      n.cx + u * l,
      n.cy + S * l,
      t,
      t
    ),
    rightEyePath: ellipsePathAtPosition(
      a.cx + u * l,
      a.cy + S * l,
      t,
      t
    )
  })), p = gsap.timeline({ repeat: -1 });
  for (let u = 0; u < o.length; u += 1) {
    const S = o[u], f = o[(u + 1) % o.length], b = { value: 0 };
    p.to(b, {
      value: 1,
      duration: i,
      ease: "power2.inOut",
      onUpdate: () => {
        var m, x;
        const v = b.value;
        (m = e.leftEyePathElementRef.current) == null || m.setAttribute(
          "d",
          interpolateNumericValuesBetweenPathStrings(S.leftEyePath, f.leftEyePath, v)
        ), (x = e.rightEyePathElementRef.current) == null || x.setAttribute(
          "d",
          interpolateNumericValuesBetweenPathStrings(S.rightEyePath, f.rightEyePath, v)
        );
      }
    }), p.to({}, { duration: s(u) });
  }
  return p;
}, buildThinkingWanderIdleAnimation = (e) => buildEyeWanderIdleAnimation(
  e,
  e.model.eyeShapesByState.thinking.rx,
  [
    { dx: 0, dy: -4 },
    { dx: -4, dy: -6 },
    { dx: 0, dy: -8 },
    { dx: 4, dy: -6 }
  ],
  0.5,
  () => 1.1 + Math.random() * 0.6
), buildToolResponseReadingIdleAnimation = (e) => buildEyeWanderIdleAnimation(
  e,
  e.model.eyeShapesByState.toolResponse.rx,
  [
    { dx: -4, dy: 0 },
    { dx: 0, dy: 0 },
    { dx: 4, dy: 0 },
    { dx: 0, dy: 0 }
  ],
  0.16,
  () => 0.35
), buildSimpleTransformIdleAnimation = (e, t) => {
  if (!e)
    return { kill: () => {
    } };
  const r = gsap.to(e, t);
  return {
    kill: () => {
      r.kill(), gsap.set(e, { clearProps: "transform" });
    }
  };
}, buildDeepThinkingBreathingIdleAnimation = (e) => buildSimpleTransformIdleAnimation(e.innerHeadGroupElementRef.current, {
  scale: 1.025,
  transformOrigin: "100px 100px",
  duration: 2.6,
  yoyo: !0,
  repeat: -1,
  ease: "sine.inOut"
}), buildToolCallingAntennaPulseIdleAnimation = (e) => buildSimpleTransformIdleAnimation(e.antennaCircleElementRef.current, {
  scale: 1.45,
  transformOrigin: "100px 20px",
  duration: 0.42,
  yoyo: !0,
  repeat: -1,
  ease: "sine.inOut"
}), buildSpeakingCompleteHappyBounceIdleAnimation = (e) => buildSimpleTransformIdleAnimation(e.innerHeadGroupElementRef.current, {
  y: -2,
  duration: 0.7,
  yoyo: !0,
  repeat: -1,
  ease: "sine.inOut"
}), buildSpeakingVariantPulseIdleAnimation = (e, t, r) => {
  const i = computeAllFacialPathsForState(e.model, t).mouthPathString, s = computeAllFacialPathsForState(
    e.model,
    r
  ).mouthPathString, n = { value: 0 };
  return gsap.to(n, {
    value: 1,
    duration: 0.18,
    yoyo: !0,
    repeat: -1,
    ease: "sine.inOut",
    onUpdate: () => {
      var a;
      (a = e.mouthPathElementRef.current) == null || a.setAttribute(
        "d",
        interpolateNumericValuesBetweenPathStrings(i, s, n.value)
      );
    }
  });
}, neutralBoredAnimationBuilders = [
  buildNeutralBlinkBoredAnimation,
  buildNeutralEyeGlanceBoredAnimation,
  buildNeutralAntennaFidgetBoredAnimation
], idleAnimationBuildersByStateKey = {
  thinking: (e) => buildThinkingWanderIdleAnimation(e),
  deepThinking: (e) => buildDeepThinkingBreathingIdleAnimation(e),
  toolCalling: (e) => buildToolCallingAntennaPulseIdleAnimation(e),
  toolResponse: (e) => buildToolResponseReadingIdleAnimation(e),
  speakingOpen: (e) => buildSpeakingVariantPulseIdleAnimation(e, "speakingOpen", "speakingRound"),
  speakingWide: (e) => buildSpeakingVariantPulseIdleAnimation(e, "speakingWide", "speakingOpen"),
  speakingRound: (e) => buildSpeakingVariantPulseIdleAnimation(e, "speakingRound", "speakingWide"),
  speakingComplete: (e) => buildSpeakingCompleteHappyBounceIdleAnimation(e)
}, isBotAvatarState = (e) => BOT_AVATAR_STATES.includes(e), pickRandomDurationMilliseconds = (e, t) => e + Math.floor(Math.random() * (t - e + 1)), pickRandomNeutralBoredAnimationBuilder = () => neutralBoredAnimationBuilders[Math.floor(Math.random() * neutralBoredAnimationBuilders.length)], browserPrefersReducedMotion = () => typeof window > "u" || typeof window.matchMedia != "function" ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches, resolveFillColor = (e, t) => e === "shadow" ? t.shadowColor : e === "accent" ? t.accentColor : t.lightColor, renderProceduralShape = (e, t, r, i) => {
  const s = resolveFillColor(e.fillRole, r);
  if (e.kind === "circle") {
    const n = e.slot === "accent" ? i : void 0;
    return /* @__PURE__ */ jsx("circle", { ref: n, cx: e.cx, cy: e.cy, r: e.r, fill: s }, t);
  }
  return e.kind === "rect" ? /* @__PURE__ */ jsx(
    "rect",
    {
      x: e.x,
      y: e.y,
      width: e.width,
      height: e.height,
      ...e.rx !== void 0 ? { rx: e.rx } : {},
      ...e.ry !== void 0 ? { ry: e.ry } : {},
      fill: s
    },
    t
  ) : /* @__PURE__ */ jsx("path", { d: e.d, fill: s }, t);
}, ProceduralBotAvatar = ({
  model: e,
  state: t = "neutral",
  neutralIdleMode: r = "bored-random",
  size: i = 240,
  transitionDurationSeconds: s = 0.55,
  shadowColor: n = DEFAULT_BOT_AVATAR_SHADOW_COLOR_NAME,
  lightColor: a = DEFAULT_BOT_AVATAR_LIGHT_COLOR_NAME,
  accentColor: l = a,
  ariaLabel: o,
  paused: p = !1,
  gaze: u = "none",
  gazeConfig: S,
  focusElement: f = null
}) => {
  var te;
  const b = isBotAvatarState(t) ? t : "neutral", m = `bot-avatar-head-clip-${useId().replace(/:/g, "")}`, x = useRef(null), c = useRef(null), d = useRef(null), h = useRef(null), y = useRef(null), P = useRef(null), A = useRef(null), _ = useRef(null), M = useRef(null), w = useRef(null), V = useRef(null), B = useRef(null), R = useRef(computeAllFacialPathsForState(e, b)), D = u !== "none" && !!e.gaze, N = D && !!((te = e.gaze) != null && te.bodyFlinch);
  useGazeBehavior({
    svgElementRef: x,
    gazeGroupElementRef: A,
    eyelidGroupElementRef: _,
    bodyElementRef: M,
    gaze: u,
    geometry: e.gaze,
    config: S,
    focusElement: f
  }), useEffect(() => {
    var ne, re, ie;
    const j = {
      model: e,
      leftEyePathElementRef: c,
      rightEyePathElementRef: d,
      mouthPathElementRef: h,
      antennaCircleElementRef: y,
      innerHeadGroupElementRef: P
    };
    if (!j.leftEyePathElementRef.current || !j.rightEyePathElementRef.current || ((ne = w.current) == null || ne.kill(), (re = V.current) == null || re.kill(), B.current && (clearTimeout(B.current), B.current = null), j.innerHeadGroupElementRef.current && gsap.set(j.innerHeadGroupElementRef.current, { clearProps: "transform" }), j.antennaCircleElementRef.current && gsap.set(j.antennaCircleElementRef.current, { clearProps: "transform" }), p))
      return;
    const $ = {
      leftEyePathString: j.leftEyePathElementRef.current.getAttribute("d") ?? "",
      rightEyePathString: j.rightEyePathElementRef.current.getAttribute("d") ?? "",
      mouthPathString: ((ie = j.mouthPathElementRef.current) == null ? void 0 : ie.getAttribute("d")) ?? ""
    }, K = computeAllFacialPathsForState(e, b), U = (J, z) => {
      B.current && clearTimeout(B.current), B.current = setTimeout(() => {
        B.current = null, z();
      }, J);
    }, H = () => {
      const J = () => {
        const z = pickRandomDurationMilliseconds(
          DEFAULT_NEUTRAL_BORED_INTERVAL_MIN_MS,
          DEFAULT_NEUTRAL_BORED_INTERVAL_MAX_MS
        );
        U(z, () => {
          var Q;
          const Z = pickRandomDurationMilliseconds(
            DEFAULT_NEUTRAL_BORED_VARIANT_DURATION_MIN_MS,
            DEFAULT_NEUTRAL_BORED_VARIANT_DURATION_MAX_MS
          ), X = pickRandomNeutralBoredAnimationBuilder();
          (Q = V.current) == null || Q.kill(), V.current = X(j, Z), U(Z, () => {
            var ae;
            (ae = V.current) == null || ae.kill(), V.current = null, j.innerHeadGroupElementRef.current && gsap.set(j.innerHeadGroupElementRef.current, { clearProps: "transform" }), j.antennaCircleElementRef.current && gsap.set(j.antennaCircleElementRef.current, { clearProps: "transform" }), J();
          });
        });
      };
      J();
    }, se = () => {
      if (browserPrefersReducedMotion()) {
        V.current = null;
        return;
      }
      if (b === "neutral") {
        if (r === "static") {
          V.current = null;
          return;
        }
        H();
        return;
      }
      const J = idleAnimationBuildersByStateKey[b];
      V.current = J(j);
    };
    if ($.leftEyePathString === K.leftEyePathString && $.rightEyePathString === K.rightEyePathString && $.mouthPathString === K.mouthPathString)
      se();
    else {
      const J = { easedProgress: 0 };
      w.current = gsap.to(J, {
        easedProgress: 1,
        duration: s,
        ease: "power3.inOut",
        onUpdate: () => {
          var Z, X, Q;
          const z = J.easedProgress;
          (Z = j.leftEyePathElementRef.current) == null || Z.setAttribute(
            "d",
            interpolateNumericValuesBetweenPathStrings(
              $.leftEyePathString,
              K.leftEyePathString,
              z
            )
          ), (X = j.rightEyePathElementRef.current) == null || X.setAttribute(
            "d",
            interpolateNumericValuesBetweenPathStrings(
              $.rightEyePathString,
              K.rightEyePathString,
              z
            )
          ), (Q = j.mouthPathElementRef.current) == null || Q.setAttribute(
            "d",
            interpolateNumericValuesBetweenPathStrings(
              $.mouthPathString,
              K.mouthPathString,
              z
            )
          );
        },
        onComplete: se
      });
    }
    return () => {
      var J, z;
      (J = w.current) == null || J.kill(), (z = V.current) == null || z.kill(), B.current && (clearTimeout(B.current), B.current = null);
    };
  }, [e, b, r, p, s]);
  const I = R.current, C = o ?? `Bot avatar - ${b} state`, T = { shadowColor: n, lightColor: a, accentColor: l }, [g, E, F, k] = e.viewBox, L = `${g} ${E} ${F} ${k}`, O = e.body.map(
    (j, $) => renderProceduralShape(j, $, T, y)
  ), G = (e.features.leftEye.cx + e.features.rightEye.cx) / 2, W = (e.features.leftEye.cy + e.features.rightEye.cy) / 2, q = /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { ref: c, d: I.leftEyePathString, fill: resolveFillColor(e.features.leftEye.fillRole, T) }),
    /* @__PURE__ */ jsx("path", { ref: d, d: I.rightEyePathString, fill: resolveFillColor(e.features.rightEye.fillRole, T) })
  ] }), Y = /* @__PURE__ */ jsxs(Fragment, { children: [
    D ? /* @__PURE__ */ jsx(
      "g",
      {
        ref: A,
        className: "vultus-gaze",
        style: { transformBox: "view-box", transformOrigin: `${G}px ${W}px` },
        children: /* @__PURE__ */ jsx(
          "g",
          {
            ref: _,
            className: "vultus-eyelid",
            style: { transformBox: "view-box", transformOrigin: `${G}px ${W}px` },
            children: q
          }
        )
      }
    ) : q,
    e.features.mouth ? /* @__PURE__ */ jsx(
      "path",
      {
        ref: h,
        d: I.mouthPathString,
        fill: resolveFillColor(e.features.mouth.fillRole, T)
      }
    ) : null
  ] }), ee = N ? /* @__PURE__ */ jsxs(Fragment, { children: [
    e.body.filter((j) => j.slot !== "flinchBody").map((j, $) => renderProceduralShape(j, $, T, y)),
    /* @__PURE__ */ jsxs(
      "g",
      {
        ref: M,
        className: "vultus-flinch-body",
        style: { transformBox: "view-box", transformOrigin: `${G}px ${W}px` },
        children: [
          e.body.filter((j) => j.slot === "flinchBody").map((j, $) => renderProceduralShape(j, $, T, y)),
          Y
        ]
      }
    )
  ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
    O,
    Y
  ] });
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      ref: x,
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: L,
      width: i,
      height: i,
      role: "img",
      "aria-label": C,
      style: D ? (
        // Default SVG hit-testing (visiblePainted) only responds over
        // actually-painted pixels, so a mark with transparent corners
        // (like the Chatticus mark) would silently miss pointerenter
        // for a real cursor unless the whole rectangular box is made
        // hit-testable. Scoped to gaze-active instances only, so
        // every other BotAvatar usage (including the classic model's
        // golden-snapshot-tested output) is untouched.
        { display: "block", pointerEvents: "all" }
      ) : { display: "block" },
      children: [
        e.clipShape ? /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("clipPath", { id: m, children: /* @__PURE__ */ jsx("circle", { cx: e.clipShape.cx, cy: e.clipShape.cy, r: e.clipShape.r }) }) }) : null,
        e.background ? /* @__PURE__ */ jsx("rect", { width: F, height: k, fill: resolveFillColor(e.background, T) }) : null,
        /* @__PURE__ */ jsxs("g", { ref: P, children: [
          (e.underlayShapes ?? []).map(
            (j, $) => renderProceduralShape(j, $, T, y)
          ),
          e.clipShape ? /* @__PURE__ */ jsx("g", { clipPath: `url(#${m})`, children: ee }) : ee
        ] })
      ]
    }
  );
}, BotAvatar = ({
  model: e = VULTUS_CLASSIC_MODEL,
  state: t = "neutral",
  size: r = 240,
  lightColor: i = DEFAULT_BOT_AVATAR_LIGHT_COLOR_NAME,
  ariaLabel: s,
  paused: n = !1,
  ...a
}) => {
  const l = isBotAvatarState(t) ? t : "neutral";
  return e.renderer === "lottie" ? /* @__PURE__ */ jsx(
    LottieBotAvatar,
    {
      model: e,
      state: l,
      size: r,
      lightColor: i,
      ariaLabel: s,
      paused: n
    }
  ) : /* @__PURE__ */ jsx(
    ProceduralBotAvatar,
    {
      ...a,
      model: e,
      state: l,
      size: r,
      lightColor: i,
      ariaLabel: s,
      paused: n
    }
  );
}, ink = [0.067, 0.075, 0.059, 1], paper = [0.949, 0.937, 0.906, 1], designs = {
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
function transform(e = [0, 0], t = 0) {
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
function fill(e) {
  return {
    ty: "fl",
    c: { a: 0, k: e },
    o: { a: 0, k: 100 },
    r: 1
  };
}
function ellipse(e, t = [0, 0]) {
  return {
    ty: "el",
    d: 1,
    s: { a: 0, k: e },
    p: { a: 0, k: t }
  };
}
function rectangle(e, t, r = [0, 0]) {
  return {
    ty: "rc",
    d: 1,
    s: { a: 0, k: e },
    p: { a: 0, k: r },
    r: { a: 0, k: t }
  };
}
function shapeLayer(e, t, r, i) {
  return {
    ddd: 0,
    ind: e,
    ty: 4,
    nm: t,
    sr: 1,
    ks: i,
    ao: 0,
    shapes: r,
    ip: 0,
    op: 180,
    st: 0,
    bm: 0
  };
}
function keyframe(e, t, r) {
  if (!r)
    return { t: e, s: t };
  const i = r.map(() => 1), s = r.map(() => 0);
  return {
    t: e,
    s: t,
    e: r,
    i: { x: i, y: i },
    o: { x: s, y: s }
  };
}
function bodyShape(e) {
  return e.shape === "circle" ? ellipse([128, 128]) : e.shape === "page" ? rectangle([146, 112], 22) : e.shape === "diamond" ? rectangle([116, 116], 34) : rectangle([104, 148], 52);
}
function roleDetails(e, t) {
  return e === "Editor" ? [
    rectangle([92, 8], 4, [0, -44]),
    fill(ink),
    rectangle([20, 62], 10, [58, 18]),
    fill(t.accent),
    transform([0, 0], -16)
  ] : e === "Reporter" ? [
    ellipse([28, 28], [66, -52]),
    fill(t.accent),
    rectangle([12, 56], 6, [48, 42]),
    fill(paper),
    transform([0, 0], -24)
  ] : e === "Copy Writer" ? [
    rectangle([76, 7], 4, [-12, -20]),
    rectangle([54, 7], 4, [-23, 0]),
    rectangle([68, 7], 4, [-16, 20]),
    fill(ink),
    transform()
  ] : [
    ellipse([38, 38], [-38, -36]),
    fill(t.accent),
    rectangle([16, 96], 8, [52, 18]),
    fill(ink),
    transform([0, 0], 34)
  ];
}
function creativeMotionAnimation(e, t) {
  const r = designs[e], i = t === "complete" ? 3 : t === "ready" ? 6 : 13, s = e === "Editor" || e === "Illustrator" ? 360 : -360, n = e === "Illustrator" ? -12 : 0;
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
      shapeLayer(
        1,
        "orbit",
        [
          ellipse([198, 198]),
          {
            ty: "st",
            c: { a: 0, k: r.accent },
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
          transform()
        ],
        {
          o: { a: 0, k: 100 },
          r: {
            a: 1,
            k: [
              keyframe(0, [0], [s]),
              keyframe(180, [s])
            ]
          },
          p: { a: 0, k: [120, 120, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] }
        }
      ),
      shapeLayer(
        2,
        "body",
        [bodyShape(r), fill(r.body), transform([0, 0], n)],
        {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: {
            a: 1,
            k: [
              keyframe(0, [120, 120, 0], [120, 120 - i, 0]),
              keyframe(90, [120, 120 - i, 0], [120, 120, 0]),
              keyframe(180, [120, 120, 0])
            ]
          },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] }
        }
      ),
      shapeLayer(3, "role object", roleDetails(e, r), {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            keyframe(0, [-3], [3]),
            keyframe(90, [3], [-3]),
            keyframe(180, [-3])
          ]
        },
        p: { a: 0, k: [120, 120, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      }),
      shapeLayer(
        4,
        "eyes",
        [
          ellipse([18, 22], [-25, -4]),
          ellipse([18, 22], [25, -4]),
          fill(ink),
          transform()
        ],
        {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [120, 120, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: {
            a: 1,
            k: [
              keyframe(0, [100, 100, 100], [100, 100, 100]),
              keyframe(68, [100, 100, 100], [100, 12, 100]),
              keyframe(72, [100, 12, 100], [100, 100, 100]),
              keyframe(180, [100, 100, 100])
            ]
          }
        }
      ),
      shapeLayer(
        5,
        "signal",
        [ellipse([18, 18]), fill(r.accent), transform()],
        {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: {
            a: 1,
            k: [
              keyframe(0, [120, 18, 0], [204, 120, 0]),
              keyframe(90, [204, 120, 0], [120, 222, 0]),
              keyframe(180, [120, 222, 0])
            ]
          },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] }
        }
      )
    ]
  };
}
const sharedStateSegments = {
  neutral: [0, 45],
  thinking: [0, 90],
  deepThinking: [30, 120],
  toolCalling: [45, 135],
  toolResponse: [90, 180],
  speakingOpen: [0, 120],
  speakingWide: [30, 150],
  speakingRound: [60, 180],
  speakingComplete: [145, 180]
}, creativeDeskModels = Object.keys(designs).map(
  (e) => defineLottieAvatarModel({
    id: `creative-desk-${e.toLowerCase().replace(/\s+/g, "-")}`,
    name: `Creative Desk ${e}`,
    animationData: creativeMotionAnimation(e, "drafting"),
    fallbackSegment: [0, 90],
    stateSegments: sharedStateSegments
  })
), CREATIVE_DESK_MODEL_ZOO = createBotAvatarModelZoo(creativeDeskModels);
function creativeDeskModelForRole(e) {
  const t = `creative-desk-${e.toLowerCase().replace(/\s+/g, "-")}`;
  return CREATIVE_DESK_MODEL_ZOO[t];
}
const INK_BUBBLE_PATH = buildRoundedRectPath(8, 4, 20, 16, {
  topLeft: 8,
  topRight: 8,
  bottomRight: 1.85,
  bottomLeft: 8
}), CLAY_BUBBLE_PATH = buildRoundedRectPath(0, 8, 20, 16, {
  topLeft: 8,
  topRight: 8,
  bottomRight: 8,
  bottomLeft: 1.85
}), restingEyeShape = { rx: 2, ry: 2, dy: 0, shape: "ellipse" }, chatticusEyeShapesByState = Object.fromEntries(
  BOT_AVATAR_STATES.map((e) => [e, restingEyeShape])
), CHATTICUS_MARK_MODEL = defineProceduralAvatarModel({
  id: "chatticus-mark",
  name: "Chatticus Mark",
  viewBox: [0, 0, 28, 28],
  body: [
    // The back/shadow bubble is deliberately NOT tagged "flinchBody": it
    // reads as a static backdrop, not part of the character, so a click
    // reaction should only move the front bubble (with the eyes) that
    // actually reads as "the creature".
    { kind: "path", d: INK_BUBBLE_PATH, fillRole: "shadow" },
    { kind: "path", d: CLAY_BUBBLE_PATH, fillRole: "accent", slot: "flinchBody" }
  ],
  features: {
    leftEye: { cx: 10, cy: 14, fillRole: "light" },
    rightEye: { cx: 18, cy: 14, fillRole: "light" }
  },
  eyeShapesByState: chatticusEyeShapesByState,
  blink: { closedRx: 2, closedRy: 0.3 },
  gaze: {
    travel: { left: 1.4, right: 1.4, up: 1.1, down: 1.1 },
    // Eyes are r=2 dots (open height 4); squashing to 15% reads as a
    // clean, near-flat dash rather than just a slightly shorter dot.
    blinkClosedScaleY: 0.15,
    // Safe here because the mark always uses neutralIdleMode="static" —
    // there's no GSAP idle system also animating the root group.
    bodyFlinch: !0,
    bodyFlinchRecoilDistance: 2.6
  }
}), clampUnitInterval = (e) => Math.max(0, Math.min(1, e)), computeBodyCornerRadii = (e) => {
  const r = Math.min(e.width, e.height) / 2 * clampUnitInterval(e.roundness), i = {
    topLeft: r,
    topRight: r,
    bottomRight: r,
    bottomLeft: r
  };
  return e.sharpCorner !== "none" && (i[e.sharpCorner] = e.sharpCornerRadius), i;
}, TRAVEL_RATIO = 0.07, RECOIL_RATIO = 0.13, computeGazeGeometry = (e, t) => {
  const r = e.width * TRAVEL_RATIO, i = e.height * TRAVEL_RATIO;
  return {
    travel: { left: r, right: r, up: i, down: i },
    blinkClosedScaleY: 0.15,
    bodyFlinch: !0,
    bodyFlinchRecoilDistance: Math.min(e.width, e.height) * RECOIL_RATIO,
    ...t
  };
};
function characterColorProps(e) {
  return { shadowColor: e.colors.body, lightColor: e.colors.eye, accentColor: e.colors.accent };
}
function characterGazeConfig(e) {
  const t = e.temperament ?? 1;
  return t === 1 ? {} : {
    wanderMinMs: DEFAULT_GAZE_CONFIG.wanderMinMs / t,
    wanderMaxMs: DEFAULT_GAZE_CONFIG.wanderMaxMs / t,
    blinkMinMs: DEFAULT_GAZE_CONFIG.blinkMinMs / t,
    blinkMaxMs: DEFAULT_GAZE_CONFIG.blinkMaxMs / t,
    blinkSubsequentMinMs: DEFAULT_GAZE_CONFIG.blinkSubsequentMinMs / t,
    blinkSubsequentMaxMs: DEFAULT_GAZE_CONFIG.blinkSubsequentMaxMs / t
  };
}
const uniformShapeByState = (e) => Object.fromEntries(BOT_AVATAR_STATES.map((t) => [t, e]));
function buildCharacterModel(e) {
  const t = e.viewBoxSize / 2, r = buildRoundedRectPath(
    t - e.body.width / 2,
    t - e.body.height / 2,
    e.body.width,
    e.body.height,
    computeBodyCornerRadii(e.body)
  ), i = t - e.eyes.spacing / 2, s = t + e.eyes.spacing / 2, n = t + e.eyes.offsetY, a = { rx: e.eyes.radiusX, ry: e.eyes.radiusY, dy: 0, shape: "ellipse" }, l = e.mouth ? t + e.mouth.offsetY : void 0, o = e.mouth ? { rx: e.mouth.radiusX, ry: e.mouth.radiusY, dy: 0, shape: "ellipse" } : void 0;
  return defineProceduralAvatarModel({
    id: e.id,
    name: e.name,
    viewBox: [0, 0, e.viewBoxSize, e.viewBoxSize],
    body: [
      { kind: "path", d: r, fillRole: "shadow", slot: "flinchBody" },
      ...(e.accessories ?? []).map((p) => ({ ...p, slot: "flinchBody" }))
    ],
    features: {
      leftEye: { cx: i, cy: n, fillRole: "light" },
      rightEye: { cx: s, cy: n, fillRole: "light" },
      ...e.mouth ? { mouth: { cx: t, cy: l, fillRole: "light" } } : {}
    },
    eyeShapesByState: uniformShapeByState(a),
    ...o ? { mouthShapesByState: uniformShapeByState(o) } : {},
    blink: { closedRx: e.eyes.radiusX, closedRy: e.eyes.radiusY * 0.15 },
    gaze: computeGazeGeometry(e.body, e.gazeOverrides)
  });
}
const INK = "#11130f", PAPER = "#f2efe7", SIGNAL = "#b8f34a", CLAY = "#ef6a47", COBALT = "#4f71ff", SEA = "#73d7c5", AMBER = "#f0bc4d", editorSpec = {
  id: "creative-editor",
  name: "Editor",
  viewBoxSize: 28,
  body: { width: 16, height: 22, roundness: 1, sharpCorner: "none", sharpCornerRadius: 0 },
  eyes: { radiusX: 2, radiusY: 2, spacing: 8, offsetY: -1 },
  accessories: [
    // A pair of focused, slightly furrowed brows.
    { kind: "rect", x: 8.5, y: 8.5, width: 3, height: 1.2, rx: 0.6, fillRole: "accent" },
    { kind: "rect", x: 16.5, y: 8.5, width: 3, height: 1.2, rx: 0.6, fillRole: "accent" }
  ],
  colors: { body: CLAY, eye: PAPER, accent: SIGNAL },
  temperament: 1
}, reporterSpec = {
  id: "creative-reporter",
  name: "Reporter",
  viewBoxSize: 28,
  body: { width: 20, height: 20, roundness: 1, sharpCorner: "none", sharpCornerRadius: 0 },
  eyes: { radiusX: 2.2, radiusY: 2.2, spacing: 9, offsetY: 0 },
  accessories: [
    // A small "on air" signal dot up top.
    { kind: "circle", cx: 14, cy: 3.2, r: 1.6, fillRole: "accent" }
  ],
  colors: { body: COBALT, eye: PAPER, accent: SEA },
  temperament: 1.2
  // a little more alert/energetic
}, copyWriterSpec = {
  id: "creative-copy-writer",
  name: "Copy Writer",
  viewBoxSize: 28,
  body: { width: 22, height: 16, roundness: 0.45, sharpCorner: "bottomLeft", sharpCornerRadius: 1.5 },
  eyes: { radiusX: 2, radiusY: 2, spacing: 9, offsetY: -0.5 },
  colors: { body: SIGNAL, eye: INK, accent: CLAY },
  temperament: 0.85
  // calmer, more deliberate
}, illustratorSpec = {
  id: "creative-illustrator",
  name: "Illustrator",
  viewBoxSize: 28,
  body: { width: 18, height: 18, roundness: 0.35, sharpCorner: "none", sharpCornerRadius: 0 },
  eyes: { radiusX: 2, radiusY: 2, spacing: 8, offsetY: 0 },
  accessories: [
    // A little paint-dab accent near the top corner.
    { kind: "circle", cx: 20.5, cy: 6.5, r: 1.8, fillRole: "accent" }
  ],
  colors: { body: SEA, eye: INK, accent: AMBER },
  temperament: 1
}, specsByRole = {
  Editor: editorSpec,
  Reporter: reporterSpec,
  "Copy Writer": copyWriterSpec,
  Illustrator: illustratorSpec
}, modelsByRole = {
  Editor: buildCharacterModel(editorSpec),
  Reporter: buildCharacterModel(reporterSpec),
  "Copy Writer": buildCharacterModel(copyWriterSpec),
  Illustrator: buildCharacterModel(illustratorSpec)
};
function creativeCharacterSpecForRole(e) {
  return specsByRole[e];
}
function creativeCharacterModelForRole(e) {
  return modelsByRole[e];
}
export {
  BOT_AVATAR_STATES,
  BotAvatar,
  CHATTICUS_MARK_MODEL,
  CREATIVE_DESK_MODEL_ZOO,
  DEFAULT_GAZE_CONFIG,
  NEUTRAL_GAZE_VECTOR,
  VULTUS_CLASSIC_MODEL,
  advanceBlinkState,
  advanceGazeWander,
  applyBlinkScale,
  applyBodyFlinchRecoil,
  applyGazeTravel,
  automatedSpeakingPlaybackSequence,
  avatarModelFromZoo,
  buildBodyFlinchSteps,
  buildCharacterModel,
  characterColorProps,
  characterGazeConfig,
  clampUnit,
  computeAllFacialPathsForState,
  computePointerGazeVector,
  createBlinkState,
  createBotAvatarModelZoo,
  createGazeWanderState,
  creativeCharacterModelForRole,
  creativeCharacterSpecForRole,
  creativeDeskModelForRole,
  creativeMotionAnimation,
  defineLottieAvatarModel,
  defineProceduralAvatarModel,
  formatStateKeyAsReadableLabel,
  isPointerWithinProximity,
  makeSeededRandom,
  orderedStateButtonDescriptors
};
