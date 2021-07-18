import onReady from './events/onReady'
import onMessage from './events/onMessage'
import Client from './structures/BotClient'
import I18nParser from './structures/I18nParser'
import PlayerClient from './structures/PlayerClient'
import DatabaseClient from './structures/DatabaseClient'

const client = new Client()
const i18n = new I18nParser()
const db = new DatabaseClient()
const player = new PlayerClient()

client.registEvent('ready', onReady)
client.registEvent('message', onMessage(db, i18n, player))
