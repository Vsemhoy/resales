import {
	ArchiveBoxXMarkIcon,
	ArrowRightEndOnRectangleIcon,
	ArrowRightStartOnRectangleIcon,
	DocumentCurrencyDollarIcon,
	NewspaperIcon,
} from '@heroicons/react/24/outline';
import {Button, Dropdown, Input, InputNumber, Menu, Modal, Select, Space, Tag, Tooltip} from 'antd';
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
	DeleteOutlined,
	DollarOutlined,
	FileDoneOutlined,
	InfoCircleOutlined,
	LogoutOutlined,
	SafetyOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import Name from './alan/Name';
import Count from './alan/Count';
import NameSelect from "./alan/NameSelect";

const CopyMessageView = (props) => {
	const [data, setData] = useState([]);
	const [allModels, setAllModels] = useState(props.allModels ?? null);
	const [openModal, setOpenModal] = useState(false);
	const [value, setValue] = useState(0);
	const [type, setType] = useState(1);
	const [title, setTitle] = useState("");

	useEffect(() => {
		setData(props.data);
	}, [props.data]);

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
