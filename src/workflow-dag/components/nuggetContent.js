/**
 * Nugget structure content helpers (E3-S3/S4).
 */
import nmapMd from "../../content/nugget_structure/nmap_nugget_graph_structure.md";
import subfinderMd from "../../content/nugget_structure/subfinder_nugget_graph_structure.md";
import httpxMd from "../../content/nugget_structure/httpx_nugget_graph_structure.md";
import katanaMd from "../../content/nugget_structure/katana_nugget_graph_structure.md";
import nucleiMd from "../../content/nugget_structure/nuclei_nugget_graph_structure.md";
import nervaMd from "../../content/nugget_structure/nerva_nugget_graph_structure.md";
import netdiscoverMd from "../../content/nugget_structure/netdiscover_nugget_graph_structure.md";
import piusMd from "../../content/nugget_structure/pius_nugget_graph_structure.md";
import nmapSample from "../../content/nugget_structure/nmap_proposed_nuggets.json";

const STRUCTURE_BY_USES = {
  "tool.nmap": nmapMd,
  "tool.subfinder": subfinderMd,
  "tool.httpx": httpxMd,
  "tool.katana": katanaMd,
  "tool.nuclei": nucleiMd,
  "tool.nerva": nervaMd,
  "tool.netdiscover": netdiscoverMd,
  "tool.pius": piusMd,
};

/**
 * Extract ontology nugget ids from structure markdown mermaid labels.
 * @param {string} markdown
 * @returns {string[]}
 */
export function parseNuggetIdsFromStructure(markdown) {
  const ids = new Set();
  const re = /\["([A-Z][A-Z0-9_]*)/g;
  let m;
  const text = String(markdown || "");
  while ((m = re.exec(text))) {
    ids.add(m[1]);
  }
  return [...ids].sort();
}

export function loadNuggetIdsForUses(uses) {
  const md = STRUCTURE_BY_USES[uses];
  if (!md) return [];
  return parseNuggetIdsFromStructure(md);
}

export function loadNmapSampleNuggets() {
  try {
    const parsed =
      typeof nmapSample === "string" ? JSON.parse(nmapSample) : nmapSample;
    return parsed;
  } catch {
    return null;
  }
}
