import {
  SlashCommandSubcommandBuilder, EmbedBuilder, DMChannel,
  type ChatInputCommandInteraction
} from "discord.js";
import { genColor } from "../../utils/colorGen.js";
import { getNewsTable } from "../../utils/database.js";
import { QuickDB } from "quick.db";
import { errorEmbed } from "../../utils/embeds/errorEmbed.js";

type SubscriptionType = string[];

export default class Subscribe {
  data: SlashCommandSubcommandBuilder;
  db: QuickDB<any>;

  constructor(db?: QuickDB<any>) {
    this.db = db;
    this.data = new SlashCommandSubcommandBuilder()
      .setName("subscribe")
      .setDescription("Subscribe to the news of this server.");
  }

  async run(interaction: ChatInputCommandInteraction) {
    const db = this.db;
    const newsTable = await getNewsTable(db);
    const guild = interaction.guild;
    const user = interaction.user;

    let subscriptions = await newsTable
      ?.get(`${guild.id}.subscriptions`)
      .then(subscriptions => subscriptions as SubscriptionType ?? [] as SubscriptionType)
      .catch(() => []) as SubscriptionType;

    if (!subscriptions) subscriptions = [];

    const hasSub = subscriptions?.includes(user.id);
    const dmChannel = (await interaction.user.createDM().catch(() => null)) as DMChannel | null;

    if (!dmChannel) return await interaction.followUp({
      embeds: [errorEmbed("You need to **enable DMs from server members** to subscribe to the news.")]
    });

    await dmChannel?.send("You have updated the subscription status of \`" + guild.name + "\`.").catch(async () => {
      return await interaction.followUp({
        embeds: [errorEmbed("You need to **enable DMs from server members** to subscribe to the news.")]
      });
    });

    await newsTable[!hasSub ? "push" : "pull"](`${guild.id}.subscriptions`, user.id);

    const subscriptionEmbed = new EmbedBuilder()
      .setTitle(`✅ • ${hasSub ? "Unsubscribed" : "Subscribed"} ${hasSub ? "from" : "to"} ${guild.name}`)
      .setDescription(`You have ${hasSub ? "un" : ""}subscribed to the news of ${guild.name}.`)
      .setColor(genColor(100));

    await interaction.followUp({ embeds: [subscriptionEmbed] });
  }
}
