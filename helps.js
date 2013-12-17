//each excercise must have interval of allowed index numbers of nodes and relations
module.exports = [
    {
        id: 0,
        author: 'me',
        div: '1.0.',
        title: 'Теория: сетевая модель данных',
        rels: [1],
        content: [
            '<p>',
            'Сетевая модель данных - это набор данных, представленных в виде сетевой структуры, в узлах которой находятся записи, связанные между собой отношениями один-к-одному или один-ко-многим.',
            'Сетевой подход к организации данных является расширением иерархического подхода. В иерархических структурах запись-потомок должна иметь в точности одного предка; в сетевой структуре данных у потомка может иметься любое число предков.',
            '</p>',
            'Базовыми объектами модели являются:',
            '<b>  элемент данных,',
            'агрегат данных,',
            'запись,',
            'набор данных.</b>',
            '<p>',
            '<ul>',
            '<li>',
            'Элемент данных — минимальная информационная единица, доступная пользователю с использованием СУБД.',
            '</li>',
            '<li>',
            'Агрегат данных соответствует следующему уровню обобщения в модели(например, агрегатом данных можно назвать массив или некоторый сложный тип данных, определенный пользователем СУБД). Агрегат данных имеет имя, и в системе допустимо обращение к агрегату по имени.',
            '</li>',
            '<li>',
            'Записью называется совокупность агрегатов или элементов данных, моделирующая некоторый класс объектов реального мира.',
            '</li>',
            '<li>',
            'Набором называется двухуровневый граф, связывающий отношением «одии-комногим» два типа записи, т.е отражает иерархическую связь между двумя типами записей. Родительский тип записи в данном наборе называется владельцем набора, а дочерний тип записи — членом того же набора.',
            '</li>',
            '</ul>',
            '</p>',
            '<p>',
            'Для любых двух типов записей может быть задано любое количество наборов, которые их связывают. Фактически наличие подобных возможностей позволяет промоделировать отношение «многие-ко-многим» между двумя объектами реального мира, что выгодно отличает сетевую модель от иерархической. В рамках набора возможен последовательный просмотр экземпляров членов набора, связанных с одним экземпляром владельца набора.',
            'Между двумя типами записей может быть определено любое количество наборов: например, можно построить два взаимосвязанных набора. Существенным ограничением набора является то, что один и тот же тип записи не может быть одновременно владельцем и членом набора.',
            '</p>',
            '<p>',
            'В отличие от реляционной модели, связи в ней моделируются наборами, реализованными с помощью указателей. Набор - именованная двухуровневая иерархическая структура, которая содержит запись-владельца и запись-потомка (1 или несколько). Наборы отражают связи «один ко многим» и «один к одному» между этими двумя типами записей.',
            '</p>'
        ].join('')
    },
    {
        id: 1,
        author: 'me',
        div: '2.0.',
        title: 'Начало работы с СУБД Neo4j',
        content: [
            '<h4>Установка и настройка</h4>',
            '<p>',
            'Для установки сервера Neo4j на вашем компьютере потребуется JRE 1.7, а также дистрибутив, который можно скачать с <a href="http://www.neo4j.org" target="_blank">официального сайта</a>. Для выполнения упражнений потребуется версия не ниже 1.9.5, совместимая с вашей ОС.',
            'Для запуска потребуется распаковать архив, перейти в каталог с распакованными файлами и выполнить команду bin/neo4j start. Список возможных режимов запуска сервера выводится при выполнении bin/neo4j help.',
            'После успешного старта сервер будет доступен на 7474 порту. Вместе с сервером запускается web-интерфейс, в котором также можно в интерактивном режиме выполнять запросы и видеть результаты их выполнения.',
            '</p>',

            '<p>',
            '<h5>Типы данных и их истинностные значения:</h5>',
            '<ul>',
            '<li>',
            '<b>boolean</b> &mdash; булевское значение [true:false];',
            '</li>',
            '<li>',
            '<b>byte</b> &mdash; целое, 1 байт [-128:127];',
            '</li>',
            '<li>',
            '<b>short</b> &mdash; целое, 2 байт [32768:32767];',
            '</li>',
            '<li>',
            '<b>int</b> &mdash; целое, 4 байт [-2147483648 : 2147483647];',
            '</li>',
            '<li>',
            '<b>long</b> &mdash; целое, 8 байт [-9223372036854775808 : 9223372036854775807];',
            '</li>',
            '<li>',
            '<b>float</b> &mdash; 4-х байтовое число с плавающей точкой;',
            '</li>',
            '<li>',
            '<b>double</b> &mdash; 8-х байтовое число с плавающей точкой;',
            '</li>',
            '<li>',
            '<b>char</b> &mdash; 2-х байтовое безнаковое целое [0 : 65535], представляет символ Unicode;',
            '</li>',
            '<li>',
            '<b>String</b> &mdash; последовательность unicode символов, в том числе и escape-последовательности(\\t, \\b, \\n, \\r, \\f, \\\', \\", \\).',
            '</li>',
            '</ul>',
            '</p>',
            '<p>',
            '<h5>Термины языка Cypher:</h5>',
            '<ul>',
            '<li>',
            'узел (Node)— запись, моделирующая некоторую сущность из предметной области, может содержать свойства;',
            '</li>',
            '<li>',
            'свойство (Property) — пара «ключ-значение», где ключом является строковое значение, а значением — любой из вышеперечисленных типов данных, а также массив на их основе;',
            '</li>',
            '<li>',
            'связи или отношения (Relationships) позволяют моделировать логическую связь между объектами из предметной области, также могут иметь свойства;',
            '</li>',
            '<li>',
            'метка(Label) — именованная совокупность узлов графа(подграф). В качестве имени метки может использоваться непустая строка unicode. В дальнейшем по имени метки можно быстро найти узлы;',
            '</li>',
            '<li>',
            'путь (Path) — несколько узлов, соединенных отношениями. Используются в сложных запросах, требующих найти данные по некоторому структурному шаблону;',
            '</li>',
            '</ul>',
            '</p>',
            '<p>',
            'СУБД Neo4j поддерживает описания схем для повышения производительности, но, в общем случае, применение схем необязательно. Приведение типов работает по правилам Си-подобных языков программирования.',
            '</p>',

            '<h4>Индексы и ограничения</h4>',
            '<p>',
            'В Neo4j начиная с версии 1.8 появились индексы и ограничения — они полностью аналогичны функционально индексам и ограничениям в реляционных СУБД. Но отличие от них, Neo4j позволяет создавать именованные индексы для свойств узлов выборочно по именам, что позволяет повысить скорость операций модификации.',
            '</p>'
        ].join('')

    },
    {
        id: 2,
        author: 'me',
        div: '2.0.',
        title: 'Синтаксис Cypher',
        content: [
            '<p>',
            'Cypher  - это декларативный язык запросов, позволяющий эффективно манипулировать данными графовой СУБД. Структурой запросов  сильно похож на SQL. Кроме запросов на выборку позволяет также изменять, обновлять данные, добавлять ограничения и т.д. Также как в SQL, есть набор основных функций, например, для работы с датами, массивами, коллекциями и строками. Кроме того, СУБД поддерживает транзакции а также построение индексов  по выбранным свойствам узлов.',
            '<hr>',


            '<h4>  Операторы языка Cypher</h4>',
            '<p>',
            '<ul>',
            '<li>',
            'Математические операторы: +, -, *, /, %, ^. При выполнении операций над операндами разных типов будет происходить неявное преобразование типов в сторону увеличения точности.',
            '</li>',
            '<li>',
            'Операторы сравнения:  =, <>, <, >, <=, >=.',
            '</li>',
            '<li>',
            'Логические операторы: AND, OR, XOR, NOT.',
            '</li>',
            '<li>',
            'Операции над строками: строки конкатенируются оператором +.',
            '</li>',
            '<li>',
            'Операции над коллекциями: оператор + объединяет 2 коллекции, для проверки наличия элемена в коллекции используется оператор IN.',
            '</li>',
            '<li>',
            'Так как СУБД Neo4j не требует описания схемы, в запросе возможна ситуация сравнения со свойством узла, которого не существует. Для предотвращения ошибки рекомендуется проверять наличие свойства у узла, например:<br>',
            '<p class="code">WHERE n.some_property? = "something" <span class="comment">//вернет false, если у узла n существует свойство с именем some_property</span></p>',
            '<p class="code">WHERE n.some_property! = "something" <span class="comment">//вернет true, если у узла n существует свойство с именем some_property</span></p>',
            '<p class="warning">Замечание: пробел после «!» Во втором примере обязателен.</p>',
            'Предикат HAS(prop_name) является аналогом оператора «!».',
            '<p class="warning">Примечание: в Cypher 2.0 операторы ! B ? не поддерживаются. Проверка значения свойства возвращает null, а синтаксис выглядит следующим образом:</p>',
            '<p class="code">  has(n.some_property)</p>',
            '</li>',
            '</ul>',

            '</p>',
            '<hr>',

            '<p>',
            '<ul>',
            '<h4>Выражением в Cypher могут быть:</h4>',
            '<li>',
            'истинностные значения любых простых типов данных',
            '</li>',
            '<li>',
            'идентификаторы переменных (a,b,n,some_node и т.д.)',
            '</li>',
            '<li>',
            'обращения к свойствам узлов( n.prop, x.prop)',
            '</li>',
            '<li>',
            'параметры, подставляемые в запрос( {param}, {0})',
            '</li>',
            '<li>',
            'коллекции: ["a", "b"], [1,2,3], ["a", 2, n.property, {param}], [ ]',
            '</li>',
            '<li>',
            'вызовы функций: length(some_collection), nodes(node_set)',
            '</li>',
            '<li>',
            'шаблоны пути в графе: (a)-->(f)<--(b)',
            '</li>',
            '<li>',
            'предикаты: a.prop = "Hello", length(p) > 10, has(a.name)',
            '</li>',
            '</ul>',
            '<p>Для добавления однострочного комментария к запросу используйте «//».</p>',
            '</p>'
        ].join('')
    },
    {
        id: 3,
        author: 'me',
        div: '2.0.',
        title: 'Коллекции',
        content: [
            '<p>В Cypher коллекции являются аналогом наборов записей в SQL. Их главное отличие состоит в отсутствии типизации, что позволяет инициализировать коллекцию разными типами элементов, будь то целые числа, строки, коллекции или объекты графа.',
            '<p class="code"> RETURN [0,1.3,"str",n.prop, [1, 5.8]] AS my_collection</p>',
            'Результат:',
            '<p class="result">my_collection</p>',
            '<p class="result">1 row</p>',
            '<p class="result">[0,1.3,"str","sample", [1, 5.8]]</p>',

            'Для обращения к отдельным элементам коллекции используются индексы, взятые в квадратные скобки:',
            '<p class="code">RETURN [1,2,3,4,5][3]</p>',
            'Результат:',
            '<p class="result">4</p>',
            'если в качестве индекса задать отрицательное число, то отсчет позиции элемента идет с конца коллекции:',
            '<p class="code">RETURN [1,2,3,4,5][-1]</p>',
            'Результат:',
            '<p class="result">5</p>',

            '<p>Функция RANGE(a,b[,s]) создает пустую коллекцию и заполняет ее целыми числами от a до b с шагом s.</p>',
            'также можно получить часть коллекции:',
            '<p class="code">RETURN range(0,10)[2..5]</p>',
            'Результат:',
            '<p class="result">[2,3,4]</p>',
            'результатом выполнения выражения будет коллекция.',
            '<p class="code">RETURN range(0,10)[-3..]</p>',
            'Результат:',
            '<p class="result">[8,9,10]</p>',

            'При обращении к одиночному элементу за границей коллекции результатом будет null:',
            '<p class="code">RETURN range(0,10)[100]</p>',
            'Результат',
            '<p class="result">null</p>',


            'Если при обращении к группе элементов коллекции окажется, что часть из них не существует, в результирующей коллекции null выведены не будут:',

            '<p class="code">RETURN range(0,10)[5..15]</p>',
            'Результат',
            '<p class="result">[5,6,7,8,9,10]</p>',

            'В Cypher 2.0 появилась возможность создавать коллекции на основе существующих колекций.',
            'Пример: Вывести все целые числа от 0 до 10, такие что их квадрат находится в диапазоне [50-90].',
            'Решение:',
            '<p class="code">RETURN [x IN range(0,10) WHERE x^2>50 and x^2<90 | x] AS result</p>',
            '<p class="code">RETURN [x IN range(0,10) WHERE x^2>50 and x^2<90] AS result</p>',
            'Результат',
            '<p class="result">[8,9]</p>',
            '<hr>',
            'В Cypher также возможно создавать объекты типа «ключ-значение» в формате JSON:',

            '<p class="code">RETURN { key : "Value", arr: [{ a: "val1" }, { ab: "val2" }]}</p>',
            'Результат',
            '<p class="result">{ key : "Value", arr: [{ a: "val1" }, { ab: "val2" }]}</p>',

            '<hr>',
            '<p>Функция HEAD(coll) возвращает начальный элемент коллекции:</p>',
            '<p class="code">RETURN HEAD(range(0,10))</p>',
            'Результат',
            '<p class="result">0</p>',

            '<p>Функция TAIL возвращает все элементы коллекции, начиная со второго:</p>',
            '<p class="code">RETURN TAIL(range(0,10))</p>',
            'Результат',
            '<p class="result">[1,2,3,4,5,6,7,8,9,10]</p>',

            '<hr>',
            '<p>Функция LENGTH возвращает длину коллекции:</p>',
            '<p class="code">RETURN LENGTH(range(0,10))</p>',
            'Результат',
            '<p class="result">10</p>',

            '<hr>',
            '<p>Функция FILTER возвращает все элементы коллекции, обращающие предикат в true:</p>',
            '<p class="syntax">Синтаксис: FILTER(identifier IN collection WHERE predicate)</p>',
            '<p>Пример: Вывести все целые числа от 0 до 10, куб которых больше 7 и квадрат меньше 60.</p>',
            '<p class="code">RETURN filter(x IN range(0,10) WHERE x^3>7 and x^2<60)</p>',
            'Результат',
            '<p class="result">[2,3,4,5,6,7]</p>',

            '<hr>',
            '<p>Функция EXTRACT применяется, если нужно вернуть по одному свойству от узла или отношения:</p>',
            '<p class="syntax">Синтаксис: EXTRACT( identifier in collection | expression )</p>',
            '<p>identifier - переменная области видимости выражения expression, в которой хранится текущий элемент коллекции; expression - выражение, применяемое к каждому элементу коллекции.</p>',

            '<hr>',
            '<p>Функция REDUCE проходит по коллекции и к каждому ее элементу применяет выражение, результат которого записывается в переменную-аккумулятор:</p>',
            '<p class="syntax">Синтаксис: REDUCE( accumulator = initial, identifier in collection | expression )</p>',
            '<p>Пример: посчитать среднее арифметическое квадратов чисел от 0 до 10.</p>',
            '<p class="code">RETURN REDUCE(counter=0, x IN range(0,10) | counter + x^2)/length(range(0,10))</p>',
            'Результат',
            '<p class="result">35</p>',
            '</p>'
        ].join('')
    },
    {
        id: 4,
        author: 'me',
        div: '2.0.',
        title: 'Пути в графе',
        content: [
            '<p>',
            '<p>Шаблоны путей в графе позволяют отбирать в результирующую коллекцию только те узлы и отношения, которые можно сопоставить с этим шаблоном. Поэтому для понимания работы шаблонов пути необходимо хорошо понимать структуру моддели предметной области.</p>',
            '<p> При описании шаблонов фактически задается форма данных, и программисту не нужно знать, каким образом СУБД построит результирующую коллекцию.</p>',
            '<p>Шаблоны могут применяться в нескольких местах запроса: в предложениях <b>MATCH, CREATE и MERGE</b>.</p>',
            '<h4>Шаблоны для поиска узлов</h4>',
            '<p>Самым простым примером даного типа является шаблон выбора одного узла:</p>',
            '<p class="code">match (n) 	return n</p>',
            '<p>Результатом будет коллекция всех узлов в графе(аналог * в предложении SELECT из SQL)</p>',
            '<p>Для выбора узлов, связанных отношением, применяется синтаксис:</p>',
            '<p><span class="syntax">(a)-->(b)</span>, где (a) - узел-предок, (b) - узел-потомок, --> - направленное отношение от  a к b. идентификаторы a и b можно будет использовать в запросе. Если некоторый узел в шаблоне пути использоваться не будет, идентификатор можно опустить</p>',
            '<p><span class="syntax">(a)--()</span> &mdash;  ненаправленное отношение между  a и любым другим узлом.</p>',
            '<p>Необходимо понимать, что использование очень длинных шаблонов требует больших затрат памяти, особенно при поиске на больших графах.</p>',
            '</p>'
        ].join('')
    },
    {
        id: 5,
        author: 'me',
        div: '2.0.',
        title: 'Метки и индексы',
        content: [
            '<p>',
            '<p>Метки позволяют объединить несколько узлов в графе. При указании имени метки в запросе, СУБД будет искать узлы только в той части графа, которая закреплена за этой меткой.</p>',
            '<p>Поиск по шаблону с указанием метки:</p>',
            '<p class="code">match (n:myLabel) return n</p>',
            '<p class="result">возвращаемым значением будет коллекция из 2 узлов, созданных ранее.</p>',
            '<p>Cypher позволяет создавать индексы на свойствах узлов, обозначенных ранее описанной меткой. В процессе работы СУБД эти индексы будут поддерживаться и обновляться. При выполнении запроса, если СУБД встретит имя метки с индексом, план выполнения запроса будет построен на его основе.</p>',
            '<p>Создание индекса на свойстве some_property для узлов с меткой myLabel:</p>',
            '<p class="code">CREATE INDEX ON :myLabel(some_property)</p>',
            '<p>Индексы уникальны, поэтому повторная попытка выполнения запроса ни к чему не приведет.</p>',
            '<p>Удаление созданного ранее индекса:</p>',
            '<p class="code">DROP INDEX ON :myLabel(some_property)</p>',
            '<p>Необходимо понимать, что использование индексов на часто обновляемых свойствах узлов будет существенно тормозить систему.</p>',
            '</p>'
        ].join('')
    },
    {
        id: 6,
        author: 'me',
        div: '2.0.',
        title: 'Операции над узлами, отношениями и их свойствами',
        content: [
            '<p>',
            '<p>С помощью оператора CREATE можно создавать узлы и связывать их отношениями.</p>',
            '<p>Общий синтаксис при создании узлов:</p>',
            '<p class="code">CREATE [UNIQUE] (n:myLabel[:my_label_N] [{ [property_name : property_value][, ... ]}])</p>',
            '<p>Оператор CREATE не имеет возвращаемого значения.</p>',
            '<p>Использование ключа UNIQUE заставит СУБД сначала проверить наличие узла, и, если его нет, создать новый.</p>',

            '<p>Общий синтаксис при создании отношений между узлами:</p>',
            '<p><span class="code">CREATE [UNIQUE] (node_a)-[r:RELTYPE[{[param:value][, ...]}]->(node_b)</span>, node_a, node_b &mdash; узлы, которые необходимо связать</p>',
            '<p>Отношения НЕ являются уникальными (если не использовать ключ  UNIQUE)</p>',

            '<p>Пример: Создать отношение между узлами, отмеченными как myLabel и myAnotherLabel со свойствами name="simple" и weight=23, вернуть созданные отношения:</p>',
            '<p class="code">MATCH (node_a:myLabel),(node_b:myAnotherLabel)</p><p class="code"> CREATE (node_a)-[r:myRelType{name:"simple", weight:23}]->(node_b)   return r;</p>',
            '<p class="result">Будут возвращены не только отношения, но и узлы, непосредственно связанные ими</p>',

            '<p>Использование ключа UNIQUE заставит СУБД сначала проверить наличие узла или отношения, и, если его нет, создать новый.</p>',

            '<p>Также оператор CREATE позволяет в одном запросе создать путь в графе:</p>',
            '<p><span class="code">CREATE UNIQUE (a:TESTLABEL { name:"Alex" })-[:CHILD_OF]->(b:TESTLABEL{name:"John"})<-[:CHILD_OF]-(c:TESTLABEL { name:"Anna" })</span>, node_a, node_b &mdash; узлы, которые необходимо связать</p>',
            '<p class="result">будут созданы 3 узла с заданными свойствами, соединенные отношениями CHILD_OF</p>',

            '<p>Пример: к центральному узлу графа из последнего примера добавить узел, связанный с ним отношением KNOWS:</p>',
            '<p class="code">MATCH ()-[CHILD_OF]->(n)</p>',
            '<p class="code">CREATE [unique] (n)-[:KNOWS]->({name:"Jack"})</p>',
            '<p class="code">return r</p>',

            '<p>Оператор SET позволяет создавать, удалять и модифицировать свойства объектов графа, задавать метки узлов и отношений.</p>',
            '<p>Синтаксис:</p>',
            '<p><span class="code">SET obj.property_name = property_value;</span>  obj &mdash; узел или отношение, property_name &mdash; имя свойства</p>',
            '<p>Свойства уникальны в пределах узла, повторное выполнение запроса приведет к замещению значения свойства.</p>',
            '<p>Для удаления свойства достаточно присвоить ему <b>null</b>.</p>',

            '<p>Присвоение метки узлу:</p>',
            '<p><span class="code">SET my_node :LABEL_NAME[:ANOTHER_LABEL_NAME]</span>  my_node &mdash; узел или коллекция узлов, с которыми будут ассоциированы одна или несколько меток</p>',

            '</p>'
        ].join('')
    },
    {
        id: 7,
        author: 'me',
        div: '2.0.',
        title: 'Условные операторы',
        content: [
            '<p>',
            '<p>В качестве оператора условных переходов применяется CASE С помощью оператора CREATE можно создавать узлы и связывать их отношениями.</p>',
            '<p>Общий синтаксис:</p>',
            '<p class="code">CASE expr</p>',
            '<p class="code">WHEN value1 THEN result1</p>',
            '<p class="code">[WHEN value2 THEN result1]</p>',

            '<p>Выражение expr вычисляется и сравнивается с каждым значением из предложения WHEN до тех пор, пока не будеьИспользование ключа UNIQUE заставит СУБД сначала проверить наличие узла, и, если его нет, создать новый.</p>',

            '<p>Общий синтаксис при создании отношений между узлами:</p>',
            '<p><span class="code">CREATE (node_a)-[r:RELTYPE]->(node_b)</span>, node_a, node_b &mdash; узлы, которые необходимо связать</p>',
            '<p class="result">запрос ничего не возвращает</p>',
            '<p>Отношения являются уникальными, повторное выполнение запроса приведет к замещению созданных ранее отношений</p>',

            '<p>Пример: Создать отношение между узлами, отмеченными как myLabel и myAnotherLabel со свойствами name="simple" и weight=23, вернуть созданные отношения:</p>',
            '<p class="code">MATCH (node_a:myLabel),(node_b:myAnotherLabel)</p><p class="code"> CREATE (node_a)-[r:myRelType{name:"simple", weight:23}]->(node_b)   return r;</p>',
            '<p class="result">Будут возвращены не только отношения, но и узлы, непосредственно связанные ими</p>',

            '<p>Использование ключа UNIQUE заставит СУБД сначала проверить наличие узла, и, если его нет, создать новый.</p>',

            '<p>Оператор SET позволяет создавать, удалять и модифицировать свойства объектов графа, задавать метки узлов и отношений.</p>',
            '<p>Синтаксис:</p>',
            '<p><span class="code">SET obj.property_name = property_value;</span>  obj &mdash; узел или отношение, property_name &mdash; имя свойства</p>',
            '<p>Свойства уникальны в пределах узла, повторное выполнение запроса приведет к замещению значения свойства.</p>',
            '<p>Для удаления свойства достаточно присвоить ему <b>null</b>.</p>',

            '<p>Синтаксис:</p>',
            '<p><span class="code">SET obj.property_name = property_value;</span>  obj &mdash; узел или отношение, property_name &mdash; имя свойства</p>',

            '<p class="result">запрос ничего не возвращает</p>',

            '</p>'

        ].join('')
    },
    {
        id: 4,
        author: 'me',
        div: '2.0.',
        title: 'Предикаты',
        content: [
        ].join('')
    },
    {
        id: 5,
        author: 'me',
        div: '2.0.',
        title: 'Скалярные функции',
        content: [
        ].join('')
    },
    {
        id: 6,
        author: 'me',
        div: '2.0.',
        title: 'Строковые функции',
        content: [
        ].join('')
    },
    {
        id: 7,
        author: 'me',
        div: '2.0.',
        title: 'Математические функции',
        content: [
        ].join('')
    },
    {
        id: 8,
        author: 'me',
        div: '2.0.',
        title: 'Скалярные функции',
        content: [
        ].join('')
    },
    {
        id: 9,
        author: 'me',
        div: '2.0.',
        title: 'работа с null',
        content: [
        ].join('')
    },
    {
        id: 10,
        author: 'me',
        div: '2.0.',
        title: 'Оператор RETURN',
        content: [
        ].join('')
    },

    {
        id: 11,
        author: 'me',
        div: '2.0.',
        title: 'Оператор ORDER BY',
        content: [
        ].join('')
    },

    {
        id: 12,
        author: 'me',
        div: '2.0.',
        title: 'Оператор LIMIT',
        content: [
        ].join('')
    },

    {
        id: 13,
        author: 'me',
        div: '2.0.',
        title: 'Оператор SKIP',
        content: [
        ].join('')
    },

    {
        id: 14,
        author: 'me',
        div: '2.0.',
        title: 'Оператор WITH',
        content: [
        ].join('')
    },
    {
        id: 15,
        author: 'me',
        div: '2.0.',
        title: 'Оператор UNION',
        content: [
        ].join('')
    },

    {
        id: 16,
        author: 'me',
        div: '2.0.',
        title: 'Оператор USING',
        content: [
        ].join('')
    },

    {
        id: 17,
        author: 'me',
        div: '2.0.',
        title: 'Операция выборки',
        content: [
        ].join('')
    },

    {
        id: 18,
        author: 'me',
        div: '2.0.',
        title: 'Модификация',
        content: [
        ].join('')
    },

    {
        id: 19,
        author: 'me',
        div: '2.0.',
        title: 'Вставка и удаление',
        content: [
        ].join('')
    },


    {
        id: 20,
        author: 'me',
        div: '2.0.',
        title: 'Агрегация',
        content: [
        ].join('')
    }


];