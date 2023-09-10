/**
 * Checks if the URL is discord.gg
 * @param url The URL to check
 */
export default function validateURL(url: string) {
  if (/^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g.test(url)) return true;
  return false;
}
