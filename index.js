const fetch = require('node-fetch');

const token = process.env.NETLIFY_TOKEN;
const siteId = process.env.NETLIFY_SITE_ID;


const startDate = new Date();
startDate.setHours(0);
startDate.setMinutes(0);
startDate.setSeconds(0)
startDate.setMilliseconds(0);
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

const url = `https://analytics.services.netlify.com/v1/${siteId}/pageviews?from=${startDate.getTime().toFixed()}&to=${endDate.getTime()}&timezone=${timezone}&resolution=day`

console.log(url);

async function start() {
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

    console.log(await res.json());
}

start();