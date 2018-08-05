function addToImport() {
  var doc = SpreadsheetApp.getActiveSpreadsheet();
  var lookupSheet = doc.getSheetByName('Input');
  var rawData = lookupSheet.getRange(8,1,lookupSheet.getLastRow(),4).getDisplayValues();
  var data = rawData.filter(String);
  var importSheet = doc.getSheetByName('Import');
  var skuCell = SpreadsheetApp.getActive().getRange('B4')
  var memo = "Batch " + data[0][1] + " - " + skuCell.getValue();
  for (var i = 0; i < data.length; i++) {
    if(data[i][0] != ''){
      importSheet.appendRow([data[i][0],memo,data[i][2],data[i][3], "Cost of Goods Sold:Inventory Adjustment"]);
    }
  }
  //clear the appropriate fields
  SpreadsheetApp.getActive().getRange('B4').clear();
  
  //reset the data validation
  SpreadsheetApp.getActive().getRange('B1:C5').mergeAcross();
  var skuRange = SpreadsheetApp.getActive().getRange('Module List!C1:C46');
  var skuRule = SpreadsheetApp.newDataValidation().requireValueInRange(skuRange).build();
  skuCell.setDataValidation(skuRule);
}

function processImport(){
  
  // Copy and rename the 'Import' tab
  var today = new Date();
  var date = (today.getMonth()+1)+'-'+today.getDate()+'-'+today.getFullYear();
  var doc = SpreadsheetApp.getActiveSpreadsheet();
  var importSheet = doc.getSheetByName('Import');
  var rawData = importSheet.getRange(2,1,importSheet.getLastRow(),4).getDisplayValues();
  var rowCount = rawData.length - 1;
  
  var newImportSheet = importSheet.copyTo(doc);
  var newImportSheetName = newImportSheet.setName('Imported ' + date + ' ('+rowCount+')');
  
  //Export the copy to CSV
  var fileName = (newImportSheet.getSheetName() + '.csv');
  var csvFile = convertRangeToCsvFile_(fileName,newImportSheet);
  var workOrderImportFolder = DriveApp.getFolderById("1Q5JuUPVkXcpITMcKNRG7eJ6vvCkEEzb9");
  workOrderImportFolder.createFile(fileName, csvFile);
  
  //Clear the 'Import' tab
  importSheet.getRange('A2:E').clear();
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Import').addItem('Process Import', 'processImport').addToUi();
  ui.createMenu('POs').addItem("Create PO", "createPO").addToUi();
}
