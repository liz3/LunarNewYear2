import { addBalance } from "../utils/balance.js";
import {
  getRandom,
  capitalise,
  generatePath,
  readImageFile,
  handleClaim,
} from "../utils/funcs.js";
import { EmbedBuilder } from "discord.js";
export const eventName = "messageCreate";

const emotes = ["🐇", "🐰"]
const running = {};

const stringifyUsers =
  (uids, should) =>
    uids
      .map((uid, i) => {
        let u = `<@!${uid}>`
        if (should && i !== 0 && i === uids.length - 1) u = `and ${u}`
        return u
      })
      .join(', ')

const generateResult = (instance, guild) => {
  const animal = getRandom([...instance.config.chances_animals, instance.config.chance_rabbit]);
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
    (g.whitelist && !g.whitelist.includes(message.channel.id))
  )
    return;

  // calculate random chances of a spawn for this message
  const k = `lny2023:${message.guild.id}`;
  const last = await instance.redis.get(k);
  if (!isNaN(last) && Date.now() - parseInt(last) < 60000) return
  if (Math.floor(Math.random() * 3) !== 2) return

  const emote = emotes[Math.floor(Math.random() * emotes.length)];
  const hasReacted = {};

  const result = generateResult(instance, message.guild);
  const s = Symbol(message.guild.id);
  running[message.guild.id] = s;
  const file = await readImageFile(
    generatePath(result.animal, result.color)
  );
  const embed = new EmbedBuilder()
    .setTitle(
      `${capitalise(result.color)} ${capitalise(
        result.animal
      )} has spawned!`
    )
    .setDescription(`> React with ${emote} to claim!`)
    .setThumbnail("attachment://image.png")
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
        running[message.guild.id] === s && !u.bot && r.emoji.name === emote,
      time: 15_000,
    })
    .on("collect", async (r, u) => {
      if (hasReacted[u.id]) return;
      if (Object.keys(hasReacted).length === 0) {
        const k = `lny2023:${message.guild.id}:${u.id}`
        const cd = await instance.redis.get(k)
        let cdTime = 0
        if (!isNaN(cd)) cdTime = Date.now() - parseInt(cd)
        if (cdTime < 120000) {
          console.log(`${u.tag || u.id} is in cooldown, wait ${120000 - cdTime}...`)
          return r.users.remove(u).catch(console.error)
        }

        addBalance(instance, u, message.guild, 5, null).catch(console.error);
        handleClaim(instance, u, result, message);
        claimUser = u;
        instance.redis.set(k, Date.now()).catch(console.error)
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
        msgParts.push(`\n${stringifyUsers(slice, otherUsers.length <= 5)}`);
        if (otherUsers.length > 5) {
          msgParts.push(`and ${otherUsers.length - 5} others`);
        }
        msgParts.push("also got 1 balance!");
      }
      spawnMessage.reply(`🐰 ${msgParts.join(" ")}`).catch(console.error);
    });
};
