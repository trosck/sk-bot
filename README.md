docker
npm run dev
ngrok http 3000
change interactions url https://discord.com/developers/applications/1417518423969108122/information


# 1
перенести код из commands.ts в interactions/index.ts

# 2
написать отдельный метод для отправки сообщений
и на него навесить декоратор @WithRetry
с возможностью настройки кол-ва ретраев,
времени задержки и тд(?)
