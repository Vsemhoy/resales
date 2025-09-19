import React, { useEffect, useState } from 'react';
import OrgPageSectionRow, { OPS_TYPE } from '../OrgPageSectionRow';
import { PRODMODE } from '../../../../../config/config';
import { OM_ORG_FILTERDATA } from '../../../../ORG_LIST/components/mock/ORGLISTMOCK';
import { Affix, Button } from 'antd';

import { CameraIcon, DevicePhoneMobileIcon, EnvelopeIcon, PaperAirplaneIcon, PhoneIcon, TrashIcon } from '@heroicons/react/24/outline';
import OPMTCcontactstelephonesSection from './subsections/OPMTCcontactstelephonesSection';
import OPMTCcontactmobilesSection from './subsections/OPMTCcontactmobilesSection';
import OPMTCcontacthomephonesSection from './subsections/OPMTCcontacthomephonesSection';
import OPMTCcontactemailsSection from './subsections/OPMTCcontactemailsSection';
import OPMTCcontactmessangersSection from './subsections/OPMTCcontactmessangersSection';
import dayjs from 'dayjs';
import { compareObjects } from '../../../../../components/helpers/CompareHelpers';

const OrgPageMainTabContactsSection = (props) => {
	const [editMode, seteditMode] = useState(props.edit_mode ? props.edit_mode : false);
	const [filterData, setFilterData] = useState([]);

  const [itemId, setItemId] = useState(0);

  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [unsubscribe, setUnsubscribe] = useState('');
  const [comment, setComment] = useState('');
  const [occupy, setOccupy] = useState('');
  const [job, setJob] = useState('');
  const [exittoorg_id, setExittoorg_id] = useState('');
  const [deleted, setDeleted] = useState(0);

  const [objectResult, setObjectResult] = useState({});

  const [contactstelephones, setContactstelephones] = useState([]);
  const [contactmobiles,     setContactmobiles]     = useState([]);
  const [contacthomephones,  setContacthomephones]  = useState([]);
  const [contactemails,      setContactemails]      = useState([]);
  const [contactmessangers,  setContactmessangers]  = useState([]);

  const [newContactstelephones, setNewContactstelephones] = useState([]);
  const [newContactmobiles,     setNewContactmobiles]     = useState([]);
  const [newContacthomephones,  setNewContacthomephones]  = useState([]);
  const [newContactemails,      setNewContactemails]      = useState([]);
  const [newContactmessangers,  setNewContactmessangers]  = useState([]);
  
  const [originalContactstelephones, setOriginalContactstelephones] = useState([]);
  const [originalContactmobiles,     setOriginalContactmobiles]     = useState([]);
  const [originalContacthomephones,  setOriginalContacthomephones]  = useState([]);
  const [originalContactemails,      setOriginalContactemails]      = useState([]);
  const [originalContactmessangers,  setOriginalContactmessangers]  = useState([]);


  const [editedMessangersIds,    setEditedMessangersIds]    = useState([]);
  const [editedEmailsIds,        setEditedEmailsIds]        = useState([]);
  const [editedContactphonesIds, setEditedContactphonesIds] = useState([]);
  const [editedMobilephonesIds,  setEditedMobilephonesIds]  = useState([]);
  const [editedHomephonesIds,    setEditedHomephonesIds]    = useState([]);




  useEffect(() => {
    if (props.data?.id){
      setItemId(props.data?.id);
      setObjectResult(props.data);

      setName(props.data?.name);
      setLastName(props.data?.lastname);
      setMiddleName(props.data?.middlename);
      setOccupy(props.data?.occupy);
      setComment(props.data?.comment);
      setJob(props.data?.job);
      setExittoorg_id(props.data?.exittoorg_id);
      setDeleted(props.data?.deleted);


      setContactstelephones(props.data.contactstelephones);
      setContactmobiles(props.data.contactmobiles);
      setContacthomephones(props.data.contacthomephones);
      setContactemails(props.data.contactemails);
      setContactmessangers(props.data.contactmessangers);

      setOriginalContactstelephones(JSON.parse(JSON.stringify(props.data.contactstelephones)));
      setOriginalContactmobiles(    JSON.parse(JSON.stringify(props.data.contactmobiles    )));
      setOriginalContacthomephones( JSON.parse(JSON.stringify(props.data.contacthomephones )));
      setOriginalContactemails(     JSON.parse(JSON.stringify(props.data.contactemails     )));
      setOriginalContactmessangers( JSON.parse(JSON.stringify(props.data.contactmessangers )));
    }

  }, [props.data]);

	useEffect(() => {
		seteditMode(props.edit_mode);
	}, [props.edit_mode]);

	useEffect(() => {
		if (PRODMODE) {
		} else {
			setFilterData(OM_ORG_FILTERDATA);
		}
	}, []);


  useEffect(() => {
    const timer = setTimeout(() => {
			if (objectResult.id == null) {
				// Объект ещё не смонтировался. воизбежание гонок
				return;
			}
			let result = objectResult;
			result.name = name;
			result.lastname = lastName;
			result.middlename = middleName;
      result.occupy = occupy;
      result.comment = comment;
      result.job = job;
      result.exittoorg_id = exittoorg_id;
      result.deleted = deleted;

      result.contactstelephones = contactstelephones;
      result.contactmobiles =     contactmobiles;
      result.contacthomephones =  contacthomephones;
      result.contactemails =      contactemails;
      result.contactmessangers =  contactmessangers;

			console.log('result', result);

			if (props.on_change) {
				props.on_change(itemId, result);
			}
		}, 220);
		return () => clearTimeout(timer);
    
  }, [name,
    lastName,
    middleName,
    occupy,
    comment,
    job,
    exittoorg_id,
    deleted,
    contactemails,
    contacthomephones,
    contactmessangers,
    contactmobiles,
    contactstelephones
  ]);



  const handleChangeData = (changed_data) => {
    if (changed_data.name !== undefined) {
        setName(changed_data.name);

    } else if (changed_data.lastname !== undefined) {
        setLastName(changed_data.lastname);

    } else if (changed_data.middlename !== undefined) {
        setMiddleName(changed_data.middlename);

    } else if (changed_data.occupy !== undefined) {
        setOccupy(changed_data.occupy);

    } else if (changed_data.deleted !== undefined) {
        setDeleted(changed_data.deleted);

    } else if (changed_data.comment !== undefined) {
        setComment(changed_data.comment); // опечатка в сеттере, но оставил как есть

    } else if (changed_data.job !== undefined) {
        setJob(changed_data.job);

    } else if (changed_data.exittoorg_id !== undefined){
      setExittoorg_id(changed_data.exittoorg_id);
    }
};



// ░███     ░███   ░██████   ░████████   ░██████░██         ░██████████ 
// ░████   ░████  ░██   ░██  ░██    ░██    ░██  ░██         ░██         
// ░██░██ ░██░██ ░██     ░██ ░██    ░██    ░██  ░██         ░██         
// ░██ ░████ ░██ ░██     ░██ ░████████     ░██  ░██         ░█████████  
// ░██  ░██  ░██ ░██     ░██ ░██     ░██   ░██  ░██         ░██         
// ░██       ░██  ░██   ░██  ░██     ░██   ░██  ░██         ░██         
// ░██       ░██   ░██████   ░█████████  ░██████░██████████ ░██████████ 
  /* ----------------- MOBILE --------------------- */
  /**
   * Добавление нового элемента в стек новых
   */
  const handleAddMobile = ()=>{
    let item = {
          id: 'new_' + dayjs().unix() + '_' + newContactmobiles.length ,
          id_orgsusers:  itemId,
          number: '',
          comment: '',
          deleted: 0,
          command: "create",
        };
    setNewContactmobiles([...newContactmobiles, item]);
  }

  /**
   * Удаление напрочь только что добавленной записи
   * @param {*} id 
   */
  const handleDeleteNewMobile = (id) => {
    console.log('delete', id)
    setNewContactmobiles(newContactmobiles.filter((item)=>item.id !== id));
  }

  /**
   * Обновление новой только что добавленной записи
   * @param {*} id 
   * @param {*} data 
   * @returns 
   */
  const handleUpdateNewMobileUnit = (id, data) => {
    // let udata = originalData.filter((item) => item.id !== id);
    // udata.push(data);
    console.log('CALL TU NEW UPDATE');
    if (!editMode) {
      return;
    }

    data.command = 'create';

    setNewContactmobiles((prevUnits) => {
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
  const handleUpdateMobileUnit = (id, data) => {
    // let udata = originalData.filter((item) => item.id !== id);
    // udata.push(data);
    console.log('CALL TU REAL UPDATE');
    if (!editMode) {
      return;
    }

    const excluders = ['command', 'date'];
    let is_original = false;

    originalContactmobiles.forEach((element) => {
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
      if (!editedMobilephonesIds?.includes(id)) {
        setEditedMobilephonesIds([...editedMobilephonesIds, id]);
      }
      data.command = "update";
    } else {
      if (editedMobilephonesIds?.includes(id)) {
        setEditedMobilephonesIds(editedMobilephonesIds.filter((item) => item !== id));
      }
      data.command = '';
    }
    if (data.deleted === true){
      data.command = "delete";
    } 

    console.log('data email', data)
    setContactmobiles((prevUnits) => {
      const exists = prevUnits.some((item) => item.id === id);
      if (!exists) {
        return [...prevUnits, data];
      } else {
        return prevUnits.map((item) => (item.id === id ? data : item));
      }
    });
  };
    /* ----------------- MOBILE END --------------------- */





//   ░██████    ░██████   ░███    ░██ ░██████████   ░███      ░██████  ░██████████
//  ░██   ░██  ░██   ░██  ░████   ░██     ░██      ░██░██    ░██   ░██     ░██    
// ░██        ░██     ░██ ░██░██  ░██     ░██     ░██  ░██  ░██            ░██    
// ░██        ░██     ░██ ░██ ░██ ░██     ░██    ░█████████ ░██            ░██    
// ░██        ░██     ░██ ░██  ░██░██     ░██    ░██    ░██ ░██            ░██    
//  ░██   ░██  ░██   ░██  ░██   ░████     ░██    ░██    ░██  ░██   ░██     ░██    
//   ░██████    ░██████   ░██    ░███     ░██    ░██    ░██   ░██████      ░██    
  /* ----------------- CONTACT --------------------- */
  /**
   * Добавление нового элемента в стек новых
   */
  const handleAddContact = ()=>{
    let item = {
          id: 'new_' + dayjs().unix() + '_' + newContactstelephones.length ,
          id_orgsusers:  itemId,
          number: '',
          ext: '',
          comment: '',
          deleted: 0,
          command: "create",
        };
    setNewContactstelephones([...newContactstelephones, item]);
  }

  /**
   * Удаление напрочь только что добавленной записи
   * @param {*} id 
   */
  const handleDeleteNewContact = (id) => {
    console.log('delete', id)
    setNewContactstelephones(newContactstelephones.filter((item)=>item.id !== id));
  }

  /**
   * Обновление новой только что добавленной записи
   * @param {*} id 
   * @param {*} data 
   * @returns 
   */
  const handleUpdateNewContactUnit = (id, data) => {
    // let udata = originalData.filter((item) => item.id !== id);
    // udata.push(data);
    console.log('CALL TU NEW UPDATE');
    if (!editMode) {
      return;
    }

    data.command = 'create';

    setNewContactstelephones((prevUnits) => {
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
  const handleUpdateContactUnit = (id, data) => {
    // let udata = originalData.filter((item) => item.id !== id);
    // udata.push(data);
    console.log('CALL TU REAL UPDATE');
    if (!editMode) {
      return;
    }

    const excluders = ['command', 'date'];
    let is_original = false;

    originalContactstelephones.forEach((element) => {
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
      if (!editedContactphonesIds?.includes(id)) {
        setEditedContactphonesIds([...editedContactphonesIds, id]);
      }
      data.command = "update";
    } else {
      if (editedContactphonesIds?.includes(id)) {
        setEditedContactphonesIds(editedContactphonesIds.filter((item) => item !== id));
      }
      data.command = '';
    }
    if (data.deleted === true){
      data.command = "delete";
    } 

    console.log('data email', data)
    setContactstelephones((prevUnits) => {
      const exists = prevUnits.some((item) => item.id === id);
      if (!exists) {
        return [...prevUnits, data];
      } else {
        return prevUnits.map((item) => (item.id === id ? data : item));
      }
    });
  };
    /* ----------------- CONTACT END --------------------- */





// ░██     ░██   ░██████   ░███     ░███ ░██████████ 
// ░██     ░██  ░██   ░██  ░████   ░████ ░██         
// ░██     ░██ ░██     ░██ ░██░██ ░██░██ ░██         
// ░██████████ ░██     ░██ ░██ ░████ ░██ ░█████████  
// ░██     ░██ ░██     ░██ ░██  ░██  ░██ ░██         
// ░██     ░██  ░██   ░██  ░██       ░██ ░██         
// ░██     ░██   ░██████   ░██       ░██ ░██████████ 
  /* ----------------- HOME PHONE --------------------- */
  /**
   * Добавление нового элемента в стек новых
   */
  const handleAddHomePhone = ()=>{
    let item = {
          id: 'new_' + dayjs().unix() + '_' + newContacthomephones.length ,
          id_orgsusers:  itemId,
          number: '',
          ext: '',
          comment: '',
          deleted: 0,
          command: "create",
        };
    setNewContacthomephones([...newContacthomephones, item]);
  }

  /**
   * Удаление напрочь только что добавленной записи
   * @param {*} id 
   */
  const handleDeleteNewHomePhone = (id) => {
    console.log('delete', id)
    setNewContacthomephones(newContacthomephones.filter((item)=>item.id !== id));
  }

  /**
   * Обновление новой только что добавленной записи
   * @param {*} id 
   * @param {*} data 
   * @returns 
   */
  const handleUpdateNewHomePhoneUnit = (id, data) => {
    // let udata = originalData.filter((item) => item.id !== id);
    // udata.push(data);
    console.log('CALL TU NEW UPDATE');
    if (!editMode) {
      return;
    }

    data.command = 'create';

    setNewContacthomephones((prevUnits) => {
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
  const handleUpdateHomePhoneUnit = (id, data) => {
    // let udata = originalData.filter((item) => item.id !== id);
    // udata.push(data);
    console.log('CALL TU REAL UPDATE');
    if (!editMode) {
      return;
    }

    const excluders = ['command', 'date'];
    let is_original = false;

    originalContacthomephones.forEach((element) => {
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
      if (!editedHomephonesIds?.includes(id)) {
        setEditedHomephonesIds([...editedHomephonesIds, id]);
      }
      data.command = "update";
    } else {
      if (editedHomephonesIds?.includes(id)) {
        setEditedHomephonesIds(editedHomephonesIds.filter((item) => item !== id));
      }
      data.command = '';
    }
    if (data.deleted === true){
      data.command = "delete";
    } 

    console.log('data email', data)
    setContacthomephones((prevUnits) => {
      const exists = prevUnits.some((item) => item.id === id);
      if (!exists) {
        return [...prevUnits, data];
      } else {
        return prevUnits.map((item) => (item.id === id ? data : item));
      }
    });
  };
    /* ----------------- HOME PHONE END --------------------- */





// ░██████████ ░███     ░███    ░███    ░██████░██         
// ░██         ░████   ░████   ░██░██     ░██  ░██         
// ░██         ░██░██ ░██░██  ░██  ░██    ░██  ░██         
// ░█████████  ░██ ░████ ░██ ░█████████   ░██  ░██         
// ░██         ░██  ░██  ░██ ░██    ░██   ░██  ░██         
// ░██         ░██       ░██ ░██    ░██   ░██  ░██         
// ░██████████ ░██       ░██ ░██    ░██ ░██████░██████████ 
  /* ----------------- EMAIL --------------------- */
  /**
   * Добавление нового элемента в стек новых
   */
  const handleAddEmail = ()=>{
    let item = {
          id: 'new_' + dayjs().unix() + '_' + newContactemails.length ,
          id_orgsusers:  itemId,
          email: '',
          comment: '',
          deleted: 0,
          command: "create",
        };
    setNewContactemails([...newContactemails, item]);
  }

  /**
   * Удаление напрочь только что добавленной записи
   * @param {*} id 
   */
  const handleDeleteNewEmail = (id) => {
    console.log('delete', id)
    setNewContactemails(newContactemails.filter((item)=>item.id !== id));
  }

  /**
   * Обновление новой только что добавленной записи
   * @param {*} id 
   * @param {*} data 
   * @returns 
   */
  const handleUpdateNewEmailUnit = (id, data) => {
    // let udata = originalData.filter((item) => item.id !== id);
    // udata.push(data);
    console.log('CALL TU NEW UPDATE');
    if (!editMode) {
      return;
    }

    data.command = 'create';

    setNewContactemails((prevUnits) => {
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
  const handleUpdateEmailUnit = (id, data) => {
    // let udata = originalData.filter((item) => item.id !== id);
    // udata.push(data);
    console.log('CALL TU REAL UPDATE');
    if (!editMode) {
      return;
    }

    const excluders = ['command', 'date'];
    let is_original = false;

    originalContactemails.forEach((element) => {
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
      if (!editedEmailsIds?.includes(id)) {
        setEditedEmailsIds([...editedEmailsIds, id]);
      }
      data.command = "update";
    } else {
      if (editedEmailsIds?.includes(id)) {
        setEditedEmailsIds(editedEmailsIds.filter((item) => item !== id));
      }
      data.command = '';
    }
    if (data.deleted === true){
      data.command = "delete";
    } 

    console.log('data email', data)
    setContactemails((prevUnits) => {
      const exists = prevUnits.some((item) => item.id === id);
      if (!exists) {
        return [...prevUnits, data];
      } else {
        return prevUnits.map((item) => (item.id === id ? data : item));
      }
    });
  };
    /* ----------------- EMAIL END --------------------- */





// ░███     ░███ ░██████████   ░██████     ░██████      ░███      ░██████  ░██████████ 
// ░████   ░████ ░██          ░██   ░██   ░██   ░██    ░██░██    ░██   ░██ ░██         
// ░██░██ ░██░██ ░██         ░██         ░██          ░██  ░██  ░██        ░██         
// ░██ ░████ ░██ ░█████████   ░████████   ░████████  ░█████████ ░██  █████ ░█████████  
// ░██  ░██  ░██ ░██                 ░██         ░██ ░██    ░██ ░██     ██ ░██         
// ░██       ░██ ░██          ░██   ░██   ░██   ░██  ░██    ░██  ░██  ░███ ░██         
// ░██       ░██ ░██████████   ░██████     ░██████   ░██    ░██   ░█████░█ ░██████████ 
  /* ----------------- MESSANGER --------------------- */
  /**
   * Добавление нового элемента в стек новых
   */
  const handleAddMessanger = ()=>{
    let item = {
          id: 'new_' + dayjs().unix() + '_' + newContactmessangers.length ,
          id_orgsusers:  itemId,
          identifier: '',
          messangers_id: 0,
          deleted: 0,
          command: "create",
        };
    setNewContactmessangers([...newContactmessangers, item]);
  }

  /**
   * Удаление напрочь только что добавленной записи
   * @param {*} id 
   */
  const handleDeleteNewMessanger = (id) => {
    console.log('delete', id)
    setNewContactmessangers(newContactmessangers.filter((item)=>item.id !== id));
  }

  /**
   * Обновление новой только что добавленной записи
   * @param {*} id 
   * @param {*} data 
   * @returns 
   */
  const handleUpdateNewMessangerUnit = (id, data) => {
    // let udata = originalData.filter((item) => item.id !== id);
    // udata.push(data);
    console.log('CALL TU NEW UPDATE');
    if (!editMode) {
      return;
    }

    data.command = 'create';

    setNewContactmessangers((prevUnits) => {
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
  const handleUpdateMessangerUnit = (id, data) => {
    // let udata = originalData.filter((item) => item.id !== id);
    // udata.push(data);
    console.log('CALL TU REAL UPDATE');
    if (!editMode) {
      return;
    }

    const excluders = ['command', 'date'];
    let is_original = false;

    originalContactmessangers.forEach((element) => {
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
      if (!editedMessangersIds?.includes(id)) {
        setEditedMessangersIds([...editedMessangersIds, id]);
      }
      data.command = "update";
    } else {
      if (editedMessangersIds?.includes(id)) {
        setEditedMessangersIds(editedMessangersIds.filter((item) => item !== id));
      }
      data.command = '';
    }
    if (data.deleted === true){
      data.command = "delete";
    } 

    console.log('data', data)
    setContactmessangers((prevUnits) => {
      const exists = prevUnits.some((item) => item.id === id);
      if (!exists) {
        return [...prevUnits, data];
      } else {
        return prevUnits.map((item) => (item.id === id ? data : item));
      }
    });
  };
    /* ----------------- MESSANGER END --------------------- */









	return (
		<div className={'sk-omt-stack'} style={{ borderLeft: '4px solid ' + props.color }}>

			<OrgPageSectionRow
        key={'faksdj_dk' + itemId}
				edit_mode={editMode}
				columns={2}
				titles={['Имя', 'Отчество']}
				datas={[
					{
						type: OPS_TYPE.STRING,
						value: name,
						max: 50,
						required: true,
						nullable: false,
						placeholder: '',
						name: 'name',
					},
					{
						type: OPS_TYPE.STRING,
						value: lastName,
						min: 0,
						max: 120,
						placeholder: '',
						name: 'lastname',
					},
				]}
				// on_change={(data) => console.log('Изменения:', data)}
        on_blur={handleChangeData}
			/>

			<OrgPageSectionRow
				key={'fakfdfj_dk' + itemId}
				edit_mode={editMode}
				titles={['Фамилия', 'Должность']}
				datas={[
					{
						type: OPS_TYPE.STRING,
						value: middleName,
						max: 50,
						required: false,
						nullable: false,
						placeholder: '',
						name: 'middlename',
					},
					{
						type: OPS_TYPE.STRING,
						value: occupy,
						min: 0,
						max: 120,
						placeholder: '',
						name: 'occupy',
					},
				]}
        on_blur={handleChangeData}
			/>

      <OrgPageSectionRow
				key={'fsdksdj_dk' + itemId}
				edit_mode={editMode}
				titles={['Комментарий']}
				datas={[
					{
						type: OPS_TYPE.TEXTAREA,
						value: comment,
						max: 5000,
						required: false,
						nullable: false,
						placeholder: '',
						name: 'comment',
					}
				]}
        on_blur={handleChangeData}
			/>

      <OrgPageSectionRow
				key={'fs5462j_dk' + itemId}
				edit_mode={editMode}
				titles={['Работает ли','Новая организация']}
				datas={[
					{
						type: OPS_TYPE.CHECKBOX,
						value: job,
						max: 5000,
						required: false,
						nullable: false,
						placeholder: '',
						name: 'job',
					},
          {
						type: OPS_TYPE.UINTEGER,
						value: exittoorg_id,
						max: 999999,
						required: false,
						nullable: true,
            allowClear: true,
						placeholder: 'Id компании, куда ушел',
						name: 'exittoorg_id',
					}
				]}
        on_blur={handleChangeData}
			/>

      <OrgPageSectionRow
				key={'f734654dj_dk' + itemId}
				edit_mode={editMode}
				titles={['Запретить рассылку']}
				datas={[
					{
						type: OPS_TYPE.CHECKBOX,
						value: unsubscribe,
						max: 5000,
						required: false,
						nullable: false,
						placeholder: '',
						name: 'unsubscribe',
					}
				]}
        on_blur={handleChangeData}
			/>

      <div>
      {contactstelephones.map((item)=>(
        <OPMTCcontactstelephonesSection
        key={'OPMTCcontactstelephonesSection' + item.id}
          data={item}
          edit_mode={editMode}
          on_change={handleUpdateContactUnit}
        />
      ))}</div>
      {newContactstelephones.length > 0 && (
        <div className='sa-org-temp-stack-collapse'>
        {newContactstelephones.map((item)=>(
          <OPMTCcontactstelephonesSection
            key={'newOPMTCcontactstelephonesSection' + item.id}
            data={item}
            edit_mode={editMode}
            on_delete={handleDeleteNewContact}
            on_change={handleUpdateNewContactUnit}
          />
        ))}</div>
      )}


      <div>
      {contactmobiles.map((item)=>(
        <OPMTCcontactmobilesSection
        key={'OPMTCcontactmobilesSection' + item.id}
          data={item}
          edit_mode={editMode}
          on_change={handleUpdateMobileUnit}
        />
      ))}</div>
      {newContactmobiles.length > 0 && (
        <div className='sa-org-temp-stack-collapse'>
        {newContactmobiles.map((item)=>(
          <OPMTCcontactmobilesSection
            key={'newOPMTCcontactmobilesSection' + item.id}
            data={item}
            edit_mode={editMode}
            on_delete={handleDeleteNewMobile}
            on_change={handleUpdateNewMobileUnit}
          />
        ))}</div>
      )}


      <div>
      {contacthomephones.map((item)=>(
        <OPMTCcontacthomephonesSection
          key={'OPMTCcontacthomephonesSection' + item.id}
          data={item}
          edit_mode={editMode}
          on_change={handleUpdateHomePhoneUnit}
        />
      ))}</div>
      {newContacthomephones.length > 0 && (
        <div className='sa-org-temp-stack-collapse'>
        {newContacthomephones.map((item)=>(
          <OPMTCcontacthomephonesSection
            key={'newOPMTCcontactHommiesSection' + item.id}
            data={item}
            edit_mode={editMode}
            on_delete={handleDeleteNewHomePhone}
            on_change={handleUpdateNewHomePhoneUnit}
          />
        ))}</div>
      )}


      <div>
      {contactemails.map((item)=>(
        <OPMTCcontactemailsSection
          key={'OPMTCcontactemailsSection' + item.id}
          data={item}
          edit_mode={editMode}
          on_change={handleUpdateEmailUnit}
        />
      ))}</div>
      {newContactemails.length > 0 && (
        <div className='sa-org-temp-stack-collapse'>
        {newContactemails.map((item)=>(
          <OPMTCcontactemailsSection
            key={'newOPMTCcontactemailsSection' + item.id}
            data={item}
            edit_mode={editMode}
            on_delete={handleDeleteNewEmail}
            on_change={handleUpdateNewEmailUnit}
          />
        ))}</div>
      )}

      
      <div>
      {contactmessangers.map((item)=>(
        <OPMTCcontactmessangersSection
          key={'OPMTCcontactmessangersSection' + item.id}
          data={item}
          edit_mode={editMode}
          on_change={handleUpdateMessangerUnit}
        />
      ))}</div>
      {newContactmessangers.length > 0 && (
        <div className='sa-org-temp-stack-collapse'>
        {newContactmessangers.map((item)=>(
          <OPMTCcontactmessangersSection
            key={'newOPMTCcontactmessangersSection' + item.id}
            data={item}
            edit_mode={editMode}
            on_delete={handleDeleteNewMessanger}
            on_change={handleUpdateNewMessangerUnit}
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
                title='Добавить контактный телефон'
                size='small'
                color="primary"
                variant="outlined"
                icon={<PhoneIcon height={'20px'}/>}
                onClick={(ev) => {
                  ev.stopPropagation();
                  handleAddContact();
                }}
                >Конт. телефон</Button>
              <Button
                title='Добавить мобильный телефон'
                size='small'
                color="primary"
                variant="outlined"
                icon={<DevicePhoneMobileIcon height={'20px'}/>}
                onClick={(ev) => {
                  ev.stopPropagation();
                  handleAddMobile();
                }}
                >Моб. телефон</Button>
              <Button
                title='Добавить домашний телефон'
                size='small'
                color="primary"
                variant="outlined"
                icon={<CameraIcon height={'20px'}/>}
                onClick={(ev) => {
                  ev.stopPropagation();
                  handleAddHomePhone();
                }}
                >Дом. телефон</Button>
              <Button
                title='Добавить эл. почту'
                size='small'
                color="primary"
                variant="outlined"
                icon={<EnvelopeIcon height={'20px'}/>}
                onClick={(ev) => {
                  ev.stopPropagation();
                  handleAddEmail();
                }}
                >Эл. почту</Button>
              <Button
                title='Добавить мессенджер'
                size='small'
                color="primary"
                variant="outlined"
                icon={<PaperAirplaneIcon height={'20px'}/>}
                onClick={(ev) => {
                  ev.stopPropagation();
                  handleAddMessanger();
                }}
                >Мессенджер</Button>
                </div>
            </div>
        </div>
      </div>
      )}
		</div>
	);
};

export default OrgPageMainTabContactsSection;
