
var dogs = [{name:'rex', color:'red'}, 
            {name:'snuffles', color: 'black'}, 
            {name:'brian', color: 'white'}];

var cats = [{name:'harvey', color:'red'}, 
            {name:'mittens', color: 'black'}, 
            {name:'mr meowgi', color: 'tan'}];

describe("Table", function() {
    var table;

    beforeEach(function() {
        table = new Table();
    });
    
    it("should be able to set columns", function(){
        table.addColumnHeaders(['column 1', 'column 2', 'column 3']);
        expect(table._data.length).toEqual(3);
    });
    
    it("should be able to add rows using cell objects ", function(){
        table.addRowCellObjects([{header:'a', data:1}, {header:'b', data:'1'}]);
        expect(table._data.length).toEqual(2);
    });
    
    it("should be able to add row objects", function(){
        table.addColumnHeaders(['name'], ['color']);
        table.addRows(dogs);
    });
    
    it("should be able to add rows arrays ", function(){
        table.addColumnHeaders(['name'], ['color']);
        table.addRows(_.values(dogs));
    });
    
});

describe("Tables", function(){
    var dogsTable, catsTable;
    
    beforeEach(function(){
        dogsTable = new Table();
        dogsTable.addColumnHeaders(['name'], ['color']);
        dogsTable.addRows(dogs);
        catsTable = new Table();
        catsTable.addColumnHeaders(['name'], ['color']);
        catsTable.addRows(cats);
    });
    
    it("should be able to left join", function(){
        var newTable = dogsTable.joinLeft('color', catsTable, 'color');
        console.log(newTable.print());
        
    });
    

});
