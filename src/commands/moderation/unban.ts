import {
  PermissionsBitField, EmbedBuilder, SlashCommandSubcommandBuilder,
  TextChannel, DMChannel, ChannelType,
  type Channel, type ChatInputCommandInteraction
} from "discord.js";
import { genColor } from "../../utils/colorGen";
import { errorEmbed } from "../../utils/embeds/errorEmbed";
import { getSetting } from "../../utils/database/settings";

export default class Unban {
  data: SlashCommandSubcommandBuilder;
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("unban")
      .setDescription("Unbans a user.")
      .addStringOption(string => string
        .setName("id")
        .setDescription("The ID of the user that you want to unban.")
        .setRequired(true)
    );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const id = interaction.options.getString("id")!;
    const guild = interaction.guild!;
    const member = guild.members.cache.get(interaction.member?.user.id!)!;
    const target = (guild.bans.cache.map(user => user.user)).filter(user => user.id === id)[0]!;

    if (!member.permissions.has(PermissionsBitField.Flags.BanMembers)) return await interaction.reply({
      embeds: [errorEmbed("You need the **Ban Members** permission to execute this command.")]
    });

    if (target == undefined) return await interaction.reply({
      embeds: [errorEmbed("You can't unban this user because they were never banned.")]
    });

    const embed = new EmbedBuilder()
      .setAuthor({ name: target.username, iconURL: target.displayAvatarURL() })
      .setTitle(`✅ • Unbanned ${target.username}`)
      .setDescription(`**Moderator**: ${interaction.user.username}`)
      .setThumbnail(target.displayAvatarURL())
      .setFooter({ text: `User ID: ${id}` })
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

    await guild.members.unban(id);
    const dmChannel = (await target.createDM().catch(() => null)) as DMChannel | null;
    if (dmChannel) await dmChannel.send({ embeds: [embed.setTitle("🤝 • You were unbanned")] });
    await interaction.reply({ embeds: [embed] });
  }
}
