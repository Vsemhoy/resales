import { Layout } from 'antd';
import ChatSidebar from './ChatSidebar';
import ChatContent from './ChatContent';
import './style/ChatLayout.css';

const { Sider, Content } = Layout;

export default function ChatLayout() {
	return (
		<Layout className="chat-layout">
			<Sider width={180} className="chat-sidebar">
				<ChatSidebar />
			</Sider>
			<Content className="chat-content">
				<ChatContent />
			</Content>
		</Layout>
	);
}
