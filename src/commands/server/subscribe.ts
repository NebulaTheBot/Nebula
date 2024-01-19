import { SlashCommandSubcommandBuilder, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { genColor } from "../../utils/colorGen";

export default class Subscribe {
  data: SlashCommandSubcommandBuilder;
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("subscribe")
      .setDescription("Subscribe to the news of this server.");
  }

  async run(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild!;
    let subscriptions = await newsTable
      ?.get(`${guild.id}.subscriptions`)
      .then(subscriptions => subscriptions as string[] ?? [] as string[])
      .catch(() => []) as string[];

    if (!subscriptions) subscriptions = [];
    const hasSub = subscriptions?.includes(interaction.user.id);
    await newsTable[!hasSub ? "push" : "pull"](`${guild.id}.subscriptions`, interaction.user.id);

    const embed = new EmbedBuilder()
      .setTitle(`✅ • ${hasSub ? "Unsubscribed" : "Subscribed"} ${hasSub ? "from" : "to"} ${guild.name}`)
      .setDescription(`You have ${hasSub ? "un" : ""}subscribed to the news of ${guild.name}.`)
      .setColor(genColor(100));

    await interaction.reply({ embeds: [embed] });
  }
}
