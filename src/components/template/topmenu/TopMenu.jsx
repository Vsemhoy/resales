import React, { useEffect, useState } from 'react';
import './style/topmenu.css';
import { ChatBtn } from '../../../modules/CHAT/components/ChatBtn';
import { NavLink } from 'react-router-dom';
import {BASE_ROUTE, CSRF_TOKEN, HTTP_HOST, HTTP_ROOT, PRODMODE} from '../../../config/config';
import { CloseCircleOutlined, HomeFilled, WechatWorkOutlined } from '@ant-design/icons';
import LogoArstel, { LogoArstelLight } from '../../../assets/Comicon/Logos/LogoArstel';
import LogoRondo, { LogoRondoLight } from '../../../assets/Comicon/Logos/LogoRondo';
import { Dropdown } from 'antd';
import { ShortName } from '../../helpers/TextHelpers';
import {
	ArrowTopRightOnSquareIcon,
	ClipboardDocumentListIcon,
	Cog6ToothIcon,
	ShieldCheckIcon,
	UserCircleIcon,
} from '@heroicons/react/24/outline';
import { PROD_AXIOS_INSTANCE } from '../../../config/Api';
import { useUserData } from '../../../context/UserDataContext'; // импортируем хук

const TopMenu = () => {
	// Получаем данные из контекста
	const { userdata, setUserdata } = useUserData();
	const [roleMenu, setRoleMenu] = useState([]);
	const [companiesMenu, setCompanieseMenu] = useState([]);

	useEffect(() => {
		 console.log('userdata structure:', userdata);
		if (!userdata || userdata.length === 0) {
			return;
		}
		let activeRole = userdata.user.sales_role;
		let activeCompany = userdata.user.active_company;
		let roles = [];

		if (!activeRole || activeRole === 0) {
			changeUserRole(1);
			activeRole = 1;
		}
		let comps = userdata.companies.filter((item) => item.id > 1);

		for (let i = 0; i < comps.length; i++) {
			const company = comps[i];
			if (!activeCompany || activeCompany < 2) {
				if (company.places && company.places.length > 0) {
					activeCompany = company.id;
					changeUserCompany(activeCompany);
				}
			}

			if (company.id === activeCompany && company.places.length > 0) {
				for (let y = 0; y < company.places.length; y++) {
					const place = company.places[y];
					roles.push({
						key: 'rolecom_' + company.id + '_' + place.id,
						label: (
							<div
								className={`${place.place === activeRole ? 'active' : ''}`}
								onClick={() => {
									if (place.place !== activeRole || company.id !== activeCompany) {
										changeUserRole(place.place);
									}
								}}
							>
								{place.accessname}
							</div>
						),
						danger: place.place === activeRole,
						icon: (() => {
							if (place.place === 1) {
								return <UserCircleIcon height="18px" />;
							} else if (place.place === 2) {
								return <ClipboardDocumentListIcon height="18px" />;
							} else if (place.place === 3) {
								return <ShieldCheckIcon height="18px" />;
							}
							return null;
						})(),
					});
				}
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

	const sms = [];
	/** ------------------ FETCHES ---------------- */
	const set_user_role = async (newplace) => {
		if (PRODMODE) {
			try {
				let response = await PROD_AXIOS_INSTANCE.post('/auth/me', {
					place: newplace,
					_token: CSRF_TOKEN,
				});
				if (response.data) {
					setUserdata(response.data); // Обновляем данные пользователя
				}
			} catch (e) {
				console.log(e);
			}
		}
	};

	const set_user_company = async (newcom) => {
		if (PRODMODE) {
			try {
				let response = await PROD_AXIOS_INSTANCE.post('/auth/me', {
					id_company: newcom,
					_token: CSRF_TOKEN,
				});
				if (response.data) {
					setUserdata(response.data); // Обновляем данные пользователя
				}
			} catch (e) {
				console.log(e);
			}
		}
	};

	const changeUserCompany = (company_id) => {
		set_user_company(company_id);
	};

	const changeUserRole = (role_id) => {
		set_user_role(role_id);
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
					<NavLink to="/orgs">
						<div className={'sa-topmenu-button'}>Организации</div>
					</NavLink>
					<NavLink to="/bids">
						<div className={'sa-topmenu-button'}>Заявки</div>
					</NavLink>
					<NavLink to="/price">
						<div className={'sa-topmenu-button'}>Прайс</div>
					</NavLink>
					{userdata && userdata.user && userdata.user.super ? (
						<NavLink to="/orgs/534">
							<div className={'sa-topmenu-button'}>Заявка</div>
						</NavLink>
					) : null}
					{userdata && userdata.user && userdata.user.super ? (
						<NavLink to="/dev/icons/antdicons">
							<div className={'sa-topmenu-button'}>DEV</div>
						</NavLink>
					) : null}
					{userdata && userdata.user && userdata.user.super ? (
						<NavLink to="/curator/exmonitor">
							<div className={'sa-topmenu-button'}>Exmo</div>
						</NavLink>
					) : null}
					<NavLink to="/curator">
						<div className={'sa-topmenu-button'}>Кураторство</div>
					</NavLink>
					<NavLink to="/engineer">
						<div className={'sa-topmenu-button'}>Инженеры</div>
					</NavLink>
				</div>

				<div className={'sa-topmenu-userbox'}>
					<ChatBtn sms={sms} />
					<Dropdown menu={{ items: userMenu }}>
						<div className={'sa-flex-gap'}>
							{ShortName(userdata?.user?.surname, userdata?.user?.name, userdata?.user?.secondname)}
						</div>
					</Dropdown>
					<Dropdown menu={{ items: companiesMenu }}>
						<div style={{ padding: '2px 14px' }}>
							{userdata?.user?.active_company === 2 && <LogoArstelLight height="30px" />}
							{userdata?.user?.active_company === 3 && <LogoRondoLight height="30px" />}
						</div>
					</Dropdown>
				</div>
			</div>
		</div>
	);
};

export default TopMenu;
