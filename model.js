  var model = {
    date: new Date().toDateString().replace(/ /g,"-"),
    version: "0.1",
    sourceDoc: scriptProperty(modelSourceDoc), //gdocs doc ID
    sourceSheet: scriptProperty(modelSourceSheet), //gdocs sheet name
    sourceRange: "", //A1 notation
    productionForecastMeasurement: "", //string: "day", "week", or "month"
    salesForecastMeasurement: "",
    //forecastStartDate: "", //date string
    //productionForecast: "",
    //salesForecast: "",
    
    products: [],
    //{
      //sku: "",
      //startInv: 0,
      //avgQtyPerSale: 1,
      //cost: 0,
      //leadTime: 0,
      //moq: 0,
      //unfulfilled: 0,
      //calendar:[
        //{date: "", //date string
        //production: 0, //forecasted X-Carve production per time period * average unit per sale.
        //sales: 0, //forecasted sales per time period
        //rawInventory: 0, //holds starting and projected inventory per time period.
        //orders: 0, //holds starting and projected order quantities.
        //realInventory: 0, //orders array ajusted for leadtime.
        //stockOut: 0, //"realInventory" where < 1.
        //spending: 0 //order qty per time period * avg cost.}
      //],
     // purchases:[
        //{quantity: 0,
        //expectedDate: 0,} //date string
      //]
    //}
    //],
    generateProductionForecast: function(rawProductionForecast,startDay,measurement){
      if(!measurement){
        measurement = "day";
      }
      this.productionForecastMeasurement = measurement;
      
      this.productionForecast = [];
      switch(measurement){
        case "week": //split raw week forecast into 5 daily forecasts per week.
          var startDate = new Date();
          //startDate.setDate(startDate.getDate+startDay); //starting the model in the future (optional)
          for(day=0;day<rawProductionForecast[0].length*7;day++){
            if((startDate.getDay()+day)%7 === 6 || (startDate.getDay()+day)%7 === 0){ //weekend days (Sat:6,Sun:0)
              this.productionForecast[day] = 0;
            }
            else{
              this.productionForecast[day] = (rawProductionForecast[0][Math.floor(day/7)])/5;
            }
          }
          return this;
        case "month":
          //find current month, split raw month forecast into appropriate number of days per month.
          var startDate = new Date();
          startDate.setDate(startDate.getDate+startDay); //starting the model in the future (optional)
          var startMonth = startDate.getMonth();
          //var endMonth = startDate.getMonth()+(rawForecast.length-1);
          var months = []
          for(month=0;month<rawProductionForecast.length-1;month++){
            months.push(startMonth+month);
          }
          //this.forecastStartDate = startDate.toDateString();
          return this;
        default: //"day"
          this.prodcutionForecast = rawProductionForecast[0];
          return this;
       }
    },
    
    generateSalesForecast: function(rawSalesForecast,startDay,measurement){
      if(!measurement){
        measurement = "day";
      }
      this.salesForecastMeasurement = measurement;
      
      this.salesForecast = [];
      switch(measurement){
        case "week": //split raw week into 7 daily forecasts per week
          for(day=0;day<rawSalesForecast[0].length*7;day++){
            this.salesForecast[day] = (rawSalesForecast[0][Math.floor(day/7)])/7;
          }
          return this;
        case "month":
          //find current month, split raw month forecast into appropriate number of days per month.
          var startDate = new Date();
          startDate.setDate(startDate.getDate+startDay); //starting the model in the future (optional)
          var startMonth = startDate.getMonth();
          //var endMonth = startDate.getMonth()+(rawForecast.length-1);
          var months = []
          for(month=0;month<rawSalesForecast.length-1;month++){
            months.push(startMonth+month);
          }
          //this.forecastStartDate = startDate.toDateString();
          return this;
        default: //"day"
          this.salesForecast = rawSalesForecast[0];
          return this;
       }
    },
  
    importProducts: function(numProducts){ 
      var doc = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = doc.getSheetByName(this.sourceSheet);
      var products = sheet.getRange(2,1,sheet.getLastRow(),sheet.getLastColumn()).getDisplayValues();
      if(!numProducts){
        numProducts = products.length;
      }
      for(sku=0;sku<numProducts;sku++){
        if(products[sku][0] !== ""){
          this.products.push({
            sku: products[sku][0],
            startInv: Number(products[sku][2])-Number(products[sku][7]),
            avgQtyPerSale: Number(products[sku][3]),
            cost: Number(products[sku][4]),
            leadTime: Number(products[sku][5]),
            moq: Number(products[sku][6]),
            purchaseOrderQty: Number(products[sku][7]),
            //currentExpectedDate: products[sku][8],
            unfulfilled: Number(products[sku][9]),
            calendar: [],
            purchases: []
          });
        }
      }
      //Logger.log(JSON.stringify(model[0]));
      return this;
    },
    
    importPurchases: function(){
      var doc = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = doc.getSheetByName("PoLines");
      var pos = sheet.getRange(1,1,sheet.getLastRow(),sheet.getLastColumn()).getDisplayValues();
      
      var poLines = [];
      for(line=0;line<pos.length;line++){
        poLines.push({
          sku: pos[line][0],
          quantity: pos[line][7],
          expectedDate: new Date(pos[line][13]).toDateString(),
        })
      }
      for(product=0;product<this.products.length;product++){
        for(line=0;line<poLines.length;line++){
          if(poLines[line].sku === this.products[product].sku){
            this.products[product].purchases.push({
              quantity: poLines[line].quantity,
              expectedDate: poLines[line].expectedDate,
            });
          }
        }
      }
      
      return this;
    },
    
    generateCalendar: function(){      
      for(product=0;product<this.products.length;product++){
        for(day=0;day<this.productionForecast.length;day++){
          var production = this.productionForecast[day] * this.products[product].avgQtyPerSale;
          var sales = this.salesForecast[day] * this.products[product].avgQtyPerSale;
          
          if(day===0){
            //Logger.log("startInv: "+this.products[product].startInv+"\n");
            //Logger.log("poQty: "+this.products[product].purchaseOrderQty+"\n");
            var rawInventory = this.products[product].startInv-this.products[product].purchaseOrderQty;
            var date = new Date();
          }
          else{
            var rawInventory = this.products[product].calendar[day-1].rawInventory - production;
            var oldDate = new Date(Date.parse(this.products[product].calendar[day-1].date));
            //Logger.log("oldDate: "+oldDate+"\n");
            date.setDate(oldDate.getDate()+1);
            //Logger.log("date: "+date+"\n");
            //Logger.log("inventory: "+rawInventory+"\n");
          }
          this.products[product].calendar.push({
            date: date.toDateString(),
            production: production,
            sales: sales,
            rawInventory: 0,//rawInventory, 
            plannedOrder: 0, //holds computed order quantities.
            receiving: 0, //orders array ajusted for leadtime (computed receiving quantity).
            stockOut: 0, 
            //spending: 0 //order qty per time period * avg cost.
          })
        }
      }
      return this;
    },
    
    calculateOrders: function(){
      for(product=0;product<this.products.length;product++){
        for(day=0;day<this.products[product].calendar.length;day++){
          console.log("Day: "+day+"\nSKU: "+this.products[product].sku+"\nRawInventory: "+this.products[product].calendar[day].rawInventory+"\n moq: "+this.products[product].moq+"\n order: "+this.products[product].calendar[day].plannedOrder);
          if(day===0){
            this.products[product].calendar[day].rawInventory = this.products[product].startInv - this.products[product].calendar[day].production + this.products[product].calendar[day].plannedOrder;
          }
          else{
            this.products[product].calendar[day].rawInventory = this.products[product].calendar[day - 1].rawInventory - this.products[product].calendar[day].production + this.products[product].calendar[day].plannedOrder;
          }
          if(this.products[product].calendar[day].rawInventory < 1){ //raw stockout
            if(day-this.products[product].leadTime < 0){
              if(Math.abs(this.products[product].calendar[day].rawInventory) > this.products[product].moq){
                this.products[product].calendar[0].plannedOrder += (Math.abs(this.products[product].calendar[day].rawInventory) + 1); //Order up to 1
              }
              else {
                this.products[product].calendar[0].plannedOrder += Number(this.products[product].moq); //Order the MOQ
              }
              day = -1; //Move back to day 0 on next iteration
              //Logger.log(this.products[product].calendar[0].plannedOrder);
            }
            else {
              if(Math.abs(this.products[product].calendar[day].rawInventory) > this.products[product].moq){
                this.products[product].calendar[(day - this.products[product].leadTime)].plannedOrder += (Math.abs(this.products[product].calendar[day].rawInventory) + 1); //Order up to 1
              }
              else {
                this.products[product].calendar[(day - this.products[product].leadTime)].plannedOrder += Number(this.products[product].moq);  //Order the MOQ
              }
              //Logger.log(this.products[product].calendar[(day-this.products[product].leadTime)].plannedOrder);
              day = (day - this.products[product].leadTime - 1); //Move back to the most recent purchase on the next iteration.
            }
          }
        }
      }
      return this;
    },
    
    calculateStockOut: function(){
      for(product=0;product<this.products.length;product++){
        for(day=0;day<this.products[product].calendar.length;day++){
          if(this.products[product].calendar[day].rawInventory < 0){
            this.products[product].calendar[day].stockOut = Math.abs(this.products[product].calendar[day].rawInventory);
          }
        }
      }
      return this;
    },
    
    calculateSpending: function(){
      for(product=0;product<this.products.length;product++){
        for(day=0;day<this.products[product].calendar.length;day++){
          
        }
      }
      return this;
    },
    
    save: function(folderId){      
      var folder = DriveApp.getFolderById(folderId);
      //var datetime = this.date;
      var datetime = "saved";
      folder.createFile("X-Carve-Model_"+datetime+".json",JSON.stringify(this));
      return this;
    },
  }



