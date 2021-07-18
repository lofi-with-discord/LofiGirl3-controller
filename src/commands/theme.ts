import { Locale } from '../types'
import { Message } from 'discord.js'
import Query from '../structures/Query'
import Client from '../structures/BotClient'
import PlayerClient from '../structures/PlayerClient'
import DatabaseClient from '../structures/DatabaseClient'
import { DefaultEmbed, getYtInfo, hasPermissions } from '../utils'

const SECOND = 1000
const NUMBER_EMOJIS = [':one:', ':two:', ':three:', ':four:', ':five:', ':six:', ':seven:', ':eight:', ':nine:', ':ten:']
const NUMBER_UNICODES = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']

export default async function (client: Client, msg: Message, query: Query, locale: Locale, db: DatabaseClient, player: PlayerClient) {
  if (!msg.guild) return
  if (!msg.member) return
  if (!client.user) return

  const embedPerm = hasPermissions(client.user, msg.channel, ['EMBED_LINKS'])
  const reactPerm = hasPermissions(client.user, msg.channel, ['ADD_REACTIONS'])
  const historyPerm = hasPermissions(client.user, msg.channel, ['READ_MESSAGE_HISTORY'])
  const themes = await db.getAllThemeDatas()

  const m = await msg.channel.send(locale('theme_loading'))

  if (embedPerm) {
    const embed = new DefaultEmbed(query.cmd, msg.guild.me?.roles?.color, {
      title: locale('theme_found', themes.length),
      description: locale('theme_submit', 'https://discord.gg/WJRtvankkB')
    })

    for (const index in themes) {
      embed.addField(`${NUMBER_EMOJIS[index]} ${themes[index].name}`, themes[index].url)
    }

    if (!reactPerm) embed.setFooter(locale('theme_no_embed', client.prefix))
    if (historyPerm) m.edit('', embed)
    else m.channel.send(embed)
  } else {
    let str = locale('theme_found', themes.length)

    for (const index in themes) {
      if (!themes[index]) return
      str += `\n${NUMBER_EMOJIS[index]} ${themes[index].name}\n${themes[index].url}\n`
    }

    if (!reactPerm) str += '\n' + locale('theme_no_embed', client.prefix)
    if (historyPerm) m.edit(str)
    else m.channel.send(str)
  }

  let chosenTheme = themes[0]
  if (reactPerm) {
    for (const index in themes) {
      m.react(NUMBER_UNICODES[index])
    }

    const reactions = await m.awaitReactions((react, user) => NUMBER_UNICODES.includes(react.emoji.name) && user.id === msg.author.id, { max: 1, time: 60 * SECOND })
    const reaction = reactions.first()

    m.reactions.removeAll().catch(() => {})

    if (!reaction) {
      if (historyPerm) m.edit(locale('theme_timeout'), { embed: null })
      else m.channel.send(locale('theme_timeout'))
      return
    }

    const chosenIndex = NUMBER_UNICODES.indexOf(reaction.emoji.name)
    chosenTheme = themes[chosenIndex]

    if (!chosenTheme) {
      if (historyPerm) m.edit(locale('theme_invalid', NUMBER_EMOJIS[chosenIndex]), { embed: null })
      else m.channel.send(locale('theme_invalid', NUMBER_EMOJIS[chosenIndex]))
      return
    }
  } else {
    const messages = await msg.channel.awaitMessages((message) => message.author.id === msg.author.id && message.content.startsWith(`${client.prefix}set `), { max: 1, time: 60 * SECOND })
    const message = messages.first()

    if (!message) {
      if (historyPerm) m.edit(locale('theme_timeout'), { embed: null })
      else m.channel.send(locale('theme_timeout'))
      return
    }

    const messageQuery = new Query(client.prefix, message.content)

    const chosenIndex = parseInt(messageQuery.args[0] || '1') - 1
    chosenTheme = themes[chosenIndex]

    if (!chosenTheme) {
      if (historyPerm) m.edit(locale('theme_invalid', NUMBER_EMOJIS[chosenIndex]), { embed: null })
      else m.channel.send(locale('theme_invalid', NUMBER_EMOJIS[chosenIndex]))
      return
    }
  }

  if (historyPerm) m.edit(locale('theme_success', chosenTheme.name), { embed: null })
  else m.channel.send(locale('theme_success', chosenTheme.name))

  await db.changeTheme(msg.guild, chosenTheme.id)
  await player.clear()

  const userAt = msg.member.voice.channel
  const meAt = msg.guild.me?.voice?.channel

  if (!userAt) return

  if (meAt) {
    const membersIn = meAt.members.filter((m) => !m.user.bot && m.id !== msg.author.id).size
    const movePerm = hasPermissions(msg.author, meAt, ['MOVE_MEMBERS'])

    if (membersIn > 1) {
      if (!movePerm) {
        msg.channel.send(locale('theme_play_force_fail', meAt.name))
        return
      }

      const m = await msg.channel.send(
        locale('theme_play_force_question', meAt.name) +
          !reactPerm
          ? '\n' + locale('theme_play_force_no_react')
          : '')

      if (reactPerm) {
        m.react('✅')
        await m.awaitReactions((react, user) => react.emoji.name === '✅' && user.id === msg.author.id, { max: 1 })
      } else await msg.channel.awaitMessages((message, user) => message.content === locale('theme_play_force_no_react_answer', client.prefix) && user.id === msg.author.id, { max: 1 })
    }
  }

  const channelData = await db.getChannelData(msg.guild)

  const themeNo = channelData?.theme || 1
  const themeData = await db.getThemeData(themeNo)

  if (!themeData) return msg.channel.send(locale('theme_play_theme_fail', client.prefix))
  if (!embedPerm) return msg.channel.send(locale('theme_play_success'))

  await player.play(userAt)

  const data = await getYtInfo(themeData.url)

  const embed = new DefaultEmbed(query.cmd, msg.guild?.me?.roles.color, {
    title: data.title,
    description: locale('theme_play_detail', data.author.name, data.url)
  }).setImage(data.image)
    .setFooter(locale('theme_play_detail_footer', client.prefix))

  msg.channel.send(embed)
}

export const aliases = ['theme', '테마', '테마설정']
