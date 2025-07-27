/**
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss このスプレッドシート
 */

function createMonthlyReportSheet(ss, month) {
  const sheet = ss.insertSheet(`${month}月月報`);
  const header = [
    "日付",
    "運転時間",
    "運転距離",
    "使用量",
    "費用",
    "アイドリング時間",
    "idling量",
    "idling費用",
    "支給",
    "差額",
  ];
  sheet
    .getRange(1, 1, 1, header.length)
    .setValues([header])
    .setHorizontalAlignment("center");

  // 列の幅を90にする(日付を除く)
  sheet.setColumnWidths(2, 10, 90); // 10行は念のため多めに設定
  return sheet;
}
