
function Table(tableName){
    /* 
     Meant to be used for tabular data.
     Table is a nested data object held in _data
     
     table = [column, column]
     column = {header:'name', data:[cell, cell]}
     */
    
    this.tableName = tableName;
    this._data = [];
    this.metadata = {};
    
    this._clean = function() {
        /*
         1. Make the table 'square', i.e. all the columns are the same length,
         padding with undefineds when adding cells to columns.
         */
        var maxColumnLength = _.reduce(this._data, function(memo, value, index){
            var colLength = value['data'].length;
            if (colLength > memo) {
                return colLength;
            } else {
                return memo;
            }
        }, 0);
        this._data.forEach(function(column, index){
            for (var i = column.data.length; i < maxColumnLength; i++) {
                column.data.push(undefined);
            };
        });
    };
    
    this.addColumnHeader = function(colName){
        // Adds a column object to the table
        var column = _.find(this._data, function(column){
            return column.header === colName;
        });
        // check if this is a new column
        if (typeof column === 'undefined'){
            // add if column doesn't exist
            column = {
                header: colName,
                data: [],                           
            };
            this._data.push(column);
        }
    };
    
    this.getColumnHeaders = function(){
        return _.map(this._data, function(column){
            return column.header;
        });
    };
    
    this.addRow = function(row){
        /* 
         Add a row to this table.
         Row is an array of cell objects.
         row = [{header:'blah', data:}, ]
         Any cell object with a new header will add that header to the table
         */
        var _this = this;
        var headers = _.pluck(row, 'header');
        var uniqueHeaders = _.unique(headers);
        if (uniqueHeaders.length !== headers.length){
            throw "Can\'t add a row with duplicate headers";
        }
        this._clean();
        row.forEach(function(cell){
            _this.addCell(cell['header'], cell['data']);
        });
        this._clean();
    };
    
    this.addCell = function(colName, cellValue) {
        var column = _.find(this._data, function(column){
            return column.header === colName;
        });
        // check if this is a new column
        if (typeof column === 'undefined'){
            // add if column doesn't exist
            column = {
                header: colName,
                data: [],                           
            };
            this._data.push(column);
            // this._clean();
        }
        // finally add data to column
        column["data"].push(cellValue);
    };
    
    this.getColumn = function(colName){
        // Return column as an array of cell data
        var col;
        this._data.forEach(function(columnObject, index){
            if (columnObject.header == colName){
                col = columnObject.data; 
            }
        });
        return col;
    };
    
    
    this.getRow = function(index){
        // return an array of cell objects at row[index]
        return _.map(this._data, function(column, i){
            return {header:column['header'], data:column['data'][index]} ;
        });
    };
    
    this.getRows = function(){
        /* 
         Return an array (rows) of arrays (cell objects)
         
         rows = [row, row, row]
         row = [{header:'name', data:'abc'}, {...}, {...}]
         
         */
        
        var cellColumns = [];
        _.each(this._data, function(column){
            cellColumns.push(_.map(column.data, function(cell) {
                return {header:column['header'], data:cell};
            }));
        });
        return _.zip.apply(_, cellColumns);
    };

    this.getRowsWhere = function(header, key){
        /*
         Returns the same as getRows except that each row is checked for 
         a cell that has the `header` and `key` arguments
         */
        var b =  _.filter(this.getRows(), function(row){
            var a =  _.where(row, {header:header, data:key});
            return !(_.isEmpty(a));
        });
        return b;
    };
    
    this.columnToObjects = function(colName){
        /* 
         Object transformation method, generally for moving a denormalized table
         into a set of nested objects.
         
         Returns an array of objects like:
         [{name:'original column item'}, related:
         {'related column name': ['first related', 'second related']}]
         */
        var col = _.unique(this.getColumn(colName)),
            colObjects = _.map(col, function(cell, index){
                return {name:cell, related:{}, _index:index};
            }),
            rows = this.getRows();
        colObjects.forEach(function(columnObj, index){
            rows.forEach(function(row, index){
                var joinCell = _.find(row, function(cell){
                    return columnObj.name === cell.data;
                });
                if (typeof joinCell !== 'undefined'){
                    // get the other cells in the row
                    var remainingCells = _.reject(row, function(cell){
                        return cell == joinCell;
                    });
                    // start putting the related cells into the columnObj object
                    remainingCells.forEach(function(rc){
                        // get the columnObj related entry
                        if (typeof columnObj.related[rc.header] === 'undefined'){
                            columnObj.related[rc.header] = [];
                        }
                        columnObj.related[rc.header].push(rc.data);
                    });
                } else {
                    // continue
                }
            });
        });
        return colObjects;   
    };
    
    this.relatedColumn = function(primaryColumn, secondaryColumn){
        // 
        
        var columnObjects = this.columnToObjects(primaryColumn);
        return _.map(columnObjects, function(item, index){
            var related = _.find(item.related, function(v, i){
                return v.columnName == secondaryColumn;
            });
            
            return {name:item.name, related:related.data};
        });

    };
    
    this.print = function(){
        /* 
         Return string representation of table 
         */
        var printColumnSize = 15;
        var printString = '\n';
        var columnLengths = [];
        this._data.forEach(function(column){
            columnLengths.push(Math.max(column.header.length, printColumnSize));
            printString += column.header 
                + new Array(Math.max(column.header.length, printColumnSize) - (column.header.length - 1)).join(' ')
                + ' | ';
        });
        printString += '\n';
        this.getRows().forEach(function(row, rowIndex, array){
            _.each(row, function(cell, cellIndex){
                var cellStr = String(cell.data),
                    cellRepr;
                // truncate cell.data if longer than cell.header
                if (cellStr.length > columnLengths[cellIndex]){
                    cellRepr = cellStr.slice(0, columnLengths[cellIndex] -3);
                    cellRepr = cellRepr + "...";
                    // otherwise pad it with spaces
                } else if (cellStr.length < columnLengths[cellIndex]){
                    var padding = new Array(columnLengths[cellIndex] - (cellStr.length - 1)).join(' ');
                    cellRepr = cellStr + padding;
                }
                printString += cellRepr + " | ";
            });
            printString += '\n';
        });
        printString += '\n';
        return printString;
    };
    
    this.joinLeft = function(leftKey, rightTable, rightKey){
        var left = this,
            right = rightTable,
            joinResult = new Table(),
            keyMatchFound;
        left.getRows().forEach(function(leftRow, index){
            keyMatchFound = false;
            var leftKeyValue = _.find(leftRow, function(cell){return cell.header === leftKey;});
            right.getRows().forEach(function(rightRow, index, array){
                var rightKeyValue = _.find(rightRow, function(cell){return cell.header === rightKey;});
                // matching left and right keys
                if (_.isEqual(rightKeyValue, leftKeyValue)) {
                    // drop one of the matching key cells, otherwise we will add two cells
                    // with the same header, which the table structure doesn't really support
                    var modifiedRightRow = _.reject(rightRow, function(v){
                        return _.isEqual(v, leftKeyValue);
                    });
                    // add the concatenated result to the new table
                    joinResult.addRow(leftRow.concat(modifiedRightRow));
                    keyMatchFound = true;
                } 
                // Since this is a left join, we stil want the left table row to be included
                // in the final join table if no key matches are found
                if (index === array.length - 1 && keyMatchFound == false){
                    joinResult.addRow(leftRow);
                }
            });
        });
        return joinResult;
    };
    
    this.clone = function(){
        /*
         return a clone of this table
         */
        var data = JSON.parse(JSON.stringify(this._data)),
            t = new Table();
        t._data = data;
        return t;
    };
    
} // end of Table

