import {useEffect} from "react";
import ArstelLogoPDF from "../../../../../../assets/Comicon/PDF/ArstelLogoPDF";
import AffaLogoPDF from "../../../../../../assets/Comicon/PDF/AffaLogoPDF";
import {BorderInnerOutlined} from "@ant-design/icons";
import IntermLogoPDF from "../../../../../../assets/Comicon/PDF/IntermLogoPDF";
import PMU60N from "../../../../../../assets/Comicon/PDF/PMU60N";

const TitleChapter = ({ type, titleInfo, startPage, name, email, onRender }) => {
    let rendered = false;
    useEffect(() => {
        onRender(startPage++, name);
    }, []);

    function formatDate(timestamp) {
        const date = new Date(timestamp * 1000); // Умножаем на 1000, чтобы преобразовать секунды в миллисекунды
        const day = String(date.getDate()).padStart(2, '0'); // Добавляем ведущий ноль
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }

    return (
        <div id="start"
             className="body-container start"
        >
            <div className="start-header">
                {/*<img className="start-arstel" src="/src/assets/media/ARSTEL.png" alt="arstel"/>*/}
                <ArstelLogoPDF/>
                {type === 2 && (<div className="right-block-prof"
                                     style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                    <div className="interm-affa">
                        {/*<img style={{marginRight: '10px', marginTop: '2mm', height: '10mm'}}
                             src="/src/assets/media/Affa_logo.png" alt="affa"/>*/}
                        <AffaLogoPDF/>
                        {/*<img className="start-interm"
                             style={{height: '8mm', marginTop: '0', marginBottom: '1.7mm'}}
                             src="/src/assets/media/Inter-M.png" alt="inter-m"/>*/}
                        <IntermLogoPDF/>
                    </div>
                    <div style={{
                        textTransform: 'uppercase',
                        fontSize: '2.5mm',
                        textAlign: 'right',
                        maxWidth: '250px',
                        lineHeight: '3mm'
                    }}>
                        Профессиональные акустические системы<br/>устройства обработки и усиления звука
                    </div>
                </div>)}
                {type === 1 && (<div className="right-block-trans">
                    {/*<img className="start-interm" src="/src/assets/media/Inter-M.png" alt="inter-m"/>*/}
                    <IntermLogoPDF big={true}/>
                </div>)}
            </div>
            <div className="center">
                <div className="start-info">
                    <h1 className="start-header-commerce">Коммерческое предложение</h1>
                    <p id="numberAndDate" className="id-and-date">Исх. № {titleInfo.id} от {formatDate(titleInfo.date)} г.</p>
                    <div className="start-block">
                        <p id="fio_print" className="start-block-header uppercase">{titleInfo.contactPerson.name} {titleInfo.contactPerson.surname}</p>
                        <p id="jobTitleAndOrganization" className="start-block-description italic">{titleInfo.contactPerson.occupy ? titleInfo.contactPerson.occupy : '-'}</p>
                    </div>
                    <div className="start-block">
                        <p className="start-block-header">Адрес объекта:</p>
                        <p id="address_print" className="start-block-description">{titleInfo.address}</p>
                    </div>
                    <div className="start-block lil">
                        <p className="start-block-header">Объект:</p>
                        <p id="object_print" className="start-block-description">{titleInfo.object}</p>
                    </div>
                    <div className="start-block lil">
                        <p className="start-block-header">Выполнил:</p>
                        <p id="fio_manager_print" className="start-block-description">{titleInfo.manager.name} {titleInfo.manager.surname}</p>
                        <p id="manager_occupy_print" className="start-block-description italic">{titleInfo.manager.occupy ? titleInfo.manager.occupy : '-'}</p>
                    </div>
                    <div className="start-block lil">
                        <p className="start-block-header">Контакты:</p>
                        <p id="tel_print" className="start-block-description">тел.: {titleInfo.manager.phone ? titleInfo.manager.phone : '-'}</p>
                        <p id="mail_print" className="start-block-description">e-mail: {titleInfo.manager.email ? titleInfo.manager.email : (email ? email : '-')}</p>
                        <p className="start-block-description">www.arstel.com</p>
                    </div>
                </div>
                <div className="start-photo-block">
                    {/*<img className="start-photo" src="/src/assets/media/pmu60n.png" alt="equipment"/>*/}
                    <PMU60N/>
                </div>
            </div>
        </div>
    );
}

export default TitleChapter;
