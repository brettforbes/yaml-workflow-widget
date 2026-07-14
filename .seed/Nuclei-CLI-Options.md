# Nuclei CLI Options

Operator reference for [ProjectDiscovery Nuclei](https://docs.projectdiscovery.io/opensource/nuclei/running) command-line flags. Grouped for quick lookup; verify with `nuclei -h` on your installed version.

Detailed agent reference: `.cursor/skills/nuclei/references/cli-options.md`.

---

## SpiderFeet default (`sfp_tool_nuclei`)

```bash
nuclei -silent -jsonl -concurrency 100 -retries 1 \
  -t <template_path> -no-interactsh -etags dos,fuzz,misc
# targets on stdin, one per line
```

---

## Target input

| Flag | Description |
|------|-------------|
| `-u`, `-target` | Single target |
| `-l`, `-list` | Target list file |
| `-eh`, `-exclude-hosts` | Excluded hosts file |
| stdin | Targets when `-u`/`-l` omitted |

---

## Templates and filters

| Flag | Description |
|------|-------------|
| `-t`, `-templates` | Template directory or file |
| `-w`, `-workflows` | Workflow directory or file |
| `-tl` | List templates |
| `-id` | Template ID filter |
| `-tags` | Include tags |
| `-etags` | Exclude tags |
| `-severity` | Severity filter |
| `-author` | Author filter |
| `-type` | Protocol type filter |
| `-template-url` | Remote template |
| `-validate` | Validate only |
| `-ud`, `-update-templates` | Update templates |
| `-sign` | Signed templates only |

---

## Output

| Flag | Description |
|------|-------------|
| `-jsonl` | JSON Lines per finding |
| `-j`, `-json` | JSON output |
| `-o`, `-output` | Output file |
| `-s`, `-silent` | Quiet mode |
| `-v` / `-debug` | Verbose / debug |
| `-stats` | Statistics |
| `-me` | Markdown export |
| `-se` | SARIF export |
| `-nc` | No color |
| `-include-rr` | Include request/response |
| `-omit-raw` | Omit raw req/resp |

---

## Performance

| Flag | Description |
|------|-------------|
| `-c`, `-concurrency` | Parallelism (SF: 100) |
| `-bs`, `-bulk-size` | Bulk host size |
| `-rl`, `-rate-limit` | Requests/sec cap |
| `-timeout` | Request timeout |
| `-retries` | Retries (SF: 1) |
| `-mhe`, `-max-host-error` | Per-host error cap |
| `-spm`, `-stop-at-first-match` | First match only |

---

## HTTP / network

| Flag | Description |
|------|-------------|
| `-H`, `-header` | Custom header |
| `-V`, `-var` | Template variable |
| `-r`, `-resolvers` | DNS resolvers file |
| `-follow-redirects` | Follow redirects |
| `-max-redirects` | Redirect limit |
| `-disable-redirects` | No redirects |
| `-ip-version` | IPv4/IPv6 preference |
| `-no-interactsh` | Disable OOB (SF default) |
| `-interactsh-server` | Custom Interactsh |
| `-fuzz` / `-dast` | Fuzzing modes |
| `-passive` | Passive templates only |
| `-profile` | Built-in profile |

---

## Auth and config

| Flag | Description |
|------|-------------|
| `-secret-file` | Secrets for auth scans |
| `-auth` | Auth configuration |
| `-config` | Config file path |

---

## Examples

```bash
# Standard safe scan
nuclei -u https://example.com -silent -jsonl -t ~/nuclei-templates \
  -no-interactsh -etags dos,fuzz,misc

# Critical CVEs only
nuclei -l hosts.txt -tags cve -severity critical,high -jsonl -silent -no-interactsh

# List matching templates
nuclei -tl -tags cve -severity critical | head

# Validate custom template
nuclei -validate -t ./custom/check.yaml
```

---

## See also

- [Nuclei Zero to Hero](Nuclei-Zero-to-Hero.md)
- https://docs.projectdiscovery.io/opensource/nuclei/running
