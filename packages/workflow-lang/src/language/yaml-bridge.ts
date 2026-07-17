/**
 * YAML workflow document → SfWorkflow (.sfw) surface text (SPEC-012 E5-S1).
 * Enables DocumentBuilder on .yaml/.yml via conversion into the existing grammar.
 */
import yaml from 'js-yaml';

export function looksLikeWorkflowYaml(text: string, fileName = ''): boolean {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.yaml') || lower.endsWith('.yml')) return true;
  const head = String(text || '').trimStart().slice(0, 200);
  return (
    /^apiVersion\s*:/m.test(head) ||
    /^kind\s*:\s*Workflow/m.test(head) ||
    head.startsWith('---')
  );
}

export function q(value: unknown): string {
  return JSON.stringify(value == null ? '' : String(value));
}

export function toId(value: unknown, fallback = 'item'): string {
  const raw = String(value ?? fallback).replace(/[^A-Za-z0-9_]/g, '_');
  if (!raw) return fallback;
  if (/^[0-9]/.test(raw)) return `n_${raw}`;
  return raw;
}

function emitWhere(preds: unknown[]): string {
  if (!Array.isArray(preds) || !preds.length) return '';
  const parts: string[] = [];
  for (const p of preds) {
    if (!p || typeof p !== 'object') continue;
    const o = p as Record<string, unknown>;
    if (o.not) {
      parts.push(`not { ${emitWhereInner(o.not)} }`);
    } else {
      parts.push(emitWhereInner(o));
    }
  }
  return parts.length ? `where { ${parts.join(' ')} }` : '';
}

function emitWhereInner(pred: unknown): string {
  if (!pred || typeof pred !== 'object') return '';
  const o = pred as Record<string, unknown>;
  if (o.related && typeof o.related === 'object') {
    const r = o.related as Record<string, unknown>;
    const bits = [
      `direction ${q(r.direction)}`,
      `relation ${q(r.relation)}`,
    ];
    if (r.transitive != null) bits.push(`transitive ${r.transitive ? 'true' : 'false'}`);
    if (r.nugget_id) bits.push(`nugget_id ${q(r.nugget_id)}`);
    if (Array.isArray(r.nugget_id_in)) {
      bits.push(`nugget_id_in { ${r.nugget_id_in.map(q).join(' ')} }`);
    }
    return `related { ${bits.join(' ')} }`;
  }
  if (o.attr && typeof o.attr === 'object') {
    const a = o.attr as Record<string, unknown>;
    const bits = [`key ${q(a.key)}`];
    if (a.equals != null) bits.push(`equals ${q(a.equals)}`);
    if (a.regex != null) bits.push(`regex ${q(a.regex)}`);
    return `attr { ${bits.join(' ')} }`;
  }
  return '';
}

function emitNodeMatch(nodes: Record<string, unknown> | undefined): string {
  if (!nodes) return 'nodes { }';
  const bits: string[] = [];
  if (nodes.nugget_id) bits.push(`nugget_id ${q(nodes.nugget_id)}`);
  if (Array.isArray(nodes.nugget_id_in)) {
    bits.push(`nugget_id_in { ${nodes.nugget_id_in.map(q).join(' ')} }`);
  }
  if (nodes.nugget_data_equals != null) {
    bits.push(`nugget_data_equals ${q(nodes.nugget_data_equals)}`);
  }
  if (nodes.nugget_data_regex != null) {
    bits.push(`nugget_data_regex ${q(nodes.nugget_data_regex)}`);
  }
  if (Array.isArray(nodes.where)) {
    const w = emitWhere(nodes.where);
    if (w) bits.push(w);
  }
  return `nodes { ${bits.join(' ')} }`;
}

function emitSelect(select: Record<string, unknown>): string {
  const bits = [`source ${q(select.source)}`];
  if (select.for_each && typeof select.for_each === 'object') {
    bits.push(emitForEach(select.for_each as Record<string, unknown>));
  } else if (select.nodes && typeof select.nodes === 'object') {
    bits.push(emitNodeMatch(select.nodes as Record<string, unknown>));
  }
  if (select.project) bits.push(`project ${q(select.project)}`);
  if (select.distinct != null) bits.push(`distinct ${select.distinct ? 'true' : 'false'}`);
  return `select { ${bits.join(' ')} }`;
}

function emitForEach(fe: Record<string, unknown>): string {
  const asId = toId(fe.as, 'item');
  const bits = [`as ${asId}`, emitNodeMatch(fe.nodes as Record<string, unknown>)];
  if (Array.isArray(fe.collect)) {
    bits.push('collect {');
    for (const c of fe.collect) {
      if (!c || typeof c !== 'object') continue;
      const col = c as Record<string, unknown>;
      const cb = [`as ${toId(col.as, 'c')}`];
      if (col.reachable_from) {
        cb.push(`reachable_from ${toId(col.reachable_from)}`);
        const along = col.along as Record<string, unknown> | undefined;
        if (along) {
          const ab = [`relation ${q(along.relation)}`];
          if (along.direction) ab.push(`direction ${q(along.direction)}`);
          if (along.transitive != null) {
            ab.push(`transitive ${along.transitive ? 'true' : 'false'}`);
          }
          cb.push(`along { ${ab.join(' ')} }`);
        }
      }
      if (col.nodes) cb.push(emitNodeMatch(col.nodes as Record<string, unknown>));
      if (col.project) cb.push(`project ${q(col.project)}`);
      bits.push(`collect { ${cb.join(' ')} }`);
    }
    bits.push('}');
  }
  if (fe.emit && typeof fe.emit === 'object') {
    const em = fe.emit as Record<string, unknown>;
    const eb: string[] = [];
    if (Array.isArray(em.product)) {
      eb.push(`product { ${em.product.map((p) => toId(p)).join(' ')} }`);
    } else if (em.values) {
      eb.push(`values ${toId(em.values)}`);
    }
    if (em.join != null) eb.push(`join ${q(em.join)}`);
    if (em.format != null) eb.push(`format ${q(em.format)}`);
    bits.push(`emit { ${eb.join(' ')} }`);
  }
  return `for_each { ${bits.join(' ')} }`;
}

function emitGseBinding(binding: Record<string, unknown>): string {
  const bits = [`type string_list`];
  if (binding.select && typeof binding.select === 'object') {
    bits.push(emitSelect(binding.select as Record<string, unknown>));
  } else if (Array.isArray(binding.union)) {
    bits.push(`union { ${binding.union.map(q).join(' ')} }`);
  } else if (Array.isArray(binding.literal)) {
    bits.push(`literal { ${binding.literal.map(q).join(' ')} }`);
  } else if (binding.from_var) {
    bits.push(`from_var ${q(binding.from_var)}`);
  }
  if (binding.distinct != null && !binding.select) {
    bits.push(`distinct ${binding.distinct ? 'true' : 'false'}`);
  }
  return bits.join(' ');
}

function emitStep(step: Record<string, unknown>): string {
  const id = toId(step.id, 'step');
  const lines: string[] = [`step ${id} {`, `uses ${q(step.uses)}`];
  if (Array.isArray(step.needs) && step.needs.length) {
    lines.push(
      `needs ${step.needs.map((n) => toId(n)).join(', ')}`
    );
  }
  const input = step.input as Record<string, unknown> | undefined;
  if (input) {
    lines.push('input {');
    lines.push('type string_list');
    lines.push(`from ${q(input.from)}`);
    if (input.normalize) lines.push(`normalize ${q(input.normalize)}`);
    if (input.empty) lines.push(`empty ${q(input.empty)}`);
    lines.push('}');
  }
  const config = step.config as Record<string, unknown> | undefined;
  if (config) {
    lines.push('config {');
    if (Array.isArray(config.argv)) {
      for (const a of config.argv) lines.push(`argv ${q(a)}`);
    }
    const files = config.files as Record<string, unknown> | undefined;
    if (files) {
      lines.push('files {');
      for (const key of ['input', 'output'] as const) {
        const f = files[key] as Record<string, unknown> | undefined;
        if (!f) continue;
        const fb = [`mode ${q(f.mode)}`];
        if (f.format) fb.push(`format ${q(f.format)}`);
        if (f.path) fb.push(`path ${q(f.path)}`);
        lines.push(`${key} { ${fb.join(' ')} }`);
      }
      lines.push('}');
    }
    const capture = config.capture as Record<string, unknown> | undefined;
    if (capture) {
      lines.push('capture {');
      if (capture.family) lines.push(`family ${q(capture.family)}`);
      if (capture.adapter) lines.push(`adapter ${q(capture.adapter)}`);
      lines.push('}');
    }
    lines.push('}');
  }
  const output = step.output as Record<string, unknown> | undefined;
  const vars = output?.vars as Record<string, unknown> | undefined;
  if (vars && typeof vars === 'object') {
    lines.push('output {');
    for (const [name, binding] of Object.entries(vars)) {
      if (!binding || typeof binding !== 'object') continue;
      lines.push(`var ${toId(name)} {`);
      lines.push(emitGseBinding(binding as Record<string, unknown>));
      lines.push('}');
    }
    lines.push('}');
  }
  const context = step.context as Record<string, unknown> | undefined;
  if (context?.export != null) {
    lines.push(`context { export ${q(context.export)} }`);
  }
  lines.push('}');
  return lines.join('\n');
}

/**
 * Convert a parsed YAML workflow object into SfWorkflow source.
 */
export function yamlDocToSfw(doc: unknown): string {
  if (!doc || typeof doc !== 'object') {
    throw new Error('YAML root must be a mapping');
  }
  const d = doc as Record<string, unknown>;
  const info = (d.info && typeof d.info === 'object'
    ? (d.info as Record<string, unknown>)
    : {}) as Record<string, unknown>;
  const name = toId(info.name || d.id || 'workflow', 'workflow');
  const lines: string[] = [
    `workflow ${name} {`,
    `apiVersion ${q(d.apiVersion || 'spiderfeet.workflow/v1')}`,
    `kind ${q(d.kind || 'Workflow')}`,
  ];
  if (d.id) lines.push(`id ${q(d.id)}`);
  if (info.name) {
    lines.push('info {');
    lines.push(`name ${q(info.name)}`);
    if (info.description) lines.push(`description ${q(info.description)}`);
    if (info.author) lines.push(`author ${q(info.author)}`);
    if (info.created) lines.push(`created ${q(info.created)}`);
    lines.push('}');
  }
  const inputs = d.inputs as Record<string, unknown> | undefined;
  if (inputs && typeof inputs === 'object') {
    for (const [iname, idef] of Object.entries(inputs)) {
      const def = (idef && typeof idef === 'object'
        ? (idef as Record<string, unknown>)
        : {}) as Record<string, unknown>;
      lines.push(`input ${toId(iname)} {`);
      lines.push('type string_list');
      if (def.description) lines.push(`description ${q(def.description)}`);
      if (Array.isArray(def.default)) {
        for (const v of def.default) lines.push(`default ${q(v)}`);
      }
      lines.push('}');
    }
  }
  const steps = Array.isArray(d.steps) ? d.steps : [];
  if (!steps.length) {
    throw new Error('YAML workflow requires at least one step');
  }
  for (const step of steps) {
    if (!step || typeof step !== 'object') continue;
    lines.push(emitStep(step as Record<string, unknown>));
  }
  lines.push('}');
  return lines.join('\n');
}

export function yamlTextToSfw(text: string): string {
  const doc = yaml.load(text);
  return yamlDocToSfw(doc);
}
