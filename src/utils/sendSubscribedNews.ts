import { DMChannel, EmbedBuilder, Guild } from "discord.js";
import { genColor } from "./colorGen";

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

export async function sendSubscribedNews(guild: Guild, news: News) {
  const subscriptions = await (await getNewsTable(await database()))
    .get(`${guild.id}.subscriptions`)
    .then((subscriptions: string[]) => subscriptions as string[] ?? [] as string[]);

  const subscribed = (await guild.members.fetch()).filter(member => subscriptions.includes(member.id));
  const memberDMs = (await Promise.all(subscribed.map(member => member.createDM().catch(() => null)))) as DMChannel[] | null;
  const memberDMsOpen = memberDMs?.filter(dm => dm !== null);
  const embed = new EmbedBuilder()
    .setAuthor({ name: news.author, iconURL: news.authorPfp ?? null })
    .setTitle(news.title)
    .setDescription(news.body)
    .setImage(news.imageURL || null)
    .setTimestamp(parseInt(news.updatedAt))
    .setFooter({ text: `Latest news from ${guild.name}` })
    .setColor(genColor(200));

  await Promise.all(memberDMsOpen?.map(dm => dm.send({ embeds: [embed] }).catch(() => null)));
  return;
}
