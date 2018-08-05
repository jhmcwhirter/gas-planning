function importData(folderId,fileName,sheetName,rowStart,columnStart) {
  
  var doc = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = doc.getSheetByName(sheetName);
  var data = parseQbCsv(folderId,fileName);
  //console.log({
  //  rowStart: rowStart,
  //  columnStart: columnStart,
  //  NumRows: (sheet.getLastRow()-rowStart),
  //});
  sheet.getRange(rowStart,columnStart,(sheet.getLastRow()-rowStart),data[0][0].length).clear();
  sheet.getRange(rowStart,columnStart,data[0].length,data[0][0].length).setValues(data[0]);
  sheet.getRange("A1").setValue(data[1]);
}

function importPos(){
  importData(scriptProperty('queriesFolderId'),"qb_pos.csv","PoLines",1,1);
}
