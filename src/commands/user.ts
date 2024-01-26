import {
  SlashCommandSubcommandBuilder,
  EmbedBuilder,
  type ColorResolvable,
  type ChatInputCommandInteraction
} from "discord.js";
import { genColor, genRGBColor } from "../utils/colorGen";
import { get as getLevelRewards } from "../utils/database/levelRewards";
import { getSetting } from "../utils/database/settings";
import { getLevel, setLevel } from "../utils/database/levelling";
import Vibrant from "node-vibrant";
import sharp from "sharp";

export default class User {
  data: SlashCommandSubcommandBuilder;
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("user")
      .setDescription("Shows your (or another user's) info.")
      .addUserOption(user => user.setName("user").setDescription("Select the user."));
  }

  async run(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild!;
    const user = interaction.options.getUser("user");
    const id = user ? user.id : interaction.member?.user.id;
    const target = guild.members.cache
      .filter(member => member.user.id === id)
      .map(user => user)[0]!;
    const selectedUser = target.user!;

    let embed = new EmbedBuilder()
      .setAuthor({
        name: `•  ${target.nickname == null ? selectedUser.username : target.nickname}${
          selectedUser.discriminator == "0" ? "" : `#${selectedUser.discriminator}`
        }`,
        iconURL: target.displayAvatarURL()
      })
      .setFields(
        {
          name: selectedUser?.bot === false ? "👤 • User info" : "🤖 • Bot info",
          value: [
            `**Username**: ${selectedUser.username}`,
            `**Display name**: ${
              selectedUser.displayName === selectedUser.username
                ? "*None*"
                : selectedUser.displayName
            }`,
            `**Created on** <t:${Math.round(selectedUser.createdAt.valueOf() / 1000)}:D>`
          ].join("\n"),
          inline: true
        },
        {
          name: "👥 • Member info",
          value: `**Joined on** <t:${Math.round(target.joinedAt?.valueOf()! / 1000)}:D>`,
          inline: true
        }
      )
      .setFooter({ text: `User ID: ${target.id}` })
      .setThumbnail(target.displayAvatarURL()!)
      .setColor(genColor(200));

    try {
      const imageBuffer = await (await fetch(target.displayAvatarURL()!)).arrayBuffer();
      const image = sharp(imageBuffer).toFormat("jpg");
      const { r, g, b } = (await new Vibrant(await image.toBuffer()).getPalette()).Vibrant!;
      embed.setColor(genRGBColor(r, g, b) as ColorResolvable);
    } catch {}

    if (getSetting(`${guild.id}`, "levelling.enabled")) {
      const [guildExp, guildLevel] = getLevel(`${guild.id}`, `${target.id}`)!;
      if (!guildExp && !guildLevel) setLevel(`${guild.id}`, `${target.id}`, 0, 0);

      const formattedExpUntilLevelup = Math.floor(
        100 * 1.25 * ((guildLevel ?? 0) + 1)
      )?.toLocaleString("en-US");
      let rewards = [];
      let nextReward;

      for (const { roleID, level } of getLevelRewards(`${guild.id}`)) {
        if (guildLevel < level) {
          if (nextReward) break;
          nextReward = { roleID, level };
          break;
        }

        rewards.push(await guild.roles.fetch(`${roleID}`)?.catch(() => {}));
      }

      embed.addFields({
        name: `⚡ • Level ${guildLevel ?? 0}`,
        value: [
          `**${guildExp.toLocaleString("en-US") ?? 0}/${formattedExpUntilLevelup}** EXP`,
          `**Next level**: ${(guildLevel ?? 0) + 1}`,
          `${
            rewards.length > 0
              ? rewards.map(reward => `<@&${reward?.id}>`).join(" ")
              : "*No rewards unlocked*"
          }`
        ].join("\n")
      });
    }

    const guildRoles = guild.roles.cache.filter(role => target.roles.cache.has(role.id))!;
    const memberRoles = [...guildRoles].sort(
      (role1, role2) => role2[1].position - role1[1].position
    );
    memberRoles.pop();

    if (memberRoles.length !== 0)
      embed.addFields({
        name: `🎭 • ${guildRoles.filter(role => target.roles.cache.has(role.id)).size! - 1} ${
          memberRoles.length === 1 ? "role" : "roles"
        }`,
        value: `${memberRoles
          .slice(0, 5)
          .map(role => `<@&${role[1].id}>`)
          .join(", ")}${memberRoles.length > 5 ? ` **and ${memberRoles.length - 5} more**` : ""}`
      });

    await interaction.reply({ embeds: [embed] });
  }
}
