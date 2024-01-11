// TODO: SQLite Migration
import {
  ColorResolvable,
  SlashCommandSubcommandBuilder,
  EmbedBuilder,
  type ChatInputCommandInteraction,
  Role,
} from "discord.js";
import { genColor, genRGBColor } from "../../utils/colorGen.js";
import Vibrant from "node-vibrant";
import sharp from "sharp";
import {
  BASE_EXP_FOR_NEW_LEVEL,
  DIFFICULTY_MULTIPLIER,
} from "../../events/leveling.js";
import errorEmbed from "../../utils/embeds/errorEmbed.js";
import { Reward } from "../settings/leveling/rewards.js";
import { get as getSetting } from "../../utils/database/settings.js";
import { get as getLevel } from "../../utils/database/leveling.js";
import { get as getRewards } from "../../utils/database/levelRewards";

export default class Level {
  data: SlashCommandSubcommandBuilder;

  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("level")
      .setDescription("Shows your (or another user's) level.")
      .addUserOption((option) =>
        option.setName("user").setDescription("Select the user."),
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild || !interaction.guildId) return;
    const target = interaction.options.getUser("user");
    const guild = interaction.guild;

    const id = target ? target.id : interaction.user.id;
    const selectedMember = guild.members.cache
      .filter((member) => member.user.id === id)
      .map((user) => user)[0];
    const avatarURL = selectedMember.displayAvatarURL();

    if (getSetting(interaction.guildId, "leveling.enabled")) {
      return await interaction.followUp({
        embeds: [errorEmbed("Leveling is disabled for this server.")],
      });
    }

    let [levels, exp] = getLevel(interaction.guildId, selectedMember.id);
    const formattedExp = exp?.toLocaleString("en-US");

    let rewards: Role[] = [];
    let nextReward = null;
    const levelRewards = getRewards(interaction.guildId);

    for (const { role, level } of levelRewards) {
      const fetched_role = await interaction.guild.roles
        .fetch(role + "")
        .catch(() => {});
      if (!fetched_role) continue;
      const reward = { role, level };

      if (levels < level) {
        if (nextReward) break;
        nextReward = reward;
        break;
      }
      rewards.push(fetched_role);
    }

    const expUntilLevelup = Math.floor(
      BASE_EXP_FOR_NEW_LEVEL * DIFFICULTY_MULTIPLIER * ((levels ?? 0) + 1),
    );
    const formattedExpUntilLevelup = expUntilLevelup?.toLocaleString("en-US");
    const levelUpEmbed = new EmbedBuilder()
      .setFields([
        {
          name: `⚡ • Level ${levels ?? 0}`,
          value: [
            `**Exp**: ${
              formattedExp ?? 0
            }/${formattedExpUntilLevelup} until level up`,
            `**Next Level**: ${(levels ?? 0) + 1}`,
          ].join("\n"),
        },
        {
          name: `🎁 • ${rewards.length} Rewards`,
          value: [
            `${
              rewards.length > 0
                ? rewards.map((reward) => `<@&${reward.id}>`).join(" ")
                : "No rewards unlocked"
            }`,
            nextReward
              ? `**Upcoming reward**: <@&${nextReward.role}>`
              : "**Upcoming reward**: *Cricket, cricket, cricket* - Looks like you claimed everything!",
          ].join("\n"),
        },
      ])
      .setAuthor({
        name: `•  ${selectedMember.user.username}`,
        iconURL: avatarURL,
      })
      .setThumbnail(avatarURL)
      .setColor(genColor(200))
      .setTimestamp();

    try {
      const imageBuffer = await (await fetch(avatarURL)).arrayBuffer();
      const image = sharp(imageBuffer).toFormat("jpg");
      const { r, g, b } = (
        await new Vibrant(await image.toBuffer()).getPalette()
      ).Vibrant ?? { r: 69, g: 69, b: 69 };
      levelUpEmbed.setColor(genRGBColor(r, g, b) as ColorResolvable);
    } catch {}

    await interaction.followUp({ embeds: [levelUpEmbed] });
  }
}
