import {
  SlashCommandSubcommandBuilder, EmbedBuilder, type ColorResolvable,
  type ChatInputCommandInteraction
} from "discord.js";
import { getLevelingTable, getSettingsTable } from "../../utils/database.js";
import { genColor, genRGBColor } from "../../utils/colorGen.js";
import { Reward } from "../settings/leveling/rewards.js";
import { QuickDB } from "quick.db";
import Vibrant from "node-vibrant";
import sharp from "sharp";

export default class UserInfo {
  data: SlashCommandSubcommandBuilder;
  db: QuickDB<any>;

  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("info")
      .setDescription("Shows your (or another user's) info.")
      .addUserOption(option => option
        .setName("user")
        .setDescription("Select the user.")
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const db = this.db;
    const settingsTable = await getSettingsTable(db);
    const levelingTable = await getLevelingTable(db);

    const user = interaction.options.getUser("user");
    const member = interaction.member;
    const guild = interaction.guild;

    const id = user ? user.id : member.user.id;
    const selectedMember = guild.members.cache.filter(member => member.user.id === id).map(user => user)[0];
    const avatarURL = selectedMember.displayAvatarURL();
    const selectedUser = selectedMember.user;

    let embed = new EmbedBuilder()
      .setAuthor({
        name: `•  ${selectedMember.nickname == null ? selectedUser.username : selectedMember.nickname}${selectedUser.discriminator == "0" ? "" : `#${selectedUser.discriminator}`}`,
        iconURL: avatarURL
      })
      .setFields(
        {
          name: selectedUser.bot === false ? "👤 • User info" : "🤖 • Bot info",
          value: [
            `**Username**: ${selectedUser.username}`,
            `**Display name**: ${selectedUser.displayName === selectedUser.username ? "*None*" : selectedUser.displayName}`,
            `**Created on** <t:${Math.round(selectedUser.createdAt.valueOf() / 1000)}:D>`,
          ].join("\n"),
        },
        {
          name: "👥 • Member info",
          value: `**Joined on** <t:${Math.round(selectedMember.joinedAt.valueOf() / 1000)}:D>`,
        }
      )
      .setFooter({ text: `User ID: ${selectedMember.id}` })
      .setThumbnail(avatarURL)
      .setColor(genColor(200));

    try {
      const imageBuffer = await (await fetch(avatarURL)).arrayBuffer();
      const image = sharp(imageBuffer).toFormat("jpg");
      const { r, g, b } = (await new Vibrant(await image.toBuffer()).getPalette()).Vibrant;
      embed.setColor(genRGBColor(r, g, b) as ColorResolvable);
    } catch { }

    const guildRoles = guild.roles.cache.filter(role => selectedMember.roles.cache.has(role.id));
    const memberRoles = [...guildRoles].sort((role1, role2) => role2[1].position - role1[1].position);
    memberRoles.pop();
    const rolesOrRole = memberRoles.length === 1 ? "role" : "roles";

    if (memberRoles.length !== 0) embed.addFields({
      name: `🎭 • ${guildRoles.filter(role => selectedMember.roles.cache.has(role.id)).size - 1} ${rolesOrRole}`,
      value: `${memberRoles
        .slice(0, 5)
        .map(role => `<@&${role[1].id}>`)
        .join(", ")}${memberRoles.length > 5 ? ` **and ${memberRoles.length - 5} more**` : ""}`,
    });

    const levelEnabled = await settingsTable
      ?.get(`${guild.id}.leveling.enabled`)
      .then(data => {
        if (!data) return false;
        return data;
      })
      .catch(() => false);

    const { exp, levels } = await levelingTable
      ?.get(`${guild.id}.${selectedMember.id}`)
      .then(data => {
        if (!data) return { exp: 0, level: 0 };
        return { exp: Number(data.exp), levels: Number(data.levels) };
      })
      .catch(() => { return { exp: 0, levels: 0 } });

    if (!exp && !levels) await levelingTable.set(`${guild.id}.${selectedMember.id}`, { levels: 0, exp: 0 });

    let rewards = [];
    let nextReward = null;
    const levelRewards = await settingsTable
      ?.get(`${interaction.guild.id}.leveling.rewards`)
      .then(data => {
        if (!data) return [] as Reward[] ?? [] as Reward[];
        return data as Reward[] ?? [] as Reward[];
      })
      .catch(() => [] as Reward[]);

    for (const { roleId, level } of levelRewards) {
      const role = await interaction.guild.roles.fetch(roleId).catch(() => {});
      const reward = { roleId, level };

      if (levels < level) {
        if (nextReward) break;
        nextReward = reward;
        break;
      }

      rewards.push(role);
    }

    const expUntilLevelup = Math.floor((2 * 50) * 1.25 * ((levels ?? 0) + 1));
    const formattedExp = exp?.toLocaleString("en-US");
    const formattedExpUntilLevelup = expUntilLevelup?.toLocaleString("en-US");

    if (levelEnabled) embed.addFields({
      name: `🎚️ • Level ${levels ?? 0}`,
      value: [
        `**${formattedExp ?? 0}**/${formattedExpUntilLevelup} exp until level up`,
        `**Next level** ${(levels ?? 0) + 1}`
      ].join("\n")
    });

    await interaction.followUp({ embeds: [embed] });
  }
}
