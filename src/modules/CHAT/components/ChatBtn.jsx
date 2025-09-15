import React, { useState, useMemo } from 'react';
import { Button, Dropdown, Space } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { MOCK } from '../mock/mock.js';
import { useSms } from '../../../hooks/useSms.js';
import { ChatModal } from './ChatModal';

export const ChatBtn = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [dropdownVisible, setDropdownVisible] = useState(false);

	const { data: rawSmsData, loading } = useSms({
		url: '/api/sms',
		mock: MOCK,
	});

	const smsData = useMemo(() => {
		if (!rawSmsData || rawSmsData.length === 0) {
			return { hasSms: false, messages: [] };
		}

		const messages = rawSmsData.map((sms) => ({
			id: sms.id,
			name: sms.from.name,
			surname: sms.from.surname,
			content: sms.text || '(без текста)',
		}));

		return {
			hasSms: messages.length > 0,
			messages,
		};
	}, [rawSmsData]);

	const menuItems = useMemo(() => {
		if (!smsData.hasSms) return [];

		const { messages } = smsData;
		const messageCount = messages.length;

		const label = (() => {
			switch (messageCount) {
				case 1:
					return `${messages[0].name} ${messages[0].surname}`;
				case 2:
					return `${messages[0].name} ${messages[0].surname} и ${messages[1].name} ${messages[1].surname}`;
				default:
					return `${messages[0].surname} ${messages[0].name}, ${messages[1].surname} ${
						messages[1].name
					} и ещё +${messageCount - 2}`;
			}
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
		</Space>
	);
};
