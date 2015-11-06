/*
 @author mrmagooey
 */

/*
 ## Table Constructor
 Creates a new Table object
 @param {String} tableName The name of this table
 */

function Taboo(tableName){
  // where the tables data is stored
  // stored as an array of column objects
  this._data = [];

  // extend underscores zip
  // taken from http://stackoverflow.com/questions/22361609/using-zip-in-a-chain
  _.mixin({zipArrays: function(arrays){
    return _.zip.apply(_, arrays);
  },
          });

  // ## this.metadata
  // For putting any user metadata into
  this.metadata = {tableName:tableName};
  
  // stores any external callback functions
  this._callbacks = {};
  
  /* ## addRow()
   Convenience function wrapping addRows()
   
   @params {Object/Array} row - A singular row
   @params {Object} options - An object containing options
   */
  this.addRow = function(row, options){
    this.addRows([row], options);
  };
  
  /* ## addRows()
   If passed an array of objects, the keys will be treated as the column
   headings and the values treated as the cell values.
   
   `[{"col1":"foo", "col2":"bar", "col3":"baz"}, 
   {"col1":"asdf", "col2":"asdf1", "col3":"asdf2"}]`
   
   If passed an array of arrays, the arrays will be added by index position,
   with items beyond the current number of columns being discarded.
   
   `[["foo", "bar", "baz"], ["asdf", "asdf1", "asdf2"]]`
   
   @params {Array} rows Takes an array of either objects or arrays.          
   @params options object of options
   */    
  this.addRows = function(rows, userOptions){
    var defaultOptions = {
      printColumnSize: 15
    }, 
        options = {};
    if (_.isObject(userOptions)){
      _.extend(options, defaultOptions, userOptions);
    } else {
      options = defaultOptions;
    }
    
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
        _this.addColumns(rowHeaders, {silent:true, ignoreDuplicates: true});
        // add data
        _.pairs(row).forEach(function(pair, index){
          _this._addCell(pair[0], pair[1]);
        });
        _this._clean();
      } 
    });
    if (!options.silent){
      this.triggerCallbacks('update');
    }
  };
  
  /* addColumn()
   Singular of addColumns
   
   @param {string} - single header name 
   @param {object} - optional object for function behaviour
   */
  this.addColumn = function(header, options){
    this.addColumns([header], options);
  };
  
  /* addColumns()
   Add columns to the table with the `headers`
   
   By default duplicate headers are added, but given an incrementing number to distinguish them
   If {ignoreDuplicates:true} is passed this incrementing behaviour can be turned off.
   
   @param {array} headers - an array of column names
   @param {object} options - optional object containing 
   */
  this.addColumns = function(headers, userOptions){
    var defaultOptions = {
      silent:false,
      ignoreDuplicates: false
    },
        options = {};
    if (_.isObject(userOptions)){
      _.extend(options, defaultOptions, userOptions);
    } else {
      options = defaultOptions;
    }
    var _this = this,
        newHeaders;
    if (options.ignoreDuplicates) {
      newHeaders = _.difference(headers, this.getColumnHeaders());
    } else {
      newHeaders = headers;
    }
    newHeaders.forEach(function(header, index){
      _this._data.push({header: header, data: []});
    });
    this._clean();
    if (!options.silent){
      this.triggerCallbacks('update');
    }
  };
  
  
  /* ## updateWhere()
   @param {update} An object containing a single pair of column name and value
   @param {whereList} A list of [{header, data}] combinations that need to match for the row in order for the update to happen
   @param {options} 
   @return the index of the udated
   */
  this.updateWhere = function(update, whereList, userOptions){
    var defaultOptions = {
      silent:false
    },
        options = {};
    if (_.isObject(userOptions)){
      _.extend(options, defaultOptions, userOptions);
    } else {
      options = defaultOptions;
    }

    var _this = this,
        updateHeader = _.keys(update)[0],
        updateValue = _.values(update)[0],
        column = _.find(this._data, function(column){
          return column.header === updateHeader;
        });
    if (_.isUndefined(column)){
      return undefined;
    }
    _.chain(this._getRowsAsCellObjects())
    // filter out rows that don't have all the items in the whereList
      .map(function(row, index){
        // every item in whereList must be satisfied for a row to be updated
        var rowUpdate = _.every(
          _.map(whereList, function(where){
            return !(
              _.isEmpty(
                _.where(row, {header:_.keys(where)[0], data:_.values(where)[0]})));
          }));
        if (rowUpdate){
          return index;
        } else {
          return undefined;
        }
      })
      .filter(function(rowIndex){
        return !_.isUndefined(rowIndex);
      })
    // update the rows
      .each(function(rowIndex){
        column.data[rowIndex] = updateValue;
      })
      .value();
    if (!options.silent){
      this.triggerCallbacks('update');
    }
  };
  
  /* ## clear()
   Removes all data from taboo table
   */
  this.clear = function(userOptions){
    var defaultOptions = {
      silent:false
    },
        options = {};
    if (_.isObject(userOptions)){
      _.extend(options, defaultOptions, userOptions);
    } else {
      options = defaultOptions;
    }
    this._data = [];
    if (!options.silent){
      this.triggerCallbacks('update');
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
  this.getRowAtIndex = function(index, userOptions){
    var defaultOptions = {
      objects:true,
    }, 
        options = {};
    if (_.isObject(userOptions)){
      _.extend(options, defaultOptions, userOptions);
    } else {
      options = defaultOptions;
    }
    var cellObjects = _.map(this._data, function(column, i){
      return {header:column['header'], data:column['data'][index]} ;
    });
    
    if (options.objects){
      return cellObjects;
    } else {
      return _.pluck(cellObjects, 'data');
    }
  };

  /* ## getRows()
   Options is an object containing key valued options including:
   
   objects: returns the rows as objects (default)
   array: returns the rows as arrays
   
   @param  userOptions
   @returns Return an array (rows) of arrays (cell objects)
   rows = [row, row, row]
   row = [{header:'name', data:'abc'}, {...}, {...}]
   */
  this.getRows = function(userOptions){
    var defaultOptions = {
      objects:true,
    }, 
        options = {};
    if (_.isObject(userOptions)){
      _.extend(options, defaultOptions, userOptions);
    } else {
      options = defaultOptions;
    }
    
    if (!options.objects) {
      return _.chain(this._data)
        .map(function(column){
          return column.data;
        })
      // custom backbone mixin defined above, transposes columns to rows
        .zipArrays() 
        .value(); 
    } else if (options.objects) {
      return _.chain(this._getRowsAsCellObjects())
        .map(function(row, index){
          return _.reduce(row, function(rowObject, cell){
            var temp = {};
            temp[cell.header] = cell.data;
            return _.extend(rowObject, temp);
          }, {});
        })
        .value();
    }
  };

  /* ## getRowsWhere()
   @params {whereParams} list of {"header name":"data"} objects
   @params {options} object of options
   @returns {Array} All rows in the table satisfying the whereList
   */
  this.getRowsWhere = function(whereParams, userOptions){
    var defaultOptions = {
      objects:true,
    }, 
        options = {};
    if (_.isObject(userOptions)){
      _.extend(options, defaultOptions, userOptions);
    } else {
      options = defaultOptions;
    }
    var wherePairs = _.pairs(whereParams);
    return _.chain(this._getRowsAsCellObjects())
    // filter out rows that don't have all the items in the whereList
      .filter(function(row){
        return _.every(
          _.map(wherePairs, function(whereItem){
            return !(
              _.isEmpty(
                _.where(row, {header:whereItem[0], data:whereItem[1]})));
          })
        );
      })
      .map(function(row, index){
        if (!options.objects){
          return _.map(row, function(cell){
            return cell.data;
          });
        } else {
          return _.reduce(row, function(rowObject, cell){
            var temp = {};
            temp[cell.header] = cell.data;
            return _.extend(rowObject, temp);
          }, {});
        }
      })
      .value();
  };

  /* ## deleteAtIndex()
   @params {whereParams} object containing header name and value pairs
   @returns the number of rows deleted 
   */
  this.deleteRowAtIndex = function(index, userOptions){
    var defaultOptions = {
      silent:false
    },
        options = {};
    if (_.isObject(userOptions)){
      _.extend(options, defaultOptions, userOptions);
    } else {
      options = defaultOptions;
    }
    
    var _this = this;
    _.each(_this._data, function(column, colIndex){
      column.data.splice(index, 1);
    });
    if (!options.silent){
      this.triggerCallbacks('update');
    }
  };
  
  /* ## deleteWhere()
   @params {whereParams} object containing header name and value pairs
   @returns the number of rows deleted 
   */
  this.deleteRowsWhere = function(whereParams, userOptions){
    var defaultOptions = {
      silent:false
    }, 
        options = {};
    if (_.isObject(userOptions)){
      _.extend(options, defaultOptions, userOptions);
    } else {
      options = defaultOptions;
    }
    var _this = this;
    
    // remove these from the _data columns
    var numberDeleted =  _.chain(this._getRowsAsCellObjects())
    // get the array indexes where the whereList is satisfied
          .map(function(row, index){
            var whereTrue = _.every(
              _.map(_.pairs(whereParams), function(whereItem){
                return !(
                  _.isEmpty(
                    _.where(row, {header:whereItem[0], data:whereItem[1]})));
              }));
            if (whereTrue){
              return index;
            } else {
              return undefined;
            }
          })
          .filter(function(rowIndex){
            return !_.isUndefined(rowIndex);
          })
    // need to be careful removing items 
    // remove from the end so as to not fuck with the indexes as we go
          .sort()
          .reverse()
          .each(function(deleteIndex){
            _this.deleteRowAtIndex(deleteIndex);
          })
          .reduce(function(acc, n){return acc + 1;}, 0)
          .value();
    if (!options.silent){
      this.triggerCallbacks('update');
    }
    return numberDeleted;
  };
  
  /* ## columnToObjects()
   Object transformation method, generally for moving a denormalized table
   into a set of related nested objects.
   Returns an array of objects like: 
   `[{name:'original column item', 
      related: {'first column name': 'data item',
                'second column name': 'second data item'}]`
   @returns {Array}
   */
  this.columnToObjects = function(colName){
    var col = _.unique(this.getColumn(colName)),
        colObjects = _.map(col, function(cell, index){
          return {name:cell, related:{}, _index:index};
        }),
        rows = this._getRowsAsCellObjects();
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
              columnObj.related[rc.header] = rc.data;
            }
          });
        } else {
          // continue
        }
      });
    });
    return colObjects;   
  };
  
  /* ## print()
   @return {String} pretty printed version of the table
   */
  this.print = function(userOptions){
    var defaultOptions = {
      printColumnSize: 15
    }, 
        options = {};
    if (_.isObject(userOptions)){
      _.extend(options, defaultOptions, userOptions);
    } else {
      options = defaultOptions;
    }
    var printColumnSize = options.printColumnSize;
    // this is the accumulator for return string
    var printString = '\n';
    var columnLengths = [];
    // early exit conditions
    if (this._data.length === 0){
      return "";
    }
    this._data.forEach(function(column){
      var header = String(column.header);
      columnLengths.push(Math.max(header.length, printColumnSize));
      printString += header 
        + new Array(Math.max(header.length, printColumnSize) - (header.length - 1)).join(' ')
        + ' | ';
    });
    printString += '\n';
    this._getRowsAsCellObjects().forEach(function(row, rowIndex, array){
      _.each(row, function(cell, cellIndex){
        var cellStr = String(cell.data),
            cellRepr;
        if (typeof cellStr === "undefined"){
          cellStr = 'undefined';
        }
        // truncate cell.data if longer than cell.header
        if (cellStr.length > columnLengths[cellIndex]){
          cellRepr = cellStr.slice(0, columnLengths[cellIndex] - 3);
          cellRepr = cellRepr + "...";
          // otherwise pad it with spaces
        } else if (cellStr.length < columnLengths[cellIndex]){
          var padding = new Array(columnLengths[cellIndex] - (cellStr.length - 1)).join(' ');
          cellRepr = cellStr + padding;
          // or neither if we are the exact right size
        } else {
          cellRepr = cellStr;
        }
        printString += cellRepr + " | ";
      });
      printString += '\n';
    });
    printString += '\n';
    return printString;
  };

  /* ## leftJoin()
   @param {String} leftKey The key in this table to be joined on
   @param {Table} rightTable 
   @param {String} rightKey The key in the right table to be joined on
   @return {Table} The new table
   */
  this.leftJoin = function(leftKey, rightTable, rightKey){
    var left = this,
        leftHeaders = left.getColumnHeaders(),
        right = rightTable,
        joinResult = new Taboo(),
        keyMatchFound,
        incrementRegex = /(.*-)(\d)/gm;
    
    var tablesArray = this._fixInterTableHeaderCollisions(left, right, [rightKey]);
    left = tablesArray[0];
    right = tablesArray[1];
    
    left._getRowsAsCellObjects().forEach(function(leftRow, index){
      keyMatchFound = false;
      var leftKeyValue = _.find(leftRow, function(cell){return cell.header === leftKey;});
      right._getRowsAsCellObjects().forEach(function(rightRow, index, array){
        var rightKeyValue = _.find(rightRow, function(cell){return cell.header === rightKey;});
        // matching left and right keys
        if (_.isEqual(rightKeyValue, leftKeyValue)) {
          // drop one of the matching key cells
          var modifiedRightRow = _.reject(rightRow, function(v){
            return _.isEqual(v, leftKeyValue);
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

  /* ## _fixInterTableHeaderCollisions()
   Ensure that for two tables there are no identical column names.
   Will rename columns on the right table by appending integers to the end of the column names.
   Third argument is for providing exceptions that won't be renamed.
   Assumes that there are no name collisions within each table.
   
   @param {taboo} leftTable 
   @param {taboo} rightTable 
   @param {array} columnName exceptions
   @return {array} [leftTable, rightTable]
   */
  this._fixInterTableHeaderCollisions = function(leftTable, rightTable, exceptions){
    var incrementRegex = /(.*-)(\d*)/,
        leftColumnNames = leftTable.getColumnHeaders(),
        rightColumnNames = rightTable.getColumnHeaders();
    _.chain(rightColumnNames)
      .map(function(colName) {
        if (_.contains(exceptions, colName)) {
          return colName;
        }
        while (leftColumnNames.indexOf(colName) >= 0) {
          var matches = incrementRegex.exec(colName);
          // we have already incremented this name by one, do so again
          if (matches && matches.length === 3){
            colName = matches[1] + (Number(matches[2]) + 1);
          } else {
            // increment the name by one
            colName = colName + '-1';
          }
        }
        return colName;
      })
      .each(function(colName, index){
        rightTable._data[index].header = colName;
      })
      .value();
    rightTable._clean();
    leftTable._clean();
    return [leftTable, rightTable];
    
  };
  
  /* ## innerJoin()
   @param {String} leftKey The key in this table to be joined on
   @param {Table} rightTable 
   @param {String} rightKey The key in the right table to be joined on
   @return {Table} New joined table
   */
  this.innerJoin = function(leftKey, rightTable, rightKey){
    var left = this,
        leftHeaders = left.getColumnHeaders(),
        right = rightTable.clone(),
        joinResult = new Taboo(),
        keyMatchFound;
    
    var tablesArray = this._fixInterTableHeaderCollisions(left, right, [rightKey]);
    left = tablesArray[0];
    right = tablesArray[1];
    
    left._getRowsAsCellObjects().forEach(function(leftRow, index){
      keyMatchFound = false;
      var leftKeyValue = _.find(leftRow, function(cell){return cell.header === leftKey;});
      right._getRowsAsCellObjects().forEach(function(rightRow, index, array){
        var rightKeyValue = _.find(rightRow, function(cell){return cell.header === rightKey;});
        // matching left and right keys
        if (_.isEqual(rightKeyValue, leftKeyValue)) {
          // drop matching cell on the right table
          var modifiedRightRow = _.reject(rightRow, function(v) {
            return _.isEqual(v, leftKeyValue);
          });
          // add the concatenated result to the new table
          var newRow = leftRow.concat(modifiedRightRow);
          joinResult._addRowCellObjects(newRow);
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
        t = new Taboo();
    t._data = data;
    return t;
  };
  
  /* ## callbackEventNames
   Array of possible callback event names
   */
  this.callbackEventNames = ['update'];
  
  /* ## registerCallback
   @param eventName The name of the event that will trigger the supplied callback
   @param callback A function that will be called with the context of the taboo object
   */
  this.registerCallback = function(eventName, callback){
    if (_.includes(this.callbackEventNames, eventName)) {
      if (_.isArray(this._callbacks[eventName])){
        this._callbacks[eventName].push(callback);
      } else {
        this._callbacks[eventName] = [callback];
      }
    }     
  };
  
  /* ## triggerCallbacks
   Manually call a callback by triggering events
   @param eventName - the name of the event to be triggered
   @param details - object containing any details you want to be passed to the callbacks
   */
  this.triggerCallbacks = function(eventName, details){
    var _this = this;
    if (_.isArray(this._callbacks[eventName])){
      this._callbacks[eventName].forEach(function(callback){
        callback(_this, details);
      });
    }
  };
  
  /* ## _clean()
   Ensures the integrity of the underlying table data structure, by: 
   1. Make the table 'square', i.e. all the columns are the same length, 
   padding with undefineds when adding cells to columns.
   */
  this._clean = function() {
    var _this = this;
    // 1. square
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
    
    // 2. fix headers
    var incrementRegex = /(.*-)(\d*)/;
    _.each(_this.getColumnHeaders(), function(header, headerIndex){
      var remainingHeaders = _this.getColumnHeaders();
      remainingHeaders.splice(headerIndex, 1);
      while(remainingHeaders.indexOf(header) >= 0) {
        
        var matches = incrementRegex.exec(header);
        // we have already incremented this name by one, do so again
        if (matches && matches.length === 3){
          // update both the underlying data object
          // and what we are watching
          _this._data[headerIndex].header = header = matches[1] + (Number(matches[2]) + 1);
        } else {
          // increment the name by one
          _this._data[headerIndex].header = header = header + '-1';
        }
      }
    });

  };
  
  /* ## _getRowsAsCellObjects()
   @returns {Array} All rows in the table as an array of arrays of cell objects
   */
  this._getRowsAsCellObjects = function(){
    // Return an array (rows) of arrays (cell objects)
    // rows = [row, row, row]
    // row = [{header:'name', data:'abc'}, {...}, {...}]
    return _.chain(this._data)
      .map(function(column){
        return _.map(column.data, function(cell){
          // add column headers to cells
          return {header:column['header'], data:cell};
        });
      })
    // custom backbone mixin defined above, transposes columns to rows
      .zipArrays() 
      .value(); 
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
    this.addColumns(headers, {silent:true, ignoreDuplicates: true});
    row.forEach(function(cell){
      _this._addCell(cell['header'], cell['data']);
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
  
}; // end of Taboo

if (typeof window === 'undefined'){
  var _ = require('lodash');
  module.exports = Taboo;
}
