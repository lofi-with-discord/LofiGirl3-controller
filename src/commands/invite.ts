import { Locale } from '../types'
import { Message } from 'discord.js'
import Query from '../structures/Query'
import Client from '../structures/BotClient'
import { DefaultEmbed, hasPermissions } from '../utils'

export default function (client: Client, msg: Message, query: Query, locale: Locale) {
  if (!client.user) return
  const perm = hasPermissions(client.user, msg.channel, ['EMBED_LINKS'])

  const url = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=0&scope=bot`

  if (!perm) {
    return msg.channel.send(
      `${locale('invite_title')}\n` +
      `${url}\n\n` +
      `${locale('invite_description', 'https://discord.gg/WJRtvankkB')}`)
  }

  const embed = new DefaultEmbed(query.cmd, msg.guild?.me?.roles.color, {
    url,
    title: locale('invite_title'),
    description: locale('invite_description', 'https://discord.gg/WJRtvankkB')
  })

  msg.channel.send(embed)
}

export const aliases = ['invite', 'support', '초대', '초대링크']
