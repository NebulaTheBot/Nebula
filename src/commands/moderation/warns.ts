import {
  SlashCommandSubcommandBuilder, EmbedBuilder, PermissionsBitField,
  type ChatInputCommandInteraction
} from "discord.js";
import { genColor } from "../../utils/colorGen.js";
import { QuickDB } from "quick.db";
import { getModerationTable } from "../../utils/database.js";
import { errorEmbed } from "../../utils/embeds/errorEmbed.js";

type Warn = {
  id: number;
  moderator: string;
  reason: string;
}

export default class Warns {
  data: SlashCommandSubcommandBuilder;
  db: QuickDB<any>;

  constructor(db: QuickDB<any>) {
    this.db = db;
    this.data = new SlashCommandSubcommandBuilder()
      .setName("warns")
      .setDescription("Warns of a user.")
      .addUserOption(user => user
        .setName("user")
        .setDescription("The user that you want to see.")
        .setRequired(true)
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const db = this.db;
    const modTable = await getModerationTable(db);

    const user = interaction.options.getUser("user");
    const member = interaction.guild.members.cache.get(interaction.member.user.id);

    const warns = await modTable
      .get(`${interaction.guild.id}.${user.id}.warns`)
      .then(warns => {
        if (!warns) return [] as Warn[];
        return warns as Warn[] ?? [] as Warn[];
      })
      .catch(() => [] as Warn[]);

    const warnsEmbed = new EmbedBuilder()
      .setTitle(`✅ • Warns of ${user.username}`)
      .setFields(
        warns.length > 0 ? warns.map(warn => {
          return {
            name: `#${warn.id}`,
            value: [
              `**Moderator**: <@${warn.moderator}>`,
              `**Reason**: ${warn.reason}`,
              `**Date**: <t:${Math.floor(warn.id / 1000)}:f>`,
            ].join("\n"),
            inline: true,
          };
        }) : [{ name: "No warns", value: "This user has no warns." }]
      )
      .setThumbnail(user.displayAvatarURL())
      .setAuthor({ name: `• ${user.username}`, iconURL: user.displayAvatarURL() })
      .setFooter({ text: `User ID: ${user.id}` })
      .setColor(genColor(100));

    if (!member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return await interaction.followUp({ embeds: [errorEmbed("You need the **Moderate Members** permission to execute this command.")] });

    await interaction.followUp({ embeds: [warnsEmbed] });
  }
}
