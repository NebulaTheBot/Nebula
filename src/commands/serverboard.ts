import {
  SlashCommandSubcommandBuilder, ButtonBuilder, ActionRowBuilder,
  ButtonStyle, ButtonInteraction, type ChatInputCommandInteraction
} from "discord.js";
import { quickSort } from "../utils/quickSort";
import { serverEmbed } from "../utils/embeds/serverEmbed";
import { database, getNewsTable, getServerboardTable } from "../utils/database.js";
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
    const guildsMapped = {};
    const shownGuilds = (await (await getServerboardTable(this.db)).all().catch(() => [])) as any[];

    for (const guild of interaction.client.guilds.cache.values()) {
      const shownVal = shownGuilds?.find(shown => shown?.id == guild.id)?.value?.shown;
      const isShown = shownVal == null ? null : shownVal;

      if (isShown == false) continue;
      if (isShown == null && guild?.rulesChannelId != null) continue;

      guildsMapped[guild.memberCount + ":" + guild.id] = guild;
    }

    const guildsSorted = quickSort(
      [...Object.keys(guildsMapped).map(i => Number(i.split(":")[0]))],
      [[...Object.values(guildsMapped)]],
      0,
      Object.keys(guildsMapped).length - 1
    )[1][0].reverse();
    const pages = guildsSorted.length;
    const argPage = interaction.options.getNumber("page", false);
    let page = (argPage - 1 <= 0 ? 0 : argPage - 1 > pages ? pages - 1 : argPage - 1) || 0;

    let guild = guildsSorted[page];
    let subs = await (await getNewsTable(this.db))
      ?.get(`${guild.id}.subscriptions`)
      .then((subs: string | any[]) => subs?.length > 0 ? subs as string[] : [] as string[])
      .catch(() => [] as string[]);

    let embed = await serverEmbed({
      guild, page: page + 1, pages, showInvite: true, showSubs: subs.length > 0, subs: subs.length
    });

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
    interaction.channel
      ?.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 60000 })
      .on("collect", async (interaction: ButtonInteraction) => {
        let subs;

        const subscriptions = await (await database()).table("subscriptions").all();
        switch (interaction.customId) {
          case "left":
            page--;
            if (page < 0) page = pages - 1;
            subs = subscriptions.filter((sub: { value: string[]; }) => (sub.value as string[] ?? [] as string[]).includes(guild.id));
            break;
          case "right":
            page++;
            if (page >= pages) page = 0;
            subs = subscriptions.filter((sub: { value: string[]; }) => (sub.value as string[]).includes(guild.id));
            break;
        }

        guild = guildsSorted[page];
        embed = await serverEmbed({ guild, page: page + 1, pages, showInvite: true, showSubs: subs.length > 0, subs: subs.length });

        interaction.message.edit({ embeds: [embed], components: [row] });
        interaction.deferUpdate();
      });
  }
}
