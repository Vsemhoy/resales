import styles from './style/Chat.module.css';
import dayjs from 'dayjs';

export default function ChatSelfMsg({ message }) {
	const { text, timestamp, isSending, senderName } = message;

	// Используем только существующие классы
	const messageClass = `${styles.message} ${styles.myMessage} ${
		isSending ? styles.localMessage : ''
	}`;

	const bubbleClass = `${styles.bubble} ${styles.myMessageBubble}`;

	return (
		<div className={messageClass}>
			<div className={bubbleClass}>
				<div className={styles.senderName}>{senderName}</div>
				<span>{text}</span>
				<div className={styles.time}>
					{dayjs(+timestamp * 1000).format('HH:mm')}
					{isSending && <span className={styles.sending}> • отправляется...</span>}
				</div>
			</div>
		</div>
	);
}
