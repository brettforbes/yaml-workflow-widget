import v from "@ebay/nice-dag-core";
import { defineComponent as f, openBlock as s, createElementBlock as d, Fragment as h, renderList as y, createBlock as D, Teleport as m, renderSlot as $, createCommentVNode as R, reactive as k, ref as _, onMounted as C, onUnmounted as E } from "vue";
const B = f({
  props: { niceDagReactive: Object }
}), N = (e, n) => {
  const o = e.__vccOpts || e;
  for (const [i, u] of n)
    o[i] = u;
  return o;
}, M = { key: 0 };
function O(e, n, o, i, u, l) {
  var r, c;
  return e.niceDagReactive && e.niceDagReactive.observor > 0 ? (s(), d("div", M, [
    (s(!0), d(h, null, y(((c = (r = e.niceDagReactive) == null ? void 0 : r.use()) == null ? void 0 : c.getAllEdges()) || [], (t) => (s(), D(m, {
      key: `edge-${t.source.id}-${t.target.id}`,
      to: t.ref
    }, [
      $(e.$slots, "default", { edge: t })
    ], 8, ["to"]))), 128))
  ])) : R("", !0);
}
const G = /* @__PURE__ */ N(B, [["render", O]]), j = f({
  props: { niceDagReactive: Object },
  setup(e) {
    return {
      getDomRef(n) {
        var o, i;
        return (i = (o = e.niceDagReactive) == null ? void 0 : o.use()) == null ? void 0 : i.getElementByNodeId(n.id);
      }
    };
  }
}), w = { key: 0 };
function S(e, n, o, i, u, l) {
  var r, c;
  return e.niceDagReactive && e.niceDagReactive.observor > 0 ? (s(), d("div", w, [
    (s(!0), d(h, null, y(((c = (r = e.niceDagReactive) == null ? void 0 : r.use()) == null ? void 0 : c.getAllNodes()) || [], (t) => (s(), D(m, {
      key: t.id,
      to: e.getDomRef(t)
    }, [
      $(e.$slots, "default", { node: t })
    ], 8, ["to"]))), 128))
  ])) : R("", !0);
}
const H = /* @__PURE__ */ N(j, [["render", S]]), T = f({
  props: { niceDagReactive: Object },
  setup(e) {
    return {
      getDomRef() {
        var n, o;
        return (o = (n = e.niceDagReactive) == null ? void 0 : n.use()) == null ? void 0 : o.getRootContentElement();
      }
    };
  }
}), A = { key: 0 };
function L(e, n, o, i, u, l) {
  return e.niceDagReactive && e.niceDagReactive.observor > 0 ? (s(), d("div", A, [
    (s(), D(m, {
      to: e.getDomRef()
    }, [
      $(e.$slots, "default")
    ], 8, ["to"]))
  ])) : R("", !0);
}
const J = /* @__PURE__ */ N(T, [["render", L]]), g = {};
function V(e) {
  const n = k({
    id: e,
    observor: 0,
    use: () => v.use(e)
  });
  return g[e] = n, n;
}
function z(e) {
  return g[e];
}
function F(e) {
  delete g[e];
}
function I(e) {
  g[e] ? g[e].observor += 1 : console.error(`Can't find observor with dag id:${e}`);
}
const p = {
  create: V,
  get: z,
  inc: I,
  remove: F
};
function P() {
  return Math.random().toString(16).slice(2);
}
function K(e) {
  const { onMount: n, scrollPosition: o, initNodes: i, getNodeSize: u, ...l } = e, r = _(), c = _(), t = p.create(P()), b = {
    onChange: () => {
      p.inc(t.id);
    }
  };
  return C(() => {
    const a = v.init(
      {
        id: t.id,
        container: r.value,
        getNodeSize: u,
        ...l,
        minimapContainer: c.value
      },
      e.editable
    );
    a.withNodes(i).render(), n && n(), a.addNiceDagChangeListener(b), p.inc(t.id);
  }), E(() => {
    var a;
    (a = v.use(t.id)) == null || a.destory(), p.remove(t.id);
  }), {
    niceDagReactive: t,
    niceDagEl: r,
    minimapEl: c,
    reset: () => {
      var a;
      (a = v.use(t.id)) == null || a.destory();
    }
  };
}
export {
  G as NiceDagEdges,
  H as NiceDagNodes,
  J as NiceDagRootView,
  K as useNiceDag
};
