import 'dotenv/config'
import config from './config.js'
import newRedis from './redis.js'
import connectDatabase from "./database/index.js"
import { Client } from 'discord.js'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { Handler } from './handler.js'
import { readDirectoryRecursiveWithFilter } from './utils/funcs.js'

const pwd = dirname(fileURLToPath(import.meta.url))

class Boato {
  constructor (redis, db) {
    this.db = db;
    this.client = new Client({
      allowedMentions: {
        parse: ['users'],
        repliedUser: false
      },
      intents: config.intents,
      presence: {
        status: 'online',
        activities: [{ name: '-help', type: 5 }]
      },
      failIfNotExists: false
    })
    this.config = config
    this.sid = this.client.shard ? this.client.shard.ids[0] : 0
    this.client.b_instance = this
    this.handler = null
    this.redis = redis
    this.settings = {}
    this.shared = {}
    this.queues = {}

    this.running = false
  }

  async loadCommands () {
    const commands = {}
    const entries = readDirectoryRecursiveWithFilter(
      'commands', pwd, name => name.endsWith('.js') && !name.endsWith('utils.js')
    )
    for (const entry of entries) {
      // WE'RE NEVER DELETING THE OLD ONES FROM CACHE
      // I NEED TO FIND HOW IN ES MODULES THIS WORKS
      // me from the future: you just don't xd
      const command = await import(`./${entry}?v=${Date.now()}`)
      if (command.info.disabled) continue
      if (commands[command.info.name]) {
        throw new Error(`duplicated command ${command.info.name}`)
      }
      if (command.init) await command.init(this)
      console.debug(`[${this.sid}] adding command`, entry, command.info.name)
      commands[command.info.name] = command
    }
    return commands
  }

  async loadEvents () {
    const events = {}
    const entries = readDirectoryRecursiveWithFilter(
      'events', pwd, name => name.endsWith('.js')
    )
    for (const entry of entries) {
      const event = await import(`./${entry}?v=${Date.now()}`)
      if (event.disabled) continue
      if (!event.eventName) {
        throw new Error(`no event name specified in ${entry}`)
      }
      if (event.init) await event.init(this)
      if (!events[event.eventName]) events[event.eventName] = []
      console.log(`[${this.sid}] adding event`, entry, event.eventName)
      events[event.eventName].push(event)
    }
    return events
  }

  async loadRestEvents () {
    const events = {}
    const entries = readDirectoryRecursiveWithFilter(
      'restEvents', pwd, name => name.endsWith('.js')
    )
    for (const entry of entries) {
      const event = await import(`./${entry}?v=${Date.now()}`)
      if (event.disabled) continue
      if (!event.eventName) {
        throw new Error(`no event name specified in ${entry}`)
      }
      if (event.init) await event.init(this)
      if (!events[event.eventName]) events[event.eventName] = []
      console.log(`[${this.sid}] adding REST event`, entry, event.eventName)
      events[event.eventName].push(event)
    }
    return events
  }

  async loadServices () {
    const services = []
    const entries = readDirectoryRecursiveWithFilter(
      'services', pwd, name => name.endsWith('.js')
    )
    for (const entry of entries) {
      const service = await import(`./${entry}?v=${Date.now()}`)
      if (service.disabled) continue
      if (!service.start || !service.stop) {
        throw new Error(`service ${entry} need a start/stop export to work`)
      }
      if (service.init) await service.init(this)
      console.log(`[${this.sid}] adding service`, entry)
      services.push(service)
    }
    return services
  }

  async initReload () {
    if (this.client.shard) {
      return await this.client.shard.broadcastEval(client =>
        client.b_instance.reload()
      )
    } else {
      return await this.reload()
    }
  }

  async reload () {
    if (!this.running) { throw new Error('reloading when we have not even started!') }

    console.debug(`[${this.sid}] invoked reload`)
    if (this.handler) this.handler.cleanup()
    this.handler = null
    this.running = false
    return await this.bootstrap()
  }

  async bootstrap (token = undefined) {
    if (this.running) {
      throw new Error('asked to bootstrap when bot is already running')
    }

    const commands = await this.loadCommands()
    const events = await this.loadEvents()
    const restEvents = await this.loadRestEvents()
    const services = await this.loadServices()

    this.handler = new Handler(this, commands, events, restEvents, services)
    this.handler.arm()

    this.running = true

    if (token !== undefined && !this.client.isReady()) {
      // we're supposed to be logging in, aren't we?
      console.debug(`[${this.sid}] initialise login`)
      this.client.login(token)
    }
  }
}

(async () => {
  const db = await connectDatabase(config, true)
  await db.createTables();
  const redis = await newRedis(process.env.REDIS_URI)
  await new Boato(redis, db)
    .bootstrap(process.env.BOT_TOKEN)
    .catch(err => {
      console.error(err)
      process.exit(1)
    })
})()
