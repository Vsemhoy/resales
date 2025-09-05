import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

const OrgHistoryModalRow = (props) => {

  const [baseData, setBaseData] = useState(null);
  const [orgId, setOrgId] = useState(null);

  const [typeClass, setTypeClass] = useState('sa-orghistory-type-create');
  const [typeName, setTypeName] = useState('Создание');

  useEffect(() => {
    setBaseData(props.data);
  }, [props.data]);

  useEffect(() => {
    setOrgId(props.org_id);
  }, [props.org_id]);


  useEffect(() => {
    if (baseData?.type){
      switch (baseData.type){
        case 1:
          setTypeClass('sa-orghistory-type-create') ;
          setTypeName('Создание');
          break;
        case 2:
          setTypeClass('sa-orghistory-type-update') ;
          setTypeName('Редактирование');
          break;
        case 3:
          setTypeClass('sa-orghistory-type-delete') ;
          setTypeName('Удаление');
          break;
        case 4:
          setTypeClass('sa-orghistory-type-treet') ;
          setTypeName('Дериватив');
          break;
        case 5:
          setTypeClass('sa-orghistory-type-curator') ;
          setTypeName('Смена куратора');
          break;
        default: 
        setTypeClass('sa-orghistory-type-null') ;
        setTypeName('Не определено');
      } 
    }
  }, [baseData]);



  const getPath = (data) => {
    if (!data || data.length < 1){ return ""};
    let result = "";
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      if (result.length > 0){
        result += "  →  ";
      };
      result += element;
    }
    return result;
  }


  return (
    <div className={'sa-org-row-wrapper'}>
        <div className={`sa-org-history-row ${typeClass}`}>

              <div>
                  <div className='sa-orghistory-datacell'>
                    
                    {baseData && baseData?.date && dayjs.unix(baseData.date).format('HH:mm:ss')}
                  </div>
              </div>
              <div>
                  <div className='sa-orghistory-datacell'>
                    {baseData && (
                      <div>{getPath(baseData.path)}</div>
                    )}
                  </div>
              </div>
              <div>
                  <div className='sa-orghistory-datacell'>
                  {baseData?.old}
                  </div>
              </div>
              <div>
                  <div className='sa-orghistory-datacell'>
                  {baseData?.new}
                  </div>
              </div>
              <div>
                  <div className='sa-orghistory-datacell'>
                  {baseData?.shortUserName}
                  </div>
              </div>
              <div>
                  <div className='sa-orghistory-datacell'>
                    {typeName}
                  </div>
              </div>
          </div>
        </div>
  );
};

export default OrgHistoryModalRow;