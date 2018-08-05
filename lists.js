function rebuildLists(){
  var doc = SpreadsheetApp.getActive();
  var sheet = doc.getSheetByName("X-CarveModules");
  var allRows = combineLists(sheet,"A3:C","E3:G");
  var assembliesOnly = assemblies(allRows);
  var output = combineLists(sheet,expandBoms(allRows,assembliesOnly),"I3:K");
  
  var clearRange = sheet.getRange("M3:O").clearContent();
  sheet.getRange(3,13,output.length,3).setValues(output);
}

function combineLists(sheet,list1,list2) { //list3, etc (ranges in A1 notation)
  var allRows = [];
  var rows = []
  for(a=1;a<arguments.length;a++){
    if(typeof arguments[a] === "string"){
      rows = sheet.getRange(arguments[a]).getDisplayValues();
    }
    else{
      rows = arguments[a];
    }
    allRows = allRows.concat(rows);
  }
  allRows = allRows.filter(isNotEmpty); //filter out rows with no 0 index
  return allRows;
}

function assemblies(allRows) {
  return allRows.map(column(0)).filter(unique);

} 

function bom(product,list){
  return list.filter(match(0,product));
}

function expandBoms(inputList,assemblyList,fullList, r){
  if(!fullList) {
    fullList = inputList;
  }
  var outputList = [];
  for(r=0;r<inputList.length;r++){
    var assemblyId = inputList[r][0];
    var componentId = inputList[r][1];
//    console.log({
//      step: r,
//      inputLength: inputList.length,
//      assemblyId: assemblyId,
//      componentId: componentId,
//    });
    if(assemblyList.indexOf(componentId) !== -1){
      var subassemblyBom = bom(componentId,fullList).map(columnReplace(0,assemblyId)); //replace subassembly part with subassembly BOM (using top-level part number)
      var subassemblyList = (expandBoms(subassemblyBom,assemblyList,fullList,r));
      outputList = outputList.concat(subassemblyList);
      
    }
    else{
      outputList.push(inputList[r]);
    }
  }
  return outputList;
}

//function listTest(){
//  var allRows = combineLists("X-CarveModules","A3:C","E3:G","I3:K");
//  var assembliesOnly = assemblies(allRows);
//  
//  var doc = SpreadsheetApp.getActive();
//  var outputRange = doc.getSheetByName("Sheet48").getRange(1,1,assembliesOnly.length,1);
//  outputRange.setValues(assembliesOnly.map(rowify));
//}
//
//function bomTest(){
//  var output = bom("30686-04",combineLists("X-CarveModules","A3:C","E3:G","I3:K"));
//
//  //output
//  var doc = SpreadsheetApp.getActive();
//  var outputRange = doc.getSheetByName("Sheet48").getRange(1,1,output.length,output[0].length);
//  outputRange.setValues(output);
//}
//
//function expansionTest(){
//  var allRows = combineLists("X-CarveModules","A3:C","E3:G");
//  var assembliesOnly = assemblies(allRows);
//  
//  var output = expandBoms(allRows,assembliesOnly);
//  
//  //output
//  var doc = SpreadsheetApp.getActive();
//  var outputRange = doc.getSheetByName("Sheet48").getRange(1,1,output.length,3);
//  outputRange.setValues(output);
//}

//function recusrsionTest(){
//  //setup lists
//  var allRows = combineLists("X-CarveModules","E3:G");
//  var assembliesOnly = assemblies(allRows);
//  
//  //run test
//  var output = recurseBoms(allRows,assembliesOnly);
//  
//  //output
//  var doc = SpreadsheetApp.getActive();
//  var sheet = doc.getSheetByName("ListTest");
//  sheet.getRange(1,1,sheet.getLastRow(),3).clearContent();
//  var outputRange = sheet.getRange(1,1,output.length,3);
//  outputRange.setValues(output);
//  
//  //Test output
//  var staticValues = sheet.getRange("E1:F27").getDisplayValues();
//  var testValues = bom("30740-03",outputRange.getDisplayValues());
//  console.log("Static: "+testValues.length+"; Test: "+staticValues.length);
//  if(testValues.length === staticValues.length){
//    console.log("Test Might Have Passed!");
//  }
//  else{
//    console.log("Test Definitely Failed!");
//  }
//}




