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

	useEffect(() => {
		setData(props.data);
	}, [props.data]);

	useEffect(() => {
		setOpenModal(props.openCopySpecification);
	}, [props.openCopySpecification]);

	const handleChange = () => {
		props.handleSetValue(value);
	};

	return (
		<Modal
			title="Выберите ID спецификации, в которую нужно скопировать"
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
					// handleChangeModel={props.handleChangeModel}
					// options={props.allModels ? props.allModels : []}
				/>
			</div>
		</Modal>
	);
};

export default CopyMessageView;
