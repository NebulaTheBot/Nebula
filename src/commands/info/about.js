const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { getColor } = require("../../utils/misc");

module.exports = class About {
	constructor() {
		this.data = new SlashCommandBuilder()
			.setName("about")
			.setDescription("Shows information about the bot.");
	}

  run(interaction) {
    const client = interaction.client;
    const promises = [
	    client.shard.fetchClientValues("guilds.cache.size"),
	    client.shard.broadcastEval(c => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)),
    ];

    Promise.all(promises).then(results => {
    	const totalGuilds = results[0].reduce((acc, guildCount) => acc + guildCount, 0);
    	const totalMembers = results[1].reduce((acc, memberCount) => acc + memberCount, 0);

      const embed = new EmbedBuilder()
        .setTitle("About")
        .setDescription([
          "**Version**: 0.1.0-beta",
          "**Working on**: The Grand Update"
        ].join("\n"))
        .addFields(
          {
            name: `Guild count: ${totalGuilds}`,
            value: `**Shard ${client.shard}**: idfk how to do this calculation help`
          },
          {
            name: `Member count: ${totalMembers}`,
            value: `test2`
          }
        )
        .setColor(getColor(200));

      return interaction.editReply({ embeds: [embed] });
    }).catch(console.error);
  }
}
