import {
  SlashCommandSubcommandBuilder, EmbedBuilder, type ColorResolvable,
  type ChatInputCommandInteraction
} from "discord.js";
import { genColor, genRGBColor } from "../../utils/colorGen.js";
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
    const user = interaction.options.getUser("user");
    const id = user ? user.id : interaction.member.user.id;
    const selectedMember = interaction.guild.members.cache.filter(member => member.user.id === id).map(user => user)[0];
    const selectedUser = selectedMember.user;

    let embed = new EmbedBuilder()
      .setAuthor({
        name: `•  ${selectedMember.nickname == null ? selectedUser.username : selectedMember.nickname}${selectedUser.discriminator == "0" ? "" : `#${selectedUser.discriminator}`}`,
        iconURL: selectedMember.displayAvatarURL()
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
      .setThumbnail(selectedMember.displayAvatarURL())
      .setColor(genColor(200));

    try {
      const imageBuffer = await (await fetch(selectedMember.displayAvatarURL())).arrayBuffer();
      const image = sharp(imageBuffer).toFormat("jpg");
      const { r, g, b } = (await new Vibrant(await image.toBuffer()).getPalette()).Vibrant;
      embed.setColor(genRGBColor(r, g, b) as ColorResolvable);
    } catch { }

    const guildRoles = interaction.guild.roles.cache.filter(role => selectedMember.roles.cache.has(role.id));
    const memberRoles = [...guildRoles].sort((role1, role2) => role2[1].position - role1[1].position);
    memberRoles.pop();

    if (memberRoles.length !== 0) embed.addFields({
      name: `🎭 • ${guildRoles.filter(role => selectedMember.roles.cache.has(role.id)).size - 1} ${memberRoles.length === 1 ? "role" : "roles"}`,
      value: `${memberRoles
        .slice(0, 5)
        .map(role => `<@&${role[1].id}>`)
        .join(", ")}${memberRoles.length > 5 ? ` **and ${memberRoles.length - 5} more**` : ""}`,
    });

    await interaction.followUp({ embeds: [embed] });
  }
}
