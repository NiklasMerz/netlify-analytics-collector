const fetch = require('node-fetch');
const core = require('@actions/core');

const token =  process.env.NETLIFY_TOKEN || core.getInput('netlify-token', {required: true});
const siteId =  process.env.NETLIFY_SITE_ID || core.getInput('netlify-site-id', {required: true});
const days = process.env.DAYS || core.getInput('days');
const disableHeader = process.env.DISABLEHEADER === "true" || core.getInput('disable-header') === "true";

const startDate = new Date();
startDate.setUTCHours(0);
startDate.setUTCMinutes(0);
startDate.setUTCSeconds(0)
startDate.setUTCMilliseconds(0);

const endDate = new Date();
endDate.setUTCHours(23);
endDate.setUTCMinutes(59);
endDate.setUTCSeconds(59);
endDate.setUTCMilliseconds(999);

if (days < 0) {
    startDate.setDate(startDate.getDate() - (days * -1));
    endDate.setDate(endDate.getDate() - (days * -1));
}

if (days > 0) {
    startDate.setDate(endDate.getDate() - days);
}

let timezone = startDate.getTimezoneOffset() / 60 * -100;
if (timezone >= 1000) {
    timezone = "+" + timezone;
}
if (timezone < 1000) {
    timezone = "+0" + timezone;
}

if (timezone < 0) {
    timezone = timezone.replace("+", "-");
}


async function start() {
    console.log("Current time:", new Date());
    console.log("Getting analytics from", startDate, "to", endDate);

    getMetric("pageviews");
    getMetric("visitors");
    getMetric("pages");
    getMetric("bandwidth");
    getMetric("not_found");
    getMetric("sources");
}

async function getMetric(metric) {
    const url = `https://analytics.services.netlify.com/v2/${siteId}/${metric}?from=${startDate.getTime().toFixed()}&to=${endDate.getTime()}&timezone=${timezone}&resolution=day`;
    try {
        var res = await fetch(url, {
            "credentials": "include",
            "headers": {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "Pragma": "no-cache",
                "Cache-Control": "no-cache"
            },
            "method": "GET",
            "mode": "cors"
        });

        const response = await res.json();
        console.log("Got entries:", response.data.length);

        if (response.data.length === 0) {
            core.setFailed("No entries");
        }

        writeToCSV(response.data, metric);
    } catch (e) {
        console.error("Request failed".url);
        console.error(e);
    }
}

function writeToCSV(data, metric) {
    const createCsvWriter = require('csv-writer').createObjectCsvWriter;

    let header = [];
    try {
        if (data[0] instanceof Array) {
            if (disableHeader) {
                header = ['date', 'timestamp', 'value'];
            } else {
                header = [
                    { id: 'date', title: 'date' },
                    { id: 'timestamp', title: 'timestamp' },
                    { id: 'value', title: 'count' },
                ];
            }
        } else {
            for (const key in data[0]) {
                if (disableHeader) {
                    header.push(key);
                } else {
                    header.push({ id: key, title: key });
                }
            }
        }
    } catch (e) {
        console.error("Element parsing failed", e);
    }

    const csvWriter = createCsvWriter({
        path: metric + '.csv',
        header
    });

    const exportData = data.map((elem) => {
        if (elem instanceof Array) {
            return {
                date: (new Date(elem[0])).toISOString(),
                timestamp: elem[0],
                value: elem[1],
            };
        } else {
            return elem;
        }
    })

    csvWriter
        .writeRecords(exportData)
        .then(() => console.log(`The CSV file for ${metric} was written successfully`));
}

start();
