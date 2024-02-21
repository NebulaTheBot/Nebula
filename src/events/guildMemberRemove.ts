import {
  EmbedBuilder,
  type Client,
  type GuildMember,
  type TextChannel,
  type ColorResolvable
} from "discord.js";
import { genColor, genRGBColor } from "../utils/colorGen";
import { getSetting } from "../utils/database/settings";
import Vibrant from "node-vibrant";
import sharp from "sharp";

export default {
  name: "guildMemberRemove",
  event: class GuildMemberRemove {
    client: Client;
    constructor(client: Client) {
      this.client = client;
    }

    async run(member: GuildMember) {
      const guildID = member.guild.id;
      const id = getSetting(guildID, "welcome.channel");
      if (!id) return;
      const channel = (await member.guild.channels.cache
        .find(channel => channel.id === id)
        ?.fetch()) as TextChannel;

      let text = getSetting(guildID, "welcome.goodbyeText");
      if (text?.includes("(username)"))
        text = text.replaceAll("(username)", member.user.displayName);

      if (text?.includes("(usercount)"))
        text = text.replaceAll("(usercount)", `${member.guild.memberCount}`);

      const avatarURL = member.displayAvatarURL();
      const embed = new EmbedBuilder()
        .setAuthor({ name: `•  ${member.user.displayName}`, iconURL: avatarURL })
        .setTitle("🙋‍♂️  •  Goodbye!")
        .setDescription(text ?? `**@${member.user.username}** has left the server 😥`)
        .setFooter({ text: `User ID: ${member.id}` })
        .setThumbnail(avatarURL)
        .setColor(genColor(200));

      try {
        const imageBuffer = await (await fetch(avatarURL)).arrayBuffer();
        const image = sharp(imageBuffer).toFormat("jpg");
        const { r, g, b } = (await new Vibrant(await image.toBuffer()).getPalette()).Vibrant!;
        embed.setColor(genRGBColor(r, g, b) as ColorResolvable);
      } catch {}

      await channel.send({ embeds: [embed] });
    }
  }
};
