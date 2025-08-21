import React, { useEffect, useState } from 'react';
import OrgModalRow from './OrgModalRow';

const defData = {
    "id": 27,
    "name": "Без имени",
    "site": "www.kapproekt.ru",
    "id8an_profiles": 5,
    "id_orgs8an_licenses": 0,
    "id_orgs8an_tolerance": 0,
    "kindofactivity": "проектирование",
    "middlename": "",
    "id8an_status": 2,
    "id_orgs8an_orgsusers": 0,
    "id8an_relations": 0,
    "id8staff_list": null,
    "source": "Русский бизнес. Север-2007",
    "id8org_regions": 1,
    "id8org_towns": 332,
    "id_orgs8an_legaladdress": 0,
    "id_orgs8an_address": 0,
    "id_orgs8an_phones": 0,
    "id_orgs8an_fax": 0,
    "id_orgs8an_email": 0,
    "id_orgs8an_project": null,
    "addresscomment": "",
    "id_orgs8an_notes": 0,
    "id_orgs8an_calls": 0,
    "id_orgs8an_meeting": 0,
    "id8an_orgs8an_request": 0,
    "id8an_subcontract": 0,
    "id8staff_list7author": 0,
    "id_orgs8an_list": 0,
    "deleted": 0,
    "id8an_fs": 45,
    "date_dealer": "0000-00-00",
    "id8an_customertypes": 0,
    "id8an_dept": 2,
    "id_orgs8an_log": 0,
    "id8an_statusmoney": 1,
    "id8an_conveyance": 0,
    "comment": "",
    "hashblack": "496dfd54f5a46d69466894c7cb651a22d1f2a323",
    "tv": 0,
    "commentinlist": "",
    "warningcmpcount": "",
    "warningcmpcomment": "",
    "inn": "",
    "profsound": null,
    "date_create": "0000-00-00 00:00:00",
    "id_company": 1,
}


const OrgModalCommonSection = (props) => {
    const [orgData, setOrgData] = useState(defData);

    useEffect(() => {
        if (props.data){
            setOrgData(props.data);
        } else {
            setOrgData(defData);
        }
        console.log(props.data);
    }, [props.data]);

  return (
    <div className={'sk-omt-stack'}
    style={{borderLeft: '4px solid seagreen'}}
    >

        <OrgModalRow
            key={'orgmodalrowcname_1'}
            titles={['Название организации']}
            datas={[orgData.name]}
            comment={"Здесь будет длинный комментарий ли очень длинный"}
        />

        <OrgModalRow
            key={'orgmodalrowcname_fs'}
            titles={['Форма собственности', 'ИНН']}
            datas={['Тестовая карточка ', orgData.inn]}
        />

        <OrgModalRow
        key={'orgmodalrowcname_vd'}
            titles={['Вид деятельности']}
            datas={['Тестовая  ']}
        />

        <OrgModalRow
            key={'orgmodalrowcname_sn'}
            titles={['Второе название']}
            datas={[orgData.middlename]}
        />

        <OrgModalRow
            key={'orgmodalrowcname_pk'}
            titles={['Профиль компании', 'Проф звук']}
            datas={['Тестовая карточка организации', orgData.profsound && orgData.profsound > 0 ? "Есть" : "Нет" ]}
        />

        <OrgModalRow
            key={'orgmodalrowcname_rc'}
            titles={['Источник']}
            datas={[orgData.source]}
        />

        <OrgModalRow
            key={'orgmodalrowcname_fsmt'}
            titles={['Комментарий']}
            datas={[orgData.comment]}
        />

        <OrgModalRow
            key={'orgmodalrowcname_mmr'}
            titles={['Памятка']}
            datas={[orgData.commentinlist]}
        />
        

    </div>
  );
};

export default OrgModalCommonSection;