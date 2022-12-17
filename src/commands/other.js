const { SlashCommandBuilder } = require("discord.js");

module.exports = class Other {
  constructor() {
    this.data = new SlashCommandBuilder()
      .setName("other")
  }
}
