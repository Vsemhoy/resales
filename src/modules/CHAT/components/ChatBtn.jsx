import React, { useState, useEffect } from 'react';
import { Button, Dropdown, Space } from 'antd';
import { MessageOutlined } from '@ant-design/icons';

import { MOCK } from '../mock/mock.js';
import { CSRF_TOKEN, PRODMODE } from '../../../config/config';
import { PROD_AXIOS_INSTANCE } from '../../../config/Api.js';
import { ChatModal } from './ChatModal';

export const ChatBtn = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [dropdownVisible, setDropdownVisible] = useState(false);
	const [smsData, setSmsData] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchSmsData = async () => {
			if (!PRODMODE) {
				try {
					const response = await PROD_AXIOS_INSTANCE.post('/api/sms', { _token: CSRF_TOKEN });
					if (response.data?.content?.sms) {
						const smsArray = response.data.content.sms;
						const messages = smsArray.map((sms) => ({
							id: sms.id,
							name: sms.from.name,
							surname: sms.from.surname,
							content: sms.text || '(без текста)',
						}));
						setSmsData({ hasSms: smsArray.length > 0, messages });
					} else {
						setSmsData({ hasSms: false, messages: [] });
					}
				} catch (error) {
					console.error('Ошибка при загрузке sms:', error);
					setSmsData({ hasSms: false, messages: [] });
				} finally {
					setLoading(false);
				}
			} else {
				const smsArray = MOCK.reduce((acc, obj) => [...acc, ...obj.content.sms], []);
				const messages = smsArray.map((sms) => ({
					id: sms.id,
					name: sms.from.name,
					surname: sms.from.surname,
					content: sms.text || '(без текста)',
				}));
				setSmsData({ hasSms: smsArray.length > 0, messages });
				setLoading(false);
			}
		};

		fetchSmsData();
	}, []);

	const menuItems = [
		...(smsData?.hasSms
			? [
					{
						key: 'sms-section',
						label: (
							<div className="sms-section">
								<Space direction="vertical" size={4}>
									<Space size={4} />
									<Space size={2} wrap>
										{(() => {
											switch (smsData.messages.length) {
												case 1:
													return (
														<>{`${smsData.messages[0].name} ${smsData.messages[0].surname}`}</>
													);
												case 2:
													return (
														<>
															{`${smsData.messages[0].name} ${smsData.messages[0].surname} и ${smsData.messages[1].name} ${smsData.messages[1].surname}`}
														</>
													);
												default:
													return (
														<>
															{smsData.messages.length > 2 && (
																<span className="sms-counter">
																	{`${smsData.messages[0].surname} ${smsData.messages[0].name}, ${
																		smsData.messages[1].surname
																	} ${smsData.messages[1].name} и ещё +${
																		smsData.messages.length - 2
																	}`}
																</span>
															)}
														</>
													);
											}
										})()}
									</Space>
								</Space>
							</div>
						),
						onClick: () => console.log('Переход к сообщениям'),
					},
			  ]
			: []),
	];

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
						className="sa-flex-gap chat"
					>
						<MessageOutlined />
						{smsData?.hasSms && (
							<span className="notification-badge">{smsData.messages.length}</span>
						)}
					</Button>
				</div>
			</Dropdown>

			<ChatModal open={isModalOpen} onOk={handleOk} onCancel={handleCancel} smsData={smsData} />
		</Space>
	);
};
