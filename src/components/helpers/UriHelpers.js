import { useSearchParams, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';

// Хук для работы с URL параметрами
export const useURLParams = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const location = useLocation();

	const updateURL = (filters, sorts, page, limit, show, tab) => {
		const params = new URLSearchParams();
		let hasData = false;
		let urlParamText = '';

		// Добавляем фильтры (только не-null)
		Object.keys(filters).forEach((key) => {
			const value = filters[key];
			if (value !== null && value !== undefined && value !== '') {
				if (Array.isArray(value)) {
					if (value[0] !== null) {
						params.append(key, value.join(','));
						urlParamText += `${key}=${value.join(',')}&`;
					}
				} else if (value instanceof dayjs || value?._isAMomentObject) {
					const dateValue = `${value[0]?.unix() ?? ''},${value[1]?.unix() ?? ''}`;
					params.append(key, dateValue);
					urlParamText += `${key}=${dateValue}&`;
				} else {
					params.append(key, value);
					urlParamText += `${key}=${value}&`;
				}
				hasData = true;
			}
		});

		// Сортировка
		if (sorts && sorts.length > 0) {
			const sortStr = sorts.map((s) => `${s.key}-${s.order}`).join('+');
			params.append('sort', sortStr);
			urlParamText += `sort=${sortStr}&`;
			hasData = true;
		}

		// Пагинация
		if (page && page !== 1) {
			params.append('currentPage', page);
			urlParamText += `currentPage=${page}&`;
			hasData = true;
		}
		if (limit && limit !== 30) {
			params.append('onPage', limit);
			urlParamText += `onPage=${limit}&`;
			hasData = true;
		}
		if (show && show !== 0) {
			params.append('show', show);
			urlParamText += `show=${show}&`;
			hasData = true;
		}

		if (tab && tab !== 'm') {
			params.append('tab', tab);
			urlParamText += `tab=${tab}&`;
			hasData = true;
		}

		// Убираем последний амперсанд
		if (urlParamText.endsWith('&')) {
			urlParamText = urlParamText.slice(0, -1);
		}

		// Обновляем URL через React Router
		if (hasData) {
			setSearchParams(params);
		} else {
			// Если нет данных, очищаем параметры
			if (readOrgURL().hasData) {
				setSearchParams({});
			}
		}

		return urlParamText;
	};

	const readOrgURL = () => {
		const _filters = {};
		const _sorts = [];
		let _page = 1;
		let _onPage = 30;
		let _show = null;
		let _tab = null;
		let hasData = false;
		let _urlParamText = '';

		try {
			// === Фильтры ===
			const filterKeys = [
				'profiles',
				'name',
				'id',
				'curator',
				'regions',
				'price_statuses',
				'rate_lists',
				'towns',
				'client_statuses',
				'profsound',
				'companies',
				'contact_user',
				'address',
				'phone',
				'email',
				'site',
				'inn',
				'comment',
				'created_until',
				'created_before',
				'updated_until',
				'updated_before',
			];

			filterKeys.forEach((key) => {
				const value = searchParams.get(key);
				if (value) {
					if (key === 'profilesrr' || key === 'companiesrrr' || key.includes('statusrrr')) {
						_filters[key] = value.split(',').map(Number);
						_urlParamText += `${key}=${value}&`;
					} else {
						_filters[key] = value;
						_urlParamText += `${key}=${value}&`;
					}
					hasData = true;
				}
			});

			// === Даты ===
			const createdStr = searchParams.get('created_date');
			if (createdStr) {
				const [from, to] = createdStr.split(',').map((v) => (v ? dayjs.unix(parseInt(v)) : null));
				if (from || to) {
					_filters.created_date = [from, to];
					_urlParamText += `created_date=${createdStr}&`;
					hasData = true;
				}
			}

			const updatedStr = searchParams.get('active_date');
			if (updatedStr) {
				const [from, to] = updatedStr.split(',').map((v) => (v ? dayjs.unix(parseInt(v)) : null));
				if (from || to) {
					_filters.updated_date = [from, to];
					_urlParamText += `updated_date=${updatedStr}&`;
					hasData = true;
				}
			}

			// === Сортировка ===
			const sortStr = searchParams.get('sort');
			if (sortStr) {
				_sorts.push(
					...sortStr.split('+').map((pair) => {
						const [field, order] = pair.split('-');
						return { key: field, order: order };
					})
				);
				_urlParamText += `sort=${sortStr}&`;
				hasData = true;
			}

			// === Пагинация ===
			const pageParam = searchParams.get('currentPage');
			if (pageParam) {
				_page = parseInt(pageParam);
				_urlParamText += `currentPage=${_page}&`;
				hasData = true;
			}

			const onPageParam = searchParams.get('onPage');
			if (onPageParam) {
				_onPage = parseInt(onPageParam);
				_urlParamText += `onPage=${_onPage}&`;
				hasData = true;
			}

			const showParam = searchParams.get('show');
			if (showParam) {
				_show = parseInt(showParam);
				_urlParamText += `show=${_show}&`;
				hasData = true;
			}

			const tabParam = searchParams.get('tab');
			if (tabParam) {
				_tab = tabParam;
				_urlParamText += `tab=${_tab}&`;
				hasData = true;
			}

			// Убираем последний амперсанд
			if (_urlParamText.endsWith('&')) {
				_urlParamText = _urlParamText.slice(0, -1);
			}
		} catch (er) {
			console.log('Error: ', er);
		}

		return { _filters, _sorts, _page, _onPage, _show, _tab, hasData, _urlParamText };
	};

	// Функция для получения текущих параметров в виде строки
	const getCurrentParamsString = () => {
		let str = searchParams.toString();
		str = str.replace(/&tab=[a-zA-Z](?=&|$)/, '');
		return str;
	};

	// Функция для получения полного URL с параметрами
	const getFullURLWithParams = () => {
		const paramsString = searchParams.toString();
		return `${location.pathname}${paramsString ? `?${paramsString}` : ''}`;
	};

	return {
		updateURL,
		readOrgURL,
		searchParams,
		location,
		getCurrentParamsString,
		getFullURLWithParams,
	};
};

// import { useSearchParams, useLocation } from 'react-router-dom';
// import dayjs from 'dayjs';

// // Хук для работы с URL параметрами
// export const useURLParams = () => {
//   const [searchParams, setSearchParams] = useSearchParams();
//   const location = useLocation();

//   const updateURL = (filters, sorts, page, limit, show, tab) => {
//     const params = new URLSearchParams();
//     let hasData = false;
//     let urlParamText = "";

//     // Добавляем фильтры (только не-null)
//     Object.keys(filters).forEach(key => {
//       const value = filters[key];
//       if (value !== null && value !== undefined && value !== '') {
//         if (Array.isArray(value)) {
//           if (value[0] !== null) {
//             params.append(key, value.join(','));
//           }
//         } else if (value instanceof dayjs || value?._isAMomentObject) {
//           params.append(key, `${value[0]?.unix() ?? ''},${value[1]?.unix() ?? ''}`);
//         } else {
//           params.append(key, value);
//         }
//         hasData = true;
//       }
//     });

//     // Сортировка
//     if (sorts && sorts.length > 0) {
//       const sortStr = sorts.map(s => `${s.key}-${s.order}`).join('+');
//       params.append('sort', sortStr);
//       hasData = true;
//     }

//     // Пагинация
//     if (page && page !== 1) {
//       params.append('currentPage', page);
//       hasData = true;
//     }
//     if (limit && limit !== 30) {
//       params.append('onPage', limit);
//       hasData = true;
//     }
//     if (show && show !== 0) {
//       params.append('show', show);
//       hasData = true;
//     }

//     if (tab && tab !== 'm') {
//       params.append('tab', tab);
//       hasData = true;
//     }

//     // Обновляем URL через React Router
//     if (hasData) {
//       setSearchParams(params);
//     } else {
//       // Если нет данных, очищаем параметры
//       if (readOrgURL().hasData){
//         setSearchParams({});
//       }
//     }
//     return urlParamText;
//   };

//   const readOrgURL = () => {
//     const _filters = {};
//     const _sorts = [];
//     let _page = 1;
//     let _onPage = 30;
//     let _show = null;
//     let _tab = null;
//     let hasData = false;
//     let _urlParamText = '';

//     try {
//       // === Фильтры ===
//       const filterKeys = [
//         'profiles', 'name', 'id', 'curator', 'regions', 'price_statuses',
//         'rate_lists', 'towns', 'client_statuses', 'profsound', 'companies',
//         'contact_user', 'address', 'phone', 'email', 'site', 'inn', 'comment',
//         'created_until', 'created_before', 'updated_until', 'updated_before'
//       ];

//       filterKeys.forEach(key => {
//         const value = searchParams.get(key);
//         if (value) {
//           if (key === 'profilesrr' || key === 'companiesrrr' || key.includes('statusrrr')) {
//             _filters[key] = value.split(',').map(Number);
//             hasData = true;
//           } else {
//             _filters[key] = value;
//             hasData = true;
//           }
//         }
//       });

//       // === Даты ===
//       const createdStr = searchParams.get('created_date');
//       if (createdStr) {
//         const [from, to] = createdStr.split(',').map(v => v ? dayjs.unix(parseInt(v)) : null);
//         if (from || to) {
//           _filters.created_date = [from, to];
//           hasData = true;
//         }
//       }

//       const updatedStr = searchParams.get('active_date');
//       if (updatedStr) {
//         const [from, to] = updatedStr.split(',').map(v => v ? dayjs.unix(parseInt(v)) : null);
//         if (from || to) {
//           _filters.updated_date = [from, to];
//           hasData = true;
//         }
//       }

//       // === Сортировка ===
//       const sortStr = searchParams.get('sort');
//       if (sortStr) {
//         _sorts.push(
//           ...sortStr.split('+').map(pair => {
//             const [field, order] = pair.split('-');
//             return { key: field, order: order };
//           })
//         );
//         hasData = true;
//       }

//       // === Пагинация ===
//       _page = parseInt(searchParams.get('currentPage')) || 1;
//       _onPage = parseInt(searchParams.get('onPage')) || 30;
//       _show = parseInt(searchParams.get('show')) || null;
//       _tab = searchParams.get('tab') || null;

//       if (_page !== 1 || _onPage !== 30 || _show !== null || _tab !== null) {
//         hasData = true;
//       }

//     } catch (er) {
//       console.log('Error: ', er);
//     }

//     return { _filters, _sorts, _page, _onPage, _show, _tab, hasData, _urlParamText };
//   };

//   return { updateURL, readOrgURL, searchParams, location };
// };
