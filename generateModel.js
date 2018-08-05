function generateForecast(rawForecast,startDay,measurement) {
  if(!measurement){
    measurement = "week";
    //rawForecast = [[7,14,21]];
  }
  Logger.log({
    measurement: measurement,
    rawForecast: rawForecast[0],
  })
  var forecast = [];
  switch(measurement){
    case "day":
      forecast = rawForecast[0];
      //Logger.log("measurement: "+measurement+"\nforecast: "+forecast);
      return forecast;
    case "week": 
      //split raw week into 7 daily forecasts per week
      for(day=0;day<rawForecast[0].length*7;day++){
        forecast[day] = (rawForecast[0][Math.floor(day/7)])/7;
      }
      //Logger.log("measurement: "+measurement+"\nforecast: "+forecast);
      return forecast;
    //case "month":
      //find current month, split raw month forecast into appropriate number of days per month.
      
      //Logger.log("measurement: "+measurement+"\nforecast: "+forecast);
      //return forecast;
    default:
      forecast = rawForecast[0];
      return forecast;
  }
}
/*var model = [{ //testing
  product: {
      sku: "25937-01",
      startInv: 680,
      avgQtyPerSale: 0.4833333333,
      cost: 10.80123256,
      leadTime: 30,
      moq: 100,
      purchaseOrderQty: 500,
      currentExpectedDate: "7/30/2018",
      unfulfilled: 29
    },
    calendar: [{
      date: "",
      production: 0, //forecasted X-Carve production per time period * average unit per sale.
      inventory: 0, //holds starting and projected inventory per time period.
      orders: 0, //holds starting and projected order quantities.
      realInventory: 0, //orders array ajusted for leadtime.
      stockOut: 0, //"realInventory" where < 1.
      spending: 0 //order qty per time period * avg cost.
     }],
    purchases: [{
      quantity: 0,
      expectedDate: 0,
    }]
  },
  {
  product: {
      sku: "25937-02",
      startInv: 1000,
      avgQtyPerSale: 0.3833333333,
      cost: 4.80123256,
      leadTime: 20,
      moq: 2000,
      purchaseOrderQty: 10000,
      currentExpectedDate: "7/10/2018",
      unfulfilled: 10
    },
    calendar: [{
      date: "",
      production: 0, //forecasted X-Carve production per time period * average unit per sale.
      inventory: 0, //holds starting and projected inventory per time period.
      orders: 0, //holds starting and projected order quantities.
      realInventory: 0, //orders array ajusted for leadtime.
      stockOut: 0, //"realInventory" where < 1.
      spending: 0 //order qty per time period * avg cost.
     }]
  }];*/
  
function importSkuData(){
  var doc = SpreadsheetApp.getActive();
  var sheet = doc.getSheetByName("XCarveSKUs");
  var products = sheet.getRange(2,1,sheet.getLastRow(),sheet.getLastColumn()).getDisplayValues();
  
  Logger.log("Products: "+products.length);
  var model = [];
  for(sku=0;sku<products.length;sku++){
    model.push({
      product:{
        sku: products[sku][0],
        startInv: products[sku][2],
        avgQtyPerSale: products[sku][3],
        cost: products[sku][4],
        leadTime: products[sku][5],
        moq: products[sku][6],
        purchaseOrderQty: products[sku][7],
        currentExpectedDate: products[sku][8],
        unfulfilled: products[sku][9]
      },
      calendar: [],
      purchases: []
     });
  }
  Logger.log(JSON.stringify(model[0]));
  return model;
}
function importPurchases(model){
  
}
function generateCalendar(model) {

  //var model = importSkuData();
  /*var model = [{ //testing
  product: {
      sku: "25937-01",
      startInv: 680,
      avgQtyPerSale: 0.4833333333,
      cost: 10.80123256,
      leadTime: 30,
      moq: 100,
      purchaseOrderQty: 500,
      currentExpectedDate: "7/30/2018",
      unfulfilled: 29
    },
    calendar: []
  },
  {
  product: {
      sku: "25937-02",
      startInv: 1000,
      avgQtyPerSale: 0.3833333333,
      cost: 4.80123256,
      leadTime: 20,
      moq: 2000,
      purchaseOrderQty: 10000,
      currentExpectedDate: "7/10/2018",
      unfulfilled: 10
    },
    calendar: []
  }];*/
  var forecast = generateForecast([[7,8,21]],0,"week");

  for(product=0;product<model.length;product++){
    for(day=0;day<forecast.length;day++){
      model[product].calendar.push({
        date: "",
        production: forecast[day] * model[product].product.avgQtyPerSale, //forecasted X-Carve production per time period * average unit per sale.
        inventory: 0, //holds starting and projected inventory per time period.
        orders: 0, //holds starting and projected order quantities.
        realInventory: 0, //orders array ajusted for leadtime.
        stockOut: 0, //"realInventory" where < 1.
        spending: 0 //order qty per time period * avg cost.
      })
    }
  }
  Logger.log(JSON.stringify(model));
  //saveFile(model);
  return model;
}

/*function saveFile(model){
  //folder: 1iuoErVQQ47Dl1czWbvLh40SfuAirFiN7
  var modelString = JSON.stringify(model);
  var folder = DriveApp.getFolderById("1iuoErVQQ47Dl1czWbvLh40SfuAirFiN7");
  var datetime = "test-7-6-2018";
  folder.createFile("X-Carve-Model_"+datetime+".json",modelString);
}*/

function generateModel(){
 var model = importPurchases(importSkuData());
}