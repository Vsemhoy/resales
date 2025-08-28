import dayjs from "dayjs";

/**
 * ЭТой штукой мы записываем параметры фильтров в URI
 * @param {*} filters 
 * @param {*} sorts 
 * @param {*} page 
 * @param {*} limit 
 */
export const updateURL = (filters, sorts, page, limit) => {
  const params = new URLSearchParams();
  console.log(sorts);
  // Добавляем фильтры (только не-null)
  Object.keys(filters).forEach(key => {
    const value = filters[key];
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        // Для массивов: profiles=1,2,3
        if (value[0] !== null){
            params.append(key, value.join(','));
        };
      } else if (value instanceof dayjs || value?._isAMomentObject) {
        // Для дат: created_date=1672531200,1675123200
        params.append(key, `${value[0]?.unix() ?? ''},${value[1]?.unix() ?? ''}`);
      } else {
        params.append(key, value);
      }
    }
  });

  // Сортировка: преобразуем в строку, например: sort=id:ASC,name:DESC
  if (sorts && sorts.length > 0) {
    const sortStr = sorts.map(s => `${s.key}-${s.order}`).join('+');
    console.log(sortStr);
    params.append('sort', sortStr);
  }

  // Пагинация
  if (page) params.append('page', page);
  if (limit) params.append('onPage', limit);

  // Обновляем URL без перезагрузки
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState(null, '', newUrl);
};


/**
 * Читаем параметры фильтров, сортировки, пагинацию из URL для ORG LIST
 * @returns 
 */
export const readOrgURL = () => {
    const _filters = {};
    const _sorts = [];
    let _page = 1;
    let _onPage = 30;

    try {

        const params = new URLSearchParams(window.location.search);
      
      
        // === Фильтры ===
        const filterKeys = [
          'profiles', 'name', 'id', 'curator', 'regions', 'price_statuses',
          'rate_lists', 'towns', 'client_statuses', 'profsound', 'companies',
          'contact_user', 'address', 'phone', 'email', 'site', 'inn', 'comment', 

        ];
      
        filterKeys.forEach(key => {
          const value = params.get(key);
          if (value) {
            if (key === 'profilesrr' || key === 'companiesrrr' || key.includes('statusrrr')) {
              // Массивы
              _filters[key] = value.split(',').map(Number);
            } else {
              _filters[key] = value;
            }
          }
        });
      
        // === Даты ===
        const createdStr = params.get('created_date');
        if (createdStr) {
          const [from, to] = createdStr.split(',').map(v => v ? dayjs.unix(parseInt(v)) : null);
          if (from || to) _filters.created_date = [from, to];
        }
      
        const updatedStr = params.get('active_date');
        if (updatedStr) {
          const [from, to] = updatedStr.split(',').map(v => v ? dayjs.unix(parseInt(v)) : null);
          if (from || to) _filters.updated_date = [from, to];
        }
      
        // === Сортировка ===
        const sortStr = params.get('sort');
        console.log(sortStr);
        if (sortStr) {
          _sorts.push(
            ...sortStr.split('+').map(pair => {
              console.log(pair);
              const [field, order] = pair.split('-');
              return { key: field, order: order }; // твой orderBox использует 1/2
            })
          );
        }
        console.log(_sorts);
        // === Пагинация ===
        _page = parseInt(params.get('page')) || 1;
        _onPage = parseInt(params.get('onPage')) || 30;
    } catch (er){
        console.log('Error: ', er);
    }
    console.log("FILTERE",_filters);
  return { _filters, _sorts, _page, _onPage };
};