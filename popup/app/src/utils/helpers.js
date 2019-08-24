export function calculatePercentage(part, total, defaultValue = 0) {
  // eslint-disable-line import/prefer-default-export, max-len
  if (total === 0) {
    return defaultValue;
  }

  return part / total;
}
