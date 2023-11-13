# Nebula Contributing Guide

## Prerequisites
- Basic knowledge of TypeScript and discord.js.
- Node.js and MySQL installed.

## Get started with developing
### Getting the code
- Make a fork of this repository. 
- Clone your fork.

### Creating your bot
- Head over to the [Discord Developer Portal](https://discord.com/developers/applications) and make a new application.
- Invite your bot to your server.
- Reset and then copy your bot's token.

### Setting up your database
We use MySQL for the database. You need to set one up to be able to run the bot.

- Create a database file called `json.db`
- It is recommended to create a specific user for Nebula only. See [the docs](https://dev.mysql.com/doc/refman/8.0/en/creating-accounts.html) for more information

### Setting up .env
- Copy the `example.env` file and replace the content with your own credentials inside a file called `.env`.

### Running
- Run `npm i` to install all the modules needed by the bot. 
- Run `npm run start`

Be sure to open a pull request when you're ready to push your changes. Be descriptive of the changes you've made.

![](https://user-images.githubusercontent.com/51555391/176925763-cdfd57ba-ae1e-4bf3-85e9-b3ebd30b1d59.png)
