import {
  PermissionsBitField,
  ChannelType,
  EmbedBuilder,
  type ChatInputCommandInteraction,
  type TextChannel
} from "discord.js";
import { errorEmbed } from "../utils/embeds/errorEmbed";
import { genColor } from "../utils/colorGen";
import { ExtendedSlashCommandSubcommandBuilder } from "../utils/extendedSlashCommandSubcommandBuilder";

export default class Poll {
  data: ExtendedSlashCommandSubcommandBuilder;
  constructor() {
    this.data = new ExtendedSlashCommandSubcommandBuilder()
      .setName("poll")
      .setDescription("Make a poll")
      .addStringOption(option =>
        option
          .setName("question")
          .setDescription("The question that you want to ask.")
          .setRequired(true)
      )
      .addChannelOption(channel =>
        channel
          .setName("channel")
          .setDescription("The channel to send the poll in.")
          .setRequired(true)
          .addChannelTypes(
            ChannelType.GuildText,
            ChannelType.PublicThread,
            ChannelType.PrivateThread
          )
      )
      .genNumberFields("Option", 6, 2)
      .addAttachmentOption(option =>
        option.setName("image").setDescription("The image that appears at the bottom of the embed.")
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    function convertNumEmoji(num: number) {
      const numEmojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
      return numEmojis[num];
    }

    const channel = interaction.options.getChannel("channel") as TextChannel;
    const image = interaction.options.getAttachment("image")!;
    const guild = interaction.guild!;
    const member = guild.members.cache.get(interaction.member?.user.id!)!;
    let options: string[] = [];

    for (let i = 0; i < 6; i++) {
      const option = interaction.options.getString(`option${i + 1}`);
      if (option) options.push(option);
    }

    if (!member.permissions.has(PermissionsBitField.Flags.ManageMessages))
      return await interaction.reply({
        embeds: [
          errorEmbed(
            "You can't execute this command.",
            "You need the **Manage Messages** permission."
          )
        ]
      });

    if (!interaction.guild?.members.me?.permissions.has(PermissionsBitField.Flags.SendMessages))
      return await interaction.reply({
        embeds: [
          errorEmbed(
            `Nebula can't execute this command.", "Nebula needs the **Send Messages** permission for ${channel}.`
          )
        ]
      });

    const successEmbed = new EmbedBuilder()
      .setTitle("✅ • Poll has been created successfully")
      .setDescription(`Poll is sent to ${channel}`)
      .setColor(genColor(100));

    let embed = new EmbedBuilder()
      .setAuthor({
        name: `•  Poll by ${member.user.username}`,
        iconURL: member.user.displayAvatarURL()
      })
      .setTitle(`${interaction.options.getString("question")}`)
      .setFields(
        options.map((option, i) => {
          return {
            name: `Option ${convertNumEmoji(i)}`,
            value: option
          };
        })
      )
      .setColor(genColor(200));

    await interaction.reply({ embeds: [successEmbed] });

    if (image) embed.setImage(image.url);
    await channel.send({ embeds: [embed] }).then(async message => {
      for (const emoji of options.map((_, i) => convertNumEmoji(i))) await message.react(emoji);
    });
  }
}
