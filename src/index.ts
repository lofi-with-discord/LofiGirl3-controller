import onMessage from './events/onMessage'
import Client from './structures/BotClient'

const client = new Client()

client.registEvent('message', onMessage)
