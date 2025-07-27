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
 * @typedef {object} Totals
 * @property {number} totalTravelTime - 合計運転時間（アイドリング時間を除く）
 * @property {number} totalDistance - 合計走行距離
 * @property {number} totalAmount - 合計ガソリン使用量
 * @property {number} totalPrice - 合計ガソリン費用
 * @property {number} idlingTravelTime - アイドリング合計時間
 * @property {number} idlingAmount - アイドリング合計ガソリン使用量
 * @property {number} idlingPrice - アイドリング合計ガソリン費用
 */

/**
 * 各走行記録に計算結果を追加し、同時に合計値も算出します。
 * この関数は引数で受け取った`logs`配列を直接変更（ミューテーション）します。
 * @param {InitRecord} initRecord 初期データ
 * @param {LogEntry[]} logs 走行記録の配列。この配列の各要素に計算結果のプロパティが追加されます。
 * @returns {Totals} 計算された合計値のオブジェクト
 */
function calculateAndSummarizeLogs(initRecord, logs) {
  const totals = {
    totalTravelTime: 0,
    totalDistance: 0,
    totalAmount: 0,
    totalPrice: 0,
    idlingTravelTime: 0,
    idlingAmount: 0,
    idlingPrice: 0,
  };

  logs.forEach((log, i) => {
    // 1行目と2行目で元計算式を分ける
    const prevRecord = i === 0 ? initRecord : logs[i - 1];

    log.travelTime = calculateDurationInMinutes(log.startTime, log.endTime); // 運転時間
    log.distance = log.displayDistance - prevRecord.displayDistance; // 運転距離

    // 各時点での総ガソリン使用量を計算（ゼロ除算を防止）
    const totalAmountStart = prevRecord.displayEconomy ? prevRecord.displayDistance / prevRecord.displayEconomy : 0;
    const totalAmountEnd = log.displayEconomy ? log.displayDistance / log.displayEconomy : 0;
    // 今回の走行でのガソリン使用量
    log.amount = totalAmountEnd - totalAmountStart;

    // 走行燃費（ゼロ除算を避けるためのチェックを追加）
    log.economy = log.amount ? log.distance / log.amount : 0;

    // 走行ガソリン価格（単価はinitRecordのものを常に使用）
    log.price = log.amount * initRecord.price;

    // 合計値への加算
    totals.totalTravelTime += log.travelTime;
    totals.totalDistance += log.distance;
    totals.totalAmount += log.amount;
    totals.totalPrice += log.price;

    if (log.destination.includes("アイドリング")) {
      totals.idlingTravelTime += log.travelTime;
      totals.idlingAmount += log.amount;
      totals.idlingPrice += log.price;
    }
  });

  // 総運転時間からアイドリング時間を差し引く
  totals.totalTravelTime -= totals.idlingTravelTime;

  return totals;
}
