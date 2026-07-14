# Subfinder CLI Options

Complete command-line reference for ProjectDiscovery Subfinder subdomain discovery.

**Binary:** `subfinder`  
**Install:** https://github.com/projectdiscovery/subfinder/releases  
**Provider keys:** `~/.config/subfinder/provider-config.yaml` (see skill `references/provider-config.md`)

---

## Synopsis

```
subfinder [flags]
```

Domains via `-d`, `-dL`, or stdin.

---

## INPUT

| Flag | Short | Description |
|------|-------|-------------|
| `-domain` | `-d` | Domain(s) to enumerate |
| `-list` | `-dL` | File with one domain per line |

```bash
subfinder -d example.com
subfinder -d example.com,example.org
subfinder -dL domains.txt
echo example.com | subfinder
```

---

## SOURCE

| Flag | Short | Description |
|------|-------|-------------|
| `-sources` | `-s` | Specific passive sources |
| `-recursive` | — | Recursive-capable sources only |
| `-all` | — | All sources (slow) |
| `-exclude-sources` | `-es` | Sources to skip |
| `-list-sources` | `-ls` | List available sources |

```bash
subfinder -ls
subfinder -d example.com -s crtsh,hackertarget
subfinder -d example.com -recursive
subfinder -d example.com -all
subfinder -d example.com -es alienvault,zoomeyeapi
```

---

## FILTER

| Flag | Short | Description |
|------|-------|-------------|
| `-match` | `-m` | Subdomain match (string, comma list, or file) |
| `-filter` | `-f` | Subdomain exclude (string, comma list, or file) |

```bash
subfinder -d example.com -m api,staging
subfinder -d example.com -f test,uat
subfinder -d example.com -m keywords.txt
```

---

## RATE-LIMIT

| Flag | Short | Default | Description |
|------|-------|---------|-------------|
| `-rate-limit` | `-rl` | — | Max HTTP requests per second |
| `-rls` | — | — | Per-provider rate limits |
| `-t` | — | 10 | Resolver threads (active mode) |

```bash
subfinder -d example.com -rl 5
subfinder -d example.com -rls "hackertarget=10/s,shodan=15/s"
subfinder -d example.com -active -t 20
```

---

## OUTPUT

| Flag | Short | Description |
|------|-------|-------------|
| `-output` | `-o` | Output file |
| `-json` | `-oJ` | JSON Lines format |
| `-output-dir` | `-oD` | Per-domain output directory (`-dL`) |
| `-collect-sources` | `-cs` | Source attribution (JSON only) |
| `-ip` | `-oI` | Include IP (requires `-active`) |
| `-silent` | — | Subdomains only |

```bash
subfinder -d example.com -o subs.txt
subfinder -d example.com -oJ -o subs.jsonl
subfinder -d example.com -oJ -cs -o subs.jsonl
subfinder -d example.com -active -oJ -oI -o live.jsonl
subfinder -dL domains.txt -oD ./out/
subfinder -d example.com -silent
```

---

## CONFIGURATION

| Flag | Short | Description |
|------|-------|-------------|
| `-config` | — | Config YAML path |
| `-provider-config` | `-pc` | API key provider config |
| `-resolvers` | `-r` | DNS resolvers (comma-separated) |
| `-rlist` | `-rL` | Resolver list file |
| `-active` | `-nW` | Active subdomain resolution |
| `-proxy` | — | HTTP proxy for API calls |
| `-exclude-ip` | `-ei` | Exclude IPs from output |

```bash
subfinder -d example.com -pc ~/.config/subfinder/provider-config.yaml
subfinder -d example.com -active -r 8.8.8.8,1.1.1.1
subfinder -d example.com -proxy http://127.0.0.1:8080
```

---

## DEBUG / UPDATE

| Flag | Short | Description |
|------|-------|-------------|
| `-verbose` | `-v` | Verbose output |
| `-no-color` | `-nc` | Disable colors |
| `-version` | — | Show version |
| `-update` | `-up` | Update subfinder |
| `-disable-update-check` | `-duc` | Disable update check |

---

## OPTIMIZATION

| Flag | Short | Default | Description |
|------|-------|---------|-------------|
| `-timeout` | — | 30 | Request timeout (seconds) |
| `-max-time` | — | 10 | Max enumeration time (minutes) |

```bash
subfinder -d example.com -timeout 60 -max-time 30 -v
```

---

## Pipeline examples

```bash
subfinder -d example.com -silent | httpx -silent
subfinder -d example.com -silent | dnsx -silent -a -aaaa
subfinder -d example.com -silent | naabu -top-ports 1000 -json -silent
```

---

## JSONL output shapes

| Flags | Example line |
|-------|----------------|
| `-oJ` | `{"host":"api.example.com"}` |
| `-oJ -cs` | `{"host":"api.example.com","source":"crtsh"}` |
| `-active -oJ -oI` | `{"host":"api.example.com","ip":"203.0.113.20"}` |

Schema detail: `.cursor/skills/subfinder/references/json-output-schema.md`

---

## See also

- `.cursor/skills/subfinder/SKILL.md` — agent workflows
- `SubFinder-Zero-to-Hero.md` — progressive tutorial
- https://docs.projectdiscovery.io/opensource/subfinder/usage
