import styles from './style/Chat.module.css';
import dayjs from 'dayjs';
import {
    CheckOutlined, FileExcelFilled, FileExcelOutlined, FileFilled,
    FileGifOutlined, FileImageFilled,
    FileImageOutlined,
    FileJpgOutlined, FileMarkdownFilled,
    FileMarkdownOutlined,
    FileOutlined, FilePdfFilled,
    FilePdfOutlined, FilePptFilled, FilePptOutlined, FileTextFilled,
    FileTextOutlined, FileWordFilled,
    FileWordOutlined, FileZipFilled,
    FileZipOutlined
} from "@ant-design/icons";
import {HTTP_HOST} from "../../../config/config";

export default function ChatSelfMsg({ message }) {
	const { text, files, timestamp, isSending, senderName, fromId, status } = message;

	// Используем только существующие классы
	const messageClass = `message ${styles.message} ${styles.myMessage} ${
		isSending ? styles.localMessage : ''
	}`;

	const bubbleClass = `${styles.bubble} ${styles.myMessageBubble}`;

	const pasteFileIcon = (extension) => {
		switch (extension) {
			// Изображения
			case 'jpg': case 'jpeg': case 'png': case 'gif': case 'bmp': case 'webp': case 'svg':
			case 'tiff': case 'ico': case 'psd': case 'ai':
				return <FileImageFilled style={{fontSize: '25px', color: '#555555'}}/>;
			// Документы
			case 'pdf':
				return <FilePdfFilled style={{fontSize: '25px', color: '#555555'}}/>;
			case 'doc': case 'docx': case 'rtf': case 'odt':
				return <FileWordFilled style={{fontSize: '25px', color: '#555555'}}/>;
			case 'xls': case 'xlsx': case 'csv': case 'ods':
				return <FileExcelFilled style={{fontSize: '25px', color: '#555555'}}/>;
			case 'ppt': case 'pptx': case 'odp':
				return <FilePptFilled style={{fontSize: '25px', color: '#555555'}}/>;
			case 'md': case 'markdown':
				return <FileMarkdownFilled style={{fontSize: '25px', color: '#555555'}}/>;
			// Архивы
			case 'zip': case 'rar': case '7z': case 'tar': case 'gz':
				return <FileZipFilled style={{fontSize: '25px', color: '#555555'}}/>;
			// Текстовые файлы
			case 'txt': case 'log': case 'ini': case 'xml': case 'json': case 'yaml':
				return <FileTextFilled style={{fontSize: '25px', color: '#555555'}}/>;
			// Остальное - общая иконка
			default:
				return <FileFilled style={{fontSize: '25px', color: '#555555'}}/>;
		}
	};

	return (
		<div className={messageClass} data-id={message.id}>
			<div className={bubbleClass}>
				{/*<div className={styles.senderName}><span style={{color: 'red'}}>{fromId}</span> {senderName}</div>*/}
				<span>{text}</span>
				<div className={styles.files_container}>
					{files && files.length > 0 && files.map((file, index) => (
						<a href={`${HTTP_HOST}/${file.route}`} target={'_blank'} className={styles.file}  key={`file-${file.id}-${index}`}>
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
							  title={status ? 'Прочитано' : 'Отправлено'}
						>
							<CheckOutlined style={{color: status ? 'green' : ''}}/>
							{status && <CheckOutlined
								style={{position: 'absolute', top: '4px', left: '3px', color: status ? 'green' : ''}}/>}
						</span>
					}
				</div>
				{isSending && <span className={styles.sending}> • отправляется...</span>}
			</div>
		</div>
	);
}
