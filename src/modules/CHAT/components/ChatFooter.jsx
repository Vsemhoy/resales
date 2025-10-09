import styles from './style/Chat.module.css';
import { Button, Space, Popover } from 'antd';
import {
	DragOutlined,
	SettingOutlined,
	BellOutlined,
	DownloadOutlined,
	LockOutlined,
	EyeInvisibleOutlined,
} from '@ant-design/icons';

export default function ChatFooter({ draggable, setDraggable, position, setPosition }) {
	const cyclePosition = () => {
		const nextPosition = {
			topLeft: 'topRight',
			topRight: 'bottomRight',
			bottomRight: 'bottomLeft',
			bottomLeft: 'topLeft',
		};

		setPosition(nextPosition[position] || 'topRight');
		console.log('Позиция изменена на', nextPosition[position] || 'topRight');
	};

	const settingsContent = (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
			<Button type="text" icon={<BellOutlined />}>
				Уведомления
			</Button>
			<Button type="text" icon={<DownloadOutlined />}>
				Автозагрузка файлов
			</Button>
			<Button type="text" icon={<LockOutlined />}>
				Приватность чата
			</Button>
			<Button type="text" icon={<EyeInvisibleOutlined />}>
				Скрыть из списка
			</Button>
		</div>
	);

	return (
		<div hidden>
			{/* <p>WS status: {connected ? 'Connected' : 'Disconnected'}</p> */}
			<button onClick={() => console.log('Hello')}>Send</button>
			<footer hidden className={styles['chat-footer']}>
				<Space.Compact>
					<Popover
						content={draggable ? 'Отключить перетаскивание' : 'Включить перетаскивание'}
						trigger="hover"
					>
						<Button
							type="default"
							onClick={() => {
								setDraggable(!draggable);
								// console.log('draggable =', !draggable);
							}}
						>
							<DragOutlined />
						</Button>
					</Popover>

					<Popover content="Переместить окно по углам экрана" trigger="hover">
						<Button type="default" onClick={cyclePosition}>
							<DragOutlined style={{ transform: 'rotate(45deg)' }} />
						</Button>
					</Popover>

					<Popover content={settingsContent} trigger="hover" title="Настройки чата">
						<Button type="default">
							<SettingOutlined />
						</Button>
					</Popover>
				</Space.Compact>
			</footer>
		</div>
	);
}
