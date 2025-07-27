/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet 日次レポートのデータが記載されたシート
 */
function getDailyLog(sheet) {
  const columnA = sheet
    .getRange(1, 1, sheet.getLastRow(), 1)
    .getValues()
    .flat();

  // 各項目の位置(0始まり)
  const REPORT_COLUMN_CELL = {
    travelTime: 5,
    distance: 6,
    amount: 7,
    price: 9,
  };

  // A列から"合計"という値を持つセルのインデックス(0始まり)を取得
  const totalRowIndex = columnA.findIndex(cell => cell === "合計");

  // "合計" が見つからない場合はエラーを返す
  if (totalRowIndex === -1) {
    throw new Error("日次レポートに「合計」の行が見つかりません。");
  }

  // 合計、アイドリング合計データの取得
  const totalRow = sheet
    .getRange(totalRowIndex + 1, 1, 1, sheet.getLastColumn())
    .getValues()
    .flat();
  const idlingTotalRow = sheet
    .getRange(totalRowIndex + 2, 1, 1, sheet.getLastColumn())
    .getValues()
    .flat();

  const totalLog = {
    travelTime: totalRow[REPORT_COLUMN_CELL.travelTime],
    distance: totalRow[REPORT_COLUMN_CELL.distance],
    amount: totalRow[REPORT_COLUMN_CELL.amount],
    price: totalRow[REPORT_COLUMN_CELL.price],
  };

  const idlingTotalLog = !idlingTotalRow[0]
    ? { travelTime: "-", amount: "-", price: "-" }
    : {
        travelTime: idlingTotalRow[REPORT_COLUMN_CELL.travelTime],
        amount: idlingTotalRow[REPORT_COLUMN_CELL.amount],
        price: idlingTotalRow[REPORT_COLUMN_CELL.price],
      };

  return [totalLog, idlingTotalLog];
}
