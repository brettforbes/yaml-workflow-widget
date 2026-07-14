# Nerva CLI Options

Complete command-line reference for Nerva service fingerprinting.

**Synopsis:**

```
nerva [flags]
```

**Target format:** `host:port` or `ip:port` (port must be open).

Install: https://github.com/praetorian-inc/nerva/releases

---

## Target flags

### `--targets` / `-t`

Target or comma-separated target list.

```bash
nerva -t example.com:22
nerva -t server:22,server:80,server:443
nerva --targets 192.168.1.10:22 --json
```

### `--list` / `-l`

Input file with one `host:port` per line.

```
example.com:22
example.com:80
192.168.1.50:443
```

```bash
nerva -l targets.txt
nerva -l targets.txt --json -o results.jsonl
```

### Stdin

When no `-t` or `-l`, nerva reads `host:port` lines from stdin.

```bash
cat targets.txt | nerva --json
naabu -host example.com -silent | nerva --json
echo "10.0.0.1:22" | nerva --json
```

---

## `--output` / `-o`

Write output to file instead of stdout.

```bash
nerva -l targets.txt --json -o results.jsonl
nerva -l targets.txt --csv -o results.csv
```

Default destination: **stdout**.

---

## `--json`

Output **JSON Lines** — one object per fingerprinted service.

```bash
nerva -t example.com:22 --json
```

Example:

```json
{"host":"example.com","ip":"93.184.216.34","port":22,"protocol":"ssh","transport":"tcp","metadata":{}}
```

**Required for SpiderFeet parsing.**

---

## `--csv`

CSV output with header.

```bash
nerva -t example.com:22 --csv
```

Columns: `host`, `ip`, `port`, `protocol`, `transport`, `tls`

---

## `--fast` / `-f`

Fast mode — check only the default plugin per protocol class.

```bash
nerva -l large_targets.txt --fast --json
```

Faster; may miss services on non-standard ports.

---

## `--udp` / `-U`

Run UDP fingerprint plugins.

```bash
sudo nerva -t example.com:53 -U
sudo nerva -l udp_targets.txt -U --json
```

Often requires root.

---

## `--sctp` / `-S`

Run SCTP plugins (Linux only).

```bash
nerva -t mme.telecom.local:3868 -S --json
```

---

## `--timeout` / `-w`

Timeout in **milliseconds** (default `2000`).

```bash
nerva -t slow-server:8080 -w 5000
nerva -l targets.txt -w 10000 --json
```

---

## `--verbose` / `-v`

Verbose logging to stderr.

```bash
nerva -l targets.txt --json -v 2>debug.log
```

---

## `--help` / `-h`

Display help.

```bash
nerva -h
```

---

## Output format summary

| Mode | Example | Parser |
|------|---------|--------|
| Default | `ssh://example.com:22` | Manual only |
| `--json` | `{"host":"...","protocol":"ssh",...}` | **JSON Lines parser** |
| `--csv` | `host,ip,port,protocol,...` | CSV tools |

---

## Common recipes

| Goal | Command |
|------|---------|
| Single service JSON | `nerva -t host:22 --json` |
| Batch file | `nerva -l targets.txt --json -o out.jsonl` |
| Naabu pipe | `naabu -host TARGET -silent \| nerva --json` |
| Fast bulk scan | `nerva -l targets.txt --fast --json` |
| DNS UDP | `sudo nerva -t 10.0.0.1:53 -U --json` |
| Diameter SCTP | `nerva -t host:3868 -S --json` |
| Slow services | `nerva -t host:8080 -w 8000 --json` |

---

## Pipeline context

Nerva runs **after** port discovery:

```
netdiscover → nmap/naabu → nerva --json
```

See [Nerva-Zero-to-Hero.md](Nerva-Zero-to-Hero.md) and [NetDiscover-Zero-to-Hero.md](NetDiscover-Zero-to-Hero.md).

---

## JSON record fields

| Field | Type | Description |
|-------|------|-------------|
| `host` | string | Input hostname/IP |
| `ip` | string | Resolved address |
| `port` | int | Port number |
| `protocol` | string | Service slug (`ssh`, `http`, …) |
| `transport` | string | `tcp`, `udp`, or `sctp` |
| `metadata` | object | Plugin-specific details |

Detail: `.cursor/skills/nerva/references/json-output-schema.md`

---

## Related documentation

- Agent skill: `.cursor/skills/nerva/SKILL.md`
- Protocol list: `.cursor/skills/nerva/references/protocol-list.md`
- Wiki CLI reference: https://github.com/praetorian-inc/nerva/wiki/CLI-Reference
