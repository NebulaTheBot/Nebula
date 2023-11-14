import {
  SlashCommandSubcommandBuilder, EmbedBuilder, PermissionsBitField,
  type ChatInputCommandInteraction, TextChannel, DMChannel,
  ChannelType, Channel
} from "discord.js";
import { genColor } from "../../utils/colorGen.js";
import { errorEmbed } from "../../utils/embeds/errorEmbed.js";
import { QuickDB } from "quick.db";
import { getModerationTable, getSettingsTable } from "../../utils/database.js";

export default class Unwarn {
  data: SlashCommandSubcommandBuilder;
  db: QuickDB<any>;

  constructor(db: QuickDB<any>) {
    this.db = db;
    this.data = new SlashCommandSubcommandBuilder()
      .setName("unwarn")
      .setDescription("Warns a user.")
      .addUserOption(user => user
        .setName("user")
        .setDescription("The user that you want to warn.")
        .setRequired(true)
      )
      .addNumberOption(string => string
        .setName("id")
        .setDescription("The id of the warn.")
        .setRequired(true)
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const db = this.db;
    const modTable = await getModerationTable(db);

    const user = interaction.options.getUser("user");
    const members = interaction.guild.members.cache;
    const member = members.get(interaction.member.user.id);
    const selectedMember = members.get(user.id);
    const name = selectedMember.nickname ?? user.username;
    const dmChannel = (await user.createDM().catch(() => null)) as DMChannel | null;;
    const id = interaction.options.getNumber("id", true);
    const warns = await modTable
      ?.get(`${interaction.guild.id}.${user.id}.warns`)
      .then(warns => warns as any[] ?? [])
      .catch(() => []);
    const newWarns = warns.filter(warn => warn.id !== id);

    const unwarnEmbed = new EmbedBuilder()
      .setTitle(`✅ • Removed warning`)
      .setDescription([
        `**Moderator**: <@${member.id}>`,
        `**Original Reason**: ${newWarns.find(warn => warn.id === id)?.reason ?? "No reason provided"}`
      ].join("\n"))
      .setFooter({ text: `User ID: ${user.id}` })
      .setThumbnail(user.displayAvatarURL())
      .setAuthor({ name: `• ${user.username}`, iconURL: user.displayAvatarURL() })
      .setColor(genColor(100));

    const embedDM = new EmbedBuilder()
      .setTitle(`🤝 • You were unwarned`)
      .setDescription([
        `**Moderator**: ${member.user.username}`,
        `**Original Reason**: ${newWarns.find(warn => warn.id === id)?.reason ?? "No reason provided"}`
      ].join("\n"))
      .setThumbnail(user.displayAvatarURL())
      .setAuthor({ name: `• ${user.username}`, iconURL: user.displayAvatarURL() })
      .setFooter({ text: `User ID: ${user.id}` })
      .setColor(genColor(100));

    if (!member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return await interaction.followUp({ embeds: [errorEmbed("You need the **Moderate Members** permission to execute this command.")] });
    if (selectedMember === member)
      return await interaction.followUp({ embeds: [errorEmbed("You can't unwarn yourself.")] });
    if (newWarns.length === warns.length)
      return await interaction.followUp({ embeds: [errorEmbed(`There is no warn with the id of ${id}.`)] });
    if (!selectedMember.manageable)
      return await interaction.followUp({ embeds: [errorEmbed(`You can't unwarn ${name}, because they have a higher role position than Nebula.`)] });
    if (member.roles.highest.position < selectedMember.roles.highest.position)
      return await interaction.followUp({ embeds: [errorEmbed(`You can't unwarn ${name}, because they have a higher role position than you.`)] });

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
      if (channel) await channel.send({ embeds: [unwarnEmbed] });
    }

    if (dmChannel) await dmChannel.send({ embeds: [embedDM] });
    await modTable?.set(`${interaction.guild.id}.${user.id}.warns`, newWarns);
    await interaction.followUp({ embeds: [unwarnEmbed] });
  }
}
