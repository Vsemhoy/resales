import React from 'react';

// Данные о пользователе
export const MS_USER = {
	acls: [
		94, 92, 62, 73, 57, 
    60, // Create passport
     53, // Edit passport
     62, // view history
      52, 51, 75, 149, 141, 142, 143, 144,
       145, 146, 147, 148, 5, 17, 61,
		64, 65, 66, 67, 68, 69, 70, 71, 72, 
    77, 107, 96, 95, 88, 87, 86, 85, 118, 108, 84, 81, 89, 90,
		91, 
    137, // Rukop
     138, // Can call curatorstvo
     55, // Delete passport
	],
	companies: [
		{
			id: 1,
			name: 'All companies',
			description: 'Everyting',
			is_active: 1,
			template_prefix: 'all',
			folder: 'all',
			color: '#2ccf2c',
			ext_address_offers: '/',
			path_logo: '/images/identics/iwtRd02l2h/logo.png',
			created_at: null,
			updated_at: null,
			places: [],
		},
		{
			id: 3,
			name: 'Rondo',
			description: 'ООО Рондо',
			is_active: 1,
			template_prefix: 'rond',
			folder: 'rondo',
			color: '#2ccf2c',
			ext_address_offers: '/',
			path_logo: '/images/identics/iwtRd02l2h/logo.png',
			created_at: null,
			updated_at: null,
			places: [
				{
					id: 89,
					name: 'bidmanager',
					label: 'Роль менеджер',
					accessgroup: 4,
					accessname: 'Менеджер',
					position: 210,
					place: 1,
				},
				{
					id: 91,
					name: 'bidadministrator',
					label: 'Роль администратора',
					accessgroup: 4,
					accessname: 'Администратор',
					position: 220,
					place: 2,
				},
			],
		},
		{
			id: 2,
			name: 'Arstel',
			description: 'ООО Арстел',
			is_active: 1,
			template_prefix: 'ars',
			folder: 'arstel',
			color: '#ff7700',
			ext_address_offers: '/',
			path_logo: '/images/identics/adw32jk2jl/Arstel_logo.svg',
			created_at: null,
			updated_at: null,
			places: [
				{
					id: 89,
					name: 'bidmanager',
					label: 'Роль менеджер',
					accessgroup: 4,
					accessname: 'Менеджер',
					position: 210,
					place: 1,
				},
				{
					id: 91,
					name: 'bidadministrator',
					label: 'Роль администратора',
					accessgroup: 4,
					accessname: 'Администратор',
					position: 220,
					place: 2,
				},
				{
					id: 90,
					name: 'bidbuch',
					label: 'Роль бухгалтера',
					accessgroup: 4,
					accessname: 'Бухгалтер',
					position: 230,
					place: 3,
				},
			],
		},
	],
	user: {
		id: 46,
		name: 'Игнат',
		surname: 'Крудо',
		secondname: 'Мамонович',
		occupy: 'коммерческий директор',
		passcard: null,
		id_role: 1,
		email: null,
		sales_role: 1,
		password2: '$2y$12$vwqewb1to3XkD3FUvSrgoeydtcmsswjQSp6DWvJfxZanevLwAq6BS',
		active_company: 3,
		id_departament: 11,
		// id_departament: 8,
		id_company: 2,
		// super: 1,
	},
	mode: 0,
	duration: 0.0012869834899902344,
	state: [],
};


