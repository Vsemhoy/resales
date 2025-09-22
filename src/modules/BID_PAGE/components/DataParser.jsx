import React, { useEffect, useState, useCallback } from "react";
import TextArea from "antd/es/input/TextArea";
import { Table } from "antd";

const DataParser = ({ models, additionData, setAdditionData }) => {
    const [value, setValue] = useState("");

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
    const getModelCurrency = (name) =>
        models.find((model) => model.name === name)?.currency;
    useEffect(() => {
        if (!value) {
            setAdditionData([]);
            return;
        }

        const lines = value.split("\n");
        const parsedData = lines.map((line, index) => {
            const name = getName(line);
            if (!name) return null;

            return {
                key: index,
                num: index + 1,
                name: getModelName(name) ? getModelName(name) : name,
                count: getCount(line),
                id: getModelId(name),
                currency: getModelCurrency(name),
            };
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
                    dataSource={additionData}
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
