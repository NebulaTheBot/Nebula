import type { Guild, ColorResolvable, EmbedBuilder, GuildMember } from "discord.js";
import Vibrant from "node-vibrant";
import sharp from "sharp";
import { genRGBColor } from "./colorGen";

export async function imageColor(embed: EmbedBuilder, guild?: Guild, member?: GuildMember) {
  try {
    const imageBuffer = await (
      await fetch(guild ? guild.iconURL()! : member?.displayAvatarURL()!)
    ).arrayBuffer();
    const image = sharp(imageBuffer).toFormat("jpg");
    const { r, g, b } = (await new Vibrant(await image.toBuffer()).getPalette()).Vibrant!;
    return embed.setColor(genRGBColor(r, g, b) as ColorResolvable);
  } catch {}
}
