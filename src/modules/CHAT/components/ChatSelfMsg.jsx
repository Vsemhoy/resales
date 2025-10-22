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
				return <FileImageOutlined style={{fontSize: '25px', color: '#555555'}}/>;
			// Документы
			case 'pdf':
				return <FilePdfOutlined style={{fontSize: '25px', color: '#555555'}}/>;
			case 'doc': case 'docx': case 'rtf': case 'odt':
				return <FileWordOutlined style={{fontSize: '25px', color: '#555555'}}/>;
			case 'xls': case 'xlsx': case 'csv': case 'ods':
				return <FileExcelOutlined style={{fontSize: '25px', color: '#555555'}}/>;
			case 'ppt': case 'pptx': case 'odp':
				return <FilePptOutlined style={{fontSize: '25px', color: '#555555'}}/>;
			case 'md': case 'markdown':
				return <FileMarkdownOutlined style={{fontSize: '25px', color: '#555555'}}/>;
			// Архивы
			case 'zip': case 'rar': case '7z': case 'tar': case 'gz':
				return <FileZipOutlined style={{fontSize: '25px', color: '#555555'}}/>;
			// Текстовые файлы
			case 'txt': case 'log': case 'ini': case 'xml': case 'json': case 'yaml':
				return <FileTextOutlined style={{fontSize: '25px', color: '#555555'}}/>;
			// Остальное - общая иконка
			default:
				return <FileOutlined style={{fontSize: '25px', color: '#555555'}}/>;
		}
	};

	return (
		<div className={messageClass}>
			<div className={bubbleClass}>
				<div className={styles.senderName}><span style={{color: 'red'}}>{fromId}</span> {senderName}</div>
				<span>{text}</span>
				<div className={styles.files_container}>
					{files && files.length > 0 && files.map((file, index) => (
						<a href={`${HTTP_HOST}/${file.route}`} target={'_blank'} className={styles.file}>
							<div className={`${styles.file_circle} ${styles.self}`}>
								{pasteFileIcon(file.extension)}
							</div>
							<p className={styles.href_label}>{file?.name}</p>
						</a>
					))}
				</div>
				<div className={styles.time} style={{display: 'flex', justifyContent: 'flex-end', height: '18px'}}>
					<div>{dayjs(+timestamp * 1000).format('HH:mm')}</div>
					{!isSending &&
						<span style={{width: '18px', height: '18px', position: 'relative'}}
							  title={read ? 'Прочитано' : 'Отправлено'}
						>
							<CheckOutlined style={{color: read ? 'green' : ''}}/>
							{read && <CheckOutlined
								style={{position: 'absolute', top: '4px', left: '3px', color: read ? 'green' : ''}}/>}
						</span>
					}
				</div>
				{isSending && <span className={styles.sending}> • отправляется...</span>}
			</div>
		</div>
	);
}
