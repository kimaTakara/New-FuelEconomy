/**
 * HH:mm形式の時刻文字列の差分を計算する
 * @param {string} start - 開始時刻 (HH:mm)
 * @param {string} end - 終了時刻 (HH:mm)
 * @returns {number} - 差分（分）
 */
function calculateDurationInMinutes(start, end) {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  const totalMinutesStart = startHour * 60 + startMinute;
  let totalMinutesEnd = endHour * 60 + endMinute;

  if (totalMinutesEnd < totalMinutesStart) {
    totalMinutesEnd += 24 * 60;
  }

  return totalMinutesEnd - totalMinutesStart;
}
