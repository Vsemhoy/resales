import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';


const OrgBidTabRow = (props) => {
    const [bidData, setBidData] = useState(null);

    const [date, setDate] = useState(null);

    useEffect(() => {
      setBidData(props.data);
      
      if (props.data.date){
        setDate(dayjs(props.data.date * 1000));
      }
    }, [props.data]);

    useEffect(() => {
       console.log('date', date)
    }, [date]);


  return (
    <>
    <div className={'sa-org-bid-row'}>
        <div>
            <div>
               {date?.format('DD.MM.YYYY')}
            </div>
        </div>
        <div>
            <div>
            <NavLink to={'/bids/' + bidData?.id}>

            {bidData?.id}
            </NavLink>
            </div>
        </div>
        <div>
            <div>
            {bidData?.company_name}
            </div>
        </div>
        <div>
            <div>
            {bidData?.curatorname}
            </div>
        </div>
        <div>
            <div>
            {bidData?.pay_status}
            </div>
        </div>
        <div>
            <div>
            {bidData?.comment}
            </div>
        </div>
    </div></>
  );
};

export default OrgBidTabRow;