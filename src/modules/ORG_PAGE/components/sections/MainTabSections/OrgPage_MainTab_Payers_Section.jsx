

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { compareObjects } from '../../../../../components/helpers/CompareHelpers';
import { Button, Empty } from 'antd';
import { ExclamationTriangleIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import OPMTRequisitesSection from './subsections/OPMTRequisitesSection';

const OrgPage_MainTab_Payers_Section = (props) => {
	const [editMode, seteditMode] = useState(props.edit_mode ? props.edit_mode : false);


	const [orgId, setOrgId] = useState([]);

	const [requisites,     setRequisites]         = useState([]);

	const [newRequisites,  setNewRequisites]       = useState([]);
	const [originalRequisites, setOriginalRequisites] = useState([]);


	const [editedToleranceIds, setEditedToleranceIds] = useState([]);

	const [selects, setSelects] = useState(null);

	useEffect(() => {
		if (!props.edit_mode){
			setNewRequisites([]);
		}
		seteditMode(props.edit_mode);
	}, [props.edit_mode]);

	useEffect(() => {
	  setNewRequisites([]);
	}, [orgId]);


	useEffect(() => {
		if (props.selects){
			setSelects(props.selects);
		}
	}, [props.selects]);

	useEffect(() => {
		setNewRequisites([]);
	}, [props.item_id]);

	useEffect(() => {
		if (props.data?.id){
			setOrgId(props.data?.id);

			setRequisites(props.data.requisites);

			setOriginalRequisites(JSON.parse(JSON.stringify(props.data.requisites)));

		}

	}, [props.data]);


	useEffect(() => {
		if (props.on_blur){
			props.on_blur('requisites', JSON.parse(JSON.stringify(requisites.concat(newRequisites))));
		}
	}, [requisites, newRequisites]);


                                              
	/* ----------------- REQUISITES --------------------- */
	/**
	 * Добавление нового элемента в стек новых
	 */
	const handleAddRequisite = (typedoc)=>{
		let item = {
					id: 'new_' + dayjs().unix() + '_' + newRequisites.length ,
					id_orgs:  orgId,
					nameorg: '',
					kpp: '',
					inn: '',
					requisites: '',
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






	return (
		<div className={'sk-omt-stack'} >

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

			
      	  
    {newRequisites.length === 0 &&
     requisites.length === 0  ? 
	  <Empty /> : ''}
	
		</div>
	);
};

export default OrgPage_MainTab_Payers_Section;
