import {
  SlashCommandSubcommandBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ButtonInteraction,
  ComponentType,
  PermissionsBitField,
  ChannelType,
  EmbedBuilder,
  type ChatInputCommandInteraction,
  type Channel,
  type TextChannel
} from "discord.js";
import { errorEmbed } from "../utils/embeds/errorEmbed";
import { genColor } from "../utils/colorGen";
import { ExtendedSlashCommandSubcommandBuilder } from "../utils/extendedSlashCommandSubcommandBuilder";

export default class Poll {
  numberOfFields: number;
  data: ExtendedSlashCommandSubcommandBuilder;
  constructor() {
    this.numberOfFields = 6;
    this.data = new ExtendedSlashCommandSubcommandBuilder()
      .setName("poll")
      .setDescription("Make a poll")
      .addStringOption(option =>
        option
          .setName("question")
          .setDescription("What's the question you want to ask?")
          .setRequired(true)
      )
      .addChannelOption(channel =>
        channel
          .setName("channel")
          .setDescription("The channel to send the poll in")
          .setRequired(true)
      )
      .genNumberFields("Option", this.numberOfFields, 2)
      .addAttachmentOption(option =>
        option
          .setName("image")
          .setDescription("The image to appear at the bottom of the embed")
          .setRequired(false)
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    function convertNumEmoji(num: number) {
      const numEmojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
      return numEmojis[num];
    }

    const question = interaction.options.getString("question");
    const channel = interaction.options.getChannel("channel");
    const image = interaction.options.getAttachment("image")!;
    let options: string[] = [];

    const guild = interaction.guild!;
    const members = guild.members.cache;
    const member = members.get(interaction.member?.user.id!)!;

    for (let i = 0; i < this.numberOfFields; i++) {
      const option = interaction.options.getString(`option${i + 1}`);
      if (option) {
        options.push(option);
      }
    }

    if (!member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return await interaction.reply({
        embeds: [
          errorEmbed(
            "You can't execute this command.",
            "You need the **Manage Messages** permission."
          )
        ]
      });
    }

    if (!interaction.guild?.members.me?.permissions.has(PermissionsBitField.Flags.SendMessages)) {
      return await interaction.reply({
        embeds: [
          errorEmbed(
            `Nebula can't execute this command.", "Nebula needs the **Send Messages** permission for ${channel}.`
          )
        ]
      });
    }

    let successEmbed = new EmbedBuilder()
      .setTitle("✅  •  Poll has been created successfully")
      .setDescription(`Poll is sent to ${channel}`)
      .setColor(genColor(200));

    let embed = new EmbedBuilder()
      .setAuthor({
        name: `•  Poll by ${member.user.username}`,
        iconURL: member.user.displayAvatarURL()
      })
      .setTitle(`📊  •  ${question}`)
      .setFields(
        options.map((option, i) => {
          return {
            name: `Option ${convertNumEmoji(i)}`,
            value: option,
            inline: false
          };
        })
      )
      .setColor(genColor(200));

    if (image) {
      embed.setImage(image.url);
    }

    await interaction.reply({ embeds: [successEmbed] });
    const pollChannel = await guild.channels.cache
      .get(`${channel}`)
      ?.fetch()
      .then((channel: Channel) => {
        if (channel.type != ChannelType.GuildText) return null;
        return channel as TextChannel;
      })
      .catch(() => null);
    if (pollChannel) {
      const pollMsg = await pollChannel.send({ embeds: [embed] });
      console.log(`sent poll to ${pollChannel}:\n${pollMsg}`);
      // TODO: rewrite multiReact to use an array instead of a stupid string
      const optionEmojis = options.map((_, i) => convertNumEmoji(i));
      for (const emoji of optionEmojis) {
        await pollMsg.react(emoji); // Can't use multiReact here because number emojis are fucking stupid and Typescript is weird
      }
    }
  }
}
