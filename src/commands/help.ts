import { Locale } from '../types'
import Query from '../structures/Query'
import Client from '../structures/BotClient'
import { EmbedField, Message } from 'discord.js'
import { DefaultEmbed, hasPermissions } from '../utils'

export default async function (client: Client, msg: Message, query: Query, locale: Locale) {
  if (!client.user) return
  const embedPerm = hasPermissions(client.user, msg.channel, ['EMBED_LINKS'])
  const reactPerm = hasPermissions(client.user, msg.channel, ['ADD_REACTIONS'])
  const historyPerm = hasPermissions(client.user, msg.channel, ['READ_MESSAGE_HISTORY'])

  if (!embedPerm) {
    const messages = [] as string[]
    for (const command of client.commands) {
      if (!command.aliases) continue

      const name = command.aliases.reduce((acc, alias) => `${acc} \`${client.prefix}${alias}\``, '')
      messages.push(`${name}\n${locale(`${command.aliases[0]}_help`)}`)
    }

    msg.channel.send(messages.join('\n\n'))
    return
  }

  let m: Message | undefined

  if (reactPerm) {
    const embed = new DefaultEmbed('', msg.guild?.me?.roles.color, {
      description: ':radio: 24/7 radio player for discord\n- developed by `Dev. PMH#7086`'
    }).setImage('https://i.ytimg.com/vi/5qap5aO4i9A/maxresdefault.jpg')
      .setFooter('* illustration by Juan Pablo Machado (http://jpmachado.art)')

    m = await msg.channel.send(locale('help_continue'), embed)

    m.react('🚩')

    await m.awaitReactions((react, user) => react.emoji.name === '🚩' && user.id === msg.author.id, { max: 1 })
    m.reactions.removeAll().catch(() => {})
  }

  const fields = [] as EmbedField[]
  for (const command of client.commands) {
    if (!command.aliases) continue

    const name = command.aliases.reduce((acc, alias) => `${acc} \`${client.prefix}${alias}\``, '')
    fields.push({ name, value: locale(`${command.aliases[0]}_help`), inline: false })
  }

  const embed2 = new DefaultEmbed(query.cmd, msg.guild?.me?.roles.color)
    .addFields(fields)
    .setImage('https://cdn.discordapp.com/attachments/530043751901429762/812601825568096287/Peek_2021-02-20_17-29.gif')

  if (historyPerm && m) m.edit('', embed2)
  else msg.channel.send(embed2)
}

export const aliases = ['help', '도움', '도움말', '명령어']
