import styles from './style/Chat.module.css';
import { MOCK } from '../mock/mock.js';

import { useState, useMemo, useCallback } from 'react';
import { useUserData } from '../../../context/UserDataContext.js';
import { usePolling } from '../../../hooks/sms/usePolling.js';
import { useSms } from '../../../hooks/sms/useSms.js';

import { Button, Dropdown, Space } from 'antd';
import { MessageOutlined, SyncOutlined } from '@ant-design/icons';
import { ChatModal } from './ChatModal.jsx';

export const ChatBtn = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [dropdownVisible, setDropdownVisible] = useState(false);

	const {
		data: smsList = [],
		loading,
		error,
	} = useSms({
		url: '/api/sms',
		mock: MOCK,
	});

	const { userdata } = useUserData();
	const currentUserId = userdata?.user?.id || NaN;

	// ДОБАВЬТЕ ОТЛАДКУ ДЛЯ ПРОВЕРКИ ДАННЫХ
	console.log('🔔 ChatBtn Debug:', {
		smsList,
		smsListLength: smsList.length,
		currentUserId,
		loading,
		error,
	});

	const smsData = useMemo(() => {
		console.log('📊 Processing smsData, smsList length:', smsList.length);

		if (!Array.isArray(smsList) || smsList.length === 0) {
			return { hasSms: false, messages: [] };
		}

		// Временная логика для определения собеседника
		const getCompanion = (sms) => {
			if (sms.from?.id === currentUserId) return sms.to;
			return sms.from;
		};

		const messages = smsList.map((sms) => {
			const companion = getCompanion(sms);
			return {
				id: sms.id,
				name: companion?.name || 'Неизвестный',
				surname: companion?.surname || '',
				content: sms.text || '(без текста)',
				chat_id: sms.chat_id,
			};
		});

		return {
			hasSms: messages.length > 0,
			messages,
		};
	}, [smsList, currentUserId]); // ДОБАВЛЕНА ЗАВИСИМОСТЬ ОТ smsList

	const menuItems = useMemo(() => {
		console.log('📋 Building menu items, hasSms:', smsData.hasSms);

		if (!smsData.hasSms) return [];

		const { messages } = smsData;
		const count = messages.length;

		const label = (() => {
			if (count === 1) {
				return `${messages[0].name} ${messages[0].surname}`.trim();
			}
			if (count === 2) {
				return `${messages[0].name} ${messages[0].surname} и ${messages[1].name} ${messages[1].surname}`.trim();
			}
			return `${messages
				.slice(0, 2)
				.map((m) => `${m.name} ${m.surname}`.trim())
				.join(', ')} и ещё +${count - 2}`;
		})();

		return [
			{
				key: 'sms-section',
				label: (
					<div className={styles['sms-section']}>
						<Space direction="vertical" size={4}>
							<Space size={2} wrap>
								<span className={styles['sms-counter']}>{label}</span>
							</Space>
						</Space>
					</div>
				),
				onClick: () => console.log('Переход к сообщениям'),
			},
		];
	}, [smsData]);

	const showModal = () => {
		console.log('🔄 Opening modal');
		setIsModalOpen(true);
		setDropdownVisible(false);
	};

	const handleOk = () => {
		setIsModalOpen(false);
	};

	const handleCancel = () => {
		setIsModalOpen(false);
	};

	return (
		<Space style={{ padding: 0 }}>
			<Dropdown
				menu={{ items: menuItems }}
				trigger={['hover']}
				open={dropdownVisible}
				onOpenChange={setDropdownVisible}
			>
				<div>
					<Button
						style={{ background: 'transparent' }}
						type="primary"
						onClick={showModal}
						loading={loading}
					>
						<MessageOutlined />
						{smsData.hasSms && (
							<span className={styles['notification-badge']}>{smsData.messages.length}</span>
						)}
					</Button>
				</div>
			</Dropdown>

			<ChatModal open={isModalOpen} onOk={handleOk} onCancel={handleCancel} smsData={smsData} />

			{error && <span style={{ color: 'red', fontSize: 12 }}>Ошибка загрузки сообщений</span>}
		</Space>
	);
};
