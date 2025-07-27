function minutesToHourMinute(minutes) {
  if (minutes < 60) {
    return `${minutes}分`;
  }

  return `${Math.floor(minutes / 60)}時間${minutes % 60}分`;
}
