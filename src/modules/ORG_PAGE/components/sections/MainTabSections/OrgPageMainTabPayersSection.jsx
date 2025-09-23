

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { compareObjects } from '../../../../../components/helpers/CompareHelpers';
import { Button } from 'antd';
import { ExclamationTriangleIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import OPMTRequisitesSection from './subsections/OPMTRequisitesSection';

const OrgPageMainTabPayersSection = (props) => {
	const [editMode, seteditMode] = useState(props.edit_mode ? props.edit_mode : false);
	const [filterData, setFilterData] = useState([]);

	const [orgId, setOrgId] = useState([]);

	const [requisites,     setRequisites]         = useState([]);

	const [newRequisites,  setNewRequisites]  = useState([]);
	const [originalRequisites, setOriginalRequisites] = useState([]);


	const [editedToleranceIds, setEditedToleranceIds] = useState([]);

	const [selects, setSelects] = useState(null);

	useEffect(() => {
		seteditMode(props.edit_mode);
	}, [props.edit_mode]);


	useEffect(() => {
		if (props.selects){
			setSelects(props.selects);
		}
	}, [props.selects]);


	useEffect(() => {
		if (props.data?.id){
			setOrgId(props.data?.id);



			setRequisites(props.data.requisites);


			setOriginalRequisites(JSON.parse(JSON.stringify(props.data.requisites)));

		}

	}, [props.data]);


                                              
	/* ----------------- REQUISITES --------------------- */
	/**
	 * Добавление нового элемента в стек новых
	 */
	const handleAddRequisite = (typedoc)=>{
		let item = {
					id: 'new_' + dayjs().unix() + '_' + newRequisites.length ,
					id_orgs:  orgId,
					type: 1,
					document_type: typedoc,
					name: '',
					start_date: null,
					end_date: null,
					comment: '',
					deleted: 0,
					command: "create",
				};
		setNewRequisites([...newRequisites, item]);
	}

	/**
	 * Удаление напрочь только что добавленной записи
	 * @param {*} id 
	 */
	const handleDeleteNewRequisite = (id) => {
		console.log('delete', id)
		setNewRequisites(newRequisites.filter((item)=>item.id !== id));
	}

	/**
	 * Обновление новой только что добавленной записи
	 * @param {*} id 
	 * @param {*} data 
	 * @returns 
	 */
	const handleUpdateNewRequisiteUnit = (id, data) => {
		// let udata = originalData.filter((item) => item.id !== id);
		// udata.push(data);
		console.log('CALL TU NEW UPDATE');
		if (!editMode) {
			return;
		}

		data.command = 'create';

		setNewRequisites((prevUnits) => {
			const exists = prevUnits.some((item) => item.id === id);
			if (!exists) {
				return [...prevUnits, data];
			} else {
				return prevUnits.map((item) => (item.id === id ? data : item));
			}
		});
	};

	/**
	 * Обновление и удаление существующей записи
	 * @param {*} id 
	 * @param {*} data 
	 * @returns 
	 */
	const handleUpdateToleranceUint = (id, data) => {
		// let udata = originalData.filter((item) => item.id !== id);
		// udata.push(data);
		console.log('CALL TU REAL UPDATE');
		if (!editMode) {
			return;
		}

		const excluders = ['command', 'date', 'type'];
		let is_original = false;

		originalRequisites.forEach((element) => {
			if (element.id === id) {
				console.log('element, data', element, data)
				is_original = compareObjects(element, data, {
					excludeFields: excluders,
					compareArraysDeep: false,
					ignoreNullUndefined: true,
				});
			}
		});
		console.log('is_original', is_original)
		if (is_original === false) {
			if (!editedToleranceIds?.includes(id)) {
				setEditedToleranceIds([...editedToleranceIds, id]);
			}
			data.command = "update";
		} else {
			if (editedToleranceIds?.includes(id)) {
				setEditedToleranceIds(editedToleranceIds.filter((item) => item !== id));
			}
			data.command = '';
		}
		if (data.deleted === true){
			data.command = "delete";
		}


		setRequisites((prevUnits) => {
			const exists = prevUnits.some((item) => item.id === id);
			if (!exists) {
				return [...prevUnits, data];
			} else {
				return prevUnits.map((item) => (item.id === id ? data : item));
			}
		});
	};
		/* ----------------- REQUISITES END --------------------- */


	useEffect(() => {
		console.log(props.on_add_requisites);
		if (props.on_add_requisites !== null){
			handleAddRequisite(1);
		}
	}, [props.on_add_requisites]);


	useEffect(() => {
		console.log('UPDATED DATA STACK ');
		console.log(requisites, newRequisites);
	}, [requisites, newRequisites]);



	return (
		<div className={'sk-omt-stack'} style={{ borderLeft: '4px solid ' + props.color }}>

      <div>
      {requisites.map((item)=>(
        <OPMTRequisitesSection
          key={'OPMTCcontactemailsSection' + item.id}
          data={item}
          edit_mode={editMode}
          on_change={handleUpdateToleranceUint}
		  selects={selects}
        />
      ))}
	  </div>

			{newRequisites.length > 0 && (
        <div className='sa-org-temp-stack-collapse'>
        {newRequisites.map((item)=>(
          <OPMTRequisitesSection
            key={'newOPMTCcontactemailsSection' + item.id}
            data={item}
            edit_mode={editMode}
            on_delete={handleDeleteNewRequisite}
            on_change={handleUpdateNewRequisiteUnit}
			selects={selects}
          />
        ))}</div>
      )}

		{/* {editMode && (
      <div className={'sk-omt-stack-control sa-flex-space'}>
        <div></div>
        <div>
          <div className={'sa-org-contactstack-addrow'}>
            Добавить
            <div>


              <Button
                title='Добавить плательщика'
                size='small'
                color="primary"
                variant="outlined"
                icon={<ExclamationTriangleIcon height={'20px'}/>}
                onClick={(ev) => {
                  ev.stopPropagation();
                  handleAddRequisite(1);
                }}
                >Добавить реквизиты</Button>
                </div>
            </div>
        </div>
      </div>
      )} */}
		</div>
	);
};

export default OrgPageMainTabPayersSection;
