<p align="center">
  <a href="https://chartbrew.com">
    <img src="https://docs.chartbrew.com/assets/logo_full_3.png" alt="ChartBrew logo" width="250"/>
  </a>
</a>

<p align="center">
  <a href="https://circleci.com/gh/chartbrew/chartbrew" target="_blank"><img src="https://circleci.com/gh/chartbrew/chartbrew.svg?style=svg" alt="ChartBrew build" /></a>
  <a href="https://app.codacy.com/gh/chartbrew/chartbrew" target="_blank"><img src="https://api.codacy.com/project/badge/Grade/b245aa07f69c4250a2de9d24efc659e6"></a>
  <a href="https://discord.gg/KwGEbFk" target="_blank"><img src="https://img.shields.io/discord/656557151048957995?label=Discord" alt="" /></a>
</p>

<p align="center">
  <strong>
    <a href="https://chartbrew.com">Chartbrew</a> is an open-source web application that can connect directly to databases and APIs and use the data to create beautiful charts. It features a chart builder, editable dashboards, embedable charts, query & requests editor, and team capabilities.
  </strong>
</p>

<p align="center">
  <a href="https://chartbrew.com">
    <img src="https://cdn2.chartbrew.com/newsletter/chartbrew-open-dashboard.jpeg" alt="ChartBrew dashboard" width="600"/>
  </a>
</p>

<strong>If you are looking for Chartbrew as a service, <a href="https://chartbrew.com">it's available here</a>.</strong>

<hr />

📚 [**Read the full docs here**](https://docs.chartbrew.com)

🔧 [**Issues ready to be tackled**](https://github.com/orgs/chartbrew/projects/1)

🚙 [**Public roadmap over here**](https://trello.com/b/IQ7eiDqZ/chartbrew-roadmap)

💡 [**Have any ideas or discussion topics?**](https://github.com/chartbrew/chartbrew/discussions)

💬 [**Join our Discord**](https://discord.gg/KwGEbFk)

## Data sources

Currently, Chartbrew supports connections to these data sources.

* MySQL
* PostgreSQL
* MongoDB
* Firestore
* Google Analytics
* REST APIs

Chartbrew also features dashboard templates with charts already prepared:

* Simple Analytics
* ChartMogul
* Mailgun
* Google Analytics

...or you can create your **custom templates** and replicate them across multiple dashboards.

## Prerequisites

* NodeJS v12 (should also work with v10)
  * For M1 Macs you might need the latest v14 or v15
* NPM
* MySQL (5+) or PostgreSQL (12.5+)

## Start

It is recommended you head over to the more detailed documentation to find out how to set up Chartbrew

[📚 You can find it here](https://docs.chartbrew.com/#getting-started)

## Quickstart

If you already have a MySQL or PostgreSQL server running, create a database called `chartbrew` and follow the prompts of the `create-chartbrew-app` command below.

**Important** Windows command line is not supported at the moment. Use something like [Cygwin](http://www.cygwin.com/) on Windows.

```sh
npx create-chartbrew-app chartbrew
```

The CLI tool creates a `chartbrew/.env` file which you can configure at any time if you want to change the database, API & client host, etc. The file contains comments explaining what each environmental variable is for. [Check out which need to be set here.](https://docs.chartbrew.com/#set-up-environmental-variables)

### Run the project in Development

Open two terminals, one for front-end and the other for back-end.

```sh
# frontend
cd client/
npm run start

# backend
cd server/
npm run start-dev
```

## Run with Docker

[Check the full guide in the docs.](https://docs.chartbrew.com/deployment/#run-the-application-with-docker)

### Quickstart

Run the following commands and configure the variables:

```sh
docker pull razvanilin/chartbrew
```

```sh
docker run -p 3210:3210 -p 3000:3000 \
  -e CB_SECRET=<enter_a_secure_string> \
  -e CB_API_HOST=0.0.0.0 \
  -e CB_API_PORT=3210 \
  -e CB_DB_HOST=host.docker.internal \
  -e CB_DB_NAME=chartbrew \
  -e CB_DB_USERNAME=root \
  -e CB_DB_PASSWORD=password \
  -e REACT_APP_CLIENT_HOST=http://localhost:3000 \
  -e REACT_APP_API_HOST=http://localhost:3210 \
  razvanilin/chartbrew
```

## Acknowledgements

Many thanks to [everybody that contributed](https://github.com/chartbrew/chartbrew/graphs/contributors) to this open-source project 🙏

[Start here if you want to become a contributor](https://github.com/chartbrew/chartbrew/blob/master/CONTRIBUTING.md)
