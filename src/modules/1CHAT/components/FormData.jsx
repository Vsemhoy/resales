import { useState } from 'react';
// import { Popover, Upload } from 'antd';

export const FormData = () => {
	// Состояние для хранения данных формы
	const [text, setText] = useState('');
	const [files, setFiles] = useState([]);
	const [status, setStatus] = useState('');

	// Обработчик изменения текста
	const handleTextChange = (e) => {
		setText(e.target.value);
	};

	// Обработчик изменения файлов
	const handleFileChange = (e) => {
		setFiles(e.target.files); // сохраняем все выбранные файлы
	};

	// Обработчик отправки формы
	const handleSubmit = async (e) => {
		e.preventDefault(); // Предотвращаем стандартное поведение формы

		// Создаем новый объект FormData
		const formData = new FormData();
		formData.append('text', text); // Добавляем текстовое сообщение
		formData.append('id', 132);
		formData.append('chat_id', 49);
		formData.append('from_surname', 'Илья');
		formData.append('from_name', 'Климов');
		formData.append('to_surname', 'Кошелев');
		formData.append('to_name', 'Александр');
		formData.append('status', false);
		formData.append('created_at', 1757341850);
		formData.append('updated_at', 1757341850);

		// Добавляем файлы в FormData
		for (let i = 0; i < files.length; i++) {
			formData.append('files[]', files[i]); // append каждый файл с именем 'files[]'
		}

		// Отправка данных на сервер
		try {
			setStatus('Загрузка...');
			const response = await fetch('/your-endpoint.php', {
				method: 'POST',
				body: formData,
			});

			const data = await response.json();

			if (data.status === 'success') {
				setStatus('Файлы успешно загружены!');
			} else {
				setStatus('Произошла ошибка при загрузке файлов.');
			}
		} catch (error) {
			setStatus('Ошибка при отправке данных.');
		}
	};

	return (
		<div>
			<h2>Отправить сообщение и файлы</h2>
			<form onSubmit={handleSubmit}>
				<div>
					<label htmlFor="text">Сообщение:</label>
					<input
						type="text"
						id="text"
						value={text}
						onChange={handleTextChange}
						placeholder="Введите ваше сообщение"
					/>
				</div>

				<div>
					<label htmlFor="files">Выберите файлы:</label>
					<input type="file" id="files" name="files[]" multiple onChange={handleFileChange} />
				</div>

				<button type="submit">Отправить</button>
			</form>

			{status && <p>{status}</p>}
		</div>
	);
};
