export default function ChatMessage() {
	const incomingMessage = true;
	return (
		<>
			<div classname={incomingMessage === true ? 'wrapper--to' : 'wrapper--from'}></div>
			<h3>Отправитель</h3>
			<time datetime="">Время изменения</time>
			<time datetime="">Время отправки</time>
			{/* Пример использования */}
			<time datetime="2001-05-15 19:00">15 мая</time>
		</>
	);
}
