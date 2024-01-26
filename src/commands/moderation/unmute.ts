import {
  SlashCommandSubcommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  TextChannel,
  DMChannel,
  ChannelType,
  type Channel,
  type ChatInputCommandInteraction
} from "discord.js";
import { genColor } from "../../utils/colorGen";
import { errorEmbed } from "../../utils/embeds/errorEmbed";
import { getSetting } from "../../utils/database/settings";

export default class Unmute {
  data: SlashCommandSubcommandBuilder;
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("unmute")
      .setDescription("Unmutes a user.")
      .addUserOption(user =>
        user.setName("user").setDescription("The user that you want to unmute.").setRequired(true)
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild!;
    const members = guild.members.cache!;
    if (
      !members
        .get(interaction.member!.user.id)!
        .permissions.has(PermissionsBitField.Flags.MuteMembers)
    )
      return await interaction.reply({
        embeds: [errorEmbed("You need the **Mute Members** permission to execute this command.")]
      });

    const user = interaction.options.getUser("user")!;
    if (members.get(user.id)?.communicationDisabledUntil === null)
      return await interaction.reply({
        embeds: [errorEmbed("You can't unmute this user because they were never muted.")]
      });

    const embed = new EmbedBuilder()
      .setAuthor({ name: `• ${user.username}`, iconURL: user.displayAvatarURL() })
      .setTitle(`✅ • Unmuted ${user.username}`)
      .setDescription(
        [
          `**Moderator**: ${interaction.user.username}`,
          `**Date**: <t:${Math.floor(Date.now() / 1000)}:f>`
        ].join("\n")
      )
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

    await members.get(user.id)!.edit({ communicationDisabledUntil: null });
    const dmChannel = (await user.createDM().catch(() => null)) as DMChannel | null;
    if (dmChannel) await dmChannel.send({ embeds: [embed.setTitle("🤝 • You were unmuted")] });
    await interaction.reply({ embeds: [embed] });
  }
}
