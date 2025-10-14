import { useState } from 'react';
import { Layout } from 'antd';
import ChatSidebar from './ChatSidebar';
import ChatContentCopy from './ChatContentCopy';
import styles from './style/Chat.module.css';

const { Sider, Content } = Layout;

export default function ChatLayout() {
	const [selectedChatId, setSelectedChatId] = useState(null);

	return (
		<Layout className={styles['chat-layout']}>
			<Sider width={180} className={styles['chat-sidebar']}>
				<ChatSidebar onSelectChat={setSelectedChatId} selectedChatId={selectedChatId} />
			</Sider>
			<Content className={styles['chat-content']}>
				{selectedChatId ? (
					<ChatContentCopy chatId={selectedChatId} />
				) : (
					<div className={styles.statusMessage}>Выберите чат</div>
				)}
			</Content>
		</Layout>
	);
}
