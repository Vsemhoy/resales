import styles from './style/Chat.module.css';
import dayjs from 'dayjs';
export default function ChatIncomingMsg({ message }) {
	const { text, timestamp, senderName, fromId } = message;

	return (
		<div className={`${styles.message} ${styles.otherMessage}`}>
			<div className={`${styles.bubble} ${styles.otherMessageBubble}`}>
				<div className={styles.senderName}>{senderName}</div>
				<span>{text}</span>
				<div className={styles.time}>
					{dayjs(+timestamp * 1000).format('HH:mm')}
					{fromId}
				</div>
			</div>
		</div>
	);
}
