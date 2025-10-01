import { useState, useMemo, useCallback, useEffect } from 'react';
import { Button, Dropdown, Space } from 'antd';
import { MessageOutlined, SyncOutlined } from '@ant-design/icons';
import { MOCK } from '../mock/mock.js';
import { useSms } from '../../../hooks/sms/useSms';
import { ChatModal } from './ChatModal';
import { useUserData } from '../../../context/UserDataContext.js';
import styles from './style/Chat.module.css';

export const ChatBtn = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [dropdownVisible, setDropdownVisible] = useState(false);
	const [lastUpdate, setLastUpdate] = useState(Date.now());

	const {
		data: smsList,
		loading,
		error,
		refetch,
	} = useSms({
		url: '/api/sms',
		mock: MOCK,
		enablePolling: true, // ВКЛЮЧАЕМ POLLING
	});

	const { userdata } = useUserData();
	const currentUserId = userdata?.user?.id || NaN;

	// Ручное обновление по клику на бейдж
	const handleManualRefresh = useCallback(
		(e) => {
			e.stopPropagation();
			console.log('Ручное обновление сообщений...');
			setLastUpdate(Date.now());
			refetch();
		},
		[refetch]
	);

	const getCompanion = useCallback(
		(sms) => {
			if (sms.from.id === currentUserId && sms.to.id === currentUserId) {
				return { name: 'Вы', surname: '' };
			}
			return sms.from.id === currentUserId ? sms.to : sms.from;
		},
		[currentUserId]
	);

	const smsData = useMemo(() => {
		const combined = [...(smsList || [])];

		if (!combined.length) return { hasSms: false, messages: [] };

		const messages = combined.map((sms) => {
			const companion = getCompanion(sms);
			return {
				id: sms.id,
				name: companion?.name || null,
				surname: companion?.surname || null,
				content: sms.text || '(без текста)',
				timestamp: sms.updated_at || sms.created_at,
			};
		});

		// Сортируем по времени (новые сверху)
		messages.sort((a, b) => b.timestamp - a.timestamp);

		return {
			hasSms: messages.length > 0,
			messages: messages.slice(0, 10), // Показываем только последние 10
		};
	}, [smsList, getCompanion]);

	const menuItems = useMemo(() => {
		if (!smsData.hasSms) return [];

		const { messages } = smsData;
		const count = messages.length;

		const label = (() => {
			if (count === 1) return `${messages[0].name} ${messages[0].surname}`.trim();
			if (count === 2)
				return `${messages[0].name} ${messages[0].surname} и ${messages[1].name} ${messages[1].surname}`.trim();
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
								<Button
									type="text"
									size="small"
									icon={<SyncOutlined />}
									onClick={handleManualRefresh}
									title="Обновить"
								/>
							</Space>
							<div style={{ fontSize: '10px', color: '#888' }}>
								Обновлено: {new Date(lastUpdate).toLocaleTimeString()}
							</div>
						</Space>
					</div>
				),
				onClick: () => console.log('Переход к сообщениям'),
			},
		];
	}, [smsData, lastUpdate, handleManualRefresh]);

	const showModal = () => {
		setIsModalOpen(true);
		setDropdownVisible(false);
	};
	const handleOk = () => setIsModalOpen(false);
	const handleCancel = () => setIsModalOpen(false);

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
							<span
								className={styles['notification-badge']}
								onClick={handleManualRefresh}
								title="Кликните для обновления"
							>
								{smsData.messages.length}
							</span>
						)}
					</Button>
				</div>
			</Dropdown>

			<ChatModal open={isModalOpen} onOk={handleOk} onCancel={handleCancel} smsData={smsData} />

			{error && <span style={{ color: 'red', fontSize: 12 }}>Ошибка загрузки сообщений</span>}
		</Space>
	);
};
