import './App.css';

import { useRef, useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { BASE_NAME, BASE_ROUTE, CSRF_TOKEN, PRODMODE } from './config/config';

import './assets/theme.css';
import './assets/layout.css';
import './assets/table.css';
import './assets/redefiner.css';
import './assets/sider.css';

import TopMenu from './components/template/topmenu/TopMenu';
import OrgListPage from './modules/ORG_LIST/OrgListPage';
import OrgPage from './modules/ORG_PAGE/OrgPage';
import BidListPage from './modules/BID_LIST/BidListPage';
import BidPage from './modules/BID_PAGE/BidPage';
import BidPdfCreator from './modules/BID_PAGE/components/print/BidPdfCreator';
import Price from './modules/PRICE/Price';
import CuratorExpiredMonitor from './modules/CURATOR_TOOLS/CuratorExpiredMonitor';
import CuratorPage from './modules/CURATOR/CuratorPage';
import EngineerListPage from './modules/ENGINEER_LIST/EngineerListPage';
import EngineerPage from './modules/ENGINEER_PAGE/EngineerPage';
import AntdIconsPage from './modules/DEV/Icons/AntdIconsPage';
import HeroIconsPage24 from './modules/DEV/Icons/HeroIconsPage24';
import CustomIconPage from './modules/DEV/Icons/CustomIconsPage';

import { UserDataProvider } from './context/UserDataContext';
import { PROD_AXIOS_INSTANCE } from './config/Api';
import { MS_USER } from './mock/MAINSTATE';

export const App = () => {
	const [userdata, setUserdata] = useState([]);
	const [pageLoaded, setPageLoaded] = useState(false);
	const [topRole, setTopRole] = useState('');

	const mainSocketRef = useRef(null);
	const skudSocketRef = useRef(null);
	const userRef = useRef(userdata);

	useEffect(() => {
		userRef.current = userdata;
	}, [userdata]);

	useEffect(() => {
		if (PRODMODE) {
			get_userdata();
		} else {
			setUserdata(MS_USER);
			setTopRole([7, 8, 20].includes(MS_USER.user?.id_departament) ? '/engineer' : '/orgs');
		}
	}, []);

	useEffect(() => {
		console.log('topRole: ', topRole);
	}, [topRole]);

	const get_userdata = async () => {
		if (PRODMODE) {
			try {
				let response = await PROD_AXIOS_INSTANCE.get('/usda?_token=' + CSRF_TOKEN);
				setUserdata(response.data);
				setTopRole(
					[7, 8, 20].includes(response?.data?.user?.id_departament) ? '/engineer' : '/orgs'
				);
			} catch (e) {
				console.log(e);
			} finally {
				setPageLoaded(true);
			}
		} else {
			setPageLoaded(true);
		}
	};

	/** ---------- MAIN WebSocket ---------- */
	const handleMainWSMessage = useCallback((event) => {
		try {
			const message = JSON.parse(event.data);
			console.log('[WS-MAIN] Message received:', message);

			switch (message.action) {
				case 'PING':
					console.log('[WS-MAIN] PING received');
					break;
				case 'NEWMESSAGE':
					console.log('[WS-MAIN] New message:', message.text);
					break;
				case 'NOTIFY':
					console.log('[WS-MAIN] Notification:', message.title, message.text);
					break;
				default:
					console.warn('[WS-MAIN] Unknown action:', message.action);
			}
		} catch (error) {
			console.error('[WS-MAIN] Failed to parse message:', error);
		}
	}, []);

	const connectMainWebSocket = useCallback(() => {
		if (!userdata?.user || mainSocketRef.current) return;

		const socket = new WebSocket(`ws://${window.location.hostname}:5001`);
		mainSocketRef.current = socket;

		socket.onopen = () => {
			console.log('[WS-MAIN] Connected');
		};

		socket.onmessage = handleMainWSMessage;

		socket.onclose = () => {
			console.warn('[WS-MAIN] Connection closed');
			mainSocketRef.current = null;
		};

		socket.onerror = (error) => {
			console.error('[WS-MAIN] Error:', error);
			socket.close();
			mainSocketRef.current = null;
		};
	}, [userdata, handleMainWSMessage]);

	/** ---------- SKUD WebSocket ---------- */
	const handleSkudWSMessage = useCallback((event) => {
		try {
			const message = JSON.parse(event.data);
			console.log('[WS-SKUD] Message received:', message);

			switch (message.action) {
				case 'SKUD_PING':
					console.log('[WS-SKUD] PING received');
					break;
				case 'EVENT_ENTRY':
					console.log(`[WS-SKUD] Сотрудник ${message.employee_name} вошёл в ${message.door}`);
					break;
				case 'ACCESS_DENIED':
					console.warn(`[WS-SKUD] Доступ отказан для ${message.employee_name} (${message.reason})`);
					break;
				default:
					console.warn('[WS-SKUD] Unknown action:', message.action);
			}
		} catch (error) {
			console.error('[WS-SKUD] Failed to parse message:', error);
		}
	}, []);

	const connectSkudWebSocket = useCallback(() => {
		if (!userdata?.user || skudSocketRef.current) return;

		const socket = new WebSocket(`ws://${window.location.hostname}:5002`);
		skudSocketRef.current = socket;

		socket.onopen = () => {
			console.log('[WS-SKUD] Connected');
		};

		socket.onmessage = handleSkudWSMessage;

		socket.onclose = () => {
			console.warn('[WS-SKUD] Connection closed');
			skudSocketRef.current = null;
		};

		socket.onerror = (error) => {
			console.error('[WS-SKUD] Error:', error);
			socket.close();
			skudSocketRef.current = null;
		};
	}, [userdata, handleSkudWSMessage]);

	/** ---------- Инициализация обоих сокетов ---------- */
	useEffect(() => {
		connectMainWebSocket();
		connectSkudWebSocket();

		return () => {
			if (mainSocketRef.current) {
				mainSocketRef.current.close();
				mainSocketRef.current = null;
			}
			if (skudSocketRef.current) {
				skudSocketRef.current.close();
				skudSocketRef.current = null;
			}
		};
	}, [connectMainWebSocket, connectSkudWebSocket]);

	/** ---------- UI ---------- */
	return (
		<div className="App">
			<UserDataProvider>
				<BrowserRouter basename={BASE_NAME}>
					<TopMenu userdata={userdata} changed_user_data={setUserdata} />
					<div>
						<Routes>
							<Route path="/" element={<Navigate to={topRole} replace />} />
							<Route path={BASE_ROUTE + '/'} element={<Navigate to={topRole} replace />} />

							<Route path={BASE_ROUTE + '/orgs'} element={<OrgListPage userdata={userdata} />} />
							<Route path="/orgs" element={<OrgListPage userdata={userdata} />} />

							<Route
								path={BASE_ROUTE + '/orgs/:item_id'}
								element={<OrgPage userdata={userdata} />}
							/>
							<Route path="/orgs/:item_id" element={<OrgPage userdata={userdata} />} />

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
								element={<BidPdfCreator userdata={userdata} changed_user_data={setUserdata} />}
							/>
							<Route
								path="/bidsPDF/:bidId"
								element={<BidPdfCreator userdata={userdata} changed_user_data={setUserdata} />}
							/>

							<Route path={BASE_ROUTE + '/price'} element={<Price userdata={userdata} />} />
							<Route path="/price" element={<Price userdata={userdata} />} />

							<Route
								path={BASE_ROUTE + '/curator/exmonitor'}
								element={<CuratorExpiredMonitor userdata={userdata} />}
							/>
							<Route
								path="/curator/exmonitor"
								element={<CuratorExpiredMonitor userdata={userdata} />}
							/>

							<Route path={BASE_ROUTE + '/curator'} element={<CuratorPage userdata={userdata} />} />
							<Route path="/curator" element={<CuratorPage userdata={userdata} />} />

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
					</div>
				</BrowserRouter>
			</UserDataProvider>
		</div>
	);
};
