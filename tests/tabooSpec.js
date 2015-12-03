
var dogs = [{name:'rex', color:'red'}, 
            {name:'snuffles', color: 'black'}, 
            {name:'brian', color: 'white'}];

var cats = [{name:'harvey', color:'red'}, 
            {name:'mittens', color: 'black'}, 
            {name:'mr meowgi', color: 'tan'}];

var people = [{name:'jeff', hair_color:'red', interests:'bowling, cycling'},
              {name:'frank', hair_color:'black', interests:'cycling, rowing'},
              {name:'steve', hair_color:'tan', interests:'running, sleeping'},
             ];


describe("Taboo", function() {
  var table;
  
  beforeEach(function() {
    table = new Taboo();
  });
  
  it("should be able to add columns", function() {
    table.addColumns(['column 1', 'column 2', 'column 3']);
    expect(table._data.length).toEqual(3);
  });
  
  it("should be able to add row objects", function(){
    table.addRows(dogs);
    expect(table.numberOfRows()).toEqual(3);
  });
  
  it("should be able to add rows arrays ", function(){
    table.addColumns(['name'], ['color']);
    table.addRows(_.values(dogs));
    expect(table.numberOfRows()).toEqual(3);
  });
  
  it("should be able to get rows as either arrays or objects", function(){
    table.addRows(dogs);
    // default (object)
    expect(_.isObject(table.getRows()[0])).toBe(true);
    // explicitly object
    expect(_.isObject(table.getRows({objects:true})[0])).toBe(true);
    // explicilty array
    expect(_.isArray(table.getRows({objects:false})[0])).toBe(true);
  });
  
  it("should be able to get rows by index", function(){
    table.addRows(dogs);
    expect(table.getRowAtIndex(1, {objects:true}))
      .toEqual([{header:'name', data:'snuffles'}, {header:'color', data:'black'}]);
    
    // default options
    expect(table.getRowAtIndex(1))
      .toEqual([{header:'name', data:'snuffles'}, {header:'color', data:'black'}]);
    expect(table.getRowAtIndex(1, {objects:false}))
      .toEqual(['snuffles', 'black']);
    // out of range
    expect(table.getRowAtIndex(1000)).toEqual([]);
  });
  

  it("should be able to add new columns", function(){
    table.addRows(dogs);
    expect(table.numberOfRows()).toEqual(3);
    table.addRows([{newColumnName:'blah'}]);
    expect(table.getColumnHeaders().length).toEqual(3);
    expect(table.numberOfRows()).toEqual(4);
  });
  
  it("should be able to get columnHeaders", function(){
    table.addRows(dogs);
    expect(table.getColumnHeaders()).toEqual(['name', 'color']);
  });
  
  it("should be able to getRowsWhere()", function(){
    table.addRows(dogs);
    expect(table.getRowsWhere({name:"rex"})).toEqual([{name:'rex', color:'red'}]);
    expect(table.getRowsWhere({name:"rex"}, {objects:false})).toEqual([['rex', 'red']]);
  });
  
  it("should be able to update cells", function(){
    table.addRows(dogs);
    // change the dogs name to woof
    table.updateWhere({'name':'woof'}, [{color:'red'}], {});
    expect(table.getRowsWhere({name:'woof'}).length).toEqual(1);
    
    // nonexistant column to update on
    table.updateWhere({'laksjdf':'woof'}, [{color:'green'}]);
    expect(table.getRowsWhere({color:'green'}).length).toEqual(0);
  });
  
  it("should be able to delete rows", function(){
    table.addRows(dogs);
    table.deleteRowsWhere({'name':'snuffles', "color": "black"});
    expect(table.getRowsWhere({name:'snuffles'}).length).toEqual(0);
    table.deleteRowsWhere({'name':'rex'}, {});
    expect(table.numberOfRows()).toEqual(1);
    expect(table.deleteRowsWhere({'name':'brian'})).toEqual(1);
    
  });
  
  it("should be able to delete rows by index", function(){
    table.addRows(dogs);
    table.deleteRowAtIndex(1, {});
    table.deleteRowAtIndex(1);
    expect(table.getRowsWhere({'name':'snuffles'})).toEqual([]);
  });
  
  it("should be able to insert undefineds", function(){
    table.addColumns(["col1", "col2"]);
    table.addRows([[undefined, undefined]]);
    expect(table.numberOfRows()).toEqual(1);
  });
  
  it("table changes should trigger callbacks", function(){
    // first callback
    table.registerCallback('update', function(details){
      table.addRows([['hi']], {silent:true});
    });
    //second callback
    table.registerCallback('update', function(details){
      table.addRows([['world']], {silent:true});
    });
    table.addRows(dogs);
    expect(table.getRowsWhere({name:'hi'}).length).toEqual(1);
  });
  
  it("should allow duplicate headers", function(){
    table.addColumn('hello');
    table.addColumn('hello');
    expect(table.getColumnHeaders().length).toBe(2);
  });
  
  it("should ignore duplicate headers if option passed", function(){
    table.addColumn('hello', {ignoreDuplicates:true});
    table.addColumn('hello', {ignoreDuplicates:true});
    expect(table.getColumnHeaders().length).toBe(1);
  });

  it('should be able to clone new copies of the table', function(){
    table.addRows(dogs);
    var newTable = table.clone();
    expect(newTable).not.toBe(table);
  });
  
  it('should be able to clean up bad column headers', function(){
    table.addColumns(["hello", "hello", "hello"]);
    expect(table.getColumnHeaders()).toEqual(["hello-1", "hello-2", "hello"]);
  });
  
  it("should be able to print the table", function(){
    // not a great test
    expect(typeof table.print()).toBe('string');
    expect(table.print().length).toBe(0);
    table.addRows(dogs);
    expect(table.print()).toContain("name");
    expect(table.print()).toContain("rex");
    expect(table.print()).toContain("|");
    table.addRow(["this is a really long piece of text, wow"]);
    expect(table.print()).toContain("this");
    // undefined is turned into a string
    table.addRow([undefined, undefined]);
    expect(table.print()).toContain('undefined');
  });
  
  it("should be able to print small column sizes", function(){
    table.addRows(dogs);
    expect(table.print({printColumnSize:5})).toContain("sn...");
  });
  
  it("should be able to return a non-table representation of a column", function(){
    table.addRows(people);
    expect(table.columnToObjects('name').length).toBe(3);
  });
  
  it("should be able to clear a table of data", function(){
    table.addRows(people);
    expect(table.numberOfRows()).toBe(3);
    table.clear();
    expect(table.numberOfRows()).toBe(0);
    table.clear({});
  });
  
});

describe("Tables", function(){
  var dogsTable, catsTable;
  
  beforeEach(function(){
    dogsTable = new Taboo();
    dogsTable.addRows(dogs);
    catsTable = new Taboo();
    catsTable.addRows(cats);
  });
  
  it("should be able to left join", function(){
    // same column name
    var newTable = dogsTable.leftJoin('color', catsTable, 'color');
    expect(newTable.getColumnHeaders().length).toEqual(3);
    expect(newTable.numberOfRows()).toEqual(3);
    // different column name
    dogsTable = new Taboo();
    dogsTable.addColumns(['something', 'coloring']);
    dogsTable.addRows(_.map(dogs, function(obj){return [obj.name, obj.color];}));
    newTable = dogsTable.leftJoin('coloring', catsTable, 'color');
    expect(newTable.numberOfRows()).toEqual(3);
    expect(newTable.numberOfColumns()).toEqual(3);
  });
  
  
  it("should be able to inner join", function(){
    var newTable = dogsTable.innerJoin('color', catsTable, 'color');
    expect(newTable.numberOfRows()).toEqual(2);
  });
  
  
  it("innerjoin should be able to deal with matching column names when ", function(){
    var newTable = dogsTable.innerJoin('color', catsTable, 'color');
    expect(newTable.getColumnHeaders().length).toBe(3);
    expect(newTable.getColumnHeaders()).toContain('color');
    expect(newTable.getColumnHeaders()).toContain('name');
    expect(newTable.getColumnHeaders()).toContain('name-1');
    // join on itself
    newTable = newTable.innerJoin('color', newTable, 'color');
    expect(newTable.getColumnHeaders().length).toBe(5);
    expect(newTable.getColumnHeaders()).toContain('color');
    expect(newTable.getColumnHeaders()).toContain('name');
    expect(newTable.getColumnHeaders()).toContain('name-1');
    expect(newTable.getColumnHeaders()).toContain('name-2');
    expect(newTable.getColumnHeaders()).toContain('name-3');
  });

  it('left join can deal with no matching column names', function(){
    var table1 = new Taboo(),
        table2 = new Taboo(),
        leftTable;
    
    table1.addColumn('a');
    table1.addColumn('b');
    table1.addRows([['hello', 'world'],['slipped', 'dropped']]);
    table2.addColumn('c');
    table2.addColumn('d');
    table2.addRows([['in', 'syl'],['those', 'voices']]);
    
    // only the left key is valid
    leftTable = table1.leftJoin('a', table2, 'nope');
    expect(leftTable.numberOfRows()).toBe(2);
    expect(leftTable.numberOfRows()).toBe(2);
    
    // only the right key is valid
    leftTable = table1.leftJoin('nope', table2, 'c');
    expect(leftTable.numberOfRows()).toBe(0);
    expect(leftTable.numberOfRows()).toBe(0);
    
    // neither key is valid
    leftTable = table1.leftJoin('nope', table2, 'nope');
    expect(leftTable.numberOfRows()).toBe(0);
    expect(leftTable.numberOfRows()).toBe(0);
    
    // both keys are valid (sanity test)
    leftTable = table1.leftJoin('a', table2, 'c');
    expect(leftTable.numberOfRows()).toBe(2);
    
  });
  
  it('inner join can deal with no matching column names', function(){
    var table1 = new Taboo(),
        table2 = new Taboo(),
        innerTable;
    
    table1.addColumn('a');
    table1.addColumn('b');
    table1.addRows([['hello', 'world'],['slipped', 'dropped']]);
    table2.addColumn('c');
    table2.addColumn('d');
    table2.addRows([['hello', 'world'],['those', 'voices']]);
    
    // only the left key is valid
    innerTable = table1.innerJoin('a', table2, 'nope');
    expect(innerTable.numberOfRows()).toBe(0);
    expect(innerTable.numberOfRows()).toBe(0);
    
    // only the right key is valid
    innerTable = table1.innerJoin('nope', table2, 'c');
    expect(innerTable.numberOfRows()).toBe(0);
    expect(innerTable.numberOfRows()).toBe(0);
    
    // neither key is valid
    innerTable = table1.innerJoin('nope', table2, 'nope');
    expect(innerTable.numberOfRows()).toBe(0);
    expect(innerTable.numberOfRows()).toBe(0);
    
    // both keys are valid (sanity test)
    innerTable = table1.innerJoin('a', table2, 'c');
    expect(innerTable.numberOfRows()).toBe(1);
  });
  
});

