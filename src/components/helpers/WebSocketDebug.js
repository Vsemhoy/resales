import { useChatSocket } from '../../context/ChatSocketContext';
import { PROD_API_URL } from '../../config/Api'; // Импортируем из Api.js
import { CSRF_TOKEN } from '../../config/config';

export const WebSocketDebug = () => {
	const { connected, messages, sendMessage, connectionStatus, reconnect } = useChatSocket();

	// Функция для получения полного URL используя PROD_API_URL из Api.js
	const getFullUrl = (endpoint) => {
		let baseUrl = PROD_API_URL;

		// Если в PROD_API_URL нет протокола, добавляем его
		if (baseUrl && !baseUrl.startsWith('http')) {
			baseUrl = `http://${baseUrl}`;
		}

		// Если PROD_API_URL не определен, используем текущий хост
		if (!baseUrl) {
			baseUrl = window.location.origin;
		}

		// Убираем слеш в конце baseUrl если есть
		baseUrl = baseUrl.replace(/\/$/, '');

		// Убираем слеш в начале endpoint если есть
		endpoint = endpoint.replace(/^\//, '');

		return `${baseUrl}/${endpoint}`;
	};

	const testChatMessage = () => {
		sendMessage({
			action: 'chat_message',
			chatId: 46,
			text: 'Тестовое сообщение из фронтенда ' + Date.now(),
		});
	};

	const testSubscribe = () => {
		sendMessage({
			action: 'subscribe',
			chatId: 46,
		});
	};

	const testLaravelRequest = () => {
		const requestId = 'laravel_test_' + Date.now();
		sendMessage({
			action: 'laravel_request',
			requestId: requestId,
			endpoint: getFullUrl('/api/sms'),
			method: 'POST',
			data: {
				to: 46,
				text: `Тестовое сообщение через Laravel API ${Date.now()}`,
				answer: null,
				_token: CSRF_TOKEN,
			},
		});
		console.log('🗂️ Sent Laravel request:', requestId);
	};

	const testLaravelCreateMessage = () => {
		const requestId = 'create_test_' + Date.now();
		sendMessage({
			action: 'laravel_request',
			requestId: requestId,
			endpoint: getFullUrl('/api/sms/create/sms'),
			method: 'POST',
			data: {
				text: 'Тестовое сообщение через BFF ' + new Date().toLocaleTimeString(),
				to: 46,
				files: [],
				_token: CSRF_TOKEN,
			},
		});
		console.log('📝 Sent Laravel create message:', requestId);
	};

	// Остальной код без изменений
	return (
		<div
			style={{
				position: 'fixed',
				top: '10px',
				right: '10px',
				background: connected ? 'green' : 'red',
				color: 'white',
				padding: '15px',
				borderRadius: '8px',
				zIndex: 10000,
				minWidth: '300px',
				fontFamily: 'monospace',
			}}
		>
			<div style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: '16px' }}>
				📡 WebSocket Debug
			</div>
			<div>Status: {connectionStatus}</div>
			<div>Connected: {connected ? 'Yes ✅' : 'No ❌'}</div>
			<div>Messages: {messages.length}</div>
			<div>Base URL: {PROD_API_URL}</div>

			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1fr 1fr',
					gap: '5px',
					marginTop: '10px',
					marginBottom: '10px',
				}}
			>
				<button
					onClick={testSubscribe}
					disabled={!connected}
					style={{
						padding: '5px 8px',
						fontSize: '11px',
						backgroundColor: connected ? '#1890ff' : '#ccc',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: connected ? 'pointer' : 'not-allowed',
					}}
				>
					📝 Subscribe
				</button>

				<button
					onClick={testChatMessage}
					disabled={!connected}
					style={{
						padding: '5px 8px',
						fontSize: '11px',
						backgroundColor: connected ? '#52c41a' : '#ccc',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: connected ? 'pointer' : 'not-allowed',
					}}
				>
					💬 Test Message
				</button>

				<button
					onClick={testLaravelRequest}
					disabled={!connected}
					style={{
						padding: '5px 8px',
						fontSize: '11px',
						backgroundColor: connected ? '#722ed1' : '#ccc',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: connected ? 'pointer' : 'not-allowed',
					}}
				>
					🗂️ Laravel API
				</button>

				<button
					onClick={testLaravelCreateMessage}
					disabled={!connected}
					style={{
						padding: '5px 8px',
						fontSize: '11px',
						backgroundColor: connected ? '#fa8c16' : '#ccc',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: connected ? 'pointer' : 'not-allowed',
					}}
				>
					📝 Create Msg
				</button>
			</div>

			<button
				onClick={reconnect}
				style={{
					width: '100%',
					padding: '5px',
					fontSize: '11px',
					backgroundColor: '#ff4d4f',
					color: 'white',
					border: 'none',
					borderRadius: '4px',
					cursor: 'pointer',
					marginBottom: '10px',
				}}
			>
				🔄 Reconnect
			</button>

			<div
				style={{
					marginTop: '10px',
					maxHeight: '120px',
					overflowY: 'auto',
					fontSize: '10px',
					background: 'rgba(0,0,0,0.2)',
					padding: '5px',
					borderRadius: '4px',
				}}
			>
				<div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Last messages:</div>
				{messages.slice(0, 5).map((msg, i) => (
					<div
						key={i}
						style={{
							marginBottom: '3px',
							padding: '2px',
							borderBottom: '1px solid rgba(255,255,255,0.1)',
							color:
								msg.type === 'error'
									? '#ff7875'
									: msg.type === 'laravel_response'
									? '#b37feb'
									: msg.type === 'new_message'
									? '#95de64'
									: 'white',
						}}
					>
						<strong>{msg.type}:</strong>{' '}
						{JSON.stringify(msg.data || msg.message || msg).substring(0, 50)}...
					</div>
				))}
				{messages.length === 0 && (
					<div style={{ fontStyle: 'italic', opacity: 0.7 }}>No messages yet</div>
				)}
			</div>
		</div>
	);
};
