/**
 * 日次レポートの合計ログ
 * @typedef {object} TotalLog
 * @property {Date} travelTime - 合計運転時間(○時間○分)
 * @property {number} distance - 合計運転距離(km)
 * @property {number} amount - 合計ガソリン使用量(L)
 * @property {number} price - 合計ガソリン費用(円)
 * @property {number} paid - ガソリン支給額(円)
 */

/**
 * 日次レポートのアイドリング合計ログ
 * @typedef {object} IdlingTotalLog
 * @property {Date} travelTime - アイドリング合計時間(○時間○分)
 * @property {number} amount - アイドリング合計ガソリン使用量(L)
 * @property {number} price - アイドリング合計ガソリン費用(円)
 */

function createMonthlyReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const dailyReportSheet = ss.getActiveSheet();

  // シート名(日付)と月を取得
  const sheetDate = dailyReportSheet.getSheetName();
  if (isNaN(new Date(sheetDate).getTime())) {
    ui.alert("シートが日報ではありません。確認してください。");
    return;
  }
  const sheetDateMonth = new Date(sheetDate).getMonth() + 1;

  // 各種データの取得
  /** @type {[TotalLog, IdlingTotalLog]} */
  const [totalLog, idlingTotalLog] = getDailyLog(dailyReportSheet);

  // 仕事日かどうか確認
  // 仕事日ならば金額を入力してもらってtotalLogに追加
  const resWorkDay = ui.alert("仕事日でしたか?", ui.ButtonSet.YES_NO);
  if (resWorkDay === ui.Button.YES) {
    const moneyRes = ui.prompt("支給ガソリン代を入力してください");
    const moneyStr = moneyRes.getResponseText();
    const money = parseInt(moneyStr, 10);
    totalLog.paid = money;
  }

  // 月報シートの取得
  /**
   * @param {GoogleAppsScript.Spreadsheet.Sheet} */
  const monthlyReportSheet =
    ss.getSheetByName(`${sheetDateMonth}月月報`) ||
    createMonthlyReportSheet(ss, sheetDateMonth);

  // データを作ってappendRow
  const appendRecord = [
    sheetDate,
    totalLog.travelTime,
    totalLog.distance,
    totalLog.amount,
    totalLog.price,
    idlingTotalLog.travelTime,
    idlingTotalLog.amount,
    idlingTotalLog.price,
  ];

  if (Object.hasOwn(totalLog, "paid")) {
    appendRecord.push(totalLog.paid);
  }

  monthlyReportSheet.appendRow(appendRecord);

    // シート位置を3つ目にする
  ss.setActiveSheet(monthlyReportSheet);
  ss.moveActiveSheet(3);

  // appendRecordのフォーマット
  formatMonthlyReport(monthlyReportSheet, appendRecord);
}
