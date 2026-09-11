import fs from 'node:fs/promises';
import path from 'node:path';
import { Presentation, PresentationFile } from 'file:///C:/Users/mma/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';

const W = 1280, H = 720;
const OUT = 'C:/NodeStack/resales2/output/presentations';
const RENDER = 'C:/NodeStack/resales2/tmp/presentations/ai-kp-plan/rendered';
const HERO = 'C:/NodeStack/resales2/tmp/presentations/ai-kp-plan/assets/hero.png';
const PPTX = `${OUT}/plan-vnedreniya-ai-v-kp.pptx`;

const C = {
  ink: '#111827', text: '#334155', muted: '#64748B', faint: '#94A3B8',
  line: '#D9E2EC', panel: '#F5F8FB', blue: '#3D8DFF', cyan: '#6DCBF4',
  pale: '#EAF5FF', navy: '#123A68', green: '#17845B', greenPale: '#EAF8F2',
  amber: '#B66512', amberPale: '#FFF4E5', red: '#B43C45', redPale: '#FFF0F1', white: '#FFFFFF'
};

const p = Presentation.create({ slideSize: { width: W, height: H } });

function box(slide, x, y, w, h, fill = C.white, line = C.line, radius = 'rounded-xl') {
  return slide.shapes.add({ geometry: 'roundRect', position: { left:x, top:y, width:w, height:h }, fill,
    line: { style:'solid', fill:line, width:1 }, borderRadius: radius });
}

function rect(slide, x, y, w, h, fill) {
  return slide.shapes.add({ geometry:'rect', position:{left:x,top:y,width:w,height:h}, fill,
    line:{style:'solid',fill:'none',width:0} });
}

function text(slide, value, x, y, w, h, size=18, color=C.text, bold=false, align='left', valign='top') {
  const s = slide.shapes.add({ geometry:'textbox', position:{left:x,top:y,width:w,height:h}, fill:'none',
    line:{style:'solid',fill:'none',width:0} });
  s.text = value;
  s.text.style = { fontFamily:'Arial', fontSize:size, color, bold, alignment:align, verticalAlignment:valign };
  return s;
}

function rule(slide, x, y, w, color=C.line, h=2) { rect(slide,x,y,w,h,color); }

function base(title, kicker, n) {
  const s = p.slides.add(); s.background.fill = C.white;
  rect(s,0,0,12,H,C.blue);
  text(s,kicker.toUpperCase(),64,38,760,20,12,C.blue,true);
  text(s,title,64,66,1120,58,34,C.ink,true);
  rule(s,64,132,1152,C.line,1);
  text(s,String(n).padStart(2,'0'),1160,676,54,18,11,C.faint,true,'right');
  return s;
}

function note(slide, lines=[]) {
  const sources = lines.length ? lines.map(x=>`- ${x}`).join('\n') : '- Внутренняя постановка задачи и рабочие примеры заказчика.';
  slide.speakerNotes.textFrame.setText(`[Sources]\n${sources}\n[/Sources]`);
}

function label(slide, value, x, y, w, fill=C.pale, color=C.navy) {
  box(slide,x,y,w,30,fill,fill,'rounded-lg');
  text(slide,value,x+10,y+6,w-20,17,12,color,true,'center','middle');
}

function bullet(slide, title, body, x, y, w, accent=C.blue) {
  rect(slide,x,y+5,5,52,accent);
  text(slide,title,x+18,y,w-18,25,17,C.ink,true);
  text(slide,body,x+18,y+27,w-18,42,14,C.muted,false);
}

function metric(slide, value, caption, x, y, w, color=C.blue) {
  text(slide,value,x,y,w,48,32,color,true);
  text(slide,caption,x,y+48,w,42,14,C.muted,false);
}

// 1 — cover
{
  const s = p.slides.add(); s.background.fill = C.white;
  const bytes = await fs.readFile(HERO);
  s.images.add({ blob: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), contentType:'image/png',
    alt:'Поток писем, спецификаций и чертежей преобразуется в коммерческое предложение', fit:'cover',
    position:{left:0,top:0,width:W,height:H} });
  rect(s,0,0,600,H,'#FFFFFFE8'); rect(s,0,0,12,H,C.blue);
  label(s,'СТРАТЕГИЯ • 2026',64,58,188,C.pale,C.navy);
  text(s,'Автоматизация\nобложек и описаний КП',64,130,505,160,46,C.ink,true);
  text(s,'Четыре варианта решения и поэтапный план внедрения AI в рабочий процесс',64,316,470,88,21,C.text,false);
  rule(s,64,438,220,C.blue,5);
  text(s,'Главный принцип',64,470,180,24,13,C.blue,true);
  text(s,'Сначала данные и контроль качества.\nПотом — автоматизация решений.',64,500,430,64,21,C.navy,true);
  text(s,'Рабочая концепция для обсуждения',64,650,360,20,12,C.faint,false);
  note(s,['Внутренняя постановка задачи и рабочие примеры заказчика.','AI-generated visual, OpenAI ImageGen, 2026-08-28.']);
}

// 2 — executive summary
{
  const s = base('Рекомендация: идти ступенями, а не прыгать сразу в «полный AI»','Короткий вывод',2);
  box(s,64,166,1152,104,C.navy,C.navy,'rounded-xl');
  text(s,'Надёжная автоматизация возможна только после появления таксономии систем, библиотеки изображений, карточек оборудования и размеченных примеров.',92,192,1088,54,23,C.white,true,'center','middle');
  const xs=[64,352,640,928];
  const titles=['Сейчас','Параллельно','После данных','Затем'];
  const bodies=['Статичная универсальная обложка — без ошибок и ожидания дизайнеров.','Собрать источники, роли, словарь назначений и эталонные КП.','Запустить весовой классификатор и измерить точность на истории.','Подключить AI-анализ писем и файлов, генерацию текста и обложек.'];
  xs.forEach((x,i)=>{ box(s,x,306,256,226,i===0?C.greenPale:C.panel,C.line); label(s,`${i+1}`,x+20,326,42,i===0?C.greenPale:C.pale,i===0?C.green:C.blue); text(s,titles[i],x+20,372,216,28,20,C.ink,true); text(s,bodies[i],x+20,414,216,96,15,C.text,false); });
  text(s,'Так мы получаем пользу сразу и не превращаем проект в шестимесячное ожидание ресурсов.',64,578,1152,38,21,C.navy,true,'center');
  note(s);
}

// 3 — input chaos
{
  const s = base('Исходные данные не образуют единого технического задания','Почему задача сложнее, чем выбор картинки',3);
  const items=[
    ['«Дайте подбор!»','Одно предложение без назначения, состава и ограничений.'],
    ['«Подберите замену»','Спецификация может быть текстом, сканом или картинкой — иногда без количества.'],
    ['Чертёж с расстановкой','PDF, JPEG или DWG; обозначения, слои и качество отличаются.'],
    ['Голая спецификация','Перечень позиций ещё не объясняет сценарий использования системы.']
  ];
  items.forEach((it,i)=>{ const x=64+(i%2)*576, y=166+Math.floor(i/2)*174; box(s,x,y,544,142,C.panel,C.line); label(s,`${i+1}`,x+22,y+20,46,C.pale,C.blue); text(s,it[0],x+86,y+20,430,28,20,C.ink,true); text(s,it[1],x+86,y+58,430,60,15,C.text,false); });
  box(s,64,530,1152,88,C.amberPale,C.amberPale);
  text(s,'Ключевое ограничение',88,550,190,20,13,C.amber,true);
  text(s,'AI может извлечь и сопоставить присутствующие факты, но не может восстановить отсутствующие требования без риска выдумать их.',286,544,900,48,19,C.ink,true);
  note(s,['Внутренняя выборка типов заявок и файлов, предоставленная заказчиком.']);
}

// 4 — object name
{
  const s = base('Название объекта отвечает на вопрос «где», но не «что строим»','Классификация назначения',4);
  box(s,64,166,560,384,C.panel,C.line);
  text(s,'Примеры поля «Объект»',88,190,500,26,18,C.ink,true);
  const examples=['Стоматологическая поликлиника №2','Корякская окружная больница','Административно-бытовой комплекс','Фабрика по переработке углей','Капитальный ремонт общежития'];
  examples.forEach((v,i)=>{ label(s,v,88,236+i*55,488,C.white,C.text); });
  text(s,'Один и тот же объект может требовать СОУЭ, трансляцию, конференц-связь, фоновую музыку или несколько систем одновременно.',88,520,490,44,14,C.muted,false);
  text(s,'≠',650,300,70,80,54,C.blue,true,'center','middle');
  box(s,736,166,480,384,C.pale,C.pale);
  text(s,'Назначение системы определяется сочетанием:',766,194,420,50,19,C.navy,true);
  bullet(s,'Состава оборудования','Модели, категории, количества, бренды и совместимость.',766,266,410,C.blue);
  bullet(s,'Контекста заявки','Формулировки в письмах, ТЗ, схемах, примечаниях.',766,348,410,C.cyan);
  bullet(s,'Инженерных признаков','Топология, зоны, каналы, мощность, резервирование.',766,430,410,C.navy);
  box(s,736,574,480,54,C.navy,C.navy); text(s,'Поле «Объект» — лишь слабый дополнительный сигнал',756,590,440,22,16,C.white,true,'center');
  note(s,['Внутренняя выборка названий объектов, предоставленная заказчиком.']);
}

// 5 — matrix
{
  const s = base('Четыре варианта — от мгновенного компромисса до AI-платформы','Карта решений',5);
  const cols=[64,330,500,670,840,1010]; const widths=[266,170,170,170,170,206];
  const headers=['Вариант','Запуск','Автоматизация','Точность','Зависимость','Вывод'];
  headers.forEach((h,i)=>{ rect(s,cols[i],162,widths[i],46,C.navy); text(s,h,cols[i]+10,175,widths[i]-20,20,13,C.white,true,i? 'center':'left','middle'); });
  const rows=[
    ['1. Ручной выбор','6+ мес.','Низкая','Высокая*','Дизайнеры','Понятно, но долго'],
    ['2. Веса + библиотека','2 + 6 мес.','Средняя','Низкая–средняя','Данные + дизайн','Проверяемая база'],
    ['3. Статичная обложка','Сразу','Нет','Стабильная','Нет','Лучший быстрый шаг'],
    ['4. AI-анализатор','После 2','Высокая','Растёт с данными','ML + разметка','Стратегическая цель']
  ];
  rows.forEach((r,ri)=>{ const y=208+ri*78; const fill=ri===2?C.greenPale:(ri===3?C.pale:(ri%2?C.white:C.panel)); r.forEach((v,i)=>{ rect(s,cols[i],y,widths[i],78,fill); rule(s,cols[i],y+77,widths[i],C.line,1); text(s,v,cols[i]+10,y+19,widths[i]-20,42,i===0?15:14,ri===2&&i===5?C.green:C.text,i===0||i===5,i?'center':'left','middle'); }); });
  text(s,'* При наличии готовой и правильно выбранной менеджером иллюстрации.',64,548,600,22,12,C.faint,false);
  box(s,64,586,1152,52,C.navy,C.navy); text(s,'Вариант 3 закрывает сегодняшний риск. Вариант 4 — отдельная программа цифровизации, а не «ещё одна функция PDF».',84,601,1112,24,17,C.white,true,'center');
  note(s);
}

// 6 — option 1
{
  const s = base('Вариант 1. Дизайнерская библиотека + ручной выбор','Ручной сценарий',6);
  label(s,'ДИЗАЙНЕРЫ',64,168,180,C.pale,C.navy); text(s,'→',258,164,50,38,26,C.blue,true,'center'); label(s,'БИБЛИОТЕКА',318,168,180,C.pale,C.navy); text(s,'→',512,164,50,38,26,C.blue,true,'center'); label(s,'МЕНЕДЖЕР',572,168,180,C.pale,C.navy); text(s,'→',766,164,50,38,26,C.blue,true,'center'); label(s,'КП',826,168,120,C.greenPale,C.green);
  box(s,64,240,552,292,C.panel,C.line); text(s,'Что потребуется',88,266,500,28,20,C.ink,true);
  bullet(s,'Набор обложек','По брендам, назначениям и композициям.',88,318,480,C.blue);
  bullet(s,'Каталог с превью','Понятные имена, фильтры и правила использования.',88,398,480,C.cyan);
  bullet(s,'Время менеджера','Каждое КП требует осознанного ручного выбора.',88,478,480,C.navy);
  box(s,648,240,568,292,C.redPale,C.redPale); text(s,'Ограничение ресурса',672,266,520,28,20,C.red,true);
  metric(s,'≈ 6+ месяцев','ожидание доступности дизайнеров и выпуска библиотеки',672,318,230,C.red);
  text(s,'Сценарий не зависит от качества AI, но полностью зависит от наличия визуалов и дисциплины выбора.',672,424,500,70,18,C.ink,true);
  box(s,64,570,1152,62,C.amberPale,C.amberPale); text(s,'Подходит как контролируемый ручной процесс — но не решает задачу «менеджер не должен думать и выбирать».',88,588,1104,30,18,C.amber,true,'center');
  note(s);
}

// 7 — option 2
{
  const s = base('Весовая классификация по спецификации','Вариант 2 • алгоритмическая автоматизация',7);
  const nodes=[['Спецификация','Модели • бренды • количество'],['Веса оборудования','P(назначение | позиция)'],['Сумма и правила','Сигналы + ограничения'],['Обложка','Бренд × назначение']];
  nodes.forEach((n,i)=>{ const x=64+i*282; if(i<3) text(s,'→',x+246,212,36,42,26,C.blue,true,'center'); box(s,x,174,244,118,i===3?C.greenPale:C.panel,C.line); text(s,n[0],x+18,194,208,26,18,C.ink,true,'center'); text(s,n[1],x+18,232,208,34,13,C.muted,false,'center'); });
  box(s,64,330,720,220,C.pale,C.pale); text(s,'Минимальная модель данных',88,352,680,26,19,C.navy,true);
  const data=['Справочник назначений и типов систем','Категория, бренд и модель каждой позиции','Матрица весов: позиция → назначение','Правила конфликтов, пороги уверенности','Библиотека обложек с такой же разметкой'];
  data.forEach((v,i)=>{ text(s,'•',92,392+i*29,18,20,16,C.blue,true); text(s,v,116,391+i*29,620,22,15,C.text,false); });
  box(s,816,330,400,220,C.amberPale,C.amberPale); text(s,'Оценка',840,352,350,26,19,C.amber,true);
  metric(s,'≈ 2 месяца','алгоритм, интерфейсы разметки и первичная настройка',840,394,330,C.amber);
  metric(s,'6+ месяцев','создание обложек и коллажей дизайнерами',840,474,330,C.red);
  box(s,64,584,1152,54,C.navy,C.navy); text(s,'Точность будет ограниченной: одинаковый состав может использоваться в разных сценариях, а часть ТЗ отсутствует.',84,600,1112,22,17,C.white,true,'center');
  note(s);
}

// 8 — option 3
{
  const s = base('Вариант 3. Одна абстрактная обложка','Быстрое решение',8);
  box(s,64,166,500,404,C.navy,C.navy);
  text(s,'ОДИН\nВИЗУАЛ',96,204,300,102,38,C.white,true);
  rect(s,96,338,372,8,C.cyan); rect(s,96,364,290,8,C.blue); rect(s,96,390,212,8,C.white);
  text(s,'Нейтральная композиция без привязки к конкретному оборудованию и назначению.',96,452,400,72,19,C.white,false);
  text(s,'Почему это разумно сейчас',616,174,560,34,24,C.ink,true);
  bullet(s,'Запуск без ожидания','Не зависит от дизайнерской очереди и разметки.',616,238,560,C.green);
  bullet(s,'Нулевая ошибка выбора','Нельзя поставить «не ту» систему или чужой бренд.',616,326,560,C.blue);
  bullet(s,'Стабильный фирменный стиль','КП выглядит единообразно на всех сценариях.',616,414,560,C.cyan);
  box(s,616,516,560,72,C.greenPale,C.greenPale); text(s,'Рекомендуемый базовый вариант\nдо готовности данных и библиотеки визуалов',640,530,512,48,19,C.green,true,'center');
  note(s);
}

// 9 — option 4
{
  const s = base('AI-анализатор контекста — отдельная платформа','Вариант 4',9);
  const stages=[['01','Вход','Письма, PDF, JPEG, DWG, таблицы'],['02','Понимание','OCR, структура, сущности, схемы'],['03','Классификация','Назначение + вероятность + пробелы'],['04','Генерация','Обложка, описание, состав решения'],['05','Контроль','Факты, бренды, уверенность, человек']];
  stages.forEach((a,i)=>{ const x=64+i*230; box(s,x,172,206,246,i===4?C.greenPale:C.panel,C.line); label(s,`${i+1}`,x+18,190,42,i===4?C.greenPale:C.pale,i===4?C.green:C.blue); text(s,a[1],x+18,240,170,28,19,C.ink,true); text(s,a[2],x+18,282,170,84,15,C.text,false); if(i<4) text(s,'→',x+206,270,24,40,22,C.blue,true,'center'); });
  box(s,64,456,1152,98,C.redPale,C.redPale); text(s,'Необходимое правило безопасности',88,476,300,22,14,C.red,true); text(s,'Если данных недостаточно или уверенность ниже порога — система не «угадывает», а формирует список вопросов и отправляет заявку инженеру.',88,506,1080,34,19,C.ink,true);
  text(s,'AI снижает ручную работу только там, где факты реально присутствуют в переписке и файлах.',64,590,1152,30,20,C.navy,true,'center');
  note(s,['PaddleOCR-VL: https://www.paddleocr.ai/main/en/version3.x/algorithm/PaddleOCR-VL/PaddleOCR-VL-1.6.html','Docling supported formats: https://docling-project.github.io/docling/usage/supported_formats/','Qwen3-VL: https://github.com/QwenLM/Qwen3-VL']);
}

// 10 — architecture
{
  const s = base('Архитектура AI-конвейера','Несколько моделей • единая проверяемая схема',10);
  const y1=178, y2=358;
  const row1=[['Приём данных','Почта • CRM • файлы'],['Документы','OCR • таблицы • layout'],['CAD / схемы','DWG → DXF • слои • символы'],['Нормализация','Единый JSON заявки']];
  row1.forEach((a,i)=>{ const x=64+i*282; box(s,x,y1,246,116,C.panel,C.line); text(s,a[0],x+18,y1+20,210,26,18,C.ink,true,'center'); text(s,a[1],x+18,y1+58,210,30,13,C.muted,false,'center'); if(i<3) text(s,'→',x+246,y1+39,36,36,24,C.blue,true,'center'); });
  text(s,'↓',600,300,80,38,28,C.blue,true,'center');
  const row2=[['Поиск фактов','RAG + каталог'],['Классификатор','Веса + LLM/VLM'],['Генераторы','Текст + композиция'],['Верификатор','Пороги + человек']];
  row2.forEach((a,i)=>{ const x=64+i*282; box(s,x,y2,246,116,i===3?C.greenPale:C.pale,i===3?C.greenPale:C.pale); text(s,a[0],x+18,y2+20,210,26,18,C.navy,true,'center'); text(s,a[1],x+18,y2+58,210,30,13,C.text,false,'center'); if(i<3) text(s,'→',x+246,y2+39,36,36,24,C.blue,true,'center'); });
  box(s,64,520,1152,94,C.navy,C.navy); text(s,'Кандидаты технологий',88,540,220,22,14,C.cyan,true); text(s,'PaddleOCR-VL / Docling  •  Qwen3-VL  •  BGE-M3  •  Grounding DINO  •  ODA + ezdxf  •  Qwen3  •  ComfyUI + FLUX/Qwen Image',88,570,1080,28,15,C.white,true,'center');
  note(s,['PaddleOCR-VL: https://www.paddleocr.ai/main/en/version3.x/algorithm/PaddleOCR-VL/PaddleOCR-VL-1.6.html','DoclingDocument: https://docling-project.github.io/docling/concepts/docling_document/','BGE-M3: https://github.com/FlagOpen/FlagEmbedding/blob/master/docs/source/bge/bge_m3.rst','Grounding DINO: https://github.com/IDEA-Research/GroundingDINO','ezdxf: https://ezdxf.readthedocs.io/_/downloads/en/master/pdf/']);
}

// 11 — image workflow
{
  const s = base('Генерация обложки: оборудование должно оставаться настоящим','Визуальный конвейер',11);
  box(s,64,166,1152,94,C.redPale,C.redPale); text(s,'Нельзя',88,185,100,22,14,C.red,true); text(s,'Просить модель заново нарисовать оборудование: она меняет логотипы, кнопки, порты, пропорции и создаёт несуществующие изделия.',182,180,1006,54,19,C.ink,true);
  const flow=[['Фото товара','Оригинал из каталога'],['Маска','Удаление фона'],['Коллаж','Шаблон + композиция'],['AI-слой','Фон, свет, тени'],['Финал','Лого и текст поверх']];
  flow.forEach((a,i)=>{ const x=64+i*230; box(s,x,304,206,144,i===4?C.greenPale:C.panel,C.line); label(s,String(i+1),x+18,322,38,i===4?C.greenPale:C.pale,i===4?C.green:C.blue); text(s,a[0],x+18,368,170,24,18,C.ink,true,'center'); text(s,a[1],x+18,402,170,24,13,C.muted,false,'center'); if(i<4) text(s,'→',x+206,352,24,38,22,C.blue,true,'center'); });
  box(s,64,492,560,112,C.pale,C.pale); text(s,'Материалы для пилота',88,514,510,22,18,C.navy,true); text(s,'Фото каждого блока оборудования + не менее 100 эталонных готовых композиций.',88,550,500,38,17,C.text,true);
  box(s,656,492,560,112,C.panel,C.line); text(s,'Что обучаем',680,514,510,22,18,C.ink,true); text(s,'Несколько стилевых LoRA и правила композиции — не отдельную модель на каждую систему.',680,550,500,38,17,C.text,true);
  note(s,['ComfyUI: https://github.com/Comfy-Org/ComfyUI','FLUX.1 Kontext workflow: https://docs.comfy.org/tutorials/partner-nodes/black-forest-labs/flux-1-kontext','Qwen Image Edit: https://qwenlm.github.io/blog/qwen-image-edit/','Hugging Face Diffusers LoRA: https://huggingface.co/docs/diffusers/training/lora']);
}

// 12 — text generation
{
  const s = base('Описание системы: факты из базы, смысл и стиль — от модели','Генерация текста',12);
  const left=[['Каталог и БД','Характеристики, совместимость, бренды'],['Заявка','Назначение, ограничения, объект'],['RAG','Только найденные подтверждённые факты']];
  left.forEach((a,i)=>{ const y=174+i*112; box(s,64,y,330,86,C.panel,C.line); text(s,a[0],84,y+16,290,23,17,C.ink,true); text(s,a[1],84,y+46,290,25,13,C.muted,false); });
  text(s,'→',420,298,70,48,34,C.blue,true,'center');
  box(s,502,204,300,282,C.pale,C.pale); text(s,'Языковая модель',530,232,244,28,21,C.navy,true,'center');
  label(s,'СТРУКТУРА',548,292,208,C.white,C.blue); label(s,'КОРПОРАТИВНЫЙ СТИЛЬ',548,338,208,C.white,C.blue); label(s,'3–5 ВАРИАНТОВ',548,384,208,C.white,C.blue);
  text(s,'LoRA учит манере письма.\nФакты не «зашиваются» в LoRA.',530,432,244,42,14,C.text,true,'center');
  text(s,'→',828,298,70,48,34,C.blue,true,'center');
  box(s,910,174,306,344,C.greenPale,C.greenPale); text(s,'Проверенный результат',934,198,258,28,20,C.green,true,'center');
  bullet(s,'Описание назначения','Без выдуманных характеристик.',934,254,250,C.green);
  bullet(s,'Состав решения','Ссылки на позиции и источники.',934,334,250,C.blue);
  bullet(s,'Стоп-сигналы','Недостающие данные и вопросы.',934,414,250,C.red);
  box(s,64,566,1152,60,C.navy,C.navy); text(s,'Данные обучения: 100–200 примеров — концепт; 500–1000 — стабильный стиль; тысячи — широкое покрытие сценариев.',84,584,1112,28,17,C.white,true,'center');
  note(s,['Qwen3 training / LoRA: https://github.com/QwenLM/Qwen3/blob/main/docs/source/training/ms_swift.md']);
}

// 13 — workload
{
  const s = base('Работа не исчезает — она переносится в данные и контроль','Организационная модель',13);
  const roles=[
    ['Владелец продукта','Определяет сценарии, метрики и допустимый риск.'],
    ['Инженеры','Утверждают таксономию, веса, правила и эталоны.'],
    ['Data / контент','Размечает историю, изображения, модели и назначения.'],
    ['Дизайнеры','Создают эталонные композиции и визуальные правила.'],
    ['ML / разработка','Строит конвейер, модели, мониторинг и интерфейсы.'],
    ['Менеджеры','Исправляют ошибки и тем самым создают обратную связь.']
  ];
  roles.forEach((r,i)=>{ const x=64+(i%3)*384,y=166+Math.floor(i/3)*168; box(s,x,y,352,140,i===0?C.pale:C.panel,C.line); label(s,`${i+1}`,x+20,y+18,42,i===0?C.white:C.pale,i===0?C.navy:C.blue); text(s,r[0],x+78,y+18,250,26,18,C.ink,true); text(s,r[1],x+20,y+62,310,58,14,C.text,false); });
  box(s,64,526,1152,100,C.amberPale,C.amberPale); text(s,'Скрытая стоимость проекта',88,548,240,22,14,C.amber,true); text(s,'Разметка и поддержание справочников — постоянный бизнес-процесс. Без ответственных владельцев точность будет деградировать даже при хороших моделях.',330,542,850,54,19,C.ink,true);
  note(s);
}

// 14 — hardware
{
  const s = base('Инфраструктура: от пилота до производственного контура','Модели и железо',14);
  const tiers=[
    ['ПИЛОТ','RTX 5090 • 32 GB VRAM','128 GB RAM • 4 TB NVMe','OCR, embeddings, 8B VLM/LLM, LoRA и изображения — последовательно.'],
    ['СЕРЬЁЗНАЯ СТАНЦИЯ','RTX PRO 6000 • 96 GB','256 GB ECC RAM','Крупнее модели, больше контекста, стабильная локальная эксплуатация.'],
    ['МАСШТАБ','2× RTX PRO 6000 • 192 GB','512 GB RAM • Threadripper Pro','Параллельные сервисы, обучение и высокая пропускная способность.']
  ];
  tiers.forEach((t,i)=>{ const x=64+i*384; box(s,x,166,352,356,i===0?C.pale:C.panel,C.line); label(s,t[0],x+24,190,180,i===0?C.white:C.pale,i===0?C.navy:C.blue); text(s,t[1],x+24,250,304,54,22,C.ink,true); text(s,t[2],x+24,316,304,30,16,C.blue,true); rule(s,x+24,364,304,C.line,1); text(s,t[3],x+24,390,304,96,15,C.text,false); });
  box(s,64,562,1152,66,C.navy,C.navy); text(s,'Для проверки идеи достаточно пилотной машины. Покупать масштаб до подтверждения качества классификации — преждевременно.',84,580,1112,30,18,C.white,true,'center');
  note(s,['NVIDIA GeForce RTX 5090: https://marketplace.nvidia.com/en-us/consumer/graphics-cards/geforce-rtx-5090-founders-edition/','NVIDIA RTX PRO 6000: https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-6000/','AMD Threadripper PRO 9995WX: https://www.amd.com/en/products/processors/workstations/ryzen-threadripper/9000-wx-series/amd-ryzen-threadripper-pro-9995wx.html','AI Toolkit FLUX LoRA FAQ: https://github.com/ostris/ai-toolkit/blob/main/FAQ.md']);
}

// 15 — roadmap
{
  const s = base('План внедрения: каждая стадия должна доказать ценность следующей','Дорожная карта',15);
  const phases=[
    ['0','Сейчас','Статичная обложка','1–5 дней',C.green],
    ['1','0–1 мес.','Инвентаризация данных','Роли • таксономия • метрики',C.blue],
    ['2','1–3 мес.','Весовой классификатор','История • веса • offline-тест',C.blue],
    ['3','3–5 мес.','AI-пилот','Почта • OCR • файлы • confidence',C.navy],
    ['4','5–9+ мес.','Контент и генерация','100+ композиций • тексты • A/B',C.navy]
  ];
  rule(s,112,244,1040,C.line,6);
  phases.forEach((a,i)=>{ const x=64+i*230; box(s,x,178,206,276,C.white,C.line); rect(s,x,178,206,8,a[4]); label(s,a[0],x+18,200,38,a[4]===C.green?C.greenPale:C.pale,a[4]); text(s,a[1],x+70,205,112,20,13,C.muted,true,'right'); text(s,a[2],x+18,266,170,54,18,C.ink,true); text(s,a[3],x+18,338,170,54,14,C.text,false); text(s,i===0?'ЗАПУСК':'GATE',x+18,408,170,18,11,a[4],true,'center'); });
  box(s,64,500,1152,112,C.pale,C.pale); text(s,'Условия перехода к следующей стадии',88,522,340,26,19,C.navy,true);
  text(s,'✓ Есть владелец данных   ✓ Согласована таксономия   ✓ Измерена точность   ✓ Определён порог ручной проверки   ✓ Подтверждена экономия времени',88,566,1080,28,16,C.text,true,'center');
  note(s);
}

// 16 — decision
{
  const s = base('Что предлагается утвердить','Решение',16);
  box(s,64,166,736,424,C.navy,C.navy);
  text(s,'РЕШЕНИЕ НА СЕЙЧАС',92,194,300,22,13,C.cyan,true);
  text(s,'Запустить статичную обложку\nи подготовку данных для пилота',92,236,640,94,32,C.white,true);
  const decisions=['Назначить владельца таксономии систем','Выделить исторические заявки и итоговые КП','Согласовать метрики: точность, время, доля ручной проверки','Не заказывать массовый дизайн до проверки классификации'];
  decisions.forEach((v,i)=>{ label(s,'✓',92,362+i*48,36,C.greenPale,C.green); text(s,v,144,367+i*48,620,28,16,C.white,i===3); });
  box(s,832,166,384,196,C.greenPale,C.greenPale); text(s,'Быстрый эффект',858,190,330,22,14,C.green,true); text(s,'Единый вид КП\nбез ошибок выбора',858,232,330,68,27,C.ink,true,'center');
  box(s,832,394,384,196,C.pale,C.pale); text(s,'Стратегический эффект',858,418,330,22,14,C.blue,true); text(s,'Платформа, которая понимает заявку, объясняет решение и знает предел своей уверенности.',858,460,330,84,20,C.navy,true,'center');
  text(s,'Следующий шаг: 2-недельный аудит данных и дизайн пилота.',64,626,1152,28,20,C.blue,true,'center');
  note(s);
}

await fs.mkdir(OUT,{recursive:true}); await fs.mkdir(RENDER,{recursive:true});
for (const [i,s] of p.slides.items.entries()) {
  const stem=`slide-${String(i+1).padStart(2,'0')}`;
  const png=await p.export({slide:s,format:'png',scale:1});
  await fs.writeFile(path.join(RENDER,`${stem}.png`),new Uint8Array(await png.arrayBuffer()));
  const layout=await s.export({format:'layout'});
  await fs.writeFile(path.join(RENDER,`${stem}.layout.json`),await layout.text());
}
const montage=await p.export({format:'webp',montage:true,scale:1});
await fs.writeFile(path.join(RENDER,'montage.webp'),new Uint8Array(await montage.arrayBuffer()));
const pptx=await PresentationFile.exportPptx(p); await pptx.save(PPTX);
console.log(JSON.stringify({pptx:PPTX,slides:p.slides.items.length,render:RENDER}));
