import {
  SlashCommandSubcommandBuilder, EmbedBuilder, PermissionsBitField,
  TextChannel, DMChannel, ChannelType,
  type Channel, type ChatInputCommandInteraction
} from "discord.js";
import { genColor } from "../../utils/colorGen.js";
import { errorEmbed } from "../../utils/embeds/errorEmbed.js";
import { getSettingsTable } from "../../utils/database.js";
import { QuickDB } from "quick.db";
import ms from "ms";

export default class Mute {
  data: SlashCommandSubcommandBuilder;
  db: QuickDB<any>;

  constructor(db: QuickDB<any>) {
    this.db = db;
    this.data = new SlashCommandSubcommandBuilder()
      .setName("mute")
      .setDescription("Mutes a user.")
      .addUserOption(user => user
        .setName("user")
        .setDescription("The user that you want to mute.")
        .setRequired(true)
      )
      .addStringOption(string => string
        .setName("duration")
        .setDescription("The duration of the mute (e.g 30m, 1d, 2h)")
        .setRequired(true)
      )
      .addStringOption(string => string
        .setName("reason")
        .setDescription("The reason for the mute.")
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user");
    const duration = interaction.options.getString("duration");
    const members = interaction.guild.members.cache;
    const member = members.get(interaction.member.user.id);
    const selectedMember = members.get(user.id);
    const name = selectedMember.nickname ?? user.username;

    if (!member.permissions.has(PermissionsBitField.Flags.MuteMembers)) return await interaction.followUp({
      embeds: [errorEmbed("You need the **Mute Members** permission to execute this command.")]
    });

    if (selectedMember === member) return await interaction.followUp({
      embeds: [errorEmbed("You can't mute yourself.")]
    });

    if (selectedMember.user.bot) return await interaction.followUp({
      embeds: [errorEmbed(`You can't mute ${name}, because it's a bot.`)]
    });

    if (!selectedMember.manageable) return await interaction.followUp({
      embeds: [errorEmbed(`You can't mute ${name}, because they have a higher role position than Nebula.`)]
    });

    if (member.roles.highest.position < selectedMember.roles.highest.position) return await interaction.followUp({
      embeds: [errorEmbed(`You can't mute ${name}, because they have a higher role position than you.`)]
    });

    if (!ms(duration) || ms(duration) > ms("28d")) return await interaction.followUp({
      embeds: [errorEmbed("The duration is invalid or is above the 28 day limit.")]
    });

    const time = new Date(Date.parse(new Date().toISOString()) + Date.parse(new Date(ms(duration)).toISOString())).toISOString();
    const embed = new EmbedBuilder()
      .setAuthor({ name: `• ${user.username}`, iconURL: user.displayAvatarURL() })
      .setTitle(`✅ • Muted ${user.username}`)
      .setDescription([
        `**Moderator**: <@${member.id}>`,
        `**Duration**: ${ms(ms(duration), { long: true })}`,
        `**Reason**: ${interaction.options.getString("reason") ?? "No reason provided"}`
      ].join("\n"))
      .setFooter({ text: `User ID: ${user.id}` })
      .setThumbnail(user.displayAvatarURL())
      .setColor(genColor(100));

    const embedDM = new EmbedBuilder()
      .setAuthor({ name: `• ${user.username}`, iconURL: user.displayAvatarURL() })
      .setTitle(`🤐 • You were muted`)
      .setDescription([
        `**Moderator**: ${member.user.username}`,
        `**Duration**: ${ms(ms(duration), { long: true })}`,
        `**Reason**: ${interaction.options.getString("reason") ?? "No reason provided"}`
      ].join("\n"))
      .setThumbnail(user.displayAvatarURL())
      .setFooter({ text: `User ID: ${user.id}` })
      .setColor(genColor(0));

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

    const dmChannel = (await user.createDM().catch(() => null)) as DMChannel | null;
    if (dmChannel) await dmChannel.send({ embeds: [embedDM] });
    await selectedMember.edit({ communicationDisabledUntil: time });
    await interaction.followUp({ embeds: [embed] });
  }
}
