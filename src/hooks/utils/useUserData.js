import { useState, useEffect } from 'react';

export const useUserData = (userdata) => {
	const [roleMenu, setRoleMenu] = useState([]);
	const [companiesMenu, setCompaniesMenu] = useState([]);

	useEffect(() => {
		if (!userdata || userdata.length === 0) {
			return;
		}

		const activeRole = userdata.user.sales_role;
		const activeCompany = userdata.user.active_company;

		const roles = [];
		const companies = userdata.companies.filter((item) => item.id > 1);

		if (!activeRole || activeRole === 0) {
			changeUserRole(1);
		}

		companies.forEach((company) => {
			if (!activeCompany || activeCompany < 2) {
				if (company.places && company.places.length > 0) {
					changeUserCompany(company.id);
				}
			}

			if (company.id === activeCompany && company.places.length > 0) {
				company.places.forEach((place) => {
					roles.push({
						key: `rolecom_${company.id}_${place.id}`,
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
					});
				});
			}
		});

		setCompaniesMenu(
			companies.map((item) => ({
				key: `compas_${item.id}`,
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

	const changeUserRole = async (role_id) => {
		// Логика для смены роли пользователя
		console.log('Changing role to:', role_id);
	};

	const changeUserCompany = async (company_id) => {
		// Логика для смены компании пользователя
		console.log('Changing company to:', company_id);
	};

	return { roleMenu, companiesMenu };
};
