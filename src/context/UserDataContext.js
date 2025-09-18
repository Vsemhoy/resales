import { createContext, useContext, useState, useEffect } from 'react';
import { CSRF_TOKEN, PRODMODE } from '../config/config';
import { PROD_AXIOS_INSTANCE } from '../config/Api';
import { MS_USER } from '../mock/MAINSTATE';
const UserDataContext = createContext();

export const UserDataProvider = ({ children }) => {
	const [userdata, setUserdata] = useState([]);
	const [pageLoaded, setPageLoaded] = useState(false);

	useEffect(() => {
		if (PRODMODE) {
			get_userdata();
		} else {
			setUserdata(MS_USER);
		}
	}, []);

	const get_userdata = async () => {
		if (PRODMODE) {
			try {
				let response = await PROD_AXIOS_INSTANCE.get('/usda?_token=' + CSRF_TOKEN);
				console.log('me: ', response);
				setUserdata(response.data);
			} catch (e) {
				console.log(e);
			} finally {
				setPageLoaded(true);
			}
		} else {
			setPageLoaded(true);
		}
	};

	return (
		<UserDataContext.Provider value={{ userdata, setUserdata, pageLoaded }}>
			{children}
		</UserDataContext.Provider>
	);
};

export const useUserData = () => useContext(UserDataContext);
