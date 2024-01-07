import {
  ColorResolvable,
  EmbedBuilder,
  TextChannel,
  type Message,
} from "discord.js";
import Vibrant from "node-vibrant";
import sharp from "sharp";
import { genColor, genRGBColor } from "../utils/colorGen.js";
import { get as getSetting } from "../utils/database/settings.js";
import {
  get as getLevel,
  set as setLevel,
} from "../utils/database/leveling.js";
import { get as getLevelRewards } from "../utils/database/levelRewards.js";

export const EXP_PER_MESSAGE = 10; // 10 exp per message
export const BASE_EXP_FOR_NEW_LEVEL = 10 * 100; // 1000 messages to level up
export const DIFFICULTY_MULTIPLIER = 1.25; // 1.25x harder to level up each level

export default {
  name: "messageCreate",
  event: class MessageCreate {
    async run(message: Message) {
      const target = message.author;

      if (!message.guildId || message.author.bot) return;
      if (getSetting(message.guildId, "leveling.enabled") == false) return;

      const [guildLevel, guildExp] = getLevel(
        message.guildId,
        message.author.id,
      );
      const [globalLevel, globalExp] = getLevel("0", message.author.id);

      const expUntilLevelup = Math.floor(
        BASE_EXP_FOR_NEW_LEVEL * DIFFICULTY_MULTIPLIER * (guildLevel + 1),
      );
      const expUntilLevelupGlobal = Math.floor(
        BASE_EXP_FOR_NEW_LEVEL * DIFFICULTY_MULTIPLIER * (globalLevel + 1),
      );
      const expUntilNextLevelup = Math.floor(
        BASE_EXP_FOR_NEW_LEVEL * DIFFICULTY_MULTIPLIER * (guildLevel + 2),
      );

      const newLevelData = {
        level: guildLevel ?? 0,
        exp: (guildExp ?? 0) + EXP_PER_MESSAGE,
      };

      const newLevelDataGlobal = {
        level: globalLevel ?? 0,
        exp: (globalExp ?? 0) + EXP_PER_MESSAGE,
      };

      if (!(guildExp >= expUntilLevelup - 1)) {
        setLevel(
          0,
          message.author.id,
          newLevelDataGlobal.level,
          newLevelDataGlobal.exp,
        );
        return setLevel(
          message.guildId,
          message.author.id,
          newLevelData.level,
          newLevelData.exp,
        );
      } else if (guildExp >= expUntilLevelup - 1) {
        let leftOverExp = guildExp - expUntilLevelup;
        if (leftOverExp < 0) leftOverExp = 0;

        newLevelData.level = guildLevel + 1;
        newLevelData.exp = leftOverExp ?? 0;

        setLevel(
          message.guildId,
          message.author.id,
          newLevelData.level,
          newLevelData.exp,
        );
      }

      if (guildExp >= expUntilLevelupGlobal - 1) {
        let leftOverExpGlobal = guildExp - expUntilLevelup;
        if (leftOverExpGlobal < 0) leftOverExpGlobal = 0;

        newLevelDataGlobal.level = guildLevel + 1;
        newLevelDataGlobal.exp = leftOverExpGlobal + 1;

        setLevel(
          0,
          message.author.id,
          newLevelDataGlobal.level,
          newLevelDataGlobal.exp,
        );
      }

      // Check if there's a level up channel
      const levelChannelId = getSetting(message.guildId, "leveling.channel");
      if (!levelChannelId) return;
      const levelChannel = message.guild?.channels.cache.get(
        levelChannelId.toString(),
      ) as TextChannel;

      // Level up embed
      const leveledEmbed = new EmbedBuilder()
        .setTitle("⚡ • Level Up!")
        .setDescription(
          [
            `**Congratulations <@${target.id}>**!`,
            `You made it to **level ${guildLevel + 1}**`,
            `You need ${expUntilNextLevelup} exp to level up again.`,
          ].join("\n"),
        )
        .setAuthor({
          name: target.displayName,
          url: target.avatarURL() ?? undefined,
        })
        .setThumbnail(target.avatarURL())
        .setColor(genColor(200))
        .setTimestamp();

      // Get vibrant color
      try {
        const imageBuffer = await (
          await fetch(target.avatarURL() as string)
        ).arrayBuffer();
        const image = sharp(imageBuffer).toFormat("jpg");
        const { r, g, b } = (
          await new Vibrant(await image.toBuffer()).getPalette()
        ).Vibrant ?? { r: 69, g: 69, b: 69 };
        leveledEmbed.setColor(genRGBColor(r, g, b) as ColorResolvable);
      } catch {}

      // Sending the level up
      levelChannel.send({
        embeds: [leveledEmbed],
        content: `<@${target.id}>`,
      });

      // Checking if there is a level reward
      const levelRewards = getLevelRewards(message.guildId);

      const members = await message.guild?.members.fetch();
      if (!members) return;
      for (const { level, role } of levelRewards) {
        const fetchedRole = message.guild?.roles.cache.get(role.toString());
        if (!fetchedRole) continue;

        if (guildLevel >= level) {
          await members.get(target.id)?.roles.add(fetchedRole);
          continue;
        }

        await members.get(target.id)?.roles.remove(fetchedRole);
      }
    }
  },
};
