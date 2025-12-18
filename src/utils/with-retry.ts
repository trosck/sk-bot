// export async function withRetry(cb: Promise<any>) {
//   let attempt = 0
//   const retries = 3
//   while (attempt < retries) {
//     await cb()
//   }
// }

/**
 * написать отдельный метод для отправки сообщений
 * и на него навесить декоратор @WithRetry
 * с возможностью настройки кол-ва ретраев,
 * времени задержки и тд(?)
 */
