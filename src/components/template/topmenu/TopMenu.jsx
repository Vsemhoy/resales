import React, { useEffect, useState, useRef } from 'react';
import './style/topmenu.css';
import ChatBtn from '../../../modules/CHAT/components/ChatBtn';

import { Chat, ChatSocketProvider } from 'corp-chat-library-antd-react-socket';
//import 'corp-chat-library-antd-react-socket/dist/style.css';

import { NavLink } from 'react-router-dom';
import {BASE_ROUTE, BFF_PORT, CSRF_TOKEN, HTTP_HOST, HTTP_ROOT, PRODMODE} from '../../../config/config';
import {CloseCircleOutlined, HomeFilled, NotificationOutlined, WechatWorkOutlined} from '@ant-design/icons';
import LogoArstel, { LogoArstelLight } from '../../../assets/Comicon/Logos/LogoArstel';
import LogoRondo, { LogoRondoLight } from '../../../assets/Comicon/Logos/LogoRondo';
import {Badge, Button, Dropdown} from 'antd';
import { ShortName } from '../../helpers/TextHelpers';
import {
	ArrowTopRightOnSquareIcon,
	BugAntIcon,
	ClipboardDocumentListIcon,
	Cog6ToothIcon,
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

	const [openBugModal, setopenBugModal] = useState(false);

	const [bugMultiCounter, setBugMultiCounter] = useState([0,0,0,0]);

	useEffect(() => {
		setUserdata(props.userdata);
	}, [props.userdata]);

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

	const userMenu = [
		{
			key: 'rwterw2',
			label: <div>Настройки</div>,
			icon: <Cog6ToothIcon height={'18px'} />,
		},
		{
			key: '3fgsd',
			label: <NavLink to={`${HTTP_ROOT}/logout`}>Выйти из системы</NavLink>,
			icon: <ArrowTopRightOnSquareIcon height={'18px'} />,
		},
	];

	/** ------------------ FETCHES ---------------- */
	const set_user_company = async (newcom) => {
		if (PRODMODE) {
			try {
				let response = await PROD_AXIOS_INSTANCE.post('/auth/me', {
					id_company: newcom,
					_token: CSRF_TOKEN,
				});
				if (response.data) {
					setUserdata(response.data); // Обновляем данные пользователя
					props.changed_user_data();
				}
			} catch (e) {
				console.log(e);
			}
		} else {
			props.changed_user_data();
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
					<NavLink to={HTTP_HOST}>
						<div className={'sa-topmenu-button'}>
							<HomeFilled />
						</div>
					</NavLink>

					{[2, 3].includes(topRole) && (
						<NavLink to="/orgs">
							<div className={'sa-topmenu-button'}>Организации</div>
						</NavLink>
					)}

					{[2, 3].includes(topRole) && (
						<NavLink to="/bids">
							<div className={'sa-topmenu-button'}>Заявки</div>
						</NavLink>
					)}

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
				 <Badge count={+bugMultiCounter[0]}  color="#fa9614da" size='small' offset={[-6, 0]}>
					<Button
						type='text'
						onClick={()=>{setopenBugModal(!openBugModal)}}
						>
						<BugAntIcon height={'28px'} style={{color: '#ffbf00'}}/>
					</Button>

				 </Badge>
                    <Chat userdata={userdata}
                          httpParams={{
                              HTTP_HOST: HTTP_HOST,
                              BFF_PORT: BFF_PORT,
                              CSRF_TOKEN: CSRF_TOKEN,
                              PRODMODE: PRODMODE,
                              PROD_AXIOS_INSTANCE: null,
                          }}
                          fetchParams={{
                              fetchChatsListPath: `/api/sms`,
                              fetchChatMessagesPath: `/api/sms`,
                              sendSmsPath: '/api/sms/create/sms',
                              markMessagesAsReadPath: `/api/sms/read`,
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
                    />
                    {/*<NotiBtn />*/}
					<Dropdown menu={{ items: userMenu }}>
						<div className={'sa-flex-gap'}>
							{ShortName(userdata?.user?.surname, userdata?.user?.name, userdata?.user?.secondname)}
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
