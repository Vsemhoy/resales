import {useEffect, useState} from "react";
import PageFooter from "../PageFooter";

const ContentsChapter = ({ startPage, name, chapterNum, subChapterNum, chaptersRendered, onRender}) => {
    const [pageNumSelf, setPageNameSelf] = useState(startPage);
    let rendered = false;
    useEffect(() => {
        onRender(startPage++, name);
    }, []);

    return (
        <div id="contents" className="body-container contents">
            <div id="contents" className="contents-wrapper">
                <h2 className="contents-header">Содержание</h2>
                {/*<a id="firstChapterLink" href="#firstChapter-1">
                    <div className="line">
                        <p className="line-name"><span className="line-num"></span>. Особенности системы и требования
                            заказчика</p>
                        <div className="dotted"></div>
                        <p className="line-page"></p>
                    </div>
                </a>
                <a id="secondChapterLink" href="#secondChapter-1">
                    <div className="line">
                        <p className="line-name"><span className="line-num"></span>. Выбор оборудования</p>
                        <div className="dotted"></div>
                        <p className="line-page"></p>
                    </div>
                </a>
                <a id="secondChapterProfLink" href="#secondChapter-1">
                    <div className="line">
                        <p className="line-name"><span className="line-num"></span>. Акустический расчет</p>
                        <div className="dotted"></div>
                        <p className="line-page"></p>
                    </div>
                </a>
                <a id="structSubchapterLink" href="#structSubchapter">
                    <div className="line">
                        <p className="sub-line-name"><span className="line-num"></span> Структурная схема проекта</p>
                        <div className="dotted"></div>
                        <p className="line-page"></p>
                    </div>
                </a>
                <a id="placementSubchapterLink" href="#placementSubchapter">
                    <div className="line">
                        <p className="sub-line-name"><span className="line-num"></span> Размещение блоков системы в
                            шкафах</p>
                        <div className="dotted"></div>
                        <p className="line-page"></p>
                    </div>
                </a>
                <a id="acousticSubchapterLink" href="#acousticSubchapter-1">
                    <div className="line">
                        <p className="sub-line-name"><span className="line-num"></span> Размещение акустических систем
                        </p>
                        <div className="dotted"></div>
                        <p className="line-page"></p>
                    </div>
                </a>
                <a id="reverbSubchapterLink" href="#reverbSubchapter-1">
                    <div className="line">
                        <p className="sub-line-name"><span className="line-num"></span> Расчет времени реверберации</p>
                        <div className="dotted"></div>
                        <p className="line-page"></p>
                    </div>
                </a>
                <a id="directSplSubchapterLink" href="#directSplSubchapter-1">
                    <div className="line">
                        <p className="sub-line-name"><span className="line-num"></span> Расчет Direct SPL</p>
                        <div className="dotted"></div>
                        <p className="line-page"></p>
                    </div>
                </a>
                <a id="totalSplSubchapterLink" href="#totalSplSubchapter-1">
                    <div className="line">
                        <p className="sub-line-name"><span className="line-num"></span> Расчет Total SPL</p>
                        <div className="dotted"></div>
                        <p className="line-page"></p>
                    </div>
                </a>
                <a id="stiSubchapterLink" href="#stiSubchapter-1">
                    <div className="line">
                        <p className="sub-line-name"><span className="line-num"></span> Расчет коэффициента STI</p>
                        <div className="dotted"></div>
                        <p className="line-page"></p>
                    </div>
                </a>
                <a id="alconsSubchapterLink" href="#alconsSubchapter-1">
                    <div className="line">
                        <p className="sub-line-name"><span className="line-num"></span> Расчет Alcons</p>
                        <div className="dotted"></div>
                        <p className="line-page"></p>
                    </div>
                </a>*/}
                <a id="thirdChapterLink" href="#thirdChapter-0">
                    <div className="line">
                        <p className="line-name"><span className="line-num">{chapterNum}</span>. Спецификация
                            оборудования</p>
                        <div className="dotted"></div>
                        <p className="line-page">{chaptersRendered.specification.startPage < 10 ? '0' + chaptersRendered.specification.startPage : chaptersRendered.specification.startPage}</p>
                    </div>
                </a>
                {/*<a id="recommendationsChapterLink" href="#recommendations-1">
                    <div className="line">
                        <p className="sub-line-name"><span className="line-num"></span> Рекомендации по дополнительному
                            оборудованию системы</p>
                        <div className="dotted"></div>
                        <p className="line-page"></p>
                    </div>
                </a>*/}
                <a id="characteristicsSpecificationLink" href="#CharacteristicsSpecification">
                    <div className="line">
                        <p className="sub-line-name"><span className="line-num">{subChapterNum}</span> Характеристики системы</p>
                        <div className="dotted"></div>
                        <p className="line-page">{chaptersRendered.characteristics.startPage < 10 ? '0' + chaptersRendered.characteristics.startPage: chaptersRendered.characteristics.startPage}</p>
                    </div>
                </a>
                {/*<a id="appendixLink" href="#appendix">
                    <div className="line">
                        <p className="line-name">Описание оборудования</p>
                        <div className="dotted"></div>
                        <p className="line-page"></p>
                    </div>
                </a>*/}
            </div>
            <PageFooter
                pageNumSelf={pageNumSelf}
            />
        </div>
    );
}

export default ContentsChapter;
