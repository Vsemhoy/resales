import React, { useEffect, useMemo, useState } from "react";
import TextArea from "antd/es/input/TextArea";
import { Modal, Table } from "antd";

const DataParser = ({ openModal, closeModal, addParseModels, models }) => {
    const [value, setValue] = useState("");
    const [addition, setAddition] = useState([]);

    const translitHomoglyphs = (str) => {
        const replace_alphabet = {
            'а': 'a', 'А': 'A',
            'в': 'b', 'В': 'B',
            'с': 'c', 'С': 'C',
            'д': 'd', 'Д': 'D',
            'е': 'e', 'Е': 'E',
            'н': 'h', 'Н': 'H',
            'к': 'k', 'К': 'K',
            'м': 'm', 'М': 'M',
            'о': 'o', 'О': 'O',
            'р': 'p', 'Р': 'P',
            'т': 't', 'Т': 'T',
            'х': 'x', 'Х': 'X',
            'у': 'y', 'У': 'Y',
            'ё': 'e', 'Ё': 'E',
        };

        return str.replace(/[авсдеhкмопртхуёАВСДЕHКМОПРТХУЁ]/g, char => replace_alphabet[char] || char);
    };

    const normalizeModelName = (name) => translitHomoglyphs(
        name.toString().replace(/&(?:#x20|nbsp);/giu, ' ').replace(/\s+/g, '').toLowerCase(),
    );

    const isOutdatedModel = (model) => Number(model?.type_model) === 2;

    // Индекс хранит и точные ключи, и список для поиска модели внутри строки с количеством.
    const modelIndex = useMemo(() => {
        const exact = new Map();
        const searchable = [];

        (models ?? []).forEach((model) => {
            // API: type_model 0 — актуальная, 1 — архивная, 2 — устаревшая.
            // Устаревшие позиции остаются в общем справочнике, но не должны
            // автоматически подбираться при разборе сырых данных.
            if (!model.name || isOutdatedModel(model)) return;
            const key = normalizeModelName(model.name);
            if (!key || /^\d+$/u.test(key)) return;
            exact.set(key, model);
            searchable.push({ key, model });
        });

        searchable.sort((a, b) => b.key.length - a.key.length);
        return { exact, searchable };
    }, [models]);

    // Поиск модели по названию
    const getModelName = (name) => {
        if (!models || models.length === 0) return null;

        if (!isNaN(name) && name !== '') {
            return null;
        }

        name = name.toString().trim();
        if (name.length <= 1) return null;

        return modelIndex.exact.get(normalizeModelName(name)) ?? null;
    };

    const getModelFromLine = (line) => {
        const normalizedLine = normalizeModelName(line);
        const exactModel = modelIndex.exact.get(normalizedLine);
        if (exactModel) return exactModel;

        return modelIndex.searchable.find(({ key }) => {
            const pattern = [...key].map((char) => char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s*');
            // Не принимать часть другого артикула за точное совпадение.
            return new RegExp(`(?:^|[^a-zа-яё0-9-])${pattern}(?=$|[^a-zа-яё0-9-])`, 'iu')
                .test(translitHomoglyphs(line.toLowerCase()));
        })?.model ?? null;
    };

    const getClosestModel = (line) => {
        const candidates = line.match(/[A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё0-9_/-]*/gu) ?? [];
        let closest = null;
        let bestScore = Infinity;
        candidates.forEach((candidate) => {
            const input = normalizeModelName(candidate);
            if (input.length < 3 || !/\d/u.test(input)) return;
            modelIndex.searchable.forEach(({ key, model }) => {
                // Отсутствующий суффикс исполнения — предполагаемое совпадение,
                // даже когда он длиннее допустимого количества опечаток.
                const baseKey = key.replace(/(?:\([^()]+\))+$/u, '');
                if (baseKey !== key && input === baseKey) {
                    if (bestScore > 0) {
                        closest = model;
                        bestScore = 0;
                    }
                    return;
                }
                const limit = input.length >= 7 ? 2 : 1;
                if (Math.abs(key.length - input.length) > limit) return;
                let previous = Array.from({ length: key.length + 1 }, (_, index) => index);
                for (let i = 1; i <= input.length; i += 1) {
                    const current = [i];
                    for (let j = 1; j <= key.length; j += 1) {
                        current[j] = Math.min(current[j - 1] + 1, previous[j] + 1,
                            previous[j - 1] + (input[i - 1] === key[j - 1] ? 0 : 1));
                    }
                    previous = current;
                }
                const distance = previous[key.length];
                const score = distance / Math.max(input.length, key.length);
                if (distance <= limit && score <= 0.3 && score < bestScore) {
                    closest = model;
                    bestScore = score;
                }
            });
        });
        return closest;
    };

    function generateUUID() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }

        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    const splitModelAndCount = (line) => {
        const countPatterns = [
            /(?:шт\.?|штук(?:а|и)?|ед\.?|pcs?\.?)\s*[:=]?\s*(\d+)\b/iu,
            /(?:^|\s)(\d+)\s*(?:шт\.?|штук(?:а|и)?|ед\.?|pcs?\.?)(?=\s|$|[,;:)])/iu,
            /(?:^|[\s\-–—])(?:x|х|\*)\s*(\d+)\b/iu,
            /(?:^|\s)(\d+)\s*(?:x|х|\*)(?=\s|$)/iu,
            /(?:^|\s)(\d+)\s*$/u,
        ];

        // Удаляем из наименования только тот фрагмент, из которого взяли количество.
        // Цифры в самом артикуле (например, SWS-03) сохраняются.
        for (const pattern of countPatterns) {
            const match = line.match(pattern);
            if (match) return {
                name: `${line.slice(0, match.index)} ${line.slice(match.index + match[0].length)}`.trim(),
                count: parseInt(match[1], 10),
            };
        }

        return { name: line.trim(), count: 1 };
    };

    // Парсим строку
    const findModel = (line, index, forcedCount = null) => {
        const cleaned = line.trim().replace(/[^A-Za-zА-Яа-я0-9Ёё_\-*\(\),.]/g, " ");

        if (!line.trim()) return null;

        const parts = cleaned.split(/\s+/u);
        const matchedModel = getModelFromLine(cleaned);
        const parsedLine = splitModelAndCount(line);

        const mod = {
            errorname: true,
            key: generateUUID(),
            num: index + 1,
            name: parsedLine.name || line.trim(),
            source: line.trim(),
            matchStatus: 'unknown',
            count: forcedCount ?? parsedLine.count,
            id: 0,
            currency: 0,
        };

        if (matchedModel) {
            mod.name = matchedModel.name;
            mod.errorname = false;
            mod.id = matchedModel.id;
            mod.currency = matchedModel.currency;
            mod.matchStatus = 'exact';
            return mod;
        }

        const suggestion = getClosestModel(cleaned);
        if (suggestion) {
            return { ...mod, name: suggestion.name, id: suggestion.id,
                currency: suggestion.currency, errorname: false, matchStatus: 'suggested' };
        }

        parts.forEach((value) => {
            const model = getModelName(value);

            if (model) {
                mod.name = model.name;
                mod.errorname = false;
                mod.id = model.id;
                mod.currency = model.currency;
                mod.matchStatus = 'exact';
            } else if (!mod.name) {
                mod.name = value;
            }
        });

        return mod;
    };

    const isUnit = (line) => /^(?:шт\.?|штук(?:а|и)?|ед\.?|pcs?\.?)$/iu.test(line.trim());
    const isNumber = (line) => /^\d+$/u.test(line.trim());
    const looksLikeModelCode = (line) => /[A-Za-zА-Яа-яЁё]/u.test(line) && /\d/u.test(line);

    const getMeaningfulLines = (rawValue) => rawValue
        .split(/\r?\n/u)
        .flatMap((rawLine) => {
            const decodedLine = rawLine.replace(/&(?:#x20|nbsp);/giu, ' ').trim();
            if (!decodedLine) return [];

            if (decodedLine.includes('|')) {
                return decodedLine
                    .split('|')
                    .map((cell) => cell.trim())
                    .filter((cell) => cell && !/^:?-{3,}:?$/u.test(cell));
            }

            return [decodedLine];
        });

    const parseRawValue = (rawValue) => {
        const lines = getMeaningfulLines(rawValue);
        const parsed = [];
        let pending = [];

        const append = (line, count = null) => {
            const item = findModel(line, parsed.length, count);
            if (item) parsed.push(item);
        };

        for (let index = 0; index < lines.length; index += 1) {
            const line = lines[index];
            const nextLine = lines[index + 1];

            if (isUnit(line) && nextLine && isNumber(nextLine)) {
                const modelLine = [...pending].reverse().find((candidate) => getModelFromLine(candidate));
                // Для неизвестной модели наиболее вероятная ячейка — непосредственно перед единицей.
                const fallbackLine = pending[pending.length - 1];
                if (modelLine || fallbackLine) append(modelLine ?? fallbackLine, parseInt(nextLine, 10));
                pending = [];
                index += 1;
                continue;
            }

            if (isNumber(line)) {
                const modelLine = [...pending].reverse().find((candidate) => getModelFromLine(candidate));
                const fallbackLine = pending[pending.length - 1];
                if (modelLine || (fallbackLine && looksLikeModelCode(fallbackLine))) {
                    append(modelLine ?? fallbackLine, parseInt(line, 10));
                    pending = [];
                    continue;
                }
            }

            pending.push(line);
        }

        // Обычный формат «модель количество» без отдельной ячейки единицы.
        pending.forEach((line) => {
            append(line);
        });

        return parsed.map((item, index) => ({ ...item, num: index + 1 }));
    };

    useEffect(() => {
        setAddition(value ? parseRawValue(value) : []);
    }, [value, modelIndex, openModal]);

    // Обработчик ввода
    const onChange = (e) => {
        const val = e.target.value;
        setValue(val);
    };

    const columns = [
        {
            title: "№",
            dataIndex: "num",
            width: 50,
        },
        {
            title: "Наименование",
            dataIndex: "name",
            render: (name, record) => (
                <div>
                    <span style={record.matchStatus === 'exact' ? undefined : {
                        background: record.matchStatus === 'suggested' ? '#fff7e6' : '#fff1f0',
                        color: record.matchStatus === 'suggested' ? '#ad4e00' : '#cf1322',
                        padding: '0 4px',
                    }}>{name}</span>
                    {record.matchStatus !== 'exact' && (
                        <div style={{ fontSize: 12, color: '#666' }}>
                            {record.matchStatus === 'suggested'
                                ? `Предполагаемая модель. Исходная строка: ${record.source}`
                                : 'Не распознано'}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: "Количество",
            dataIndex: "count",
            width: 100,
        },
    ];

    return (
        <Modal
            title="Анализ сырых данных"
            centered
            width={800}
            open={openModal}
            onOk={() => addParseModels(addition)}
            onCancel={closeModal}
            okText="Добавить в спецификацию"
            cancelText="Отмена"
        >
            <div className="dataParser__container">
                <div className="dataParser__container__text">
                    <TextArea
                        rows={32}
                        value={value}
                        onChange={onChange}
                        placeholder="Вставьте сюда данные из имеющегося документа"
                    />
                </div>
                <div className="dataParser__container__table">
                    <Table
                        dataSource={addition}
                        columns={columns}
                        size="small"
                        pagination={false}
                        rowKey="key"
                    />
                </div>
            </div>
        </Modal>
    );
};

export default DataParser;
