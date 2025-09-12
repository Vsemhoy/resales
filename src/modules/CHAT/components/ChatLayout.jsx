import { Drawer } from 'antd';
import ChatSidebar from './ChatSidebar';
import ChatContent from './ChatContent';
export default function ChatLayout() {
	return (
		<>
			<div flex>
				<ChatSidebar />
			</div>
			<Drawer></Drawer>
		</>
	);
}
