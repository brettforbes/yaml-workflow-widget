/**
 * Valid YAML → document model → Nice-DAG nodes (SPEC-012 E5-S3 / R12-E5-03).
 * Gated by E5-S2 validate; callers must not invoke on invalid YAML.
 */
import * as yaml from "js-yaml";
import { workflowDocToNiceDagModel } from "./mapper.js";
import { yamlTextToSfw } from "../../../packages/workflow-lang/out/language/yaml-bridge.js";

/**
 * @param {string} text validated workflow YAML
 * @returns {{ nodes: object[], edgeMeta: Map<string,string>, doc: object, sfwText: string }}
 */
export function validatedYamlToNiceDagModel(text) {
  // Bridge proves YAML is Langium-ready (E5-S1); mapper consumes the YAML document model.
  const sfwText = yamlTextToSfw(text);
  const doc = yaml.load(text) || {};
  const mapped = workflowDocToNiceDagModel(doc);
  return {
    nodes: mapped.nodes,
    edgeMeta: mapped.edgeMeta,
    doc,
    sfwText,
  };
}

/**
 * Replace diagram contents from validated YAML. No-op if niceDag missing.
 * @param {object} niceDag
 * @param {string} text
 * @returns {{ edgeMeta: Map<string,string> } | null}
 */
export function applyValidatedYamlToNiceDag(niceDag, text) {
  if (!niceDag?.withNodes) return null;
  const { nodes, edgeMeta } = validatedYamlToNiceDagModel(text);
  niceDag.withNodes(nodes).render();
  if (niceDag.prettify) niceDag.prettify();
  return { edgeMeta };
}
