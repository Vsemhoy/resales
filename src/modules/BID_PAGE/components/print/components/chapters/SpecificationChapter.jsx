import {useEffect, useState} from "react";
import PageFooter from "../PageFooter";

const SpecificationChapter = ({ models, startPage, name, chapterNum, currency, onRender, amounts }) => {
    const [pageNumSelf] = useState(startPage);
    let rendered = false;
    useEffect(() => {
        if (!rendered) {
            console.log('SpecificationChapter', startPage);
            rendered = true;
        }
    }, []);
    useEffect(() => {
        if (models.length > 0) {
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
    // Рассчитываем общую сумму
    const totalSum = models.reduce((sum, model) => sum + (+model.quantity * +model.price_0), 0);
    const renderAmount = () => {
        if (+currency.value === 1) {
            return +amounts?.usd / 100;
        }
        if (+currency.value === 2) {
            return +amounts?.eur / 100;
        }
        if (+currency.value === 3) {
            return +amounts?.rub / 100;
        }
    };

    return (
        <div>
            {Array.from({ length: calculateBlocksCount() }).map((_, blockIndex) => (
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

                        {getModelsForBlock(blockIndex).sort((a,b) => a.sort - b.sort).map((model, index) => {
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
                                    <div className="specification-line-cell"><p>{model.moneyOne / 100}</p></div>
                                    <div className="specification-line-cell"><p>{model.moneyCount / 100}</p></div>
                                    <div className="specification-line-cell"><p>{model.availability}+</p></div>
                                    <div className="specification-line-cell">
                                        <img src={model.path} alt={model.name}/>
                                    </div>
                                </div>
                            );
                        })}

                        {blockIndex === calculateBlocksCount() - 1 && (
                            <>
                                <div className="sum-line">
                                    <div className="sum-name">Итого:</div>
                                    <div className="sum">{renderAmount()} {currency.label}</div>
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
