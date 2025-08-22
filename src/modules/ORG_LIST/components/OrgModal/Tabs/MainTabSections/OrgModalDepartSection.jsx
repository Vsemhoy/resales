import React, { useEffect, useState } from 'react';
import OrgModalRow from './OrgModalRow';
import { ORG_DEF_DATA } from '../../../mock/ORGDEFDATA';


const OrgModalDepartSection = (props) => {
    const [orgData, setOrgData] = useState(ORG_DEF_DATA);

    useEffect(() => {
        if (props.data){
            setOrgData(props.data);
        } else {
            setOrgData(ORG_DEF_DATA);
        }
        console.log(props.data);
    }, [props.data]);



  return (
    <div className={'sk-omt-stack'}
        style={{borderLeft: '4px solid #2196f3'}}
    >

        <OrgModalRow
            key={'rowfla00222'}
            titles={['Автор', 'Куратор']}
            datas={[
                props.selects_data?.curators?.find((item)=> item.id === orgData.id8staff_list7author)?.name,
                props.selects_data?.curators?.find((item)=> item.id === orgData.id_orgs8an_orgsusers)?.name]}
        />

        <OrgModalRow
            key={'rowfla00223'}
            titles={['Отдел']}
            datas={['Тестовая карточка организации']}
        />

        <OrgModalRow
            key={'rowfla00224'}
            titles={['Статус $', 'Способ доставки']}
            datas={['Тестовая карточка организации', 'fjsalkdj']}
        />

        <OrgModalRow
            key={'rowfla00225'}
            titles={['Комментарии']}
            datas={['Тестовая карточка организации']}
        />

        <OrgModalRow
            key={'rowfla00226'}
            titles={['Списки', 'Комментарий']}
            datas={['Тестовая карточка организации','fklajdskl']}
        />

        <OrgModalRow
            key={'rowfla00227'}
            titles={['Лицензия МЧС', 'Комментарий', '№ Дата']}
            datas={['монтаж','Бессрочная', '56345']}
            comment={"Здесь будет длинный комментарий ли очень длинный"}
        />

        <OrgModalRow
            key={'rowfla00228'}
            titles={['Допуски СРО','№ Дата']}
            datas={['Строительное...', 'dfkjas']}
            comment={"Здесь будет длинный комментарий ли очень длинный"}
        />


    </div>
  );
};

export default OrgModalDepartSection;