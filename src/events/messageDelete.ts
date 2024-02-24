import { codeBlock, EmbedBuilder, type Message, type TextChannel, type Channel } from "discord.js";
import { genColor } from "../utils/colorGen";
import { getSetting } from "../utils/database/settings";

export default {
  name: "messageDelete",
  event: class messageDelete {
    async run(message: Message) {
      const author = message.author;
      if (author.bot) return;

      const guild = message.guild!;
      const logUpdate = getSetting(guild.id, "moderation.logMessages");
      const logChannel = getSetting(guild.id, "moderation.channel");
      if (!logUpdate) return;
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setAuthor({ name: `•  ${author.displayName}`, iconURL: author.displayAvatarURL() })
        .setTitle("🗑️  •  Message has been deleted.")
        .addFields({
          name: "🗞️ • Deleted message",
          value: codeBlock(message.content)
        })
        .setFooter({ text: `Message ID: ${message.id}` })
        .setThumbnail(author.displayAvatarURL())
        .setColor(genColor(60));

      const channel = await guild.channels.cache
        .get(`${logChannel}`)
        ?.fetch()
        .then((channel: Channel) => {
          return channel as TextChannel;
        })
        .catch(() => null);

      if (!channel) return;
      await channel.send({ embeds: [embed] });
    }
  }
};
