import React, { useEffect, useState } from 'react';
import OrgModalRow from '../../MainTabSections/OrgModalRow';

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
            key={'rowfla0032241'}
            titles={['Тема']}
            datas={[baseData?.t_name]}
        />

        <OrgModalRow
            key={'rowfla0032251'}
            titles={['Автор', 'Дата']}
            datas={[baseData?.theme, baseData?.date]}
        />

        <OrgModalRow
            key={'rowfla0032271'}
            titles={['Заметка']}
            datas={[baseData?.notes]}
        />
          </div>
        </div>
  );
};

export default OrgNoteModalRow;