
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

describe("Table", function() {
    var table;

    beforeEach(function() {
        table = new Table();
    });
    
    it("should be able to set columns", function(){
        table.addColumns(['column 1', 'column 2', 'column 3']);
        expect(table._data.length).toEqual(3);
    });
    
    it("should be able to add row objects", function(){
        table.addColumns(['name'], ['color']);
        table.addRows(dogs);
        expect(table.getRows().length).toEqual(3);
    });
    
    it("should be able to add rows arrays ", function(){
        table.addColumns(['name'], ['color']);
        table.addRows(_.values(dogs));
        expect(table.getRows().length).toEqual(3);
    });
    
});

describe("Tables", function(){
    var dogsTable, catsTable;
    
    beforeEach(function(){
        dogsTable = new Table();
        dogsTable.addColumns(['name'], ['color']);
        dogsTable.addRows(dogs);
        catsTable = new Table();
        catsTable.addColumns(['name'], ['color']);
        catsTable.addRows(cats);
    });
    
    it("should be able to left join", function(){
        var newTable = dogsTable.joinLeft('color', catsTable, 'color');
        expect(newTable.getColumnHeaders().length).toEqual(3);
    });

});
