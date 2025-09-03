import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ShortName } from '../../../../../../../components/helpers/TextHelpers';

const OrgOfferlModalRow = (props) => {

  const [baseData, setBaseData] = useState(null);
  const [orgId, setOrgId] = useState(null);

  useEffect(() => {
    setBaseData(props.data);
    console.log(props.data);
  }, [props.data]);

  useEffect(() => {
    setOrgId(props.org_id);
  }, [props.org_id]);

  return (
    <div className={'sa-org-row-wrapper'}>
        <div className={`sa-org-bid-row ${baseData?.deleted === 1 ? 'sa-org-bid-row-deleted' : ''}`}>
            <div>
                  <div>
                    <NavLink to={'/bids/' + baseData?.id}>
                    {baseData?.id}</NavLink>
                  </div>
              </div>
            <div>
                  <div>
                    {baseData?.date ? dayjs.unix(baseData.date).format('DD.MM.YYYY') : "" }
                  </div>
              </div>


              <div>
                <div style={{textAlign: 'left'}}>
                    {baseData?.orguser_id ? (
                      <div>{baseData.contactuser?.lastname + " " + baseData.contactuser?.name  + " " + baseData.contactuser?.middlename}</div>
                    ) : ""}
                  </div>
              </div>
              <div>
                  <div>
                    {baseData?.user_id ? (
                      <div>{ShortName(baseData.manager?.surname, baseData.manager?.name,baseData.manager?.secondname)}</div>
                    ) : ""}
                  </div>
              </div>
             <div>
                  <div>
                  {baseData?.statusbid_id && baseData?.statusbid_id === 1 ? "Оплачено" : <span style={{color: 'gray'}} >Не оплачено</span>}
                  </div>
              </div>
              <div>
                  <div>
                  {baseData?.deleted === 1 ? "Удалено" : (<div>
                    {baseData?.place?.name}
                    </div>)}
                  </div>
              </div>
              <div>
                  <div style={{textAlign: 'left'}}>
                    {baseData?.comment}
                  </div>
              </div>
              <div>
                  <div style={{textAlign: 'left'}}>
                    {baseData?.project}
                  </div>
              </div>
              <div>
                  <div style={{wordBreak: 'break-all'}}>
                    {baseData?.count_models}
                  </div>
              </div>
          </div>
        </div>
  );
};

export default OrgOfferlModalRow;