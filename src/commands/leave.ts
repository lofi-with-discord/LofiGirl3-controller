import { Locale } from '../types'
import { Message } from 'discord.js'
import Query from '../structures/Query'
import { hasPermissions } from '../utils'
import Client from '../structures/BotClient'
import PlayerClient from '../structures/PlayerClient'
import DatabaseClient from '../structures/DatabaseClient'

export default async function (client: Client, msg: Message, _: Query, locale: Locale, __: DatabaseClient, player: PlayerClient) {
  if (!msg.guild) return
  if (!msg.member) return
  if (!client.user) return

  const meAt = msg.guild.me?.voice?.channel
  const userAt = msg.member.voice.channel

  if (!meAt) return msg.channel.send(locale('leave_no_voice'))

  const movePerm = hasPermissions(msg.author, meAt, ['MOVE_MEMBERS'])
  const reactPerm = hasPermissions(client.user, msg.channel, ['ADD_REACTIONS'])

  const membersIn = meAt.members.filter((m) => !m.user.bot && m.id !== msg.author.id).size
  const userIn = (!userAt || meAt.id !== userAt.id) ? 1 : 2

  if (membersIn < 1) {
    await player.stop(meAt)
    msg.channel.send(locale('leave_success'))
    return
  }

  if (!movePerm) return msg.channel.send(locale('leave_force_fail_' + userIn, meAt.name))

  const m = await msg.channel.send(
    locale('leave_force_question_' + userIn, meAt.name) +
      !reactPerm
      ? '\n' + locale('leave_force_no_react')
      : '')

  if (reactPerm) {
    m.react('✅')
    await m.awaitReactions((react, user) => react.emoji.name === '✅' && user.id === msg.author.id, { max: 1 })
  } else await msg.channel.awaitMessages((message, user) => message.content === locale('leave_force_no_react_answer', client.prefix) && user.id === msg.author.id, { max: 1 })

  await player.stop(meAt)
}

export const aliases = ['leave', 'stop', '정지', '나가기']
