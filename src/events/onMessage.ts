import { Message } from 'discord.js'
import BotClient from '../structures/BotClient'

export default function onMessage (client: BotClient, msg: Message) {
  if (!msg.content.startsWith(client.prefix)) return

  msg.channel.send(
    `\`${client.prefix}\`를 사용한 명령어는 지원 종료 되었습니다. \`/\`를 사용해 주세요\n` +
    '만약 `/` 명령어가 보이지 않을 경우 빗금명령어 권한을 확인하거나 다음 주소를 통해 다시 초대해 보세요: \n' +
    `https://discord.com/api/oauth2/authorize?client_id=${client.user?.id}&permissions=0&scope=applications.commands%20bot\n` +
    '\n' +
    `legacy (\`${client.prefix}\`) commands have been deprecated. Please use \`/\` instead.\n` +
    'if `/` commands are not displayed, check your permissions or use the following link to invite again: \n' +
    `https://discordapp.com/api/oauth2/authorize?client_id=${client.user?.id}&permissions=0&scope=applications.commands%20bot\n`
  )
}
