const { SlashCommandBuilder } = require("discord.js");

module.exports = class Other {
  constructor() {
    this.data = new SlashCommandBuilder()
      .setName("other")
      .addSubcommandGroup(group => group
        .setName("echo")
        .setDescription("Sends your message in a fancy embed or in a normal message.")
        .addSubcommand(subcommand => subcommand
          .setName("message")
          .setDescription("Sends your message as a normal message.")
          .addStringOption(string => string
            .setName("content")
            .setDescription("The content of the message.")
            .setRequired(true)
          )
        )
        .addSubcommand(subcommand => subcommand
          .setName("embed")
          .setDescription("Sends your message as an embed.")
          .addStringOption(string => string
            .setName("title")
            .setDescription("The title of an embed.")
            .setRequired(true)
          )
          .addStringOption(string => string
            .setName("description")
            .setDescription("The description of an embed. (small text under the title)")
            .setRequired(false)
          )
        )
      );
  }
}
