import path from 'path'
import dotenv from 'dotenv'
import { Client } from 'discord.js'
import { Command } from '../types'
import { readRecursively } from '../utils'

dotenv.config()

const PATH = path.resolve()

export default class extends Client {
  public prefix: string
  public koreanbots?: string
  public commands: Command[] = []

  constructor () {
    super()

    const commandPath = PATH + '/dist/commands'
    const files = readRecursively(commandPath)
    for (const file of files) {
      if (!file.endsWith('.js')) continue
      this.commands.push(require(file) as Command)
    }

    this.token = process.env.DISCORD_TOKEN!
    this.koreanbots = process.env.KOREANBOT_TOKEN
    this.prefix = process.env.DISCORD_PREFIX || 'lf>'
    this.login()
  }

  public registEvent = (event = 'ready', exec: any) =>
    this.on(event, (...args) => exec(this, ...args))
}
