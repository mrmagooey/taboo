/*
 @author mrmagooey
 */

/*
 ## Table Constructor
 Creates a new Table object
 @param {String} tableName The name of this table
 */

function Table(tableName){
    this._data = [];
    this.metadata = {tableName:tableName};
    
    /* ## addRows()
     If passed an array of objects, the keys will be treated as the column
     headings and the values treated as the cell values.
     
     `[{"col1":"foo", "col2":"bar", "col3":"baz"}, 
     {"col1":"asdf", "col2":"asdf1", "col3":"asdf2"}]`
     
     If passed an array of arrays, the arrays will be added by index position,
     with items beyond the current number of columns being discarded.
     
     `[["foo", "bar", "baz"], ["asdf", "asdf1", "asdf2"]]`
     
     @params {Array} rows Takes an array of either objects or arrays.          
     */    
    this.addRows = function(rows){
        var _this = this;
        // add data
        rows.forEach(function(row, index){
            var currentHeaders = _this.getColumnHeaders();
            if (_.isArray(row)){
                row.forEach(function(cell, i){
                    // ignore array elements out of table column range
                    if (i < currentHeaders.length){
                        _this._addCell(currentHeaders[i], cell);
                    } else {
                        // ignore
                    }
                });
                _this._clean();
            } else if (_.isObject(row)){
                // add any new columns
                var rowHeaders = _.keys(row);
                _this._addHeaders(rowHeaders);
                // add data
                _.pairs(row).forEach(function(pair, index){
                    _this._addCell(pair[0], pair[1]);
                });
                _this._clean();
            } 
        });
    };
    
    /* ## addColumns()
     Add an array of empty columns.
     Pre-existing column names will be ignored.
     @param {Array} colNamesArray Array of column names.
     */
    this.addColumns = function(colNamesArray) {
        var _this = this;
        colNamesArray.forEach(function(name){
            _this.addColumn(name);
        });
    };
    
    /* ## updateWhere()
     @UpdateColumn
     @UpdateValue
     @Where
     */

    /* ## addColumn()
     Add a single empty column with name colName
     Pre-existing column names will be ignored.
     @Params {string} colName Column name
     */
    this.addColumn = function(colName){
        // Adds an column object to the table iff the column object
        // with the colName does not already exist
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
    
    /* ## getColumnHeaders()
     @returns {Array} All column names
     */    
    this.getColumnHeaders = function(){
        return _.map(this._data, function(column){
            return column.header;
        });
    };
    
    /* ## getColumn()
     @param {String} colName The name of the column to be returned
     @Return {array} all cells within the column
     */
    this.getColumn = function(colName){
        // 
        var col;
        this._data.forEach(function(columnObject, index){
            if (columnObject.header == colName){
                col = columnObject.data; 
            }
        });
        return col;
    };
    
    /* ## getRow()
     @param {Integer} index The row index to be returned
     @returns {Array} 
     */
    this.getRow = function(index){
        // return an array of cell objects at row[index]
        return _.map(this._data, function(column, i){
            return {header:column['header'], data:column['data'][index]} ;
        });
    };
    
    /* ## getRowsAsCellObjects()
     @returns {Array} All rows in the table as an array of arrays of cell objects
     */
    this.getRowsAsCellObjects = function(){
        // Return an array (rows) of arrays (cell objects)
        // rows = [row, row, row]
        // row = [{header:'name', data:'abc'}, {...}, {...}]
        var cellColumns = [];
        _.each(this._data, function(column){
            cellColumns.push(_.map(column.data, function(cell) {
                return {header:column['header'], data:cell};
            }));
        });
        return _.zip.apply(_, cellColumns);
    };

    /* ## getRows()
     @returns Return an array (rows) of arrays (cell objects)
     rows = [row, row, row]
     row = [{header:'name', data:'abc'}, {...}, {...}]
     */
    this.getRows = function(){
        var cellColumns = [];
        _.each(this._data, function(column){
            cellColumns.push(_.map(column.data, function(cell) {
                return cell;
            }));
        });
        return _.zip.apply(_, cellColumns);        
    };
    
    /* ## getRowsWhere()
     @params {whereList} list of {header:"header name", data:"data"} objects
     @returns {Array} All rows in the table satisfying the whereList
     */
    this.getRowsWhere = function(whereList){
        var rows =  _.chain(this.getRowsAsCellObjects())
                // filter out rows that don't have all the items in the whereList
                .filter(function(row){
                    return _.every(
                        _.map(whereList, function(){
                            return !(
                                _.isEmpty(
                                    _.where(row, 
                                            {header:whereList["header"], data:whereList["value"]})));
                        })
                    );
                })
                // only return the data, not the full cell objects
                .map(function(row, index){
                    return _.map(row, function(cell){
                        return cell.data;
                    });
                })
                .value();
        return rows;
    };
    
    /* ## columnToObjects()
     Object transformation method, generally for moving a denormalized table
     into a set of nested objects.
     Returns an array of objects like: 
     `[{name:'original column item', related:
     {'related column name': ['first related', 'second related']}]`
     @returns {Array}
     */
    this.columnToObjects = function(colName){
        var col = _.unique(this.getColumn(colName)),
            colObjects = _.map(col, function(cell, index){
                return {name:cell, related:{}, _index:index};
            }),
            rows = this.getRowsAsCellObjects();
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
    
    /* ## relatedColumn()
     Return a set of related column objects
     */
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
    
    /* ## print()
     @return {String} pretty printed version of the table
     */
    this.print = function(){
        var printColumnSize = 15;
        var printString = '\n';
        var columnLengths = [];
        // early exit conditions
        if (this._data.length === 0){
            return "";
        }
        this._data.forEach(function(column){
            columnLengths.push(Math.max(column.header.length, printColumnSize));
            printString += column.header 
                + new Array(Math.max(column.header.length, printColumnSize) - (column.header.length - 1)).join(' ')
                + ' | ';
        });
        printString += '\n';
        this.getRowsAsCellObjects().forEach(function(row, rowIndex, array){
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

    /* ## joinLeft()
     @param {String} leftKey The key in this table to be joined on
     @param {Table} rightTable 
     @param {String} rightKey The key in the right table to be joined on
     @return {Table} The new table
     */
    this.joinLeft = function(leftKey, rightTable, rightKey){
        var left = this,
            leftHeaders = left.getColumnHeaders(),
            right = rightTable,
            joinResult = new Table(),
            keyMatchFound,
            incrementRegex = /(.*-)(\d)/gm;
        left.getRowsAsCellObjects().forEach(function(leftRow, index){
            keyMatchFound = false;
            var leftKeyValue = _.find(leftRow, function(cell){return cell.header === leftKey;});
            right.getRowsAsCellObjects().forEach(function(rightRow, index, array){
                var rightKeyValue = _.find(rightRow, function(cell){return cell.header === rightKey;});
                // matching left and right keys
                if (_.isEqual(rightKeyValue, leftKeyValue)) {
                    // drop one of the matching key cells, otherwise we will add two cells
                    // with the same header, which the table structure doesn't really support
                    var modifiedRightRow = _.reject(rightRow, function(v){
                        return _.isEqual(v, leftKeyValue);
                    });
                    // check for similarly named columns and rename if there are collisions
                    modifiedRightRow = _.map(modifiedRightRow, function(v){
                        if (leftHeaders.indexOf(v.header) >= 0){
                            var matches = incrementRegex.exec(v.header);
                            // increment the name by one
                            if (matches && matches.length === 3){
                                v.header = matches[1] + matches[2] + 1;
                            } else {
                                v.header = v.header + '-1';
                            }
                            return v;
                        } else {
                            return v;
                        }
                    });
                    // add the concatenated result to the new table
                    joinResult._addRowCellObjects(leftRow.concat(modifiedRightRow));
                    keyMatchFound = true;
                } 
                // Since this is a left join, we stil want the left table row to be included
                // in the final join table if no key matches are found
                if (index === array.length - 1 && keyMatchFound == false){
                    joinResult._addRowCellObjects(leftRow);
                }
            });
        });
        return joinResult;
    };

    /* ## innerJoin()
     @param {String} leftKey The key in this table to be joined on
     @param {Table} rightTable 
     @param {String} rightKey The key in the right table to be joined on
     @return {Table} The new table
     */
    this.innerJoin = function(leftKey, rightTable, rightKey){
        var left = this,
            leftHeaders = left.getColumnHeaders(),
            right = rightTable,
            joinResult = new Table(),
            keyMatchFound,
            incrementRegex = /(.*-)(\d)/gm;
        
        left.getRowsAsCellObjects().forEach(function(leftRow, index){
            keyMatchFound = false;
            var leftKeyValue = _.find(leftRow, function(cell){return cell.header === leftKey;});
            right.getRowsAsCellObjects().forEach(function(rightRow, index, array){
                var rightKeyValue = _.find(rightRow, function(cell){return cell.header === rightKey;});
                // matching left and right keys
                if (_.isEqual(rightKeyValue, leftKeyValue)) {
                    // drop one of the matching key cells, otherwise we will add two cells
                    // with the same header, which the table structure doesn't really support
                    var modifiedRightRow = _.reject(rightRow, function(v){
                        return _.isEqual(v, leftKeyValue);
                    });
                    // check for similarly named columns and rename if there are collisions
                    modifiedRightRow = _.map(modifiedRightRow, function(v){
                        if (leftHeaders.indexOf(v.header) >= 0){
                            var matches = incrementRegex.exec(v.header);
                            // increment the name by one
                            if (matches && matches.length === 3){
                                v.header = matches[1] + matches[2] + 1;
                            } else {
                                v.header = v.header + '-1';
                            }
                            return v;
                        } else {
                            return v;
                        }
                    });
                    // add the concatenated result to the new table
                    joinResult._addRowCellObjects(leftRow.concat(modifiedRightRow));
                    keyMatchFound = true;
                }
            });
        });
        return joinResult;
    };
    
    /* ## clone()
     @return a clone of this table
     */
    this.clone = function(){
        var data = JSON.parse(JSON.stringify(this._data)),
            t = new Table();
        t._data = data;
        return t;
    };
    
    /* ## _clean()
     Ensures the integrity of the underlying table data structure, by: 
     1. Make the table 'square', i.e. all the columns are the same length, 
     padding with undefineds when adding cells to columns.
     */
    this._clean = function() {
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
    
    /* ## _addRowCellObjects()
     Add a row to this table. 
     Row is an array of cell objects.
     `row = [{header:'blah', data:}, {header:'blah', data:}]`
     Any cell object with a new header will add that header to the table
     @params {Array} row Array of internal cell objects
     */    
    this._addRowCellObjects = function(row){
        var _this = this;
        var headers = _.pluck(row, 'header');
        this._addHeaders(headers);
        row.forEach(function(cell){
            _this._addCell(cell['header'], cell['data']);
        });
        this._clean();
    };

    this._addHeaders = function(headers){
        var _this = this,
            currentHeaders = this.getColumnHeaders(),
            uniqueHeaders = _.unique(headers);
        if (uniqueHeaders.length !== headers.length){
            throw "Can\'t add a row with duplicate headers";
        }
        var newHeaders = _.difference(headers, currentHeaders);
        newHeaders.forEach(function(header, index){
            _this._data.push({header: header, data: []});
        });
        this._clean();
    };
    
    /* ## _addCell()
     Internal method of adding cell data to columns. Shouldn't be directly used
     as by itself it leaves the table in an inconsistent state.
     */
    this._addCell = function(colName, cellValue) {
        var column = _.find(this._data, function(column){
            return column.header === colName;
        });
        column["data"].push(cellValue);
    };
    
} // end of Table

