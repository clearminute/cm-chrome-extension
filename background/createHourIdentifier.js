export default function createHourIdentifier(date) {
  const from = new Date(date);
  const hours = ('0' + from.getHours()).slice(-2);
  const day = ('0' + from.getDate()).slice(-2);
  const month = ('0' + (from.getMonth() + 1)).slice(-2);
  const year = from.getFullYear();

  return `${year}.${month}.${day}.${hours}`;
}
