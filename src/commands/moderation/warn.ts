// TODO: SQLite Migration
import {
  SlashCommandSubcommandBuilder, EmbedBuilder, PermissionsBitField,
  type ChatInputCommandInteraction, TextChannel, DMChannel,
  Channel, ChannelType
} from "discord.js";
import { genColor } from "../../utils/colorGen.js";
import errorEmbed from "../../utils/embeds/errorEmbed.js";
import { QuickDB } from "quick.db";
import { getModerationTable, getSettingsTable } from "../../utils/database.js";

export default class Warn {
  data: SlashCommandSubcommandBuilder;
  db: QuickDB<any>;

  constructor(db: QuickDB<any>) {
    this.db = db;
    this.data = new SlashCommandSubcommandBuilder()
      .setName("warn")
      .setDescription("Warns a user.")
      .addUserOption(user => user
        .setName("user")
        .setDescription("The user that you want to warn.")
        .setRequired(true)
      )
      .addStringOption(string => string
        .setName("reason")
        .setDescription("The reason for the warn.")
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

    const newWarn = {
      id: Date.now(),
      userId: user.id,
      moderator: member.id,
      reason: interaction.options.getString("reason") ?? "No reason provided"
    };

    const warnEmbed = new EmbedBuilder()
      .setTitle(`✅ • Warned ${user.username}`)
      .setDescription([
        `**Moderator**: <@${member.id}>`,
        `**Reason**: ${interaction.options.getString("reason") ?? "No reason provided"}`
      ].join("\n"))
      .setThumbnail(user.displayAvatarURL())
      .setAuthor({ name: `• ${user.username}`, iconURL: user.displayAvatarURL() })
      .setFooter({ text: `User ID: ${user.id}` })
      .setColor(genColor(100));
    const embedDM = new EmbedBuilder()
      .setTitle(`😡 • You were warned`)
      .setDescription([
        `**Moderator**: ${member.user.username}`,
        `**Reason**: ${interaction.options.getString("reason") ?? "No reason provided"}`
      ].join("\n"))
      .setThumbnail(user.displayAvatarURL())
      .setAuthor({ name: `• ${user.username}`, iconURL: user.displayAvatarURL() })
      .setFooter({ text: `User ID: ${user.id}` })
      .setColor(genColor(0));


    if (!member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return await interaction.followUp({ embeds: [errorEmbed("You need the **Moderate Members** permission to execute this command.")] });
    if (selectedMember === member)
      return await interaction.followUp({ embeds: [errorEmbed("You can't warn yourself.")] });
    if (selectedMember.user.bot)
      return await interaction.followUp({ embeds: [errorEmbed(`You can't warn ${name}, because it's a bot.`)] });
    if (!selectedMember.manageable)
      return await interaction.followUp({ embeds: [errorEmbed(`You can't warn ${name}, because they have a higher role position than Nebula.`)] });
    if (member.roles.highest.position < selectedMember.roles.highest.position)
      return await interaction.followUp({ embeds: [errorEmbed(`You can't warn ${name}, because they have a higher role position than you.`)] });

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
      if (channel) await channel.send({ embeds: [warnEmbed] });
    }

    if (dmChannel) await dmChannel.send({ embeds: [embedDM] });
    await modTable?.push(`${interaction.guild.id}.${user.id}.warns`, newWarn);
    await interaction.followUp({ embeds: [warnEmbed] });
  }
}
