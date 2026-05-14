import React, { useCallback, useEffect, useState, useRef } from 'react';
import './style/topmenu.css';
import ChatBtn from '../../../modules/CHAT/components/ChatBtn';

import { Chat, ChatSocketProvider } from 'corp-chat-library-antd-react-socket';
//import 'corp-chat-library-antd-react-socket/dist/style.css';

import { NavLink } from 'react-router-dom';
import {BASE_ROUTE, BFF_PORT, CSRF_TOKEN, HTTP_HOST, PRODMODE, ROUTE_PREFIX} from '../../../config/config';
import {
	CalendarOutlined,
	CloseCircleOutlined,
	HomeFilled,
	LoginOutlined,
	NotificationOutlined,
	UserOutlined,
	WechatWorkOutlined
} from '@ant-design/icons';
import LogoArstel, { LogoArstelLight } from '../../../assets/Comicon/Logos/LogoArstel';
import LogoRondo, { LogoRondoLight } from '../../../assets/Comicon/Logos/LogoRondo';
import {Avatar, Badge, Button, Dropdown} from 'antd';
import { ShortName } from '../../helpers/TextHelpers';
import {
	ArrowTopRightOnSquareIcon,
	BugAntIcon,
	ClipboardDocumentListIcon,
	Cog6ToothIcon,
	RectangleStackIcon,
	ShieldCheckIcon,
	UserCircleIcon,
} from '@heroicons/react/24/outline';
import { PROD_AXIOS_INSTANCE } from '../../../config/Api';
import NotiBtn from "../../../modules/NOTIFIER/NotiBtn";
import Notificator from "corp-notificator-library-antd-react-socket";
import BugModal from '../../../modules/EXT/BUGMODAL/BugModal';



const TopMenu = (props) => {
		const [userdata, setUserdata] = useState(props.userdata);
	// const { userdata, setUserdata } = useUserData();
	const [roleMenu, setRoleMenu] = useState([]);
	const [companiesMenu, setCompanieseMenu] = useState([]);
	const [topRole, setTopRole] = useState(1);
	const [showDebugger, setShowDebugger] = useState(false);
	const debuggerRef = useRef(null);
	const [isAdmin, setIsAdmin] = useState(false);

	const [openBugModal, setopenBugModal] = useState(false);

	const [bugMultiCounter, setBugMultiCounter] = useState([0,0,0,0]);

	const requestBrowserNotificationPermission = useCallback(async () => {
		if (!('Notification' in window) || Notification.permission !== 'default') {
			return;
		}

		try {
			await Notification.requestPermission();
		} catch (error) {
			console.log('Browser notification permission request failed:', error);
		}
	}, []);

	const handleNewNotification = useCallback((notification) => {
		if (!('Notification' in window) || Notification.permission !== 'granted') {
			return;
		}

		const title = notification?.name || 'Новое уведомление';
		const body = notification?.message || notification?.content || '';

		new Notification(title, {
			body,
			icon: '/favicon.ico',
			tag: notification?.id ? `notification-${notification.id}` : undefined,
		});
	}, []);

	useEffect(() => {
		setUserdata(props.userdata);
		if (props.userdata?.user?.is_admin){
			setIsAdmin(true);
		}
	}, [props.userdata]);

	useEffect(() => {
		requestBrowserNotificationPermission();

		const handleFirstUserAction = () => {
			requestBrowserNotificationPermission();
		};

		window.addEventListener('click', handleFirstUserAction, { once: true });
		window.addEventListener('keydown', handleFirstUserAction, { once: true });

		return () => {
			window.removeEventListener('click', handleFirstUserAction);
			window.removeEventListener('keydown', handleFirstUserAction);
		};
	}, [requestBrowserNotificationPermission]);

	// Закрытие debugger при клике вне компонента
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (debuggerRef.current && !debuggerRef.current.contains(event.target)) {
				setShowDebugger(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	useEffect(() => {
		if (!userdata || userdata.length === 0) {
			return;
		}

		let activeRole = userdata.user?.sales_role;
		let activeCompany = userdata.user?.active_company;
		let roles = [];

		if ([7, 8, 20].includes(userdata.user?.id_departament)) {
			setTopRole(1);
		} else {
			setTopRole(2);
		}

		if (userdata.user.sales_role === 3) {
			setTopRole(3);
		}


		if (!activeRole || activeRole === 0) {
			changeUserRole(1);
			activeRole = 1;
		}
		let comps = userdata.companies?.filter((item) => item.id > 1) ?? [];

		for (let i = 0; i < comps.length; i++) {
			const company = comps[i];
			if (!activeCompany || activeCompany < 2) {
				if (company.places && company.places.length > 0) {
					activeCompany = company.id;
					changeUserCompany(activeCompany);
				}
			}

			if (company.id === activeCompany && company.places?.length > 0) {
				const roleItems = company.places.map((place) => ({
					key: `rolecom_${company.id}_${place.id}`,
					label: (
						<div
							className={place.place === activeRole ? 'active' : ''}
							onClick={() => place.place !== activeRole && changeUserRole(place.place)}
						>
							{place.accessname}
						</div>
					),
					danger: place.place === activeRole,
					icon: (() => {
						switch (place.place) {
							case 1:
								return <UserCircleIcon height="18px" />;
							case 2:
								return <ClipboardDocumentListIcon height="18px" />;
							case 3:
								return <ShieldCheckIcon height="18px" />;
							default:
								return null;
						}
					})(),
				}));

				roles.push(...roleItems);
			}
		}

		setCompanieseMenu(
			comps.map((item) => ({
				key: 'compas_' + item.id,
				label: (
					<div
						className={`${item.id === activeCompany ? 'active' : ''}`}
						onClick={() => {
							if (item.id !== activeCompany) {
								changeUserCompany(item.id);
							}
						}}
					>
						{item.name}
					</div>
				),
				danger: item.id === activeCompany,
			}))
		);

		setRoleMenu(roles);
	}, [userdata]);

	const userMenuItems = [
		{
			key: 'status',
			label: 'Статус: Онлайн',
		},
		{
			key: 'loclog',
			label: <NavLink to="/loclog"><div>Локальные логи</div></NavLink>,
			icon: <RectangleStackIcon height={'18px'} />,
		},
		{
			key: `${HTTP_HOST}/logout`,
			label: <NavLink to={`${HTTP_HOST}/logout`}>Выйти</NavLink>,
			icon: <LoginOutlined />,
		},
	];

	/** ------------------ FETCHES ---------------- */
	const set_user_company = async (newcom) => {
			try {
				let response = await PROD_AXIOS_INSTANCE.post(`${ROUTE_PREFIX}/update/active_company`, {
					id_company: newcom,
					_token: CSRF_TOKEN,
				});
				if (response.data) {
					//setUserdata(response.data); // Обновляем данные пользователя
					props.changed_user_data();
				}
			} catch (e) {
				console.log(e);
			}
	};

	const changeUserCompany = (company_id) => {
		set_user_company(company_id).then();
	};

	const changeUserRole = (role_id) => {
		//set_user_role(role_id);
	};


	return (
		<div className="sa-top-menu" style={{ padding: '0 12px' }}>
			<div className={'sa-flex-space'}>
				<div className={'sa-top-menu-buttons'}>
					<NavLink to={`${HTTP_HOST}:3000`}>
						<div className={'sa-topmenu-button'}>
							<HomeFilled />
						</div>
					</NavLink>

					{[2, 3].includes(topRole) && (
						<NavLink to="/orgs">
							<div className={'sa-topmenu-button'}>Организации</div>
						</NavLink>
					)}

                    <NavLink to="/bids">
                        <div className={'sa-topmenu-button'}>Заявки</div>
                    </NavLink>

					{[2, 3].includes(topRole) && (
						<NavLink to="/price">
							<div className={'sa-topmenu-button'}>Прайс</div>
						</NavLink>
					)}

					{topRole === 2 && (
						<NavLink to="/curator">
							<div className={'sa-topmenu-button'}>Кураторство</div>
						</NavLink>
					)}

					<NavLink to="/regtown">
						<div className={'sa-topmenu-button'}>Города и регионы</div>
					</NavLink>

					<NavLink to="/engineer">
						<div className={'sa-topmenu-button'}>Инженеры</div>
					</NavLink>

					{topRole === 3 && (
						<NavLink to="/files_buh">
							<div className={'sa-topmenu-button'}>Выгрузка счетов</div>
						</NavLink>
					)}
				</div>

				<div className={'sa-topmenu-userbox'}>
                    <div style={{ padding: '6px 12px' }}>
                        <Button color={'geekblue'}
                                variant={'solid'}
                                onClick={()=>{setopenBugModal(!openBugModal)}}
                        >
                            <BugAntIcon height={'16px'}/>
                            {+bugMultiCounter[0] > 0 && (
                                <span className={'notification-badge'}>{bugMultiCounter[0]}</span>
                            )}
                        </Button>
                    </div>

                    <Button color={'primary'}
                            variant={'solid'}
                            onClick={()=>{window.open('/calendar')}}
                    >
                        <CalendarOutlined height={'16px'} />
                    </Button>

                    <Chat userdata={userdata}
                          httpParams={{
                              HTTP_HOST: HTTP_HOST,
                              BFF_PORT: BFF_PORT,
                              CSRF_TOKEN: CSRF_TOKEN,
                              PRODMODE: PRODMODE,
                              PROD_AXIOS_INSTANCE: null,
                          }}
                          fetchParams={{
                              fetchChatsListPath:       `${HTTP_HOST}${ROUTE_PREFIX}/sms`,
                          fetchChatMessagesPath:        `${HTTP_HOST}${ROUTE_PREFIX}/sms`,
                              sendSmsPath:              `${HTTP_HOST}${ROUTE_PREFIX}/sms/create/sms`,
                              markMessagesAsReadPath:   `${HTTP_HOST}${ROUTE_PREFIX}/sms/read`,
                          }}
                          socketSubscribe={{
                              subscribeToChat: 'subscribeToChat'
                          }}
                          socketActions={{
                              newSms: 'new:sms',
                              updateSms: 'update:sms',
                          }}
                    />
                    <Notificator userdata={userdata}
                                 httpParams={{
                                     HTTP_HOST: HTTP_HOST,
                                     BFF_PORT: BFF_PORT,
                                     CSRF_TOKEN: CSRF_TOKEN,
                                     PRODMODE: PRODMODE,
                                     PROD_AXIOS_INSTANCE: null,
                                 }}
                                 socketSubscribe={{
                                     subscribeToNotification: 'subscribeToNotification'
                                 }}
                                 socketActions={{
                                     newNotification: 'new:notification',
                                     readNotification: 'read:notification',
                                 }}
                                 onNewAlert={props.onNewAlert}
                                 onNewNotification={handleNewNotification}
                    />
                    {/*<NotiBtn />*/}
					{/*
					<Dropdown menu={{ items: userMenuItems }}>
						<div className={'sa-flex-gap'}>
							{ShortName(userdata?.user?.surname, userdata?.user?.name, userdata?.user?.secondname)}
						</div>
					</Dropdown>
					*/}
					<Dropdown menu={{ items: userMenuItems }} trigger={['hover']}>
						<div
							style={{
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								margin: '0 8px',
								height: '32px',
								padding: '0 12px',
								borderRadius: '6px',
								border: '1px solid color-mix(in srgb, var(--app-primary-color) 52%, var(--table-border-divider-color))',
								background: 'color-mix(in srgb, var(--app-soft-surface-color) 86%, #ffffff 14%)',
								boxShadow: 'rgba(255, 255, 255, 0.55) 0px 0px 2px',
								backdropFilter: 'blur(6px)',
								boxSizing: 'border-box',
							}}
						>
							{userdata?.user ? (
								<div style={{ display: 'flex', alignItems: 'center', gap: '8px', lineHeight: 1 }}>
									<Avatar
										size={22}
										style={{
											backgroundColor: '#fff',
											color: '#000',
											border: '1px solid rgba(34, 60, 80, 0.24)',
											boxShadow: 'rgba(255, 255, 255, 0.55) 0px 0px 2px',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
										}}
										icon={<UserOutlined />}
									/>
									<span style={{fontWeight: 500, color: 'var(--app-text-color)', fontSize: '14px', whiteSpace: 'nowrap'}}>
										{userdata.user.surname} {userdata.user.name}
									</span>
								</div>
							) : (
								<span>Пользователь</span>
							)}
						</div>
					</Dropdown>
					<Dropdown menu={{ items: companiesMenu }}>
						<div style={{ padding: '2px 14px' }}>
							{userdata?.user?.active_company < 2 && <span>No active company ({userdata?.user?.active_company})</span>}
							{userdata?.user?.active_company === 2 && <LogoArstelLight height="30px" />}
							{userdata?.user?.active_company === 3 && <LogoRondoLight height="30px" />}
						</div>
					</Dropdown>
				</div>
			</div>

			<BugModal
				visible={openBugModal}
				onClose={()=>{setopenBugModal(false)}}
				userdata={userdata}
				on_set_counts={((cnt)=>{setBugMultiCounter(cnt)})}
				/>

		</div>
	);
};

export default TopMenu;
