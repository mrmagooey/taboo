
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
    expect(table.getRows().length).toEqual(3);
  });
  
  it("should be able to add rows arrays ", function(){
    table.addColumns(['name'], ['color']);
    table.addRows(_.values(dogs));
    expect(table.getRows().length).toEqual(3);
  });

  it("should be able to add new columns", function(){
    table.addRows(dogs);
    expect(table.getRows().length).toEqual(3);
    table.addRows([{newColumnName:'blah'}]);
    expect(table.getColumnHeaders().length).toEqual(3);
    expect(table.getRows().length).toEqual(4);
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
    table.updateWhere({'name':'woof'}, [{color:'red'}]);
    expect(table.getRowsWhere({name:'woof'}).length).toEqual(1);
  });
  
  it("should be able to delete rows", function(){
    table.addRows(dogs);
    table.deleteRowsWhere({'name':'snuffles', "color": "black"});
    expect(table.getRowsWhere({name:'snuffles'}).length).toEqual(0);
    table.deleteRowsWhere({'name':'rex'});
    expect(table.getRows().length).toEqual(1);
    expect(table.deleteRowsWhere({'name':'brian'})).toEqual(1);
  });
  
  it("should be able to insert undefineds", function(){
    table.addColumns(["col1", "col2"]);
    table.addRows([[undefined, undefined]]);
    expect(table.getRows().length).toEqual(1);
  });
  
  it("should be able to delete rows by index", function(){
    table.addRows(dogs);
    table.deleteRowAtIndex(1);
    expect(table.getRowsWhere({'name':'snuffles'})).toEqual([]);
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
    console.log(table.print());
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
    var newTable = dogsTable.leftJoin('color', catsTable, 'color');
    expect(newTable.getColumnHeaders().length).toEqual(3);
    expect(newTable.getRows().length).toEqual(3);
  });
  
  
  it("should be able to inner join", function(){
    var newTable = dogsTable.innerJoin('color', catsTable, 'color');
    expect(newTable.getRows().length).toEqual(2);
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
  
});

