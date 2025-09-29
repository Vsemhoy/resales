import { useCallback } from 'react';
import { useUserData } from '../../context/UserDataContext';

export const useCompanion = () => {
	const { userdata } = useUserData();
	const currentUserId = userdata?.user?.id;

	return useCallback(
		(sms) => {
			if (!sms || !currentUserId) return null;
			if (sms.from.id === currentUserId) {
				return sms.to.id === currentUserId ? 'self' : sms.to;
			}
			return sms.from;
		},
		[currentUserId]
	);
};
