/**
 * スプレッドシート上の「走行記録」シートのヘッダー行を除く全データをクリアします。
 * スプレッドシート上の指定されたシートのヘッダー行を除く全データをクリアします。
 * 主に「走行記録」シートのデータをクリアするのに使用します。
 */
function clearDrivingRecordSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  // 「走行記録」シートを取得
  const sheet = ss.getSheetByName("走行記録");

  // シートが存在しない場合はエラーメッセージを表示
  if (!sheet) {
    ui.alert("エラー", "「走行記録」シートが見つかりません。", ui.ButtonSet.OK);
    return;
  }

  // ユーザーに確認を求める
  const response = ui.alert(
    "確認",
    "「走行記録」シートのヘッダー行を除く全てのデータをクリアします。よろしいですか？",
    ui.ButtonSet.YES_NO
  );

  // 「いいえ」が選択された場合は処理を中断
  if (response === ui.Button.NO) {
    ui.alert("処理がキャンセルされました。");
    return;
  }

  // 初期データシートを取得
  const initRecordSheet = ss.getSheetByName("初期データ");
  if (!initRecordSheet) {
    ui.alert("エラー", "「初期データ」シートが見つかりません。", ui.ButtonSet.OK);
    return;
  }

  // ヘッダー行（1行目）を除くデータをクリア
  // データが2行目から始まることを想定
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();

  // 最終行のF列とG列のデータを取得
  // F列はdisplayEconomy、G列はdisplayDistance
  const displayEconomy = sheet.getRange(lastRow, 6).getValue();
  const displayDistance = sheet.getRange(lastRow, 7).getValue();

  // 初期データのD2とE2に書き込む
  // D2はdisplayEconomy、E2はdisplayDistance
  initRecordSheet.getRange("D2").setValue(displayEconomy);
  initRecordSheet.getRange("E2").setValue(displayDistance);

  // 初期データのB2を消去
  // B2は日付
  initRecordSheet.getRange("B2").clearContent();

  // 処理完了メッセージ
  ui.alert("情報", "初期データが更新されました。", ui.ButtonSet.OK);


  // 2行目以降にデータが存在する場合のみクリアを実行
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, lastColumn).clearContent();
    ui.alert("完了", "「走行記録」シートのデータがクリアされました。", ui.ButtonSet.OK);
  } else {
    ui.alert("情報", "「走行記録」シートにはクリアするデータがありませんでした。", ui.ButtonSet.OK);
  }
}
