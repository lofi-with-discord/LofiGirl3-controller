import { Message } from 'discord.js'
import Client from '../structures/BotClient'
import DatabaseClient from '../structures/DatabaseClient'
import I18nParser from '../structures/I18nParser'
import PlayerClient from '../structures/PlayerClient'
import Query from '../structures/Query'

export type LocaleFn = (phrase: string, ...args: any[]) => string
export interface Locale extends LocaleFn {
  i18n: I18nParser
}

export interface Command {
  default: (client: Client, msg: Message, query: Query, locale: Locale, db: DatabaseClient, player: PlayerClient) => any
  aliases: string[]
}

export interface UserData {
  id: string
  locale: string
}

export interface ChannelData {
  id: string
  guild: string
  theme: number
}

export interface ThemeData {
  id: number
  name: string
  url: string
}
