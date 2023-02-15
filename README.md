# DNS Blocking Test

Tests the performance of DNS blocking.

## Requirements

1. Install `node` and `yarn`.
2. Run `yarn install` to install dependencies.

## How to use

```
Usage: yarn start [options]

Options:
  -u, --url      URL to open. Can be specified multiple times.[array] [required]
  -t, --timeout  Time to wait after the page was loaded AND also used as a
                 navigation timeout.                                    [number]
  -v, --verbose  Run with verbose logging.                             [boolean]
      --version  Show version number                                   [boolean]
  -h, --help     Show help                                             [boolean]

Examples:
  yarn start -u https://example.org/  scrape example.org and count the number of
                                      unique URLs and domains the browser tries to
                                      connect to.
```

### Examples

Scrape one domain, timeout is 5 seconds:

`yarn start -u https://www.google.com/ -t 5000`

Scrape multiple domains:

`yarn start -u https://cnn.com/ -u https://nbcnews.com/ -t 5000`

Run with verbose logging to see what exact requests failed:

`yarn start -u https://cnn.com/ -t 5000 -v`
