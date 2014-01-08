перед выполнением запроса пользователя фильтровать ключевые слова(create. delete, index,merge,set,unique)
так пользователь не сможет сломать что либо
насчет using scan(на этапе выборки тоже фильтровать)
проверочные базы = набор подграфов с метками уникальными
MATCH (m:myLabel)
USING SCAN m:myLabel

RETURN m



или



//MATCH (m:myLabel{property_name:'property_value'})
//MATCH (a)-[r]-(b)
//MATCH (a:myLabel)-[r]-(b:myLabel)
MATCH (a:TESTLABEL:myLabel)-[r]-(b)
USING SCAN a:TESTLABEL
USING SCAN a:myLabel
//USING SCAN b:myLabel
RETURN a,r,b



--разобраться с условиями в render index там запрос на авторизацию идет при каждом обращении к странице
пробелы в начале и конце емаила и пароля