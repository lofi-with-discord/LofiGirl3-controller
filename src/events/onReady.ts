import { post } from 'superagent'
import Client from '../structures/BotClient'

export default async function (client: Client) {
  if (!client.user) return
  console.log('ready...')

  setInterval(() => {
    const listenerCount = client.guilds.cache.reduce((prev, curr) => prev + (curr.voice?.channel ? curr.voice.channel.members.filter((m) => !m.user.bot).size : 0), 0)
    client.user?.setActivity(`${client.prefix}help | with ${listenerCount} listeners`)
  }, 5000)

  if (client.koreanbots) {
    setInterval(async () => {
      await post('https://koreanbots.dev/api/v2/stats')
        .set('Authorization', client.koreanbots!)
        .send({ servers: client.guilds.cache.size })
    }, 60 * 60 * 1000)
  }
}
