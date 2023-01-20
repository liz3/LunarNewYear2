import { GatewayIntentBits } from 'discord.js'

const config = {
  prefix: '-',
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ],

  staffGuild: '931104933892194364',
  guilds: {
    // todo change for participating ones
    '378599231583289346': { name: 'Gay & Comfy', color: 'Golden', invite: 'https://discord.gg/comfy' },
    '848127260892725268': { name: 'Wat', color: 'Cyan', invite: 'https://www.comfy.gay/appeal' }
  }
}
config.guildIds = Object.keys(config.guilds)

export default config
