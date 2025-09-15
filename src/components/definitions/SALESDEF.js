export const getProfileLiterals = (id) => {
	switch (id) {
		case 9:
			return 'АБ';
		case 2:
			return 'М';
		case 4:
			return 'ПМ';
		case 5:
			return 'ПО';
		case 6:
			return 'Р';
		case 1:
			return 'Т';
		default:
			return '';
	}
};

export const ORG_PROJECT_STATES = [
	{
		id: 0,
		value: 0,
		key: 'orpros_1',
		label: 'Текущий',
	},
	{
		id: 1,
		value: 1,
		key: 'orpros_2',
		label: 'Реализованный',
	},
	{
		id: 2,
		value: 2,
		key: 'orpros_3',
		label: 'Предстоящий',
	},
	{
		id: 3,
		value: 3,
		key: 'orpros_4',
		label: 'Выполненный',
	},
];

export const ORG_PROJECT_DEFENSES = [
	{
		id: 0,
		value: 0,
		key: 'opd_1',
		label: 'Не выбрано',
	},
	{
		id: 1,
		value: 1,
		key: 'opd_2',
		label: 'Защита проекта',
	},
	{
		id: 2,
		value: 2,
		key: 'opd_3',
		label: 'Реализация проекта',
	},
	{
		id: 3,
		value: 3,
		key: 'opd_4',
		label: 'Защита и реализация ?',
	},
];
