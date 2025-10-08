import React, { useEffect, useState } from 'react';
import TorgPageSectionRow from '../TorgPageSectionRow';
import { Button, Checkbox, DatePicker, Input } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { TORG_CHEVRON_SIZE, TORG_MAX_ROWS_TEXTAREA, TORG_MIN_ROWS_TEXTAREA } from '../TorgConfig';
import { CameraIcon, ChevronDownIcon, ChevronUpIcon, DevicePhoneMobileIcon, EnvelopeIcon, PaperAirplaneIcon, PhoneIcon, TrashIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import { getMonthName } from '../../../../components/helpers/TextHelpers';

const ContactMainSectionTorg = (props) => {
  const [collapsed, setCollapsed] = useState(false);
  const [editMode, setEditMode] = useState(true); // true|false - режим редактирования

  // Оригинал объекта, в который сетапятся данные для отправки наружу
  const [baseData, setBaseData] = useState(null);

  const [itemId, setItemId] = useState(null);
  const [orgId, setOrgId] = useState(null);
  // const [theme, setTheme] = useState('');
  // const [author, setAuthor] = useState(1);
  // const [date, setDate] = useState(null);
  // const [note, setNote] = useState('');
  // const [deleted, setDeleted] = useState(0);

  const [allowDelete, setAllowDelete] = useState(true);

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
  
  // const [originalContactstelephones, setOriginalContactstelephones] = useState([]);
  // const [originalContactmobiles,     setOriginalContactmobiles]     = useState([]);
  // const [originalContacthomephones,  setOriginalContacthomephones]  = useState([]);
  // const [originalContactemails,      setOriginalContactemails]      = useState([]);
  // const [originalContactmessangers,  setOriginalContactmessangers]  = useState([]);


  // const [editedMessangersIds,    setEditedMessangersIds]    = useState([]);
  // const [editedEmailsIds,        setEditedEmailsIds]        = useState([]);
  // const [editedContactphonesIds, setEditedContactphonesIds] = useState([]);
  // const [editedMobilephonesIds,  setEditedMobilephonesIds]  = useState([]);
  // const [editedHomephonesIds,    setEditedHomephonesIds]    = useState([]);

  const [selects, setSelects] = useState(null);





  // ██    ██ ███████ ███████ 
  // ██    ██ ██      ██      
  // ██    ██ █████   █████   
  // ██    ██ ██      ██      
  //  ██████  ██      ██      
  useEffect(() => {
    setEditMode(props.edit_mode);
  }, [props.edit_mode]);

  useEffect(() => {
    setBaseData(JSON.parse(JSON.stringify(props.data)));

    if (props.data.id) {
      setItemId(props.data.id);
      setOrgId(props.data.id_orgs);

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
    }


  }, [props.data]);




  // ██    ██ ███████ ███████       ██   ██ 
  // ██    ██ ██      ██             ██ ██  
  // ██    ██ █████   █████   █████   ███   
  // ██    ██ ██      ██             ██ ██  
  //  ██████  ██      ██            ██   ██ 



  const handleDeleteItem = () => {
    if (props.on_delete) {
      props.on_delete(itemId);
    };
    if (allowDelete) {
      setDeleted(!deleted);
    }
  }

  useEffect(() => {
    setCollapsed(props.collapsed);
  }, [props.collapsed]);


  useEffect(() => {
    if (editMode && !collapsed && baseData && baseData.command === 'create' && deleted){
      // Лазейка для удаления созданных в обход таймаута - позволяет избежать гонок при очень быстром удалении
          if (props.on_change){
            baseData.deleted = deleted;
                baseData.command = 'delete';
                props.on_change('notes', itemId, baseData);
                return;
          }
        }

      const timer = setTimeout(() => {
        // При сверх-быстром изменении полей в разных секциях могут быть гонки
			  if (editMode && !collapsed && baseData){
          if (props.on_change){
            // data.theme = theme;
            // data.date = date ? date.format('DD.MM.YYYY HH:mm:ss') : null;
            // data.notes = note;
            // data.deleted = deleted;
            baseData.name = name;
            baseData.lastname = lastName;
            baseData.middlename = middleName;
            baseData.occupy = occupy;
            baseData.comment = comment;
            baseData.job = job;
            baseData.exittoorg_id = exittoorg_id;
            baseData.deleted = deleted;

            baseData.contactstelephones = contactstelephones.concat(newContactstelephones);
            baseData.contactmobiles =     contactmobiles.concat(newContactmobiles);
            baseData.contacthomephones =  contacthomephones.concat(newContacthomephones);
            baseData.contactemails =      contactemails.concat(newContactemails);
            baseData.contactmessangers =  contactmessangers.concat(newContactmessangers);

            if (baseData.command === undefined || baseData.command !== 'create'){
              if (deleted){
                baseData.command = 'delete';
              } else {
                baseData.command = 'update';
              }
            }

            props.on_change('notes', itemId, baseData);
          }
        }
			}, 500);

			return () => clearTimeout(timer);

  }, [
    name,
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
    contactstelephones,
    newContactemails,
    newContacthomephones,
    newContactmessangers,
    newContactmobiles, 
    newContactstelephones
  ]);







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










  const updateContactMobile = (id, field, value) => {
    setContactmobiles(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const updateNewContactMobile = (id, field, value) => {
    setNewContactmobiles(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };





  return (
    <div className={`sa-org-collapse-item
       ${collapsed ? 'sa-collapsed-item' : 'sa-opened-item'}
       ${deleted ? 'deleted' : ''}`}

    >
      <div className={'sa-org-collpase-header sa-flex-space'}
        onDoubleClick={(ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          setCollapsed(!collapsed)
        }
        }
      >
        <div className={'sa-flex'}>
          <div className={'sa-pa-6'}>
            {collapsed ? (
              <span className={'sa-pa-3 sa-org-trigger-button'}
                onClick={() => { setCollapsed(!collapsed) }}
              >
                <ChevronDownIcon height={TORG_CHEVRON_SIZE} />
              </span>

            ) : (
              <span className={'sa-pa-3 sa-org-trigger-button'}
                onClick={() => { setCollapsed(!collapsed) }}
              >
                <ChevronUpIcon height={TORG_CHEVRON_SIZE} />
              </span>
            )}


          </div>
          <div className={'sa-pa-6 sa-org-section-text'}>
            <div className='sa-org-section-label'>
              {(name || middleName || lastName) ?
              (`${middleName ? middleName : ""}${name ? " " + name : ''}${lastName ? " " + lastName : ""}`)
               : "Без имени "}
            </div>
            {/* <span className="sa-date-text">
              {date !== null
                ? ` - ` +
                  getMonthName(dayjs(date).month() + 1) +
                  ' ' +
                  date.format('YYYY')
                : ''}
            </span>{' '} */}
            {itemId && (
              <div className={'sa-org-row-header-id sa-text-phantom'}>
                ({itemId})
              </div>
            )}
 

          </div>

        </div>
        <div className={'sa-flex'}>
          {allowDelete && editMode && (
            <span className={'sa-pa-3 sa-org-remove-button'}
              
            >
              <Button danger 
              size='small'
                onClick={handleDeleteItem}
                icon={<TrashIcon height={TORG_CHEVRON_SIZE} />}
              >

              </Button>
              
            </span>
          )}
        </div>
      </div>
      <div className={'sa-org-collapse-body'}>
        <div className={'sa-org-collapse-content'}>
          <TorgPageSectionRow

            edit_mode={editMode}
            inputs={[
              {
                edit_mode: editMode,
                label: 'Имя',
                input:
                  <Input
                    key={'memcard_1_' + itemId}
                    value={middleName}
                    onChange={e => setMiddleName(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={60}
                  />,
                  required: true,
                  value: middleName
              },
              {
                edit_mode: editMode,
                label: 'Отчество',
                input:
                  <Input
                    key={'memcard_2_' + itemId}
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={60}
                  />,
                  required: true,
                  value: lastName
              },

            ]}
            extratext={[]}
          />


          <TorgPageSectionRow

            edit_mode={editMode}
            inputs={[
              {
                edit_mode: editMode,
                label: 'Фамилия',
                input:
                  <Input
                    key={'memcard_3_' + itemId}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={60}
                  />,
                  required: true,
                  value: name
              },
              {
                edit_mode: editMode,
                label: 'Должность',
                input:
                  <Input
                    key={'memcard_5_' + itemId}
                    value={occupy}
                    onChange={e => setOccupy(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={60}
                  />,
                  required: true,
                  value: occupy
              },

            ]}
            extratext={[]}
          />

          <TorgPageSectionRow
            edit_mode={editMode}
            inputs={[
              {
                edit_mode: editMode,
                label: 'Комментарий',
                input:
                  <TextArea
                    key={'memcard_6_' + itemId}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={5000}
                  />,
                  required: true,
                  value: comment
              },


            ]}
            extratext={[]}
          />


          <TorgPageSectionRow
            edit_mode={editMode}
            inputs={[
              {
                label: 'Работает',
                input:
                  <Checkbox
                  key={'memcard_6d_' + itemId}
                   value={job}
                   onChange={(ev)=>(setJob(ev.target.checked))}

                   />
              },
              {
                label: 'Новая организация',
                input:
                  <Input
                  key={'memcard_6s_' + itemId}
                    type='number'
                    allowClear
                    value={exittoorg_id}
                    onChange={e => setExittoorg_id(e.target.value)}
                    variant="borderless"
                  />,
              },

            ]}
            extratext={[]}
          />


          <TorgPageSectionRow

            edit_mode={editMode}
            inputs={[
              {
                edit_mode: editMode,
                label: 'Запретить рассылку',
                input:
                  <Checkbox
                    key={'memcard_6d_' + itemId}
                   value={unsubscribe}
                   onChange={(ev)=>(setJob(ev.target.checked))}

                   />,
            
                  value: unsubscribe
              },


            ]}
            extratext={[]}
          />


          {/* <TorgPageSectionRow

            edit_mode={editMode}
            inputs={[
              {
                edit_mode: editMode,
                label: 'Комментарий',
                input:
                  
                  <TextArea
                    key={'memcard_6_' + baseData?.id}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={5000}
                  />,
                  required: true,
                  value: comment
              },


            ]}
            extratext={[]}
          /> */}






             {/* ----------------------------- DIVIDER ----------------------------- */}
      <div>
      {contactmobiles.map((item)=>(
        <div className={`sa-org-sub-sub-section-row ${item.deleted ? 'deleted' : ''}`}>
          <TorgPageSectionRow
              explabel={"комм"}

            edit_mode={editMode}
            inputs={[
              {
                edit_mode: editMode,
                label: 'Мобильный телефон',
                input:
                  
                  <TextArea
                    key={'memcadrd_6_' + baseData?.id + item.id}
                    value={item.number}
                    onChange={e => updateContactMobile(item.id, 'number', e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={22}
                    required={true}
                  />,
                  required: true,
                  value: comment
              },


            ]}
            extratext={[
              {
                edit_mode: editMode,
                label: 'Комментарий',
                input:
                  
                  <TextArea
                    key={'memcadsrd_6_' + baseData?.id + item.id}
                    value={item.comment}
                    onChange={e => updateContactMobile(item.id, 'comment', e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={5000}
                  />,
                  required: false,
                  value: comment
              },
            ]}
          />
        </div>
      ))}</div>

      {/* ----------------------------- DIVIDER ----------------------------- */}

      <div>
      {contacthomephones.map((item)=>(
        <div className={`sa-org-sub-sub-section-row ${item.deleted ? 'deleted' : ''}`}>
        Hello
        </div>
      ))}</div>

      {/* ----------------------------- DIVIDER ----------------------------- */}

      <div>
      {contactemails.map((item)=>(
        <div className={`sa-org-sub-sub-section-row ${item.deleted ? 'deleted' : ''}`}>
        Hello
        </div>
      ))}</div>

      {/* ----------------------------- DIVIDER ----------------------------- */}
      
      <div>
      {contactmessangers.map((item)=>(
        <div className={`sa-org-sub-sub-section-row ${item.deleted ? 'deleted' : ''}`}>
        Hello
        </div>
      ))}</div>

      {/* ----------------------------- DIVIDER ----------------------------- */}

      {newContactstelephones.length > 0 && (
        <div className='sa-org-temp-stack-collapse'>
        {newContactstelephones.map((item)=>(
          <div className={`sa-org-sub-sub-section-row ${item.deleted ? 'deleted' : ''}`}>
        Hello
          </div>
        ))}
        </div>
      )}

      {/* ----------------------------- DIVIDER ----------------------------- */}

      {newContactmobiles.length > 0 && (
        <div className='sa-org-temp-stack-collapse'>
        {newContactmobiles.map((item)=>(
          <div className={`sa-org-sub-sub-section-row ${item.deleted ? 'deleted' : ''}`}>
             <TorgPageSectionRow

            edit_mode={editMode}
            inputs={[
              {
                edit_mode: editMode,
                label: 'Мобильный телефон',
                input:
                  
                  <Input
                    key={'memcadrd_6_' + baseData?.id + item.id}
                    value={item.number}
                    onChange={e => updateNewContactMobile(item.id, 'number', e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={5000}
                    required={true}
                  />,
                  required: true,
                  value: item.number
              },
 

            ]}
            extratext={[
              {
                edit_mode: editMode,
                label: 'Комментарий',
                input:
                  
                  <TextArea
                    key={'memcadsrd_6_' + baseData?.id + item.id}
                    value={item.comment}
                    onChange={e => updateNewContactMobile(item.id, 'comment', e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={5000}
                    
                  />,
                  required: false,
                  value: item.comment
              },
            ]}
          />
          </div>
        ))}</div>
      )}

      {/* ----------------------------- DIVIDER ----------------------------- */}

      {newContacthomephones.length > 0 && (
        <div className='sa-org-temp-stack-collapse'>
        {newContacthomephones.map((item)=>(
          <div className={`sa-org-sub-sub-section-row ${item.deleted ? 'deleted' : ''}`}>
        Hello
          </div>
        ))}</div>
      )}

      {/* ----------------------------- DIVIDER ----------------------------- */}

      {newContactemails.length > 0 && (
        <div className='sa-org-temp-stack-collapse'>
        {newContactemails.map((item)=>(
          <div className={`sa-org-sub-sub-section-row ${item.deleted ? 'deleted' : ''}`}>
        Hello
          </div>
        ))}</div>
      )}

      {/* ----------------------------- DIVIDER ----------------------------- */}

      {newContactmessangers.length > 0 && (
        <div className='sa-org-temp-stack-collapse'>
        {newContactmessangers.map((item)=>(
          <div className={`sa-org-sub-sub-section-row ${item.deleted ? 'deleted' : ''}`}>
        Hello
          </div>
        ))}</div>
      )}

        {/* ----------------------------- DIVIDER ----------------------------- */}


        </div>
      




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
    </div>
  );
};

export default ContactMainSectionTorg;