import React, { useEffect, useState, useCallback } from "react";
import TextArea from "antd/es/input/TextArea";
import { Table } from "antd";

const DataParser = ({ models, additionData, setAdditionData }) => {
    const [value, setValue] = useState("");
    const [hashModels, setHashModels] = useState({});
    const replace_alphabet = {
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

    useEffect(() => {
        if (models && models.length > 0) {
            models.forEach(model => {
                setHashModels(prev => {
                    let modelNameSeo = model.name?.toLowerCase().replace(/\s/g, "");
                    let obj = prev;
                    obj[`${modelNameSeo}`] = model.id;
                    return obj;
                });
            });
        }
    }, [models])

    const getModelName = (name) => {
        // Проверяем, что models существует и не пустой
        if (!models || models.length === 0) return null;

        // Проверка на число
        if (!isNaN(name) && name !== '') {
            return null;
        }

        // Очистка и проверка длины
        name = name.toString().trim();
        if (name.length <= 1) {
            return null;
        }

        let nameLower = name.toLowerCase().replace(/\s/g, "");
        let trname = nameLower;

        // Транслитерация символов
        Object.entries(replace_alphabet).forEach(([cyrillic, latin]) => {
            trname = trname.replace(new RegExp(cyrillic, 'ig'), latin);
        });

        if (hashModels[`${nameLower}`]) {
            const modelId = hashModels[`${nameLower}`];
            return models.find((model) => model.id === modelId) ?? null;
        } else {
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
            return null;
        }
    };
    const findModel = (line, index) => {
        const l = line.trim().replace(/[^A-Za-zА-Яа-я0-9Ёё_\-*\(\),.]/g, " ");

        if ( l !== '') {
            const part = l.split(' ');
            const mod = {
                errorname: true,
                /*errorcount: false,*/

                key: 0,
                num: 0,
                name: '',
                count: 1,
                id: 0,
                currency: 0,
            };

            part.forEach((value, key) => {

                if (key > 0 && !isNaN(parseInt(value)) ) {
                    mod.count = parseInt(value);
                    mod.errorcount = false
                }

                let model = getModelName(value);

                if (model) {
                    mod.name = model.name;
                    mod.errorname = false;
                    mod.id = model.id;
                    mod.num = index + 1;
                    mod.key = index;
                    mod.currency = model.currency;
                } else if (!mod.name) {
                    mod.name = value;
                }
            });
            return mod;
        }
    }
    useEffect(() => {
        if (!value) {
            setAdditionData([]);
            return;
        }

        const lines = value.split("\n");
        const parsedData = lines.map((line, index) => {
            return findModel(line, index);
        }).filter(Boolean);

        console.log(parsedData);
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
                    dataSource={additionData} /* .filter(d => d.id !== 0) */
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
