

import React, { useEffect, useState } from 'react';
import OrgPageSectionRow from '../OrgPageSectionRow';
import { PRODMODE } from '../../../../../config/config';
import { OM_ORG_FILTERDATA } from '../../../../ORG_LIST/components/mock/ORGLISTMOCK';
import dayjs from 'dayjs';
import { compareObjects } from '../../../../../components/helpers/CompareHelpers';
import OPMTtoleranceSection from './subsections/OPMTtoleranceSection';
import { Button } from 'antd';
import { ExclamationTriangleIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import OPMTanZendToleranceSection from './subsections/OPMTanZendToleranceSection';

const OrgPageMainTabToleranceSection = (props) => {
	const [editMode, seteditMode] = useState(props.edit_mode ? props.edit_mode : false);
	const [filterData, setFilterData] = useState([]);

	const [orgId, setOrgId] = useState([]);

	const [tolerances,     setTolerances]     = useState([]);
	const [anZendTolerances, setAnZendTolerances] = useState([]);
	const [anZendLicenses,   setAnZendLicenses]   = useState([]);

	const [licenses,       setLicenses]       = useState([]);
	const [newTolerances,  setNewTolerances]  = useState([]);
	const [newLicenses,    setNewLicenses]    = useState([]);
	const [originalTolerances, setOriginalTolerances] = useState([]);

	const [originalAnZendLicenses    , setOriginalAnZendLicenses]   = useState([]);
	const [originalAnZendTolerances  , setOriginalAnZendTolerances]   = useState([]);

	const [editedToleranceIds, setEditedToleranceIds] = useState([]);

	const [selects, setSelects] = useState(null);

	useEffect(() => {
		seteditMode(props.edit_mode);
	}, [props.edit_mode]);


	useEffect(() => {
		console.log('props.selects', props.selects)
		if (props.selects){
			setSelects(props.selects);
		}
	}, [props.selects]);


	useEffect(() => {
		if (props.data?.id){
			setOrgId(props.data?.id);



			setTolerances(props.data.active_licenses_bo);
			setAnZendLicenses(props.data.active_licenses);
			setAnZendTolerances(props.data.active_tolerance);


			setOriginalTolerances(JSON.parse(JSON.stringify(props.data.active_licenses_bo)));
			setOriginalAnZendLicenses(JSON.parse(JSON.stringify(props.data.active_licenses)));
			setOriginalAnZendTolerances(JSON.parse(JSON.stringify(props.data.active_tolerance)));

		}

	}, [props.data]);


// ██████   ██████      ████████  ██████  ██      ██ ██   ██ 
// ██   ██ ██    ██        ██    ██    ██ ██      ██ ██  ██  
// ██████  ██    ██        ██    ██    ██ ██      ██ █████   
// ██   ██ ██    ██        ██    ██    ██ ██      ██ ██  ██  
// ██████   ██████         ██     ██████  ███████ ██ ██   ██                                                 
	/* ----------------- TOLERANCE --------------------- */
	/**
	 * Добавление нового элемента в стек новых
	 */
	const handleAddTolerance = (typedoc)=>{
		let item = {
					id: 'new_' + dayjs().unix() + '_' + newTolerances.length ,
					id_an_orgs:  orgId,
					type: 1,
					document_type: typedoc,
					name: '',
					start_date: null,
					end_date: null,
					comment: '',
					deleted: 0,
					command: "create",
				};
		setNewTolerances([...newTolerances, item]);
	}

	/**
	 * Удаление напрочь только что добавленной записи
	 * @param {*} id 
	 */
	const handleDeleteNewTolerance = (id) => {
		console.log('delete', id)
		setNewTolerances(newTolerances.filter((item)=>item.id !== id));
	}

	/**
	 * Обновление новой только что добавленной записи
	 * @param {*} id 
	 * @param {*} data 
	 * @returns 
	 */
	const handleUpdateNewToleranceUnit = (id, data) => {
		// let udata = originalData.filter((item) => item.id !== id);
		// udata.push(data);
		console.log('CALL TU NEW UPDATE');
		if (!editMode) {
			return;
		}

		data.command = 'create';

		setNewTolerances((prevUnits) => {
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
	const handleUpdateTolikUnit = (id, data) => {
		// let udata = originalData.filter((item) => item.id !== id);
		// udata.push(data);
		console.log('CALL TU REAL UPDATE');
		if (!editMode) {
			return;
		}

		const excluders = ['command', 'date'];
		let is_original = false;

		originalTolerances.forEach((element) => {
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

		console.log('data email', data)
		setTolerances((prevUnits) => {
			const exists = prevUnits.some((item) => item.id === id);
			if (!exists) {
				return [...prevUnits, data];
			} else {
				return prevUnits.map((item) => (item.id === id ? data : item));
			}
		});
	};
		/* ----------------- TOLERANCE END --------------------- */




// ██       █████  ███████ ████████     ████████  ██████  ██      ███████ ██████   █████  ███    ██  ██████ ███████ 
// ██      ██   ██ ██         ██           ██    ██    ██ ██      ██      ██   ██ ██   ██ ████   ██ ██      ██      
// ██      ███████ ███████    ██           ██    ██    ██ ██      █████   ██████  ███████ ██ ██  ██ ██      █████   
// ██      ██   ██      ██    ██           ██    ██    ██ ██      ██      ██   ██ ██   ██ ██  ██ ██ ██      ██      
// ███████ ██   ██ ███████    ██           ██     ██████  ███████ ███████ ██   ██ ██   ██ ██   ████  ██████ ███████                                                                                                            
	/* ----------------- AnZend (old version, zend generation) Tolerances --------------------- */
	/**
	 * Добавление нового элемента в стек новых
	 */

	/**
	 * Обновление и удаление существующей записи
	 * @param {*} id 
	 * @param {*} data 
	 * @returns 
	 */
	const handleUpdateAnZendToleranceUnit = (id, data) => {
		// let udata = originalData.filter((item) => item.id !== id);
		// udata.push(data);
		console.log('CALL TU REAL UPDATE');
		if (!editMode) {
			return;
		}

		const excluders = ['command', 'date'];
		let is_original = false;

		originalAnZendTolerances.forEach((element) => {
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
			if (!editedToleranceIds?.includes('t' + id)) {
				setEditedToleranceIds([...editedToleranceIds, 't' + id]);
			}
			data.command = "update";
		} else {
			if (editedToleranceIds?.includes('t' + id)) {
				setEditedToleranceIds(editedToleranceIds.filter((item) => item !== 't' + id));
			}
			data.command = '';
		}
		if (data.deleted === true){
			data.command = "delete";
		} 

		console.log('data email', data)
		setAnZendTolerances((prevUnits) => {
			const exists = prevUnits.some((item) => item.id === id);
			if (!exists) {
				return [...prevUnits, data];
			} else {
				return prevUnits.map((item) => (item.id === id ? data : item));
			}
		});
	};
	/* ----------------- AnZend Tolerances END --------------------- */


	
	
	
	
	// ██       █████  ███████ ████████     ██      ██  ██████ ███████ ███    ██ ███████ ███████ ███████ 
	// ██      ██   ██ ██         ██        ██      ██ ██      ██      ████   ██ ██      ██      ██      
	// ██      ███████ ███████    ██        ██      ██ ██      █████   ██ ██  ██ ███████ █████   ███████ 
	// ██      ██   ██      ██    ██        ██      ██ ██      ██      ██  ██ ██      ██ ██           ██ 
	// ███████ ██   ██ ███████    ██        ███████ ██  ██████ ███████ ██   ████ ███████ ███████ ███████ 
	/* ----------------- AnZend (old version) Licenses --------------------- */

	/**
	 * Обновление и удаление существующей записи
	 * @param {*} id 
	 * @param {*} data 
	 * @returns 
	 */
	const handleUpdateAnZendLicenseUnit = (id, data) => {
		// let udata = originalData.filter((item) => item.id !== id);
		// udata.push(data);
		console.log('CALL TU REAL UPDATE');
		if (!editMode) {
			return;
		}

		const excluders = ['command', 'date'];
		let is_original = false;

		originalTolerances.forEach((element) => {
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
				setEditedToleranceIds([...editedToleranceIds, 'L' + id]);
			}
			data.command = "update";
		} else {
			if (editedToleranceIds?.includes('L' + id)) {
				setEditedToleranceIds(editedToleranceIds.filter((item) => item !== 'L' + id));
			}
			data.command = '';
		}
		if (data.deleted === true){
			data.command = "delete";
		} 

		console.log('data email', data)
		setAnZendLicenses((prevUnits) => {
			const exists = prevUnits.some((item) => item.id === id);
			if (!exists) {
				return [...prevUnits, data];
			} else {
				return prevUnits.map((item) => (item.id === id ? data : item));
			}
		});
	};
	/* ----------------- AnZend Licenses END --------------------- */




	return (
		<div className={'sk-omt-stack'} style={{ borderLeft: '4px solid ' + props.color }}>


      <div className={'sa-tolerance-old-v'}>
      {anZendLicenses.map((item)=>(
        <OPMTanZendToleranceSection
          key={'OPMTCcontactemailsSection' + item.id}
          data={item}
          edit_mode={editMode}
          on_change={handleUpdateTolikUnit}
		  selects={selects}
        />
      ))}

      {anZendTolerances.map((item)=>(
        <OPMTanZendToleranceSection
          key={'OPMTCcontactemailsSection' + item.id}
          data={item}
          edit_mode={editMode}
          on_change={handleUpdateTolikUnit}
		  selects={selects}
        />
      ))}
	  </div>

      <div>
      {tolerances.map((item)=>(
        <OPMTtoleranceSection
          key={'OPMTCcontactemailsSection' + item.id}
          data={item}
          edit_mode={editMode}
          on_change={handleUpdateTolikUnit}
		  selects={selects}
        />
      ))}
	  </div>

			{newTolerances.length > 0 && (
        <div className='sa-org-temp-stack-collapse'>
        {newTolerances.map((item)=>(
          <OPMTtoleranceSection
            key={'newOPMTCcontactemailsSection' + item.id}
            data={item}
            edit_mode={editMode}
            on_delete={handleDeleteNewTolerance}
            on_change={handleUpdateNewToleranceUnit}
			selects={selects}
          />
        ))}</div>
      )}

		{editMode && (
      <div className={'sk-omt-stack-control sa-flex-space'}>
        <div></div>
        <div>
          <div className={'sa-org-contactstack-addrow'}>
            Добавить
            <div>

              <Button
                title='Добавить допуск'
                size='small'
                color="primary"
                variant="outlined"
                icon={<IdentificationIcon height={'20px'}/>}
                onClick={(ev) => {
                  ev.stopPropagation();
                  handleAddTolerance(2);
                }}
                >Допуск</Button>
              <Button
                title='Добавить лицензию'
                size='small'
                color="primary"
                variant="outlined"
                icon={<ExclamationTriangleIcon height={'20px'}/>}
                onClick={(ev) => {
                  ev.stopPropagation();
                  handleAddTolerance(1);
                }}
                >Лицензию</Button>
                </div>
            </div>
        </div>
      </div>
      )}
		</div>
	);
};

export default OrgPageMainTabToleranceSection;
