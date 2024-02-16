import {
  EmbedBuilder,
  type Role,
  type TextChannel,
  type Guild,
  type ChatInputCommandInteraction
} from "discord.js";
import { genColor } from "./colorGen";
import { get, set } from "./database/news";

export async function sendChannelNews(
  guild: Guild,
  id: string,
  interaction: ChatInputCommandInteraction
) {
  const news = get(id)!;
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

  return (guild.channels.cache.get(news.channelID ?? interaction.channel?.id) as TextChannel)
    .send({
      embeds: [embed],
      content: roleToSend ? `<@&${roleToSend.id}>` : undefined
    })
    .then(message => set(id, "messageID", message?.id!));
}
