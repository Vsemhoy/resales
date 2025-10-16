import styles from './style/Chat.module.css';
import dayjs from 'dayjs';
import {CheckOutlined} from "@ant-design/icons";

export default function ChatSelfMsg({ message }) {
	const { text, timestamp, isSending, senderName, fromId, read } = message;

	// Используем только существующие классы
	const messageClass = `${styles.message} ${styles.myMessage} ${
		isSending ? styles.localMessage : ''
	}`;

	const bubbleClass = `${styles.bubble} ${styles.myMessageBubble}`;

	return (
		<div className={messageClass}>
			<div className={bubbleClass}>
				<div className={styles.senderName}><span style={{color: 'red'}}>{fromId}</span> {senderName}</div>
				<span>{text}</span>
				<div className={styles.time} style={{display: 'flex', justifyContent: 'flex-end', height: '18px'}} >
					<div>{dayjs(+timestamp * 1000).format('HH:mm')}</div>
					{!isSending &&
						<span style={{width: '18px', height: '18px', position: 'relative'}}
							  title={read ? 'Прочитано' : 'Отправлено'}
						>
							<CheckOutlined style={{color: read ? 'green' : ''}}/>
							{read && <CheckOutlined style={{position: 'absolute', top: '4px', left: '3px', color: read ? 'green' : ''}}/>}
						</span>
					}
				</div>
				{isSending && <span className={styles.sending}> • отправляется...</span>}
			</div>
		</div>
	);
}
