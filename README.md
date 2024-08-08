<p align="center"><h1>BLOG BACKEND SERVER</h1></p>

[![npm version](https://badgen.net/npm/v/@sequelize/core)](https://www.npmjs.com/package/@sequelize/core)[![Merged PRs](https://badgen.net/github/merged-prs/rzmobiledev/express_server)](https://github.com/rzmobiledev/express_server)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A robust Backend Server for your blog, with performance-focused and full-featured Ioredis as Redis client, Rabbitmq and sequelize for Node.js.

Completely compatible with Node 21.x.

## Supporting The Project

Do you like the app and would like to give back to the engineering team behind it?

Just drop your email to [rzmobiledev@gmail.com](mailto:rzmobiledev@gmail.com) to participate as contributor. Your knowledge and skill are highly needed to shape this app to help more people.

# Quick Start

## Run Local

```shell
docker compose build && docker compose up -d
```

After app is `up` and `running` then open your browser and go to this url for documentation :

```shell
http://localhost:3000/api/api-docs/
```

# Run Without Docker Compose

- Install and run `Rabbitmq`, `postgres` and `redis`. You can install it with docker. Make sure the environment setup similar to your `.env` file.
- Configure/setup `.env` file. Use `.env.sample` as your `.env` and adjust the variable content to your setup.
- Open your shell and type :

```shell
    npm run dev
```

## Warning: Responsible disclosure

If you have security issues to report, please email
[rzmobiledev@gmail.com](mailto:rzmobiledev@gmail.com) for more details.

# Links

- [API Documentation](https://github.com/rzmobiledev/express_server/)
- [Changelog](CHANGELOG.md)
<hr>
