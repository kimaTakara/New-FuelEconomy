/**
 * 月報シートに追加された行の書式を設定します。
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - 書式を設定するシートオブジェクト
 * @param {Array<string|number>} record - シートに追加された行のデータ配列
 */
function formatMonthlyReport(sheet, record) {
  const lastRow = sheet.getLastRow();
  const range = sheet.getRange(lastRow, 1, 1, record.length);

  const MONTHLY_REPORT_COLUMN = {
    date: 1,
    travelTime: 2,
    distance: 3,
    amount: 4,
    price: 5,
    idlingTime:6,
    idlingAmount: 7,
    idlingPrice: 8,
    allowance: 9,
    difference: 10,
  };

  // 垂直方向は行全体を中央揃えに
  range.setVerticalAlignment("middle");

  // 水平方向の配置設定
  // 1列目(日付)と 2列目(運転時間)を中央揃え
  sheet.getRange(lastRow, 1, 1, 2).setHorizontalAlignment("center");
  // 3列目以降を右寄せ (3列目以降が存在する場合)
  if (record.length > 2) {
    sheet
      .getRange(lastRow, MONTHLY_REPORT_COLUMN.distance, 1, record.length - 2)
      .setHorizontalAlignment("right");
  }
  // 6列目(アイドリング時間)を中央揃えに上書き
  sheet
    .getRange(lastRow, MONTHLY_REPORT_COLUMN.idlingTime)
    .setHorizontalAlignment("center");

  // 数値書式の設定
  const numberFormats = {
    '0.0"km"': [MONTHLY_REPORT_COLUMN.distance], // 運転距離
    '0.0"l"': [
      MONTHLY_REPORT_COLUMN.amount,
      MONTHLY_REPORT_COLUMN.idlingAmount,
    ], // 使用量, idling量
    '#,##0"円"': [
      MONTHLY_REPORT_COLUMN.price,
      MONTHLY_REPORT_COLUMN.idlingPrice,
      MONTHLY_REPORT_COLUMN.allowance,
      MONTHLY_REPORT_COLUMN.difference,
    ], // 費用, idling費用, 支給, 差額
  };

  Object.entries(numberFormats).forEach(([format, columns]) => {
    columns.forEach(col => {
      // record配列の長さを超える列には適用しない（例：支給がない場合）
      if (col <= record.length) {
        sheet.getRange(lastRow, col).setNumberFormat(format);
      }
    });
  });

  // --- 条件付き背景色の設定 ---

  // 支給があれば運転時間のセルを薄い青系の背景色に
  // 差額を出力し、赤字の時は文字を赤にする
  // record[8] (支給) が存在する場合、record.length は 9 になる
  if (record.length >= MONTHLY_REPORT_COLUMN.allowance) {
    // 仕事の日は日付から費用までのセルを青系の背景色に
    sheet
      .getRange(
        lastRow,
        MONTHLY_REPORT_COLUMN.date,
        1,
        MONTHLY_REPORT_COLUMN.price
      )
      .setBackground("#cfe2f3");
    const differValue =
      record[MONTHLY_REPORT_COLUMN.allowance - 1] -
      record[MONTHLY_REPORT_COLUMN.price - 1];
    const DIFFERENCE_CELL = sheet.getRange(
      lastRow,
      MONTHLY_REPORT_COLUMN.difference
    );
    DIFFERENCE_CELL.setValue(differValue)
      .setNumberFormat('#,##0"円"')
      .setHorizontalAlignment("right");
    if (differValue < 0) {
      DIFFERENCE_CELL.setFontColor("red");
    }
  }

  // アイドリング時間(record[5])が'-'でない場合、idling関連のセルをオレンジ系の背景色に
  if (record[MONTHLY_REPORT_COLUMN.idlingTime - 1] !== "-") {
    sheet
      .getRange(lastRow, MONTHLY_REPORT_COLUMN.idlingTime, 1, 3)
      .setBackground("#fce5cd"); // idling時間(6列目)からidling費用(8列目)まで
  }
}
