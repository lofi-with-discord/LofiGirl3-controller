import { Locale } from '../types'
import { Message } from 'discord.js'
import registUser from '../functions/registUser'
import Query from '../structures/Query'
import Client from '../structures/BotClient'
import DatabaseClient from '../structures/DatabaseClient'

export default async function (client: Client, msg: Message, query: Query, locale: Locale, db: DatabaseClient) {
  const user = await db.getUserData(msg.author)

  if (!user?.locale) return

  const userData = await registUser(client, msg, db, locale.i18n)
  if (!userData) return

  msg.channel.send(locale.i18n.__({ locale: userData.locale, phrase: 'locale_success' }))
}

export const aliases = ['locale', '언어설정', 'lang']
