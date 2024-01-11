// TODO: SQLite Migration
import {
  SlashCommandSubcommandBuilder, EmbedBuilder, PermissionsBitField,
  type ChatInputCommandInteraction
} from "discord.js";
import { genColor } from "../../../utils/colorGen.js";
import errorEmbed from "../../../utils/embeds/errorEmbed.js";
import { getServerboardTable } from "../../../utils/database.js";
import { QuickDB } from "quick.db";

export default class Toggle {
  data: SlashCommandSubcommandBuilder;
  db: QuickDB<any>;

  constructor(db?: QuickDB<any>) {
    this.db = db;
    this.data = new SlashCommandSubcommandBuilder()
      .setName("invite")
      .setDescription("Toggles the invite link to your server in /info serverboard (Auto generates/deletes invites).");
  }

  async run(interaction: ChatInputCommandInteraction) {
    const db = this.db;
    const serverbTable = await getServerboardTable(db);

    const rulesChannel = interaction.guild?.rulesChannel;
    const guild = interaction.guild;
    const member = guild.members.cache.get(interaction.user.id);

    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild))
      return await interaction.followUp({ embeds: [errorEmbed("You need **Manage Server** permissions to add an invite.")] });

    const invite = await serverbTable?.get(`${guild.id}.invite`).then(
      (invite) => String(invite)
    ).catch(() => "");
    if (Boolean(invite)) {
      // Delete invite
      let invites = await rulesChannel?.fetchInvites();
      if (!rulesChannel) invites = await guild.invites.fetch();

      if (invite) {
        await invites.find(inv => inv.url == invite)
          .delete("Serverboard invite disabled");
      }

      await serverbTable.delete(`${guild.id}.invite`);

      const embed = new EmbedBuilder()
        .setTitle("✅ • Invite deleted!")
        .setColor(genColor(100));

      return await interaction.followUp({ embeds: [embed] });
    }

    if (!rulesChannel) return await interaction.followUp({ embeds: [errorEmbed("You need a **rules channel** to create an invite.")] });

    const newInvite = await rulesChannel.createInvite({
      maxAge: 0,
      maxUses: 0,
      reason: "Serverboard invite enabled"
    });
    await serverbTable.set(`${guild.id}.invite`, newInvite.url);

    const embed = new EmbedBuilder()
      .setTitle("✅ • Invite created!")
      .setColor(genColor(100));

    await interaction.followUp({ embeds: [embed] });
  }
}
