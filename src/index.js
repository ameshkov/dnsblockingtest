const puppeteer = require('puppeteer');
const consola = require('consola');
const packageJson = require('../package.json');

const { argv } = require('yargs')
    .usage('Usage: $0 [options]')
    .example(
        '$0 -u https://example.org/',
        'scrape example.org and count the number of unique URLs and domains the browser tries to connect to.',
    )
    .option('url', {
        alias: 'u',
        array: true,
        type: 'string',
        description: 'URL to open. Can be specified multiple times.',
    })
    .option('timeout', {
        alias: 't',
        type: 'number',
        description: 'Time to wait after the page was loaded AND also used as a navigation timeout.',
    })
    .option('verbose', {
        alias: 'v',
        type: 'boolean',
        description: 'Run with verbose logging.',
    })
    .demandOption(['u'])
    .version()
    .help('h')
    .alias('h', 'help');

if (argv.verbose) {
    // trace level.
    consola.level = 5;
}

/**
 * Opens the specified website in Chrome and counts the number of unique URLs
 * that the browser tried to connect to. Note, that it does not count failed
 * requests.
 *
 * @param {String} url URL to scrape.
 * @param {Number} timeout Timeout in milliseconds to wait after the page is loaded.
 */
async function scrape(url, timeout) {
    consola.info(`Scraping ${url}...`);

    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    const requests = new Map();
    const domains = new Map();

    page.on('request', (request) => {
        if (request.url().startsWith('https://')) {
            requests.set(request.url(), true);
        }

        const hostname = new URL(request.url()).hostname;
        domains.set(hostname, true);
    });

    page.on('requestfailed', (request) => {
        if (request.url().startsWith('https://')) {
            requests.set(request.url(), false);
        }

        const hostname = new URL(request.url()).hostname;
        domains.set(hostname, false);
    });

    // Configure the navigation timeout.
    await page.setDefaultNavigationTimeout(timeout);

    await page.goto(url);

    consola.info(`Waiting for ${timeout} ms`);
    await new Promise((resolve) => setTimeout(resolve, timeout));

    const requestsCount = requests.size;
    const successCount = Array.from(requests.values()).filter((val) => { return val }).length;
    const failedCount = requestsCount - successCount;
    const domainsCount = domains.size;
    const successDomainsCount = Array.from(domains.values()).filter((val) => { return val }).length;
    const failedDomainsCount = domainsCount - successDomainsCount;

    consola.info(`Requests count: ${requestsCount}`);
    consola.info(`Success count: ${successCount}`);
    consola.info(`Failed count: ${failedCount}`);

    consola.info(`Domains count: ${domainsCount}`);
    consola.info(`Success domains count: ${successDomainsCount}`);
    consola.info(`Failed domains count: ${failedDomainsCount}`);

    if (argv.verbose) {
        for (const [url, success] of requests) {
            consola.debug(`${url} ${success ? '✅' : '❌'}`);
        }
    }

    consola.info('Closing browser...');

    await browser.close();
}

(async () => {
    consola.info(`Starting ${packageJson.name} v${packageJson.version}`);

    // Default timeout is 10_000 ms.
    const timeout = argv.timeout || 10_000;

    for (const url of argv.url) {
        await scrape(url, timeout);
    }

    consola.info('Done!');
})();