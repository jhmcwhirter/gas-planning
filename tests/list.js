function listTest(){
  var allRows = combineLists("X-CarveModules","A3:C","E3:G","I3:K");
  var assembliesOnly = assemblies(allRows);
  
  var doc = SpreadsheetApp.getActive();
  var outputRange = doc.getSheetByName("Sheet48").getRange(1,1,assembliesOnly.length,1);
  outputRange.setValues(assembliesOnly.map(rowify));
}

function bomTest(){
  var output = bom("30686-04",combineLists("X-CarveModules","A3:C","E3:G","I3:K"));

  //output
  var doc = SpreadsheetApp.getActive();
  var outputRange = doc.getSheetByName("Sheet48").getRange(1,1,output.length,output[0].length);
  outputRange.setValues(output);
}

function expansionTest(){
  var allRows = combineLists("X-CarveModules","A3:C","E3:G");
  var assembliesOnly = assemblies(allRows);
  
  var output = expandBoms(allRows,assembliesOnly);
  
  //output
  var doc = SpreadsheetApp.getActive();
  var outputRange = doc.getSheetByName("Sheet48").getRange(1,1,output.length,3);
  outputRange.setValues(output);
}

function recusrsionTest(){
  //setup lists
  var allRows = combineLists("X-CarveModules","E3:G");
  var assembliesOnly = assemblies(allRows);
  
  //run test
  var output = recurseBoms(allRows,assembliesOnly);
  
  //output
  var doc = SpreadsheetApp.getActive();
  var sheet = doc.getSheetByName("ListTest");
  sheet.getRange(1,1,sheet.getLastRow(),3).clearContent();
  var outputRange = sheet.getRange(1,1,output.length,3);
  outputRange.setValues(output);
  
  //Test output
  var staticValues = sheet.getRange("E1:F27").getDisplayValues();
  var testValues = bom("30740-03",outputRange.getDisplayValues());
  console.log("Static: "+testValues.length+"; Test: "+staticValues.length);
  if(testValues.length === staticValues.length){
    console.log("Test Might Have Passed!");
  }
  else{
    console.log("Test Definitely Failed!");
  }
}

