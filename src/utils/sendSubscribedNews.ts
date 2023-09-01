import { DMChannel, EmbedBuilder, Guild } from "discord.js";
import database, { getNewsTable } from "./database.js";
import { genColor } from "./colorGen.js";

export type News = {
  title: string
  body: string
  imageURL: string
  author: string
  authorPfp: string
  createdAt: string
  updatedAt: string
  messageId?: string
}

export default async function sendSubscribedNews(guild: Guild, news: News) {
  const db = await database();
  const newsTable = await getNewsTable(db);

  const subscriptions = await newsTable.get(`${guild.id}.subscriptions`).then(
    (subscriptions) => subscriptions as string[] ?? [] as string[]
  ).catch(() => [] as string[]);
  const members = await guild.members.fetch();
  const subscribed = members.filter((member) => subscriptions.includes(member.id));
  const memberDMs = (await Promise.all(subscribed.map((member) => member.createDM().catch(() => null)))) as DMChannel[] | null;;
  const memberDMsOpen = memberDMs.filter((dm) => dm !== null);

  const newsEmbed = new EmbedBuilder()
    .setAuthor({ name: news.author, iconURL: news.authorPfp ?? null })
    .setTitle(news.title)
    .setDescription(news.body)
    .setImage(news.imageURL || null)
    .setTimestamp(parseInt(news.updatedAt))
    .setFooter({ text: `Latest news from ${guild.name}` })
    .setColor(genColor(200));

  await Promise.all(memberDMsOpen.map((dm) => dm.send({ embeds: [newsEmbed] }).catch(() => null)));
  return;
}
