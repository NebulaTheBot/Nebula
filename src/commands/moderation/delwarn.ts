import {
  SlashCommandSubcommandBuilder, EmbedBuilder, PermissionsBitField,
  TextChannel, DMChannel, ChannelType,
  type Channel, type ChatInputCommandInteraction 
} from "discord.js";
import { genColor } from "../../utils/colorGen";
import { errorEmbed } from "../../utils/embeds/errorEmbed";
import { listUserModeration, removeModeration } from "../../utils/database/moderation";
import { get } from "../../utils/database/settings";

export default class Delwarn {
  data: SlashCommandSubcommandBuilder;
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("delwarn")
      .setDescription("Removes a warning from a user.")
      .addUserOption(user => user
        .setName("user")
        .setDescription("The user that you want to free from the warning.")
        .setRequired(true)
      )
      .addNumberOption(string => string
        .setName("id")
        .setDescription("The id of the warn.")
        .setRequired(true)
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user")!;
    const guild = interaction.guild!;
    const members = guild.members.cache!;
    const member = members.get(interaction.member?.user.id!);
    const selectedMember = members.get(user.id)!;
    const name = selectedMember.nickname ?? user.username;
    const id = interaction.options.getNumber("id", true);
    const warns = listUserModeration(guild.id, user.id, "WARN");
    const newWarns = warns.filter(warn => warn.id !== `${id}`);

    if (!member?.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return await interaction.followUp({
      embeds: [errorEmbed("You need the **Moderate Members** permission to execute this command.")]
    });

    if (selectedMember === member) return await interaction.followUp({
      embeds: [errorEmbed("You can't remove a warn from yourself.")]
    });

    if (newWarns.length === warns.length) return await interaction.followUp({
      embeds: [errorEmbed(`There is no warn with the id of ${id}.`)]
    });

    if (!selectedMember.manageable) return await interaction.followUp({
      embeds: [errorEmbed(`You can't unwarn ${name}, because they have a higher role position than Nebula.`)]
    });

    if (member.roles.highest.position < selectedMember.roles.highest.position) return await interaction.followUp({
      embeds: [errorEmbed(`You can't unwarn ${name}, because they have a higher role position than you.`)]
    });

    const embed = new EmbedBuilder()
      .setAuthor({ name: `• ${user.username}`, iconURL: user.displayAvatarURL() })
      .setTitle(`✅ • Removed warning`)
      .setDescription([
        `**Moderator**: ${interaction.user.username}`,
        `**Original reason**: ${newWarns.find(warn => warn.id === `${id}`)?.reason ?? "No reason provided"}`
      ].join("\n"))
      .setThumbnail(user.displayAvatarURL())
      .setFooter({ text: `User ID: ${user.id}` })
      .setColor(genColor(100));

    const logChannel = get(guild.id, "log.channel");
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

    const dmChannel = (await user.createDM().catch(() => null)) as DMChannel | null;
    if (dmChannel) await dmChannel.send({ embeds: [embed.setTitle("🤝 • Your warning was removed")] });
    removeModeration(guild.id, `${id}`);
    await interaction.followUp({ embeds: [embed] });
  }
}
