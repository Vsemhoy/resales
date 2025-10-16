import { useState } from 'react';
import {Empty, Layout} from 'antd';
import ChatSidebar from './ChatSidebar';
import ChatContent from './ChatContent';
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
					<ChatContent chatId={selectedChatId} />
				) : (
					<Empty description="Выберите чат"
						   image={Empty.PRESENTED_IMAGE_SIMPLE}
						   className={styles.antd_empty}
					/>
				)}
			</Content>
		</Layout>
	);
}
