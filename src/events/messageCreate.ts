import { EmbedBuilder, TextChannel, type Message } from "discord.js";
import { pathToFileURL } from "url";
import { join } from "path";
import { readdirSync } from "fs";
import { genColor } from "../utils/colorGen.js";
import { database, getLevelingTable, getSettingsTable } from "../utils/database.js";
import { Reward } from "../commands/settings/leveling/rewards.js";

export default {
  name: "messageCreate",
  event: class MessageCreate {
    db = null;

    async run(message: Message) {
      // Easter egg handler
      if (message.author.bot) return;
      if (message.guildId !== "903852579837059113") return;
      const eventsPath = join(process.cwd(), "src", "events", "easterEggs");

      for (const easterEggFile of readdirSync(eventsPath)) {
        const msg = await import(pathToFileURL(join(eventsPath, easterEggFile)).toString());
        new msg.default().run(message, ...message.content);
      }

      // Levelling
      if (!this.db) this.db = await database();
      const db = this.db;
      const levelingTable = await getLevelingTable(db);
      const settingsTable = await getSettingsTable(db);
      const target = message.author;
      const expPerMessage = 2;
      const baseExpForNewLevel = 2 * 50;
      const difficultyMultiplier = 1.25;

      if (message.author.bot) return;

      const levelingEnabled = await settingsTable
        ?.get(`${message.guild.id}.leveling.enabled`)
        .then(enabled => !!enabled)
        .catch(() => false);

      if (!levelingEnabled) return;

      const { exp, levels } = await levelingTable
        ?.get(`${message.guild.id}.${target.id}`)
        .catch(() => { return { exp: 0, levels: 0 } });

      const { exp: expGlobal, levels: levelsGlobal } = await levelingTable
        ?.get(`global.${target.id}`)
        .then(data => {
          if (!data) return { exp: 0, levels: 0 };
          return { exp: Number(data.exp), levels: Number(data.levels) };
        })
        .catch(() => { return { exp: 0, levels: 0 } });

      const expUntilLevelup = Math.floor(baseExpForNewLevel * difficultyMultiplier * (levels + 1));
      const expUntilLevelupGlobal = Math.floor(baseExpForNewLevel * difficultyMultiplier * (levelsGlobal + 1));
      const expUntilNextLevelup = Math.floor(baseExpForNewLevel * difficultyMultiplier * (levels + 2));

      const newLevelData = { levels: levels ?? 0, exp: (exp ?? 0) + expPerMessage };
      const newLevelDataGlobal = { levels: levelsGlobal ?? 0, exp: (expGlobal ?? 0) + expPerMessage };

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

      const levelChannelId = await settingsTable
        ?.get(`${message.guild.id}.leveling.channel`)
        .then(channelId => String(channelId))
        .catch(() => null);

      if (!levelChannelId) return;
      const levelChannel = message.guild.channels.cache.get(levelChannelId) as TextChannel;

      const leveledEmbed = new EmbedBuilder()
        .setAuthor({ name: target.displayName, iconURL: target.avatarURL() })
        .setTitle("⚡ • Level Up!")
        .setDescription([
          `**Congratulations <@${target.id}>**!`,
          `You made it to **level ${levels + 1}**`,
          `You need ${expUntilNextLevelup} exp to level up again.`
        ].join("\n"))
        .setThumbnail(target.avatarURL())
        .setTimestamp()
        .setColor(genColor(200));

      levelChannel.send({ embeds: [leveledEmbed], content: `<@${target.id}>` });

      const levelRewards = await settingsTable
        ?.get(`${message.guild.id}.leveling.rewards`)
        .then(rewards => rewards as Reward[] ?? [] as Reward[])
        .catch(() => [] as Reward[]);

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
