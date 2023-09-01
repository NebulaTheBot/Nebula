import { ColorResolvable, EmbedBuilder, TextChannel, type Message } from "discord.js";
import Vibrant from "node-vibrant";
import sharp from "sharp";
import { genColor, genRGBColor } from "../utils/colorGen.js";
import database, { getLevelingTable, getSettingsTable } from "../utils/database.js";
import { Reward } from "../commands/settings/leveling/rewards.js";

export const EXP_PER_MESSAGE = 10; // 10 exp per message
export const BASE_EXP_FOR_NEW_LEVEL = 10 * 100; // 1000 messages to level up
export const DIFFICULTY_MULTIPLIER = 1.25; // 1.25x harder to level up each level

export default {
  name: "messageCreate",
  event: class MessageCreate {
    db = null;

    async run(message: Message) {
      if (!this.db) this.db = await database();
      const db = this.db;
      const levelingTable = await getLevelingTable(db);
      const settingsTable = await getSettingsTable(db);
      const target = message.author;

      if (message.author.bot) return;

      const levelingEnabled = await settingsTable?.get(`${message.guild.id}.leveling.enabled`).then(
        (enabled) => !!enabled
      ).catch(() => false);

      if (!levelingEnabled) return;

      const { exp, levels } = await levelingTable?.get(`${message.guild.id}.${target.id}`).catch(() => {
        return {
          exp: 0,
          levels: 0
        };
      });
      const { exp: expGlobal, levels: levelsGlobal } = await levelingTable?.get(`global.${target.id}`).then(
        (data) => {
          if (!data) return {
            exp: 0,
            levels: 0
          };
          return {
            exp: Number(data.exp),
            levels: Number(data.levels)
          };
        }
      ).catch(() => {
        return {
          exp: 0,
          levels: 0
        };
      });

      const expUntilLevelup = Math.floor(BASE_EXP_FOR_NEW_LEVEL * DIFFICULTY_MULTIPLIER * (levels + 1));
      const expUntilLevelupGlobal = Math.floor(BASE_EXP_FOR_NEW_LEVEL * DIFFICULTY_MULTIPLIER * (levelsGlobal + 1));
      const expUntilNextLevelup = Math.floor(BASE_EXP_FOR_NEW_LEVEL * DIFFICULTY_MULTIPLIER * (levels + 2));

      const newLevelData = {
        levels: levels ?? 0,
        exp: (exp ?? 0) + EXP_PER_MESSAGE
      };

      const newLevelDataGlobal = {
        levels: levelsGlobal ?? 0,
        exp: (expGlobal ?? 0) + EXP_PER_MESSAGE
      };

      if (!(exp >= expUntilLevelup - 1)) {
        await levelingTable.set(`global.${target.id}`, newLevelDataGlobal);
        return await levelingTable.set(`${message.guild.id}.${target.id}`, newLevelDataGlobal);
      } else if (exp >= expUntilLevelup - 1) {
        let leftOverExp = exp - expUntilLevelup;
        if (leftOverExp < 0) leftOverExp = 0;

        newLevelData.levels = levels + 1;
        newLevelData.exp = leftOverExp ?? 0;

        await levelingTable.set(`${message.guild.id}.${target.id}`, newLevelData);
      }

      if (exp >= expUntilLevelupGlobal - 1) {
        let leftOverExpGlobal = exp - expUntilLevelup;
        if (leftOverExpGlobal < 0) leftOverExpGlobal = 0;

        newLevelDataGlobal.levels = levels + 1;
        newLevelDataGlobal.exp = leftOverExpGlobal + 1;

        await levelingTable.set(`global.${target.id}`, newLevelDataGlobal);
      }

      // Check if there's a level up channel
      const levelChannelId = await settingsTable?.get(`${message.guild.id}.leveling.channel`).then(
        (channelId) => String(channelId)
      ).catch(() => null);
      if (!levelChannelId) return;
      const levelChannel = message.guild.channels.cache.get(levelChannelId) as TextChannel

      // Level up embed
      const leveledEmbed = new EmbedBuilder()
        .setTitle("⚡ • Level Up!")
        .setDescription([
          `**Congratulations <@${target.id}>**!`,
          `You made it to **level ${levels + 1}**`,
          `You need ${expUntilNextLevelup} exp to level up again.`
        ].join("\n"))
        .setAuthor({
          name: target.displayName,
          url: target.avatarURL()
        })
        .setThumbnail(target.avatarURL())
        .setColor(genColor(200))
        .setTimestamp();

      // Get vibrant color
      try {
        const imageBuffer = await (await fetch(target.avatarURL())).arrayBuffer();
        const image = sharp(imageBuffer).toFormat("jpg");
        const { r, g, b } = (await new Vibrant(await image.toBuffer()).getPalette()).Vibrant;
        leveledEmbed.setColor(genRGBColor(r, g, b) as ColorResolvable);
      } catch { }

      // Sending the level up
      levelChannel.send({
        embeds: [leveledEmbed],
        content: `<@${target.id}>`
      });

      // Checking if there is a level reward
      const levelRewards = await settingsTable?.get(`${message.guild.id}.leveling.rewards`).then(
        (rewards) => rewards as Reward[] ?? [] as Reward[]
      ).catch(() => [] as Reward[]);
      const members = await message.guild.members.fetch();
      for (const { level, roleId } of levelRewards) {
        const role = message.guild.roles.cache.get(roleId);

        if (levels >= level) {
          await members.get(target.id)?.roles.add(role);
          continue;
        }

        await members.get(target.id)?.roles.remove(role);
      }
    }
  }
}
