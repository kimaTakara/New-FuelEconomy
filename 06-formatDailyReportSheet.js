/**
 * 日次レポートシートの書式を設定する。
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet 書式設定対象のシート
 */
function formatDailyReportSheet(sheet) {
  /** @type {number} 最終行 */
  const lastRow = sheet.getLastRow();
  /** @type {number} 最終列 */
  const lastColumn = sheet.getLastColumn();

  /**
   * A1セルに日付タイトルを設定する
   */
  // A1セルに日付タイトルを設定する
  const sheetName = sheet.getName(); // "yyyy/MM/dd"
  const titleDate = new Date(sheetName);
  const formattedTitle = Utilities.formatDate(
    titleDate,
    "Asia/Tokyo",
    "M月d日"
  );
  sheet
    .getRange("A1")
    .setValue(formattedTitle)
    .setFontWeight("bold")
    .setFontSize(12)
    .setHorizontalAlignment("center");

  // レポートシートの列番号（1始まり）を定数として定義
  const REPORT_COLUMN_INDICES = {
    destination: 1,
    startTime: 2,
    endTime: 3,
    displayEconomy: 4,
    displayDistance: 5,
    travelTime: 6,
    distance: 7,
    amount: 8,
    economy: 9,
    price: 10,
  };

  // 列の書式設定、「行き先」列の幅を200pxに設定、「表示燃費」「表示距離」列を非表示
  sheet.setColumnWidth(REPORT_COLUMN_INDICES.destination, 200);
  sheet.hideColumns(REPORT_COLUMN_INDICES.displayEconomy);
  sheet.hideColumns(REPORT_COLUMN_INDICES.displayDistance);

  /**
   * ヘッダー行の書式設定（3行目）
   */
  // ヘッダー行の書式設定（3行目）
  if (lastRow >= 3) {
    const headerRange = sheet.getRange(3, 1, 1, lastColumn);
    headerRange // 水色系の背景色、太字、中央揃え（水平・垂直）
      .setBackground("#cfe2f3") // 水色系の背景色
      .setFontWeight("bold")
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle");
  }
  /**
   * データ行とサマリー行を区別するため、データ部分の最終行を計算
   */
  // データ行とサマリー行を区別するため、データ部分の最終行を計算
  /** @type {number} サマリー行の開始行 */ let summaryStartRow = lastRow - 1; // サマリー行の開始行を計算 (デフォルトは2行)
  // アイドリング行がない場合、サマリー行は1行になる
  if (sheet.getRange(lastRow, 1).getValue() !== "アイドリング合計")
    summaryStartRow = lastRow;
  /** @type {number} サマリー行数 */ const summaryRowCount =
    lastRow - summaryStartRow + 1;
  const dataLastRow = lastRow - summaryRowCount - 1; // 空行があるため

  // データ行の書式設定 (4行目以降)
  if (dataLastRow >= 4) {
    const dataStartRow = 4;
    const numDataRows = dataLastRow - dataStartRow + 1;

    // 中央揃え（水平・垂直）
    const dataRange = sheet.getRange(dataStartRow, 1, numDataRows, lastColumn);
    dataRange.setHorizontalAlignment("center").setVerticalAlignment("middle");

    // 数値書式の設定、各列に単位と書式を適用
    const dataNumberFormats = {
      // 燃費、距離、使用量、費用の列に書式を設定
      '0.0"km/l"': [REPORT_COLUMN_INDICES.economy],
      '0.0"km"': [REPORT_COLUMN_INDICES.distance],
      '0.0"l"': [REPORT_COLUMN_INDICES.amount],
      '#,##0"円"': [REPORT_COLUMN_INDICES.price],
    };
    Object.entries(dataNumberFormats).forEach(([format, columns]) => {
      columns.forEach(col => {
        sheet
          .getRange(dataStartRow, col, numDataRows, 1)
          .setNumberFormat(format);
      });
    });

    // 「行き先」に「アイドリング」が含まれる行の背景色をオレンジ色に変更
    const destinationValues = sheet
      .getRange(dataStartRow, REPORT_COLUMN_INDICES.destination, numDataRows, 1)
      .getValues();
    destinationValues.forEach((value, index) => {
      const currentRow = dataStartRow + index;
      // value[0]は行き先のセルの値
      if (value[0] && value[0].toString().includes("アイドリング")) {
        sheet.getRange(currentRow, 1, 1, lastColumn).setBackground("#fce5cd"); // オレンジ系の背景色
      }
    });
  }

  // サマリー行の書式設定 (最後の2行)
  const summaryRange = sheet.getRange(
    summaryStartRow,
    1,
    summaryRowCount,
    lastColumn
  );
  summaryRange // 太字、垂直方向中央揃え
    .setFontWeight("bold")
    .setVerticalAlignment("middle");

  // 背景色の設定
  if (summaryRowCount === 1) {
    // アイドリングがない場合: 合計行のみ、グレーの背景色
    sheet.getRange(summaryStartRow, 1, 1, lastColumn).setBackground("#f3f3f3");
  } else if (summaryRowCount === 2) {
    // アイドリングがある場合: 合計行はグレー、アイドリング合計行はオレンジ
    sheet.getRange(summaryStartRow, 1, 1, lastColumn).setBackground("#f3f3f3"); // 合計行: グレー
    sheet
      .getRange(summaryStartRow + 1, 1, 1, lastColumn)
      .setBackground("#fce5cd"); // アイドリング合計行: オレンジ
  }

  // ラベル列(1列目)は左揃え、それ以外は中央揃え
  sheet.getRange(summaryStartRow, 1, 2, 1).setHorizontalAlignment("left");
  sheet
    .getRange(summaryStartRow, 2, summaryRowCount, lastColumn - 1)
    .setHorizontalAlignment("center");

  // 数値書式、各列に単位と書式を適用
  const summaryNumberFormats = {
    // 距離、使用量、費用の列に書式を設定
    '0.0"km"': [REPORT_COLUMN_INDICES.distance],
    '0.0"l"': [REPORT_COLUMN_INDICES.amount],
    '#,##0"円"': [REPORT_COLUMN_INDICES.price],
  };
  Object.entries(summaryNumberFormats).forEach(([format, columns]) => {
    columns.forEach(col => {
      // 合計行（とアイドリング合計行があればそれも）に数値書式を適用
      sheet
        .getRange(summaryStartRow, col, summaryRowCount, 1)
        .setNumberFormat(format);
    });
  });
}
