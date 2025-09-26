import { useWebSocket } from './useWebSocket';
import { HTTP_HOST } from '../../config/config';

export const useSkudWebSocket = (userdata, onMessage) => {
	return useWebSocket({
		url: `${HTTP_HOST}:5002`,
		userdata,
		onMessage,
		logPrefix: 'WS:SKUD',
	});
};
