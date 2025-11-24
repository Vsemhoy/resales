import React, { useEffect, useState } from 'react';
import TorgPageSectionRow from '../TorgPageSectionRow';
import { Button, Checkbox, DatePicker, Input, Tooltip } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { TORG_CHEVRON_SIZE, TORG_MAX_ROWS_TEXTAREA, TORG_MIN_ROWS_TEXTAREA } from '../TorgConfig';
import { BellSlashIcon, CameraIcon, ChevronDownIcon, ChevronRightIcon, ChevronUpIcon, DevicePhoneMobileIcon, EnvelopeIcon, PaperAirplaneIcon, PhoneIcon, TrashIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import { getMonthName } from '../../../../components/helpers/TextHelpers';
import ContactEmailMicroSectionTorg from './microsections/contact/ContactEmailMicroSectionTorg';
import ContactHomePhoneMicroSectionTorg from './microsections/contact/ContactHomePhoneMicroSectionTorg';
import ContactMessangerMicroSectionTorg from './microsections/contact/ContactMessangerMicroSectionTorg';
import ContactMobileMicroSectionTorg from './microsections/contact/ContactMobileMicroSectionTorg';
import ContactPhoneMicroSectionTorg from './microsections/contact/ContactPhoneMicroSectionTorg';
import { WarningFilled, WarningOutlined } from '@ant-design/icons';

const ContactMainSectionTorg = (props) => {
  const [refreshMark, setRefreshMark] = useState(null);

  const [collapsed, setCollapsed] = useState(true);
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
  const [exittoorg_id, setExittoorg_id] = useState(null);
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
  const [newContactemails,      setNewContactEmails]      = useState([]);
  const [newContactmessangers,  setNewContactmessangers]  = useState([]);

  const [updatedContactstelephones, setUpdatedNewContactstelephones] = useState([]);
  const [updatedContactmobiles,     setUpdatedNewContactmobiles]     = useState([]);
  const [updatedContacthomephones,  setUpdatedNewContacthomephones]  = useState([]);
  const [updatedContactemails,      setUpdatedNewContactEmails]      = useState([]);
  const [updatedContactmessangers,  setUpdatedNewContactmessangers]  = useState([]);
  
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
    if (!props.edit_mode){
      setNewContactEmails([]);
      setNewContacthomephones([]);
      setNewContactmessangers([]);
      setNewContactmobiles([]);
      setNewContactstelephones([]);

      setUpdatedNewContactEmails([]);
      setUpdatedNewContacthomephones([]);
      setUpdatedNewContactmessangers([]);
      setUpdatedNewContactmobiles([]);
      setUpdatedNewContactstelephones([]);
    };
    setEditMode(props.edit_mode);
  }, [props.edit_mode]);

  useEffect(() => {
    setRefreshMark(props.refresh_mark);
  }, [props.refresh_mark]);

useEffect(() => {
  const newData = JSON.parse(JSON.stringify(props.data));
  if (JSON.stringify(baseData) !== JSON.stringify(newData)) {
    setBaseData(newData);
  }

  if (props.data.id) {
    // Примитивы
    if (itemId !== props.data.id) {
      setItemId(props.data.id);
    }
    if (orgId !== props.data.id_orgs) {
      setOrgId(props.data.id_orgs);
    }
    if (name !== props.data?.name) {
      setName(props.data?.name);
    }
    if (lastName !== props.data?.lastname) {
      setLastName(props.data?.lastname);
    }
    if (middleName !== props.data?.middlename) {
      setMiddleName(props.data?.middlename);
    }
    if (occupy !== props.data?.occupy) {
      setOccupy(props.data?.occupy);
    }
    if (comment !== props.data?.comment) {
      setComment(props.data?.comment);
    }
    if (job !== props.data?.job) {
      setJob(props.data?.job);
    }
    if (unsubscribe !== props.data?.unsubscribe) {
      setUnsubscribe(props.data?.unsubscribe);
    }

    if (exittoorg_id !== props.data?.exittoorg_id) {
      setExittoorg_id(props.data?.exittoorg_id ? props.data?.exittoorg_id : null);
    }
    if (deleted !== props.data?.deleted) {
      setDeleted(props.data?.deleted);
    }

    // Массивы — через stringify
    if (JSON.stringify(contactstelephones) !== JSON.stringify(props.data.contactstelephones)) {
      setContactstelephones(props.data.contactstelephones);
      setNewContactstelephones([]);      
      setUpdatedNewContactstelephones([]);
    }
    if (JSON.stringify(contactmobiles) !== JSON.stringify(props.data.contactmobiles)) {
      setContactmobiles(props.data.contactmobiles);
      setUpdatedNewContactmobiles([]);
      setNewContactmobiles([]);
    }
    if (JSON.stringify(contacthomephones) !== JSON.stringify(props.data.contacthomephones)) {
      setContacthomephones(props.data.contacthomephones);
      setNewContacthomephones([]);
      setUpdatedNewContacthomephones([]);
    }
    if (JSON.stringify(contactemails) !== JSON.stringify(props.data.contactemails)) {
      setContactemails(props.data.contactemails);
      setNewContactEmails([]);
      setUpdatedNewContactEmails([]);
    }
    if (JSON.stringify(contactmessangers) !== JSON.stringify(props.data.contactmessangers)) {
      setContactmessangers(props.data.contactmessangers);
      setNewContactmessangers([]);
      setUpdatedNewContactmessangers([]);
    }
  }
}, [props.data]);



  useEffect(() => {
    setSelects(props.selects)
  }, [props.selects]);

  useEffect(() => {
    setCollapsed(props.collapse);
  }, [props.collapse]);

  // Этот не работает - не долетает айдишник компании
  useEffect(() => {
    // console.log('ID ORGS', props.data.id_orgs)
    if (props.data.id_orgs !== orgId){
      setNewContactEmails([]);
      setNewContacthomephones([]);
      setNewContactmessangers([]);
      setNewContactmobiles([]);
      setNewContactstelephones([]);

      setUpdatedNewContactEmails([]);
      setUpdatedNewContacthomephones([]);
      setUpdatedNewContactmessangers([]);
      setUpdatedNewContactmobiles([]);
      setUpdatedNewContactstelephones([]);
    }
  }, [props.data.id_orgs]);


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
    setAllowDelete(props.allow_delete);
  }, [props.allow_delete]);

  // useEffect(() => {
  //   setCollapsed(props.collapsed);
  // }, [props.collapsed]);


  useEffect(() => {
    // console.log('ALLLLOO', deleted)
    if (editMode && !collapsed && baseData && baseData.command === 'create' && deleted){
      // Лазейка для удаления созданных в обход таймаута - позволяет избежать гонок при очень быстром удалении
          if (props.on_change){
            baseData.deleted = deleted;
                // baseData.command = 'delete';
                // console.log('DELETED')
                props.on_change('contacts', itemId, baseData);
                return;
          }
        }

      const timer = setTimeout(() => {
        // При сверх-быстром изменении полей в разных секциях могут быть гонки
			  if (editMode && baseData){
          if (props.on_change){
            // data.theme = theme;
            // data.date = date ? date.format('DD.MM.YYYY HH:mm:ss') : null;
            // data.notes = note;
            // data.deleted = deleted;
            

            baseData.name = name?.trim();
            baseData.lastname = lastName?.trim();
            baseData.middlename = middleName?.trim();
            baseData.occupy = occupy?.trim();
            baseData.comment = comment?.trim();
            baseData.job = job;
            baseData.exittoorg_id = exittoorg_id;
            baseData.deleted = deleted;
            baseData.unsubscribe = unsubscribe;

            /** Сюда ничего не добавляем, иначе будет бесконечный add */
            baseData.contactstelephones    = contactstelephones;
            baseData.contactmobiles        = contactmobiles;
            baseData.contacthomephones     = contacthomephones;
            baseData.contactemails         = contactemails;
            baseData.contactmessangers     = contactmessangers;

            baseData.up_contactstelephones = updatedContactstelephones.concat(newContactstelephones);
            baseData.up_contactmobiles =     updatedContactmobiles.concat(newContactmobiles);
            baseData.up_contacthomephones =  updatedContacthomephones.concat(newContacthomephones);
            baseData.up_contactemails =      updatedContactemails.concat(newContactemails);
            baseData.up_contactmessangers =  updatedContactmessangers.concat(newContactmessangers);

            if (baseData.command === undefined || baseData.command !== 'create'){
              if (deleted){
                baseData.command = 'delete';
              } else {
                baseData.command = 'update';
              }
            }
            // console.log('baseData', baseData)
            props.on_change('contacts', itemId, baseData);
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
    unsubscribe,
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



const CollectAndSend = (stackName, data) => {
  console.log('stackName, data', stackName, data);

  if (!props.on_collect || !baseData) return;

  // Маппинг stackName → имя поля в baseData
  const collectionMap = {
    email: 'up_contactemails',
    newemail: 'up_contactemails',

    phone: 'up_contactstelephones',
    newphone: 'up_contactstelephones',

    messanger: 'up_contactmessangers',
    newmessanger: 'up_contactmessangers',

    mobile: 'up_contactmobiles',
    newmobile: 'up_contactmobiles',

    homephone: 'up_contacthomephones',
    newhomephone: 'up_contacthomephones',
  };

  const collectionKey = collectionMap[stackName];
  if (!collectionKey) {
    console.warn('Неизвестный stackName:', stackName);
    return;
  }

  // Глубокая копия baseData
  const ndata = JSON.parse(JSON.stringify(baseData));

  // Получаем текущую коллекцию (или создаём пустой массив)
  const currentCollection = Array.isArray(ndata[collectionKey])
    ? ndata[collectionKey]
    : [];

  // Находим индекс элемента с таким же id
  const existingIndex = currentCollection.findIndex(item => item.id === data.id);

  let newCollection;
  if (existingIndex >= 0) {
    // Заменяем существующий
    newCollection = [
      ...currentCollection.slice(0, existingIndex),
      data,
      ...currentCollection.slice(existingIndex + 1)
    ];
  } else {
    // Добавляем новый
    newCollection = [...currentCollection, data];
  }

  // Обновляем коллекцию в копии
  ndata[collectionKey] = newCollection;

  // Отправляем наверх
  props.on_collect(ndata);
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
    // console.log('delete', id)
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
    // console.log('CALL TU REAL UPDATE');
    if (!editMode) {
      return;
    }

    const excluders = ['command', 'date'];


    if (data.deleted === true){
      data.command = "delete";
    } 

    // console.log('data email', data)
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
    // console.log('delete', id)
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
    // console.log('CALL TU NEW UPDATE');
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
    // console.log('CALL TU REAL UPDATE');
    if (!editMode) {
      return;
    }

   
    if (data.deleted === true){
      data.command = "delete";
    } 

    // console.log('data email', data)
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
    // console.log('delete', id)
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
    // console.log('CALL TU NEW UPDATE');
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
    // console.log('CALL TU REAL UPDATE');
    if (!editMode) {
      return;
    }

   
    if (data.deleted === true){
      data.command = "delete";
    } 

    // console.log('data email', data)
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
    setNewContactEmails([...newContactemails, item]);
  }

  /**
   * Удаление напрочь только что добавленной записи
   * @param {*} id 
   */
  const handleDeleteNewEmail = (id) => {
    // console.log('delete', id)
    setNewContactEmails(newContactemails.filter((item)=>item.id !== id));
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
    // console.log('CALL TU NEW UPDATE');
    if (!editMode) {
      return;
    }

    data.command = 'create';

    setNewContactEmails((prevUnits) => {
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
    // console.log('CALL TU REAL UPDATE');
    if (!editMode) {
      return;
    }

   
    if (data.deleted === true){
      data.command = "delete";
    } 

    // console.log('data email', data)
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
    // console.log('delete', id)
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
    // console.log('CALL TU NEW UPDATE');
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
    // console.log('CALL TU REAL UPDATE');
    if (!editMode) {
      return;
    }

   
    if (data.deleted === true){
      data.command = "delete";
    } 

    // console.log('data', data)
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










  const updateContactMobile = (id, value, field) => {
    setContactmobiles(prev =>
      prev.map(item =>
        item.id === id ? value : item
      )
    );
    let existed = updatedContactmobiles.find((item)=> item.id === id);
    if (existed){
      setUpdatedNewContactmobiles(prev =>
        prev.map(item =>
          item.id === id ? value : item
        )
      );
    } else {
      setUpdatedNewContactmobiles([...updatedContactmobiles, value]);
    }
  };

  const updateNewContactMobile = (id, value, field) => {
    setNewContactmobiles(prev =>
      prev.map(item =>
        item.id === id ? value : item
      )
    );
  };



    const updateContactPhone = (id, value, field) => {
      setContactstelephones(prev =>
        prev.map(item =>
          item.id === id ? value : item
        )
      );

    let existed = updatedContactstelephones.find((item)=> item.id === id);
    if (existed){
      setUpdatedNewContactstelephones(prev =>
        prev.map(item =>
          item.id === id ? value : item
        )
      );
    } else {
      setUpdatedNewContactstelephones([...updatedContactstelephones, value]);
    }
  };

  const updateNewContactPhone = (id, value, field) => {
    setNewContactstelephones(prev =>
      prev.map(item =>
        item.id === id ? value : item
      )
    );
  };

  const updateContactHomePhone = (id, value, field) => {
    setContacthomephones(prev =>
      prev.map(item =>
        item.id === id ? value : item
      )
    );
        let existed = updatedContacthomephones.find((item)=> item.id === id);
    if (existed){
      setUpdatedNewContacthomephones(prev =>
        prev.map(item =>
          item.id === id ? value : item
        )
      );
    } else {
      setUpdatedNewContacthomephones([...updatedContacthomephones, value]);
    }
  };

  const updateNewContactHomePhone = (id, value, field) => {
    setNewContacthomephones(prev =>
      prev.map(item =>
        item.id === id ? value : item
      )
    );
  };

  const updateContactEmail = (id, value, field) => {
    setContactemails(prev =>
      prev.map(item =>
        item.id === id ? value : item
      )
    );
      let existed = updatedContactemails.find((item)=> item.id === id);
    if (existed){
      setUpdatedNewContactEmails(prev =>
        prev.map(item =>
          item.id === id ? value : item
        )
      );
    } else {
      setUpdatedNewContactEmails([...updatedContactemails, value]);
    }
  };

  const updateNewContactEmail = (id, value, field) => {
    setNewContactEmails(prev =>
      prev.map(item =>
        item.id === id ? value : item
      )
    );
  };

    const updateContactMessanger = (id, value, field) => {
    setContactmessangers(prev =>
      prev.map(item =>
        item.id === id ? value : item
      )
    );
      let existed = updatedContactmessangers.find((item)=> item.id === id);
    if (existed){
      setUpdatedNewContactmessangers(prev =>
        prev.map(item =>
          item.id === id ? value : item
        )
      );
    } else {
      setUpdatedNewContactmessangers([...updatedContactmessangers, value]);
    }
  };

  const updateNewContactMessanger = (id, value, field) => {
    setNewContactmessangers(prev =>
      prev.map(item =>
        item.id === id ? value : item
      )
    );
  };





  return (
    <div className={`sa-org-collapse-item sa-org-person-row
       ${collapsed ? 'sa-collapsed-item' : 'sa-opened-item'}
       ${deleted ? 'deleted' : ''} ${baseData && baseData.command && baseData.command === 'create' ? 'sa-brand-new-row' : ''}`}

    >
      <div className={'sa-org-collpase-header sa-flex-space'}
        onClick={(ev) => {
          if (!ev.target.closest('.sa-click-ignore')){
            ev.preventDefault();
            ev.stopPropagation();
            setCollapsed(!collapsed)
          }
        }
        }
      >
        <div className={'sa-flex'}>
          <div className={'sa-pa-3 sa-lh-chevron'}>
            {collapsed ? (
              <span className={'sa-org-trigger-button'}
                onClick={() => { setCollapsed(!collapsed) }}
              >
                <ChevronRightIcon height={TORG_CHEVRON_SIZE} />
              </span>

            ) : (
              <span className={'sa-org-trigger-button active'}
              onClick={() => { setCollapsed(!collapsed) }}
              >
                <ChevronRightIcon height={TORG_CHEVRON_SIZE} />
                {/* <ChevronDownIcon height={TORG_CHEVRON_SIZE} /> */}
              </span>
            )}


          </div>
          <div className={'sa-pa-3 sa-org-section-text'}>
            <div className='sa-org-section-label'>
              {name || middleName || lastName || occupy ? (
                <>
                  {lastName || ''} {name ? name : ''} {middleName ? middleName : ''}
                  {occupy && <div className='sa-occupy-namerow'>  - {occupy}</div>}
                </>
              ) : (
                "Без имени"
              )}
            </div>
            <span className="sa-author-text">
							
							{(!job || unsubscribe) ? (
								<Tooltip
									placement={'right'}
									title={
										<div>
                      {!job ? (
                        <div>- Не работает в организации</div>
                      ) : ("")}
                      {unsubscribe ? (
                        <div>- Запрещена рассылка писем</div>
                      ) : ("")}
										</div>
									}
									className={'sa-lock-mark'}
								>
                  <div className={'sa-flex'}>
                    {!job && (
									<WarningOutlined height={'32px'} style={{fontSize: '20px'}} />
                  )}
                  {(unsubscribe !== 0 && unsubscribe !== false) ? (
                  <span style={{height: '24px', marginBottom: '-3px'}}>
                    <BellSlashIcon height={'22px'} style={{fontSize: '18px'}} />
                    </span>
                    ) : ("")}
                    </div>
								</Tooltip>
							) : ''}
						</span>{' '}
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
        <div className={'sa-flex sa-click-ignore'}>
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
            key={`contabu_${itemId}`}
            edit_mode={editMode}
            inputs={[
              {
                edit_mode: editMode,
                label: 'Имя',
                input:
                  <Input
                    key={'memcard_1_' + itemId}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    disabled={!editMode}
                    variant="borderless"
                    maxLength={60}
                  />,
                  required: true,
                  value: name
              },
              {
                edit_mode: editMode,
                label: 'Отчество',
                input:
                  <Input
                    key={'memcard_2_' + itemId}
                    value={middleName}
                    onChange={e => setMiddleName(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    disabled={!editMode}
                    variant="borderless"
                    maxLength={60}
                    required={false}
                  />,
                  required: false,
                  value: middleName
              },

            ]}
            extratext={[]}
          />


          <TorgPageSectionRow
            key={`kakadu_${itemId}`}
            edit_mode={editMode}
            inputs={[
              {
                edit_mode: editMode,
                label: 'Фамилия',
                input:
                  <Input
                    key={'memcard_3_' + itemId}
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    disabled={!editMode}
                    variant="borderless"
                    maxLength={60}
                  />,
                  required: true,
                  value: lastName
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
                    disabled={!editMode}
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
            key={`kamadu_${itemId}`}
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
                    disabled={!editMode}
                    variant="borderless"
                    maxLength={5000}
                  />,
                  required: false,
                  value: comment
              },


            ]}
            extratext={[]}
          />


          <TorgPageSectionRow
            key={`alkatu_${itemId}`}
            edit_mode={editMode}
            inputs={[
              {
                label: 'Работает',
                input:
                  <Checkbox
                  key={'memcard_6d_' + itemId}
                   value={job}
                   onChange={(ev)=>(setJob(ev.target.checked))}
                    checked={job ? true : false}
                    disabled={!editMode}
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
            key={`comatsu_${itemId}`}
            edit_mode={editMode}
            inputs={[
              {
                edit_mode: editMode,
                label: 'Запретить рассылку',
                input:
                  <Checkbox
                    key={'memcard_6d_' + itemId}
                   value={unsubscribe}
                   onChange={(ev)=>(setUnsubscribe(ev.target.checked))}
                    checked={unsubscribe ? true : false}
                    disabled={!editMode}
                   />,
            
                  value: unsubscribe
              },


            ]}
            extratext={[]}
          />







      <div>
      {contactstelephones.map((item)=>(
        <ContactPhoneMicroSectionTorg
        key={'lusenro_' + item.id}
          data={item}
          edit_mode={editMode}
          on_change={updateContactPhone}
          on_collect={(payload)=>{CollectAndSend('phone',payload)}}
        />
      ))}</div>

             {/* ----------------------------- DIVIDER ----------------------------- */}
      <div>
      {contactmobiles.map((item)=>(
        <ContactMobileMicroSectionTorg
          key={'lusenco_' + item.id}
          data={item}
          edit_mode={editMode}
          on_change={updateContactMobile}
          on_collect={(payload)=>{CollectAndSend('mobile',payload)}}
        />
      ))}</div>

      {/* ----------------------------- DIVIDER ----------------------------- */}

      <div>
      {contacthomephones.map((item)=>(
        <ContactHomePhoneMicroSectionTorg
        key={'kosenco_' + item.id}
          data={item}
          edit_mode={editMode}
          on_change={updateContactHomePhone}
          on_collect={(payload)=>{CollectAndSend('homephone',payload)}}
        />
      ))}</div>

      {/* ----------------------------- DIVIDER ----------------------------- */}

      <div>
      {contactemails.map((item)=>(
        <ContactEmailMicroSectionTorg
        key={'dustenco_' + item.id}
          data={item}
          edit_mode={editMode}
          on_change={updateContactEmail}
          on_collect={(payload)=>{CollectAndSend('email',payload)}}
         />
      ))}</div>

      {/* ----------------------------- DIVIDER ----------------------------- */}
      
      <div>
      {contactmessangers.map((item)=>(
        <ContactMessangerMicroSectionTorg
        key={'gazenco_' + item.id}
            data={item}
            edit_mode={editMode}
            on_change={updateContactMessanger}
            selects={selects}
            on_collect={(payload)=>{CollectAndSend('messanger',payload)}}
        />
      ))}</div>



      {/* ----------------------------- DIVIDER ----------------------------- */}

      {newContactstelephones.length > 0 && (
        <div className='sa-org-temp-stack-collapse'>
        {newContactstelephones.map((item)=>(
          <ContactPhoneMicroSectionTorg
          key={'brisenco_' + item.id}
                data={item}
                edit_mode={editMode}
                on_change={updateNewContactPhone}
                on_delete={(id)=>{
                  setNewContactstelephones(newContactstelephones.filter(item2 => item2.id !== id));
                }}
                on_collect={(payload)=>{CollectAndSend('newtelephone',payload)}}
          />
        ))}
        </div>
      )}

      {/* ----------------------------- DIVIDER ----------------------------- */}

      {newContactmobiles.length > 0 && (
        <div className='sa-org-temp-stack-collapse'>
        {newContactmobiles.map((item)=>(
          <ContactMobileMicroSectionTorg
          key={'dubenco_' + item.id}
                data={item}
                edit_mode={editMode}
                on_change={updateNewContactMobile}
                on_delete={(id)=>{
                  setNewContactmobiles(newContactmobiles.filter(item2 => item2.id !== id));
                }}
                on_collect={(payload)=>{CollectAndSend('newmobile',payload)}}
          />
        ))}</div>
      )}

      {/* ----------------------------- DIVIDER ----------------------------- */}

      {newContacthomephones.length > 0 && (
        <div className='sa-org-temp-stack-collapse'>
        {newContacthomephones.map((item)=>(
          <ContactHomePhoneMicroSectionTorg
          key={'keranco_' + item.id}
                data={item}
                edit_mode={editMode}
                on_change={updateNewContactHomePhone}
                on_delete={(id)=>{
                  setNewContacthomephones(newContacthomephones.filter(item2 => item2.id !== id));
                }}
                on_collect={(payload)=>{CollectAndSend('newhomephone',payload)}}
          />
        ))}</div>
      )}

      {/* ----------------------------- DIVIDER ----------------------------- */}

      {newContactemails.length > 0 && (
        <div className='sa-org-temp-stack-collapse'>
        {newContactemails.map((item)=>(
              <ContactEmailMicroSectionTorg
              key={'glinomesco_' + item.id}
                data={item}
                edit_mode={editMode}
                on_change={updateNewContactEmail}
                on_delete={(id)=>{
                  setNewContactEmails(newContactemails.filter(item2 => item2.id !== id));
                }}
                on_collect={(payload)=>{CollectAndSend('newmail',payload)}}
              />
        ))}</div>
      )}

      {/* ----------------------------- DIVIDER ----------------------------- */}

      {newContactmessangers.length > 0 && (
        <div className='sa-org-temp-stack-collapse'>
        {newContactmessangers.map((item)=>(
          <ContactMessangerMicroSectionTorg
          key={'goncharenco_' + item.id}
                data={item}
                edit_mode={editMode}
                on_change={updateNewContactMessanger}
                on_delete={(id)=>{
                  setNewContactmessangers(newContactmessangers.filter(item2 => item2.id !== id));
                }}
                selects={selects}
                on_collect={(payload)=>{CollectAndSend('newmessanger',payload)}}
          />
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