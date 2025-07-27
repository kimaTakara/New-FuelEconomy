// 日報作成・月報作成をメニューに追加
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("処理")
    .addItem("日報作成", "executionConfirmationCreateDailySheet")
    .addSeparator()
    .addItem("月報作成", "executionConfirmationCreateMonthlySheet")
    .addToUi();
}

// 走行記録シートを日報に変換するのか確認
function executionConfirmationCreateDailySheet() {
  // キャンセルの場合はスクリプト終了
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    '"走行記録"シートを日報に変換しますか？',
    ui.ButtonSet.OK_CANCEL
  );
  if (response === ui.Button.CANCEL) {
    ui.alert("処理をキャンセルしました");
    return;
  }
  // 日報処理に進む
  createDailyReport();
}

// このシートを月報に記載するのか確認
function executionConfirmationCreateMonthlySheet() {
  // キャンセルの場合はスクリプト終了
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    "このシートのデータを月報に記載しますか？",
    ui.ButtonSet.OK_CANCEL
  );
  if (response === ui.Button.CANCEL) {
    ui.alert("処理をキャンセルしました");
    return;
  }
  // 月報処理に進む
  createMonthlyReport();
}
