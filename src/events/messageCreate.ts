import { EmbedBuilder, type TextChannel, type Message } from "discord.js";
import { pathToFileURL } from "url";
import { join } from "path";
import { readdirSync } from "fs";
import { genColor } from "../utils/colorGen";
import { get } from "../utils/database/settings";
import { getLevel, setLevel } from "../utils/database/levelling";
import { get as getLevelRewards } from "../utils/database/levelRewards";

export default {
  name: "messageCreate",
  event: class MessageCreate {
    async run(message: Message) {
      const author = message.author;
      const guild = message.guild;

      // Easter egg handler
      if (author.bot) return;
      if (guild?.id !== "903852579837059113") return;
      const eventsPath = join(process.cwd(), "src", "events", "easterEggs");

      for (const easterEggFile of readdirSync(eventsPath)) {
        const msg = await import(pathToFileURL(join(eventsPath, easterEggFile)).toString());
        new msg.default().run(message, ...message.content);
      }

      // Levelling
      const levelChannelId = get(guild.id, "levelling.channel");
      if (!levelChannelId) return;
      if (!get(guild.id, "levelling.enabled")) return;

      const expPerMessage = 2;
      const baseExpForNewLevel = 2 * 50;
      const difficultyMultiplier = 1.25;

      const [exp, level] = getLevel(guild.id, author.id);
      const [globalExp, globalLevel] = getLevel("0", author.id);
      const expUntilLevelup = Math.floor(baseExpForNewLevel * difficultyMultiplier * (level + 1));
      const newLevelData = { level: level ?? 0, exp: (exp ?? 0) + expPerMessage };
      const newLevelDataGlobal = { level: globalLevel ?? 0, exp: (globalExp ?? 0) + expPerMessage };

      if (!(exp >= expUntilLevelup - 1)) {
        setLevel(0, author.id, newLevelDataGlobal.level, newLevelDataGlobal.exp);
        return setLevel(guild.id, author.id, newLevelDataGlobal.level, newLevelDataGlobal.exp);
      } else if (exp >= expUntilLevelup - 1) {
        let leftOverExp = exp - expUntilLevelup;
        if (leftOverExp < 0) leftOverExp = 0;

        newLevelData.level = level + 1;
        newLevelData.exp = leftOverExp ?? 0;
        setLevel(guild.id, author.id, newLevelData.level, newLevelData.exp);
      }

      if (exp >= Math.floor(baseExpForNewLevel * difficultyMultiplier * (globalLevel + 1)) - 1) {
        let leftOverExpGlobal = exp - expUntilLevelup;
        if (leftOverExpGlobal < 0) leftOverExpGlobal = 0;

        newLevelDataGlobal.level = level + 1;
        newLevelDataGlobal.exp = leftOverExpGlobal + 1;
        setLevel(0, author.id, newLevelDataGlobal.level, newLevelDataGlobal.exp);
      }

      const embed = new EmbedBuilder()
        .setAuthor({ name: author.displayName, iconURL: author.avatarURL() || undefined })
        .setTitle("⚡ • Level Up!")
        .setDescription([
          `**Congratulations, ${author.displayName}**!`,
          `You made it to **level ${level + 1}**`,
          `You need ${Math.floor(baseExpForNewLevel * difficultyMultiplier * (level + 2))} EXP to level up again.`
        ].join("\n"))
        .setThumbnail(author.avatarURL())
        .setTimestamp()
        .setColor(genColor(200));

      (guild.channels.cache.get(`${levelChannelId}`) as TextChannel).send({ embeds: [embed], content: `<@${author.id}>` });
      for (const { level, roleID } of getLevelRewards(guild.id)) {
        const role = guild.roles.cache.get(`${roleID}`);
        const authorRoles = (await guild.members.fetch()).get(author.id)?.roles;

        if (level >= level) {
          await authorRoles?.add(role);
          continue;
        }

        await authorRoles?.remove(role);
      }
    }
  }
}
