import { Message } from 'discord.js'
import Client from '../structures/BotClient'
import DatabaseClient from '../structures/DatabaseClient'
import PlayerClient from '../structures/PlayerClient'
import Query from '../structures/Query'
import { Locale } from '../types'

export default async function (client: Client, msg: Message, _: Query, locale: Locale, db: DatabaseClient, player: PlayerClient) {
  if (!msg.guild) return
  if (!msg.member) return

  if (!msg.member.hasPermission('MANAGE_CHANNELS')) return msg.channel.send(locale('mark_no_permission', msg.member.displayName))
  if (!msg.member.voice.channel) return msg.channel.send(locale('mark_no_voice'))
  if (!msg.member.voice.channel.joinable) return msg.channel.send(locale('mark_not_joinable'))
  if (!msg.member.voice.channel.speakable) return msg.channel.send(locale('mark_not_speakable'))

  await db.markChannel(msg.guild, msg.member.voice.channel)

  msg.channel.send(locale('mark_success', msg.member.voice.channel.name, client.prefix))

  if (!msg.guild.me?.voice?.channel) {
    await player.clear()
    await player.play(msg.member.voice.channel)
  }
}

export const aliases = ['mark', 'select', 'target', '채널', '채널설정', '항상재생']
