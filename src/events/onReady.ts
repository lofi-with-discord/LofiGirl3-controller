import { post } from 'superagent'
import Client from '../structures/BotClient'

export default async function (client: Client) {
  if (!client.user) return
  console.log('ready...')

  setInterval(async () => {
    const listenerCount = client.guilds.cache.reduce((prev, curr) => prev + (curr.me?.voice?.channel ? curr.me.voice.channel.members.filter((m) => !m.user.bot).size : 0), 0)
    client.user?.setActivity(`${client.prefix}help | ${client.shard ? `shard #${client.shard?.ids[0]}` : ''} with ${listenerCount} listeners`)
  }, 5000)

  if (client.koreanbots) {
    setInterval(async () => {
      const servers = client.shard
        ? (await client.shard.fetchClientValues('guilds.cache.size') as number[]).reduce((prev: number, curr: number) => prev + curr, 0)
        : client.guilds.cache.size

      await post(`https://koreanbots.dev/api/v2/bots/${client.user?.id}/stats`)
        .set('Authorization', client.koreanbots!)
        .send({ servers })
    }, 60 * 1000)
  }
}
