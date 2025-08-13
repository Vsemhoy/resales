import { Pagination } from 'antd';
import React, { useEffect, useState } from 'react';
import OrgBidTabRow from './TabComponents/OrgBidTabRow';
import { PRODMODE } from '../../../../../config/config';
import { OM_ORG_BIDS } from '../../mock/ORGLISTMOCK';
import { NavLink } from 'react-router-dom';


const OrgListModalBillsTab = (props) => {
  const [baseBids, setBaseBids] = useState([]);
  const [currrentPage, setCurrrentPage] = useState(1);
  const [onPage, setOnPage] = useState(30);

  useEffect(() => {
    if (PRODMODE){


    } else {
      setBaseBids(OM_ORG_BIDS);
    }
  }, []);

  
  return (
    <div className={'sa-orgtab-container'}>
        <div className={'sa-pa-6'}>
          <Pagination size={'small'}

          />
        </div>
        <div>
            <div className={'sa-org-bid-row sa-org-bid-row-header'}>
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
          {baseBids.map((bid)=>(
            <OrgBidTabRow 
              data={bid}
            />
          ))}
        </div>
    </div>
  );
};

export default OrgListModalBillsTab;