import dotenv from 'dotenv'
import { Client } from 'discord.js'

dotenv.config()

export default class extends Client {
  public prefix: string

  constructor () {
    super()

    this.token = process.env.DISCORD_TOKEN!
    this.prefix = process.env.DISCORD_PREFIX || 'lf>'
    this.login()
  }

  public registEvent = (event = 'ready', exec: any) =>
    this.on(event, (...args) => exec(this, ...args))
}
