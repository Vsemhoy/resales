import { Layout } from 'antd';
import ChatSidebar from './ChatSidebar';
import ChatContent from './ChatContent';
import styles from './style/Chat.module.css';

const { Sider, Content } = Layout;

export default function ChatLayout() {
	return (
		<Layout className={styles['chat-layout']}>
			<Sider width={180} className={styles['chat-sidebar']}>
				<ChatSidebar />
			</Sider>
			<Content className={styles['chat-content']}>
				<ChatContent />
			</Content>
		</Layout>
	);
}
