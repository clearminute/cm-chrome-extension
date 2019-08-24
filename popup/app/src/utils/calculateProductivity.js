export default gaugeStats => {
  const {
    productive,
    neutral,
    distracting,
    slightlyDistracting,
    slightlyProductive,
    unassigned
  } = gaugeStats;

  const productiveTime =
    1 * productive.totalTime +
    0.75 * slightlyProductive.totalTime +
    0.5 * (neutral.totalTime + unassigned.totalTime) +
    0.25 * slightlyDistracting.totalTime;

  const totalTime =
    productive.totalTime +
    slightlyProductive.totalTime +
    neutral.totalTime +
    slightlyDistracting.totalTime +
    distracting.totalTime +
    unassigned.totalTime;

  const score = totalTime === 0 ? 0.5 : productiveTime / totalTime;

  return `${parseInt(score * 100, 10)}`;
};
