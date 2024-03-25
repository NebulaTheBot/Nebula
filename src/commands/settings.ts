import {
  Client,
  InteractionType,
  EmbedBuilder,
  SlashCommandBuilder,
  type ChatInputCommandInteraction
} from "discord.js";
import {
  getSetting,
  setSetting,
  settingsDefinition,
  settingsKeys
} from "../utils/database/settings";
import { genColor } from "../utils/colorGen";

export default class Settings {
  data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  constructor() {
    this.data = new SlashCommandBuilder()
      .setName("settings")
      .setDescription("Configure the bot")
      .addStringOption(string =>
        string
          .setName("key")
          .setDescription("The setting key to set")
          .addChoices(...settingsKeys.map(key => ({ name: key, value: key })))
          .setRequired(true)
      )
      .addStringOption(string =>
        string
          .setName("value")
          .setDescription("The value you want to set this option to, or blank for view")
          .setAutocomplete(true)
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const key = interaction.options.get("key")!.value as keyof typeof settingsDefinition;
    const value = interaction.options.get("value")?.value;
    if (value == undefined)
      return interaction.reply(
        `\`${key}\` is currently \`${JSON.stringify(getSetting(interaction.guildId!, key))}\``
      );

    const embed = new EmbedBuilder()
      .setTitle(`\`${key}\` has been set to \`${value}\`.`)
      .setColor(genColor(100));

    setSetting(interaction.guildId!, key, value as keyof typeof settingsDefinition);
    interaction.reply({ embeds: [embed] });
  }

  autocompleteHandler(client: Client) {
    client.on("interactionCreate", interaction => {
      if (interaction.type != InteractionType.ApplicationCommandAutocomplete) return;
      if (interaction.options.getSubcommand() != this.data.name) return;
      switch (
        settingsDefinition[interaction.options.get("key")!.value as keyof typeof settingsDefinition]
      ) {
        case "BOOL":
          interaction.respond(
            ["true", "false"].map(choice => ({
              name: choice,
              value: choice
            }))
          );
          break;
      }
    });
  }
}
