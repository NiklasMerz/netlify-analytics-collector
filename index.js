const fetch = require('node-fetch');
const core = require('@actions/core');

const token = core.getInput('netlify-token', {required: true})
const siteId = core.getInput('netlify-site-id', {required: true});

const startDate = new Date();
startDate.setHours(0);
startDate.setMinutes(0);
startDate.setSeconds(0)
startDate.setMilliseconds(0);

// One month back
startDate.setDate(-30);

const endDate = new Date();
endDate.setHours(23);
endDate.setMinutes(59);
endDate.setSeconds(59);
endDate.setMilliseconds(999);

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
    getMetric("pageviews");
    getMetric("visitors");
}

async function getMetric(metric) {
    const url = `https://analytics.services.netlify.com/v1/${siteId}/${metric}?from=${startDate.getTime().toFixed()}&to=${endDate.getTime()}&timezone=${timezone}&resolution=day`;
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
    writeToCSV(response.data, metric);
}

function writeToCSV(data, metric) {
    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
    const csvWriter = createCsvWriter({
        path: metric + '.csv',
        header: [
            { id: 'date', title: 'Date' },
            { id: 'timestamp', title: 'Timestamp' },
            { id: 'value', title: 'Count' },
        ]
    });

    const exportData = data.map((elem) => {
        console.log(metric, elem);
        return {
            date: (new Date(elem[0])).toISOString(),
            timestamp: elem[0],
            value: elem[1],
        };
    })

    csvWriter
        .writeRecords(exportData)
        .then(() => console.log(`The CSV file for ${metric} was written successfully`));
}

start();