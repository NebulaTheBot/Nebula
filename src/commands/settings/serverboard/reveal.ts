// TODO: SQLite Migration
import {
  SlashCommandSubcommandBuilder, EmbedBuilder, PermissionsBitField,
  type ChatInputCommandInteraction
} from "discord.js";
import { genColor } from "../../../utils/colorGen.js";
import errorEmbed from "../../../utils/embeds/errorEmbed.js";
import database, { getServerboardTable } from "../../../utils/database.js";
import { QuickDB } from "quick.db";

export default class Reveal {
  data: SlashCommandSubcommandBuilder;
  db: QuickDB<any>;

  constructor(db?: QuickDB<any>) {
    this.db = db;
    this.data = new SlashCommandSubcommandBuilder()
      .setName("reveal")
      .setDescription("Toggles the shown status of your server, community = shown, non = hidden (default).");
  }

  async run(interaction: ChatInputCommandInteraction) {
    const db = this.db;
    const serverbTable = await getServerboardTable(db);

    const guild = interaction.guild;
    const isCommunity = guild?.rulesChannelId != null;

    const shown = await serverbTable?.get(`${guild?.id}.shown`).then(
      (shown) => !!shown
    ).catch(() => false);
    const member = guild?.members.cache.get(interaction.user.id);

    if (!member?.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return await interaction.followUp({
        embeds: [errorEmbed("You need **Manage Server** permissions to toggle the shown status of your server.")],
      });
    }

    if (!isCommunity)
      await serverbTable.set(`${guild?.id}.shown`, !!shown).catch(() => { });
    else
      await serverbTable.set(`${guild?.id}.shown`, !shown).catch(() => { });

    const newShown = await serverbTable?.get(`${guild?.id}.shown`).then(
      (shown) => !!shown
    ).catch(() => false);

    const embed = new EmbedBuilder()
      .setTitle("✅ • Shown status toggled!")
      .setDescription(`Your server is now ${newShown ? "shown" : "hidden"}.`)
      .setColor(genColor(100));

    await interaction.followUp({ embeds: [embed] });
  }
}
