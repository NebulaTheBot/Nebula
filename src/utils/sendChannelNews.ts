import { EmbedBuilder, Guild, Role, TextChannel } from "discord.js";
import { genColor } from "./colorGen";
import { get } from "./database/news";

export async function sendChannelNews(guild: Guild, id: string) {
  const news = get(id);
  if (!news) return;

  const channelToSend = guild.channels.cache.get(news.channelID) as TextChannel;
  if (!channelToSend) return;

  const role = news.roleID;
  let roleToSend: Role | undefined;
  if (role) roleToSend = guild.roles.cache.get(role);

  const embed = new EmbedBuilder()
    .setAuthor({ name: news.author, iconURL: news.authorPFP })
    .setTitle(news.title)
    .setDescription(news.body)
    .setImage(news.imageURL)
    .setTimestamp(parseInt(news.updatedAt.toString()))
    .setFooter({ text: `Latest news from ${guild.name}` })
    .setColor(genColor(200));

  return await channelToSend.send({
    embeds: [embed],
    content: roleToSend ? `<@&${roleToSend.id}>` : undefined
  });
}
