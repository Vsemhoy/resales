import React, { useEffect, useState } from "react";
import TextArea from "antd/es/input/TextArea";
import { Modal, Table } from "antd";

const DataParser = ({ openModal, closeModal, addParseModels, models }) => {
    const [value, setValue] = useState("");
    const [hashModels, setHashModels] = useState({});
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

    // Создаем быстрый поиск моделей
    /*useEffect(() => {
        if (models && models.length > 0) {
            const map = {};
            models.forEach(model => {
                const modelNameSeo = model.name?.toLowerCase().replace(/\s/g, "");
                map[modelNameSeo] = model.id;
            });
            setHashModels(map);
        }
    }, [models]);*/
    useEffect(() => {
        if (models && models.length > 0) {
            const map = {};
            models.forEach(model => {
                if (!model.name) return;
                // 1. удаляем пробелы → 2. lowercase → 3. транслит омографов
                const cleanName = model.name.replace(/\s+/g, '').toLowerCase();
                const seoName = translitHomoglyphs(cleanName);
                map[seoName] = model.id;
            });
            setHashModels(map);
        }
    }, [models]);

    // Поиск модели по названию
    /*const getModelName = (name) => {
        if (!models || models.length === 0) return null;

        if (!isNaN(name) && name !== '') {
            return null;
        }

        name = name.toString().trim();
        if (name.length <= 1) return null;

        let nameLower = name.toLowerCase().replace(/\s/g, "");
        let trname = nameLower;

        Object.entries(replace_alphabet).forEach(([cyrillic, latin]) => {
            trname = trname.replace(new RegExp(cyrillic, "ig"), latin);
        });

        if (hashModels[nameLower]) {
            const id = hashModels[nameLower];
            return models.find(m => m.id === id) ?? null;
        }

        return null;
    };*/
    const getModelName = (name) => {
        if (!models || models.length === 0) return null;

        if (!isNaN(name) && name !== '') {
            return null;
        }

        name = name.toString().trim();
        if (name.length <= 1) return null;

        let cleanName = name.toLowerCase().replace(/\s+/g, '');
        let trname = translitHomoglyphs(cleanName);

        if (hashModels[trname]) {
            const id = hashModels[trname];
            return models.find(m => m.id === id) ?? null;
        }

        if (hashModels[cleanName]) {
            const id = hashModels[cleanName];
            return models.find(m => m.id === id) ?? null;
        }

        return null;
    };

    function generateUUID() {
        // Проверяем поддержку
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }

        // Fallback: кастомная реализация UUID v4 (RFC 4122)
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Парсим строку
    const findModel = (line, index) => {
        const cleaned = line.trim().replace(/[^A-Za-zА-Яа-я0-9Ёё_\-*\(\),.]/g, " ");

        if (!cleaned) return null;

        const parts = cleaned.split(" ");

        const mod = {
            errorname: true,
            key: generateUUID(), // вместо crypto.randomUUID()
            num: index + 1,
            name: "",
            count: 1,
            id: 0,
            currency: 0,
        };

        parts.forEach((value, i) => {

            if (i > 0 && !isNaN(parseInt(value))) {
                mod.count = parseInt(value);
            }

            const model = getModelName(value);

            if (model) {
                mod.name = model.name;
                mod.errorname = false;
                mod.id = model.id;
                mod.currency = model.currency;
            } else if (!mod.name) {
                mod.name = value;
            }
        });

        return mod;
    };

    // Обработчик ввода
    const onChange = (e) => {
        const val = e.target.value;
        setValue(val);

        if (!val) {
            setAddition([]);
            return;
        }

        const lines = val.split("\n");

        // ВАЖНО: передаем index вручную
        const parsed = lines
            .map((line, index) => findModel(line, index))
            .filter(Boolean);

        setAddition(parsed);
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
            render: (name, record) =>
                record.id ? (
                    <span>{name}</span>
                ) : (
                    <span style={{ background: "red", color: "white", padding: "0 4px" }}>
                        {name}
                    </span>
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
