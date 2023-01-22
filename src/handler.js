import djs from "discord.js";
const {ChannelType} = djs;
export class Handler {
  constructor (instance, commands, events, restEvents, services) {
    this.instance = instance
    this.client = instance.client

    this.commands = commands
    this.events = events
    this.restEvents = restEvents
    this.services = services

    this.mentionRegex = /^<@!?1043891057332596836> ?/
    this.commandQueue = []
    this.isReady = false
  }

  onMessage () {
    const events = this.events.messageCreate

    this.client.on('messageCreate', async message => {

       if (message.channel.type === ChannelType.DM) return; // ToDo: Reimplement
      const hasPrefix = message.content.toLowerCase().indexOf(this.instance.config.prefix) === 0
      const mentionMatch =
        !hasPrefix && this.mentionRegex.test(message.content)

      if (hasPrefix || mentionMatch) {
        const plen = mentionMatch
          ? message.content.match(this.mentionRegex)[0].length
          : this.instance.config.prefix.length
        const args = message.content.substring(plen).trim().split(/ +/g)
        const commandName = args.shift()
        const command = this.commands[commandName]
        if (command) {
          this.execCommand(command, message, args)
        } else {
          // not yet found. this isn't the best time complexity but it should be still okay
          for (const commandKey of Object.keys(this.commands)) {
            const currentEntry = this.commands[commandKey]
            if (!currentEntry.info.matchCase) {
              if (
                currentEntry.info.name.toLowerCase() ===
                  commandName.toLowerCase() ||
                (Array.isArray(currentEntry.info.aliases) &&
                  currentEntry.info.aliases.find(
                    e => e.toLowerCase() === commandName.toLowerCase()
                  ))
              ) {
                this.execCommand(currentEntry, message, args)
              }
            } else {
              if (
                Array.isArray(currentEntry.info.aliases) &&
                currentEntry.info.aliases.find(e => e === commandName)
              ) {
                this.execCommand(currentEntry, message, args)
              }
            }
          }
        }
      }
      if (events) {
        for (const handler of events) {
          await handler
            .execute(this.instance, message)
            .catch(console.error)
        }
      }
    })
  }

  onReady () {
    this.client.on('ready', async t => {
      console.debug(`[${this.instance.sid}] ready`)
      this.mentionRegex = new RegExp(`^<@!?${this.client.user.id}> ?`)
      const events = this.events.ready
      if (events) {
        for (const handler of events) {
          await handler.execute(this.instance, t).catch(console.error)
        }
      }
      if (this.isReady) return
      // start services after this
      this.services.forEach(service => service.start(this.instance).catch(console.error))
      this.isReady = true
      // process queued commands
      for (const elem of this.commandQueue) {
        await this.execCommand(...elem).catch(console.error)
      }
      this.commandQueue = []
    })
  }

  async execCommand (command, message, args) {
    if (!this.isReady) {
      this.commandQueue.push([command, message, args])
      return
    }
    const startMs = Date.now()

    await command.execute(
      this.instance,
      message,
      args
    ).catch(console.error)

    const endMs = Date.now()
    console.debug(
      `[${this.instance.sid}] <#${message.channel.id}> ${message.author.tag} > ${command.info.name} ` +
        `(${endMs - startMs}ms/${endMs - message.createdTimestamp}ms` +
        `/${startMs - message.createdTimestamp}ms)`
    )
  }

  registerEventHandler (name, events) {
    this.client.on(name, async (...params) => {
      for (const handler of events) {
        try {
          await handler.execute(this.instance, ...params)
        } catch (err) {
          console.error(
            `handling failed for ${name}, file: ${handler.file}`,
            err
          )
        }
      }
    })
  }

  registerRestEventHandler (name, events) {
    this.client.on(name, async (...params) => {
      for (const handler of events) {
        try {
          await handler.execute(this.instance, ...params)
        } catch (err) {
          console.error(
            `handling failed for ${name}, file: ${handler.file}`,
            err
          )
        }
      }
    })
  }

  cleanup () {
    Object.keys(this.events)
      .filter((value, index, self) => self.indexOf(value) === index)
      .forEach(key => this.client.removeAllListeners(key))
    Object.keys(this.restEvents)
      .filter((value, index, self) => self.indexOf(value) === index)
      .forEach(key => this.client.rest.removeAllListeners(key))
    for (const service of this.services) {
      service.stop(this.instance)
    }
    this.events = {}
    this.restEvents = {}
    this.commands = {}
    this.services = []
  }

  async arm () {
    Object.keys(this.events).forEach(elem => {
      if (elem === 'messageCreate' || elem === 'ready') return // handled separately
      this.registerEventHandler(elem, this.events[elem])
    })
    Object.keys(this.restEvents).forEach(elem =>
      this.registerRestEventHandler(elem, this.restEvents[elem])
    )
    this.onMessage()
    this.onReady()
    this.isReady = this.client.isReady()
    if (this.isReady) {
      const otherHandlers = this.events.ready
      if (otherHandlers) {
        for (const handler of otherHandlers) {
          await handler.execute(this.instance).catch(console.error)
        }
      }
      this.services.forEach(element => element.start(this.instance))
    }
  }
}
