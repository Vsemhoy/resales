import {useEffect, useState} from "react";

const EditFields = ({ startPrint, stopPrint }) => {

    const preparationForPrinting = async () => {
        startPrint();
        setTimeout(() => {
            window.print();
            stopPrint();
        }, 0);
    };

    return (
        <div>
            <div className="edit-fields-wrapper">
                <h2 className="edit-fields-header">Редактирование информации для PDF</h2>
                <div className="columns">
                    <div className="chapter-wrapper title active">
                        <div className="chapter-header">
                            <h3 className="chapter-header-label">Титульный лист</h3>
                        </div>
                        <div className="chapter-body">
                            <div className="chapter-line">
                                <p className="chapter-line-key">ФИО контактного лица</p>
                                <input id="fio" className="chapter-line-value" type="text"/>
                            </div>
                            <div className="chapter-line">
                                <p className="chapter-line-key">Должность контактного лица</p>
                                <input id="job-title" className="chapter-line-value" type="text"/>
                            </div>
                            <div className="chapter-line">
                                <p className="chapter-line-key">Организация</p>
                                <input id="organization" className="chapter-line-value" type="text"/>
                            </div>
                            <div className="chapter-line">
                                <p className="chapter-line-key">Адрес объекта</p>
                                <input id="address" className="chapter-line-value" type="text"/>
                            </div>
                            <div className="chapter-line">
                                <p className="chapter-line-key">Объект</p>
                                <input id="object" className="chapter-line-value" type="text"/>
                            </div>
                            <div className="chapter-line">
                                <p className="chapter-line-key">Валюта</p>
                                <div className="currency-wrapper">
                                    <label className="currency-label" htmlFor="currency-dollar">$ <input
                                        className="currency-input" id="currency-dollar" name="currency"
                                        type="radio"/></label>
                                    <label className="currency-label" htmlFor="currency-euro">€ <input
                                        className="currency-input" id="currency-euro" name="currency"
                                        type="radio"/></label>
                                    <label className="currency-label" htmlFor="currency-rub">₽ <input
                                        className="currency-input" id="currency-rub" name="currency"
                                        type="radio"/></label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="chapter-wrapper special">
                        <div className="chapter-header">
                            <h3 className="chapter-header-label">Особенности системы и требования заказчика</h3>
                            <label className="activate-chapter" htmlFor="isSpecialOn"><p>Вкл.</p><input id="isSpecialOn"
                                                                                                        className="chapter-checkbox"
                                                                                                        type="checkbox"/></label>
                        </div>
                        <div className="chapter-body">
                            <div id="specials" className="special-lines"></div>
                            <div className="special-line">
                                <p className="special-number"></p>
                                <button id="special-btn" className="special-btn adder">+</button>
                            </div>
                        </div>
                    </div>
                    <div className="chapter-wrapper choice-trans">
                        <div className="chapter-header">
                            <h3 className="chapter-header-label">Выбор оборудования</h3>
                            <label className="activate-chapter" htmlFor="isChoiceOn"><p>Вкл.</p><input id="isChoiceOn"
                                                                                                       className="chapter-checkbox"
                                                                                                       type="checkbox"/></label>
                        </div>
                        <div className="chapter-body">
                            <select name="choice-select" className="choice-select">
                                <option value="0">Текст не выбран</option>
                                <option value="1">1 базовый текст</option>
                                <option value="2">2 базовый текст</option>
                                <option value="3">3 базовый текст</option>
                            </select>
                            <textarea name="choice-textarea" cols="10" rows="10"
                                      className="choice-textarea trans-choice-textarea"></textarea>
                        </div>
                    </div>
                    <div className="chapter-wrapper scheme">
                        <div className="chapter-header">
                            <h3 className="chapter-header-label">Структурная схема проекта</h3>
                        </div>
                        <div className="chapter-body">
                            <select name="scheme-select" className="scheme-select">
                                <option value="0">Схема не выбрана</option>
                            </select>
                            <h3 className="small-header">Добавить схему</h3>
                            <div className="file-wrapper">
                                <input className="scheme-img-name-new" type="text" placeholder="Имя схемы"/>
                                <label className="scheme-img-new" htmlFor="scheme-img">Выберите фото</label>
                                <input id="scheme-img" className="img-new" type="file"/>
                            </div>
                        </div>
                    </div>
                    <div className="chapter-wrapper placing">
                        <div className="chapter-header">
                            <h3 className="chapter-header-label">Размещение блоков системы в шкафах</h3>
                        </div>
                        <div className="chapter-body">
                            <select name="placing-select" className="placing-select">
                                <option value="0">Размещение не выбрано</option>
                            </select>
                            <h3 className="small-header">Добавить размещение</h3>
                            <div className="file-wrapper">
                                <input className="placing-img-name-new" type="text" placeholder="Имя размещения"/>
                                <label className="placing-img-new" htmlFor="placing-img">Выберите фото</label>
                                <input id="placing-img" className="img-new" type="file"/>
                            </div>
                        </div>
                    </div>
                    {/*<div className="chapter-wrapper choice-prof">
                        <div className="chapter-header">
                            <h3 className="chapter-header-label">Акустический расчет</h3>
                            <label className="activate-chapter" htmlFor="isChoiceOn"><p>Вкл.</p><input id="isChoiceOn"
                                                                                                       className="chapter-checkbox"
                                                                                                       type="checkbox"/></label>
                        </div>
                        <div className="chapter-body">
                            <select name="choice-select" className="choice-select">
                                <option value="0">Текст не выбран</option>
                                <option value="1">1 базовый текст</option>
                                <option value="2">2 базовый текст</option>
                                <option value="3">3 базовый текст</option>
                            </select>
                            <textarea name="choice-textarea" cols="10" rows="10"
                                      className="choice-textarea acoustic-choice-textarea"></textarea>
                        </div>
                    </div>
                    <div className="chapter-wrapper acoustic">
                        <div className="chapter-header">
                            <h3 className="chapter-header-label">Размещение акустических систем</h3>
                        </div>
                        <div className="chapter-body">
                            <h3 className="small-header">Добавить размещения</h3>
                            <div className="file-wrapper">
                                <input className="acoustic-img-name-new-1" type="text" placeholder="Имя размещения"
                                       value="Расстановка акустических систем"/>
                                <label className="acoustic-img-new" htmlFor="acoustic-img-1">Новый файл</label>
                                <input id="acoustic-img-1" className="img-new" type="file"/>
                                <p className="acoustic-img-1-name"></p>
                            </div>
                            <div className="file-wrapper">
                                <input className="acoustic-img-name-new-2" type="text" placeholder="Имя размещения"
                                       value="Конфигурация линейного массива"/>
                                <label className="acoustic-img-new" htmlFor="acoustic-img-2">Новый файл</label>
                                <input id="acoustic-img-2" className="img-new" type="file"/>
                                <p className="acoustic-img-2-name"></p>
                            </div>
                            <h3 className="small-header">Описание размещения</h3>
                            <textarea name="acoustic-textarea" cols="20" rows="5" className="acoustic-textarea"
                                      style={{width: '100%'}}></textarea>
                        </div>
                    </div>
                    <div className="chapter-wrapper reverb">
                        <div className="chapter-header">
                            <h3 className="chapter-header-label">Расчет времени реверберации</h3>
                        </div>
                        <div className="chapter-body">
                            <h3 className="small-header">Добавить расчет</h3>
                            <div className="file-wrapper">
                                <input className="reverb-img-name-new" type="text" placeholder="Имя размещения"
                                       value="Время реверберации"/>
                                <label className="reverb-img-new" htmlFor="reverb-img">Новый файл</label>
                                <input id="reverb-img" className="img-new" type="file"/>
                                <p className="reverb-img-name"></p>
                            </div>
                            <h3 className="small-header">Описание расчета времени</h3>
                            <textarea name="reverb-textarea" cols="20" rows="5" className="reverb-textarea"
                                      style={{width: '100%'}}></textarea>
                        </div>
                    </div>
                    <div className="chapter-wrapper direct-spl">
                        <div className="chapter-header">
                            <h3 className="chapter-header-label">Расчет Direct SPL</h3>
                        </div>
                        <div className="chapter-body">
                            <h3 className="small-header">Добавить расчеты</h3>
                            <div className="file-wrapper">
                                <input className="direct-spl-img-name-new-1" type="text" placeholder="Имя размещения"
                                       value="Карта распределения уровня Direct SPL"/>
                                <label className="direct-spl-img-new" htmlFor="direct-spl-img-1">Новый файл</label>
                                <input id="direct-spl-img-1" className="img-new" type="file"/>
                                <p className="direct-spl-img-1-name"></p>
                            </div>
                            <div className="file-wrapper">
                                <input className="direct-spl-img-name-new-2" type="text" placeholder="Имя размещения"
                                       value="График распределения уровня Direct SPL"/>
                                <label className="direct-spl-img-new" htmlFor="direct-spl-img-2">Новый файл</label>
                                <input id="direct-spl-img-2" className="img-new" type="file"/>
                                <p className="direct-spl-img-2-name"></p>
                            </div>
                            <h3 className="small-header">Описание расчета</h3>
                            <textarea name="direct-spl-textarea" cols="20" rows="5" className="direct-spl-textarea"
                                      style={{width: '100%'}}></textarea>
                        </div>
                    </div>
                    <div className="chapter-wrapper total-spl">
                        <div className="chapter-header">
                            <h3 className="chapter-header-label">Расчет Total SPL</h3>
                        </div>
                        <div className="chapter-body">
                            <h3 className="small-header">Добавить расчет</h3>
                            <div className="file-wrapper">
                                <input className="total-spl-img-name-new" type="text" placeholder="Имя размещения"
                                       value="График распределения уровня Total SPL"/>
                                <label className="total-spl-img-new" htmlFor="total-spl-img">Новый файл</label>
                                <input id="total-spl-img" className="img-new" type="file"/>
                                <p className="total-spl-img-name"></p>
                            </div>
                            <h3 className="small-header">Описание расчета</h3>
                            <textarea name="total-spl-textarea" cols="20" rows="5" className="total-spl-textarea"
                                      style={{width: '100%'}}></textarea>
                        </div>
                    </div>
                    <div className="chapter-wrapper sti">
                        <div className="chapter-header">
                            <h3 className="chapter-header-label">Расчет коэффициента STI</h3>
                        </div>
                        <div className="chapter-body">
                            <h3 className="small-header">Добавить расчеты</h3>
                            <div className="file-wrapper">
                                <input className="sti-img-name-new-1" type="text" placeholder="Имя размещения"
                                       value="Карта распределения STI"/>
                                <label className="sti-img-new" htmlFor="sti-img-1">Новый файл</label>
                                <input id="sti-img-1" className="img-new" type="file"/>
                                <p className="sti-img-1-name"></p>
                            </div>
                            <div className="file-wrapper">
                                <input className="sti-img-name-new-2" type="text" placeholder="Имя размещения"
                                       value="График распределения STI"/>
                                <label className="sti-img-new" htmlFor="sti-img-2">Новый файл</label>
                                <input id="sti-img-2" className="img-new" type="file"/>
                                <p className="sti-img-2-name"></p>
                            </div>
                            <h3 className="small-header">Описание расчета</h3>
                            <textarea name="sti-textarea" cols="20" rows="5" className="sti-textarea"
                                      style={{width: '100%'}}>
                            Среднее значение показателя разборчивости речи STI в зале составляет 0,83. Данное значение является отличным показателем.
                            Разборчивость речи ухудшается, когда слушатель воспринимает прямой звуковой сигнал, идущий от акустической системы и звуковой сигнал, отражённый от поверхностей (потолок, стены).
                            Если звуковое давление отражённых сигналов является достаточно большим, то такой сигнал является помехой и ухудшает разборчивость речевого сигнала.
                            Расчётные данные подтверждают, что количество звуковых массивов, расстояние между ними, количество элементов звукового массива, их ориентация в пространстве и подводимая мощность для локального озвучивания зала выбраны правильно.
                    </textarea>
                        </div>
                    </div>
                    <div className="chapter-wrapper alcons">
                        <div className="chapter-header">
                            <h3 className="chapter-header-label">Расчет Alcons</h3>
                        </div>
                        <div className="chapter-body">
                            <h3 className="small-header">Добавить расчеты</h3>
                            <div className="file-wrapper">
                                <input className="alcons-img-name-new-1" type="text" placeholder="Имя размещения"
                                       value="Карта распределения ALCONS"/>
                                <label className="alcons-img-new" htmlFor="alcons-img-1">Новый файл</label>
                                <input id="alcons-img-1" className="img-new" type="file"/>
                                <p className="alcons-img-1-name"></p>
                            </div>
                            <div className="file-wrapper">
                                <input className="alcons-img-name-new-2" type="text" placeholder="Имя размещения"
                                       value="График распределения ALCONS"/>
                                <label className="alcons-img-new" htmlFor="alcons-img-2">Новый файл</label>
                                <input id="alcons-img-2" className="img-new" type="file"/>
                                <p className="alcons-img-2-name"></p>
                            </div>
                            <h3 className="small-header">Описание расчета</h3>
                            <textarea name="alcons-textarea" cols="20" rows="5" className="alcons-textarea"
                                      style={{width: '100%'}}>
                        Среднее значение коэффициента потери согласных ALCONS на игровом поле составляет 1,87%, что является отличным показателем. Аналогично со значением STI.
                        Причина большого значения потерь согласных заключается в наличии высокого уровня отражённых сигналов, которые подавляют прямой звуковой сигнал и снижают разборчивость.
                        Расчётные данные подтверждают, что количество звуковых массивов, расстояние между ними, количество элементов звукового массива, их ориентация в пространстве и подводимая мощность для локального озвучивания зоны трибун выбраны правильно.
                    </textarea>
                        </div>
                    </div>
                    <div className="chapter-wrapper conclusions">
                        <div className="chapter-header">
                            <h3 className="chapter-header-label">Выводы</h3>
                        </div>
                        <div className="chapter-body">
                            <h3 className="small-header">Текст</h3>
                            <textarea name="conclusions-textarea-1" cols="20" rows="5"
                                      className="conclusions-textarea-1" style={{width: '100%'}}>
                                    Компьютерное моделирование звуковой системы показало, что допустимые показатели громкости звучания различных программ, качественное воспроизведения музыкальных программ, отсутствие шумовых помех и эхообразований обеспечиваются с запасом.
                                    Получены отличные показатели разборчивости речи в зале.
                                    Предложенные акустические системы Inter-M обеспечивают звуковое давление достаточное для зала c необходимым дополнительным запасом.
                                    Время реверберации немного меньше оптимального для залов многоцелевого назначения, поэтому звук при живых выступлениях будет немного сухим.
                                    Но так как зал используется для кинопоказов, а по требованиям ОСТ 19-238-01 время реверберации в кинозалах такого размера должно быть около 0.4 с, то наш измеренный параметр попадает в рамки оптимальных значений.
                                    Элементы крепления линейного массива имеют восьмикратный запас прочности и позволят надежно и безопасно укрепить линейные массивы под потолком.
                                    Высокая надежность, отказоустойчивость, оптимальное энергопотребление профессионального звукового оборудования Inter-M и AFFA сокращают затраты на ремонт и обслуживание комплекса звукоусиления и обработки звука.
                    </textarea>
                            <h3 className="small-header">Рекомендации</h3>
                            <textarea name="conclusions-textarea-2" cols="20" rows="5"
                                      className="conclusions-textarea-2" style={{width: '100%'}}>
                            Для оптимизации времени реверберации рекомендуем применить дополнительные звукоотражающие акустические панели.
                            Дополнительно рекомендуем использовать систему звукового оповещения и музыкальной трансляции Inter-M в служебных помещениях.
                    </textarea>
                        </div>
                    </div>*/}
                    <div className="chapter-wrapper recommendations">
                        <div className="chapter-header">
                            <h3 className="chapter-header-label">Рекомендации по дополнительному оборудованию
                                системы</h3>
                            <label className="activate-chapter" htmlFor="isRecommendationsOn"><p>Вкл.</p><input
                                id="isRecommendationsOn" className="chapter-checkbox" type="checkbox"/></label>
                        </div>
                        <div className="chapter-body">
                            <div className="recommendations-lines"></div>
                            <div className="special-line">
                                <p className="recommendations-number"></p>
                                <button id="recommendations-btn" className="recommendations-btn adder">+</button>
                            </div>
                        </div>
                    </div>
                    <div className="chapter-wrapper equipment">
                        <div className="chapter-header">
                            <h3 className="chapter-header-label">Описание оборудования</h3>
                            <label className="activate-chapter" htmlFor="isEquipmentOn"><p>Вкл.</p><input
                                id="isEquipmentOn" className="chapter-checkbox" type="checkbox"/></label>
                        </div>
                        <div className="chapter-body"></div>
                    </div>
                    <div className="print-btns">
                        <button className="button section-center-button">Вернуться</button>
                        <div className="print-btns-container">
                            <button className="button save-print-info">Сохранить</button>
                            <button className="button print-btn"
                                    onClick={preparationForPrinting}
                            >
                                Печать КП в PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditFields;
