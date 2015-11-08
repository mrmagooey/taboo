var _ = require('lodash');
var Taboo = require('./taboo');
var chance = require('chance').Chance();

var NUMBER_ROWS = 10000;
console.log("NUMBER_ROWS: ", NUMBER_ROWS);

// test 1
var table = new Taboo();
var string1 = "hello";
var string2 = "world";
var string3 = "asdf";
console.time('addRow: 3 columns, identical string data');
for (var i=0; i < NUMBER_ROWS; i++) {
  table.addRow({"col1":string1, "col2": string2, "col3":string3});
}
console.timeEnd('addRow: 3 columns, identical string data');

// test 2
table = new Taboo();
var string_data = _.map(Array(NUMBER_ROWS), function(){
  return _.map(Array(10), function(){return chance.sentence({words: 3});});
});
table.addColumns(_.map(Array(10),function(val,idx){return idx;}));
console.time('addRow: 10 columns, random string data');
for (var j=0; j < NUMBER_ROWS; j++) {
  table.addRow(string_data[j]);
}
console.timeEnd('addRow: 10 columns, random string data');


// test 3
table = new Taboo();
var integer_data = _.map(Array(NUMBER_ROWS), function(){
  return _.map(Array(10), function(){return chance.integer();});
});
table.addColumns(_.map(Array(10),function(){return chance.sentence({words: 2});}));
console.time('addRow: 10 columns, random integer data');
for (var j=0; j < NUMBER_ROWS; j++) {
  table.addRow(integer_data[j]);
}
console.timeEnd('addRow: 10 columns, random integer data');

// test 4
table = new Taboo();
integer_data = _.map(Array(NUMBER_ROWS), function(){
  return _.map(Array(10), function(){return chance.integer();});
});
table.addColumns(_.map(Array(10),function(){return chance.sentence({words: 2});}));
console.time('addRow: 10 columns, random integer data');
table.addRows(integer_data);
console.timeEnd('addRow: 10 columns, random integer data');


// test 5
// getRowsWhere
table = new Taboo();
var data = _.map(Array(NUMBER_ROWS), function(){
  return _.map(Array(10), function(){return chance.sentence({words: 2});});
});
var columns = _.map(Array(10),function(){return chance.sentence();});
table.addColumns(columns);
table.addRows(data);

for (j=0; j < 5; j++) {
  var obj = {};
  // from the middle of the data
  obj[columns[j]] = data[NUMBER_ROWS/2 + j][j];
  console.time('getRowsWhere: single where param');
  table.getRowsWhere(obj);
  console.timeEnd('getRowsWhere: single where param');
}

// test6
table = new Taboo();
data = _.map(Array(NUMBER_ROWS), function(){
  return _.map(Array(10), function(){return chance.sentence({words: 2});});
});
columns = _.map(Array(10),function(){return chance.sentence();});
table.addColumns(columns);
table.addRows(data);
//console.log("number of rows:", table.numberOfRows());
for (j=0; j < 5; j++) {
  obj = {};
  // from the middle of the data
  obj[columns[j]] = data[NUMBER_ROWS/2 + j][j];
  console.time('deleteRowsWhere: single where param');
  table.deleteRowsWhere(obj);
  console.timeEnd('deleteRowsWhere: single where param');
}
//console.log("number of rows:", table.numberOfRows());


// test 7
var table1 = new Taboo();
data = _.map(Array(NUMBER_ROWS), function(){
  return _.map(Array(10), function(){return chance.sentence({words: 2});});
});
columns = _.map(Array(10),function(){return chance.sentence();});
table1.addColumns(columns);
table1.addRows(data);
//console.log("number of rows:", table.numberOfRows());
for (j=0; j < 5; j++) {
  obj = {};
  // from the middle of the data
  obj[columns[j]] = data[NUMBER_ROWS/2 + j][j];
  console.time('deleteRowsWhere: single where param');
  table.deleteRowsWhere(obj);
  console.timeEnd('deleteRowsWhere: single where param');
}
//console.log("number of rows:", table.numberOfRows());



