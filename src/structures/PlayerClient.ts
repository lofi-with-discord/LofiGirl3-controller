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

  public play = (channel: VoiceChannel) =>
    this.endpoints.forEach((endpoint) =>
      post(`${endpoint}/connection?channel=${channel.id}`)
        .set('Authorization', this.password))

  public stop = (channel: VoiceChannel) =>
    this.endpoints.forEach((endpoint) =>
      del(`${endpoint}/connection?channel=${channel.id}`)
        .set('Authorization', this.password))

  public clear = () =>
    this.endpoints.forEach((endpoint) =>
      del(`${endpoint}/cache`)
        .set('Authorization', this.password))
}