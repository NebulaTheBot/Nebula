import { EmbedBuilder, Guild, Role, TextChannel } from "discord.js";
import { genColor } from "./colorGen";
import { get } from "./database/news";

export async function sendChannelNews(guild: Guild, id: string) {
  const news = get(id);
  console.log(news);
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
    .setTimestamp(parseInt(news.updatedAt.toString()) ?? null)
    .setFooter({ text: `Latest news from ${guild.name}` })
    .setColor(genColor(200));

  if (news.imageURL !== null) embed.setImage(news.imageURL);
  return await channelToSend.send({
    embeds: [embed],
    content: roleToSend ? `<@&${roleToSend.id}>` : undefined
  });
}
