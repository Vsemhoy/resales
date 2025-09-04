import React, { useEffect, useState } from 'react';
import OrgPageMainTabCommonSection from '../components/sections/MainTabSections/OrgPageMainTabCommonSection';
import OrgPageMainTabDepartSection from '../components/sections/MainTabSections/OrgPageMainTabDepartSection';
import OrgPageMainTabContactsSection from '../components/sections/MainTabSections/OrgPageMainTabContactsSection';
import OrgPageMainTabContactinfoSection from '../components/sections/MainTabSections/OrgPageMainTabContactinfoSection';
import OrgPageMainTabPayersSection from '../components/sections/MainTabSections/OrgPageMainTabPayersSection';

// import { useNavigate, useSearchParams } from 'react-router-dom';


const MainTabPage = (props) => {
  const [editMode, seteditMode] = useState(props.edit_mode ? props.edit_mode : false);

  useEffect(() => {
    seteditMode(props.edit_mode);
  }, [props.edit_mode]);

  return (
     <div className={'sk-omt-stack'}
    style={{borderLeft: '4px solid seagreen'}}
    >
      <OrgPageMainTabCommonSection
        edit_mode={editMode}
      />

      <OrgPageMainTabDepartSection
        edit_mode={editMode}
      />

            <OrgPageMainTabContactinfoSection
        edit_mode={editMode}
      />

            <OrgPageMainTabContactsSection
        edit_mode={editMode}
      />

            <OrgPageMainTabPayersSection
        edit_mode={editMode}
      />

    </div>
  );
};

export default MainTabPage;