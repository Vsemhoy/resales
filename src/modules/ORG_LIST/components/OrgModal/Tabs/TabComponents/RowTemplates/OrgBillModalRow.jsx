import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ShortName } from '../../../../../../../components/helpers/TextHelpers';
import { Tag, Tooltip } from 'antd';
import PositionList from '../../../../../../BID_LIST/components/PositionList';

const OrgBillModalRow = (props) => {

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
                    <NavLink to={'/bids/' + baseData?.id + '?frompage=orgs&fromtab=b&fromview=modal&fromid=' + baseData?.id }>
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
                    <Tooltip
                        placement="leftTop"
                        title={<PositionList bidId={baseData?.id} path={'/sales/data/getbidmodels'} />}
                        color="white"
                        overlayInnerStyle={{
                          color: 'black',
                          border: '1px solid #d9d9d9'
                        }}
                    >
                      <Tag color={"purple"}>{baseData?.count_models}</Tag>
                    </Tooltip>
                  </div>
              </div>
          </div>
        </div>
  );
};

export default OrgBillModalRow;