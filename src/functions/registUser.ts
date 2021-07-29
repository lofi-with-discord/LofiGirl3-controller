import { EmbedField, Message } from 'discord.js'
import BotClient from '../structures/BotClient'
import DatabaseClient from '../structures/DatabaseClient'
import I18nParser from '../structures/I18nParser'
import { DefaultEmbed, hasPermissions } from '../utils'

export default async function registUser (client: BotClient, msg: Message, db: DatabaseClient, i18n: I18nParser) {
  const perm = hasPermissions(client.user!, msg.channel, ['ADD_REACTIONS', 'EMBED_LINKS'])

  const flags = i18n.__l('flag')
  const locales = i18n.__l('locale')
  const localeIds = i18n.getLocales()
  const translaters = i18n.__l('translaters')

  if (!perm) {
    // permission fallback
    const messages = [] as string[]

    for (const index in flags) {
      messages.push(
        `${flags[index]} ${locales[index]} (\`${client.prefix}set ${localeIds[index]}\`)\n` +
        `- ${translaters[index]}`
      )
    }

    const m = await msg.channel.send('**Select a language**\n\n' + messages.join('\n\n'))

    const collected =
      await m.channel.awaitMessages((m) =>
        m.author.id === msg.author.id &&
        m.content.startsWith(`${client.prefix}set `) &&
        localeIds.includes(m.content.split(' ')[1]), { max: 1 })

    if (!collected.first()) return

    const [, choice] = collected.first()!.content.split(' ')
    const data = { id: msg.author.id, locale: choice }
    await db.appendUserData(data)

    return data
  }

  const fields = [] as EmbedField[]

  for (const index in flags) {
    fields.push({
      name: `${flags[index]} ${locales[index]}`,
      value: translaters[index],
      inline: true
    })
  }

  const embed = new DefaultEmbed('oobe', null, { title: 'Select a language', fields })

  const m = await msg.channel.send(embed)
  flags.forEach((flag) => m.react(flag))

  const collected = await m.awaitReactions((r, u) => flags.includes(r.emoji.name) && u.id === msg.author.id, { max: 1 })

  if (!collected.first()) return
  const choice = flags.findIndex((flag) => flag === collected.first()?.emoji.name)
  const data = { id: msg.author.id, locale: localeIds[choice] }
  await db.appendUserData(data)

  return data
}
