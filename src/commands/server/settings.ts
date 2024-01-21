import {
  Client,
  InteractionType,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import {
  getSetting,
  setSetting,
  settingsDefinition,
  settingsKeys,
} from "../../utils/database/settings";

export default class ServerInfo {
  data: SlashCommandSubcommandBuilder;
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("settings")
      .setDescription("Configure the bot")
      .addStringOption(
        new SlashCommandStringOption()
          .setName("key")
          .setDescription("The setting key to set")
          .addChoices(...settingsKeys.map((key) => ({ name: key, value: key })))
          .setRequired(true),
      )
      .addStringOption(
        new SlashCommandStringOption()
          .setName("value")
          .setDescription(
            "The value you want to set this option to, or blank for view",
          )
          .setAutocomplete(true),
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const key = interaction.options.get("key")!
      .value as keyof typeof settingsDefinition;
    const value = interaction.options.get("value")?.value;
    if (value == undefined)
      return interaction.reply(
        `\`${key}\` is currently \`${JSON.stringify(getSetting(interaction.guildId!, key))}\``,
      );

    setSetting(interaction.guildId!, key, value);
    interaction.reply(`\`${key}\` has been set to \`${value}\``);
  }

  autocompleteHandler(client: Client) {
    client.on("interactionCreate", (interaction) => {
      if (interaction.type != InteractionType.ApplicationCommandAutocomplete)
        return;
      if (interaction.options.getSubcommand() != this.data.name) return;
      switch (
        settingsDefinition[
          interaction.options.get("key")!
            .value as keyof typeof settingsDefinition
        ]
      ) {
        case "BOOL":
          interaction.respond(
            ["TRUE", "FALSE"].map((choice) => ({
              name: choice,
              value: choice,
            })),
          );
          break;
      }
    });
  }
}
