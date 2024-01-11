// TODO: SQLite Migration
import {
  SlashCommandSubcommandBuilder, EmbedBuilder, type ChatInputCommandInteraction, DMChannel
} from "discord.js";
import { genColor } from "../../utils/colorGen.js";
import { getNewsTable } from "../../utils/database.js";
import errorEmbed from "../../utils/embeds/errorEmbed.js";
import { QuickDB } from "quick.db";

type SubscriptionType = string[];

export default class Subscribe {
  data: SlashCommandSubcommandBuilder;
  db: QuickDB<any>;

  constructor(db?: QuickDB<any>) {
    this.db = db;
    this.data = new SlashCommandSubcommandBuilder()
      .setName("subscribe")
      .setDescription("Subscribe to the news of Nebula.");
  }

  async run(interaction: ChatInputCommandInteraction) {
    const db = this.db;
    const newsTable = await getNewsTable(db);;

    const user = interaction.user;

    const nebulaId = "903852579837059113";
    const subscriptions = await newsTable?.get(`${nebulaId}.subscriptions`).then(
      (subscriptions: any) => subscriptions as SubscriptionType ?? [] as SubscriptionType
    ).catch(() => [] as SubscriptionType);
    const hasSub = subscriptions?.includes(user.id);

    const dmChannel = (await interaction.user.createDM().catch(() => null)) as DMChannel | null;
    if (!dmChannel) return await interaction.followUp({
      embeds: [errorEmbed("You need to **enable DMs from server members** to subscribe to the news.")]
    });
    const sendDms = await dmChannel?.send("You have updated the subscription status of \`Nebula\`.").catch(() => null);
    if (!sendDms) {
      await newsTable.pull(`${nebulaId}.subscriptions`, user.id);
      return await interaction.followUp({
        embeds: [errorEmbed("You need to **enable DMs from server members** to subscribe to the news.")]
      });
    }

    await newsTable[!hasSub ? "push" : "pull"](`${nebulaId}.subscriptions`, user.id);

    const subscriptionEmbed = new EmbedBuilder()
      .setTitle(`✅  •  ${hasSub ? "Unsubscribed" : "Subscribed"} ${hasSub ? "from" : "to"} Nebula`)
      .setDescription(`You have ${hasSub ? "un" : ""}subscribed to the news of Nebula.`)
      .setColor(genColor(100));

    await interaction.followUp({ embeds: [subscriptionEmbed] });
  }
}
