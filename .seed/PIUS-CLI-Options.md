# PIUS CLI Options

Install:

```bash
go install github.com/praetorian-inc/pius/cmd/pius@latest
```

## Commands

```
pius run [flags]    Run discovery pipeline
pius list           List registered plugins
```

## `pius run` flags

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--org` | string | **required** | Organization name to investigate |
| `--domain` | string | — | Known domain hint |
| `--asn` | string | — | ASN hint (e.g. `AS12345`) |
| `--plugins` | string | all | Comma-separated plugin whitelist |
| `--disable` | string | — | Comma-separated plugin blacklist |
| `--concurrency` | int | `5` | Max concurrent plugins |
| `--output` | string | `terminal` | `terminal`, `json`, or `ndjson` |
| `--mode` | string | `passive` | `passive`, `active`, or `all` |
| `--doh-wordlist` | string | — | Wordlist for `doh-enum` |
| `--doh-servers` | string | — | Comma-separated DoH URLs |
| `--doh-gateways` | string | — | AWS API Gateway URLs for DoH |
| `--doh-deploy-gateways` | bool | false | Deploy AWS gateways for IP rotation |

### Pipeline default

```bash
pius run --org "ORG" --domain example.com --output ndjson
```

## Modes

| Mode | Description |
|------|-------------|
| `passive` | OSINT-only plugins (default) |
| `active` | DNS brute, zone transfer, DoH, favicon-hash, … |
| `all` | Passive + active |

## Output formats

| Value | Description |
|-------|-------------|
| `terminal` | Human-readable `[type] value (source)` lines |
| `json` | Single JSON array of all findings |
| `ndjson` | One Finding JSON object per line (streaming) |

## Environment variables

| Variable | Plugin |
|----------|--------|
| `APOLLO_API_KEY` | apollo |
| `GITHUB_TOKEN` | github-org |
| `SECURITYTRAILS_API_KEY` | passive-dns |
| `VIEWDNS_API_KEY` | reverse-whois, reverse-ip |
| `WHOXY_API_KEY` | whoxy-reverse-whois |
| `BUILTWITH_API_KEY` | builtwith |
| `SHODAN_API_KEY` | shodan, favicon-hash |
| `FOFA_API_KEY` | favicon-hash |
| `CENSYS_API_TOKEN` | censys-org |
| `CENSYS_ORG_ID` | censys-org |

AWS credentials required only for `--doh-deploy-gateways`.

## Cache

- Path: `~/.pius/cache/`
- TTL: 24 hours
- Clear: `rm -rf ~/.pius/cache/`

## Exit codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Error |

## Examples

```bash
# Passive NDJSON
pius run --org "Acme Corp" --domain acme.com --output ndjson

# RIR CIDR focus
pius run --org "Acme Corp" --plugins whois,arin,ripe,apnic --output ndjson

# Active DNS brute
pius run --org "Acme" --domain acme.com --mode active --plugins dns-brute --output ndjson

# JSON file
pius run --org "Acme Corp" --output json > results.json

# List plugins
pius list
```

## Plugin phases (reference)

| Phase | Plugins |
|-------|---------|
| 0 | crt-sh, gleif, passive-dns, asn-bgp, dns-brute*, … |
| 1 | whois, edgar |
| 2 | arin, ripe, lacnic, apnic, afrinic |
| 3 | dns-permutation, reverse-ip, builtwith |

\* active mode only for marked active plugins

Full catalog: `.cursor/skills/pius/references/plugins-and-phases.md`

## See also

- `.docs/docs-for-cli-tools/PIUS-Zero-to-Hero.md`
- `.cursor/skills/pius/SKILL.md`
