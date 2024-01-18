import { SlashCommandSubcommandBuilder, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { genColor } from "../../utils/colorGen";
import { errorEmbed } from "../../utils/embeds/errorEmbed";
import { get as getLevelRewards } from "../../utils/database/levelRewards";
import { get } from "../../utils/database/settings";
import { getLevel, setLevel } from "../../utils/database/levelling";

export default class Level {
  data: SlashCommandSubcommandBuilder;
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("level")
      .setDescription("Shows your (or another user's) level.")
      .addUserOption(option => option
        .setName("user")
        .setDescription("Select the user.")
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;
    if (!get(`${guild?.id}`, "levelling.enabled")) return await interaction.followUp({
      embeds: [errorEmbed("Leveling is disabled for this server.")]
    });

    const user = interaction.options.getUser("user");
    const id = user ? user.id : interaction.member?.user.id;
    const selectedMember = guild?.members.cache.filter(member => member.user.id === id).map(user => user)[0];
    const [guildExp, guildLevel] = getLevel(`${guild?.id}`, `${selectedMember?.id}`);
    if (!guildExp && !guildLevel) setLevel(`${guild?.id}`, `${selectedMember?.id}`, 0, 0);

    const avatarURL = selectedMember?.displayAvatarURL();
    const formattedExpUntilLevelup = Math.floor(100 * 1.25 * ((guildLevel ?? 0) + 1))?.toLocaleString("en-US");
    let rewards = [];
    let nextReward;

    for (const { roleID, level } of getLevelRewards(`${guild?.id}`)) {
      if (guildLevel < level) {
        if (nextReward) break;
        nextReward = { roleID, level };
        break;
      }

      rewards.push(await guild?.roles.fetch(`${roleID}`)?.catch(() => {}));
    }

    const embed = new EmbedBuilder()
      .setAuthor({ name: `•  ${selectedMember?.user.username}`, iconURL: avatarURL })
      .setFields(
        {
          name: `⚡ • Level ${guildLevel ?? 0}`,
          value: [
            `**${guildExp?.toLocaleString("en-US") ?? 0}/${formattedExpUntilLevelup}** EXP until level up`,
            `**Next level**: ${(guildLevel ?? 0) + 1}`
          ].join("\n")
        },
        {
          name: `🎁 • ${rewards.length} Rewards`,
          value: [
            `${rewards.length > 0 ? rewards.map(reward => `<@&${reward?.id}>`).join(" ") : "No rewards unlocked"}`,
            nextReward ? `**Upcoming reward**: <@&${nextReward.roleID}>` : "**Upcoming reward**: *Cricket, cricket, cricket* - Looks like you claimed everything!"
          ].join("\n")
        }
      )
      .setThumbnail(avatarURL || null)
      .setTimestamp()
      .setColor(genColor(200));

    await interaction.followUp({ embeds: [embed] });
  }
}
