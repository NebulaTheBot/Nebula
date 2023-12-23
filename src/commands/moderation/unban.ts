import {
  PermissionsBitField, EmbedBuilder, SlashCommandSubcommandBuilder,
  TextChannel, DMChannel, ChannelType,
  type Channel, type ChatInputCommandInteraction
} from "discord.js";
import { genColor } from "../../utils/colorGen.js";
import { errorEmbed } from "../../utils/embeds/errorEmbed.js";
import { getSettingsTable } from "../../utils/database.js";
import { QuickDB } from "quick.db";

export default class Unban {
  data: SlashCommandSubcommandBuilder;
  db: QuickDB<any>;

  constructor(db: QuickDB<any>) {
    this.db = db;
    this.data = new SlashCommandSubcommandBuilder()
      .setName("unban")
      .setDescription("Unbans a user.")
      .addStringOption(string => string
        .setName("user")
        .setDescription("The ID of the user that you want to unban.")
        .setRequired(true)
      )
  }

  async run(interaction: ChatInputCommandInteraction) {
    const userID = interaction.options.getString("user");
    const member = interaction.guild.members.cache.get(interaction.member.user.id);
    const selectedBannedMember = (interaction.guild.bans.cache.map(user => user.user)).filter(user => user.id === userID)[0];

    if (!member.permissions.has(PermissionsBitField.Flags.BanMembers)) return await interaction.followUp({
      embeds: [errorEmbed("You need the **Ban Members** permission to execute this command.")]
    });

    if (selectedBannedMember == undefined) return await interaction.followUp({
      embeds: [errorEmbed("You can't unban this user because they were never banned.")]
    });

    const embed = new EmbedBuilder()
      .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL() })
      .setTitle(`✅ • Unbanned ${member.user.username}`)
      .setDescription(`**Moderator**: <@${member.user.id}>`)
      .setThumbnail(selectedBannedMember.displayAvatarURL())
      .setFooter({ text: `User ID: ${userID}` })
      .setColor(genColor(100));

    const embedDM = new EmbedBuilder()
      .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL() })
      .setTitle(`🤝 • You were unbanned`)
      .setDescription(`**Moderator**: ${member.user.username}`)
      .setThumbnail(selectedBannedMember.displayAvatarURL())
      .setFooter({ text: `User ID: ${userID}` })
      .setColor(genColor(100));

    const logChannel = await (await getSettingsTable(this.db))
      ?.get(`${interaction.guild.id}.logChannel`)
      .then((channel: string | null) => channel)
      .catch(() => null);

    if (logChannel) {
      const channel = await interaction.guild.channels.cache
        .get(logChannel)
        .fetch()
        .then((channel: Channel) => {
          if (channel.type != ChannelType.GuildText) return null;
          return channel as TextChannel;
        })
        .catch(() => null);

      if (channel) await channel.send({ embeds: [embed] });
    }

    const dmChannel = (await selectedBannedMember.createDM().catch(() => null)) as DMChannel | null;
    if (dmChannel) await dmChannel.send({ embeds: [embedDM] });
    await interaction.guild.members.unban(userID);
    await interaction.followUp({ embeds: [embed] });
  }
}
