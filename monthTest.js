/**
*Date Test
*@customfunction
*/

function monthTest(date) {
  month = Utilities.formatDate(date,"CST","M").toString();
  return month;
}
