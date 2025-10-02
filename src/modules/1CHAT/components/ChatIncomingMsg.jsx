import styles from './style/Chat.module.css';

/**
 * Компонент для входящих сообщений от собеседника
 */
export default function ChatIncomingMsg({ message }) {
	const { text, time, senderName } = message;

	return (
		<div className={`${styles.message} ${styles.otherMessage}`}>
			<div className={`${styles.bubble} ${styles.otherMessageBubble}`}>
				<div className={styles.senderName}>{senderName}</div>
				<span>{text}</span>
				<div className={styles.time}>{time}</div>
			</div>
		</div>
	);
}
