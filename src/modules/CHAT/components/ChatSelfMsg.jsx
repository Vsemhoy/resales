import styles from './style/Chat.module.css';
import dayjs from 'dayjs';

export default function ChatSelfMsg({ message }) {
	const { text, created_at, isLocal, isSending, senderName } = message;

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
					{dayjs(+created_at * 1000).format('HH:mm')}
					{/* Показываем "отправляется..." только когда сообщение еще отправляется */}
					{isSending && <span className={styles.sending}> • отправляется...</span>}
				</div>
			</div>
		</div>
	);
}
