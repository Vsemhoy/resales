// 🎯 Как это работает:

// //В ComponentA.js
// const ComponentA = () => {
//   const { userdata, setUserdata } = useUserData();

//   const updateName = () => {
//     setUserdata({ ...userdata, name: "Новое имя" });
//   };

//   return <button onClick={updateName}>Изменить имя</button>;
// };

//  //В ComponentB.js (в любой части приложения)
// const ComponentB = () => {
//   const { userdata } = useUserData();

//   return <div>Текущее имя: {userdata.name}</div>; // Будет "Новое имя"
// };

// //ПРАВИЛЬНО - иммутабельное обновление
// setUserdata({ ...userdata, name: "Новое имя" });

// // НЕПРАВИЛЬНО - мутация существующего объекта
// userdata.name = "Новое имя"; // ❌ Не сработает!
// setUserdata(userdata);

// В форме редактирования профиля
// const ProfileForm = () => {
//   const { userdata, setUserdata } = useUserData();

//   const handleSave = (newData) => {
//     setUserdata({ ...userdata, ...newData });
// // Все компоненты (хедер, сайдбар, etc.) сразу увидят изменения и произойдёт перерендер!
//   };
// };

import { createContext, useContext, useState, useEffect } from 'react';
import {CSRF_TOKEN, PRODMODE, ROUTE_PREFIX} from '../config/config';
import { PROD_AXIOS_INSTANCE } from '../config/Api';
import { MS_USER } from '../mock/MAINSTATE';

const UserDataContext = createContext();

export const UserDataProvider = ({ children }) => {
	const [userdata, setUserdata] = useState(null);
	const [pageLoaded, setPageLoaded] = useState(false);

	const get_userdata = async () => {
		try {
			if (PRODMODE) {
				const response = await PROD_AXIOS_INSTANCE.get(`${ROUTE_PREFIX}/usda?_token=` + CSRF_TOKEN);
				console.log('response.data.user: ', response?.data || 'No data');
				setUserdata(response.data);
			} else {
				setUserdata(MS_USER);
			}
		} catch (e) {
			console.error('get_userdata error:', e);
		} finally {
			setPageLoaded(true);
		}
	};

	useEffect(() => {
		get_userdata();
	}, []);

	return (
		<UserDataContext.Provider value={{ userdata, setUserdata, pageLoaded }}>
			{children}
		</UserDataContext.Provider>
	);
};

export const useUserData = () => useContext(UserDataContext);
