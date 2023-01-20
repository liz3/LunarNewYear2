export const eventName = 'guildCreate'

export const execute = async (instance, guild) => {
  if (
    !instance.config.guildIds.includes(guild.id) &&
    guild.id !== instance.config.staffGuild
  ) {
    console.log(`! Detected unauthorised guild ${guild.id}, leaving..`)
    await guild.leave().catch(console.error)
  }
}
