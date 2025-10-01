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
	return (
		<>
			<h1>NewChatBtn</h1>
			<Space style={{ padding: 0 }}>
				<Dropdown
					// menu={{ items: menuItems }}
					trigger={['hover']}
					// open={dropdownVisible}
					// onOpenChange={setDropdownVisible}
				>
					<div>
						<Button
							style={{ background: 'transparent' }}
							type="primary"
							// onClick={showModal}
							// loading={loading}
						>
							<MessageOutlined />
							{/* {smsData.hasSms && (
								<span
									className={styles['notification-badge']}
									onClick={handleManualRefresh}
									title="Кликните для обновления"
								>
								 {smsData.messages.length}
								</span>
							)} */}
						</Button>
					</div>
				</Dropdown>

				{/* <ChatModal open={isModalOpen} onOk={handleOk} onCancel={handleCancel} smsData={smsData} /> */}
				<ChatModal />

				{/* {error && <span style={{ color: 'red', fontSize: 12 }}>Ошибка загрузки сообщений</span>} */}
			</Space>
		</>
	);
};

// const [isModalOpen, setIsModalOpen] = useState(false);
// const [dropdownVisible, setDropdownVisible] = useState(false);

// const { userdata } = useUserData();
// const currentUserId = userdata?.user?.id || NaN;

// const menuItems = useMemo(() => {
// if (!smsData.hasSms) return [];

// const { messages } = smsData;
// const count = messages.length;

// const label = (() => {
// 	if (count === 1) return `${messages[0].name} ${messages[0].surname}`.trim();
// 	if (count === 2)
// 		return `${messages[0].name} ${messages[0].surname} и ${messages[1].name} ${messages[1].surname}`.trim();
// 	return `${messages
// 		.slice(0, 2)
// 		.map((m) => `${m.name} ${m.surname}`.trim())
// 		.join(', ')} и ещё +${count - 2}`;
// })();

// return [
// 	{
// 		key: 'sms-section',
// 		label: (
// 			<div className={styles['sms-section']}>
// 				<Space direction="vertical" size={4}>
// 					<Space size={2} wrap>
// 						<span className={styles['sms-counter']}>{label}</span>
// 						<Button
// 							type="text"
// 							size="small"
// 							icon={<SyncOutlined />}
// 							// onClick={handleManualRefresh}
// 							title="Обновить"
// 						/>
// 					</Space>
// 					<div style={{ fontSize: '10px', color: '#888' }}>
// 						{/* Обновлено: {new Date(lastUpdate).toLocaleTimeString()} */}
// 					</div>
// 				</Space>
// 			</div>
// ),
// onClick: () => {
/* console.log('Переход к сообщениям') */
// 		},
// 	},
// ];
// }, [smsData, lastUpdate, handleManualRefresh]);
// }, []);

// const showModal = () => {
// 	setIsModalOpen(true);
// 	setDropdownVisible(false);
// };
// const handleOk = () => setIsModalOpen(false);
// const handleCancel = () => setIsModalOpen(false);

// <>ololololo</>
// <Space style={{ padding: 0 }}>
// 	<Dropdown
// 		menu={{ items: menuItems }}
// 		trigger={['hover']}
// 		open={dropdownVisible}
// 		onOpenChange={setDropdownVisible}
// 	>
// 		<div>
// 			<Button
// 				style={{ background: 'transparent' }}
// 				type="primary"
// 				onClick={showModal}
// 				loading={loading}
// 			>
// 				<MessageOutlined />
// 				{smsData.hasSms && (
// 					<span
// 						className={styles['notification-badge']}
// 						onClick={handleManualRefresh}
// 						title="Кликните для обновления"
// 					>
// 						{smsData.messages.length}
// 					</span>
// 				)}
// 			</Button>
// 		</div>
// 	</Dropdown>

// 	<ChatModal open={isModalOpen} onOk={handleOk} onCancel={handleCancel} smsData={smsData} />

// 	{error && <span style={{ color: 'red', fontSize: 12 }}>Ошибка загрузки сообщений</span>}
// </Space>
