import Je, { useId as St, useRef as N, useEffect as xt } from "react";
import { gsap as W } from "gsap";
var oe = { exports: {} }, Z = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var He;
function Ct() {
  if (He) return Z;
  He = 1;
  var r = Je, a = Symbol.for("react.element"), i = Symbol.for("react.fragment"), l = Object.prototype.hasOwnProperty, p = r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, c = { key: !0, ref: !0, __self: !0, __source: !0 };
  function g(h, f, E) {
    var v, b = {}, _ = null, T = null;
    E !== void 0 && (_ = "" + E), f.key !== void 0 && (_ = "" + f.key), f.ref !== void 0 && (T = f.ref);
    for (v in f) l.call(f, v) && !c.hasOwnProperty(v) && (b[v] = f[v]);
    if (h && h.defaultProps) for (v in f = h.defaultProps, f) b[v] === void 0 && (b[v] = f[v]);
    return { $$typeof: a, type: h, key: _, ref: T, props: b, _owner: p.current };
  }
  return Z.Fragment = i, Z.jsx = g, Z.jsxs = g, Z;
}
var Y = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ge;
function kt() {
  return Ge || (Ge = 1, process.env.NODE_ENV !== "production" && (function() {
    var r = Je, a = Symbol.for("react.element"), i = Symbol.for("react.portal"), l = Symbol.for("react.fragment"), p = Symbol.for("react.strict_mode"), c = Symbol.for("react.profiler"), g = Symbol.for("react.provider"), h = Symbol.for("react.context"), f = Symbol.for("react.forward_ref"), E = Symbol.for("react.suspense"), v = Symbol.for("react.suspense_list"), b = Symbol.for("react.memo"), _ = Symbol.for("react.lazy"), T = Symbol.for("react.offscreen"), I = Symbol.iterator, H = "@@iterator";
    function se(e) {
      if (e === null || typeof e != "object")
        return null;
      var t = I && e[I] || e[H];
      return typeof t == "function" ? t : null;
    }
    var w = r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function S(e) {
      {
        for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), o = 1; o < t; o++)
          n[o - 1] = arguments[o];
        x("error", e, n);
      }
    }
    function x(e, t, n) {
      {
        var o = w.ReactDebugCurrentFrame, d = o.getStackAddendum();
        d !== "" && (t += "%s", n = n.concat([d]));
        var y = n.map(function(u) {
          return String(u);
        });
        y.unshift("Warning: " + t), Function.prototype.apply.call(console[e], console, y);
      }
    }
    var F = !1, L = !1, ee = !1, be = !1, te = !1, G;
    G = Symbol.for("react.module.reference");
    function D(e) {
      return !!(typeof e == "string" || typeof e == "function" || e === l || e === c || te || e === p || e === E || e === v || be || e === T || F || L || ee || typeof e == "object" && e !== null && (e.$$typeof === _ || e.$$typeof === b || e.$$typeof === g || e.$$typeof === h || e.$$typeof === f || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      e.$$typeof === G || e.getModuleId !== void 0));
    }
    function M(e, t, n) {
      var o = e.displayName;
      if (o)
        return o;
      var d = t.displayName || t.name || "";
      return d !== "" ? n + "(" + d + ")" : n;
    }
    function q(e) {
      return e.displayName || "Context";
    }
    function A(e) {
      if (e == null)
        return null;
      if (typeof e.tag == "number" && S("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof e == "function")
        return e.displayName || e.name || null;
      if (typeof e == "string")
        return e;
      switch (e) {
        case l:
          return "Fragment";
        case i:
          return "Portal";
        case c:
          return "Profiler";
        case p:
          return "StrictMode";
        case E:
          return "Suspense";
        case v:
          return "SuspenseList";
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case h:
            var t = e;
            return q(t) + ".Consumer";
          case g:
            var n = e;
            return q(n._context) + ".Provider";
          case f:
            return M(e, e.render, "ForwardRef");
          case b:
            var o = e.displayName || null;
            return o !== null ? o : A(e.type) || "Memo";
          case _: {
            var d = e, y = d._payload, u = d._init;
            try {
              return A(u(y));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var j = Object.assign, J = 0, Pe, _e, Se, xe, Ce, ke, Te;
    function Oe() {
    }
    Oe.__reactDisabledLog = !0;
    function Ye() {
      {
        if (J === 0) {
          Pe = console.log, _e = console.info, Se = console.warn, xe = console.error, Ce = console.group, ke = console.groupCollapsed, Te = console.groupEnd;
          var e = {
            configurable: !0,
            enumerable: !0,
            value: Oe,
            writable: !0
          };
          Object.defineProperties(console, {
            info: e,
            log: e,
            warn: e,
            error: e,
            group: e,
            groupCollapsed: e,
            groupEnd: e
          });
        }
        J++;
      }
    }
    function Qe() {
      {
        if (J--, J === 0) {
          var e = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: j({}, e, {
              value: Pe
            }),
            info: j({}, e, {
              value: _e
            }),
            warn: j({}, e, {
              value: Se
            }),
            error: j({}, e, {
              value: xe
            }),
            group: j({}, e, {
              value: Ce
            }),
            groupCollapsed: j({}, e, {
              value: ke
            }),
            groupEnd: j({}, e, {
              value: Te
            })
          });
        }
        J < 0 && S("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var ue = w.ReactCurrentDispatcher, ce;
    function re(e, t, n) {
      {
        if (ce === void 0)
          try {
            throw Error();
          } catch (d) {
            var o = d.stack.trim().match(/\n( *(at )?)/);
            ce = o && o[1] || "";
          }
        return `
` + ce + e;
      }
    }
    var fe = !1, ne;
    {
      var Xe = typeof WeakMap == "function" ? WeakMap : Map;
      ne = new Xe();
    }
    function Ae(e, t) {
      if (!e || fe)
        return "";
      {
        var n = ne.get(e);
        if (n !== void 0)
          return n;
      }
      var o;
      fe = !0;
      var d = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var y;
      y = ue.current, ue.current = null, Ye();
      try {
        if (t) {
          var u = function() {
            throw Error();
          };
          if (Object.defineProperty(u.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(u, []);
            } catch (k) {
              o = k;
            }
            Reflect.construct(e, [], u);
          } else {
            try {
              u.call();
            } catch (k) {
              o = k;
            }
            e.call(u.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (k) {
            o = k;
          }
          e();
        }
      } catch (k) {
        if (k && o && typeof k.stack == "string") {
          for (var s = k.stack.split(`
`), C = o.stack.split(`
`), m = s.length - 1, R = C.length - 1; m >= 1 && R >= 0 && s[m] !== C[R]; )
            R--;
          for (; m >= 1 && R >= 0; m--, R--)
            if (s[m] !== C[R]) {
              if (m !== 1 || R !== 1)
                do
                  if (m--, R--, R < 0 || s[m] !== C[R]) {
                    var O = `
` + s[m].replace(" at new ", " at ");
                    return e.displayName && O.includes("<anonymous>") && (O = O.replace("<anonymous>", e.displayName)), typeof e == "function" && ne.set(e, O), O;
                  }
                while (m >= 1 && R >= 0);
              break;
            }
        }
      } finally {
        fe = !1, ue.current = y, Qe(), Error.prepareStackTrace = d;
      }
      var K = e ? e.displayName || e.name : "", V = K ? re(K) : "";
      return typeof e == "function" && ne.set(e, V), V;
    }
    function et(e, t, n) {
      return Ae(e, !1);
    }
    function tt(e) {
      var t = e.prototype;
      return !!(t && t.isReactComponent);
    }
    function ae(e, t, n) {
      if (e == null)
        return "";
      if (typeof e == "function")
        return Ae(e, tt(e));
      if (typeof e == "string")
        return re(e);
      switch (e) {
        case E:
          return re("Suspense");
        case v:
          return re("SuspenseList");
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case f:
            return et(e.render);
          case b:
            return ae(e.type, t, n);
          case _: {
            var o = e, d = o._payload, y = o._init;
            try {
              return ae(y(d), t, n);
            } catch {
            }
          }
        }
      return "";
    }
    var z = Object.prototype.hasOwnProperty, we = {}, je = w.ReactDebugCurrentFrame;
    function ie(e) {
      if (e) {
        var t = e._owner, n = ae(e.type, e._source, t ? t.type : null);
        je.setExtraStackFrame(n);
      } else
        je.setExtraStackFrame(null);
    }
    function rt(e, t, n, o, d) {
      {
        var y = Function.call.bind(z);
        for (var u in e)
          if (y(e, u)) {
            var s = void 0;
            try {
              if (typeof e[u] != "function") {
                var C = Error((o || "React class") + ": " + n + " type `" + u + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof e[u] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw C.name = "Invariant Violation", C;
              }
              s = e[u](t, u, o, n, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (m) {
              s = m;
            }
            s && !(s instanceof Error) && (ie(d), S("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", o || "React class", n, u, typeof s), ie(null)), s instanceof Error && !(s.message in we) && (we[s.message] = !0, ie(d), S("Failed %s type: %s", n, s.message), ie(null));
          }
      }
    }
    var nt = Array.isArray;
    function de(e) {
      return nt(e);
    }
    function at(e) {
      {
        var t = typeof Symbol == "function" && Symbol.toStringTag, n = t && e[Symbol.toStringTag] || e.constructor.name || "Object";
        return n;
      }
    }
    function it(e) {
      try {
        return Ie(e), !1;
      } catch {
        return !0;
      }
    }
    function Ie(e) {
      return "" + e;
    }
    function De(e) {
      if (it(e))
        return S("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", at(e)), Ie(e);
    }
    var Fe = w.ReactCurrentOwner, ot = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, Le, Me;
    function lt(e) {
      if (z.call(e, "ref")) {
        var t = Object.getOwnPropertyDescriptor(e, "ref").get;
        if (t && t.isReactWarning)
          return !1;
      }
      return e.ref !== void 0;
    }
    function st(e) {
      if (z.call(e, "key")) {
        var t = Object.getOwnPropertyDescriptor(e, "key").get;
        if (t && t.isReactWarning)
          return !1;
      }
      return e.key !== void 0;
    }
    function ut(e, t) {
      typeof e.ref == "string" && Fe.current;
    }
    function ct(e, t) {
      {
        var n = function() {
          Le || (Le = !0, S("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", t));
        };
        n.isReactWarning = !0, Object.defineProperty(e, "key", {
          get: n,
          configurable: !0
        });
      }
    }
    function ft(e, t) {
      {
        var n = function() {
          Me || (Me = !0, S("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", t));
        };
        n.isReactWarning = !0, Object.defineProperty(e, "ref", {
          get: n,
          configurable: !0
        });
      }
    }
    var dt = function(e, t, n, o, d, y, u) {
      var s = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: a,
        // Built-in properties that belong on the element
        type: e,
        key: t,
        ref: n,
        props: u,
        // Record the component responsible for creating this element.
        _owner: y
      };
      return s._store = {}, Object.defineProperty(s._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: !1
      }), Object.defineProperty(s, "_self", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: o
      }), Object.defineProperty(s, "_source", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: d
      }), Object.freeze && (Object.freeze(s.props), Object.freeze(s)), s;
    };
    function pt(e, t, n, o, d) {
      {
        var y, u = {}, s = null, C = null;
        n !== void 0 && (De(n), s = "" + n), st(t) && (De(t.key), s = "" + t.key), lt(t) && (C = t.ref, ut(t, d));
        for (y in t)
          z.call(t, y) && !ot.hasOwnProperty(y) && (u[y] = t[y]);
        if (e && e.defaultProps) {
          var m = e.defaultProps;
          for (y in m)
            u[y] === void 0 && (u[y] = m[y]);
        }
        if (s || C) {
          var R = typeof e == "function" ? e.displayName || e.name || "Unknown" : e;
          s && ct(u, R), C && ft(u, R);
        }
        return dt(e, s, C, d, o, Fe.current, u);
      }
    }
    var pe = w.ReactCurrentOwner, Ne = w.ReactDebugCurrentFrame;
    function $(e) {
      if (e) {
        var t = e._owner, n = ae(e.type, e._source, t ? t.type : null);
        Ne.setExtraStackFrame(n);
      } else
        Ne.setExtraStackFrame(null);
    }
    var he;
    he = !1;
    function ge(e) {
      return typeof e == "object" && e !== null && e.$$typeof === a;
    }
    function We() {
      {
        if (pe.current) {
          var e = A(pe.current.type);
          if (e)
            return `

Check the render method of \`` + e + "`.";
        }
        return "";
      }
    }
    function ht(e) {
      return "";
    }
    var Be = {};
    function gt(e) {
      {
        var t = We();
        if (!t) {
          var n = typeof e == "string" ? e : e.displayName || e.name;
          n && (t = `

Check the top-level render call using <` + n + ">.");
        }
        return t;
      }
    }
    function Ve(e, t) {
      {
        if (!e._store || e._store.validated || e.key != null)
          return;
        e._store.validated = !0;
        var n = gt(t);
        if (Be[n])
          return;
        Be[n] = !0;
        var o = "";
        e && e._owner && e._owner !== pe.current && (o = " It was passed a child from " + A(e._owner.type) + "."), $(e), S('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', n, o), $(null);
      }
    }
    function $e(e, t) {
      {
        if (typeof e != "object")
          return;
        if (de(e))
          for (var n = 0; n < e.length; n++) {
            var o = e[n];
            ge(o) && Ve(o, t);
          }
        else if (ge(e))
          e._store && (e._store.validated = !0);
        else if (e) {
          var d = se(e);
          if (typeof d == "function" && d !== e.entries)
            for (var y = d.call(e), u; !(u = y.next()).done; )
              ge(u.value) && Ve(u.value, t);
        }
      }
    }
    function yt(e) {
      {
        var t = e.type;
        if (t == null || typeof t == "string")
          return;
        var n;
        if (typeof t == "function")
          n = t.propTypes;
        else if (typeof t == "object" && (t.$$typeof === f || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        t.$$typeof === b))
          n = t.propTypes;
        else
          return;
        if (n) {
          var o = A(t);
          rt(n, e.props, "prop", o, e);
        } else if (t.PropTypes !== void 0 && !he) {
          he = !0;
          var d = A(t);
          S("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", d || "Unknown");
        }
        typeof t.getDefaultProps == "function" && !t.getDefaultProps.isReactClassApproved && S("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function vt(e) {
      {
        for (var t = Object.keys(e.props), n = 0; n < t.length; n++) {
          var o = t[n];
          if (o !== "children" && o !== "key") {
            $(e), S("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", o), $(null);
            break;
          }
        }
        e.ref !== null && ($(e), S("Invalid attribute `ref` supplied to `React.Fragment`."), $(null));
      }
    }
    var Ke = {};
    function Ue(e, t, n, o, d, y) {
      {
        var u = D(e);
        if (!u) {
          var s = "";
          (e === void 0 || typeof e == "object" && e !== null && Object.keys(e).length === 0) && (s += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var C = ht();
          C ? s += C : s += We();
          var m;
          e === null ? m = "null" : de(e) ? m = "array" : e !== void 0 && e.$$typeof === a ? (m = "<" + (A(e.type) || "Unknown") + " />", s = " Did you accidentally export a JSX literal instead of a component?") : m = typeof e, S("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", m, s);
        }
        var R = pt(e, t, n, d, y);
        if (R == null)
          return R;
        if (u) {
          var O = t.children;
          if (O !== void 0)
            if (o)
              if (de(O)) {
                for (var K = 0; K < O.length; K++)
                  $e(O[K], e);
                Object.freeze && Object.freeze(O);
              } else
                S("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              $e(O, e);
        }
        if (z.call(t, "key")) {
          var V = A(e), k = Object.keys(t).filter(function(_t) {
            return _t !== "key";
          }), ye = k.length > 0 ? "{key: someKey, " + k.join(": ..., ") + ": ...}" : "{key: someKey}";
          if (!Ke[V + ye]) {
            var Pt = k.length > 0 ? "{" + k.join(": ..., ") + ": ...}" : "{}";
            S(`A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`, ye, V, Pt, V), Ke[V + ye] = !0;
          }
        }
        return e === l ? vt(R) : yt(R), R;
      }
    }
    function mt(e, t, n) {
      return Ue(e, t, n, !0);
    }
    function Et(e, t, n) {
      return Ue(e, t, n, !1);
    }
    var Rt = Et, bt = mt;
    Y.Fragment = l, Y.jsx = Rt, Y.jsxs = bt;
  })()), Y;
}
var qe;
function Tt() {
  return qe || (qe = 1, process.env.NODE_ENV === "production" ? oe.exports = Ct() : oe.exports = kt()), oe.exports;
}
var P = Tt();
const Q = 0.5522847498, ve = /-?\d+(?:\.\d+)?/g, ze = (r, a, i, l) => {
  const p = i * Q, c = l * Q;
  return "M " + (r - i) + " " + a + " C " + (r - i) + " " + (a - c) + " " + (r - p) + " " + (a - l) + " " + r + " " + (a - l) + " C " + (r + p) + " " + (a - l) + " " + (r + i) + " " + (a - c) + " " + (r + i) + " " + a + " C " + (r + i) + " " + (a + c) + " " + (r + p) + " " + (a + l) + " " + r + " " + (a + l) + " C " + (r - p) + " " + (a + l) + " " + (r - i) + " " + (a + c) + " " + (r - i) + " " + a + " Z";
}, Ot = (r, a, i, l, p) => {
  const c = i * Q, g = 0.18, h = 1.5, f = p === "down", E = f ? l * g : l * h, v = f ? l * h : l * g, b = a - E, _ = a + v, T = E * Q, I = v * Q;
  return "M " + (r - i) + " " + a + " C " + (r - i) + " " + (a - T) + " " + (r - c) + " " + b + " " + r + " " + b + " C " + (r + c) + " " + b + " " + (r + i) + " " + (a - T) + " " + (r + i) + " " + a + " C " + (r + i) + " " + (a + I) + " " + (r + c) + " " + _ + " " + r + " " + _ + " C " + (r - c) + " " + _ + " " + (r - i) + " " + (a + I) + " " + (r - i) + " " + a + " Z";
}, B = (r, a, i) => {
  var g, h;
  const l = ((g = r.match(ve)) == null ? void 0 : g.map(Number)) ?? [], p = ((h = a.match(ve)) == null ? void 0 : h.map(Number)) ?? [];
  let c = 0;
  return r.replace(ve, () => {
    const f = l[c] ?? 0, E = p[c] ?? 0, v = f + (E - f) * i;
    return c += 1, v.toFixed(3);
  });
}, At = [
  "neutral",
  "thinking",
  "deepThinking",
  "toolCalling",
  "toolResponse",
  "speakingOpen",
  "speakingWide",
  "speakingRound",
  "speakingComplete"
], U = {
  leftEyeCenterX: 70,
  rightEyeCenterX: 130,
  eyeBaselineCenterY: 90,
  mouthCenterX: 100,
  mouthBaselineCenterY: 122
}, wt = {
  neutral: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  thinking: { rx: 14, ry: 14, dy: -4, shape: "ellipse" },
  deepThinking: { rx: 17, ry: 2, dy: 0, shape: "ellipse" },
  toolCalling: { rx: 5, ry: 16, dy: 0, shape: "ellipse" },
  toolResponse: { rx: 17, ry: 17, dy: 0, shape: "ellipse" },
  speakingOpen: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  speakingWide: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  speakingRound: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  speakingComplete: { rx: 16, ry: 5, dy: -1, shape: "curvedLens", curveDirection: "up" }
}, jt = {
  neutral: { rx: 25, ry: 10, dy: 0, shape: "curvedLens", curveDirection: "down" },
  thinking: { rx: 6, ry: 6, dy: 0, shape: "ellipse" },
  deepThinking: { rx: 24, ry: 2, dy: 0, shape: "ellipse" },
  toolCalling: { rx: 7, ry: 7, dy: 0, shape: "ellipse" },
  toolResponse: { rx: 9, ry: 14, dy: 0, shape: "ellipse" },
  speakingOpen: { rx: 13, ry: 18, dy: 5, shape: "ellipse" },
  speakingWide: { rx: 22, ry: 7, dy: 0, shape: "ellipse" },
  speakingRound: { rx: 10, ry: 13, dy: 0, shape: "ellipse" },
  speakingComplete: { rx: 25, ry: 11, dy: 0, shape: "curvedLens", curveDirection: "down" }
}, me = (r, a, i) => {
  const l = a + i.dy;
  return i.shape === "curvedLens" ? Ot(
    r,
    l,
    i.rx,
    i.ry,
    i.curveDirection ?? "down"
  ) : ze(r, l, i.rx, i.ry);
}, X = (r) => {
  const a = wt[r], i = jt[r];
  return {
    leftEyePathString: me(
      U.leftEyeCenterX,
      U.eyeBaselineCenterY,
      a
    ),
    rightEyePathString: me(
      U.rightEyeCenterX,
      U.eyeBaselineCenterY,
      a
    ),
    mouthPathString: me(
      U.mouthCenterX,
      U.mouthBaselineCenterY,
      i
    )
  };
}, Ht = [
  { stateKey: "neutral", buttonLabel: "Neutral", romanNumeralIndex: "I" },
  { stateKey: "thinking", buttonLabel: "Thinking", romanNumeralIndex: "II" },
  { stateKey: "deepThinking", buttonLabel: "Deep Thinking", romanNumeralIndex: "III" },
  { stateKey: "toolCalling", buttonLabel: "Tool Calling", romanNumeralIndex: "IV" },
  { stateKey: "toolResponse", buttonLabel: "Tool Response", romanNumeralIndex: "V" },
  { stateKey: "speakingOpen", buttonLabel: "Speaking · Open", romanNumeralIndex: "VI" },
  { stateKey: "speakingWide", buttonLabel: "Speaking · Wide", romanNumeralIndex: "VII" },
  { stateKey: "speakingRound", buttonLabel: "Speaking · Round", romanNumeralIndex: "VIII" },
  { stateKey: "speakingComplete", buttonLabel: "Speaking Complete", romanNumeralIndex: "IX" }
], Gt = [
  { stateKey: "speakingOpen", holdMilliseconds: 280 },
  { stateKey: "speakingRound", holdMilliseconds: 220 },
  { stateKey: "speakingWide", holdMilliseconds: 260 },
  { stateKey: "speakingOpen", holdMilliseconds: 220 },
  { stateKey: "speakingRound", holdMilliseconds: 200 },
  { stateKey: "speakingWide", holdMilliseconds: 260 },
  { stateKey: "speakingComplete", holdMilliseconds: 900 },
  { stateKey: "neutral", holdMilliseconds: 0 }
], qt = (r) => r.replace(/([A-Z])/g, " $1").replace(/^./, (a) => a.toUpperCase()).trim(), It = "dimgray", Dt = "white", le = (r, a, i, l) => ze(r, a, i, l), Ft = (r) => {
  const a = X("neutral"), i = le(70, 90, 13, 1.5), l = le(130, 90, 13, 1.5), p = W.timeline({ repeat: -1, repeatDelay: 3.2 }), c = { value: 0 }, g = () => {
    var f, E;
    const h = c.value;
    (f = r.leftEyePathElementRef.current) == null || f.setAttribute(
      "d",
      B(a.leftEyePathString, i, h)
    ), (E = r.rightEyePathElementRef.current) == null || E.setAttribute(
      "d",
      B(a.rightEyePathString, l, h)
    );
  };
  return p.to(c, {
    value: 1,
    duration: 0.1,
    ease: "power2.in",
    onUpdate: g
  }), p.to(c, {
    value: 0,
    duration: 0.16,
    ease: "power2.out",
    onUpdate: g
  }), p;
}, Ze = (r, a, i, l) => {
  const c = a.map((h) => ({
    leftEyePath: le(h.leftEyeCenter[0], h.leftEyeCenter[1], 14, 14),
    rightEyePath: le(
      h.rightEyeCenter[0],
      h.rightEyeCenter[1],
      14,
      14
    )
  })), g = W.timeline({ repeat: -1 });
  for (let h = 0; h < c.length; h += 1) {
    const f = c[h], E = c[(h + 1) % c.length], v = { value: 0 };
    g.to(v, {
      value: 1,
      duration: i,
      ease: "power2.inOut",
      onUpdate: () => {
        var _, T;
        const b = v.value;
        (_ = r.leftEyePathElementRef.current) == null || _.setAttribute(
          "d",
          B(f.leftEyePath, E.leftEyePath, b)
        ), (T = r.rightEyePathElementRef.current) == null || T.setAttribute(
          "d",
          B(f.rightEyePath, E.rightEyePath, b)
        );
      }
    }), g.to({}, { duration: l(h) });
  }
  return g;
}, Lt = (r) => Ze(
  r,
  [
    { leftEyeCenter: [70, 86], rightEyeCenter: [130, 86] },
    { leftEyeCenter: [66, 84], rightEyeCenter: [126, 84] },
    { leftEyeCenter: [70, 82], rightEyeCenter: [130, 82] },
    { leftEyeCenter: [74, 84], rightEyeCenter: [134, 84] }
  ],
  0.5,
  () => 1.1 + Math.random() * 0.6
), Mt = (r) => Ze(
  r,
  [
    { leftEyeCenter: [66, 90], rightEyeCenter: [126, 90] },
    { leftEyeCenter: [70, 90], rightEyeCenter: [130, 90] },
    { leftEyeCenter: [74, 90], rightEyeCenter: [134, 90] },
    { leftEyeCenter: [70, 90], rightEyeCenter: [130, 90] }
  ],
  0.16,
  () => 0.35
), Re = (r, a) => {
  if (!r)
    return { kill: () => {
    } };
  const i = W.to(r, a);
  return {
    kill: () => {
      i.kill(), W.set(r, { clearProps: "transform" });
    }
  };
}, Nt = (r) => Re(r.innerHeadGroupElementRef.current, {
  scale: 1.025,
  transformOrigin: "100px 100px",
  duration: 2.6,
  yoyo: !0,
  repeat: -1,
  ease: "sine.inOut"
}), Wt = (r) => Re(r.antennaCircleElementRef.current, {
  scale: 1.45,
  transformOrigin: "100px 20px",
  duration: 0.42,
  yoyo: !0,
  repeat: -1,
  ease: "sine.inOut"
}), Bt = (r) => Re(r.innerHeadGroupElementRef.current, {
  y: -2,
  duration: 0.7,
  yoyo: !0,
  repeat: -1,
  ease: "sine.inOut"
}), Ee = (r, a, i) => {
  const l = X(a).mouthPathString, p = X(i).mouthPathString, c = { value: 0 };
  return W.to(c, {
    value: 1,
    duration: 0.18,
    yoyo: !0,
    repeat: -1,
    ease: "sine.inOut",
    onUpdate: () => {
      var g;
      (g = r.mouthPathElementRef.current) == null || g.setAttribute(
        "d",
        B(l, p, c.value)
      );
    }
  });
}, Vt = {
  neutral: (r) => Ft(r),
  thinking: (r) => Lt(r),
  deepThinking: (r) => Nt(r),
  toolCalling: (r) => Wt(r),
  toolResponse: (r) => Mt(r),
  speakingOpen: (r) => Ee(r, "speakingOpen", "speakingRound"),
  speakingWide: (r) => Ee(r, "speakingWide", "speakingOpen"),
  speakingRound: (r) => Ee(r, "speakingRound", "speakingWide"),
  speakingComplete: (r) => Bt(r)
}, $t = (r) => At.includes(r), Jt = ({
  state: r = "neutral",
  size: a = 240,
  transitionDurationSeconds: i = 0.55,
  shadowColor: l = It,
  lightColor: p = Dt,
  ariaLabel: c
}) => {
  const g = $t(r) ? r : "neutral", f = `bot-avatar-head-clip-${St().replace(/:/g, "")}`, E = N(null), v = N(null), b = N(null), _ = N(null), T = N(null), I = N(null), H = N(null), se = N(X(g));
  xt(() => {
    var te, G;
    const x = {
      leftEyePathElementRef: E,
      rightEyePathElementRef: v,
      mouthPathElementRef: b,
      antennaCircleElementRef: _,
      innerHeadGroupElementRef: T
    };
    if (!x.leftEyePathElementRef.current || !x.rightEyePathElementRef.current || !x.mouthPathElementRef.current)
      return;
    (te = I.current) == null || te.kill(), (G = H.current) == null || G.kill(), x.innerHeadGroupElementRef.current && W.set(x.innerHeadGroupElementRef.current, { clearProps: "transform" }), x.antennaCircleElementRef.current && W.set(x.antennaCircleElementRef.current, { clearProps: "transform" });
    const F = {
      leftEyePathString: x.leftEyePathElementRef.current.getAttribute("d") ?? "",
      rightEyePathString: x.rightEyePathElementRef.current.getAttribute("d") ?? "",
      mouthPathString: x.mouthPathElementRef.current.getAttribute("d") ?? ""
    }, L = X(g), ee = () => {
      const D = Vt[g];
      H.current = D(x);
    };
    if (F.leftEyePathString === L.leftEyePathString && F.rightEyePathString === L.rightEyePathString && F.mouthPathString === L.mouthPathString)
      ee();
    else {
      const D = { easedProgress: 0 };
      I.current = W.to(D, {
        easedProgress: 1,
        duration: i,
        ease: "power3.inOut",
        onUpdate: () => {
          var q, A, j;
          const M = D.easedProgress;
          (q = x.leftEyePathElementRef.current) == null || q.setAttribute(
            "d",
            B(
              F.leftEyePathString,
              L.leftEyePathString,
              M
            )
          ), (A = x.rightEyePathElementRef.current) == null || A.setAttribute(
            "d",
            B(
              F.rightEyePathString,
              L.rightEyePathString,
              M
            )
          ), (j = x.mouthPathElementRef.current) == null || j.setAttribute(
            "d",
            B(
              F.mouthPathString,
              L.mouthPathString,
              M
            )
          );
        },
        onComplete: ee
      });
    }
    return () => {
      var D, M;
      (D = I.current) == null || D.kill(), (M = H.current) == null || M.kill();
    };
  }, [g, i]);
  const w = se.current, S = c ?? `Bot avatar - ${g} state`;
  return /* @__PURE__ */ P.jsxs(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 200 200",
      width: a,
      height: a,
      role: "img",
      "aria-label": S,
      style: { display: "block" },
      children: [
        /* @__PURE__ */ P.jsx("defs", { children: /* @__PURE__ */ P.jsx("clipPath", { id: f, children: /* @__PURE__ */ P.jsx("circle", { cx: 100, cy: 100, r: 90 }) }) }),
        /* @__PURE__ */ P.jsx("rect", { width: 200, height: 200, fill: p }),
        /* @__PURE__ */ P.jsxs("g", { ref: T, children: [
          /* @__PURE__ */ P.jsx("circle", { cx: 100, cy: 100, r: 90, fill: l }),
          /* @__PURE__ */ P.jsxs("g", { clipPath: `url(#${f})`, children: [
            /* @__PURE__ */ P.jsx("circle", { ref: _, cx: 100, cy: 20, r: 10, fill: p }),
            /* @__PURE__ */ P.jsx("rect", { x: 95, y: 25, width: 10, height: 25, fill: p }),
            /* @__PURE__ */ P.jsx("rect", { x: 15, y: 80, width: 30, height: 40, rx: 8, fill: p }),
            /* @__PURE__ */ P.jsx("rect", { x: 155, y: 80, width: 30, height: 40, rx: 8, fill: p }),
            /* @__PURE__ */ P.jsx("rect", { x: 35, y: 45, width: 130, height: 100, rx: 30, fill: p }),
            /* @__PURE__ */ P.jsx("rect", { x: 80, y: 140, width: 40, height: 20, fill: p }),
            /* @__PURE__ */ P.jsx("path", { d: "M 20 200 Q 100 150 180 200 Z", fill: p }),
            /* @__PURE__ */ P.jsx("path", { ref: E, d: w.leftEyePathString, fill: l }),
            /* @__PURE__ */ P.jsx("path", { ref: v, d: w.rightEyePathString, fill: l }),
            /* @__PURE__ */ P.jsx("path", { ref: b, d: w.mouthPathString, fill: l })
          ] })
        ] })
      ]
    }
  );
};
export {
  At as BOT_AVATAR_STATES,
  Jt as BotAvatar,
  Gt as automatedSpeakingPlaybackSequence,
  X as computeAllFacialPathsForState,
  qt as formatStateKeyAsReadableLabel,
  Ht as orderedStateButtonDescriptors
};
