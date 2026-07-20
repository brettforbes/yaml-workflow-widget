var nt = Object.defineProperty;
var rt = (n, t, e) => t in n ? nt(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e;
var o = (n, t, e) => (rt(n, typeof t != "symbol" ? t + "" : t, e), e);
import F from "dagre";
import ht from "html2canvas";
import { applyWorkflowSeedLayout } from "./workflowSeedLayout.js";
var f = /* @__PURE__ */ ((n) => (n.REMOVE_SUB_VIEW = "REMOVE_SUB_VIEW", n.ADD_SUB_VIEW = "ADD_SUB_VIEW", n.RESIZE = "RESIZE", n.ADD_NODE = "ADD_NODE", n.REMOVE_NODE = "REMOVE_NODE", n.ADD_EDGE = "ADD_EDGE", n.REMOVE_EDGE = "REMOVE_EDGE", n))(f || {}), p = /* @__PURE__ */ ((n) => (n.SHRINK_NODE = "SHRINK_NODE", n.EXPAND_NODE = "EXPAND_NODE", n.POSITION_CHANGE = "POSITION_CHANGE", n.RESIZE = "RESIZE", n.REMOVED = "REMOVED", n.ADD_CHILD_NODE = "ADD_CHILD_NODE", n))(p || {}), D = /* @__PURE__ */ ((n) => (n.LR = "LR", n.RL = "RL", n.TB = "TB", n.BT = "BT", n))(D || {}), E = /* @__PURE__ */ ((n) => (n.CENTER_OF_BORDER = "CENTER_OF_BORDER", n.CENTER = "CENTER", n))(E || {}), K = /* @__PURE__ */ ((n) => (n.HIERARCHY = "HIERARCHY", n.FLATTEN = "FLATTEN", n))(K || {}), $ = /* @__PURE__ */ ((n) => (n.DEFAULT = "DEFAULT", n.WITH_JOINT_NODES = "WITH_JOINT_NODES", n))($ || {});
function dt(n = []) {
  let t = [];
  n.forEach((i) => {
    t = [...t, ...i.dependencies || []];
  });
  const e = new Set(t);
  return n.filter((i) => !e.has(i.id));
}
function at(n) {
  const t = getComputedStyle(n), e = n.clientHeight - parseFloat(t.paddingTop) - parseFloat(t.paddingBottom), i = n.clientWidth - parseFloat(t.paddingLeft) - parseFloat(t.paddingRight);
  return {
    height: e,
    width: i
  };
}
class b {
  constructor(t, e = !1) {
    o(this, "pElement");
    o(this, "_exists");
    o(this, "withStyle", (t) => (Object.keys(t).forEach((i) => {
      this.pElement.style[i] = t[i];
    }), this));
    o(this, "withAttributes", (t) => (Object.keys(t).forEach((i) => {
      this.pElement.setAttribute(i, t[i]);
    }), this));
    o(this, "withAbsolutePoint", (t) => (this.pElement.style.position = "absolute", this.pElement.style.top = `${t.y}px`, this.pElement.style.left = `${t.x}px`, this));
    o(this, "withAbsolutePosition", (t) => (this.pElement.style.position = "absolute", this.pElement.style.top = `${t.y}px`, this.pElement.style.left = `${t.x}px`, this.pElement.style.width = `${t.width}px`, this.pElement.style.height = `${t.height}px`, this));
    o(this, "withSize", (t) => (this.pElement.style.width = `${t.width}px`, this.pElement.style.height = `${t.height}px`, this));
    o(this, "withWidth", (t) => (this.pElement.style.width = `${t}px`, this));
    o(this, "withHeight", (t) => (this.pElement.style.height = `${t}px`, this));
    o(this, "withClassNames", (...t) => (t.forEach((e) => {
      this.pElement.classList.add(e);
    }), this));
    this.pElement = t, this._exists = e;
  }
  get alreadyExists() {
    return this._exists;
  }
  get htmlElement() {
    return this.pElement;
  }
  get svgElement() {
    return this.pElement;
  }
}
function a(n) {
  return new b(n);
}
function C(n, t) {
  const e = document.createElement("div");
  return n && n.appendChild(e), t && e.classList.add(t), new b(e);
}
function S(n, t) {
  let e = n.querySelector(`.${t}`);
  const i = !!e;
  return e || (e = document.createElement("div"), e.classList.add(t), n.appendChild(e)), new b(e, i);
}
function z(n, t) {
  const e = document.createElementNS(
    "http://www.w3.org/2000/svg",
    t
  );
  return n && n.appendChild(e), new b(e);
}
function W(n, t = ":scope>svg", e = "nice-dag-svg-arrow") {
  let i = t ? n.querySelector(t) : null;
  if (!i) {
    i = document.createElementNS("http://www.w3.org/2000/svg", "svg"), i.style.overflow = "hidden";
    const s = document.createElementNS("http://www.w3.org/2000/svg", "defs"), r = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "marker"
    ), h = document.createElementNS("http://www.w3.org/2000/svg", "path");
    r.setAttribute("id", e), r.setAttribute("markerUnits", "strokeWidth"), r.setAttribute("markerWidth", "12"), r.setAttribute("markerHeight", "12"), r.setAttribute("viewBox", "0 0 12 12"), r.setAttribute("refX", "6"), r.setAttribute("refY", "6"), r.setAttribute("orient", "auto"), h.setAttribute("d", "M2,2 L10,6 L2,10 L6,6 L2,2"), h.setAttribute("fill", "#000"), r.appendChild(h), s.appendChild(r), i.appendChild(s), n.appendChild(i);
  }
  return new b(i);
}
function x(n) {
  return !n || n.length === 0;
}
function lt() {
  return Math.random().toString(16).slice(2);
}
function g(n) {
  return n === 1 / 0 ? 1 / 0 : parseInt(`${Math.round(n + Number.EPSILON)}`);
}
function v(n, t) {
  return t === 1 || !t ? n : {
    x: g(n.x / t),
    y: g(n.y / t),
    top: g(n.top / t),
    left: g(n.left / t),
    width: g(n.width / t),
    height: g(n.height / t),
    bottom: g(n.bottom / t),
    right: g(n.right / t)
  };
}
function L(n) {
  const t = n.getBoundingClientRect();
  return {
    x: t.x,
    y: t.y,
    top: t.top,
    left: t.left,
    bottom: t.bottom,
    right: t.right,
    width: t.width,
    height: t.height
  };
}
function gt(n, t) {
  const e = { ...n };
  return Object.keys(t || {}).forEach((s) => {
    typeof e[s] > "u" && (e[s] = t[s]);
  }), e;
}
function ct(n, t) {
  return Math.atan(n / t) * 180 / Math.PI;
}
function ft(n) {
  if (!n || n.length === 0)
    return [];
  const t = n.map((s) => ({
    ...s,
    children: []
  })), e = {};
  return t.forEach((s) => {
    e[s.id] = s;
  }), t.forEach((s) => {
    s.parentId && e[s.parentId].children.push(s);
  }), t.forEach((s) => {
    s.children.length === 0 && delete s.children;
  }), t.filter((s) => !s.parentId);
}
function pt(n) {
  return D[n.rankdir || "LR"];
}
function I(n, t) {
  return typeof n < "u" ? n : t;
}
const q = "nice-dag-node", ut = "nice-dag-edge", T = "data-node-id-key", yt = "nice-dag-svg-bkg-arrow", mt = "nice-dag-svg-background", V = "nice-dag-svg-dnd-arrow", Et = "nice-dag-svg-dnd", wt = "nice-dag-editor-bkg", xt = "nice-dag-editor-foreground", Q = {
  x: 0,
  y: 0,
  width: 0,
  height: 0
};
class G {
  constructor(t, e, i, s) {
    o(this, "joint");
    o(this, "editing");
    o(this, "dependencies");
    o(this, "id");
    o(this, "data");
    o(this, "children");
    o(this, "parentId");
    o(this, "collapse");
    o(this, "x");
    o(this, "y");
    o(this, "width");
    o(this, "height");
    o(this, "listeners", []);
    o(this, "ref");
    o(this, "edgeConnectorType");
    o(this, "model");
    o(this, "addNodeChangeListener", (t) => {
      this.listeners.some((e) => e === t) || this.listeners.push(t);
    });
    o(this, "removeNodeChangeListener", (t) => {
      this.listeners = this.listeners.filter((e) => e !== t);
    });
    o(this, "fireNodeChange", (t) => {
      this.listeners.forEach((e) => {
        e.onNodeChange(t);
      });
    });
    this.model = i, this.id = t.id, this.joint = e, this.data = t.data, this.parentId = t.parentId, this.children = t.children, this.dependencies = t.dependencies || [], this.edgeConnectorType = s, this.collapse = t.collapse, this.ref = C().withClassNames(q).withAttributes({
      [`${T}`]: t.id
    }).htmlElement;
  }
  cloneWithProps() {
    const t = {
      id: this.id,
      data: this.data,
      parentId: this.parentId,
      children: this.children,
      dependencies: this.dependencies || [],
      edgeConnectorType: this.edgeConnectorType,
      collapse: this.collapse
    };
    return new G(t, this.joint, this.model, this.edgeConnectorType);
  }
  resize(t) {
    this.width = t.width, this.height = t.height, this.doLayout(), this.fireNodeChange({ type: p.RESIZE, node: this });
  }
  addChildNode(t, e, i) {
    const s = this.collapse || !this.children || this.children.length === 0;
    return this.children || (this.children = []), this.children = [...this.children, t], this.fireNodeChange({
      type: p.ADD_CHILD_NODE,
      node: this,
      data: {
        point: e,
        isCollapsed: s,
        sourceNode: t
      }
    }), i && (this.model.findNodeById(t.id).joint = i), this.model.findNodeById(t.id);
  }
  removeDependency(t) {
    const e = this.dependencies.some((i) => i === t.id);
    return this.dependencies = this.dependencies.filter((i) => i !== t.id), e;
  }
  connect(t) {
    if (!(t != null && t.dependencies.some((e) => e === this.id)))
      return t.dependencies || (t.dependencies = []), t.dependencies.push(this.id), this.model.addEdge(this, t);
  }
  findConnected(t = !1) {
    return t ? this.model.findNodesByPrecedentNodeId(this.id) : this.model.findNodesByDependencies(this.dependencies);
  }
  findEdgesAsSource() {
    return this.model.findEdgesBySourceId(this.id);
  }
  findEdgesAsTarget() {
    return this.model.findEdgesByTargetId(this.id);
  }
  doLayout() {
    a(this.ref).withAbsolutePosition({
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    });
  }
  setPoint(t, e = !0) {
    this.x = t.x, this.y = t.y, this.ref && (this.ref.style.left = `${this.x}px`, this.ref.style.top = `${this.y}px`), e && this.fireNodeChange({ type: p.POSITION_CHANGE, node: this });
  }
  setBounds(t, e) {
    this.x = t.x, this.y = t.y, this.width = t.width, this.height = t.height, this.ref && (this.ref.style.left = `${this.x}px`, this.ref.style.top = `${this.y}px`, this.ref.style.width = `${this.width}px`, this.ref.style.height = `${this.height}px`), e && this.fireNodeChange({ type: p.POSITION_CHANGE, node: this });
  }
  shrink() {
    this.collapse = !0, this.fireNodeChange({ type: p.SHRINK_NODE, node: this });
  }
  expand() {
    this.collapse = !1, this.fireNodeChange({ type: p.EXPAND_NODE, node: this });
  }
  withChildren(t, e = !0) {
    this.children && e ? this.expand() : t.then((i) => {
      this.children = i, this.expand();
    });
  }
  refresh() {
  }
  remove() {
    var t;
    (t = this.ref) == null || t.remove(), this.fireNodeChange({ type: p.REMOVED, node: this }), this.destory();
  }
  destory() {
    this.listeners = [], this.ref = null;
  }
}
const tt = {};
function y(n) {
  return n ? tt[n] : void 0;
}
function Ct(n, t) {
  tt[n] = t;
}
const X = 12;
class Y {
  constructor(t, e) {
    o(this, "source");
    o(this, "target");
    o(this, "pathRef");
    o(this, "ref");
    this.source = t, this.target = e, this.pathRef = z(null, "path").withAttributes({
      "data-source-key": t.id,
      "data-target-key": e.id
    }).svgElement, this.ref = C().withClassNames(ut).withAbsolutePosition(Q).htmlElement, this.source.addNodeChangeListener(this), this.target.addNodeChangeListener(this);
  }
  destory() {
    this.source = null, this.target = null, this.pathRef = null, this.ref = null;
  }
  onNodeChange(t) {
    t.type === p.POSITION_CHANGE || t.type === p.RESIZE || t.type === p.EXPAND_NODE || t.type === p.SHRINK_NODE ? this.doLayout() : t.type === p.REMOVED && (this.remove(), this.destory());
  }
  insertNodes(t, e = 40) {
    const i = this.getInsertNodesStartPosition(t, e);
    this.remove(), this.target.model.addNodes(t, i, e).forEach((r) => {
      this.source.connect(r), r.connect(this.target);
    }), this.destory();
  }
  getInsertNodesStartPosition(t, e) {
    const { graphLabel: i, getNodeSize: s, mapEdgeToPoints: r } = y(this.source.model.dagId).config, { source: h, target: d } = r(this), l = (h.x + d.x) / 2, c = (h.y + d.y) / 2;
    let u = 0, m = 0, N = 0, R = 0;
    const _ = pt(i);
    return t.forEach((ot) => {
      const A = s(ot);
      _ === D.LR || _ === D.RL ? m += A.height + e : u += A.width + e, N = Math.max(u, A.width), R = Math.max(m, A.height);
    }), m -= e, u -= e, _ === D.LR || _ === D.RL ? {
      x: l - N / 2,
      y: c - m / 2
    } : {
      x: l - u / 2,
      y: c - R / 2
    };
  }
  remove() {
    this.target.removeDependency(this.source), this.target.model.removeEdge(this), this.target.removeNodeChangeListener(this), this.source.removeNodeChangeListener(this), this.pathRef.remove(), this.ref.remove();
  }
  doLayout() {
    const { mapEdgeToPoints: t } = y(this.source.model.dagId).config, { source: e, target: i } = t(this), s = (e.x + i.x) / 2, r = (e.y + i.y) / 2, h = `M${e.x},${e.y} L${s},${r} L${i.x},${i.y}`;
    a(this.pathRef).withAttributes({
      d: h
    });
    const d = Math.sqrt((i.x - e.x) * (i.x - e.x) + (i.y - e.y) * (i.y - e.y)), l = `rotate(${ct(i.y - e.y, i.x - e.x)}deg)`;
    a(this.ref).withAbsolutePosition({
      x: s - d / 2,
      y: r - X / 2,
      width: d,
      height: X
    }).withStyle({
      webkitTransform: l,
      mozTransform: l,
      msTransform: l,
      oTransform: l,
      transform: l
    });
  }
}
function Nt(n, t) {
  const e = new F.graphlib.Graph();
  e.setGraph(t), e.setDefaultEdgeLabel(function() {
    return {};
  });
  const i = {};
  for (let s = 0; s < n.length; s++) {
    const r = n[s];
    e.setNode(`${s}`, {
      width: r.width,
      height: r.height
    }), i[r.id] = s;
  }
  return n.forEach((s) => {
    s.dependencies && !x(s.dependencies) && s.dependencies.filter(Boolean).forEach((r) => {
      e.setEdge(i[r], i[s.id]);
    });
  }), F.layout(e), e;
}
class H {
  constructor({ dagId: t, parentNode: e, nodes: i, vmConfig: s, isRootModel: r }) {
    o(this, "vNodes");
    o(this, "pChildVMs");
    o(this, "_parentNode");
    o(this, "vmConfig");
    o(this, "pEdges");
    o(this, "pSize");
    o(this, "listeners", []);
    o(this, "isRootModel");
    o(this, "_dagId");
    o(this, "onNodeChange", (t) => {
      if (t.type === p.EXPAND_NODE)
        this.setNodeCollapse(t.node, !1);
      else if (t.type === p.SHRINK_NODE)
        this.setNodeCollapse(t.node, !0);
      else if (t.type === p.ADD_CHILD_NODE) {
        const { isCollapsed: e, point: i, sourceNode: s } = t.data;
        this.fireModelChange({
          source: this,
          originalSource: t.node,
          type: f.ADD_NODE
        }), e ? this.setNodeCollapse(t.node, !1) : this.pChildVMs.find((h) => h.id === t.node.id).addNode(s, i);
      } else
        t.type === p.POSITION_CHANGE || t.type === p.RESIZE ? this.doLayout(!0, !1) : t.type === p.REMOVED && (this.pChildVMs = this.pChildVMs.filter((e) => e.id !== t.node.id), this.vNodes = this.vNodes.filter((e) => e.id !== t.node.id), this.pEdges = this.pEdges.filter((e) => !(e.source.id === t.node.id || e.target.id === t.node.id)), this.fireModelChange({
          source: this,
          originalSource: t.node,
          type: f.REMOVE_NODE
        }));
    });
    o(this, "addModelChangeListener", (t) => {
      this.listeners.some((e) => e === t) || this.listeners.push(t);
    });
    o(this, "removeNodeChangeListener", (t) => {
      this.listeners = this.listeners.filter((e) => e === t);
    });
    o(this, "isSubViewNode", (t) => {
      var e;
      return !x((e = this.pChildVMs) == null ? void 0 : e.filter((i) => i.id === t));
    });
    o(this, "findNodeById", (t) => {
      let e = this.vNodes.find((i) => i.id === t);
      if (!e && !x(this.pChildVMs))
        for (let i = 0; i < this.pChildVMs.length && (e = this.pChildVMs[i].findNodeById(t), !e); i++)
          ;
      return e;
    });
    o(this, "findNodesByDependencies", (t) => {
      const e = new Set(t);
      return this.vNodes.filter((i) => e.has(i.id));
    });
    o(this, "init", (t) => {
      this.buildVNodes(t), this.buildEdges(), this.doLayout(!1, !1);
    });
    o(this, "setNodeCollapse", (t, e) => {
      let i;
      const { getNodeSize: s } = y(this.dagId).config;
      if (e)
        this.pChildVMs = this.pChildVMs.filter((h) => h.id !== t.id), i = s(t);
      else {
        const h = this.createChildVm(t, t.children);
        this.pChildVMs = [...this.pChildVMs.filter((d) => d.id !== h.id), h], i = h.size();
      }
      t.width = i.width, t.height = i.height;
      const r = t.editing;
      t.editing = !1, this.doLayout(!0, !1), t.editing = r, this.fireModelChange({
        source: this,
        originalSource: t,
        type: e ? f.REMOVE_SUB_VIEW : f.ADD_SUB_VIEW
      }), y(this._dagId).fireNiceDagChange();
    });
    o(this, "fireModelChange", (t) => {
      this.listeners.forEach((e) => {
        e.onModelChange(t);
      });
    });
    o(this, "withJointNodes", () => {
      const t = [], e = dt(this.vNodes), i = /* @__PURE__ */ new Set();
      return this.vNodes.forEach((s) => {
        var h;
        const r = e.some((d) => d.id === s.id);
        if (((h = s.dependencies) == null ? void 0 : h.length) > 1 && (!r || !this.vmConfig.omitJointBeforeEnd)) {
          const d = `joint-${s.dependencies.join("-")}`;
          if (!i.has(d)) {
            const l = new G({
              id: d,
              dependencies: s.dependencies
            }, !0, this, this.vmConfig.jointEdgeConnectorType);
            l.addNodeChangeListener(this), t.push(l), i.add(d);
          }
          s.dependencies = [d];
        }
      }), [...this.vNodes, ...t];
    });
    o(this, "buildVNodes", (t) => {
      this.vNodes = t.map((e) => this.toViewNode(e)), this.vmConfig.mode === $.WITH_JOINT_NODES && (this.vNodes = this.withJointNodes()), this.withNodeSize();
    });
    o(this, "withNodeSize", () => {
      const t = {}, { getNodeSize: e } = y(this.dagId).config;
      this.pChildVMs.forEach((i) => t[i.id] = i), this.vNodes.forEach((i) => {
        const s = t[i.id] && !i.collapse ? t[i.id].size() : e(i);
        i.width = s.width, i.height = s.height;
      });
    });
    o(this, "resize", (t) => {
      const e = this.pSize, i = this.isRoot ? this.vmConfig.rootViewPadding : this.vmConfig.subViewPadding;
      let s = 0, r = 0;
      return this.vNodes.forEach((h) => {
        s = Math.max(h.x + h.width, s), r = Math.max(h.y + h.height, r);
      }), this.pSize = {
        width: s + i.left + i.right,
        height: r + i.top + i.bottom
      }, t && (this.pSize.width !== e.width || this.pSize.height !== e.height) ? (this.fireModelChange({
        source: this,
        type: f.RESIZE
      }), !0) : !1;
    });
    o(this, "doLayout", (t, e) => {
      e && this.childVMs.forEach((h) => {
        h.doLayout(t, e), this.vNodes.find((d) => d.id === h.id).resize(h.size());
      });
      const layoutConfig = y(this.dagId).config;
      if (layoutConfig.layout === "WORKFLOW_SEED") {
        applyWorkflowSeedLayout(this.vNodes, layoutConfig);
      } else {
      const i = Nt(this.vNodes, layoutConfig.graphLabel);
      let s = 0;
      this.vNodes.forEach((h) => {
        if (!h.editing) {
          const d = i.node(String(s)), { width: l, height: c } = h, u = d.x - l / 2, m = d.y - c / 2;
          h.x = u, h.y = m, h.doLayout();
        }
        s++;
      });
      }
      const r = this.resize(t);
      return this.pEdges.forEach((h) => {
        h.doLayout();
      }), r;
    });
    o(this, "buildEdges", () => {
      this.pEdges = [];
      const t = {};
      this.vNodes.forEach((e) => t[e.id] = e), this.vNodes.forEach((e) => {
        x(e.dependencies) || e.dependencies.forEach((i) => {
          this.pEdges.push(new Y(t[i], e));
        });
      });
    });
    o(this, "size", (t = !0) => {
      if (t)
        return this.pSize;
      const e = this.isRoot ? this.vmConfig.rootViewPadding : this.subViewPadding;
      return {
        width: this.pSize.width - e.left - e.right,
        height: this.pSize.height - e.top - e.bottom
      };
    });
    const h = i;
    this._dagId = t, this._parentNode = e, this.vmConfig = s, this.isRootModel = r, this.pChildVMs = h.filter((d) => !d.collapse && !x(d.children)).map(
      (d) => this.createChildVm(d, d.children)
    ), this.init(h);
  }
  setRootOffset({ offsetX: t, offsetY: e }) {
    if (this.isRoot)
      this.vNodes.forEach((i) => {
        i.x += t, i.y += e, i.doLayout();
      }), this.pEdges.forEach((i) => {
        i.doLayout();
      });
    else
      throw new Error("Sub model doesn't support the method.");
  }
  addNodes(t, e, i = 40) {
    let s = 0;
    const { getNodeSize: r } = y(this.dagId).config;
    return t.map((h) => {
      const d = r(h), l = {
        x: e.x,
        y: e.y + s
      };
      return s += i + d.height, this.addNode(h, l);
    });
  }
  addNode(t, e, i) {
    const s = this.toViewNode(t);
    s.editing = !0, s.joint = i;
    const { getNodeSize: r, jointEdgeConnectorType: h } = y(this.dagId).config;
    i && (s.edgeConnectorType = h), this.vNodes.push(s);
    const d = r(s);
    return s.width = d.width, s.height = d.height, s.x = e.x, s.y = e.y, this.fireModelChange({
      source: this,
      originalSource: s,
      type: f.ADD_NODE
    }), !t.collapse && !x(t.children) ? s.expand() : (s.fireNodeChange({ type: p.POSITION_CHANGE, node: s }), y(this._dagId).fireNiceDagChange()), s;
  }
  destory() {
    this.vNodes.forEach((t) => t.destory()), this.pEdges.forEach((t) => t.destory()), this.pChildVMs.forEach((t) => t.destory()), this.listeners = [];
  }
  removeEdge(t) {
    return this.pEdges.some((e) => e === t) ? (this.pEdges = this.pEdges.filter((e) => e !== t), y(this._dagId).fireNiceDagChange(), !0) : !1;
  }
  findEdgesBySourceId(t) {
    return this.pEdges.filter((e) => e.source.id === t);
  }
  findEdgesByTargetId(t) {
    return this.pEdges.filter((e) => e.target.id === t);
  }
  refreshJointNodes() {
    if (this.vmConfig.mode === $.WITH_JOINT_NODES) {
      const t = this.vNodes.filter((s) => s.joint && s.dependencies.length === 1), e = new Set(t.map((s) => s.id)), i = this.vNodes.filter((s) => s.dependencies.some((r) => e.has(r)));
      t.forEach((s) => {
        const { dependencies: r } = s, h = this.findNodeById(r[0]);
        i.filter((l) => l.dependencies.some((c) => c === s.id)).forEach((l) => {
          l.dependencies.push(h.id), this.createEdgeAndFireModelChange(h, l);
        });
      }), t.forEach((s) => {
        s.remove();
      });
    }
  }
  createEdgeAndFireModelChange(t, e) {
    const i = new Y(t, e);
    return this.pEdges.push(i), this.fireModelChange({
      source: this,
      originalSource: i,
      type: f.ADD_EDGE
    }), i.doLayout(), i;
  }
  addEdge(t, e) {
    const i = this.createEdgeAndFireModelChange(t, e);
    return y(this._dagId).fireNiceDagChange(), i;
  }
  onModelChange(t) {
    t.source.id !== this.id && t.type === f.RESIZE && this.vNodes.find((i) => i.id === t.source.id).resize(t.source.size());
  }
  createChildVm(t, e) {
    const i = new H({
      dagId: this._dagId,
      parentNode: t,
      nodes: e,
      vmConfig: this.vmConfig
    });
    return i.addModelChangeListener(this), i;
  }
  get isRoot() {
    return this.isRootModel;
  }
  getAllNodes() {
    var e;
    let t = [...this.vNodes];
    return (e = this.pChildVMs) == null || e.forEach((i) => {
      t = [...t, ...i.getAllNodes()];
    }), t;
  }
  getAllEdges() {
    var e;
    let t = [...this.edges];
    return (e = this.pChildVMs) == null || e.forEach((i) => {
      t = [...t, ...i.getAllEdges()];
    }), t;
  }
  findNodesByPrecedentNodeId(t) {
    return this.vNodes.filter((e) => new Set(e.dependencies || []).has(t));
  }
  get dagId() {
    return this._dagId;
  }
  toViewNode(t) {
    const e = new G(t, !1, this, t.edgeConnectorType || this.vmConfig.edgeConnectorType);
    return e.addNodeChangeListener(this), e;
  }
  get subViewPadding() {
    return this.vmConfig.subViewPadding;
  }
  setViewSize(t, e = !0) {
    this.pSize = t;
    let i = { left: 0, right: 0, top: 0, bottom: 0 };
    e && (i = this.isRoot ? this.vmConfig.rootViewPadding : this.vmConfig.subViewPadding), this.pSize = {
      width: t.width - i.left - i.right,
      height: t.height - i.top - i.bottom
    };
  }
  get parentNode() {
    return this._parentNode;
  }
  get id() {
    var t;
    return (t = this._parentNode) == null ? void 0 : t.id;
  }
  get() {
    return this.pSize;
  }
  get childVMs() {
    return this.pChildVMs;
  }
  get nodes() {
    return this.vNodes;
  }
  get edges() {
    return this.pEdges;
  }
}
const M = {
  rankdir: "LR",
  ranksep: 60,
  edgesep: 10
}, Lt = {
  color: "blue",
  size: 40,
  visible: !0
}, St = {
  top: 40,
  bottom: 20,
  left: 20,
  right: 20
}, et = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0
}, _t = {
  color: "black"
};
function w(n) {
  return {
    x: n.x + n.width / 2,
    y: n.y + n.height / 2
  };
}
const j = {
  LR: ({ source: n, target: t }) => {
    const e = n.edgeConnectorType === E.CENTER ? w(n) : {
      x: n.x + n.width,
      y: n.y + n.height / 2
    }, i = t.edgeConnectorType === E.CENTER ? w(t) : { x: t.x, y: t.y + t.height / 2 };
    return {
      source: e,
      target: i
    };
  },
  RL: ({ source: n, target: t }) => {
    const e = n.edgeConnectorType === E.CENTER ? w(n) : { x: n.x, y: n.y + n.height / 2 }, i = t.edgeConnectorType === E.CENTER ? w(t) : {
      x: t.x + t.width,
      y: t.y + t.height / 2
    };
    return {
      source: e,
      target: i
    };
  },
  BT: ({ source: n, target: t }) => {
    const e = n.edgeConnectorType === E.CENTER ? w(n) : { x: n.x + n.width / 2, y: n.y }, i = t.edgeConnectorType === E.CENTER ? w(t) : {
      x: t.x + t.width / 2,
      y: t.y + t.height
    };
    return {
      source: e,
      target: i
    };
  },
  TB: ({ source: n, target: t }) => {
    const e = n.edgeConnectorType === E.CENTER ? w(n) : {
      x: n.x + n.width / 2,
      y: n.y + n.height
    }, i = t.edgeConnectorType === E.CENTER ? w(t) : { x: t.x + t.width / 2, y: t.y };
    return {
      source: e,
      target: i
    };
  }
};
function Dt(n) {
  return n ? {
    ...n,
    rankdir: n.rankdir || M.rankdir,
    ranksep: n.ranksep || M.ranksep,
    edgesep: n.edgesep || M.edgesep
  } : M;
}
function U(n, t = et) {
  return {
    top: I(n == null ? void 0 : n.top, t.top),
    left: I(n == null ? void 0 : n.left, t.left),
    bottom: I(n == null ? void 0 : n.bottom, t.bottom),
    right: I(n == null ? void 0 : n.right, t.right)
  };
}
function vt() {
  return _t;
}
const Bt = {
  position: "fixed",
  top: "0",
  left: "0",
  right: "0",
  bottom: "0",
  zIndex: "9999",
  display: "none",
  "user-select": "none",
  cursor: "pointer"
}, Rt = "minimap-dnd-glass";
class Tt {
  constructor(t) {
    o(this, "scale");
    o(this, "viewBoxScale");
    o(this, "viewBoxInitX");
    o(this, "viewBoxInitY");
    o(this, "mainLayer");
    o(this, "zoomLayer");
    o(this, "minimapContent");
    o(this, "viewBoxElm");
    o(this, "viewBoxClassname");
    o(this, "canvas");
    o(this, "dndGlass");
    o(this, "initClientX");
    o(this, "initClientY");
    o(this, "listeners", []);
    o(this, "parentContainer");
    o(this, "contentContainer");
    o(this, "onCanvasReady", (t) => {
      const { mainLayer: e, zoomLayer: i, viewBoxElm: s, minimapContent: r, scale: h } = this, d = e.scrollLeft, l = e.scrollTop, c = e.offsetWidth > i.offsetWidth ? 1 : e.offsetWidth / i.offsetWidth, u = e.offsetHeight > i.offsetHeight ? 1 : e.offsetHeight / i.offsetHeight, m = Math.ceil(t.width * c), N = Math.ceil(t.height * u), R = Math.ceil(d * h * c), _ = Math.ceil(l * h * u);
      a(s).withStyle({
        border: "1px red solid",
        position: "absolute",
        width: `${m}px`,
        height: `${N}px`,
        left: `${R}px`,
        top: `${_}px`,
        cursor: "pointer",
        zIndex: 999,
        display: "block"
      }), r.appendChild(s), r.appendChild(t);
    });
    o(this, "updateViewBoxPosition", () => {
      const t = this.mainLayer.scrollLeft, e = this.mainLayer.scrollTop, i = this.canvas.width - this.viewBoxElm.offsetWidth, s = this.canvas.height - this.viewBoxElm.offsetHeight;
      let r = this.scale * t;
      r = Math.max(0, r), r = Math.min(r, i);
      let h = this.scale * e;
      h = Math.max(0, h), h = Math.min(h, s), a(this.viewBoxElm).withStyle({
        left: `${Math.ceil(r)}px`,
        top: `${Math.ceil(h)}px`
      });
    });
    o(this, "startViewBoxDragging", (t) => {
      this.initClientX = t.clientX, this.initClientY = t.clientY, this.viewBoxInitX = this.viewBoxElm.offsetLeft, this.viewBoxInitY = this.viewBoxElm.offsetTop, a(this.dndGlass).withStyle({
        display: "block"
      });
    });
    o(this, "onViewBoxDragging", (t) => {
      const e = t.clientX - this.initClientX, i = t.clientY - this.initClientY, s = this.canvas.width - this.viewBoxElm.offsetWidth / this.viewBoxScale, r = this.canvas.height - this.viewBoxElm.offsetHeight / this.viewBoxScale;
      let h = this.viewBoxInitX + e, d = this.viewBoxInitY + i;
      h = Math.max(0, h), h = Math.min(h, s), d = Math.max(0, d), d = Math.min(d, r), this.viewBoxElm.style.left = `${Math.ceil(h)}px`, this.viewBoxElm.style.top = `${Math.ceil(d)}px`, this.listeners.forEach((l) => {
        l.onMinimapDragging({ scrollLeft: h / this.scale, scrollTop: d / this.scale });
      });
    });
    o(this, "onViewBoxDraggingEnd", () => {
      a(this.dndGlass).withStyle({
        display: "none"
      });
    });
    this.viewBoxScale = 1, this.mainLayer = t.mainLayer, this.zoomLayer = t.zoomLayer, this.parentContainer = t.container, this.viewBoxElm = this.createViewBoxElement(t == null ? void 0 : t.viewBoxClassName), this.canvas = document.createElement("canvas"), this.contentContainer = C(this.parentContainer).withStyle({
      position: "relative",
      width: "100%",
      height: "100%",
      display: "flex",
      "justify-content": "center",
      "place-content": "center",
      "align-content": "center",
      "flex-wrap": "nowrap",
      "flex-direction": "column",
      "align-items": "center"
    }).htmlElement, this.minimapContent = this.createMinimapElement(t == null ? void 0 : t.className);
    const e = S(this.mainLayer, Rt).withStyle(Bt);
    e.htmlElement.addEventListener("mousemove", this.onViewBoxDragging), e.htmlElement.addEventListener("mouseup", this.onViewBoxDraggingEnd), this.dndGlass = e.htmlElement;
  }
  addMinimapListener(t) {
    this.listeners.push(t);
  }
  createMinimapElement(t) {
    const e = C(this.contentContainer).withClassNames("nice-dag-minimap").withStyle({
      position: "relative"
    }).htmlElement;
    return t && e.classList.add(t), e;
  }
  createViewBoxElement(t) {
    const e = C(this.contentContainer).withClassNames("nice-dag-minimap").withStyle({
      position: "relative"
    }).htmlElement;
    return e.classList.add("nice-dag-minimap-viewbox"), t && e.classList.add(t), e.addEventListener("mousedown", this.startViewBoxDragging), e;
  }
  calcRatio() {
    const t = at(this.parentContainer), i = this.zoomLayer.getBoundingClientRect();
    i.width / i.height > 1 ? this.scale = t.width / i.width : this.scale = t.height / i.height;
  }
  useWidth() {
    const e = this.zoomLayer.getBoundingClientRect();
    return e.width / e.height > 1;
  }
  render() {
    this.clear(), this.calcRatio();
    const t = this.parentContainer.getBoundingClientRect(), e = this.zoomLayer, i = e.getBoundingClientRect().width * this.scale, s = e.getBoundingClientRect().height * this.scale, { viewBoxElm: r } = this;
    a(r).withStyle({
      display: "none"
    }), this.useWidth() ? (this.canvas.style.width = "100%", a(this.minimapContent).withStyle({
      width: "100%",
      height: "auto"
    }), this.canvas.style.top = `${g((t.height - s) / 2)}px`) : (this.canvas.style.height = "100%", a(this.minimapContent).withStyle({
      width: "auto",
      height: "100%"
    }), this.canvas.style.left = `${g((t.width - i) / 2)}px`), this.canvas.width = Math.ceil(i), this.canvas.height = Math.ceil(s);
    const h = setTimeout(() => {
      window.clearTimeout(h), ht(
        e,
        {
          useCORS: !0,
          scale: this.scale,
          canvas: this.canvas,
          scrollY: 0,
          scrollX: 0
        }
      ).then(this.onCanvasReady);
    }, 50);
  }
  destory() {
    this.listeners = [], this.clear();
  }
  clear() {
    this.canvas.getContext("2d").clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  setViewBoxScale(t) {
    this.viewBoxScale = t;
    let e = this.viewBoxElm;
    const i = this.canvas.width / e.offsetWidth, s = this.canvas.height / e.offsetHeight, r = Math.min(1 / t, i), h = Math.min(1 / t, s);
    e.style.transform = `scale(${r}, ${h})`, e.style.transformOrigin = "left top";
  }
}
const bt = "nice-dag-main-layer", At = "nice-dag-frame-layer", It = "nice-dag-zoom-layer", it = "nice-dag-content-layer", Mt = "nice-dag-nodes-layer", zt = {
  position: "relative",
  height: "100%",
  width: "100%"
};
function Vt(n) {
  const t = Dt(n.graphLabel), e = U(n.subViewPadding, St), i = U(n.rootViewPadding, et);
  return {
    ...n,
    getEdgeAttributes: n.getEdgeAttributes || vt,
    graphLabel: t,
    mode: n.mode || $.WITH_JOINT_NODES,
    subViewPadding: e,
    rootViewPadding: i,
    gridConfig: gt(n.gridConfig, Lt),
    edgeConnectorType: n.edgeConnectorType || E.CENTER_OF_BORDER,
    jointEdgeConnectorType: n.jointEdgeConnectorType || E.CENTER,
    omitJointBeforeEnd: typeof n.omitJointBeforeEnd > "u" ? !0 : n.omitJointBeforeEnd
  };
}
class k {
  constructor({ viewConfig: t, model: e }) {
    o(this, "nodesLayer");
    o(this, "contentLayer");
    o(this, "svgLayer");
    o(this, "viewConfig");
    o(this, "subViews");
    o(this, "model");
    o(this, "appendNode", (t) => {
      this.nodesLayer.appendChild(t.ref), this.viewConfig.mapNodeToElement && t.ref.appendChild(this.viewConfig.mapNodeToElement(t));
    });
    o(this, "getContentElement", () => this.contentLayer);
    o(this, "getEdgeLabel", (t, e) => {
      throw new Error(`Can't support the method with ${t}, ${e}`);
    });
    o(this, "renderEdge", (t) => {
      const e = t.pathRef, i = this.viewConfig.getEdgeAttributes(t), s = a(e).withAttributes({
        stroke: i && i.color ? i.color : "rgb(204, 204, 204)"
      }).svgElement;
      i.hideArrow || s.setAttribute("marker-mid", `url(#${this.model.dagId}-nice-dag-svg-arrow)`);
    });
    o(this, "getNodeLayerSizeStyle", () => {
      const t = this.model.size(!1);
      return {
        position: "relative",
        width: `${t.width}px`,
        height: `${t.height}px`,
        "z-index": "1"
      };
    });
    o(this, "getContentLayerStyle", () => {
      const t = this.model.size();
      return {
        position: "absolute",
        top: 0,
        left: 0,
        height: `${t.height}px`,
        width: `${t.width}px`
      };
    });
    o(this, "render", (t) => {
      const e = this.model.isRoot ? this.viewConfig.rootViewPadding : this.viewConfig.subViewPadding;
      a(t).withStyle({
        "padding-top": `${e.top}px`,
        "padding-bottom": `${e.bottom}px`,
        "padding-left": `${e.left}px`,
        "padding-right": `${e.right}px`
      }), this.nodesLayer = C(t).withStyle(this.getNodeLayerSizeStyle()).withClassNames(Mt).htmlElement, this.svgLayer = W(this.nodesLayer, null, `${this.model.dagId}-nice-dag-svg-arrow`).withAttributes(
        {
          width: "100%",
          height: "100%"
        }
      ).svgElement, this.contentLayer = C(t).withStyle(this.getContentLayerStyle()).withClassNames(it).htmlElement, this.appendViewElement(this.model.parentNode, this.contentLayer);
      const i = {};
      this.model.nodes.forEach((s) => {
        this.appendNode(s), !x(s.children) && !s.collapse && (i[s.id] = s.ref, s.ref.setAttribute("data-subview-key", "true"));
      }), this.model.edges.forEach((s) => {
        this.svgLayer.appendChild(s.pathRef), this.nodesLayer.appendChild(s.ref), this.renderEdge(s);
      }), x(this.subViews) || this.subViews.forEach((s) => {
        s.render(i[s.model.id]);
      });
    });
    o(this, "appendViewElement", (t, e) => {
      if (this.viewConfig.getViewElement) {
        const i = this.viewConfig.getViewElement(t);
        i && e.appendChild(i);
      }
    });
    o(this, "resize", () => {
      a(this.nodesLayer).withStyle(this.getNodeLayerSizeStyle()), a(this.contentLayer).withStyle(this.getContentLayerStyle());
    });
    o(this, "destory", () => {
      this.clear(), this.model.removeNodeChangeListener(this);
    });
    var i;
    this.viewConfig = t, this.model = e, this.model.addModelChangeListener(this), this.subViews = (i = this.model.childVMs) == null ? void 0 : i.map((s) => new k({ viewConfig: t, model: s }));
  }
  justifySize(t) {
    let e = (this.model.isRoot ? this.viewConfig.rootViewPadding : this.viewConfig.subViewPadding) || {};
    e.left || (e.left = 0), e.right || (e.right = 0), e.top || (e.top = 0), e.bottom || (e.bottom = 0), t.width > 0 && (this.nodesLayer.style.width = `${t.width - e.left - e.right}px`, this.contentLayer.style.width = `${t.width}px`), t.height > 0 && (this.nodesLayer.style.height = `${t.height - e.top - e.bottom}px`, this.contentLayer.style.height = `${t.height}px`);
  }
  clear() {
    var t, e;
    a(this.nodesLayer.parentElement).withStyle({
      "padding-top": 0,
      "padding-bottom": 0,
      "padding-left": 0,
      "padding-right": 0
    }), (t = this.nodesLayer) == null || t.remove(), (e = this.contentLayer) == null || e.remove();
  }
  onModelChange(t) {
    var e, i, s;
    if (t.type === f.REMOVE_SUB_VIEW)
      ((e = this.subViews) == null ? void 0 : e.find((h) => h.model.id === t.originalSource.id)).destory(), this.subViews = (i = this.subViews) == null ? void 0 : i.filter((h) => h.model.id !== `${t.originalSource.id}`);
    else if (t.type === f.ADD_SUB_VIEW) {
      const r = {};
      this.subViews.forEach((h) => r[h.model.id] = h), this.subViews = (s = this.model.childVMs) == null ? void 0 : s.map((h) => {
        let d = r[h.id];
        if (!d) {
          const l = new k({ viewConfig: this.viewConfig, model: h }), c = this.nodesLayer.querySelector(`[${T}='${t.originalSource.id}']`);
          l.render(c), d = l;
        }
        return d;
      });
    } else
      t.type === f.RESIZE ? this.resize() : t.type === f.ADD_EDGE ? (this.svgLayer.appendChild(t.originalSource.pathRef), this.nodesLayer.appendChild(t.originalSource.ref), t.originalSource.doLayout(), this.renderEdge(t.originalSource)) : t.type === f.ADD_NODE && (t.originalSource.doLayout(), this.nodesLayer.appendChild(t.originalSource.ref));
  }
  getAllNodes(t) {
    const e = this.model.getAllNodes();
    if (t) {
      const i = {};
      e.filter((r) => r.joint).forEach((r) => {
        i[r.id] = r;
      });
      const s = (r) => {
        const h = [];
        return r.forEach((d) => {
          if (i[d]) {
            const l = s(i[d].dependencies);
            h.push(...l);
          } else
            h.push(d);
        }), Array.from(new Set(h));
      };
      return e.filter((r) => !r.joint).map((r) => {
        const { dependencies: h } = r, d = s(h);
        return {
          ...r,
          dependencies: d
        };
      });
    }
    return e;
  }
  getAllEdges() {
    return this.model.getAllEdges();
  }
}
class st {
  constructor(t) {
    o(this, "_rootContainer");
    o(this, "zoomLayer");
    o(this, "_config");
    o(this, "mainLayer");
    o(this, "rootView");
    o(this, "minimap");
    o(this, "rootModel");
    o(this, "uid");
    o(this, "listeners", []);
    o(this, "parentSize");
    o(this, "_scale");
    o(this, "useDefaultMapEdgeToPoints");
    o(this, "destoried");
    o(this, "getRootContentElement", () => this.rootView.getContentElement());
    o(this, "findNodeById", (t) => this.rootModel.findNodeById(t));
    o(this, "getElementByNodeId", (t) => {
      let e = this.zoomLayer.querySelector(`[${T}='${t}']>.${it}`);
      return e || (e = this.zoomLayer.querySelector(`[${T}='${t}']`)), e;
    });
    o(this, "getEdgeLabel", (t, e) => this.rootView.getEdgeLabel(t, e));
    o(this, "scrollTo", (t) => {
      const e = this.getElementByNodeId(t), i = this.rootContainer.getBoundingClientRect();
      if (e) {
        const s = e.getBoundingClientRect();
        this.mainLayer.scrollTop += s.y - i.y - i.height / 2, this.mainLayer.scrollLeft += s.x - i.x;
      }
    });
    o(this, "getScrollPosition", () => ({
      x: this.mainLayer.scrollLeft,
      y: this.mainLayer.scrollTop
    }));
    o(this, "fireNiceDagChange", () => {
      this.listeners.forEach((t) => t.onChange()), this.fireMinimapChange();
    });
    o(this, "fireMinimapChange", () => {
      var t;
      (t = this.minimap) == null || t.render();
    });
    o(this, "addNiceDagChangeListener", (t) => (this.listeners.every((e) => e !== t) && this.listeners.push(t), !1));
    o(this, "removeNiceDagChangeListener", (t) => (this.listeners.some((e) => e === t) && (this.listeners = this.listeners.filter((e) => e !== t)), !1));
    o(this, "onMainLayerScroll", () => {
      var t;
      (t = this.minimap) == null || t.updateViewBoxPosition();
    });
    this.uid = t.id || lt();
    const { container: e, minimapContainer: i, minimapConfig: s, ...r } = Vt(t);
    this._config = r, this._config.mapEdgeToPoints = t.mapEdgeToPoints, this._config.mapEdgeToPoints || (this._config.mapEdgeToPoints = j[this._config.graphLabel.rankdir], this.useDefaultMapEdgeToPoints = !0), this._rootContainer = S(e, At).withStyle(
      {
        position: "relative",
        height: "100%",
        width: "100%",
        overflow: "hidden"
      }
    ).htmlElement, this.mainLayer = S(this.rootContainer, bt).withStyle(
      { ...zt, overflow: "hidden" }
    ).htmlElement, this.mainLayer.addEventListener("scroll", this.onMainLayerScroll), this.zoomLayer = S(this.mainLayer, It).withStyle(
      {
        position: "absolute",
        "z-index": 1
      }
    ).htmlElement, i && (this.minimap = new Tt({
      mainLayer: this.mainLayer,
      zoomLayer: this.zoomLayer,
      container: i,
      ...s
    }), this.minimap.addMinimapListener(this));
  }
  setDirection(t) {
    this._config.graphLabel.rankdir = t, this.useDefaultMapEdgeToPoints && (this._config.mapEdgeToPoints = j[this._config.graphLabel.rankdir]), this.prettify();
  }
  prettify() {
    this.rootModel.doLayout(!0, !0), this.justifyCenter(this.parentSize), this.fireMinimapChange();
  }
  onMinimapDragging(t) {
    const { scrollLeft: e, scrollTop: i } = t;
    this.mainLayer.scrollTop = i, this.mainLayer.scrollLeft = e;
  }
  onModelChange(t) {
    t.type === f.RESIZE && (a(this.zoomLayer).withSize(this.rootView.model.size()), this.adaptOverflow()), (t.type === f.RESIZE || t.type === f.ADD_SUB_VIEW || t.type === f.REMOVE_SUB_VIEW) && this.justifyCenterWhenResizing();
  }
  adaptOverflow() {
    const t = L(this.mainLayer), e = L(this.zoomLayer);
    t.width < e.width ? a(this.mainLayer).withStyle({
      "overflow-x": "auto"
    }) : a(this.mainLayer).withStyle({
      "overflow-x": "none"
    }), t.height < e.height ? a(this.mainLayer).withStyle({
      "overflow-y": "auto"
    }) : a(this.mainLayer).withStyle({
      "overflow-y": "none"
    });
  }
  justifyCenterWhenResizing() {
    this.justifyCenter(this.parentSize);
  }
  get config() {
    return this._config;
  }
  get rootContainer() {
    return this._rootContainer;
  }
  get id() {
    return this.uid;
  }
  center(t) {
    return this.parentSize = t, this.justifyCenter(this.parentSize), this.fireMinimapChange(), this;
  }
  justifyCenter(t) {
    if (t) {
      const e = this.zoomLayer.getBoundingClientRect();
      let i = 0, s = 0;
      t.width > e.width && (i = (t.width - e.width) / 2), t.height > e.height && (s = (t.height - e.height) / 2), this.zoomLayer.style.left = `${i}px`, this.zoomLayer.style.top = `${s}px`;
    }
  }
  withNodes(t) {
    var s, r, h, d;
    (s = this.rootModel) == null || s.destory(), this.destoried ? (d = this.minimap) == null || d.addMinimapListener(this) : ((r = this.rootView) == null || r.clear(), (h = this.minimap) == null || h.clear());
    const e = this.config.modelType === K.FLATTEN ? ft(t) : t, i = JSON.parse(JSON.stringify(e));
    return this.rootModel = new H({
      dagId: this.uid,
      parentNode: {
        id: "root"
      },
      nodes: i,
      vmConfig: this.config,
      isRootModel: !0
    }), this.rootView = new k({
      model: this.rootModel,
      viewConfig: this.config
    }), this.rootModel.addModelChangeListener(this), this.destoried = !1, this;
  }
  getAllNodes(t) {
    return this.rootView.getAllNodes(t);
  }
  getAllNodesMapper(t) {
    var i;
    const e = {};
    return (i = this.rootView.getAllNodes(t)) == null || i.forEach((s) => {
      e[s.id] = s;
    }), e;
  }
  getAllEdges() {
    return this.rootView.getAllEdges();
  }
  render() {
    var t;
    this.rootView.render(this.zoomLayer), (t = this.minimap) == null || t.render(), a(this.zoomLayer).withAbsolutePosition(
      {
        x: 0,
        y: 0,
        ...this.rootView.model.size()
      }
    ), this.adaptOverflow(), this.parentSize && this.justifyCenter(this.parentSize);
  }
  get isDestoried() {
    return this.destoried;
  }
  destory() {
    var t;
    this.destoried = !0, this.listeners = [], this.rootView.destory(), (t = this.minimap) == null || t.destory();
  }
  setScale(t) {
    this._scale = t, this.zoomLayer.style.transform = `scale(${t})`, this.zoomLayer.style.transformOrigin = "left top", this.zoomLayer.setAttribute("data-zoom-ratio-key", `${t}`), this.adaptSizeWhenSetScale(t);
  }
  adaptSizeWhenSetScale(t) {
    this.parentSize && this.justifyCenter(this.parentSize), this.minimap && this.minimap.setViewBoxScale(t), this.adaptOverflow();
  }
  get scale() {
    return this._scale || 1;
  }
}
const Pt = "nice-dag-dnd-glass", Ot = {
  position: "fixed",
  top: "0",
  left: "0",
  right: "0",
  bottom: "0",
  zIndex: "9999",
  display: "none",
  "user-select": "none"
};
function $t(n, t) {
  return t.x <= n.x && t.y <= n.y && t.right >= n.x && t.bottom >= n.y;
}
class J {
  constructor(t, e, i, s, r) {
    o(this, "_rootContainer");
    o(this, "_glassStyles");
    o(this, "draggingNode");
    o(this, "draggingNodeMirror");
    o(this, "draggingElement");
    o(this, "_enabled");
    o(this, "editableGlass");
    o(this, "editorForeContainer");
    o(this, "context");
    o(this, "isDraggingEdge");
    o(this, "mapEdgeToPoints");
    o(this, "draggingNodeParentBounds");
    o(this, "svgBackgroundBounds");
    o(this, "eligibleEdgeConnectors", []);
    o(this, "originalScrollPosition");
    o(this, "mapNodeToDraggingElementClass");
    o(this, "asSourceDraggingEdges");
    o(this, "asTargetDraggingEdges");
    o(this, "documentUserSelect");
    o(this, "buildGlass", () => {
      var e;
      const t = S(document.body, Pt).withStyle({
        ...Ot,
        cursor: ((e = this._glassStyles) == null ? void 0 : e.cursor) || "pointer"
      });
      t.alreadyExists || (t.htmlElement.addEventListener("mousemove", this.onDragging), t.htmlElement.addEventListener("mouseup", this.endDragging)), this.editableGlass = t.htmlElement;
    });
    o(this, "setEnabled", (t) => {
      this._enabled = t;
    });
    o(this, "initContext", (t) => {
      this.originalScrollPosition = {
        x: this._rootContainer.scrollLeft,
        y: this._rootContainer.scrollTop
      }, this.draggingNode = t, this.draggingNodeMirror = t.cloneWithProps();
      const e = this.context.provider.scale || 1;
      this.draggingNodeParentBounds = v(L(t.ref.parentElement), e), this.svgBackgroundBounds = v(L(this.context.provider.svgDndBackground), e);
      const i = t.ref.parentElement.querySelectorAll(`:scope>.${q}`);
      this.eligibleEdgeConnectors = [], i.forEach((s) => {
        s !== t.ref && this.eligibleEdgeConnectors.push(
          {
            viewNode: t.model.findNodeById(s.getAttribute(T)),
            bounds: L(s)
          }
        );
      });
    });
    o(this, "withContext", (t) => (this.context = t, this));
    o(this, "buildDraggingElement", (t) => {
      const e = this.context.provider.scale || 1, { width: i, height: s, x: r, y: h } = v(L(t.ref), e);
      return C(null, this.mapNodeToDraggingElementClass(t)).withAbsolutePosition({
        width: i,
        height: s,
        x: r,
        y: h
      }).htmlElement;
    });
    o(this, "computeDependenciesOfDraggingNode", (t) => {
      const e = this.context.provider.svgDndBackground;
      this.asSourceDraggingEdges = t.findEdgesAsSource().map((i) => ({
        svgRef: z(e, "path").withAttributes({
          stroke: "rgb(204, 204, 204)",
          "marker-mid": `url(#${t.model.dagId}-${V})`
        }).svgElement,
        viewNode: i.target
      })), this.asTargetDraggingEdges = t.findEdgesAsTarget().map((i) => ({
        svgRef: z(e, "path").withAttributes({
          stroke: "rgb(204, 204, 204)",
          "marker-mid": `url(#${t.model.dagId}-${V})`
        }).svgElement,
        viewNode: i.source
      }));
    });
    o(this, "disableUserSelect", () => {
      this.documentUserSelect = document.body.style.userSelect, a(document.body).withStyle({
        "user-select": "none"
      });
    });
    o(this, "restoreUserSelect", () => {
      a(document.body).withStyle({
        "user-select": this.documentUserSelect
      });
    });
    o(this, "startNodeDragging", (t, e) => {
      this._enabled && (a(this.editableGlass).withStyle({
        display: "block"
      }), this.disableUserSelect(), this.initContext(t), this.updateRelativeMousePoint({
        x: e.pageX,
        y: e.pageY
      }), this.computeDependenciesOfDraggingNode(t), this.draggingElement = this.mapNodeToDraggingElementClass ? this.buildDraggingElement(t) : t.ref.cloneNode(!0), a(this.draggingElement).withStyle({
        "user-select": "none",
        "z-index": 9
      }), this.moveDraggingElement(), this.editorForeContainer.appendChild(this.draggingElement));
    });
    o(this, "moveDraggingElement", () => {
      const t = this.context.lastBounds(!0, !0);
      a(this.draggingElement).withAbsolutePosition({
        x: t.left,
        y: t.top,
        width: t.width,
        height: t.height
      }), this.renderEdgesWhenDraggingElement(t);
    });
    o(this, "renderEdge", (t, e) => {
      const { source: i, target: s } = e, r = (i.x + s.x) / 2, h = (i.y + s.y) / 2, d = `M${i.x},${i.y} L${r},${h} L${s.x},${s.y}`;
      a(t).withAttributes({
        d
      });
    });
    o(this, "mapEdgePointToGlobal", (t) => {
      const { source: e, target: i } = t, s = {
        x: e.x + this.draggingNodeParentBounds.x - this.svgBackgroundBounds.x,
        y: e.y + this.draggingNodeParentBounds.y - this.svgBackgroundBounds.y
      }, r = {
        x: i.x + this.draggingNodeParentBounds.x - this.svgBackgroundBounds.x,
        y: i.y + this.draggingNodeParentBounds.y - this.svgBackgroundBounds.y
      };
      return {
        source: s,
        target: r
      };
    });
    o(this, "renderEdgesWhenDraggingElement", (t) => {
      var e, i;
      this.draggingNodeMirror.x = t.x - (this.draggingNodeParentBounds.x - this.svgBackgroundBounds.x), this.draggingNodeMirror.y = t.y - (this.draggingNodeParentBounds.y - this.svgBackgroundBounds.y), this.draggingNodeMirror.width = t.width, this.draggingNodeMirror.height = t.height, (e = this.asSourceDraggingEdges) == null || e.forEach((s) => {
        this.renderEdge(s.svgRef, this.mapEdgePointToGlobal(this.mapEdgeToPoints({
          source: this.draggingNodeMirror,
          target: s.viewNode
        })));
      }), (i = this.asTargetDraggingEdges) == null || i.forEach((s) => {
        this.renderEdge(s.svgRef, this.mapEdgePointToGlobal(this.mapEdgeToPoints({
          source: s.viewNode,
          target: this.draggingNodeMirror
        })));
      });
    });
    o(this, "startEdgeDragging", (t, e) => {
      if (this._enabled) {
        a(this.editableGlass).withStyle({
          display: "block"
        }), this.disableUserSelect(), this.isDraggingEdge = !0;
        const i = this.context.provider.svgDndBackground;
        this.draggingElement = z(i, "path").withAttributes({
          stroke: "rgb(204, 204, 204)",
          "marker-mid": `url(#${t.model.dagId}-${V})`
        }).svgElement, this.initContext(t), this.updateRelativeMousePoint({
          x: e.clientX,
          y: e.clientY
        });
      }
    });
    o(this, "onDragging", (t) => {
      if (t.stopPropagation(), t.button === 0) {
        const e = {
          x: this.isDraggingEdge ? t.clientX : t.pageX,
          y: this.isDraggingEdge ? t.clientY : t.pageY
        };
        if (this.context) {
          const i = this._rootContainer.getBoundingClientRect(), s = this.context.xDirection(e, i), r = this.context.yDirection(e, i);
          this.updateRelativeMousePoint(e), this.isDraggingEdge ? this.onDraggingEdge(e) : this.onDraggingNode(s, r);
        }
      }
    });
    o(this, "endDragging", (t) => {
      var d;
      (d = this.draggingElement) == null || d.remove(), [...this.asSourceDraggingEdges || [], ...this.asTargetDraggingEdges || []].forEach((l) => {
        l.svgRef.remove();
      });
      const e = {
        x: this.isDraggingEdge ? t.clientX : t.pageX,
        y: this.isDraggingEdge ? t.clientY : t.pageY
      };
      this.updateRelativeMousePoint(e);
      const i = {
        x: this._rootContainer.scrollLeft - this.originalScrollPosition.x,
        y: this._rootContainer.scrollTop - this.originalScrollPosition.y
      }, s = this.context.provider.scale || 1;
      let r, h = !0;
      this.isDraggingEdge ? (r = this.findPotentialEdgeTarget(e), r ? this.context.provider.onEdgeDropped ? this.context.provider.onEdgeDropped(this.draggingNode, r) : this.draggingNode.connect(r) : (this.context.provider.onEdgeDropped(this.draggingNode, null), h = !1)) : this.draggingNode.setPoint(
        {
          x: this.draggingNode.x + this.context.xyDelta.x / s + i.x,
          y: this.draggingNode.y + this.context.xyDelta.y / s + i.y
        }
      ), a(this.editableGlass).withStyle({
        display: "none"
      }), a(this.editorForeContainer).withStyle({
        display: "none"
      }), h ? this.isDraggingEdge ? this.context.provider.endEdgeDragging(this.draggingNode, r) : this.context.provider.endNodeDragging(this.draggingNode) : this.isDraggingEdge && this.context.provider.endEdgeDragging(this.draggingNode, null), this.isDraggingEdge = !1, this.restoreUserSelect();
    });
    o(this, "updateRelativeMousePoint", (t) => {
      const e = this._rootContainer.getBoundingClientRect();
      if (this.context.moveTo(t, e), !this.isDraggingEdge) {
        const i = this.context.lastBounds(), s = this.context.provider.getParentTopLeft(this.draggingNode);
        let r = 0, h = 0;
        i.left < s.x && (r = s.x - i.left), i.top < s.y && (h = s.y - i.top), this.context.moveTo({
          x: t.x + r,
          y: t.y + h
        }, e);
      }
    });
    o(this, "scrollIfNeeded", ({ xDirection: t, yDirection: e }) => {
    });
    this._rootContainer = t, this._glassStyles = e, this.mapEdgeToPoints = i, this.editorForeContainer = s, this.mapNodeToDraggingElementClass = r, this.buildGlass();
  }
  destory() {
    this.editableGlass.remove();
  }
  onDraggingEdge(t) {
    let e = this.draggingNode;
    const i = this.findPotentialEdgeTarget(t);
    i && (e = i);
    let { source: s, target: r } = this.mapEdgePointToGlobal(this.mapEdgeToPoints({
      source: this.draggingNode,
      target: e
    }));
    const h = this.context.provider.scale || 1, d = v(this.context.provider.svgDndBackground.getBoundingClientRect(), h);
    r = {
      x: e !== this.draggingNode ? r.x : g(t.x / h) - d.x,
      y: e !== this.draggingNode ? r.y : g(t.y / h) - d.y
    };
    const l = (s.x + r.x) / 2, c = (s.y + r.y) / 2, u = `M${s.x},${s.y} L${l},${c} L${r.x},${r.y}`;
    a(this.draggingElement).withAttributes({
      d: u
    });
  }
  findPotentialEdgeTarget(t) {
    const e = this.eligibleEdgeConnectors.find((i) => $t(t, i.bounds));
    return e == null ? void 0 : e.viewNode;
  }
  onDraggingNode(t, e) {
    this.scrollIfNeeded({
      xDirection: t,
      yDirection: e
    }), this.moveDraggingElement();
  }
}
var P = /* @__PURE__ */ ((n) => (n.LeftToRight = "LeftToRight", n.RightToLeft = "RightToLeft", n.None = "None", n))(P || {}), O = /* @__PURE__ */ ((n) => (n.TopToBottom = "TopToBottom", n.BottomToTop = "BottomToTop", n.None = "None", n))(O || {});
const Gt = 200;
class Z {
  constructor({ rootXy: t, zoomLayerXy: e, mPoint: i, bounds: s, scale: r, provider: h }) {
    o(this, "mouseDownTimestamp");
    o(this, "originalBounds");
    o(this, "_originalPoint");
    o(this, "mrPoint");
    o(this, "originalOffset");
    o(this, "zoomLayerXy");
    o(this, "invalidDropping");
    o(this, "_provider");
    o(this, "dir");
    o(this, "_scale");
    o(this, "validDndThreshold");
    o(this, "moveTo", (t, e) => {
      this.mrPoint = {
        x: t.x - e.x,
        y: t.y - e.y
      };
    });
    o(this, "xDirection", (t, e) => {
      const i = t.x - e.left, s = (this.mrPoint || { x: 0 }).x;
      return s < i ? P.LeftToRight : s === i ? P.None : P.RightToLeft;
    });
    o(this, "yDirection", (t, e) => {
      const i = t.y - e.top;
      return (this.mrPoint || { y: 0 }).y < i ? O.TopToBottom : (this.mrPoint || { y: 0 }).y == i ? O.None : O.BottomToTop;
    });
    o(this, "allowDrop", () => {
      if (this.mouseDownTimestamp && new Date().getTime() - this.mouseDownTimestamp <= Gt)
        return !1;
      const t = this.xyDelta;
      return !(Math.abs(t.x) <= 5 && Math.abs(t.y) <= 5);
    });
    this.mouseDownTimestamp = new Date().getTime(), this.zoomLayerXy = e, this._scale = r || 1;
    const { x: d, y: l } = t;
    this._originalPoint = {
      x: i.x - d,
      y: i.y - l
    }, this.originalBounds = {
      x: s.left,
      y: s.top,
      left: s.left,
      top: s.top,
      width: s.width,
      height: s.height,
      right: s.left + s.width,
      bottom: s.top + s.height
    }, this.originalOffset = {
      x: this._originalPoint.x - this.originalBounds.x,
      y: this._originalPoint.y - this.originalBounds.y
    }, this.mrPoint = this._originalPoint, this._provider = h, this.validDndThreshold = (h == null ? void 0 : h.validDndThreshold) || 3;
  }
  get originalPoint() {
    return this._originalPoint;
  }
  lastBounds(t = !1, e = !1) {
    const i = this.xyDelta, s = e ? g(i.x / this._scale) : i.x, r = e ? g(i.y / this._scale) : i.y, h = e ? v(this.originalBounds, this._scale || 1) : this.originalBounds, { x: d, y: l } = { x: this.originalBounds.left, y: this.originalBounds.top };
    let c = t ? d - this.zoomLayerXy.x : d;
    c = e ? g(c / this._scale || 1) : c, c += s;
    let u = t ? l - this.zoomLayerXy.y : l;
    u = e ? g(u / this._scale || 1) : u, u += r;
    const m = h.width, N = h.height;
    return {
      ...this.originalBounds,
      x: c,
      y: u,
      left: c,
      top: u,
      width: m,
      height: N,
      right: c + m,
      bottom: u + N
    };
  }
  get xyDelta() {
    return {
      x: this.mrPoint.x - this._originalPoint.x,
      y: this.mrPoint.y - this._originalPoint.y
    };
  }
  topLeftDelta(t) {
    return {
      x: t.x - (this._originalPoint.x - this.originalOffset.x),
      y: t.y - (this._originalPoint.y - this.originalOffset.y)
    };
  }
  get provider() {
    return this._provider;
  }
  get point() {
    return this.mrPoint;
  }
}
const kt = "http://www.w3.org/2000/svg", B = {
  width: 1e5,
  height: 1e5
};
class Wt {
  constructor(t, e) {
    o(this, "gridSize");
    o(this, "svg");
    o(this, "_xArr");
    o(this, "_yArr");
    o(this, "xLines", []);
    o(this, "yLines", []);
    o(this, "doLayout", () => {
      this._xArr = [];
      for (let t = 0; t <= B.width; )
        this._xArr.push(t), t += this.gridSize;
      this._yArr = [];
      for (let t = 0; t <= B.height; )
        this._yArr.push(t), t += this.gridSize;
    });
    o(this, "getLines", (t = !1) => (t ? this._yArr : this._xArr).map((s) => t ? {
      x1: 0,
      y1: s,
      x2: B.width,
      y2: s
    } : {
      x1: s,
      y1: 0,
      x2: s,
      y2: B.height
    }));
    o(this, "render", () => {
      this.clear(), this.doLayout(), this.getLines().forEach((i) => {
        this.appendLine(i, !1);
      }), this.getLines(!0).forEach((i) => {
        this.appendLine(i, !0);
      });
    });
    this.gridSize = e, this.svg = t;
  }
  clear() {
    this.svg.innerHTML = "", this.xLines = [], this.yLines = [];
  }
  get xArr() {
    return this._xArr;
  }
  get yArr() {
    return this._yArr;
  }
  appendLine(t, e) {
    const i = document.createElementNS(kt, "line");
    i.setAttribute("class", "nice-dag-dnd-svg-layer-dash-line"), i.setAttribute("x1", `${t.x1}`), i.setAttribute("x2", `${t.x2}`), i.setAttribute("y1", `${t.y1}`), i.setAttribute("y2", `${t.y2}`), a(i).withAttributes({
      stroke: "#9a9a9a",
      "stroke-width": 1,
      "stroke-dasharray": "2, 4"
    }), e ? this.yLines.push(i) : this.xLines.push(i), this.svg.appendChild(i);
  }
  redraw() {
    const { xArr: t, yArr: e } = this;
    this.doLayout();
    const i = this.getLines();
    if (this._xArr.length > t.length)
      for (let r = 0; r < this._xArr.length; r++) {
        const h = i[r];
        r >= t.length && this.appendLine(h, !1);
      }
    for (let r = 0; r < i.length; r++) {
      const h = i[r];
      a(this.xLines[r]).withAttributes({
        x1: `${h.x1}`,
        x2: `${h.x2}`,
        y1: `${h.y1}`,
        y2: `${h.y2}`
      });
    }
    const s = this.getLines(!0);
    if (this._yArr.length > e.length)
      for (let r = 0; r < this._yArr.length; r++) {
        const h = s[r];
        r >= e.length && this.appendLine(h, !0);
      }
    for (let r = 0; r < s.length; r++) {
      const h = s[r];
      a(this.yLines[r]).withAttributes({
        x1: `${h.x1}`,
        x2: `${h.x2}`,
        y1: `${h.y1}`,
        y2: `${h.y2}`
      });
    }
  }
}
class Ht extends st {
  constructor(e) {
    var i;
    super(e);
    o(this, "_dnd");
    o(this, "_editing");
    o(this, "svgGridBkg");
    o(this, "svgDndBkg");
    o(this, "editorBkgContainer");
    o(this, "editorForeContainer");
    o(this, "_grid");
    o(this, "glassStyles");
    o(this, "_gridVisible");
    o(this, "mapNodeToDraggingElementClass");
    o(this, "startEditing", () => (this._editing = !0, this.getAllNodes().forEach((e) => e.editing = !0), this._dnd.setEnabled(!0), this.showGrid(), this));
    o(this, "stopEditing", () => (this._editing = !1, this.getAllNodes().forEach((e) => e.editing = !1), this._dnd.setEnabled(!1), this.hideGrid(), this));
    o(this, "startEdgeDragging", (e, i) => {
      if (this._editing) {
        a(this.editorForeContainer).withStyle({
          display: "block"
        });
        const s = this._rootContainer.getBoundingClientRect(), r = this.zoomLayer.getBoundingClientRect(), h = e.ref.getBoundingClientRect();
        this._dnd.withContext(new Z({
          rootXy: {
            x: s.left,
            y: s.y
          },
          zoomLayerXy: {
            x: r.left,
            y: r.y
          },
          mPoint: {
            x: i.pageX,
            y: i.pageY
          },
          bounds: h,
          scale: this._scale,
          provider: this
        })).startEdgeDragging(e, i);
      }
    });
    o(this, "startNodeDragging", (e, i) => {
      if (this._editing) {
        a(this.editorForeContainer).withStyle({
          display: "block"
        }), e.editing = !0;
        const s = this._rootContainer.getBoundingClientRect(), r = e.ref.getBoundingClientRect(), h = this.zoomLayer.getBoundingClientRect();
        this._dnd.withContext(new Z({
          rootXy: {
            x: s.left,
            y: s.y
          },
          zoomLayerXy: {
            x: h.left,
            y: h.y
          },
          mPoint: {
            x: i.pageX,
            y: i.pageY
          },
          bounds: r,
          scale: this._scale,
          provider: this
        })).startNodeDragging(e, i);
      }
    });
    this.mapNodeToDraggingElementClass = e.mapNodeToDraggingElementClass, this._gridVisible = (i = this._config.gridConfig) == null ? void 0 : i.visible, this.editorBkgContainer = S(this.rootContainer, wt).withAbsolutePosition({
      x: 0,
      y: 0,
      ...B
    }).htmlElement, this.editorForeContainer = S(this.mainLayer, xt).withStyle({
      "z-index": 2,
      display: "none"
    }).htmlElement, this._dnd = new J(
      this.mainLayer,
      e.glassStyles,
      this._config.mapEdgeToPoints,
      this.editorForeContainer,
      this.mapNodeToDraggingElementClass
    ), this.svgGridBkg = W(this.editorBkgContainer, null, `${this.uid}-${yt}`).withStyle({
      width: "100%",
      height: "100%"
    }).withClassNames(mt).svgElement, this.svgDndBkg = W(this.editorForeContainer, null, `${this.uid}-${V}`).withClassNames(Et).withAbsolutePosition(Q).withStyle({
      ...B,
      "z-index": 1
    }).svgElement;
  }
  onEdgeDropped(e, i) {
    this._config.onEdgeDropped && this._config.onEdgeDropped(e, i);
  }
  endNodeDragging() {
    this.fireMinimapChange();
  }
  endEdgeDragging() {
    this.fireMinimapChange();
  }
  get svgDndBackground() {
    return this.svgDndBkg;
  }
  onModelChange(e) {
    super.onModelChange(e), e.type === f.RESIZE ? this._editing ? (this.doForegroundLayout(), this.fireMinimapChange()) : super.adaptOverflow() : e.type === f.REMOVE_NODE && this.fireMinimapChange();
  }
  get grid() {
    return this._grid;
  }
  get validDndThreshold() {
    return 3;
  }
  addJointNode(e, i = {
    x: 0,
    y: 0
  }, s = "root") {
    return s === "root" ? this.rootModel.addNode(e, i, !0) : this.rootModel.findNodeById(s).addChildNode(e, i);
  }
  addNode(e, i = {
    x: 0,
    y: 0
  }, s = "root") {
    return s === "root" ? this.rootModel.addNode(e, i) : this.rootModel.findNodeById(s).addChildNode(e, i);
  }
  withNodes(e) {
    const i = this.isDestoried;
    return super.withNodes(e), i && (this._dnd = new J(
      this.mainLayer,
      this.glassStyles,
      this._config.mapEdgeToPoints,
      this.editorForeContainer,
      this.mapNodeToDraggingElementClass
    ), this._editing ? this.startEditing() : this.stopEditing()), this;
  }
  get editing() {
    return this._editing;
  }
  justifyCenterWhenResizing() {
    this._editing || super.justifyCenterWhenResizing();
  }
  center(e) {
    return super.center(e), this._editing || (this.doForegroundLayout(), this.showGrid()), this;
  }
  doForegroundLayout() {
    const e = this.zoomLayer.getBoundingClientRect(), { scale: i = 1 } = this, s = this.mainLayer.getBoundingClientRect(), r = {
      width: g(e.width / i),
      height: g(e.height / i)
    };
    e.width < s.width && (r.width = g(s.width / i)), e.height < s.height && (r.height = g(s.height / i));
    const h = {
      x: 0,
      y: 0,
      ...r
    };
    a(this.editorForeContainer).withAbsolutePosition(h), this.adaptOverflow();
  }
  set gridVisible(e) {
    this._gridVisible = e;
  }
  get gridVisible() {
    return this._gridVisible;
  }
  showGrid() {
    this._gridVisible && this._grid.render();
  }
  hideGrid() {
    this._grid.clear();
  }
  prettify() {
    const e = this.editing;
    return this.stopEditing(), this.rootModel.doLayout(!0, !0), e && this.startEditing(), this.justifyCenter(this.parentSize), this;
  }
  adaptOverflow() {
    const e = L(this.mainLayer), i = {
      width: parseInt(this.editorForeContainer.style.width),
      height: parseInt(this.editorForeContainer.style.height)
    };
    e.width < i.width ? a(this.mainLayer).withStyle({
      "overflow-x": "auto"
    }) : a(this.mainLayer).withStyle({
      "overflow-x": "none"
    }), e.height < i.height ? a(this.mainLayer).withStyle({
      "overflow-y": "auto"
    }) : a(this.mainLayer).withStyle({
      "overflow-y": "none"
    });
  }
  resizeForeground(e) {
    const i = v(this.editorForeContainer.getBoundingClientRect(), this.scale), s = e.right, r = e.bottom;
    let { width: h, height: d } = i, l;
    if (h < s && (h = s, l = !0), d < r && (d = r, l = !0), l) {
      const c = {
        x: 0,
        y: 0,
        width: h,
        height: d
      };
      a(this.editorForeContainer).withAbsolutePosition(c);
    }
    return this.adaptOverflow(), l;
  }
  drawGrid() {
    this._gridVisible && this._grid.redraw();
  }
  render() {
    var e;
    super.render(), this.doForegroundLayout(), this._grid = new Wt(this.svgGridBkg, (e = this.config.gridConfig) == null ? void 0 : e.size), this._editing && this.showGrid();
  }
  justifyCenter(e) {
    if (!this._editing)
      super.justifyCenter(e);
    else {
      const i = this.rootModel.size(!0);
      let s = 0, r = 0, h = i.width, d = i.height;
      e.width > i.width && (s = (e.width - i.width) / 2, h = g(e.width / this.scale)), e.height > i.height && (r = (e.height - i.height) / 2, d = g(e.height / this.scale)), e.width < i.width && (s = 0), e.height < i.height && (r = 0), (s > 0 || r > 0) && (this.rootModel.setRootOffset({
        offsetX: g(s / this.scale),
        offsetY: g(r / this.scale)
      }), a(this.zoomLayer).withAbsolutePosition({
        x: 0,
        y: 0,
        width: h,
        height: d
      }), this.rootView.justifySize({ width: h, height: d }), this.rootModel.setViewSize({
        width: h,
        height: d
      })), this.adaptOverflow();
    }
  }
  setScale(e) {
    super.setScale(e), this.editorBkgContainer.style.transform = `scale(${e})`, this.editorBkgContainer.style.transformOrigin = "left top", this.editorForeContainer.style.transformOrigin = "left top", this.editorForeContainer.style.transform = `scale(${e})`, this.doForegroundLayout(), this.drawGrid();
  }
  justCenterWhenStartEditing() {
    if (this.parentSize) {
      const e = this.zoomLayer.getBoundingClientRect();
      let i = 0, s = 0, r = 0, h = 0, d;
      this.parentSize.width > e.width && (i = (this.parentSize.width - e.width) / 2, r = g(this.parentSize.width / this.scale), d = !0), this.parentSize.height > e.height && (s = (this.parentSize.height - e.height) / 2, h = g(this.parentSize.height / this.scale), d = !0), a(this.zoomLayer).withAbsolutePosition({
        x: 0,
        y: 0,
        width: r,
        height: h
      }), this.rootView.justifySize({ width: r, height: h }), d && this.rootModel.setRootOffset({
        offsetX: g(i / this.scale),
        offsetY: g(s / this.scale)
      }), this.doForegroundLayout();
    }
  }
  adaptSizeWhenSetScale(e) {
    this._editing || super.adaptSizeWhenSetScale(e);
  }
  getParentTopLeft(e) {
    var s, r;
    const i = (r = (s = e.ref) == null ? void 0 : s.parentElement) == null ? void 0 : r.getBoundingClientRect();
    return {
      x: i == null ? void 0 : i.left,
      y: i == null ? void 0 : i.top
    };
  }
  destory() {
    super.destory(), this._dnd.destory();
  }
}
function Ft(n, t = !1) {
  const e = t ? new Ht(n) : new st(n);
  return Ct(e.id, e), e;
}
const Ut = {
  use: y,
  init: Ft
};
export {
  Ut as default
};
