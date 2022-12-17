const { EmbedBuilder } = require("discord.js");
const { getBulk } = require("../utils/db");
const { getFiles, requireReload } = require("../utils/misc");
const path = require("path");

module.exports = {
  name: "interactionCreate",
  event: class InteractionCreate {
    constructor(commands, subcommands, events) {
      this.commands = commands;
      this.subcommands = subcommands;
      this.events = events;
    }

    async run(interaction) {
      if (!interaction.isChatInputCommand()) return;
      await interaction.deferReply();

      const commandFiles = getFiles(path.join(process.cwd(), "src", "commands"), ".js");
      const findCommandFile = commandFiles.find(file => file.indexOf(`${interaction.commandName}.js`) !== -1);
      const commandFile = requireReload(findCommandFile);
      const command = new (commandFile)(this.client, this.commands, this);

      const subcommandFiles = getFiles(path.join(process.cwd(), "src", "subcommands"), ".js");
      const findSubcommandFile = subcommandFiles.find(subcommandFile => subcommandFile === name);
      const subcommandFile = requireReload(findSubcommandFile);
      const subcommand = new (subcommandFile)(this.client, this.subcommands, this);

      const guildCmd = (await getBulk("commands").catch(() => {}))
        .find(cmd => cmd.name === interaction.commandName && cmd.guildID === interaction.guild.id);

      if (guildCmd == null) return command.run(interaction);

      const noPermsEmbed = new EmbedBuilder()
        .setTitle("You don't have enough permissions")
        .setDescription("You don't have enough permissions to execute this command.")
        .setColor("Red");
        
      const wrongChannelEmbed = new EmbedBuilder()
        .setTitle("Wrong channel")
        .setDescription("You're not allowed to use this command in this channel.")
        .setColor("Red");
      
      if (guildCmd?.guildID == null) return; // Default permission checker.
      
      // Permission checker.
      if (!guildCmd.enabled) {
        const embed = new EmbedBuilder()
          .setTitle("The command is disabled")
          .setDescription("The command has been disabled by the server admins.")
          .setColor("Red");

        return interaction.editReply({ embeds: [embed], ephemeral: true });
      }

      if (guildCmd.moderation && !interaction.member.moderatable) return interaction.editReply({ embeds: [noPermsEmbed], ephemeral: true });

      const permissionsNeeded = JSON.parse(guildCmd.permissionsNeeded);
      if (permissionsNeeded) for (let i = 0; i < permissionsNeeded.length; i++) {
        const permission = permissionsNeeded[i];
        if (!interaction.memberPermissions.has(permission, true)) return interaction.editReply({ embeds: [noPermsEmbed], ephemeral: true });
      }
          
      const rolesNeeded = JSON.parse(guildCmd.rolesNeeded);
      if (rolesNeeded) for (let i = 0; i < rolesNeeded.length; i++) {
        const role = rolesNeeded[i];
        if (!interaction.member.roles.includes(role)) return interaction.editReply({ embeds: [noPermsEmbed], ephemeral: true });
      }
      
      const rolesBanned = JSON.parse(guildCmd.rolesBanned);
      if (rolesBanned) for (let i = 0; i < rolesBanned.length; i++) {
        const role = rolesBanned[i];
        if (interaction.member.roles.includes(role)) return interaction.editReply({ embeds: [noPermsEmbed], ephemeral: true });
      }

      const bannedChannels = JSON.parse(guildCmd.bannedChannels);
      if (bannedChannels) for (let i = 0; i < bannedChannels.length; i++) {
        // const channel = bannedChannels[i];
        if (bannedChannels.includes(interaction.channelId)) return interaction.editReply({ embeds: [wrongChannelEmbed], ephemeral: true });
      }

      const allowedChannels = JSON.parse(guildCmd.allowedChannels);
      let isAllowed = false;

      if (allowedChannels) for (let i = 0; i < allowedChannels.length; i++) {
        // const channel = allowedChannels[i];
        if (allowedChannels.includes(interaction.channelId)) {
          isAllowed = true;
          break;
        }
      }

      if (!isAllowed) return interaction.editReply({ embeds: [wrongChannelEmbed], ephemeral: true });
      command.run(interaction);
    }
  }
}
