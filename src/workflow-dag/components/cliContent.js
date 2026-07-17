/**
 * Webpack-bundled CLI option markdown (E3-S1/S2).
 */
import nmap from "../../content/cli_app_arguments/NMAP-CLI-Options.md";
import subfinder from "../../content/cli_app_arguments/SubFinder-CLI-Options.md";
import httpx from "../../content/cli_app_arguments/Httpx-CLI-Options.md";
import katana from "../../content/cli_app_arguments/katana-CLI-Options.md";
import nuclei from "../../content/cli_app_arguments/Nuclei-CLI-Options.md";
import nerva from "../../content/cli_app_arguments/Nerva-CLI-Options.md";
import netdiscover from "../../content/cli_app_arguments/NetDiscover-CLI-Options.md";
import pius from "../../content/cli_app_arguments/PIUS-CLI-Options.md";
import { TOOL_CLI_DOC, parseCliOptionsMarkdown } from "./cliOptions";

const BY_FILE = {
  "NMAP-CLI-Options.md": nmap,
  "SubFinder-CLI-Options.md": subfinder,
  "Httpx-CLI-Options.md": httpx,
  "katana-CLI-Options.md": katana,
  "Nuclei-CLI-Options.md": nuclei,
  "Nerva-CLI-Options.md": nerva,
  "NetDiscover-CLI-Options.md": netdiscover,
  "PIUS-CLI-Options.md": pius,
};

export function loadCliMarkdownForUses(uses) {
  const file = TOOL_CLI_DOC[uses];
  if (!file) return "";
  return BY_FILE[file] || "";
}

export function loadCliOptionsForUses(uses) {
  return parseCliOptionsMarkdown(loadCliMarkdownForUses(uses));
}
