import {
  SlashCommandSubcommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  type ChatInputCommandInteraction,
  ChannelType,
  Collection,
  NonThreadGuildBasedChannel,
  GuildChannel,
} from "discord.js";
import { genColor } from "../../../utils/colorGen.js";
import errorEmbed from "../../../utils/embeds/errorEmbed.js";
import { set as setSetting } from "../../../utils/database/settings.js";

export default class Channel {
  data: SlashCommandSubcommandBuilder;

  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("channel")
      .setDescription(
        "Sets the channel for level up messages (no channel = no messages).",
      )
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("The channel where level up messages are sent in."),
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;
    if (!guild) return;
    const user = interaction.user;
    const channel: GuildChannel | null =
      interaction.options.getChannel("channel");
    const member = guild.members.cache.get(user.id);
    if (!member) return;

    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return await interaction.followUp({
        embeds: [
          errorEmbed(
            "You need **Manage Server** permissions to set a channel.",
          ),
        ],
      });
    }

    if (!channel) {
      setSetting(guild.id, "leveling.channel", 0);

      return await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setTitle("✅ • Leveling Channel")
            .setDescription("Level up messages will no longer be sent.")
            .setColor(genColor(100)),
        ],
      });
    }

    if (channel?.type != ChannelType.GuildText) {
      return await interaction.followUp({
        embeds: [errorEmbed("You must provide a text channel.")],
      });
    }

    const perms = (
      await guild.channels
        .fetch()
        .then(
          (channels: Collection<string, NonThreadGuildBasedChannel>) =>
            channels as Collection<string, NonThreadGuildBasedChannel>,
        )
    )
      .get(channel.id)
      .permissionsFor(guild.members.me);
    if (!perms.has(PermissionsBitField.Flags.SendMessages)) {
      return await interaction.followUp({
        embeds: [
          errorEmbed(
            "I don't have permission to send messages in that channel.",
          ),
        ],
      });
    }

    setSetting(guild.id, "leveling.channel", parseInt(channel.id));

    await interaction.followUp({
      embeds: [
        new EmbedBuilder()
          .setTitle("✅ • Leveling Channel")
          .setDescription(
            `Level up messages will now be sent in <#${channel.id}>.`,
          )
          .setColor(genColor(100)),
      ],
    });
  }
}
