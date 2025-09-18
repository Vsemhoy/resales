import PageFooter from "../PageFooter";
import {useEffect, useState} from "react";

const CharacteristicsChapter = ({ startPage, subChapterNum, characteristicInfo, name, onRender }) => {
    const [pageNumSelf, setPageNameSelf] = useState(startPage);
    let rendered = false;
    useEffect(() => {
        if (!rendered) {
            console.log('CharacteristicsChapter', startPage);
            onRender(startPage + 1, name);
        }
    }, []);
    return (
        <div className="body-container specification">
            <div className="specification-wrapper">
                <div className="specification-header small">
                    <div className="first-number">{subChapterNum}</div>
                    <div className="first-header-name">Характеристики системы</div>
                </div>
                <div className="characteristic-wrapper">
                    <div className="characteristic-block">
                        <div className="characteristic-name">Мощностные характеристики системы</div>
                        <div className="characteristic-description">
                            <p>Общая потребляемая мощность, Вт</p>
                            <p>{characteristicInfo.maxPowerConsumption}</p>
                        </div>
                        <div className="characteristic-description">
                            <p>Общая выходная мощность, Вт</p>
                            <p>{characteristicInfo.totalOutputPower}</p>
                        </div>
                        <div className="characteristic-description">
                            <p>Общая мощность громкоговорителей, Вт</p>
                            <p>{characteristicInfo.totalPowerOfTheSpeakers}</p>
                        </div>
                    </div>
                    <div className="characteristic-block">
                        <div className="characteristic-name">Массогабаритные характеристики<br/>оборудования по спецификации</div>
                        <div className="characteristic-description">
                            <p>Общая высота, U</p>
                            <p>{characteristicInfo.overallHeight}</p>
                        </div>
                        <div className="characteristic-description">
                            <p>Масса брутто, кг</p>
                            <p>{characteristicInfo.grossWeight}</p>
                        </div>
                        <div className="characteristic-description">
                            <p>Объем с учетом упаковки, м3</p>
                            <p>{characteristicInfo.volumeIncludingPackaging}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="specification-footer">
                <PageFooter pageNumSelf={pageNumSelf}/>
            </div>
        </div>
    );
}

export default CharacteristicsChapter;
