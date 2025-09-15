import React, { useEffect, useState } from 'react';
import EngineerRow from './EngineerRow';
import { Button, Spin } from 'antd';

const EngineerListTable = (props) => {
	const [models, setModels] = useState([]);
	const [loading, setLoading] = useState(null);
	useEffect(() => {
		setModels(props.models);
		setLoading(props.loading);
	}, [props.models, props.loading]);

	if (loading) return <Spin style={{ marginTop: '20px' }} tip="Загрузка данных..." />;
	return (
		<div className={'sa-table-box'}>
			<div className={'sa-table-box-header'}>
				<div className={'sa-table-box-engineer sa-table-box-row'}>
					<div className={'sa-table-box-cell'}>
						<div className={'sa-table-head-on'}>№</div>
					</div>
					<div className={'sa-table-box-cell'}>
						<div className={'sa-table-head-on'}>Название</div>
					</div>
					<div className={'sa-table-box-cell'}>
						<div className={'sa-table-head-on'}>Кол-во</div>
					</div>
					<div className={'sa-table-box-cell'}>
						<div className={'sa-table-head-on'}>
							{/*<div className={'sa-pa-3'}>Комментарий</div>*/}
						</div>
					</div>
				</div>
			</div>
			<div className={'sa-table-box-stack'}>
				{models?.length > 0 &&
					models.map((model, index) => (
						<EngineerRow
							data={model}
							allModels={props.allModels}
							update_local_state={props.update_local_state}
							index={index}
							EDITMODE={props.EDITMODE}
							key={index + '_' + model.model_id}
						/>
					))}
				<Button
					style={{ marginTop: '20px', width: '30%' }}
					type="primary"
					onClick={() => props.update_local_state('new', 0, 0)}
				>
					Добавить
				</Button>
			</div>
		</div>
	);
};

export default EngineerListTable;
