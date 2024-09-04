<div align="center">

  <img src="./info/screenshot-dark.png#gh-dark-mode-only" />
  <img src="./info/screenshot.png#gh-light-mode-only" />

<br />

<!--
 *                            _ _
 *    ░▒▓█████▓▒░     ___ ___| | | __ _
 *    ░▒▓█   █▓▒░    / __/ _ \ | |/ _` |
 *    ░▒▓█   █▓▒░   | (_|  __/ | | (_| |
 *    ░▒▓█████▓▒░    \___\___|_|_|\__,_|                            
 *
 -->


<p>
	<h1><b>Cella</b></h1>
<p>
    <b>Single stack TypeScript template to build local-first SaaS.</b>
    <br />
    <br />
    <a href="https://cellajs.com">Website</a>
    ·
    Prerelease
    ·
    MIT license
  </p>
  <br />
</p>

</div>

> [!CAUTION]
> Please be aware this is a prerelease. It does not meet production requirements yet and large breaking changes still occur regularly. Want to contribute? Let's connect! ✉️ <info@cellajs.com>

> [!NOTE]
> Due to a new - rewritten, refocused - version of ElectricSQL, we had to revert to basic API calls everywhere. We are now exploring ways to quickly get local-first back into cella.


#### Contents
- [Installation](#installation)
- [Architecture](/info/ARCHITECTURE.md)
- [Roadmap](/info/ROADMAP.md)
- [Deployment](/info/DEPLOYMENT.md)

<br>

## Installation
Make sure you have node installed with `node -v`. Install Node 20.x or 22.x. (ie. [Volta](https://docs.volta.sh/guide/)).

```bash
git clone git@github.com:cellajs/cella.git && cd cella
```

### Quick start

```bash
pnpm install
pnpm quick
```

### Full setup
For a full setup - with Postgres instead of pglite - you need Docker. Install [Orbstack](https://orbstack.dev/) or [Docker](https://docs.docker.com/get-docker/).


```bash
pnpm install
pnpm docker
```

Start all servers:

```bash
pnpm dev
```

Lastly, [seed](/backend/scripts/README.md) your db (with `dev` running) to sign in as [admin user](/backend/scripts/README.md).

```bash
pnpm seed
```

Check it out at [localhost:3003](http://localhost:3003)! Generated API docs can be found at [localhost:4004/docs](http://localhost:4004/docs). Manage your local db with [local.drizzle.studio](http:local.drizzle.studio).


<br />
<br />

💙💛 Big thank you to [drizzle](https://github.com/drizzle-team/drizzle-orm), [hono](https://github.com/honojs/hono), [tanstack-router](https://github.com/tanstack/router) & [electric](https://github.com/electric-sql/electric).
