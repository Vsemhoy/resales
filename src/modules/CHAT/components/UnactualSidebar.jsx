// import { useState } from 'react';
// import {
// 	UserOutlined,
// 	WechatOutlined,
// 	SettingOutlined,
// 	UserSwitchOutlined,
// 	NotificationOutlined,
// 	SearchOutlined,
// 	LogoutOutlined,
// 	MoonOutlined,
// 	SunOutlined,
// 	BellOutlined,
// 	MessageOutlined,
// 	TeamOutlined,
// 	PlusOutlined,
// } from '@ant-design/icons';
// import {
// 	Option,
// 	Input,
// 	Button,
// 	Avatar,
// 	message as antMessage,
// 	Drawer,
// 	Menu,
// 	Typography,
// 	Divider,
// 	Badge,
// 	Switch,
// 	Select,
// 	Space,
// } from 'antd';

// const { Title, Text } = Typography;

// export default function Sidebar() {
// 	// 🔧 Добавленные useState переменные
// 	const [drawerVisible, setDrawerVisible] = useState(true);
// 	const [username, setUsername] = useState('');
// 	const [onlineStatus, setOnlineStatus] = useState(true);
// 	const [searchQuery, setSearchQuery] = useState('');
// 	const [notificationsEnabled, setNotificationsEnabled] = useState(true);
// 	const [darkMode, setDarkMode] = useState(false);
// 	const [fontSize, setFontSize] = useState(14);
// 	const [currentChatId, setCurrentChatId] = useState(47);

// 	// 🔧 Моковые данные чатов (или передавай через props)
// 	const filteredChats = [
// 		{
// 			id: 47,
// 			name: 'Кошелева Валентина',
// 			unread: 3,
// 			lastMessage: 'Планируем поездку на дачу',
// 			online: true,
// 		},
// 		{
// 			id: 540,
// 			name: 'Точилина Лидия',
// 			unread: 1,
// 			lastMessage: 'Зайдите ко мне!',
// 			online: false,
// 		},
// 	];

// 	const handleLogout = () => {
// 		antMessage.success('Вы вышли из аккаунта');
// 	};

// 	const handleCreateChat = () => {
// 		antMessage.info('Создание чата пока не реализовано');
// 	};

// 	const handleChatChange = (chatId) => {
// 		setCurrentChatId(chatId);
// 	};

// 	const getAvatarInitials = (name) => {
// 		if (!name) return 'U';
// 		const parts = name.split(' ');
// 		if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
// 		return parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase();
// 	};
// 	return (
// 		<Drawer
// 			placement="left"
// 			onClose={() => setDrawerVisible(false)}
// 			visible={drawerVisible}
// 			width={380}
// 			bodyStyle={{ padding: 0 }}
// 			headerStyle={{ display: 'none' }}
// 		>
// 			<div className="sidebar-header">
// 				<div className="sidebar-header-content">
// 					<Avatar size={40} icon={<UserOutlined />} />
// 					<div className="sidebar-user-info">
// 						<Title level={5} style={{ margin: 0, color: 'white' }}>
// 							{username}
// 						</Title>
// 						<Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>
// 							{onlineStatus ? 'В сети' : 'Не в сети'}
// 						</Text>
// 					</div>
// 					<Button
// 						icon={<LogoutOutlined />}
// 						type="text"
// 						size="small"
// 						onClick={handleLogout}
// 						style={{ color: 'white' }}
// 					/>
// 				</div>
// 			</div>

// 			<div className="sidebar-section">
// 				<div className="section-title">
// 					<SearchOutlined />
// 					<span>Поиск чатов</span>
// 				</div>
// 				<Input
// 					placeholder="Поиск по чатам и сообщениям..."
// 					prefix={<SearchOutlined />}
// 					value={searchQuery}
// 					onChange={(e) => setSearchQuery(e.target.value)}
// 					style={{ marginBottom: '16px' }}
// 				/>
// 			</div>

// 			<div className="sidebar-section">
// 				<div className="section-title">
// 					<MessageOutlined />
// 					<span>Чаты</span>
// 					<Button icon={<PlusOutlined />} type="text" size="small" onClick={handleCreateChat} />
// 				</div>

// 				<Menu mode="vertical" className="chats-menu">
// 					{filteredChats.map((chat) => (
// 						<Menu.Item
// 							key={chat.id}
// 							onClick={() => handleChatChange(chat.id)}
// 							className={currentChatId === chat.id ? 'active-chat' : ''}
// 						>
// 							<div className="chat-item">
// 								<Badge dot={chat.online} color="green" offset={[-5, 35]}>
// 									<Avatar
// 										size="large"
// 										style={{
// 											backgroundColor: chat.isGroup ? '#722ed1' : '#1890ff',
// 										}}
// 									>
// 										{chat.isGroup ? <TeamOutlined /> : getAvatarInitials(chat.name)}
// 									</Avatar>
// 								</Badge>
// 								<div className="chat-info">
// 									<Text strong>{chat.name}</Text>
// 									<Text type="secondary" ellipsis>
// 										{chat.lastMessage}
// 									</Text>
// 								</div>
// 								{chat.unread > 0 && <Badge count={chat.unread} style={{ marginLeft: 'auto' }} />}
// 							</div>
// 						</Menu.Item>
// 					))}
// 				</Menu>
// 			</div>

// 			<div className="sidebar-footer">
// 				<Divider style={{ margin: '12px 0' }} />

// 				<div className="sidebar-section">
// 					<div className="section-title">
// 						<SettingOutlined />
// 						<span>Настройки приложения</span>
// 					</div>

// 					<div className="setting-item">
// 						<Space>
// 							<NotificationOutlined />
// 							<span>Уведомления</span>
// 						</Space>
// 						<Switch
// 							checked={notificationsEnabled}
// 							onChange={setNotificationsEnabled}
// 							size="small"
// 						/>
// 					</div>

// 					<div className="setting-item">
// 						<Space>
// 							<BellOutlined />
// 							<span>Звук уведомлений</span>
// 						</Space>
// 						<Switch
// 							checked={notificationsEnabled}
// 							onChange={setNotificationsEnabled}
// 							size="small"
// 						/>
// 					</div>

// 					<div className="setting-item">
// 						<Space>
// 							{darkMode ? <MoonOutlined /> : <SunOutlined />}
// 							<span>Тёмная тема</span>
// 						</Space>
// 						<Switch checked={darkMode} onChange={setDarkMode} size="small" />
// 					</div>

// 					<div className="setting-item">
// 						<Space>
// 							<UserSwitchOutlined />
// 							<span>Статус онлайн</span>
// 						</Space>
// 						<Switch checked={onlineStatus} onChange={setOnlineStatus} size="small" />
// 					</div>

// 					<div className="setting-item">
// 						<Space>
// 							<span>Размер шрифта</span>
// 						</Space>
// 						<Select value={fontSize} onChange={setFontSize} size="small" style={{ width: 80 }}>
// 							<Option value={12}>12px</Option>
// 							<Option value={14}>14px</Option>
// 							<Option value={16}>16px</Option>
// 							<Option value={18}>18px</Option>
// 						</Select>
// 					</div>
// 				</div>

// 				<Divider style={{ margin: '12px 0' }} />

// 				<div className="sidebar-version">
// 					<Text type="secondary" style={{ fontSize: '12px' }}>
// 						Messenger App v1.0.0
// 					</Text>
// 				</div>
// 			</div>
// 		</Drawer>
// 	);
// }
