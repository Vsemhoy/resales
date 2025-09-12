import React, { useState, useEffect, useRef } from 'react';
import {
	Layout,
	Input,
	Button,
	List,
	Avatar,
	message as antMessage,
	Spin,
	Drawer,
	Menu,
	Typography,
	Divider,
	Badge,
	Switch,
	Select,
	Space,
} from 'antd';
import {
	UserOutlined,
	SendOutlined,
	MenuOutlined,
	WechatOutlined,
	SettingOutlined,
	UserSwitchOutlined,
	NotificationOutlined,
	SearchOutlined,
	LogoutOutlined,
	MoonOutlined,
	SunOutlined,
	BellOutlined,
	MessageOutlined,
	TeamOutlined,
	PlusOutlined,
} from '@ant-design/icons';
import { MOCK_MESSAGES, transformMessages } from '../mock/mock';
import './style/Layout.css';

const { Header, Content, Footer } = Layout;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

export const ChatLayout = ({ messages: initialMessages, username: initialUsername }) => {
	const [messages, setMessages] = useState(initialMessages || []);
	const [inputMessage, setInputMessage] = useState('');
	const [isConnected, setIsConnected] = useState(false);
	const [username, setUsername] = useState(initialUsername || '');
	const [isUsernameSet, setIsUsernameSet] = useState(!!initialUsername);
	const [loading, setLoading] = useState(false);
	const [currentChatId, setCurrentChatId] = useState(47);
	const [drawerVisible, setDrawerVisible] = useState(false);
	const [activeChats, setActiveChats] = useState([]);
	const [notificationsEnabled, setNotificationsEnabled] = useState(true);
	const [onlineStatus, setOnlineStatus] = useState(true);
	const [darkMode, setDarkMode] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [fontSize, setFontSize] = useState(14);
	const ws = useRef(null);
	const messagesEndRef = useRef(null);

	const mockChats = [
		{
			id: 47,
			name: 'Кошелева Валентина',
			unread: 3,
			lastMessage: 'Планируем поездку на дачу',
			online: true,
		},
		{ id: 540, name: 'Точилина Лидия', unread: 1, lastMessage: 'Зайдите ко мне!', online: false },
		{ id: 123, name: 'Иванов Иван', unread: 0, lastMessage: 'Добрый день!', online: true },
		{ id: 456, name: 'Петров Петр', unread: 7, lastMessage: 'Когда встретимся?', online: true },
		{
			id: 789,
			name: 'Сидорова Мария',
			unread: 0,
			lastMessage: 'Спасибо за помощь!',
			online: false,
		},
		{
			id: 101,
			name: 'Групповой чат',
			unread: 12,
			lastMessage: 'Алексей: Всем привет!',
			online: true,
			isGroup: true,
		},
	];

	const filteredChats = activeChats.filter(
		(chat) =>
			chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
		setActiveChats(mockChats);
	}, [messages]);

	const connectWebSocket = () => {
		ws.current = new WebSocket('ws://localhost:8080');

		ws.current.onopen = () => {
			setIsConnected(true);
			antMessage.success('Connected to chat');
			loadMockMessages();
		};

		ws.current.onmessage = (e) => {
			try {
				const data = JSON.parse(e.data);

				if (data.content && data.content.sms) {
					const smsMessage = data.content.sms[0];
					const transformedMessage = {
						id: smsMessage.id,
						chatId: smsMessage.chat_id,
						username:
							typeof smsMessage.from === 'string'
								? smsMessage.from
								: `${smsMessage.from.name} ${smsMessage.from.surname}`,
						text: smsMessage.text,
						timestamp: smsMessage.created_at * 1000,
						status: smsMessage.status,
						to: smsMessage.to,
					};

					setMessages((prev) => [...prev, transformedMessage]);
				} else if (data.text) {
					setMessages((prev) => [...prev, data]);
				}
			} catch (error) {
				console.error('Error parsing message:', error);
			}
		};

		ws.current.onclose = () => {
			setIsConnected(false);
			antMessage.warning('Disconnected from chat');
		};

		ws.current.onerror = (error) => {
			console.error('WebSocket error:', error);
			antMessage.error('Connection error');
		};
	};

	const loadMockMessages = () => {
		const filteredMessages = transformMessages(MOCK_MESSAGES).filter(
			(msg) => msg.chatId === currentChatId
		);
		setMessages(filteredMessages);
	};

	const handleChatChange = (chatId) => {
		setCurrentChatId(chatId);
		setMessages([]);
		setLoading(true);

		setTimeout(() => {
			const filteredMessages = transformMessages(MOCK_MESSAGES).filter(
				(msg) => msg.chatId === chatId
			);
			setMessages(filteredMessages);
			setLoading(false);
			setDrawerVisible(false);
		}, 300);
	};

	const sendMessage = () => {
		if (inputMessage.trim() && ws.current && isConnected) {
			const messageData = {
				chat_id: currentChatId,
				from: username,
				to: 'Получатель',
				text: inputMessage.trim(),
				status: false,
				created_at: Math.floor(Date.now() / 1000),
			};

			ws.current.send(JSON.stringify(messageData));
			setInputMessage('');
		} else if (inputMessage.trim()) {
			const localMessage = {
				id: Date.now(),
				chatId: currentChatId,
				username: username,
				text: inputMessage.trim(),
				timestamp: Date.now(),
				status: false,
				to: 'Получатель',
			};

			setMessages((prev) => [...prev, localMessage]);
			setInputMessage('');
		}
	};

	const handleKeyPress = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	const handleSetUsername = () => {
		if (username.trim()) {
			setIsUsernameSet(true);
			connectWebSocket();
		} else {
			antMessage.warning('Please enter a username');
		}
	};

	const formatTime = (timestamp) => {
		return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	};

	const getAvatarInitials = (name) => {
		if (!name) return 'U';
		const names = name.split(' ');
		if (names.length === 1) return names[0].charAt(0).toUpperCase();
		return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
	};

	const getCurrentChatName = () => {
		const chat = mockChats.find((chat) => chat.id === currentChatId);
		return chat ? chat.name : 'Неизвестный чат';
	};

	const handleLogout = () => {
		setIsUsernameSet(false);
		setUsername('');
		setMessages([]);
		setDrawerVisible(false);
		antMessage.success('Вы вышли из системы');
	};

	const handleCreateChat = () => {
		antMessage.info('Функция создания чата в разработке');
	};

	const renderChatsSidebar = () => (
		<Drawer
			placement="left"
			onClose={() => setDrawerVisible(false)}
			visible={drawerVisible}
			width={380}
			bodyStyle={{ padding: 0 }}
			headerStyle={{ display: 'none' }}
		>
			<div className="sidebar-header">
				<div className="sidebar-header-content">
					<Avatar size={40} icon={<UserOutlined />} />
					<div className="sidebar-user-info">
						<Title level={5} style={{ margin: 0, color: 'white' }}>
							{username}
						</Title>
						<Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>
							{onlineStatus ? 'В сети' : 'Не в сети'}
						</Text>
					</div>
					<Button
						icon={<LogoutOutlined />}
						type="text"
						size="small"
						onClick={handleLogout}
						style={{ color: 'white' }}
					/>
				</div>
			</div>

			<div className="sidebar-section">
				<div className="section-title">
					<SearchOutlined />
					<span>Поиск чатов</span>
				</div>
				<Input
					placeholder="Поиск по чатам и сообщениям..."
					prefix={<SearchOutlined />}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					style={{ marginBottom: '16px' }}
				/>
			</div>

			<div className="sidebar-section">
				<div className="section-title">
					<MessageOutlined />
					<span>Чаты</span>
					<Button icon={<PlusOutlined />} type="text" size="small" onClick={handleCreateChat} />
				</div>

				<Menu mode="vertical" className="chats-menu">
					{filteredChats.map((chat) => (
						<Menu.Item
							key={chat.id}
							onClick={() => handleChatChange(chat.id)}
							className={currentChatId === chat.id ? 'active-chat' : ''}
						>
							<div className="chat-item">
								<Badge dot={chat.online} color="green" offset={[-5, 35]}>
									<Avatar
										size="large"
										style={{
											backgroundColor: chat.isGroup ? '#722ed1' : '#1890ff',
										}}
									>
										{chat.isGroup ? <TeamOutlined /> : getAvatarInitials(chat.name)}
									</Avatar>
								</Badge>
								<div className="chat-info">
									<Text strong>{chat.name}</Text>
									<Text type="secondary" ellipsis>
										{chat.lastMessage}
									</Text>
								</div>
								{chat.unread > 0 && <Badge count={chat.unread} style={{ marginLeft: 'auto' }} />}
							</div>
						</Menu.Item>
					))}
				</Menu>
			</div>

			<div className="sidebar-footer">
				<Divider style={{ margin: '12px 0' }} />

				<div className="sidebar-section">
					<div className="section-title">
						<SettingOutlined />
						<span>Настройки приложения</span>
					</div>

					<div className="setting-item">
						<Space>
							<NotificationOutlined />
							<span>Уведомления</span>
						</Space>
						<Switch
							checked={notificationsEnabled}
							onChange={setNotificationsEnabled}
							size="small"
						/>
					</div>

					<div className="setting-item">
						<Space>
							<BellOutlined />
							<span>Звук уведомлений</span>
						</Space>
						<Switch
							checked={notificationsEnabled}
							onChange={setNotificationsEnabled}
							size="small"
						/>
					</div>

					<div className="setting-item">
						<Space>
							{darkMode ? <MoonOutlined /> : <SunOutlined />}
							<span>Тёмная тема</span>
						</Space>
						<Switch checked={darkMode} onChange={setDarkMode} size="small" />
					</div>

					<div className="setting-item">
						<Space>
							<UserSwitchOutlined />
							<span>Статус онлайн</span>
						</Space>
						<Switch checked={onlineStatus} onChange={setOnlineStatus} size="small" />
					</div>

					<div className="setting-item">
						<Space>
							<span>Размер шрифта</span>
						</Space>
						<Select value={fontSize} onChange={setFontSize} size="small" style={{ width: 80 }}>
							<Option value={12}>12px</Option>
							<Option value={14}>14px</Option>
							<Option value={16}>16px</Option>
							<Option value={18}>18px</Option>
						</Select>
					</div>
				</div>

				<Divider style={{ margin: '12px 0' }} />

				<div className="sidebar-version">
					<Text type="secondary" style={{ fontSize: '12px' }}>
						Messenger App v1.0.0
					</Text>
				</div>
			</div>
		</Drawer>
	);

	return (
		<Layout className="chat-container">
			<Header className="chat-header">
				<div className="header-left">
					<Button
						icon={<MenuOutlined />}
						type="text"
						onClick={() => setDrawerVisible(true)}
						className="sidebar-toggle"
					/>
					<h2>{getCurrentChatName()}</h2>
				</div>
				<div className="connection-status">
					<span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`} />
					{isConnected ? 'Online' : 'Offline'}
				</div>
			</Header>

			{renderChatsSidebar()}

			<Content className="chat-content">
				{!isUsernameSet ? (
					<div className="username-modal">
						<div className="username-form">
							<Title level={3}>Введите ваше имя</Title>
							<Input
								placeholder="Ваше имя и фамилия"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								onPressEnter={handleSetUsername}
								maxLength={20}
								size="large"
							/>
							<Button
								type="primary"
								onClick={handleSetUsername}
								className="username-button"
								size="large"
							>
								Войти в чат
							</Button>
						</div>
					</div>
				) : (
					<>
						<div className="messages-container">
							{loading ? (
								<div className="loading-container">
									<Spin size="large" />
								</div>
							) : (
								<List
									itemLayout="horizontal"
									dataSource={messages}
									renderItem={(item) => (
										<List.Item
											className={`message-item ${item.username === username ? 'own-message' : ''}`}
										>
											<List.Item.Meta
												avatar={
													<Avatar
														size="large"
														style={{
															backgroundColor: item.username === username ? '#1890ff' : '#f56a00',
														}}
													>
														{getAvatarInitials(item.username)}
													</Avatar>
												}
												title={
													<div className="message-header">
														<span className="message-username">{item.username}</span>
														<span className="message-time">{formatTime(item.timestamp)}</span>
													</div>
												}
												description={item.text}
											/>
										</List.Item>
									)}
								/>
							)}
							<div ref={messagesEndRef} />
						</div>

						<Footer className="chat-footer">
							<div className="message-input-container">
								<TextArea
									rows={2}
									placeholder="Введите сообщение..."
									value={inputMessage}
									onChange={(e) => setInputMessage(e.target.value)}
									onKeyPress={handleKeyPress}
									disabled={!isConnected}
									size="large"
								/>
								<Button
									type="primary"
									icon={<SendOutlined />}
									onClick={sendMessage}
									disabled={!inputMessage.trim()}
									className="send-button"
									size="large"
								>
									Отправить
								</Button>
							</div>
						</Footer>
					</>
				)}
			</Content>
		</Layout>
	);
};
