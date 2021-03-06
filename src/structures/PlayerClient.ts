import dotenv from 'dotenv'
import { del, post } from 'superagent'
import { VoiceChannel } from 'discord.js'

dotenv.config()

export default class PlayerClient {
  private endpoints: string[]
  private password: string

  constructor () {
    const host = process.env.CONTROL_HOST || 'localhost'
    const port = process.env.CONTROL_PORT

    this.endpoints = port?.split(',').reduce((prev, curr) => [...prev, `http://${host}:${curr}`], [] as string[])!
    this.password = process.env.CONTROL_PASSWORD!
  }

  public async play (channel: VoiceChannel) {
    for (const endpoint of this.endpoints) {
      await post(`${endpoint}/connection?channel=${channel.id}`)
        .set('Authorization', this.password).catch(() => ({}))
    }
  }

  public async stop (channel: VoiceChannel) {
    for (const endpoint of this.endpoints) {
      await del(`${endpoint}/connection?channel=${channel.id}`)
        .set('Authorization', this.password).catch(() => ({}))
    }
  }

  public async clear () {
    for (const endpoint of this.endpoints) {
      await del(`${endpoint}/cache`)
        .set('Authorization', this.password).catch(() => ({}))
    }
  }
}
