/**
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 */

function getLogs(ss) {
  const logsSheet = ss.getSheetByName("走行記録");
  const logs = logsSheet.getDataRange().getValues().slice(1);

  const LOG_COLUMN_INDICES = {
    id: 0, // 使わない
    date: 1,
    destination: 2,
    start: 3,
    end: 4,
    economy: 5,
    distance: 6,
  };

  return logs.map(row => {
    return {
      date: Utilities.formatDate(
        row[LOG_COLUMN_INDICES.date],
        "Asia/Tokyo",
        "yyyy/MM/dd"
      ),
      destination: row[LOG_COLUMN_INDICES.destination],
      startTime: Utilities.formatDate(
        row[LOG_COLUMN_INDICES.start],
        "Asia/Tokyo",
        "HH:mm"
      ),
      endTime: Utilities.formatDate(
        row[LOG_COLUMN_INDICES.end],
        "Asia/Tokyo",
        "HH:mm"
      ),
      displayEconomy: row[LOG_COLUMN_INDICES.economy],
      displayDistance: row[LOG_COLUMN_INDICES.distance],
    };
  });
}
