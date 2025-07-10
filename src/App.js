import logo from './logo.svg';
import './App.css';
import { FaceFrownIcon } from '@heroicons/react/16/solid';

import { BellSlashIcon } from '@heroicons/react/24/solid';

import { GiftTopIcon } from '@heroicons/react/16/solid';
import HeroIconsPage from './modules/DEV/Icons/HeroIconsPage';

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { BASE_NAME, BASE_ROUTE } from './config/config';
import HeroIconsPage24 from './modules/DEV/Icons/HeroIconsPage24';

import { BuildingLibraryIcon } from '@heroicons/react/24/solid';
import AntdIconsPage from './modules/DEV/Icons/AntdIconsPage';
import { ApiOutlined } from '@ant-design/icons';


import './assets/theme.css';
import './assets/layout.css';
import OrgPage from './modules/ORG_PAGE/OrgPage';
import { useState } from 'react';
import TopMenu from './components/template/topmenu/TopMenu';
import MainTabOutlet from './modules/ORG_PAGE/outlets/MainTabOutlet';
import BillsOutlet from './modules/ORG_PAGE/outlets/BillsOutlet';
import OffersOutlet from './modules/ORG_PAGE/outlets/OffersOutlet';
import MeetingOutlet from './modules/ORG_PAGE/outlets/MeetingsOutlet';
import NoteOutlet from './modules/ORG_PAGE/outlets/NoteOutlets';
import HistoryOutlet from './modules/ORG_PAGE/outlets/HistoryOutlet';
import MyIcon from './modules/DEV/Icons/MyIcon';
import CustomIconPage from './modules/DEV/Icons/CustomIconsPage';

function App() {
  const [userdata, setUserdata] = useState([]);

  return (
    <div className="App">
      <BrowserRouter basename={BASE_NAME}>

        <TopMenu userdata={userdata} />
      
      {/* <MyIcon /> */}

        <div>
          <Routes>

            <Route path={BASE_ROUTE + '/orgs/:item_id'} element={<OrgPage userdata={userdata}/>} />
            <Route path={'/orgs/:item_id'} element={<OrgPage userdata={userdata}/>} />
            <Route path={'/orgs/:item_id'} element={<OrgPage userdata={userdata}/>} >
              <Route path={'main'} element={<MainTabOutlet userdata={userdata}/>} />
              <Route path={'bills'} element={<BillsOutlet userdata={userdata}/>} />
              <Route path={'offers'} element={<OffersOutlet userdata={userdata}/>} />
              <Route path={'meetings'} element={<MeetingOutlet userdata={userdata}/>} />
              <Route path={'notes'} element={<NoteOutlet userdata={userdata}/>} />
              <Route path={'history'} element={<HistoryOutlet userdata={userdata}/>} />
            </Route>


            <Route path={BASE_ROUTE + '/dev/icons/antdicons'} element={<AntdIconsPage userdata={0}/>} />
            <Route path={'/dev/icons/antdicons'} element={<AntdIconsPage userdata={0}/>} />

            <Route path={BASE_ROUTE + '/dev/icons/heroicons24'} element={<HeroIconsPage24 userdata={0}/>} />
            <Route path={'/dev/icons/heroicons24'} element={<HeroIconsPage userdata={0}/>} />

            
            <Route path={BASE_ROUTE + '/dev/icons/customicons'} element={<CustomIconPage userdata={0}/>} />
            <Route path={'/dev/icons/customicons'} element={<CustomIconPage userdata={0}/>} />

          </Routes>
        </div>

      </BrowserRouter>
    </div>
  );
}

export default App;
