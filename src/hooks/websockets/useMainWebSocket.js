import { useWebSocket } from './useWebSocket';
import { HTTP_HOST } from '../../config/config';

export const useMainWebSocket = (userdata, onMessage) => {
	return useWebSocket({
		url: `${HTTP_HOST}:5001`,
		userdata,
		onMessage,
		logPrefix: 'WS:MAIN',
	});
};
