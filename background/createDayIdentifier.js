export default function createDayIdentifier(date) {
  const from = new Date(date);
  const day = ('0' + from.getDate()).slice(-2);
  const month = ('0' + (from.getMonth() + 1)).slice(-2);
  const year = from.getFullYear();

  return `${year}.${month}.${day}`;
}
