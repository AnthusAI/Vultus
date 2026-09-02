import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import React, { useEffect, useState, useRef, useId } from "react";
import { gsap } from "gsap";
const QUARTER_ARC_BEZIER_HANDLE = 0.5522847498, SIGNED_DECIMAL_NUMBER_PATTERN = /-?\d+(?:\.\d+)?/g, buildFourSegmentEllipsePath = (t, e, r, i) => {
  const s = r * QUARTER_ARC_BEZIER_HANDLE, n = i * QUARTER_ARC_BEZIER_HANDLE;
  return "M " + (t - r) + " " + e + " C " + (t - r) + " " + (e - n) + " " + (t - s) + " " + (e - i) + " " + t + " " + (e - i) + " C " + (t + s) + " " + (e - i) + " " + (t + r) + " " + (e - n) + " " + (t + r) + " " + e + " C " + (t + r) + " " + (e + n) + " " + (t + s) + " " + (e + i) + " " + t + " " + (e + i) + " C " + (t - s) + " " + (e + i) + " " + (t - r) + " " + (e + n) + " " + (t - r) + " " + e + " Z";
}, buildFourSegmentCurvedLensPath = (t, e, r, i, s) => {
  const n = r * QUARTER_ARC_BEZIER_HANDLE, a = 0.18, l = 1.5, o = s === "down", p = o ? i * a : i * l, u = o ? i * l : i * a, S = e - p, f = e + u, b = p * QUARTER_ARC_BEZIER_HANDLE, v = u * QUARTER_ARC_BEZIER_HANDLE;
  return "M " + (t - r) + " " + e + " C " + (t - r) + " " + (e - b) + " " + (t - n) + " " + S + " " + t + " " + S + " C " + (t + n) + " " + S + " " + (t + r) + " " + (e - b) + " " + (t + r) + " " + e + " C " + (t + r) + " " + (e + v) + " " + (t + n) + " " + f + " " + t + " " + f + " C " + (t - n) + " " + f + " " + (t - r) + " " + (e + v) + " " + (t - r) + " " + e + " Z";
}, buildRoundedRectPath = (t, e, r, i, s) => {
  const { topLeft: n, topRight: a, bottomRight: l, bottomLeft: o } = s;
  return "M " + (t + n) + " " + e + " L " + (t + r - a) + " " + e + " A " + a + " " + a + " 0 0 1 " + (t + r) + " " + (e + a) + " L " + (t + r) + " " + (e + i - l) + " A " + l + " " + l + " 0 0 1 " + (t + r - l) + " " + (e + i) + " L " + (t + o) + " " + (e + i) + " A " + o + " " + o + " 0 0 1 " + t + " " + (e + i - o) + " L " + t + " " + (e + n) + " A " + n + " " + n + " 0 0 1 " + (t + n) + " " + e + " Z";
}, interpolateNumericValuesBetweenPathStrings = (t, e, r) => {
  var a, l;
  const i = ((a = t.match(SIGNED_DECIMAL_NUMBER_PATTERN)) == null ? void 0 : a.map(Number)) ?? [], s = ((l = e.match(SIGNED_DECIMAL_NUMBER_PATTERN)) == null ? void 0 : l.map(Number)) ?? [];
  let n = 0;
  return t.replace(SIGNED_DECIMAL_NUMBER_PATTERN, () => {
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
}, buildPathStringFromDefinition = (t, e, r) => {
  const i = e + r.dy;
  return r.shape === "curvedLens" ? buildFourSegmentCurvedLensPath(
    t,
    i,
    r.rx,
    r.ry,
    r.curveDirection ?? "down"
  ) : buildFourSegmentEllipsePath(t, i, r.rx, r.ry);
}, computeAllFacialPathsForState = (t, e) => {
  var l;
  const r = t.eyeShapesByState[e], i = (l = t.mouthShapesByState) == null ? void 0 : l[e], s = buildPathStringFromDefinition(
    t.features.leftEye.cx,
    t.features.leftEye.cy,
    r
  ), n = buildPathStringFromDefinition(
    t.features.rightEye.cx,
    t.features.rightEye.cy,
    r
  ), a = t.features.mouth && i ? buildPathStringFromDefinition(t.features.mouth.cx, t.features.mouth.cy, i) : "";
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
], formatStateKeyAsReadableLabel = (t) => t.replace(/([A-Z])/g, " $1").replace(/^./, (e) => e.toUpperCase()).trim();
function getDefaultExportFromCjs(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var lottie$2 = { exports: {} }, lottie$1 = lottie$2.exports, hasRequiredLottie;
function requireLottie() {
  return hasRequiredLottie || (hasRequiredLottie = 1, (function(module, exports) {
    typeof document < "u" && typeof navigator < "u" && (function(t, e) {
      module.exports = e();
    })(lottie$1, (function() {
      var svgNS = "http://www.w3.org/2000/svg", locationHref = "", _useWebWorker = !1, initialDefaultFrame = -999999, setWebWorker = function(e) {
        _useWebWorker = !!e;
      }, getWebWorker = function() {
        return _useWebWorker;
      }, setLocationHref = function(e) {
        locationHref = e;
      }, getLocationHref = function() {
        return locationHref;
      };
      function createTag(t) {
        return document.createElement(t);
      }
      function extendPrototype(t, e) {
        var r, i = t.length, s;
        for (r = 0; r < i; r += 1) {
          s = t[r].prototype;
          for (var n in s)
            Object.prototype.hasOwnProperty.call(s, n) && (e.prototype[n] = s[n]);
        }
      }
      function getDescriptor(t, e) {
        return Object.getOwnPropertyDescriptor(t, e);
      }
      function createProxyFunction(t) {
        function e() {
        }
        return e.prototype = t, e;
      }
      var audioControllerFactory = (function() {
        function t(e) {
          this.audios = [], this.audioFactory = e, this._volume = 1, this._isMuted = !1;
        }
        return t.prototype = {
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
          return new t();
        };
      })(), createTypedArray = /* @__PURE__ */ (function() {
        function t(r, i) {
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
        function e(r, i) {
          return r === "float32" ? new Float32Array(i) : r === "int16" ? new Int16Array(i) : r === "uint8c" ? new Uint8ClampedArray(i) : t(r, i);
        }
        return typeof Uint8ClampedArray == "function" && typeof Float32Array == "function" ? e : t;
      })();
      function createSizedArray(t) {
        return Array.apply(null, {
          length: t
        });
      }
      function _typeof$6(t) {
        "@babel/helpers - typeof";
        return _typeof$6 = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
          return typeof e;
        } : function(e) {
          return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
        }, _typeof$6(t);
      }
      var subframeEnabled = !0, expressionsPlugin = null, expressionsInterfaces = null, idPrefix$1 = "", isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent), bmPow = Math.pow, bmSqrt = Math.sqrt, bmFloor = Math.floor, bmMax = Math.max, bmMin = Math.min, BMMath = {};
      (function() {
        var t = ["abs", "acos", "acosh", "asin", "asinh", "atan", "atanh", "atan2", "ceil", "cbrt", "expm1", "clz32", "cos", "cosh", "exp", "floor", "fround", "hypot", "imul", "log", "log1p", "log2", "log10", "max", "min", "pow", "random", "round", "sign", "sin", "sinh", "sqrt", "tan", "tanh", "trunc", "E", "LN10", "LN2", "LOG10E", "LOG2E", "PI", "SQRT1_2", "SQRT2"], e, r = t.length;
        for (e = 0; e < r; e += 1)
          BMMath[t[e]] = Math[t[e]];
      })(), BMMath.random = Math.random, BMMath.abs = function(t) {
        var e = _typeof$6(t);
        if (e === "object" && t.length) {
          var r = createSizedArray(t.length), i, s = t.length;
          for (i = 0; i < s; i += 1)
            r[i] = Math.abs(t[i]);
          return r;
        }
        return Math.abs(t);
      };
      var defaultCurveSegments = 150, degToRads = Math.PI / 180, roundCorner = 0.5519;
      function styleDiv(t) {
        t.style.position = "absolute", t.style.top = 0, t.style.left = 0, t.style.display = "block", t.style.transformOrigin = "0 0", t.style.webkitTransformOrigin = "0 0", t.style.backfaceVisibility = "visible", t.style.webkitBackfaceVisibility = "visible", t.style.transformStyle = "preserve-3d", t.style.webkitTransformStyle = "preserve-3d", t.style.mozTransformStyle = "preserve-3d";
      }
      function BMEnterFrameEvent(t, e, r, i) {
        this.type = t, this.currentTime = e, this.totalTime = r, this.direction = i < 0 ? -1 : 1;
      }
      function BMCompleteEvent(t, e) {
        this.type = t, this.direction = e < 0 ? -1 : 1;
      }
      function BMCompleteLoopEvent(t, e, r, i) {
        this.type = t, this.currentLoop = r, this.totalLoops = e, this.direction = i < 0 ? -1 : 1;
      }
      function BMSegmentStartEvent(t, e, r) {
        this.type = t, this.firstFrame = e, this.totalFrames = r;
      }
      function BMDestroyEvent(t, e) {
        this.type = t, this.target = e;
      }
      function BMRenderFrameErrorEvent(t, e) {
        this.type = "renderFrameError", this.nativeError = t, this.currentTime = e;
      }
      function BMConfigErrorEvent(t) {
        this.type = "configError", this.nativeError = t;
      }
      var createElementID = /* @__PURE__ */ (function() {
        var t = 0;
        return function() {
          return t += 1, idPrefix$1 + "__lottie_element_" + t;
        };
      })();
      function HSVtoRGB(t, e, r) {
        var i, s, n, a, l, o, p, u;
        switch (a = Math.floor(t * 6), l = t * 6 - a, o = r * (1 - e), p = r * (1 - l * e), u = r * (1 - (1 - l) * e), a % 6) {
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
      function RGBtoHSV(t, e, r) {
        var i = Math.max(t, e, r), s = Math.min(t, e, r), n = i - s, a, l = i === 0 ? 0 : n / i, o = i / 255;
        switch (i) {
          case s:
            a = 0;
            break;
          case t:
            a = e - r + n * (e < r ? 6 : 0), a /= 6 * n;
            break;
          case e:
            a = r - t + n * 2, a /= 6 * n;
            break;
          case r:
            a = t - e + n * 4, a /= 6 * n;
            break;
        }
        return [a, l, o];
      }
      function addSaturationToRGB(t, e) {
        var r = RGBtoHSV(t[0] * 255, t[1] * 255, t[2] * 255);
        return r[1] += e, r[1] > 1 ? r[1] = 1 : r[1] <= 0 && (r[1] = 0), HSVtoRGB(r[0], r[1], r[2]);
      }
      function addBrightnessToRGB(t, e) {
        var r = RGBtoHSV(t[0] * 255, t[1] * 255, t[2] * 255);
        return r[2] += e, r[2] > 1 ? r[2] = 1 : r[2] < 0 && (r[2] = 0), HSVtoRGB(r[0], r[1], r[2]);
      }
      function addHueToRGB(t, e) {
        var r = RGBtoHSV(t[0] * 255, t[1] * 255, t[2] * 255);
        return r[0] += e / 360, r[0] > 1 ? r[0] -= 1 : r[0] < 0 && (r[0] += 1), HSVtoRGB(r[0], r[1], r[2]);
      }
      var rgbToHex = (function() {
        var t = [], e, r;
        for (e = 0; e < 256; e += 1)
          r = e.toString(16), t[e] = r.length === 1 ? "0" + r : r;
        return function(i, s, n) {
          return i < 0 && (i = 0), s < 0 && (s = 0), n < 0 && (n = 0), "#" + t[i] + t[s] + t[n];
        };
      })(), setSubframeEnabled = function(e) {
        subframeEnabled = !!e;
      }, getSubframeEnabled = function() {
        return subframeEnabled;
      }, setExpressionsPlugin = function(e) {
        expressionsPlugin = e;
      }, getExpressionsPlugin = function() {
        return expressionsPlugin;
      }, setExpressionInterfaces = function(e) {
        expressionsInterfaces = e;
      }, getExpressionInterfaces = function() {
        return expressionsInterfaces;
      }, setDefaultCurveSegments = function(e) {
        defaultCurveSegments = e;
      }, getDefaultCurveSegments = function() {
        return defaultCurveSegments;
      }, setIdPrefix = function(e) {
        idPrefix$1 = e;
      };
      function createNS(t) {
        return document.createElementNS(svgNS, t);
      }
      function _typeof$5(t) {
        "@babel/helpers - typeof";
        return _typeof$5 = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
          return typeof e;
        } : function(e) {
          return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
        }, _typeof$5(t);
      }
      var dataManager = /* @__PURE__ */ (function() {
        var t = 1, e = [], r, i, s = {
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
              function A(R, C) {
                var T, g, E = R.length, F, k, L, D;
                for (g = 0; g < E; g += 1)
                  if (T = R[g], "ks" in T && !T.completed) {
                    if (T.completed = !0, T.hasMask) {
                      var O = T.masksProperties;
                      for (k = O.length, F = 0; F < k; F += 1)
                        if (O[F].pt.k.i)
                          P(O[F].pt.k);
                        else
                          for (D = O[F].pt.k.length, L = 0; L < D; L += 1)
                            O[F].pt.k[L].s && P(O[F].pt.k[L].s[0]), O[F].pt.k[L].e && P(O[F].pt.k[L].e[0]);
                    }
                    T.ty === 0 ? (T.layers = h(T.refId, C), A(T.layers, C)) : T.ty === 4 ? y(T.shapes) : T.ty === 5 && N(T);
                  }
              }
              function c(R, C) {
                if (R) {
                  var T = 0, g = R.length;
                  for (T = 0; T < g; T += 1)
                    R[T].t === 1 && (R[T].data.layers = h(R[T].data.refId, C), A(R[T].data.layers, C));
                }
              }
              function d(R, C) {
                for (var T = 0, g = C.length; T < g; ) {
                  if (C[T].id === R)
                    return C[T];
                  T += 1;
                }
                return null;
              }
              function h(R, C) {
                var T = d(R, C);
                return T ? T.layers.__used ? JSON.parse(JSON.stringify(T.layers)) : (T.layers.__used = !0, T.layers) : null;
              }
              function y(R) {
                var C, T = R.length, g, E;
                for (C = T - 1; C >= 0; C -= 1)
                  if (R[C].ty === "sh")
                    if (R[C].ks.k.i)
                      P(R[C].ks.k);
                    else
                      for (E = R[C].ks.k.length, g = 0; g < E; g += 1)
                        R[C].ks.k[g].s && P(R[C].ks.k[g].s[0]), R[C].ks.k[g].e && P(R[C].ks.k[g].e[0]);
                  else R[C].ty === "gr" && y(R[C].it);
              }
              function P(R) {
                var C, T = R.i.length;
                for (C = 0; C < T; C += 1)
                  R.i[C][0] += R.v[C][0], R.i[C][1] += R.v[C][1], R.o[C][0] += R.v[C][0], R.o[C][1] += R.v[C][1];
              }
              function x(R, C) {
                var T = C ? C.split(".") : [100, 100, 100];
                return R[0] > T[0] ? !0 : T[0] > R[0] ? !1 : R[1] > T[1] ? !0 : T[1] > R[1] ? !1 : R[2] > T[2] ? !0 : T[2] > R[2] ? !1 : null;
              }
              var _ = /* @__PURE__ */ (function() {
                var R = [4, 4, 14];
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
                  if (x(R, g.v) && (T(g.layers), g.assets)) {
                    var E, F = g.assets.length;
                    for (E = 0; E < F; E += 1)
                      g.assets[E].layers && T(g.assets[E].layers);
                  }
                };
              })(), M = /* @__PURE__ */ (function() {
                var R = [4, 7, 99];
                return function(C) {
                  if (C.chars && !x(R, C.v)) {
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
                var R = [5, 7, 15];
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
                  if (x(R, g.v) && (T(g.layers), g.assets)) {
                    var E, F = g.assets.length;
                    for (E = 0; E < F; E += 1)
                      g.assets[E].layers && T(g.assets[E].layers);
                  }
                };
              })(), B = /* @__PURE__ */ (function() {
                var R = [4, 1, 9];
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
                  if (x(R, g.v) && (T(g.layers), g.assets)) {
                    var E, F = g.assets.length;
                    for (E = 0; E < F; E += 1)
                      g.assets[E].layers && T(g.assets[E].layers);
                  }
                };
              })(), V = /* @__PURE__ */ (function() {
                var R = [4, 4, 18];
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
                  var E, F, k = g.length, L, D, O, j;
                  for (F = 0; F < k; F += 1) {
                    if (E = g[F], E.hasMask) {
                      var q = E.masksProperties;
                      for (D = q.length, L = 0; L < D; L += 1)
                        if (q[L].pt.k.i)
                          q[L].pt.k.c = q[L].cl;
                        else
                          for (j = q[L].pt.k.length, O = 0; O < j; O += 1)
                            q[L].pt.k[O].s && (q[L].pt.k[O].s[0].c = q[L].cl), q[L].pt.k[O].e && (q[L].pt.k[O].e[0].c = q[L].cl);
                    }
                    E.ty === 4 && C(E.shapes);
                  }
                }
                return function(g) {
                  if (x(R, g.v) && (T(g.layers), g.assets)) {
                    var E, F = g.assets.length;
                    for (E = 0; E < F; E += 1)
                      g.assets[E].layers && T(g.assets[E].layers);
                  }
                };
              })();
              function I(R) {
                R.__complete || (B(R), _(R), M(R), w(R), V(R), A(R.layers, R.assets), c(R.chars, R.assets), R.__complete = !0);
              }
              function N(R) {
                R.t.a.length === 0 && "m" in R.t.p;
              }
              var G = {};
              return G.completeData = I, G.checkColors = B, G.checkChars = M, G.checkPathProperties = w, G.checkShapes = V, G.completeLayers = A, G;
            }
            if (n.dataManager || (n.dataManager = v()), n.assetLoader || (n.assetLoader = /* @__PURE__ */ (function() {
              function A(d) {
                var h = d.getResponseHeader("content-type");
                return h && d.responseType === "json" && h.indexOf("json") !== -1 || d.response && _typeof$5(d.response) === "object" ? d.response : d.response && typeof d.response == "string" ? JSON.parse(d.response) : d.responseText ? JSON.parse(d.responseText) : null;
              }
              function c(d, h, y, P) {
                var x, _ = new XMLHttpRequest();
                try {
                  _.responseType = "json";
                } catch {
                }
                _.onreadystatechange = function() {
                  if (_.readyState === 4)
                    if (_.status === 200)
                      x = A(_), y(x);
                    else
                      try {
                        x = A(_), y(x);
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
              n.assetLoader.load(b.data.path, b.data.fullPath, function(A) {
                n.dataManager.completeData(A), n.postMessage({
                  id: b.data.id,
                  payload: A,
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
            } else b.data.type === "loadData" && n.assetLoader.load(b.data.path, b.data.fullPath, function(A) {
              n.postMessage({
                id: b.data.id,
                payload: A,
                status: "success"
              });
            }, function() {
              n.postMessage({
                id: b.data.id,
                status: "error"
              });
            });
          }), i.onmessage = function(f) {
            var b = f.data, v = b.id, m = e[v];
            e[v] = null, b.status === "success" ? m.onComplete(b.payload) : m.onError && m.onError();
          });
        }
        function o(f, b) {
          t += 1;
          var v = "processId_" + t;
          return e[v] = {
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
        var t = (function() {
          var c = createTag("canvas");
          c.width = 1, c.height = 1;
          var d = c.getContext("2d");
          return d.fillStyle = "rgba(0,0,0,0)", d.fillRect(0, 0, 1, 1), c;
        })();
        function e() {
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
            y.img = t, this._imageLoaded();
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
            y.img = t, this._imageLoaded();
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
        function A() {
          this._imageLoaded = e.bind(this), this._footageLoaded = r.bind(this), this.testImageLoaded = s.bind(this), this.createFootageData = l.bind(this), this.assetsPath = "", this.path = "", this.totalImages = 0, this.totalFootages = 0, this.loadedAssets = 0, this.loadedFootagesCount = 0, this.imagesLoadedCb = null, this.images = [];
        }
        return A.prototype = {
          loadAssets: o,
          setAssetsPath: u,
          setPath: p,
          loadedImages: b,
          loadedFootages: v,
          destroy: f,
          getAsset: S,
          createImgData: a,
          createImageData: n,
          imageLoaded: e,
          footageLoaded: r,
          setCacheType: m
        }, A;
      })();
      function BaseEvent() {
      }
      BaseEvent.prototype = {
        triggerEvent: function(e, r) {
          if (this._cbs[e])
            for (var i = this._cbs[e], s = 0; s < i.length; s += 1)
              i[s](r);
        },
        addEventListener: function(e, r) {
          return this._cbs[e] || (this._cbs[e] = []), this._cbs[e].push(r), (function() {
            this.removeEventListener(e, r);
          }).bind(this);
        },
        removeEventListener: function(e, r) {
          if (!r)
            this._cbs[e] = null;
          else if (this._cbs[e]) {
            for (var i = 0, s = this._cbs[e].length; i < s; )
              this._cbs[e][i] === r && (this._cbs[e].splice(i, 1), i -= 1, s -= 1), i += 1;
            this._cbs[e].length || (this._cbs[e] = null);
          }
        }
      };
      var markerParser = /* @__PURE__ */ (function() {
        function t(e) {
          for (var r = e.split(`\r
`), i = {}, s, n = 0, a = 0; a < r.length; a += 1)
            s = r[a].split(":"), s.length === 2 && (i[s[0]] = s[1].trim(), n += 1);
          if (n === 0)
            throw new Error();
          return i;
        }
        return function(e) {
          for (var r = [], i = 0; i < e.length; i += 1) {
            var s = e[i], n = {
              time: s.tm,
              duration: s.dr
            };
            try {
              n.payload = JSON.parse(e[i].cm);
            } catch {
              try {
                n.payload = t(e[i].cm);
              } catch {
                n.payload = {
                  name: e[i].cm
                };
              }
            }
            r.push(n);
          }
          return r;
        };
      })(), ProjectInterface = /* @__PURE__ */ (function() {
        function t(e) {
          this.compositions.push(e);
        }
        return function() {
          function e(r) {
            for (var i = 0, s = this.compositions.length; i < s; ) {
              if (this.compositions[i].data && this.compositions[i].data.nm === r)
                return this.compositions[i].prepareFrame && this.compositions[i].data.xt && this.compositions[i].prepareFrame(this.currentFrame), this.compositions[i].compInterface;
              i += 1;
            }
            return null;
          }
          return e.compositions = [], e.currentFrame = 0, e.registerComposition = t, e;
        };
      })(), renderers = {}, registerRenderer = function(e, r) {
        renderers[e] = r;
      };
      function getRenderer(t) {
        return renderers[t];
      }
      function getRegisteredRenderer() {
        if (renderers.canvas)
          return "canvas";
        for (var t in renderers)
          if (renderers[t])
            return t;
        return "";
      }
      function _typeof$4(t) {
        "@babel/helpers - typeof";
        return _typeof$4 = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
          return typeof e;
        } : function(e) {
          return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
        }, _typeof$4(t);
      }
      var AnimationItem = function() {
        this._cbs = [], this.name = "", this.path = "", this.isLoaded = !1, this.currentFrame = 0, this.currentRawFrame = 0, this.firstFrame = 0, this.totalFrames = 0, this.frameRate = 0, this.frameMult = 0, this.playSpeed = 1, this.playDirection = 1, this.playCount = 0, this.animationData = {}, this.assets = [], this.isPaused = !0, this.autoplay = !1, this.loop = !0, this.renderer = null, this.animationID = createElementID(), this.assetsPath = "", this.timeCompleted = 0, this.segmentPos = 0, this.isSubframeEnabled = getSubframeEnabled(), this.segments = [], this._idle = !0, this._completedLoop = !1, this.projectInterface = ProjectInterface(), this.imagePreloader = new ImagePreloader(), this.audioController = audioControllerFactory(), this.markers = [], this.configAnimation = this.configAnimation.bind(this), this.onSetupError = this.onSetupError.bind(this), this.onSegmentComplete = this.onSegmentComplete.bind(this), this.drawnFrameEvent = new BMEnterFrameEvent("drawnFrame", 0, 0, 0), this.expressionsPlugin = getExpressionsPlugin();
      };
      extendPrototype([BaseEvent], AnimationItem), AnimationItem.prototype.setParams = function(t) {
        (t.wrapper || t.container) && (this.wrapper = t.wrapper || t.container);
        var e = "svg";
        t.animType ? e = t.animType : t.renderer && (e = t.renderer);
        var r = getRenderer(e);
        this.renderer = new r(this, t.rendererSettings), this.imagePreloader.setCacheType(e, this.renderer.globalData.defs), this.renderer.setProjectInterface(this.projectInterface), this.animType = e, t.loop === "" || t.loop === null || t.loop === void 0 || t.loop === !0 ? this.loop = !0 : t.loop === !1 ? this.loop = !1 : this.loop = parseInt(t.loop, 10), this.autoplay = "autoplay" in t ? t.autoplay : !0, this.name = t.name ? t.name : "", this.autoloadSegments = Object.prototype.hasOwnProperty.call(t, "autoloadSegments") ? t.autoloadSegments : !0, this.assetsPath = t.assetsPath, this.initialSegment = t.initialSegment, t.audioFactory && this.audioController.setAudioFactory(t.audioFactory), t.animationData ? this.setupAnimation(t.animationData) : t.path && (t.path.lastIndexOf("\\") !== -1 ? this.path = t.path.substr(0, t.path.lastIndexOf("\\") + 1) : this.path = t.path.substr(0, t.path.lastIndexOf("/") + 1), this.fileName = t.path.substr(t.path.lastIndexOf("/") + 1), this.fileName = this.fileName.substr(0, this.fileName.lastIndexOf(".json")), dataManager.loadAnimation(t.path, this.configAnimation, this.onSetupError));
      }, AnimationItem.prototype.onSetupError = function() {
        this.trigger("data_failed");
      }, AnimationItem.prototype.setupAnimation = function(t) {
        dataManager.completeAnimation(t, this.configAnimation);
      }, AnimationItem.prototype.setData = function(t, e) {
        e && _typeof$4(e) !== "object" && (e = JSON.parse(e));
        var r = {
          wrapper: t,
          animationData: e
        }, i = t.attributes;
        r.path = i.getNamedItem("data-animation-path") ? i.getNamedItem("data-animation-path").value : i.getNamedItem("data-bm-path") ? i.getNamedItem("data-bm-path").value : i.getNamedItem("bm-path") ? i.getNamedItem("bm-path").value : "", r.animType = i.getNamedItem("data-anim-type") ? i.getNamedItem("data-anim-type").value : i.getNamedItem("data-bm-type") ? i.getNamedItem("data-bm-type").value : i.getNamedItem("bm-type") ? i.getNamedItem("bm-type").value : i.getNamedItem("data-bm-renderer") ? i.getNamedItem("data-bm-renderer").value : i.getNamedItem("bm-renderer") ? i.getNamedItem("bm-renderer").value : getRegisteredRenderer() || "canvas";
        var s = i.getNamedItem("data-anim-loop") ? i.getNamedItem("data-anim-loop").value : i.getNamedItem("data-bm-loop") ? i.getNamedItem("data-bm-loop").value : i.getNamedItem("bm-loop") ? i.getNamedItem("bm-loop").value : "";
        s === "false" ? r.loop = !1 : s === "true" ? r.loop = !0 : s !== "" && (r.loop = parseInt(s, 10));
        var n = i.getNamedItem("data-anim-autoplay") ? i.getNamedItem("data-anim-autoplay").value : i.getNamedItem("data-bm-autoplay") ? i.getNamedItem("data-bm-autoplay").value : i.getNamedItem("bm-autoplay") ? i.getNamedItem("bm-autoplay").value : !0;
        r.autoplay = n !== "false", r.name = i.getNamedItem("data-name") ? i.getNamedItem("data-name").value : i.getNamedItem("data-bm-name") ? i.getNamedItem("data-bm-name").value : i.getNamedItem("bm-name") ? i.getNamedItem("bm-name").value : "";
        var a = i.getNamedItem("data-anim-prerender") ? i.getNamedItem("data-anim-prerender").value : i.getNamedItem("data-bm-prerender") ? i.getNamedItem("data-bm-prerender").value : i.getNamedItem("bm-prerender") ? i.getNamedItem("bm-prerender").value : "";
        a === "false" && (r.prerender = !1), r.path ? this.setParams(r) : this.trigger("destroy");
      }, AnimationItem.prototype.includeLayers = function(t) {
        t.op > this.animationData.op && (this.animationData.op = t.op, this.totalFrames = Math.floor(t.op - this.animationData.ip));
        var e = this.animationData.layers, r, i = e.length, s = t.layers, n, a = s.length;
        for (n = 0; n < a; n += 1)
          for (r = 0; r < i; ) {
            if (e[r].id === s[n].id) {
              e[r] = s[n];
              break;
            }
            r += 1;
          }
        if ((t.chars || t.fonts) && (this.renderer.globalData.fontManager.addChars(t.chars), this.renderer.globalData.fontManager.addFonts(t.fonts, this.renderer.globalData.defs)), t.assets)
          for (i = t.assets.length, r = 0; r < i; r += 1)
            this.animationData.assets.push(t.assets[r]);
        this.animationData.__complete = !1, dataManager.completeAnimation(this.animationData, this.onSegmentComplete);
      }, AnimationItem.prototype.onSegmentComplete = function(t) {
        this.animationData = t;
        var e = getExpressionsPlugin();
        e && e.initExpressions(this), this.loadNextSegment();
      }, AnimationItem.prototype.loadNextSegment = function() {
        var t = this.animationData.segments;
        if (!t || t.length === 0 || !this.autoloadSegments) {
          this.trigger("data_ready"), this.timeCompleted = this.totalFrames;
          return;
        }
        var e = t.shift();
        this.timeCompleted = e.time * this.frameRate;
        var r = this.path + this.fileName + "_" + this.segmentPos + ".json";
        this.segmentPos += 1, dataManager.loadData(r, this.includeLayers.bind(this), (function() {
          this.trigger("data_failed");
        }).bind(this));
      }, AnimationItem.prototype.loadSegments = function() {
        var t = this.animationData.segments;
        t || (this.timeCompleted = this.totalFrames), this.loadNextSegment();
      }, AnimationItem.prototype.imagesLoaded = function() {
        this.trigger("loaded_images"), this.checkLoaded();
      }, AnimationItem.prototype.preloadImages = function() {
        this.imagePreloader.setAssetsPath(this.assetsPath), this.imagePreloader.setPath(this.path), this.imagePreloader.loadAssets(this.animationData.assets, this.imagesLoaded.bind(this));
      }, AnimationItem.prototype.configAnimation = function(t) {
        if (this.renderer)
          try {
            this.animationData = t, this.initialSegment ? (this.totalFrames = Math.floor(this.initialSegment[1] - this.initialSegment[0]), this.firstFrame = Math.round(this.initialSegment[0])) : (this.totalFrames = Math.floor(this.animationData.op - this.animationData.ip), this.firstFrame = Math.round(this.animationData.ip)), this.renderer.configAnimation(t), t.assets || (t.assets = []), this.assets = this.animationData.assets, this.frameRate = this.animationData.fr, this.frameMult = this.animationData.fr / 1e3, this.renderer.searchExtraCompositions(t.assets), this.markers = markerParser(t.markers || []), this.trigger("config_ready"), this.preloadImages(), this.loadSegments(), this.updaFrameModifier(), this.waitForFontsLoaded(), this.isPaused && this.audioController.pause();
          } catch (e) {
            this.triggerConfigError(e);
          }
      }, AnimationItem.prototype.waitForFontsLoaded = function() {
        this.renderer && (this.renderer.globalData.fontManager.isLoaded ? this.checkLoaded() : setTimeout(this.waitForFontsLoaded.bind(this), 20));
      }, AnimationItem.prototype.checkLoaded = function() {
        if (!this.isLoaded && this.renderer.globalData.fontManager.isLoaded && (this.imagePreloader.loadedImages() || this.renderer.rendererType !== "canvas") && this.imagePreloader.loadedFootages()) {
          this.isLoaded = !0;
          var t = getExpressionsPlugin();
          t && t.initExpressions(this), this.renderer.initItems(), setTimeout((function() {
            this.trigger("DOMLoaded");
          }).bind(this), 0), this.gotoFrame(), this.autoplay && this.play();
        }
      }, AnimationItem.prototype.resize = function(t, e) {
        var r = typeof t == "number" ? t : void 0, i = typeof e == "number" ? e : void 0;
        this.renderer.updateContainerSize(r, i);
      }, AnimationItem.prototype.setSubframe = function(t) {
        this.isSubframeEnabled = !!t;
      }, AnimationItem.prototype.gotoFrame = function() {
        this.currentFrame = this.isSubframeEnabled ? this.currentRawFrame : ~~this.currentRawFrame, this.timeCompleted !== this.totalFrames && this.currentFrame > this.timeCompleted && (this.currentFrame = this.timeCompleted), this.trigger("enterFrame"), this.renderFrame(), this.trigger("drawnFrame");
      }, AnimationItem.prototype.renderFrame = function() {
        if (!(this.isLoaded === !1 || !this.renderer))
          try {
            this.expressionsPlugin && this.expressionsPlugin.resetFrame(), this.renderer.renderFrame(this.currentFrame + this.firstFrame);
          } catch (t) {
            this.triggerRenderFrameError(t);
          }
      }, AnimationItem.prototype.play = function(t) {
        t && this.name !== t || this.isPaused === !0 && (this.isPaused = !1, this.trigger("_play"), this.audioController.resume(), this._idle && (this._idle = !1, this.trigger("_active")));
      }, AnimationItem.prototype.pause = function(t) {
        t && this.name !== t || this.isPaused === !1 && (this.isPaused = !0, this.trigger("_pause"), this._idle = !0, this.trigger("_idle"), this.audioController.pause());
      }, AnimationItem.prototype.togglePause = function(t) {
        t && this.name !== t || (this.isPaused === !0 ? this.play() : this.pause());
      }, AnimationItem.prototype.stop = function(t) {
        t && this.name !== t || (this.pause(), this.playCount = 0, this._completedLoop = !1, this.setCurrentRawFrameValue(0));
      }, AnimationItem.prototype.getMarkerData = function(t) {
        for (var e, r = 0; r < this.markers.length; r += 1)
          if (e = this.markers[r], e.payload && e.payload.name === t)
            return e;
        return null;
      }, AnimationItem.prototype.goToAndStop = function(t, e, r) {
        if (!(r && this.name !== r)) {
          var i = Number(t);
          if (isNaN(i)) {
            var s = this.getMarkerData(t);
            s && this.goToAndStop(s.time, !0);
          } else e ? this.setCurrentRawFrameValue(t) : this.setCurrentRawFrameValue(t * this.frameModifier);
          this.pause();
        }
      }, AnimationItem.prototype.goToAndPlay = function(t, e, r) {
        if (!(r && this.name !== r)) {
          var i = Number(t);
          if (isNaN(i)) {
            var s = this.getMarkerData(t);
            s && (s.duration ? this.playSegments([s.time, s.time + s.duration], !0) : this.goToAndStop(s.time, !0));
          } else
            this.goToAndStop(i, e, r);
          this.play();
        }
      }, AnimationItem.prototype.advanceTime = function(t) {
        if (!(this.isPaused === !0 || this.isLoaded === !1)) {
          var e = this.currentRawFrame + t * this.frameModifier, r = !1;
          e >= this.totalFrames - 1 && this.frameModifier > 0 ? !this.loop || this.playCount === this.loop ? this.checkSegments(e > this.totalFrames ? e % this.totalFrames : 0) || (r = !0, e = this.totalFrames - 1) : e >= this.totalFrames ? (this.playCount += 1, this.checkSegments(e % this.totalFrames) || (this.setCurrentRawFrameValue(e % this.totalFrames), this._completedLoop = !0, this.trigger("loopComplete"))) : this.setCurrentRawFrameValue(e) : e < 0 ? this.checkSegments(e % this.totalFrames) || (this.loop && !(this.playCount-- <= 0 && this.loop !== !0) ? (this.setCurrentRawFrameValue(this.totalFrames + e % this.totalFrames), this._completedLoop ? this.trigger("loopComplete") : this._completedLoop = !0) : (r = !0, e = 0)) : this.setCurrentRawFrameValue(e), r && (this.setCurrentRawFrameValue(e), this.pause(), this.trigger("complete"));
        }
      }, AnimationItem.prototype.adjustSegment = function(t, e) {
        this.playCount = 0, t[1] < t[0] ? (this.frameModifier > 0 && (this.playSpeed < 0 ? this.setSpeed(-this.playSpeed) : this.setDirection(-1)), this.totalFrames = t[0] - t[1], this.timeCompleted = this.totalFrames, this.firstFrame = t[1], this.setCurrentRawFrameValue(this.totalFrames - 1e-3 - e)) : t[1] > t[0] && (this.frameModifier < 0 && (this.playSpeed < 0 ? this.setSpeed(-this.playSpeed) : this.setDirection(1)), this.totalFrames = t[1] - t[0], this.timeCompleted = this.totalFrames, this.firstFrame = t[0], this.setCurrentRawFrameValue(1e-3 + e)), this.trigger("segmentStart");
      }, AnimationItem.prototype.setSegment = function(t, e) {
        var r = -1;
        this.isPaused && (this.currentRawFrame + this.firstFrame < t ? r = t : this.currentRawFrame + this.firstFrame > e && (r = e - t)), this.firstFrame = t, this.totalFrames = e - t, this.timeCompleted = this.totalFrames, r !== -1 && this.goToAndStop(r, !0);
      }, AnimationItem.prototype.playSegments = function(t, e) {
        if (e && (this.segments.length = 0), _typeof$4(t[0]) === "object") {
          var r, i = t.length;
          for (r = 0; r < i; r += 1)
            this.segments.push(t[r]);
        } else
          this.segments.push(t);
        this.segments.length && e && this.adjustSegment(this.segments.shift(), 0), this.isPaused && this.play();
      }, AnimationItem.prototype.resetSegments = function(t) {
        this.segments.length = 0, this.segments.push([this.animationData.ip, this.animationData.op]), t && this.checkSegments(0);
      }, AnimationItem.prototype.checkSegments = function(t) {
        return this.segments.length ? (this.adjustSegment(this.segments.shift(), t), !0) : !1;
      }, AnimationItem.prototype.destroy = function(t) {
        t && this.name !== t || !this.renderer || (this.renderer.destroy(), this.imagePreloader.destroy(), this.trigger("destroy"), this._cbs = null, this.onEnterFrame = null, this.onLoopComplete = null, this.onComplete = null, this.onSegmentStart = null, this.onDestroy = null, this.renderer = null, this.expressionsPlugin = null, this.imagePreloader = null, this.projectInterface = null);
      }, AnimationItem.prototype.setCurrentRawFrameValue = function(t) {
        this.currentRawFrame = t, this.gotoFrame();
      }, AnimationItem.prototype.setSpeed = function(t) {
        this.playSpeed = t, this.updaFrameModifier();
      }, AnimationItem.prototype.setDirection = function(t) {
        this.playDirection = t < 0 ? -1 : 1, this.updaFrameModifier();
      }, AnimationItem.prototype.setLoop = function(t) {
        this.loop = t;
      }, AnimationItem.prototype.setVolume = function(t, e) {
        e && this.name !== e || this.audioController.setVolume(t);
      }, AnimationItem.prototype.getVolume = function() {
        return this.audioController.getVolume();
      }, AnimationItem.prototype.mute = function(t) {
        t && this.name !== t || this.audioController.mute();
      }, AnimationItem.prototype.unmute = function(t) {
        t && this.name !== t || this.audioController.unmute();
      }, AnimationItem.prototype.updaFrameModifier = function() {
        this.frameModifier = this.frameMult * this.playSpeed * this.playDirection, this.audioController.setRate(this.playSpeed * this.playDirection);
      }, AnimationItem.prototype.getPath = function() {
        return this.path;
      }, AnimationItem.prototype.getAssetsPath = function(t) {
        var e = "";
        if (t.e)
          e = t.p;
        else if (this.assetsPath) {
          var r = t.p;
          r.indexOf("images/") !== -1 && (r = r.split("/")[1]), e = this.assetsPath + r;
        } else
          e = this.path, e += t.u ? t.u : "", e += t.p;
        return e;
      }, AnimationItem.prototype.getAssetData = function(t) {
        for (var e = 0, r = this.assets.length; e < r; ) {
          if (t === this.assets[e].id)
            return this.assets[e];
          e += 1;
        }
        return null;
      }, AnimationItem.prototype.hide = function() {
        this.renderer.hide();
      }, AnimationItem.prototype.show = function() {
        this.renderer.show();
      }, AnimationItem.prototype.getDuration = function(t) {
        return t ? this.totalFrames : this.totalFrames / this.frameRate;
      }, AnimationItem.prototype.updateDocumentData = function(t, e, r) {
        try {
          var i = this.renderer.getElementByPath(t);
          i.updateDocumentData(e, r);
        } catch {
        }
      }, AnimationItem.prototype.trigger = function(t) {
        if (this._cbs && this._cbs[t])
          switch (t) {
            case "enterFrame":
              this.triggerEvent(t, new BMEnterFrameEvent(t, this.currentFrame, this.totalFrames, this.frameModifier));
              break;
            case "drawnFrame":
              this.drawnFrameEvent.currentTime = this.currentFrame, this.drawnFrameEvent.totalTime = this.totalFrames, this.drawnFrameEvent.direction = this.frameModifier, this.triggerEvent(t, this.drawnFrameEvent);
              break;
            case "loopComplete":
              this.triggerEvent(t, new BMCompleteLoopEvent(t, this.loop, this.playCount, this.frameMult));
              break;
            case "complete":
              this.triggerEvent(t, new BMCompleteEvent(t, this.frameMult));
              break;
            case "segmentStart":
              this.triggerEvent(t, new BMSegmentStartEvent(t, this.firstFrame, this.totalFrames));
              break;
            case "destroy":
              this.triggerEvent(t, new BMDestroyEvent(t, this));
              break;
            default:
              this.triggerEvent(t);
          }
        t === "enterFrame" && this.onEnterFrame && this.onEnterFrame.call(this, new BMEnterFrameEvent(t, this.currentFrame, this.totalFrames, this.frameMult)), t === "loopComplete" && this.onLoopComplete && this.onLoopComplete.call(this, new BMCompleteLoopEvent(t, this.loop, this.playCount, this.frameMult)), t === "complete" && this.onComplete && this.onComplete.call(this, new BMCompleteEvent(t, this.frameMult)), t === "segmentStart" && this.onSegmentStart && this.onSegmentStart.call(this, new BMSegmentStartEvent(t, this.firstFrame, this.totalFrames)), t === "destroy" && this.onDestroy && this.onDestroy.call(this, new BMDestroyEvent(t, this));
      }, AnimationItem.prototype.triggerRenderFrameError = function(t) {
        var e = new BMRenderFrameErrorEvent(t, this.currentFrame);
        this.triggerEvent("error", e), this.onError && this.onError.call(this, e);
      }, AnimationItem.prototype.triggerConfigError = function(t) {
        var e = new BMConfigErrorEvent(t, this.currentFrame);
        this.triggerEvent("error", e), this.onError && this.onError.call(this, e);
      };
      var animationManager = (function() {
        var t = {}, e = [], r = 0, i = 0, s = 0, n = !0, a = !1;
        function l(C) {
          for (var T = 0, g = C.target; T < i; )
            e[T].animation === g && (e.splice(T, 1), T -= 1, i -= 1, g.isPaused || S()), T += 1;
        }
        function o(C, T) {
          if (!C)
            return null;
          for (var g = 0; g < i; ) {
            if (e[g].elem === C && e[g].elem !== null)
              return e[g].animation;
            g += 1;
          }
          var E = new AnimationItem();
          return f(E, C), E.setData(C, T), E;
        }
        function p() {
          var C, T = e.length, g = [];
          for (C = 0; C < T; C += 1)
            g.push(e[C].animation);
          return g;
        }
        function u() {
          s += 1, B();
        }
        function S() {
          s -= 1;
        }
        function f(C, T) {
          C.addEventListener("destroy", l), C.addEventListener("_active", u), C.addEventListener("_idle", S), e.push({
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
            e[g].animation.setSpeed(C, T);
        }
        function m(C, T) {
          var g;
          for (g = 0; g < i; g += 1)
            e[g].animation.setDirection(C, T);
        }
        function A(C) {
          var T;
          for (T = 0; T < i; T += 1)
            e[T].animation.play(C);
        }
        function c(C) {
          var T = C - r, g;
          for (g = 0; g < i; g += 1)
            e[g].animation.advanceTime(T);
          r = C, s && !a ? window.requestAnimationFrame(c) : n = !0;
        }
        function d(C) {
          r = C, window.requestAnimationFrame(c);
        }
        function h(C) {
          var T;
          for (T = 0; T < i; T += 1)
            e[T].animation.pause(C);
        }
        function y(C, T, g) {
          var E;
          for (E = 0; E < i; E += 1)
            e[E].animation.goToAndStop(C, T, g);
        }
        function P(C) {
          var T;
          for (T = 0; T < i; T += 1)
            e[T].animation.stop(C);
        }
        function x(C) {
          var T;
          for (T = 0; T < i; T += 1)
            e[T].animation.togglePause(C);
        }
        function _(C) {
          var T;
          for (T = i - 1; T >= 0; T -= 1)
            e[T].animation.destroy(C);
        }
        function M(C, T, g) {
          var E = [].concat([].slice.call(document.getElementsByClassName("lottie")), [].slice.call(document.getElementsByClassName("bodymovin"))), F, k = E.length;
          for (F = 0; F < k; F += 1)
            g && E[F].setAttribute("data-bm-type", g), o(E[F], C);
          if (T && k === 0) {
            g || (g = "svg");
            var L = document.getElementsByTagName("body")[0];
            L.innerText = "";
            var D = createTag("div");
            D.style.width = "100%", D.style.height = "100%", D.setAttribute("data-bm-type", g), L.appendChild(D), o(D, C);
          }
        }
        function w() {
          var C;
          for (C = 0; C < i; C += 1)
            e[C].animation.resize();
        }
        function B() {
          !a && s && n && (window.requestAnimationFrame(d), n = !1);
        }
        function V() {
          a = !0;
        }
        function I() {
          a = !1, B();
        }
        function N(C, T) {
          var g;
          for (g = 0; g < i; g += 1)
            e[g].animation.setVolume(C, T);
        }
        function G(C) {
          var T;
          for (T = 0; T < i; T += 1)
            e[T].animation.mute(C);
        }
        function R(C) {
          var T;
          for (T = 0; T < i; T += 1)
            e[T].animation.unmute(C);
        }
        return t.registerAnimation = o, t.loadAnimation = b, t.setSpeed = v, t.setDirection = m, t.play = A, t.pause = h, t.stop = P, t.togglePause = x, t.searchAnimations = M, t.resize = w, t.goToAndStop = y, t.destroy = _, t.freeze = V, t.unfreeze = I, t.setVolume = N, t.mute = G, t.unmute = R, t.getRegisteredAnimations = p, t;
      })(), BezierFactory = (function() {
        var t = {};
        t.getBezierEasing = r;
        var e = {};
        function r(d, h, y, P, x) {
          var _ = x || ("bez_" + d + "_" + h + "_" + y + "_" + P).replace(/\./g, "p");
          if (e[_])
            return e[_];
          var M = new c([d, h, y, P]);
          return e[_] = M, M;
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
        function m(d, h, y, P, x) {
          var _, M, w = 0;
          do
            M = h + (y - h) / 2, _ = b(M, P, x) - d, _ > 0 ? y = M : h = M;
          while (Math.abs(_) > n && ++w < a);
          return M;
        }
        function A(d, h, y, P) {
          for (var x = 0; x < i; ++x) {
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
            var y = this._p[0], P = this._p[1], x = this._p[2], _ = this._p[3];
            return this._precomputed || this._precompute(), y === P && x === _ ? h : h === 0 ? 0 : h === 1 ? 1 : b(this._getTForX(h), P, _);
          },
          // Private part
          _precompute: function() {
            var h = this._p[0], y = this._p[1], P = this._p[2], x = this._p[3];
            this._precomputed = !0, (h !== y || P !== x) && this._calcSampleValues();
          },
          _calcSampleValues: function() {
            for (var h = this._p[0], y = this._p[2], P = 0; P < l; ++P)
              this._mSampleValues[P] = b(P * o, h, y);
          },
          /**
               * getTForX chose the fastest heuristic to determine the percentage value precisely from a given X projection.
               */
          _getTForX: function(h) {
            for (var y = this._p[0], P = this._p[2], x = this._mSampleValues, _ = 0, M = 1, w = l - 1; M !== w && x[M] <= h; ++M)
              _ += o;
            --M;
            var B = (h - x[M]) / (x[M + 1] - x[M]), V = _ + B * o, I = v(V, y, P);
            return I >= s ? A(h, V, y, P) : I === 0 ? V : m(h, _, _ + o, y, P);
          }
        }, t;
      })(), pooling = /* @__PURE__ */ (function() {
        function t(e) {
          return e.concat(createSizedArray(e.length));
        }
        return {
          double: t
        };
      })(), poolFactory = /* @__PURE__ */ (function() {
        return function(t, e, r) {
          var i = 0, s = t, n = createSizedArray(s), a = {
            newElement: l,
            release: o
          };
          function l() {
            var p;
            return i ? (i -= 1, p = n[i]) : p = e(), p;
          }
          function o(p) {
            i === s && (n = pooling.double(n), s *= 2), r && r(p), n[i] = p, i += 1;
          }
          return a;
        };
      })(), bezierLengthPool = (function() {
        function t() {
          return {
            addedLength: 0,
            percents: createTypedArray("float32", getDefaultCurveSegments()),
            lengths: createTypedArray("float32", getDefaultCurveSegments())
          };
        }
        return poolFactory(8, t);
      })(), segmentsLengthPool = (function() {
        function t() {
          return {
            lengths: [],
            totalLength: 0
          };
        }
        function e(r) {
          var i, s = r.lengths.length;
          for (i = 0; i < s; i += 1)
            bezierLengthPool.release(r.lengths[i]);
          r.lengths.length = 0;
        }
        return poolFactory(8, t, e);
      })();
      function bezFunction() {
        var t = Math;
        function e(f, b, v, m, A, c) {
          var d = f * m + b * A + v * c - A * m - c * f - v * b;
          return d > -1e-3 && d < 1e-3;
        }
        function r(f, b, v, m, A, c, d, h, y) {
          if (v === 0 && c === 0 && y === 0)
            return e(f, b, m, A, d, h);
          var P = t.sqrt(t.pow(m - f, 2) + t.pow(A - b, 2) + t.pow(c - v, 2)), x = t.sqrt(t.pow(d - f, 2) + t.pow(h - b, 2) + t.pow(y - v, 2)), _ = t.sqrt(t.pow(d - m, 2) + t.pow(h - A, 2) + t.pow(y - c, 2)), M;
          return P > x ? P > _ ? M = P - x - _ : M = _ - x - P : _ > x ? M = _ - x - P : M = x - P - _, M > -1e-4 && M < 1e-4;
        }
        var i = /* @__PURE__ */ (function() {
          return function(f, b, v, m) {
            var A = getDefaultCurveSegments(), c, d, h, y, P, x = 0, _, M = [], w = [], B = bezierLengthPool.newElement();
            for (h = v.length, c = 0; c < A; c += 1) {
              for (P = c / (A - 1), _ = 0, d = 0; d < h; d += 1)
                y = bmPow(1 - P, 3) * f[d] + 3 * bmPow(1 - P, 2) * P * v[d] + 3 * (1 - P) * bmPow(P, 2) * m[d] + bmPow(P, 3) * b[d], M[d] = y, w[d] !== null && (_ += bmPow(M[d] - w[d], 2)), w[d] = M[d];
              _ && (_ = bmSqrt(_), x += _), B.percents[c] = P, B.lengths[c] = x;
            }
            return B.addedLength = x, B;
          };
        })();
        function s(f) {
          var b = segmentsLengthPool.newElement(), v = f.c, m = f.v, A = f.o, c = f.i, d, h = f._length, y = b.lengths, P = 0;
          for (d = 0; d < h - 1; d += 1)
            y[d] = i(m[d], m[d + 1], A[d], c[d + 1]), P += y[d].addedLength;
          return v && h && (y[d] = i(m[d], m[0], A[d], c[0]), P += y[d].addedLength), b.totalLength = P, b;
        }
        function n(f) {
          this.segmentLength = 0, this.points = new Array(f);
        }
        function a(f, b) {
          this.partialLength = f, this.point = b;
        }
        var l = /* @__PURE__ */ (function() {
          var f = {};
          return function(b, v, m, A) {
            var c = (b[0] + "_" + b[1] + "_" + v[0] + "_" + v[1] + "_" + m[0] + "_" + m[1] + "_" + A[0] + "_" + A[1]).replace(/\./g, "p");
            if (!f[c]) {
              var d = getDefaultCurveSegments(), h, y, P, x, _, M = 0, w, B, V = null;
              b.length === 2 && (b[0] !== v[0] || b[1] !== v[1]) && e(b[0], b[1], v[0], v[1], b[0] + m[0], b[1] + m[1]) && e(b[0], b[1], v[0], v[1], v[0] + A[0], v[1] + A[1]) && (d = 2);
              var I = new n(d);
              for (P = m.length, h = 0; h < d; h += 1) {
                for (B = createSizedArray(P), _ = h / (d - 1), w = 0, y = 0; y < P; y += 1)
                  x = bmPow(1 - _, 3) * b[y] + 3 * bmPow(1 - _, 2) * _ * (b[y] + m[y]) + 3 * (1 - _) * bmPow(_, 2) * (v[y] + A[y]) + bmPow(_, 3) * v[y], B[y] = x, V !== null && (w += bmPow(B[y] - V[y], 2));
                w = bmSqrt(w), M += w, I.points[h] = new a(w, B), V = B;
              }
              I.segmentLength = M, f[c] = I;
            }
            return f[c];
          };
        })();
        function o(f, b) {
          var v = b.percents, m = b.lengths, A = v.length, c = bmFloor((A - 1) * f), d = f * b.addedLength, h = 0;
          if (c === A - 1 || c === 0 || d === m[c])
            return v[c];
          for (var y = m[c] > d ? -1 : 1, P = !0; P; )
            if (m[c] <= d && m[c + 1] > d ? (h = (d - m[c]) / (m[c + 1] - m[c]), P = !1) : c += y, c < 0 || c >= A - 1) {
              if (c === A - 1)
                return v[c];
              P = !1;
            }
          return v[c] + (v[c + 1] - v[c]) * h;
        }
        function p(f, b, v, m, A, c) {
          var d = o(A, c), h = 1 - d, y = t.round((h * h * h * f[0] + (d * h * h + h * d * h + h * h * d) * v[0] + (d * d * h + h * d * d + d * h * d) * m[0] + d * d * d * b[0]) * 1e3) / 1e3, P = t.round((h * h * h * f[1] + (d * h * h + h * d * h + h * h * d) * v[1] + (d * d * h + h * d * d + d * h * d) * m[1] + d * d * d * b[1]) * 1e3) / 1e3;
          return [y, P];
        }
        var u = createTypedArray("float32", 8);
        function S(f, b, v, m, A, c, d) {
          A < 0 ? A = 0 : A > 1 && (A = 1);
          var h = o(A, d);
          c = c > 1 ? 1 : c;
          var y = o(c, d), P, x = f.length, _ = 1 - h, M = 1 - y, w = _ * _ * _, B = h * _ * _ * 3, V = h * h * _ * 3, I = h * h * h, N = _ * _ * M, G = h * _ * M + _ * h * M + _ * _ * y, R = h * h * M + _ * h * y + h * _ * y, C = h * h * y, T = _ * M * M, g = h * M * M + _ * y * M + _ * M * y, E = h * y * M + _ * y * y + h * M * y, F = h * y * y, k = M * M * M, L = y * M * M + M * y * M + M * M * y, D = y * y * M + M * y * y + y * M * y, O = y * y * y;
          for (P = 0; P < x; P += 1)
            u[P * 4] = t.round((w * f[P] + B * v[P] + V * m[P] + I * b[P]) * 1e3) / 1e3, u[P * 4 + 1] = t.round((N * f[P] + G * v[P] + R * m[P] + C * b[P]) * 1e3) / 1e3, u[P * 4 + 2] = t.round((T * f[P] + g * v[P] + E * m[P] + F * b[P]) * 1e3) / 1e3, u[P * 4 + 3] = t.round((k * f[P] + L * v[P] + D * m[P] + O * b[P]) * 1e3) / 1e3;
          return u;
        }
        return {
          getSegmentsLength: s,
          getNewSegment: S,
          getPointInSegment: p,
          buildBezierData: l,
          pointOnLine2D: e,
          pointOnLine3D: r
        };
      }
      var bez = bezFunction(), initFrame = initialDefaultFrame, mathAbs = Math.abs;
      function interpolateValue(t, e) {
        var r = this.offsetTime, i;
        this.propType === "multidimensional" && (i = createTypedArray("float32", this.pv.length));
        for (var s = e.lastIndex, n = s, a = this.keyframes.length - 1, l = !0, o, p, u; l; ) {
          if (o = this.keyframes[n], p = this.keyframes[n + 1], n === a - 1 && t >= p.t - r) {
            o.h && (o = p), s = 0;
            break;
          }
          if (p.t - r > t) {
            s = n;
            break;
          }
          n < a - 1 ? n += 1 : (s = 0, l = !1);
        }
        u = this.keyframesMetadata[n] || {};
        var S, f, b, v, m, A, c = p.t - r, d = o.t - r, h;
        if (o.to) {
          u.bezierData || (u.bezierData = bez.buildBezierData(o.s, p.s || o.e, o.to, o.ti));
          var y = u.bezierData;
          if (t >= c || t < d) {
            var P = t >= c ? y.points.length - 1 : 0;
            for (f = y.points[P].point.length, S = 0; S < f; S += 1)
              i[S] = y.points[P].point[S];
          } else {
            u.__fnct ? A = u.__fnct : (A = BezierFactory.getBezierEasing(o.o.x, o.o.y, o.i.x, o.i.y, o.n).get, u.__fnct = A), b = A((t - d) / (c - d));
            var x = y.segmentLength * b, _, M = e.lastFrame < t && e._lastKeyframeIndex === n ? e._lastAddedLength : 0;
            for (m = e.lastFrame < t && e._lastKeyframeIndex === n ? e._lastPoint : 0, l = !0, v = y.points.length; l; ) {
              if (M += y.points[m].partialLength, x === 0 || b === 0 || m === y.points.length - 1) {
                for (f = y.points[m].point.length, S = 0; S < f; S += 1)
                  i[S] = y.points[m].point[S];
                break;
              } else if (x >= M && x < M + y.points[m + 1].partialLength) {
                for (_ = (x - M) / y.points[m + 1].partialLength, f = y.points[m].point.length, S = 0; S < f; S += 1)
                  i[S] = y.points[m].point[S] + (y.points[m + 1].point[S] - y.points[m].point[S]) * _;
                break;
              }
              m < v - 1 ? m += 1 : l = !1;
            }
            e._lastPoint = m, e._lastAddedLength = M - y.points[m].partialLength, e._lastKeyframeIndex = n;
          }
        } else {
          var w, B, V, I, N;
          if (a = o.s.length, h = p.s || o.e, this.sh && o.h !== 1)
            if (t >= c)
              i[0] = h[0], i[1] = h[1], i[2] = h[2];
            else if (t <= d)
              i[0] = o.s[0], i[1] = o.s[1], i[2] = o.s[2];
            else {
              var G = createQuaternion(o.s), R = createQuaternion(h), C = (t - d) / (c - d);
              quaternionToEuler(i, slerp(G, R, C));
            }
          else
            for (n = 0; n < a; n += 1)
              o.h !== 1 && (t >= c ? b = 1 : t < d ? b = 0 : (o.o.x.constructor === Array ? (u.__fnct || (u.__fnct = []), u.__fnct[n] ? A = u.__fnct[n] : (w = o.o.x[n] === void 0 ? o.o.x[0] : o.o.x[n], B = o.o.y[n] === void 0 ? o.o.y[0] : o.o.y[n], V = o.i.x[n] === void 0 ? o.i.x[0] : o.i.x[n], I = o.i.y[n] === void 0 ? o.i.y[0] : o.i.y[n], A = BezierFactory.getBezierEasing(w, B, V, I).get, u.__fnct[n] = A)) : u.__fnct ? A = u.__fnct : (w = o.o.x, B = o.o.y, V = o.i.x, I = o.i.y, A = BezierFactory.getBezierEasing(w, B, V, I).get, o.keyframeMetadata = A), b = A((t - d) / (c - d)))), h = p.s || o.e, N = o.h === 1 ? o.s[n] : o.s[n] + (h[n] - o.s[n]) * b, this.propType === "multidimensional" ? i[n] = N : i = N;
        }
        return e.lastIndex = s, i;
      }
      function slerp(t, e, r) {
        var i = [], s = t[0], n = t[1], a = t[2], l = t[3], o = e[0], p = e[1], u = e[2], S = e[3], f, b, v, m, A;
        return b = s * o + n * p + a * u + l * S, b < 0 && (b = -b, o = -o, p = -p, u = -u, S = -S), 1 - b > 1e-6 ? (f = Math.acos(b), v = Math.sin(f), m = Math.sin((1 - r) * f) / v, A = Math.sin(r * f) / v) : (m = 1 - r, A = r), i[0] = m * s + A * o, i[1] = m * n + A * p, i[2] = m * a + A * u, i[3] = m * l + A * S, i;
      }
      function quaternionToEuler(t, e) {
        var r = e[0], i = e[1], s = e[2], n = e[3], a = Math.atan2(2 * i * n - 2 * r * s, 1 - 2 * i * i - 2 * s * s), l = Math.asin(2 * r * i + 2 * s * n), o = Math.atan2(2 * r * n - 2 * i * s, 1 - 2 * r * r - 2 * s * s);
        t[0] = a / degToRads, t[1] = l / degToRads, t[2] = o / degToRads;
      }
      function createQuaternion(t) {
        var e = t[0] * degToRads, r = t[1] * degToRads, i = t[2] * degToRads, s = Math.cos(e / 2), n = Math.cos(r / 2), a = Math.cos(i / 2), l = Math.sin(e / 2), o = Math.sin(r / 2), p = Math.sin(i / 2), u = s * n * a - l * o * p, S = l * o * a + s * n * p, f = l * n * a + s * o * p, b = s * o * a - l * n * p;
        return [S, f, b, u];
      }
      function getValueAtCurrentTime() {
        var t = this.comp.renderedFrame - this.offsetTime, e = this.keyframes[0].t - this.offsetTime, r = this.keyframes[this.keyframes.length - 1].t - this.offsetTime;
        if (!(t === this._caching.lastFrame || this._caching.lastFrame !== initFrame && (this._caching.lastFrame >= r && t >= r || this._caching.lastFrame < e && t < e))) {
          this._caching.lastFrame >= t && (this._caching._lastKeyframeIndex = -1, this._caching.lastIndex = 0);
          var i = this.interpolateValue(t, this._caching);
          this.pv = i;
        }
        return this._caching.lastFrame = t, this.pv;
      }
      function setVValue(t) {
        var e;
        if (this.propType === "unidimensional")
          e = t * this.mult, mathAbs(this.v - e) > 1e-5 && (this.v = e, this._mdf = !0);
        else
          for (var r = 0, i = this.v.length; r < i; )
            e = t[r] * this.mult, mathAbs(this.v[r] - e) > 1e-5 && (this.v[r] = e, this._mdf = !0), r += 1;
      }
      function processEffectsSequence() {
        if (!(this.elem.globalData.frameId === this.frameId || !this.effectsSequence.length)) {
          if (this.lock) {
            this.setVValue(this.pv);
            return;
          }
          this.lock = !0, this._mdf = this._isFirstFrame;
          var t, e = this.effectsSequence.length, r = this.kf ? this.pv : this.data.k;
          for (t = 0; t < e; t += 1)
            r = this.effectsSequence[t](r);
          this.setVValue(r), this._isFirstFrame = !1, this.lock = !1, this.frameId = this.elem.globalData.frameId;
        }
      }
      function addEffect(t) {
        this.effectsSequence.push(t), this.container.addDynamicProperty(this);
      }
      function ValueProperty(t, e, r, i) {
        this.propType = "unidimensional", this.mult = r || 1, this.data = e, this.v = r ? e.k * r : e.k, this.pv = e.k, this._mdf = !1, this.elem = t, this.container = i, this.comp = t.comp, this.k = !1, this.kf = !1, this.vel = 0, this.effectsSequence = [], this._isFirstFrame = !0, this.getValue = processEffectsSequence, this.setVValue = setVValue, this.addEffect = addEffect;
      }
      function MultiDimensionalProperty(t, e, r, i) {
        this.propType = "multidimensional", this.mult = r || 1, this.data = e, this._mdf = !1, this.elem = t, this.container = i, this.comp = t.comp, this.k = !1, this.kf = !1, this.frameId = -1;
        var s, n = e.k.length;
        for (this.v = createTypedArray("float32", n), this.pv = createTypedArray("float32", n), this.vel = createTypedArray("float32", n), s = 0; s < n; s += 1)
          this.v[s] = e.k[s] * this.mult, this.pv[s] = e.k[s];
        this._isFirstFrame = !0, this.effectsSequence = [], this.getValue = processEffectsSequence, this.setVValue = setVValue, this.addEffect = addEffect;
      }
      function KeyframedValueProperty(t, e, r, i) {
        this.propType = "unidimensional", this.keyframes = e.k, this.keyframesMetadata = [], this.offsetTime = t.data.st, this.frameId = -1, this._caching = {
          lastFrame: initFrame,
          lastIndex: 0,
          value: 0,
          _lastKeyframeIndex: -1
        }, this.k = !0, this.kf = !0, this.data = e, this.mult = r || 1, this.elem = t, this.container = i, this.comp = t.comp, this.v = initFrame, this.pv = initFrame, this._isFirstFrame = !0, this.getValue = processEffectsSequence, this.setVValue = setVValue, this.interpolateValue = interpolateValue, this.effectsSequence = [getValueAtCurrentTime.bind(this)], this.addEffect = addEffect;
      }
      function KeyframedMultidimensionalProperty(t, e, r, i) {
        this.propType = "multidimensional";
        var s, n = e.k.length, a, l, o, p;
        for (s = 0; s < n - 1; s += 1)
          e.k[s].to && e.k[s].s && e.k[s + 1] && e.k[s + 1].s && (a = e.k[s].s, l = e.k[s + 1].s, o = e.k[s].to, p = e.k[s].ti, (a.length === 2 && !(a[0] === l[0] && a[1] === l[1]) && bez.pointOnLine2D(a[0], a[1], l[0], l[1], a[0] + o[0], a[1] + o[1]) && bez.pointOnLine2D(a[0], a[1], l[0], l[1], l[0] + p[0], l[1] + p[1]) || a.length === 3 && !(a[0] === l[0] && a[1] === l[1] && a[2] === l[2]) && bez.pointOnLine3D(a[0], a[1], a[2], l[0], l[1], l[2], a[0] + o[0], a[1] + o[1], a[2] + o[2]) && bez.pointOnLine3D(a[0], a[1], a[2], l[0], l[1], l[2], l[0] + p[0], l[1] + p[1], l[2] + p[2])) && (e.k[s].to = null, e.k[s].ti = null), a[0] === l[0] && a[1] === l[1] && o[0] === 0 && o[1] === 0 && p[0] === 0 && p[1] === 0 && (a.length === 2 || a[2] === l[2] && o[2] === 0 && p[2] === 0) && (e.k[s].to = null, e.k[s].ti = null));
        this.effectsSequence = [getValueAtCurrentTime.bind(this)], this.data = e, this.keyframes = e.k, this.keyframesMetadata = [], this.offsetTime = t.data.st, this.k = !0, this.kf = !0, this._isFirstFrame = !0, this.mult = r || 1, this.elem = t, this.container = i, this.comp = t.comp, this.getValue = processEffectsSequence, this.setVValue = setVValue, this.interpolateValue = interpolateValue, this.frameId = -1;
        var u = e.k[0].s.length;
        for (this.v = createTypedArray("float32", u), this.pv = createTypedArray("float32", u), s = 0; s < u; s += 1)
          this.v[s] = initFrame, this.pv[s] = initFrame;
        this._caching = {
          lastFrame: initFrame,
          lastIndex: 0,
          value: createTypedArray("float32", u)
        }, this.addEffect = addEffect;
      }
      var PropertyFactory = /* @__PURE__ */ (function() {
        function t(r, i, s, n, a) {
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
        var e = {
          getProp: t
        };
        return e;
      })();
      function DynamicPropertyContainer() {
      }
      DynamicPropertyContainer.prototype = {
        addDynamicProperty: function(e) {
          this.dynamicProperties.indexOf(e) === -1 && (this.dynamicProperties.push(e), this.container.addDynamicProperty(this), this._isAnimated = !0);
        },
        iterateDynamicProperties: function() {
          this._mdf = !1;
          var e, r = this.dynamicProperties.length;
          for (e = 0; e < r; e += 1)
            this.dynamicProperties[e].getValue(), this.dynamicProperties[e]._mdf && (this._mdf = !0);
        },
        initDynamicPropertyContainer: function(e) {
          this.container = e, this.dynamicProperties = [], this._mdf = !1, this._isAnimated = !1;
        }
      };
      var pointPool = (function() {
        function t() {
          return createTypedArray("float32", 2);
        }
        return poolFactory(8, t);
      })();
      function ShapePath() {
        this.c = !1, this._length = 0, this._maxLength = 8, this.v = createSizedArray(this._maxLength), this.o = createSizedArray(this._maxLength), this.i = createSizedArray(this._maxLength);
      }
      ShapePath.prototype.setPathData = function(t, e) {
        this.c = t, this.setLength(e);
        for (var r = 0; r < e; )
          this.v[r] = pointPool.newElement(), this.o[r] = pointPool.newElement(), this.i[r] = pointPool.newElement(), r += 1;
      }, ShapePath.prototype.setLength = function(t) {
        for (; this._maxLength < t; )
          this.doubleArrayLength();
        this._length = t;
      }, ShapePath.prototype.doubleArrayLength = function() {
        this.v = this.v.concat(createSizedArray(this._maxLength)), this.i = this.i.concat(createSizedArray(this._maxLength)), this.o = this.o.concat(createSizedArray(this._maxLength)), this._maxLength *= 2;
      }, ShapePath.prototype.setXYAt = function(t, e, r, i, s) {
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
        (!n[i] || n[i] && !s) && (n[i] = pointPool.newElement()), n[i][0] = t, n[i][1] = e;
      }, ShapePath.prototype.setTripleAt = function(t, e, r, i, s, n, a, l) {
        this.setXYAt(t, e, "v", a, l), this.setXYAt(r, i, "o", a, l), this.setXYAt(s, n, "i", a, l);
      }, ShapePath.prototype.reverse = function() {
        var t = new ShapePath();
        t.setPathData(this.c, this._length);
        var e = this.v, r = this.o, i = this.i, s = 0;
        this.c && (t.setTripleAt(e[0][0], e[0][1], i[0][0], i[0][1], r[0][0], r[0][1], 0, !1), s = 1);
        var n = this._length - 1, a = this._length, l;
        for (l = s; l < a; l += 1)
          t.setTripleAt(e[n][0], e[n][1], i[n][0], i[n][1], r[n][0], r[n][1], l, !1), n -= 1;
        return t;
      }, ShapePath.prototype.length = function() {
        return this._length;
      };
      var shapePool = (function() {
        function t() {
          return new ShapePath();
        }
        function e(s) {
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
        var i = poolFactory(4, t, e);
        return i.clone = r, i;
      })();
      function ShapeCollection() {
        this._length = 0, this._maxLength = 4, this.shapes = createSizedArray(this._maxLength);
      }
      ShapeCollection.prototype.addShape = function(t) {
        this._length === this._maxLength && (this.shapes = this.shapes.concat(createSizedArray(this._maxLength)), this._maxLength *= 2), this.shapes[this._length] = t, this._length += 1;
      }, ShapeCollection.prototype.releaseShapes = function() {
        var t;
        for (t = 0; t < this._length; t += 1)
          shapePool.release(this.shapes[t]);
        this._length = 0;
      };
      var shapeCollectionPool = (function() {
        var t = {
          newShapeCollection: s,
          release: n
        }, e = 0, r = 4, i = createSizedArray(r);
        function s() {
          var a;
          return e ? (e -= 1, a = i[e]) : a = new ShapeCollection(), a;
        }
        function n(a) {
          var l, o = a._length;
          for (l = 0; l < o; l += 1)
            shapePool.release(a.shapes[l]);
          a._length = 0, e === r && (i = pooling.double(i), r *= 2), i[e] = a, e += 1;
        }
        return t;
      })(), ShapePropertyFactory = (function() {
        var t = -999999;
        function e(c, d, h) {
          var y = h.lastIndex, P, x, _, M, w, B, V, I, N, G = this.keyframes;
          if (c < G[0].t - this.offsetTime)
            P = G[0].s[0], _ = !0, y = 0;
          else if (c >= G[G.length - 1].t - this.offsetTime)
            P = G[G.length - 1].s ? G[G.length - 1].s[0] : G[G.length - 2].e[0], _ = !0;
          else {
            for (var R = y, C = G.length - 1, T = !0, g, E, F; T && (g = G[R], E = G[R + 1], !(E.t - this.offsetTime > c)); )
              R < C - 1 ? R += 1 : T = !1;
            if (F = this.keyframesMetadata[R] || {}, _ = g.h === 1, y = R, !_) {
              if (c >= E.t - this.offsetTime)
                I = 1;
              else if (c < g.t - this.offsetTime)
                I = 0;
              else {
                var k;
                F.__fnct ? k = F.__fnct : (k = BezierFactory.getBezierEasing(g.o.x, g.o.y, g.i.x, g.i.y).get, F.__fnct = k), I = k((c - (g.t - this.offsetTime)) / (E.t - this.offsetTime - (g.t - this.offsetTime)));
              }
              x = E.s ? E.s[0] : g.e[0];
            }
            P = g.s[0];
          }
          for (B = d._length, V = P.i[0].length, h.lastIndex = y, M = 0; M < B; M += 1)
            for (w = 0; w < V; w += 1)
              N = _ ? P.i[M][w] : P.i[M][w] + (x.i[M][w] - P.i[M][w]) * I, d.i[M][w] = N, N = _ ? P.o[M][w] : P.o[M][w] + (x.o[M][w] - P.o[M][w]) * I, d.o[M][w] = N, N = _ ? P.v[M][w] : P.v[M][w] + (x.v[M][w] - P.v[M][w]) * I, d.v[M][w] = N;
        }
        function r() {
          var c = this.comp.renderedFrame - this.offsetTime, d = this.keyframes[0].t - this.offsetTime, h = this.keyframes[this.keyframes.length - 1].t - this.offsetTime, y = this._caching.lastFrame;
          return y !== t && (y < d && c < d || y > h && c > h) || (this._caching.lastIndex = y < c ? this._caching.lastIndex : 0, this.interpolateShape(c, this.pv, this._caching)), this._caching.lastFrame = c, this.pv;
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
        l.prototype.interpolateShape = e, l.prototype.getValue = a, l.prototype.setVValue = n, l.prototype.addEffect = o;
        function p(c, d, h) {
          this.propType = "shape", this.comp = c.comp, this.elem = c, this.container = c, this.offsetTime = c.data.st, this.keyframes = h === 3 ? d.pt.k : d.ks.k, this.keyframesMetadata = [], this.k = !0, this.kf = !0;
          var y = this.keyframes[0].s[0].i.length;
          this.v = shapePool.newElement(), this.v.setPathData(this.keyframes[0].s[0].c, y), this.pv = shapePool.clone(this.v), this.localShapeCollection = shapeCollectionPool.newShapeCollection(), this.paths = this.localShapeCollection, this.paths.addShape(this.v), this.lastFrame = t, this.reset = i, this._caching = {
            lastFrame: t,
            lastIndex: 0
          }, this.effectsSequence = [r.bind(this)];
        }
        p.prototype.getValue = a, p.prototype.interpolateShape = e, p.prototype.setVValue = n, p.prototype.addEffect = o;
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
              var y = this.p.v[0], P = this.p.v[1], x = this.s.v[0] / 2, _ = this.s.v[1] / 2, M = this.d !== 3, w = this.v;
              w.v[0][0] = y, w.v[0][1] = P - _, w.v[1][0] = M ? y + x : y - x, w.v[1][1] = P, w.v[2][0] = y, w.v[2][1] = P + _, w.v[3][0] = M ? y - x : y + x, w.v[3][1] = P, w.i[0][0] = M ? y - x * c : y + x * c, w.i[0][1] = P - _, w.i[1][0] = M ? y + x : y - x, w.i[1][1] = P - _ * c, w.i[2][0] = M ? y + x * c : y - x * c, w.i[2][1] = P + _, w.i[3][0] = M ? y - x : y + x, w.i[3][1] = P + _ * c, w.o[0][0] = M ? y + x * c : y - x * c, w.o[0][1] = P - _, w.o[1][0] = M ? y + x : y - x, w.o[1][1] = P + _ * c, w.o[2][0] = M ? y - x * c : y + x * c, w.o[2][1] = P + _, w.o[3][0] = M ? y - x : y + x, w.o[3][1] = P - _ * c;
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
              var h = Math.floor(this.pt.v) * 2, y = Math.PI * 2 / h, P = !0, x = this.or.v, _ = this.ir.v, M = this.os.v, w = this.is.v, B = 2 * Math.PI * x / (h * 2), V = 2 * Math.PI * _ / (h * 2), I, N, G, R, C = -Math.PI / 2;
              C += this.r.v;
              var T = this.data.d === 3 ? -1 : 1;
              for (this.v._length = 0, I = 0; I < h; I += 1) {
                N = P ? x : _, G = P ? M : w, R = P ? B : V;
                var g = N * Math.cos(C), E = N * Math.sin(C), F = g === 0 && E === 0 ? 0 : E / Math.sqrt(g * g + E * E), k = g === 0 && E === 0 ? 0 : -g / Math.sqrt(g * g + E * E);
                g += +this.p.v[0], E += +this.p.v[1], this.v.setTripleAt(g, E, g - F * R * G * T, E - k * R * G * T, g + F * R * G * T, E + k * R * G * T, I, !0), P = !P, C += y * T;
              }
            },
            convertPolygonToPath: function() {
              var h = Math.floor(this.pt.v), y = Math.PI * 2 / h, P = this.or.v, x = this.os.v, _ = 2 * Math.PI * P / (h * 4), M, w = -Math.PI * 0.5, B = this.data.d === 3 ? -1 : 1;
              for (w += this.r.v, this.v._length = 0, M = 0; M < h; M += 1) {
                var V = P * Math.cos(w), I = P * Math.sin(w), N = V === 0 && I === 0 ? 0 : I / Math.sqrt(V * V + I * I), G = V === 0 && I === 0 ? 0 : -V / Math.sqrt(V * V + I * I);
                V += +this.p.v[0], I += +this.p.v[1], this.v.setTripleAt(V, I, V - N * _ * x * B, I - G * _ * x * B, V + N * _ * x * B, I + G * _ * x * B, M, !0), w += y * B;
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
              var h = this.p.v[0], y = this.p.v[1], P = this.s.v[0] / 2, x = this.s.v[1] / 2, _ = bmMin(P, x, this.r.v), M = _ * (1 - roundCorner);
              this.v._length = 0, this.d === 2 || this.d === 1 ? (this.v.setTripleAt(h + P, y - x + _, h + P, y - x + _, h + P, y - x + M, 0, !0), this.v.setTripleAt(h + P, y + x - _, h + P, y + x - M, h + P, y + x - _, 1, !0), _ !== 0 ? (this.v.setTripleAt(h + P - _, y + x, h + P - _, y + x, h + P - M, y + x, 2, !0), this.v.setTripleAt(h - P + _, y + x, h - P + M, y + x, h - P + _, y + x, 3, !0), this.v.setTripleAt(h - P, y + x - _, h - P, y + x - _, h - P, y + x - M, 4, !0), this.v.setTripleAt(h - P, y - x + _, h - P, y - x + M, h - P, y - x + _, 5, !0), this.v.setTripleAt(h - P + _, y - x, h - P + _, y - x, h - P + M, y - x, 6, !0), this.v.setTripleAt(h + P - _, y - x, h + P - M, y - x, h + P - _, y - x, 7, !0)) : (this.v.setTripleAt(h - P, y + x, h - P + M, y + x, h - P, y + x, 2), this.v.setTripleAt(h - P, y - x, h - P, y - x + M, h - P, y - x, 3))) : (this.v.setTripleAt(h + P, y - x + _, h + P, y - x + M, h + P, y - x + _, 0, !0), _ !== 0 ? (this.v.setTripleAt(h + P - _, y - x, h + P - _, y - x, h + P - M, y - x, 1, !0), this.v.setTripleAt(h - P + _, y - x, h - P + M, y - x, h - P + _, y - x, 2, !0), this.v.setTripleAt(h - P, y - x + _, h - P, y - x + _, h - P, y - x + M, 3, !0), this.v.setTripleAt(h - P, y + x - _, h - P, y + x - M, h - P, y + x - _, 4, !0), this.v.setTripleAt(h - P + _, y + x, h - P + _, y + x, h - P + M, y + x, 5, !0), this.v.setTripleAt(h + P - _, y + x, h + P - M, y + x, h + P - _, y + x, 6, !0), this.v.setTripleAt(h + P, y + x - _, h + P, y + x - _, h + P, y + x - M, 7, !0)) : (this.v.setTripleAt(h - P, y - x, h - P + M, y - x, h - P, y - x, 1, !0), this.v.setTripleAt(h - P, y + x, h - P, y + x - M, h - P, y + x, 2, !0), this.v.setTripleAt(h + P, y + x, h + P - M, y + x, h + P, y + x, 3, !0)));
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
            var P = h === 3 ? d.pt : d.ks, x = P.k;
            x.length ? y = new p(c, d, h) : y = new l(c, d, h);
          } else h === 5 ? y = new f(c, d) : h === 6 ? y = new u(c, d) : h === 7 && (y = new S(c, d));
          return y.k && c.addDynamicProperty(y), y;
        }
        function v() {
          return l;
        }
        function m() {
          return p;
        }
        var A = {};
        return A.getShapeProp = b, A.getConstructorFunction = v, A.getKeyframedConstructorFunction = m, A;
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
        var t = Math.cos, e = Math.sin, r = Math.tan, i = Math.round;
        function s() {
          return this.props[0] = 1, this.props[1] = 0, this.props[2] = 0, this.props[3] = 0, this.props[4] = 0, this.props[5] = 1, this.props[6] = 0, this.props[7] = 0, this.props[8] = 0, this.props[9] = 0, this.props[10] = 1, this.props[11] = 0, this.props[12] = 0, this.props[13] = 0, this.props[14] = 0, this.props[15] = 1, this;
        }
        function n(g) {
          if (g === 0)
            return this;
          var E = t(g), F = e(g);
          return this._t(E, -F, 0, 0, F, E, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        }
        function a(g) {
          if (g === 0)
            return this;
          var E = t(g), F = e(g);
          return this._t(1, 0, 0, 0, 0, E, -F, 0, 0, F, E, 0, 0, 0, 0, 1);
        }
        function l(g) {
          if (g === 0)
            return this;
          var E = t(g), F = e(g);
          return this._t(E, 0, F, 0, 0, 1, 0, 0, -F, 0, E, 0, 0, 0, 0, 1);
        }
        function o(g) {
          if (g === 0)
            return this;
          var E = t(g), F = e(g);
          return this._t(E, -F, 0, 0, F, E, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        }
        function p(g, E) {
          return this._t(1, E, g, 1, 0, 0);
        }
        function u(g, E) {
          return this.shear(r(g), r(E));
        }
        function S(g, E) {
          var F = t(E), k = e(E);
          return this._t(F, k, 0, 0, -k, F, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)._t(1, 0, 0, 0, r(g), 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)._t(F, -k, 0, 0, k, F, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        }
        function f(g, E, F) {
          return !F && F !== 0 && (F = 1), g === 1 && E === 1 && F === 1 ? this : this._t(g, 0, 0, 0, 0, E, 0, 0, 0, 0, F, 0, 0, 0, 0, 1);
        }
        function b(g, E, F, k, L, D, O, j, q, Y, X, W, $, J, tt, Z) {
          return this.props[0] = g, this.props[1] = E, this.props[2] = F, this.props[3] = k, this.props[4] = L, this.props[5] = D, this.props[6] = O, this.props[7] = j, this.props[8] = q, this.props[9] = Y, this.props[10] = X, this.props[11] = W, this.props[12] = $, this.props[13] = J, this.props[14] = tt, this.props[15] = Z, this;
        }
        function v(g, E, F) {
          return F = F || 0, g !== 0 || E !== 0 || F !== 0 ? this._t(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, g, E, F, 1) : this;
        }
        function m(g, E, F, k, L, D, O, j, q, Y, X, W, $, J, tt, Z) {
          var z = this.props;
          if (g === 1 && E === 0 && F === 0 && k === 0 && L === 0 && D === 1 && O === 0 && j === 0 && q === 0 && Y === 0 && X === 1 && W === 0)
            return z[12] = z[12] * g + z[15] * $, z[13] = z[13] * D + z[15] * J, z[14] = z[14] * X + z[15] * tt, z[15] *= Z, this._identityCalculated = !1, this;
          var ot = z[0], rt = z[1], et = z[2], Q = z[3], H = z[4], U = z[5], K = z[6], it = z[7], st = z[8], nt = z[9], lt = z[10], at = z[11], ht = z[12], ft = z[13], pt = z[14], ct = z[15];
          return z[0] = ot * g + rt * L + et * q + Q * $, z[1] = ot * E + rt * D + et * Y + Q * J, z[2] = ot * F + rt * O + et * X + Q * tt, z[3] = ot * k + rt * j + et * W + Q * Z, z[4] = H * g + U * L + K * q + it * $, z[5] = H * E + U * D + K * Y + it * J, z[6] = H * F + U * O + K * X + it * tt, z[7] = H * k + U * j + K * W + it * Z, z[8] = st * g + nt * L + lt * q + at * $, z[9] = st * E + nt * D + lt * Y + at * J, z[10] = st * F + nt * O + lt * X + at * tt, z[11] = st * k + nt * j + lt * W + at * Z, z[12] = ht * g + ft * L + pt * q + ct * $, z[13] = ht * E + ft * D + pt * Y + ct * J, z[14] = ht * F + ft * O + pt * X + ct * tt, z[15] = ht * k + ft * j + pt * W + ct * Z, this._identityCalculated = !1, this;
        }
        function A(g) {
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
        function x(g, E, F) {
          return g * this.props[0] + E * this.props[4] + F * this.props[8] + this.props[12];
        }
        function _(g, E, F) {
          return g * this.props[1] + E * this.props[5] + F * this.props[9] + this.props[13];
        }
        function M(g, E, F) {
          return g * this.props[2] + E * this.props[6] + F * this.props[10] + this.props[14];
        }
        function w() {
          var g = this.props[0] * this.props[5] - this.props[1] * this.props[4], E = this.props[5] / g, F = -this.props[1] / g, k = -this.props[4] / g, L = this.props[0] / g, D = (this.props[4] * this.props[13] - this.props[5] * this.props[12]) / g, O = -(this.props[0] * this.props[13] - this.props[1] * this.props[12]) / g, j = new Matrix();
          return j.props[0] = E, j.props[1] = F, j.props[4] = k, j.props[5] = L, j.props[12] = D, j.props[13] = O, j;
        }
        function B(g) {
          var E = this.getInverseMatrix();
          return E.applyToPointArray(g[0], g[1], g[2] || 0);
        }
        function V(g) {
          var E, F = g.length, k = [];
          for (E = 0; E < F; E += 1)
            k[E] = B(g[E]);
          return k;
        }
        function I(g, E, F) {
          var k = createTypedArray("float32", 6);
          if (this.isIdentity())
            k[0] = g[0], k[1] = g[1], k[2] = E[0], k[3] = E[1], k[4] = F[0], k[5] = F[1];
          else {
            var L = this.props[0], D = this.props[1], O = this.props[4], j = this.props[5], q = this.props[12], Y = this.props[13];
            k[0] = g[0] * L + g[1] * O + q, k[1] = g[0] * D + g[1] * j + Y, k[2] = E[0] * L + E[1] * O + q, k[3] = E[0] * D + E[1] * j + Y, k[4] = F[0] * L + F[1] * O + q, k[5] = F[0] * D + F[1] * j + Y;
          }
          return k;
        }
        function N(g, E, F) {
          var k;
          return this.isIdentity() ? k = [g, E, F] : k = [g * this.props[0] + E * this.props[4] + F * this.props[8] + this.props[12], g * this.props[1] + E * this.props[5] + F * this.props[9] + this.props[13], g * this.props[2] + E * this.props[6] + F * this.props[10] + this.props[14]], k;
        }
        function G(g, E) {
          if (this.isIdentity())
            return g + "," + E;
          var F = this.props;
          return Math.round((g * F[0] + E * F[4] + F[12]) * 100) / 100 + "," + Math.round((g * F[1] + E * F[5] + F[13]) * 100) / 100;
        }
        function R() {
          for (var g = 0, E = this.props, F = "matrix3d(", k = 1e4; g < 16; )
            F += i(E[g] * k) / k, F += g === 15 ? ")" : ",", g += 1;
          return F;
        }
        function C(g) {
          var E = 1e4;
          return g < 1e-6 && g > 0 || g > -1e-6 && g < 0 ? i(g * E) / E : g;
        }
        function T() {
          var g = this.props, E = C(g[0]), F = C(g[1]), k = C(g[4]), L = C(g[5]), D = C(g[12]), O = C(g[13]);
          return "matrix(" + E + "," + F + "," + k + "," + L + "," + D + "," + O + ")";
        }
        return function() {
          this.reset = s, this.rotate = n, this.rotateX = a, this.rotateY = l, this.rotateZ = o, this.skew = u, this.skewFromAxis = S, this.shear = p, this.scale = f, this.setTransform = b, this.translate = v, this.transform = m, this.multiply = A, this.applyToPoint = P, this.applyToX = x, this.applyToY = _, this.applyToZ = M, this.applyToPointArray = N, this.applyToTriplePoints = I, this.applyToPointStringified = G, this.toCSS = R, this.to2dCSS = T, this.clone = h, this.cloneFromProps = y, this.equals = d, this.inversePoints = V, this.inversePoint = B, this.getInverseMatrix = w, this._t = this.transform, this.isIdentity = c, this._identity = !0, this._identityCalculated = !1, this.props = createTypedArray("float32", 16), this.reset();
        };
      })();
      function _typeof$3(t) {
        "@babel/helpers - typeof";
        return _typeof$3 = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
          return typeof e;
        } : function(e) {
          return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
        }, _typeof$3(t);
      }
      var lottie = {};
      function setLocation(t) {
        setLocationHref(t);
      }
      function searchAnimations() {
        animationManager.searchAnimations();
      }
      function setSubframeRendering(t) {
        setSubframeEnabled(t);
      }
      function setPrefix(t) {
        setIdPrefix(t);
      }
      function loadAnimation(t) {
        return animationManager.loadAnimation(t);
      }
      function setQuality(t) {
        if (typeof t == "string")
          switch (t) {
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
        else !isNaN(t) && t > 1 && setDefaultCurveSegments(t);
      }
      function inBrowser() {
        return typeof navigator < "u";
      }
      function installPlugin(t, e) {
        t === "expressions" && setExpressionsPlugin(e);
      }
      function getFactory(t) {
        switch (t) {
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
      function getQueryVariable(t) {
        for (var e = queryString.split("&"), r = 0; r < e.length; r += 1) {
          var i = e[r].split("=");
          if (decodeURIComponent(i[0]) == t)
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
      } catch (t) {
      }
      var ShapeModifiers = (function() {
        var t = {}, e = {};
        t.registerModifier = r, t.getModifier = i;
        function r(s, n) {
          e[s] || (e[s] = n);
        }
        function i(s, n, a) {
          return new e[s](n, a);
        }
        return t;
      })();
      function ShapeModifier() {
      }
      ShapeModifier.prototype.initModifierProperties = function() {
      }, ShapeModifier.prototype.addShapeToModifier = function() {
      }, ShapeModifier.prototype.addShape = function(t) {
        if (!this.closed) {
          t.sh.container.addDynamicProperty(t.sh);
          var e = {
            shape: t.sh,
            data: t,
            localShapeCollection: shapeCollectionPool.newShapeCollection()
          };
          this.shapes.push(e), this.addShapeToModifier(e), this._isAnimated && t.setAsAnimated();
        }
      }, ShapeModifier.prototype.init = function(t, e) {
        this.shapes = [], this.elem = t, this.initDynamicPropertyContainer(t), this.initModifierProperties(t, e), this.frameId = initialDefaultFrame, this.closed = !1, this.k = !1, this.dynamicProperties.length ? this.k = !0 : this.getValue(!0);
      }, ShapeModifier.prototype.processKeys = function() {
        this.elem.globalData.frameId !== this.frameId && (this.frameId = this.elem.globalData.frameId, this.iterateDynamicProperties());
      }, extendPrototype([DynamicPropertyContainer], ShapeModifier);
      function TrimModifier() {
      }
      extendPrototype([ShapeModifier], TrimModifier), TrimModifier.prototype.initModifierProperties = function(t, e) {
        this.s = PropertyFactory.getProp(t, e.s, 0, 0.01, this), this.e = PropertyFactory.getProp(t, e.e, 0, 0.01, this), this.o = PropertyFactory.getProp(t, e.o, 0, 0, this), this.sValue = 0, this.eValue = 0, this.getValue = this.processKeys, this.m = e.m, this._isAnimated = !!this.s.effectsSequence.length || !!this.e.effectsSequence.length || !!this.o.effectsSequence.length;
      }, TrimModifier.prototype.addShapeToModifier = function(t) {
        t.pathsData = [];
      }, TrimModifier.prototype.calculateShapeEdges = function(t, e, r, i, s) {
        var n = [];
        e <= 1 ? n.push({
          s: t,
          e
        }) : t >= 1 ? n.push({
          s: t - 1,
          e: e - 1
        }) : (n.push({
          s: t,
          e: 1
        }), n.push({
          s: 0,
          e: e - 1
        }));
        var a = [], l, o = n.length, p;
        for (l = 0; l < o; l += 1)
          if (p = n[l], !(p.e * s < i || p.s * s > i + r)) {
            var u, S;
            p.s * s <= i ? u = 0 : u = (p.s * s - i) / r, p.e * s >= i + r ? S = 1 : S = (p.e * s - i) / r, a.push([u, S]);
          }
        return a.length || a.push([0, 0]), a;
      }, TrimModifier.prototype.releasePathsData = function(t) {
        var e, r = t.length;
        for (e = 0; e < r; e += 1)
          segmentsLengthPool.release(t[e]);
        return t.length = 0, t;
      }, TrimModifier.prototype.processShapes = function(t) {
        var e, r;
        if (this._mdf || t) {
          var i = this.o.v % 360 / 360;
          if (i < 0 && (i += 1), this.s.v > 1 ? e = 1 + i : this.s.v < 0 ? e = 0 + i : e = this.s.v + i, this.e.v > 1 ? r = 1 + i : this.e.v < 0 ? r = 0 + i : r = this.e.v + i, e > r) {
            var s = e;
            e = r, r = s;
          }
          e = Math.round(e * 1e4) * 1e-4, r = Math.round(r * 1e4) * 1e-4, this.sValue = e, this.eValue = r;
        } else
          e = this.sValue, r = this.eValue;
        var n, a, l = this.shapes.length, o, p, u, S, f, b = 0;
        if (r === e)
          for (a = 0; a < l; a += 1)
            this.shapes[a].localShapeCollection.releaseShapes(), this.shapes[a].shape._mdf = !0, this.shapes[a].shape.paths = this.shapes[a].localShapeCollection, this._mdf && (this.shapes[a].pathsData.length = 0);
        else if (r === 1 && e === 0 || r === 0 && e === 1) {
          if (this._mdf)
            for (a = 0; a < l; a += 1)
              this.shapes[a].pathsData.length = 0, this.shapes[a].shape._mdf = !0;
        } else {
          var v = [], m, A;
          for (a = 0; a < l; a += 1)
            if (m = this.shapes[a], !m.shape._mdf && !this._mdf && !t && this.m !== 2)
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
          var c = e, d = r, h = 0, y;
          for (a = l - 1; a >= 0; a -= 1)
            if (m = this.shapes[a], m.shape._mdf) {
              for (A = m.localShapeCollection, A.releaseShapes(), this.m === 2 && l > 1 ? (y = this.calculateShapeEdges(e, r, m.totalShapeLength, h, b), h += m.totalShapeLength) : y = [[c, d]], p = y.length, o = 0; o < p; o += 1) {
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
                    var x = m.shape.paths.shapes[m.shape.paths._length - 1];
                    if (x.c) {
                      var _ = P.pop();
                      this.addPaths(P, A), P = this.addShapes(m, v[1], _);
                    } else
                      this.addPaths(P, A), P = this.addShapes(m, v[1]);
                  }
                  this.addPaths(P, A);
                }
              }
              m.shape.paths = A;
            }
        }
      }, TrimModifier.prototype.addPaths = function(t, e) {
        var r, i = t.length;
        for (r = 0; r < i; r += 1)
          e.addShape(t[r]);
      }, TrimModifier.prototype.addSegment = function(t, e, r, i, s, n, a) {
        s.setXYAt(e[0], e[1], "o", n), s.setXYAt(r[0], r[1], "i", n + 1), a && s.setXYAt(t[0], t[1], "v", n), s.setXYAt(i[0], i[1], "v", n + 1);
      }, TrimModifier.prototype.addSegmentFromArray = function(t, e, r, i) {
        e.setXYAt(t[1], t[5], "o", r), e.setXYAt(t[2], t[6], "i", r + 1), i && e.setXYAt(t[0], t[4], "v", r), e.setXYAt(t[3], t[7], "v", r + 1);
      }, TrimModifier.prototype.addShapes = function(t, e, r) {
        var i = t.pathsData, s = t.shape.paths.shapes, n, a = t.shape.paths._length, l, o, p = 0, u, S, f, b, v = [], m, A = !0;
        for (r ? (S = r._length, m = r._length) : (r = shapePool.newElement(), S = 0, m = 0), v.push(r), n = 0; n < a; n += 1) {
          for (f = i[n].lengths, r.c = s[n].c, o = s[n].c ? f.length : f.length + 1, l = 1; l < o; l += 1)
            if (u = f[l - 1], p + u.addedLength < e.s)
              p += u.addedLength, r.c = !1;
            else if (p > e.e) {
              r.c = !1;
              break;
            } else
              e.s <= p && e.e >= p + u.addedLength ? (this.addSegment(s[n].v[l - 1], s[n].o[l - 1], s[n].i[l], s[n].v[l], r, S, A), A = !1) : (b = bez.getNewSegment(s[n].v[l - 1], s[n].v[l], s[n].o[l - 1], s[n].i[l], (e.s - p) / u.addedLength, (e.e - p) / u.addedLength, f[l - 1]), this.addSegmentFromArray(b, r, S, A), A = !1, r.c = !1), p += u.addedLength, S += 1;
          if (s[n].c && f.length) {
            if (u = f[l - 1], p <= e.e) {
              var c = f[l - 1].addedLength;
              e.s <= p && e.e >= p + c ? (this.addSegment(s[n].v[l - 1], s[n].o[l - 1], s[n].i[0], s[n].v[0], r, S, A), A = !1) : (b = bez.getNewSegment(s[n].v[l - 1], s[n].v[0], s[n].o[l - 1], s[n].i[0], (e.s - p) / c, (e.e - p) / c, f[l - 1]), this.addSegmentFromArray(b, r, S, A), A = !1, r.c = !1);
            } else
              r.c = !1;
            p += u.addedLength, S += 1;
          }
          if (r._length && (r.setXYAt(r.v[m][0], r.v[m][1], "i", m), r.setXYAt(r.v[r._length - 1][0], r.v[r._length - 1][1], "o", r._length - 1)), p > e.e)
            break;
          n < a - 1 && (r = shapePool.newElement(), A = !0, v.push(r), S = 0);
        }
        return v;
      };
      function PuckerAndBloatModifier() {
      }
      extendPrototype([ShapeModifier], PuckerAndBloatModifier), PuckerAndBloatModifier.prototype.initModifierProperties = function(t, e) {
        this.getValue = this.processKeys, this.amount = PropertyFactory.getProp(t, e.a, 0, null, this), this._isAnimated = !!this.amount.effectsSequence.length;
      }, PuckerAndBloatModifier.prototype.processPath = function(t, e) {
        var r = e / 100, i = [0, 0], s = t._length, n = 0;
        for (n = 0; n < s; n += 1)
          i[0] += t.v[n][0], i[1] += t.v[n][1];
        i[0] /= s, i[1] /= s;
        var a = shapePool.newElement();
        a.c = t.c;
        var l, o, p, u, S, f;
        for (n = 0; n < s; n += 1)
          l = t.v[n][0] + (i[0] - t.v[n][0]) * r, o = t.v[n][1] + (i[1] - t.v[n][1]) * r, p = t.o[n][0] + (i[0] - t.o[n][0]) * -r, u = t.o[n][1] + (i[1] - t.o[n][1]) * -r, S = t.i[n][0] + (i[0] - t.i[n][0]) * -r, f = t.i[n][1] + (i[1] - t.i[n][1]) * -r, a.setTripleAt(l, o, p, u, S, f, n);
        return a;
      }, PuckerAndBloatModifier.prototype.processShapes = function(t) {
        var e, r, i = this.shapes.length, s, n, a = this.amount.v;
        if (a !== 0) {
          var l, o;
          for (r = 0; r < i; r += 1) {
            if (l = this.shapes[r], o = l.localShapeCollection, !(!l.shape._mdf && !this._mdf && !t))
              for (o.releaseShapes(), l.shape._mdf = !0, e = l.shape.paths.shapes, n = l.shape.paths._length, s = 0; s < n; s += 1)
                o.addShape(this.processPath(e[s], a));
            l.shape.paths = l.localShapeCollection;
          }
        }
        this.dynamicProperties.length || (this._mdf = !1);
      };
      var TransformPropertyFactory = (function() {
        var t = [0, 0];
        function e(o) {
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
                  S = t, u = S;
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
          applyToMatrix: e,
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
      extendPrototype([ShapeModifier], RepeaterModifier), RepeaterModifier.prototype.initModifierProperties = function(t, e) {
        this.getValue = this.processKeys, this.c = PropertyFactory.getProp(t, e.c, 0, null, this), this.o = PropertyFactory.getProp(t, e.o, 0, null, this), this.tr = TransformPropertyFactory.getTransformProperty(t, e.tr, this), this.so = PropertyFactory.getProp(t, e.tr.so, 0, 0.01, this), this.eo = PropertyFactory.getProp(t, e.tr.eo, 0, 0.01, this), this.data = e, this.dynamicProperties.length || this.getValue(!0), this._isAnimated = !!this.dynamicProperties.length, this.pMatrix = new Matrix(), this.rMatrix = new Matrix(), this.sMatrix = new Matrix(), this.tMatrix = new Matrix(), this.matrix = new Matrix();
      }, RepeaterModifier.prototype.applyTransforms = function(t, e, r, i, s, n) {
        var a = n ? -1 : 1, l = i.s.v[0] + (1 - i.s.v[0]) * (1 - s), o = i.s.v[1] + (1 - i.s.v[1]) * (1 - s);
        t.translate(i.p.v[0] * a * s, i.p.v[1] * a * s, i.p.v[2]), e.translate(-i.a.v[0], -i.a.v[1], i.a.v[2]), e.rotate(-i.r.v * a * s), e.translate(i.a.v[0], i.a.v[1], i.a.v[2]), r.translate(-i.a.v[0], -i.a.v[1], i.a.v[2]), r.scale(n ? 1 / l : l, n ? 1 / o : o), r.translate(i.a.v[0], i.a.v[1], i.a.v[2]);
      }, RepeaterModifier.prototype.init = function(t, e, r, i) {
        for (this.elem = t, this.arr = e, this.pos = r, this.elemsData = i, this._currentCopies = 0, this._elements = [], this._groups = [], this.frameId = -1, this.initDynamicPropertyContainer(t), this.initModifierProperties(t, e[r]); r > 0; )
          r -= 1, this._elements.unshift(e[r]);
        this.dynamicProperties.length ? this.k = !0 : this.getValue(!0);
      }, RepeaterModifier.prototype.resetElements = function(t) {
        var e, r = t.length;
        for (e = 0; e < r; e += 1)
          t[e]._processed = !1, t[e].ty === "gr" && this.resetElements(t[e].it);
      }, RepeaterModifier.prototype.cloneElements = function(t) {
        var e = JSON.parse(JSON.stringify(t));
        return this.resetElements(e), e;
      }, RepeaterModifier.prototype.changeGroupRender = function(t, e) {
        var r, i = t.length;
        for (r = 0; r < i; r += 1)
          t[r]._render = e, t[r].ty === "gr" && this.changeGroupRender(t[r].it, e);
      }, RepeaterModifier.prototype.processShapes = function(t) {
        var e, r, i, s, n, a = !1;
        if (this._mdf || t) {
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
          var f = this.o.v, b = f % 1, v = f > 0 ? Math.floor(f) : Math.ceil(f), m = this.pMatrix.props, A = this.rMatrix.props, c = this.sMatrix.props;
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
            if (e = this.elemsData[i].it, r = e[e.length - 1].transform.mProps.v.props, y = r.length, e[e.length - 1].transform.mProps._mdf = !0, e[e.length - 1].transform.op._mdf = !0, e[e.length - 1].transform.op.v = this._currentCopies === 1 ? this.so.v : this.so.v + (this.eo.v - this.so.v) * (i / (this._currentCopies - 1)), d !== 0) {
              for ((i !== 0 && s === 1 || i !== this._currentCopies - 1 && s === -1) && this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, 1, !1), this.matrix.transform(A[0], A[1], A[2], A[3], A[4], A[5], A[6], A[7], A[8], A[9], A[10], A[11], A[12], A[13], A[14], A[15]), this.matrix.transform(c[0], c[1], c[2], c[3], c[4], c[5], c[6], c[7], c[8], c[9], c[10], c[11], c[12], c[13], c[14], c[15]), this.matrix.transform(m[0], m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8], m[9], m[10], m[11], m[12], m[13], m[14], m[15]), h = 0; h < y; h += 1)
                r[h] = this.matrix.props[h];
              this.matrix.reset();
            } else
              for (this.matrix.reset(), h = 0; h < y; h += 1)
                r[h] = this.matrix.props[h];
            d += 1, n -= 1, i += s;
          }
        } else
          for (n = this._currentCopies, i = 0, s = 1; n; )
            e = this.elemsData[i].it, r = e[e.length - 1].transform.mProps.v.props, e[e.length - 1].transform.mProps._mdf = !1, e[e.length - 1].transform.op._mdf = !1, n -= 1, i += s;
        return a;
      }, RepeaterModifier.prototype.addShape = function() {
      };
      function RoundCornersModifier() {
      }
      extendPrototype([ShapeModifier], RoundCornersModifier), RoundCornersModifier.prototype.initModifierProperties = function(t, e) {
        this.getValue = this.processKeys, this.rd = PropertyFactory.getProp(t, e.r, 0, null, this), this._isAnimated = !!this.rd.effectsSequence.length;
      }, RoundCornersModifier.prototype.processPath = function(t, e) {
        var r = shapePool.newElement();
        r.c = t.c;
        var i, s = t._length, n, a, l, o, p, u, S = 0, f, b, v, m, A, c;
        for (i = 0; i < s; i += 1)
          n = t.v[i], l = t.o[i], a = t.i[i], n[0] === l[0] && n[1] === l[1] && n[0] === a[0] && n[1] === a[1] ? (i === 0 || i === s - 1) && !t.c ? (r.setTripleAt(n[0], n[1], l[0], l[1], a[0], a[1], S), S += 1) : (i === 0 ? o = t.v[s - 1] : o = t.v[i - 1], p = Math.sqrt(Math.pow(n[0] - o[0], 2) + Math.pow(n[1] - o[1], 2)), u = p ? Math.min(p / 2, e) / p : 0, A = n[0] + (o[0] - n[0]) * u, f = A, c = n[1] - (n[1] - o[1]) * u, b = c, v = f - (f - n[0]) * roundCorner, m = b - (b - n[1]) * roundCorner, r.setTripleAt(f, b, v, m, A, c, S), S += 1, i === s - 1 ? o = t.v[0] : o = t.v[i + 1], p = Math.sqrt(Math.pow(n[0] - o[0], 2) + Math.pow(n[1] - o[1], 2)), u = p ? Math.min(p / 2, e) / p : 0, v = n[0] + (o[0] - n[0]) * u, f = v, m = n[1] + (o[1] - n[1]) * u, b = m, A = f - (f - n[0]) * roundCorner, c = b - (b - n[1]) * roundCorner, r.setTripleAt(f, b, v, m, A, c, S), S += 1) : (r.setTripleAt(t.v[i][0], t.v[i][1], t.o[i][0], t.o[i][1], t.i[i][0], t.i[i][1], S), S += 1);
        return r;
      }, RoundCornersModifier.prototype.processShapes = function(t) {
        var e, r, i = this.shapes.length, s, n, a = this.rd.v;
        if (a !== 0) {
          var l, o;
          for (r = 0; r < i; r += 1) {
            if (l = this.shapes[r], o = l.localShapeCollection, !(!l.shape._mdf && !this._mdf && !t))
              for (o.releaseShapes(), l.shape._mdf = !0, e = l.shape.paths.shapes, n = l.shape.paths._length, s = 0; s < n; s += 1)
                o.addShape(this.processPath(e[s], a));
            l.shape.paths = l.localShapeCollection;
          }
        }
        this.dynamicProperties.length || (this._mdf = !1);
      };
      function floatEqual(t, e) {
        return Math.abs(t - e) * 1e5 <= Math.min(Math.abs(t), Math.abs(e));
      }
      function floatZero(t) {
        return Math.abs(t) <= 1e-5;
      }
      function lerp(t, e, r) {
        return t * (1 - r) + e * r;
      }
      function lerpPoint(t, e, r) {
        return [lerp(t[0], e[0], r), lerp(t[1], e[1], r)];
      }
      function quadRoots(t, e, r) {
        if (t === 0) return [];
        var i = e * e - 4 * t * r;
        if (i < 0) return [];
        var s = -e / (2 * t);
        if (i === 0) return [s];
        var n = Math.sqrt(i) / (2 * t);
        return [s - n, s + n];
      }
      function polynomialCoefficients(t, e, r, i) {
        return [-t + 3 * e - 3 * r + i, 3 * t - 6 * e + 3 * r, -3 * t + 3 * e, t];
      }
      function singlePoint(t) {
        return new PolynomialBezier(t, t, t, t, !1);
      }
      function PolynomialBezier(t, e, r, i, s) {
        s && pointEqual(t, e) && (e = lerpPoint(t, i, 1 / 3)), s && pointEqual(r, i) && (r = lerpPoint(t, i, 2 / 3));
        var n = polynomialCoefficients(t[0], e[0], r[0], i[0]), a = polynomialCoefficients(t[1], e[1], r[1], i[1]);
        this.a = [n[0], a[0]], this.b = [n[1], a[1]], this.c = [n[2], a[2]], this.d = [n[3], a[3]], this.points = [t, e, r, i];
      }
      PolynomialBezier.prototype.point = function(t) {
        return [((this.a[0] * t + this.b[0]) * t + this.c[0]) * t + this.d[0], ((this.a[1] * t + this.b[1]) * t + this.c[1]) * t + this.d[1]];
      }, PolynomialBezier.prototype.derivative = function(t) {
        return [(3 * t * this.a[0] + 2 * this.b[0]) * t + this.c[0], (3 * t * this.a[1] + 2 * this.b[1]) * t + this.c[1]];
      }, PolynomialBezier.prototype.tangentAngle = function(t) {
        var e = this.derivative(t);
        return Math.atan2(e[1], e[0]);
      }, PolynomialBezier.prototype.normalAngle = function(t) {
        var e = this.derivative(t);
        return Math.atan2(e[0], e[1]);
      }, PolynomialBezier.prototype.inflectionPoints = function() {
        var t = this.a[1] * this.b[0] - this.a[0] * this.b[1];
        if (floatZero(t)) return [];
        var e = -0.5 * (this.a[1] * this.c[0] - this.a[0] * this.c[1]) / t, r = e * e - 1 / 3 * (this.b[1] * this.c[0] - this.b[0] * this.c[1]) / t;
        if (r < 0) return [];
        var i = Math.sqrt(r);
        return floatZero(i) ? i > 0 && i < 1 ? [e] : [] : [e - i, e + i].filter(function(s) {
          return s > 0 && s < 1;
        });
      }, PolynomialBezier.prototype.split = function(t) {
        if (t <= 0) return [singlePoint(this.points[0]), this];
        if (t >= 1) return [this, singlePoint(this.points[this.points.length - 1])];
        var e = lerpPoint(this.points[0], this.points[1], t), r = lerpPoint(this.points[1], this.points[2], t), i = lerpPoint(this.points[2], this.points[3], t), s = lerpPoint(e, r, t), n = lerpPoint(r, i, t), a = lerpPoint(s, n, t);
        return [new PolynomialBezier(this.points[0], e, s, a, !0), new PolynomialBezier(a, n, i, this.points[3], !0)];
      };
      function extrema(t, e) {
        var r = t.points[0][e], i = t.points[t.points.length - 1][e];
        if (r > i) {
          var s = i;
          i = r, r = s;
        }
        for (var n = quadRoots(3 * t.a[e], 2 * t.b[e], t.c[e]), a = 0; a < n.length; a += 1)
          if (n[a] > 0 && n[a] < 1) {
            var l = t.point(n[a])[e];
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
        var t = this.bounds();
        return {
          left: t.x.min,
          right: t.x.max,
          top: t.y.min,
          bottom: t.y.max,
          width: t.x.max - t.x.min,
          height: t.y.max - t.y.min,
          cx: (t.x.max + t.x.min) / 2,
          cy: (t.y.max + t.y.min) / 2
        };
      };
      function intersectData(t, e, r) {
        var i = t.boundingBox();
        return {
          cx: i.cx,
          cy: i.cy,
          width: i.width,
          height: i.height,
          bez: t,
          t: (e + r) / 2,
          t1: e,
          t2: r
        };
      }
      function splitData(t) {
        var e = t.bez.split(0.5);
        return [intersectData(e[0], t.t1, t.t), intersectData(e[1], t.t, t.t2)];
      }
      function boxIntersect(t, e) {
        return Math.abs(t.cx - e.cx) * 2 < t.width + e.width && Math.abs(t.cy - e.cy) * 2 < t.height + e.height;
      }
      function intersectsImpl(t, e, r, i, s, n) {
        if (boxIntersect(t, e)) {
          if (r >= n || t.width <= i && t.height <= i && e.width <= i && e.height <= i) {
            s.push([t.t, e.t]);
            return;
          }
          var a = splitData(t), l = splitData(e);
          intersectsImpl(a[0], l[0], r + 1, i, s, n), intersectsImpl(a[0], l[1], r + 1, i, s, n), intersectsImpl(a[1], l[0], r + 1, i, s, n), intersectsImpl(a[1], l[1], r + 1, i, s, n);
        }
      }
      PolynomialBezier.prototype.intersections = function(t, e, r) {
        e === void 0 && (e = 2), r === void 0 && (r = 7);
        var i = [];
        return intersectsImpl(intersectData(this, 0, 1), intersectData(t, 0, 1), 0, e, i, r), i;
      }, PolynomialBezier.shapeSegment = function(t, e) {
        var r = (e + 1) % t.length();
        return new PolynomialBezier(t.v[e], t.o[e], t.i[r], t.v[r], !0);
      }, PolynomialBezier.shapeSegmentInverted = function(t, e) {
        var r = (e + 1) % t.length();
        return new PolynomialBezier(t.v[r], t.i[r], t.o[e], t.v[e], !0);
      };
      function crossProduct(t, e) {
        return [t[1] * e[2] - t[2] * e[1], t[2] * e[0] - t[0] * e[2], t[0] * e[1] - t[1] * e[0]];
      }
      function lineIntersection(t, e, r, i) {
        var s = [t[0], t[1], 1], n = [e[0], e[1], 1], a = [r[0], r[1], 1], l = [i[0], i[1], 1], o = crossProduct(crossProduct(s, n), crossProduct(a, l));
        return floatZero(o[2]) ? null : [o[0] / o[2], o[1] / o[2]];
      }
      function polarOffset(t, e, r) {
        return [t[0] + Math.cos(e) * r, t[1] - Math.sin(e) * r];
      }
      function pointDistance(t, e) {
        return Math.hypot(t[0] - e[0], t[1] - e[1]);
      }
      function pointEqual(t, e) {
        return floatEqual(t[0], e[0]) && floatEqual(t[1], e[1]);
      }
      function ZigZagModifier() {
      }
      extendPrototype([ShapeModifier], ZigZagModifier), ZigZagModifier.prototype.initModifierProperties = function(t, e) {
        this.getValue = this.processKeys, this.amplitude = PropertyFactory.getProp(t, e.s, 0, null, this), this.frequency = PropertyFactory.getProp(t, e.r, 0, null, this), this.pointsType = PropertyFactory.getProp(t, e.pt, 0, null, this), this._isAnimated = this.amplitude.effectsSequence.length !== 0 || this.frequency.effectsSequence.length !== 0 || this.pointsType.effectsSequence.length !== 0;
      };
      function setPoint(t, e, r, i, s, n, a) {
        var l = r - Math.PI / 2, o = r + Math.PI / 2, p = e[0] + Math.cos(r) * i * s, u = e[1] - Math.sin(r) * i * s;
        t.setTripleAt(p, u, p + Math.cos(l) * n, u - Math.sin(l) * n, p + Math.cos(o) * a, u - Math.sin(o) * a, t.length());
      }
      function getPerpendicularVector(t, e) {
        var r = [e[0] - t[0], e[1] - t[1]], i = -Math.PI * 0.5, s = [Math.cos(i) * r[0] - Math.sin(i) * r[1], Math.sin(i) * r[0] + Math.cos(i) * r[1]];
        return s;
      }
      function getProjectingAngle(t, e) {
        var r = e === 0 ? t.length() - 1 : e - 1, i = (e + 1) % t.length(), s = t.v[r], n = t.v[i], a = getPerpendicularVector(s, n);
        return Math.atan2(0, 1) - Math.atan2(a[1], a[0]);
      }
      function zigZagCorner(t, e, r, i, s, n, a) {
        var l = getProjectingAngle(e, r), o = e.v[r % e._length], p = e.v[r === 0 ? e._length - 1 : r - 1], u = e.v[(r + 1) % e._length], S = n === 2 ? Math.sqrt(Math.pow(o[0] - p[0], 2) + Math.pow(o[1] - p[1], 2)) : 0, f = n === 2 ? Math.sqrt(Math.pow(o[0] - u[0], 2) + Math.pow(o[1] - u[1], 2)) : 0;
        setPoint(t, e.v[r % e._length], l, a, i, f / ((s + 1) * 2), S / ((s + 1) * 2));
      }
      function zigZagSegment(t, e, r, i, s, n) {
        for (var a = 0; a < i; a += 1) {
          var l = (a + 1) / (i + 1), o = s === 2 ? Math.sqrt(Math.pow(e.points[3][0] - e.points[0][0], 2) + Math.pow(e.points[3][1] - e.points[0][1], 2)) : 0, p = e.normalAngle(l), u = e.point(l);
          setPoint(t, u, p, n, r, o / ((i + 1) * 2), o / ((i + 1) * 2)), n = -n;
        }
        return n;
      }
      ZigZagModifier.prototype.processPath = function(t, e, r, i) {
        var s = t._length, n = shapePool.newElement();
        if (n.c = t.c, t.c || (s -= 1), s === 0) return n;
        var a = -1, l = PolynomialBezier.shapeSegment(t, 0);
        zigZagCorner(n, t, 0, e, r, i, a);
        for (var o = 0; o < s; o += 1)
          a = zigZagSegment(n, l, e, r, i, -a), o === s - 1 && !t.c ? l = null : l = PolynomialBezier.shapeSegment(t, (o + 1) % s), zigZagCorner(n, t, o + 1, e, r, i, a);
        return n;
      }, ZigZagModifier.prototype.processShapes = function(t) {
        var e, r, i = this.shapes.length, s, n, a = this.amplitude.v, l = Math.max(0, Math.round(this.frequency.v)), o = this.pointsType.v;
        if (a !== 0) {
          var p, u;
          for (r = 0; r < i; r += 1) {
            if (p = this.shapes[r], u = p.localShapeCollection, !(!p.shape._mdf && !this._mdf && !t))
              for (u.releaseShapes(), p.shape._mdf = !0, e = p.shape.paths.shapes, n = p.shape.paths._length, s = 0; s < n; s += 1)
                u.addShape(this.processPath(e[s], a, l, o));
            p.shape.paths = p.localShapeCollection;
          }
        }
        this.dynamicProperties.length || (this._mdf = !1);
      };
      function linearOffset(t, e, r) {
        var i = Math.atan2(e[0] - t[0], e[1] - t[1]);
        return [polarOffset(t, i, r), polarOffset(e, i, r)];
      }
      function offsetSegment(t, e) {
        var r, i, s, n, a, l, o;
        o = linearOffset(t.points[0], t.points[1], e), r = o[0], i = o[1], o = linearOffset(t.points[1], t.points[2], e), s = o[0], n = o[1], o = linearOffset(t.points[2], t.points[3], e), a = o[0], l = o[1];
        var p = lineIntersection(r, i, s, n);
        p === null && (p = i);
        var u = lineIntersection(a, l, s, n);
        return u === null && (u = a), new PolynomialBezier(r, p, u, l);
      }
      function joinLines(t, e, r, i, s) {
        var n = e.points[3], a = r.points[0];
        if (i === 3 || pointEqual(n, a)) return n;
        if (i === 2) {
          var l = -e.tangentAngle(1), o = -r.tangentAngle(0) + Math.PI, p = lineIntersection(n, polarOffset(n, l + Math.PI / 2, 100), a, polarOffset(a, l + Math.PI / 2, 100)), u = p ? pointDistance(p, n) : pointDistance(n, a) / 2, S = polarOffset(n, l, 2 * u * roundCorner);
          return t.setXYAt(S[0], S[1], "o", t.length() - 1), S = polarOffset(a, o, 2 * u * roundCorner), t.setTripleAt(a[0], a[1], a[0], a[1], S[0], S[1], t.length()), a;
        }
        var f = pointEqual(n, e.points[2]) ? e.points[0] : e.points[2], b = pointEqual(a, r.points[1]) ? r.points[3] : r.points[1], v = lineIntersection(f, n, a, b);
        return v && pointDistance(v, n) < s ? (t.setTripleAt(v[0], v[1], v[0], v[1], v[0], v[1], t.length()), v) : n;
      }
      function getIntersection(t, e) {
        var r = t.intersections(e);
        return r.length && floatEqual(r[0][0], 1) && r.shift(), r.length ? r[0] : null;
      }
      function pruneSegmentIntersection(t, e) {
        var r = t.slice(), i = e.slice(), s = getIntersection(t[t.length - 1], e[0]);
        return s && (r[t.length - 1] = t[t.length - 1].split(s[0])[0], i[0] = e[0].split(s[1])[1]), t.length > 1 && e.length > 1 && (s = getIntersection(t[0], e[e.length - 1]), s) ? [[t[0].split(s[0])[0]], [e[e.length - 1].split(s[1])[1]]] : [r, i];
      }
      function pruneIntersections(t) {
        for (var e, r = 1; r < t.length; r += 1)
          e = pruneSegmentIntersection(t[r - 1], t[r]), t[r - 1] = e[0], t[r] = e[1];
        return t.length > 1 && (e = pruneSegmentIntersection(t[t.length - 1], t[0]), t[t.length - 1] = e[0], t[0] = e[1]), t;
      }
      function offsetSegmentSplit(t, e) {
        var r = t.inflectionPoints(), i, s, n, a;
        if (r.length === 0)
          return [offsetSegment(t, e)];
        if (r.length === 1 || floatEqual(r[1], 1))
          return n = t.split(r[0]), i = n[0], s = n[1], [offsetSegment(i, e), offsetSegment(s, e)];
        n = t.split(r[0]), i = n[0];
        var l = (r[1] - r[0]) / (1 - r[0]);
        return n = n[1].split(l), a = n[0], s = n[1], [offsetSegment(i, e), offsetSegment(a, e), offsetSegment(s, e)];
      }
      function OffsetPathModifier() {
      }
      extendPrototype([ShapeModifier], OffsetPathModifier), OffsetPathModifier.prototype.initModifierProperties = function(t, e) {
        this.getValue = this.processKeys, this.amount = PropertyFactory.getProp(t, e.a, 0, null, this), this.miterLimit = PropertyFactory.getProp(t, e.ml, 0, null, this), this.lineJoin = e.lj, this._isAnimated = this.amount.effectsSequence.length !== 0;
      }, OffsetPathModifier.prototype.processPath = function(t, e, r, i) {
        var s = shapePool.newElement();
        s.c = t.c;
        var n = t.length();
        t.c || (n -= 1);
        var a, l, o, p = [];
        for (a = 0; a < n; a += 1)
          o = PolynomialBezier.shapeSegment(t, a), p.push(offsetSegmentSplit(o, e));
        if (!t.c)
          for (a = n - 1; a >= 0; a -= 1)
            o = PolynomialBezier.shapeSegmentInverted(t, a), p.push(offsetSegmentSplit(o, e));
        p = pruneIntersections(p);
        var u = null, S = null;
        for (a = 0; a < p.length; a += 1) {
          var f = p[a];
          for (S && (u = joinLines(s, S, f[0], r, i)), S = f[f.length - 1], l = 0; l < f.length; l += 1)
            o = f[l], u && pointEqual(o.points[0], u) ? s.setXYAt(o.points[1][0], o.points[1][1], "o", s.length() - 1) : s.setTripleAt(o.points[0][0], o.points[0][1], o.points[1][0], o.points[1][1], o.points[0][0], o.points[0][1], s.length()), s.setTripleAt(o.points[3][0], o.points[3][1], o.points[3][0], o.points[3][1], o.points[2][0], o.points[2][1], s.length()), u = o.points[3];
        }
        return p.length && joinLines(s, S, p[0][0], r, i), s;
      }, OffsetPathModifier.prototype.processShapes = function(t) {
        var e, r, i = this.shapes.length, s, n, a = this.amount.v, l = this.miterLimit.v, o = this.lineJoin;
        if (a !== 0) {
          var p, u;
          for (r = 0; r < i; r += 1) {
            if (p = this.shapes[r], u = p.localShapeCollection, !(!p.shape._mdf && !this._mdf && !t))
              for (u.releaseShapes(), p.shape._mdf = !0, e = p.shape.paths.shapes, n = p.shape.paths._length, s = 0; s < n; s += 1)
                u.addShape(this.processPath(e[s], a, o, l));
            p.shape.paths = p.localShapeCollection;
          }
        }
        this.dynamicProperties.length || (this._mdf = !1);
      };
      function getFontProperties(t) {
        for (var e = t.fStyle ? t.fStyle.split(" ") : [], r = "normal", i = "normal", s = e.length, n, a = 0; a < s; a += 1)
          switch (n = e[a].toLowerCase(), n) {
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
          weight: t.fWeight || r
        };
      }
      var FontManager = (function() {
        var t = 5e3, e = {
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
          F !== 0 && Date.now() - this.initTime < t ? setTimeout(this.checkLoadedFontsBinded, 20) : setTimeout(this.setIsLoadedBinded, 10);
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
          function D(O) {
            return g === "svg" ? (E.textContent = O, E.getComputedTextLength()) : E.measureText(O).width;
          }
          return {
            measureText: D
          };
        }
        function A(C, T) {
          if (!C) {
            this.isLoaded = !0;
            return;
          }
          if (this.chars) {
            this.isLoaded = !0, this.fonts = C.list;
            return;
          }
          if (!document.body) {
            this.isLoaded = !0, C.list.forEach(function(X) {
              X.helper = m(X), X.cache = {};
            }), this.fonts = C.list;
            return;
          }
          var g = C.list, E, F = g.length, k = F;
          for (E = 0; E < F; E += 1) {
            var L = !0, D, O;
            if (g[E].loaded = !1, g[E].monoCase = b(g[E].fFamily, "monospace"), g[E].sansCase = b(g[E].fFamily, "sans-serif"), !g[E].fPath)
              g[E].loaded = !0, k -= 1;
            else if (g[E].fOrigin === "p" || g[E].origin === 3) {
              if (D = document.querySelectorAll('style[f-forigin="p"][f-family="' + g[E].fFamily + '"], style[f-origin="3"][f-family="' + g[E].fFamily + '"]'), D.length > 0 && (L = !1), L) {
                var j = createTag("style");
                j.setAttribute("f-forigin", g[E].fOrigin), j.setAttribute("f-origin", g[E].origin), j.setAttribute("f-family", g[E].fFamily), j.type = "text/css", j.innerText = "@font-face {font-family: " + g[E].fFamily + "; font-style: normal; src: url('" + g[E].fPath + "');}", T.appendChild(j);
              }
            } else if (g[E].fOrigin === "g" || g[E].origin === 1) {
              for (D = document.querySelectorAll('link[f-forigin="g"], link[f-origin="1"]'), O = 0; O < D.length; O += 1)
                D[O].href.indexOf(g[E].fPath) !== -1 && (L = !1);
              if (L) {
                var q = createTag("link");
                q.setAttribute("f-forigin", g[E].fOrigin), q.setAttribute("f-origin", g[E].origin), q.type = "text/css", q.rel = "stylesheet", q.href = g[E].fPath, document.body.appendChild(q);
              }
            } else if (g[E].fOrigin === "t" || g[E].origin === 2) {
              for (D = document.querySelectorAll('script[f-forigin="t"], script[f-origin="2"]'), O = 0; O < D.length; O += 1)
                g[E].fPath === D[O].src && (L = !1);
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
          return (typeof C == "string" && C.charCodeAt(0) !== 13 || !C) && console && console.warn && !this._warned && (this._warned = !0, console.warn("Missing character from exported characters list: ", C, T, g)), e;
        }
        function h(C, T, g) {
          var E = this.getFontByName(T), F = C;
          if (!E.cache[F]) {
            var k = E.helper;
            if (C === " ") {
              var L = k.measureText("|" + C + "|"), D = k.measureText("||");
              E.cache[F] = (L - D) / 100;
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
        function x(C, T) {
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
        function B(C) {
          return w(C.substr(0, 2)) && w(C.substr(2, 2));
        }
        function V(C) {
          return r.indexOf(C) !== -1;
        }
        function I(C, T) {
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
        function N() {
          this.isLoaded = !0;
        }
        var G = function() {
          this.fonts = [], this.chars = null, this.typekitLoaded = 0, this.isLoaded = !1, this._warned = !1, this.initTime = Date.now(), this.setIsLoadedBinded = this.setIsLoaded.bind(this), this.checkLoadedFontsBinded = this.checkLoadedFonts.bind(this);
        };
        G.isModifier = x, G.isZeroWidthJoiner = _, G.isFlagEmoji = B, G.isRegionalCode = w, G.isCombinedCharacter = V, G.isRegionalFlag = I, G.isVariationSelector = M, G.BLACK_FLAG_CODE_POINT = i;
        var R = {
          addChars: c,
          addFonts: A,
          getCharData: d,
          getFontByName: y,
          measureText: h,
          checkLoadedFonts: v,
          setIsLoaded: N
        };
        return G.prototype = R, G;
      })();
      function SlotManager(t) {
        this.animationData = t;
      }
      SlotManager.prototype.getProp = function(t) {
        return this.animationData.slots && this.animationData.slots[t.sid] ? Object.assign(t, this.animationData.slots[t.sid].p) : t;
      };
      function slotFactory(t) {
        return new SlotManager(t);
      }
      function RenderableElement() {
      }
      RenderableElement.prototype = {
        initRenderable: function() {
          this.isInRange = !1, this.hidden = !1, this.isTransparent = !1, this.renderableComponents = [];
        },
        addRenderableComponent: function(e) {
          this.renderableComponents.indexOf(e) === -1 && this.renderableComponents.push(e);
        },
        removeRenderableComponent: function(e) {
          this.renderableComponents.indexOf(e) !== -1 && this.renderableComponents.splice(this.renderableComponents.indexOf(e), 1);
        },
        prepareRenderableFrame: function(e) {
          this.checkLayerLimits(e);
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
        checkLayerLimits: function(e) {
          this.data.ip - this.data.st <= e && this.data.op - this.data.st > e ? this.isInRange !== !0 && (this.globalData._mdf = !0, this._mdf = !0, this.isInRange = !0, this.show()) : this.isInRange !== !1 && (this.globalData._mdf = !0, this.isInRange = !1, this.hide());
        },
        renderRenderable: function() {
          var e, r = this.renderableComponents.length;
          for (e = 0; e < r; e += 1)
            this.renderableComponents[e].renderFrame(this._isFirstFrame);
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
        var t = {
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
        return function(e) {
          return t[e] || "";
        };
      })();
      function SliderEffect(t, e, r) {
        this.p = PropertyFactory.getProp(e, t.v, 0, 0, r);
      }
      function AngleEffect(t, e, r) {
        this.p = PropertyFactory.getProp(e, t.v, 0, 0, r);
      }
      function ColorEffect(t, e, r) {
        this.p = PropertyFactory.getProp(e, t.v, 1, 0, r);
      }
      function PointEffect(t, e, r) {
        this.p = PropertyFactory.getProp(e, t.v, 1, 0, r);
      }
      function LayerIndexEffect(t, e, r) {
        this.p = PropertyFactory.getProp(e, t.v, 0, 0, r);
      }
      function MaskIndexEffect(t, e, r) {
        this.p = PropertyFactory.getProp(e, t.v, 0, 0, r);
      }
      function CheckboxEffect(t, e, r) {
        this.p = PropertyFactory.getProp(e, t.v, 0, 0, r);
      }
      function NoValueEffect() {
        this.p = {};
      }
      function EffectsManager(t, e) {
        var r = t.ef || [];
        this.effectElements = [];
        var i, s = r.length, n;
        for (i = 0; i < s; i += 1)
          n = new GroupEffect(r[i], e), this.effectElements.push(n);
      }
      function GroupEffect(t, e) {
        this.init(t, e);
      }
      extendPrototype([DynamicPropertyContainer], GroupEffect), GroupEffect.prototype.getValue = GroupEffect.prototype.iterateDynamicProperties, GroupEffect.prototype.init = function(t, e) {
        this.data = t, this.effectElements = [], this.initDynamicPropertyContainer(e);
        var r, i = this.data.ef.length, s, n = this.data.ef;
        for (r = 0; r < i; r += 1) {
          switch (s = null, n[r].ty) {
            case 0:
              s = new SliderEffect(n[r], e, this);
              break;
            case 1:
              s = new AngleEffect(n[r], e, this);
              break;
            case 2:
              s = new ColorEffect(n[r], e, this);
              break;
            case 3:
              s = new PointEffect(n[r], e, this);
              break;
            case 4:
            case 7:
              s = new CheckboxEffect(n[r], e, this);
              break;
            case 10:
              s = new LayerIndexEffect(n[r], e, this);
              break;
            case 11:
              s = new MaskIndexEffect(n[r], e, this);
              break;
            case 5:
              s = new EffectsManager(n[r], e);
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
          for (var e = 0, r = this.data.masksProperties.length; e < r; ) {
            if (this.data.masksProperties[e].mode !== "n" && this.data.masksProperties[e].cl !== !1)
              return !0;
            e += 1;
          }
          return !1;
        },
        initExpressions: function() {
          var e = getExpressionInterfaces();
          if (e) {
            var r = e("layer"), i = e("effects"), s = e("shape"), n = e("text"), a = e("comp");
            this.layerInterface = r(this), this.data.hasMask && this.maskManager && this.layerInterface.registerMaskInterface(this.maskManager);
            var l = i.createEffectsInterface(this, this.layerInterface);
            this.layerInterface.registerEffectsInterface(l), this.data.ty === 0 || this.data.xt ? this.compInterface = a(this) : this.data.ty === 4 ? (this.layerInterface.shapeInterface = s(this.shapesData, this.itemsData, this.layerInterface), this.layerInterface.content = this.layerInterface.shapeInterface) : this.data.ty === 5 && (this.layerInterface.textInterface = n(this), this.layerInterface.text = this.layerInterface.textInterface);
          }
        },
        setBlendMode: function() {
          var e = getBlendMode(this.data.bm), r = this.baseElement || this.layerElement;
          r.style["mix-blend-mode"] = e;
        },
        initBaseData: function(e, r, i) {
          this.globalData = r, this.comp = i, this.data = e, this.layerId = createElementID(), this.data.sr || (this.data.sr = 1), this.effectsManager = new EffectsManager(this.data, this, this.dynamicProperties);
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
        prepareProperties: function(e, r) {
          var i, s = this.dynamicProperties.length;
          for (i = 0; i < s; i += 1)
            (r || this._isParent && this.dynamicProperties[i].propType === "transform") && (this.dynamicProperties[i].getValue(), this.dynamicProperties[i]._mdf && (this.globalData._mdf = !0, this._mdf = !0));
        },
        addDynamicProperty: function(e) {
          this.dynamicProperties.indexOf(e) === -1 && this.dynamicProperties.push(e);
        }
      };
      function FootageElement(t, e, r) {
        this.initFrame(), this.initRenderable(), this.assetData = e.getAssetData(t.refId), this.footageData = e.imageLoader.getAsset(this.assetData), this.initBaseData(t, e, r);
      }
      FootageElement.prototype.prepareFrame = function() {
      }, extendPrototype([RenderableElement, BaseElement, FrameElement], FootageElement), FootageElement.prototype.getBaseElement = function() {
        return null;
      }, FootageElement.prototype.renderFrame = function() {
      }, FootageElement.prototype.destroy = function() {
      }, FootageElement.prototype.initExpressions = function() {
        var t = getExpressionInterfaces();
        if (t) {
          var e = t("footage");
          this.layerInterface = e(this);
        }
      }, FootageElement.prototype.getFootageData = function() {
        return this.footageData;
      };
      function AudioElement(t, e, r) {
        this.initFrame(), this.initRenderable(), this.assetData = e.getAssetData(t.refId), this.initBaseData(t, e, r), this._isPlaying = !1, this._canPlay = !1;
        var i = this.globalData.getAssetsPath(this.assetData);
        this.audio = this.globalData.audioController.createAudio(i), this._currentTime = 0, this.globalData.audioController.addAudio(this), this._volumeMultiplier = 1, this._volume = 1, this._previousVolume = null, this.tm = t.tm ? PropertyFactory.getProp(this, t.tm, 0, e.frameRate, this) : {
          _placeholder: !0
        }, this.lv = PropertyFactory.getProp(this, t.au && t.au.lv ? t.au.lv : {
          k: [100]
        }, 1, 0.01, this);
      }
      AudioElement.prototype.prepareFrame = function(t) {
        if (this.prepareRenderableFrame(t, !0), this.prepareProperties(t, !0), this.tm._placeholder)
          this._currentTime = t / this.data.sr;
        else {
          var e = this.tm.v;
          this._currentTime = e;
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
      }, AudioElement.prototype.setRate = function(t) {
        this.audio.rate(t);
      }, AudioElement.prototype.volume = function(t) {
        this._volumeMultiplier = t, this._previousVolume = t * this._volume, this.audio.volume(this._previousVolume);
      }, AudioElement.prototype.getBaseElement = function() {
        return null;
      }, AudioElement.prototype.destroy = function() {
      }, AudioElement.prototype.sourceRectAtTime = function() {
      }, AudioElement.prototype.initExpressions = function() {
      };
      function BaseRenderer() {
      }
      BaseRenderer.prototype.checkLayers = function(t) {
        var e, r = this.layers.length, i;
        for (this.completeLayers = !0, e = r - 1; e >= 0; e -= 1)
          this.elements[e] || (i = this.layers[e], i.ip - i.st <= t - this.layers[e].st && i.op - i.st > t - this.layers[e].st && this.buildItem(e)), this.completeLayers = this.elements[e] ? this.completeLayers : !1;
        this.checkPendingElements();
      }, BaseRenderer.prototype.createItem = function(t) {
        switch (t.ty) {
          case 2:
            return this.createImage(t);
          case 0:
            return this.createComp(t);
          case 1:
            return this.createSolid(t);
          case 3:
            return this.createNull(t);
          case 4:
            return this.createShape(t);
          case 5:
            return this.createText(t);
          case 6:
            return this.createAudio(t);
          case 13:
            return this.createCamera(t);
          case 15:
            return this.createFootage(t);
          default:
            return this.createNull(t);
        }
      }, BaseRenderer.prototype.createCamera = function() {
        throw new Error("You're using a 3d camera. Try the html renderer.");
      }, BaseRenderer.prototype.createAudio = function(t) {
        return new AudioElement(t, this.globalData, this);
      }, BaseRenderer.prototype.createFootage = function(t) {
        return new FootageElement(t, this.globalData, this);
      }, BaseRenderer.prototype.buildAllItems = function() {
        var t, e = this.layers.length;
        for (t = 0; t < e; t += 1)
          this.buildItem(t);
        this.checkPendingElements();
      }, BaseRenderer.prototype.includeLayers = function(t) {
        this.completeLayers = !1;
        var e, r = t.length, i, s = this.layers.length;
        for (e = 0; e < r; e += 1)
          for (i = 0; i < s; ) {
            if (this.layers[i].id === t[e].id) {
              this.layers[i] = t[e];
              break;
            }
            i += 1;
          }
      }, BaseRenderer.prototype.setProjectInterface = function(t) {
        this.globalData.projectInterface = t;
      }, BaseRenderer.prototype.initItems = function() {
        this.globalData.progressiveLoad || this.buildAllItems();
      }, BaseRenderer.prototype.buildElementParenting = function(t, e, r) {
        for (var i = this.elements, s = this.layers, n = 0, a = s.length; n < a; )
          s[n].ind == e && (!i[n] || i[n] === !0 ? (this.buildItem(n), this.addPendingElement(t)) : (r.push(i[n]), i[n].setAsParent(), s[n].parent !== void 0 ? this.buildElementParenting(t, s[n].parent, r) : t.setHierarchy(r))), n += 1;
      }, BaseRenderer.prototype.addPendingElement = function(t) {
        this.pendingElements.push(t);
      }, BaseRenderer.prototype.searchExtraCompositions = function(t) {
        var e, r = t.length;
        for (e = 0; e < r; e += 1)
          if (t[e].xt) {
            var i = this.createComp(t[e]);
            i.initExpressions(), this.globalData.projectInterface.registerComposition(i);
          }
      }, BaseRenderer.prototype.getElementById = function(t) {
        var e, r = this.elements.length;
        for (e = 0; e < r; e += 1)
          if (this.elements[e].data.ind === t)
            return this.elements[e];
        return null;
      }, BaseRenderer.prototype.getElementByPath = function(t) {
        var e = t.shift(), r;
        if (typeof e == "number")
          r = this.elements[e];
        else {
          var i, s = this.elements.length;
          for (i = 0; i < s; i += 1)
            if (this.elements[i].data.nm === e) {
              r = this.elements[i];
              break;
            }
        }
        return t.length === 0 ? r : r.getElementByPath(t);
      }, BaseRenderer.prototype.setupGlobalData = function(t, e) {
        this.globalData.fontManager = new FontManager(), this.globalData.slotManager = slotFactory(t), this.globalData.fontManager.addChars(t.chars), this.globalData.fontManager.addFonts(t.fonts, e), this.globalData.getAssetData = this.animationItem.getAssetData.bind(this.animationItem), this.globalData.getAssetsPath = this.animationItem.getAssetsPath.bind(this.animationItem), this.globalData.imageLoader = this.animationItem.imagePreloader, this.globalData.audioController = this.animationItem.audioController, this.globalData.frameId = 0, this.globalData.frameRate = t.fr, this.globalData.nm = t.nm, this.globalData.compSize = {
          w: t.w,
          h: t.h
        };
      };
      var effectTypes = {
        TRANSFORM_EFFECT: "transformEFfect"
      };
      function TransformElement() {
      }
      TransformElement.prototype = {
        initTransform: function() {
          var e = new Matrix();
          this.finalTransform = {
            mProp: this.data.ks ? TransformPropertyFactory.getTransformProperty(this, this.data.ks, this) : {
              o: 0
            },
            _matMdf: !1,
            _localMatMdf: !1,
            _opMdf: !1,
            mat: e,
            localMat: e,
            localOpacity: 1
          }, this.data.ao && (this.finalTransform.mProp.autoOriented = !0), this.data.ty;
        },
        renderTransform: function() {
          if (this.finalTransform._opMdf = this.finalTransform.mProp.o._mdf || this._isFirstFrame, this.finalTransform._matMdf = this.finalTransform.mProp._mdf || this._isFirstFrame, this.hierarchy) {
            var e, r = this.finalTransform.mat, i = 0, s = this.hierarchy.length;
            if (!this.finalTransform._matMdf)
              for (; i < s; ) {
                if (this.hierarchy[i].finalTransform.mProp._mdf) {
                  this.finalTransform._matMdf = !0;
                  break;
                }
                i += 1;
              }
            if (this.finalTransform._matMdf)
              for (e = this.finalTransform.mProp.v.props, r.cloneFromProps(e), i = 0; i < s; i += 1)
                r.multiply(this.hierarchy[i].finalTransform.mProp.v);
          }
          (!this.localTransforms || this.finalTransform._matMdf) && (this.finalTransform._localMatMdf = this.finalTransform._matMdf), this.finalTransform._opMdf && (this.finalTransform.localOpacity = this.finalTransform.mProp.o.v);
        },
        renderLocalTransform: function() {
          if (this.localTransforms) {
            var e = 0, r = this.localTransforms.length;
            if (this.finalTransform._localMatMdf = this.finalTransform._matMdf, !this.finalTransform._localMatMdf || !this.finalTransform._opMdf)
              for (; e < r; )
                this.localTransforms[e]._mdf && (this.finalTransform._localMatMdf = !0), this.localTransforms[e]._opMdf && !this.finalTransform._opMdf && (this.finalTransform.localOpacity = this.finalTransform.mProp.o.v, this.finalTransform._opMdf = !0), e += 1;
            if (this.finalTransform._localMatMdf) {
              var i = this.finalTransform.localMat;
              for (this.localTransforms[0].matrix.clone(i), e = 1; e < r; e += 1) {
                var s = this.localTransforms[e].matrix;
                i.multiply(s);
              }
              i.multiply(this.finalTransform.mat);
            }
            if (this.finalTransform._opMdf) {
              var n = this.finalTransform.localOpacity;
              for (e = 0; e < r; e += 1)
                n *= this.localTransforms[e].opacity * 0.01;
              this.finalTransform.localOpacity = n;
            }
          }
        },
        searchEffectTransforms: function() {
          if (this.renderableEffectsManager) {
            var e = this.renderableEffectsManager.getEffects(effectTypes.TRANSFORM_EFFECT);
            if (e.length) {
              this.localTransforms = [], this.finalTransform.localMat = new Matrix();
              var r = 0, i = e.length;
              for (r = 0; r < i; r += 1)
                this.localTransforms.push(e[r]);
            }
          }
        },
        globalToLocal: function(e) {
          var r = [];
          r.push(this.finalTransform);
          for (var i = !0, s = this.comp; i; )
            s.finalTransform ? (s.data.hasMask && r.splice(0, 0, s.finalTransform), s = s.comp) : i = !1;
          var n, a = r.length, l;
          for (n = 0; n < a; n += 1)
            l = r[n].mat.applyToPointArray(0, 0, 0), e = [e[0] - l[0], e[1] - l[1], 0];
          return e;
        },
        mHelper: new Matrix()
      };
      function MaskElement(t, e, r) {
        this.data = t, this.element = e, this.globalData = r, this.storedData = [], this.masksProperties = this.data.masksProperties || [], this.maskElement = null;
        var i = this.globalData.defs, s, n = this.masksProperties ? this.masksProperties.length : 0;
        this.viewData = createSizedArray(n), this.solidPath = "";
        var a, l = this.masksProperties, o = 0, p = [], u, S, f = createElementID(), b, v, m, A, c = "clipPath", d = "clip-path";
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
            if (l[s].x.k !== 0 ? (c = "mask", d = "mask", A = PropertyFactory.getProp(this.element, l[s].x, 0, null, this.element), h = createElementID(), v = createNS("filter"), v.setAttribute("id", h), m = createNS("feMorphology"), m.setAttribute("operator", "erode"), m.setAttribute("in", "SourceGraphic"), m.setAttribute("radius", "0"), v.appendChild(m), i.appendChild(v), a.setAttribute("stroke", l[s].mode === "s" ? "#000000" : "#ffffff")) : (m = null, A = null), this.storedData[s] = {
              elem: a,
              x: A,
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
      MaskElement.prototype.getMaskProperty = function(t) {
        return this.viewData[t].prop;
      }, MaskElement.prototype.renderFrame = function(t) {
        var e = this.element.finalTransform.mat, r, i = this.masksProperties.length;
        for (r = 0; r < i; r += 1)
          if ((this.viewData[r].prop._mdf || t) && this.drawPath(this.masksProperties[r], this.viewData[r].prop.v, this.viewData[r]), (this.viewData[r].op._mdf || t) && this.viewData[r].elem.setAttribute("fill-opacity", this.viewData[r].op.v), this.masksProperties[r].mode !== "n" && (this.viewData[r].invRect && (this.element.finalTransform.mProp._mdf || t) && this.viewData[r].invRect.setAttribute("transform", e.getInverseMatrix().to2dCSS()), this.storedData[r].x && (this.storedData[r].x._mdf || t))) {
            var s = this.storedData[r].expan;
            this.storedData[r].x.v < 0 ? (this.storedData[r].lastOperator !== "erode" && (this.storedData[r].lastOperator = "erode", this.storedData[r].elem.setAttribute("filter", "url(" + getLocationHref() + "#" + this.storedData[r].filterId + ")")), s.setAttribute("radius", -this.storedData[r].x.v)) : (this.storedData[r].lastOperator !== "dilate" && (this.storedData[r].lastOperator = "dilate", this.storedData[r].elem.setAttribute("filter", null)), this.storedData[r].elem.setAttribute("stroke-width", this.storedData[r].x.v * 2));
          }
      }, MaskElement.prototype.getMaskelement = function() {
        return this.maskElement;
      }, MaskElement.prototype.createLayerSolidPath = function() {
        var t = "M0,0 ";
        return t += " h" + this.globalData.compSize.w, t += " v" + this.globalData.compSize.h, t += " h-" + this.globalData.compSize.w, t += " v-" + this.globalData.compSize.h + " ", t;
      }, MaskElement.prototype.drawPath = function(t, e, r) {
        var i = " M" + e.v[0][0] + "," + e.v[0][1], s, n;
        for (n = e._length, s = 1; s < n; s += 1)
          i += " C" + e.o[s - 1][0] + "," + e.o[s - 1][1] + " " + e.i[s][0] + "," + e.i[s][1] + " " + e.v[s][0] + "," + e.v[s][1];
        if (e.c && n > 1 && (i += " C" + e.o[s - 1][0] + "," + e.o[s - 1][1] + " " + e.i[0][0] + "," + e.i[0][1] + " " + e.v[0][0] + "," + e.v[0][1]), r.lastPath !== i) {
          var a = "";
          r.elem && (e.c && (a = t.inv ? this.solidPath + i : i), r.elem.setAttribute("d", a)), r.lastPath = i;
        }
      }, MaskElement.prototype.destroy = function() {
        this.element = null, this.globalData = null, this.maskElement = null, this.data = null, this.masksProperties = null;
      };
      var filtersFactory = (function() {
        var t = {};
        t.createFilter = e, t.createAlphaToLuminanceFilter = r;
        function e(i, s) {
          var n = createNS("filter");
          return n.setAttribute("id", i), s !== !0 && (n.setAttribute("filterUnits", "objectBoundingBox"), n.setAttribute("x", "0%"), n.setAttribute("y", "0%"), n.setAttribute("width", "100%"), n.setAttribute("height", "100%")), n;
        }
        function r() {
          var i = createNS("feColorMatrix");
          return i.setAttribute("type", "matrix"), i.setAttribute("color-interpolation-filters", "sRGB"), i.setAttribute("values", "0 0 0 1 0  0 0 0 1 0  0 0 0 1 0  0 0 0 1 1"), i;
        }
        return t;
      })(), featureSupport = (function() {
        var t = {
          maskType: !0,
          svgLumaHidden: !0,
          offscreenCanvas: typeof OffscreenCanvas < "u"
        };
        return (/MSIE 10/i.test(navigator.userAgent) || /MSIE 9/i.test(navigator.userAgent) || /rv:11.0/i.test(navigator.userAgent) || /Edge\/\d./i.test(navigator.userAgent)) && (t.maskType = !1), /firefox/i.test(navigator.userAgent) && (t.svgLumaHidden = !1), t;
      })(), registeredEffects$1 = {}, idPrefix = "filter_result_";
      function SVGEffects(t) {
        var e, r = "SourceGraphic", i = t.data.ef ? t.data.ef.length : 0, s = createElementID(), n = filtersFactory.createFilter(s, !0), a = 0;
        this.filters = [];
        var l;
        for (e = 0; e < i; e += 1) {
          l = null;
          var o = t.data.ef[e].ty;
          if (registeredEffects$1[o]) {
            var p = registeredEffects$1[o].effect;
            l = new p(n, t.effectsManager.effectElements[e], t, idPrefix + a, r), r = idPrefix + a, registeredEffects$1[o].countsAsEffect && (a += 1);
          }
          l && this.filters.push(l);
        }
        a && (t.globalData.defs.appendChild(n), t.layerElement.setAttribute("filter", "url(" + getLocationHref() + "#" + s + ")")), this.filters.length && t.addRenderableComponent(this);
      }
      SVGEffects.prototype.renderFrame = function(t) {
        var e, r = this.filters.length;
        for (e = 0; e < r; e += 1)
          this.filters[e].renderFrame(t);
      }, SVGEffects.prototype.getEffects = function(t) {
        var e, r = this.filters.length, i = [];
        for (e = 0; e < r; e += 1)
          this.filters[e].type === t && i.push(this.filters[e]);
        return i;
      };
      function registerEffect$1(t, e, r) {
        registeredEffects$1[t] = {
          effect: e,
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
          var e = null;
          if (this.data.td) {
            this.matteMasks = {};
            var r = createNS("g");
            r.setAttribute("id", this.layerId), r.appendChild(this.layerElement), e = r, this.globalData.defs.appendChild(r);
          } else this.data.tt ? (this.matteElement.appendChild(this.layerElement), e = this.matteElement, this.baseElement = this.matteElement) : this.baseElement = this.layerElement;
          if (this.data.ln && this.layerElement.setAttribute("id", this.data.ln), this.data.cl && this.layerElement.setAttribute("class", this.data.cl), this.data.ty === 0 && !this.data.hd) {
            var i = createNS("clipPath"), s = createNS("path");
            s.setAttribute("d", "M0,0 L" + this.data.w + ",0 L" + this.data.w + "," + this.data.h + " L0," + this.data.h + "z");
            var n = createElementID();
            if (i.setAttribute("id", n), i.appendChild(s), this.globalData.defs.appendChild(i), this.checkMasks()) {
              var a = createNS("g");
              a.setAttribute("clip-path", "url(" + getLocationHref() + "#" + n + ")"), a.appendChild(this.layerElement), this.transformedElement = a, e ? e.appendChild(this.transformedElement) : this.baseElement = this.transformedElement;
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
        getMatte: function(e) {
          if (this.matteMasks || (this.matteMasks = {}), !this.matteMasks[e]) {
            var r = this.layerId + "_" + e, i, s, n, a;
            if (e === 1 || e === 3) {
              var l = createNS("mask");
              l.setAttribute("id", r), l.setAttribute("mask-type", e === 3 ? "luminance" : "alpha"), n = createNS("use"), n.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#" + this.layerId), l.appendChild(n), this.globalData.defs.appendChild(l), !featureSupport.maskType && e === 1 && (l.setAttribute("mask-type", "luminance"), i = createElementID(), s = filtersFactory.createFilter(i), this.globalData.defs.appendChild(s), s.appendChild(filtersFactory.createAlphaToLuminanceFilter()), a = createNS("g"), a.appendChild(n), l.appendChild(a), a.setAttribute("filter", "url(" + getLocationHref() + "#" + i + ")"));
            } else if (e === 2) {
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
            this.matteMasks[e] = r;
          }
          return this.matteMasks[e];
        },
        setMatte: function(e) {
          this.matteElement && this.matteElement.setAttribute("mask", "url(" + getLocationHref() + "#" + e + ")");
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
        setHierarchy: function(e) {
          this.hierarchy = e;
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
        var t = {
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
        extendPrototype([RenderableElement, createProxyFunction(t)], RenderableDOMElement);
      })();
      function IImageElement(t, e, r) {
        this.assetData = e.getAssetData(t.refId), this.assetData && this.assetData.sid && (this.assetData = e.slotManager.getProp(this.assetData)), this.initElement(t, e, r), this.sourceRect = {
          top: 0,
          left: 0,
          width: this.assetData.w,
          height: this.assetData.h
        };
      }
      extendPrototype([BaseElement, TransformElement, SVGBaseElement, HierarchyElement, FrameElement, RenderableDOMElement], IImageElement), IImageElement.prototype.createContent = function() {
        var t = this.globalData.getAssetsPath(this.assetData);
        this.innerElem = createNS("image"), this.innerElem.setAttribute("width", this.assetData.w + "px"), this.innerElem.setAttribute("height", this.assetData.h + "px"), this.innerElem.setAttribute("preserveAspectRatio", this.assetData.pr || this.globalData.renderConfig.imagePreserveAspectRatio), this.innerElem.setAttributeNS("http://www.w3.org/1999/xlink", "href", t), this.layerElement.appendChild(this.innerElem);
      }, IImageElement.prototype.sourceRectAtTime = function() {
        return this.sourceRect;
      };
      function ProcessedElement(t, e) {
        this.elem = t, this.pos = e;
      }
      function IShapeElement() {
      }
      IShapeElement.prototype = {
        addShapeToModifiers: function(e) {
          var r, i = this.shapeModifiers.length;
          for (r = 0; r < i; r += 1)
            this.shapeModifiers[r].addShape(e);
        },
        isShapeInAnimatedModifiers: function(e) {
          for (var r = 0, i = this.shapeModifiers.length; r < i; )
            if (this.shapeModifiers[r].isAnimatedWithShape(e))
              return !0;
          return !1;
        },
        renderModifiers: function() {
          if (this.shapeModifiers.length) {
            var e, r = this.shapes.length;
            for (e = 0; e < r; e += 1)
              this.shapes[e].sh.reset();
            r = this.shapeModifiers.length;
            var i;
            for (e = r - 1; e >= 0 && (i = this.shapeModifiers[e].processShapes(this._isFirstFrame), !i); e -= 1)
              ;
          }
        },
        searchProcessedElement: function(e) {
          for (var r = this.processedElements, i = 0, s = r.length; i < s; ) {
            if (r[i].elem === e)
              return r[i].pos;
            i += 1;
          }
          return 0;
        },
        addProcessedElement: function(e, r) {
          for (var i = this.processedElements, s = i.length; s; )
            if (s -= 1, i[s].elem === e) {
              i[s].pos = r;
              return;
            }
          i.push(new ProcessedElement(e, r));
        },
        prepareFrame: function(e) {
          this.prepareRenderableFrame(e), this.prepareProperties(e, this.isInRange);
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
      function SVGShapeData(t, e, r) {
        this.caches = [], this.styles = [], this.transformers = t, this.lStr = "", this.sh = r, this.lvl = e, this._isAnimated = !!r.k;
        for (var i = 0, s = t.length; i < s; ) {
          if (t[i].mProps.dynamicProperties.length) {
            this._isAnimated = !0;
            break;
          }
          i += 1;
        }
      }
      SVGShapeData.prototype.setAsAnimated = function() {
        this._isAnimated = !0;
      };
      function SVGStyleData(t, e) {
        this.data = t, this.type = t.ty, this.d = "", this.lvl = e, this._mdf = !1, this.closed = t.hd === !0, this.pElem = createNS("path"), this.msElem = null;
      }
      SVGStyleData.prototype.reset = function() {
        this.d = "", this._mdf = !1;
      };
      function DashProperty(t, e, r, i) {
        this.elem = t, this.frameId = -1, this.dataProps = createSizedArray(e.length), this.renderer = r, this.k = !1, this.dashStr = "", this.dashArray = createTypedArray("float32", e.length ? e.length - 1 : 0), this.dashoffset = createTypedArray("float32", 1), this.initDynamicPropertyContainer(i);
        var s, n = e.length || 0, a;
        for (s = 0; s < n; s += 1)
          a = PropertyFactory.getProp(t, e[s].v, 0, 0, this), this.k = a.k || this.k, this.dataProps[s] = {
            n: e[s].n,
            p: a
          };
        this.k || this.getValue(!0), this._isAnimated = this.k;
      }
      DashProperty.prototype.getValue = function(t) {
        if (!(this.elem.globalData.frameId === this.frameId && !t) && (this.frameId = this.elem.globalData.frameId, this.iterateDynamicProperties(), this._mdf = this._mdf || t, this._mdf)) {
          var e = 0, r = this.dataProps.length;
          for (this.renderer === "svg" && (this.dashStr = ""), e = 0; e < r; e += 1)
            this.dataProps[e].n !== "o" ? this.renderer === "svg" ? this.dashStr += " " + this.dataProps[e].p.v : this.dashArray[e] = this.dataProps[e].p.v : this.dashoffset[0] = this.dataProps[e].p.v;
        }
      }, extendPrototype([DynamicPropertyContainer], DashProperty);
      function SVGStrokeStyleData(t, e, r) {
        this.initDynamicPropertyContainer(t), this.getValue = this.iterateDynamicProperties, this.o = PropertyFactory.getProp(t, e.o, 0, 0.01, this), this.w = PropertyFactory.getProp(t, e.w, 0, null, this), this.d = new DashProperty(t, e.d || {}, "svg", this), this.c = PropertyFactory.getProp(t, e.c, 1, 255, this), this.style = r, this._isAnimated = !!this._isAnimated;
      }
      extendPrototype([DynamicPropertyContainer], SVGStrokeStyleData);
      function SVGFillStyleData(t, e, r) {
        this.initDynamicPropertyContainer(t), this.getValue = this.iterateDynamicProperties, this.o = PropertyFactory.getProp(t, e.o, 0, 0.01, this), this.c = PropertyFactory.getProp(t, e.c, 1, 255, this), this.style = r;
      }
      extendPrototype([DynamicPropertyContainer], SVGFillStyleData);
      function SVGNoStyleData(t, e, r) {
        this.initDynamicPropertyContainer(t), this.getValue = this.iterateDynamicProperties, this.style = r;
      }
      extendPrototype([DynamicPropertyContainer], SVGNoStyleData);
      function GradientProperty(t, e, r) {
        this.data = e, this.c = createTypedArray("uint8c", e.p * 4);
        var i = e.k.k[0].s ? e.k.k[0].s.length - e.p * 4 : e.k.k.length - e.p * 4;
        this.o = createTypedArray("float32", i), this._cmdf = !1, this._omdf = !1, this._collapsable = this.checkCollapsable(), this._hasOpacity = i, this.initDynamicPropertyContainer(r), this.prop = PropertyFactory.getProp(t, e.k, 1, null, this), this.k = this.prop.k, this.getValue(!0);
      }
      GradientProperty.prototype.comparePoints = function(t, e) {
        for (var r = 0, i = this.o.length / 2, s; r < i; ) {
          if (s = Math.abs(t[r * 4] - t[e * 4 + r * 2]), s > 0.01)
            return !1;
          r += 1;
        }
        return !0;
      }, GradientProperty.prototype.checkCollapsable = function() {
        if (this.o.length / 2 !== this.c.length / 4)
          return !1;
        if (this.data.k.k[0].s)
          for (var t = 0, e = this.data.k.k.length; t < e; ) {
            if (!this.comparePoints(this.data.k.k[t].s, this.data.p))
              return !1;
            t += 1;
          }
        else if (!this.comparePoints(this.data.k.k, this.data.p))
          return !1;
        return !0;
      }, GradientProperty.prototype.getValue = function(t) {
        if (this.prop.getValue(), this._mdf = !1, this._cmdf = !1, this._omdf = !1, this.prop._mdf || t) {
          var e, r = this.data.p * 4, i, s;
          for (e = 0; e < r; e += 1)
            i = e % 4 === 0 ? 100 : 255, s = Math.round(this.prop.v[e] * i), this.c[e] !== s && (this.c[e] = s, this._cmdf = !t);
          if (this.o.length)
            for (r = this.prop.v.length, e = this.data.p * 4; e < r; e += 1)
              i = e % 2 === 0 ? 100 : 1, s = e % 2 === 0 ? Math.round(this.prop.v[e] * 100) : this.prop.v[e], this.o[e - this.data.p * 4] !== s && (this.o[e - this.data.p * 4] = s, this._omdf = !t);
          this._mdf = !t;
        }
      }, extendPrototype([DynamicPropertyContainer], GradientProperty);
      function SVGGradientFillStyleData(t, e, r) {
        this.initDynamicPropertyContainer(t), this.getValue = this.iterateDynamicProperties, this.initGradientData(t, e, r);
      }
      SVGGradientFillStyleData.prototype.initGradientData = function(t, e, r) {
        this.o = PropertyFactory.getProp(t, e.o, 0, 0.01, this), this.s = PropertyFactory.getProp(t, e.s, 1, null, this), this.e = PropertyFactory.getProp(t, e.e, 1, null, this), this.h = PropertyFactory.getProp(t, e.h || {
          k: 0
        }, 0, 0.01, this), this.a = PropertyFactory.getProp(t, e.a || {
          k: 0
        }, 0, degToRads, this), this.g = new GradientProperty(t, e.g, this), this.style = r, this.stops = [], this.setGradientData(r.pElem, e), this.setGradientOpacity(e, r), this._isAnimated = !!this._isAnimated;
      }, SVGGradientFillStyleData.prototype.setGradientData = function(t, e) {
        var r = createElementID(), i = createNS(e.t === 1 ? "linearGradient" : "radialGradient");
        i.setAttribute("id", r), i.setAttribute("spreadMethod", "pad"), i.setAttribute("gradientUnits", "userSpaceOnUse");
        var s = [], n, a, l;
        for (l = e.g.p * 4, a = 0; a < l; a += 4)
          n = createNS("stop"), i.appendChild(n), s.push(n);
        t.setAttribute(e.ty === "gf" ? "fill" : "stroke", "url(" + getLocationHref() + "#" + r + ")"), this.gf = i, this.cst = s;
      }, SVGGradientFillStyleData.prototype.setGradientOpacity = function(t, e) {
        if (this.g._hasOpacity && !this.g._collapsable) {
          var r, i, s, n = createNS("mask"), a = createNS("path");
          n.appendChild(a);
          var l = createElementID(), o = createElementID();
          n.setAttribute("id", o);
          var p = createNS(t.t === 1 ? "linearGradient" : "radialGradient");
          p.setAttribute("id", l), p.setAttribute("spreadMethod", "pad"), p.setAttribute("gradientUnits", "userSpaceOnUse"), s = t.g.k.k[0].s ? t.g.k.k[0].s.length : t.g.k.k.length;
          var u = this.stops;
          for (i = t.g.p * 4; i < s; i += 2)
            r = createNS("stop"), r.setAttribute("stop-color", "rgb(255,255,255)"), p.appendChild(r), u.push(r);
          a.setAttribute(t.ty === "gf" ? "fill" : "stroke", "url(" + getLocationHref() + "#" + l + ")"), t.ty === "gs" && (a.setAttribute("stroke-linecap", lineCapEnum[t.lc || 2]), a.setAttribute("stroke-linejoin", lineJoinEnum[t.lj || 2]), t.lj === 1 && a.setAttribute("stroke-miterlimit", t.ml)), this.of = p, this.ms = n, this.ost = u, this.maskId = o, e.msElem = a;
        }
      }, extendPrototype([DynamicPropertyContainer], SVGGradientFillStyleData);
      function SVGGradientStrokeStyleData(t, e, r) {
        this.initDynamicPropertyContainer(t), this.getValue = this.iterateDynamicProperties, this.w = PropertyFactory.getProp(t, e.w, 0, null, this), this.d = new DashProperty(t, e.d || {}, "svg", this), this.initGradientData(t, e, r), this._isAnimated = !!this._isAnimated;
      }
      extendPrototype([SVGGradientFillStyleData, DynamicPropertyContainer], SVGGradientStrokeStyleData);
      function ShapeGroupData() {
        this.it = [], this.prevViewData = [], this.gr = createNS("g");
      }
      function SVGTransformData(t, e, r) {
        this.transform = {
          mProps: t,
          op: e,
          container: r
        }, this.elements = [], this._isAnimated = this.transform.mProps.dynamicProperties.length || this.transform.op.effectsSequence.length;
      }
      var buildShapeString = function(e, r, i, s) {
        if (r === 0)
          return "";
        var n = e.o, a = e.i, l = e.v, o, p = " M" + s.applyToPointStringified(l[0][0], l[0][1]);
        for (o = 1; o < r; o += 1)
          p += " C" + s.applyToPointStringified(n[o - 1][0], n[o - 1][1]) + " " + s.applyToPointStringified(a[o][0], a[o][1]) + " " + s.applyToPointStringified(l[o][0], l[o][1]);
        return i && r && (p += " C" + s.applyToPointStringified(n[o - 1][0], n[o - 1][1]) + " " + s.applyToPointStringified(a[0][0], a[0][1]) + " " + s.applyToPointStringified(l[0][0], l[0][1]), p += "z"), p;
      }, SVGElementsRenderer = (function() {
        var t = new Matrix(), e = new Matrix(), r = {
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
          var v, m, A, c, d, h, y = f.styles.length, P = f.lvl, x, _, M, w;
          for (h = 0; h < y; h += 1) {
            if (c = f.sh._mdf || b, f.styles[h].lvl < P) {
              for (_ = e.reset(), M = P - f.styles[h].lvl, w = f.transformers.length - 1; !c && M > 0; )
                c = f.transformers[w].mProps._mdf || c, M -= 1, w -= 1;
              if (c)
                for (M = P - f.styles[h].lvl, w = f.transformers.length - 1; M > 0; )
                  _.multiply(f.transformers[w].mProps.v), M -= 1, w -= 1;
            } else
              _ = t;
            if (x = f.sh.paths, m = x._length, c) {
              for (A = "", v = 0; v < m; v += 1)
                d = x.shapes[v], d && d._length && (A += buildShapeString(d, d._length, d.c, _));
              f.caches[h] = A;
            } else
              A = f.caches[h];
            f.styles[h].d += S.hd === !0 ? "" : A, f.styles[h]._mdf = c || f.styles[h]._mdf;
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
          var v = f.gf, m = f.g._hasOpacity, A = f.s.v, c = f.e.v;
          if (f.o._mdf || b) {
            var d = S.ty === "gf" ? "fill-opacity" : "stroke-opacity";
            f.style.pElem.setAttribute(d, f.o.v);
          }
          if (f.s._mdf || b) {
            var h = S.t === 1 ? "x1" : "cx", y = h === "x1" ? "y1" : "cy";
            v.setAttribute(h, A[0]), v.setAttribute(y, A[1]), m && !f.g._collapsable && (f.of.setAttribute(h, A[0]), f.of.setAttribute(y, A[1]));
          }
          var P, x, _, M;
          if (f.g._cmdf || b) {
            P = f.cst;
            var w = f.g.c;
            for (_ = P.length, x = 0; x < _; x += 1)
              M = P[x], M.setAttribute("offset", w[x * 4] + "%"), M.setAttribute("stop-color", "rgb(" + w[x * 4 + 1] + "," + w[x * 4 + 2] + "," + w[x * 4 + 3] + ")");
          }
          if (m && (f.g._omdf || b)) {
            var B = f.g.o;
            for (f.g._collapsable ? P = f.cst : P = f.ost, _ = P.length, x = 0; x < _; x += 1)
              M = P[x], f.g._collapsable || M.setAttribute("offset", B[x * 2] + "%"), M.setAttribute("stop-opacity", B[x * 2 + 1]);
          }
          if (S.t === 1)
            (f.e._mdf || b) && (v.setAttribute("x2", c[0]), v.setAttribute("y2", c[1]), m && !f.g._collapsable && (f.of.setAttribute("x2", c[0]), f.of.setAttribute("y2", c[1])));
          else {
            var V;
            if ((f.s._mdf || f.e._mdf || b) && (V = Math.sqrt(Math.pow(A[0] - c[0], 2) + Math.pow(A[1] - c[1], 2)), v.setAttribute("r", V), m && !f.g._collapsable && f.of.setAttribute("r", V)), f.s._mdf || f.e._mdf || f.h._mdf || f.a._mdf || b) {
              V || (V = Math.sqrt(Math.pow(A[0] - c[0], 2) + Math.pow(A[1] - c[1], 2)));
              var I = Math.atan2(c[1] - A[1], c[0] - A[0]), N = f.h.v;
              N >= 1 ? N = 0.99 : N <= -1 && (N = -0.99);
              var G = V * N, R = Math.cos(I + f.a.v) * G + A[0], C = Math.sin(I + f.a.v) * G + A[1];
              v.setAttribute("fx", R), v.setAttribute("fy", C), m && !f.g._collapsable && (f.of.setAttribute("fx", R), f.of.setAttribute("fy", C));
            }
          }
        }
        function u(S, f, b) {
          var v = f.style, m = f.d;
          m && (m._mdf || b) && m.dashStr && (v.pElem.setAttribute("stroke-dasharray", m.dashStr), v.pElem.setAttribute("stroke-dashoffset", m.dashoffset[0])), f.c && (f.c._mdf || b) && v.pElem.setAttribute("stroke", "rgb(" + bmFloor(f.c.v[0]) + "," + bmFloor(f.c.v[1]) + "," + bmFloor(f.c.v[2]) + ")"), (f.o._mdf || b) && v.pElem.setAttribute("stroke-opacity", f.o.v), (f.w._mdf || b) && (v.pElem.setAttribute("stroke-width", f.w.v), v.msElem && v.msElem.setAttribute("stroke-width", f.w.v));
        }
        return r;
      })();
      function SVGShapeElement(t, e, r) {
        this.shapes = [], this.shapesData = t.shapes, this.stylesList = [], this.shapeModifiers = [], this.itemsData = [], this.processedElements = [], this.animatedContents = [], this.initElement(t, e, r), this.prevViewData = [];
      }
      extendPrototype([BaseElement, TransformElement, SVGBaseElement, IShapeElement, HierarchyElement, FrameElement, RenderableDOMElement], SVGShapeElement), SVGShapeElement.prototype.initSecondaryElement = function() {
      }, SVGShapeElement.prototype.identityMatrix = new Matrix(), SVGShapeElement.prototype.buildExpressionInterface = function() {
      }, SVGShapeElement.prototype.createContent = function() {
        this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, this.layerElement, 0, [], !0), this.filterUniqueShapes();
      }, SVGShapeElement.prototype.filterUniqueShapes = function() {
        var t, e = this.shapes.length, r, i, s = this.stylesList.length, n, a = [], l = !1;
        for (i = 0; i < s; i += 1) {
          for (n = this.stylesList[i], l = !1, a.length = 0, t = 0; t < e; t += 1)
            r = this.shapes[t], r.styles.indexOf(n) !== -1 && (a.push(r), l = r._isAnimated || l);
          a.length > 1 && l && this.setShapesAsAnimated(a);
        }
      }, SVGShapeElement.prototype.setShapesAsAnimated = function(t) {
        var e, r = t.length;
        for (e = 0; e < r; e += 1)
          t[e].setAsAnimated();
      }, SVGShapeElement.prototype.createStyleElement = function(t, e) {
        var r, i = new SVGStyleData(t, e), s = i.pElem;
        if (t.ty === "st")
          r = new SVGStrokeStyleData(this, t, i);
        else if (t.ty === "fl")
          r = new SVGFillStyleData(this, t, i);
        else if (t.ty === "gf" || t.ty === "gs") {
          var n = t.ty === "gf" ? SVGGradientFillStyleData : SVGGradientStrokeStyleData;
          r = new n(this, t, i), this.globalData.defs.appendChild(r.gf), r.maskId && (this.globalData.defs.appendChild(r.ms), this.globalData.defs.appendChild(r.of), s.setAttribute("mask", "url(" + getLocationHref() + "#" + r.maskId + ")"));
        } else t.ty === "no" && (r = new SVGNoStyleData(this, t, i));
        return (t.ty === "st" || t.ty === "gs") && (s.setAttribute("stroke-linecap", lineCapEnum[t.lc || 2]), s.setAttribute("stroke-linejoin", lineJoinEnum[t.lj || 2]), s.setAttribute("fill-opacity", "0"), t.lj === 1 && s.setAttribute("stroke-miterlimit", t.ml)), t.r === 2 && s.setAttribute("fill-rule", "evenodd"), t.ln && s.setAttribute("id", t.ln), t.cl && s.setAttribute("class", t.cl), t.bm && (s.style["mix-blend-mode"] = getBlendMode(t.bm)), this.stylesList.push(i), this.addToAnimatedContents(t, r), r;
      }, SVGShapeElement.prototype.createGroupElement = function(t) {
        var e = new ShapeGroupData();
        return t.ln && e.gr.setAttribute("id", t.ln), t.cl && e.gr.setAttribute("class", t.cl), t.bm && (e.gr.style["mix-blend-mode"] = getBlendMode(t.bm)), e;
      }, SVGShapeElement.prototype.createTransformElement = function(t, e) {
        var r = TransformPropertyFactory.getTransformProperty(this, t, this), i = new SVGTransformData(r, r.o, e);
        return this.addToAnimatedContents(t, i), i;
      }, SVGShapeElement.prototype.createShapeElement = function(t, e, r) {
        var i = 4;
        t.ty === "rc" ? i = 5 : t.ty === "el" ? i = 6 : t.ty === "sr" && (i = 7);
        var s = ShapePropertyFactory.getShapeProp(this, t, i, this), n = new SVGShapeData(e, r, s);
        return this.shapes.push(n), this.addShapeToModifiers(n), this.addToAnimatedContents(t, n), n;
      }, SVGShapeElement.prototype.addToAnimatedContents = function(t, e) {
        for (var r = 0, i = this.animatedContents.length; r < i; ) {
          if (this.animatedContents[r].element === e)
            return;
          r += 1;
        }
        this.animatedContents.push({
          fn: SVGElementsRenderer.createRenderFunction(t),
          element: e,
          data: t
        });
      }, SVGShapeElement.prototype.setElementStyles = function(t) {
        var e = t.styles, r, i = this.stylesList.length;
        for (r = 0; r < i; r += 1)
          e.indexOf(this.stylesList[r]) === -1 && !this.stylesList[r].closed && e.push(this.stylesList[r]);
      }, SVGShapeElement.prototype.reloadShapes = function() {
        this._isFirstFrame = !0;
        var t, e = this.itemsData.length;
        for (t = 0; t < e; t += 1)
          this.prevViewData[t] = this.itemsData[t];
        for (this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, this.layerElement, 0, [], !0), this.filterUniqueShapes(), e = this.dynamicProperties.length, t = 0; t < e; t += 1)
          this.dynamicProperties[t].getValue();
        this.renderModifiers();
      }, SVGShapeElement.prototype.searchShapes = function(t, e, r, i, s, n, a) {
        var l = [].concat(n), o, p = t.length - 1, u, S, f = [], b = [], v, m, A;
        for (o = p; o >= 0; o -= 1) {
          if (A = this.searchProcessedElement(t[o]), A ? e[o] = r[A - 1] : t[o]._render = a, t[o].ty === "fl" || t[o].ty === "st" || t[o].ty === "gf" || t[o].ty === "gs" || t[o].ty === "no")
            A ? e[o].style.closed = t[o].hd : e[o] = this.createStyleElement(t[o], s), t[o]._render && e[o].style.pElem.parentNode !== i && i.appendChild(e[o].style.pElem), f.push(e[o].style);
          else if (t[o].ty === "gr") {
            if (!A)
              e[o] = this.createGroupElement(t[o]);
            else
              for (S = e[o].it.length, u = 0; u < S; u += 1)
                e[o].prevViewData[u] = e[o].it[u];
            this.searchShapes(t[o].it, e[o].it, e[o].prevViewData, e[o].gr, s + 1, l, a), t[o]._render && e[o].gr.parentNode !== i && i.appendChild(e[o].gr);
          } else t[o].ty === "tr" ? (A || (e[o] = this.createTransformElement(t[o], i)), v = e[o].transform, l.push(v)) : t[o].ty === "sh" || t[o].ty === "rc" || t[o].ty === "el" || t[o].ty === "sr" ? (A || (e[o] = this.createShapeElement(t[o], l, s)), this.setElementStyles(e[o])) : t[o].ty === "tm" || t[o].ty === "rd" || t[o].ty === "ms" || t[o].ty === "pb" || t[o].ty === "zz" || t[o].ty === "op" ? (A ? (m = e[o], m.closed = !1) : (m = ShapeModifiers.getModifier(t[o].ty), m.init(this, t[o]), e[o] = m, this.shapeModifiers.push(m)), b.push(m)) : t[o].ty === "rp" && (A ? (m = e[o], m.closed = !0) : (m = ShapeModifiers.getModifier(t[o].ty), e[o] = m, m.init(this, t, o, e), this.shapeModifiers.push(m), a = !1), b.push(m));
          this.addProcessedElement(t[o], o + 1);
        }
        for (p = f.length, o = 0; o < p; o += 1)
          f[o].closed = !0;
        for (p = b.length, o = 0; o < p; o += 1)
          b[o].closed = !0;
      }, SVGShapeElement.prototype.renderInnerContent = function() {
        this.renderModifiers();
        var t, e = this.stylesList.length;
        for (t = 0; t < e; t += 1)
          this.stylesList[t].reset();
        for (this.renderShape(), t = 0; t < e; t += 1)
          (this.stylesList[t]._mdf || this._isFirstFrame) && (this.stylesList[t].msElem && (this.stylesList[t].msElem.setAttribute("d", this.stylesList[t].d), this.stylesList[t].d = "M0 0" + this.stylesList[t].d), this.stylesList[t].pElem.setAttribute("d", this.stylesList[t].d || "M0 0"));
      }, SVGShapeElement.prototype.renderShape = function() {
        var t, e = this.animatedContents.length, r;
        for (t = 0; t < e; t += 1)
          r = this.animatedContents[t], (this._isFirstFrame || r.element._isAnimated) && r.data !== !0 && r.fn(r.data, r.element, this._isFirstFrame);
      }, SVGShapeElement.prototype.destroy = function() {
        this.destroyBaseElement(), this.shapesData = null, this.itemsData = null;
      };
      function LetterProps(t, e, r, i, s, n) {
        this.o = t, this.sw = e, this.sc = r, this.fc = i, this.m = s, this.p = n, this._mdf = {
          o: !0,
          sw: !!e,
          sc: !!r,
          fc: !!i,
          m: !0,
          p: !0
        };
      }
      LetterProps.prototype.update = function(t, e, r, i, s, n) {
        this._mdf.o = !1, this._mdf.sw = !1, this._mdf.sc = !1, this._mdf.fc = !1, this._mdf.m = !1, this._mdf.p = !1;
        var a = !1;
        return this.o !== t && (this.o = t, this._mdf.o = !0, a = !0), this.sw !== e && (this.sw = e, this._mdf.sw = !0, a = !0), this.sc !== r && (this.sc = r, this._mdf.sc = !0, a = !0), this.fc !== i && (this.fc = i, this._mdf.fc = !0, a = !0), this.m !== s && (this.m = s, this._mdf.m = !0, a = !0), n.length && (this.p[0] !== n[0] || this.p[1] !== n[1] || this.p[4] !== n[4] || this.p[5] !== n[5] || this.p[12] !== n[12] || this.p[13] !== n[13]) && (this.p = n, this._mdf.p = !0, a = !0), a;
      };
      function TextProperty(t, e) {
        this._frameId = initialDefaultFrame, this.pv = "", this.v = "", this.kf = !1, this._isFirstFrame = !0, this._mdf = !1, e.d && e.d.sid && (e.d = t.globalData.slotManager.getProp(e.d)), this.data = e, this.elem = t, this.comp = this.elem.comp, this.keysIndex = 0, this.canResize = !1, this.minimumFontSize = 1, this.effectsSequence = [], this.currentData = {
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
      TextProperty.prototype.defaultBoxWidth = [0, 0], TextProperty.prototype.copyData = function(t, e) {
        for (var r in e)
          Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r]);
        return t;
      }, TextProperty.prototype.setCurrentData = function(t) {
        t.__complete || this.completeTextData(t), this.currentData = t, this.currentData.boxWidth = this.currentData.boxWidth || this.defaultBoxWidth, this._mdf = !0;
      }, TextProperty.prototype.searchProperty = function() {
        return this.searchKeyframes();
      }, TextProperty.prototype.searchKeyframes = function() {
        return this.kf = this.data.d.k.length > 1, this.kf && this.addEffect(this.getKeyframeValue.bind(this)), this.kf;
      }, TextProperty.prototype.addEffect = function(t) {
        this.effectsSequence.push(t), this.elem.addDynamicProperty(this);
      }, TextProperty.prototype.getValue = function(t) {
        if (!((this.elem.globalData.frameId === this.frameId || !this.effectsSequence.length) && !t)) {
          this.currentData.t = this.data.d.k[this.keysIndex].s.t;
          var e = this.currentData, r = this.keysIndex;
          if (this.lock) {
            this.setCurrentData(this.currentData);
            return;
          }
          this.lock = !0, this._mdf = !1;
          var i, s = this.effectsSequence.length, n = t || this.data.d.k[this.keysIndex].s;
          for (i = 0; i < s; i += 1)
            r !== this.keysIndex ? n = this.effectsSequence[i](n, n.t) : n = this.effectsSequence[i](this.currentData, n.t);
          e !== n && this.setCurrentData(n), this.v = this.currentData, this.pv = this.v, this.lock = !1, this.frameId = this.elem.globalData.frameId;
        }
      }, TextProperty.prototype.getKeyframeValue = function() {
        for (var t = this.data.d.k, e = this.elem.comp.renderedFrame, r = 0, i = t.length; r <= i - 1 && !(r === i - 1 || t[r + 1].t > e); )
          r += 1;
        return this.keysIndex !== r && (this.keysIndex = r), this.data.d.k[this.keysIndex].s;
      }, TextProperty.prototype.buildFinalText = function(t) {
        for (var e = [], r = 0, i = t.length, s, n, a = !1, l = !1, o = ""; r < i; )
          a = l, l = !1, s = t.charCodeAt(r), o = t.charAt(r), FontManager.isCombinedCharacter(s) ? a = !0 : s >= 55296 && s <= 56319 ? FontManager.isRegionalFlag(t, r) ? o = t.substr(r, 14) : (n = t.charCodeAt(r + 1), n >= 56320 && n <= 57343 && (FontManager.isModifier(s, n) ? (o = t.substr(r, 2), a = !0) : FontManager.isFlagEmoji(t.substr(r, 4)) ? o = t.substr(r, 4) : o = t.substr(r, 2))) : s > 56319 ? (n = t.charCodeAt(r + 1), FontManager.isVariationSelector(s) && (a = !0)) : FontManager.isZeroWidthJoiner(s) && (a = !0, l = !0), a ? (e[e.length - 1] += o, a = !1) : e.push(o), r += o.length;
        return e;
      }, TextProperty.prototype.completeTextData = function(t) {
        t.__complete = !0;
        var e = this.elem.globalData.fontManager, r = this.data, i = [], s, n, a, l = 0, o, p = r.m.g, u = 0, S = 0, f = 0, b = [], v = 0, m = 0, A, c, d = e.getFontByName(t.f), h, y = 0, P = getFontProperties(d);
        t.fWeight = P.weight, t.fStyle = P.style, t.finalSize = t.s, t.finalText = this.buildFinalText(t.t), n = t.finalText.length, t.finalLineHeight = t.lh;
        var x = t.tr / 1e3 * t.finalSize, _;
        if (t.sz)
          for (var M = !0, w = t.sz[0], B = t.sz[1], V, I; M; ) {
            I = this.buildFinalText(t.t), V = 0, v = 0, n = I.length, x = t.tr / 1e3 * t.finalSize;
            var N = -1;
            for (s = 0; s < n; s += 1)
              _ = I[s].charCodeAt(0), a = !1, I[s] === " " ? N = s : (_ === 13 || _ === 3) && (v = 0, a = !0, V += t.finalLineHeight || t.finalSize * 1.2), e.chars ? (h = e.getCharData(I[s], d.fStyle, d.fFamily), y = a ? 0 : h.w * t.finalSize / 100) : y = e.measureText(I[s], t.f, t.finalSize), v + y > w && I[s] !== " " ? (N === -1 ? n += 1 : s = N, V += t.finalLineHeight || t.finalSize * 1.2, I.splice(s, N === s ? 1 : 0, "\r"), N = -1, v = 0) : (v += y, v += x);
            V += d.ascent * t.finalSize / 100, this.canResize && t.finalSize > this.minimumFontSize && B < V ? (t.finalSize -= 1, t.finalLineHeight = t.finalSize * t.lh / t.s) : (t.finalText = I, n = t.finalText.length, M = !1);
          }
        v = -x, y = 0;
        var G = 0, R;
        for (s = 0; s < n; s += 1)
          if (a = !1, R = t.finalText[s], _ = R.charCodeAt(0), _ === 13 || _ === 3 ? (G = 0, b.push(v), m = v > m ? v : m, v = -2 * x, o = "", a = !0, f += 1) : o = R, e.chars ? (h = e.getCharData(R, d.fStyle, e.getFontByName(t.f).fFamily), y = a ? 0 : h.w * t.finalSize / 100) : y = e.measureText(o, t.f, t.finalSize), R === " " ? G += y + x : (v += y + x + G, G = 0), i.push({
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
        if (t.l = i, m = v > m ? v : m, b.push(v), t.sz)
          t.boxWidth = t.sz[0], t.justifyOffset = 0;
        else
          switch (t.boxWidth = m, t.j) {
            case 1:
              t.justifyOffset = -t.boxWidth;
              break;
            case 2:
              t.justifyOffset = -t.boxWidth / 2;
              break;
            default:
              t.justifyOffset = 0;
          }
        t.lineWidths = b;
        var C = r.a, T, g;
        c = C.length;
        var E, F, k = [];
        for (A = 0; A < c; A += 1) {
          for (T = C[A], T.a.sc && (t.strokeColorAnim = !0), T.a.sw && (t.strokeWidthAnim = !0), (T.a.fc || T.a.fh || T.a.fs || T.a.fb) && (t.fillColorAnim = !0), F = 0, E = T.s.b, s = 0; s < n; s += 1)
            g = i[s], g.anIndexes[A] = F, (E == 1 && g.val !== "" || E == 2 && g.val !== "" && g.val !== " " || E == 3 && (g.n || g.val == " " || s == n - 1) || E == 4 && (g.n || s == n - 1)) && (T.s.rn === 1 && k.push(F), F += 1);
          r.a[A].s.totalChars = F;
          var L = -1, D;
          if (T.s.rn === 1)
            for (s = 0; s < n; s += 1)
              g = i[s], L != g.anIndexes[A] && (L = g.anIndexes[A], D = k.splice(Math.floor(Math.random() * k.length), 1)[0]), g.anIndexes[A] = D;
        }
        t.yOffset = t.finalLineHeight || t.finalSize * 1.2, t.ls = t.ls || 0, t.ascent = d.ascent * t.finalSize / 100;
      }, TextProperty.prototype.updateDocumentData = function(t, e) {
        e = e === void 0 ? this.keysIndex : e;
        var r = this.copyData({}, this.data.d.k[e].s);
        r = this.copyData(r, t), this.data.d.k[e].s = r, this.recalculate(e), this.setCurrentData(r), this.elem.addDynamicProperty(this);
      }, TextProperty.prototype.recalculate = function(t) {
        var e = this.data.d.k[t].s;
        e.__complete = !1, this.keysIndex = 0, this._isFirstFrame = !0, this.getValue(e);
      }, TextProperty.prototype.canResizeFont = function(t) {
        this.canResize = t, this.recalculate(this.keysIndex), this.elem.addDynamicProperty(this);
      }, TextProperty.prototype.setMinimumFontSize = function(t) {
        this.minimumFontSize = Math.floor(t) || 1, this.recalculate(this.keysIndex), this.elem.addDynamicProperty(this);
      };
      var TextSelectorProp = (function() {
        var t = Math.max, e = Math.min, r = Math.floor;
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
              v === b ? f = a >= v ? 1 : 0 : f = t(0, e(0.5 / (v - b) + (a - b) / (v - b), 1)), f = S(f);
            else if (m === 3)
              v === b ? f = a >= v ? 0 : 1 : f = 1 - t(0, e(0.5 / (v - b) + (a - b) / (v - b), 1)), f = S(f);
            else if (m === 4)
              v === b ? f = 0 : (f = t(0, e(0.5 / (v - b) + (a - b) / (v - b), 1)), f < 0.5 ? f *= 2 : f = 1 - 2 * (f - 0.5)), f = S(f);
            else if (m === 5) {
              if (v === b)
                f = 0;
              else {
                var A = v - b;
                a = e(t(0, a + 0.5 - b), v - b);
                var c = -A / 2 + a, d = A / 2;
                f = Math.sqrt(1 - c * c / (d * d));
              }
              f = S(f);
            } else m === 6 ? (v === b ? f = 0 : (a = e(t(0, a + 0.5 - b), v - b), f = (1 + Math.cos(Math.PI + Math.PI * 2 * a / (v - b))) / 2), f = S(f)) : (a >= r(b) && (a - b < 0 ? f = t(0, e(e(v, 1) - (b - a), 1)) : f = t(0, e(v - a, 1))), f = S(f));
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
      function TextAnimatorDataProperty(t, e, r) {
        var i = {
          propType: !1
        }, s = PropertyFactory.getProp, n = e.a;
        this.a = {
          r: n.r ? s(t, n.r, 0, degToRads, r) : i,
          rx: n.rx ? s(t, n.rx, 0, degToRads, r) : i,
          ry: n.ry ? s(t, n.ry, 0, degToRads, r) : i,
          sk: n.sk ? s(t, n.sk, 0, degToRads, r) : i,
          sa: n.sa ? s(t, n.sa, 0, degToRads, r) : i,
          s: n.s ? s(t, n.s, 1, 0.01, r) : i,
          a: n.a ? s(t, n.a, 1, 0, r) : i,
          o: n.o ? s(t, n.o, 0, 0.01, r) : i,
          p: n.p ? s(t, n.p, 1, 0, r) : i,
          sw: n.sw ? s(t, n.sw, 0, 0, r) : i,
          sc: n.sc ? s(t, n.sc, 1, 0, r) : i,
          fc: n.fc ? s(t, n.fc, 1, 0, r) : i,
          fh: n.fh ? s(t, n.fh, 0, 0, r) : i,
          fs: n.fs ? s(t, n.fs, 0, 0.01, r) : i,
          fb: n.fb ? s(t, n.fb, 0, 0.01, r) : i,
          t: n.t ? s(t, n.t, 0, 0, r) : i
        }, this.s = TextSelectorProp.getTextSelectorProp(t, e.s, r), this.s.t = e.s.t;
      }
      function TextAnimatorProperty(t, e, r) {
        this._isFirstFrame = !0, this._hasMaskedPath = !1, this._frameId = -1, this._textData = t, this._renderType = e, this._elem = r, this._animatorsData = createSizedArray(this._textData.a.length), this._pathData = {}, this._moreOptions = {
          alignment: {}
        }, this.renderedLetters = [], this.lettersChangedFlag = !1, this.initDynamicPropertyContainer(r);
      }
      TextAnimatorProperty.prototype.searchProperties = function() {
        var t, e = this._textData.a.length, r, i = PropertyFactory.getProp;
        for (t = 0; t < e; t += 1)
          r = this._textData.a[t], this._animatorsData[t] = new TextAnimatorDataProperty(this._elem, r, this);
        this._textData.p && "m" in this._textData.p ? (this._pathData = {
          a: i(this._elem, this._textData.p.a, 0, 0, this),
          f: i(this._elem, this._textData.p.f, 0, 0, this),
          l: i(this._elem, this._textData.p.l, 0, 0, this),
          r: i(this._elem, this._textData.p.r, 0, 0, this),
          p: i(this._elem, this._textData.p.p, 0, 0, this),
          m: this._elem.maskManager.getMaskProperty(this._textData.p.m)
        }, this._hasMaskedPath = !0) : this._hasMaskedPath = !1, this._moreOptions.alignment = i(this._elem, this._textData.m.a, 1, 0, this);
      }, TextAnimatorProperty.prototype.getMeasures = function(t, e) {
        if (this.lettersChangedFlag = e, !(!this._mdf && !this._isFirstFrame && !e && (!this._hasMaskedPath || !this._pathData.m._mdf))) {
          this._isFirstFrame = !1;
          var r = this._moreOptions.alignment.v, i = this._animatorsData, s = this._textData, n = this.mHelper, a = this._renderType, l = this.renderedLetters.length, o, p, u, S, f = t.l, b, v, m, A, c, d, h, y, P, x, _, M, w, B, V;
          if (this._hasMaskedPath) {
            if (V = this._pathData.m, !this._pathData.n || this._pathData._mdf) {
              var I = V.v;
              this._pathData.r.v && (I = I.reverse()), b = {
                tLength: 0,
                segments: []
              }, S = I._length - 1;
              var N;
              for (M = 0, u = 0; u < S; u += 1)
                N = bez.buildBezierData(I.v[u], I.v[u + 1], [I.o[u][0] - I.v[u][0], I.o[u][1] - I.v[u][1]], [I.i[u + 1][0] - I.v[u + 1][0], I.i[u + 1][1] - I.v[u + 1][1]]), b.tLength += N.segmentLength, b.segments.push(N), M += N.segmentLength;
              u = S, V.v.c && (N = bez.buildBezierData(I.v[u], I.v[0], [I.o[u][0] - I.v[u][0], I.o[u][1] - I.v[u][1]], [I.i[0][0] - I.v[0][0], I.i[0][1] - I.v[0][1]]), b.tLength += N.segmentLength, b.segments.push(N), M += N.segmentLength), this._pathData.pi = b;
            }
            if (b = this._pathData.pi, v = this._pathData.f.v, h = 0, d = 1, A = 0, c = !0, x = b.segments, v < 0 && V.v.c)
              for (b.tLength < Math.abs(v) && (v = -Math.abs(v) % b.tLength), h = x.length - 1, P = x[h].points, d = P.length - 1; v < 0; )
                v += P[d].partialLength, d -= 1, d < 0 && (h -= 1, P = x[h].points, d = P.length - 1);
            P = x[h].points, y = P[d - 1], m = P[d], _ = m.partialLength;
          }
          S = f.length, o = 0, p = 0;
          var G = t.finalSize * 1.2 * 0.714, R = !0, C, T, g, E, F;
          E = i.length;
          var k, L = -1, D, O, j, q = v, Y = h, X = d, W = -1, $, J, tt, Z, z, ot, rt, et, Q = "", H = this.defaultPropsArray, U;
          if (t.j === 2 || t.j === 1) {
            var K = 0, it = 0, st = t.j === 2 ? -0.5 : -1, nt = 0, lt = !0;
            for (u = 0; u < S; u += 1)
              if (f[u].n) {
                for (K && (K += it); nt < u; )
                  f[nt].animatorJustifyOffset = K, nt += 1;
                K = 0, lt = !0;
              } else {
                for (g = 0; g < E; g += 1)
                  C = i[g].a, C.t.propType && (lt && t.j === 2 && (it += C.t.v * st), T = i[g].s, k = T.getMult(f[u].anIndexes[g], s.a[g].s.totalChars), k.length ? K += C.t.v * k[0] * st : K += C.t.v * k * st);
                lt = !1;
              }
            for (K && (K += it); nt < u; )
              f[nt].animatorJustifyOffset = K, nt += 1;
          }
          for (u = 0; u < S; u += 1) {
            if (n.reset(), $ = 1, f[u].n)
              o = 0, p += t.yOffset, p += R ? 1 : 0, v = q, R = !1, this._hasMaskedPath && (h = Y, d = X, P = x[h].points, y = P[d - 1], m = P[d], _ = m.partialLength, A = 0), Q = "", et = "", ot = "", U = "", H = this.defaultPropsArray;
            else {
              if (this._hasMaskedPath) {
                if (W !== f[u].line) {
                  switch (t.j) {
                    case 1:
                      v += M - t.lineWidths[f[u].line];
                      break;
                    case 2:
                      v += (M - t.lineWidths[f[u].line]) / 2;
                      break;
                  }
                  W = f[u].line;
                }
                L !== f[u].ind && (f[L] && (v += f[L].extra), v += f[u].an / 2, L = f[u].ind), v += r[0] * f[u].an * 5e-3;
                var at = 0;
                for (g = 0; g < E; g += 1)
                  C = i[g].a, C.p.propType && (T = i[g].s, k = T.getMult(f[u].anIndexes[g], s.a[g].s.totalChars), k.length ? at += C.p.v[0] * k[0] : at += C.p.v[0] * k), C.a.propType && (T = i[g].s, k = T.getMult(f[u].anIndexes[g], s.a[g].s.totalChars), k.length ? at += C.a.v[0] * k[0] : at += C.a.v[0] * k);
                for (c = !0, this._pathData.a.v && (v = f[0].an * 0.5 + (M - this._pathData.f.v - f[0].an * 0.5 - f[f.length - 1].an * 0.5) * L / (S - 1), v += this._pathData.f.v); c; )
                  A + _ >= v + at || !P ? (w = (v + at - A) / m.partialLength, O = y.point[0] + (m.point[0] - y.point[0]) * w, j = y.point[1] + (m.point[1] - y.point[1]) * w, n.translate(-r[0] * f[u].an * 5e-3, -(r[1] * G) * 0.01), c = !1) : P && (A += m.partialLength, d += 1, d >= P.length && (d = 0, h += 1, x[h] ? P = x[h].points : V.v.c ? (d = 0, h = 0, P = x[h].points) : (A -= m.partialLength, P = null)), P && (y = m, m = P[d], _ = m.partialLength));
                D = f[u].an / 2 - f[u].add, n.translate(-D, 0, 0);
              } else
                D = f[u].an / 2 - f[u].add, n.translate(-D, 0, 0), n.translate(-r[0] * f[u].an * 5e-3, -r[1] * G * 0.01, 0);
              for (g = 0; g < E; g += 1)
                C = i[g].a, C.t.propType && (T = i[g].s, k = T.getMult(f[u].anIndexes[g], s.a[g].s.totalChars), (o !== 0 || t.j !== 0) && (this._hasMaskedPath ? k.length ? v += C.t.v * k[0] : v += C.t.v * k : k.length ? o += C.t.v * k[0] : o += C.t.v * k));
              for (t.strokeWidthAnim && (tt = t.sw || 0), t.strokeColorAnim && (t.sc ? J = [t.sc[0], t.sc[1], t.sc[2]] : J = [0, 0, 0]), t.fillColorAnim && t.fc && (Z = [t.fc[0], t.fc[1], t.fc[2]]), g = 0; g < E; g += 1)
                C = i[g].a, C.a.propType && (T = i[g].s, k = T.getMult(f[u].anIndexes[g], s.a[g].s.totalChars), k.length ? n.translate(-C.a.v[0] * k[0], -C.a.v[1] * k[1], C.a.v[2] * k[2]) : n.translate(-C.a.v[0] * k, -C.a.v[1] * k, C.a.v[2] * k));
              for (g = 0; g < E; g += 1)
                C = i[g].a, C.s.propType && (T = i[g].s, k = T.getMult(f[u].anIndexes[g], s.a[g].s.totalChars), k.length ? n.scale(1 + (C.s.v[0] - 1) * k[0], 1 + (C.s.v[1] - 1) * k[1], 1) : n.scale(1 + (C.s.v[0] - 1) * k, 1 + (C.s.v[1] - 1) * k, 1));
              for (g = 0; g < E; g += 1) {
                if (C = i[g].a, T = i[g].s, k = T.getMult(f[u].anIndexes[g], s.a[g].s.totalChars), C.sk.propType && (k.length ? n.skewFromAxis(-C.sk.v * k[0], C.sa.v * k[1]) : n.skewFromAxis(-C.sk.v * k, C.sa.v * k)), C.r.propType && (k.length ? n.rotateZ(-C.r.v * k[2]) : n.rotateZ(-C.r.v * k)), C.ry.propType && (k.length ? n.rotateY(C.ry.v * k[1]) : n.rotateY(C.ry.v * k)), C.rx.propType && (k.length ? n.rotateX(C.rx.v * k[0]) : n.rotateX(C.rx.v * k)), C.o.propType && (k.length ? $ += (C.o.v * k[0] - $) * k[0] : $ += (C.o.v * k - $) * k), t.strokeWidthAnim && C.sw.propType && (k.length ? tt += C.sw.v * k[0] : tt += C.sw.v * k), t.strokeColorAnim && C.sc.propType)
                  for (z = 0; z < 3; z += 1)
                    k.length ? J[z] += (C.sc.v[z] - J[z]) * k[0] : J[z] += (C.sc.v[z] - J[z]) * k;
                if (t.fillColorAnim && t.fc) {
                  if (C.fc.propType)
                    for (z = 0; z < 3; z += 1)
                      k.length ? Z[z] += (C.fc.v[z] - Z[z]) * k[0] : Z[z] += (C.fc.v[z] - Z[z]) * k;
                  C.fh.propType && (k.length ? Z = addHueToRGB(Z, C.fh.v * k[0]) : Z = addHueToRGB(Z, C.fh.v * k)), C.fs.propType && (k.length ? Z = addSaturationToRGB(Z, C.fs.v * k[0]) : Z = addSaturationToRGB(Z, C.fs.v * k)), C.fb.propType && (k.length ? Z = addBrightnessToRGB(Z, C.fb.v * k[0]) : Z = addBrightnessToRGB(Z, C.fb.v * k));
                }
              }
              for (g = 0; g < E; g += 1)
                C = i[g].a, C.p.propType && (T = i[g].s, k = T.getMult(f[u].anIndexes[g], s.a[g].s.totalChars), this._hasMaskedPath ? k.length ? n.translate(0, C.p.v[1] * k[0], -C.p.v[2] * k[1]) : n.translate(0, C.p.v[1] * k, -C.p.v[2] * k) : k.length ? n.translate(C.p.v[0] * k[0], C.p.v[1] * k[1], -C.p.v[2] * k[2]) : n.translate(C.p.v[0] * k, C.p.v[1] * k, -C.p.v[2] * k));
              if (t.strokeWidthAnim && (ot = tt < 0 ? 0 : tt), t.strokeColorAnim && (rt = "rgb(" + Math.round(J[0] * 255) + "," + Math.round(J[1] * 255) + "," + Math.round(J[2] * 255) + ")"), t.fillColorAnim && t.fc && (et = "rgb(" + Math.round(Z[0] * 255) + "," + Math.round(Z[1] * 255) + "," + Math.round(Z[2] * 255) + ")"), this._hasMaskedPath) {
                if (n.translate(0, -t.ls), n.translate(0, r[1] * G * 0.01 + p, 0), this._pathData.p.v) {
                  B = (m.point[1] - y.point[1]) / (m.point[0] - y.point[0]);
                  var ht = Math.atan(B) * 180 / Math.PI;
                  m.point[0] < y.point[0] && (ht += 180), n.rotate(-ht * Math.PI / 180);
                }
                n.translate(O, j, 0), v -= r[0] * f[u].an * 5e-3, f[u + 1] && L !== f[u + 1].ind && (v += f[u].an / 2, v += t.tr * 1e-3 * t.finalSize);
              } else {
                switch (n.translate(o, p, 0), t.ps && n.translate(t.ps[0], t.ps[1] + t.ascent, 0), t.j) {
                  case 1:
                    n.translate(f[u].animatorJustifyOffset + t.justifyOffset + (t.boxWidth - t.lineWidths[f[u].line]), 0, 0);
                    break;
                  case 2:
                    n.translate(f[u].animatorJustifyOffset + t.justifyOffset + (t.boxWidth - t.lineWidths[f[u].line]) / 2, 0, 0);
                    break;
                }
                n.translate(0, -t.ls), n.translate(D, 0, 0), n.translate(r[0] * f[u].an * 5e-3, r[1] * G * 0.01, 0), o += f[u].l + t.tr * 1e-3 * t.finalSize;
              }
              a === "html" ? Q = n.toCSS() : a === "svg" ? Q = n.to2dCSS() : H = [n.props[0], n.props[1], n.props[2], n.props[3], n.props[4], n.props[5], n.props[6], n.props[7], n.props[8], n.props[9], n.props[10], n.props[11], n.props[12], n.props[13], n.props[14], n.props[15]], U = $;
            }
            l <= u ? (F = new LetterProps(U, ot, rt, et, Q, H), this.renderedLetters.push(F), l += 1, this.lettersChangedFlag = !0) : (F = this.renderedLetters[u], this.lettersChangedFlag = F.update(U, ot, rt, et, Q, H) || this.lettersChangedFlag);
          }
        }
      }, TextAnimatorProperty.prototype.getValue = function() {
        this._elem.globalData.frameId !== this._frameId && (this._frameId = this._elem.globalData.frameId, this.iterateDynamicProperties());
      }, TextAnimatorProperty.prototype.mHelper = new Matrix(), TextAnimatorProperty.prototype.defaultPropsArray = [], extendPrototype([DynamicPropertyContainer], TextAnimatorProperty);
      function ITextElement() {
      }
      ITextElement.prototype.initElement = function(t, e, r) {
        this.lettersChangedFlag = !0, this.initFrame(), this.initBaseData(t, e, r), this.textProperty = new TextProperty(this, t.t, this.dynamicProperties), this.textAnimator = new TextAnimatorProperty(t.t, this.renderType, this), this.initTransform(t, e, r), this.initHierarchy(), this.initRenderable(), this.initRendererElement(), this.createContainerElements(), this.createRenderableComponents(), this.createContent(), this.hide(), this.textAnimator.searchProperties(this.dynamicProperties);
      }, ITextElement.prototype.prepareFrame = function(t) {
        this._mdf = !1, this.prepareRenderableFrame(t), this.prepareProperties(t, this.isInRange);
      }, ITextElement.prototype.createPathShape = function(t, e) {
        var r, i = e.length, s, n = "";
        for (r = 0; r < i; r += 1)
          e[r].ty === "sh" && (s = e[r].ks.k, n += buildShapeString(s, s.i.length, !0, t));
        return n;
      }, ITextElement.prototype.updateDocumentData = function(t, e) {
        this.textProperty.updateDocumentData(t, e);
      }, ITextElement.prototype.canResizeFont = function(t) {
        this.textProperty.canResizeFont(t);
      }, ITextElement.prototype.setMinimumFontSize = function(t) {
        this.textProperty.setMinimumFontSize(t);
      }, ITextElement.prototype.applyTextPropertiesToMatrix = function(t, e, r, i, s) {
        switch (t.ps && e.translate(t.ps[0], t.ps[1] + t.ascent, 0), e.translate(0, -t.ls, 0), t.j) {
          case 1:
            e.translate(t.justifyOffset + (t.boxWidth - t.lineWidths[r]), 0, 0);
            break;
          case 2:
            e.translate(t.justifyOffset + (t.boxWidth - t.lineWidths[r]) / 2, 0, 0);
            break;
        }
        e.translate(i, s, 0);
      }, ITextElement.prototype.buildColor = function(t) {
        return "rgb(" + Math.round(t[0] * 255) + "," + Math.round(t[1] * 255) + "," + Math.round(t[2] * 255) + ")";
      }, ITextElement.prototype.emptyProp = new LetterProps(), ITextElement.prototype.destroy = function() {
      }, ITextElement.prototype.validateText = function() {
        (this.textProperty._mdf || this.textProperty._isFirstFrame) && (this.buildNewText(), this.textProperty._isFirstFrame = !1, this.textProperty._mdf = !1);
      };
      var emptyShapeData = {
        shapes: []
      };
      function SVGTextLottieElement(t, e, r) {
        this.textSpans = [], this.renderType = "svg", this.initElement(t, e, r);
      }
      extendPrototype([BaseElement, TransformElement, SVGBaseElement, HierarchyElement, FrameElement, RenderableDOMElement, ITextElement], SVGTextLottieElement), SVGTextLottieElement.prototype.createContent = function() {
        this.data.singleShape && !this.globalData.fontManager.chars && (this.textContainer = createNS("text"));
      }, SVGTextLottieElement.prototype.buildTextContents = function(t) {
        for (var e = 0, r = t.length, i = [], s = ""; e < r; )
          t[e] === "\r" || t[e] === "" ? (i.push(s), s = "") : s += t[e], e += 1;
        return i.push(s), i;
      }, SVGTextLottieElement.prototype.buildShapeData = function(t, e) {
        if (t.shapes && t.shapes.length) {
          var r = t.shapes[0];
          if (r.it) {
            var i = r.it[r.it.length - 1];
            i.s && (i.s.k[0] = e, i.s.k[1] = e);
          }
        }
        return t;
      }, SVGTextLottieElement.prototype.buildNewText = function() {
        this.addDynamicProperty(this);
        var t, e, r = this.textProperty.currentData;
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
        e = a.length;
        var o, p = this.mHelper, u = "", S = this.data.singleShape, f = 0, b = 0, v = !0, m = r.tr * 1e-3 * r.finalSize;
        if (S && !l && !r.sz) {
          var A = this.textContainer, c = "start";
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
          A.setAttribute("text-anchor", c), A.setAttribute("letter-spacing", m);
          var d = this.buildTextContents(r.finalText);
          for (e = d.length, b = r.ps ? r.ps[1] + r.ascent : 0, t = 0; t < e; t += 1)
            o = this.textSpans[t].span || createNS("tspan"), o.textContent = d[t], o.setAttribute("x", 0), o.setAttribute("y", b), o.style.display = "inherit", A.appendChild(o), this.textSpans[t] || (this.textSpans[t] = {
              span: null,
              glyph: null
            }), this.textSpans[t].span = o, b += r.finalLineHeight;
          this.layerElement.appendChild(A);
        } else {
          var h = this.textSpans.length, y;
          for (t = 0; t < e; t += 1) {
            if (this.textSpans[t] || (this.textSpans[t] = {
              span: null,
              childSpan: null,
              glyph: null
            }), !l || !S || t === 0) {
              if (o = h > t ? this.textSpans[t].span : createNS(l ? "g" : "text"), h <= t) {
                if (o.setAttribute("stroke-linecap", "butt"), o.setAttribute("stroke-linejoin", "round"), o.setAttribute("stroke-miterlimit", "4"), this.textSpans[t].span = o, l) {
                  var P = createNS("g");
                  o.appendChild(P), this.textSpans[t].childSpan = P;
                }
                this.textSpans[t].span = o, this.layerElement.appendChild(o);
              }
              o.style.display = "inherit";
            }
            if (p.reset(), S && (a[t].n && (f = -m, b += r.yOffset, b += v ? 1 : 0, v = !1), this.applyTextPropertiesToMatrix(r, p, a[t].line, f, b), f += a[t].l || 0, f += m), l) {
              y = this.globalData.fontManager.getCharData(r.finalText[t], i.fStyle, this.globalData.fontManager.getFontByName(r.f).fFamily);
              var x;
              if (y.t === 1)
                x = new SVGCompElement(y.data, this.globalData, this);
              else {
                var _ = emptyShapeData;
                y.data && y.data.shapes && (_ = this.buildShapeData(y.data, r.finalSize)), x = new SVGShapeElement(_, this.globalData, this);
              }
              if (this.textSpans[t].glyph) {
                var M = this.textSpans[t].glyph;
                this.textSpans[t].childSpan.removeChild(M.layerElement), M.destroy();
              }
              this.textSpans[t].glyph = x, x._debug = !0, x.prepareFrame(0), x.renderFrame(), this.textSpans[t].childSpan.appendChild(x.layerElement), y.t === 1 && this.textSpans[t].childSpan.setAttribute("transform", "scale(" + r.finalSize / 100 + "," + r.finalSize / 100 + ")");
            } else
              S && o.setAttribute("transform", "translate(" + p.props[12] + "," + p.props[13] + ")"), o.textContent = a[t].val, o.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve");
          }
          S && o && o.setAttribute("d", u);
        }
        for (; t < this.textSpans.length; )
          this.textSpans[t].span.style.display = "none", t += 1;
        this._sizeChanged = !0;
      }, SVGTextLottieElement.prototype.sourceRectAtTime = function() {
        if (this.prepareFrame(this.comp.renderedFrame - this.data.st), this.renderInnerContent(), this._sizeChanged) {
          this._sizeChanged = !1;
          var t = this.layerElement.getBBox();
          this.bbox = {
            top: t.y,
            left: t.x,
            width: t.width,
            height: t.height
          };
        }
        return this.bbox;
      }, SVGTextLottieElement.prototype.getValue = function() {
        var t, e = this.textSpans.length, r;
        for (this.renderedFrame = this.comp.renderedFrame, t = 0; t < e; t += 1)
          r = this.textSpans[t].glyph, r && (r.prepareFrame(this.comp.renderedFrame - this.data.st), r._mdf && (this._mdf = !0));
      }, SVGTextLottieElement.prototype.renderInnerContent = function() {
        if (this.validateText(), (!this.data.singleShape || this._mdf) && (this.textAnimator.getMeasures(this.textProperty.currentData, this.lettersChangedFlag), this.lettersChangedFlag || this.textAnimator.lettersChangedFlag)) {
          this._sizeChanged = !0;
          var t, e, r = this.textAnimator.renderedLetters, i = this.textProperty.currentData.l;
          e = i.length;
          var s, n, a;
          for (t = 0; t < e; t += 1)
            i[t].n || (s = r[t], n = this.textSpans[t].span, a = this.textSpans[t].glyph, a && a.renderFrame(), s._mdf.m && n.setAttribute("transform", s.m), s._mdf.o && n.setAttribute("opacity", s.o), s._mdf.sw && n.setAttribute("stroke-width", s.sw), s._mdf.sc && n.setAttribute("stroke", s.sc), s._mdf.fc && n.setAttribute("fill", s.fc));
        }
      };
      function ISolidElement(t, e, r) {
        this.initElement(t, e, r);
      }
      extendPrototype([IImageElement], ISolidElement), ISolidElement.prototype.createContent = function() {
        var t = createNS("rect");
        t.setAttribute("width", this.data.sw), t.setAttribute("height", this.data.sh), t.setAttribute("fill", this.data.sc), this.layerElement.appendChild(t);
      };
      function NullElement(t, e, r) {
        this.initFrame(), this.initBaseData(t, e, r), this.initFrame(), this.initTransform(t, e, r), this.initHierarchy();
      }
      NullElement.prototype.prepareFrame = function(t) {
        this.prepareProperties(t, !0);
      }, NullElement.prototype.renderFrame = function() {
      }, NullElement.prototype.getBaseElement = function() {
        return null;
      }, NullElement.prototype.destroy = function() {
      }, NullElement.prototype.sourceRectAtTime = function() {
      }, NullElement.prototype.hide = function() {
      }, extendPrototype([BaseElement, TransformElement, HierarchyElement, FrameElement], NullElement);
      function SVGRendererBase() {
      }
      extendPrototype([BaseRenderer], SVGRendererBase), SVGRendererBase.prototype.createNull = function(t) {
        return new NullElement(t, this.globalData, this);
      }, SVGRendererBase.prototype.createShape = function(t) {
        return new SVGShapeElement(t, this.globalData, this);
      }, SVGRendererBase.prototype.createText = function(t) {
        return new SVGTextLottieElement(t, this.globalData, this);
      }, SVGRendererBase.prototype.createImage = function(t) {
        return new IImageElement(t, this.globalData, this);
      }, SVGRendererBase.prototype.createSolid = function(t) {
        return new ISolidElement(t, this.globalData, this);
      }, SVGRendererBase.prototype.configAnimation = function(t) {
        this.svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg"), this.svgElement.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink"), this.renderConfig.viewBoxSize ? this.svgElement.setAttribute("viewBox", this.renderConfig.viewBoxSize) : this.svgElement.setAttribute("viewBox", "0 0 " + t.w + " " + t.h), this.renderConfig.viewBoxOnly || (this.svgElement.setAttribute("width", t.w), this.svgElement.setAttribute("height", t.h), this.svgElement.style.width = "100%", this.svgElement.style.height = "100%", this.svgElement.style.transform = "translate3d(0,0,0)", this.svgElement.style.contentVisibility = this.renderConfig.contentVisibility), this.renderConfig.width && this.svgElement.setAttribute("width", this.renderConfig.width), this.renderConfig.height && this.svgElement.setAttribute("height", this.renderConfig.height), this.renderConfig.className && this.svgElement.setAttribute("class", this.renderConfig.className), this.renderConfig.id && this.svgElement.setAttribute("id", this.renderConfig.id), this.renderConfig.focusable !== void 0 && this.svgElement.setAttribute("focusable", this.renderConfig.focusable), this.svgElement.setAttribute("preserveAspectRatio", this.renderConfig.preserveAspectRatio), this.animationItem.wrapper.appendChild(this.svgElement);
        var e = this.globalData.defs;
        this.setupGlobalData(t, e), this.globalData.progressiveLoad = this.renderConfig.progressiveLoad, this.data = t;
        var r = createNS("clipPath"), i = createNS("rect");
        i.setAttribute("width", t.w), i.setAttribute("height", t.h), i.setAttribute("x", 0), i.setAttribute("y", 0);
        var s = createElementID();
        r.setAttribute("id", s), r.appendChild(i), this.layerElement.setAttribute("clip-path", "url(" + getLocationHref() + "#" + s + ")"), e.appendChild(r), this.layers = t.layers, this.elements = createSizedArray(t.layers.length);
      }, SVGRendererBase.prototype.destroy = function() {
        this.animationItem.wrapper && (this.animationItem.wrapper.innerText = ""), this.layerElement = null, this.globalData.defs = null;
        var t, e = this.layers ? this.layers.length : 0;
        for (t = 0; t < e; t += 1)
          this.elements[t] && this.elements[t].destroy && this.elements[t].destroy();
        this.elements.length = 0, this.destroyed = !0, this.animationItem = null;
      }, SVGRendererBase.prototype.updateContainerSize = function() {
      }, SVGRendererBase.prototype.findIndexByInd = function(t) {
        var e = 0, r = this.layers.length;
        for (e = 0; e < r; e += 1)
          if (this.layers[e].ind === t)
            return e;
        return -1;
      }, SVGRendererBase.prototype.buildItem = function(t) {
        var e = this.elements;
        if (!(e[t] || this.layers[t].ty === 99)) {
          e[t] = !0;
          var r = this.createItem(this.layers[t]);
          if (e[t] = r, getExpressionsPlugin() && (this.layers[t].ty === 0 && this.globalData.projectInterface.registerComposition(r), r.initExpressions()), this.appendElementInPos(r, t), this.layers[t].tt) {
            var i = "tp" in this.layers[t] ? this.findIndexByInd(this.layers[t].tp) : t - 1;
            if (i === -1)
              return;
            if (!this.elements[i] || this.elements[i] === !0)
              this.buildItem(i), this.addPendingElement(r);
            else {
              var s = e[i], n = s.getMatte(this.layers[t].tt);
              r.setMatte(n);
            }
          }
        }
      }, SVGRendererBase.prototype.checkPendingElements = function() {
        for (; this.pendingElements.length; ) {
          var t = this.pendingElements.pop();
          if (t.checkParenting(), t.data.tt)
            for (var e = 0, r = this.elements.length; e < r; ) {
              if (this.elements[e] === t) {
                var i = "tp" in t.data ? this.findIndexByInd(t.data.tp) : e - 1, s = this.elements[i], n = s.getMatte(this.layers[e].tt);
                t.setMatte(n);
                break;
              }
              e += 1;
            }
        }
      }, SVGRendererBase.prototype.renderFrame = function(t) {
        if (!(this.renderedFrame === t || this.destroyed)) {
          t === null ? t = this.renderedFrame : this.renderedFrame = t, this.globalData.frameNum = t, this.globalData.frameId += 1, this.globalData.projectInterface.currentFrame = t, this.globalData._mdf = !1;
          var e, r = this.layers.length;
          for (this.completeLayers || this.checkLayers(t), e = r - 1; e >= 0; e -= 1)
            (this.completeLayers || this.elements[e]) && this.elements[e].prepareFrame(t - this.layers[e].st);
          if (this.globalData._mdf)
            for (e = 0; e < r; e += 1)
              (this.completeLayers || this.elements[e]) && this.elements[e].renderFrame();
        }
      }, SVGRendererBase.prototype.appendElementInPos = function(t, e) {
        var r = t.getBaseElement();
        if (r) {
          for (var i = 0, s; i < e; )
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
      extendPrototype([BaseElement, TransformElement, HierarchyElement, FrameElement, RenderableDOMElement], ICompElement), ICompElement.prototype.initElement = function(t, e, r) {
        this.initFrame(), this.initBaseData(t, e, r), this.initTransform(t, e, r), this.initRenderable(), this.initHierarchy(), this.initRendererElement(), this.createContainerElements(), this.createRenderableComponents(), (this.data.xt || !e.progressiveLoad) && this.buildAllItems(), this.hide();
      }, ICompElement.prototype.prepareFrame = function(t) {
        if (this._mdf = !1, this.prepareRenderableFrame(t), this.prepareProperties(t, this.isInRange), !(!this.isInRange && !this.data.xt)) {
          if (this.tm._placeholder)
            this.renderedFrame = t / this.data.sr;
          else {
            var e = this.tm.v;
            e === this.data.op && (e = this.data.op - 1), this.renderedFrame = e;
          }
          var r, i = this.elements.length;
          for (this.completeLayers || this.checkLayers(this.renderedFrame), r = i - 1; r >= 0; r -= 1)
            (this.completeLayers || this.elements[r]) && (this.elements[r].prepareFrame(this.renderedFrame - this.layers[r].st), this.elements[r]._mdf && (this._mdf = !0));
        }
      }, ICompElement.prototype.renderInnerContent = function() {
        var t, e = this.layers.length;
        for (t = 0; t < e; t += 1)
          (this.completeLayers || this.elements[t]) && this.elements[t].renderFrame();
      }, ICompElement.prototype.setElements = function(t) {
        this.elements = t;
      }, ICompElement.prototype.getElements = function() {
        return this.elements;
      }, ICompElement.prototype.destroyElements = function() {
        var t, e = this.layers.length;
        for (t = 0; t < e; t += 1)
          this.elements[t] && this.elements[t].destroy();
      }, ICompElement.prototype.destroy = function() {
        this.destroyElements(), this.destroyBaseElement();
      };
      function SVGCompElement(t, e, r) {
        this.layers = t.layers, this.supports3d = !0, this.completeLayers = !1, this.pendingElements = [], this.elements = this.layers ? createSizedArray(this.layers.length) : [], this.initElement(t, e, r), this.tm = t.tm ? PropertyFactory.getProp(this, t.tm, 0, e.frameRate, this) : {
          _placeholder: !0
        };
      }
      extendPrototype([SVGRendererBase, ICompElement, SVGBaseElement], SVGCompElement), SVGCompElement.prototype.createComp = function(t) {
        return new SVGCompElement(t, this.globalData, this);
      };
      function SVGRenderer(t, e) {
        this.animationItem = t, this.layers = null, this.renderedFrame = -1, this.svgElement = createNS("svg");
        var r = "";
        if (e && e.title) {
          var i = createNS("title"), s = createElementID();
          i.setAttribute("id", s), i.textContent = e.title, this.svgElement.appendChild(i), r += s;
        }
        if (e && e.description) {
          var n = createNS("desc"), a = createElementID();
          n.setAttribute("id", a), n.textContent = e.description, this.svgElement.appendChild(n), r += " " + a;
        }
        r && this.svgElement.setAttribute("aria-labelledby", r);
        var l = createNS("defs");
        this.svgElement.appendChild(l);
        var o = createNS("g");
        this.svgElement.appendChild(o), this.layerElement = o, this.renderConfig = {
          preserveAspectRatio: e && e.preserveAspectRatio || "xMidYMid meet",
          imagePreserveAspectRatio: e && e.imagePreserveAspectRatio || "xMidYMid slice",
          contentVisibility: e && e.contentVisibility || "visible",
          progressiveLoad: e && e.progressiveLoad || !1,
          hideOnTransparent: !(e && e.hideOnTransparent === !1),
          viewBoxOnly: e && e.viewBoxOnly || !1,
          viewBoxSize: e && e.viewBoxSize || !1,
          className: e && e.className || "",
          id: e && e.id || "",
          focusable: e && e.focusable,
          filterSize: {
            width: e && e.filterSize && e.filterSize.width || "100%",
            height: e && e.filterSize && e.filterSize.height || "100%",
            x: e && e.filterSize && e.filterSize.x || "0%",
            y: e && e.filterSize && e.filterSize.y || "0%"
          },
          width: e && e.width,
          height: e && e.height,
          runExpressions: !e || e.runExpressions === void 0 || e.runExpressions
        }, this.globalData = {
          _mdf: !1,
          frameNum: -1,
          defs: l,
          renderConfig: this.renderConfig
        }, this.elements = [], this.pendingElements = [], this.destroyed = !1, this.rendererType = "svg";
      }
      extendPrototype([SVGRendererBase], SVGRenderer), SVGRenderer.prototype.createComp = function(t) {
        return new SVGCompElement(t, this.globalData, this);
      };
      function ShapeTransformManager() {
        this.sequences = {}, this.sequenceList = [], this.transform_key_count = 0;
      }
      ShapeTransformManager.prototype = {
        addTransformSequence: function(e) {
          var r, i = e.length, s = "_";
          for (r = 0; r < i; r += 1)
            s += e[r].transform.key + "_";
          var n = this.sequences[s];
          return n || (n = {
            transforms: [].concat(e),
            finalTransform: new Matrix(),
            _mdf: !1
          }, this.sequences[s] = n, this.sequenceList.push(n)), n;
        },
        processSequence: function(e, r) {
          for (var i = 0, s = e.transforms.length, n = r; i < s && !r; ) {
            if (e.transforms[i].transform.mProps._mdf) {
              n = !0;
              break;
            }
            i += 1;
          }
          if (n)
            for (e.finalTransform.reset(), i = s - 1; i >= 0; i -= 1)
              e.finalTransform.multiply(e.transforms[i].transform.mProps.v);
          e._mdf = n;
        },
        processSequences: function(e) {
          var r, i = this.sequenceList.length;
          for (r = 0; r < i; r += 1)
            this.processSequence(this.sequenceList[r], e);
        },
        getNewKey: function() {
          return this.transform_key_count += 1, "_" + this.transform_key_count;
        }
      };
      var lumaLoader = function() {
        var e = "__lottie_element_luma_buffer", r = null, i = null, s = null;
        function n() {
          var o = createNS("svg"), p = createNS("filter"), u = createNS("feColorMatrix");
          return p.setAttribute("id", e), u.setAttribute("type", "matrix"), u.setAttribute("color-interpolation-filters", "sRGB"), u.setAttribute("values", "0.3, 0.3, 0.3, 0, 0, 0.3, 0.3, 0.3, 0, 0, 0.3, 0.3, 0.3, 0, 0, 0.3, 0.3, 0.3, 0, 0"), p.appendChild(u), o.appendChild(p), o.setAttribute("id", e + "_svg"), featureSupport.svgLumaHidden && (o.style.display = "none"), o;
        }
        function a() {
          r || (s = n(), document.body.appendChild(s), r = createTag("canvas"), i = r.getContext("2d"), i.filter = "url(#" + e + ")", i.fillStyle = "rgba(0,0,0,0)", i.fillRect(0, 0, 1, 1));
        }
        function l(o) {
          return r || a(), r.width = o.width, r.height = o.height, i.filter = "url(#" + e + ")", r;
        }
        return {
          load: a,
          get: l
        };
      };
      function createCanvas(t, e) {
        if (featureSupport.offscreenCanvas)
          return new OffscreenCanvas(t, e);
        var r = createTag("canvas");
        return r.width = t, r.height = e, r;
      }
      var assetLoader = (function() {
        return {
          loadLumaCanvas: lumaLoader.load,
          getLumaCanvas: lumaLoader.get,
          createCanvas
        };
      })(), registeredEffects = {};
      function CVEffects(t) {
        var e, r = t.data.ef ? t.data.ef.length : 0;
        this.filters = [];
        var i;
        for (e = 0; e < r; e += 1) {
          i = null;
          var s = t.data.ef[e].ty;
          if (registeredEffects[s]) {
            var n = registeredEffects[s].effect;
            i = new n(t.effectsManager.effectElements[e], t);
          }
          i && this.filters.push(i);
        }
        this.filters.length && t.addRenderableComponent(this);
      }
      CVEffects.prototype.renderFrame = function(t) {
        var e, r = this.filters.length;
        for (e = 0; e < r; e += 1)
          this.filters[e].renderFrame(t);
      }, CVEffects.prototype.getEffects = function(t) {
        var e, r = this.filters.length, i = [];
        for (e = 0; e < r; e += 1)
          this.filters[e].type === t && i.push(this.filters[e]);
        return i;
      };
      function registerEffect(t, e) {
        registeredEffects[t] = {
          effect: e
        };
      }
      function CVMaskElement(t, e) {
        this.data = t, this.element = e, this.masksProperties = this.data.masksProperties || [], this.viewData = createSizedArray(this.masksProperties.length);
        var r, i = this.masksProperties.length, s = !1;
        for (r = 0; r < i; r += 1)
          this.masksProperties[r].mode !== "n" && (s = !0), this.viewData[r] = ShapePropertyFactory.getShapeProp(this.element, this.masksProperties[r], 3);
        this.hasMasks = s, s && this.element.addRenderableComponent(this);
      }
      CVMaskElement.prototype.renderFrame = function() {
        if (this.hasMasks) {
          var t = this.element.finalTransform.mat, e = this.element.canvasContext, r, i = this.masksProperties.length, s, n, a;
          for (e.beginPath(), r = 0; r < i; r += 1)
            if (this.masksProperties[r].mode !== "n") {
              this.masksProperties[r].inv && (e.moveTo(0, 0), e.lineTo(this.element.globalData.compSize.w, 0), e.lineTo(this.element.globalData.compSize.w, this.element.globalData.compSize.h), e.lineTo(0, this.element.globalData.compSize.h), e.lineTo(0, 0)), a = this.viewData[r].v, s = t.applyToPointArray(a.v[0][0], a.v[0][1], 0), e.moveTo(s[0], s[1]);
              var l, o = a._length;
              for (l = 1; l < o; l += 1)
                n = t.applyToTriplePoints(a.o[l - 1], a.i[l], a.v[l]), e.bezierCurveTo(n[0], n[1], n[2], n[3], n[4], n[5]);
              n = t.applyToTriplePoints(a.o[l - 1], a.i[0], a.v[0]), e.bezierCurveTo(n[0], n[1], n[2], n[3], n[4], n[5]);
            }
          this.element.globalData.renderer.save(!0), e.clip();
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
            var e = this.globalData.canvasContext, r = assetLoader.createCanvas(e.canvas.width, e.canvas.height);
            this.buffers.push(r);
            var i = assetLoader.createCanvas(e.canvas.width, e.canvas.height);
            this.buffers.push(i), this.data.tt >= 3 && !document._isProxy && assetLoader.loadLumaCanvas();
          }
          this.canvasContext = this.globalData.canvasContext, this.transformCanvas = this.globalData.transformCanvas, this.renderableEffectsManager = new CVEffects(this), this.searchEffectTransforms();
        },
        createContent: function() {
        },
        setBlendMode: function() {
          var e = this.globalData;
          if (e.blendMode !== this.data.bm) {
            e.blendMode = this.data.bm;
            var r = getBlendMode(this.data.bm);
            e.canvasContext.globalCompositeOperation = r;
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
        clearCanvas: function(e) {
          e.clearRect(this.transformCanvas.tx, this.transformCanvas.ty, this.transformCanvas.w * this.transformCanvas.sx, this.transformCanvas.h * this.transformCanvas.sy);
        },
        prepareLayer: function() {
          if (this.data.tt >= 1) {
            var e = this.buffers[0], r = e.getContext("2d");
            this.clearCanvas(r), r.drawImage(this.canvasContext.canvas, 0, 0), this.currentTransform = this.canvasContext.getTransform(), this.canvasContext.setTransform(1, 0, 0, 1, 0, 0), this.clearCanvas(this.canvasContext), this.canvasContext.setTransform(this.currentTransform);
          }
        },
        exitLayer: function() {
          if (this.data.tt >= 1) {
            var e = this.buffers[1], r = e.getContext("2d");
            this.clearCanvas(r), r.drawImage(this.canvasContext.canvas, 0, 0), this.canvasContext.setTransform(1, 0, 0, 1, 0, 0), this.clearCanvas(this.canvasContext), this.canvasContext.setTransform(this.currentTransform);
            var i = this.comp.getElementById("tp" in this.data ? this.data.tp : this.data.ind - 1);
            if (i.renderFrame(!0), this.canvasContext.setTransform(1, 0, 0, 1, 0, 0), this.data.tt >= 3 && !document._isProxy) {
              var s = assetLoader.getLumaCanvas(this.canvasContext.canvas), n = s.getContext("2d");
              n.drawImage(this.canvasContext.canvas, 0, 0), this.clearCanvas(this.canvasContext), this.canvasContext.drawImage(s, 0, 0);
            }
            this.canvasContext.globalCompositeOperation = operationsMap[this.data.tt], this.canvasContext.drawImage(e, 0, 0), this.canvasContext.globalCompositeOperation = "destination-over", this.canvasContext.drawImage(this.buffers[0], 0, 0), this.canvasContext.setTransform(this.currentTransform), this.canvasContext.globalCompositeOperation = "source-over";
          }
        },
        renderFrame: function(e) {
          if (!(this.hidden || this.data.hd) && !(this.data.td === 1 && !e)) {
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
      function CVShapeData(t, e, r, i) {
        this.styledShapes = [], this.tr = [0, 0, 0, 0, 0, 0];
        var s = 4;
        e.ty === "rc" ? s = 5 : e.ty === "el" ? s = 6 : e.ty === "sr" && (s = 7), this.sh = ShapePropertyFactory.getShapeProp(t, e, s, t);
        var n, a = r.length, l;
        for (n = 0; n < a; n += 1)
          r[n].closed || (l = {
            transforms: i.addTransformSequence(r[n].transforms),
            trNodes: []
          }, this.styledShapes.push(l), r[n].elements.push(l));
      }
      CVShapeData.prototype.setAsAnimated = SVGShapeData.prototype.setAsAnimated;
      function CVShapeElement(t, e, r) {
        this.shapes = [], this.shapesData = t.shapes, this.stylesList = [], this.itemsData = [], this.prevViewData = [], this.shapeModifiers = [], this.processedElements = [], this.transformsManager = new ShapeTransformManager(), this.initElement(t, e, r);
      }
      extendPrototype([BaseElement, TransformElement, CVBaseElement, IShapeElement, HierarchyElement, FrameElement, RenderableElement], CVShapeElement), CVShapeElement.prototype.initElement = RenderableDOMElement.prototype.initElement, CVShapeElement.prototype.transformHelper = {
        opacity: 1,
        _opMdf: !1
      }, CVShapeElement.prototype.dashResetter = [], CVShapeElement.prototype.createContent = function() {
        this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, !0, []);
      }, CVShapeElement.prototype.createStyleElement = function(t, e) {
        var r = {
          data: t,
          type: t.ty,
          preTransforms: this.transformsManager.addTransformSequence(e),
          transforms: [],
          elements: [],
          closed: t.hd === !0
        }, i = {};
        if (t.ty === "fl" || t.ty === "st" ? (i.c = PropertyFactory.getProp(this, t.c, 1, 255, this), i.c.k || (r.co = "rgb(" + bmFloor(i.c.v[0]) + "," + bmFloor(i.c.v[1]) + "," + bmFloor(i.c.v[2]) + ")")) : (t.ty === "gf" || t.ty === "gs") && (i.s = PropertyFactory.getProp(this, t.s, 1, null, this), i.e = PropertyFactory.getProp(this, t.e, 1, null, this), i.h = PropertyFactory.getProp(this, t.h || {
          k: 0
        }, 0, 0.01, this), i.a = PropertyFactory.getProp(this, t.a || {
          k: 0
        }, 0, degToRads, this), i.g = new GradientProperty(this, t.g, this)), i.o = PropertyFactory.getProp(this, t.o, 0, 0.01, this), t.ty === "st" || t.ty === "gs") {
          if (r.lc = lineCapEnum[t.lc || 2], r.lj = lineJoinEnum[t.lj || 2], t.lj == 1 && (r.ml = t.ml), i.w = PropertyFactory.getProp(this, t.w, 0, null, this), i.w.k || (r.wi = i.w.v), t.d) {
            var s = new DashProperty(this, t.d, "canvas", this);
            i.d = s, i.d.k || (r.da = i.d.dashArray, r.do = i.d.dashoffset[0]);
          }
        } else
          r.r = t.r === 2 ? "evenodd" : "nonzero";
        return this.stylesList.push(r), i.style = r, i;
      }, CVShapeElement.prototype.createGroupElement = function() {
        var t = {
          it: [],
          prevViewData: []
        };
        return t;
      }, CVShapeElement.prototype.createTransformElement = function(t) {
        var e = {
          transform: {
            opacity: 1,
            _opMdf: !1,
            key: this.transformsManager.getNewKey(),
            op: PropertyFactory.getProp(this, t.o, 0, 0.01, this),
            mProps: TransformPropertyFactory.getTransformProperty(this, t, this)
          }
        };
        return e;
      }, CVShapeElement.prototype.createShapeElement = function(t) {
        var e = new CVShapeData(this, t, this.stylesList, this.transformsManager);
        return this.shapes.push(e), this.addShapeToModifiers(e), e;
      }, CVShapeElement.prototype.reloadShapes = function() {
        this._isFirstFrame = !0;
        var t, e = this.itemsData.length;
        for (t = 0; t < e; t += 1)
          this.prevViewData[t] = this.itemsData[t];
        for (this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, !0, []), e = this.dynamicProperties.length, t = 0; t < e; t += 1)
          this.dynamicProperties[t].getValue();
        this.renderModifiers(), this.transformsManager.processSequences(this._isFirstFrame);
      }, CVShapeElement.prototype.addTransformToStyleList = function(t) {
        var e, r = this.stylesList.length;
        for (e = 0; e < r; e += 1)
          this.stylesList[e].closed || this.stylesList[e].transforms.push(t);
      }, CVShapeElement.prototype.removeTransformFromStyleList = function() {
        var t, e = this.stylesList.length;
        for (t = 0; t < e; t += 1)
          this.stylesList[t].closed || this.stylesList[t].transforms.pop();
      }, CVShapeElement.prototype.closeStyles = function(t) {
        var e, r = t.length;
        for (e = 0; e < r; e += 1)
          t[e].closed = !0;
      }, CVShapeElement.prototype.searchShapes = function(t, e, r, i, s) {
        var n, a = t.length - 1, l, o, p = [], u = [], S, f, b, v = [].concat(s);
        for (n = a; n >= 0; n -= 1) {
          if (S = this.searchProcessedElement(t[n]), S ? e[n] = r[S - 1] : t[n]._shouldRender = i, t[n].ty === "fl" || t[n].ty === "st" || t[n].ty === "gf" || t[n].ty === "gs")
            S ? e[n].style.closed = !1 : e[n] = this.createStyleElement(t[n], v), p.push(e[n].style);
          else if (t[n].ty === "gr") {
            if (!S)
              e[n] = this.createGroupElement(t[n]);
            else
              for (o = e[n].it.length, l = 0; l < o; l += 1)
                e[n].prevViewData[l] = e[n].it[l];
            this.searchShapes(t[n].it, e[n].it, e[n].prevViewData, i, v);
          } else t[n].ty === "tr" ? (S || (b = this.createTransformElement(t[n]), e[n] = b), v.push(e[n]), this.addTransformToStyleList(e[n])) : t[n].ty === "sh" || t[n].ty === "rc" || t[n].ty === "el" || t[n].ty === "sr" ? S || (e[n] = this.createShapeElement(t[n])) : t[n].ty === "tm" || t[n].ty === "rd" || t[n].ty === "pb" || t[n].ty === "zz" || t[n].ty === "op" ? (S ? (f = e[n], f.closed = !1) : (f = ShapeModifiers.getModifier(t[n].ty), f.init(this, t[n]), e[n] = f, this.shapeModifiers.push(f)), u.push(f)) : t[n].ty === "rp" && (S ? (f = e[n], f.closed = !0) : (f = ShapeModifiers.getModifier(t[n].ty), e[n] = f, f.init(this, t, n, e), this.shapeModifiers.push(f), i = !1), u.push(f));
          this.addProcessedElement(t[n], n + 1);
        }
        for (this.removeTransformFromStyleList(), this.closeStyles(p), a = u.length, n = 0; n < a; n += 1)
          u[n].closed = !0;
      }, CVShapeElement.prototype.renderInnerContent = function() {
        this.transformHelper.opacity = 1, this.transformHelper._opMdf = !1, this.renderModifiers(), this.transformsManager.processSequences(this._isFirstFrame), this.renderShape(this.transformHelper, this.shapesData, this.itemsData, !0);
      }, CVShapeElement.prototype.renderShapeTransform = function(t, e) {
        (t._opMdf || e.op._mdf || this._isFirstFrame) && (e.opacity = t.opacity, e.opacity *= e.op.v, e._opMdf = !0);
      }, CVShapeElement.prototype.drawLayer = function() {
        var t, e = this.stylesList.length, r, i, s, n, a, l, o = this.globalData.renderer, p = this.globalData.canvasContext, u, S;
        for (t = 0; t < e; t += 1)
          if (S = this.stylesList[t], u = S.type, !((u === "st" || u === "gs") && S.wi === 0 || !S.data._shouldRender || S.coOp === 0 || this.globalData.currentGlobalAlpha === 0)) {
            for (o.save(), a = S.elements, u === "st" || u === "gs" ? (o.ctxStrokeStyle(u === "st" ? S.co : S.grd), o.ctxLineWidth(S.wi), o.ctxLineCap(S.lc), o.ctxLineJoin(S.lj), o.ctxMiterLimit(S.ml || 0)) : o.ctxFillStyle(u === "fl" ? S.co : S.grd), o.ctxOpacity(S.coOp), u !== "st" && u !== "gs" && p.beginPath(), o.ctxTransform(S.preTransforms.finalTransform.props), i = a.length, r = 0; r < i; r += 1) {
              for ((u === "st" || u === "gs") && (p.beginPath(), S.da && (p.setLineDash(S.da), p.lineDashOffset = S.do)), l = a[r].trNodes, n = l.length, s = 0; s < n; s += 1)
                l[s].t === "m" ? p.moveTo(l[s].p[0], l[s].p[1]) : l[s].t === "c" ? p.bezierCurveTo(l[s].pts[0], l[s].pts[1], l[s].pts[2], l[s].pts[3], l[s].pts[4], l[s].pts[5]) : p.closePath();
              (u === "st" || u === "gs") && (o.ctxStroke(), S.da && p.setLineDash(this.dashResetter));
            }
            u !== "st" && u !== "gs" && this.globalData.renderer.ctxFill(S.r), o.restore();
          }
      }, CVShapeElement.prototype.renderShape = function(t, e, r, i) {
        var s, n = e.length - 1, a;
        for (a = t, s = n; s >= 0; s -= 1)
          e[s].ty === "tr" ? (a = r[s].transform, this.renderShapeTransform(t, a)) : e[s].ty === "sh" || e[s].ty === "el" || e[s].ty === "rc" || e[s].ty === "sr" ? this.renderPath(e[s], r[s]) : e[s].ty === "fl" ? this.renderFill(e[s], r[s], a) : e[s].ty === "st" ? this.renderStroke(e[s], r[s], a) : e[s].ty === "gf" || e[s].ty === "gs" ? this.renderGradientFill(e[s], r[s], a) : e[s].ty === "gr" ? this.renderShape(a, e[s].it, r[s].it) : e[s].ty;
        i && this.drawLayer();
      }, CVShapeElement.prototype.renderStyledShape = function(t, e) {
        if (this._isFirstFrame || e._mdf || t.transforms._mdf) {
          var r = t.trNodes, i = e.paths, s, n, a, l = i._length;
          r.length = 0;
          var o = t.transforms.finalTransform;
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
          t.trNodes = r;
        }
      }, CVShapeElement.prototype.renderPath = function(t, e) {
        if (t.hd !== !0 && t._shouldRender) {
          var r, i = e.styledShapes.length;
          for (r = 0; r < i; r += 1)
            this.renderStyledShape(e.styledShapes[r], e.sh);
        }
      }, CVShapeElement.prototype.renderFill = function(t, e, r) {
        var i = e.style;
        (e.c._mdf || this._isFirstFrame) && (i.co = "rgb(" + bmFloor(e.c.v[0]) + "," + bmFloor(e.c.v[1]) + "," + bmFloor(e.c.v[2]) + ")"), (e.o._mdf || r._opMdf || this._isFirstFrame) && (i.coOp = e.o.v * r.opacity);
      }, CVShapeElement.prototype.renderGradientFill = function(t, e, r) {
        var i = e.style, s;
        if (!i.grd || e.g._mdf || e.s._mdf || e.e._mdf || t.t !== 1 && (e.h._mdf || e.a._mdf)) {
          var n = this.globalData.canvasContext, a = e.s.v, l = e.e.v;
          if (t.t === 1)
            s = n.createLinearGradient(a[0], a[1], l[0], l[1]);
          else {
            var o = Math.sqrt(Math.pow(a[0] - l[0], 2) + Math.pow(a[1] - l[1], 2)), p = Math.atan2(l[1] - a[1], l[0] - a[0]), u = e.h.v;
            u >= 1 ? u = 0.99 : u <= -1 && (u = -0.99);
            var S = o * u, f = Math.cos(p + e.a.v) * S + a[0], b = Math.sin(p + e.a.v) * S + a[1];
            s = n.createRadialGradient(f, b, 0, a[0], a[1], o);
          }
          var v, m = t.g.p, A = e.g.c, c = 1;
          for (v = 0; v < m; v += 1)
            e.g._hasOpacity && e.g._collapsable && (c = e.g.o[v * 2 + 1]), s.addColorStop(A[v * 4] / 100, "rgba(" + A[v * 4 + 1] + "," + A[v * 4 + 2] + "," + A[v * 4 + 3] + "," + c + ")");
          i.grd = s;
        }
        i.coOp = e.o.v * r.opacity;
      }, CVShapeElement.prototype.renderStroke = function(t, e, r) {
        var i = e.style, s = e.d;
        s && (s._mdf || this._isFirstFrame) && (i.da = s.dashArray, i.do = s.dashoffset[0]), (e.c._mdf || this._isFirstFrame) && (i.co = "rgb(" + bmFloor(e.c.v[0]) + "," + bmFloor(e.c.v[1]) + "," + bmFloor(e.c.v[2]) + ")"), (e.o._mdf || r._opMdf || this._isFirstFrame) && (i.coOp = e.o.v * r.opacity), (e.w._mdf || this._isFirstFrame) && (i.wi = e.w.v);
      }, CVShapeElement.prototype.destroy = function() {
        this.shapesData = null, this.globalData = null, this.canvasContext = null, this.stylesList.length = 0, this.itemsData.length = 0;
      };
      function CVTextElement(t, e, r) {
        this.textSpans = [], this.yOffset = 0, this.fillColorAnim = !1, this.strokeColorAnim = !1, this.strokeWidthAnim = !1, this.stroke = !1, this.fill = !1, this.justifyOffset = 0, this.currentRender = null, this.renderType = "canvas", this.values = {
          fill: "rgba(0,0,0,0)",
          stroke: "rgba(0,0,0,0)",
          sWidth: 0,
          fValue: ""
        }, this.initElement(t, e, r);
      }
      extendPrototype([BaseElement, TransformElement, CVBaseElement, HierarchyElement, FrameElement, RenderableElement, ITextElement], CVTextElement), CVTextElement.prototype.tHelper = createTag("canvas").getContext("2d"), CVTextElement.prototype.buildNewText = function() {
        var t = this.textProperty.currentData;
        this.renderedLetters = createSizedArray(t.l ? t.l.length : 0);
        var e = !1;
        t.fc ? (e = !0, this.values.fill = this.buildColor(t.fc)) : this.values.fill = "rgba(0,0,0,0)", this.fill = e;
        var r = !1;
        t.sc && (r = !0, this.values.stroke = this.buildColor(t.sc), this.values.sWidth = t.sw);
        var i = this.globalData.fontManager.getFontByName(t.f), s, n, a = t.l, l = this.mHelper;
        this.stroke = r, this.values.fValue = t.finalSize + "px " + this.globalData.fontManager.getFontByName(t.f).fFamily, n = t.finalText.length;
        var o, p, u, S, f, b, v, m, A, c, d = this.data.singleShape, h = t.tr * 1e-3 * t.finalSize, y = 0, P = 0, x = !0, _ = 0;
        for (s = 0; s < n; s += 1) {
          o = this.globalData.fontManager.getCharData(t.finalText[s], i.fStyle, this.globalData.fontManager.getFontByName(t.f).fFamily), p = o && o.data || {}, l.reset(), d && a[s].n && (y = -h, P += t.yOffset, P += x ? 1 : 0, x = !1), f = p.shapes ? p.shapes[0].it : [], v = f.length, l.scale(t.finalSize / 100, t.finalSize / 100), d && this.applyTextPropertiesToMatrix(t, l, a[s].line, y, P), A = createSizedArray(v - 1);
          var M = 0;
          for (b = 0; b < v; b += 1)
            if (f[b].ty === "sh") {
              for (S = f[b].ks.k.i.length, m = f[b].ks.k, c = [], u = 1; u < S; u += 1)
                u === 1 && c.push(l.applyToX(m.v[0][0], m.v[0][1], 0), l.applyToY(m.v[0][0], m.v[0][1], 0)), c.push(l.applyToX(m.o[u - 1][0], m.o[u - 1][1], 0), l.applyToY(m.o[u - 1][0], m.o[u - 1][1], 0), l.applyToX(m.i[u][0], m.i[u][1], 0), l.applyToY(m.i[u][0], m.i[u][1], 0), l.applyToX(m.v[u][0], m.v[u][1], 0), l.applyToY(m.v[u][0], m.v[u][1], 0));
              c.push(l.applyToX(m.o[u - 1][0], m.o[u - 1][1], 0), l.applyToY(m.o[u - 1][0], m.o[u - 1][1], 0), l.applyToX(m.i[0][0], m.i[0][1], 0), l.applyToY(m.i[0][0], m.i[0][1], 0), l.applyToX(m.v[0][0], m.v[0][1], 0), l.applyToY(m.v[0][0], m.v[0][1], 0)), A[M] = c, M += 1;
            }
          d && (y += a[s].l, y += h), this.textSpans[_] ? this.textSpans[_].elem = A : this.textSpans[_] = {
            elem: A
          }, _ += 1;
        }
      }, CVTextElement.prototype.renderInnerContent = function() {
        this.validateText();
        var t = this.canvasContext;
        t.font = this.values.fValue, this.globalData.renderer.ctxLineCap("butt"), this.globalData.renderer.ctxLineJoin("miter"), this.globalData.renderer.ctxMiterLimit(4), this.data.singleShape || this.textAnimator.getMeasures(this.textProperty.currentData, this.lettersChangedFlag);
        var e, r, i, s, n, a, l = this.textAnimator.renderedLetters, o = this.textProperty.currentData.l;
        r = o.length;
        var p, u = null, S = null, f = null, b, v, m = this.globalData.renderer;
        for (e = 0; e < r; e += 1)
          if (!o[e].n) {
            if (p = l[e], p && (m.save(), m.ctxTransform(p.p), m.ctxOpacity(p.o)), this.fill) {
              for (p && p.fc ? u !== p.fc && (m.ctxFillStyle(p.fc), u = p.fc) : u !== this.values.fill && (u = this.values.fill, m.ctxFillStyle(this.values.fill)), b = this.textSpans[e].elem, s = b.length, this.globalData.canvasContext.beginPath(), i = 0; i < s; i += 1)
                for (v = b[i], a = v.length, this.globalData.canvasContext.moveTo(v[0], v[1]), n = 2; n < a; n += 6)
                  this.globalData.canvasContext.bezierCurveTo(v[n], v[n + 1], v[n + 2], v[n + 3], v[n + 4], v[n + 5]);
              this.globalData.canvasContext.closePath(), m.ctxFill();
            }
            if (this.stroke) {
              for (p && p.sw ? f !== p.sw && (f = p.sw, m.ctxLineWidth(p.sw)) : f !== this.values.sWidth && (f = this.values.sWidth, m.ctxLineWidth(this.values.sWidth)), p && p.sc ? S !== p.sc && (S = p.sc, m.ctxStrokeStyle(p.sc)) : S !== this.values.stroke && (S = this.values.stroke, m.ctxStrokeStyle(this.values.stroke)), b = this.textSpans[e].elem, s = b.length, this.globalData.canvasContext.beginPath(), i = 0; i < s; i += 1)
                for (v = b[i], a = v.length, this.globalData.canvasContext.moveTo(v[0], v[1]), n = 2; n < a; n += 6)
                  this.globalData.canvasContext.bezierCurveTo(v[n], v[n + 1], v[n + 2], v[n + 3], v[n + 4], v[n + 5]);
              this.globalData.canvasContext.closePath(), m.ctxStroke();
            }
            p && this.globalData.renderer.restore();
          }
      };
      function CVImageElement(t, e, r) {
        this.assetData = e.getAssetData(t.refId), this.img = e.imageLoader.getAsset(this.assetData), this.initElement(t, e, r);
      }
      extendPrototype([BaseElement, TransformElement, CVBaseElement, HierarchyElement, FrameElement, RenderableElement], CVImageElement), CVImageElement.prototype.initElement = SVGShapeElement.prototype.initElement, CVImageElement.prototype.prepareFrame = IImageElement.prototype.prepareFrame, CVImageElement.prototype.createContent = function() {
        if (this.img.width && (this.assetData.w !== this.img.width || this.assetData.h !== this.img.height)) {
          var t = createTag("canvas");
          t.width = this.assetData.w, t.height = this.assetData.h;
          var e = t.getContext("2d"), r = this.img.width, i = this.img.height, s = r / i, n = this.assetData.w / this.assetData.h, a, l, o = this.assetData.pr || this.globalData.renderConfig.imagePreserveAspectRatio;
          s > n && o === "xMidYMid slice" || s < n && o !== "xMidYMid slice" ? (l = i, a = l * n) : (a = r, l = a / n), e.drawImage(this.img, (r - a) / 2, (i - l) / 2, a, l, 0, 0, this.assetData.w, this.assetData.h), this.img = t;
        }
      }, CVImageElement.prototype.renderInnerContent = function() {
        this.canvasContext.drawImage(this.img, 0, 0);
      }, CVImageElement.prototype.destroy = function() {
        this.img = null;
      };
      function CVSolidElement(t, e, r) {
        this.initElement(t, e, r);
      }
      extendPrototype([BaseElement, TransformElement, CVBaseElement, HierarchyElement, FrameElement, RenderableElement], CVSolidElement), CVSolidElement.prototype.initElement = SVGShapeElement.prototype.initElement, CVSolidElement.prototype.prepareFrame = IImageElement.prototype.prepareFrame, CVSolidElement.prototype.renderInnerContent = function() {
        this.globalData.renderer.ctxFillStyle(this.data.sc), this.globalData.renderer.ctxFillRect(0, 0, this.data.sw, this.data.sh);
      };
      function CanvasRendererBase() {
      }
      extendPrototype([BaseRenderer], CanvasRendererBase), CanvasRendererBase.prototype.createShape = function(t) {
        return new CVShapeElement(t, this.globalData, this);
      }, CanvasRendererBase.prototype.createText = function(t) {
        return new CVTextElement(t, this.globalData, this);
      }, CanvasRendererBase.prototype.createImage = function(t) {
        return new CVImageElement(t, this.globalData, this);
      }, CanvasRendererBase.prototype.createSolid = function(t) {
        return new CVSolidElement(t, this.globalData, this);
      }, CanvasRendererBase.prototype.createNull = SVGRenderer.prototype.createNull, CanvasRendererBase.prototype.ctxTransform = function(t) {
        t[0] === 1 && t[1] === 0 && t[4] === 0 && t[5] === 1 && t[12] === 0 && t[13] === 0 || this.canvasContext.transform(t[0], t[1], t[4], t[5], t[12], t[13]);
      }, CanvasRendererBase.prototype.ctxOpacity = function(t) {
        this.canvasContext.globalAlpha *= t < 0 ? 0 : t;
      }, CanvasRendererBase.prototype.ctxFillStyle = function(t) {
        this.canvasContext.fillStyle = t;
      }, CanvasRendererBase.prototype.ctxStrokeStyle = function(t) {
        this.canvasContext.strokeStyle = t;
      }, CanvasRendererBase.prototype.ctxLineWidth = function(t) {
        this.canvasContext.lineWidth = t;
      }, CanvasRendererBase.prototype.ctxLineCap = function(t) {
        this.canvasContext.lineCap = t;
      }, CanvasRendererBase.prototype.ctxLineJoin = function(t) {
        this.canvasContext.lineJoin = t;
      }, CanvasRendererBase.prototype.ctxMiterLimit = function(t) {
        this.canvasContext.miterLimit = t;
      }, CanvasRendererBase.prototype.ctxFill = function(t) {
        this.canvasContext.fill(t);
      }, CanvasRendererBase.prototype.ctxFillRect = function(t, e, r, i) {
        this.canvasContext.fillRect(t, e, r, i);
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
      }, CanvasRendererBase.prototype.restore = function(t) {
        if (!this.renderConfig.clearCanvas) {
          this.canvasContext.restore();
          return;
        }
        t && (this.globalData.blendMode = "source-over"), this.contextData.restore(t);
      }, CanvasRendererBase.prototype.configAnimation = function(t) {
        if (this.animationItem.wrapper) {
          this.animationItem.container = createTag("canvas");
          var e = this.animationItem.container.style;
          e.width = "100%", e.height = "100%";
          var r = "0px 0px 0px";
          e.transformOrigin = r, e.mozTransformOrigin = r, e.webkitTransformOrigin = r, e["-webkit-transform"] = r, e.contentVisibility = this.renderConfig.contentVisibility, this.animationItem.wrapper.appendChild(this.animationItem.container), this.canvasContext = this.animationItem.container.getContext("2d"), this.renderConfig.className && this.animationItem.container.setAttribute("class", this.renderConfig.className), this.renderConfig.id && this.animationItem.container.setAttribute("id", this.renderConfig.id);
        } else
          this.canvasContext = this.renderConfig.context;
        this.contextData.setContext(this.canvasContext), this.data = t, this.layers = t.layers, this.transformCanvas = {
          w: t.w,
          h: t.h,
          sx: 0,
          sy: 0,
          tx: 0,
          ty: 0
        }, this.setupGlobalData(t, document.body), this.globalData.canvasContext = this.canvasContext, this.globalData.renderer = this, this.globalData.isDashed = !1, this.globalData.progressiveLoad = this.renderConfig.progressiveLoad, this.globalData.transformCanvas = this.transformCanvas, this.elements = createSizedArray(t.layers.length), this.updateContainerSize();
      }, CanvasRendererBase.prototype.updateContainerSize = function(t, e) {
        this.reset();
        var r, i;
        t ? (r = t, i = e, this.canvasContext.canvas.width = r, this.canvasContext.canvas.height = i) : (this.animationItem.wrapper && this.animationItem.container ? (r = this.animationItem.wrapper.offsetWidth, i = this.animationItem.wrapper.offsetHeight) : (r = this.canvasContext.canvas.width, i = this.canvasContext.canvas.height), this.canvasContext.canvas.width = r * this.renderConfig.dpr, this.canvasContext.canvas.height = i * this.renderConfig.dpr);
        var s, n;
        if (this.renderConfig.preserveAspectRatio.indexOf("meet") !== -1 || this.renderConfig.preserveAspectRatio.indexOf("slice") !== -1) {
          var a = this.renderConfig.preserveAspectRatio.split(" "), l = a[1] || "meet", o = a[0] || "xMidYMid", p = o.substr(0, 4), u = o.substr(4);
          s = r / i, n = this.transformCanvas.w / this.transformCanvas.h, n > s && l === "meet" || n < s && l === "slice" ? (this.transformCanvas.sx = r / (this.transformCanvas.w / this.renderConfig.dpr), this.transformCanvas.sy = r / (this.transformCanvas.w / this.renderConfig.dpr)) : (this.transformCanvas.sx = i / (this.transformCanvas.h / this.renderConfig.dpr), this.transformCanvas.sy = i / (this.transformCanvas.h / this.renderConfig.dpr)), p === "xMid" && (n < s && l === "meet" || n > s && l === "slice") ? this.transformCanvas.tx = (r - this.transformCanvas.w * (i / this.transformCanvas.h)) / 2 * this.renderConfig.dpr : p === "xMax" && (n < s && l === "meet" || n > s && l === "slice") ? this.transformCanvas.tx = (r - this.transformCanvas.w * (i / this.transformCanvas.h)) * this.renderConfig.dpr : this.transformCanvas.tx = 0, u === "YMid" && (n > s && l === "meet" || n < s && l === "slice") ? this.transformCanvas.ty = (i - this.transformCanvas.h * (r / this.transformCanvas.w)) / 2 * this.renderConfig.dpr : u === "YMax" && (n > s && l === "meet" || n < s && l === "slice") ? this.transformCanvas.ty = (i - this.transformCanvas.h * (r / this.transformCanvas.w)) * this.renderConfig.dpr : this.transformCanvas.ty = 0;
        } else this.renderConfig.preserveAspectRatio === "none" ? (this.transformCanvas.sx = r / (this.transformCanvas.w / this.renderConfig.dpr), this.transformCanvas.sy = i / (this.transformCanvas.h / this.renderConfig.dpr), this.transformCanvas.tx = 0, this.transformCanvas.ty = 0) : (this.transformCanvas.sx = this.renderConfig.dpr, this.transformCanvas.sy = this.renderConfig.dpr, this.transformCanvas.tx = 0, this.transformCanvas.ty = 0);
        this.transformCanvas.props = [this.transformCanvas.sx, 0, 0, 0, 0, this.transformCanvas.sy, 0, 0, 0, 0, 1, 0, this.transformCanvas.tx, this.transformCanvas.ty, 0, 1], this.ctxTransform(this.transformCanvas.props), this.canvasContext.beginPath(), this.canvasContext.rect(0, 0, this.transformCanvas.w, this.transformCanvas.h), this.canvasContext.closePath(), this.canvasContext.clip(), this.renderFrame(this.renderedFrame, !0);
      }, CanvasRendererBase.prototype.destroy = function() {
        this.renderConfig.clearCanvas && this.animationItem.wrapper && (this.animationItem.wrapper.innerText = "");
        var t, e = this.layers ? this.layers.length : 0;
        for (t = e - 1; t >= 0; t -= 1)
          this.elements[t] && this.elements[t].destroy && this.elements[t].destroy();
        this.elements.length = 0, this.globalData.canvasContext = null, this.animationItem.container = null, this.destroyed = !0;
      }, CanvasRendererBase.prototype.renderFrame = function(t, e) {
        if (!(this.renderedFrame === t && this.renderConfig.clearCanvas === !0 && !e || this.destroyed || t === -1)) {
          this.renderedFrame = t, this.globalData.frameNum = t - this.animationItem._isFirstFrame, this.globalData.frameId += 1, this.globalData._mdf = !this.renderConfig.clearCanvas || e, this.globalData.projectInterface.currentFrame = t;
          var r, i = this.layers.length;
          for (this.completeLayers || this.checkLayers(t), r = i - 1; r >= 0; r -= 1)
            (this.completeLayers || this.elements[r]) && this.elements[r].prepareFrame(t - this.layers[r].st);
          if (this.globalData._mdf) {
            for (this.renderConfig.clearCanvas === !0 ? this.canvasContext.clearRect(0, 0, this.transformCanvas.w, this.transformCanvas.h) : this.save(), r = i - 1; r >= 0; r -= 1)
              (this.completeLayers || this.elements[r]) && this.elements[r].renderFrame();
            this.renderConfig.clearCanvas !== !0 && this.restore();
          }
        }
      }, CanvasRendererBase.prototype.buildItem = function(t) {
        var e = this.elements;
        if (!(e[t] || this.layers[t].ty === 99)) {
          var r = this.createItem(this.layers[t], this, this.globalData);
          e[t] = r, r.initExpressions();
        }
      }, CanvasRendererBase.prototype.checkPendingElements = function() {
        for (; this.pendingElements.length; ) {
          var t = this.pendingElements.pop();
          t.checkParenting();
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
        var t, e = 15;
        for (t = 0; t < e; t += 1) {
          var r = new CanvasContext();
          this.stack[t] = r;
        }
        this._length = e, this.nativeContext = null, this.transformMat = new Matrix(), this.currentOpacity = 1, this.currentFillStyle = "", this.appliedFillStyle = "", this.currentStrokeStyle = "", this.appliedStrokeStyle = "", this.currentLineWidth = "", this.appliedLineWidth = "", this.currentLineCap = "", this.appliedLineCap = "", this.currentLineJoin = "", this.appliedLineJoin = "", this.appliedMiterLimit = "", this.currentMiterLimit = "";
      }
      CVContextData.prototype.duplicate = function() {
        var t = this._length * 2, e = 0;
        for (e = this._length; e < t; e += 1)
          this.stack[e] = new CanvasContext();
        this._length = t;
      }, CVContextData.prototype.reset = function() {
        this.cArrPos = 0, this.cTr.reset(), this.stack[this.cArrPos].opacity = 1;
      }, CVContextData.prototype.restore = function(t) {
        this.cArrPos -= 1;
        var e = this.stack[this.cArrPos], r = e.transform, i, s = this.cTr.props;
        for (i = 0; i < 16; i += 1)
          s[i] = r[i];
        if (t) {
          this.nativeContext.restore();
          var n = this.stack[this.cArrPos + 1];
          this.appliedFillStyle = n.fillStyle, this.appliedStrokeStyle = n.strokeStyle, this.appliedLineWidth = n.lineWidth, this.appliedLineCap = n.lineCap, this.appliedLineJoin = n.lineJoin, this.appliedMiterLimit = n.miterLimit;
        }
        this.nativeContext.setTransform(r[0], r[1], r[4], r[5], r[12], r[13]), (t || e.opacity !== -1 && this.currentOpacity !== e.opacity) && (this.nativeContext.globalAlpha = e.opacity, this.currentOpacity = e.opacity), this.currentFillStyle = e.fillStyle, this.currentStrokeStyle = e.strokeStyle, this.currentLineWidth = e.lineWidth, this.currentLineCap = e.lineCap, this.currentLineJoin = e.lineJoin, this.currentMiterLimit = e.miterLimit;
      }, CVContextData.prototype.save = function(t) {
        t && this.nativeContext.save();
        var e = this.cTr.props;
        this._length <= this.cArrPos && this.duplicate();
        var r = this.stack[this.cArrPos], i;
        for (i = 0; i < 16; i += 1)
          r.transform[i] = e[i];
        this.cArrPos += 1;
        var s = this.stack[this.cArrPos];
        s.opacity = r.opacity, s.fillStyle = r.fillStyle, s.strokeStyle = r.strokeStyle, s.lineWidth = r.lineWidth, s.lineCap = r.lineCap, s.lineJoin = r.lineJoin, s.miterLimit = r.miterLimit;
      }, CVContextData.prototype.setOpacity = function(t) {
        this.stack[this.cArrPos].opacity = t;
      }, CVContextData.prototype.setContext = function(t) {
        this.nativeContext = t;
      }, CVContextData.prototype.fillStyle = function(t) {
        this.stack[this.cArrPos].fillStyle !== t && (this.currentFillStyle = t, this.stack[this.cArrPos].fillStyle = t);
      }, CVContextData.prototype.strokeStyle = function(t) {
        this.stack[this.cArrPos].strokeStyle !== t && (this.currentStrokeStyle = t, this.stack[this.cArrPos].strokeStyle = t);
      }, CVContextData.prototype.lineWidth = function(t) {
        this.stack[this.cArrPos].lineWidth !== t && (this.currentLineWidth = t, this.stack[this.cArrPos].lineWidth = t);
      }, CVContextData.prototype.lineCap = function(t) {
        this.stack[this.cArrPos].lineCap !== t && (this.currentLineCap = t, this.stack[this.cArrPos].lineCap = t);
      }, CVContextData.prototype.lineJoin = function(t) {
        this.stack[this.cArrPos].lineJoin !== t && (this.currentLineJoin = t, this.stack[this.cArrPos].lineJoin = t);
      }, CVContextData.prototype.miterLimit = function(t) {
        this.stack[this.cArrPos].miterLimit !== t && (this.currentMiterLimit = t, this.stack[this.cArrPos].miterLimit = t);
      }, CVContextData.prototype.transform = function(t) {
        this.transformMat.cloneFromProps(t);
        var e = this.cTr;
        this.transformMat.multiply(e), e.cloneFromProps(this.transformMat.props);
        var r = e.props;
        this.nativeContext.setTransform(r[0], r[1], r[4], r[5], r[12], r[13]);
      }, CVContextData.prototype.opacity = function(t) {
        var e = this.stack[this.cArrPos].opacity;
        e *= t < 0 ? 0 : t, this.stack[this.cArrPos].opacity !== e && (this.currentOpacity !== t && (this.nativeContext.globalAlpha = t, this.currentOpacity = t), this.stack[this.cArrPos].opacity = e);
      }, CVContextData.prototype.fill = function(t) {
        this.appliedFillStyle !== this.currentFillStyle && (this.appliedFillStyle = this.currentFillStyle, this.nativeContext.fillStyle = this.appliedFillStyle), this.nativeContext.fill(t);
      }, CVContextData.prototype.fillRect = function(t, e, r, i) {
        this.appliedFillStyle !== this.currentFillStyle && (this.appliedFillStyle = this.currentFillStyle, this.nativeContext.fillStyle = this.appliedFillStyle), this.nativeContext.fillRect(t, e, r, i);
      }, CVContextData.prototype.stroke = function() {
        this.appliedStrokeStyle !== this.currentStrokeStyle && (this.appliedStrokeStyle = this.currentStrokeStyle, this.nativeContext.strokeStyle = this.appliedStrokeStyle), this.appliedLineWidth !== this.currentLineWidth && (this.appliedLineWidth = this.currentLineWidth, this.nativeContext.lineWidth = this.appliedLineWidth), this.appliedLineCap !== this.currentLineCap && (this.appliedLineCap = this.currentLineCap, this.nativeContext.lineCap = this.appliedLineCap), this.appliedLineJoin !== this.currentLineJoin && (this.appliedLineJoin = this.currentLineJoin, this.nativeContext.lineJoin = this.appliedLineJoin), this.appliedMiterLimit !== this.currentMiterLimit && (this.appliedMiterLimit = this.currentMiterLimit, this.nativeContext.miterLimit = this.appliedMiterLimit), this.nativeContext.stroke();
      };
      function CVCompElement(t, e, r) {
        this.completeLayers = !1, this.layers = t.layers, this.pendingElements = [], this.elements = createSizedArray(this.layers.length), this.initElement(t, e, r), this.tm = t.tm ? PropertyFactory.getProp(this, t.tm, 0, e.frameRate, this) : {
          _placeholder: !0
        };
      }
      extendPrototype([CanvasRendererBase, ICompElement, CVBaseElement], CVCompElement), CVCompElement.prototype.renderInnerContent = function() {
        var t = this.canvasContext;
        t.beginPath(), t.moveTo(0, 0), t.lineTo(this.data.w, 0), t.lineTo(this.data.w, this.data.h), t.lineTo(0, this.data.h), t.lineTo(0, 0), t.clip();
        var e, r = this.layers.length;
        for (e = r - 1; e >= 0; e -= 1)
          (this.completeLayers || this.elements[e]) && this.elements[e].renderFrame();
      }, CVCompElement.prototype.destroy = function() {
        var t, e = this.layers.length;
        for (t = e - 1; t >= 0; t -= 1)
          this.elements[t] && this.elements[t].destroy();
        this.layers = null, this.elements = null;
      }, CVCompElement.prototype.createComp = function(t) {
        return new CVCompElement(t, this.globalData, this);
      };
      function CanvasRenderer(t, e) {
        this.animationItem = t, this.renderConfig = {
          clearCanvas: e && e.clearCanvas !== void 0 ? e.clearCanvas : !0,
          context: e && e.context || null,
          progressiveLoad: e && e.progressiveLoad || !1,
          preserveAspectRatio: e && e.preserveAspectRatio || "xMidYMid meet",
          imagePreserveAspectRatio: e && e.imagePreserveAspectRatio || "xMidYMid slice",
          contentVisibility: e && e.contentVisibility || "visible",
          className: e && e.className || "",
          id: e && e.id || "",
          runExpressions: !e || e.runExpressions === void 0 || e.runExpressions
        }, this.renderConfig.dpr = e && e.dpr || 1, this.animationItem.wrapper && (this.renderConfig.dpr = e && e.dpr || window.devicePixelRatio || 1), this.renderedFrame = -1, this.globalData = {
          frameNum: -1,
          _mdf: !1,
          renderConfig: this.renderConfig,
          currentGlobalAlpha: -1
        }, this.contextData = new CVContextData(), this.elements = [], this.pendingElements = [], this.transformMat = new Matrix(), this.completeLayers = !1, this.rendererType = "canvas", this.renderConfig.clearCanvas && (this.ctxTransform = this.contextData.transform.bind(this.contextData), this.ctxOpacity = this.contextData.opacity.bind(this.contextData), this.ctxFillStyle = this.contextData.fillStyle.bind(this.contextData), this.ctxStrokeStyle = this.contextData.strokeStyle.bind(this.contextData), this.ctxLineWidth = this.contextData.lineWidth.bind(this.contextData), this.ctxLineCap = this.contextData.lineCap.bind(this.contextData), this.ctxLineJoin = this.contextData.lineJoin.bind(this.contextData), this.ctxMiterLimit = this.contextData.miterLimit.bind(this.contextData), this.ctxFill = this.contextData.fill.bind(this.contextData), this.ctxFillRect = this.contextData.fillRect.bind(this.contextData), this.ctxStroke = this.contextData.stroke.bind(this.contextData), this.save = this.contextData.save.bind(this.contextData));
      }
      extendPrototype([CanvasRendererBase], CanvasRenderer), CanvasRenderer.prototype.createComp = function(t) {
        return new CVCompElement(t, this.globalData, this);
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
          var e = this.transformedElement ? this.transformedElement.style : {};
          if (this.finalTransform._matMdf) {
            var r = this.finalTransform.mat.toCSS();
            e.transform = r, e.webkitTransform = r;
          }
          this.finalTransform._opMdf && (e.opacity = this.finalTransform.mProp.o.v);
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
      function HSolidElement(t, e, r) {
        this.initElement(t, e, r);
      }
      extendPrototype([BaseElement, TransformElement, HBaseElement, HierarchyElement, FrameElement, RenderableDOMElement], HSolidElement), HSolidElement.prototype.createContent = function() {
        var t;
        this.data.hasMask ? (t = createNS("rect"), t.setAttribute("width", this.data.sw), t.setAttribute("height", this.data.sh), t.setAttribute("fill", this.data.sc), this.svgElement.setAttribute("width", this.data.sw), this.svgElement.setAttribute("height", this.data.sh)) : (t = createTag("div"), t.style.width = this.data.sw + "px", t.style.height = this.data.sh + "px", t.style.backgroundColor = this.data.sc), this.layerElement.appendChild(t);
      };
      function HShapeElement(t, e, r) {
        this.shapes = [], this.shapesData = t.shapes, this.stylesList = [], this.shapeModifiers = [], this.itemsData = [], this.processedElements = [], this.animatedContents = [], this.shapesContainer = createNS("g"), this.initElement(t, e, r), this.prevViewData = [], this.currentBBox = {
          x: 999999,
          y: -999999,
          h: 0,
          w: 0
        };
      }
      extendPrototype([BaseElement, TransformElement, HSolidElement, SVGShapeElement, HBaseElement, HierarchyElement, FrameElement, RenderableElement], HShapeElement), HShapeElement.prototype._renderShapeFrame = HShapeElement.prototype.renderInnerContent, HShapeElement.prototype.createContent = function() {
        var t;
        if (this.baseElement.style.fontSize = 0, this.data.hasMask)
          this.layerElement.appendChild(this.shapesContainer), t = this.svgElement;
        else {
          t = createNS("svg");
          var e = this.comp.data ? this.comp.data : this.globalData.compSize;
          t.setAttribute("width", e.w), t.setAttribute("height", e.h), t.appendChild(this.shapesContainer), this.layerElement.appendChild(t);
        }
        this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, this.shapesContainer, 0, [], !0), this.filterUniqueShapes(), this.shapeCont = t;
      }, HShapeElement.prototype.getTransformedPoint = function(t, e) {
        var r, i = t.length;
        for (r = 0; r < i; r += 1)
          e = t[r].mProps.v.applyToPointArray(e[0], e[1], 0);
        return e;
      }, HShapeElement.prototype.calculateShapeBoundingBox = function(t, e) {
        var r = t.sh.v, i = t.transformers, s, n = r._length, a, l, o, p;
        if (!(n <= 1)) {
          for (s = 0; s < n - 1; s += 1)
            a = this.getTransformedPoint(i, r.v[s]), l = this.getTransformedPoint(i, r.o[s]), o = this.getTransformedPoint(i, r.i[s + 1]), p = this.getTransformedPoint(i, r.v[s + 1]), this.checkBounds(a, l, o, p, e);
          r.c && (a = this.getTransformedPoint(i, r.v[s]), l = this.getTransformedPoint(i, r.o[s]), o = this.getTransformedPoint(i, r.i[0]), p = this.getTransformedPoint(i, r.v[0]), this.checkBounds(a, l, o, p, e));
        }
      }, HShapeElement.prototype.checkBounds = function(t, e, r, i, s) {
        this.getBoundsOfCurve(t, e, r, i);
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
      }, HShapeElement.prototype.getBoundsOfCurve = function(t, e, r, i) {
        for (var s = [[t[0], i[0]], [t[1], i[1]]], n, a, l, o, p, u, S, f = 0; f < 2; ++f)
          a = 6 * t[f] - 12 * e[f] + 6 * r[f], n = -3 * t[f] + 9 * e[f] - 9 * r[f] + 3 * i[f], l = 3 * e[f] - 3 * t[f], a |= 0, n |= 0, l |= 0, n === 0 && a === 0 || (n === 0 ? (o = -l / a, o > 0 && o < 1 && s[f].push(this.calculateF(o, t, e, r, i, f))) : (p = a * a - 4 * l * n, p >= 0 && (u = (-a + bmSqrt(p)) / (2 * n), u > 0 && u < 1 && s[f].push(this.calculateF(u, t, e, r, i, f)), S = (-a - bmSqrt(p)) / (2 * n), S > 0 && S < 1 && s[f].push(this.calculateF(S, t, e, r, i, f)))));
        this.shapeBoundingBox.left = bmMin.apply(null, s[0]), this.shapeBoundingBox.top = bmMin.apply(null, s[1]), this.shapeBoundingBox.right = bmMax.apply(null, s[0]), this.shapeBoundingBox.bottom = bmMax.apply(null, s[1]);
      }, HShapeElement.prototype.calculateF = function(t, e, r, i, s, n) {
        return bmPow(1 - t, 3) * e[n] + 3 * bmPow(1 - t, 2) * t * r[n] + 3 * (1 - t) * bmPow(t, 2) * i[n] + bmPow(t, 3) * s[n];
      }, HShapeElement.prototype.calculateBoundingBox = function(t, e) {
        var r, i = t.length;
        for (r = 0; r < i; r += 1)
          t[r] && t[r].sh ? this.calculateShapeBoundingBox(t[r], e) : t[r] && t[r].it ? this.calculateBoundingBox(t[r].it, e) : t[r] && t[r].style && t[r].w && this.expandStrokeBoundingBox(t[r].w, e);
      }, HShapeElement.prototype.expandStrokeBoundingBox = function(t, e) {
        var r = 0;
        if (t.keyframes) {
          for (var i = 0; i < t.keyframes.length; i += 1) {
            var s = t.keyframes[i].s;
            s > r && (r = s);
          }
          r *= t.mult;
        } else
          r = t.v * t.mult;
        e.x -= r, e.xMax += r, e.y -= r, e.yMax += r;
      }, HShapeElement.prototype.currentBoxContains = function(t) {
        return this.currentBBox.x <= t.x && this.currentBBox.y <= t.y && this.currentBBox.width + this.currentBBox.x >= t.x + t.width && this.currentBBox.height + this.currentBBox.y >= t.y + t.height;
      }, HShapeElement.prototype.renderInnerContent = function() {
        if (this._renderShapeFrame(), !this.hidden && (this._isFirstFrame || this._mdf)) {
          var t = this.tempBoundingBox, e = 999999;
          if (t.x = e, t.xMax = -e, t.y = e, t.yMax = -e, this.calculateBoundingBox(this.itemsData, t), t.width = t.xMax < t.x ? 0 : t.xMax - t.x, t.height = t.yMax < t.y ? 0 : t.yMax - t.y, this.currentBoxContains(t))
            return;
          var r = !1;
          if (this.currentBBox.w !== t.width && (this.currentBBox.w = t.width, this.shapeCont.setAttribute("width", t.width), r = !0), this.currentBBox.h !== t.height && (this.currentBBox.h = t.height, this.shapeCont.setAttribute("height", t.height), r = !0), r || this.currentBBox.x !== t.x || this.currentBBox.y !== t.y) {
            this.currentBBox.w = t.width, this.currentBBox.h = t.height, this.currentBBox.x = t.x, this.currentBBox.y = t.y, this.shapeCont.setAttribute("viewBox", this.currentBBox.x + " " + this.currentBBox.y + " " + this.currentBBox.w + " " + this.currentBBox.h);
            var i = this.shapeCont.style, s = "translate(" + this.currentBBox.x + "px," + this.currentBBox.y + "px)";
            i.transform = s, i.webkitTransform = s;
          }
        }
      };
      function HTextElement(t, e, r) {
        this.textSpans = [], this.textPaths = [], this.currentBBox = {
          x: 999999,
          y: -999999,
          h: 0,
          w: 0
        }, this.renderType = "svg", this.isMasked = !1, this.initElement(t, e, r);
      }
      extendPrototype([BaseElement, TransformElement, HBaseElement, HierarchyElement, FrameElement, RenderableDOMElement, ITextElement], HTextElement), HTextElement.prototype.createContent = function() {
        if (this.isMasked = this.checkMasks(), this.isMasked) {
          this.renderType = "svg", this.compW = this.comp.data.w, this.compH = this.comp.data.h, this.svgElement.setAttribute("width", this.compW), this.svgElement.setAttribute("height", this.compH);
          var t = createNS("g");
          this.maskedElement.appendChild(t), this.innerElem = t;
        } else
          this.renderType = "html", this.innerElem = this.layerElement;
        this.checkParenting();
      }, HTextElement.prototype.buildNewText = function() {
        var t = this.textProperty.currentData;
        this.renderedLetters = createSizedArray(t.l ? t.l.length : 0);
        var e = this.innerElem.style, r = t.fc ? this.buildColor(t.fc) : "rgba(0,0,0,0)";
        e.fill = r, e.color = r, t.sc && (e.stroke = this.buildColor(t.sc), e.strokeWidth = t.sw + "px");
        var i = this.globalData.fontManager.getFontByName(t.f);
        if (!this.globalData.fontManager.chars)
          if (e.fontSize = t.finalSize + "px", e.lineHeight = t.finalSize + "px", i.fClass)
            this.innerElem.className = i.fClass;
          else {
            e.fontFamily = i.fFamily;
            var s = t.fWeight, n = t.fStyle;
            e.fontStyle = n, e.fontWeight = s;
          }
        var a, l, o = t.l;
        l = o.length;
        var p, u, S, f = this.mHelper, b, v = "", m = 0;
        for (a = 0; a < l; a += 1) {
          if (this.globalData.fontManager.chars ? (this.textPaths[m] ? p = this.textPaths[m] : (p = createNS("path"), p.setAttribute("stroke-linecap", lineCapEnum[1]), p.setAttribute("stroke-linejoin", lineJoinEnum[2]), p.setAttribute("stroke-miterlimit", "4")), this.isMasked || (this.textSpans[m] ? (u = this.textSpans[m], S = u.children[0]) : (u = createTag("div"), u.style.lineHeight = 0, S = createNS("svg"), S.appendChild(p), styleDiv(u)))) : this.isMasked ? p = this.textPaths[m] ? this.textPaths[m] : createNS("text") : this.textSpans[m] ? (u = this.textSpans[m], p = this.textPaths[m]) : (u = createTag("span"), styleDiv(u), p = createTag("span"), styleDiv(p), u.appendChild(p)), this.globalData.fontManager.chars) {
            var A = this.globalData.fontManager.getCharData(t.finalText[a], i.fStyle, this.globalData.fontManager.getFontByName(t.f).fFamily), c;
            if (A ? c = A.data : c = null, f.reset(), c && c.shapes && c.shapes.length && (b = c.shapes[0].it, f.scale(t.finalSize / 100, t.finalSize / 100), v = this.createPathShape(f, b), p.setAttribute("d", v)), this.isMasked)
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
            var P = p.style, x = "translate3d(0," + -t.finalSize / 1.2 + "px,0)";
            P.transform = x, P.webkitTransform = x;
          }
          this.isMasked ? this.textSpans[m] = p : this.textSpans[m] = u, this.textSpans[m].style.display = "block", this.textPaths[m] = p, m += 1;
        }
        for (; m < this.textSpans.length; )
          this.textSpans[m].style.display = "none", m += 1;
      }, HTextElement.prototype.renderInnerContent = function() {
        this.validateText();
        var t;
        if (this.data.singleShape) {
          if (!this._isFirstFrame && !this.lettersChangedFlag)
            return;
          if (this.isMasked && this.finalTransform._matMdf) {
            this.svgElement.setAttribute("viewBox", -this.finalTransform.mProp.p.v[0] + " " + -this.finalTransform.mProp.p.v[1] + " " + this.compW + " " + this.compH), t = this.svgElement.style;
            var e = "translate(" + -this.finalTransform.mProp.p.v[0] + "px," + -this.finalTransform.mProp.p.v[1] + "px)";
            t.transform = e, t.webkitTransform = e;
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
              this.currentBBox.w = u.width + S * 2, this.currentBBox.h = u.height + S * 2, this.currentBBox.x = u.x - S, this.currentBBox.y = u.y - S, this.svgElement.setAttribute("viewBox", this.currentBBox.x + " " + this.currentBBox.y + " " + this.currentBBox.w + " " + this.currentBBox.h), t = this.svgElement.style;
              var f = "translate(" + this.currentBBox.x + "px," + this.currentBBox.y + "px)";
              t.transform = f, t.webkitTransform = f;
            }
          }
        }
      };
      function HCameraElement(t, e, r) {
        this.initFrame(), this.initBaseData(t, e, r), this.initHierarchy();
        var i = PropertyFactory.getProp;
        if (this.pe = i(this, t.pe, 0, 0, this), t.ks.p.s ? (this.px = i(this, t.ks.p.x, 1, 0, this), this.py = i(this, t.ks.p.y, 1, 0, this), this.pz = i(this, t.ks.p.z, 1, 0, this)) : this.p = i(this, t.ks.p, 1, 0, this), t.ks.a && (this.a = i(this, t.ks.a, 1, 0, this)), t.ks.or.k.length && t.ks.or.k[0].to) {
          var s, n = t.ks.or.k.length;
          for (s = 0; s < n; s += 1)
            t.ks.or.k[s].to = null, t.ks.or.k[s].ti = null;
        }
        this.or = i(this, t.ks.or, 1, degToRads, this), this.or.sh = !0, this.rx = i(this, t.ks.rx, 0, degToRads, this), this.ry = i(this, t.ks.ry, 0, degToRads, this), this.rz = i(this, t.ks.rz, 0, degToRads, this), this.mat = new Matrix(), this._prevMat = new Matrix(), this._isFirstFrame = !0, this.finalTransform = {
          mProp: this
        };
      }
      extendPrototype([BaseElement, FrameElement, HierarchyElement], HCameraElement), HCameraElement.prototype.setup = function() {
        var t, e = this.comp.threeDElements.length, r, i, s;
        for (t = 0; t < e; t += 1)
          if (r = this.comp.threeDElements[t], r.type === "3d") {
            i = r.perspectiveElem.style, s = r.container.style;
            var n = this.pe.v + "px", a = "0px 0px 0px", l = "matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)";
            i.perspective = n, i.webkitPerspective = n, s.transformOrigin = a, s.mozTransformOrigin = a, s.webkitTransformOrigin = a, i.transform = l, i.webkitTransform = l;
          }
      }, HCameraElement.prototype.createElements = function() {
      }, HCameraElement.prototype.hide = function() {
      }, HCameraElement.prototype.renderFrame = function() {
        var t = this._isFirstFrame, e, r;
        if (this.hierarchy)
          for (r = this.hierarchy.length, e = 0; e < r; e += 1)
            t = this.hierarchy[e].finalTransform.mProp._mdf || t;
        if (t || this.pe._mdf || this.p && this.p._mdf || this.px && (this.px._mdf || this.py._mdf || this.pz._mdf) || this.rx._mdf || this.ry._mdf || this.rz._mdf || this.or._mdf || this.a && this.a._mdf) {
          if (this.mat.reset(), this.hierarchy)
            for (r = this.hierarchy.length - 1, e = r; e >= 0; e -= 1) {
              var i = this.hierarchy[e].finalTransform.mProp;
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
            for (e = 0; e < r; e += 1)
              if (S = this.comp.threeDElements[e], S.type === "3d") {
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
      }, HCameraElement.prototype.prepareFrame = function(t) {
        this.prepareProperties(t, !0);
      }, HCameraElement.prototype.destroy = function() {
      }, HCameraElement.prototype.getBaseElement = function() {
        return null;
      };
      function HImageElement(t, e, r) {
        this.assetData = e.getAssetData(t.refId), this.initElement(t, e, r);
      }
      extendPrototype([BaseElement, TransformElement, HBaseElement, HSolidElement, HierarchyElement, FrameElement, RenderableElement], HImageElement), HImageElement.prototype.createContent = function() {
        var t = this.globalData.getAssetsPath(this.assetData), e = new Image();
        this.data.hasMask ? (this.imageElem = createNS("image"), this.imageElem.setAttribute("width", this.assetData.w + "px"), this.imageElem.setAttribute("height", this.assetData.h + "px"), this.imageElem.setAttributeNS("http://www.w3.org/1999/xlink", "href", t), this.layerElement.appendChild(this.imageElem), this.baseElement.setAttribute("width", this.assetData.w), this.baseElement.setAttribute("height", this.assetData.h)) : this.layerElement.appendChild(e), e.crossOrigin = "anonymous", e.src = t, this.data.ln && this.baseElement.setAttribute("id", this.data.ln);
      };
      function HybridRendererBase(t, e) {
        this.animationItem = t, this.layers = null, this.renderedFrame = -1, this.renderConfig = {
          className: e && e.className || "",
          imagePreserveAspectRatio: e && e.imagePreserveAspectRatio || "xMidYMid slice",
          hideOnTransparent: !(e && e.hideOnTransparent === !1),
          filterSize: {
            width: e && e.filterSize && e.filterSize.width || "400%",
            height: e && e.filterSize && e.filterSize.height || "400%",
            x: e && e.filterSize && e.filterSize.x || "-100%",
            y: e && e.filterSize && e.filterSize.y || "-100%"
          }
        }, this.globalData = {
          _mdf: !1,
          frameNum: -1,
          renderConfig: this.renderConfig
        }, this.pendingElements = [], this.elements = [], this.threeDElements = [], this.destroyed = !1, this.camera = null, this.supports3d = !0, this.rendererType = "html";
      }
      extendPrototype([BaseRenderer], HybridRendererBase), HybridRendererBase.prototype.buildItem = SVGRenderer.prototype.buildItem, HybridRendererBase.prototype.checkPendingElements = function() {
        for (; this.pendingElements.length; ) {
          var t = this.pendingElements.pop();
          t.checkParenting();
        }
      }, HybridRendererBase.prototype.appendElementInPos = function(t, e) {
        var r = t.getBaseElement();
        if (r) {
          var i = this.layers[e];
          if (!i.ddd || !this.supports3d)
            if (this.threeDElements)
              this.addTo3dContainer(r, e);
            else {
              for (var s = 0, n, a, l; s < e; )
                this.elements[s] && this.elements[s] !== !0 && this.elements[s].getBaseElement && (a = this.elements[s], l = this.layers[s].ddd ? this.getThreeDContainerByPos(s) : a.getBaseElement(), n = l || n), s += 1;
              n ? (!i.ddd || !this.supports3d) && this.layerElement.insertBefore(r, n) : (!i.ddd || !this.supports3d) && this.layerElement.appendChild(r);
            }
          else
            this.addTo3dContainer(r, e);
        }
      }, HybridRendererBase.prototype.createShape = function(t) {
        return this.supports3d ? new HShapeElement(t, this.globalData, this) : new SVGShapeElement(t, this.globalData, this);
      }, HybridRendererBase.prototype.createText = function(t) {
        return this.supports3d ? new HTextElement(t, this.globalData, this) : new SVGTextLottieElement(t, this.globalData, this);
      }, HybridRendererBase.prototype.createCamera = function(t) {
        return this.camera = new HCameraElement(t, this.globalData, this), this.camera;
      }, HybridRendererBase.prototype.createImage = function(t) {
        return this.supports3d ? new HImageElement(t, this.globalData, this) : new IImageElement(t, this.globalData, this);
      }, HybridRendererBase.prototype.createSolid = function(t) {
        return this.supports3d ? new HSolidElement(t, this.globalData, this) : new ISolidElement(t, this.globalData, this);
      }, HybridRendererBase.prototype.createNull = SVGRenderer.prototype.createNull, HybridRendererBase.prototype.getThreeDContainerByPos = function(t) {
        for (var e = 0, r = this.threeDElements.length; e < r; ) {
          if (this.threeDElements[e].startPos <= t && this.threeDElements[e].endPos >= t)
            return this.threeDElements[e].perspectiveElem;
          e += 1;
        }
        return null;
      }, HybridRendererBase.prototype.createThreeDContainer = function(t, e) {
        var r = createTag("div"), i, s;
        styleDiv(r);
        var n = createTag("div");
        if (styleDiv(n), e === "3d") {
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
          startPos: t,
          endPos: t,
          type: e
        };
        return this.threeDElements.push(o), o;
      }, HybridRendererBase.prototype.build3dContainers = function() {
        var t, e = this.layers.length, r, i = "";
        for (t = 0; t < e; t += 1)
          this.layers[t].ddd && this.layers[t].ty !== 3 ? (i !== "3d" && (i = "3d", r = this.createThreeDContainer(t, "3d")), r.endPos = Math.max(r.endPos, t)) : (i !== "2d" && (i = "2d", r = this.createThreeDContainer(t, "2d")), r.endPos = Math.max(r.endPos, t));
        for (e = this.threeDElements.length, t = e - 1; t >= 0; t -= 1)
          this.resizerElem.appendChild(this.threeDElements[t].perspectiveElem);
      }, HybridRendererBase.prototype.addTo3dContainer = function(t, e) {
        for (var r = 0, i = this.threeDElements.length; r < i; ) {
          if (e <= this.threeDElements[r].endPos) {
            for (var s = this.threeDElements[r].startPos, n; s < e; )
              this.elements[s] && this.elements[s].getBaseElement && (n = this.elements[s].getBaseElement()), s += 1;
            n ? this.threeDElements[r].container.insertBefore(t, n) : this.threeDElements[r].container.appendChild(t);
            break;
          }
          r += 1;
        }
      }, HybridRendererBase.prototype.configAnimation = function(t) {
        var e = createTag("div"), r = this.animationItem.wrapper, i = e.style;
        i.width = t.w + "px", i.height = t.h + "px", this.resizerElem = e, styleDiv(e), i.transformStyle = "flat", i.mozTransformStyle = "flat", i.webkitTransformStyle = "flat", this.renderConfig.className && e.setAttribute("class", this.renderConfig.className), r.appendChild(e), i.overflow = "hidden";
        var s = createNS("svg");
        s.setAttribute("width", "1"), s.setAttribute("height", "1"), styleDiv(s), this.resizerElem.appendChild(s);
        var n = createNS("defs");
        s.appendChild(n), this.data = t, this.setupGlobalData(t, s), this.globalData.defs = n, this.layers = t.layers, this.layerElement = this.resizerElem, this.build3dContainers(), this.updateContainerSize();
      }, HybridRendererBase.prototype.destroy = function() {
        this.animationItem.wrapper && (this.animationItem.wrapper.innerText = ""), this.animationItem.container = null, this.globalData.defs = null;
        var t, e = this.layers ? this.layers.length : 0;
        for (t = 0; t < e; t += 1)
          this.elements[t] && this.elements[t].destroy && this.elements[t].destroy();
        this.elements.length = 0, this.destroyed = !0, this.animationItem = null;
      }, HybridRendererBase.prototype.updateContainerSize = function() {
        var t = this.animationItem.wrapper.offsetWidth, e = this.animationItem.wrapper.offsetHeight, r = t / e, i = this.globalData.compSize.w / this.globalData.compSize.h, s, n, a, l;
        i > r ? (s = t / this.globalData.compSize.w, n = t / this.globalData.compSize.w, a = 0, l = (e - this.globalData.compSize.h * (t / this.globalData.compSize.w)) / 2) : (s = e / this.globalData.compSize.h, n = e / this.globalData.compSize.h, a = (t - this.globalData.compSize.w * (e / this.globalData.compSize.h)) / 2, l = 0);
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
          var t = this.globalData.compSize.w, e = this.globalData.compSize.h, r, i = this.threeDElements.length;
          for (r = 0; r < i; r += 1) {
            var s = this.threeDElements[r].perspectiveElem.style;
            s.webkitPerspective = Math.sqrt(Math.pow(t, 2) + Math.pow(e, 2)) + "px", s.perspective = s.webkitPerspective;
          }
        }
      }, HybridRendererBase.prototype.searchExtraCompositions = function(t) {
        var e, r = t.length, i = createTag("div");
        for (e = 0; e < r; e += 1)
          if (t[e].xt) {
            var s = this.createComp(t[e], i, this.globalData.comp, null);
            s.initExpressions(), this.globalData.projectInterface.registerComposition(s);
          }
      };
      function HCompElement(t, e, r) {
        this.layers = t.layers, this.supports3d = !t.hasMask, this.completeLayers = !1, this.pendingElements = [], this.elements = this.layers ? createSizedArray(this.layers.length) : [], this.initElement(t, e, r), this.tm = t.tm ? PropertyFactory.getProp(this, t.tm, 0, e.frameRate, this) : {
          _placeholder: !0
        };
      }
      extendPrototype([HybridRendererBase, ICompElement, HBaseElement], HCompElement), HCompElement.prototype._createBaseContainerElements = HCompElement.prototype.createContainerElements, HCompElement.prototype.createContainerElements = function() {
        this._createBaseContainerElements(), this.data.hasMask ? (this.svgElement.setAttribute("width", this.data.w), this.svgElement.setAttribute("height", this.data.h), this.transformedElement = this.baseElement) : this.transformedElement = this.layerElement;
      }, HCompElement.prototype.addTo3dContainer = function(t, e) {
        for (var r = 0, i; r < e; )
          this.elements[r] && this.elements[r].getBaseElement && (i = this.elements[r].getBaseElement()), r += 1;
        i ? this.layerElement.insertBefore(t, i) : this.layerElement.appendChild(t);
      }, HCompElement.prototype.createComp = function(t) {
        return this.supports3d ? new HCompElement(t, this.globalData, this) : new SVGCompElement(t, this.globalData, this);
      };
      function HybridRenderer(t, e) {
        this.animationItem = t, this.layers = null, this.renderedFrame = -1, this.renderConfig = {
          className: e && e.className || "",
          imagePreserveAspectRatio: e && e.imagePreserveAspectRatio || "xMidYMid slice",
          hideOnTransparent: !(e && e.hideOnTransparent === !1),
          filterSize: {
            width: e && e.filterSize && e.filterSize.width || "400%",
            height: e && e.filterSize && e.filterSize.height || "400%",
            x: e && e.filterSize && e.filterSize.x || "-100%",
            y: e && e.filterSize && e.filterSize.y || "-100%"
          },
          runExpressions: !e || e.runExpressions === void 0 || e.runExpressions
        }, this.globalData = {
          _mdf: !1,
          frameNum: -1,
          renderConfig: this.renderConfig
        }, this.pendingElements = [], this.elements = [], this.threeDElements = [], this.destroyed = !1, this.camera = null, this.supports3d = !0, this.rendererType = "html";
      }
      extendPrototype([HybridRendererBase], HybridRenderer), HybridRenderer.prototype.createComp = function(t) {
        return this.supports3d ? new HCompElement(t, this.globalData, this) : new SVGCompElement(t, this.globalData, this);
      };
      var CompExpressionInterface = /* @__PURE__ */ (function() {
        return function(t) {
          function e(r) {
            for (var i = 0, s = t.layers.length; i < s; ) {
              if (t.layers[i].nm === r || t.layers[i].ind === r)
                return t.elements[i].layerInterface;
              i += 1;
            }
            return null;
          }
          return Object.defineProperty(e, "_name", {
            value: t.data.nm
          }), e.layer = e, e.pixelAspect = 1, e.height = t.data.h || t.globalData.compSize.h, e.width = t.data.w || t.globalData.compSize.w, e.pixelAspect = 1, e.frameDuration = 1 / t.globalData.frameRate, e.displayStartTime = 0, e.numLayers = t.layers.length, e;
        };
      })();
      function _typeof$2(t) {
        "@babel/helpers - typeof";
        return _typeof$2 = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
          return typeof e;
        } : function(e) {
          return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
        }, _typeof$2(t);
      }
      function seedRandom(t, e) {
        var r = this, i = 256, s = 6, n = 52, a = "random", l = e.pow(i, s), o = e.pow(2, n), p = o * 2, u = i - 1, S;
        function f(h, y, P) {
          var x = [];
          y = y === !0 ? {
            entropy: !0
          } : y || {};
          var _ = A(m(y.entropy ? [h, d(t)] : h === null ? c() : h, 3), x), M = new b(x), w = function() {
            for (var V = M.g(s), I = l, N = 0; V < o; )
              V = (V + N) * i, I *= i, N = M.g(1);
            for (; V >= p; )
              V /= 2, I /= 2, N >>>= 1;
            return (V + N) / I;
          };
          return w.int32 = function() {
            return M.g(4) | 0;
          }, w.quick = function() {
            return M.g(4) / 4294967296;
          }, w.double = w, A(d(M.S), t), (y.pass || P || function(B, V, I, N) {
            return N && (N.S && v(N, M), B.state = function() {
              return v(M, {});
            }), I ? (e[a] = B, V) : B;
          })(w, _, "global" in y ? y.global : this == e, y.state);
        }
        e["seed" + a] = f;
        function b(h) {
          var y, P = h.length, x = this, _ = 0, M = x.i = x.j = 0, w = x.S = [];
          for (P || (h = [P++]); _ < i; )
            w[_] = _++;
          for (_ = 0; _ < i; _++)
            w[_] = w[M = u & M + h[_ % P] + (y = w[_])], w[M] = y;
          x.g = function(B) {
            for (var V, I = 0, N = x.i, G = x.j, R = x.S; B--; )
              V = R[N = u & N + 1], I = I * i + R[u & (R[N] = R[G = u & G + V]) + (R[G] = V)];
            return x.i = N, x.j = G, I;
          };
        }
        function v(h, y) {
          return y.i = h.i, y.j = h.j, y.S = h.S.slice(), y;
        }
        function m(h, y) {
          var P = [], x = _typeof$2(h), _;
          if (y && x == "object")
            for (_ in h)
              try {
                P.push(m(h[_], y - 1));
              } catch {
              }
          return P.length ? P : x == "string" ? h : h + "\0";
        }
        function A(h, y) {
          for (var P = h + "", x, _ = 0; _ < P.length; )
            y[u & _] = u & (x ^= y[u & _] * 19) + P.charCodeAt(_++);
          return d(y);
        }
        function c() {
          try {
            var h = new Uint8Array(i);
            return (r.crypto || r.msCrypto).getRandomValues(h), d(h);
          } catch {
            var y = r.navigator, P = y && y.plugins;
            return [+/* @__PURE__ */ new Date(), r, P, r.screen, d(t)];
          }
        }
        function d(h) {
          return String.fromCharCode.apply(0, h);
        }
        A(e.random(), t);
      }
      function initialize$2(t) {
        seedRandom([], t);
      }
      var propTypes = {
        SHAPE: "shape"
      };
      function _typeof$1(t) {
        "@babel/helpers - typeof";
        return _typeof$1 = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
          return typeof e;
        } : function(e) {
          return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
        }, _typeof$1(t);
      }
      var ExpressionManager = (function() {
        var ob = {}, Math = BMMath, window = null, document = null, XMLHttpRequest = null, fetch = null, frames = null, _lottieGlobal = {};
        initialize$2(BMMath);
        function resetFrame() {
          _lottieGlobal = {};
        }
        function $bm_isInstanceOfArray(t) {
          return t.constructor === Array || t.constructor === Float32Array;
        }
        function isNumerable(t, e) {
          return t === "number" || e instanceof Number || t === "boolean" || t === "string";
        }
        function $bm_neg(t) {
          var e = _typeof$1(t);
          if (e === "number" || t instanceof Number || e === "boolean")
            return -t;
          if ($bm_isInstanceOfArray(t)) {
            var r, i = t.length, s = [];
            for (r = 0; r < i; r += 1)
              s[r] = -t[r];
            return s;
          }
          return t.propType ? t.v : -t;
        }
        var easeInBez = BezierFactory.getBezierEasing(0.333, 0, 0.833, 0.833, "easeIn").get, easeOutBez = BezierFactory.getBezierEasing(0.167, 0.167, 0.667, 1, "easeOut").get, easeInOutBez = BezierFactory.getBezierEasing(0.33, 0, 0.667, 1, "easeInOut").get;
        function sum(t, e) {
          var r = _typeof$1(t), i = _typeof$1(e);
          if (isNumerable(r, t) && isNumerable(i, e) || r === "string" || i === "string")
            return t + e;
          if ($bm_isInstanceOfArray(t) && isNumerable(i, e))
            return t = t.slice(0), t[0] += e, t;
          if (isNumerable(r, t) && $bm_isInstanceOfArray(e))
            return e = e.slice(0), e[0] = t + e[0], e;
          if ($bm_isInstanceOfArray(t) && $bm_isInstanceOfArray(e)) {
            for (var s = 0, n = t.length, a = e.length, l = []; s < n || s < a; )
              (typeof t[s] == "number" || t[s] instanceof Number) && (typeof e[s] == "number" || e[s] instanceof Number) ? l[s] = t[s] + e[s] : l[s] = e[s] === void 0 ? t[s] : t[s] || e[s], s += 1;
            return l;
          }
          return 0;
        }
        var add = sum;
        function sub(t, e) {
          var r = _typeof$1(t), i = _typeof$1(e);
          if (isNumerable(r, t) && isNumerable(i, e))
            return r === "string" && (t = parseInt(t, 10)), i === "string" && (e = parseInt(e, 10)), t - e;
          if ($bm_isInstanceOfArray(t) && isNumerable(i, e))
            return t = t.slice(0), t[0] -= e, t;
          if (isNumerable(r, t) && $bm_isInstanceOfArray(e))
            return e = e.slice(0), e[0] = t - e[0], e;
          if ($bm_isInstanceOfArray(t) && $bm_isInstanceOfArray(e)) {
            for (var s = 0, n = t.length, a = e.length, l = []; s < n || s < a; )
              (typeof t[s] == "number" || t[s] instanceof Number) && (typeof e[s] == "number" || e[s] instanceof Number) ? l[s] = t[s] - e[s] : l[s] = e[s] === void 0 ? t[s] : t[s] || e[s], s += 1;
            return l;
          }
          return 0;
        }
        function mul(t, e) {
          var r = _typeof$1(t), i = _typeof$1(e), s;
          if (isNumerable(r, t) && isNumerable(i, e))
            return t * e;
          var n, a;
          if ($bm_isInstanceOfArray(t) && isNumerable(i, e)) {
            for (a = t.length, s = createTypedArray("float32", a), n = 0; n < a; n += 1)
              s[n] = t[n] * e;
            return s;
          }
          if (isNumerable(r, t) && $bm_isInstanceOfArray(e)) {
            for (a = e.length, s = createTypedArray("float32", a), n = 0; n < a; n += 1)
              s[n] = t * e[n];
            return s;
          }
          return 0;
        }
        function div(t, e) {
          var r = _typeof$1(t), i = _typeof$1(e), s;
          if (isNumerable(r, t) && isNumerable(i, e))
            return t / e;
          var n, a;
          if ($bm_isInstanceOfArray(t) && isNumerable(i, e)) {
            for (a = t.length, s = createTypedArray("float32", a), n = 0; n < a; n += 1)
              s[n] = t[n] / e;
            return s;
          }
          if (isNumerable(r, t) && $bm_isInstanceOfArray(e)) {
            for (a = e.length, s = createTypedArray("float32", a), n = 0; n < a; n += 1)
              s[n] = t / e[n];
            return s;
          }
          return 0;
        }
        function mod(t, e) {
          return typeof t == "string" && (t = parseInt(t, 10)), typeof e == "string" && (e = parseInt(e, 10)), t % e;
        }
        var $bm_sum = sum, $bm_sub = sub, $bm_mul = mul, $bm_div = div, $bm_mod = mod;
        function clamp(t, e, r) {
          if (e > r) {
            var i = r;
            r = e, e = i;
          }
          return Math.min(Math.max(t, e), r);
        }
        function radiansToDegrees(t) {
          return t / degToRads;
        }
        var radians_to_degrees = radiansToDegrees;
        function degreesToRadians(t) {
          return t * degToRads;
        }
        var degrees_to_radians = radiansToDegrees, helperLengthArray = [0, 0, 0, 0, 0, 0];
        function length(t, e) {
          if (typeof t == "number" || t instanceof Number)
            return e = e || 0, Math.abs(t - e);
          e || (e = helperLengthArray);
          var r, i = Math.min(t.length, e.length), s = 0;
          for (r = 0; r < i; r += 1)
            s += Math.pow(e[r] - t[r], 2);
          return Math.sqrt(s);
        }
        function normalize(t) {
          return div(t, length(t));
        }
        function rgbToHsl(t) {
          var e = t[0], r = t[1], i = t[2], s = Math.max(e, r, i), n = Math.min(e, r, i), a, l, o = (s + n) / 2;
          if (s === n)
            a = 0, l = 0;
          else {
            var p = s - n;
            switch (l = o > 0.5 ? p / (2 - s - n) : p / (s + n), s) {
              case e:
                a = (r - i) / p + (r < i ? 6 : 0);
                break;
              case r:
                a = (i - e) / p + 2;
                break;
              case i:
                a = (e - r) / p + 4;
                break;
            }
            a /= 6;
          }
          return [a, l, o, t[3]];
        }
        function hue2rgb(t, e, r) {
          return r < 0 && (r += 1), r > 1 && (r -= 1), r < 1 / 6 ? t + (e - t) * 6 * r : r < 1 / 2 ? e : r < 2 / 3 ? t + (e - t) * (2 / 3 - r) * 6 : t;
        }
        function hslToRgb(t) {
          var e = t[0], r = t[1], i = t[2], s, n, a;
          if (r === 0)
            s = i, a = i, n = i;
          else {
            var l = i < 0.5 ? i * (1 + r) : i + r - i * r, o = 2 * i - l;
            s = hue2rgb(o, l, e + 1 / 3), n = hue2rgb(o, l, e), a = hue2rgb(o, l, e - 1 / 3);
          }
          return [s, n, a, t[3]];
        }
        function linear(t, e, r, i, s) {
          if ((i === void 0 || s === void 0) && (i = e, s = r, e = 0, r = 1), r < e) {
            var n = r;
            r = e, e = n;
          }
          if (t <= e)
            return i;
          if (t >= r)
            return s;
          var a = r === e ? 0 : (t - e) / (r - e);
          if (!i.length)
            return i + (s - i) * a;
          var l, o = i.length, p = createTypedArray("float32", o);
          for (l = 0; l < o; l += 1)
            p[l] = i[l] + (s[l] - i[l]) * a;
          return p;
        }
        function random(t, e) {
          if (e === void 0 && (t === void 0 ? (t = 0, e = 1) : (e = t, t = void 0)), e.length) {
            var r, i = e.length;
            t || (t = createTypedArray("float32", i));
            var s = createTypedArray("float32", i), n = BMMath.random();
            for (r = 0; r < i; r += 1)
              s[r] = t[r] + n * (e[r] - t[r]);
            return s;
          }
          t === void 0 && (t = 0);
          var a = BMMath.random();
          return t + a * (e - t);
        }
        function createPath(t, e, r, i) {
          var s, n = t.length, a = shapePool.newElement();
          a.setPathData(!!i, n);
          var l = [0, 0], o, p;
          for (s = 0; s < n; s += 1)
            o = e && e[s] ? e[s] : l, p = r && r[s] ? r[s] : l, a.setTripleAt(t[s][0], t[s][1], p[0] + t[s][0], p[1] + t[s][1], o[0] + t[s][0], o[1] + t[s][1], s, !0);
          return a;
        }
        function initiateExpression(elem, data, property) {
          function noOp(t) {
            return t;
          }
          if (!elem.globalData.renderConfig.runExpressions)
            return noOp;
          var val = data.x, needsVelocity = /velocity(?![\w\d])/.test(val), _needsRandom = val.indexOf("random") !== -1, elemType = elem.data.ty, transform, $bm_transform, content, effect, thisProperty = property;
          thisProperty._name = elem.data.nm, thisProperty.valueAtTime = thisProperty.getValueAtTime, Object.defineProperty(thisProperty, "value", {
            get: function() {
              return thisProperty.v;
            }
          }), elem.comp.frameDuration = 1 / elem.comp.globalData.frameRate, elem.comp.displayStartTime = 0;
          var inPoint = elem.data.ip / elem.comp.globalData.frameRate, outPoint = elem.data.op / elem.comp.globalData.frameRate, width = elem.data.sw ? elem.data.sw : 0, height = elem.data.sh ? elem.data.sh : 0, name = elem.data.nm, loopIn, loop_in, loopOut, loop_out, smooth, toWorld, fromWorld, fromComp, toComp, fromCompToSurface, position, rotation, anchorPoint, scale, thisLayer, thisComp, mask, valueAtTime, velocityAtTime, scoped_bm_rt, expression_function = eval("[function _expression_function(){" + val + ";scoped_bm_rt=$bm_rt}]")[0], numKeys = property.kf ? data.k.length : 0, active = !this.data || this.data.hd !== !0, wiggle = (function t(e, r) {
            var i, s, n = this.pv.length ? this.pv.length : 1, a = createTypedArray("float32", n);
            e = 5;
            var l = Math.floor(time * e);
            for (i = 0, s = 0; i < l; ) {
              for (s = 0; s < n; s += 1)
                a[s] += -r + r * 2 * BMMath.random();
              i += 1;
            }
            var o = time * e, p = o - Math.floor(o), u = createTypedArray("float32", n);
            if (n > 1) {
              for (s = 0; s < n; s += 1)
                u[s] = this.pv[s] + a[s] + (-r + r * 2 * BMMath.random()) * p;
              return u;
            }
            return this.pv + a[0] + (-r + r * 2 * BMMath.random()) * p;
          }).bind(this);
          thisProperty.loopIn && (loopIn = thisProperty.loopIn.bind(thisProperty), loop_in = loopIn), thisProperty.loopOut && (loopOut = thisProperty.loopOut.bind(thisProperty), loop_out = loopOut), thisProperty.smooth && (smooth = thisProperty.smooth.bind(thisProperty));
          function loopInDuration(t, e) {
            return loopIn(t, e, !0);
          }
          function loopOutDuration(t, e) {
            return loopOut(t, e, !0);
          }
          this.getValueAtTime && (valueAtTime = this.getValueAtTime.bind(this)), this.getVelocityAtTime && (velocityAtTime = this.getVelocityAtTime.bind(this));
          var comp = elem.comp.globalData.projectInterface.bind(elem.comp.globalData.projectInterface);
          function lookAt(t, e) {
            var r = [e[0] - t[0], e[1] - t[1], e[2] - t[2]], i = Math.atan2(r[0], Math.sqrt(r[1] * r[1] + r[2] * r[2])) / degToRads, s = -Math.atan2(r[1], r[2]) / degToRads;
            return [s, i, 0];
          }
          function easeOut(t, e, r, i, s) {
            return applyEase(easeOutBez, t, e, r, i, s);
          }
          function easeIn(t, e, r, i, s) {
            return applyEase(easeInBez, t, e, r, i, s);
          }
          function ease(t, e, r, i, s) {
            return applyEase(easeInOutBez, t, e, r, i, s);
          }
          function applyEase(t, e, r, i, s, n) {
            s === void 0 ? (s = r, n = i) : e = (e - r) / (i - r), e > 1 ? e = 1 : e < 0 && (e = 0);
            var a = t(e);
            if ($bm_isInstanceOfArray(s)) {
              var l, o = s.length, p = createTypedArray("float32", o);
              for (l = 0; l < o; l += 1)
                p[l] = (n[l] - s[l]) * a + s[l];
              return p;
            }
            return (n - s) * a + s;
          }
          function nearestKey(t) {
            var e, r = data.k.length, i, s;
            if (!data.k.length || typeof data.k[0] == "number")
              i = 0, s = 0;
            else if (i = -1, t *= elem.comp.globalData.frameRate, t < data.k[0].t)
              i = 1, s = data.k[0].t;
            else {
              for (e = 0; e < r - 1; e += 1)
                if (t === data.k[e].t) {
                  i = e + 1, s = data.k[e].t;
                  break;
                } else if (t > data.k[e].t && t < data.k[e + 1].t) {
                  t - data.k[e].t > data.k[e + 1].t - t ? (i = e + 2, s = data.k[e + 1].t) : (i = e + 1, s = data.k[e].t);
                  break;
                }
              i === -1 && (i = e + 1, s = data.k[e].t);
            }
            var n = {};
            return n.index = i, n.time = s / elem.comp.globalData.frameRate, n;
          }
          function key(t) {
            var e, r, i;
            if (!data.k.length || typeof data.k[0] == "number")
              throw new Error("The property has no keyframe at index " + t);
            t -= 1, e = {
              time: data.k[t].t / elem.comp.globalData.frameRate,
              value: []
            };
            var s = Object.prototype.hasOwnProperty.call(data.k[t], "s") ? data.k[t].s : data.k[t - 1].e;
            for (i = s.length, r = 0; r < i; r += 1)
              e[r] = s[r], e.value[r] = s[r];
            return e;
          }
          function framesToTime(t, e) {
            return e || (e = elem.comp.globalData.frameRate), t / e;
          }
          function timeToFrames(t, e) {
            return !t && t !== 0 && (t = time), e || (e = elem.comp.globalData.frameRate), t * e;
          }
          function seedRandom(t) {
            BMMath.seedrandom(randSeed + t);
          }
          function sourceRectAtTime() {
            return elem.sourceRectAtTime();
          }
          function substring(t, e) {
            return typeof value == "string" ? e === void 0 ? value.substring(t) : value.substring(t, e) : "";
          }
          function substr(t, e) {
            return typeof value == "string" ? e === void 0 ? value.substr(t) : value.substr(t, e) : "";
          }
          function posterizeTime(t) {
            time = t === 0 ? 0 : Math.floor(time * t) / t, value = valueAtTime(time);
          }
          var time, velocity, value, text, textIndex, textTotal, selectorValue, index = elem.data.ind, hasParent = !!(elem.hierarchy && elem.hierarchy.length), parent, randSeed = Math.floor(Math.random() * 1e6), globalData = elem.globalData;
          function executeExpression(t) {
            return value = t, this.frameExpressionId === elem.globalData.frameId && this.propType !== "textSelector" ? value : (this.propType === "textSelector" && (textIndex = this.textIndex, textTotal = this.textTotal, selectorValue = this.selectorValue), thisLayer || (text = elem.layerInterface.text, thisLayer = elem.layerInterface, thisComp = elem.comp.compInterface, toWorld = thisLayer.toWorld.bind(thisLayer), fromWorld = thisLayer.fromWorld.bind(thisLayer), fromComp = thisLayer.fromComp.bind(thisLayer), toComp = thisLayer.toComp.bind(thisLayer), mask = thisLayer.mask ? thisLayer.mask.bind(thisLayer) : null, fromCompToSurface = fromComp), transform || (transform = elem.layerInterface("ADBE Transform Group"), $bm_transform = transform, transform && (anchorPoint = transform.anchorPoint)), elemType === 4 && !content && (content = thisLayer("ADBE Root Vectors Group")), effect || (effect = thisLayer(4)), hasParent = !!(elem.hierarchy && elem.hierarchy.length), hasParent && !parent && (parent = elem.hierarchy[0].layerInterface), time = this.comp.renderedFrame / this.comp.globalData.frameRate, _needsRandom && seedRandom(randSeed + time), needsVelocity && (velocity = velocityAtTime(time)), expression_function(), this.frameExpressionId = elem.globalData.frameId, scoped_bm_rt = scoped_bm_rt.propType === propTypes.SHAPE ? scoped_bm_rt.v : scoped_bm_rt, scoped_bm_rt);
          }
          return executeExpression.__preventDeadCodeRemoval = [$bm_transform, anchorPoint, time, velocity, inPoint, outPoint, width, height, name, loop_in, loop_out, smooth, toComp, fromCompToSurface, toWorld, fromWorld, mask, position, rotation, scale, thisComp, numKeys, active, wiggle, loopInDuration, loopOutDuration, comp, lookAt, easeOut, easeIn, ease, nearestKey, key, text, textIndex, textTotal, selectorValue, framesToTime, timeToFrames, sourceRectAtTime, substring, substr, posterizeTime, index, globalData], executeExpression;
        }
        return ob.initiateExpression = initiateExpression, ob.__preventDeadCodeRemoval = [window, document, XMLHttpRequest, fetch, frames, $bm_neg, add, $bm_sum, $bm_sub, $bm_mul, $bm_div, $bm_mod, clamp, radians_to_degrees, degreesToRadians, degrees_to_radians, normalize, rgbToHsl, hslToRgb, linear, random, createPath, _lottieGlobal], ob.resetFrame = resetFrame, ob;
      })(), Expressions = (function() {
        var t = {};
        t.initExpressions = e, t.resetFrame = ExpressionManager.resetFrame;
        function e(r) {
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
        return t;
      })(), MaskManagerInterface = (function() {
        function t(r, i) {
          this._mask = r, this._data = i;
        }
        Object.defineProperty(t.prototype, "maskPath", {
          get: function() {
            return this._mask.prop.k && this._mask.prop.getValue(), this._mask.prop;
          }
        }), Object.defineProperty(t.prototype, "maskOpacity", {
          get: function() {
            return this._mask.op.k && this._mask.op.getValue(), this._mask.op.v * 100;
          }
        });
        var e = function(i) {
          var s = createSizedArray(i.viewData.length), n, a = i.viewData.length;
          for (n = 0; n < a; n += 1)
            s[n] = new t(i.viewData[n], i.masksProperties[n]);
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
        return e;
      })(), ExpressionPropertyInterface = /* @__PURE__ */ (function() {
        var t = {
          pv: 0,
          v: 0,
          mult: 1
        }, e = {
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
          (!a || !("pv" in a)) && (a = t);
          var l = 1 / a.mult, o = a.pv * l, p = new Number(o);
          return p.value = o, r(p, a, "unidimensional"), function() {
            return a.k && a.getValue(), o = a.v * l, p.value !== o && (p = new Number(o), p.value = o, p[0] = o, r(p, a, "unidimensional")), p;
          };
        }
        function s(a) {
          (!a || !("pv" in a)) && (a = e);
          var l = 1 / a.mult, o = a.data && a.data.l || a.pv.length, p = createTypedArray("float32", o), u = createTypedArray("float32", o);
          return p.value = u, r(p, a, "multidimensional"), function() {
            a.k && a.getValue();
            for (var S = 0; S < o; S += 1)
              u[S] = a.v[S] * l, p[S] = u[S];
            return p;
          };
        }
        function n() {
          return t;
        }
        return function(a) {
          return a ? a.propType === "unidimensional" ? i(a) : s(a) : n;
        };
      })(), TransformExpressionInterface = /* @__PURE__ */ (function() {
        return function(t) {
          function e(a) {
            switch (a) {
              case "scale":
              case "Scale":
              case "ADBE Scale":
              case 6:
                return e.scale;
              case "rotation":
              case "Rotation":
              case "ADBE Rotation":
              case "ADBE Rotate Z":
              case 10:
                return e.rotation;
              case "ADBE Rotate X":
                return e.xRotation;
              case "ADBE Rotate Y":
                return e.yRotation;
              case "position":
              case "Position":
              case "ADBE Position":
              case 2:
                return e.position;
              case "ADBE Position_0":
                return e.xPosition;
              case "ADBE Position_1":
                return e.yPosition;
              case "ADBE Position_2":
                return e.zPosition;
              case "anchorPoint":
              case "AnchorPoint":
              case "Anchor Point":
              case "ADBE AnchorPoint":
              case 1:
                return e.anchorPoint;
              case "opacity":
              case "Opacity":
              case 11:
                return e.opacity;
              default:
                return null;
            }
          }
          Object.defineProperty(e, "rotation", {
            get: ExpressionPropertyInterface(t.r || t.rz)
          }), Object.defineProperty(e, "zRotation", {
            get: ExpressionPropertyInterface(t.rz || t.r)
          }), Object.defineProperty(e, "xRotation", {
            get: ExpressionPropertyInterface(t.rx)
          }), Object.defineProperty(e, "yRotation", {
            get: ExpressionPropertyInterface(t.ry)
          }), Object.defineProperty(e, "scale", {
            get: ExpressionPropertyInterface(t.s)
          });
          var r, i, s, n;
          return t.p ? n = ExpressionPropertyInterface(t.p) : (r = ExpressionPropertyInterface(t.px), i = ExpressionPropertyInterface(t.py), t.pz && (s = ExpressionPropertyInterface(t.pz))), Object.defineProperty(e, "position", {
            get: function() {
              return t.p ? n() : [r(), i(), s ? s() : 0];
            }
          }), Object.defineProperty(e, "xPosition", {
            get: ExpressionPropertyInterface(t.px)
          }), Object.defineProperty(e, "yPosition", {
            get: ExpressionPropertyInterface(t.py)
          }), Object.defineProperty(e, "zPosition", {
            get: ExpressionPropertyInterface(t.pz)
          }), Object.defineProperty(e, "anchorPoint", {
            get: ExpressionPropertyInterface(t.a)
          }), Object.defineProperty(e, "opacity", {
            get: ExpressionPropertyInterface(t.o)
          }), Object.defineProperty(e, "skew", {
            get: ExpressionPropertyInterface(t.sk)
          }), Object.defineProperty(e, "skewAxis", {
            get: ExpressionPropertyInterface(t.sa)
          }), Object.defineProperty(e, "orientation", {
            get: ExpressionPropertyInterface(t.or)
          }), e;
        };
      })(), LayerExpressionInterface = /* @__PURE__ */ (function() {
        function t(p) {
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
        function e(p, u) {
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
          b.getMatrix = t, b.invertPoint = a, b.applyPoint = n, b.toWorld = r, b.toWorldVec = e, b.fromWorld = s, b.fromWorldVec = i, b.toComp = r, b.fromComp = l, b.sampleImage = o, b.sourceRectAtTime = p.sourceRectAtTime.bind(p), b._elem = p, u = TransformExpressionInterface(p.finalTransform.mProp);
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
        return function(t, e) {
          return function(r) {
            return r = r === void 0 ? 1 : r, r <= 0 ? t : e(r - 1);
          };
        };
      })(), PropertyInterface = /* @__PURE__ */ (function() {
        return function(t, e) {
          var r = {
            _name: t
          };
          function i(s) {
            return s = s === void 0 ? 1 : s, s <= 0 ? r : e(s - 1);
          }
          return i;
        };
      })(), EffectsExpressionInterface = /* @__PURE__ */ (function() {
        var t = {
          createEffectsInterface: e
        };
        function e(s, n) {
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
            for (var v = s.ef, m = 0, A = v.length; m < A; ) {
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
        return t;
      })(), ShapePathInterface = /* @__PURE__ */ (function() {
        return function(e, r, i) {
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
              value: e.nm
            },
            ix: {
              value: e.ix
            },
            propertyIndex: {
              value: e.ix
            },
            mn: {
              value: e.mn
            },
            propertyGroup: {
              value: i
            }
          }), n;
        };
      })(), ShapeExpressionInterface = /* @__PURE__ */ (function() {
        function t(v, m, A) {
          var c = [], d, h = v ? v.length : 0;
          for (d = 0; d < h; d += 1)
            v[d].ty === "gr" ? c.push(r(v[d], m[d], A)) : v[d].ty === "fl" ? c.push(i(v[d], m[d], A)) : v[d].ty === "st" ? c.push(a(v[d], m[d], A)) : v[d].ty === "tm" ? c.push(l(v[d], m[d], A)) : v[d].ty === "tr" || (v[d].ty === "el" ? c.push(p(v[d], m[d], A)) : v[d].ty === "sr" ? c.push(u(v[d], m[d], A)) : v[d].ty === "sh" ? c.push(ShapePathInterface(v[d], m[d], A)) : v[d].ty === "rc" ? c.push(S(v[d], m[d], A)) : v[d].ty === "rd" ? c.push(f(v[d], m[d], A)) : v[d].ty === "rp" ? c.push(b(v[d], m[d], A)) : v[d].ty === "gf" ? c.push(s(v[d], m[d], A)) : c.push(n(v[d], m[d])));
          return c;
        }
        function e(v, m, A) {
          var c, d = function(P) {
            for (var x = 0, _ = c.length; x < _; ) {
              if (c[x]._name === P || c[x].mn === P || c[x].propertyIndex === P || c[x].ix === P || c[x].ind === P)
                return c[x];
              x += 1;
            }
            return typeof P == "number" ? c[P - 1] : null;
          };
          d.propertyGroup = propertyGroupFactory(d, A), c = t(v.it, m.it, d.propertyGroup), d.numProperties = c.length;
          var h = o(v.it[v.it.length - 1], m.it[m.it.length - 1], d.propertyGroup);
          return d.transform = h, d.propertyIndex = v.cix, d._name = v.nm, d;
        }
        function r(v, m, A) {
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
          c.propertyGroup = propertyGroupFactory(c, A);
          var d = e(v, m, c.propertyGroup), h = o(v.it[v.it.length - 1], m.it[m.it.length - 1], c.propertyGroup);
          return c.content = d, c.transform = h, Object.defineProperty(c, "_name", {
            get: function() {
              return v.nm;
            }
          }), c.numProperties = v.np, c.propertyIndex = v.ix, c.nm = v.nm, c.mn = v.mn, c;
        }
        function i(v, m, A) {
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
          }), m.c.setGroupProperty(PropertyInterface("Color", A)), m.o.setGroupProperty(PropertyInterface("Opacity", A)), c;
        }
        function s(v, m, A) {
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
          }), m.s.setGroupProperty(PropertyInterface("Start Point", A)), m.e.setGroupProperty(PropertyInterface("End Point", A)), m.o.setGroupProperty(PropertyInterface("Opacity", A)), c;
        }
        function n() {
          function v() {
            return null;
          }
          return v;
        }
        function a(v, m, A) {
          var c = propertyGroupFactory(_, A), d = propertyGroupFactory(x, c);
          function h(M) {
            Object.defineProperty(x, v.d[M].nm, {
              get: ExpressionPropertyInterface(m.d.dataProps[M].p)
            });
          }
          var y, P = v.d ? v.d.length : 0, x = {};
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
                return x;
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
        function l(v, m, A) {
          function c(h) {
            return h === v.e.ix || h === "End" || h === "end" ? c.end : h === v.s.ix ? c.start : h === v.o.ix ? c.offset : null;
          }
          var d = propertyGroupFactory(c, A);
          return c.propertyIndex = v.ix, m.s.setGroupProperty(PropertyInterface("Start", d)), m.e.setGroupProperty(PropertyInterface("End", d)), m.o.setGroupProperty(PropertyInterface("Offset", d)), c.propertyIndex = v.ix, c.propertyGroup = A, Object.defineProperties(c, {
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
        function o(v, m, A) {
          function c(h) {
            return v.a.ix === h || h === "Anchor Point" ? c.anchorPoint : v.o.ix === h || h === "Opacity" ? c.opacity : v.p.ix === h || h === "Position" ? c.position : v.r.ix === h || h === "Rotation" || h === "ADBE Vector Rotation" ? c.rotation : v.s.ix === h || h === "Scale" ? c.scale : v.sk && v.sk.ix === h || h === "Skew" ? c.skew : v.sa && v.sa.ix === h || h === "Skew Axis" ? c.skewAxis : null;
          }
          var d = propertyGroupFactory(c, A);
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
          }), c.ty = "tr", c.mn = v.mn, c.propertyGroup = A, c;
        }
        function p(v, m, A) {
          function c(y) {
            return v.p.ix === y ? c.position : v.s.ix === y ? c.size : null;
          }
          var d = propertyGroupFactory(c, A);
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
        function u(v, m, A) {
          function c(y) {
            return v.p.ix === y ? c.position : v.r.ix === y ? c.rotation : v.pt.ix === y ? c.points : v.or.ix === y || y === "ADBE Vector Star Outer Radius" ? c.outerRadius : v.os.ix === y ? c.outerRoundness : v.ir && (v.ir.ix === y || y === "ADBE Vector Star Inner Radius") ? c.innerRadius : v.is && v.is.ix === y ? c.innerRoundness : null;
          }
          var d = propertyGroupFactory(c, A), h = m.sh.ty === "tm" ? m.sh.prop : m.sh;
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
        function S(v, m, A) {
          function c(y) {
            return v.p.ix === y ? c.position : v.r.ix === y ? c.roundness : v.s.ix === y || y === "Size" || y === "ADBE Vector Rect Size" ? c.size : null;
          }
          var d = propertyGroupFactory(c, A), h = m.sh.ty === "tm" ? m.sh.prop : m.sh;
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
        function f(v, m, A) {
          function c(y) {
            return v.r.ix === y || y === "Round Corners 1" ? c.radius : null;
          }
          var d = propertyGroupFactory(c, A), h = m;
          return c.propertyIndex = v.ix, h.rd.setGroupProperty(PropertyInterface("Radius", d)), Object.defineProperties(c, {
            radius: {
              get: ExpressionPropertyInterface(h.rd)
            },
            _name: {
              value: v.nm
            }
          }), c.mn = v.mn, c;
        }
        function b(v, m, A) {
          function c(y) {
            return v.c.ix === y || y === "Copies" ? c.copies : v.o.ix === y || y === "Offset" ? c.offset : null;
          }
          var d = propertyGroupFactory(c, A), h = m;
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
        return function(v, m, A) {
          var c;
          function d(y) {
            if (typeof y == "number")
              return y = y === void 0 ? 1 : y, y === 0 ? A : c[y - 1];
            for (var P = 0, x = c.length; P < x; ) {
              if (c[P]._name === y)
                return c[P];
              P += 1;
            }
            return null;
          }
          function h() {
            return A;
          }
          return d.propertyGroup = propertyGroupFactory(d, h), c = t(v, m, d.propertyGroup), d.numProperties = c.length, d._name = "Contents", d;
        };
      })(), TextExpressionInterface = /* @__PURE__ */ (function() {
        return function(t) {
          var e;
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
              t.textProperty.getValue();
              var s = t.textProperty.currentData.t;
              return (!e || s !== e.value) && (e = new String(s), e.value = s || new String(s), Object.defineProperty(e, "style", {
                get: function() {
                  return {
                    fillColor: t.textProperty.currentData.fc
                  };
                }
              })), e;
            }
          }), r;
        };
      })();
      function _typeof(t) {
        "@babel/helpers - typeof";
        return _typeof = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
          return typeof e;
        } : function(e) {
          return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
        }, _typeof(t);
      }
      var FootageInterface = /* @__PURE__ */ (function() {
        var t = function(i) {
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
        }, e = function(i) {
          function s(n) {
            return n === "Outline" ? s.outlineInterface() : null;
          }
          return s._name = "Outline", s.outlineInterface = t(i), s;
        };
        return function(r) {
          function i(s) {
            return s === "Data" ? i.dataInterface : null;
          }
          return i._name = "Data", i.dataInterface = e(r), i;
        };
      })(), interfaces = {
        layer: LayerExpressionInterface,
        effects: EffectsExpressionInterface,
        comp: CompExpressionInterface,
        shape: ShapeExpressionInterface,
        text: TextExpressionInterface,
        footage: FootageInterface
      };
      function getInterface(t) {
        return interfaces[t] || null;
      }
      var expressionHelpers = /* @__PURE__ */ (function() {
        function t(a, l, o) {
          l.x && (o.k = !0, o.x = !0, o.initiateExpression = ExpressionManager.initiateExpression, o.effectsSequence.push(o.initiateExpression(a, l, o).bind(o)));
        }
        function e(a) {
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
          searchExpressions: t,
          getSpeedAtTime: r,
          getVelocityAtTime: i,
          getValueAtTime: e,
          getStaticValueAtTime: s,
          setGroupProperty: n
        };
      })();
      function addPropertyDecorator() {
        function t(f, b, v) {
          if (!this.k || !this.keyframes)
            return this.pv;
          f = f ? f.toLowerCase() : "";
          var m = this.comp.renderedFrame, A = this.keyframes, c = A[A.length - 1].t;
          if (m <= c)
            return this.pv;
          var d, h;
          v ? (b ? d = Math.abs(c - this.elem.comp.globalData.frameRate * b) : d = Math.max(0, c - this.elem.data.ip), h = c - d) : ((!b || b > A.length - 1) && (b = A.length - 1), h = A[A.length - 1 - b].t, d = c - h);
          var y, P, x;
          if (f === "pingpong") {
            var _ = Math.floor((m - h) / d);
            if (_ % 2 !== 0)
              return this.getValueAtTime((d - (m - h) % d + h) / this.comp.globalData.frameRate, 0);
          } else if (f === "offset") {
            var M = this.getValueAtTime(h / this.comp.globalData.frameRate, 0), w = this.getValueAtTime(c / this.comp.globalData.frameRate, 0), B = this.getValueAtTime(((m - h) % d + h) / this.comp.globalData.frameRate, 0), V = Math.floor((m - h) / d);
            if (this.pv.length) {
              for (x = new Array(M.length), P = x.length, y = 0; y < P; y += 1)
                x[y] = (w[y] - M[y]) * V + B[y];
              return x;
            }
            return (w - M) * V + B;
          } else if (f === "continue") {
            var I = this.getValueAtTime(c / this.comp.globalData.frameRate, 0), N = this.getValueAtTime((c - 1e-3) / this.comp.globalData.frameRate, 0);
            if (this.pv.length) {
              for (x = new Array(I.length), P = x.length, y = 0; y < P; y += 1)
                x[y] = I[y] + (I[y] - N[y]) * ((m - c) / this.comp.globalData.frameRate) / 5e-4;
              return x;
            }
            return I + (I - N) * ((m - c) / 1e-3);
          }
          return this.getValueAtTime(((m - h) % d + h) / this.comp.globalData.frameRate, 0);
        }
        function e(f, b, v) {
          if (!this.k)
            return this.pv;
          f = f ? f.toLowerCase() : "";
          var m = this.comp.renderedFrame, A = this.keyframes, c = A[0].t;
          if (m >= c)
            return this.pv;
          var d, h;
          v ? (b ? d = Math.abs(this.elem.comp.globalData.frameRate * b) : d = Math.max(0, this.elem.data.op - c), h = c + d) : ((!b || b > A.length - 1) && (b = A.length - 1), h = A[b].t, d = h - c);
          var y, P, x;
          if (f === "pingpong") {
            var _ = Math.floor((c - m) / d);
            if (_ % 2 === 0)
              return this.getValueAtTime(((c - m) % d + c) / this.comp.globalData.frameRate, 0);
          } else if (f === "offset") {
            var M = this.getValueAtTime(c / this.comp.globalData.frameRate, 0), w = this.getValueAtTime(h / this.comp.globalData.frameRate, 0), B = this.getValueAtTime((d - (c - m) % d + c) / this.comp.globalData.frameRate, 0), V = Math.floor((c - m) / d) + 1;
            if (this.pv.length) {
              for (x = new Array(M.length), P = x.length, y = 0; y < P; y += 1)
                x[y] = B[y] - (w[y] - M[y]) * V;
              return x;
            }
            return B - (w - M) * V;
          } else if (f === "continue") {
            var I = this.getValueAtTime(c / this.comp.globalData.frameRate, 0), N = this.getValueAtTime((c + 1e-3) / this.comp.globalData.frameRate, 0);
            if (this.pv.length) {
              for (x = new Array(I.length), P = x.length, y = 0; y < P; y += 1)
                x[y] = I[y] + (I[y] - N[y]) * (c - m) / 1e-3;
              return x;
            }
            return I + (I - N) * (c - m) / 1e-3;
          }
          return this.getValueAtTime((d - ((c - m) % d + c)) / this.comp.globalData.frameRate, 0);
        }
        function r(f, b) {
          if (!this.k)
            return this.pv;
          if (f = (f || 0.4) * 0.5, b = Math.floor(b || 5), b <= 1)
            return this.pv;
          var v = this.comp.renderedFrame / this.comp.globalData.frameRate, m = v - f, A = v + f, c = b > 1 ? (A - m) / (b - 1) : 1, d = 0, h = 0, y;
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
            var A = this.sk.getValueAtTime(f), c = this.sa.getValueAtTime(f);
            b.skewFromAxis(-A * this.sk.mult, c * this.sa.mult);
          }
          if (this.r && this.appliedTransformations < 4) {
            var d = this.r.getValueAtTime(f);
            b.rotate(-d * this.r.mult);
          } else if (!this.r && this.appliedTransformations < 4) {
            var h = this.rz.getValueAtTime(f), y = this.ry.getValueAtTime(f), P = this.rx.getValueAtTime(f), x = this.or.getValueAtTime(f);
            b.rotateZ(-h * this.rz.mult).rotateY(y * this.ry.mult).rotateX(P * this.rx.mult).rotateZ(-x[2] * this.or.mult).rotateY(x[1] * this.or.mult).rotateX(x[0] * this.or.mult);
          }
          if (this.data.p && this.data.p.s) {
            var _ = this.px.getValueAtTime(f), M = this.py.getValueAtTime(f);
            if (this.data.p.z) {
              var w = this.pz.getValueAtTime(f);
              b.translate(_ * this.px.mult, M * this.py.mult, -w * this.pz.mult);
            } else
              b.translate(_ * this.px.mult, M * this.py.mult, 0);
          } else {
            var B = this.p.getValueAtTime(f);
            b.translate(B[0] * this.p.mult, B[1] * this.p.mult, -B[2] * this.p.mult);
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
        PropertyFactory.getProp = function(f, b, v, m, A) {
          var c = a(f, b, v, m, A);
          c.kf ? c.getValueAtTime = expressionHelpers.getValueAtTime.bind(c) : c.getValueAtTime = expressionHelpers.getStaticValueAtTime.bind(c), c.setGroupProperty = expressionHelpers.setGroupProperty, c.loopOut = t, c.loopIn = e, c.smooth = r, c.getVelocityAtTime = expressionHelpers.getVelocityAtTime.bind(c), c.getSpeedAtTime = expressionHelpers.getSpeedAtTime.bind(c), c.numKeys = b.a === 1 ? b.k.length : 0, c.propertyIndex = b.ix;
          var d = 0;
          return v !== 0 && (d = createTypedArray("float32", b.a === 1 ? b.k[0].s.length : b.k.length)), c._cachingAtTime = {
            lastFrame: initialDefaultFrame,
            lastIndex: 0,
            value: d
          }, expressionHelpers.searchExpressions(f, b, c), c.k && A.addDynamicProperty(c), c;
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
            var A, c = m._length, d = m[b], h = m.v, y = createSizedArray(c);
            for (A = 0; A < c; A += 1)
              b === "i" || b === "o" ? y[A] = [d[A][0] - h[A][0], d[A][1] - h[A][1]] : y[A] = [d[A][0], d[A][1]];
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
            for (var A = this._segmentsLength, c = A.lengths, d = A.totalLength * b, h = 0, y = c.length, P = 0, x; h < y; ) {
              if (P + c[h].addedLength > d) {
                var _ = h, M = m.c && h === y - 1 ? 0 : h + 1, w = (d - P) / c[h].addedLength;
                x = bez.getPointInSegment(m.v[_], m.v[M], m.o[_], m.i[M], w, c[h]);
                break;
              } else
                P += c[h].addedLength;
              h += 1;
            }
            return x || (x = m.c ? [m.v[0][0], m.v[0][1]] : [m.v[m._length - 1][0], m.v[m._length - 1][1]]), x;
          },
          vectorOnPath: function(b, v, m) {
            b == 1 ? b = this.v.c : b == 0 && (b = 0.999);
            var A = this.pointOnPath(b, v), c = this.pointOnPath(b + 1e-3, v), d = c[0] - A[0], h = c[1] - A[1], y = Math.sqrt(Math.pow(d, 2) + Math.pow(h, 2));
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
        ShapePropertyFactory.getShapeProp = function(f, b, v, m, A) {
          var c = S(f, b, v, m, A);
          return c.propertyIndex = b.ix, c.lock = !1, v === 3 ? expressionHelpers.searchExpressions(f, b.pt, c) : v === 4 && expressionHelpers.searchExpressions(f, b.ks, c), c.k && f.addDynamicProperty(c), c;
        };
      }
      function initialize$1() {
        addPropertyDecorator();
      }
      function addDecorator() {
        function t() {
          return this.data.d.x ? (this.calculateExpression = ExpressionManager.initiateExpression.bind(this)(this.elem, this.data.d, this), this.addEffect(this.getExpressionValue.bind(this)), !0) : null;
        }
        TextProperty.prototype.getExpressionValue = function(e, r) {
          var i = this.calculateExpression(r);
          if (e.t !== i) {
            var s = {};
            return this.copyData(s, e), s.t = i.toString(), s.__complete = !1, s;
          }
          return e;
        }, TextProperty.prototype.searchProperty = function() {
          var e = this.searchKeyframes(), r = this.searchExpressions();
          return this.kf = e || r, this.kf;
        }, TextProperty.prototype.searchExpressions = t;
      }
      function initialize() {
        addDecorator();
      }
      function SVGComposableEffect() {
      }
      SVGComposableEffect.prototype = {
        createMergeNode: function t(e, r) {
          var i = createNS("feMerge");
          i.setAttribute("result", e);
          var s, n;
          for (n = 0; n < r.length; n += 1)
            s = createNS("feMergeNode"), s.setAttribute("in", r[n]), i.appendChild(s), i.appendChild(s);
          return i;
        }
      };
      var linearFilterValue = "0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0";
      function SVGTintFilter(t, e, r, i, s) {
        this.filterManager = e;
        var n = createNS("feColorMatrix");
        n.setAttribute("type", "matrix"), n.setAttribute("color-interpolation-filters", "linearRGB"), n.setAttribute("values", linearFilterValue + " 1 0"), this.linearFilter = n, n.setAttribute("result", i + "_tint_1"), t.appendChild(n), n = createNS("feColorMatrix"), n.setAttribute("type", "matrix"), n.setAttribute("color-interpolation-filters", "sRGB"), n.setAttribute("values", "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"), n.setAttribute("result", i + "_tint_2"), t.appendChild(n), this.matrixFilter = n;
        var a = this.createMergeNode(i, [s, i + "_tint_1", i + "_tint_2"]);
        t.appendChild(a);
      }
      extendPrototype([SVGComposableEffect], SVGTintFilter), SVGTintFilter.prototype.renderFrame = function(t) {
        if (t || this.filterManager._mdf) {
          var e = this.filterManager.effectElements[0].p.v, r = this.filterManager.effectElements[1].p.v, i = this.filterManager.effectElements[2].p.v / 100;
          this.linearFilter.setAttribute("values", linearFilterValue + " " + i + " 0"), this.matrixFilter.setAttribute("values", r[0] - e[0] + " 0 0 0 " + e[0] + " " + (r[1] - e[1]) + " 0 0 0 " + e[1] + " " + (r[2] - e[2]) + " 0 0 0 " + e[2] + " 0 0 0 1 0");
        }
      };
      function SVGFillFilter(t, e, r, i) {
        this.filterManager = e;
        var s = createNS("feColorMatrix");
        s.setAttribute("type", "matrix"), s.setAttribute("color-interpolation-filters", "sRGB"), s.setAttribute("values", "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"), s.setAttribute("result", i), t.appendChild(s), this.matrixFilter = s;
      }
      SVGFillFilter.prototype.renderFrame = function(t) {
        if (t || this.filterManager._mdf) {
          var e = this.filterManager.effectElements[2].p.v, r = this.filterManager.effectElements[6].p.v;
          this.matrixFilter.setAttribute("values", "0 0 0 0 " + e[0] + " 0 0 0 0 " + e[1] + " 0 0 0 0 " + e[2] + " 0 0 0 " + r + " 0");
        }
      };
      function SVGStrokeEffect(t, e, r) {
        this.initialized = !1, this.filterManager = e, this.elem = r, this.paths = [];
      }
      SVGStrokeEffect.prototype.initialize = function() {
        var t = this.elem.layerElement.children || this.elem.layerElement.childNodes, e, r, i, s;
        for (this.filterManager.effectElements[1].p.v === 1 ? (s = this.elem.maskManager.masksProperties.length, i = 0) : (i = this.filterManager.effectElements[0].p.v - 1, s = i + 1), r = createNS("g"), r.setAttribute("fill", "none"), r.setAttribute("stroke-linecap", "round"), r.setAttribute("stroke-dashoffset", 1), i; i < s; i += 1)
          e = createNS("path"), r.appendChild(e), this.paths.push({
            p: e,
            m: i
          });
        if (this.filterManager.effectElements[10].p.v === 3) {
          var n = createNS("mask"), a = createElementID();
          n.setAttribute("id", a), n.setAttribute("mask-type", "alpha"), n.appendChild(r), this.elem.globalData.defs.appendChild(n);
          var l = createNS("g");
          for (l.setAttribute("mask", "url(" + getLocationHref() + "#" + a + ")"); t[0]; )
            l.appendChild(t[0]);
          this.elem.layerElement.appendChild(l), this.masker = n, r.setAttribute("stroke", "#fff");
        } else if (this.filterManager.effectElements[10].p.v === 1 || this.filterManager.effectElements[10].p.v === 2) {
          if (this.filterManager.effectElements[10].p.v === 2)
            for (t = this.elem.layerElement.children || this.elem.layerElement.childNodes; t.length; )
              this.elem.layerElement.removeChild(t[0]);
          this.elem.layerElement.appendChild(r), this.elem.layerElement.removeAttribute("mask"), r.setAttribute("stroke", "#fff");
        }
        this.initialized = !0, this.pathMasker = r;
      }, SVGStrokeEffect.prototype.renderFrame = function(t) {
        this.initialized || this.initialize();
        var e, r = this.paths.length, i, s;
        for (e = 0; e < r; e += 1)
          if (this.paths[e].m !== -1 && (i = this.elem.maskManager.viewData[this.paths[e].m], s = this.paths[e].p, (t || this.filterManager._mdf || i.prop._mdf) && s.setAttribute("d", i.lastPath), t || this.filterManager.effectElements[9].p._mdf || this.filterManager.effectElements[4].p._mdf || this.filterManager.effectElements[7].p._mdf || this.filterManager.effectElements[8].p._mdf || i.prop._mdf)) {
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
        if ((t || this.filterManager.effectElements[4].p._mdf) && this.pathMasker.setAttribute("stroke-width", this.filterManager.effectElements[4].p.v * 2), (t || this.filterManager.effectElements[6].p._mdf) && this.pathMasker.setAttribute("opacity", this.filterManager.effectElements[6].p.v), (this.filterManager.effectElements[10].p.v === 1 || this.filterManager.effectElements[10].p.v === 2) && (t || this.filterManager.effectElements[3].p._mdf)) {
          var b = this.filterManager.effectElements[3].p.v;
          this.pathMasker.setAttribute("stroke", "rgb(" + bmFloor(b[0] * 255) + "," + bmFloor(b[1] * 255) + "," + bmFloor(b[2] * 255) + ")");
        }
      };
      function SVGTritoneFilter(t, e, r, i) {
        this.filterManager = e;
        var s = createNS("feColorMatrix");
        s.setAttribute("type", "matrix"), s.setAttribute("color-interpolation-filters", "linearRGB"), s.setAttribute("values", "0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0"), t.appendChild(s);
        var n = createNS("feComponentTransfer");
        n.setAttribute("color-interpolation-filters", "sRGB"), n.setAttribute("result", i), this.matrixFilter = n;
        var a = createNS("feFuncR");
        a.setAttribute("type", "table"), n.appendChild(a), this.feFuncR = a;
        var l = createNS("feFuncG");
        l.setAttribute("type", "table"), n.appendChild(l), this.feFuncG = l;
        var o = createNS("feFuncB");
        o.setAttribute("type", "table"), n.appendChild(o), this.feFuncB = o, t.appendChild(n);
      }
      SVGTritoneFilter.prototype.renderFrame = function(t) {
        if (t || this.filterManager._mdf) {
          var e = this.filterManager.effectElements[0].p.v, r = this.filterManager.effectElements[1].p.v, i = this.filterManager.effectElements[2].p.v, s = i[0] + " " + r[0] + " " + e[0], n = i[1] + " " + r[1] + " " + e[1], a = i[2] + " " + r[2] + " " + e[2];
          this.feFuncR.setAttribute("tableValues", s), this.feFuncG.setAttribute("tableValues", n), this.feFuncB.setAttribute("tableValues", a);
        }
      };
      function SVGProLevelsFilter(t, e, r, i) {
        this.filterManager = e;
        var s = this.filterManager.effectElements, n = createNS("feComponentTransfer");
        (s[10].p.k || s[10].p.v !== 0 || s[11].p.k || s[11].p.v !== 1 || s[12].p.k || s[12].p.v !== 1 || s[13].p.k || s[13].p.v !== 0 || s[14].p.k || s[14].p.v !== 1) && (this.feFuncR = this.createFeFunc("feFuncR", n)), (s[17].p.k || s[17].p.v !== 0 || s[18].p.k || s[18].p.v !== 1 || s[19].p.k || s[19].p.v !== 1 || s[20].p.k || s[20].p.v !== 0 || s[21].p.k || s[21].p.v !== 1) && (this.feFuncG = this.createFeFunc("feFuncG", n)), (s[24].p.k || s[24].p.v !== 0 || s[25].p.k || s[25].p.v !== 1 || s[26].p.k || s[26].p.v !== 1 || s[27].p.k || s[27].p.v !== 0 || s[28].p.k || s[28].p.v !== 1) && (this.feFuncB = this.createFeFunc("feFuncB", n)), (s[31].p.k || s[31].p.v !== 0 || s[32].p.k || s[32].p.v !== 1 || s[33].p.k || s[33].p.v !== 1 || s[34].p.k || s[34].p.v !== 0 || s[35].p.k || s[35].p.v !== 1) && (this.feFuncA = this.createFeFunc("feFuncA", n)), (this.feFuncR || this.feFuncG || this.feFuncB || this.feFuncA) && (n.setAttribute("color-interpolation-filters", "sRGB"), t.appendChild(n)), (s[3].p.k || s[3].p.v !== 0 || s[4].p.k || s[4].p.v !== 1 || s[5].p.k || s[5].p.v !== 1 || s[6].p.k || s[6].p.v !== 0 || s[7].p.k || s[7].p.v !== 1) && (n = createNS("feComponentTransfer"), n.setAttribute("color-interpolation-filters", "sRGB"), n.setAttribute("result", i), t.appendChild(n), this.feFuncRComposed = this.createFeFunc("feFuncR", n), this.feFuncGComposed = this.createFeFunc("feFuncG", n), this.feFuncBComposed = this.createFeFunc("feFuncB", n));
      }
      SVGProLevelsFilter.prototype.createFeFunc = function(t, e) {
        var r = createNS(t);
        return r.setAttribute("type", "table"), e.appendChild(r), r;
      }, SVGProLevelsFilter.prototype.getTableValue = function(t, e, r, i, s) {
        for (var n = 0, a = 256, l, o = Math.min(t, e), p = Math.max(t, e), u = Array.call(null, {
          length: a
        }), S, f = 0, b = s - i, v = e - t; n <= 256; )
          l = n / 256, l <= o ? S = v < 0 ? s : i : l >= p ? S = v < 0 ? i : s : S = i + b * Math.pow((l - t) / v, 1 / r), u[f] = S, f += 1, n += 256 / (a - 1);
        return u.join(" ");
      }, SVGProLevelsFilter.prototype.renderFrame = function(t) {
        if (t || this.filterManager._mdf) {
          var e, r = this.filterManager.effectElements;
          this.feFuncRComposed && (t || r[3].p._mdf || r[4].p._mdf || r[5].p._mdf || r[6].p._mdf || r[7].p._mdf) && (e = this.getTableValue(r[3].p.v, r[4].p.v, r[5].p.v, r[6].p.v, r[7].p.v), this.feFuncRComposed.setAttribute("tableValues", e), this.feFuncGComposed.setAttribute("tableValues", e), this.feFuncBComposed.setAttribute("tableValues", e)), this.feFuncR && (t || r[10].p._mdf || r[11].p._mdf || r[12].p._mdf || r[13].p._mdf || r[14].p._mdf) && (e = this.getTableValue(r[10].p.v, r[11].p.v, r[12].p.v, r[13].p.v, r[14].p.v), this.feFuncR.setAttribute("tableValues", e)), this.feFuncG && (t || r[17].p._mdf || r[18].p._mdf || r[19].p._mdf || r[20].p._mdf || r[21].p._mdf) && (e = this.getTableValue(r[17].p.v, r[18].p.v, r[19].p.v, r[20].p.v, r[21].p.v), this.feFuncG.setAttribute("tableValues", e)), this.feFuncB && (t || r[24].p._mdf || r[25].p._mdf || r[26].p._mdf || r[27].p._mdf || r[28].p._mdf) && (e = this.getTableValue(r[24].p.v, r[25].p.v, r[26].p.v, r[27].p.v, r[28].p.v), this.feFuncB.setAttribute("tableValues", e)), this.feFuncA && (t || r[31].p._mdf || r[32].p._mdf || r[33].p._mdf || r[34].p._mdf || r[35].p._mdf) && (e = this.getTableValue(r[31].p.v, r[32].p.v, r[33].p.v, r[34].p.v, r[35].p.v), this.feFuncA.setAttribute("tableValues", e));
        }
      };
      function SVGDropShadowEffect(t, e, r, i, s) {
        var n = e.container.globalData.renderConfig.filterSize, a = e.data.fs || n;
        t.setAttribute("x", a.x || n.x), t.setAttribute("y", a.y || n.y), t.setAttribute("width", a.width || n.width), t.setAttribute("height", a.height || n.height), this.filterManager = e;
        var l = createNS("feGaussianBlur");
        l.setAttribute("in", "SourceAlpha"), l.setAttribute("result", i + "_drop_shadow_1"), l.setAttribute("stdDeviation", "0"), this.feGaussianBlur = l, t.appendChild(l);
        var o = createNS("feOffset");
        o.setAttribute("dx", "25"), o.setAttribute("dy", "0"), o.setAttribute("in", i + "_drop_shadow_1"), o.setAttribute("result", i + "_drop_shadow_2"), this.feOffset = o, t.appendChild(o);
        var p = createNS("feFlood");
        p.setAttribute("flood-color", "#00ff00"), p.setAttribute("flood-opacity", "1"), p.setAttribute("result", i + "_drop_shadow_3"), this.feFlood = p, t.appendChild(p);
        var u = createNS("feComposite");
        u.setAttribute("in", i + "_drop_shadow_3"), u.setAttribute("in2", i + "_drop_shadow_2"), u.setAttribute("operator", "in"), u.setAttribute("result", i + "_drop_shadow_4"), t.appendChild(u);
        var S = this.createMergeNode(i, [i + "_drop_shadow_4", s]);
        t.appendChild(S);
      }
      extendPrototype([SVGComposableEffect], SVGDropShadowEffect), SVGDropShadowEffect.prototype.renderFrame = function(t) {
        if (t || this.filterManager._mdf) {
          if ((t || this.filterManager.effectElements[4].p._mdf) && this.feGaussianBlur.setAttribute("stdDeviation", this.filterManager.effectElements[4].p.v / 4), t || this.filterManager.effectElements[0].p._mdf) {
            var e = this.filterManager.effectElements[0].p.v;
            this.feFlood.setAttribute("flood-color", rgbToHex(Math.round(e[0] * 255), Math.round(e[1] * 255), Math.round(e[2] * 255)));
          }
          if ((t || this.filterManager.effectElements[1].p._mdf) && this.feFlood.setAttribute("flood-opacity", this.filterManager.effectElements[1].p.v / 255), t || this.filterManager.effectElements[2].p._mdf || this.filterManager.effectElements[3].p._mdf) {
            var r = this.filterManager.effectElements[3].p.v, i = (this.filterManager.effectElements[2].p.v - 90) * degToRads, s = r * Math.cos(i), n = r * Math.sin(i);
            this.feOffset.setAttribute("dx", s), this.feOffset.setAttribute("dy", n);
          }
        }
      };
      var _svgMatteSymbols = [];
      function SVGMatte3Effect(t, e, r) {
        this.initialized = !1, this.filterManager = e, this.filterElem = t, this.elem = r, r.matteElement = createNS("g"), r.matteElement.appendChild(r.layerElement), r.matteElement.appendChild(r.transformedElement), r.baseElement = r.matteElement;
      }
      SVGMatte3Effect.prototype.findSymbol = function(t) {
        for (var e = 0, r = _svgMatteSymbols.length; e < r; ) {
          if (_svgMatteSymbols[e] === t)
            return _svgMatteSymbols[e];
          e += 1;
        }
        return null;
      }, SVGMatte3Effect.prototype.replaceInParent = function(t, e) {
        var r = t.layerElement.parentNode;
        if (r) {
          for (var i = r.children, s = 0, n = i.length; s < n && i[s] !== t.layerElement; )
            s += 1;
          var a;
          s <= n - 2 && (a = i[s + 1]);
          var l = createNS("use");
          l.setAttribute("href", "#" + e), a ? r.insertBefore(l, a) : r.appendChild(l);
        }
      }, SVGMatte3Effect.prototype.setElementAsMask = function(t, e) {
        if (!this.findSymbol(e)) {
          var r = createElementID(), i = createNS("mask");
          i.setAttribute("id", e.layerId), i.setAttribute("mask-type", "alpha"), _svgMatteSymbols.push(e);
          var s = t.globalData.defs;
          s.appendChild(i);
          var n = createNS("symbol");
          n.setAttribute("id", r), this.replaceInParent(e, r), n.appendChild(e.layerElement), s.appendChild(n);
          var a = createNS("use");
          a.setAttribute("href", "#" + r), i.appendChild(a), e.data.hd = !1, e.show();
        }
        t.setMatte(e.layerId);
      }, SVGMatte3Effect.prototype.initialize = function() {
        for (var t = this.filterManager.effectElements[0].p.v, e = this.elem.comp.elements, r = 0, i = e.length; r < i; )
          e[r] && e[r].data.ind === t && this.setElementAsMask(this.elem, e[r]), r += 1;
        this.initialized = !0;
      }, SVGMatte3Effect.prototype.renderFrame = function() {
        this.initialized || this.initialize();
      };
      function SVGGaussianBlurEffect(t, e, r, i) {
        t.setAttribute("x", "-100%"), t.setAttribute("y", "-100%"), t.setAttribute("width", "300%"), t.setAttribute("height", "300%"), this.filterManager = e;
        var s = createNS("feGaussianBlur");
        s.setAttribute("result", i), t.appendChild(s), this.feGaussianBlur = s;
      }
      SVGGaussianBlurEffect.prototype.renderFrame = function(t) {
        if (t || this.filterManager._mdf) {
          var e = 0.3, r = this.filterManager.effectElements[0].p.v * e, i = this.filterManager.effectElements[1].p.v, s = i == 3 ? 0 : r, n = i == 2 ? 0 : r;
          this.feGaussianBlur.setAttribute("stdDeviation", s + " " + n);
          var a = this.filterManager.effectElements[2].p.v == 1 ? "wrap" : "duplicate";
          this.feGaussianBlur.setAttribute("edgeMode", a);
        }
      };
      function TransformEffect() {
      }
      TransformEffect.prototype.init = function(t) {
        this.effectsManager = t, this.type = effectTypes.TRANSFORM_EFFECT, this.matrix = new Matrix(), this.opacity = -1, this._mdf = !1, this._opMdf = !1;
      }, TransformEffect.prototype.renderFrame = function(t) {
        if (this._opMdf = !1, this._mdf = !1, t || this.effectsManager._mdf) {
          var e = this.effectsManager.effectElements, r = e[0].p.v, i = e[1].p.v, s = e[2].p.v === 1, n = e[3].p.v, a = s ? n : e[4].p.v, l = e[5].p.v, o = e[6].p.v, p = e[7].p.v;
          this.matrix.reset(), this.matrix.translate(-r[0], -r[1], r[2]), this.matrix.scale(a * 0.01, n * 0.01, 1), this.matrix.rotate(-p * degToRads), this.matrix.skewFromAxis(-l * degToRads, (o + 90) * degToRads), this.matrix.translate(i[0], i[1], 0), this._mdf = !0, this.opacity !== e[8].p.v && (this.opacity = e[8].p.v, this._opMdf = !0);
        }
      };
      function SVGTransformEffect(t, e) {
        this.init(e);
      }
      extendPrototype([TransformEffect], SVGTransformEffect);
      function CVTransformEffect(t) {
        this.init(t);
      }
      return extendPrototype([TransformEffect], CVTransformEffect), registerRenderer("canvas", CanvasRenderer), registerRenderer("html", HybridRenderer), registerRenderer("svg", SVGRenderer), ShapeModifiers.registerModifier("tm", TrimModifier), ShapeModifiers.registerModifier("pb", PuckerAndBloatModifier), ShapeModifiers.registerModifier("rp", RepeaterModifier), ShapeModifiers.registerModifier("rd", RoundCornersModifier), ShapeModifiers.registerModifier("zz", ZigZagModifier), ShapeModifiers.registerModifier("op", OffsetPathModifier), setExpressionsPlugin(Expressions), setExpressionInterfaces(getInterface), initialize$1(), initialize(), registerEffect$1(20, SVGTintFilter, !0), registerEffect$1(21, SVGFillFilter, !0), registerEffect$1(22, SVGStrokeEffect, !1), registerEffect$1(23, SVGTritoneFilter, !0), registerEffect$1(24, SVGProLevelsFilter, !0), registerEffect$1(25, SVGDropShadowEffect, !0), registerEffect$1(28, SVGMatte3Effect, !1), registerEffect$1(29, SVGGaussianBlurEffect, !0), registerEffect$1(35, SVGTransformEffect, !1), registerEffect(35, CVTransformEffect), lottie;
    }));
  })(lottie$2, lottie$2.exports)), lottie$2.exports;
}
var lottieExports = /* @__PURE__ */ requireLottie();
const lottie = /* @__PURE__ */ getDefaultExportFromCjs(lottieExports);
function _arrayLikeToArray(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var r = 0, i = Array(e); r < e; r++) i[r] = t[r];
  return i;
}
function _arrayWithHoles(t) {
  if (Array.isArray(t)) return t;
}
function _defineProperty(t, e, r) {
  return (e = _toPropertyKey(e)) in t ? Object.defineProperty(t, e, {
    value: r,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : t[e] = r, t;
}
function _iterableToArrayLimit(t, e) {
  var r = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (r != null) {
    var i, s, n, a, l = [], o = !0, p = !1;
    try {
      if (n = (r = r.call(t)).next, e !== 0) for (; !(o = (i = n.call(r)).done) && (l.push(i.value), l.length !== e); o = !0) ;
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
function ownKeys(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e && (i = i.filter(function(s) {
      return Object.getOwnPropertyDescriptor(t, s).enumerable;
    })), r.push.apply(r, i);
  }
  return r;
}
function _objectSpread2(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2 ? ownKeys(Object(r), !0).forEach(function(i) {
      _defineProperty(t, i, r[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r)) : ownKeys(Object(r)).forEach(function(i) {
      Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(r, i));
    });
  }
  return t;
}
function _objectWithoutProperties(t, e) {
  if (t == null) return {};
  var r, i, s = _objectWithoutPropertiesLoose(t, e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    for (i = 0; i < n.length; i++) r = n[i], e.includes(r) || {}.propertyIsEnumerable.call(t, r) && (s[r] = t[r]);
  }
  return s;
}
function _objectWithoutPropertiesLoose(t, e) {
  if (t == null) return {};
  var r = {};
  for (var i in t) if ({}.hasOwnProperty.call(t, i)) {
    if (e.includes(i)) continue;
    r[i] = t[i];
  }
  return r;
}
function _slicedToArray(t, e) {
  return _arrayWithHoles(t) || _iterableToArrayLimit(t, e) || _unsupportedIterableToArray(t, e) || _nonIterableRest();
}
function _toPrimitive(t, e) {
  if (typeof t != "object" || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var i = r.call(t, e);
    if (typeof i != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function _toPropertyKey(t) {
  var e = _toPrimitive(t, "string");
  return typeof e == "symbol" ? e : e + "";
}
function _unsupportedIterableToArray(t, e) {
  if (t) {
    if (typeof t == "string") return _arrayLikeToArray(t, e);
    var r = {}.toString.call(t).slice(8, -1);
    return r === "Object" && t.constructor && (r = t.constructor.name), r === "Map" || r === "Set" ? Array.from(t) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? _arrayLikeToArray(t, e) : void 0;
  }
}
var _excluded$1 = ["animationData", "loop", "autoplay", "initialSegment", "onComplete", "onLoopComplete", "onEnterFrame", "onSegmentStart", "onConfigReady", "onDataReady", "onDataFailed", "onLoadedImages", "onDOMLoaded", "onDestroy", "lottieRef", "renderer", "name", "assetsPath", "rendererSettings"], useLottie = function t(e, r) {
  var i = e.animationData, s = e.loop, n = e.autoplay, a = e.initialSegment, l = e.onComplete, o = e.onLoopComplete, p = e.onEnterFrame, u = e.onSegmentStart, S = e.onConfigReady, f = e.onDataReady, b = e.onDataFailed, v = e.onLoadedImages, m = e.onDOMLoaded, A = e.onDestroy;
  e.lottieRef, e.renderer, e.name, e.assetsPath, e.rendererSettings;
  var c = _objectWithoutProperties(e, _excluded$1), d = useState(!1), h = _slicedToArray(d, 2), y = h[0], P = h[1], x = useRef(), _ = useRef(null), M = function() {
    var L;
    (L = x.current) === null || L === void 0 || L.play();
  }, w = function() {
    var L;
    (L = x.current) === null || L === void 0 || L.stop();
  }, B = function() {
    var L;
    (L = x.current) === null || L === void 0 || L.pause();
  }, V = function(L) {
    var D;
    (D = x.current) === null || D === void 0 || D.setSpeed(L);
  }, I = function(L, D) {
    var O;
    (O = x.current) === null || O === void 0 || O.goToAndPlay(L, D);
  }, N = function(L, D) {
    var O;
    (O = x.current) === null || O === void 0 || O.goToAndStop(L, D);
  }, G = function(L) {
    var D;
    (D = x.current) === null || D === void 0 || D.setDirection(L);
  }, R = function(L, D) {
    var O;
    (O = x.current) === null || O === void 0 || O.playSegments(L, D);
  }, C = function(L) {
    var D;
    (D = x.current) === null || D === void 0 || D.setSubframe(L);
  }, T = function(L) {
    var D;
    return (D = x.current) === null || D === void 0 ? void 0 : D.getDuration(L);
  }, g = function() {
    var L;
    (L = x.current) === null || L === void 0 || L.destroy(), x.current = void 0;
  }, E = function() {
    var L = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, D;
    if (_.current) {
      (D = x.current) === null || D === void 0 || D.destroy();
      var O = _objectSpread2(_objectSpread2(_objectSpread2({}, e), L), {}, {
        container: _.current
      });
      return x.current = lottie.loadAnimation(O), P(!!x.current), function() {
        var j;
        (j = x.current) === null || j === void 0 || j.destroy(), x.current = void 0;
      };
    }
  };
  useEffect(function() {
    var k = E();
    return function() {
      return k == null ? void 0 : k();
    };
  }, [i, s]), useEffect(function() {
    x.current && (x.current.autoplay = !!n);
  }, [n]), useEffect(function() {
    if (x.current) {
      if (!a) {
        x.current.resetSegments(!0);
        return;
      }
      !Array.isArray(a) || !a.length || ((x.current.currentRawFrame < a[0] || x.current.currentRawFrame > a[1]) && (x.current.currentRawFrame = a[0]), x.current.setSegment(a[0], a[1]));
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
      handler: A
    }], L = k.filter(function(O) {
      return O.handler != null;
    });
    if (L.length) {
      var D = L.map(
        /**
         * Handle the process of adding an event listener
         * @param {Listener} listener
         * @return {Function} Function that deregister the listener
         */
        function(O) {
          var j;
          return (j = x.current) === null || j === void 0 || j.addEventListener(O.name, O.handler), function() {
            var q;
            (q = x.current) === null || q === void 0 || q.removeEventListener(O.name, O.handler);
          };
        }
      );
      return function() {
        D.forEach(function(O) {
          return O();
        });
      };
    }
  }, [l, o, p, u, S, f, b, v, m, A]);
  var F = /* @__PURE__ */ React.createElement("div", _objectSpread2({
    style: r,
    ref: _
  }, c));
  return {
    View: F,
    play: M,
    stop: w,
    pause: B,
    setSpeed: V,
    goToAndStop: N,
    goToAndPlay: I,
    setDirection: G,
    playSegments: R,
    setSubframe: C,
    getDuration: T,
    destroy: g,
    animationContainerRef: _,
    animationLoaded: y,
    animationItem: x.current
  };
};
function getContainerVisibility(t) {
  var e = t.getBoundingClientRect(), r = e.top, i = e.height, s = window.innerHeight - r, n = window.innerHeight + i;
  return s / n;
}
function getContainerCursorPosition(t, e, r) {
  var i = t.getBoundingClientRect(), s = i.top, n = i.left, a = i.width, l = i.height, o = (e - n) / a, p = (r - s) / l;
  return {
    x: o,
    y: p
  };
}
var useInitInteractivity = function t(e) {
  var r = e.wrapperRef, i = e.animationItem, s = e.mode, n = e.actions;
  useEffect(function() {
    var a = r.current;
    if (!(!a || !i || !n.length)) {
      i.stop();
      var l = function() {
        var u = null, S = function() {
          var b = getContainerVisibility(a), v = n.find(function(A) {
            var c = A.visibility;
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
          var A = v, c = m;
          if (A !== -1 && c !== -1) {
            var d = getContainerCursorPosition(a, A, c);
            A = d.x, c = d.y;
          }
          var h = n.find(function(x) {
            var _ = x.position;
            return _ && Array.isArray(_.x) && Array.isArray(_.y) ? A >= _.x[0] && A <= _.x[1] && c >= _.y[0] && c <= _.y[1] : _ && !Number.isNaN(_.x) && !Number.isNaN(_.y) ? A === _.x && c === _.y : !1;
          });
          if (h) {
            if (h.type === "seek" && h.position && Array.isArray(h.position.x) && Array.isArray(h.position.y) && h.frames.length === 2) {
              var y = (A - h.position.x[0]) / (h.position.x[1] - h.position.x[0]), P = (c - h.position.y[0]) / (h.position.y[1] - h.position.y[0]);
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
}, useLottieInteractivity = function t(e) {
  var r = e.actions, i = e.mode, s = e.lottieObj, n = s.animationItem, a = s.View, l = s.animationContainerRef;
  return useInitInteractivity({
    actions: r,
    animationItem: n,
    mode: i,
    wrapperRef: l
  }), a;
}, _excluded = ["style", "interactivity"], Lottie = function t(e) {
  var r, i, s, n = e.style, a = e.interactivity, l = _objectWithoutProperties(e, _excluded), o = useLottie(l, n), p = o.View, u = o.play, S = o.stop, f = o.pause, b = o.setSpeed, v = o.goToAndStop, m = o.goToAndPlay, A = o.setDirection, c = o.playSegments, d = o.setSubframe, h = o.getDuration, y = o.destroy, P = o.animationContainerRef, x = o.animationLoaded, _ = o.animationItem;
  return useEffect(function() {
    e.lottieRef && (e.lottieRef.current = {
      play: u,
      stop: S,
      pause: f,
      setSpeed: b,
      goToAndPlay: m,
      goToAndStop: v,
      setDirection: A,
      playSegments: c,
      setSubframe: d,
      getDuration: h,
      destroy: y,
      animationContainerRef: P,
      animationLoaded: x,
      animationItem: _
    });
  }, [(r = e.lottieRef) === null || r === void 0 ? void 0 : r.current]), useLottieInteractivity({
    lottieObj: {
      View: p,
      play: u,
      stop: S,
      pause: f,
      setSpeed: b,
      goToAndStop: v,
      goToAndPlay: m,
      setDirection: A,
      playSegments: c,
      setSubframe: d,
      getDuration: h,
      destroy: y,
      animationContainerRef: P,
      animationLoaded: x,
      animationItem: _
    },
    actions: (i = a == null ? void 0 : a.actions) !== null && i !== void 0 ? i : [],
    mode: (s = a == null ? void 0 : a.mode) !== null && s !== void 0 ? s : "scroll"
  });
};
const browserPrefersReducedMotion$2 = () => typeof window > "u" || typeof window.matchMedia != "function" ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function LottieBotAvatar({
  model: t,
  state: e,
  size: r,
  lightColor: i,
  ariaLabel: s,
  paused: n = !1
}) {
  const a = useRef(null), [l, o] = useState(browserPrefersReducedMotion$2), [p, u] = useState(!1), S = t.stateSegments[e] ?? t.fallbackSegment;
  return useEffect(() => {
    if (typeof window > "u" || typeof window.matchMedia != "function")
      return;
    const f = window.matchMedia("(prefers-reduced-motion: reduce)"), b = () => o(f.matches);
    return f.addEventListener("change", b), () => f.removeEventListener("change", b);
  }, []), useEffect(() => {
    var f, b, v, m, A;
    if (p) {
      if (l) {
        (f = a.current) == null || f.goToAndStop(S[0], !0);
        return;
      }
      if (n) {
        (b = a.current) == null || b.pause();
        return;
      }
      (m = (v = a.current) == null ? void 0 : v.animationItem) == null || m.setSegment(S[0], S[1]), (A = a.current) == null || A.goToAndPlay(S[0], !0);
    }
  }, [p, n, l, S]), /* @__PURE__ */ jsx(
    "div",
    {
      role: "img",
      "aria-label": s ?? `Bot avatar - ${e} state - ${t.name} model`,
      "data-vultus-model": t.id,
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
          animationData: t.animationData,
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
function defineProceduralAvatarModel(t) {
  return Object.freeze({ ...t, renderer: "procedural" });
}
function defineLottieAvatarModel(t) {
  return Object.freeze({ ...t, renderer: "lottie" });
}
function createBotAvatarModelZoo(t) {
  const e = t.map((i) => [i.id, i]), r = e.map(([i]) => i);
  if (new Set(r).size !== r.length)
    throw new Error("Vultus model identifiers must be unique.");
  return Object.freeze(Object.fromEntries(e));
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
function avatarModelFromZoo(t, e, r = VULTUS_CLASSIC_MODEL) {
  return t[e] ?? r;
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
}, NEUTRAL_GAZE_VECTOR = { x: 0, y: 0 }, clampUnit = (t) => Math.max(-1, Math.min(1, t));
function makeSeededRandom(t) {
  let e = t >>> 0;
  return () => {
    e = e + 1831565813 | 0;
    let r = Math.imul(e ^ e >>> 15, 1 | e);
    return r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r, ((r ^ r >>> 14) >>> 0) / 4294967296;
  };
}
function computePointerGazeVector(t, e) {
  if (t.width <= 0 || t.height <= 0)
    return { ...NEUTRAL_GAZE_VECTOR };
  const r = t.left + t.width / 2, i = t.top + t.height / 2;
  return {
    x: clampUnit((e.x - r) / (t.width / 2)),
    y: clampUnit((e.y - i) / (t.height / 2))
  };
}
function isPointerWithinProximity(t, e, r) {
  const i = Math.max(t.left, Math.min(e.x, t.left + t.width)), s = Math.max(t.top, Math.min(e.y, t.top + t.height)), n = e.x - i, a = e.y - s;
  return Math.sqrt(n * n + a * a) <= r;
}
function applyGazeTravel(t, e) {
  return {
    dx: t.x >= 0 ? t.x * e.right : t.x * e.left,
    dy: t.y >= 0 ? t.y * e.down : t.y * e.up
  };
}
function applyBlinkScale(t, e) {
  return 1 - t * (1 - e);
}
const randomBlinkGapMs = (t, e) => e.blinkMinMs + t() * (e.blinkMaxMs - e.blinkMinMs);
function createBlinkState(t, e, r = DEFAULT_GAZE_CONFIG) {
  return { phase: "open", eyelid: 0, nextChangeAt: t + randomBlinkGapMs(e, r) };
}
function advanceBlinkState(t, e, r, i = DEFAULT_GAZE_CONFIG) {
  return e < t.nextChangeAt ? t : t.phase === "open" ? { phase: "closing", eyelid: 1, nextChangeAt: e + i.blinkCloseMs + i.blinkHoldMs } : t.phase === "closing" ? { phase: "opening", eyelid: 0, nextChangeAt: e + i.blinkOpenMs } : { phase: "open", eyelid: 0, nextChangeAt: e + randomBlinkGapMs(r, i) };
}
function buildBodyFlinchSteps(t = DEFAULT_GAZE_CONFIG) {
  return [
    {
      scale: t.bodyFlinchSquashScale,
      recoilFactor: 1,
      durationMs: t.bodyFlinchInMs,
      waitMs: t.bodyFlinchInMs
    },
    {
      scale: t.bodyFlinchOvershootScale,
      recoilFactor: -0.35,
      durationMs: t.bodyFlinchOvershootMs,
      waitMs: t.bodyFlinchOvershootMs
    },
    { scale: 1, recoilFactor: 0, durationMs: t.bodyFlinchSettleMs, waitMs: t.bodyFlinchSettleMs }
  ];
}
function applyBodyFlinchRecoil(t, e, r, i) {
  return {
    dx: e.x * r * t,
    dy: e.y * r * t,
    rotation: e.x * i * t
  };
}
const randomRestGapMs = (t, e) => e.wanderMinMs + t() * (e.wanderMaxMs - e.wanderMinMs);
function createGazeWanderState(t, e, r = DEFAULT_GAZE_CONFIG) {
  return {
    phase: "resting",
    vector: { ...NEUTRAL_GAZE_VECTOR },
    nextChangeAt: t + randomRestGapMs(e, r)
  };
}
function advanceGazeWander(t, e, r, i = DEFAULT_GAZE_CONFIG) {
  if (e < t.nextChangeAt)
    return t;
  if (t.phase === "resting") {
    const s = r() * Math.PI * 2, n = i.wanderMagnitude * (0.5 + r() * 0.5);
    return {
      phase: "glancing",
      vector: { x: clampUnit(Math.cos(s) * n), y: clampUnit(Math.sin(s) * n) },
      nextChangeAt: e + i.wanderHoldMs
    };
  }
  return {
    phase: "resting",
    vector: { ...NEUTRAL_GAZE_VECTOR },
    nextChangeAt: e + randomRestGapMs(r, i)
  };
}
const browserPrefersReducedMotion$1 = () => typeof window > "u" || typeof window.matchMedia != "function" ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches, browserHasFinePointer = () => typeof window > "u" || typeof window.matchMedia != "function" ? !1 : window.matchMedia("(pointer: fine)").matches, isFixedVector = (t) => typeof t == "object";
function useGazeBehavior({
  svgElementRef: t,
  gazeGroupElementRef: e,
  eyelidGroupElementRef: r,
  bodyElementRef: i,
  gaze: s,
  geometry: n,
  config: a
}) {
  const l = useRef({ ...DEFAULT_GAZE_CONFIG, ...a });
  l.current = { ...DEFAULT_GAZE_CONFIG, ...a };
  const o = isFixedVector(s) ? `${s.x}:${s.y}` : null;
  useEffect(() => {
    const p = e.current, u = r.current, S = t.current;
    if (s === "none" || !n || !p || !u || !S)
      return;
    let f = !1, b = browserPrefersReducedMotion$1(), v = browserHasFinePointer(), m = null, A = !1, c = !1, d = !0, h = typeof document < "u" && document.hidden, y = null, P = null, x = null, _ = null, M = !1, w = null, B = createGazeWanderState(Date.now(), Math.random, l.current), V = createBlinkState(Date.now(), Math.random, l.current);
    const I = () => f || b || h || !d, N = (H, U) => {
      if (!n)
        return;
      const { dx: K, dy: it } = applyGazeTravel(H, n.travel);
      p.style.transition = b ? "none" : `transform ${U}ms ${l.current.easing}`, p.style.transform = `translate(${K}px, ${it}px)`;
    }, G = (H, U) => {
      if (!n)
        return;
      const K = applyBlinkScale(H, n.blinkClosedScaleY);
      u.style.transition = b ? "none" : `transform ${U}ms ${l.current.easing}`, u.style.transform = `scaleY(${K})`;
    }, R = (H) => N(NEUTRAL_GAZE_VECTOR, H), C = () => {
      y !== null && (clearTimeout(y), y = null);
    }, T = () => {
      P !== null && (clearTimeout(P), P = null);
    }, g = () => {
      x !== null && (clearTimeout(x), x = null);
    }, E = () => {
      _ !== null && (clearTimeout(_), _ = null);
    }, F = () => {
      C(), y = setTimeout(() => {
        y = null, A = !1, I() || R(l.current.driftBackMs), j();
      }, l.current.pointerRestMs);
    }, k = () => {
      if (w = null, I() || s !== "pointer" || !v || !m)
        return;
      const H = S.getBoundingClientRect();
      N(computePointerGazeVector(H, m), l.current.trackMs), A = !0, F();
    }, L = (H) => {
      H.pointerType !== "mouse" && H.pointerType !== "pen" || (v = !0, m = { x: H.clientX, y: H.clientY }, T(), w === null && (w = typeof requestAnimationFrame == "function" ? requestAnimationFrame(k) : setTimeout(k, 16)));
    }, D = () => {
      m = null, A = !1, C(), !I() && s === "pointer" && (R(l.current.driftBackMs), j());
    }, O = () => {
      const H = Date.now();
      B = advanceGazeWander(B, H, Math.random, l.current), I() || N(B.vector, l.current.wanderHoldMs);
      const U = Math.max(16, B.nextChangeAt - H);
      P = setTimeout(O, U);
    };
    function j() {
      if (T(), isFixedVector(s) || I())
        return;
      if (s === "auto" || s === "pointer" && !A) {
        const U = Date.now();
        B = createGazeWanderState(U, Math.random, l.current), P = setTimeout(O, Math.max(16, B.nextChangeAt - U));
      }
    }
    const q = () => {
      const H = Date.now();
      if (V = advanceBlinkState(V, H, Math.random, l.current), !I()) {
        const K = V.phase === "closing" ? l.current.blinkCloseMs : V.phase === "opening" ? l.current.blinkOpenMs : l.current.blinkCloseMs;
        G(V.eyelid, K);
      }
      const U = Math.max(16, V.nextChangeAt - H);
      x = setTimeout(q, U);
    };
    function Y() {
      if (g(), c || I())
        return;
      const H = Date.now();
      V = createBlinkState(H, Math.random, l.current), x = setTimeout(q, Math.max(16, V.nextChangeAt - H));
    }
    const X = (H) => {
      H.pointerType !== "mouse" && H.pointerType !== "pen" || c || I() || (c = !0, g(), G(l.current.defensiveSquintEyelid, l.current.defensiveSquintInMs));
    }, W = (H) => {
      H.pointerType !== "mouse" && H.pointerType !== "pen" || c && (c = !1, I() || G(0, l.current.defensiveSquintOutMs), Y());
    }, $ = n.bodyFlinch ? (i == null ? void 0 : i.current) ?? null : null, J = (H) => {
      if (!$ || M || I() || !n)
        return;
      const U = $.getBoundingClientRect(), K = computePointerGazeVector(U, { x: H.clientX, y: H.clientY }), it = { x: -K.x, y: -K.y };
      M = !0;
      const st = buildBodyFlinchSteps(l.current), nt = (lt) => {
        if (lt >= st.length) {
          M = !1;
          return;
        }
        const at = st[lt];
        if (!I()) {
          const { dx: ht, dy: ft, rotation: pt } = applyBodyFlinchRecoil(
            at.recoilFactor,
            it,
            n.bodyFlinchRecoilDistance,
            l.current.bodyFlinchRotationDeg
          );
          $.style.transition = b ? "none" : `transform ${at.durationMs}ms ${l.current.easing}`, $.style.transform = `translate(${ht}px, ${ft}px) rotate(${pt}deg) scale(${at.scale})`;
        }
        _ = setTimeout(() => {
          _ = null, nt(lt + 1);
        }, at.waitMs);
      };
      nt(0);
    }, tt = () => {
      c = !1, u.style.transition = "none", u.style.transform = "scaleY(1)", $ && ($.style.transition = "none", $.style.transform = "translate(0px, 0px) rotate(0deg) scale(1)");
    }, Z = (H) => {
      b = H.matches, b ? (C(), T(), g(), E(), M = !1, p.style.transition = "none", p.style.transform = "translate(0px, 0px)", tt()) : (j(), Y());
    }, z = (H) => {
      v = H.matches, j();
    }, ot = () => {
      h = typeof document < "u" && document.hidden, h ? (C(), T(), g(), E(), M = !1) : (j(), Y());
    };
    let rt = null;
    typeof IntersectionObserver == "function" && (rt = new IntersectionObserver(
      (H) => {
        const U = H[H.length - 1];
        d = (U == null ? void 0 : U.isIntersecting) ?? !0, d ? (j(), Y()) : (C(), T(), g(), E(), M = !1);
      },
      { threshold: 0 }
    ), rt.observe(S));
    const et = typeof window.matchMedia == "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null, Q = typeof window.matchMedia == "function" ? window.matchMedia("(pointer: fine)") : null;
    return et == null || et.addEventListener("change", Z), Q == null || Q.addEventListener("change", z), window.addEventListener("pointermove", L, { passive: !0 }), document.addEventListener("mouseleave", D), document.addEventListener("visibilitychange", ot), S.addEventListener("pointerenter", X), S.addEventListener("pointerleave", W), $ && $.addEventListener("click", J), isFixedVector(s) ? N(s, l.current.trackMs) : R(0), G(0, 0), b ? tt() : (j(), Y()), () => {
      f = !0, C(), T(), g(), E(), w !== null && (typeof cancelAnimationFrame == "function" ? cancelAnimationFrame(w) : clearTimeout(w)), rt == null || rt.disconnect(), et == null || et.removeEventListener("change", Z), Q == null || Q.removeEventListener("change", z), window.removeEventListener("pointermove", L), document.removeEventListener("mouseleave", D), document.removeEventListener("visibilitychange", ot), S.removeEventListener("pointerenter", X), S.removeEventListener("pointerleave", W), $ && $.removeEventListener("click", J);
    };
  }, [
    s === "none" ? "none" : s === "auto" ? "auto" : s === "pointer" ? "pointer" : o,
    n,
    e,
    r,
    t
  ]);
}
const DEFAULT_BOT_AVATAR_SHADOW_COLOR_NAME = "dimgray", DEFAULT_BOT_AVATAR_LIGHT_COLOR_NAME = "white", DEFAULT_NEUTRAL_BORED_INTERVAL_MIN_MS = 1e4, DEFAULT_NEUTRAL_BORED_INTERVAL_MAX_MS = 2e4, DEFAULT_NEUTRAL_BORED_VARIANT_DURATION_MIN_MS = 1e3, DEFAULT_NEUTRAL_BORED_VARIANT_DURATION_MAX_MS = 2e3, ellipsePathAtPosition = (t, e, r, i) => buildFourSegmentEllipsePath(t, e, r, i), appendBlinkToTimeline = (t, e, r) => {
  const i = computeAllFacialPathsForState(e.model, "neutral"), s = ellipsePathAtPosition(70, 90, 13, 1.5), n = ellipsePathAtPosition(130, 90, 13, 1.5), a = { value: 0 }, l = (r == null ? void 0 : r.closeDuration) ?? 0.09, o = (r == null ? void 0 : r.closedHoldDuration) ?? 0.03, p = (r == null ? void 0 : r.openDuration) ?? 0.13, u = () => {
    var f, b;
    const S = a.value;
    (f = e.leftEyePathElementRef.current) == null || f.setAttribute(
      "d",
      interpolateNumericValuesBetweenPathStrings(i.leftEyePathString, s, S)
    ), (b = e.rightEyePathElementRef.current) == null || b.setAttribute(
      "d",
      interpolateNumericValuesBetweenPathStrings(i.rightEyePathString, n, S)
    );
  };
  t.to(a, {
    value: 1,
    duration: l,
    ease: "power2.in",
    onUpdate: u
  }), o > 0 && t.to({}, { duration: o }), t.to(a, {
    value: 0,
    duration: p,
    ease: "power2.out",
    onUpdate: u
  });
}, buildNeutralBlinkBoredAnimation = (t, e) => {
  const r = Math.max(e / 1e3, 1), i = Math.max(0.24, r - 0.58), s = gsap.timeline();
  return appendBlinkToTimeline(s, t, {
    closeDuration: 0.1,
    closedHoldDuration: 0.03,
    openDuration: 0.16
  }), s.to({}, { duration: i * 0.45 }), appendBlinkToTimeline(s, t, {
    closeDuration: 0.08,
    closedHoldDuration: 0.02,
    openDuration: 0.12
  }), s.to({}, { duration: i * 0.55 }), s;
}, buildNeutralEyeGlanceBoredAnimation = (t, e) => {
  const r = Math.max(e / 1e3, 1), i = r * 0.24, s = r * 0.14, n = ellipsePathAtPosition(70, 90, 14, 14), a = ellipsePathAtPosition(130, 90, 14, 14), l = ellipsePathAtPosition(75, 90, 14, 14), o = ellipsePathAtPosition(135, 90, 14, 14), p = ellipsePathAtPosition(65, 90, 14, 14), u = ellipsePathAtPosition(125, 90, 14, 14), S = gsap.timeline(), f = (b, v, m, A, c) => {
    const d = { value: 0 };
    S.to(d, {
      value: 1,
      duration: c,
      ease: "sine.inOut",
      onUpdate: () => {
        var y, P;
        const h = d.value;
        (y = t.leftEyePathElementRef.current) == null || y.setAttribute(
          "d",
          interpolateNumericValuesBetweenPathStrings(b, v, h)
        ), (P = t.rightEyePathElementRef.current) == null || P.setAttribute(
          "d",
          interpolateNumericValuesBetweenPathStrings(m, A, h)
        );
      }
    });
  };
  return f(n, l, a, o, i), S.to({}, { duration: s * 0.6 }), appendBlinkToTimeline(S, t, {
    closeDuration: 0.08,
    closedHoldDuration: 0.02,
    openDuration: 0.1
  }), S.to({}, { duration: s * 0.4 }), f(l, p, o, u, i), S.to({}, { duration: s * 0.6 }), appendBlinkToTimeline(S, t, {
    closeDuration: 0.07,
    closedHoldDuration: 0.01,
    openDuration: 0.09
  }), S.to({}, { duration: s * 0.4 }), f(p, n, u, a, i), S.to({}, { duration: Math.max(0.08, r - (i * 3 + s * 2 + 0.37)) }), S;
}, buildNeutralAntennaFidgetBoredAnimation = (t, e) => {
  const r = Math.max(e / 1e3, 1), i = gsap.timeline();
  return t.antennaCircleElementRef.current && i.to(t.antennaCircleElementRef.current, {
    scale: 1.36,
    transformOrigin: "100px 20px",
    duration: r * 0.18,
    yoyo: !0,
    repeat: 3,
    ease: "sine.inOut"
  }, 0), t.innerHeadGroupElementRef.current && i.to(t.innerHeadGroupElementRef.current, {
    y: -1.5,
    duration: r * 0.22,
    yoyo: !0,
    repeat: 3,
    ease: "sine.inOut"
  }, 0), appendBlinkToTimeline(i, t, {
    closeDuration: 0.08,
    closedHoldDuration: 0.02,
    openDuration: 0.1
  }), i.to({}, { duration: Math.max(0.08, r * 0.12) }), i;
}, buildEyeWanderIdleAnimation = (t, e, r, i) => {
  const n = e.map((l) => ({
    leftEyePath: ellipsePathAtPosition(l.leftEyeCenter[0], l.leftEyeCenter[1], 14, 14),
    rightEyePath: ellipsePathAtPosition(
      l.rightEyeCenter[0],
      l.rightEyeCenter[1],
      14,
      14
    )
  })), a = gsap.timeline({ repeat: -1 });
  for (let l = 0; l < n.length; l += 1) {
    const o = n[l], p = n[(l + 1) % n.length], u = { value: 0 };
    a.to(u, {
      value: 1,
      duration: r,
      ease: "power2.inOut",
      onUpdate: () => {
        var f, b;
        const S = u.value;
        (f = t.leftEyePathElementRef.current) == null || f.setAttribute(
          "d",
          interpolateNumericValuesBetweenPathStrings(o.leftEyePath, p.leftEyePath, S)
        ), (b = t.rightEyePathElementRef.current) == null || b.setAttribute(
          "d",
          interpolateNumericValuesBetweenPathStrings(o.rightEyePath, p.rightEyePath, S)
        );
      }
    }), a.to({}, { duration: i(l) });
  }
  return a;
}, buildThinkingWanderIdleAnimation = (t) => buildEyeWanderIdleAnimation(
  t,
  [
    { leftEyeCenter: [70, 86], rightEyeCenter: [130, 86] },
    { leftEyeCenter: [66, 84], rightEyeCenter: [126, 84] },
    { leftEyeCenter: [70, 82], rightEyeCenter: [130, 82] },
    { leftEyeCenter: [74, 84], rightEyeCenter: [134, 84] }
  ],
  0.5,
  () => 1.1 + Math.random() * 0.6
), buildToolResponseReadingIdleAnimation = (t) => buildEyeWanderIdleAnimation(
  t,
  [
    { leftEyeCenter: [66, 90], rightEyeCenter: [126, 90] },
    { leftEyeCenter: [70, 90], rightEyeCenter: [130, 90] },
    { leftEyeCenter: [74, 90], rightEyeCenter: [134, 90] },
    { leftEyeCenter: [70, 90], rightEyeCenter: [130, 90] }
  ],
  0.16,
  () => 0.35
), buildSimpleTransformIdleAnimation = (t, e) => {
  if (!t)
    return { kill: () => {
    } };
  const r = gsap.to(t, e);
  return {
    kill: () => {
      r.kill(), gsap.set(t, { clearProps: "transform" });
    }
  };
}, buildDeepThinkingBreathingIdleAnimation = (t) => buildSimpleTransformIdleAnimation(t.innerHeadGroupElementRef.current, {
  scale: 1.025,
  transformOrigin: "100px 100px",
  duration: 2.6,
  yoyo: !0,
  repeat: -1,
  ease: "sine.inOut"
}), buildToolCallingAntennaPulseIdleAnimation = (t) => buildSimpleTransformIdleAnimation(t.antennaCircleElementRef.current, {
  scale: 1.45,
  transformOrigin: "100px 20px",
  duration: 0.42,
  yoyo: !0,
  repeat: -1,
  ease: "sine.inOut"
}), buildSpeakingCompleteHappyBounceIdleAnimation = (t) => buildSimpleTransformIdleAnimation(t.innerHeadGroupElementRef.current, {
  y: -2,
  duration: 0.7,
  yoyo: !0,
  repeat: -1,
  ease: "sine.inOut"
}), buildSpeakingVariantPulseIdleAnimation = (t, e, r) => {
  const i = computeAllFacialPathsForState(t.model, e).mouthPathString, s = computeAllFacialPathsForState(
    t.model,
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
      (a = t.mouthPathElementRef.current) == null || a.setAttribute(
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
  thinking: (t) => buildThinkingWanderIdleAnimation(t),
  deepThinking: (t) => buildDeepThinkingBreathingIdleAnimation(t),
  toolCalling: (t) => buildToolCallingAntennaPulseIdleAnimation(t),
  toolResponse: (t) => buildToolResponseReadingIdleAnimation(t),
  speakingOpen: (t) => buildSpeakingVariantPulseIdleAnimation(t, "speakingOpen", "speakingRound"),
  speakingWide: (t) => buildSpeakingVariantPulseIdleAnimation(t, "speakingWide", "speakingOpen"),
  speakingRound: (t) => buildSpeakingVariantPulseIdleAnimation(t, "speakingRound", "speakingWide"),
  speakingComplete: (t) => buildSpeakingCompleteHappyBounceIdleAnimation(t)
}, isBotAvatarState = (t) => BOT_AVATAR_STATES.includes(t), pickRandomDurationMilliseconds = (t, e) => t + Math.floor(Math.random() * (e - t + 1)), pickRandomNeutralBoredAnimationBuilder = () => neutralBoredAnimationBuilders[Math.floor(Math.random() * neutralBoredAnimationBuilders.length)], browserPrefersReducedMotion = () => typeof window > "u" || typeof window.matchMedia != "function" ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches, resolveFillColor = (t, e) => t === "shadow" ? e.shadowColor : t === "accent" ? e.accentColor : e.lightColor, renderProceduralShape = (t, e, r, i) => {
  const s = resolveFillColor(t.fillRole, r);
  if (t.kind === "circle") {
    const n = t.slot === "accent" ? i : void 0;
    return /* @__PURE__ */ jsx("circle", { ref: n, cx: t.cx, cy: t.cy, r: t.r, fill: s }, e);
  }
  return t.kind === "rect" ? /* @__PURE__ */ jsx(
    "rect",
    {
      x: t.x,
      y: t.y,
      width: t.width,
      height: t.height,
      ...t.rx !== void 0 ? { rx: t.rx } : {},
      ...t.ry !== void 0 ? { ry: t.ry } : {},
      fill: s
    },
    e
  ) : /* @__PURE__ */ jsx("path", { d: t.d, fill: s }, e);
}, ProceduralBotAvatar = ({
  model: t,
  state: e = "neutral",
  neutralIdleMode: r = "bored-random",
  size: i = 240,
  transitionDurationSeconds: s = 0.55,
  shadowColor: n = DEFAULT_BOT_AVATAR_SHADOW_COLOR_NAME,
  lightColor: a = DEFAULT_BOT_AVATAR_LIGHT_COLOR_NAME,
  accentColor: l = a,
  ariaLabel: o,
  paused: p = !1,
  gaze: u = "none",
  gazeConfig: S
}) => {
  var X;
  const f = isBotAvatarState(e) ? e : "neutral", v = `bot-avatar-head-clip-${useId().replace(/:/g, "")}`, m = useRef(null), A = useRef(null), c = useRef(null), d = useRef(null), h = useRef(null), y = useRef(null), P = useRef(null), x = useRef(null), _ = useRef(null), M = useRef(null), w = useRef(null), B = useRef(null), V = useRef(computeAllFacialPathsForState(t, f)), I = u !== "none" && !!t.gaze, N = I && !!((X = t.gaze) != null && X.bodyFlinch);
  useGazeBehavior({
    svgElementRef: m,
    gazeGroupElementRef: P,
    eyelidGroupElementRef: x,
    bodyElementRef: _,
    gaze: u,
    geometry: t.gaze,
    config: S
  }), useEffect(() => {
    var rt, et, Q;
    const W = {
      model: t,
      leftEyePathElementRef: A,
      rightEyePathElementRef: c,
      mouthPathElementRef: d,
      antennaCircleElementRef: h,
      innerHeadGroupElementRef: y
    };
    if (!W.leftEyePathElementRef.current || !W.rightEyePathElementRef.current || ((rt = M.current) == null || rt.kill(), (et = w.current) == null || et.kill(), B.current && (clearTimeout(B.current), B.current = null), W.innerHeadGroupElementRef.current && gsap.set(W.innerHeadGroupElementRef.current, { clearProps: "transform" }), W.antennaCircleElementRef.current && gsap.set(W.antennaCircleElementRef.current, { clearProps: "transform" }), p))
      return;
    const $ = {
      leftEyePathString: W.leftEyePathElementRef.current.getAttribute("d") ?? "",
      rightEyePathString: W.rightEyePathElementRef.current.getAttribute("d") ?? "",
      mouthPathString: ((Q = W.mouthPathElementRef.current) == null ? void 0 : Q.getAttribute("d")) ?? ""
    }, J = computeAllFacialPathsForState(t, f), tt = (H, U) => {
      B.current && clearTimeout(B.current), B.current = setTimeout(() => {
        B.current = null, U();
      }, H);
    }, Z = () => {
      const H = () => {
        const U = pickRandomDurationMilliseconds(
          DEFAULT_NEUTRAL_BORED_INTERVAL_MIN_MS,
          DEFAULT_NEUTRAL_BORED_INTERVAL_MAX_MS
        );
        tt(U, () => {
          var st;
          const K = pickRandomDurationMilliseconds(
            DEFAULT_NEUTRAL_BORED_VARIANT_DURATION_MIN_MS,
            DEFAULT_NEUTRAL_BORED_VARIANT_DURATION_MAX_MS
          ), it = pickRandomNeutralBoredAnimationBuilder();
          (st = w.current) == null || st.kill(), w.current = it(W, K), tt(K, () => {
            var nt;
            (nt = w.current) == null || nt.kill(), w.current = null, W.innerHeadGroupElementRef.current && gsap.set(W.innerHeadGroupElementRef.current, { clearProps: "transform" }), W.antennaCircleElementRef.current && gsap.set(W.antennaCircleElementRef.current, { clearProps: "transform" }), H();
          });
        });
      };
      H();
    }, z = () => {
      if (browserPrefersReducedMotion()) {
        w.current = null;
        return;
      }
      if (f === "neutral") {
        if (r === "static") {
          w.current = null;
          return;
        }
        Z();
        return;
      }
      const H = idleAnimationBuildersByStateKey[f];
      w.current = H(W);
    };
    if ($.leftEyePathString === J.leftEyePathString && $.rightEyePathString === J.rightEyePathString && $.mouthPathString === J.mouthPathString)
      z();
    else {
      const H = { easedProgress: 0 };
      M.current = gsap.to(H, {
        easedProgress: 1,
        duration: s,
        ease: "power3.inOut",
        onUpdate: () => {
          var K, it, st;
          const U = H.easedProgress;
          (K = W.leftEyePathElementRef.current) == null || K.setAttribute(
            "d",
            interpolateNumericValuesBetweenPathStrings(
              $.leftEyePathString,
              J.leftEyePathString,
              U
            )
          ), (it = W.rightEyePathElementRef.current) == null || it.setAttribute(
            "d",
            interpolateNumericValuesBetweenPathStrings(
              $.rightEyePathString,
              J.rightEyePathString,
              U
            )
          ), (st = W.mouthPathElementRef.current) == null || st.setAttribute(
            "d",
            interpolateNumericValuesBetweenPathStrings(
              $.mouthPathString,
              J.mouthPathString,
              U
            )
          );
        },
        onComplete: z
      });
    }
    return () => {
      var H, U;
      (H = M.current) == null || H.kill(), (U = w.current) == null || U.kill(), B.current && (clearTimeout(B.current), B.current = null);
    };
  }, [t, f, r, p, s]);
  const G = V.current, R = o ?? `Bot avatar - ${f} state`, C = { shadowColor: n, lightColor: a, accentColor: l }, [T, g, E, F] = t.viewBox, k = `${T} ${g} ${E} ${F}`, L = t.body.map(
    (W, $) => renderProceduralShape(W, $, C, h)
  ), D = (t.features.leftEye.cx + t.features.rightEye.cx) / 2, O = (t.features.leftEye.cy + t.features.rightEye.cy) / 2, j = /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { ref: A, d: G.leftEyePathString, fill: resolveFillColor(t.features.leftEye.fillRole, C) }),
    /* @__PURE__ */ jsx("path", { ref: c, d: G.rightEyePathString, fill: resolveFillColor(t.features.rightEye.fillRole, C) })
  ] }), q = /* @__PURE__ */ jsxs(Fragment, { children: [
    I ? /* @__PURE__ */ jsx(
      "g",
      {
        ref: P,
        className: "vultus-gaze",
        style: { transformBox: "view-box", transformOrigin: `${D}px ${O}px` },
        children: /* @__PURE__ */ jsx(
          "g",
          {
            ref: x,
            className: "vultus-eyelid",
            style: { transformBox: "view-box", transformOrigin: `${D}px ${O}px` },
            children: j
          }
        )
      }
    ) : j,
    t.features.mouth ? /* @__PURE__ */ jsx(
      "path",
      {
        ref: d,
        d: G.mouthPathString,
        fill: resolveFillColor(t.features.mouth.fillRole, C)
      }
    ) : null
  ] }), Y = N ? /* @__PURE__ */ jsxs(Fragment, { children: [
    t.body.filter((W) => W.slot !== "flinchBody").map((W, $) => renderProceduralShape(W, $, C, h)),
    /* @__PURE__ */ jsxs(
      "g",
      {
        ref: _,
        className: "vultus-flinch-body",
        style: { transformBox: "view-box", transformOrigin: `${D}px ${O}px` },
        children: [
          t.body.filter((W) => W.slot === "flinchBody").map((W, $) => renderProceduralShape(W, $, C, h)),
          q
        ]
      }
    )
  ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
    L,
    q
  ] });
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      ref: m,
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: k,
      width: i,
      height: i,
      role: "img",
      "aria-label": R,
      style: I ? (
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
        t.clipShape ? /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("clipPath", { id: v, children: /* @__PURE__ */ jsx("circle", { cx: t.clipShape.cx, cy: t.clipShape.cy, r: t.clipShape.r }) }) }) : null,
        t.background ? /* @__PURE__ */ jsx("rect", { width: E, height: F, fill: resolveFillColor(t.background, C) }) : null,
        /* @__PURE__ */ jsxs("g", { ref: y, children: [
          (t.underlayShapes ?? []).map(
            (W, $) => renderProceduralShape(W, $, C, h)
          ),
          t.clipShape ? /* @__PURE__ */ jsx("g", { clipPath: `url(#${v})`, children: Y }) : Y
        ] })
      ]
    }
  );
}, BotAvatar = ({
  model: t = VULTUS_CLASSIC_MODEL,
  state: e = "neutral",
  size: r = 240,
  lightColor: i = DEFAULT_BOT_AVATAR_LIGHT_COLOR_NAME,
  ariaLabel: s,
  paused: n = !1,
  ...a
}) => {
  const l = isBotAvatarState(e) ? e : "neutral";
  return t.renderer === "lottie" ? /* @__PURE__ */ jsx(
    LottieBotAvatar,
    {
      model: t,
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
      model: t,
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
function transform(t = [0, 0], e = 0) {
  return {
    ty: "tr",
    p: { a: 0, k: t },
    a: { a: 0, k: [0, 0] },
    s: { a: 0, k: [100, 100] },
    r: { a: 0, k: e },
    o: { a: 0, k: 100 },
    sk: { a: 0, k: 0 },
    sa: { a: 0, k: 0 }
  };
}
function fill(t) {
  return {
    ty: "fl",
    c: { a: 0, k: t },
    o: { a: 0, k: 100 },
    r: 1
  };
}
function ellipse(t, e = [0, 0]) {
  return {
    ty: "el",
    d: 1,
    s: { a: 0, k: t },
    p: { a: 0, k: e }
  };
}
function rectangle(t, e, r = [0, 0]) {
  return {
    ty: "rc",
    d: 1,
    s: { a: 0, k: t },
    p: { a: 0, k: r },
    r: { a: 0, k: e }
  };
}
function shapeLayer(t, e, r, i) {
  return {
    ddd: 0,
    ind: t,
    ty: 4,
    nm: e,
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
function keyframe(t, e, r) {
  if (!r)
    return { t, s: e };
  const i = r.map(() => 1), s = r.map(() => 0);
  return {
    t,
    s: e,
    e: r,
    i: { x: i, y: i },
    o: { x: s, y: s }
  };
}
function bodyShape(t) {
  return t.shape === "circle" ? ellipse([128, 128]) : t.shape === "page" ? rectangle([146, 112], 22) : t.shape === "diamond" ? rectangle([116, 116], 34) : rectangle([104, 148], 52);
}
function roleDetails(t, e) {
  return t === "Editor" ? [
    rectangle([92, 8], 4, [0, -44]),
    fill(ink),
    rectangle([20, 62], 10, [58, 18]),
    fill(e.accent),
    transform([0, 0], -16)
  ] : t === "Reporter" ? [
    ellipse([28, 28], [66, -52]),
    fill(e.accent),
    rectangle([12, 56], 6, [48, 42]),
    fill(paper),
    transform([0, 0], -24)
  ] : t === "Copy Writer" ? [
    rectangle([76, 7], 4, [-12, -20]),
    rectangle([54, 7], 4, [-23, 0]),
    rectangle([68, 7], 4, [-16, 20]),
    fill(ink),
    transform()
  ] : [
    ellipse([38, 38], [-38, -36]),
    fill(e.accent),
    rectangle([16, 96], 8, [52, 18]),
    fill(ink),
    transform([0, 0], 34)
  ];
}
function creativeMotionAnimation(t, e) {
  const r = designs[t], i = e === "complete" ? 3 : e === "ready" ? 6 : 13, s = t === "Editor" || t === "Illustrator" ? 360 : -360, n = t === "Illustrator" ? -12 : 0;
  return {
    v: "5.12.2",
    fr: 60,
    ip: 0,
    op: 180,
    w: 240,
    h: 240,
    nm: `${t} motion character`,
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
      shapeLayer(3, "role object", roleDetails(t, r), {
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
  (t) => defineLottieAvatarModel({
    id: `creative-desk-${t.toLowerCase().replace(/\s+/g, "-")}`,
    name: `Creative Desk ${t}`,
    animationData: creativeMotionAnimation(t, "drafting"),
    fallbackSegment: [0, 90],
    stateSegments: sharedStateSegments
  })
), CREATIVE_DESK_MODEL_ZOO = createBotAvatarModelZoo(creativeDeskModels);
function creativeDeskModelForRole(t) {
  const e = `creative-desk-${t.toLowerCase().replace(/\s+/g, "-")}`;
  return CREATIVE_DESK_MODEL_ZOO[e];
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
  BOT_AVATAR_STATES.map((t) => [t, restingEyeShape])
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
});
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
  clampUnit,
  computeAllFacialPathsForState,
  computePointerGazeVector,
  createBlinkState,
  createBotAvatarModelZoo,
  createGazeWanderState,
  creativeDeskModelForRole,
  creativeMotionAnimation,
  defineLottieAvatarModel,
  defineProceduralAvatarModel,
  formatStateKeyAsReadableLabel,
  isPointerWithinProximity,
  makeSeededRandom,
  orderedStateButtonDescriptors
};
