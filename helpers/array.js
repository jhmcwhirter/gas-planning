function unique(value,index,self){
  return self.indexOf(value) === index;
}

function column(index){
  return function(row){
    return row[index];
  }
}

function match(index,value){
  return function(row){
    return row[index] === value;
  }
}

function isNotEmpty(row) {
  if(row[0] !== ""){
    return true;
  }
  else{
    return false;
  }
}

function rowify(value){
  return [value];
}

function derowify(value){
  return value[0];
}

function columnReplace(index,value){
  return function(row){
    var newRow = []
    for(c=0;c<row.length;c++){
      if(c === index){
        newRow.push(value);
      }
      else{
        newRow.push(row[c]);
      }
    }
    return newRow;
  }
}