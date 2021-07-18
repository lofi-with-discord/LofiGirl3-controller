import { Message } from 'discord.js'
import Client from '../structures/BotClient'
import Query from '../structures/Query'
import { Locale } from '../types'

export default function (client: Client, msg: Message, _: Query, locale: Locale) {
  msg.channel.send(locale('ping_success', client.ws.ping))
}

export const aliases = ['ping', '핑', 'pong']
