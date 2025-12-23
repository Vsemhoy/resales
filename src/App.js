import './App.css';

import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import {BASE_NAME, BASE_ROUTE, CSRF_TOKEN, PRODMODE, BFF_PORT, HTTP_HOST} from './config/config';
import './assets/theme.css';
import './assets/layout.css';
import './assets/table.css';
import './assets/redefiner.css';
import './assets/sider.css';

import TopMenu from './components/template/topmenu/TopMenu';
import OrgListPage from './modules/ORG_LIST/OrgListPage';

import BidListPage from './modules/BID_LIST/BidListPage';
import BidPage from './modules/BID_PAGE/BidPage';
import BidPdfCreator from './modules/BID_PAGE/components/print/BidPdfCreator';
import Price from './modules/PRICE/Price';
import CuratorPage from './modules/CURATOR/CuratorPage';
import EngineerListPage from './modules/ENGINEER_LIST/EngineerListPage';
import EngineerPage from './modules/ENGINEER_PAGE/EngineerPage';
import AntdIconsPage from './modules/DEV/Icons/AntdIconsPage';
import HeroIconsPage24 from './modules/DEV/Icons/HeroIconsPage24';
import CustomIconPage from './modules/DEV/Icons/CustomIconsPage';
import { ChatSocketProvider } from './context/ChatSocketContext';
import { UserDataProvider } from './context/UserDataContext';
import { PROD_AXIOS_INSTANCE } from './config/Api';
import { MS_USER } from './mock/MAINSTATE';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { Dropdown } from 'antd';
import TorgPage from './modules/TORG_PAGE/TorgPage';
import Regtown from './modules/REGTOWN/Regtown';
import FilesBuhPage from "./modules/FILES_BUH/FilesBuhPage";

import {ResalesWebSocketProvider} from "./context/ResalesWebSocketContext";
import AlertCustom from "./components/template/Alert/AlertCustom";
import dayjs from "dayjs";
import BidPdfPage from "./modules/BID_PDF_PAGE/BidPdfPage";
import OrgPage from './modules/ORG_PAGE/OrgPage';
import LocalLogger from './modules/EXT/LOCAL_LOGGER/LocalLoggerPage';
import CuratorPageNEW from "./modules/CURATOR/CuratorPage";

export const App = () => {
	const [userdata, setUserdata] = useState({});
	const [pageLoaded, setPageLoaded] = useState(false);
	const [topRole, setTopRole] = useState('');

    const [isAlertVisibleKey, setIsAlertVisibleKey] = useState(0);
    const [alertInfo, setAlertInfo] = useState({
        message: '',
        description: '',
        type: 'info', //"success" | "info" | "warning" | "error"
    });

	useEffect(() => {
		if (PRODMODE) {
			get_userdata();
		} else {
			setUserdata(MS_USER);
			setTopRole([7, 8, 20].includes(MS_USER.user?.id_departament) ? '/engineer' : '/orgs');
			setPageLoaded(true);
		}
	}, []);

	useEffect(() => {
		console.log('topRole: ', topRole);
	}, [topRole]);

	useEffect(() => {
		const body = document.body;
		body.classList.remove('theme_1', 'theme_2');

		const activeTheme = (() => {
			const companyId = userdata?.user?.active_company;

			if (companyId === 2) return 'theme_1';
			if (companyId === 3) return 'theme_2';

			return 'theme_1'; // тема по умолчанию
		})();

		// Применяем выбранную тему
		body.classList.add(activeTheme);
	}, [userdata]);

	const get_userdata = async () => {
		try {
			let response = await PROD_AXIOS_INSTANCE.get('/usda?_token=' + CSRF_TOKEN);
			setUserdata(response.data);
			setTopRole([7, 8, 20].includes(response?.data?.user?.id_departament) ? '/engineer' : '/orgs');
		} catch (e) {
			console.error(e);
		} finally {
			setPageLoaded(true);
		}
	};

	const devMenu = [
		{
			key: 'devmenu_1',
			label: <NavLink to={'/dev/icons/heroicons24'}>Иконки</NavLink>,
		},

		{
			key: 'devmenu_1',
			label: <NavLink to={'/dev/icons/customicons'}>Сообщить о нарушении</NavLink>,
			danger: true,
		},
	];

	if (!pageLoaded) return null; // можно заменить на спиннер загрузки

    const updateAlert = (alert) => {
        setIsAlertVisibleKey(dayjs().unix());
        setAlertInfo(alert);
    };

	return (
		<UserDataProvider>
            <ResalesWebSocketProvider url={!PRODMODE ? `http://localhost:${BFF_PORT}` : `${HTTP_HOST}:${BFF_PORT}`}>
                <ChatSocketProvider url={!PRODMODE ? `http://localhost:${BFF_PORT}` : `${HTTP_HOST}:${BFF_PORT}`}>
                    <BrowserRouter basename={BASE_NAME}>
                        <div className={'app'}>
                            <TopMenu changed_user_data={() => get_userdata()}
                                     onNewAlert={updateAlert}
                                     userdata={userdata}
                            />
                            <div>
                                <Routes>
                                    <Route path="/" element={<Navigate to={topRole} replace />} />
                                    <Route
                                        path={BASE_ROUTE + '/'}
                                        element={<Navigate userdata={userdata} to={topRole} replace />}
                                    />

                                    <Route path={BASE_ROUTE + '/orgs'} element={<OrgListPage userdata={userdata} />} />
                                    <Route path="/orgs" element={<OrgListPage userdata={userdata} />} />

                                    <Route
                                        path={BASE_ROUTE + '/orgs/:item_id'}
                                        element={<TorgPage userdata={userdata} />}
                                    />
                                    <Route path="/orgs/:item_id" element={<TorgPage userdata={userdata} />} />


                                    <Route
                                        path={BASE_ROUTE + '/torgs/:item_id'}
                                        element={<OrgPage userdata={userdata} />}
                                    />


                                    {/* NEW VERSION TEST MAX */}
                                    <Route
                                        path={BASE_ROUTE + '/torgs/:item_id'}
                                        element={<TorgPage userdata={userdata} />}
                                    />
                                    <Route path="/torgs/:item_id" element={<TorgPage userdata={userdata} />} />
                                    {/* NEW VERSION TEST MAX */}

                                    <Route
                                        path={BASE_ROUTE + '/bids'}
                                        element={<BidListPage userdata={userdata} changed_user_data={setUserdata} />}
                                    />
                                    <Route
                                        path="/bids"
                                        element={<BidListPage userdata={userdata} changed_user_data={setUserdata} />}
                                    />

                                    <Route
                                        path={BASE_ROUTE + '/bids/:bidId'}
                                        element={<BidPage userdata={userdata} changed_user_data={setUserdata} />}
                                    />
                                    <Route
                                        path="/bids/:bidId"
                                        element={<BidPage userdata={userdata} changed_user_data={setUserdata} />}
                                    />

                                    <Route
                                        path={BASE_ROUTE + '/bidsPDF/:bidId'}
                                        element={<BidPdfPage userdata={userdata} changed_user_data={setUserdata} />}
                                    />
                                    <Route
                                        path="/bidsPDF/:bidId"
                                        element={<BidPdfPage userdata={userdata} changed_user_data={setUserdata} />}
                                    />

								{/*<Route*/}
								{/*	path={BASE_ROUTE + '/files_buh'}*/}
								{/*	element={<FilesBuhPage userdata={userdata} changed_user_data={setUserdata} />}*/}
								{/*/>*/}

                                    <Route path={BASE_ROUTE + '/loclog'} element={<LocalLogger userdata={userdata} />} />
                                    <Route path="/loclog" element={<LocalLogger userdata={userdata} />} />




                                    <Route path={BASE_ROUTE + '/price'} element={<Price userdata={userdata} />} />
                                    <Route path="/price" element={<Price userdata={userdata} />} />

                                    <Route
                                        path={BASE_ROUTE + '/curator'}
                                        element={<CuratorPage userdata={userdata} />}
                                    />
                                    <Route path="/curator" element={<CuratorPage userdata={userdata} />} />

                                    <Route path="/curator_new" element={<CuratorPageNEW userdata={userdata} />} />

                                    <Route path={BASE_ROUTE + '/regtown'} element={<Regtown userdata={userdata} />} />
                                    <Route path="/regtown" element={<Regtown userdata={userdata} />} />

                                    <Route
                                        path={BASE_ROUTE + '/engineer'}
                                        element={<EngineerListPage userdata={userdata} />}
                                    />
                                    <Route path="/engineer" element={<EngineerListPage userdata={userdata} />} />

                                    <Route
                                        path={BASE_ROUTE + '/engineer/:bidId'}
                                        element={<EngineerPage userdata={userdata} />}
                                    />
                                    <Route path="/engineer/:bidId" element={<EngineerPage userdata={userdata} />} />

                                    <Route
                                        path={BASE_ROUTE + '/dev/icons/antdicons'}
                                        element={<AntdIconsPage userdata={0} />}
                                    />
                                    <Route path="/dev/icons/antdicons" element={<AntdIconsPage userdata={0} />} />

                                    <Route
                                        path={BASE_ROUTE + '/dev/icons/heroicons24'}
                                        element={<HeroIconsPage24 userdata={0} />}
                                    />
                                    <Route path="/dev/icons/heroicons24" element={<HeroIconsPage24 userdata={0} />} />

                                    <Route
                                        path={BASE_ROUTE + '/dev/icons/customicons'}
                                        element={<CustomIconPage userdata={0} />}
                                    />
                                    <Route path="/dev/icons/customicons" element={<CustomIconPage userdata={0} />} />
                                </Routes>
                                {!PRODMODE && (
                                    <Dropdown menu={{ items: devMenu }}>
                                        <div
                                            style={{
                                                position: 'fixed',
                                                bottom: '0px',
                                                color: 'orangered',
                                                opacity: '0.9',
                                            }}
                                            title="DEV MODE"
                                        >
                                            <ExclamationTriangleIcon height={'64px'} />
                                        </div>
                                    </Dropdown>
                                )}
                            </div>
                            <AlertCustom alertInfo={alertInfo} isAlertVisibleKey={isAlertVisibleKey}/>
                        </div>
                    </BrowserRouter>
                </ChatSocketProvider>
            </ResalesWebSocketProvider>
		</UserDataProvider>
	);
};
