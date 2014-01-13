--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

--
-- Name: russian; Type: COLLATION; Schema: public; Owner: auth_user
--

CREATE COLLATION russian (lc_collate = 'ru_RU.utf8', lc_ctype = 'ru_RU.utf8');


ALTER COLLATION public.russian OWNER TO auth_user;

--
-- Name: add_chapter(integer, text, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION add_chapter(_parent integer, _name text, _author integer) RETURNS TABLE(id integer, dtcreated timestamp with time zone, author integer, name text, parent integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
RETURN QUERY INSERT INTO help_chapters (name, author, parent) VALUES (_name, _author, _parent)
RETURNING help_chapters.*;
END
$$;


ALTER FUNCTION public.add_chapter(_parent integer, _name text, _author integer) OWNER TO postgres;

--
-- Name: add_chapter(integer, text, integer, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION add_chapter(_parent integer, _name text, _author integer, _content text) RETURNS TABLE(hier_id integer, branch_id integer, diff_id integer)
    LANGUAGE plpgsql
    AS $$
declare
  diff_id int;
  branch_id int;
  hier_id int;
BEGIN
  insert into helps_branches(name,head) values(_name,null) returning id into branch_id;
  insert into help_diffs(branch,author,content) values(branch_id, _author,_content) returning  id into diff_id;
  insert into helps_hierarchy(parent,branch) values(_parent, branch_id) returning  id into hier_id;
RETURN query select hier_id, branch_id, diff_id;
END
$$;


ALTER FUNCTION public.add_chapter(_parent integer, _name text, _author integer, _content text) OWNER TO postgres;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE users (
    id integer NOT NULL,
    dt timestamp with time zone DEFAULT now() NOT NULL,
    email character varying(50),
    pass character varying(35),
    confirm character varying(32),
    name character varying(60),
    role character varying(10)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: auth_user(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION auth_user(_email character varying, _pass character varying) RETURNS SETOF users
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY SELECT
                 *
               FROM USERS
               WHERE email = _email AND pass = _pass;
END
$$;


ALTER FUNCTION public.auth_user(_email character varying, _pass character varying) OWNER TO postgres;

--
-- Name: auth_user(character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION auth_user(_email character varying, _name character varying, _pass character varying, _role character varying) RETURNS SETOF users
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY INSERT INTO users (email, name, pass, role) VALUES (_email, _name, _pass, _role)
RETURNING id;
END
$$;


ALTER FUNCTION public.auth_user(_email character varying, _name character varying, _pass character varying, _role character varying) OWNER TO postgres;

--
-- Name: move_chapter(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION move_chapter(_what integer, _to integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
update help_chapters set parent=_to where id=_what;
END
$$;


ALTER FUNCTION public.move_chapter(_what integer, _to integer) OWNER TO postgres;

--
-- Name: reg_user(character varying, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION reg_user(_name character varying, _email character varying, _pass character varying, _confirm character varying, _role character varying) RETURNS TABLE(id integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
  userid INTEGER;
BEGIN
  return query INSERT INTO users (email, name, pass, confirm, role) VALUES (_email, _name, _pass,_confirm, _role)
RETURNING users.id;
END
$$;


ALTER FUNCTION public.reg_user(_name character varying, _email character varying, _pass character varying, _confirm character varying, _role character varying) OWNER TO postgres;

--
-- Name: sign_in(character varying, character varying); Type: FUNCTION; Schema: public; Owner: auth_user
--

CREATE FUNCTION sign_in(_email character varying, _pass character varying) RETURNS SETOF users
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY SELECT * FROM USERS WHERE email=_email and pass=_pass;
END
$$;


ALTER FUNCTION public.sign_in(_email character varying, _pass character varying) OWNER TO auth_user;

--
-- Name: help_chapters; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE help_chapters (
    id integer NOT NULL,
    dtcreated timestamp with time zone DEFAULT now() NOT NULL,
    author integer,
    name text,
    content text,
    pos integer,
    indent integer,
    published boolean
);


ALTER TABLE public.help_chapters OWNER TO postgres;

--
-- Name: help_chapters_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE help_chapters_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.help_chapters_id_seq OWNER TO postgres;

--
-- Name: help_chapters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE help_chapters_id_seq OWNED BY help_chapters.id;


--
-- Name: help_diffs; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE help_diffs (
    id integer NOT NULL,
    branch integer NOT NULL,
    author integer,
    content text
);


ALTER TABLE public.help_diffs OWNER TO postgres;

--
-- Name: help_diffs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE help_diffs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.help_diffs_id_seq OWNER TO postgres;

--
-- Name: help_diffs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE help_diffs_id_seq OWNED BY help_diffs.id;


--
-- Name: help_razd; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE help_razd (
    pos integer NOT NULL,
    name text,
    chapters json
);


ALTER TABLE public.help_razd OWNER TO postgres;

--
-- Name: help_razd_pos_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE help_razd_pos_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.help_razd_pos_seq OWNER TO postgres;

--
-- Name: help_razd_pos_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE help_razd_pos_seq OWNED BY help_razd.pos;


--
-- Name: helps; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE helps (
    id integer NOT NULL,
    dtcreated timestamp with time zone DEFAULT now() NOT NULL,
    author integer,
    name text COLLATE public.russian,
    version text,
    content text
);


ALTER TABLE public.helps OWNER TO postgres;

--
-- Name: helps_branches; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE helps_branches (
    id integer NOT NULL,
    name text,
    head integer
);


ALTER TABLE public.helps_branches OWNER TO postgres;

--
-- Name: helps_branches_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE helps_branches_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.helps_branches_id_seq OWNER TO postgres;

--
-- Name: helps_branches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE helps_branches_id_seq OWNED BY helps_branches.id;


--
-- Name: helps_hierarchy; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE helps_hierarchy (
    id integer NOT NULL,
    parent integer,
    branch integer
);


ALTER TABLE public.helps_hierarchy OWNER TO postgres;

--
-- Name: helps_hierarchy_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE helps_hierarchy_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.helps_hierarchy_id_seq OWNER TO postgres;

--
-- Name: helps_hierarchy_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE helps_hierarchy_id_seq OWNED BY helps_hierarchy.id;


--
-- Name: helps_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE helps_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.helps_id_seq OWNER TO postgres;

--
-- Name: helps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE helps_id_seq OWNED BY helps.id;


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE users_id_seq OWNED BY users.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY help_chapters ALTER COLUMN id SET DEFAULT nextval('help_chapters_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY help_diffs ALTER COLUMN id SET DEFAULT nextval('help_diffs_id_seq'::regclass);


--
-- Name: pos; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY help_razd ALTER COLUMN pos SET DEFAULT nextval('help_razd_pos_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY helps ALTER COLUMN id SET DEFAULT nextval('helps_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY helps_branches ALTER COLUMN id SET DEFAULT nextval('helps_branches_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY helps_hierarchy ALTER COLUMN id SET DEFAULT nextval('helps_hierarchy_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);


--
-- Data for Name: help_chapters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY help_chapters (id, dtcreated, author, name, content, pos, indent, published) FROM stdin;
12	2014-01-12 16:28:23.551294+04	23	Начало работы с СУБД Neo4j	<h4>Установка и настройка</h4>\n<p>Для установки сервера Neo4j на вашем компьютере потребуется JRE 1.7, а также дистрибутив, который можно скачать с&nbsp;<a href="http://www.neo4j.org/" target="_blank">официального сайта</a>. Для выполнения упражнений потребуется версия не ниже 1.9.5, совместимая с вашей ОС.Для запуска потребуется распаковать архив, перейти в каталог с распакованными файлами и выполнить команду bin/neo4j start. Список возможных режимов запуска сервера выводится при выполнении bin/neo4j help.После успешного старта сервер будет доступен на 7474 порту. Вместе с сервером запускается web-интерфейс, в котором также можно в интерактивном режиме выполнять запросы и видеть результаты их выполнения.</p>\n<p>&nbsp;</p>\n<h5>Типы данных и их истинностные значения:</h5>\n<ul>\n<li><strong>boolean</strong>&nbsp;&mdash; булевское значение [true:false];</li>\n<li><strong>byte</strong>&nbsp;&mdash; целое, 1 байт [-128:127];</li>\n<li><strong>short</strong>&nbsp;&mdash; целое, 2 байт [32768:32767];</li>\n<li><strong>int</strong>&nbsp;&mdash; целое, 4 байт [-2147483648 : 2147483647];</li>\n<li><strong>long</strong>&nbsp;&mdash; целое, 8 байт [-9223372036854775808 : 9223372036854775807];</li>\n<li><strong>float</strong>&nbsp;&mdash; 4-х байтовое число с плавающей точкой;</li>\n<li><strong>double</strong>&nbsp;&mdash; 8-х байтовое число с плавающей точкой;</li>\n<li><strong>char</strong>&nbsp;&mdash; 2-х байтовое безнаковое целое [0 : 65535], представляет символ Unicode;</li>\n<li><strong>String</strong>&nbsp;&mdash; последовательность unicode символов, в том числе и escape-последовательности(\\t, \\b, \\n, \\r, \\f, \\', \\", \\).</li>\n</ul>\n<p>&nbsp;</p>\n<p>&nbsp;</p>\n<h5>Термины языка Cypher:</h5>\n<ul>\n<li>узел (Node)&mdash; запись, моделирующая некоторую сущность из предметной области, может содержать свойства;</li>\n<li>свойство (Property) &mdash; пара &laquo;ключ-значение&raquo;, где ключом является строковое значение, а значением &mdash; любой из вышеперечисленных типов данных, а также массив на их основе;</li>\n<li>связи или отношения (Relationships) позволяют моделировать логическую связь между объектами из предметной области, также могут иметь свойства;</li>\n<li>метка(Label) &mdash; именованная совокупность узлов графа(подграф). В качестве имени метки может использоваться непустая строка unicode. В дальнейшем по имени метки можно быстро найти узлы;</li>\n<li>путь (Path) &mdash; несколько узлов, соединенных отношениями. Используются в сложных запросах, требующих найти данные по некоторому структурному шаблону;</li>\n</ul>\n<p>&nbsp;</p>\n<p>СУБД Neo4j поддерживает описания схем для повышения производительности, но, в общем случае, применение схем необязательно. Приведение типов работает по правилам Си-подобных языков программирования.</p>\n<h4>Индексы и ограничения</h4>\n<p>В Neo4j начиная с версии 1.8 появились индексы и ограничения &mdash; они полностью аналогичны функционально индексам и ограничениям в реляционных СУБД. Но отличие от них, Neo4j позволяет создавать именованные индексы для свойств узлов выборочно по именам, что позволяет повысить скорость операций модификации.</p>	\N	2	t
24	2014-01-12 17:55:14.315036+04	23	Оператор LIMIT	<p>Оператор LIMIT ограничивает количество элеменов в результирующем наборе.</p>\n<p>Пример:</p>\n<p class="code">MATCH (n { name: "Alex" })</p>\n<p class="code">RETURN n</p>\n<p class="code">LIMIT 5</p>\n<p>Возвратит первые 5 элементов, попавших в результирующий набор</p>	14	2	t
15	2014-01-12 17:52:09.946996+04	23	Пути в графе	<p>Шаблоны путей в графе позволяют отбирать в результирующую коллекцию только те узлы и отношения, которые можно сопоставить с этим шаблоном. Поэтому для понимания работы шаблонов пути необходимо хорошо понимать структуру моддели предметной области.</p>\n<p>При описании шаблонов фактически задается форма данных, и программисту не нужно знать, каким образом СУБД построит результирующую коллекцию.</p>\n<p>Шаблоны могут применяться в нескольких местах запроса: в предложениях<strong>MATCH, CREATE и MERGE</strong>.</p>\n<h4>Шаблоны для поиска узлов</h4>\n<p>Самым простым примером даного типа является шаблон выбора одного узла:</p>\n<p class="code">match (n) return n</p>\n<p>Результатом будет коллекция всех узлов в графе(аналог * в предложении SELECT из SQL)</p>\n<p>Для выбора узлов, связанных отношением, применяется синтаксис:</p>\n<p><span class="syntax">(a)--&gt;(b)</span>, где (a) - узел-предок, (b) - узел-потомок, --&gt; - направленное отношение от a к b. идентификаторы a и b можно будет использовать в запросе. Если некоторый узел в шаблоне пути использоваться не будет, идентификатор можно опустить</p>\n<p><span class="syntax">(a)--()</span>&nbsp;&mdash; ненаправленное отношение между a и любым другим узлом.</p>\n<p>Необходимо понимать, что использование очень длинных шаблонов требует больших затрат памяти, особенно при поиске на больших графах.</p>	5	1	t
17	2014-01-12 17:52:50.670859+04	23	Операции над узлами, отношениями и их свойствами	<p>С помощью оператора CREATE можно создавать узлы и связывать их отношениями.</p>\n<p>Общий синтаксис при создании узлов:</p>\n<p class="code">CREATE [UNIQUE] (n:myLabel[:my_label_N] [{ [property_name : property_value][, ... ]}])</p>\n<p>Оператор CREATE не имеет возвращаемого значения.</p>\n<p>Использование ключа UNIQUE заставит СУБД сначала проверить наличие узла, и, если его нет, создать новый.</p>\n<p>Общий синтаксис при создании отношений между узлами:</p>\n<p><span class="code">CREATE [UNIQUE] (node_a)-[r:RELTYPE[{[param:value][, ...]}]-&gt;(node_b)</span>, node_a, node_b &mdash; узлы, которые необходимо связать</p>\n<p>Отношения НЕ являются уникальными (если не использовать ключ UNIQUE)</p>\n<p>Пример: Создать отношение между узлами, отмеченными как myLabel и myAnotherLabel со свойствами name="simple" и weight=23, вернуть созданные отношения:</p>\n<p class="code">MATCH (node_a:myLabel),(node_b:myAnotherLabel)</p>\n<p class="code">CREATE (node_a)-[r:myRelType{name:"simple", weight:23}]-&gt;(node_b) return r;</p>\n<p class="result">Будут возвращены не только отношения, но и узлы, непосредственно связанные ими</p>\n<p>Использование ключа UNIQUE заставит СУБД сначала проверить наличие узла или отношения, и, если его нет, создать новый.</p>\n<p>Также оператор CREATE позволяет в одном запросе создать путь в графе:</p>\n<p><span class="code">CREATE UNIQUE (a:TESTLABEL { name:"Alex" })-[:CHILD_OF]-&gt;(b:TESTLABEL{name:"John"})&lt;-[:CHILD_OF]-(c:TESTLABEL { name:"Anna" })</span>, node_a, node_b &mdash; узлы, которые необходимо связать</p>\n<p class="result">будут созданы 3 узла с заданными свойствами, соединенные отношениями CHILD_OF</p>\n<p>Пример: к центральному узлу графа из последнего примера добавить узел, связанный с ним отношением KNOWS:</p>\n<p class="code">MATCH ()-[CHILD_OF]-&gt;(n)</p>\n<p class="code">CREATE [unique] (n)-[:KNOWS]-&gt;({name:"Jack"})</p>\n<p class="code">return r</p>\n<p>Оператор SET позволяет создавать, удалять и модифицировать свойства объектов графа, задавать метки узлов и отношений.</p>\n<p>Синтаксис:</p>\n<p><span class="code">SET obj.property_name = property_value;</span>&nbsp;obj &mdash; узел или отношение, property_name &mdash; имя свойства</p>\n<p>Свойства уникальны в пределах узла, повторное выполнение запроса приведет к замещению значения свойства.</p>\n<p>Для удаления свойства достаточно присвоить ему&nbsp;<strong>null</strong>.</p>\n<p>Присвоение метки узлу:</p>\n<p><span class="code">SET my_node :LABEL_NAME[:ANOTHER_LABEL_NAME]</span>&nbsp;my_node &mdash; узел или коллекция узлов, с которыми будут ассоциированы одна или несколько меток</p>	7	1	f
19	2014-01-12 17:53:28.072261+04	23	Предикаты ALL, ANY, NONE, SINGLE	<h4>Предикат ALL</h4>\n<p>Синтаксис:</p>\n<p class="code">ALL(elem_id in coll WHERE expr)</p>\n<ul>\n<li>elem_id - переменная, которая хранит в себе элемент коллекции</li>\n<li>coll - идентификатор коллекции или выражение, возвращающее коллекцию</li>\n<li>expr - предикат, применяемый к каждому элементу коллекции coll</li>\n</ul>\n<p>Возвращает true, если все элементы коллекции обращают expr в true.</p>\n<h4>Предикат ANY</h4>\n<p>Синтаксис:</p>\n<p class="code">ANY(elem_id in coll WHERE expr)</p>\n<ul>\n<li>elem_id - переменная, которая хранит в себе элемент коллекции</li>\n<li>coll - идентификатор коллекции или выражение, возвращающее коллекцию</li>\n<li>expr - предикат, применяемый к каждому элементу коллекции coll</li>\n</ul>\n<p>Возвращает true, если хотя бы один элемент из коллекции обращает expr в true.</p>\n<h4>Предикат NONE</h4>\n<p>Синтаксис:</p>\n<p class="code">NONE(elem_id in coll WHERE expr)</p>\n<ul>\n<li>elem_id - переменная, которая хранит в себе элемент коллекции</li>\n<li>coll - идентификатор коллекции или выражение, возвращающее коллекцию</li>\n<li>expr - предикат, применяемый к каждому элементу коллекции coll</li>\n</ul>\n<p>Возвращает true, если ни для одного элемента из коллекции expr не выполняется.</p>\n<h4>Предикат SINGLE</h4>\n<p>Синтаксис:</p>\n<p class="code">SINGLE(elem_id in coll WHERE expr)</p>\n<ul>\n<li>elem_id - переменная, которая хранит в себе элемент коллекции</li>\n<li>coll - идентификатор коллекции или выражение, возвращающее коллекцию</li>\n<li>expr - предикат, применяемый к каждому элементу коллекции coll</li>\n</ul>\n<p>Возвращает true, если точно один элемент из коллекции обращает expr в true.</p>	9	1	f
21	2014-01-12 17:54:13.061337+04	23	Функции для работы с коллекциями	<p>Функция HEAD(coll) возвращает начальный элемент коллекции:</p>\n<p class="code">RETURN HEAD(range(0,10))</p>\n<p>Результат</p>\n<p class="result">0</p>\n<p>Функция TAIL возвращает все элементы коллекции, начиная со второго:</p>\n<p class="code">RETURN TAIL(range(0,10))</p>\n<p>Результат</p>\n<p class="result">[1,2,3,4,5,6,7,8,9,10]</p>\n<h4>NODES</h4>\n<p>Синтаксис:</p>\n<p class="code">NODES(p)</p>\n<p>Возвращает все узлы, входящие в путь на графе p.</p>\n<h4>RELATIONSHIPS</h4>\n<p>Синтаксис:</p>\n<p class="code">RELATIONSHIPS(p)</p>\n<p>Возвращает все отношения, входящие в путь на графе p.</p>\n<h4>LABELS</h4>\n<p>Синтаксис:</p>\n<p class="code">LABELS(n)</p>\n<p>Возвращает коллекцию из всех меток, ассоциированных с узлом n.</p>\n<h4>EXTRACT</h4>\n<p>Синтаксис:</p>\n<p class="code">EXTRACT( identifier in coll | expr )</p>\n<ul>\n<li>identifier - переменная, которая хранит в себе элемент коллекции</li>\n<li>coll - идентификатор коллекции или выражение, возвращающее коллекцию</li>\n<li>expr - предикат, применяемый к каждому элементу коллекции coll</li>\n</ul>\n<p>Функция EXTRACT применяется, если нужно вернуть по одному свойству от каждого узла или отношения из коллекции.</p>\n<hr />\n<p>Функция FILTER возвращает все элементы коллекции, обращающие предикат в true:</p>\n<p class="syntax">Синтаксис: FILTER(identifier IN collection WHERE predicate)</p>\n<p>Пример: Вывести все целые числа от 0 до 10, куб которых больше 7 и квадрат меньше 60.</p>\n<p class="code">RETURN filter(x IN range(0,10) WHERE x^3&gt;7 and x^2&lt;60)</p>\n<p>Результат</p>\n<p class="result">[2,3,4,5,6,7]</p>\n<hr />\n<p>Функция EXTRACT применяется, если нужно вернуть по одному свойству от узла или отношения:</p>\n<p class="syntax">Синтаксис: EXTRACT( identifier in collection | expression )</p>\n<p>identifier - переменная области видимости выражения expression, в которой хранится текущий элемент коллекции; expression - выражение, применяемое к каждому элементу коллекции.</p>\n<hr />\n<p>Функция REDUCE проходит по коллекции и к каждому ее элементу применяет выражение, результат которого записывается в переменную-аккумулятор:</p>\n<p class="syntax">Синтаксис: REDUCE( accumulator = initial, identifier in collection | expression )</p>\n<p>Пример: посчитать среднее арифметическое квадратов чисел от 0 до 10.</p>\n<p class="code">RETURN REDUCE(counter=0, x IN range(0,10) | counter + x^2)/length(range(0,10))</p>\n<p>Результат</p>\n<p class="result">35</p>	11	1	f
25	2014-01-12 17:55:32.949838+04	23	Оператор SKIP	<p>Оператор SKIP исключает из результирующего набора N первых элементов. Необходимо учитывать, что SKIP предварительно не сортирует результирующий набор.</p>\n<p>Пример:</p>\n<p class="code">MATCH (n { name: "Alex" })</p>\n<p class="code">RETURN n</p>\n<p class="code">SKIP 2</p>\n<p>Возвратит всё, кроме первых 2 узлов</p>\n<p>SKIP можно комбинировать с LIMIT:</p>\n<p class="code">MATCH (n { name: "Alex" })</p>\n<p class="code">RETURN n</p>\n<p class="code">ORDER BY n.name</p>\n<p class="code">SKIP 2</p>\n<p class="code">LIMIT 3</p>\n<p>Результирующий набор будет сначала отсортирован по значениям свойства name, потом из него будут исключены 2 первых узла и возвращены 3 оставшихся</p>	15	1	f
16	2014-01-12 17:52:30.841868+04	23	Метки и индексы	<p>Метки позволяют объединить несколько узлов в графе. При указании имени метки в запросе, СУБД будет искать узлы только в той части графа, которая закреплена за этой меткой.</p>\n<p>Поиск по шаблону с указанием метки:</p>\n<p class="code">match (n:myLabel) return n</p>\n<p class="result">возвращаемым значением будет коллекция из 2 узлов, созданных ранее.</p>\n<p>Cypher позволяет создавать индексы на свойствах узлов, обозначенных ранее описанной меткой. В процессе работы СУБД эти индексы будут поддерживаться и обновляться. При выполнении запроса, если СУБД встретит имя метки с индексом, план выполнения запроса будет построен на его основе.</p>\n<p>Создание индекса на свойстве some_property для узлов с меткой myLabel:</p>\n<p class="code">CREATE INDEX ON :myLabel(some_property)</p>\n<p>Индексы уникальны, поэтому повторная попытка выполнения запроса ни к чему не приведет.</p>\n<p>Удаление созданного ранее индекса:</p>\n<p class="code">DROP INDEX ON :myLabel(some_property)</p>\n<p>Необходимо понимать, что использование индексов на часто обновляемых свойствах узлов будет существенно тормозить систему.</p>	6	2	f
18	2014-01-12 17:53:09.292569+04	23	Условные операторы	<p>В качестве оператора условных переходов применяется CASE С помощью оператора CREATE можно создавать узлы и связывать их отношениями.</p>\n<p>Общий синтаксис:</p>\n<p class="code">CASE expr</p>\n<p class="code">WHEN value1 THEN result1</p>\n<p class="code">[WHEN value2 THEN result1]</p>\n<p>Выражение expr вычисляется и сравнивается с каждым значением из предложения WHEN до тех пор, пока не будеьИспользование ключа UNIQUE заставит СУБД сначала проверить наличие узла, и, если его нет, создать новый.</p>\n<p>Общий синтаксис при создании отношений между узлами:</p>\n<p><span class="code">CREATE (node_a)-[r:RELTYPE]-&gt;(node_b)</span>, node_a, node_b &mdash; узлы, которые необходимо связать</p>\n<p class="result">запрос ничего не возвращает</p>\n<p>Отношения являются уникальными, повторное выполнение запроса приведет к замещению созданных ранее отношений</p>\n<p>Пример: Создать отношение между узлами, отмеченными как myLabel и myAnotherLabel со свойствами name="simple" и weight=23, вернуть созданные отношения:</p>\n<p class="code">MATCH (node_a:myLabel),(node_b:myAnotherLabel)</p>\n<p class="code">CREATE (node_a)-[r:myRelType{name:"simple", weight:23}]-&gt;(node_b) return r;</p>\n<p class="result">Будут возвращены не только отношения, но и узлы, непосредственно связанные ими</p>\n<p>Использование ключа UNIQUE заставит СУБД сначала проверить наличие узла, и, если его нет, создать новый.</p>\n<p>Оператор SET позволяет создавать, удалять и модифицировать свойства объектов графа, задавать метки узлов и отношений.</p>\n<p>Синтаксис:</p>\n<p><span class="code">SET obj.property_name = property_value;</span>&nbsp;obj &mdash; узел или отношение, property_name &mdash; имя свойства</p>\n<p>Свойства уникальны в пределах узла, повторное выполнение запроса приведет к замещению значения свойства.</p>\n<p>Для удаления свойства достаточно присвоить ему&nbsp;<strong>null</strong>.</p>\n<p>Синтаксис:</p>\n<p><span class="code">SET obj.property_name = property_value;</span>&nbsp;obj &mdash; узел или отношение, property_name &mdash; имя свойства</p>\n<p class="result">запрос ничего не возвращает</p>	8	2	f
13	2014-01-12 16:52:45.17244+04	23	Синтаксис Cypher	<p>Cypher - это декларативный язык запросов, позволяющий эффективно манипулировать данными графовой СУБД. Структурой запросов сильно похож на SQL. Кроме запросов на выборку позволяет также изменять, обновлять данные, добавлять ограничения и т.д. Также как в SQL, есть набор основных функций, например, для работы с датами, массивами, коллекциями и строками. Кроме того, СУБД поддерживает транзакции а также построение индексов по выбранным свойствам узлов.</p>\n<hr />\n<h4>Операторы языка Cypher</h4>\n<p>&nbsp;</p>\n<ul>\n<li>Математические операторы: +, -, *, /, %, ^. При выполнении операций над операндами разных типов будет происходить неявное преобразование типов в сторону увеличения точности.</li>\n<li>Операторы сравнения: =, &lt;&gt;, &lt;, &gt;, &lt;=, &gt;=.</li>\n<li>Логические операторы: AND, OR, XOR, NOT.</li>\n<li>Операции над строками: строки конкатенируются оператором +.</li>\n<li>Операции над коллекциями: оператор + объединяет 2 коллекции, для проверки наличия элемена в коллекции используется оператор IN.</li>\n<li>Так как СУБД Neo4j не требует описания схемы, в запросе возможна ситуация сравнения со свойством узла, которого не существует. Для предотвращения ошибки рекомендуется проверять наличие свойства у узла, например:<br />\n<p class="code">WHERE n.some_property? = "something"&nbsp;<span class="comment">//вернет false, если у узла n существует свойство с именем some_property</span></p>\n<p class="code">WHERE n.some_property! = "something"&nbsp;<span class="comment">//вернет true, если у узла n существует свойство с именем some_property</span></p>\n<p class="warning">Замечание: пробел после &laquo;!&raquo; Во втором примере обязателен.</p>\nПредикат HAS(prop_name) является аналогом оператора &laquo;!&raquo;.\n<p class="warning">Примечание: в Cypher 2.0 операторы ! B ? не поддерживаются. Проверка значения свойства возвращает null, а синтаксис выглядит следующим образом:</p>\n<p class="code">has(n.some_property)</p>\n</li>\n</ul>\n<p>&nbsp;</p>\n<hr />\n<p>&nbsp;</p>\n<h4>Выражением в Cypher могут быть:</h4>\n<ul>\n<li>истинностные значения любых простых типов данных</li>\n<li>идентификаторы переменных (a,b,n,some_node и т.д.)</li>\n<li>обращения к свойствам узлов( n.prop, x.prop)</li>\n<li>параметры, подставляемые в запрос( {param}, {0})</li>\n<li>коллекции: ["a", "b"], [1,2,3], ["a", 2, n.property, {param}], [ ]</li>\n<li>вызовы функций: length(some_collection), nodes(node_set)</li>\n<li>шаблоны пути в графе: (a)--&gt;(f)&lt;--(b)</li>\n<li>предикаты: a.prop = "Hello", length(p) &gt; 10, has(a.name)</li>\n</ul>\n<p>Для добавления однострочного комментария к запросу используйте &laquo;//&raquo;.</p>	\N	1	t
11	2014-01-12 16:25:53.41729+04	23	Теория: графовая модель данных	<p>&nbsp;</p>\n<p>Графовая модель данных - это набор данных, представленных в виде графовой структуры, в узлах которой находятся записи, связанные между собой отношениями один-к-одному или один-ко-многим.Графовой подход к организации данных является расширением иерархического подхода. В иерархических структурах запись-потомок должна иметь в точности одного предка; в графовой структуре данных у потомка может иметься любое число предков.</p>\n<p>Базовыми объектами модели являются:<strong>&nbsp;элемент данных,агрегат данных,запись,набор данных.</strong></p>\n<p>&nbsp;</p>\n<ul>\n<li>Элемент данных &mdash; минимальная информационная единица, доступная пользователю с использованием СУБД.</li>\n<li>Агрегат данных соответствует следующему уровню обобщения в модели(например, агрегатом данных можно назвать массив или некоторый сложный тип данных, определенный пользователем СУБД). Агрегат данных имеет имя, и в системе допустимо обращение к агрегату по имени.</li>\n<li>Записью называется совокупность агрегатов или элементов данных, моделирующая некоторый класс объектов реального мира.</li>\n<li>Набором называется двухуровневый граф, связывающий отношением &laquo;одии-комногим&raquo; два типа записи, т.е отражает иерархическую связь между двумя типами записей. Родительский тип записи в данном наборе называется владельцем набора, а дочерний тип записи &mdash; членом того же набора.</li>\n</ul>\n<p>&nbsp;</p>\n<p>Для любых двух типов записей может быть задано любое количество наборов, которые их связывают. Фактически наличие подобных возможностей позволяет промоделировать отношение &laquo;многие-ко-многим&raquo; между двумя объектами реального мира, что выгодно отличает графовую модель от иерархической. В рамках набора возможен последовательный просмотр экземпляров членов набора, связанных с одним экземпляром владельца набора.Между двумя типами записей может быть определено любое количество наборов: например, можно построить два взаимосвязанных набора. Существенным ограничением набора является то, что один и тот же тип записи не может быть одновременно владельцем и членом набора.</p>\n<p>В отличие от реляционной модели, связи в ней моделируются наборами, реализованными с помощью указателей. Набор - именованная двухуровневая иерархическая структура, которая содержит запись-владельца и запись-потомка (1 или несколько). Наборы отражают связи &laquo;один ко многим&raquo; и &laquo;один к одному&raquo; между этими двумя типами записей.</p>	\N	1	t
14	2014-01-12 17:32:16.462221+04	23	Коллекции	<p>В Cypher коллекции являются аналогом наборов записей в SQL. Их главное отличие состоит в отсутствии типизации, что позволяет инициализировать коллекцию разными типами элементов, будь то целые числа, строки, коллекции или объекты графа.</p>\n<p class="code">RETURN [0,1.3,"str",n.prop, [1, 5.8]] AS my_collection</p>\n<p>Результат:</p>\n<p class="result">my_collection</p>\n<p class="result">1 row</p>\n<p class="result">[0,1.3,"str","sample", [1, 5.8]]</p>\n<p>Для обращения к отдельным элементам коллекции используются индексы, взятые в квадратные скобки:</p>\n<p class="code">RETURN [1,2,3,4,5][3]</p>\n<p>Результат:</p>\n<p class="result">4</p>\n<p>если в качестве индекса задать отрицательное число, то отсчет позиции элемента идет с конца коллекции:</p>\n<p class="code">RETURN [1,2,3,4,5][-1]</p>\n<p>Результат:</p>\n<p class="result">5</p>\n<p>Функция RANGE(a,b[,s]) создает пустую коллекцию и заполняет ее целыми числами от a до b с шагом s.</p>\n<p>также можно получить часть коллекции:</p>\n<p class="code">RETURN range(0,10)[2..5]</p>\n<p>Результат:</p>\n<p class="result">[2,3,4]</p>\n<p>результатом выполнения выражения будет коллекция.</p>\n<p class="code">RETURN range(0,10)[-3..]</p>\n<p>Результат:</p>\n<p class="result">[8,9,10]</p>\n<p>При обращении к одиночному элементу за границей коллекции результатом будет null:</p>\n<p class="code">RETURN range(0,10)[100]</p>\n<p>Результат</p>\n<p class="result">null</p>\n<p>Если при обращении к группе элементов коллекции окажется, что часть из них не существует, в результирующей коллекции null выведены не будут:</p>\n<p class="code">RETURN range(0,10)[5..15]</p>\n<p>Результат</p>\n<p class="result">[5,6,7,8,9,10]</p>\n<p>В Cypher 2.0 появилась возможность создавать коллекции на основе существующих колекций.Пример: Вывести все целые числа от 0 до 10, такие что их квадрат находится в диапазоне [50-90].Решение:</p>\n<p class="code">RETURN [x IN range(0,10) WHERE x^2&gt;50 and x^2&lt;90 | x] AS result</p>\n<p class="code">RETURN [x IN range(0,10) WHERE x^2&gt;50 and x^2&lt;90] AS result</p>\n<p>Результат</p>\n<p class="result">[8,9]</p>\n<hr />\n<p>В Cypher также возможно создавать объекты типа &laquo;ключ-значение&raquo; в формате JSON:</p>\n<p class="code">RETURN { key : "Value", arr: [{ a: "val1" }, { ab: "val2" }]}</p>\n<p>Результат</p>\n<p class="result">{ key : "Value", arr: [{ a: "val1" }, { ab: "val2" }]}</p>\n<hr />\n<p>Функция LENGTH возвращает длину коллекции:</p>\n<p class="code">RETURN LENGTH(range(0,10))</p>\n<p>Результат</p>\n<p class="result">10</p>	4	2	f
20	2014-01-12 17:53:51.928762+04	23	Скалярные функции	<h4>LENGTH</h4>\n<p>Синтаксис:</p>\n<p class="code">LENGTH(coll)</p>\n<p>Возвращает количество элементов коллекции, если аргумент - коллекция, или длину пути, если аргумент - путь в графе.</p>\n<h4>ID</h4>\n<p>Синтаксис:</p>\n<p class="code">ID(arg)</p>\n<p>Возвращает уникальный идентификатор сущности, если аргумент - узел или отношение, в противном случае - ошибка.</p>\n<h4>HEAD</h4>\n<p>Синтаксис:</p>\n<p class="code">HEAD(arg)</p>\n<p>Возвращает первый элемент из коллекции, если аргумент - коллекция, в противном случае - ошибка.</p>\n<h4>LAST</h4>\n<p>Синтаксис:</p>\n<p class="code">LAST(arg)</p>\n<p>Возвращает последний элемент из коллекции, если аргумент - коллекция, в противном случае - ошибка.</p>\n<h4>TYPE</h4>\n<p>Синтаксис:</p>\n<p class="code">TYPE(arg)</p>\n<p>Возвращает имя типа отношения, переданного через аргумент.</p>\n<h4>COALESCE</h4>\n<p>Синтаксис:</p>\n<p class="code">COALESCE( expr1 [, expr2, ...] )</p>\n<p>Возвращает первое не-null значение из перечисленных в аргументах.</p>\n<h4>STARTNODE</h4>\n<p>Синтаксис:</p>\n<p class="code">STARTNODE(arg)</p>\n<p>Возвращает узел, являющийся началом отношения arg.</p>\n<h4>ENDNODE</h4>\n<p>Синтаксис:</p>\n<p class="code">ENDNODE(arg)</p>\n<p>Возвращает узел, являющийся концом отношения arg.</p>\n<h4>TIMESTAMP</h4>\n<p>Синтаксис:</p>\n<p class="code">TIMESTAMP()</p>\n<p>Возвращает количество миллисекунд, прошедшее с 1 января 1970 года.</p>	10	2	f
23	2014-01-12 17:54:55.989708+04	23	ORDER BY	<p>Предложение ORDER BY применяется для сортировки результирующего набора.</p>\n<p>Синтаксис:</p>\n<p class="code">ORDER BY имя_сущности.имя_свойства [, имя_сущности.имя_свойства2 ...] [ DESC | DESCENDING ]</p>\n<p>Если в списке указать несколько свойств через запятую, то сортировка будет выполняться в порядке их записи, таким образом</p>\n<p class="code">MATCH (n { name: "Alex" })</p>\n<p class="code">RETURN n</p>\n<p class="code">ORDER BY n.name, n.age</p>\n<p>Результирующий набор узлов будет отсортирован сначала по свойству "name", потом по свойству "age"</p>\n<p>При сортировке по возрастанию набора, содержащего null значения, они будут помещены в конец результирующего набора узлов будет отсортирован сначала по свойству "name", потом по свойству "age"</p>	13	1	t
22	2014-01-12 17:54:36.603764+04	23	Оператор RETURN	<p>Оператор RETURN позволяет возвращать из запроса узлы, отношения, а также коллекции. Для этого их надо перечислить после ключевого слова RETURN.</p>\n<p>Синтаксис:</p>\n<p class="code">RETURN [DISTINCT] идентификатор_сущности_1 [AS name_1] | выражение [AS name_2] [, идентификатор_сущности_2, ...] | *;</p>\n<p class="code">MATCH (n { name: "Alex" })</p>\n<p class="code">RETURN n</p>\n<p>Результатом будет коллекция узлов</p>\n<p class="code">MATCH (n { name: "Alex" })-[r:KNOWS]-&gt;(m)</p>\n<p class="code">RETURN r, n, m</p>\n<p>Результат - коллекция отношений (r) и узлов(n,m).</p>\n<p class="code">MATCH (n { name: "Alex" })</p>\n<p class="code">RETURN n.age</p>\n<p>Возвращает значение свойства "age". Если у узла или отношения такое свойство отсутствует, будет возвращено null.</p>\n<p class="code">MATCH (n { name: "Alex" })-[r:KNOWS]-&gt;(m)</p>\n<p class="code">RETURN *</p>\n<p>Возвратит значения всех идентификаторов, примененных в запросе (аналог RETURN n,r,m)</p>\n<p>DISTINCT возвратит только уникальные значения и сущности:</p>\n<p class="code">MATCH (n { name: "A" })--&gt;(m)</p>\n<p class="code">RETURN DISTINCT m</p>	12	2	t
\.


--
-- Name: help_chapters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('help_chapters_id_seq', 52, true);


--
-- Data for Name: help_diffs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY help_diffs (id, branch, author, content) FROM stdin;
1	1	23	some content
\.


--
-- Name: help_diffs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('help_diffs_id_seq', 1, true);


--
-- Data for Name: help_razd; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY help_razd (pos, name, chapters) FROM stdin;
1	sdasd	[11,15,13,16]
2	asdadsa	[17,18,19]
\.


--
-- Name: help_razd_pos_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('help_razd_pos_seq', 1, false);


--
-- Data for Name: helps; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY helps (id, dtcreated, author, name, version, content) FROM stdin;
\.


--
-- Data for Name: helps_branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY helps_branches (id, name, head) FROM stdin;
1	root	\N
3	asc	\N
4	ssss	\N
5	sd	\N
6	sc	\N
7	sdc	\N
\.


--
-- Name: helps_branches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('helps_branches_id_seq', 7, true);


--
-- Data for Name: helps_hierarchy; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY helps_hierarchy (id, parent, branch) FROM stdin;
1	\N	1
3	1	3
4	1	4
5	1	5
6	1	6
7	91	7
\.


--
-- Name: helps_hierarchy_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('helps_hierarchy_id_seq', 7, true);


--
-- Name: helps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('helps_id_seq', 1, false);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY users (id, dt, email, pass, confirm, name, role) FROM stdin;
23	2014-01-09 18:24:01.51509+04	qqq@qqq.ru	qqq	\N	qqq	admin
26	2014-01-09 18:32:28.410038+04	mint.lemon.eucalyptus@gmail.com	qqq	\N	qqq	user
2	2014-01-12 22:05:12.921078+04	email@email.com		\N	гость	user
\.


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('users_id_seq', 26, true);


--
-- Name: help_chapters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY help_chapters
    ADD CONSTRAINT help_chapters_pkey PRIMARY KEY (id);


--
-- Name: help_diffs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY help_diffs
    ADD CONSTRAINT help_diffs_pkey PRIMARY KEY (id);


--
-- Name: help_razd_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY help_razd
    ADD CONSTRAINT help_razd_pkey PRIMARY KEY (pos);


--
-- Name: helps_branches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY helps_branches
    ADD CONSTRAINT helps_branches_pkey PRIMARY KEY (id);


--
-- Name: helps_hierarchy_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY helps_hierarchy
    ADD CONSTRAINT helps_hierarchy_pkey PRIMARY KEY (id);


--
-- Name: helps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY helps
    ADD CONSTRAINT helps_pkey PRIMARY KEY (id);


--
-- Name: users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users_email; Type: INDEX; Schema: public; Owner: postgres; Tablespace: 
--

CREATE UNIQUE INDEX users_email ON users USING btree (email);


--
-- Name: help_chapters_author_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY help_chapters
    ADD CONSTRAINT help_chapters_author_fkey FOREIGN KEY (author) REFERENCES users(id);


--
-- Name: help_diffs_author_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY help_diffs
    ADD CONSTRAINT help_diffs_author_fkey FOREIGN KEY (author) REFERENCES users(id);


--
-- Name: helps_author_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY helps
    ADD CONSTRAINT helps_author_fkey FOREIGN KEY (author) REFERENCES users(id);


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- Name: users; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE users FROM PUBLIC;
REVOKE ALL ON TABLE users FROM postgres;
GRANT ALL ON TABLE users TO postgres;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE users TO auth_user;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE users TO auth_client;


--
-- Name: help_chapters; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE help_chapters FROM PUBLIC;
REVOKE ALL ON TABLE help_chapters FROM postgres;
GRANT ALL ON TABLE help_chapters TO postgres;
GRANT ALL ON TABLE help_chapters TO auth_client;


--
-- Name: help_chapters_id_seq; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON SEQUENCE help_chapters_id_seq FROM PUBLIC;
REVOKE ALL ON SEQUENCE help_chapters_id_seq FROM postgres;
GRANT ALL ON SEQUENCE help_chapters_id_seq TO postgres;
GRANT USAGE ON SEQUENCE help_chapters_id_seq TO auth_client;


--
-- Name: help_diffs; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE help_diffs FROM PUBLIC;
REVOKE ALL ON TABLE help_diffs FROM postgres;
GRANT ALL ON TABLE help_diffs TO postgres;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE help_diffs TO auth_client;


--
-- Name: help_diffs_id_seq; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON SEQUENCE help_diffs_id_seq FROM PUBLIC;
REVOKE ALL ON SEQUENCE help_diffs_id_seq FROM postgres;
GRANT ALL ON SEQUENCE help_diffs_id_seq TO postgres;
GRANT USAGE ON SEQUENCE help_diffs_id_seq TO auth_client;


--
-- Name: help_razd; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE help_razd FROM PUBLIC;
REVOKE ALL ON TABLE help_razd FROM postgres;
GRANT ALL ON TABLE help_razd TO postgres;
GRANT ALL ON TABLE help_razd TO auth_client;


--
-- Name: help_razd_pos_seq; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON SEQUENCE help_razd_pos_seq FROM PUBLIC;
REVOKE ALL ON SEQUENCE help_razd_pos_seq FROM postgres;
GRANT ALL ON SEQUENCE help_razd_pos_seq TO postgres;
GRANT USAGE ON SEQUENCE help_razd_pos_seq TO auth_client;


--
-- Name: helps; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE helps FROM PUBLIC;
REVOKE ALL ON TABLE helps FROM postgres;
GRANT ALL ON TABLE helps TO postgres;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE helps TO auth_client;


--
-- Name: helps_branches; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE helps_branches FROM PUBLIC;
REVOKE ALL ON TABLE helps_branches FROM postgres;
GRANT ALL ON TABLE helps_branches TO postgres;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE helps_branches TO auth_client;


--
-- Name: helps_branches_id_seq; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON SEQUENCE helps_branches_id_seq FROM PUBLIC;
REVOKE ALL ON SEQUENCE helps_branches_id_seq FROM postgres;
GRANT ALL ON SEQUENCE helps_branches_id_seq TO postgres;
GRANT USAGE ON SEQUENCE helps_branches_id_seq TO auth_client;


--
-- Name: helps_hierarchy; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE helps_hierarchy FROM PUBLIC;
REVOKE ALL ON TABLE helps_hierarchy FROM postgres;
GRANT ALL ON TABLE helps_hierarchy TO postgres;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE helps_hierarchy TO auth_client;


--
-- Name: helps_hierarchy_id_seq; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON SEQUENCE helps_hierarchy_id_seq FROM PUBLIC;
REVOKE ALL ON SEQUENCE helps_hierarchy_id_seq FROM postgres;
GRANT ALL ON SEQUENCE helps_hierarchy_id_seq TO postgres;
GRANT USAGE ON SEQUENCE helps_hierarchy_id_seq TO auth_client;


--
-- Name: helps_id_seq; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON SEQUENCE helps_id_seq FROM PUBLIC;
REVOKE ALL ON SEQUENCE helps_id_seq FROM postgres;
GRANT ALL ON SEQUENCE helps_id_seq TO postgres;
GRANT USAGE ON SEQUENCE helps_id_seq TO auth_client;


--
-- Name: users_id_seq; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON SEQUENCE users_id_seq FROM PUBLIC;
REVOKE ALL ON SEQUENCE users_id_seq FROM postgres;
GRANT ALL ON SEQUENCE users_id_seq TO postgres;
GRANT USAGE ON SEQUENCE users_id_seq TO auth_client;


--
-- PostgreSQL database dump complete
--

