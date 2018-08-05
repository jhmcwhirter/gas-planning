function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Model')
    .addItem('New', 'test')
    .addItem('Update PO Query','importPos')
    .addItem('Rebuild Lists','rebuildLists')
    .addToUi();
}
