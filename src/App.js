import logo from './logo.svg';
import './App.css';
import { FaceFrownIcon } from '@heroicons/react/16/solid';

import { BellSlashIcon } from '@heroicons/react/24/solid';

import { GiftTopIcon } from '@heroicons/react/16/solid';
import HeroIconsPage from './modules/DEV/Icons/HeroIconsPage';

import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { BASE_NAME, BASE_ROUTE, CSRF_TOKEN, PRODMODE } from './config/config';
import HeroIconsPage24 from './modules/DEV/Icons/HeroIconsPage24';

import { BuildingLibraryIcon } from '@heroicons/react/24/solid';
import AntdIconsPage from './modules/DEV/Icons/AntdIconsPage';
import { ApiOutlined } from '@ant-design/icons';

import './assets/theme.css';
import './assets/layout.css';
import './assets/table.css';
import './assets/redefiner.css';
import './assets/sider.css';

import OrgPage from './modules/ORG_PAGE/OrgPage';
import { useEffect, useState } from 'react';
import TopMenu from './components/template/topmenu/TopMenu';
// import MainTabOutlet from './modules/ORG_PAGE/outlets/MainTabPage';
// import BillsOutlet from './modules/ORG_PAGE/outlets/BillsOutlet';
// import OffersOutlet from './modules/ORG_PAGE/outlets/OffersOutlet';
// import MeetingOutlet from './modules/ORG_PAGE/outlets/MeetingsOutlet';
// import NoteOutlet from './modules/ORG_PAGE/outlets/NoteOutlets';
// import HistoryOutlet from './modules/ORG_PAGE/outlets/HistoryOutlet';
import MyIcon from './modules/DEV/Icons/MyIcon';
import CustomIconPage from './modules/DEV/Icons/CustomIconsPage';
// import MainTabPage from './modules/ORG_PAGE/outlets/MainTabPage';
import OrgListPage from './modules/ORG_LIST/OrgListPage';
import BidListPage from './modules/BID_LIST/BidListPage';
import CuratorExpiredMonitor from './modules/CURATOR_TOOLS/CuratorExpiredMonitor';
import { PROD_AXIOS_INSTANCE } from './config/Api';
import { MS_USER } from './mock/MAINSTATE';
import Price from "./modules/PRICE/Price";
import CuratorPage from "./modules/CURATOR/CuratorPage";
import EngineerListPage from "./modules/ENGINEER_LIST/EngineerListPage";
import EngineerPage from "./modules/ENGINEER_PAGE/EngineerPage";
import BidPage from "./modules/BID_PAGE/BidPage";
import WinShellMessanger from './modules/DEV/COM/WINSHELL/WinShellMessanger';

function App() {
	const [userdata, setUserdata] = useState([]);
	const [pageLoaded, setPageLoaded] = useState(false);

	useEffect(() => {
		if (PRODMODE) {
			get_userdata();
		} else {
			setUserdata(MS_USER);
		}
	}, []);

	/** ------------------ FETCHES ---------------- */
	/**
	 * Получение списка отделов
	 * @param {*} req
	 * @param {*} res
	 */
	const get_userdata = async () => {
		if (PRODMODE) {
			try {
				// setLoadingOrgs(true)
				const format_data = {
					CSRF_TOKEN,
					data: {},
				};
				let response = await PROD_AXIOS_INSTANCE.get('/usda?_token=' + CSRF_TOKEN);
				console.log('me: ', response);
				// setOrganizations(organizations_response.data.org_list)
				// setTotal(organizations_response.data.total_count)
				setUserdata(response.data);
			} catch (e) {
				console.log(e);
			} finally {
				// setLoadingOrgs(false)
				setPageLoaded(true);
			}
		} else {
			//setUserAct(USDA);
			setPageLoaded(true);
		}
	};

	/** ------------------ FETCHES END ---------------- */

  return (
    <div className="App">
      <BrowserRouter basename={BASE_NAME}>

        <TopMenu
          userdata={userdata}
          changed_user_data={setUserdata}

          />
      
 
        {/* <WinShellMessanger /> */}

				<div>
					<Routes>
						{/* Редирект с корня на /orgs */}
						<Route path="/" element={<Navigate to="/orgs" replace />} />
						<Route path={BASE_ROUTE + '/'} element={<Navigate to="/orgs" replace />} />

						<Route path={BASE_ROUTE + '/orgs'} element={<OrgListPage userdata={userdata} />} />
						<Route path={'/orgs'} element={<OrgListPage userdata={userdata} />} />

						<Route path={BASE_ROUTE + '/orgs/:item_id'} element={<OrgPage userdata={userdata} />} />
						<Route path={'/orgs/:item_id'} element={<OrgPage userdata={userdata} />} />
						<Route path={'/orgs/:item_id'} element={<OrgPage userdata={userdata} />} />
						<Route path={BASE_ROUTE + '/orgs/:item_id'} element={<OrgPage userdata={userdata} />} />

						<Route
							path={BASE_ROUTE + '/bids'}
							element={<BidListPage userdata={userdata} changed_user_data={setUserdata} />}
						/>
						<Route
							path={'/bids'}
							element={<BidListPage userdata={userdata} changed_user_data={setUserdata} />}
						/>

						<Route
							path={BASE_ROUTE + '/bids/:bidId'}
							element={<BidPage userdata={userdata} changed_user_data={setUserdata} />}
						/>
						<Route
							path={'/bids/:bidId'}
							element={<BidPage userdata={userdata} changed_user_data={setUserdata} />}
						/>

						<Route path={BASE_ROUTE + '/price'} element={<Price userdata={userdata} />} />
						<Route path={'/price'} element={<Price userdata={userdata} />} />

						<Route
							path={BASE_ROUTE + '/curator/exmonitor'}
							element={<CuratorExpiredMonitor userdata={userdata} />}
						/>
						<Route
							path={'/curator/exmonitor'}
							element={<CuratorExpiredMonitor userdata={userdata} />}
						/>

						<Route path={BASE_ROUTE + '/curator'} element={<CuratorPage userdata={userdata} />} />
						<Route path={'/curator'} element={<CuratorPage userdata={userdata} />} />

						<Route
							path={BASE_ROUTE + '/engineer'}
							element={<EngineerListPage userdata={userdata} />}
						/>
						<Route path={'/engineer'} element={<EngineerListPage userdata={userdata} />} />

						<Route
							path={BASE_ROUTE + '/engineer/:item_id'}
							element={<EngineerPage userdata={userdata} />}
						/>
						<Route path={'/engineer/:item_id'} element={<EngineerPage userdata={userdata} />} />

						<Route
							path={BASE_ROUTE + '/dev/icons/antdicons'}
							element={<AntdIconsPage userdata={0} />}
						/>
						<Route path={'/dev/icons/antdicons'} element={<AntdIconsPage userdata={0} />} />

						<Route
							path={BASE_ROUTE + '/dev/icons/heroicons24'}
							element={<HeroIconsPage24 userdata={0} />}
						/>
						<Route path={'/dev/icons/heroicons24'} element={<HeroIconsPage24 userdata={0} />} />

              <Route path={BASE_ROUTE + '/dev/icons/customicons'} element={<CustomIconPage userdata={0}/>} />
              <Route path={'/dev/icons/customicons'} element={<CustomIconPage userdata={0}/>} />

          </Routes>

          
        </div>



      </BrowserRouter>
    </div>
  );
}

export default App;
