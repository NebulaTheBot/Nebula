import {
  PermissionsBitField, EmbedBuilder, SlashCommandSubcommandBuilder,
  type ChatInputCommandInteraction, TextChannel, DMChannel,
  Channel, ChannelType
} from "discord.js";
import { genColor } from "../../utils/colorGen.js";
import errorEmbed from "../../utils/embeds/errorEmbed.js";
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
    const bannedMembers = interaction.guild.bans.cache;
    const bannedMemberArray = bannedMembers.map(user => user.user);
    const selectedBannedMember = bannedMemberArray.filter(user => user.id === userID)[0];

    const dmChannel = (await selectedBannedMember.createDM().catch(() => null)) as DMChannel | null;;
    const unbanEmbed = new EmbedBuilder()
      .setTitle(`✅ • Unbanned ${member.user.username}`)
      .setDescription([
        `**Moderator**: <@${member.user.id}>`
      ].join("\n"))
      .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL() })
      .setThumbnail(selectedBannedMember.displayAvatarURL())
      .setFooter({ text: `User ID: ${userID}` })
      .setColor(genColor(100));
    const embedDM = new EmbedBuilder()
      .setTitle(`🤝 • You were unbanned`)
      .setDescription([
        `**Moderator**: ${member.user.username}`
      ].join("\n"))
      .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL() })
      .setThumbnail(selectedBannedMember.displayAvatarURL())
      .setFooter({ text: `User ID: ${userID}` })
      .setColor(genColor(100));

    if (!member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return await interaction.followUp({ embeds: [errorEmbed("You need the **Ban Members** permission to execute this command.")] });
    if (selectedBannedMember == undefined)
      return await interaction.followUp({ embeds: [errorEmbed("You can't unban this user because they were never banned.")] });

    const db = this.db;
    const settingsTable = await getSettingsTable(db);
    const logChannel = await settingsTable?.get(`${interaction.guild.id}.logChannel`).then(
      (channel: string | null) => channel
    ).catch(() => null);
    if (logChannel) {
      const channel = await interaction.guild.channels.cache.get(logChannel).fetch().then(
        (channel: Channel) => {
          if (channel.type != ChannelType.GuildText) return null;
          return channel as TextChannel;
        }
      ).catch(() => null);
      if (channel) await channel.send({ embeds: [unbanEmbed] });
    }

    if (dmChannel) await dmChannel.send({ embeds: [embedDM] });
    await interaction.guild.members.unban(userID);
    await interaction.followUp({ embeds: [unbanEmbed] });
  }
}
