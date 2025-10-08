import { useContext, createContext } from 'react';
import { useSms } from '../hooks/sms/useSms';
// Контекст для SMS данных - ЧЕРНОВИК
const SmsContext = createContext();

export const SmsProvider = ({ children, chatId }) => {
	const smsData = useSms({ chatId });

	return <SmsContext.Provider value={smsData}>{children}</SmsContext.Provider>;
};

// Хук для использования в компонентах
export const useSmsData = () => {
	const context = useContext(SmsContext);
	if (!context) {
		throw new Error('useSmsData must be used within SmsProvider');
	}
	return context;
};
