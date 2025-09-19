import { useEffect, useState } from 'react';
import {InputNumber, Modal} from 'antd';

const CopyMessageView = (props) => {
	const [openModal, setOpenModal] = useState(false);
	const [value, setValue] = useState(0);
	const [type, setType] = useState(1);
	const [title, setTitle] = useState("");

	useEffect(() => {
		setOpenModal(props.openCopySpecification);
	}, [props.openCopySpecification]);

	useEffect(() => {
		setTitle(props.customText);
	}, [props.customText]);

	useEffect(() => {
		setType(props.type);
	}, [props.type]);

	const handleChange = () => {
		props.handleSetValue(value, type);
	};

	return (
		<Modal
			title={title}
			open={openModal}
			onOk={props.handleOk}
			onCancel={props.handleCancel}
		>
			<div style={{marginTop: "20px"}}>
				<InputNumber
					min={1}
					style={{width: '100%'}}
					onChange={(spec_id) => setValue(spec_id)}
					onBlur={handleChange}
				/>
			</div>
		</Modal>
	);
};

export default CopyMessageView;
