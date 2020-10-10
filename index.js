const fetch = require('node-fetch');
const core = require('@actions/core');

const token =  process.env.NETLIFY_TOKEN || core.getInput('netlify-token', {required: true});
const siteId =  process.env.NETLIFY_SITE_ID || core.getInput('netlify-site-id', {required: true});

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

const days = process.env.DAYS || core.getInput('days');
startDate.setUTCDate(endDate.getDate() - days);


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
    console.log("Getting analytics from", startDate, "to", endDate);

    getMetric("pageviews");
    getMetric("visitors");
}

async function getMetric(metric) {
    const url = `https://analytics.services.netlify.com/v1/${siteId}/${metric}?from=${startDate.getTime().toFixed()}&to=${endDate.getTime()}&timezone=${timezone}&resolution=day`;
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
        writeToCSV(response.data, metric);
    } catch(e) {
        console.error("Request failed". url);
        console.error(e);
    }
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