export const eventName = 'ready'

export const execute = async instance => {
  for (const guild of instance.client.guilds.cache.values()) {
    if (
      !instance.config.guildIds.includes(guild.id) &&
      guild.id !== instance.config.staffGuild
    ) {
      console.log(`! Detected unauthorised guild ${guild.id}, leaving..`)
      await guild.leave().catch(console.error)
    }
  }
}
