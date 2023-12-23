import {
  SlashCommandSubcommandBuilder, EmbedBuilder, PermissionsBitField,
  TextChannel, DMChannel, ChannelType,
  type Channel, type ChatInputCommandInteraction
} from "discord.js";
import { genColor } from "../../utils/colorGen.js";
import { errorEmbed } from "../../utils/embeds/errorEmbed.js";
import { QuickDB } from "quick.db";
import { getSettingsTable } from "../../utils/database.js";

export default class Ban {
  data: SlashCommandSubcommandBuilder;
  deferred: boolean = false;
  db: QuickDB<any>;

  constructor(db: QuickDB<any>) {
    this.db = db;
    this.data = new SlashCommandSubcommandBuilder()
      .setName("ban")
      .setDescription("Bans a user.")
      .addUserOption(option => option
        .setName("user")
        .setDescription("The user that you want to ban.")
        .setRequired(true)
      )
      .addStringOption(option => option
        .setName("reason")
        .setDescription("The reason for the ban.")
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user");
    const members = interaction.guild.members.cache;
    const member = members.get(interaction.member.user.id);
    const selectedMember = members.get(user.id);
    const name = selectedMember.nickname ?? user.username;

    if (!member.permissions.has(PermissionsBitField.Flags.BanMembers)) return await interaction.reply({
      embeds: [errorEmbed("You need the **Ban Members** permission to execute this command.")]
    });

    if (selectedMember === member) return await interaction.reply({
      embeds: [errorEmbed("You can't ban yourself.")]
    });

    if (selectedMember.user.id === interaction.client.user.id) return await interaction.reply({
      embeds: [errorEmbed("You can't ban Nebula.")]
    });

    if (!selectedMember.manageable) return await interaction.reply({
      embeds: [errorEmbed(`You can't ban ${name}, because they have a higher role position than Nebula.`)]
    });

    if (member.roles.highest.position < selectedMember.roles.highest.position) return await interaction.reply({
      embeds: [errorEmbed(`You can't ban ${name}, because they have a higher role position than you.`)]
    });

    const reason = interaction.options.getString("reason");
    const embed = new EmbedBuilder()
      .setAuthor({ name: `• ${user.username}`, iconURL: user.displayAvatarURL() })
      .setTitle(`✅ • Banned ${user.username}`)
      .setDescription([
        `**Moderator**: <@${interaction.user.id}>`,
        `**Reason**: ${reason ?? "No reason provided"}`
      ].join("\n"))
      .setThumbnail(user.displayAvatarURL())
      .setFooter({ text: `User ID: ${user.id}` })
      .setColor(genColor(100));

    const embedDM = new EmbedBuilder()
      .setAuthor({ name: `• ${user.username}`, iconURL: user.displayAvatarURL() })
      .setTitle(`🔨 • You were banned`)
      .setDescription([
        `**Moderator**: ${interaction.user.username}`,
        `**Reason**: ${reason ?? "No reason provided"}`
      ].join("\n"))
      .setThumbnail(user.displayAvatarURL())
      .setFooter({ text: `User ID: ${user.id}` })
      .setColor(genColor(0));

    const logChannel = await (await getSettingsTable(this.db))
      ?.get(`${interaction.guild.id}.logChannel`)
      .then((channel: string | null) => channel ?? null)
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

    const dmChannel = (await user.createDM().catch(() => null)) as DMChannel | null;
    if (dmChannel) await dmChannel.send({ embeds: [embedDM] });
    await selectedMember.ban({ reason: reason ?? undefined });
    await interaction.reply({ embeds: [embed] });
  }
}
