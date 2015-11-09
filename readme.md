# Taboo

<a href='https://coveralls.io/github/mrmagooey/taboo?branch=master'><img src='https://coveralls.io/repos/mrmagooey/taboo/badge.svg?branch=master&service=github' alt='Coverage Status' /></a>
<img src="https://travis-ci.org/mrmagooey/taboo.svg?branch=master"/>

Simple tabular data manipulation in Javascript.

## Installation

Bower:

    bower install taboo
    
NPM:

    npm install taboo

Requires lodash.js to be available.

## Get Started

Make a table

    > var table1 = new Taboo();
        
Put some stuff in said table

    > table1.addRows([
    {animal:"cow", sound:"moo", color:"white"},
    {animal:"pig", sound:"oink", color:"pink"},
    {animal:"duck", sound:"quack", color:"brown"},
    {animal:"horse", sound:"neigh", color:"brown"},
    {animal:"dog", sound:"woof", color:"brown"},
    ]); 
Pretty print the table

    > table1.print()
    animal          | sound           | color           | 
    cow             | moo             | white           | 
    pig             | oink            | pink            | 
    duck            | quack           | brown           | 
    horse           | neigh           | brown           | 
    dog             | woof            | brown           | 
Get a list of all animals

    > table1.getColumn('animal')
    ['cow', 'pig', 'duck', 'horse', 'dog'] 
    
Get the rows containing brown animals

    > table1.getRowsWhere({'color':'brown'}, {objects:false})

    [
     [
      "duck",
      "quack",
      "brown"
     ],
     [
      "horse",
      "neigh",
      "brown"
     ],
     [
      "dog",
      "woof",
      "brown"
     ]
    ] 
    
Make a second table, using arrays rather than objects

    > var table2 = new Taboo();
    > table2.addColumns(['animal', 'in animal farm?']);
    > table2.addRows([
    ['cow', true], 
    ['pig', true], 
    ['dog', false],
    ['porcupine', false]
    ]);
    > table2.print();
    animal          | in animal farm? | 
    cow             | true            | 
    pig             | true            | 
    dog             | false           | 
    porcupine       | false           | 
    
Join the two tables

    > var joinTable = table1.joinLeft('animal', table2, 'animal');
    > joinTable.print()
    
    animal          | sound           | in animal farm? | 
    cow             | moo             | true            | 
    pig             | oink            | true            | 
    duck            | quack           | undefined       | 
    horse           | neigh           | undefined       | 
    dog             | woof            | false           | 
