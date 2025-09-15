import ChatHeader from './ChatHeader';
import ChatList from './ChatList';
import ChatFooter from './ChatFooter';
import { Layout } from 'antd';
import './style/ChatSidebar.css';

const { Header, Content, Footer } = Layout;

export default function ChatSidebar() {
	return (
		<Layout className="sidebar-layout">
			<Header className="sidebar-header">
				<ChatHeader />
			</Header>
			<Content className="sidebar-content">
				<ChatList />
			</Content>
			<Footer className="sidebar-footer">
				<ChatFooter />
			</Footer>
		</Layout>
	);
}
