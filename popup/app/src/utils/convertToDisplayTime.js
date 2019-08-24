export default function convertToDisplayTime(seconds = 0) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const displayTime = hours ? `${hours}h ${minutes}m` : `${minutes}m`;

  return displayTime;
}
