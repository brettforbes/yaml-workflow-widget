# katana CLI Options

## Core Options

- `-u`, `-list`
- `-silent`, `-jsonl`
- `-depth`, `-concurrency`
- `-timeout`, `-retry`

## Advanced Discovery

- `-jc` JavaScript crawling
- `-hl` headless crawling
- `-fx` form extraction
- `-kf` known-files probing

## Examples

```bash
katana -u https://example.org -silent -jsonl
katana -u https://example.org -silent -jsonl -depth 3 -concurrency 10
katana -u https://app.example.org -silent -jsonl -jc
```
