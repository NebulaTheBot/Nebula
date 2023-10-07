import {
  SlashCommandSubcommandBuilder, ButtonBuilder, ActionRowBuilder,
  ButtonStyle, type ChatInputCommandInteraction, ButtonInteraction,
  CacheType, StringSelectMenuInteraction, UserSelectMenuInteraction,
  RoleSelectMenuInteraction, MentionableSelectMenuInteraction, ChannelSelectMenuInteraction
} from "discord.js";
import { quickSort } from "../../utils/quickSort.js";
import { serverEmbed } from "../../utils/embeds/serverEmbed.js";
import { database, getNewsTable, getServerboardTable } from "../../utils/database.js";
import { errorEmbed } from "../../utils/embeds/errorEmbed.js";
import { QuickDB } from "quick.db";

export default class Serverboard {
  data: SlashCommandSubcommandBuilder;
  db: QuickDB<any>;

  constructor(db?: QuickDB) {
    this.db = db;
    this.data = new SlashCommandSubcommandBuilder()
      .setName("serverboard")
      .setDescription("Shows the servers that have Nebula.")
      .addNumberOption(option => option
        .setName("page")
        .setDescription("The page you want to see.")
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const db = this.db;
    const serverbTable = await getServerboardTable(db);

    // Receiving necessary data
    const guilds = interaction.client.guilds.cache;
    const guildsMapped = {};

    // Simplifying the data
    const shownGuilds = (await serverbTable.all().catch(() => [])) as any[];
    for (const guild of guilds.values()) {
      const shownVal = shownGuilds?.find(shown => shown?.id == guild.id)?.value?.shown;
      const isShown = shownVal == null ? null : shownVal;
      const isCommunity = guild?.rulesChannelId != null;

      if (isShown == false) continue;
      if (isShown == null && !isCommunity) continue;

      const members = guild.memberCount + ":" + guild.id;
      guildsMapped[members] = guild;
    }

    if (Object.keys(guildsMapped).length == 0)
      return await interaction.followUp({
        embeds: [errorEmbed("There are no servers with Nebula in them that are shown.")]
      });

    // Sorting the data
    const sortedGuilds = quickSort(
      [...Object.keys(guildsMapped).map(i => Number(i.split(":")[0]))],
      [[...Object.values(guildsMapped)]],
      0,
      Object.keys(guildsMapped).length - 1
    );

    // Additional data
    const guildsSorted = sortedGuilds[1][0].reverse();
    const pages = guildsSorted.length;
    const argPage = interaction.options.getNumber("page", false);
    let page = (argPage - 1 <= 0 ? 0 : argPage - 1 > pages ? pages - 1 : argPage - 1) || 0;

    // Creating the embed
    const guild = guildsSorted[page];
    const subscriptionsTable = await getNewsTable(db);
    const subs = await subscriptionsTable?.get(`${guild.id}.subscriptions`).then(
      subs => subs?.length > 0 ? subs as string[] : [] as string[]
    ).catch(() => [] as string[]);

    let embed = await serverEmbed({
      guild,
      page: page + 1,
      pages,
      showInvite: true,
      showSubs: subs.length > 0,
      subs: subs.length
    });

    // Sending the embed
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("left")
        .setEmoji("1137330341472915526")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("right")
        .setEmoji("1137330125004869702")
        .setStyle(ButtonStyle.Primary)
    );
    
    await interaction.followUp({ embeds: [embed], components: [row] });

    // Listening for button events
    const collectorFilter = i => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter: collectorFilter, time: 60000 });
    collector.on("collect", async interaction => {
      page = await handlePageUpdate(interaction, page, pages, row, guildsSorted);
    });
  }
}

async function handlePageUpdate(
  interaction: StringSelectMenuInteraction<CacheType> |
    UserSelectMenuInteraction<CacheType> |
    RoleSelectMenuInteraction<CacheType> |
    MentionableSelectMenuInteraction<CacheType> |
    ChannelSelectMenuInteraction<CacheType> |
    ButtonInteraction<CacheType>, page: number, pages: number, row, guildsSorted: any[]
) {
  const db = await database();
  
  let embed;
  let guild;
  let subs;

  const subscriptionsTable = db.table("subscriptions");
  const subscriptions = await subscriptionsTable.all();

  switch (interaction.customId) {
    case "left":
      page--;
      if (page < 0) page = pages - 1;
      guild = guildsSorted[page];
      subs = subscriptions.filter(sub => (sub.value as string[] ?? [] as string[]).includes(guild.id));

      embed = await serverEmbed({ guild, page: page + 1, pages, showInvite: true, showSubs: subs.length > 0, subs: subs.length });
      break;
    case "right":
      page++;
      if (page >= pages) page = 0;
      guild = guildsSorted[page];
      subs = subscriptions.filter(sub => (sub.value as string[]).includes(guild.id));

      embed = await serverEmbed({ guild, page: page + 1, pages, showInvite: true, showSubs: subs.length > 0, subs: subs.length });
      break;
  }

  interaction.message.edit({ embeds: [embed], components: [row] });
  interaction.deferUpdate();
  return page;
}
