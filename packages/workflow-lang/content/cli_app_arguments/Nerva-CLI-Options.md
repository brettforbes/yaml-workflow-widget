# Nerva CLI Arguments

```
Usage:
  nerva [flags]
TARGET SPECIFICATION:
	Requires a host and port number or ip and port number. The port is assumed to be open.
	HOST:PORT or IP:PORT
EXAMPLES:
	nerva -t praetorian.com:80
	nerva -l input-file.txt
	nerva --json -t praetorian.com:80,127.0.0.1:8000

Flags:
      --auto-save int       auto-save interval (number of targets)
  -c, --capabilities        list available capabilities and exit
      --csv                 output format in csv
      --dns-order string    DNS resolution order: p, l, lp, pl (default "lp")
  -f, --fast                fast mode
  -h, --help                help for nerva
      --json                output format in json
  -l, --list string         input file containing targets
  -H, --max-host-conn int   max concurrent connections per host IP (0=unlimited)
      --misconfigs          enable security misconfiguration detection
  -o, --output string       output file
      --proxy string        proxy URL (e.g. socks5://127.0.0.1:1080)
      --proxy-auth string   socks5 proxy authentication (username:password)
  -R, --rate-limit float    max scans per second (0=unlimited)
  -S, --sctp                run SCTP plugins (Linux only)
  -t, --targets strings     target or comma separated target list
  -w, --timeout int         timeout (milliseconds) (default 2000)
  -U, --udp                 run UDP plugins
  -v, --verbose             verbose mode
  -W, --workers int         number of concurrent scan workers (default 50)
```
