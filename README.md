# Netlify Analytics Collector

> :warning: This tool uses an unofficial/unpublisehd API from Netlify. It may break any time!

[Netlify Analytics](https://www.netlify.com/products/analytics/) is awesome but currently it only shows you data for the last 30 days. You can archive analytics from Netlify Analytics with this tool into CSV files. It either runs with NodeJS locally or can be added to Github repos as a Github action that runs on a schedule.

You can find example Github Actions in [.github/workflows](.github/workflows).

* `example.yml` is set to run every day just before midnight to create 1 a zip file with the analytics of the last 30 days and 2 adds the analytics for the current day to a Google Sheet.
* `summary-release.yml` Is a workflow that runs on the first day of each month and creates a new release in the Github repo with an zip with CSV files of the analtics data from the past month.

These are the workflows I came up and you can probably built even cooler workflows. Let me know!

## Setup

You need to setup some secrets either as secrets for actions or environment variables.

* `NETLIFY_SITE` - You need the **API ID** of your Netlify site with analytics enabled. You can find it on your sites settings page.
* `NETLIFY_TOKEN` - You need a personal access token for your Netlify account to login in. You can generate a token [here](https://app.netlify.com/user/applications/personal)
  
### For Google Sheets

The example workflow uses [this action](https://github.com/canonical-web-and-design/csv-to-google-spreadsheet). Please read there how to set the action if you need it.

* `GOOGLE_SERVICE_ACCOUNT_EMAIL`
* `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
* `GOOGLE_SPREADSHEET_ID`