import ChatHeader from './ChatHeader';
import ChatList from './ChatList';
import ChatFooter from './ChatFooter';
import { Layout } from 'antd';
import { useState } from 'react';
import styles from './style/Chat.module.css';

const { Header, Content, Footer } = Layout;

export default function ChatSidebar() {
	const [draggable, setDraggable] = useState(false);

	// 🟡 Добавь управление позициями
	const [position, setPosition] = useState('topLeft'); // возможные значения: 'topLeft', 'topRight', 'bottomLeft', 'bottomRight'

	return (
		<Layout className={styles['sidebar-layout']}>
			<ChatHeader className={styles['sidebar-header']} />
			<Content className={styles['sidebar-content']}>
				<ChatList />
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
