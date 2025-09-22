import { useState, useMemo } from 'react';
import { Button, Dropdown, Space } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { MOCK } from '../mock/mock.js';
import { useSms } from '../../../hooks/sms/useSms';
import { ChatModal } from './ChatModal';
import { useCompanion } from '../../../hooks/sms/useCompanion';
import { useUserData } from '../../../context/UserDataContext';
import styles from './style/Chat.module.css';

export const ChatBtn = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [dropdownVisible, setDropdownVisible] = useState(false);

	const {
		data: smsList,
		loading,
		error,
	} = useSms({
		url: '/api/sms',
		mock: MOCK,
	});

	const { userdata } = useUserData();
	const currentUserId = userdata?.user?.id || NaN;

	const getCompanion = useCompanion(currentUserId);

	const smsData = useMemo(() => {
		if (!Array.isArray(smsList) || smsList.length === 0) {
			return { hasSms: false, messages: [] };
		}

		const messages = smsList.map((sms) => {
			const companion = getCompanion(sms);
			return {
				id: sms.id,
				name: companion?.name || null,
				surname: companion?.surname || null,
				content: sms.text || '(без текста)',
			};
		});

		return {
			hasSms: messages.length > 0,
			messages,
		};
	}, [smsList, getCompanion]);

	const menuItems = useMemo(() => {
		if (!smsData.hasSms) return [];

		const { messages } = smsData;
		const count = messages.length;

		const label = (() => {
			if (count === 1) {
				return `${messages[0].name} ${messages[0].surname}`;
			}
			if (count === 2) {
				return `${messages[0].name} ${messages[0].surname} и ${messages[1].name} ${messages[1].surname}`;
			}
			return `${messages
				.slice(0, 2)
				.map((m) => `${m.name} ${m.surname}`)
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
