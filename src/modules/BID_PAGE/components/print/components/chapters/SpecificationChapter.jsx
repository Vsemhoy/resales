import {useEffect, useState} from "react";
import PageFooter from "../PageFooter";

const SpecificationChapter = ({ bidId, startPage, name, chapterNum, currency, onRender }) => {
    const [pageNumSelf, setPageNameSelf] = useState(startPage);
    const [models, setModels] = useState([]);
    let rendered = false;
    useEffect(() => {
        if (!rendered) {
            fetchModels();
            rendered = true;
        }
    }, []);

    useEffect(() => {
        if (models.length > 0) {
            console.log(models.length)
            onRender(pageNumSelf + calculateBlocksCount(), name);
        }
    }, [models]);

    // Функция для расчета количества необходимых блоков specification
    const calculateBlocksCount = () => {
        const length = models.length + 1; // Нужно для строки суммы
        if (length === 0) return 0;
        if (length <= 3) return 1;
        return Math.ceil((length - 3) / 4) + 1;
    }

    // Функция для получения моделей для конкретного блока
    const getModelsForBlock = (blockIndex) => {
        if (blockIndex === 0) {
            // Первый блок - первые 3 модели
            return models.slice(0, 3);
        } else {
            // Последующие блоки - по 4 модели
            const startIndex = 3 + (blockIndex - 1) * 4;
            return models.slice(startIndex, startIndex + 4);
        }
    }

    const blocksCount = calculateBlocksCount();

    const fetchModels = () => {
        try {
            fetch(`/test2.json`)
                .then(res => res.json())
                .then(res => {
                    setModels(res);
                });
        } catch (e) {
            console.log(e);
        }
    }

    // Рассчитываем общую сумму
    const totalSum = models.reduce((sum, model) => sum + (+model.quantity * +model.price_0), 0);

    return (
        <div>
            {Array.from({ length: blocksCount }).map((_, blockIndex) => (
                <div key={blockIndex} id={`specification-${blockIndex}`} className="body-container specification">
                    <div className={blockIndex > 0 ? "specification-wrapper-1" : "specification-wrapper"}>
                        {blockIndex === 0 && (
                            <div className="specification-header">
                                <div className="first-number">{chapterNum}</div>
                                <div className="first-header-name">Спецификация<br/>оборудования</div>
                            </div>
                        )}

                        <div className="specification-header-line">
                            <div className="specification-header-cell left"><p className="left">№</p></div>
                            <div className="specification-header-cell left pl4"><p className="left">Наименование,<br/>описание
                                оборудования</p></div>
                            <div className="specification-header-cell"><p>Кол-во,<br/>шт</p></div>
                            <div className="specification-header-cell"><p>Цена, {currency.label}</p></div>
                            <div className="specification-header-cell"><p>Сумма, {currency.label}</p></div>
                            <div className="specification-header-cell"><p>Наличие</p></div>
                            <div className="specification-header-cell"><p>Фото<br/>оборудования</p></div>
                        </div>

                        {getModelsForBlock(blockIndex).map((model, index) => {
                            // Вычисляем глобальный индекс модели в массиве models
                            const globalIndex = blockIndex === 0
                                ? index
                                : 3 + (blockIndex - 1) * 4 + index;

                            return (
                                <div key={index} className="specification-line">
                                    <div className="specification-line-cell left"><p>{globalIndex + 1}</p></div>
                                    <div className="specification-line-cell">
                                        <div className="naming-wrapper">
                                            <p className="name">{model.brand}, {model.name}</p>
                                            <p className="description">{model.short_note}</p>
                                        </div>
                                    </div>
                                    <div className="specification-line-cell"><p>{model.quantity}</p></div>
                                    <div className="specification-line-cell"><p>{model.price_0}</p></div>
                                    <div className="specification-line-cell"><p>{+model.quantity * +model.price_0}</p></div>
                                    <div className="specification-line-cell"><p>{model.availability}+</p></div>
                                    <div className="specification-line-cell">
                                        <img src={model.path} alt={model.name}/>
                                    </div>
                                </div>
                            );
                        })}

                        {blockIndex === blocksCount - 1 && (
                            <>
                                <div className="sum-line">
                                    <div className="sum-name">Итого:</div>
                                    <div className="sum">{totalSum} {currency.label}</div>
                                </div>
                                <div className="sum-description-line">
                                    <div className="sum-text-left">По условиям договора поставка осуществляется при<br/>100%
                                        предоплате со склада в Санкт-Петербурге.
                                    </div>
                                    <div className="sum-text-right">Цены указаны с учетом НДС 20%. Срок поставки
                                        оборудования<br/>под заказ - 3 месяца с момента оплаты счета.
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="specification-footer">
                        <PageFooter pageNumSelf={pageNumSelf + blockIndex}/>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default SpecificationChapter;
