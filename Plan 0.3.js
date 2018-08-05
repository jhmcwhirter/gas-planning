/**
*Generates a purchase plan, inventory levels, and/or a spending plan from a sales forecast and product information. 
*
*@param {Range[]} rawForecast - A vector of projected product sales per time period
*@param {Range[]} products - vector of product information. Columns: Start Inventory, Average Qty Per Sale, Average Cost, lead Time, Minimum Order Quantity, Current PO Quantity, and Time Periods Until Current PO is Receieved.
*@param {Number} [outputType] - (Optional) Output type selection, see below. 
*@returns - inventory levels (outputType '1'), purchase quantity (outputType '2'), spending (outputType '3'), or stockouts (outputType '4') as a vector. Or inventory, spending, and purchases as default (3*n array).
*@customfunction
*
*@author John McWhirter <john@inventables.com>
*@version 0.3 - Chinese New Year Adjustment added 12/6
*/
  function PLAN(rawForecast,product,outputType){
    
    // Product-related variables
    var startInv = product[0][0];
    var avgQtyPerSale = product[0][1];
    var cost = product[0][2];
    var leadTime = product[0][3];
    var moq = product[0][4];
    
    
    var numTimes = rawForecast[0].length;
    
    //Initialize sales array and adjust for product qty per sale.
    var sales = [];
    for(t=0;t<numTimes;t++){
      sales[t] = rawForecast[1][t]*avgQtyPerSale;
    }
    
    //Initialize the inventory and order schedule arrays and fill with zeros.
    var inventory = [];
    var orders = [];
    for(t=0;t<numTimes;t++){
      inventory[t] = 0;
      orders[t] = 0;
    }
    
    // Purchase schedule loop
    for(t=0;t<numTimes;t++){
      if(t === 0){
        inventory[t] = startInv - sales[t] + orders[t]; //set inventory at time 0
      }
      else {
        inventory[t] = inventory[t-1] - sales[t] + orders[t];
      }
      
      //Insert order quantity calculation here.
      
      // Check for stockout
      if(inventory[t] < 1){
        if(t-leadTime < 0){
          if(Math.abs(inventory[t]) > moq){
            orders[0] += Math.abs(inventory[t])+1; //Order up to 1
          }
          else {
            orders[0] += moq; //Order the MOQ
          }
          t = -1; //Move back to time 0 on next iteration
        }
        else {
          if(Math.abs(inventory[t]) > moq){
            orders[t-leadTime] += Math.abs(inventory[t])+1; //Order up to 1
          }
          else {
            orders[t-leadTime] += moq;  //Order the MOQ
          }
          t = t - leadTime -1; //Move back to the most recent purchase on the next iteration.
        }
      }      
    }
    
    switch(outputType){
      case 1:
        return [inventory];
      case 2:
        return [orders];
      case 3: //Calculate spending if required
        Utilities.sleep(100);
        var spending = [];
        for(t=0;t<numTimes;t++){
          spending[t] = orders[t]*cost;
        }
        return [spending];
      case 4: // stockout schedule
        var purchaseOrderQty = product[0][5];
        var currentExpectedDate = product[0][6];
        var expected = [];
        for (t=0;t<numTimes+leadTime;t++){
          expected[t] = 0;
          }
          
        //Insert outstanding PO quantity into expected receiving time period.
        if (currentExpectedDate < 0) {
          var late = true;
        }
        else {
          expected[currentExpectedDate] = purchaseOrderQty;
        }
        
        //Move each projected scheduled order forward by the product leadtime
        for (t=0;t<numTimes;t++){
          if (orders[t] > 0){
            expected[t+leadTime] +=orders[t];
          }
        }
        
        //Calculate "real" inventory quantity at each time period 
        var realInventory = [];
        var stockOut = [];
        for (t=0;t<numTimes;t++){
          realInventory[t] = 0;
        }
        for (t=0;t<numTimes;t++){
          if (t === 0){
              realInventory[0] = startInv - purchaseOrderQty - sales[0] + expected[0];
          }
          else {
            realInventory[t] = realInventory[t-1] - sales[t] + expected[t];
          }
        }
        
        //Trim positive quantities, retaining only stockouts
        for (t=0;t<numTimes;t++){
          if (realInventory[t] < 0){
            stockOut[t] = realInventory[t];
          }
          else{
            stockOut[t] = 0;
          }
        }
        if (late === true) {
          stockOut[0] = stockOut[0] + " (Late)";
        }
        
        return [stockOut];
        
      default:
        var spending = [];
        for(t=0;t<numTimes;t++){
          spending[t] = orders[t]*cost;
        }
        return [inventory,orders,spending];
    }
}
