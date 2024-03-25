import { SlashCommandSubcommandBuilder } from "discord.js";

export class ExtendedSlashCommandSubcommandBuilder extends SlashCommandSubcommandBuilder {
  /**
   * Generates fields and descriptions for commands which serve the same purpose but have to be reused.
   * @param {SlashCommandSubcommandBuilder} command The command to add the fields to.
   * @param {string} name Reused name of the fields.
   * @param {number} number Number of fields to generate.
   * @param {number} numRequired Number of required fields.
   * @returns Returns the generated fields.
   */
  genNumberFields(name: string, number: number, numRequired: number = 0) {
    for (let i = 0; i < numRequired; i++) {
      this.addStringOption(option =>
        option
          .setName(`${name.toLowerCase()}${i + 1}`)
          .setDescription(`${name} ${i + 1}`)
          .setRequired(true)
      );
    }

    for (let i = numRequired; i < number; i++) {
      this.addStringOption(option =>
        option
          .setName(`${name.toLowerCase()}${i + 1}`)
          .setDescription(`${name} ${i + 1}, not required`)
          .setRequired(false)
      );
    }

    return this;
  }
}
