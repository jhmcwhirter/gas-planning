function doGet(e){
  if(e.parameters["accessToken"][0] === scriptProperty("accessToken")){
    //console.log("Token: "+e.parameters["accessToken"]+"\nURL Token: "+scriptProperty("accessToken"));
    model.generateProductionForecast([[16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16]],0,"week")
      .generateSalesForecast([[16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16]],0,"week")
      .importProducts(50)
      .importPurchases("POLines")
      .generateCalendar()
    return ContentService.createTextOutput().setContent(JSON.stringify(model)).setMimeType(ContentService.MimeType.JSON);
  }
  else{
    error = {
      response: "error",
      content: "bad token",
      token: e.parameters["accessToken"],
    };
    return ContentService.createTextOutput().setContent(JSON.stringify(error)).setMimeType(ContentService.MimeType.JSON);
  }
}