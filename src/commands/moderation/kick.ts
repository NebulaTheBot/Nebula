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

export default class Kick {
  data: SlashCommandSubcommandBuilder;
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("kick")
      .setDescription("Kicks a user.")
      .addUserOption(user =>
        user.setName("user").setDescription("The user that you want to kick.").setRequired(true)
      )
      .addStringOption(string =>
        string.setName("reason").setDescription("The reason for the kick.")
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user")!;
    const guild = interaction.guild!;
    const members = guild.members.cache!;
    const member = members.get(interaction.member?.user.id!)!;
    const target = members.get(user.id)!;
    const name = user.displayName;

    if (!member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return errorEmbed(
        interaction,
        "You can't execute this command.",
        "You need the **Kick Members** permission."
      );

    if (target === member) return errorEmbed(interaction, "You can't kick yourself.");
    if (target.user.id === interaction.client.user.id)
      return errorEmbed(interaction, "You can't kick Sokora.");

    if (!target.manageable)
      return errorEmbed(
        interaction,
        `You can't kick ${name}.`,
        "The member has a higher role position than Sokora."
      );

    if (member.roles.highest.position < target.roles.highest.position)
      return errorEmbed(
        interaction,
        `You can't kick ${name}.`,
        "The member has a higher role position than you."
      );

    const reason = interaction.options.getString("reason");
    const embed = new EmbedBuilder()
      .setAuthor({ name: `•  ${name}`, iconURL: user.displayAvatarURL() })
      .setTitle(`Kicked ${name}.`)
      .setDescription(
        [
          `**Moderator**: ${interaction.user.displayName}`,
          `**Reason**: ${reason ?? "No reason provided"}`
        ].join("\n")
      )
      .setThumbnail(user.displayAvatarURL())
      .setFooter({ text: `User ID: ${user.id}` })
      .setColor(genColor(100));

    const logChannel = getSetting(guild.id, "moderation.channel");
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

    await target.kick(reason ?? undefined);
    await interaction.reply({ embeds: [embed] });

    const dmChannel = (await user.createDM().catch(() => null)) as DMChannel | null;
    if (!dmChannel) return;
    if (user.bot) return;
    await dmChannel.send({
      embeds: [embed.setTitle("You got kicked.").setColor(genColor(0))]
    });
  }
}
