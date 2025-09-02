import React, { useEffect, useState } from 'react';

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
        <div className={'sa-org-bill-row'}>
            <div>
                  <div>
                    Дата
                  </div>
              </div>
              <div>
                  <div>
                    
                    Номер
                  </div>
              </div>
              <div>
                  <div>
                    Контактное лицо
                  </div>
              </div>
              <div>
                  <div>
                  Менеджер
                  </div>
              </div>
              <div>
                  <div>
                  Статус
                  </div>
              </div>
              <div>
                  <div>
                  Комментарий
                  </div>
              </div>
          </div>
        </div>
  );
};

export default OrgCallsModalRow;