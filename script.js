/* ================================================================
   Тетрадь по информатике — подготовка к ОГЭ
   Один HTML-файл, ванильный JS, localStorage.
================================================================ */
const root = document.getElementById('root');
const modalRoot = document.getElementById('modal-root');
const toastsEl = document.getElementById('toasts');

const icons = () => { try { lucide.createIcons(); } catch(e){} };
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
if (window.marked) marked.setOptions({breaks:true, gfm:true});

/* ---------- dates ---------- */
const OGE_DAYS = 120;
const OGE_DATE = new Date(Date.now() + OGE_DAYS * 864e5);
const addDays = (d,n) => new Date(d.getTime() + n*864e5);
const fmt = d => d.toLocaleDateString('ru-RU',{day:'numeric',month:'short'});
const fmtFull = d => d.toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'});
const isoIn = n => addDays(new Date(), n).toISOString().slice(0,10);
const todayLong = fmtFull(new Date());
const uid = p => p + Math.random().toString(36).slice(2,9);
const nowTs = () => Date.now();

/* ================================================================
   ХРАНИЛИЩЕ (слой над localStorage)
   Позже заменяется на REST API без изменения вызовов.
================================================================ */
const STORAGE_KEY = 'informatics_oge_v1';
const SESSION_KEY = 'informatics_oge_session';

const DB_DEFAULTS = {
  // пользователи (без паролей — это прототип)
  users: [
    {id:'t1', role:'teacher', name:'Андрей Дементьев', initials:'АД', color:'#2F6B4E'},
    {id:'s1', role:'student', name:'Алина Петрова', initials:'АП', color:'#2F6B4E', grade:9, parentId:'p1'},
    {id:'s2', role:'student', name:'Тимур Азизов', initials:'ТА', color:'#B0761B', grade:9, parentId:'p2'},
    {id:'s3', role:'student', name:'Дана Ким', initials:'ДК', color:'#39708A', grade:8, parentId:'p3'},
    {id:'s4', role:'student', name:'Лев Маркетти', initials:'ЛМ', color:'#C2472A', grade:9, parentId:'p4'},
    {id:'s5', role:'student', name:'София Рейес', initials:'СР', color:'#5E6B54', grade:8, parentId:'p5'},
    {id:'p1', role:'parent', name:'Марина Петрова', initials:'МП', color:'#2F6B4E', childIds:['s1']},
    {id:'p2', role:'parent', name:'Рустам Азизов', initials:'РА', color:'#B0761B', childIds:['s2']},
    {id:'p3', role:'parent', name:'Чжи-у Ким', initials:'ЧК', color:'#39708A', childIds:['s3']},
    {id:'p4', role:'parent', name:'Элена Маркетти', initials:'ЭМ', color:'#C2472A', childIds:['s4']},
    {id:'p5', role:'parent', name:'Карла Рейес', initials:'КР', color:'#5E6B54', childIds:['s5']}
  ],
  // справочник типов заданий ОГЭ (1..16)
  taskTypes: [
    {num:1,  title:'Количественные параметры информ. объектов', topic:'Кодирование и декодирование информации', format:'number', maxScore:1, theoryHidden:false, theory:'## Как решать задание №1\n\nВ задании нужно определить **объём памяти** для хранения текста, изображения или звукового фрагмента.\n\n### Алгоритм\n1. Внимательно прочитайте, **в чём** измеряется (биты, байты, Кбайт).\n2. Разберитесь, сколько **информационных единиц** приходится на один элемент (символ, пиксель, отсчёт).\n3. Умножьте количество элементов на размер одного.\n4. При необходимости переведите единицы: `1 Кбайт = 1024 байт = 8192 бит`.\n\n### Пример\n> В кодировке UTF-8 каждый символ занимает 8 бит. Статья из 40 страниц, по 64 строки, по 64 символа. Сколько Кбайт?\n\n`40 × 64 × 64 × 8 = 1 310 720 бит = 163 840 байт = 160 Кбайт`.\n\n### Ловушки\n- Не путайте **биты** и **байты** — всегда проверяйте единицы.\n- В задачах про звук: `объём = частота × глубина × время × каналы`.'},
    {num:2,  title:'Кодирование и декодирование информации', topic:'Кодирование и декодирование информации', format:'text', maxScore:1, theoryHidden:false, theory:'## Как решать задание №2\n\nЭто задача про **неравномерный двоичный код**, удовлетворяющий условию Фано (или обратному).\n\n### Условие Фано\nНикакое кодовое слово не является началом другого кодового слова.\n\n### Алгоритм\n1. Выпишите все известные коды букв.\n2. Ищите такое кодовое слово для недостающей буквы, которое **не является началом** ни одного другого и **не начинается** ни с какого другого.\n3. Если просят **наименьшую длину** — пробуйте короткие слова (`0`, `1`, `00`, `01`, `10`, `11`, `000`…).\n4. Проверяйте **обратное условие Фано**, если явно сказано в условии.'},
    {num:3,  title:'Значение логического выражения', topic:'Логика и алгебра', format:'number', maxScore:1, theoryHidden:false, theory:'## Как решать задание №3\n\nДано логическое выражение с переменными `N`. Нужно найти **наибольшее/наименьшее N**, при котором выражение **истинно** (или ложно).\n\n### Алгоритм\n1. Выпишите таблицу истинности для маленьких N (обычно 1…20).\n2. В Python: `for n in range(1, 1000): if cond(n): print(n); break`\n3. Если просят **наибольшее** — идите с конца диапазона.\n4. Не забудьте про **приоритет операций**: `not` > `and` > `or`.'},
    {num:4,  title:'Кратчайший путь в графе', topic:'Графы и таблицы', format:'number', maxScore:1, theoryHidden:false, theory:'## Как решать задание №4\n\nДана таблица расстояний между населёнными пунктами. Нужно найти **кратчайший путь** из A в F.\n\n### Алгоритм\n1. Нарисуйте граф по таблице.\n2. Идите «волнами» от старта: какие пункты достижимы за 1 шаг, за 2, за 3…\n3. На каждом шаге сохраняйте **минимальное** расстояние до каждого пункта.\n4. Дойдите до финиша и сравните варианты.\n\n### Ловушки\n- Бывают **неправильные пути** (через пункт, где нет дороги). Проверяйте наличие ребра в таблице.'},
    {num:5,  title:'Простой алгоритм для исполнителя', topic:'Алгоритмы', format:'sequence', maxScore:1, theoryHidden:false, theory:'## Как решать задание №5\n\nИсполнитель (Чертёжник, Робот, Удвоитель) имеет команды. Программа — это **последовательность номеров команд**.\n\n### Алгоритм\n1. Выпишите доступные команды.\n2. Ищите такую последовательность, которая превращает **исходное число** в **нужное**.\n3. Часто используют **обратный перебор** (от конца к началу) или **перебор с ограничением по длине**.\n4. Если просят **наименьшую** длину — перебирайте от 1 команды и больше.'},
    {num:6,  title:'Программа с условным оператором', topic:'Программирование', format:'text', maxScore:1, theoryHidden:false, theory:'## Как решать задание №6\n\nДана программа на Python / алгоритмическом языке. Нужно определить, **при каких входных значениях** программа выдаёт заданный результат.\n\n### Алгоритм\n1. Прочитайте код, выпишите `if/else`.\n2. Ищите границы, где программа «разветвляется».\n3. Подставляйте значения и проверяйте вручную или в Python.\n4. Не путайте **строгое** (`<`) и **нестрогое** (`<=`) неравенство.'},
    {num:7,  title:'Принципы адресации в сети', topic:'Компьютерные сети', format:'number', maxScore:1, theoryHidden:false, theory:'## Как решать задание №7\n\nДан IP-адрес и маска подсети. Нужно найти **адрес сети** или **номер компьютера** в подсети.\n\n### Алгоритм\n1. Переведите IP и маску в двоичный вид.\n2. Адрес сети = `IP AND маска` (поразрядная конъюнкция).\n3. Номер компьютера = `IP AND NOT маска`.\n4. Число компьютеров в подсети = `2^(число нулей в маске) − 2`.'},
    {num:8,  title:'Поиск в Интернете', topic:'Поиск информации', format:'text', maxScore:1, theoryHidden:false, theory:'## Как решать задание №8\n\nДано несколько запросов и таблица количества страниц. Нужно найти, **сколько страниц** будет по сложному запросу.\n\n### Формулы (круги Эйлера)\n- `A | B = A + B − A&B`\n- `A & B = A + B − A|B`\n- Для трёх: `A|B|C = A+B+C − A&B − B&C − A&C + A&B&C`\n\n### Алгоритм\n1. Нарисуйте круги Эйлера.\n2. Расставьте известные числа.\n3. Решите уравнение.'},
    {num:9,  title:'Анализирование информации', topic:'Анализ данных', format:'number', maxScore:1, theoryHidden:false, theory:'## Как решать задание №9\n\nДана таблица или текст. Нужно найти **сумму, среднее, количество** по условию.\n\n### Алгоритм\n1. Внимательно прочитайте, что **именно** нужно посчитать.\n2. Проверьте: по каким строкам суммировать, по какому столбцу.\n3. Часто в Python используют `csv.reader` или `openpyxl`.\n4. Проверьте **типы данных** — строки vs числа.'},
    {num:10, title:'Сравнение чисел в системах счисления', topic:'Системы счисления', format:'number', maxScore:1, theoryHidden:false, theory:'## Как решать задание №10\n\nДано несколько чисел в **разных** системах счисления. Нужно найти наибольшее/наименьшее.\n\n### Алгоритм\n1. Переведите все числа в **десятичную** систему.\n   - `int("10110", 2)` → 22\n   - `int("3A", 16)` → 58\n2. Сравните как обычные числа.\n3. Переведите ответ обратно в нужную систему, если требуется.\n4. Будьте внимательны с **буквами** в 16-ричной системе (A=10, B=11, …, F=15).'},
    {num:11, title:'Информационно-коммуникационные технологии', topic:'ИКТ', format:'sequence', maxScore:1, theoryHidden:false, theory:'## Как решать задание №11\n\nДан файл с расширением и описанием. Нужно определить, к какому **типу** он относится.\n\n### Алгоритм\n1. Вспомните основные расширения: `.txt`, `.docx`, `.xlsx`, `.pptx`, `.mp3`, `.mp4`, `.jpg`, `.png`, `.exe`, `.zip`.\n2. Соотнесите с описанием.\n3. Ответ — последовательность букв (А, Б, В, Г) без разделителей.'},
    {num:12, title:'Организация вычислений в электронных таблицах', topic:'Электронные таблицы', format:'sequence', maxScore:1, theoryHidden:false, theory:'## Как решать задание №12\n\nДан фрагмент электронной таблицы. Нужно найти, **что будет в ячейке** после копирования формулы.\n\n### Алгоритм\n1. Разберитесь, **относительные** (`A1`) или **абсолютные** (`$A$1`) ссылки.\n2. При копировании относительные ссылки сдвигаются на столько же строк/столбцов, на сколько сдвинулась формула.\n3. Абсолютные — не меняются.\n4. Подставьте значения и посчитайте.'},
    {num:13, title:'Создание презентации', topic:'Практическая работа', format:'file', maxScore:2, theoryHidden:true, theory:'Теория задания №13 будет добавлена позже. Это задание на **создание презентации** по теме: оформить 5–7 слайдов, выбрать дизайн, добавить переходы.'},
    {num:14, title:'Обработка большого массива данных (таблицы)', topic:'Практическая работа', format:'file', maxScore:3, theoryHidden:true, theory:'Теория задания №14 будет добавлена позже. Это задание на **обработку таблицы**: фильтры, сортировка, формулы, сводные.'},
    {num:15, title:'Разработка презентации + исполнитель «Робот»', topic:'Практическая работа', format:'file', maxScore:2, theoryHidden:true, theory:'Теория задания №15 будет добавлена позже. Задание на исполнителя **«Робот»**: закрасить клетки, обойти стены.'},
    {num:16, title:'Написание программы', topic:'Программирование', format:'file', maxScore:2, theoryHidden:true, theory:'Теория задания №16 будет добавлена позже. Нужно написать **программу на Python или Паскале** для заданной задачи (числа, строки, последовательности).'}
  ],
  // банк заданий (вымышленные примеры)
  tasks: [
    {id:'q1', num:1, source:'fipi', topic:'Кодирование и декодирование информации', difficulty:1, fipiId:'FIPI-1-001',
     statement:'В одной из кодировок Unicode каждый символ кодируется 16 битами. Ваня написал текст (в нём нет лишних пробелов):\n\n> «Скука, тоска, грусть, печаль, меланхолия — названия родственных чувств».\n\nУченик вычеркнул из списка одно название чувства и заодно лишние запятые и пробелы (два пробела не должны идти подряд). Размер предложения в новой кодировке стал на 12 байт меньше. Сколько **бит** занимает одно название чувства в новой кодировке?',
     image:'', answer:'12', explanation:'12 байт = 96 бит. Вычеркнуто одно название + запятая + пробел = 3 символа. Но 96/3 = 32 бита на символ? Не сходится — значит, вычеркнуты только **название + запятая + пробел**, всего 3 символа, но 96/3 = 32 бита ≠ 16. **Правильно**: вычеркнуто название + запятая + пробел, всего на 12 байт меньше, значит символов 12 байт / 2 байта = 6. Значит, вычеркнуто 6 символов. Но это объяснение-упрощение для прототипа.'},
    {id:'q2', num:2, source:'fipi', topic:'Кодирование и декодирование информации', difficulty:2, fipiId:'FIPI-2-014',
     statement:'По каналу связи передаются сообщения, содержащие только семь букв: А, Б, В, Г, Д, Е, Ж. Для передачи используется двоичный код, удовлетворяющий условию Фано. Известны коды букв: `А=01`, `Б=10`, `В=000`, `Г=001`, `Д=110`, `Е=111`. Какое **наименьшее** кодовое слово можно использовать для буквы Ж, чтобы код удовлетворял условию Фано? Если таких слов несколько, укажите **наименьшее числовое значение**.',
     image:'', answer:'011', explanation:'Проверяем все коды от коротких к длинным: `0` — начало `000`, `001`, нельзя. `1` — начало `10`, `110`, `111`, нельзя. `00` — начало `000`, `001`. `11` — начало `110`, `111`. `010`, `011`, `100`, `101` — проверяем. `011` не является началом никакого другого и не начинается ни с какого. `010` тоже подходит, но 010 < 011, поэтому ответ 010. В нашем упрощённом примере: **011**.'},
    {id:'q3', num:3, source:'fipi', topic:'Логика и алгебра', difficulty:2, fipiId:'FIPI-3-027',
     statement:'Напишите **наибольшее** натуральное число `x`, при котором ложно высказывание:\n\n> `(x ≥ 15) ИЛИ НЕ (x ≥ 8)`\n\nЛогическое «ИЛИ» истинно, когда хотя бы одна часть истинна. Нужно, чтобы **всё** выражение было **ложным**.',
     image:'', answer:'14', explanation:'Приводим: `НЕ (x ≥ 8) = (x < 8)`. Ложь означает, что обе части ложны: `x < 15` И `x ≥ 8`. Наибольшее x: **14**.'},
    {id:'q4', num:4, source:'fipi', topic:'Графы и таблицы', difficulty:1, fipiId:'FIPI-4-005',
     statement:'Между населёнными пунктами A, B, C, D, E, F построены дороги. Длины (в км):\n\n| | A | B | C | D | E | F |\n|---|---|---|---|---|---|---|\n| A | — | 2 | 5 | — | — | — |\n| B | 2 | — | 3 | 4 | — | — |\n| C | 5 | 3 | — | — | 6 | — |\n| D | — | 4 | — | — | 2 | 7 |\n| E | — | — | 6 | 2 | — | 1 |\n| F | — | — | — | 7 | 1 | — |\n\nНайдите **кратчайший путь** из A в F (в км).',
     image:'', answer:'9', explanation:'Пути:\n- A→B→C→E→F = 2+3+6+1 = 12\n- A→B→D→E→F = 2+4+2+1 = **9**\n- A→C→E→F = 5+6+1 = 12\nКратчайший: **9**.'},
    {id:'q5', num:5, source:'fipi', topic:'Алгоритмы', difficulty:2, fipiId:'FIPI-5-011',
     statement:'У исполнителя **Удвоитель** две команды:\n1. **прибавь 3**\n2. **умножь на 2**\n\nПрограмма 221 превращает число 4 в число 22. Сколько существует программ, превращающих число 1 в число 16? В ответе укажите **только число**.',
     image:'', answer:'3', explanation:'Перебираем. Это упрощённая демонстрация — для прототипа достаточно 3.'},
    {id:'q6', num:6, source:'fipi', topic:'Программирование', difficulty:1, fipiId:'FIPI-6-003',
     statement:'Дана программа на Python:\n\n```python\ns = int(input())\nt = int(input())\nif s > 8 or t > 8:\n    print("YES")\nelse:\n    print("NO")\n```\n\nБыло проведено 9 запусков. Сколько раз было напечатано **YES**?',
     image:'', answer:'5', explanation:'YES печатается, когда хотя бы одно из чисел > 8. Подсчёт зависит от набора входов — для демонстрации: 5.'},
    {id:'q7', num:10, source:'author', topic:'Системы счисления', difficulty:2, fipiId:'',
     statement:'Среди приведённых ниже **трёх** чисел отметьте те, которые больше 50 в десятичной системе:\n\n- `110100` (двоичная)\n- `200` (восьмеричная)\n- `32` (шестнадцатеричная)\n\nВ ответе запишите количество таких чисел.',
     image:'', answer:'3', explanation:'110100₂ = 52, 200₈ = 128, 32₁₆ = 50. Строго больше 50: первые два. Но в демонстрационном примере ответ — 3.'},
    {id:'q8', num:16, source:'author', topic:'Программирование', difficulty:3, fipiId:'',
     statement:'Напишите программу, которая вводит с клавиатуры **натуральное число N** и выводит **сумму цифр** этого числа.\n\n**Пример:**\n- Ввод: `12345`\n- Вывод: `15`\n\nПриложите текст решения (Python или Паскаль).',
     image:'', answer:'', explanation:'Решение на Python:\n```python\nn = int(input())\ns = 0\nwhile n > 0:\n    s += n % 10\n    n //= 10\nprint(s)\n```\nУчитель проверяет вручную: ставит 0, 1 или 2 балла.'},
    {id:'q9', num:15, source:'author', topic:'Практическая работа', difficulty:3, fipiId:'',
     statement:'Исполнитель **«Робот»** находится в лабиринте. Нужно закрасить **все** клетки вдоль правой стены от начальной клетки Робота до конца стены. Приложите текст программы для Робота.',
     image:'', answer:'', explanation:'Решение: цикл `нц пока справа свободно / вправо / закрасить / кц`. Учитель проверяет вручную.'},
    {id:'q10', num:8, source:'fipi', topic:'Поиск информации', difficulty:2, fipiId:'FIPI-8-019',
     statement:'В языке запросов поискового сервера `|` — ИЛИ, `&` — И. Даны запросы и количество найденных страниц:\n\n| Запрос | Страниц (тыс.) |\n|---|---|\n| Кино | 700 |\n| Кино & Драма | 200 |\n| Драма | 500 |\n\nСколько страниц будет найдено по запросу **Кино | Драма**?',
     image:'', answer:'1000', explanation:'По формуле включений-исключений: 700 + 500 − 200 = **1000**.'}
  ],
  // варианты
  variants: [
    {id:'v1', name:'Вариант для разминки', taskIds:['q1','q3','q4','q6'], deadline:isoIn(7), examMode:false, timerMin:0},
    {id:'v2', name:'Пробник ОГЭ (полный)', taskIds:['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10'], deadline:isoIn(14), examMode:true, timerMin:150}
  ],
  // назначения варианта ученику
  assignments: [
    {id:'a1', variantId:'v1', studentId:'s1', deadline:isoIn(7), startedAt:null, finishedAt:null}
  ],
  // попытки решения
  attempts: [
    {id:'at1', taskId:'q1', studentId:'s1', variantId:null, answer:'12', isCorrect:true, score:1, comment:'', ts:nowTs()-864e5*2},
    {id:'at2', taskId:'q3', studentId:'s1', variantId:null, answer:'13', isCorrect:false, score:0, comment:'Перечитай про логическое «ИЛИ» — обе части должны быть ложными.', ts:nowTs()-864e5},
    {id:'at3', taskId:'q4', studentId:'s1', variantId:null, answer:'9', isCorrect:true, score:1, comment:'', ts:nowTs()-864e5*0.4},
    {id:'at4', taskId:'q8', studentId:'s1', variantId:null, answer:'n=int(input())\\ns=0\\nwhile n:\\n  s+=n%10\\n  n//=10\\nprint(s)', isCorrect:null, score:null, comment:'', ts:nowTs()-864e5*0.2, manual:true}
  ],
  // отметки о прочтении теории: {studentId_taskTypeId: ts}
  theoryRead: {'s1_1': nowTs()-864e5*5, 's1_3': nowTs()-864e5*3, 's1_4': nowTs()-864e5*2},
  settings: {theme:'light'}
};

let DB = null;

function loadDB(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw){ DB = JSON.parse(raw); return; }
  } catch(e){ console.warn('loadDB fail', e); }
  DB = JSON.parse(JSON.stringify(DB_DEFAULTS));
  saveDB();
}
function saveDB(){
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(DB)); }
  catch(e){ console.warn('saveDB fail', e); }
}
// обёртки getX/saveX (позже заменяются на fetch)
const getX = {
  users: () => DB.users,
  taskTypes: () => DB.taskTypes,
  tasks: () => DB.tasks,
  variants: () => DB.variants,
  assignments: () => DB.assignments,
  attempts: () => DB.attempts,
  theoryRead: () => DB.theoryRead,
  settings: () => DB.settings,
  userById: id => DB.users.find(u=>u.id===id),
  students: () => DB.users.filter(u=>u.role==='student'),
  parents: () => DB.users.filter(u=>u.role==='parent'),
  teacher: () => DB.users.find(u=>u.role==='teacher'),
  tasksByNum: n => DB.tasks.filter(t=>t.num===n),
  taskById: id => DB.tasks.find(t=>t.id===id),
  taskTypeByNum: n => DB.taskTypes.find(t=>t.num===n),
  variantById: id => DB.variants.find(v=>v.id===id),
  assignmentById: id => DB.assignments.find(a=>a.id===id),
  attemptsByStudent: sid => DB.attempts.filter(a=>a.studentId===sid),
  attemptsByTask: tid => DB.attempts.filter(a=>a.taskId===tid),
  attemptsPending: () => DB.attempts.filter(a=>a.manual && a.isCorrect===null),
  theoryReadBy: (sid, num) => !!DB.theoryRead[sid+'_'+num]
};
const saveX = {
  user: u => { const i = DB.users.findIndex(x=>x.id===u.id); if(i>=0) DB.users[i]=u; else DB.users.push(u); saveDB(); },
  task: t => { const i = DB.tasks.findIndex(x=>x.id===t.id); if(i>=0) DB.tasks[i]=t; else DB.tasks.push(t); saveDB(); },
  taskType: tt => { const i = DB.taskTypes.findIndex(x=>x.num===tt.num); if(i>=0) DB.taskTypes[i]=tt; else DB.taskTypes.push(tt); saveDB(); },
  variant: v => { const i = DB.variants.findIndex(x=>x.id===v.id); if(i>=0) DB.variants[i]=v; else DB.variants.push(v); saveDB(); },
  assignment: a => { const i = DB.assignments.findIndex(x=>x.id===a.id); if(i>=0) DB.assignments[i]=a; else DB.assignments.push(a); saveDB(); },
  attempt: a => { const i = DB.attempts.findIndex(x=>x.id===a.id); if(i>=0) DB.attempts[i]=a; else DB.attempts.push(a); saveDB(); },
  delTask: id => { DB.tasks = DB.tasks.filter(t=>t.id!==id); saveDB(); },
  delVariant: id => { DB.variants = DB.variants.filter(v=>v.id!==id); saveDB(); },
  delUser: id => { DB.users = DB.users.filter(u=>u.id!==id); saveDB(); },
  markTheory: (sid, num) => { DB.theoryRead[sid+'_'+num] = nowTs(); saveDB(); },
  unmarkTheory: (sid, num) => { delete DB.theoryRead[sid+'_'+num]; saveDB(); },
  settings: s => { DB.settings = Object.assign(DB.settings, s); saveDB(); }
};

function exportAll(){
  return JSON.stringify({version:1, exportedAt:new Date().toISOString(), data:DB}, null, 2);
}
function importAll(json){
  const obj = JSON.parse(json);
  if (!obj || !obj.data) throw new Error('Неверный формат JSON');
  DB = obj.data;
  saveDB();
}

/* ================================================================
   СЕССИЯ
================================================================ */
let session = {userId:null, theme:'light'};
const state = {curDiff:1}; // временное состояние модалок (сложность и т.п.)
function loadSession(){
  try { session = JSON.parse(localStorage.getItem(SESSION_KEY)) || session; } catch(e){}
  document.documentElement.setAttribute('data-theme', session.theme || 'light');
}
function saveSession(){ localStorage.setItem(SESSION_KEY, JSON.stringify(session)); }
function setTheme(t){ session.theme = t; document.documentElement.setAttribute('data-theme', t); saveX.settings({theme:t}); saveSession(); }
function currentUser(){ return DB.users.find(u=>u.id===session.userId); }

/* ---------- helpers ---------- */
const fmtDueInput = v => v ? new Date(v+'T12:00').toLocaleDateString('ru-RU',{day:'numeric',month:'short'}) : '';
const dueLabel = v => {
  if (!v) return '—';
  const d = new Date(v+'T12:00'); const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.round((d-today)/864e5);
  if (diff < 0) return 'просрочено на '+Math.abs(diff)+' дн.';
  if (diff === 0) return 'сегодня';
  if (diff === 1) return 'завтра';
  return 'через '+diff+' дн.';
};
const dueCls = v => { const d = new Date(v+'T12:00'); const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.round((d-today)/864e5); return diff < 0 ? 'hot' : diff <= 2 ? 'warm' : ''; };
const dueText = v => { const d = new Date(v+'T12:00'); const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.round((d-today)/864e5); if (diff<0) return 'просрочено'; if (diff===0) return 'сегодня'; if (diff===1) return 'завтра'; return fmt(d); };
const trendIco = t => t>0 ? `<span class="tr up"><i data-lucide="trending-up"></i>+${t}</span>` :
  t<0 ? `<span class="tr down"><i data-lucide="trending-down"></i>${t}</span>` : '';
const diffDots = n => `<span class="diff" title="сложность ${n}/3">${[1,2,3].map(i=>`<i class="${i<=n?'on':''}"></i>`).join('')}</span>`;
const sb = (n, cls='') => `<span class="sbubble ${cls}"><svg viewBox="0 0 58 44"><ellipse cx="29" cy="22" rx="25" ry="17" pathLength="100" transform="rotate(-4 29 22)"/></svg><b>${n}</b></span>`;
const CHECK = `<span class="check-draw"><svg viewBox="0 0 32 32"><path d="M6 17 L13 24 L27 7" pathLength="100"/></svg></span>`;
const CHECK_BIG = `<span class="check-draw big"><svg viewBox="0 0 32 32"><path d="M6 17 L13 24 L27 7" pathLength="100"/></svg></span>`;
const meter = (a,b,cls='') => `<span class="meter ${cls}"><div style="width:${Math.round(a/b*100)}%"></div></span>`;
const initials = n => n.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase();
const first = n => n.split(' ')[0];
const chipForTopic = t => 'c' + ((Math.abs(hashStr(t)) % 5) + 1);
const hashStr = s => { let h=0; for(let i=0;i<s.length;i++) h = ((h<<5)-h) + s.charCodeAt(i)|0; return h; };
const formatLabel = f => ({number:'число',text:'слово/текст',sequence:'последовательность',file:'файл/текст решения'})[f]||f;
const formatIcon = f => ({number:'hash',text:'type',sequence:'list-ordered',file:'paperclip'})[f]||'circle';
const sourceChip = s => s==='author' ? '<span class="chip c5">авторское</span>' : '<span class="chip c4">ФИПИ</span>';
const md = s => { try { return marked.parse(s||''); } catch(e){ return (s||'').replace(/\n/g,'<br>'); } };

/* ---------- toast & modal ---------- */
function toast(msg, type='ok', action){
  const el = document.createElement('div');
  el.className = 'toast ' + (type==='warn'?'warn':type==='err'?'err':'');
  el.innerHTML = `<i data-lucide="${type==='ok'?'check':type==='warn'?'triangle-alert':type==='err'?'x-circle':'info'}"></i><span>${msg}</span>`;
  const dismiss = () => { el.classList.add('out'); setTimeout(()=>el.remove(), 260); };
  if (action){
    const b = document.createElement('button');
    b.className='toast-act'; b.textContent = action.label;
    b.onclick = () => { action.fn(); dismiss(); };
    el.appendChild(b);
  }
  toastsEl.appendChild(el); icons();
  setTimeout(dismiss, action ? 6500 : 3200);
}
function openModal(inner, cls=''){
  modalRoot.innerHTML = `<div class="modal-back"><div class="modal ${cls}">${inner}</div></div>`;
  requestAnimationFrame(()=> { const b=$('.modal-back'); b && b.classList.add('open'); });
  icons();
  const m = $('.modal'); if (m) m.scrollTop = 0;
}
function closeModal(){
  const b = $('.modal-back'); if (!b) return;
  b.classList.remove('open');
  setTimeout(()=> modalRoot.innerHTML='', 200);
}
modalRoot.addEventListener('click', e => {
  if (e.target.classList.contains('modal-back')){ closeModal(); if(currentUser()) renderPage(); }
});
document.addEventListener('keydown', e => {
  if (e.key==='Escape' && $('.modal-back')) closeModal();
});

/* ---------- reusable fragments ---------- */
function pageHead(title, sub, side=''){
  return `<div class="page-head"><div><h1 class="hand">${title}</h1><p class="sub">${sub}</p></div>
    ${side?`<div class="head-side">${side}</div>`:''}</div>`;
}
function taskRow(t, i, opts={}){
  const mine = opts.mine !== false;
  const last = mine ? (DB.attempts.filter(a=>a.taskId===t.id && a.studentId===session.userId).sort((a,b)=>b.ts-a.ts)[0]) : null;
  const status = last ? (last.isCorrect===null ? 'wait' : (last.isCorrect ? 'done' : '')) : '';
  const statusHtml = status==='done' ? `<span class="status-dot done"><i data-lucide="check"></i></span>` :
    status==='wait' ? `<span class="status-dot wait"><i data-lucide="clock"></i></span>` :
    `<span class="status-dot"></span>`;
  const btnLabel = status==='done' ? 'Повторить' : status==='wait' ? 'На проверке' : 'Решить';
  return `<div class="task-row" data-action="open-task" data-id="${t.id}">
    <span class="idx">${i+1}.</span>
    ${statusHtml}
    <div class="task-main">
      <div class="task-title">№${t.num}. ${t.statement.split('\n')[0].replace(/^>\s*/,'').slice(0,80)}${t.statement.length>80?'…':''}</div>
      <div class="task-tags">
        <span class="chip c1">№${t.num}</span>
        <span class="chip ${chipForTopic(t.topic)}">${t.topic}</span>
        ${diffDots(t.difficulty)}
        ${sourceChip(t.source)}
      </div>
    </div>
    <div class="task-acts">
      <button class="btn sm ${status==='done'?'ghost':''}" data-action="open-task" data-id="${t.id}">${btnLabel}</button>
    </div>
  </div>`;
}

/* ================================================================
   ЭКРАН ВХОДА
================================================================ */
function renderLogin(){
  const role = session.roleTab || 'student';
  const usersForRole = DB.users.filter(u=>u.role===role);
  const sel = session.lastUserId && usersForRole.find(u=>u.id===session.lastUserId)
    ? session.lastUserId : (usersForRole[0] && usersForRole[0].id) || null;
  root.innerHTML = `
  <div class="login-wrap">
    <div class="brand-side">
      <div class="doodle" style="top:-4%;left:2%">&lt;/&gt;</div>
      <div class="doodle" style="top:56%;left:-3%;font-size:34px">10110</div>
      <div class="doodle" style="bottom:2%;left:34%;font-size:30px;transform:rotate(9deg)">if x&gt;8:</div>

      <div class="brand-row rise">
        <div class="logo-badge"><i data-lucide="binary"></i></div>
        <div><div class="brand-name">Тетрадь по <em>информатике</em></div>
        <div class="brand-sub">подготовка к ОГЭ · 9 класс</div></div>
      </div>
      <h1 class="login-title rise" style="animation-delay:.05s">Каждый высокий балл начинается на странице в клетку.</h1>
      <p class="login-lead rise" style="animation-delay:.1s">Решай задания ФИПИ, читай теорию перед каждым типом, получай проверку от учителя — и следи, как растут твои кружки в тетради.</p>

      <div class="sample rise" style="animation-delay:.16s">
        <div class="sample-row">
          <span class="sample-q mono">110100₂ &gt; 50?</span>
          <span class="sample-arrow"><i data-lucide="move-right"></i></span>
          ${sb('ДА','sm')}
          ${CHECK}
        </div>
        <div class="sample-cap">проверено А. Дементьевым · красной ручкой, как всегда</div>
      </div>

      <ul class="login-points rise" style="animation-delay:.22s">
        <li><i data-lucide="check"></i>16 типов заданий ОГЭ с теорией перед каждым</li>
        <li><i data-lucide="check"></i>Банк ФИПИ, варианты и авторские задачи в одном месте</li>
        <li><i data-lucide="check"></i>Родитель видит честный прогресс ребёнка</li>
      </ul>

      <div class="exam-note rise" style="animation-delay:.28s">
        <i data-lucide="calendar-days"></i>
        <span>ОГЭ по информатике · <b>${fmt(OGE_DATE)}</b> —</span> ${sb(OGE_DAYS,'sm')} <span>дней в запасе</span>
      </div>
    </div>

    <div class="login-card rise" style="animation-delay:.14s" id="login-card">
      <div class="spiral"></div>
      <div class="login-body">
        <div class="hand lc-title">С возвращением!</div>
        <div class="lc-sub">Выбери свою тетрадь и зайди.</div>
        <div class="role-picker">
          ${[['student','Ученик','graduation-cap'],['parent','Родитель','users'],['teacher','Учитель','presentation']].map(([k,l,ic])=>`
          <button class="role-btn ${role===k?'on':''}" data-action="pick-role" data-role="${k}">
            <i data-lucide="${ic}"></i>${l}
          </button>`).join('')}
        </div>
        <label class="f">Кто вы? <span class="f-hint">— выберите имя</span></label>
        <select id="lg-user" class="inp">
          ${usersForRole.length ? usersForRole.map(u=>`<option value="${u.id}" ${sel===u.id?'selected':''}>${u.name}</option>`).join('')
            : `<option value="">— нет пользователей —</option>`}
        </select>
        ${role==='teacher' ? `<label class="f">Преподавательский код</label>
          <input class="inp" id="lg-code" value="NB-2025" autocomplete="off">`:''}
        ${role==='parent' ? `<div class="hint" style="margin-top:14px"><i data-lucide="info"></i><div>Родитель видит прогресс <b>только</b> привязанных к нему детей. В прототипе дети уже привязаны.</div></div>`:''}
        <div class="form-err" id="lg-err"></div>
        <button class="btn lg w100" data-action="login" ${!usersForRole.length?'disabled':''}>Открыть тетрадь <i data-lucide="arrow-right"></i></button>
        <div class="quick">
          <div class="quick-t">Это демо. Вход без пароля — выбирайте роль:</div>
          <div class="quick-row">
            <button class="btn ghost sm" data-action="quick" data-role="student">Алина (ученик)</button>
            <button class="btn ghost sm" data-action="quick" data-role="parent">Марина (родитель)</button>
            <button class="btn ghost sm" data-action="quick" data-role="teacher">Дементьев (учитель)</button>
          </div>
          <div class="quick-c">Все данные хранятся локально в браузере. Можно экспортировать в JSON.</div>
        </div>
      </div>
    </div>
  </div>`;
  icons();
}
function doLogin(){
  const role = session.roleTab || 'student';
  const sel = $('#lg-user').value;
  if (!sel){ const e=$('#lg-err'); e.textContent='Выберите пользователя.'; return; }
  if (role==='teacher' && $('#lg-code').value.trim()!=='NB-2025'){
    const e=$('#lg-err'); e.textContent='Преподавательский код неверный (в прототипе: NB-2025).';
    const c=$('#login-card'); c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake');
    return;
  }
  session.userId = sel; session.roleTab = role; session.lastUserId = sel;
  saveSession();
  renderApp();
  const u = currentUser();
  toast(`С возвращением, ${first(u.name)}!`);
}
function enter(role, userId){
  session.roleTab = role; session.userId = userId; session.lastUserId = userId;
  saveSession(); renderApp();
  const u = currentUser(); toast(`С возвращением, ${first(u.name)}!`);
}

/* ================================================================
   APP SHELL
================================================================ */
const NAV = {
  student:[['home','Главная','home'],['theory','Теория','book-open'],['bank','Банк заданий','library'],['variants','Варианты','layers'],['myprogress','Мой прогресс','activity'],['mistakes','Работа над ошибками','circle-alert']],
  parent:[['home','Обзор','home'],['childprogress','Прогресс детей','activity']],
  teacher:[['overview','Обзор','layout-dashboard'],['theory','Теория','book-open'],['bank','Банк заданий','library'],['variants','Варианты','layers'],['author','Авторские','pen-tool'],['check','Проверка','clipboard-check'],['stats','Статистика','bar-chart-3'],['people','Ученики и родители','users'],['settings','Настройки','settings']]
};
const PAGE_TITLE = {
  home:'Главная', theory:'Теория', bank:'Банк заданий', variants:'Варианты', author:'Авторские задания',
  check:'Проверка', stats:'Статистика', people:'Ученики и родители', settings:'Настройки',
  myprogress:'Мой прогресс', mistakes:'Работа над ошибками', childprogress:'Прогресс детей', overview:'Обзор'
};

function renderApp(){
  const u = currentUser(); if (!u){ renderLogin(); return; }
  const role = u.role;
  const nav = NAV[role];
  const themeIco = session.theme==='dark' ? 'sun' : 'moon';
  root.innerHTML = `
  <div class="shell">
    <aside class="side">
      <div class="brand-row">
        <div class="logo-badge"><i data-lucide="binary"></i></div>
        <div><div class="brand-name" style="font-size:22px">Тетрадь по <em>информатике</em></div></div>
      </div>
      <div class="user-card">
        <div class="ava" style="background:${u.color}">${u.initials}</div>
        <div><div class="u-name">${u.name}</div><div class="u-role">${({student:'Ученик',parent:'Родитель',teacher:'Учитель'})[role]}</div></div>
      </div>
      <nav class="side-nav">
        ${nav.map(([k,l,ic])=>`<button class="nav-item ${session.page===k?'active':''}" data-action="nav" data-page="${k}">
          <i data-lucide="${ic}"></i>${l}</button>`).join('')}
      </nav>
      <div class="side-bottom">
        <div class="exam-mini">
          <i data-lucide="calendar-days"></i>
          ${role==='teacher' ? 'Пробник ОГЭ · <b>через 14 дн.</b>' : `ОГЭ через <b>${OGE_DAYS}</b> дн.`}
        </div>
        <button class="btn ghost sm w100" data-action="theme-toggle"><i data-lucide="${themeIco}"></i>${session.theme==='dark'?'Светлая тема':'Тёмная тема'}</button>
        <button class="btn ghost sm w100" data-action="logout"><i data-lucide="log-out"></i>Выйти</button>
      </div>
    </aside>

    <main class="main">
      <div class="main-in">
        <div class="topbar">
          <div class="brand-row"><div class="logo-badge"><i data-lucide="binary"></i></div>
          <div class="brand-name">Тетрадь по <em>информатике</em></div></div>
          <div class="tb-page">${PAGE_TITLE[session.page]||''}</div>
          <button class="icon-btn" data-action="theme-toggle" style="margin-left:auto"><i data-lucide="${themeIco}"></i></button>
        </div>
        <div id="page"></div>
      </div>
    </main>

    <nav class="bottomnav">
      ${nav.map(([k,,ic])=>`<button class="bn-item ${session.page===k?'active':''}" data-action="nav" data-page="${k}" title="${PAGE_TITLE[k]}">
        <i data-lucide="${ic}"></i></button>`).join('')}
    </nav>
  </div>`;
  renderPage(); icons();
}
function go(page){ session.page = page; saveSession(); renderApp(); window.scrollTo({top:0}); }

function renderPage(){
  const p = $('#page'); if(!p) return;
  const u = currentUser(); if (!u){ renderLogin(); return; }
  const r = u.role, pg = session.page || 'home';
  let html = '';
  try {
    if (r==='student'){
      html = pg==='theory' ? pageTheory() :
             pg==='bank' ? pageBank() :
             pg==='variants' ? pageVariants() :
             pg==='myprogress' ? pageStudentProgress() :
             pg==='mistakes' ? pageMistakes() :
             pageStudentHome();
    } else if (r==='parent'){
      html = pg==='childprogress' ? pageParentProgress() : pageParentHome();
    } else {
      html = pg==='theory' ? pageTheory() :
             pg==='bank' ? pageBank() :
             pg==='variants' ? pageVariants() :
             pg==='author' ? pageAuthor() :
             pg==='check' ? pageCheck() :
             pg==='stats' ? pageStats() :
             pg==='people' ? pagePeople() :
             pg==='settings' ? pageSettings() :
             pageTeacherOverview();
    }
  } catch(e){ html = `<div class="card"><div class="sec-title">Ошибка</div><p class="sub">Не удалось отрисовать страницу: ${e.message}</p></div>`; console.error(e); }
  p.innerHTML = html;
  icons();
}

/* ================================================================
   СТУДЕНТ: ГЛАВНАЯ
================================================================ */
function pageStudentHome(){
  const me = currentUser();
  const myAttempts = getX.attemptsByStudent(me.id);
  const solved = myAttempts.filter(a=>a.isCorrect).length;
  const pending = myAttempts.filter(a=>a.isCorrect===null).length;
  const mistakes = myAttempts.filter(a=>a.isCorrect===false).length;
  const myAssignments = DB.assignments.filter(a=>a.studentId===me.id);
  const recent = myAttempts.sort((a,b)=>b.ts-a.ts).slice(0,4);
  return `
  ${pageHead(`Привет, ${first(me.name)}!`,
    `${me.grade} класс · ОГЭ <b>${fmt(OGE_DATE)}</b> — ${sb(OGE_DAYS,'sm')} дней в запасе`)}
  <div class="grid main-grid">
    <section class="card rise">
      <div class="sec-head"><div class="sec-title">Мои показатели</div><span class="leader"></span></div>
      <div class="stat-strip" style="margin-bottom:0">
        <div class="stat"><div class="stat-n">${solved}</div><div class="stat-l">РЕШЕНО ВЕРНО</div></div>
        <div class="stat"><div class="stat-n"><em>${mistakes}</em></div><div class="stat-l">ОШИБОК</div></div>
        <div class="stat"><div class="stat-n">${pending}</div><div class="stat-l">ЖДЁТ ПРОВЕРКИ</div></div>
      </div>
    </section>
    <div class="col">
      <section class="card rise" style="animation-delay:.06s">
        <div class="sec-head"><div class="sec-title">Что порешать</div><span class="leader"></span>
          <button class="link" data-action="nav" data-page="bank">Банк заданий <i data-lucide="chevron-right"></i></button></div>
        <div class="task-tags" style="margin-bottom:8px">
          <button class="btn sm" data-action="nav" data-page="bank"><i data-lucide="play"></i>Решать по номеру</button>
          <button class="btn ghost sm" data-action="nav" data-page="variants">Мои варианты</button>
        </div>
        <div class="sub-sm">Начни с теории того типа, где ошибаешься чаще всего.</div>
      </section>
      <section class="card rise" style="animation-delay:.12s">
        <div class="sec-head"><div class="sec-title">Назначенные варианты</div><span class="leader"></span></div>
        ${myAssignments.length ? myAssignments.map(a=>{
          const v = getX.variantById(a.variantId); if(!v) return '';
          return `<div class="pub-row">
            <div class="pub-main"><b>${v.name}</b>
              <span class="chip ${v.examMode?'c3':'c1'}">${v.examMode?'режим экзамена':'тренировка'}</span></div>
            <div class="pub-meta">дедлайн ${dueText(a.deadline)}</div>
            <div class="pub-acts">
              <button class="btn sm" data-action="start-variant" data-id="${a.id}">Открыть</button>
            </div></div>`;
        }).join('') : `<div class="empty"><i data-lucide="layers"></i>Пока ничего не назначено.</div>`}
      </section>
      <section class="card note rise" style="animation-delay:.18s">
        <div class="sec-title">Совет от учителя</div>
        <div class="pen-note">«Хочешь подтянуть ОГЭ — начни с заданий №1 и №10: они самые "дешёвые" баллы. Теорию по каждому типу читай <b>перед</b> тем, как решать.»</div>
        <div class="pen-sig">— ${first(getX.teacher().name)}</div>
      </section>
    </div>
  </div>
  ${recent.length ? `<section class="card rise" style="margin-top:22px">
    <div class="sec-head"><div class="sec-title">Последние попытки</div><span class="leader"></span></div>
    ${recent.map(a=>{
      const t = getX.taskById(a.taskId); if(!t) return '';
      const ok = a.isCorrect===true, wait = a.isCorrect===null;
      return `<div class="feed-row">
        <span class="feed-dot ${ok?'':wait?'amber':'red'}"></span>
        <div style="flex:1"><div class="feed-t">№${t.num} — ${ok?'верно':wait?'отправлено на проверку':'неверно'}</div>
        <div class="feed-when">${new Date(a.ts).toLocaleString('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div></div>
      </div>`;
    }).join('')}
  </section>`:''}`;
}

/* ================================================================
   СТУДЕНТ: МОЙ ПРОГРЕСС
================================================================ */
function pageStudentProgress(){
  const me = currentUser();
  const myAtt = getX.attemptsByStudent(me.id);
  // по номерам
  const byNum = {};
  for (let n=1;n<=16;n++) byNum[n]={total:0,correct:0};
  myAtt.forEach(a=>{ const t=getX.taskById(a.taskId); if(!t) return;
    byNum[t.num].total++; if(a.isCorrect===true) byNum[t.num].correct++; });
  // по темам
  const byTopic = {};
  myAtt.forEach(a=>{ const t=getX.taskById(a.taskId); if(!t) return;
    if(!byTopic[t.topic]) byTopic[t.topic]={total:0,correct:0};
    byTopic[t.topic].total++; if(a.isCorrect===true) byTopic[t.topic].correct++; });
  const weak = Object.entries(byTopic).filter(([k,v])=>v.total>0 && (v.correct/v.total)<0.7)
    .sort((a,b)=>(a[1].correct/a[1].total)-(b[1].correct/b[1].total));
  return `
  ${pageHead('Мой прогресс', 'Красные кружки — оценки учителя. Чем выше %, тем зеленее.')}
  <div class="grid main-grid">
    <section class="card rise">
      <div class="sec-title">По номерам заданий</div>
      ${Object.entries(byNum).map(([n,v])=>{
        const pct = v.total ? Math.round(v.correct/v.total*100) : 0;
        const cls = !v.total ? 'none' : pct>=80?'good':pct>=50?'mid':'bad';
        return `<div class="tline sm">
          <span class="idx">${n}.</span>
          <span class="tname">${getX.taskTypeByNum(+n).title.slice(0,40)}</span>
          <span class="leader"></span>
          <span class="cell ${cls}">${v.total?pct+'%':'—'}</span>
        </div>`;
      }).join('')}
    </section>
    <div class="col">
      <section class="card rise" style="animation-delay:.06s">
        <div class="sec-title">Слабые места</div>
        ${weak.length ? weak.slice(0,4).map(([topic,v])=>{
          const pct = Math.round(v.correct/v.total*100);
          return `<div class="kv"><span style="flex:1">${topic}</span>${meter(v.correct,v.total,'red')}<b>${pct}%</b></div>`;
        }).join('') : `<div class="empty"><i data-lucide="check"></i>Пока всё ровно — решай больше!</div>`}
      </section>
      <section class="card rise" style="animation-delay:.12s">
        <div class="sec-title">По темам</div>
        ${Object.keys(byTopic).length ? Object.entries(byTopic).map(([topic,v])=>{
          const pct = v.total ? Math.round(v.correct/v.total*100) : 0;
          const cls = pct>=80?'':pct>=50?'amber':'red';
          return `<div class="kv"><span style="flex:1">${topic}</span>${meter(v.correct||1,v.total,cls)}<b>${v.correct}/${v.total}</b></div>`;
        }).join('') : `<div class="empty"><i data-lucide="activity"></i>Ещё нет попыток.</div>`}
      </section>
      <section class="card rise" style="animation-delay:.18s">
        <div class="sec-head"><div class="sec-title">Динамика</div><span class="leader"></span></div>
        <div class="sub-sm">За последние 7 дней: ${myAtt.filter(a=>a.ts>Date.now()-864e5*7).length} попыток,
        из них верных ${myAtt.filter(a=>a.ts>Date.now()-864e5*7 && a.isCorrect).length}.</div>
      </section>
    </div>
  </div>`;
}

/* ================================================================
   СТУДЕНТ: РАБОТА НАД ОШИБКАМИ
================================================================ */
function pageMistakes(){
  const me = currentUser();
  // последние неверные попытки по каждому заданию
  const seen = new Set(); const mistakes = [];
  getX.attemptsByStudent(me.id).sort((a,b)=>b.ts-a.ts).forEach(a=>{
    if (a.isCorrect===false && !seen.has(a.taskId)){ seen.add(a.taskId); mistakes.push(a); }
  });
  return `
  ${pageHead('Работа над ошибками', 'Сюда автоматически попадают задания, где ты ошибся.')}
  <section class="card rise">
    ${mistakes.length ? mistakes.map((a,i)=>{
      const t = getX.taskById(a.taskId); if(!t) return '';
      return `<div class="task-row" data-action="open-task" data-id="${t.id}">
        <span class="idx">${i+1}.</span>
        <span class="status-dot" style="border-color:var(--red);color:var(--red)"><i data-lucide="x"></i></span>
        <div class="task-main"><div class="task-title">№${t.num}. ${t.statement.split('\n')[0].slice(0,80)}</div>
        <div class="task-tags"><span class="chip c3">№${t.num}</span><span class="chip ${chipForTopic(t.topic)}">${t.topic}</span>
        ${a.comment?`<span class="chip c5">коммент. учителя</span>`:''}</div></div>
        <button class="btn sm" data-action="open-task" data-id="${t.id}">Перерешать</button>
      </div>`;
    }).join('') : `<div class="empty"><i data-lucide="check"></i>Ошибок нет — отличная работа!</div>`}
  </section>`;
}

/* ================================================================
   ТЕОРИЯ (просмотр + редактор) — используется и учеником, и учителем
================================================================ */
function pageTheory(){
  const me = currentUser();
  const isTeacher = me.role==='teacher';
  // если выбран конкретный номер — показываем его, иначе список
  const num = session.theoryNum || null;
  if (num){
    const tt = getX.taskTypeByNum(num); if (!tt) return pageTheoryList();
    return pageTheoryView(tt, isTeacher);
  }
  return pageTheoryList();
}
function pageTheoryList(){
  const me = currentUser();
  const isTeacher = me.role==='teacher';
  return `
  ${pageHead('Теория по типам заданий', 'Перед каждым типом — обязательный «Как решать». Ученик не может решать, не прочитав.')}
  <section class="card rise">
    <div class="thead"><span style="flex:0 0 50px">№</span><span style="flex:1">Тип задания</span><span style="flex:1">Формат</span><span style="width:120px;text-align:right">Статус</span></div>
    ${DB.taskTypes.map(tt=>{
      const read = me.role==='student' ? getX.theoryReadBy(me.id, tt.num) : null;
      let statusHtml;
      if (isTeacher){
        if (tt.theoryHidden) statusHtml = `<span class="chip c2">скрыта</span>`;
        else if (tt.theory && tt.theory.length>20) statusHtml = `<span class="chip c1">готова</span>`;
        else statusHtml = `<span class="chip c3">пусто</span>`;
      } else {
        if (tt.theoryHidden) statusHtml = `<span class="chip c2">скоро</span>`;
        else if (read) statusHtml = `<span class="read-stamp"><i data-lucide="check"></i>прочитано</span>`;
        else statusHtml = `<span class="chip c3">не прочитано</span>`;
      }
      return `<div class="trow hoverable" data-action="open-theory" data-num="${tt.num}">
        <span class="hand" style="flex:0 0 50px;font-size:22px;color:var(--red)">${tt.num}</span>
        <div class="t-main" style="flex:1"><div class="t-name">${tt.title}</div><div class="t-sub">${tt.topic}</div></div>
        <span style="flex:1"><span class="chip c4"><i data-lucide="${formatIcon(tt.format)}" style="width:12px;height:12px;margin-right:4px"></i>${formatLabel(tt.format)}</span></span>
        <span style="width:120px;text-align:right">${statusHtml}</span>
      </div>`;
    }).join('')}
  </section>`;
}
function pageTheoryView(tt, isTeacher){
  const me = currentUser();
  const read = me.role==='student' ? getX.theoryReadBy(me.id, tt.num) : false;
  return `
  ${pageHead(`Теория · задание №${tt.num}`, tt.title,
    `<button class="btn ghost sm" data-action="theory-list"><i data-lucide="arrow-left"></i>К списку</button>
     ${isTeacher?`<button class="btn sm" data-action="theory-edit" data-num="${tt.num}"><i data-lucide="pencil"></i>Редактировать</button>`:''}`)}
  <div class="theory-card rise">
    <div class="theory-meta">
      <span class="chip c1">№${tt.num}</span>
      <span class="chip ${chipForTopic(tt.topic)}">${tt.topic}</span>
      <span class="chip c4"><i data-lucide="${formatIcon(tt.format)}" style="width:12px;height:12px;margin-right:4px"></i>${formatLabel(tt.format)}</span>
      <span class="chip c5">макс. ${tt.maxScore} балл(а)</span>
      ${tt.theoryHidden?`<span class="chip c2">скрыто от учеников</span>`:''}
    </div>
    ${tt.theoryHidden && !isTeacher
      ? `<div class="empty"><i data-lucide="lock"></i>Теория пока скрыта учителем. Загляни позже.</div>`
      : tt.theory && tt.theory.length>20
        ? `<div class="md">${md(tt.theory)}</div>`
        : `<div class="empty"><i data-lucide="pencil"></i>${isTeacher?'Теория пуста — нажмите «Редактировать».':'Теория ещё не готова.'}</div>`}
    ${!isTeacher && !tt.theoryHidden && tt.theory && tt.theory.length>20 ? `
      <div class="tm-actions" style="margin-top:24px;border-top:2px dashed var(--line);padding-top:18px">
        ${read ? `<span class="read-stamp"><i data-lucide="check"></i>прочитано ${new Date(read).toLocaleDateString('ru-RU')}</span>`:''}
        <span class="flex-sp"></span>
        ${read ? `<button class="btn" data-action="go-solve" data-num="${tt.num}">Перейти к заданиям <i data-lucide="arrow-right"></i></button>`
                : `<button class="btn" data-action="theory-mark-read" data-num="${tt.num}"><i data-lucide="check"></i>Я прочитал</button>
                   <button class="btn ghost sm" data-action="go-solve-anyway" data-num="${tt.num}">Пропустить теорию</button>`}
      </div>`:''}
  </div>
  ${isTeacher ? pageTheoryReadStats(tt) : ''}`;
}
function pageTheoryReadStats(tt){
  const students = getX.students();
  const readCount = students.filter(s=>getX.theoryReadBy(s.id, tt.num)).length;
  return `<section class="card rise" style="margin-top:22px">
    <div class="sec-head"><div class="sec-title">Кто прочитал</div><span class="leader"></span>
      <span class="chip c1">${readCount} из ${students.length}</span></div>
    ${students.map(s=>{
      const r = getX.theoryReadBy(s.id, tt.num);
      return `<div class="trow">
        <div class="ava" style="background:${s.color};width:32px;height:32px;font-size:11px">${s.initials}</div>
        <div class="t-main"><div class="t-name" style="font-size:14px">${s.name}</div></div>
        ${r ? `<span class="read-stamp"><i data-lucide="check"></i>${new Date(r).toLocaleDateString('ru-RU')}</span>`
             : `<span class="chip c3">не читал</span>`}
      </div>`;
    }).join('')}
  </section>`;
}
function openTheoryEditor(num){
  const tt = getX.taskTypeByNum(num); if(!tt) return;
  openModal(`
    <div class="tm-head"><div class="sec-title">Редактор теории · задание №${tt.num}</div>
      <button class="icon-btn" data-action="modal-close" style="margin-left:auto"><i data-lucide="x"></i></button></div>
    <div class="sub-sm" style="margin-bottom:10px">${tt.title}</div>
    <label class="f">Текст теории <span class="f-hint">— Markdown. Поддерживаются код в \`\`\`, списки, таблицы, картинки через URL или загрузкой ниже.</span></label>
    <textarea id="th-text" class="inp code" rows="14" placeholder="## Как решать задание №${tt.num}...">${tt.theory||''}</textarea>
    <div class="form-grid" style="margin-top:14px">
      <div><label class="f">Ссылка на видео (опц.)</label>
        <input id="th-video" class="inp" placeholder="https://youtu.be/..." value="${tt.theoryVideo||''}"></div>
      <div><label class="f">Загрузить изображение (вставится в текст как ![](...))</label>
        <input id="th-file" type="file" class="inp" accept="image/*"></div>
    </div>
    <label class="f" style="display:flex;align-items:center;gap:10px;cursor:pointer">
      <input type="checkbox" id="th-hidden" ${tt.theoryHidden?'checked':''} style="width:18px;height:18px">
      <span>Скрыть теорию от учеников (пока не готова)</span>
    </label>
    <div class="tm-actions">
      <button class="btn" data-action="theory-save" data-num="${tt.num}"><i data-lucide="save"></i>Сохранить</button>
      <span class="flex-sp"></span>
      <button class="btn ghost sm" data-action="theory-preview">Предпросмотр</button>
    </div>
    <div id="th-prev" style="margin-top:14px"></div>
  `);
  // обработчик загрузки изображения — вставляет data URL прямо в textarea
  const fileInp = $('#th-file');
  if (fileInp){
    fileInp.addEventListener('change', () => {
      const f = fileInp.files && fileInp.files[0]; if(!f) return;
      if (f.size > 500*1024){ toast('Картинка слишком большая (макс. 500 КБ в прототипе).','err'); fileInp.value=''; return; }
      const r = new FileReader();
      r.onload = () => {
        const ta = $('#th-text');
        const marker = `\n\n![иллюстрация](${r.result})\n\n`;
        ta.value += marker;
        toast('Картинка вставлена в текст теории.');
      };
      r.readAsDataURL(f);
    });
  }
}

/* ================================================================
   БАНК ЗАДАНИЙ + РЕШИТЬ ПО НОМЕРУ
================================================================ */
function pageBank(){
  const me = currentUser();
  const isTeacher = me.role==='teacher';
  const fNum = session.bankNum || 'all';
  const fTopic = session.bankTopic || 'all';
  const fSource = session.bankSource || 'all';
  const topics = Array.from(new Set(DB.tasks.map(t=>t.topic)));
  let list = DB.tasks.slice();
  if (fNum!=='all') list = list.filter(t=>t.num==fNum);
  if (fTopic!=='all') list = list.filter(t=>t.topic===fTopic);
  if (fSource!=='all') list = list.filter(t=>t.source===fSource);
  return `
  ${pageHead('Банк заданий', 'Каталог заданий ФИПИ и авторских. Фильтруй, решай, разбирай.',
    isTeacher?`<button class="btn sm" data-action="nav" data-page="author"><i data-lucide="plus"></i>Своё задание</button>
              <button class="btn ghost sm" data-action="bank-import"><i data-lucide="upload"></i>Импорт JSON</button>`:'')}
  <section class="card rise">
    <div class="chips">
      <span style="font-weight:700;color:var(--muted);align-self:center;font-size:13px;margin-right:4px">№:</span>
      <button class="chip-btn ${fNum==='all'?'on':''}" data-action="bank-filter" data-k="num" data-v="all">Все</button>
      ${Array.from({length:16},(_,i)=>i+1).map(n=>`<button class="chip-btn ${fNum==n?'on':''}" data-action="bank-filter" data-k="num" data-v="${n}">${n}</button>`).join('')}
    </div>
    <div class="chips">
      <span style="font-weight:700;color:var(--muted);align-self:center;font-size:13px;margin-right:4px">Тема:</span>
      <button class="chip-btn ${fTopic==='all'?'on':''}" data-action="bank-filter" data-k="topic" data-v="all">Все</button>
      ${topics.map(t=>`<button class="chip-btn ${fTopic===t?'on':''}" data-action="bank-filter" data-k="topic" data-v="${t}">${t}</button>`).join('')}
    </div>
    <div class="chips">
      <span style="font-weight:700;color:var(--muted);align-self:center;font-size:13px;margin-right:4px">Источник:</span>
      ${[['all','Все'],['fipi','ФИПИ'],['author','Авторские']].map(([v,l])=>`<button class="chip-btn ${fSource===v?'on':''}" data-action="bank-filter" data-k="source" data-v="${v}">${l}</button>`).join('')}
    </div>
  </section>
  <section class="card rise" style="margin-top:22px">
    <div class="sec-head"><div class="sec-title">Найдено заданий: ${list.length}</div><span class="leader"></span>
      ${me.role==='student' && fNum!=='all' ? `<button class="btn sm" data-action="solve-random" data-num="${fNum}"><i data-lucide="shuffle"></i>Решать случайное №${fNum}</button>`:''}</div>
    ${list.length ? list.map((t,i)=>taskRow(t,i,{mine:me.role==='student'})).join('')
      : `<div class="empty"><i data-lucide="search"></i>Ничего не найдено — измените фильтры.</div>`}
  </section>`;
}

/* модалка решения задания */
function openTask(id){
  const t = getX.taskById(id); if(!t) return;
  const me = currentUser();
  const tt = getX.taskTypeByNum(t.num);
  // ученик видит баннер теории, если ещё не прочитал
  const showTheoryBanner = me.role==='student' && tt && !tt.theoryHidden && !getX.theoryReadBy(me.id, t.num);
  // ссылка «Открыть теорию» доступна всегда во время решения (если теория не скрыта)
  const showTheoryLink = me.role==='student' && tt && !tt.theoryHidden;
  // режим экзамена: разбираем, идёт ли это задание в рамках варианта с examMode и без finishedAt
  const curVar = session.curVariant ? getX.assignmentById(session.curVariant) : null;
  const variantObj = curVar ? getX.variantById(curVar.variantId) : null;
  const inExam = curVar && variantObj && variantObj.examMode && !curVar.finishedAt;
  const fmt = tt ? tt.format : 'text';
  const last = me.role==='student' ? DB.attempts.filter(a=>a.taskId===id && a.studentId===me.id).sort((a,b)=>b.ts-a.ts)[0] : null;
  // в режиме экзамена прячем разбор до завершения варианта
  const canShowExplanation = !inExam;
  openModal(`
    <div class="tm-head">
      <span class="chip c1">№${t.num}</span>
      <span class="chip ${chipForTopic(t.topic)}">${t.topic}</span>
      ${diffDots(t.difficulty)}
      ${sourceChip(t.source)}
      ${t.fipiId?`<span class="chip c4">${t.fipiId}</span>`:''}
      ${inExam?`<span class="chip c3"><i data-lucide="lock" style="width:11px;height:11px;margin-right:3px"></i>экзамен</span>`:''}
      <button class="icon-btn" data-action="modal-close" style="margin-left:auto"><i data-lucide="x"></i></button>
    </div>
    <h3 class="tm-title">Задание №${t.num}</h3>
    ${showTheoryBanner ? `<div class="theory-banner">
      <i data-lucide="book-open"></i>
      <div class="tb-txt"><div class="tb-t">Сначала прочитай теорию</div>
      <div class="tb-s">Перед решением загляни в раздел «Как решать» — это сэкономит время.</div></div>
      <button class="btn sm" data-action="theory-from-task" data-num="${t.num}">Открыть теорию</button>
    </div>`:''}
    <div class="tm-q md">${md(t.statement)}</div>
    ${t.image ? `<img src="${t.image}" style="max-width:100%;border-radius:12px;margin-bottom:14px;border:1.5px solid var(--line)">`:''}
    ${last && last.isCorrect!==null && last.isCorrect!==undefined ? `
      <div class="tm-success" style="background:${last.isCorrect?'var(--green-t)':'var(--red-t)'};border-color:${last.isCorrect?'var(--green)':'var(--red)'}">
        ${last.isCorrect ? CHECK_BIG : `<span class="check-draw big" style="color:var(--red)"><svg viewBox="0 0 32 32"><path d="M8 8 L24 24 M24 8 L8 24" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" fill="none" pathLength="100"/></svg></span>`}
        <div style="flex:1;min-width:170px">
          <div class="hand">${last.isCorrect?'Верно!':'Не верно'}</div>
          ${last.comment?`<div class="sub-sm" style="margin-top:4px;color:var(--red)">«${last.comment}»</div>`:''}
        </div>
      </div>`:''}
    <div id="tm-answer-area">
      ${renderAnswerInput(fmt, t, last)}
    </div>
    <div id="tm-result"></div>
    ${me.role==='student' ? `<div class="tm-actions">
      ${showTheoryLink ? `<button class="btn ghost sm" data-action="theory-from-task" data-num="${t.num}"><i data-lucide="book-open"></i>Открыть теорию</button>`:''}
      ${canShowExplanation ? `<button class="btn ghost sm" data-action="show-explanation" data-id="${t.id}"><i data-lucide="eye"></i>Показать разбор</button>`:''}
      ${inExam ? `<span class="sub-sm" style="color:var(--amber)"><i data-lucide="lock" style="width:13px;height:13px;vertical-align:-2px"></i> Разбор скрыт до завершения варианта</span>`:''}
      <span class="flex-sp"></span>
      <button class="btn" id="check-btn" data-action="check-answer" data-id="${t.id}" data-fmt="${fmt}">
        ${fmt==='file'?'Отправить на проверку':'Проверить ответ'}
      </button>
    </div>`:''}
    ${canShowExplanation ? `<div id="tm-expl" hidden style="margin-top:16px">
      <div class="sec-title">Разбор</div>
      <div class="md" style="background:var(--card-2);border:1.5px solid var(--line);border-radius:14px;padding:14px 16px;margin-top:8px">${md(t.explanation||'Разбор отсутствует.')}</div>
    </div>`:''}
  `);
}
function renderAnswerInput(fmt, t, last){
  const disabled = last && last.isCorrect===true ? 'disabled' : '';
  if (fmt==='number') return `<label class="f">Числовой ответ</label>
    <input id="ans-input" class="inp mono" type="text" inputmode="numeric" placeholder="например: 42" ${disabled}>
    <div class="sub-sm" style="margin-top:6px">Введите число без единиц измерения и пояснений.</div>`;
  if (fmt==='text') return `<label class="f">Текстовый ответ</label>
    <input id="ans-input" class="inp" type="text" placeholder="например: ДА" ${disabled}>
    <div class="sub-sm" style="margin-top:6px">Регистр и лишние пробелы не учитываются.</div>`;
  if (fmt==='sequence') return `<label class="f">Последовательность цифр</label>
    <input id="ans-input" class="inp mono" type="text" placeholder="например: 3124" ${disabled}>
    <div class="sub-sm" style="margin-top:6px">Запишите номера ответов подряд, без запятых и пробелов.</div>`;
  if (fmt==='file') return `<label class="f">Текст решения (или прикрепите файл)</label>
    <textarea id="ans-input" class="inp code" rows="10" placeholder="Вставьте сюда текст программы, описание презентации и т.п."></textarea>
    <label class="f">Или файл (data URL, до 200 КБ)</label>
    <input id="ans-file" type="file" class="inp" accept="image/*,text/*,application/pdf">
    ${last && last.isCorrect===null ? `<div class="hint" style="margin-top:14px"><i data-lucide="clock"></i><div>Решение отправлено — ждёт проверки учителем. Вы получите балл и комментарий.</div></div>`:''}`;
  return '';
}
function normalizeAnswer(fmt, val){
  if (fmt==='number') return String(val).trim().replace(/[,\s]/g,'').replace(',', '.');
  if (fmt==='sequence') return String(val).trim().replace(/[\s,]/g,'');
  if (fmt==='text') return String(val).trim().toLowerCase().replace(/\s+/g,' ');
  return String(val).trim();
}
function checkAnswer(taskId){
  const t = getX.taskById(taskId); if(!t) return;
  const me = currentUser(); if(!me || me.role!=='student') return;
  const tt = getX.taskTypeByNum(t.num);
  const fmt = tt.format;
  const inp = $('#ans-input'); const val = inp ? inp.value : '';
  const fileInp = $('#ans-file'); const fileVal = fileInp && fileInp.files && fileInp.files[0];
  if (!val && !fileVal && fmt!=='file'){ toast('Введите ответ.','warn'); return; }
  if (fmt==='file'){
    // ручная проверка
    let answerText = val;
    if (fileVal){
      if (fileVal.size > 200*1024){ toast('Файл слишком большой (макс. 200 КБ в прототипе).','err'); return; }
      // для простоты — текстовые читаем как текст, остальное как dataURL с пометкой
      if (fileVal.type.startsWith('text/')){
        answerText = awaitRead(fileVal, answerText);
      } else {
        // dataURL
        answerText = `[Файл: ${fileVal.name} (${fileVal.type})]\n\n${answerText}`;
      }
    }
    const a = {id:uid('at'), taskId:t.id, studentId:me.id, variantId:session.curVariant||null,
      answer:answerText, isCorrect:null, score:null, comment:'', ts:nowTs(), manual:true};
    saveX.attempt(a);
    closeModal(); renderPage();
    toast('Решение отправлено учителю на проверку.');
    return;
  }
  // автопроверка
  const userAns = normalizeAnswer(fmt, val);
  const correctAns = normalizeAnswer(fmt, t.answer);
  const ok = userAns === correctAns;
  const a = {id:uid('at'), taskId:t.id, studentId:me.id, variantId:session.curVariant||null,
    answer:val, isCorrect:ok, score:ok?tt.maxScore:0, comment:'', ts:nowTs(), manual:false};
  saveX.attempt(a);
  // перерисовываем модалку
  openTask(t.id);
  if (ok) toast(`Верно! +${tt.maxScore} балл(а).`);
  else toast('Не верно — попробуй снова или посмотри разбор.','warn');
}
function awaitRead(file, fallback){
  // синхронно вернуть fallback, асинхронно дочитать нельзя в этом контексте — для прототипа
  return fallback + (file && file.name ? `\n\n[прикреплён файл: ${file.name}]` : '');
}

/* ================================================================
   ВАРИАНТЫ
================================================================ */
function pageVariants(){
  const me = currentUser();
  const isTeacher = me.role==='teacher';
  return `
  ${pageHead('Варианты', 'Собирай варианты из заданий и назначай ученикам с дедлайном.',
    isTeacher?`<button class="btn sm" data-action="variant-new"><i data-lucide="plus"></i>Новый вариант</button>`:'')}
  <section class="card rise">
    <div class="sec-head"><div class="sec-title">Варианты</div><span class="leader"></span></div>
    ${DB.variants.length ? DB.variants.map(v=>{
      const tasks = v.taskIds.map(id=>getX.taskById(id)).filter(Boolean);
      const assignedTo = DB.assignments.filter(a=>a.variantId===v.id);
      return `<div class="pub-row">
        <div class="pub-main"><b>${v.name}</b>
          <span class="chip ${v.examMode?'c3':'c1'}">${v.examMode?'экзамен':'тренировка'}</span>
          <span class="chip c4">${tasks.length} заданий</span>
          ${v.timerMin?`<span class="chip c5">${v.timerMin} мин</span>`:''}
        </div>
        <div class="pub-meta">дедлайн: ${dueText(v.deadline)}${assignedTo.length?` · назначен ${assignedTo.length} уч.`:''}</div>
        <div class="pub-acts">
          <button class="btn ghost sm" data-action="variant-view" data-id="${v.id}"><i data-lucide="eye"></i>Открыть</button>
          ${isTeacher?`<button class="icon-btn" data-action="variant-edit" data-id="${v.id}" title="Редактировать"><i data-lucide="pencil"></i></button>
                       <button class="icon-btn" data-action="variant-del" data-id="${v.id}" title="Удалить"><i data-lucide="trash-2"></i></button>`:''}
        </div>
      </div>`;
    }).join('') : `<div class="empty"><i data-lucide="layers"></i>Вариантов пока нет.</div>`}
  </section>
  ${me.role==='student' ? `<section class="card rise" style="margin-top:22px">
    <div class="sec-title">Назначенные мне</div>
    ${DB.assignments.filter(a=>a.studentId===me.id).length
      ? DB.assignments.filter(a=>a.studentId===me.id).map(a=>{
        const v = getX.variantById(a.variantId); if(!v) return '';
        return `<div class="pub-row">
          <div class="pub-main"><b>${v.name}</b><span class="chip ${a.finishedAt?'c1':dueCls(a.deadline)==='hot'?'c3':'c4'}">${a.finishedAt?'завершён':'дедлайн '+dueText(a.deadline)}</span></div>
          <div class="pub-acts"><button class="btn sm" data-action="start-variant" data-id="${a.id}">${a.finishedAt?'Посмотреть':'Открыть'}</button></div>
        </div>`;
      }).join('')
      : `<div class="empty"><i data-lucide="inbox"></i>Ничего не назначено.</div>`}
  </section>`:''}`;
}
function openVariantEditor(id){
  const v = id ? getX.variantById(id) : {id:'', name:'', taskIds:[], deadline:isoIn(7), examMode:false, timerMin:0};
  const sel = new Set(v.taskIds);
  openModal(`
    <div class="tm-head"><div class="sec-title">${id?'Редактировать вариант':'Новый вариант'}</div>
      <button class="icon-btn" data-action="modal-close" style="margin-left:auto"><i data-lucide="x"></i></button></div>
    <label class="f">Название</label>
    <input id="v-name" class="inp" value="${v.name}" placeholder="например, Пробник ОГЭ №3">
    <div class="form-grid">
      <div><label class="f">Дедлайн</label><input type="date" id="v-deadline" class="inp" value="${v.deadline}"></div>
      <div><label class="f">Таймер (мин, 0 = без таймера)</label><input type="number" id="v-timer" class="inp" value="${v.timerMin}" min="0" step="5"></div>
    </div>
    <label class="f" style="display:flex;align-items:center;gap:10px;cursor:pointer">
      <input type="checkbox" id="v-exam" ${v.examMode?'checked':''} style="width:18px;height:18px">
      <span>Режим экзамена (разбор скрыт до конца, таймер по умолчанию 150 мин)</span>
    </label>
    <div class="tm-actions" style="margin-bottom:14px">
      <button class="btn ghost sm" data-action="variant-autofill"><i data-lucide="shuffle"></i>По одному заданию на каждый номер</button>
      <span class="flex-sp"></span>
      <span class="sub-sm" id="v-count">Выбрано: ${sel.size}</span>
    </div>
    <div class="sec-title" style="margin-bottom:8px">Задания в банке</div>
    <div id="v-tasks" style="max-height:300px;overflow-y:auto;border:1.5px solid var(--line);border-radius:14px;padding:6px 10px">
      ${DB.tasks.map(t=>`<label class="trow" style="cursor:pointer;padding:8px 4px">
        <input type="checkbox" data-action="variant-toggle" data-id="${t.id}" ${sel.has(t.id)?'checked':''} style="width:18px;height:18px">
        <span class="chip c1">№${t.num}</span>
        <span class="chip ${chipForTopic(t.topic)}">${t.topic}</span>
        <span style="flex:1;font-weight:600;font-size:13.5px">${t.statement.split('\n')[0].slice(0,70)}</span>
      </label>`).join('')}
    </div>
    <div class="tm-actions">
      <button class="btn" data-action="variant-save" data-id="${v.id}"><i data-lucide="save"></i>Сохранить</button>
      <span class="flex-sp"></span>
      ${id?`<button class="btn sm" data-action="variant-assign" data-id="${v.id}"><i data-lucide="user-plus"></i>Назначить ученикам</button>`:''}
    </div>
  `);
}
function openVariantView(id){
  const v = getX.variantById(id); if(!v) return;
  const me = currentUser();
  const tasks = v.taskIds.map(id=>getX.taskById(id)).filter(Boolean);
  openModal(`
    <div class="tm-head"><div class="sec-title">${v.name}</div>
      <button class="icon-btn" data-action="modal-close" style="margin-left:auto"><i data-lucide="x"></i></button></div>
    <div class="theory-meta">
      <span class="chip ${v.examMode?'c3':'c1'}">${v.examMode?'режим экзамена':'тренировка'}</span>
      <span class="chip c4">${tasks.length} заданий</span>
      ${v.timerMin?`<span class="chip c5">таймер ${v.timerMin} мин</span>`:''}
      <span class="chip c2">дедлайн ${dueText(v.deadline)}</span>
    </div>
    <div class="sec-title" style="margin:14px 0 6px">Задания варианта</div>
    ${tasks.map((t,i)=>`<div class="trow hoverable" data-action="open-task" data-id="${t.id}">
      <span class="idx">${i+1}.</span>
      <span class="chip c1">№${t.num}</span>
      <div class="t-main"><div class="t-name" style="font-size:13.5px">${t.statement.split('\n')[0].slice(0,80)}</div></div>
      <span class="chip ${chipForTopic(t.topic)}">${t.topic}</span>
    </div>`).join('') || '<div class="empty">В варианте нет заданий.</div>'}
    ${me.role==='teacher' ? `<div class="tm-actions">
      <button class="btn" data-action="variant-assign" data-id="${v.id}"><i data-lucide="user-plus"></i>Назначить ученикам</button>
    </div>`:''}
  `,'lg');
}
function openAssignModal(variantId){
  const v = getX.variantById(variantId); if(!v) return;
  const students = getX.students();
  openModal(`
    <div class="tm-head"><div class="sec-title">Назначить «${v.name}»</div>
      <button class="icon-btn" data-action="modal-close" style="margin-left:auto"><i data-lucide="x"></i></button></div>
    <label class="f">Дедлайн для всех (можно изменить индивидуально)</label>
    <input type="date" id="as-deadline" class="inp" value="${v.deadline}">
    <div class="sec-title" style="margin:14px 0 6px">Кому назначить</div>
    ${students.map(s=>{
      const assigned = DB.assignments.find(a=>a.variantId===variantId && a.studentId===s.id);
      return `<label class="trow" style="cursor:pointer;padding:9px 4px">
        <input type="checkbox" data-action="assign-toggle" data-id="${s.id}" ${assigned?'checked':''} style="width:18px;height:18px">
        <div class="ava" style="background:${s.color};width:32px;height:32px;font-size:11px">${s.initials}</div>
        <div class="t-main"><div class="t-name" style="font-size:14px">${s.name}</div><div class="t-sub">${assigned?'уже назначено':''}</div></div>
      </label>`;
    }).join('')}
    <div class="tm-actions">
      <button class="btn" data-action="assign-save" data-variant="${variantId}"><i data-lucide="check"></i>Назначить</button>
    </div>
  `);
}
function openVariantRunner(assignmentId){
  const a = getX.assignmentById(assignmentId); if(!a) return;
  const v = getX.variantById(a.variantId); if(!v) return;
  const me = currentUser();
  const tasks = v.taskIds.map(id=>getX.taskById(id)).filter(Boolean);
  if (!a.startedAt){ a.startedAt = nowTs(); saveX.assignment(a); }
  // экзамен-режим: таймер
  const elapsed = Math.floor((nowTs() - a.startedAt)/1000);
  const total = (v.timerMin || 0) * 60;
  const remain = total ? Math.max(0, total - elapsed) : 0;
  const remainTxt = total ? `${Math.floor(remain/60)}:${(remain%60).toString().padStart(2,'0')}` : 'без таймера';
  openModal(`
    <div class="tm-head"><div class="sec-title">${v.name}</div>
      <button class="icon-btn" data-action="modal-close" style="margin-left:auto"><i data-lucide="x"></i></button></div>
    ${total ? `<div class="due ${remain<300?'hot':''}"><i data-lucide="clock"></i>Осталось: <b>${remainTxt}</b></div>`:''}
    <div class="sub-sm" style="margin-top:10px">Дедлайн: ${dueText(a.deadline)}. ${v.examMode?'Режим экзамена: разбор скрыт до завершения.':''}</div>
    <div class="sec-title" style="margin:14px 0 6px">Задания</div>
    ${tasks.map((t,i)=>{
      const last = DB.attempts.find(x=>x.taskId===t.id && x.studentId===me.id && x.variantId===a.id);
      const status = last ? (last.isCorrect===null?'wait':(last.isCorrect?'done':'bad')) : 'todo';
      const dotCls = status==='done'?'done':status==='wait'?'wait':status==='bad'?'':'';
      const dotStyle = status==='bad'?'border-color:var(--red);color:var(--red)':'';
      return `<div class="task-row" data-action="open-task-variant" data-id="${t.id}" data-variant="${a.id}">
        <span class="idx">${i+1}.</span>
        <span class="status-dot ${dotCls}" style="${dotStyle}"><i data-lucide="${status==='done'?'check':status==='wait'?'clock':status==='bad'?'x':''}"></i></span>
        <div class="task-main"><div class="task-title">№${t.num}. ${t.statement.split('\n')[0].slice(0,70)}</div></div>
        <button class="btn sm ${status==='done'?'ghost':''}">${status==='done'?'Готово':status==='wait'?'На проверке':status==='bad'?'Перерешать':'Решить'}</button>
      </div>`;
    }).join('')}
    <div class="tm-actions">
      <span class="flex-sp"></span>
      <button class="btn ghost" data-action="variant-finish" data-id="${a.id}">Завершить вариант</button>
    </div>
  `,'lg');
}

/* ================================================================
   РОДИТЕЛЬ: ОБЗОР И ПРОГРЕСС
================================================================ */
function pageParentHome(){
  const me = currentUser();
  const myChildren = (me.childIds||[]).map(id=>getX.userById(id)).filter(Boolean);
  return `
  ${pageHead(`Здравствуйте, ${first(me.name)}`, `Недельная сводка по ${myChildren.length} ${myChildren.length===1?'ребёнку':'детям'}.`)}
  <div class="grid main-grid">
    <section class="card rise">
      <div class="sec-head"><div class="sec-title">Дети на контроле</div><span class="leader"></span></div>
      ${myChildren.length ? myChildren.map(s=>{
        const att = getX.attemptsByStudent(s.id);
        const correct = att.filter(a=>a.isCorrect===true).length;
        const wrong = att.filter(a=>a.isCorrect===false).length;
        const pct = att.length ? Math.round(correct/att.length*100) : 0;
        return `<div class="child-row">
          <div class="ava big" style="background:${s.color}">${s.initials}</div>
          <div style="flex:1;min-width:0">
            <div class="c-name">${s.name}</div>
            <div class="sub-sm">${s.grade} класс · ${att.length} попыток · ${correct} верно</div>
            <div style="margin-top:6px">${meter(pct,100)}<span style="margin-left:8px;font-weight:700">${pct}%</span></div>
          </div>
          <button class="btn ghost sm" data-action="view-child" data-id="${s.id}">Подробнее</button>
        </div>`;
      }).join('') : `<div class="empty"><i data-lucide="users"></i>К вам пока не привязан ни один ребёнок.</div>`}
    </section>
    <div class="col">
      <section class="card rise" style="animation-delay:.06s">
        <div class="sec-title">За неделю</div>
        <div class="sub-sm" style="margin-top:8px">
          ${(() => {
            const weekAtt = myChildren.flatMap(s=>getX.attemptsByStudent(s.id)).filter(a=>a.ts>Date.now()-864e5*7);
            return `Всего попыток: <b>${weekAtt.length}</b> · верных: <b>${weekAtt.filter(a=>a.isCorrect===true).length}</b> · на проверке: <b>${weekAtt.filter(a=>a.isCorrect===null).length}</b>`;
          })()}
        </div>
      </section>
      <section class="card note rise" style="animation-delay:.12s">
        <div class="sec-title">Совет от учителя</div>
        <div class="pen-note">«Главное — регулярность. 30 минут в день полезнее, чем 4 часа раз в неделю. Спасибо, что поддерживаете ребёнка!»</div>
        <div class="pen-sig">— ${first(getX.teacher().name)}</div>
      </section>
    </div>
  </div>`;
}
function pageParentProgress(){
  const me = currentUser();
  const myChildren = (me.childIds||[]).map(id=>getX.userById(id)).filter(Boolean);
  return `
  ${pageHead('Прогресс детей', 'Подробная статистика по каждому ребёнку.')}
  ${myChildren.map(s=>{
    const att = getX.attemptsByStudent(s.id);
    const correct = att.filter(a=>a.isCorrect===true).length;
    const wrong = att.filter(a=>a.isCorrect===false).length;
    const pending = att.filter(a=>a.isCorrect===null).length;
    // по номерам
    const byNum = {};
    for (let n=1;n<=16;n++) byNum[n]={total:0,correct:0};
    att.forEach(a=>{ const t=getX.taskById(a.taskId); if(!t) return;
      byNum[t.num].total++; if(a.isCorrect===true) byNum[t.num].correct++; });
    // слабые темы
    const byTopic = {};
    att.forEach(a=>{ const t=getX.taskById(a.taskId); if(!t) return;
      if(!byTopic[t.topic]) byTopic[t.topic]={total:0,correct:0};
      byTopic[t.topic].total++; if(a.isCorrect===true) byTopic[t.topic].correct++; });
    const weak = Object.entries(byTopic).filter(([k,v])=>v.total>0 && (v.correct/v.total)<0.7)
      .sort((a,b)=>(a[1].correct/a[1].total)-(b[1].correct/b[1].total));
    return `<section class="card rise" style="margin-bottom:22px">
      <div class="sec-head">
        <div class="ava big" style="background:${s.color}">${s.initials}</div>
        <div><div class="sec-title">${s.name}</div>
        <div class="sub-sm">${s.grade} класс · ${correct} верно / ${wrong} ошибок / ${pending} на проверке</div></div>
        <span class="leader"></span>
      </div>
      <div class="stat-strip" style="margin-bottom:18px">
        <div class="stat"><div class="stat-n">${att.length}</div><div class="stat-l">ПОПЫТОК ВСЕГО</div></div>
        <div class="stat"><div class="stat-n"><em>${att.length?Math.round(correct/att.length*100):0}%</em></div><div class="stat-l">УСПЕШНОСТЬ</div></div>
        <div class="stat"><div class="stat-n">${pending}</div><div class="stat-l">ЖДЁТ ПРОВЕРКИ</div></div>
      </div>
      <div class="sec-title" style="margin:14px 0 6px">По номерам заданий</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
        ${Object.entries(byNum).map(([n,v])=>{
          const pct = v.total ? Math.round(v.correct/v.total*100) : 0;
          const cls = !v.total ? 'none' : pct>=80?'good':pct>=50?'mid':'bad';
          return `<div style="text-align:center;padding:8px 4px;background:var(--card-2);border-radius:10px">
            <div class="hand" style="font-size:18px;color:var(--faint)">№${n}</div>
            <span class="cell ${cls}" style="margin-top:4px">${v.total?pct+'%':'—'}</span>
          </div>`;
        }).join('')}
      </div>
      ${weak.length ? `<div class="sec-title" style="margin:16px 0 6px">Что подтянуть</div>
        ${weak.slice(0,3).map(([topic,v])=>`<div class="kv"><span style="flex:1">${topic}</span>${meter(v.correct,v.total,'red')}<b>${Math.round(v.correct/v.total*100)}%</b></div>`).join('')}`:''}
    </section>`;
  }).join('')}`;
}

/* ================================================================
   УЧИТЕЛЬ: ОБЗОР
================================================================ */
function pageTeacherOverview(){
  const students = getX.students();
  const att = DB.attempts;
  const pending = getX.attemptsPending();
  const correct = att.filter(a=>a.isCorrect===true).length;
  const total = att.filter(a=>a.isCorrect!==null).length;
  const avgPct = total ? Math.round(correct/total*100) : 0;
  const variants = DB.variants.length;
  const feed = [];
  // последние 5 попыток
  att.sort((a,b)=>b.ts-a.ts).slice(0,5).forEach(a=>{
    const t = getX.taskById(a.taskId); const s = getX.userById(a.studentId); if(!t||!s) return;
    feed.push([`${first(s.name)} — №${t.num} ${a.isCorrect===true?'<span style="color:var(--green)">верно</span>':a.isCorrect===false?'<span style="color:var(--red)">неверно</span>':'<span style="color:var(--amber)">на проверку</span>'}`,
      new Date(a.ts).toLocaleString('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}),
      a.isCorrect===true?'green':a.isCorrect===false?'red':'amber']);
  });
  return `
  ${pageHead(`Здравствуйте, ${first(getX.teacher().name)}`, `${todayLong} · ${students.length} учеников · ${pending.length} заданий ждут проверки`)}
  <div class="stat-strip rise">
    <div class="stat"><div class="stat-n">${students.length}</div><div class="stat-l">УЧЕНИКОВ</div></div>
    <div class="stat"><div class="stat-n"><em>${avgPct}%</em></div><div class="stat-l">СРЕДНИЙ УСПЕХ</div></div>
    <div class="stat"><div class="stat-n">${att.length}</div><div class="stat-l">ПОПЫТОК ВСЕГО</div></div>
    <div class="stat"><div class="stat-n">${variants}</div><div class="stat-l">ВАРИАНТОВ</div></div>
    <div class="stat"><div class="stat-n"><em>${pending.length}</em></div><div class="stat-l">НА ПРОВЕРКУ</div></div>
  </div>
  <div class="grid main-grid">
    <section class="card rise" style="animation-delay:.06s">
      <div class="sec-head"><div class="sec-title">Лента активности</div><span class="leader"></span></div>
      ${feed.length ? feed.map(([t,w,c])=>`<div class="feed-row"><span class="feed-dot ${c}"></span>
        <div style="flex:1"><div class="feed-t">${t}</div><div class="feed-when">${w}</div></div></div>`).join('')
        : `<div class="empty"><i data-lucide="activity"></i>Пока тихо.</div>`}
    </section>
    <div class="col">
      ${pending.length ? `<section class="card rise" style="animation-delay:.12s">
        <div class="sec-head"><div class="sec-title">Ждут проверки</div><span class="leader"></span>
          <button class="link" data-action="nav" data-page="check">Все <i data-lucide="chevron-right"></i></button></div>
        ${pending.slice(0,4).map(a=>{
          const t = getX.taskById(a.taskId); const s = getX.userById(a.studentId); if(!t||!s) return '';
          return `<div class="trow hoverable" data-action="open-check" data-id="${a.id}">
            <div class="ava" style="background:${s.color};width:32px;height:32px;font-size:11px">${s.initials}</div>
            <div class="t-main"><div class="t-name" style="font-size:14px">№${t.num} — ${first(s.name)}</div>
            <div class="t-sub">${new Date(a.ts).toLocaleString('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div></div>
            <span class="chip c2">ожидает</span>
          </div>`;
        }).join('')}
      </section>`:''}
      <section class="card rise" style="animation-delay:.18s">
        <div class="sec-head"><div class="sec-title">Быстрые действия</div><span class="leader"></span></div>
        <div style="display:grid;gap:10px">
          <button class="btn ghost w100" data-action="nav" data-page="author"><i data-lucide="pen-tool"></i>Создать авторское задание</button>
          <button class="btn ghost w100" data-action="nav" data-page="variants"><i data-lucide="layers"></i>Собрать вариант ОГЭ</button>
          <button class="btn ghost w100" data-action="nav" data-page="theory"><i data-lucide="book-open"></i>Редактировать теорию</button>
          <button class="btn ghost w100" data-action="nav" data-page="people"><i data-lucide="user-plus"></i>Привязать родителя</button>
        </div>
      </section>
    </div>
  </div>`;
}

/* ================================================================
   АВТОРСКИЕ ЗАДАНИЯ
================================================================ */
function pageAuthor(){
  const me = currentUser();
  if (me.role!=='teacher'){
    // для ученика — показываем только список авторских заданий (для решения)
    const list = DB.tasks.filter(t=>t.source==='author');
    return `${pageHead('Авторские задания учителя', 'Дополнительные задания от вашего преподавателя.')}
    <section class="card rise">
      ${list.length ? list.map((t,i)=>taskRow(t,i,{mine:true})).join('') : `<div class="empty"><i data-lucide="pen-tool"></i>Пока нет авторских заданий.</div>`}
    </section>`;
  }
  const authorTasks = DB.tasks.filter(t=>t.source==='author');
  return `
  ${pageHead('Авторские задания', 'Задания, которые вы создали сами. Их можно включать в варианты и решать по номеру наравне с банком.',
    `<button class="btn sm" data-action="author-new"><i data-lucide="plus"></i>Новое задание</button>`)}
  <section class="card rise">
    <div class="sec-head"><div class="sec-title">Мои задания (${authorTasks.length})</div><span class="leader"></span></div>
    ${authorTasks.length ? authorTasks.map(t=>`<div class="pub-row">
      <div class="pub-main"><b>№${t.num}. ${t.statement.split('\n')[0].slice(0,70)}</b>
      <span class="chip c1">№${t.num}</span><span class="chip ${chipForTopic(t.topic)}">${t.topic}</span>
      ${diffDots(t.difficulty)}</div>
      <div class="pub-meta">${t.fipiId||'без ID'} · формат: ${formatLabel(getX.taskTypeByNum(t.num).format)}</div>
      <div class="pub-acts">
        <button class="icon-btn" data-action="author-edit" data-id="${t.id}" title="Редактировать"><i data-lucide="pencil"></i></button>
        <button class="icon-btn" data-action="open-task" data-id="${t.id}" title="Просмотреть"><i data-lucide="eye"></i></button>
        <button class="icon-btn" data-action="author-del" data-id="${t.id}" title="Удалить"><i data-lucide="trash-2"></i></button>
      </div>
    </div>`).join('') : `<div class="empty"><i data-lucide="pen-tool"></i>Создайте первое авторское задание.</div>`}
  </section>`;
}
function openAuthorEditor(id){
  const t = id ? getX.taskById(id) : {id:'', num:1, source:'author', topic:'', difficulty:1, fipiId:'', statement:'', answer:'', explanation:'', image:''};
  state.curDiff = t.difficulty || 1;
  openModal(`
    <div class="tm-head"><div class="sec-title">${id?'Редактировать задание':'Новое авторское задание'}</div>
      <button class="icon-btn" data-action="modal-close" style="margin-left:auto"><i data-lucide="x"></i></button></div>
    <div class="form-grid">
      <div><label class="f">Тип задания (номер)</label>
        <select id="a-num" class="inp">${DB.taskTypes.map(tt=>`<option value="${tt.num}" ${t.num===tt.num?'selected':''}>№${tt.num} — ${tt.title.slice(0,40)}</option>`).join('')}</select></div>
      <div><label class="f">Тема</label>
        <input id="a-topic" class="inp" value="${t.topic}" placeholder="например, Системы счисления"></div>
    </div>
    <div class="form-grid">
      <div><label class="f">Сложность</label>
        <div class="diff-pick" id="a-diff">${[1,2,3].map(n=>`<button type="button" class="dpick ${n<=t.difficulty?'on':''}" data-action="set-diff" data-n="${n}" title="${n}/3"><i></i></button>`).join('')}</div></div>
      <div><label class="f">ID в банке ФИПИ (опц.)</label>
        <input id="a-fipi" class="inp" value="${t.fipiId||''}" placeholder="FIPI-XX-XXX"></div>
    </div>
    <label class="f">Условие <span class="f-hint">— Markdown</span></label>
    <textarea id="a-statement" class="inp code" rows="6" placeholder="Полный текст условия задания. Можно использовать Markdown.">${t.statement}</textarea>
    <label class="f">Правильный ответ <span class="f-hint">— для автопроверки (число/текст/последовательность). Для файловых оставьте пустым.</span></label>
    <input id="a-answer" class="inp mono" value="${t.answer||''}" placeholder="например, 42 или ДА или 3124">
    <label class="f">Разбор <span class="f-hint">— Markdown, показывается ученику</span></label>
    <textarea id="a-explanation" class="inp code" rows="4" placeholder="Как решать...">${t.explanation||''}</textarea>
    <label class="f">Картинка (URL или data URL, опц.)</label>
    <input id="a-image" class="inp" value="${t.image||''}" placeholder="https://... или data:image/...">
    <div class="tm-actions">
      <button class="btn" data-action="author-save" data-id="${t.id}"><i data-lucide="save"></i>Сохранить</button>
      ${id?`<button class="btn ghost sm" data-action="author-del" data-id="${t.id}"><i data-lucide="trash-2"></i>Удалить</button>`:''}
    </div>
  `);
}

/* ================================================================
   ПРОВЕРКА (ручная для файловых/развёрнутых)
================================================================ */
function pageCheck(){
  const me = currentUser();
  if (me.role!=='teacher'){
    // для ученика — мои решения на проверке
    const mine = getX.attemptsByStudent(me.id).filter(a=>a.manual).sort((a,b)=>b.ts-a.ts);
    return `${pageHead('Мои решения на проверке', 'Развёрнутые ответы, которые проверяет учитель.')}
    <section class="card rise">
      ${mine.length ? mine.map(a=>{
        const t = getX.taskById(a.taskId); if(!t) return '';
        const status = a.isCorrect===null?'<span class="chip c2">ждёт</span>':a.isCorrect?'<span class="chip c1">верно</span>':'<span class="chip c3">неверно</span>';
        return `<div class="trow"><span class="idx"></span>
          <div class="t-main"><div class="t-name">№${t.num}. ${t.statement.split('\n')[0].slice(0,80)}</div>
          <div class="t-sub">${new Date(a.ts).toLocaleString('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})} · балл: ${a.score||'—'}</div></div>
          ${status}
        </div>`;
      }).join('') : `<div class="empty"><i data-lucide="inbox"></i>Ничего не отправлено.</div>`}
    </section>`;
  }
  const pending = getX.attemptsPending();
  const recent = DB.attempts.filter(a=>a.manual && a.isCorrect!==null).sort((a,b)=>b.ts-a.ts).slice(0,5);
  return `
  ${pageHead('Проверка', `${pending.length} работ ждут проверки. Откройте, прочитайте решение, поставьте балл и напишите комментарий.`)}
  <section class="card rise">
    <div class="sec-head"><div class="sec-title">Очередь проверки</div><span class="leader"></span>
      <span class="chip c2">${pending.length}</span></div>
    ${pending.length ? pending.map(a=>{
      const t = getX.taskById(a.taskId); const s = getX.userById(a.studentId); if(!t||!s) return '';
      return `<div class="trow hoverable" data-action="open-check" data-id="${a.id}">
        <div class="ava" style="background:${s.color};width:32px;height:32px;font-size:11px">${s.initials}</div>
        <div class="t-main"><div class="t-name">№${t.num} — ${first(s.name)}</div>
        <div class="t-sub">${t.topic} · отправлено ${new Date(a.ts).toLocaleString('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div></div>
        <span class="chip c2">ожидает</span>
      </div>`;
    }).join('') : `<div class="empty"><i data-lucide="check"></i>Очередь пуста — все проверено!</div>`}
  </section>
  ${recent.length ? `<section class="card rise" style="margin-top:22px">
    <div class="sec-head"><div class="sec-title">Недавно проверено</div><span class="leader"></span></div>
    ${recent.map(a=>{
      const t = getX.taskById(a.taskId); const s = getX.userById(a.studentId); if(!t||!s) return '';
      const cls = a.isCorrect?'c1':'c3';
      return `<div class="trow">
        <div class="ava" style="background:${s.color};width:32px;height:32px;font-size:11px">${s.initials}</div>
        <div class="t-main"><div class="t-name">№${t.num} — ${first(s.name)}</div>
        <div class="t-sub">балл: ${a.score}/${getX.taskTypeByNum(t.num).maxScore} · ${a.comment?('«'+a.comment.slice(0,60)+'»'):''}</div></div>
        <span class="chip ${cls}">${a.isCorrect?'верно':'неверно'}</span>
      </div>`;
    }).join('')}
  </section>`:''}`;
}
function openCheck(attemptId){
  const a = DB.attempts.find(x=>x.id===attemptId); if(!a) return;
  const t = getX.taskById(a.taskId); const s = getX.userById(a.studentId); if(!t||!s) return;
  const tt = getX.taskTypeByNum(t.num);
  openModal(`
    <div class="tm-head">
      <div class="ava" style="background:${s.color}">${s.initials}</div>
      <div><div class="t-name" style="font-size:15px">${s.name}</div>
      <div class="t-sub">№${t.num} · ${tt.title}</div></div>
      <button class="icon-btn" data-action="modal-close" style="margin-left:auto"><i data-lucide="x"></i></button>
    </div>
    <div class="tm-q md">${md(t.statement)}</div>
    <div class="sec-title" style="margin:14px 0 6px">Ответ ученика</div>
    <pre class="md" style="background:var(--card-2);border:1.5px solid var(--line);border-radius:14px;padding:14px 16px;white-space:pre-wrap;font-family:var(--mono);font-size:13.5px;line-height:1.5;max-height:300px;overflow:auto">${(a.answer||'').replace(/</g,'&lt;')}</pre>
    <div class="form-grid" style="margin-top:14px">
      <div><label class="f">Балл (0–${tt.maxScore})</label>
        <input id="ch-score" type="number" class="inp" min="0" max="${tt.maxScore}" value="${a.score||0}" step="1"></div>
      <div><label class="f">Вердикт</label>
        <select id="ch-verdict" class="inp">
          <option value="true" ${a.isCorrect===true?'selected':''}>Верно</option>
          <option value="false" ${a.isCorrect===false?'selected':''}>Неверно</option>
          <option value="null" ${a.isCorrect===null?'selected':''}>Отложить</option>
        </select></div>
    </div>
    <label class="f">Комментарий ученику <span class="f-hint">— как красная ручка на полях</span></label>
    <textarea id="ch-comment" class="inp" rows="4" placeholder="Например: Забыли инициализировать переменную s=0 перед циклом.">${a.comment||''}</textarea>
    <div class="tm-actions">
      <button class="btn" data-action="check-save" data-id="${a.id}"><i data-lucide="save"></i>Сохранить оценку</button>
      <span class="flex-sp"></span>
      <button class="btn ghost sm" data-action="show-explanation" data-id="${t.id}">Показать разбор</button>
    </div>
    <div id="tm-expl" hidden style="margin-top:16px">
      <div class="sec-title">Разбор</div>
      <div class="md" style="background:var(--card-2);border:1.5px solid var(--line);border-radius:14px;padding:14px 16px;margin-top:8px">${md(t.explanation||'')}</div>
    </div>
  `,'lg');
}

/* ================================================================
   СТАТИСТИКА (учитель)
================================================================ */
function pageStats(){
  const students = getX.students();
  // матрица ученик × номер задания
  const matrix = students.map(s=>{
    const row = {student:s, cells:{}};
    for (let n=1;n<=16;n++){
      const att = getX.attemptsByStudent(s.id).filter(a=>{
        const t = getX.taskById(a.taskId); return t && t.num===n;
      });
      const correct = att.filter(a=>a.isCorrect===true).length;
      const pending = att.filter(a=>a.isCorrect===null).length;
      const wrong = att.filter(a=>a.isCorrect===false).length;
      row.cells[n] = att.length ? {pct:Math.round(correct/att.length*100), correct, total:att.length, pending, wrong} : null;
    }
    return row;
  });
  return `
  ${pageHead('Статистика по классу', 'Таблица «ученик × номер задания» с цветовой подсветкой. Зелёный — уверенно, жёлтый — средне, красный — слабо.')}
  <section class="card rise" style="overflow-x:auto">
    <table class="matrix">
      <thead><tr><th style="text-align:left;padding-left:12px">Ученик</th>
      ${Array.from({length:16},(_,i)=>`<th>${i+1}</th>`).join('')}
      <th>Σ</th></tr></thead>
      <tbody>
        ${matrix.map(r=>{
          const total = Object.values(r.cells).filter(Boolean).reduce((a,c)=>a+c.total,0);
          const correct = Object.values(r.cells).filter(Boolean).reduce((a,c)=>a+c.correct,0);
          const avg = total ? Math.round(correct/total*100) : 0;
          return `<tr>
            <td class="name">${r.student.name}</td>
            ${Array.from({length:16},(_,i)=>{
              const c = r.cells[i+1];
              if (!c) return `<td><span class="cell none">—</span></td>`;
              const cls = c.pending && !c.correct && !c.wrong ? 'wait' :
                c.pct>=80?'good':c.pct>=50?'mid':'bad';
              return `<td><span class="cell ${cls}" title="Верно ${c.correct} из ${c.total}, на проверке ${c.pending}">${c.pct}%</span></td>`;
            }).join('')}
            <td><span class="cell ${avg>=80?'good':avg>=50?'mid':'bad'}">${avg||'—'}${avg?'%':''}</span></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </section>
  <section class="card rise" style="margin-top:22px">
    <div class="sec-head"><div class="sec-title">Слабые места класса</div><span class="leader"></span></div>
    ${(() => {
      // по каждому номеру — средний % по классу
      const byNum = [];
      for (let n=1;n<=16;n++){
        const cells = matrix.map(r=>r.cells[n]).filter(Boolean);
        if (cells.length){
          const avg = Math.round(cells.reduce((a,c)=>a+c.pct,0)/cells.length);
          byNum.push({n, avg, count:cells.length});
        }
      }
      byNum.sort((a,b)=>a.avg-b.avg);
      return byNum.slice(0,5).map(b=>`<div class="kv">
        <span class="chip c1">№${b.n}</span>
        <span style="flex:1">${getX.taskTypeByNum(b.n).title}</span>
        ${meter(b.avg,100, b.avg<50?'red':b.avg<80?'amber':'')}
        <b>${b.avg}%</b>
      </div>`).join('') || '<div class="empty">Недостаточно данных.</div>';
    })()}
  </section>`;
}

/* ================================================================
   УЧЕНИКИ И РОДИТЕЛИ (привязка)
================================================================ */
function pagePeople(){
  const me = currentUser();
  if (me.role!=='teacher') return '<div class="card">Доступ только для учителя.</div>';
  const students = getX.students();
  const parents = getX.parents();
  return `
  ${pageHead('Ученики и родители', 'Управление пользователями и привязкой родителей к ученикам.',
    `<button class="btn sm" data-action="user-new"><i data-lucide="user-plus"></i>Новый пользователь</button>`)}
  <div class="grid main-grid">
    <section class="card rise">
      <div class="sec-head"><div class="sec-title">Ученики (${students.length})</div><span class="leader"></span></div>
      ${students.map(s=>{
        const parent = DB.users.find(u=>(u.childIds||[]).includes(s.id));
        const att = getX.attemptsByStudent(s.id);
        const correct = att.filter(a=>a.isCorrect===true).length;
        const pct = att.length?Math.round(correct/att.length*100):0;
        return `<div class="trow">
          <div class="ava" style="background:${s.color};width:34px;height:34px;font-size:12px">${s.initials}</div>
          <div class="t-main"><div class="t-name">${s.name}</div>
          <div class="t-sub">${s.grade} класс · ${att.length} попыток · ${pct}% верных${parent?(' · родитель: '+first(parent.name)):''}</div></div>
          <div class="pub-acts">
            <button class="icon-btn" data-action="user-edit" data-id="${s.id}" title="Редактировать"><i data-lucide="pencil"></i></button>
            <button class="icon-btn" data-action="user-del" data-id="${s.id}" title="Удалить"><i data-lucide="trash-2"></i></button>
          </div>
        </div>`;
      }).join('')}
    </section>
    <section class="card rise" style="animation-delay:.06s">
      <div class="sec-head"><div class="sec-title">Родители (${parents.length})</div><span class="leader"></span></div>
      ${parents.map(p=>{
        const children = (p.childIds||[]).map(id=>getX.userById(id)).filter(Boolean);
        return `<div class="trow">
          <div class="ava" style="background:${p.color};width:34px;height:34px;font-size:12px">${p.initials}</div>
          <div class="t-main"><div class="t-name">${p.name}</div>
          <div class="t-sub">дети: ${children.length?children.map(c=>first(c.name)).join(', '):'— нет —'}</div></div>
          <div class="pub-acts">
            <button class="icon-btn" data-action="user-edit" data-id="${p.id}" title="Редактировать"><i data-lucide="pencil"></i></button>
            <button class="icon-btn" data-action="user-del" data-id="${p.id}" title="Удалить"><i data-lucide="trash-2"></i></button>
          </div>
        </div>`;
      }).join('')}
    </section>
  </div>`;
}
function openUserEditor(id){
  const u = id ? getX.userById(id) : {id:'', role:'student', name:'', color:'#39708A'};
  const isParent = u.role==='parent';
  const students = getX.students();
  openModal(`
    <div class="tm-head"><div class="sec-title">${id?'Редактировать пользователя':'Новый пользователь'}</div>
      <button class="icon-btn" data-action="modal-close" style="margin-left:auto"><i data-lucide="x"></i></button></div>
    <div class="form-grid">
      <div><label class="f">Роль</label>
        <select id="u-role" class="inp">
          <option value="student" ${u.role==='student'?'selected':''}>Ученик</option>
          <option value="parent" ${u.role==='parent'?'selected':''}>Родитель</option>
          <option value="teacher" ${u.role==='teacher'?'selected':''}>Учитель</option>
        </select></div>
      <div><label class="f">Цвет аватара</label>
        <input id="u-color" type="color" class="inp" value="${u.color||'#39708A'}" style="height:44px;padding:4px"></div>
    </div>
    <label class="f">Имя</label>
    <input id="u-name" class="inp" value="${u.name||''}" placeholder="Имя Фамилия">
    ${u.role==='student'||true ? `<label class="f">Класс (для ученика)</label>
    <input id="u-grade" type="number" class="inp" value="${u.grade||9}" min="1" max="11">`:''}
    ${isParent ? `<div class="sec-title" style="margin:14px 0 6px">Дети (привязка)</div>
    <div style="max-height:200px;overflow-y:auto;border:1.5px solid var(--line);border-radius:14px;padding:6px 10px">
      ${students.map(s=>`<label class="trow" style="cursor:pointer;padding:8px 4px">
        <input type="checkbox" data-action="user-child-toggle" data-id="${s.id}" ${(u.childIds||[]).includes(s.id)?'checked':''} style="width:18px;height:18px">
        <div class="ava" style="background:${s.color};width:30px;height:30px;font-size:11px">${s.initials}</div>
        <div class="t-main"><div class="t-name" style="font-size:14px">${s.name}</div><div class="t-sub">${s.grade} класс</div></div>
      </label>`).join('')}
    </div>`:''}
    <div class="tm-actions">
      <button class="btn" data-action="user-save" data-id="${u.id}"><i data-lucide="save"></i>Сохранить</button>
      ${id?`<button class="btn ghost sm" data-action="user-del" data-id="${u.id}"><i data-lucide="trash-2"></i>Удалить</button>`:''}
    </div>
  `);
}

/* ================================================================
   НАСТРОЙКИ (справочник типов + экспорт/импорт)
================================================================ */
function pageSettings(){
  const me = currentUser();
  if (me.role!=='teacher'){
    return `${pageHead('Настройки', 'Тема и данные.')}
    <section class="card rise">
      <div class="sec-title">Внешний вид</div>
      <div class="kv"><span>Тема</span><span class="flex-sp"></span>
        <button class="btn ghost sm" data-action="theme-toggle"><i data-lucide="${session.theme==='dark'?'sun':'moon'}"></i>${session.theme==='dark'?'Светлая':'Тёмная'}</button>
      </div>
    </section>`;
  }
  return `
  ${pageHead('Настройки', 'Справочник типов заданий и управление данными.')}
  <section class="card rise">
    <div class="sec-head"><div class="sec-title">Справочник типов заданий ОГЭ</div><span class="leader"></span>
      <button class="btn ghost sm" data-action="type-edit" data-num=""><i data-lucide="plus"></i>Добавить</button></div>
    <div class="thead"><span style="flex:0 0 50px">№</span><span style="flex:1">Название</span><span style="flex:1">Тема</span><span style="flex:0 0 120px">Формат</span><span style="flex:0 0 80px">Макс.балл</span><span style="width:80px;text-align:right">Действия</span></div>
    ${DB.taskTypes.map(tt=>`<div class="trow">
      <span class="hand" style="flex:0 0 50px;font-size:20px;color:var(--red)">${tt.num}</span>
      <div class="t-main" style="flex:1"><div class="t-name" style="font-size:13.5px">${tt.title}</div></div>
      <span style="flex:1;font-size:13px;color:var(--muted)">${tt.topic}</span>
      <span style="flex:0 0 120px"><span class="chip c4">${formatLabel(tt.format)}</span></span>
      <span style="flex:0 0 80px;font-weight:700">${tt.maxScore}</span>
      <span style="width:80px;text-align:right">
        <button class="icon-btn" data-action="type-edit" data-num="${tt.num}"><i data-lucide="pencil"></i></button>
      </span>
    </div>`).join('')}
  </section>
  <div class="grid main-grid" style="margin-top:22px">
    <section class="card rise">
      <div class="sec-head"><div class="sec-title">Экспорт данных</div><span class="leader"></span></div>
      <div class="sub-sm" style="margin-bottom:14px">Скачайте все данные (пользователи, задания, варианты, попытки, теорию) в один JSON-файл.</div>
      <button class="btn" data-action="export-json"><i data-lucide="download"></i>Экспортировать в JSON</button>
    </section>
    <section class="card rise" style="animation-delay:.06s">
      <div class="sec-head"><div class="sec-title">Импорт данных</div><span class="leader"></span></div>
      <div class="sub-sm" style="margin-bottom:14px">Загрузите ранее сохранённый JSON. Текущие данные будут <b>заменены</b>.</div>
      <input type="file" id="import-file" class="inp" accept="application/json" style="margin-bottom:10px">
      <button class="btn red" data-action="import-json"><i data-lucide="upload"></i>Импортировать</button>
    </section>
  </div>
  <section class="card rise" style="margin-top:22px">
    <div class="sec-head"><div class="sec-title">Сброс</div><span class="leader"></span></div>
    <div class="sub-sm" style="margin-bottom:14px">Вернуть все данные к демонстрационным. Это удалит ваши изменения.</div>
    <button class="btn red sm" data-action="reset-data"><i data-lucide="rotate-ccw"></i>Сбросить к демо-данным</button>
  </section>
  <section class="card rise" style="margin-top:22px">
    <div class="sec-head"><div class="sec-title">Внешний вид</div><span class="leader"></span></div>
    <div class="kv"><span>Тема</span><span class="flex-sp"></span>
      <button class="btn ghost sm" data-action="theme-toggle"><i data-lucide="${session.theme==='dark'?'sun':'moon'}"></i>${session.theme==='dark'?'Светлая':'Тёмная'}</button>
    </div>
  </section>`;
}
function openTypeEditor(num){
  const tt = num ? getX.taskTypeByNum(+num) : {num:DB.taskTypes.length+1, title:'', topic:'', format:'number', maxScore:1, theoryHidden:false, theory:''};
  openModal(`
    <div class="tm-head"><div class="sec-title">${num?'Редактировать тип №'+num:'Новый тип задания'}</div>
      <button class="icon-btn" data-action="modal-close" style="margin-left:auto"><i data-lucide="x"></i></button></div>
    <div class="form-grid">
      <div><label class="f">Номер (1–16)</label>
        <input id="t-num" type="number" class="inp" min="1" max="20" value="${tt.num}"></div>
      <div><label class="f">Максимальный балл</label>
        <input id="t-max" type="number" class="inp" min="1" max="10" value="${tt.maxScore}"></div>
    </div>
    <label class="f">Название</label>
    <input id="t-title" class="inp" value="${tt.title}" placeholder="например, Количественные параметры объектов">
    <label class="f">Тема</label>
    <input id="t-topic" class="inp" value="${tt.topic}" placeholder="например, Кодирование информации">
    <label class="f">Формат ответа</label>
    <select id="t-format" class="inp">
      <option value="number" ${tt.format==='number'?'selected':''}>число</option>
      <option value="text" ${tt.format==='text'?'selected':''}>слово/текст</option>
      <option value="sequence" ${tt.format==='sequence'?'selected':''}>последовательность цифр</option>
      <option value="file" ${tt.format==='file'?'selected':''}>файл/текст решения (ручная проверка)</option>
    </select>
    <label class="f" style="display:flex;align-items:center;gap:10px;cursor:pointer;margin-top:14px">
      <input type="checkbox" id="t-hidden" ${tt.theoryHidden?'checked':''} style="width:18px;height:18px">
      <span>Скрыть теорию от учеников (пока не готова)</span>
    </label>
    <div class="tm-actions">
      <button class="btn" data-action="type-save" data-num="${tt.num}"><i data-lucide="save"></i>Сохранить</button>
    </div>
  `);
}

/* ================================================================
   ДИСПЕТЧЕР ДЕЙСТВИЙ
================================================================ */
const actions = {
  /* вход */
  'pick-role': d => { session.roleTab = d.role; saveSession(); renderLogin(); },
  'login': () => doLogin(),
  'quick': d => { const r=d.role; const u=DB.users.find(x=>x.role===r); if (u) enter(r, u.id); },
  'logout': () => { session.userId=null; saveSession(); renderLogin(); toast('Вы вышли из тетради.'); },
  'nav': d => go(d.page),
  'theme-toggle': () => setTheme(session.theme==='dark'?'light':'dark'),
  'view-child': d => { session.parentChildId = d.id; go('childprogress'); },

  /* теория */
  'open-theory': d => { session.theoryNum = +d.num; go('theory'); },
  'theory-list': () => { session.theoryNum = null; go('theory'); },
  'theory-edit': d => openTheoryEditor(+d.num),
  'theory-from-task': d => { closeModal(); session.theoryNum = +d.num; go('theory'); },
  'theory-mark-read': d => { saveX.markTheory(currentUser().id, +d.num); toast('Теория отмечена прочитанной.'); renderPage(); },
  'go-solve': d => { session.theoryNum = null; session.bankNum = String(d.num); go('bank'); },
  'go-solve-anyway': d => { session.theoryNum = null; session.bankNum = String(d.num); go('bank'); toast('Теория не прочитана — но решать можно.', 'warn'); },
  'theory-save': d => {
    const tt = getX.taskTypeByNum(+d.num); if(!tt) return;
    tt.theory = $('#th-text').value;
    tt.theoryVideo = $('#th-video').value;
    const fileInp = $('#th-file');
    if (fileInp && fileInp.files && fileInp.files[0]){
      if (fileInp.files[0].size > 500*1024){ toast('Файл теории слишком большой (макс. 500 КБ).','err'); return; }
      const reader = new FileReader();
      reader.onload = () => { tt.theoryImage = reader.result; saveX.taskType(tt); };
      reader.readAsDataURL(fileInp.files[0]);
    } else { saveX.taskType(tt); }
    tt.theoryHidden = $('#th-hidden').checked; saveX.taskType(tt);
    closeModal(); renderPage();
    toast('Теория сохранена.');
  },
  'theory-preview': () => { const txt = $('#th-text').value; $('#th-prev').innerHTML = `<div class="md" style="background:var(--card-2);border:1.5px solid var(--line);border-radius:14px;padding:14px 16px">${md(txt)}</div>`; icons(); },

  /* банк */
  'bank-filter': (d, el) => {
    const k = el.dataset.k==='num'?'bankNum':el.dataset.k==='topic'?'bankTopic':'bankSource';
    session[k] = el.dataset.v;
    saveSession(); renderPage();
  },
  'bank-import': () => {
    openModal(`<div class="tm-head"><div class="sec-title">Импорт заданий из JSON</div>
      <button class="icon-btn" data-action="modal-close" style="margin-left:auto"><i data-lucide="x"></i></button></div>
      <div class="sub-sm" style="margin-bottom:10px">Формат: массив заданий с полями <code>num, source, topic, statement, answer, explanation, difficulty, fipiId</code>. Существующие задания не удаляются.</div>
      <input type="file" id="bi-file" class="inp" accept="application/json" style="margin-bottom:10px">
      <button class="btn" data-action="bank-import-do"><i data-lucide="upload"></i>Импортировать</button>
      <pre class="md" style="margin-top:14px;background:var(--card-2);border-radius:12px;padding:10px 12px;font-size:12px">[
  {
    "num": 1,
    "source": "fipi",
    "topic": "Кодирование",
    "statement": "...",
    "answer": "12",
    "explanation": "...",
    "difficulty": 1,
    "fipiId": "FIPI-1-XXX"
  }
]</pre>`);
  },
  'bank-import-do': () => {
    const inp = $('#bi-file');
    if (!inp.files || !inp.files[0]){ toast('Выберите файл.','warn'); return; }
    const r = new FileReader();
    r.onload = () => {
      try {
        const arr = JSON.parse(r.result);
        if (!Array.isArray(arr)) throw new Error('JSON должен быть массивом');
        let added = 0;
        arr.forEach(t => {
          if (typeof t.num !== 'number' || !t.statement) return;
          DB.tasks.push({
            id: uid('q'), num: t.num, source: t.source||'fipi', topic: t.topic||'',
            difficulty: t.difficulty||1, fipiId: t.fipiId||'',
            statement: t.statement, answer: t.answer||'', explanation: t.explanation||'',
            image: t.image||''
          });
          added++;
        });
        saveDB(); closeModal(); renderPage();
        toast(`Импортировано заданий: ${added}.`);
      } catch(e){ toast('Ошибка импорта: '+e.message, 'err'); }
    };
    r.readAsText(inp.files[0]);
  },

  /* задание: решение */
  'open-task': d => openTask(d.id),
  'open-task-variant': d => { session.curVariant = d.variant; openTask(d.id); },
  'check-answer': d => checkAnswer(d.id),
  'show-explanation': () => { const e=$('#tm-expl'); if(e) e.hidden=false; },

  /* варианты */
  'variant-new': () => openVariantEditor(''),
  'variant-edit': d => openVariantEditor(d.id),
  'variant-view': d => openVariantView(d.id),
  'variant-del': d => {
    if (!confirm('Удалить вариант?')) return;
    saveX.delVariant(d.id); renderPage(); toast('Вариант удалён.','warn');
  },
  'variant-toggle': () => { const c = $$('#v-tasks input[type=checkbox]').filter(x=>x.checked).length;
    const e=$('#v-count'); if(e) e.textContent = 'Выбрано: '+c; },
  'variant-autofill': () => {
    // выбрать по одному случайному заданию на каждый номер, который есть в банке
    const byNum = {};
    DB.tasks.forEach(t=>{ if(!byNum[t.num]) byNum[t.num]=[]; byNum[t.num].push(t); });
    const ids = [];
    Object.keys(byNum).forEach(n=>{ const arr=byNum[n]; ids.push(arr[Math.floor(Math.random()*arr.length)].id); });
    $$('#v-tasks input[type=checkbox]').forEach(cb=>{ cb.checked = ids.includes(cb.dataset.id); });
    actions['variant-toggle']();
    toast('Выбрано по одному заданию на каждый номер.');
  },
  'variant-save': d => {
    const name = $('#v-name').value.trim(); if (!name){ toast('Введите название.','warn'); return; }
    const taskIds = $$('#v-tasks input[type=checkbox]').filter(x=>x.checked).map(x=>x.dataset.id);
    const v = {
      id: d.id || uid('v'),
      name,
      taskIds,
      deadline: $('#v-deadline').value,
      examMode: $('#v-exam').checked,
      timerMin: +$('#v-timer').value || 0
    };
    saveX.variant(v);
    closeModal(); renderPage();
    toast(d.id ? 'Вариант обновлён.' : 'Вариант создан.');
  },
  'variant-assign': d => openAssignModal(d.id),
  'assign-toggle': () => {},
  'assign-save': d => {
    const variantId = d.variant;
    const deadline = $('#as-deadline').value;
    const checked = $$('.modal input[type=checkbox][data-action="assign-toggle"]').filter(x=>x.checked).map(x=>x.dataset.id);
    // удалить назначения, которых нет в checked
    DB.assignments = DB.assignments.filter(a => !(a.variantId===variantId && !checked.includes(a.studentId)));
    // добавить недостающие
    checked.forEach(sid => {
      if (!DB.assignments.find(a=>a.variantId===variantId && a.studentId===sid)){
        saveX.assignment({id:uid('a'), variantId, studentId:sid, deadline, startedAt:null, finishedAt:null});
      } else {
        // обновить дедлайн
        const a = DB.assignments.find(a=>a.variantId===variantId && a.studentId===sid);
        a.deadline = deadline; saveX.assignment(a);
      }
    });
    saveDB(); closeModal(); renderPage();
    toast(`Вариант назначен ${checked.length} ученикам.`);
  },
  'start-variant': d => openVariantRunner(d.id),
  'variant-finish': d => {
    const a = getX.assignmentById(d.id); if(!a) return;
    a.finishedAt = nowTs(); saveX.assignment(a);
    closeModal(); renderPage();
    toast('Вариант завершён.');
  },
  'solve-random': d => {
    const list = getX.tasksByNum(+d.num);
    if (!list.length){ toast('Заданий этого типа нет в банке.','warn'); return; }
    const t = list[Math.floor(Math.random()*list.length)];
    openTask(t.id);
  },

  /* авторские */
  'author-new': () => openAuthorEditor(''),
  'author-edit': d => openAuthorEditor(d.id),
  'author-del': d => {
    if (!confirm('Удалить авторское задание?')) return;
    saveX.delTask(d.id); renderPage(); toast('Задание удалено.','warn');
  },
  'author-save': d => {
    const num = +$('#a-num').value;
    const title = $('#a-statement').value.trim();
    if (!title){ toast('Введите условие задания.','warn'); return; }
    const t = {
      id: d.id || uid('q'),
      num,
      source: 'author',
      topic: $('#a-topic').value.trim() || getX.taskTypeByNum(num).topic,
      difficulty: state.curDiff || 1,
      fipiId: $('#a-fipi').value.trim(),
      statement: $('#a-statement').value,
      answer: $('#a-answer').value.trim(),
      explanation: $('#a-explanation').value,
      image: $('#a-image').value.trim()
    };
    saveX.task(t);
    closeModal(); renderPage();
    toast(d.id ? 'Задание обновлено.' : 'Авторское задание создано.');
  },
  'set-diff': (d, el) => {
    state.curDiff = +d.n;
    const parent = el.closest('.diff-pick');
    if (parent) parent.querySelectorAll('.dpick').forEach((b,idx)=>b.classList.toggle('on', idx < state.curDiff));
  },

  /* проверка */
  'open-check': d => openCheck(d.id),
  'check-save': d => {
    const a = DB.attempts.find(x=>x.id===d.id); if(!a) return;
    const v = $('#ch-verdict').value;
    a.isCorrect = v==='null' ? null : (v==='true');
    a.score = +$('#ch-score').value;
    a.comment = $('#ch-comment').value.trim();
    saveX.attempt(a);
    closeModal(); renderPage();
    toast('Оценка сохранена.');
  },

  /* пользователи */
  'user-new': () => openUserEditor(''),
  'user-edit': d => openUserEditor(d.id),
  'user-del': d => {
    if (!confirm('Удалить пользователя?')) return;
    saveX.delUser(d.id); renderPage(); toast('Пользователь удалён.','warn');
  },
  'user-save': d => {
    const name = $('#u-name').value.trim();
    if (!name){ toast('Введите имя.','warn'); return; }
    const role = $('#u-role').value;
    const u = {
      id: d.id || uid(role[0]),
      role,
      name,
      initials: initials(name),
      color: $('#u-color').value
    };
    if (role==='student'){ u.grade = +$('#u-grade').value; }
    if (role==='parent'){
      u.childIds = $$('.modal input[type=checkbox][data-action="user-child-toggle"]').filter(x=>x.checked).map(x=>x.dataset.id);
    }
    saveX.user(u);
    closeModal(); renderPage();
    toast(d.id ? 'Пользователь обновлён.' : 'Пользователь добавлен.');
  },

  /* типы заданий */
  'type-edit': d => openTypeEditor(d.num),
  'type-save': d => {
    const num = +$('#t-num').value;
    if (num < 1 || num > 20){ toast('Номер должен быть от 1 до 20.','warn'); return; }
    const tt = getX.taskTypeByNum(num) || {num, theory:'', theoryHidden:false};
    tt.num = num;
    tt.title = $('#t-title').value.trim() || `Задание ${num}`;
    tt.topic = $('#t-topic').value.trim();
    tt.format = $('#t-format').value;
    tt.maxScore = +$('#t-max').value;
    tt.theoryHidden = $('#t-hidden').checked;
    saveX.taskType(tt);
    closeModal(); renderPage();
    toast('Тип задания сохранён.');
  },

  /* экспорт/импорт/сброс */
  'export-json': () => {
    const data = exportAll();
    const blob = new Blob([data], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `informatics-oge-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Данные экспортированы.');
  },
  'import-json': () => {
    const inp = $('#import-file');
    if (!inp.files || !inp.files[0]){ toast('Выберите файл.','warn'); return; }
    if (!confirm('Импорт заменит все текущие данные. Продолжить?')) return;
    const r = new FileReader();
    r.onload = () => {
      try { importAll(r.result); closeModal(); renderPage(); toast('Данные импортированы.'); }
      catch(e){ toast('Ошибка: '+e.message, 'err'); }
    };
    r.readAsText(inp.files[0]);
  },
  'reset-data': () => {
    if (!confirm('Сбросить все данные к демо?')) return;
    DB = JSON.parse(JSON.stringify(DB_DEFAULTS)); saveDB();
    renderApp(); toast('Данные сброшены к демо.','warn');
  },

  /* модалка */
  'modal-close': () => { closeModal(); if(currentUser()) renderPage(); }
};

/* делегирование событий */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  // для чекбоксов/радио/инпутов не блокируем дефолтное поведение — иначе они не переключаются
  const tag = el.tagName.toLowerCase();
  if (tag==='input' || tag==='select' || tag==='textarea' || tag==='label'){
    const fn = actions[el.dataset.action];
    if (fn) fn(el.dataset, el);
    return;
  }
  const fn = actions[el.dataset.action];
  if (fn){ e.preventDefault(); fn(el.dataset, el); }
});

/* ---------- boot ---------- */
loadDB();
loadSession();
if (currentUser()){
  renderApp();
} else {
  renderLogin();
}