// import { UserPic } from './UserPic';
import Input from 'antd/es/input/Input';
import styles from './style/Chat.module.css';
export default function ChatHeader() {
	return (
		<header className={styles['chat-header']}>
			<Input className={styles['chat-header__input']} />
			{/* <div>
				<UserPic />
			</div> */}
		</header>
	);
}
