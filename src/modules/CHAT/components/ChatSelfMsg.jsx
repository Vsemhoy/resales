import styles from './style/Chat.module.css';

/**
 * Компонент для собственных (исходящих) сообщений
 */
export default function ChatSelfMsg({ message }) {
	const { text, time, isLocal, isSending, senderName } = message;

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
					{time}
					{/* Показываем "отправляется..." только когда сообщение еще отправляется */}
					{isSending && <span className={styles.sending}> • отправляется...</span>}
				</div>
			</div>
		</div>
	);
}
