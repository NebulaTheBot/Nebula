import {
  SlashCommandSubcommandBuilder, EmbedBuilder, PermissionsBitField,
  type ChatInputCommandInteraction, TextChannel, DMChannel,
  Channel, ChannelType
} from "discord.js";
import { genColor } from "../../utils/colorGen.js";
import { errorEmbed } from "../../utils/embeds/errorEmbed.js";
import { QuickDB } from "quick.db";
import { getSettingsTable } from "../../utils/database.js";

export default class Kick {
  data: SlashCommandSubcommandBuilder;
  db: QuickDB<any>;

  constructor(db: QuickDB<any>) {
    this.db = db;
    this.data = new SlashCommandSubcommandBuilder()
      .setName("kick")
      .setDescription("Kicks a user.")
      .addUserOption(option => option
        .setName("user")
        .setDescription("The user that you want to kick.")
        .setRequired(true)
      )
      .addStringOption(option => option
        .setName("reason")
        .setDescription("The reason for the kick.")
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    const members = interaction.guild.members.cache;
    const member = members.get(interaction.member.user.id);
    const selectedMember = members.get(user.id);
    const name = selectedMember.nickname ?? user.username;

    const dmChannel = (await user.createDM().catch(() => null)) as DMChannel | null;;
    const kickEmbed = new EmbedBuilder()
      .setTitle(`✅ • Kicked <@${user.id}>`)
      .setDescription([
        `**Moderator**: <@${interaction.user.id}>`,
        `**Reason**: ${reason ?? "No reason provided"}`
      ].join("\n"))
      .setThumbnail(user.displayAvatarURL())
      .setAuthor({ name: `• ${user.username}`, iconURL: user.displayAvatarURL() })
      .setFooter({ text: `User ID: ${user.id}` })
      .setColor(genColor(100));

    const embedDM = new EmbedBuilder()
      .setTitle(`👢 • You were kicked`)
      .setDescription([
        `**Moderator**: ${interaction.user.username}`,
        `**Reason**: ${reason ?? "No reason provided"}`
      ].join("\n"))
      .setThumbnail(user.displayAvatarURL())
      .setAuthor({ name: `• ${user.username}`, iconURL: user.displayAvatarURL() })
      .setFooter({ text: `User ID: ${user.id}` })
      .setColor(genColor(0));

    if (!member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return await interaction.followUp({ embeds: [errorEmbed("You need the **Kick Members** permission to execute this command.")] });
    if (selectedMember === member)
      return await interaction.followUp({ embeds: [errorEmbed("You can't kick yourself.")] });
    if (selectedMember.user.id === interaction.client.user.id)
      return await interaction.followUp({ embeds: [errorEmbed("You can't kick Nebula.")] });
    if (!selectedMember.manageable)
      return await interaction.followUp({ embeds: [errorEmbed(`You can't kick ${name}, because they have a higher role position than Nebula.`)] });
    if (member.roles.highest.position < selectedMember.roles.highest.position)
      return await interaction.followUp({ embeds: [errorEmbed(`You can't kick ${name}, because they have a higher role position than you.`)] });

    const db = this.db;
    const settingsTable = await getSettingsTable(db);
    const logChannel = await settingsTable?.get(`${interaction.guild.id}.logChannel`).then(
      (channel: string | null) => channel ?? null
    ).catch(() => null);
    if (logChannel) {
      const channel = await interaction.guild.channels.cache.get(logChannel).fetch().then(
        (channel: Channel | null) => {
          if (channel.type != ChannelType.GuildText) return null;
          return channel as TextChannel;
        }
      ).catch(() => null);
      if (channel) await channel.send({ embeds: [kickEmbed] });
    }

    if (dmChannel) await dmChannel.send({ embeds: [embedDM] });
    await selectedMember.kick(reason ?? undefined);
    await interaction.followUp({ embeds: [kickEmbed] });
  }
}
