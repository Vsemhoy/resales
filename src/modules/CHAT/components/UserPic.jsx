import { Avatar } from 'antd';

export const UserPic = ({ name, userImg }) => {
	return (
		<Avatar size="small">
			{userImg ? userImg : `${name ? name.charAt(0)?.toUpperCase() : null}`}
		</Avatar>
	);
};
