import { LoadingOutlined } from '@ant-design/icons';
import { Timeline } from 'antd';

const TimeBid = ({ status, load }) => {
	if (load) {
		return (
			<div>
				<Timeline
					size="small"
					mode="right"
					items={[
						{
							label: <LoadingOutlined />,
							children: <LoadingOutlined />,
						},
						{
							label: <LoadingOutlined />,
							children: <LoadingOutlined />,
						},
						{
							label: <LoadingOutlined />,
							children: <LoadingOutlined />,
						},
						{
							label: <LoadingOutlined />,
							children: <LoadingOutlined />,
						},
					]}
				/>
			</div>
		);
	} else {
		return (
			<div>
				<Timeline
					size="small"
					mode="right"
					items={[
						{
							color: status === 1 ? '#1676fd' : '#51c21a',
							label: (
								<span style={{ fontStyle: 'italic' }}>{status === 1 ? 'Текущий этап' : ''}</span>
							),
							children: 'У менеджера',
						},
						{
							color: status === 2 ? '#1676fd' : status > 2 ? '#51c21a' : '#ccc',
							label: (
								<span style={{ fontStyle: 'italic' }}>{status === 2 ? 'Текущий этап' : ''}</span>
							),
							children: 'У администратора',
						},
						{
							color: status === 3 ? '#1676fd' : status > 3 ? '#51c21a' : '#ccc',
							children: 'У бухгалтера',
							label: (
								<span style={{ fontStyle: 'italic' }}>{status === 3 ? 'Текущий этап' : ''}</span>
							),
						},
						{
							color: status === 4 ? '#1676fd' : '#ccc',
							label: (
								<span style={{ fontStyle: 'italic' }}>{status === 4 ? 'Текущий этап' : ''}</span>
							),
							children: 'Завершено',
						},
					]}
				/>
			</div>
		);
	}
};

export default TimeBid;
