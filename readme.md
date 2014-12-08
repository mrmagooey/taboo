# Taboo

Simple tabular data manipulation in Javascript.

## Installation

Requires underscore.js to be available.

## Get Started

Make a table

    > var table1 = new Table();

Put some stuff in said table

    > table1.addRows([
        {animal:"cow", sound:"moo", color:"white"},
        {animal:"pig", sound:"oink", color:"pink"},
        {animal:"duck", sound:"quack", color:"brown"},
        {animal:"horse", sound:"neigh", color:"brown"},
        {animal:"dog", sound:"woof", color:"brown"},
    ]);

Get a list of all animals

    > table1.getColumn('animal')
    ['cow', 'pig', 'duck', 'horse', 'dog']
    
Get the rows containing brown animals

    > table1.getRowsWhere('color', 'brown')
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

    > var table2 = new Table();
    > table2.addColumns(['animal', 'in animal farm?']);
    > table2.addRows([
        ['cow', true], 
        ['pig', true], 
        ['dog', false],
        ['porcupine', false]
    ]);
    
Join the two tables
    
    > var joinTable = table1.joinLeft('animal', table2, 'animal');
    
Inspect your handiwork

    > joinTable.print()
    
    animal          | sound           | color           | in animal farm? | 
    cow             | moo             | white           | true            | 
    pig             | oink            | pink            | true            | 
    duck            | quack           | brown           | undefined       | 
    horse           | neigh           | brown           | undefined       | 
    dog             | woof            | brown           | false           |
    
