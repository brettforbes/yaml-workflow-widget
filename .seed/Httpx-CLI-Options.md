# httpx CLI Options

Complete command-line reference for ProjectDiscovery httpx HTTP probe toolkit.

**Binary:** `httpx` (ProjectDiscovery)  
**Install:** https://github.com/projectdiscovery/httpx/releases  
**Config:** `~/.config/httpx/config.yaml`

---

## Synopsis

```
httpx [flags]
```

Targets via `-u`, `-l`, or stdin (unless `-no-stdin`).

---

## INPUT

| Flag | Short | Description |
|------|-------|-------------|
| `-list` | `-l` | Input file (hosts/URLs per line) |
| `-target` | `-u` | Target URL(s) or host(s) |
| `-request` | `-rr` | Raw HTTP request file |

```bash
httpx -u https://scanme.sh
httpx -u scanme.sh,example.com
httpx -l hosts.txt
echo scanme.sh | httpx
echo AS13335 | httpx -silent
```

---

## PROBES

| Flag | Short | Description |
|------|-------|-------------|
| `-status-code` | `-sc` | HTTP status code |
| `-title` | — | Page title |
| `-tech-detect` | `-td` | Technology fingerprint (Wappalyzer dataset) |
| `-web-server` | `-server` | Server header |
| `-content-type` | `-ct` | Content-Type |
| `-content-length` | `-cl` | Content-Length |
| `-location` | — | Redirect location |
| `-response-time` | `-rt` | Response time |
| `-ip` | — | Resolved IP |
| `-cname` | — | CNAME record |
| `-asn` | — | ASN information |
| `-cdn` | — | CDN/WAF provider |
| `-favicon` | — | Favicon mmh3 hash |
| `-jarm` | — | JARM hash |
| `-body-preview` | `-bp` | Body snippet |
| `-probe` | — | SUCCESS/FAILED |

```bash
httpx -l hosts.txt -sc -title -td -server -cdn -ip -json
```

---

## MATCHERS

| Flag | Short | Description |
|------|-------|-------------|
| `-match-code` | `-mc` | Match status codes |
| `-match-string` | `-ms` | Match response string |
| `-match-regex` | `-mr` | Match regex |
| `-match-cdn` | `-mcdn` | Match CDN provider |
| `-match-condition` | `-mdc` | DSL match condition |

```bash
httpx -l hosts.txt -match-code 200,301,302 -json -silent
```

---

## FILTERS

| Flag | Short | Description |
|------|-------|-------------|
| `-filter-code` | `-fc` | Filter status codes |
| `-filter-string` | `-fs` | Filter string in body |
| `-filter-duplicates` | `-fd` | Filter duplicate bodies |
| `-filter-error-page` | `-fep` | Filter ML error pages |
| `-filter-cdn` | `-fcdn` | Filter CDN provider |

```bash
httpx -l hosts.txt -filter-code 404,403 -json -silent
```

---

## RATE-LIMIT

| Flag | Short | Default | Description |
|------|-------|---------|-------------|
| `-threads` | `-t` | 50 | Concurrent threads |
| `-rate-limit` | `-rl` | 150 | Requests per second |
| `-timeout` | — | 10 | Timeout (seconds) |
| `-retries` | — | — | Retry count |
| `-max-host-error` | `-maxhr` | 30 | Max errors per host |

---

## OUTPUT

| Flag | Short | Description |
|------|-------|-------------|
| `-json` | `-j` | JSON Lines output |
| `-output` | `-o` | Output file |
| `-csv` | — | CSV format |
| `-silent` | — | Minimal stdout |
| `-include-response-header` | `-irh` | Headers in JSON |
| `-include-response` | `-irr` | Full request/response in JSON |
| `-include-chain` | — | Redirect chain in JSON |
| `-store-response` | `-sr` | Save responses to disk |

```bash
httpx -l hosts.txt -json -o results.jsonl
httpx -l hosts.txt -json -include-chain -irh -o full.jsonl
```

---

## CONFIGURATIONS

| Flag | Short | Description |
|------|-------|-------------|
| `-follow-redirects` | `-fr` | Follow HTTP redirects |
| `-max-redirects` | `-maxr` | Max redirects (default 10) |
| `-header` | `-H` | Custom headers |
| `-http-proxy` | `-proxy` | HTTP proxy |
| `-ports` | `-p` | Ports to probe |
| `-path` | — | Paths to probe |
| `-no-fallback` | `-nf` | Probe HTTP and HTTPS |
| `-exclude-cdn` | `-ec` | CDN hosts: 80/443 only |
| `-probe-all-ips` | `-pa` | All IPs for hostname |
| `-tls-probe` | — | Probe TLS SAN names |
| `-csp-probe` | — | Probe CSP domains |

```bash
httpx -l hosts.txt -p http:8080,https:8443 -json
httpx -l urls.txt -path /api,/admin -sc -json
```

---

## HEADLESS / SCREENSHOT

| Flag | Short | Description |
|------|-------|-------------|
| `-screenshot` | `-ss` | Capture screenshot |
| `-system-chrome` | — | Use local Chrome |
| `-store-response-dir` | `-srd` | Response/screenshot directory |

---

## DEBUG

| Flag | Short | Description |
|------|-------|-------------|
| `-verbose` | `-v` | Verbose output |
| `-version` | — | Print version |
| `-health-check` | `-hc` | Run diagnostics |
| `-silent` | — | Suppress banner |

---

## Pipeline examples

```bash
subfinder -d example.com -silent | httpx -title -tech-detect -status-code -json -silent
subfinder -d example.com -silent | dnsx -silent -a | httpx -json -silent
naabu -host scanme.sh -json -silent | httpx -json -silent
httpx -l hosts.txt -json -silent | nuclei -silent -jsonl
```

---

## JSONL quick reference

| Flags | Typical fields |
|-------|----------------|
| `-json` | `url`, `status_code`, `title`, `webserver`, `tech` |
| `-json -ip -cdn` | adds `ip`, CDN metadata |
| `-json -include-chain` | adds `chain[]` |
| `-json -irh` | adds response headers |

Schema detail: `.cursor/skills/httpx/references/json-output-schema.md`

---

## See also

- `.cursor/skills/httpx/SKILL.md`
- `Httpx-Zero-to-Hero.md`
- https://docs.projectdiscovery.io/opensource/httpx/usage
