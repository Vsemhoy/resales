import ClassicView from './TopMenu.classic.jsx';
import { usePageTheme } from '../../../context/PageThemeContext';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import CurrencyMonitorBar from '../CURRENCYMONITOR/CurrencyMonitorBar';
import ChatBtn from '../../../modules/CHAT/components/ChatBtn';
import dayjs from 'dayjs';

import { Chat, ChatSocketProvider } from 'corp-chat-library-antd-react-socket';
//import 'corp-chat-library-antd-react-socket/dist/style.css';

import { NavLink, useLocation } from 'react-router-dom';
import {BASE_ROUTE, BFF_PORT, CSRF_TOKEN, HTTP_HOST, PRODMODE, ROUTE_PREFIX} from '../../../config/config';
import {
	EllipsisOutlined,
	CalendarOutlined,
	BankOutlined,
	BgColorsOutlined,
	CloseCircleOutlined,
	DownOutlined,
	EnvironmentOutlined,
	FileTextOutlined,
	HomeOutlined,
	LoginOutlined,
	MediumOutlined,
	NotificationOutlined,
	SwapOutlined,
	TableOutlined,
	TeamOutlined,
	ToolOutlined,
	UserOutlined,
	UserSwitchOutlined,
	WechatWorkOutlined
} from '@ant-design/icons';
import {Button, Dropdown, Select, Menu, message} from 'antd';
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
import { EVENT_TYPES, fetchCalendarEvents } from '../../../modules/CALENDAR2/components/mock/CALENDARMOCK';

const CALENDAR_EVENT_TYPE_LABELS = {
	1: 'Встреча',
	2: 'Звонок',
};

const getCalendarEventTypeName = (event) => {
	const typeId = Number(event?.type ?? event?.type_id);

	return (
		event?.type_name ||
		event?.event_type_name ||
		EVENT_TYPES.find((item) => Number(item.id) === typeId)?.name ||
		CALENDAR_EVENT_TYPE_LABELS[typeId] ||
		'Событие'
	);
};

const getCalendarFilterUserId = (user) => (
	user?.id8staff_list ||
	user?.staff_id ||
	user?.id_staff ||
	user?.staffListId ||
	user?.id
);

const getCalendarEventContactName = (event) => (
	[
		event?.contact_user,
		event?.contact_name,
		event?.contactperson,
		event?.org_user_name,
		event?.orgUserName,
		event?.event_user_name,
	].find((value) => typeof value === 'string' && value.trim()) || ''
);

const TopMenu = (props) => {
	const location = useLocation();
		const [userdata, setUserdata] = useState(props.userdata);
	// const { userdata, setUserdata } = useUserData();
	const [roleMenu, setRoleMenu] = useState([]);
	const [topRole, setTopRole] = useState(1);
	const [showDebugger, setShowDebugger] = useState(false);
	const debuggerRef = useRef(null);
	const [isAdmin, setIsAdmin] = useState(false);

	const [openBugModal, setopenBugModal] = useState(false);

	const [bugMultiCounter, setBugMultiCounter] = useState([0,0,0,0]);
	const [todayEvents, setTodayEvents] = useState([]);
	const [calendarEventsLoading, setCalendarEventsLoading] = useState(false);

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

	const handleNewChatMessage = useCallback((payload) => {
		const message = payload?.right || payload?.sms || payload?.message || payload;
		const listMessage = payload?.left || {};
		const sender = listMessage?.from || {};
		const currentUserId = userdata?.user?.id;
		const senderId = message?.from_id || message?.from || sender?.id || listMessage?.from_id;

		if (!message || (currentUserId && senderId && +senderId === +currentUserId)) {
			return;
		}

		if (!('Notification' in window) || Notification.permission !== 'granted') {
			return;
		}

		const senderName = [sender?.surname, sender?.name].filter(Boolean).join(' ');
		const title = senderName || 'Новое сообщение';
		const body = message?.text || listMessage?.text || 'Новое сообщение';
		const messageId = message?.id || listMessage?.id || message?.created_at || listMessage?.created_at;

		new Notification(title, {
			body,
			icon: '/favicon.ico',
			tag: messageId ? `chat-message-${messageId}` : undefined,
		});
	}, [userdata?.user?.id]);

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

		setRoleMenu(roles);
	}, [userdata]);

	useEffect(() => {
		const user = userdata?.user;

		if (!user?.id) {
			setTodayEvents([]);
			return;
		}

		const today = dayjs().format('YYYY-MM-DD');
		const calendarUserId = getCalendarFilterUserId(user);
		const eventFilters = {
			companyId: user.active_company || 2,
			userIds: calendarUserId ? [calendarUserId] : [],
			types: [],
			dateFrom: today,
			dateTo: today,
			hasComments: false,
			currentUserId: user.id,
		};

		let isActual = true;
		setCalendarEventsLoading(true);

		const loadTodayEvents = async () => {
			try {
				if (PRODMODE) {
					const response = await PROD_AXIOS_INSTANCE.post(`${ROUTE_PREFIX}/calendar/events`, {
						data: {
							filters: eventFilters,
						},
						_token: CSRF_TOKEN,
					});

					if (isActual) {
						setTodayEvents(response.data?.content || []);
					}
				} else {
					const events = await fetchCalendarEvents(eventFilters);

					if (isActual) {
						setTodayEvents(events);
					}
				}
			} catch (e) {
				console.log(e);

				if (isActual) {
					setTodayEvents([]);
				}
			} finally {
				if (isActual) {
					setCalendarEventsLoading(false);
				}
			}
		};

		loadTodayEvents();

		return () => {
			isActual = false;
		};
	}, [userdata?.user?.active_company, userdata?.user?.id]);

	const companyOptions = (userdata?.companies || [])
		.filter((company) => Number(company.id) > 1)
		.map((company) => ({ value: Number(company.id), label: company.name }));
	const activeCompanyId = Number(userdata?.user?.active_company);
	const pageThemeOptions = [
		{ value: 'classic', label: 'Классическая' },
		{ value: 'main', label: 'Общая' },
	];

	const salesRoles = [
		{ value: 1, label: 'Менеджер', acl: 89 },
		{ value: 2, label: 'Администратор', acl: 91 },
		{ value: 3, label: 'Бухгалтер', acl: 90 },
		{ value: 4, label: 'Инженер', acl: 153 },
	];
	const salesRoleClass = ['','sa-select-custom-manager','sa-select-custom-admin','sa-select-custom-bugh','sa-select-custom-engineer'][Number(userdata?.user?.sales_role)] || '';
	const availableSalesRoles = salesRoles.filter((role) => userdata?.acls?.includes(role.acl));
	const changeSalesRole = async (value) => {
		try {
			await PROD_AXIOS_INSTANCE.post(`${ROUTE_PREFIX}/update/sales_role`, { place: value, _token: CSRF_TOKEN });
			props.changed_user_data?.();
		} catch (error) {
			message.error('Не удалось изменить роль');
		}
	};
	const userMenuItems = [
		{
			key: 'help',
			label: <NavLink to="/help"><div>Инструкция на модуль</div></NavLink>,
			icon: <MediumOutlined height={'28px'} />,
		},
		{
			key: 'loclog',
			label: <NavLink to="/loclog"><div>Локальные логи</div></NavLink>,
			icon: <RectangleStackIcon height={'18px'} />,
		},
		...(Number(userdata?.user?.sales_role) > 0 ? [{
			key: 'sales-role',
			className: 'sa-topmenu-user-menu-control-item',
			label: <div className="sa-topmenu-select-control" onClick={(event) => event.stopPropagation()}>
				<span className="sa-user-setting-label"><UserSwitchOutlined /> Роль:</span>
				{availableSalesRoles.length > 1 && ![7, 8, 20].includes(userdata?.user?.id_departament) ?
					<Select className={salesRoleClass} aria-label="Роль" size="small" value={Number(userdata.user.sales_role)} options={availableSalesRoles} onChange={changeSalesRole} getPopupContainer={(node) => node.parentElement} /> :
					<span className={salesRoleClass}>{salesRoles.find((role) => role.value === Number(userdata.user.sales_role))?.label}</span>}
			</div>,
		}] : []),

		...(companyOptions.length > 0
			? [{
				key: 'company-select',
				className: 'sa-topmenu-user-menu-control-item',
				label: (
					<div className="sa-topmenu-select-control sa-topmenu-select-control--company" onClick={(event) => event.stopPropagation()}>
						<span className="sa-user-setting-label"><BankOutlined /> Компания:</span>
						<Select
							aria-label="Компания"
							className="sa-topmenu-select"
							size="small"
							value={companyOptions.some((option) => option.value === activeCompanyId) ? activeCompanyId : undefined}
							options={companyOptions}
							placeholder="Выбрать"
							getPopupContainer={(triggerNode) => triggerNode.parentElement}
							onChange={(companyId) => changeUserCompany(companyId)}
						/>
					</div>
				),
			}]
			: []),
		{
			key: 'theme-select',
			className: 'sa-topmenu-user-menu-control-item',
			label: (
				<div className="sa-topmenu-select-control sa-topmenu-select-control--theme" onClick={(event) => event.stopPropagation()}>
					<span className="sa-user-setting-label"><BgColorsOutlined /> Тема страницы</span>
					<Select
						aria-label="Тема страницы"
						className="sa-topmenu-select"
						size="small"
						value={props.pageTheme || 'classic'}
						options={pageThemeOptions}
						getPopupContainer={(triggerNode) => triggerNode.parentElement}
						onChange={props.onPageThemeChange}
					/>
				</div>
			),
		},
		{
			key: `${HTTP_HOST}/logout`,
			label: <NavLink to={`${HTTP_HOST}/logout`}>Выйти</NavLink>,
			icon: <LoginOutlined />,
		},
	];

	const calendarMenuItems =
		todayEvents.length > 0
			? todayEvents.map((event, index) => {
				const eventTypeName = getCalendarEventTypeName(event);
				const orgName = event?.org_name || event?.organization_name || 'Без организации';
				const townName = event?.org_town_name || event?.town_name || event?.city_name || '';
				const contactName = getCalendarEventContactName(event);

				return {
					key: `calendar_today_${event?.id || index}`,
					label: (
						<div className="sa-calendar-event-row">
							<div className="sa-calendar-event-type">
								{eventTypeName}
							</div>
							<div className="sa-calendar-event-meta">
								<span>{orgName}</span>
								{townName && <span className="sa-calendar-event-town">{townName}</span>}
							</div>
							{contactName && (
								<div className="sa-calendar-event-contact">
									{contactName}
								</div>
							)}
						</div>
					),
				};
			})
			: [
				{
					key: 'calendar_today_empty',
					disabled: true,
					label: calendarEventsLoading ? 'Загружаем события...' : 'Сегодня событий нет',
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
		<div className="sa-top-menu ui-topmenu ui-topmenu-sticky">
			<div className={'sa-flex-space'}>
				<div className="sa-topmenu-brand ui-topmenu-brand">
					<NavLink to={`${HTTP_HOST}:3000`} aria-label="На главную" title="На главную">
						<HomeOutlined />
					</NavLink>
					<strong>ОТДЕЛ ПРОДАЖ</strong>
				</div>
				<Menu className="sa-main-navigation" mode="horizontal" selectedKeys={[location.pathname]} overflowedIndicator={<EllipsisOutlined />} items={[
 ...([2,3].includes(topRole) ? [{key:'/orgs',icon:<TeamOutlined />,label:<NavLink to="/orgs">Организации</NavLink>}] : []),
 {key:'/bids',icon:<CalendarOutlined />,label:<NavLink to="/bids">Заявки</NavLink>},
 ...([2,3].includes(topRole) ? [{key:'/price',icon:<TableOutlined />,label:<NavLink to="/price">Прайс</NavLink>}] : []),
 ...(topRole===2 ? [{key:'/curator',icon:<UserSwitchOutlined />,label:<NavLink to="/curator">Кураторство</NavLink>}] : []),
 {key:'/manager-substitutions',icon:<SwapOutlined />,label:<NavLink to="/manager-substitutions">Замещения</NavLink>},
 {key:'/regtown',icon:<EnvironmentOutlined />,label:<NavLink to="/regtown">Города и регионы</NavLink>},
 {key:'engineers',icon:<ToolOutlined />,label:'Инженеры',children:[{key:'/engine/specs',label:<NavLink to="/engine/specs">Спецификации</NavLink>},{key:'/engine/pdflist',label:<NavLink to="/engine/pdflist">PDF</NavLink>}]},
 ...(topRole===3 ? [{key:'/files_buh',icon:<FileTextOutlined />,label:<NavLink to="/files_buh">Выгрузка счетов</NavLink>}] : []),
 ]} />

 <div className={'sa-topmenu-userbox ui-topmenu-actions'}>
					<div className="sa-topmenu-currency"><CurrencyMonitorBar /></div>
					<div className="sa-topmenu-action-wrap">
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

                    <Dropdown
                        menu={{
                            items: calendarMenuItems,
                            onClick: () => window.open('/calendar'),
                        }}
                        trigger={['hover']}
                        placement="bottomRight"
                    >
                        <Button color={'primary'}
                                variant={'solid'}
                                onClick={()=>{window.open('/calendar')}}
                        >
                            <CalendarOutlined height={'16px'} />
                            {todayEvents.length > 0 && (
                                <span className={'notification-badge'}>{todayEvents.length}</span>
                            )}
                        </Button>
                    </Dropdown>

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
                          onNewMessage={handleNewChatMessage}
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
					<Dropdown menu={{ items: userMenuItems, className: 'sa-user-dropdown-menu' }} trigger={['hover']}>
						<div className="sa-topmenu-user ui-topmenu-user">
							{userdata?.user ? (
								<div style={{ display: 'flex', alignItems: 'center', gap: '8px', lineHeight: 1 }}>
									<span className="sa-topmenu-initial ui-topmenu-initial" aria-hidden="true">
										{(userdata.user.surname || userdata.user.name || '?').trim().charAt(0).toUpperCase()}
									</span>
									<span className="sa-topmenu-user-name">
										{userdata.user.surname} {userdata.user.name}
									</span>
								</div>
							) : (
								<span>Пользователь</span>
							)}
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

const ThemedTopMenu = (props) => {
 const theme = usePageTheme();
 return theme === 'main' ? <TopMenu {...props} /> : <ClassicView {...props} />;
};
export default ThemedTopMenu;
