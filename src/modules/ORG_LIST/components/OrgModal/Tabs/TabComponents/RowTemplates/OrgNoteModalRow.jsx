import React, { useEffect, useState } from 'react';
import OrgModalRow from '../../MainTabSections/OrgModalRow';
import { TextWithLineBreaks } from '../../../../../../../components/helpers/TextHelpers';
import dayjs from 'dayjs';

const OrgNoteModalRow = (props) => {

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
            key={'rowfla0032241_' + orgId}
            titles={['Тема']}
            datas={[baseData?.theme]}
        />

        <OrgModalRow
            key={'rowfla0032251_' + orgId}
            titles={['Автор', 'Дата']}
            datas={[baseData?.creator ? baseData.creator.surname + " " + baseData.creator.name + " " + baseData.creator.secondname  : ""  ,
             baseData?.date ? dayjs(baseData.date).format("DD.MM.YYYY"): ""]}
        />

        <OrgModalRow
            key={'rowfla0032271_' + orgId}
            titles={['Заметка']}
            datas={[<TextWithLineBreaks text={baseData?.notes}/>]}
        />
      </div>
    </div>
  );
};

export default OrgNoteModalRow;