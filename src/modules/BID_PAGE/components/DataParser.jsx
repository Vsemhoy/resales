import React, { useEffect, useState, useCallback } from "react";
import TextArea from "antd/es/input/TextArea";
import { Table } from "antd";

const DataParser = ({ models, additionData, setAdditionData }) => {
    const [value, setValue] = useState("");

    const replace_alfabet = {
        'а': 'a',
        'в': 'b',
        'с': 'c',
        'д': 'd',
        'е': 'e',
        'н': 'h',
        'к': 'k',
        'м': 'm',
        'о': 'o',
        'р': 'p',
        'т': 't',
        'х': 'x',
    };

    // Функция для получения имени (первого слова в верхнем регистре)
    const getName = (str) => {
        let name = '';
        const splited = str.trim().split(" ")
        for (let i = 0; i < splited.length; i++) {
            if (isNaN(splited[i]) && splited[i] !== '-') {
                name += splited[i] + ' ';
            } else {
                break;
            }
        }
        return name.trim();
    };

    // Функция для получения количества (число в конце строки или 1 по умолчанию)
    const getCount = (str) => {
        console.log('test')
        const parts = str.trim().split(" ");

        let numberStr = 1;
        for (let i = parts.length - 1; i >= 0; i--) {
            if (!isNaN(Number(parts[i]))) {
                numberStr = parts[i];
            }
        }

        return numberStr;
    };

    // Получение id модели по имени
    const getModelId = (searchName) => {
        const model = models.find((model) => model.name.toLowerCase() === searchName.toLowerCase());
        if (model && model.id) {
            return model.id;
        } else {
            if (searchName.includes('-')) {
                const formattedName = searchName.replace(/-/g, '- ');
                const model2 = models.find((model) => model.name.toLowerCase() === formattedName.toLowerCase());
                if (model2 && model2.id) {
                    return model2.id;
                } else {
                    return null;
                }
            }
        }
    }
    const getModelName = (searchName) => {
        const model =  models.find((model) => model.name.toLowerCase() === searchName.toLowerCase());
        if (model && model.name) {
            return model.name;
        } else {
            return null;
        }
    }
    const getModelNameV2 = (name) => {
        // Проверяем, что models существует и не пустой
        if (!models || models.length === 0) {
            console.warn('Models array is empty or not defined');
            return '';
        }

        // Проверка на число
        if (!isNaN(name) && name !== '') return '';

        // Очистка и проверка длины
        name = name.toString().trim();
        if (name.length <= 1) {
            return '';
        }

        let nameLower = name.toLowerCase().replace(/\s/g, "");
        let trname = nameLower;

        // Транслитерация символов
        Object.entries(replace_alfabet).forEach(([cyrillic, latin]) => {
            trname = trname.replace(new RegExp(cyrillic, 'ig'), latin);
        });

        // Поиск в моделях
        for (let i = 0; i < models.length; i++) {
            let modelNameSeo = models[i].name?.toLowerCase().replace(/\s/g, "");

            if (!modelNameSeo) continue; // Пропускаем если нет name_seo

            if (modelNameSeo === nameLower || modelNameSeo === trname) {
                return models[i];
            }

            // Дополнительная проверка: если имя содержит часть названия модели
            if (nameLower.includes(modelNameSeo) || modelNameSeo.includes(nameLower)) {
                return models[i];
            }
        }

        console.log('Model not found');
        return '';
    };
    const findModel = (line, index) => {
        let l = line.trim();
        l = l.replace(/[^A-Za-zА-Яа-я0-9Ёё_\-*\(\),.]/g, " ");

        if ( l !== '') {
            let part = l.split(' ');
            let mod = {
                errorname: true,
                errorcount: false,

                key: 0,
                num: 0,
                name: '',
                count: 0,
                id: 0,
                currency: 0,
            };

            part.forEach((value, key) => {

                if (key > 0 && !isNaN(parseInt(value)) ) {
                    mod.count = parseInt(value);
                    mod.errorcount = false
                }

                let name = getModelNameV2(value);
                if ( name !== '') {
                    mod.name = name.name;
                    mod.errorname = false;
                    mod.id = name.id;
                    mod.num = index + 1;
                    mod.key = index;
                    mod.currency = getModelCurrency(name);
                }

            });
            return mod;
        }
    }
    const getModelCurrency = (name) => models.find((model) => model.name === name)?.currency;
    useEffect(() => {
        if (!value) {
            setAdditionData([]);
            return;
        }

        const lines = value.split("\n");
        const parsedData = lines.map((line, index) => {
            const name = getName(line);
            if (!name) return null;

            return findModel(line, index);

            /*return {
                key: index,
                num: index + 1,
                name: getModelName(name) ? getModelName(name) : name,
                count: getCount(line),
                id: getModelId(name),
                currency: getModelCurrency(name),
            };*/
        }).filter(Boolean);

        setAdditionData(parsedData);
    }, [value, models, setAdditionData]);

    // Обработчик изменения текста
    const onChange = useCallback((e) => {
        setValue(e.target.value);
    }, []);

    const columns = [
        {
            title: "№",
            dataIndex: "num",
            key: "num",
            width: 50,
        },
        {
            title: "Наименование",
            dataIndex: "name",
            key: "name",
            render: (name, record) =>
                record.id ? (
                    <span style={{ padding: "0 4px" }}>{name}</span>
                ) : (
                    <span style={{ background: "red", color: "white", padding: "0 4px" }}>
            {name}
          </span>
                ),
        },
        {
            title: "Количество",
            dataIndex: "count",
            key: "count",
            width: 100,
        },
    ];

    return (
        <div className={'dataParser__container'}>
            <div className={'dataParser__container__text'}>
                <TextArea
                    rows={32}
                    value={value}
                    onChange={onChange}
                    placeholder="Вставьте сюда данные из имеющегося документа"
                />
            </div>
            <div className={'dataParser__container__table'}>
                <Table
                    dataSource={additionData.filter(d => d.id !== 0)}
                    columns={columns}
                    size="small"
                    pagination={false}
                    rowKey="key"
                />
            </div>
        </div>
    );
};

export default DataParser;
