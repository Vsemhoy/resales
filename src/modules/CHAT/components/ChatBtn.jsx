import React, { useState, useMemo } from 'react';
import { Button, Dropdown, Space } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { MOCK } from '../mock/mock.js';
import { useSms } from '../../../hooks/sms/useSms.js';
import { ChatModal } from './ChatModal';

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

	// Обработка полученных SMS
	const smsData = useMemo(() => {
		if (!Array.isArray(smsList) || smsList.length === 0) {
			return { hasSms: false, messages: [] };
		}

		const messages = smsList.map((sms) => ({
			id: sms.id,
			name: sms.from?.name || 'Без имени',
			surname: sms.from?.surname || 'Без фамилии',
			content: sms.text || '(без текста)',
		}));

		return {
			hasSms: messages.length > 0,
			messages,
		};
	}, [smsList]);

	// Генерация текста в dropdown
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
				.join(', ')} и ещё ${count - 2}`;
		})();

		return [
			{
				key: 'sms-section',
				label: (
					<div className="sms-section">
						<Space direction="vertical" size={4}>
							<Space size={2} wrap>
								<span className="sms-counter">{label}</span>
							</Space>
						</Space>
					</div>
				),
				onClick: () => console.log('Переход к сообщениям'),
			},
		];
	}, [smsData]);

	// Обработчики модального окна
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
		<Space style={{ padding: '0px' }}>
			<Dropdown
				menu={{ items: menuItems }}
				trigger={['hover']}
				open={dropdownVisible}
				onOpenChange={(visible) => setDropdownVisible(visible)}
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
							<span className="notification-badge">{smsData.messages.length}</span>
						)}
					</Button>
				</div>
			</Dropdown>

			<ChatModal open={isModalOpen} onOk={handleOk} onCancel={handleCancel} smsData={smsData} />

			{error && <span style={{ color: 'red', fontSize: '12px' }}>Ошибка загрузки сообщений</span>}
		</Space>
	);
};
