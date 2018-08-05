function createPO() {
  var doc = SpreadsheetApp.getActiveSpreadsheet();
  var vendorSheet = doc.getSheetByName('Quantities by Vendor');
  var vendor = vendorSheet.getRange('C1').getDisplayValues().filter(String);
  var productDataSource = vendorSheet.getRange(10,1,vendorSheet.getLastRow(),2).getDisplayValues().filter(String);
  
  var productDataPO = [];
  
  for (var i = 0; i < productDataSource.length; i++) {
    if(productDataSource[i][0] != 0){
      productDataPO.push([productDataSource[i][1],'','',productDataSource[i][0]]);
    }
  }
  var purchaseOrderSheet = doc.getSheetByName('PO Test');
  var purchaseOrderSheetProduct = purchaseOrderSheet.getRange(12,2,productDataPO.length,productDataPO[0].length);
   
  purchaseOrderSheetProduct.setValues(productDataPO);
}
  