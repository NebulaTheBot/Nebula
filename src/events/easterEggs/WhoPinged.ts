import type { Message } from "discord.js";
import { randomise } from "../../utils/randomise";

export default class WhoPinged {
  async run(message: Message) {
    if (message.content.toLowerCase().includes(`<@${message.client.user.id}>`)) {
      const gifs = randomise([
        "https://tenor.com/view/who-pinged-me-ping-discord-up-opening-door-gif-20065356",
        "https://tenor.com/view/discord-who-pinged-me-who-pinged-me-gif-25140226",
        "https://tenor.com/view/who-pinged-me-ping-discord-discord-ping-undertaker-gif-20399650",
        "https://tenor.com/view/who-pinged-me-ping-tudou-mr-potato-cat-gif-22762448",
        "https://tenor.com/view/me-when-someone-pings-me-sad-cursed-emoji-crying-gif-22784322",
        "https://tenor.com/view/discord-triggered-notification-angry-dog-noises-dog-girl-gif-11710406",
        "https://tenor.com/view/tense-table-smash-mad-gif-13656077",
        "https://tenor.com/view/yakuza-kazuma-kiryu-pissed-off-gif-14586175"
      ]);

      await message.channel.send(gifs);
    }
  }
}
