import React, { useEffect, useState } from 'react';
import { Table } from 'antd';

const ProjectInfo = (props) => {
	const [projectInfo, setProjectInfo] = useState(null);

	useEffect(() => {
		if (props.project) {
			setProjectInfo(props.project);
		}
	}, [props.project]);

	const columns = [
		{
			key: 'label',
			dataIndex: 'label',
			width: 260,
			align: 'left',
			render: (text) => <span>{text}</span>,
		},
		{
			key: 'value',
			dataIndex: 'value',
			align: 'left',
			render: (e, v) => {
				switch (v.type) {
					// Возвращаем компонент если тип данных = 'input'
					case 'input':
						return (
							<>
								{/*<PassportInput
							value={e}
							disabled={true}
							field_name={v.id}
							allowclear={false}
							type={"outlined"}
						/>*/}
							</>
						);
					// Возвращаем компонент если тип данных = 'select'
					case 'select':
						return (
							<>
								{/*<PassportSelect
							disabled={true}
							value={e}
							options_name={v.id}
							_token={_token}
							default_options={true}
							allowclear={false}
							type_of_data={1}
						/>*/}
							</>
						);
					// Возвращаем компонент если тип данных = 'parent'
					case 'textArea':
						return (
							<>
								{/*<PassportTextArea
                value={e}
                disabled={true}
                field_name={v.id}
                allowclear={false}
                type={"outlined"}
              />*/}
								;
							</>
						);
					case 'date':
						return (
							<>
								{/*<PassportDate
                value={e}
                disabled={true}
                field_name={v.id}
                allowclear={false}
                type={"outlined"}
              />*/}
							</>
						);
					case 'autocomplete':
						console.log(v);
						return v.id === 'linkbid' ? (
							<>
								{/* <ProjectSelectBids
                  disabled={true}
                  value={e}
                  options_name={v.id}
                  _token={_token}
                  default_options={true}
                  allowclear={false}
                  type_of_data={1}
                  company_id={bidData.properties.org.id}
                /> */}
								<div></div>
							</>
						) : (
							<>
								{/*<PassportAutocomplete
                disabled={true}
                value={e}
                options_name={v.id}
                _token={_token}
                default_options={true}
                allowclear={false}
                type_of_data={1}
              />*/}
							</>
						);
					default:
						return null;
				}
			},
		},
	];

	return (
		<Table
			pagination={false}
			dataSource={projectInfo}
			columns={columns}
			title={null}
			expandable={{ childrenColumnName: 'next' }}
			showHeader={false}
		/>
	);
};

export default ProjectInfo;
