import styles from './style/Chat.module.css';
import dayjs from 'dayjs';
import {HTTP_HOST} from "../../../config/config";
import {
	FileExcelOutlined,
	FileImageOutlined, FileMarkdownOutlined, FileOutlined,
	FilePdfOutlined,
	FilePptOutlined, FileTextOutlined,
	FileWordOutlined, FileZipOutlined
} from "@ant-design/icons";
export default function ChatIncomingMsg({ message }) {
	const { text, files, timestamp, senderName, fromId } = message;

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
		<div className={`${styles.message} ${styles.otherMessage}`}>
			<div className={`${styles.bubble} ${styles.otherMessageBubble}`}>
				<div className={styles.senderName}><span style={{color: 'red'}}>{fromId}</span> {senderName}</div>
				<span>{text}</span>
				<div className={styles.files_container}>
					{files && files.length > 0 && files.map((file, index) => (
						<a href={`${HTTP_HOST}/${file.route}`} target={'_blank'} className={styles.file}>
							<div className={`${styles.file_circle}`}>
								{pasteFileIcon(file.extension)}
							</div>
							<p className={styles.href_label}>{file?.name}</p>
						</a>
					))}
				</div>
				<div className={styles.time}>
					{dayjs(+timestamp * 1000).format('HH:mm')}
				</div>
			</div>
		</div>
	);
}
