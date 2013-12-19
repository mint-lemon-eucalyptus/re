//each excercise must have interval of allowed index numbers of nodes and relations
module.exports=
    {
        defaultExcerciseTextAreaContent:
            'MATCH (a)-[r]-(b) RETURN a,b,r LIMIT 25',
//          'MATCH (n:myLabel) \nRETURN n LIMIT 3',//  'START root=node(0) // Start with the reference node\n'+        'RETURN root        // and return it.'
        testLabelsPrafix:'testL'
    }
;