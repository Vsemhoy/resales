import styles from './style/Chat.module.css';

export default function ChatMessage() {
	const incomingMessage = true;

	return (
		<>
			<div className={incomingMessage ? styles['wrapper--to'] : styles['wrapper--from']}></div>
			<h3>Отправитель</h3>
			<time dateTime="">Время изменения</time>
			<time dateTime="">Время отправки</time>
			<time dateTime="2001-05-15T19:00">15 мая</time>
		</>
	);
}
