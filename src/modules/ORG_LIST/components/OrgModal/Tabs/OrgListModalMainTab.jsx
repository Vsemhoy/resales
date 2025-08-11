import { Collapse } from 'antd';
import React, { useEffect, useState } from 'react';


const OrgListMainTab = (props) => {

  return (
    <div>
        <Collapse
            defaultActiveKey={['st_commoninfo', 'st_departinfo', 'st_contactinfo']}
            size={'small'}
            items={props.structure} />
    </div>
  );
};

export default OrgListMainTab;