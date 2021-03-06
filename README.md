
# Guild

[![Dependency Status](https://david-dm.org/danneu/guild.svg)](https://david-dm.org/danneu/guild)

A forum running in production.

**Disclaimer:** The majority of the code was written when I was new to Koa
and SQL.

## Setup and Install

The Guild is a Node.js app that talks to a Postgres database.

- Install the latest stable version of Node (v6.x).

- The Guild depends on the `plv8` Postgres extension.

- Download the repository and enter the directory that it created:

        git clone git@github.com:danneu/guild.git
        cd guild

- Enter the `guild` directory and install its dependencies:

        npm install

- Launch Postgres (by default it will run on `http://localhost:5432`) and create an empty database named `guild`.

        createdb guild

- The Guild comes with a command that rebuilds the database with tables and fills them with some data to play with:

        npm run reset-db

- Now you can launch the server:

        npm start
        > Listening on http://localhost:3000

## Config and Environment Variables

The Guild is configured with environment variable listed in [server/config.js](https://github.com/danneu/guild/blob/master/server/config.js).

It will run with the default variables, but some features are turned off until they are configured:

- Email-sending system requires `AWS_KEY` and `AWS_SECRET` (your http://aws.amazon.com/ API creds)
- User registration system requires `RECAPTCHA_SITEKEY` and `RECAPTCHA_SITESECRET` (your https://www.google.com/recaptcha/intro/index.html API creds)

## TODO

TODO: These are out of date. Are these even valid anymore?

- Add tests for authorization abstraction
- Create `docs/bulk_updates.sql`
- Add online-status to post user-meta for mobile-sized devices
- Fix slow BBCode tags like [tabs] so that I can possibly render BBCode on the fly instead of pre-baking it in the `html` columns
- Finish BBCode support in convos
- Create cronjob (Heroku Scheduler) for db.clearExpiredViews
- I'm sorting friendships by latest_online_at DESC NULLS LAST on homeage. Do I have an index on that in prod?
