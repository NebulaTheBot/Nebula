import {
  EmbedBuilder, type Client, type GuildMember,
  type TextChannel, type ColorResolvable
} from "discord.js";
import { genColor, genRGBColor } from "../utils/colorGen.js";
import Vibrant from "node-vibrant";
import sharp from "sharp";

export default {
  name: "guildMemberAdd",
  event: class GuildMemberAdd {
    client: Client;

    constructor(client: Client) {
      this.client = client;
    }

    async run(member: GuildMember) {
      const id = "1079612083307548704";
      const channel = await member.guild.channels.cache.find(channel => channel.id === id).fetch() as TextChannel;
      const avatarURL = member.displayAvatarURL();

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `•  ${member.nickname == null ? member.user.username : member.nickname}`,
          iconURL: avatarURL
        })
        .setTitle("Welcome!")
        .setDescription(`Enjoy your stay in **${member.guild.name}**!`)
        .setFooter({ text: `User ID: ${member.id}` })
        .setThumbnail(avatarURL)
        .setColor(genColor(200));

      try {
        const imageBuffer = await (await fetch(avatarURL)).arrayBuffer();
        const image = sharp(imageBuffer).toFormat("jpg");
        const { r, g, b } = (await new Vibrant(await image.toBuffer()).getPalette()).Vibrant;
        embed.setColor(genRGBColor(r, g, b) as ColorResolvable);
      } catch {}

      await channel.send({ embeds: [embed] });
    }
  }
}
