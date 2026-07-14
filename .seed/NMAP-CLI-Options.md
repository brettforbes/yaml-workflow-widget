# Nmap CLI Options Reference

Comprehensive reference for Nmap command-line options. Official manual: https://nmap.org/book/man.html

**SpiderFeet agent rule:** always include `-oX file.xml` for machine parsing.

---

## Target specification

Targets appear after all options, or via input flags.

| Syntax | Example | Description |
|--------|---------|-------------|
| Hostname | `example.com` | Resolves via DNS |
| IP address | `192.168.1.1` | IPv4 |
| IPv6 | `-6 2001:db8::1` | IPv6 scan |
| CIDR | `10.0.0.0/8` | Network block |
| Range | `10.0.0.1-50` | Last octet range |
| Octet ranges | `192.168.1-3,5.1` | Multiple ranges |
| List file | `-iL file.txt` | One target per line |
| Random | `-iR N` | Scan N random IPs |
| Exclude | `--exclude a,b` | Skip addresses |
| Exclude file | `--excludefile f.txt` | Exclusions from file |

---

## Output options

| Option | Description |
|--------|-------------|
| `-oX filespec` | **XML output** (required for agents) |
| `-oN filespec` | Normal interactive output |
| `-oG filespec` | Grepable output |
| `-oS filespec` | Script kiddie output |
| `-oA basename` | All formats: `.xml`, `.nmap`, `.gnmap` |
| `-v` | Verbose |
| `-vv` | More verbose |
| `-d` | Debugging |
| `-dd` | More debugging |
| `--reason` | Show port state reasons |
| `--open` | Show only open ports (normal output) |
| `--packet-trace` | Show all packets sent/received |
| `--iflist` | Print host interfaces and routes |
| `--resume filename` | Resume aborted scan |
| `--append-output` | Append to output files |
| `--stylesheet path` | XSL for XML HTML view |
| `--webxml` | Web scan XML format |
| `--no-stylesheet` | Omit XSL declaration in XML |

`filespec` can be `-` for stdout.

---

## Host discovery

| Option | Description |
|--------|-------------|
| `-sL` | List scan — DNS resolve only, no send |
| `-sn` | Ping scan — disable port scan |
| `-Pn` | Treat all hosts as online (skip discovery) |
| `-PS portlist` | TCP SYN ping to ports |
| `-PA portlist` | TCP ACK ping |
| `-PU portlist` | UDP ping |
| `-PY portlist` | SCTP INIT ping |
| `-PO protocol list` | IP protocol ping |
| `-PE` | ICMP echo ping |
| `-PP` | ICMP timestamp ping |
| `-PM` | ICMP netmask ping |
| `-PR` | ARP ping (local LAN) |
| `-n` | Never do DNS resolution |
| `-R` | Always resolve DNS |
| `--dns-servers serv1,serv2` | Specify DNS servers |
| `--system-dns` | Use OS DNS resolver |
| `--traceroute` | Trace path to each host |
| `--resolve-all` | Resolve all IPs of a name |

Default: `-PE -PS80,443 -PA80 -PP` on most platforms; ARP on local Ethernet.

---

## Port specification

| Option | Description |
|--------|-------------|
| `-p ports` | Ports: `22`, `1-1024`, `U:53,T:21-25` |
| `-p-` | All ports 1-65535 |
| `-F` | Fast mode — 100 common ports |
| `--top-ports n` | Scan n highest-frequency ports |
| `-r` | Scan ports sequentially (don't randomize) |
| `--port-ratio ratio` | Scan ports more common than ratio |

---

## Scan techniques

| Option | Scan type | Privileged |
|--------|-----------|------------|
| `-sS` | TCP SYN (default) | Yes |
| `-sT` | TCP connect | No |
| `-sU` | UDP | Yes |
| `-sY` | SCTP INIT | Yes |
| `-sZ` | SCTP COOKIE-ECHO | Yes |
| `-sA` | TCP ACK | Yes |
| `-sW` | TCP Window | Yes |
| `-sM` | TCP Maimon | Yes |
| `-sN` | TCP Null | Yes |
| `-sF` | TCP FIN | Yes |
| `-sX` | TCP Xmas | Yes |
| `-sO` | IP protocol | Yes |
| `-sI zombie host` | Idle scan | Yes |
| `-b FTP relay host` | FTP bounce scan | Rare |

Default TCP: `-sS` if raw sockets available, else `-sT`.

---

## Service and version detection

| Option | Description |
|--------|-------------|
| `-sV` | Probe open ports for version info |
| `--version-intensity level` | 0 (light) to 9 (all probes) |
| `--version-light` | Intensity 2 |
| `--version-all` | Intensity 9 |
| `--version-trace` | Show version detection activity |

XML: `<service name="" product="" version="" extrainfo="" conf="" method=""/>`.

---

## OS detection

| Option | Description |
|--------|-------------|
| `-O` | Enable OS detection |
| `--osscan-limit` | Limit OS detection to promising hosts |
| `--osscan-guess` | Guess OS when imperfect match |
| `--max-os-tries` | Limit OS detection attempts |
| `--defeat-rst-ratelimit` | Ignore RST rate limit for OS detect |
| `--defeat-icmp-ratelimit` | Ignore ICMP rate limit |

Requires open and closed port for best accuracy. XML: `<os><osmatch name="" accuracy=""/></os>`.

---

## Timing and performance

| Option | Level | Description |
|--------|-------|-------------|
| `-T0` | Paranoid | Very slow, IDS evasion |
| `-T1` | Sneaky | Slow |
| `-T2` | Polite | Slows for less bandwidth |
| `-T3` | Normal | Default |
| `-T4` | Aggressive | Faster, assumes fast network |
| `-T5` | Insane | Very fast, may sacrifice accuracy |

| Option | Description |
|--------|-------------|
| `--min-hostgroup` | Minimum parallel hosts |
| `--max-hostgroup` | Maximum parallel hosts |
| `--min-parallelism` | Minimum parallel probes |
| `--max-parallelism` | Maximum parallel probes |
| `--min-rtt-timeout` | Minimum probe timeout |
| `--max-rtt-timeout` | Maximum probe timeout |
| `--initial-rtt-timeout` | Initial probe timeout |
| `--max-retries` | Cap probe retransmissions |
| `--host-timeout` | Give up on host after time |
| `--scan-delay` | Minimum delay between probes |
| `--max-scan-delay` | Maximum delay between probes |
| `--min-rate` | Send packets no slower than rate/s |
| `--max-rate` | Send packets no faster than rate/s |

---

## Firewall / IDS evasion and spoofing

| Option | Description |
|--------|-------------|
| `-f` | Fragment packets (8-byte MTU) |
| `-ff` | Fragment twice |
| `--mtu value` | Custom fragment size (multiple of 8) |
| `-D decoy1,decoy2,...` | Cloak scan with decoys (`ME` = real IP) |
| `-S IP_Address` | Spoof source address |
| `-e interface` | Use specified interface |
| `-g port` / `--source-port port` | Use given source port |
| `--proxies url1,url2` | Relay through proxies |
| `--data-length num` | Append random data to packets |
| `--data-string string` | Append custom string |
| `--data 0xhex` | Append custom hex payload |
| `--ttl value` | Set IP time-to-live |
| `--spoof-mac MAC` | Spoof MAC address |
| `--badsum` | Send packets with bad checksums |
| `--ip-options options` | Send with specified IP options |
| `--randomize-hosts` | Randomize target order |

---

## Nmap Scripting Engine (NSE)

| Option | Description |
|--------|-------------|
| `-sC` | Run default scripts |
| `--script names` | Comma-separated script names or categories |
| `--script-args name=value` | Arguments for scripts |
| `--script-args-file filename` | Args from file |
| `--script-help` | Show script help |
| `--script-trace` | Show data sent/received by scripts |
| `--script-updatedb` | Update script database |
| `--script-timeout` | Limit script run time |

### Script categories

`auth`, `broadcast`, `brute`, `default`, `discovery`, `dos`, `exploit`, `external`, `fuzzer`, `intrusive`, `malware`, `safe`, `version`, `vuln`

Examples:

```bash
--script "default,safe"
--script vuln
--script "http-*"
--script ssl-cert,http-title
```

Script reference: https://nmap.org/nsedoc/

---

## Misc options

| Option | Description |
|--------|-------------|
| `-6` | Enable IPv6 scanning |
| `-A` | Aggressive: OS + version + default scripts + traceroute |
| `-4` | Force IPv4 |
| `--privileged` | Assume user has raw socket privileges |
| `--unprivileged` | Assume no raw sockets |
| `--send-eth` | Use raw Ethernet frames |
| `--send-ip` | Use raw IP packets |
| `--bpf-filter filter` | Specify custom BPF filter |
| `--datadir directory` | Nmap data file location |
| `-V` | Print version |
| `-h` | Print help |
| `--release-memory` | Free memory after each host |
| `--max-scan-delay` | Max delay between probes |
| `--scanflags flags` | Custom TCP scan flags |
| `--versiondb` | Custom service probe DB |
| `--servicedb` | Custom services file |

---

## Environment variables

| Variable | Effect |
|----------|--------|
| `NMAPDIR` | Data directory |
| `NMAP_ARGS` | Default extra arguments (use carefully) |

---

## Exit codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Error in arguments or runtime |

Check XML `<finished exit="success"/>` for per-run status.

---

## Common recipes

### Quick single-host recon

```bash
nmap -sV -sC -O --osscan-limit -oX recon.xml TARGET
```

### Network inventory

```bash
nmap -sn -oX live.xml 192.168.0.0/24
nmap -sS -sV --open --top-ports 1000 -oX detail.xml -iL live_ips.txt
```

### Full TCP (authorized)

```bash
nmap -sS -p- -sV -O -oX full.xml TARGET
```

### UDP top ports

```bash
nmap -sU --top-ports 100 -sV -oX udp.xml TARGET
```

### Stealth / IDS-aware

```bash
nmap -sS -T2 -f --scan-delay 500ms -p 22,80,443,8443 -oX stealth.xml TARGET
```

### Web assessment

```bash
nmap -p 80,443,8080,8443 -sV --script "http-title,http-headers,ssl-cert" -oX web.xml TARGET
```

### No root / Windows user

```bash
nmap -sT -sV -p 1-10000 -oX nroot.xml TARGET
```

### Ping-disabled network

```bash
nmap -Pn -sS -p 22,80,443,3389,8443 -oX pn.xml TARGET
```

---

## XML output flags (detail)

From https://nmap.org/book/output-formats-commandline-flags.html

- `-oX -` — XML to stdout (pipe-friendly)
- `-oA base` — produces `base.xml` plus other formats
- Combine with `-v` for stderr progress only; XML structure unchanged

---

## Related documentation

| Document | Path |
|----------|------|
| Agent skill | `.cursor/skills/nmap/SKILL.md` |
| XML schema | `.cursor/skills/nmap/references/xml-output-schema.md` |
| Workflows | `.cursor/skills/nmap/references/workflows-and-phases.md` |
| Zero to Hero | `NMAP-Zero-to-Hero.md` |
| Official book | https://nmap.org/book/toc.html |

---

## Version note

Options vary slightly by Nmap version. Run `nmap -h` and `nmap --version` on the execution host. This document targets Nmap 7.x / 7.94+ semantics.
