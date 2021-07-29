import { get } from 'superagent'
import { Locale } from '../types'
import { Message } from 'discord.js'
import Query from '../structures/Query'
import Client from '../structures/BotClient'
import registUser from '../functions/registUser'
import I18nParser from '../structures/I18nParser'
import PlayerClient from '../structures/PlayerClient'
import { DefaultEmbed, hasPermissions } from '../utils'
import DatabaseClient from '../structures/DatabaseClient'

const voteCache = [] as string[]

export default function onMessage (db: DatabaseClient, i18n: I18nParser, player: PlayerClient) {
  return async function (client: Client, msg: Message) {
    if (!client.user) return
    if (msg.author.bot) return

    if (msg.channel.type === 'dm') {
      msg.channel.send(i18n.__l('dm_disallow').join('\n'))
      return
    }

    if (msg.mentions.has(client.user, { ignoreEveryone: true, ignoreRoles: true })) {
      const m = await msg.channel.send(i18n.__l('mention_call_1').join('\n'))
      setTimeout(() => m.edit(i18n.__l('mention_call_2').join('\n').replace(/%1\$s/g, client.prefix)), 500)
      return
    }

    if (!msg.content.startsWith(client.prefix)) return
    if (!hasPermissions(client.user, msg.channel, ['SEND_MESSAGES'])) return

    const query = new Query(client.prefix, msg.content)
    const target = client.commands.find((command) => command.aliases.includes(query.cmd))

    if (!target) return

    let userData = await db.getUserData(msg.author)
    if (!userData) userData = await registUser(client, msg, db, i18n)

    const locale: Locale = (phrase: string, ...args: any[]) =>
      i18n.__({ locale: userData?.locale, phrase }, ...args)

    locale.i18n = i18n

    if (!client.koreanbots) return target.default(client, msg, query, locale, db, player)
    if (voteCache.includes(msg.author.id)) return target.default(client, msg, query, locale, db, player)

    const { status, body } = await get(`https://koreanbots.dev/api/v2/bots/${client.user.id}/vote?userID=${msg.author.id}`)
      .set('Authorization', client.koreanbots)
      .catch((err) => { console.log(err); return { status: 400, body: { } } })

    if (status !== 200 || body?.data?.voted) return target.default(client, msg, query, locale, db, player)

    const perm2 = hasPermissions(client.user, msg.channel, ['EMBED_LINKS'])
    if (!perm2) return msg.channel.send(locale('give_me_heart_no_embed', `https://koreanbots.dev/bots/${client.user.id}`))

    const embed = new DefaultEmbed('welcome', null, {
      title: locale('give_me_heart_title'),
      description:
        locale('give_me_heart_description') + '\n\n' +
        locale('give_me_heart_button_1', `https://koreanbots.dev/bots/${client.user.id}`) + ' • ' +
        locale('give_me_heart_button_2', 'https://github.com/lofi-with-discord/controller')
    })

    msg.channel.send(embed)
  }
}
