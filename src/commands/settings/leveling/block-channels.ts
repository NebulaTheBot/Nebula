import {
  SlashCommandSubcommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  type ChatInputCommandInteraction,
  ChannelType,
  Channel,
} from "discord.js";
import { genColor } from "../../../utils/colorGen.js";
import {
  add,
  list as listBlockedChannels,
  remove,
} from "../../../utils/database/levelBlockedChannels.js";
import errorEmbed from "../../../utils/embeds/errorEmbed.js";

export default class BlockChannels {
  data: SlashCommandSubcommandBuilder;

  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("block-channels")
      .setDescription(
        "Toggles blocked channels for leveling, no options = view blocked.",
      )
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("A channel to toggle blocked status in."),
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild || !interaction.guildId) return;

    const member = interaction.guild.members.cache.get(interaction.user.id);
    if (!member?.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return await interaction.followUp({
        embeds: [
          errorEmbed(
            "You need **Manage Server** permissions to set a channel.",
          ),
        ],
      });
    }

    const channel = interaction.options.getChannel("channel") as Channel | null;
    let list = listBlockedChannels(interaction.guildId);

    if (!channel) {
      // List blocked channels
      if (list.length == 0)
        return await interaction.followUp({
          embeds: [errorEmbed("There are no level blocked channel yet.")],
        });

      return await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setTitle("📃 • Blocked Leveling Channels")
            .setDescription(`${list.map((id) => `- <#${id}>`).join("\n")}`)
            .setColor(genColor(100)),
        ],
      });
    }

    if (channel.type != ChannelType.GuildText) {
      return await interaction.followUp({
        embeds: [errorEmbed("You must provide a text channel.")],
      });
    }

    const isBlocked = list.includes(parseInt(channel.id));
    isBlocked
      ? remove(interaction.guildId, channel.id)
      : add(interaction.guildId, channel.id);

    await interaction.followUp({
      embeds: [
        new EmbedBuilder()
          .setTitle("✅ • Blocked Leveling Channels")
          .setDescription(
            isBlocked
              ? `Unblocked <#${channel.id}>.`
              : `Blocked <#${channel.id}>.`,
          )
          .setColor(genColor(100)),
      ],
    });
  }
}
