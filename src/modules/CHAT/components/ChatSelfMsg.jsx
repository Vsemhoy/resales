import styles from './style/Chat.module.css';
import dayjs from 'dayjs';
import {
	CheckOutlined, FileExcelOutlined,
	FileGifOutlined,
	FileImageOutlined,
	FileJpgOutlined,
	FileMarkdownOutlined,
	FileOutlined,
	FilePdfOutlined, FilePptOutlined,
	FileTextOutlined,
	FileWordOutlined,
	FileZipOutlined
} from "@ant-design/icons";
import {HTTP_HOST} from "../../../config/config";

export default function ChatSelfMsg({ message }) {
	const { text, files, timestamp, isSending, senderName, fromId, read } = message;

	// Используем только существующие классы
	const messageClass = `${styles.message} ${styles.myMessage} ${
		isSending ? styles.localMessage : ''
	}`;

	const bubbleClass = `${styles.bubble} ${styles.myMessageBubble}`;

	const pasteFileIcon = (extension) => {
		switch (extension) {
			// Изображения
			case 'jpg': case 'jpeg': case 'png': case 'gif': case 'bmp': case 'webp': case 'svg':
			case 'tiff': case 'ico': case 'psd': case 'ai':
				return <FileImageOutlined />;
			// Документы
			case 'pdf':
				return <FilePdfOutlined />;
			case 'doc': case 'docx': case 'rtf': case 'odt':
				return <FileWordOutlined />;
			case 'xls': case 'xlsx': case 'csv': case 'ods':
				return <FileExcelOutlined />;
			case 'ppt': case 'pptx': case 'odp':
				return <FilePptOutlined />; // или FileOutlined
			case 'md': case 'markdown':
				return <FileMarkdownOutlined />;
			// Архивы
			case 'zip': case 'rar': case '7z': case 'tar': case 'gz':
				return <FileZipOutlined />;
			// Текстовые файлы
			case 'txt': case 'log': case 'ini': case 'xml': case 'json': case 'yaml':
				return <FileTextOutlined />;
			// Остальное - общая иконка
			default:
				return <FileOutlined />;
		}
	};

	return (
		<div className={messageClass}>
			<div className={bubbleClass}>
				<div className={styles.senderName}><span style={{color: 'red'}}>{fromId}</span> {senderName}</div>
				<span>{text}</span>
				<div className={styles.time} style={{display: 'flex', justifyContent: 'flex-end', height: '18px'}} >
					<div>{dayjs(+timestamp * 1000).format('HH:mm')}</div>
					{!isSending &&
						<span style={{width: '18px', height: '18px', position: 'relative'}}
							  title={read ? 'Прочитано' : 'Отправлено'}
						>
							<CheckOutlined style={{color: read ? 'green' : ''}}/>
							{read && <CheckOutlined style={{position: 'absolute', top: '4px', left: '3px', color: read ? 'green' : ''}}/>}
						</span>
					}
				</div>
				<div className={styles.files_container}>
					{files.length > 0 && files.map((file, index) => (
						<div className={styles.file}>
							{pasteFileIcon(file.extension)}
							<a href={`${HTTP_HOST}/${file.route}`}>file.route</a>
						</div>
					))}
				</div>
				{isSending && <span className={styles.sending}> • отправляется...</span>}
			</div>
		</div>
	);
}
