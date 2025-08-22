import React, { useEffect, useState } from 'react';
import OrgModalRow from './OrgModalRow';
import { ORG_DEF_DATA } from '../../../mock/ORGDEFDATA';



const OrgModalCommonSection = (props) => {
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
    style={{borderLeft: '4px solid seagreen'}}
    >

        <OrgModalRow
            key={'orgmodalrowcname_1'}
            titles={['Название организации']}
            datas={[orgData.name]}
        />

        <OrgModalRow
            key={'orgmodalrowcname_fs'}
            titles={['Форма собственности', 'ИНН']}
            datas={[
                props.selects_data?.fss?.find((item)=> item.id === orgData.id8an_fs)?.name
                , orgData.inn]}
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
            datas={[
                props.selects_data?.profiles?.find((item)=> item.id === orgData.id8an_profiles)?.name
                , orgData.profsound && orgData.profsound > 0 ? "Есть" : "Нет" ]}
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