import styles from './style/Chat.module.css';

export default function ChatIncomingMsg({ message }) {
	const { text, timestamp, senderName } = message;

	const formatTime = (timestamp) => {
		return new Date(timestamp).toLocaleTimeString('ru-RU', {
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const time = formatTime(timestamp);

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
