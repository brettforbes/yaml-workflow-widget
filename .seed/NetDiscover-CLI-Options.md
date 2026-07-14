# NetDiscover CLI Options

Comprehensive reference for netdiscover command-line flags, interactive keys, and configuration files.

**Synopsis:**

```
netdiscover [-i device] [-r range | -l file | -p] [-s time] [-n node] [-c count]
            [-f] [-d] [-S] [-P] [-L]
```

Extended builds may add `-m file`, `-F filter`, `-N`. Run `netdiscover -h` locally to confirm.

---

## Global requirements

- **Privileges:** root or `CAP_NET_RAW` on Linux
- **Scope:** local Layer-2 segment (ARP does not route)
- **Automation:** use `-P` (and `-N` when available)

---

## Mode flags (pick one primary scan mode)

### Auto-scan (default)

No `-r`, `-l`, or `-p`. Scans common private ranges from `~/.netdiscover/ranges` or built-in defaults.

```bash
sudo netdiscover
sudo netdiscover -P -N
```

### `-r range`

Scan explicit CIDR notation. Multiple ranges: comma-separated.

```bash
sudo netdiscover -r 192.168.1.0/24
sudo netdiscover -r 192.168.0.0/16,10.0.0.0/8
```

### `-l file`

File containing one range per line.

```
192.168.1.0/24
10.10.0.0/24
```

```bash
sudo netdiscover -l ranges.txt
```

### `-p`

Passive mode — capture ARP only; send no requests.

```bash
sudo netdiscover -p -i eth0
```

---

## `-i device`

Select network interface.

```bash
sudo netdiscover -i wlan0 -r 192.168.43.0/24
sudo netdiscover -i eth0 -P -N -r 10.0.0.0/24
sudo netdiscover -i tun0 -p
```

Default: first available interface.

---

## `-s time`

Sleep **milliseconds** between ARP requests (default `1`).

```bash
sudo netdiscover -s 100 -r 192.168.1.0/24
```

Higher values reduce network load and detection likelihood.

---

## `-c count`

Times to send each ARP request per IP (packet-loss tolerance).

```bash
sudo netdiscover -c 5 -r 192.168.1.0/24
```

---

## `-n node`

Last octet of scanner source IP (`2`–`253`, default `66`).

```bash
sudo netdiscover -n 200 -r 192.168.1.0/24
```

Use when default scanner address conflicts with an existing host.

---

## `-S`

Hardcore mode — suppress sleep between each host; sleep once per 255 hosts.

```bash
sudo netdiscover -S -r 192.168.1.0/24
```

**Caution:** unreliable on wireless or lossy links.

---

## `-f`

Fast mode — probe only common last-octets per subnet (default `.1`, `.100`, `.254`).

```bash
sudo netdiscover -f -r 192.168.0.0/16
```

Customize octets in `~/.netdiscover/fastips`.

---

## `-d`

Ignore `~/.netdiscover/` configuration; use program defaults.

```bash
sudo netdiscover -d -f
```

---

## `-P`

Parseable output for scripts. Tab/space-separated rows:

```
IP    MAC    COUNT    LEN    VENDOR
```

Exits after active scan unless `-L` is set.

```bash
sudo netdiscover -P -N -r 192.168.1.0/24
```

---

## `-L`

With `-P`, continue passive capture after active scan completes.

```bash
sudo netdiscover -P -L -r 192.168.1.0/24
```

---

## `-N` (extended builds)

Omit headers when using `-P`. Cleaner input for TextFSM.

```bash
sudo netdiscover -P -N -r 192.168.1.0/24
```

---

## `-m file` (extended builds)

Known MAC → hostname mappings.

```
00:14:22:01:23:45 gateway
08:00:27:53:81:2b lab-vm
```

```bash
sudo netdiscover -m hosts.txt -r 192.168.1.0/24
```

---

## `-F filter` (extended builds)

Custom pcap filter expression (default `arp`).

```bash
sudo netdiscover -F "arp and src net 192.168.1.0/24" -r 192.168.1.0/24
```

---

## Interactive keys (non-`-P` mode)

| Key | Action |
|-----|--------|
| `h` | Help |
| `j` / ↓ | Scroll down |
| `k` / ↑ | Scroll up |
| `a` | ARP replies view |
| `r` | ARP requests view |
| `q` | Quit |

---

## Configuration files

| File | Purpose |
|------|---------|
| `~/.netdiscover/ranges` | Auto-scan CIDR list |
| `~/.netdiscover/fastips` | Last-octets for `-f` |

Example `ranges`:

```
192.168.21.0/24
172.26.0.0/16
10.0.0.0/8
```

Example `fastips`:

```
1
10
100
254
```

---

## Common recipes

| Goal | Command |
|------|---------|
| SpiderFeet capture | `sudo netdiscover -P -N -i eth0 -r 192.168.1.0/24` |
| Stealth listen | `sudo netdiscover -p -i eth0` |
| Find used /24 in /16 | `sudo netdiscover -f -P -N -r 10.0.0.0/16` |
| Lossy Wi-Fi | `sudo netdiscover -P -N -c 3 -s 50 -r 192.168.1.0/24` |
| Watch for new hosts | `sudo netdiscover -P -L -r 192.168.1.0/24` |

---

## Output columns (`-P`)

| # | Field | Description |
|---|-------|-------------|
| 1 | IP | IPv4 address |
| 2 | MAC | Hardware address |
| 3 | Count | ARP packets observed |
| 4 | Len | Frame length |
| 5+ | Vendor | OUI vendor (may include ` / hostname`) |

---

## Related documentation

- [NetDiscover-Zero-to-Hero.md](NetDiscover-Zero-to-Hero.md)
- `.cursor/skills/netdiscover/SKILL.md`
- `.cursor/skills/netdiscover/references/cli-options.md`
