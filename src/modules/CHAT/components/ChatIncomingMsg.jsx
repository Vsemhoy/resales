import styles from './style/Chat.module.css';
import dayjs from 'dayjs';
export default function ChatIncomingMsg({ message }) {
	const { text, created_at, senderName } = message;

	return (
		<div className={`${styles.message} ${styles.otherMessage}`}>
			<div className={`${styles.bubble} ${styles.otherMessageBubble}`}>
				<div className={styles.senderName}>{senderName}</div>
				<span>{text}</span>
				<div className={styles.time}>{dayjs(+created_at * 1000).format('HH:mm')}</div>
			</div>
		</div>
	);
}
