import styles from './style/Chat.module.css';
import { useState } from 'react';
import ChatHeader from './ChatHeader';
import ChatList from './ChatList';
import ChatFooter from './ChatFooter';
import { Layout } from 'antd';

const { Content } = Layout;

export default function ChatSidebar({ onSelectChat, selectedChatId }) {
	const [draggable, setDraggable] = useState(false);
	const [position, setPosition] = useState('topLeft');
	const [search, setSearch] = useState('');

	return (
		<Layout className={styles['sidebar-layout']}>
			<ChatHeader
				className={styles['sidebar-header']}
				onSearchChange={setSearch}
				selectedChatId={selectedChatId}
			/>
			<Content className={styles['sidebar-content']}>
				{/* ПЕРЕДАЕМ selectedChatId в ChatList */}
				<ChatList
					search={search}
					onSelectChat={onSelectChat}
					selectedChatId={selectedChatId} // ДОБАВЛЕНО
				/>
			</Content>
			<ChatFooter
				className={styles['sidebar-footer']}
				draggable={draggable}
				setDraggable={setDraggable}
				position={position}
				setPosition={setPosition}
			/>
		</Layout>
	);
}
