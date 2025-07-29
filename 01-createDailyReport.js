/**
 * @typedef {object} InitRecord
 * @property {string} date - 日付 ('yyyy/MM/dd')
 * @property {number} price - ガソリン価格
 * @property {number} displayEconomy - 初期燃費
 * @property {number} displayDistance - 初期走行距離
 */

/**
 * @typedef {object} LogEntry
 * @property {string} date - 日付 ('yyyy/MM/dd')
 * @property {string} destination - 行先
 * @property {string} startTime - 出発時刻 ('HH:mm')
 * @property {string} endTime - 到着時刻 ('HH:mm')
 * @property {number} displayEconomy - 燃費
 * @property {number} displayDistance - 走行距離計の数値
 * @property {number} [travelTime] - 運転時間(分)
 * @property {number} [distance] - 運転距離(km)
 * @property {number} [amount] - ガソリン使用量(L)
 * @property {number} [economy] - 走行燃費(km/L)
 * @property {number} [price] - 走行ガソリン価格(円)
 */

/**
 * 日々の走行記録から燃費レポートを作成し、スプレッドシートに書き出すメイン関数。
 * 1. 「初期データ」シートからその日の開始時データを取得します。
 * 2. 「走行記録」シートからその日の全走行ログを取得します。
 * 3. 初期データと走行記録の日付が一致するか検証します。
 * 4. 各走行ログに、走行時間、距離、ガソリン消費量、実燃費、コストなどの計算結果を追加します。
 * 5. 日付をシート名とする新しいシートを作成（または既存シートを取得）します。
 * 6. 計算結果を整形し、ヘッダーとともにシートに書き出します。
 */
function createDailyReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  // 初期データ
  /** @type {InitRecord} */
  let initRecord;
  try {
    // 初期データの取得をtry-catchで囲む
    initRecord = getInitRecord(ss);
  } catch (e) {
    // getInitRecordで発生したエラーを捕捉し、ユーザーに通知して処理を中断
    Logger.log("エラーが発生しました: " + e.message);
    ui.alert("初期データの日付欄の値が正常ではありません。確認してください。");
    return; // メイン関数の実行を停止
  }

  // 走行記録
  /** @type {LogEntry[]} */
  const logs = getLogs(ss);

  // 初期データの日付と走行記録先頭の日付がエラーの場合は中断する
  if (initRecord.date !== logs[0].date) {
    ui.alert("初期データと走行記録の日付が一致しません。処理を中断します。");
    return;
  }

  // 各項目の追加と合計値の計算
  const totals = calculateAndSummarizeLogs(initRecord, logs);

  // シートの準備
  const dailyReportSheet =
    ss.getSheetByName(initRecord.date) || ss.insertSheet(initRecord.date);
  dailyReportSheet.clear();

  const dailyReportHeader = [
    "行き先",
    "開始時刻",
    "終了時刻",
    "表示燃費",
    "表示距離",
    "運転時間",
    "運転距離",
    "ガソリン使用量",
    "燃費",
    "ガソリン費用",
  ];
  const HEADER_ROW = 3; // ヘッダーは3行目

  const dailyReport = logs.map(log => {
    return [
      log.destination,
      log.startTime,
      log.endTime,
      log.displayEconomy,
      log.displayDistance,
      minutesToHourMinute(log.travelTime),
      log.distance,
      log.amount,
      log.economy,
      log.price,
    ];
  });

  // サマリー行の作成
  const summaryRows = [
    Array(dailyReportHeader.length).fill(""), // 空行 (ヘッダーと同じ列数の空要素を作成)
    [
      // 合計行
      "合計",
      "", // startTime
      "", // endTime
      "", // displayEconomy
      "", // displayDistance
      minutesToHourMinute(totals.totalTravelTime),
      totals.totalDistance, // distance
      totals.totalAmount,
      "", // economy
      totals.totalPrice,
    ],
  ];

  // totals.idlingTravelTime が 0 でない場合のみ、"アイドリング合計" 行を追加
  if (totals.idlingTravelTime !== 0) {
    summaryRows.push([
      "アイドリング合計",
      "",
      "",
      "",
      "",
      minutesToHourMinute(totals.idlingTravelTime),
      "",
      totals.idlingAmount,
      "",
      totals.idlingPrice,
    ]);
  }

  const valuesToWrite = [dailyReportHeader, ...dailyReport, ...summaryRows];

  dailyReportSheet
    .getRange(HEADER_ROW, 1, valuesToWrite.length, dailyReportHeader.length)
    .setValues(valuesToWrite);

  // シート位置を3つ目にする
  ss.setActiveSheet(dailyReportSheet);
  ss.moveActiveSheet(3);

  // dailyReportSheetのフォーマット
  formatDailyReportSheet(dailyReportSheet);
}
