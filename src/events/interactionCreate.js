const { EmbedBuilder } = require("discord.js");
const { getBulk } = require("../utils/db");
const getFiles = require("../utils/getFiles");
const path = require("path");

class interactionCreate {
  commands = [];
  events = [];
  client = null;

  constructor(client, commands, events) {
    this.client = client;
    this.commands = commands;
    this.events = events;
  }

  run = async interaction => {
    if (!interaction.isChatInputCommand()) return;

    try {
      const commandFiles = getFiles(path.join(process.cwd(), "src", "commands"), ".js");
      const command = commandFiles.find(file => file.indexOf(interaction.commandName + ".js") !== -1);
      const callback = require(command)?.callback;

      const guildCmd = (await getBulk("commands").catch(() => {}))
        .find(cmd => cmd.name === interaction.commandName && cmd.guildID === interaction.guild.id);

      if (guildCmd == null) return callback(interaction, this.client, this.commands, this.events);

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

        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (guildCmd.moderation && !interaction.member.moderatable)
        return interaction.reply({ embeds: [noPermsEmbed], ephemeral: true });

      const permissionsNeeded = JSON.parse(guildCmd.permissionsNeeded);
      if (permissionsNeeded) for (let i = 0; i < permissionsNeeded.length; i++) {
        const permission = permissionsNeeded[i];
        if (!interaction.memberPermissions.has(permission, true)) return interaction.reply({ embeds: [noPermsEmbed], ephemeral: true });
      }
          
      const rolesNeeded = JSON.parse(guildCmd.rolesNeeded);
      if (rolesNeeded) for (let i = 0; i < rolesNeeded.length; i++) {
        const role = rolesNeeded[i];
        if (!interaction.member.roles.includes(role)) return interaction.reply({ embeds: [noPermsEmbed], ephemeral: true });
      }
      
      const rolesBanned = JSON.parse(guildCmd.rolesBanned);
      if (rolesBanned) for (let i = 0; i < rolesBanned.length; i++) {
        const role = rolesBanned[i];
        if (interaction.member.roles.includes(role)) return interaction.reply({ embeds: [noPermsEmbed], ephemeral: true });
      }

      const bannedChannels = JSON.parse(guildCmd.bannedChannels);
      if (bannedChannels) for (let i = 0; i < bannedChannels.length; i++) {
        // const channel = bannedChannels[i];
        if (bannedChannels.includes(interaction.channelId)) return interaction.reply({ embeds: [wrongChannelEmbed], ephemeral: true });
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

      if (!isAllowed) return interaction.reply({ embeds: [wrongChannelEmbed], ephemeral: true });

      callback(interaction, this.client, this.events, this.commands);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = { name: "interactionCreate", event: interactionCreate };
