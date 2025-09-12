import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ConfigProvider } from 'antd';

/* + LOCALE */
import ruRU from 'antd/lib/locale/ru_RU'; // Импорт русской локали
import ru from 'antd/es/date-picker/locale/ru_RU';

const customLocale = {
	...ruRU,
	DatePicker: {
		...ruRU.DatePicker,
		lang: {
			...ruRU.DatePicker.lang,
			firstDayOfWeek: 1, // 0 - вс, 1 - пн, 2 - вт и т.д.
		},
	},
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<ConfigProvider locale={customLocale}>
			<App />
		</ConfigProvider>
	</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
