/**
*Generates a spending plan from a sales forecast and product information. 
*
*@param {Range[]} rawForecast - A vector of projected product sales per time period
*@param {Range[]} products - two-dimensional array of product info. Columns: Start Inventory, Average Qty Per Sale, Average Cost, lead Time, Minimum Order Quantity.
*@returns a vector of estimated spending per time period for all products. 
*@customfunction
*
*@author John McWhirter <john@inventables.com>
*@version 0.1
*/

function PLANBOM(rawForecast, products) {
  var numProducts = products.length;
  var numTimes = rawForecast[0].length;
  
  var bomSpending = [];
  
  for(t=0;t<numTimes;t++){
    bomSpending[t] = 0;
  }
  
  for(p=0;p<numProducts;p++){
    var productSpending = PLAN([rawForecast[0]],[products[p]],3);
    for(t=0;t<numTimes;t++){
      bomSpending[t] += productSpending[0][t];
    }
  }
  
  return [bomSpending];
}

