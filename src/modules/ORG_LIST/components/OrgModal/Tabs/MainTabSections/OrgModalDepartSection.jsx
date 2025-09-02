import React, { useEffect, useState } from 'react';
import OrgModalRow from './OrgModalRow';
import { ORG_DEF_DATA } from '../../../mock/ORGDEFDATA';
import { FullNameWithOccupy, ShortName, TextWithLineBreaks } from '../../../../../../components/helpers/TextHelpers';
import { Tooltip } from 'antd';
import dayjs from 'dayjs';


const OrgModalDepartSection = (props) => {
    const [orgData, setOrgData] = useState(ORG_DEF_DATA);


    useEffect(() => {
        if (props.data){
            setOrgData(props.data);
        } else {
            setOrgData(ORG_DEF_DATA);
        }
    }, [props.data]);



  return (
    <div className={'sk-omt-stack'}
        style={{borderLeft: '4px solid #2196f3'}}
    >

        <OrgModalRow
            key={'rowfla00222'}
            titles={['Автор', 'Куратор']}
            datas={[
                orgData?.creator ? 
                <span>{FullNameWithOccupy(orgData.creator)}</span> : '',
                orgData?.curator ? 
                <span>{FullNameWithOccupy(orgData.curator)}</span> : '',]}
        />

        {/* <OrgModalRow
            key={'rowfla00223'}
            titles={['Отдел']}
            datas={['Тестовая карточка организации']}
        /> */}

        <OrgModalRow
            key={'rowfla00224'}
            titles={['Статус $', 'Способ доставки']}
            datas={[orgData.statusmoney?.name, orgData.deliverytype?.name]}
        />

        <OrgModalRow
            key={'rowfla00225'}
            titles={['Комментарии']}
            datas={[orgData.comment]}
        />

        {orgData.list && (

            <OrgModalRow
                key={'rowfla00226'}
                titles={['Списки', 'Комментарий']}
                datas={[orgData.list?.typelist?.name, <TextWithLineBreaks text={orgData.list.comment} /> ]}
                
            />
        )}

        {orgData.active_licenses && orgData.active_licenses.length > 0 && (
            <>
                {orgData.active_licenses.map((lic)=>(
                <OrgModalRow
                    key={'rowfla00227' + lic.id}
                    titles={['Лицензия МЧС', 'Комментарий', '№ Дата']}
                    datas={[lic.type?.name, lic.comment, lic.number]}
                />
                ))}
            </>
        )}

        {orgData.active_tolerance && orgData.active_tolerance.length > 0 && (
            <>
                {orgData.active_tolerance.map((lic)=>(
                <OrgModalRow
                    key={'rowfla00227' + lic.id}
                    titles={['Допуски СРО', 'Комментарий', '№ Дата']}
                    datas={[lic.type?.name, lic.comment, lic.number]}
                />
                ))}
            </>
        )}

        {orgData.active_licenses_bo && orgData.active_licenses_bo.length > 0 && (
            <>
                {orgData.active_licenses_bo.map((lic)=>{
                    const namel = lic.document_type === 1 ? "Лицензия МЧС" : "Допуск СРО";
                    const key = `${lic.document_type}-${lic.type}`;
                    const tupel = props.selects_data.tollic[key];
                    
                    return (
                <div className={'sa-tollic-group'}>
                    <OrgModalRow
                    key={'rowfla00228' + lic.id}
                    titles={[namel, 'Начало действия']}
                    datas={[lic.name, lic.start_date ? dayjs.unix(lic.start_date).format("DD.MM.YYYY") : ""]}
                />
                    <OrgModalRow
                        key={'rowfla00228' + lic.id + 'extra'}
                        titles={['Вид лицензии/допуска', 'Конец действия']}
                        datas={[tupel,  lic.end_date ? dayjs.unix(lic.end_date).format("DD.MM.YYYY") : "" ]}
                        comment={lic.comment}
                    />
                </div>
                )})}
            </>
        )}

        {/* <OrgModalRow
            key={'rowfla00227'}
            titles={['Лицензия МЧС', 'Комментарий', '№ Дата']}
            datas={['монтаж','Бессрочная', '56345']}
            comment={"Здесь будет длинный комментарий ли очень длинный"}
        /> */}

        {/* <OrgModalRow
            key={'rowfla00228'}
            titles={['Допуски СРО','№ Дата']}
            datas={['Строительное...', 'dfkjas']}
            comment={"Здесь будет длинный комментарий ли очень длинный"}
        /> */}


    </div>
  );
};

export default OrgModalDepartSection;