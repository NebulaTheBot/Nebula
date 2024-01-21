import {
  SlashCommandSubcommandBuilder, EmbedBuilder, PermissionsBitField,
  TextChannel, DMChannel, ChannelType,
  type Channel, type ChatInputCommandInteraction
} from "discord.js";
import { genColor } from "../../utils/colorGen";
import { errorEmbed } from "../../utils/embeds/errorEmbed";
import { getSetting } from "../../utils/database/settings";

export default class Ban {
  data: SlashCommandSubcommandBuilder;
  constructor() {
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
    const user = interaction.options.getUser("user")!;
    const guild = interaction.guild!;
    const members = guild.members.cache;
    const member = members.get(interaction.member?.user.id!)!;
    const target = members.get(user.id)!;
    const name = user.displayName;

    if (!member.permissions.has(PermissionsBitField.Flags.BanMembers)) return await interaction.reply({
      embeds: [errorEmbed("You need the **Ban Members** permission to execute this command.")]
    });

    if (target === member) return await interaction.reply({ embeds: [errorEmbed("You can't ban yourself.")] });

    if (target.user.id === interaction.client.user.id) return await interaction.reply({
      embeds: [errorEmbed("You can't ban Nebula.")]
    });

    if (!target.manageable) return await interaction.reply({
      embeds: [errorEmbed(`You can't ban ${name}`, "The member has a higher role position than Nebula.")]
    });

    if (member.roles.highest.position < target.roles.highest.position) return await interaction.reply({
      embeds: [errorEmbed(`You can't ban ${name}`, "The member has a higher role position than you.")]
    });

    const reason = interaction.options.getString("reason");
    const embed = new EmbedBuilder()
      .setAuthor({ name: `• ${name}`, iconURL: user.displayAvatarURL() })
      .setTitle(`✅ • Banned ${name}`)
      .setDescription([
        `**Moderator**: ${interaction.user.displayName}`,
        `**Reason**: ${reason ?? "No reason provided"}`
      ].join("\n"))
      .setThumbnail(user.displayAvatarURL())
      .setFooter({ text: `User ID: ${user.id}` })
      .setColor(genColor(100));

    const logChannel = getSetting(guild.id, "log.channel");
    if (logChannel) {
      const channel = await guild.channels.cache
        .get(`${logChannel}`)
        ?.fetch()
        .then((channel: Channel) => {
          if (channel.type != ChannelType.GuildText) return null;
          return channel as TextChannel;
        })
        .catch(() => null);

      if (channel) await channel.send({ embeds: [embed] });
    }

    await target.ban({ reason: reason ?? undefined });
    const dmChannel = (await user.createDM().catch(() => null)) as DMChannel | null;
    if (dmChannel) await dmChannel.send({ embeds: [embed.setTitle("🔨 • You were banned").setColor(genColor(0))] });
    await interaction.reply({ embeds: [embed] });
  }
}
