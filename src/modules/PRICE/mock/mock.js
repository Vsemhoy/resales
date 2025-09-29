export const DS_CURRENCY = {
	currency: [
		{
			charcode: 'EUR',
			name_ru: 'Евро',
			value: 107.9576,
			sign: '€',
		},
		{
			charcode: 'USD',
			name_ru: 'Доллар США',
			value: 103.4207,
			sign: '$',
		},
	],
	company: [
		{
			id_company: 1,
			value: 99,
			name_ru: 'Доллар США',
			charcode: 'USD',
		},
		{
			id_company: 1,
			value: 100,
			name_ru: 'Евро',
			charcode: 'EUR',
		},
	],
};
export const PRICE = {
	descr: "Корень",
	id: 1,
	models: [],
	name: "Корень",
	parent_id: 0,
	childs: [
		{
			"id": 2,
			"name": "COMPANY",
			"descr": "COMPANY_DESC",
			"parent_id": 1,
			"childs": [
				{
					"id": 14,
					"name": "CATEGORY",
					"descr": "CATEGORY_DESC",
					"parent_id": 2,
					"childs": [
						{
							"id": 16,
							"name": "SUBCATEGORY",
							"descr": "SUBCATEGORY_DESC",
							"parent_id": 14,
							"childs": [],
							"models": [
								{
									"id": 315,
									"name": "SC-28",
									"currency": 0,
									"name_seo": "SC-28",
									"prices": {
										"price_0": 100,
										"price_10": 100,
										"price_20": 100,
										"price_30": 100
									},
									"descr": "Акустическая система SC-28 Inter-M описание, характеристики, руководство, цена, заказать-купить"
								},
								{
									"id": 317,
									"name": "SC-215",
									"currency": 0,
									"name_seo": "SC-215",
									"prices": {
										"price_0": 100,
										"price_10": 100,
										"price_20": 100,
										"price_30": 100
									},
									"descr": "Акустическая система SC-215 Inter-M описание, характеристики, руководство, цена, заказать-купить"
								},
								{
									"id": 319,
									"name": "SC-212M",
									"currency": 0,
									"name_seo": "SC-212M",
									"prices": {
										"price_0": 100,
										"price_10": 100,
										"price_20": 100,
										"price_30": 100
									},
									"descr": "Акустическая система SC-212M Inter-M описание, характеристики, руководство, цена, заказать-купить"
								},
							]
						},
					],
					"models": []
				},
			],
			"models": []
		}
	]
};