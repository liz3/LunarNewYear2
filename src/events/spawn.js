import { addBalance } from "../utils/balance.js";
import {
  getRandom,
  capitalise,
  generatePath,
  readImageFile,
} from "../utils/funcs.js";
import djs from "discord.js";
const { Attachment, EmbedBuilder } = djs;
export const eventName = "messageCreate";

const running = {};
const imageCache = {};

const generateResult = (instance, guild) => {
  const animal = getRandom(instance.config.chances_animals);
  const colors = [...instance.config.chances_color];
  if (animal === "rabbit") {
    colors.push([
      instance.config.guilds[guild.id].colorChance || 0.99,
      [instance.config.guilds[guild.id].color],
    ]);
    colors.push(instance.config.chance_white);
  }
  const color = getRandom(colors);
  return {
    animal,
    color,
  };
};
const handleClaim = async (instance, user, result, message) => {
  await instance.db.simpleInsert("CLAIMS", {
    guild_name: message.guild.name,
    guild_id: message.guild.id,
    username: user.username,
    user_id: user.id,
    animal: result.animal,
    color: result.color,
    time: new Date(),
  });
  await addBalance(instance, user, message.guild, 5, null).catch(console.error);
};

export const execute = async (instance, message) => {
  if (
    !instance.config.guildIds.includes(message.guild.id) &&
    message.guild.id !== instance.config.staffGuild
  ) {
    console.log(`! Detected unauthorised guild ${message.guild.id}, leaving..`);
    await message.guild.leave().catch(console.error);
    return;
  }
  if (message.author.bot || running[message.guild.id]) return;

  const g = instance.config.guilds[message.guild.id];
  if (
    !g ||
    (g.whitelist && !g.whitelist.includes(message.channel.id)) ||
    (g.blacklist && g.blacklist.includes(message.channel.id))
  )
    return;

  // calculate random chances of a spawn for this message
  const k = `lny2023:${message.guild.id}`;
  const last = await instance.redis.get(k);
  // ToDo: Needs randomisation with percentage, but no idea what to set right now
  // calculate something that's fair for users given the event length (14 days)
  if (!isNaN(last) && Date.now() - parseInt(last) < 30000) return
  const emote = g.emote || "🐇";
  const hasReacted = {};

  const result = generateResult(instance, message.guild);
  const s = Symbol(message.guild.id);
  running[message.guild.id] = s;
  const file = await readImageFile(
    imageCache,
    generatePath(result.animal, result.color)
  );
  const attachment = new Attachment(file, "image.png");
  const embed = new EmbedBuilder()
    .setTitle(
      `${capitalise(result.color)} ${capitalise(
        result.animal
      )} Spawned, react with ${emote} to claim or get some balance`
    )
    .setImage("attachment://image.png")
    .setColor(instance.config.hex_codes[result.color]);
  const spawnMessage = await message.channel.send({
    embeds: [embed],
    files: [{ attachment: file, name: "image.png" }],
  });
  const spawnReact = await spawnMessage.react(emote);
  console.log(`! Spawned a ${result.color} ${result.animal} in ${g.name}`);
  let claimUser = null;
  spawnMessage
    .createReactionCollector({
      filter: (r, u) =>
        running[message.guild.id] === s && !u.bot && r.emoji.name === "🐇",
      time: 15_000,
    })
    .on("collect", async (r, u) => {
      if (hasReacted[u.id]) return;
      if (Object.keys(hasReacted).length === 0) {
        handleClaim(instance, u, result, message);
        claimUser = u;
      }
      hasReacted[u.id] = u;
    })
    .on("end", (collected) => {
      delete running[message.guild.id];
      instance.redis.set(k, Date.now().toString()).catch(console.error);
      if (collected.size === 0) {
        spawnReact.users.remove().catch(() => {});
        return;
      }
      if (!claimUser) return;

      const uids = Object.keys(hasReacted);
      const otherUsers = uids.filter((e) => e !== claimUser.id);
      otherUsers.forEach((uid) =>
        addBalance(instance, hasReacted[uid], message.guild).catch(
          console.error
        )
      );
      const msgParts = [];
      msgParts.push(
        `<@${claimUser.id}> got the ${capitalise(result.color)} ${capitalise(
          result.animal
        )} and 5 balance!`
      );
      if (otherUsers.length) {
        const slice = otherUsers.slice(0, 5);
        msgParts.push(`${otherUsers.map((u) => `<@!${u}>`).join(", ")}`);
        if (otherUsers.length > 5) {
          msgParts.push(`and ${otherUsers.length - 5}`);
        }
        msgParts.push("Claimed some balance!");
      }
      spawnMessage.reply(`🐰 ${msgParts.join(" ")}`).catch(console.error);
    });
};
