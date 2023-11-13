import {
  SlashCommandSubcommandBuilder, EmbedBuilder, PermissionsBitField,
  type ChatInputCommandInteraction,
  ChannelType,
  Collection,
  NonThreadGuildBasedChannel
} from "discord.js";
import { genColor } from "../../../utils/colorGen.js";
import errorEmbed from "../../../utils/embeds/errorEmbed.js";
import { getSettingsTable } from "../../../utils/database.js";
import { QuickDB } from "quick.db";

export default class BlockChannels {
  data: SlashCommandSubcommandBuilder;
  db: QuickDB<any>;

  constructor(db?: QuickDB<any>) {
    this.db = db;
    this.data = new SlashCommandSubcommandBuilder()
      .setName("block-channels")
      .setDescription("Toggles blocked channels for leveling, no options = view blocked.")
      .addChannelOption(option => option
        .setName("channel")
        .setDescription("A channel to toggle blocked status in.")
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const db = this.db;
    const settingsTable = await getSettingsTable(db);

    const guild = interaction.guild;
    const channel = interaction.options.getChannel("channel");
    const member = interaction.guild.members.cache.get(interaction.user.id);

    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return await interaction.followUp({
        embeds: [errorEmbed("You need **Manage Server** permissions to set a channel.")]
      });
    }

    const blocked = await settingsTable?.get(`${guild.id}.leveling.blockedchannels`).then(
      blocked => blocked as any[] ?? []
    ).catch(() => []);
    if (!channel) {
      return await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setTitle("📃 • Blocked Leveling Channels")
            .setDescription(
              blocked?.length == 0 ?
                "There are no blocked channels." :
                `${blocked?.map(id => `- <#${id}>`).join("\n")}`
            )
            .setColor(genColor(100))
        ]
      });
    }

    if (channel?.type != ChannelType.GuildText) {
      return await interaction.followUp({
        embeds: [errorEmbed("You must provide a text channel.")]
      });
    }

    const perms = (await interaction.guild.channels.fetch().then(
      (channels: Collection<string, NonThreadGuildBasedChannel>) => channels as Collection<string, NonThreadGuildBasedChannel>
    )).get(channel.id)?.permissionsFor(guild.members.me);
    if (!perms.has(PermissionsBitField.Flags.SendMessages)) {
      return await interaction.followUp({
        embeds: [errorEmbed("I don't have permission to send messages in that channel.")]
      });
    }

    const isBlocked = blocked?.includes(channel.id);
    await settingsTable[isBlocked ? "pull" : "push"](`${interaction.guild.id}.leveling.blockedchannels`, channel.id);

    await interaction.followUp({
      embeds: [
        new EmbedBuilder()
          .setTitle("✅ • Blocked Leveling Channels")
          .setDescription(
            isBlocked ?
              `Unblocked <#${channel.id}>.` :
              `Blocked <#${channel.id}>.`
          )
          .setColor(genColor(100))
      ]
    });
  }
}
