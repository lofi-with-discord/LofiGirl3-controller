import { Locale } from '../types'
import { Message } from 'discord.js'
import Query from '../structures/Query'
import Client from '../structures/BotClient'
import PlayerClient from '../structures/PlayerClient'
import DatabaseClient from '../structures/DatabaseClient'
import { DefaultEmbed, getYtInfo, hasPermissions } from '../utils'

export default async function (client: Client, msg: Message, query: Query, locale: Locale, db: DatabaseClient, player: PlayerClient) {
  if (!msg.guild) return
  if (!msg.member) return
  if (!client.user) return
  if (!msg.member.voice.channel) return msg.channel.send(locale('play_no_voice'))
  if (!msg.member.voice.channel.joinable) return msg.channel.send(locale('play_not_joinable'))
  if (!msg.member.voice.channel.speakable) return msg.channel.send(locale('play_not_speakable'))

  const userAt = msg.member.voice.channel
  const meAt = msg.guild.me?.voice?.channel
  const embedPerm = hasPermissions(client.user, msg.channel, ['EMBED_LINKS'])

  if (meAt) {
    const membersIn = meAt.members.filter((m) => !m.user.bot && m.id !== msg.author.id).size
    const movePerm = hasPermissions(msg.author, meAt, ['MOVE_MEMBERS'])
    const reactPerm = hasPermissions(client.user, meAt, ['ADD_REACTIONS'])

    if (membersIn > 1) {
      if (!movePerm) {
        msg.channel.send(locale('play_force_fail', meAt.name))
        return
      }

      const m = await msg.channel.send(
        locale('play_force_question', meAt.name) +
          !reactPerm
          ? '\n' + locale('play_force_no_react')
          : '')

      if (reactPerm) {
        m.react('✅')
        await m.awaitReactions((react, user) => react.emoji.name === '✅' && user.id === msg.author.id, { max: 1 })
      } else await msg.channel.awaitMessages((message, user) => message.content === locale('play_force_no_react_answer', client.prefix) && user.id === msg.author.id, { max: 1 })
    }
  }

  const channelData = await db.getChannelData(msg.guild)

  const themeNo = channelData?.theme || 1
  const themeData = await db.getThemeData(themeNo)

  if (!themeData) return msg.channel.send(locale('play_theme_fail', client.prefix))
  if (!embedPerm) return msg.channel.send(locale('play_success'))

  await player.play(userAt)

  const data = await getYtInfo(themeData.url)

  const embed = new DefaultEmbed(query.cmd, msg.guild?.me?.roles.color, {
    title: data.title,
    description: locale('play_detail', data.author.name, data.url)
  }).setImage(data.image)
    .setFooter(locale('play_detail_footer', client.prefix))

  msg.channel.send(embed)
}

export const aliases = ['play', 'join', '재생', '시작']
