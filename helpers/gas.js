function scriptProperty(property){
    return PropertiesService.getScriptProperties().getProperty(property);
}

// Importing Quickbooks reports into google sheets.
function parseQbCsv(folderId,filename){
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var csvFile = DriveApp.getFolderById(folderId).getFilesByName(filename).next();
    var csvData = csvFile.getBlob().getDataAsString()
    var qbData = Utilities.parseCsv(csvData);
    var lastUpdated = Utilities.formatDate(csvFile.getLastUpdated(),"CST","MM/dd");
    return [qbData,lastUpdated];
}
