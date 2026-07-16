/**
 * Parse CLI help markdown into selectable flag options.
 */

/**
 * @param {string} markdown
 * @returns {{ flag: string, description: string, takesValue: boolean }[]}
 */
export function parseCliOptionsMarkdown(markdown) {
  const text = String(markdown || "");
  const fence = text.match(/```[\s\S]*?```/);
  const body = fence ? fence[0].replace(/```\w*\n?/, "").replace(/```$/, "") : text;
  const options = [];
  const seen = new Set();

  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line.startsWith("-")) continue;
    // Match leading flag tokens: -x, -Pn, --top-ports <n>, -sS/sT/...
    const m = line.match(
      /^(-{1,2}[A-Za-z0-9][\w/-]*(?:\[[^\]]+\])?(?:\/[A-Za-z0-9][\w/-]*)*)/
    );
    if (!m) continue;
    let flag = m[1];
    // Prefer first alternative for slash groups: -sS/sT → -sS
    if (flag.includes("/") && !flag.startsWith("--")) {
      flag = flag.split("/")[0];
    }
    if (seen.has(flag)) continue;
    seen.add(flag);
    const rest = line.slice(m[0].length).replace(/^:\s*/, "").trim();
    const takesValue =
      /<[^>]+>/.test(line) ||
      /\bfilename\b/i.test(line) ||
      flag.includes("=");
    options.push({
      flag,
      description: rest || flag,
      takesValue,
    });
  }
  return options;
}

/** Map tool.uses → content filename stem */
export const TOOL_CLI_DOC = {
  "tool.nmap": "NMAP-CLI-Options.md",
  "tool.subfinder": "SubFinder-CLI-Options.md",
  "tool.httpx": "Httpx-CLI-Options.md",
  "tool.katana": "katana-CLI-Options.md",
  "tool.nuclei": "Nuclei-CLI-Options.md",
  "tool.nerva": "Nerva-CLI-Options.md",
  "tool.netdiscover": "NetDiscover-CLI-Options.md",
  "tool.pius": "PIUS-CLI-Options.md",
};

export function cliDocForUses(uses) {
  if (!uses || typeof uses !== "string") return null;
  return TOOL_CLI_DOC[uses] || null;
}
