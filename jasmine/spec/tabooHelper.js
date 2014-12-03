describe("Table", function() {
  var table;

  beforeEach(function() {
    table = new Table();
  });
  
  it("should be able to add rows", function(){
      table.addRow([{header:'a', data:1}, {header:'b', data:'1'}]);
      expect(table._data.length).toEqual(2);
  });
  
});
