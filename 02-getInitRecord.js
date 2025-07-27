/**
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss このスプレッドシート
 */
// 初期データ
function getInitRecord(ss) {
  // 各データのインデックス(0始まり)
  const INITIAL_COLUMN_INDICES = {
    date: 0,
    price: 1,
    economy: 2,
    distance: 3,
  };

  const initRecordSheet = ss.getSheetByName("初期データ");
  const initData = initRecordSheet
    .getRange(
      2,
      INITIAL_COLUMN_INDICES.date + 2, // 日時は2行目から
      1,
      INITIAL_COLUMN_INDICES.distance + 2 // 距離は5行目まで
    )
    .getValues()
    .flat();

  // 日付の有効性をチェック
  const rawDateValue = initData[INITIAL_COLUMN_INDICES.date];
  const dateObj = new Date(rawDateValue);
  if (isNaN(dateObj.getTime())) {
    throw new Error(
      `「初期データ」シートの日付が不正です: '${rawDateValue}'。有効な日付形式か確認してください。`
    );
  }

  return {
    date: Utilities.formatDate(
      initData[INITIAL_COLUMN_INDICES.date],
      "Asia/Tokyo",
      "yyyy/MM/dd"
    ),
    price: initData[INITIAL_COLUMN_INDICES.price],
    displayEconomy: initData[INITIAL_COLUMN_INDICES.economy],
    displayDistance: initData[INITIAL_COLUMN_INDICES.distance],
  };
}
