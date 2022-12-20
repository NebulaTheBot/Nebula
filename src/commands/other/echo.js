const { SlashCommandSubcommandGroupBuilder } = require("discord.js");
// this becomes a subcommand group while other becomes a command and remains in commands
module.exports = class Echo {
  constructor() {
    this.data = new SlashCommandSubcommandGroupBuilder()
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
      );
  }
}
