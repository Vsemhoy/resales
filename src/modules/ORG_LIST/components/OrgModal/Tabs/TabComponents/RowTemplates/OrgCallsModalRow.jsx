import React, { useEffect, useState } from 'react';
import OrgModalRow from '../../MainTabSections/OrgModalRow';
import dayjs from 'dayjs';
import { TextWithLineBreaks } from '../../../../../../../components/helpers/TextHelpers';

const OrgCallsModalRow = (props) => {

  const [baseData, setBaseData] = useState(null);
  const [orgId, setOrgId] = useState(null);

  useEffect(() => {
    setBaseData(props.data);
  }, [props.data]);

  useEffect(() => {
    setOrgId(props.org_id);
  }, [props.org_id]);

return (
    <div className={'sa-org-row-wrapper'}>
      <div className={'sa-org-bill-tab-form'}>
        <OrgModalRow
            key={'rowfla_0032241'}
            titles={['Отдел', 'Автор']}
            datas={[baseData?.departament?.name, baseData?.id]}
        />

        <OrgModalRow
            key={'rowfla_0032251_' + orgId}
            titles={['Абонент', 'Должность']}
            datas={[baseData?.creator ? baseData.creator.surname + " " + baseData.creator.name + " " + baseData.creator.secondname  : ""  ,
             baseData?.date ? dayjs(baseData.date).format("DD.MM.YYYY"): ""]}
        />

        <OrgModalRow
            key={'rowfla_0032271_' + orgId}
            titles={['Цель встречи']}
            datas={[<TextWithLineBreaks text={baseData?.notes}/>]}
        />

        <OrgModalRow
            key={'rowfla_0032252_' + orgId}
            titles={['Дата', 'Телефон']}
            datas={[
             baseData?.date ? dayjs(baseData.date).format("DD.MM.YYYY"): "",
             baseData?.phone]}
        />

        <OrgModalRow
            key={'rowfla_0032253_' + orgId}
            titles={['Заметка']}
            datas={[<TextWithLineBreaks text={baseData?.note}/>]}
        />
        

        <OrgModalRow
            key={'rowfla_0032254_' + orgId}
            titles={['Результат']}
            datas={[<TextWithLineBreaks text={baseData?.result}/>]}
        />
        


      </div>
    </div>
  );
};

export default OrgCallsModalRow;