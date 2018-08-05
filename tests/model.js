function test(){
    model.generateProductionForecast([[112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112]],0,"week")
      .generateSalesForecast([[112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112]],0,"week")
      .importProducts()
      .importPurchases()
      .generateCalendar()
      .calculateOrders()
      .calculateStockOut()
      .save(scriptProperty('modelsFolderId'));
  }