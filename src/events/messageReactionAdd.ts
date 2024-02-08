import { type Client, type Guild, type User, type MessageReaction } from "discord.js";
import { getPolls } from "../utils/database/poll";

export default {
  name: "messageReactionAdd",
  event: class MessageReactionAdd {
    client: Client;
    constructor(client: Client) {
      this.client = client;
    }

    async run(guild: Guild, user: User, reaction: MessageReaction) {
      if (user.bot) return;

      // Poll reaction handler
      const messageIds = getPolls(guild.id);
      if (!messageIds.includes(reaction.message.id)) return;
      const userReactions = reaction.message.reactions.cache.filter(reaction =>
        reaction.users.cache.has(user.id)
      );
      if (userReactions.size > 1) await userReactions.last()?.remove();
    }
  }
};
