import React, { useEffect, useState } from 'react';

import { Badge, Button, Collapse, Empty, Input, Select, Spin } from 'antd';
import {
  BuildingLibraryIcon,
  BuildingOfficeIcon,
	CameraIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	DevicePhoneMobileIcon,
	EnvelopeIcon,
	PaperAirplaneIcon,
	PhoneIcon,
	TrashIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import { forIn } from 'lodash';

import { PlusCircleOutlined } from '@ant-design/icons';
import { FlushOrgData } from '../handlers/OrgPageDataHandler';
import { ShortName } from '../../../../components/helpers/TextHelpers';
import { TORG_CHEVRON_SIZE } from '../TorgConfig';
import MianBigSectionOrg from '../sections/bigsections/MainBigSectionOrg';
import InfoBigSectionOrg from '../sections/bigsections/InfoBigSectionOrg';
import TorgPageSectionRow from '../TorgPageSectionRow';
import OrgLegalAddressMicroSectionTorg from '../sections/microsections/orgcontact/OrgLegalAddressMicroSectionTorg';
import OrgAddressMicroSectionTorg from '../sections/microsections/orgcontact/OrgAddressMicroSectionTorg';
import OrgPhoneMicroSectionTorg from '../sections/microsections/orgcontact/OrgPhoneMicroSectionTorg';
import OrgEmailMicroSectionTorg from '../sections/microsections/orgcontact/OrgEmailMicroSectionTorg';
import SiteBigSectionOrg from '../sections/bigsections/SiteBigSectionOrg';
import AnLicenseMicroSectionTorg from '../sections/microsections/tolerance/AnLicenseMicroSectionTorg';
import BoLicenseMicroSectionTorg from '../sections/microsections/tolerance/BoLicenseMicroSectionTorg';
import ContactMainSectionTorg from '../sections/ContactMainSectionTorg';
import RequisiteMicroSectionTorg from '../sections/microsections/requisites/RequisiteMicroSectionTorg';



// import { useNavigate, useSearchParams } from 'react-router-dom';

const TabMainTorg = (props) => {
  const [editMode, seteditMode] = useState(props.edit_mode ? props.edit_mode : false);
  const [show, setShow] = useState(false);
  const [itemId, setItemId] = useState(props.item_id);

	const [loading, setLoading] = useState(false);

	const [newLoading, setNewLoading] = useState(false);

  const [baseData, setBaseData] = useState([]);

  // Структурированные в коллапсы юниты
  const [structureItems, setStructureItems] = useState([]);
  const [structureContacts, setStructureContacts] = useState([]);

  const [BLUR_FLAG, setBLUR_FLAG] = useState(null);


  const [form_id8org_towns,   setFormId8org_towns]   = useState(1);
  const [form_id8org_regions, setFormId8org_regions] = useState(1);
  const [form_name, setFormName] = useState('');



  const [site,           setSite]             = useState('');

  const [statusmoney, setStatusmoney]         = useState(0);
  const [conveyance, setConveyance]           = useState(0);
  const [typeList, setTypeList] = useState(0);
  const [listComment,       setListComment] = useState('');

  const [author, setAuthor] = useState(''); 
  const [curator, setCurator] = useState('');



  
  /**
   * Оперативные массивы - сюда загружаются все массивы и здесь же они модифицируются
   */
  const [CONTACTS,     setCONTACTS]     = useState([]);
  /**
   * Здесь хранятся как полученные с сервера, так и измененные и добавленные объекты
   * При отправке наверх, данные фильтруются по полю !action
   */
  const [REQUISITES,   setREQUISITES]   = useState([]);
  const [BOLICENSES,   setBOLICENSES]   = useState([]);
  const [ANLICENSES,   setANLICENSES]   = useState([]);
  const [ANTOLERANCES, setANTOLERANCES] = useState([]);

  const [ORGLEGADDRESSES, setORLEGADDRESSES] = useState([]);
  const [ORGADDRESSES,    setORGADDRESSES]   = useState([]);
  const [ORGPHONES,       setORGPHONES]      = useState([]);
  const [ORGEMAILS,       setORGEMAILS]      = useState([]);


  /**
   * Здесь ключи открытых коллапсов
   */
  const [collapsed_rows, setCollapsedRows] = useState(['main_row', 'info_row', 'contactinfo_row', 'licenses_row', 'contacts_row', 'requisites_row']);


	const [selects, setSelects] = useState(null);
	useEffect(() => {
		setSelects(props.selects);
	}, [props.selects]);

  useEffect(() => {
    setShow(props.show);
  }, [props.show]);

  useEffect(() => {
    seteditMode(props.edit_mode);
  }, [props.edit_mode]);



  useEffect(() => {
    setLoading(props.is_loading);
  }, [props.is_loading]);

  useEffect(() => {
    if (!props.base_data){
      return;
    }
    setBaseData(props.base_data);
    // console.log('BASE_DATA ++++++++++++++++++++++',props.base_data);
    if (props.base_data){
      setFormId8org_regions(props.base_data.id8org_regions);
      setFormId8org_towns(props.base_data.id8org_towns);
    }

    if (props.base_data?.contacts){
      setCONTACTS(JSON.parse(JSON.stringify(props.base_data?.contacts)));
    } else { setCONTACTS([])};

    if (props.base_data?.active_licenses_bo){
      setBOLICENSES(JSON.parse(JSON.stringify(props.base_data?.active_licenses_bo)));
    } else {setBOLICENSES([])};

    if (props.base_data?.active_licenses){
      setANLICENSES(JSON.parse(JSON.stringify(props.base_data?.active_licenses)));
    } else {setANLICENSES([])};

    if (props.base_data?.active_tolerance){
      setANTOLERANCES(JSON.parse(JSON.stringify(props.base_data?.active_tolerance)));
    } else {setANTOLERANCES([])};

    if (props.base_data?.address){
      setORGADDRESSES(JSON.parse(JSON.stringify(props.base_data?.address)));
    } else {setORGADDRESSES([])};

    if (props.base_data?.legaladdresses){
      setORLEGADDRESSES(JSON.parse(JSON.stringify(props.base_data?.legaladdresses)));
    } else {setORLEGADDRESSES([])};

    if (props.base_data?.emails){
      setORGEMAILS(JSON.parse(JSON.stringify(props.base_data?.emails)));
    } else {setORGEMAILS([])};



    if (props.base_data?.phones){
      setORGPHONES(JSON.parse(JSON.stringify(props.base_data?.phones)));
    } else {setORGPHONES([])};

    if (props.base_data?.requisites){
      setREQUISITES(JSON.parse(JSON.stringify(props.base_data?.requisites)));
    } else {setREQUISITES([])};

    let creator  = props.base_data?.creator;
    let curator  = props.base_data?.curator;
    let list     = props.base_data?.list;



    // Очистка главного объекта от мусора
    let bdt = FlushOrgData(JSON.parse(JSON.stringify(props.base_data)), [
      "warningcmpcount",
      "warningcmpcomment",
      "tv",
      "id_orgs8an_tolerance",
      "id_orgs8an_project",
      "id_orgs8an_phones",
      "id_orgs8an_notes",
      "id_orgs8an_meeting",
      "id_orgs8an_log",
      "id_orgs8an_licenses",
      "id_orgs8an_fax",
      "id_orgs8an_calls",
      "id_orgs8an_email",
      "id_orgs8an_address",
      "contacts",
      "creator",
      "curator",
      "legaladdresses",
      "phones",
      "region",
      "requisites",
      "statusmoney",
      "town",
      "emails",
      "deliverytype",
      "address",
      "active_tolerance",
      "active_licenses_bo",
      "active_licenses",
      "id8staff_list7author",
      "id8staff_list",
      "id_orgs8an_orgsusers",
      "id_orgs8an_list",
      "date_dealer"
    ]);

    console.log('START --------- ', bdt);

    setBaseData(bdt);

    console.log('bdt', bdt, props.base_data)

      if (creator){
            setAuthor(ShortName(creator?.surname, creator?.name, creator?.secondname));
          } else {
            setAuthor('');
          };
          if (curator){
            setCurator(ShortName(curator?.surname, curator?.name, curator?.secondname));
          } else {
            setCurator('');
          };
    
      setStatusmoney(bdt.id8an_statusmoney);
      setConveyance(bdt.id8an_conveyance);
      
      setTypeList(list?.id8an_typelist ? list?.id8an_typelist : 0);
      setListComment(list?.comment ? list?.comment : '');

   


  }, [props.base_data]);

  useEffect(() => {
    setItemId(props.item_id);
  }, [props.item_id]);



  useEffect(() => {
    if (BLUR_FLAG && props.on_change_main_data){
      console.log('CALLL _----------- TO ___________ save');
      props.on_change_main_data(baseData);
    }
  }, [baseData]);











    const triggerCollapse = (itemname) => {
      console.log(itemname);
      if (collapsed_rows.includes(itemname)){
        setCollapsedRows(collapsed_rows.filter((item)=> item !== itemname));
      } else {
        console.log('HOHOHO');
        setCollapsedRows([...collapsed_rows, itemname]);
      }
    }


    useEffect(() => {
      console.log(collapsed_rows);
    }, [collapsed_rows]);


//  ██████  ██████  ███    ██ ████████  █████   ██████ ████████ 
// ██      ██    ██ ████   ██    ██    ██   ██ ██         ██    
// ██      ██    ██ ██ ██  ██    ██    ███████ ██         ██    
// ██      ██    ██ ██  ██ ██    ██    ██   ██ ██         ██    
//  ██████  ██████  ██   ████    ██    ██   ██  ██████    ██    


  const handleUpdateContacts = (e,a,data)=>{
    if (props.on_change_contact){
      props.on_change_contact(data);
    }
    if (data.command === 'create' && data.deleted){
			// Удаление только что добавленного
			setCONTACTS(CONTACTS.filter((item) => item.id !== data.id));
		} else {
			let existed = CONTACTS.find((item)=>item.id === data.id);
			if (!existed){
				setCONTACTS([data, ...CONTACTS]);
			} else {
				setCONTACTS(CONTACTS.map((item) => (
					item.id === data.id ? data : item
				)))
			}
		}
  }



  const handleAddContact = () => {
    let newContact = {
      id: 'new_' + dayjs().unix() + '_' + CONTACTS?.length,
      id_orgs: baseData.id,
      occupy: '',
      lastname: '',
      name: '',
      middlename: '',
      comment: '',
      deleted: 0,
      job: 1,
      exittoorg_id: 0,
      unsubscribe: 0,
      contactstelephones: [],
      contactmobiles: [],
      contacthomephones: [],
      contactemails: [],
      contactmessangers: [],
      command: 'create',
    }
    // let ndt = JSON.parse(JSON.stringify(baseData));
    // let newContacts = [newContact, ...ndt.contacts];
    // ndt.contacts = newContacts;
    // setBaseData(ndt);

    setCONTACTS([newContact, ...CONTACTS]);
  }



  
  
  // ░█████████  ░██                                                    
  // ░██     ░██ ░██                                                    
  // ░██     ░██ ░████████   ░███████  ░████████   ░███████   ░███████  
  // ░█████████  ░██    ░██ ░██    ░██ ░██    ░██ ░██    ░██ ░██        
  // ░██         ░██    ░██ ░██    ░██ ░██    ░██ ░█████████  ░███████  
  // ░██         ░██    ░██ ░██    ░██ ░██    ░██ ░██               ░██ 
  // ░██         ░██    ░██  ░███████  ░██    ░██  ░███████   ░███████  
    /* ----------------- PHONES --------------------- */
  /**
     * Добавление нового элемента в стек новых
     */
    const handleAddPhone = ()=>{
      let item = {
            id: 'new_' + dayjs().unix() + '_' + ORGPHONES.length ,
            id_orgs:  itemId,
            number: '',
            ext: '',
            comment: '',
            deleted: 0,
            command: "create",
          };
      setORGPHONES([...ORGPHONES, item]);
    }
  
  
    /**
     * Обновление или удаление записи
     * @param {*} id 
     * @param {*} data 
     * @returns 
     */
    const handleUpdatePhoneUnit = (id, data) => {
      if (!editMode) {
        return;
      }
      // if (props.on_change_phone){
      //   props.on_change_phone(data);
      // };
  
      if (data.command !== 'create'){
        if (data.deleted){
          data.command = 'delete';
        } else {
          data.command = 'update';
        }
      } else {
        // Попытка удалить новый - удаляет из стека
        if (data.deleted){
          setORGPHONES(ORGPHONES.filter((item)=>item.id !== id));
          return;
        }
      };
      // изменяет существующий
      setORGPHONES((prevUnits) => {
        const exists = prevUnits.some((item) => item.id === id);
        if (!exists) {
          return [...prevUnits, data];
        } else {
          return prevUnits?.map((item) => (item.id === id ? data : item));
        }
      });
    };

  
  
    /* ----------------- PHONES END --------------------- */
  
  
  
  
  
  
  // ░██         ░██████████   ░██████     ░███    ░██         
  // ░██         ░██          ░██   ░██   ░██░██   ░██         
  // ░██         ░██         ░██         ░██  ░██  ░██         
  // ░██         ░█████████  ░██  █████ ░█████████ ░██         
  // ░██         ░██         ░██     ██ ░██    ░██ ░██         
  // ░██         ░██          ░██  ░███ ░██    ░██ ░██         
  // ░██████████ ░██████████   ░█████░█ ░██    ░██ ░██████████ 
    /* ----------------- LAWADDRESS --------------------- */
  /**
     * Добавление нового элемента в стек новых
     */
    const handleAddLegalad = ()=>{
      let item = {
            id: 'new_' + dayjs().unix() + '_' + ORGLEGADDRESSES.length ,
            id_orgs:  itemId,
            address: '',
            post_index: '',
            comment: '',
            deleted: 0,
            command: "create",
          };
      setORLEGADDRESSES([...ORGLEGADDRESSES, item]);
    }
      /**
     * Обновление или удаление записи
     * @param {*} id 
     * @param {*} data 
     * @returns 
     */
    const handleUpdateLegalUnit = (id, data) => {
      if (!editMode) {
        return;
      }

  
      if (data.command !== 'create'){
        if (data.deleted){
          data.command = 'delete';
        } else {
          data.command = 'update';
        }
      } else {
        // Попытка удалить новый - удаляет из стека
        if (data.deleted){
          setORLEGADDRESSES(ORGLEGADDRESSES.filter((item)=>item.id !== id));
          return;
        }
      };
      // изменяет существующий
      setORLEGADDRESSES((prevUnits) => {
        const exists = prevUnits.some((item) => item.id === id);
        if (!exists) {
          return [...prevUnits, data];
        } else {
          return prevUnits?.map((item) => (item.id === id ? data : item));
        }
      });
    };
  
  
    /* ----------------- LAWADDRESS END --------------------- */
  
  
  
  
  
  //    ░███    ░███████   ░███████   ░█████████  ░██████████   ░██████     ░██████   
  //   ░██░██   ░██   ░██  ░██   ░██  ░██     ░██ ░██          ░██   ░██   ░██   ░██  
  //  ░██  ░██  ░██    ░██ ░██    ░██ ░██     ░██ ░██         ░██         ░██         
  // ░█████████ ░██    ░██ ░██    ░██ ░█████████  ░█████████   ░████████   ░████████  
  // ░██    ░██ ░██    ░██ ░██    ░██ ░██   ░██   ░██                 ░██         ░██ 
  // ░██    ░██ ░██   ░██  ░██   ░██  ░██    ░██  ░██          ░██   ░██   ░██   ░██  
  // ░██    ░██ ░███████   ░███████   ░██     ░██ ░██████████   ░██████     ░██████   
    /* ----------------- ADDRESS --------------------- */
  /**
     * Добавление нового элемента в стек новых
     */
    const handleAddAddress = ()=>{
      let item = {
            id: 'new_' + dayjs().unix() + '_' + ORGADDRESSES.length ,
            id_orgs:  itemId,
            address: '',
            post_index: '',
            comment: '',
            deleted: 0,
            command: "create",
          };
      setORGADDRESSES([...ORGADDRESSES, item]);
    }
  
    
    const handleUpdateAddressUnit = (id, data) => {
     if (!editMode) {
       return;
      }
      
 
      
      if (data.command !== 'create'){
        if (data.deleted){
          data.command = 'delete';
        } else {
          data.command = 'update';
        }
      } else {
        // Попытка удалить новый - удаляет из стека
        if (data.deleted){
          setORGADDRESSES(ORGADDRESSES.filter((item)=>item.id !== id));
          return;
        }
      };
      // изменяет существующий
      setORGADDRESSES((prevUnits) => {
        const exists = prevUnits.some((item) => item.id === id);
        if (!exists) {
          return [...prevUnits, data];
        } else {
          return prevUnits?.map((item) => (item.id === id ? data : item));
        }
      });
    };
  
  
    /* ----------------- ADDRESS END --------------------- */
  
  
  
  
  // ░██████████ ░███     ░███    ░███    ░██████░██           ░██████   
  // ░██         ░████   ░████   ░██░██     ░██  ░██          ░██   ░██  
  // ░██         ░██░██ ░██░██  ░██  ░██    ░██  ░██         ░██         
  // ░█████████  ░██ ░████ ░██ ░█████████   ░██  ░██          ░████████  
  // ░██         ░██  ░██  ░██ ░██    ░██   ░██  ░██                 ░██ 
  // ░██         ░██       ░██ ░██    ░██   ░██  ░██          ░██   ░██  
  // ░██████████ ░██       ░██ ░██    ░██ ░██████░██████████   ░██████   
    /* ----------------- EMAILS --------------------- */
  /**
     * Добавление нового элемента в стек новых
     */
    const handleAddEmail = ()=>{
      let item = {
            id: 'new_' + dayjs().unix() + '_' + ORGEMAILS.length ,
            id_orgs:  itemId,
            email: '',
            comment: '',
            deleted: 0,
            command: "create",
          };
      setORGEMAILS([...ORGEMAILS, item]);
    }
  
   
  
    /**
     * Обновление и удаление существующей записи
     * @param {*} id 
     * @param {*} data 
     * @returns 
     */
    const handleUpdateEmailUnit = (id, data) => {
     if (!editMode) {
       return;
      }
  
      if (data.command !== 'create'){
        if (data.deleted){
          data.command = 'delete';
        } else {
          data.command = 'update';
        }
      } else {
        // Попытка удалить новый - удаляет из стека
        if (data.deleted){
          setORGEMAILS(ORGEMAILS.filter((item)=>item.id !== id));
          return;
        }
      };
      // изменяет существующий
      setORGEMAILS((prevUnits) => {
        const exists = prevUnits.some((item) => item.id === id);
        if (!exists) {
          return [...prevUnits, data];
        } else {
          return prevUnits?.map((item) => (item.id === id ? data : item));
        }
      });
    };
  
  
    /* ----------------- EMAILS END --------------------- */
  

// ██████  ███████  ██████  ██    ██ ██ ███████ ██ ████████ ███████ ███████ 
// ██   ██ ██      ██    ██ ██    ██ ██ ██      ██    ██    ██      ██      
// ██████  █████   ██    ██ ██    ██ ██ ███████ ██    ██    █████   ███████ 
// ██   ██ ██      ██ ▄▄ ██ ██    ██ ██      ██ ██    ██    ██           ██ 
// ██   ██ ███████  ██████   ██████  ██ ███████ ██    ██    ███████ ███████ 
//                     ▀▀                                                   
                                                                         

      /* ----------------- REQUISITES --------------------- */
      /**
       * Добавление нового элемента в стек новых
       */
      const handleAddRequisite = ()=>{
        let item = {
              id: 'new_' + dayjs().unix() + '_' + REQUISITES.length ,
              id_orgs:  itemId,
              nameorg: '',
              kpp: '',
              inn: '',
              requisites: '',
              deleted: 0,
              command: "create",
            };
        setREQUISITES([...REQUISITES, item]);
      }

    /**
     * Обновление и удаление существующей записи
     * @param {*} id 
     * @param {*} data 
     * @returns 
     */
    const handleUpdateRuquisiteUnit = (id, data) => {
     if (!editMode) {
       return;
      }

  
      if (data.command !== 'create'){
        if (data.deleted){
          data.command = 'delete';
        } else {
          data.command = 'update';
        }
      } else {
        // Попытка удалить новый - удаляет из стека
        if (data.deleted){
          setREQUISITES(REQUISITES.filter((item)=>item.id !== id));
          return;
        }
      };
      // изменяет существующий
      setREQUISITES((prevUnits) => {
        const exists = prevUnits.some((item) => item.id === id);
        if (!exists) {
          return [...prevUnits, data];
        } else {
          return prevUnits?.map((item) => (item.id === id ? data : item));
        }
      });
    };



//  █████  ███    ██ ██      ██  ██████ ███████ ███    ██ ███████ ███████ 
// ██   ██ ████   ██ ██      ██ ██      ██      ████   ██ ██      ██      
// ███████ ██ ██  ██ ██      ██ ██      █████   ██ ██  ██ ███████ █████   
// ██   ██ ██  ██ ██ ██      ██ ██      ██      ██  ██ ██      ██ ██      
// ██   ██ ██   ████ ███████ ██  ██████ ███████ ██   ████ ███████ ███████ 
                                                                       
    /**
     * Обновление и удаление существующей записи
     * @param {*} id 
     * @param {*} data 
     * @returns 
     */
    const handleUpdateAnLicenseUnit = (id, data) => {
     if (!editMode) {
       return;
      }

  
      if (data.command !== 'create'){
        if (data.deleted){
          data.command = 'delete';
        } else {
          data.command = 'update';
        }
      } else {
        // Попытка удалить новый - удаляет из стека
        if (data.deleted){
          setANLICENSES(ANLICENSES.filter((item)=>item.id !== id));
          return;
        }
      };
      // изменяет существующий
      setANLICENSES((prevUnits) => {
        const exists = prevUnits.some((item) => item.id === id);
        if (!exists) {
          return [...prevUnits, data];
        } else {
          return prevUnits?.map((item) => (item.id === id ? data : item));
        }
      });
    };                                                            


//  █████  ███    ██  █████  ████████  ██████  ██      ███████ ██   ██ 
// ██   ██ ████   ██ ██   ██    ██    ██    ██ ██      ██      ██  ██  
// ███████ ██ ██  ██ ███████    ██    ██    ██ ██      █████   █████   
// ██   ██ ██  ██ ██ ██   ██    ██    ██    ██ ██      ██      ██  ██  
// ██   ██ ██   ████ ██   ██    ██     ██████  ███████ ███████ ██   ██ 
                                                                    
    /**
     * Обновление и удаление существующей записи
     * @param {*} id 
     * @param {*} data 
     * @returns 
     */
    const handleUpdateAnToleranceUnit = (id, data) => {
     if (!editMode) {
       return;
      }

  
      if (data.command !== 'create'){
        if (data.deleted){
          data.command = 'delete';
        } else {
          data.command = 'update';
        }
      } else {
        // Попытка удалить новый - удаляет из стека
        if (data.deleted){
          setANTOLERANCES(ANTOLERANCES.filter((item)=>item.id !== id));
          return;
        }
      };
      // изменяет существующий
      setANTOLERANCES((prevUnits) => {
        const exists = prevUnits.some((item) => item.id === id);
        if (!exists) {
          return [...prevUnits, data];
        } else {
          return prevUnits?.map((item) => (item.id === id ? data : item));
        }
      });
    };



// ██████   ██████  ██      ██  ██████ 
// ██   ██ ██    ██ ██      ██ ██      
// ██████  ██    ██ ██      ██ ██      
// ██   ██ ██    ██ ██      ██ ██      
// ██████   ██████  ███████ ██  ██████ 
        
    // typedoc 1 = License, 2 - tolerance
  const handleAddBoLicense = (typedoc)=>{
    let item = {
          id: 'new_' + dayjs().unix() + '_' + BOLICENSES.length ,
          id_an_orgs:  itemId,
          type: 1,
          document_type: typedoc,
          name: '',
          start_date: null,
          end_date: null,
          comment: '',
          deleted: 0,
          command: "create",
        };
    setBOLICENSES([...BOLICENSES, item]);
  }


    /**
     * Обновление и удаление существующей записи
     * @param {*} id 
     * @param {*} data 
     * @returns 
     */
    const handleUpdateBoLicenseUnit = (id, data) => {
     if (!editMode) {
       return;
      }

      if (data.command !== 'create'){
        if (data.deleted){
          data.command = 'delete';
        } else {
          data.command = 'update';
        }
      } else {
        // Попытка удалить новый - удаляет из стека
        if (data.deleted){
          setBOLICENSES(BOLICENSES.filter((item)=>item.id !== id));
          return;
        }
      };
      // изменяет существующий
      setBOLICENSES((prevUnits) => {
        const exists = prevUnits.some((item) => item.id === id);

        if (!exists) {
          return [...prevUnits, data];
        } else {
          return prevUnits?.map((item) => (item.id === id ? data : item));
        }
      });
    };























  return (
    <div className={`${show ? '' : 'sa-orgpage-tab-hidder'}`}>



      <div className={'sa-org-main-collapse sa-org-main-collapse-stack'}>
      <Spin spinning={!itemId || !baseData || loading}>
        {/* ============================= COLLAPSE ITEM ================================ */}

        <div className={`sa-org-main-collapse-item sa-org-collapse-item ${!collapsed_rows.includes('main_row') ? 'sa-collapsed-item' : 'sa-opened-item'}`}
          style={{boxShadow: "rgb(108, 193, 193) -9px 0px 0px -0.5px"}}
        >
          <div className={'sa-org-collpase-header sa-och-top sa-flex-space'}
            onClick={(ev) => {
              if (!ev.target.closest('.sa-click-ignore')){
                ev.preventDefault();
                ev.stopPropagation();
                triggerCollapse('main_row');
              }
            }}
          >
            <div className={"sa-flex"}>
              <div className={'sa-pa-3 sa-lh-chevron'}>
                {!collapsed_rows.includes('main_row') ? (
                  <span className={'sa-pa-3 sa-org-trigger-button'}
                    onClick={() => { triggerCollapse('main_row') }}
                  >
                    <ChevronDownIcon height={TORG_CHEVRON_SIZE} />
                  </span>

                ) : (
                  <span className={'sa-pa-3 sa-org-trigger-button'}
                    onClick={() => { triggerCollapse('main_row') }}
                  >
                    <ChevronUpIcon height={TORG_CHEVRON_SIZE} />
                  </span>
                )}


              </div>
              <div className={'sa-pa-3 sa-org-section-text'}>
                <div className='sa-org-section-label'>
                  Общая информация
                </div>
                
                {itemId && (
                  <div className={'sa-org-row-header-id sa-text-phantom'}>
                    ({itemId})
                  </div>
                )}
    

              </div>
            </div>

          </div>
          <div className={'sa-org-collapse-body'}>
            <MianBigSectionOrg
                data={baseData}
                on_blur={(updatedFields) => {
                  setBLUR_FLAG(dayjs().unix());
                  setBaseData(prev => ({
                    ...prev,
                    ...updatedFields
                  }));
                }}
                on_change={(updatedFields)=>{
                  const newData = JSON.parse(JSON.stringify(baseData));
                  const mergedData = { ...newData, ...updatedFields };
                  props.on_change_main_data(mergedData);
                }}
                edit_mode={editMode}
                selects={selects}
                org_id={itemId}
              />

          </div>
        </div>

        {/* ============================= COLLAPSE ITEM ================================ */}

        <div className={`sa-org-main-collapse-item sa-org-collapse-item ${!collapsed_rows.includes('info_row') ? 'sa-collapsed-item' : 'sa-opened-item'}`}
          style={{boxShadow: "rgb(108, 124, 212) -9px 0px 0px -0.5px"}}
        >
          <div className={'sa-org-collpase-header sa-och-top sa-flex-space'}
            onClick={(ev) => {
              if (!ev.target.closest('.sa-click-ignore')){
                ev.preventDefault();
                ev.stopPropagation();
                triggerCollapse('info_row');
              }
            }}
          >
            <div className={"sa-flex"}>
              <div className={'sa-pa-3 sa-lh-chevron'}>
                {!collapsed_rows.includes('info_row') ? (
                  <span className={'sa-pa-3 sa-org-trigger-button'}
                    onClick={() => { triggerCollapse('info_row') }}
                  >
                    <ChevronDownIcon height={TORG_CHEVRON_SIZE} />
                  </span>

                ) : (
                  <span className={'sa-pa-3 sa-org-trigger-button'}
                    onClick={() => { triggerCollapse('info_row') }}
                  >
                    <ChevronUpIcon height={TORG_CHEVRON_SIZE} />
                  </span>
                )}


              </div>
              <div className={'sa-pa-3 sa-org-section-text'}>
                <div className='sa-org-section-label'>
                  Информация отдела
                </div>
                
                {itemId && (
                  <div className={'sa-org-row-header-id sa-text-phantom'}>
                    ({itemId})
                  </div>
                )}
    

              </div>
            </div>

          </div>
          <div className={'sa-org-collapse-body'}>
                <InfoBigSectionOrg
                  data={baseData}
                  on_blur={(updatedFields) => {
                    setBLUR_FLAG(dayjs().unix());
                    setBaseData(prev => ({
                      ...prev,
                      ...updatedFields
                    }));
                  }}
                  // Для отпрпавки по кейдауну прямо в коллектор
                  on_change={(updatedFields)=>{
                    const newData = JSON.parse(JSON.stringify(baseData));
                    const mergedData = { ...newData, ...updatedFields };
                    props.on_change_main_data(mergedData);
                  }}
                  edit_mode={editMode}
                  selects={selects}
                  author={author}
                  curator={curator}
                  org_id={itemId}
                />
          </div>
        </div>

        {/* ============================= COLLAPSE ITEM ================================ */}

        <div className={`sa-org-main-collapse-item sa-org-collapse-item ${!collapsed_rows.includes('contactinfo_row') ? 'sa-collapsed-item' : 'sa-opened-item'}`}
          style={{boxShadow: "rgb(143, 95, 187) -9px 0px 0px -0.5px"}}
        >
          <div className={'sa-org-collpase-header sa-och-top sa-flex-space'}
            onClick={(ev) => {
              if (!ev.target.closest('.sa-click-ignore')){
                ev.preventDefault();
                ev.stopPropagation();
                triggerCollapse('contactinfo_row');
              }
            }}
          >
            <div className={"sa-flex"}>
              <div className={'sa-pa-3 sa-lh-chevron'}>
                {!collapsed_rows.includes('contactinfo_row') ? (
                  <span className={'sa-pa-3 sa-org-trigger-button'}
                    onClick={() => { triggerCollapse('contactinfo_row') }}
                  >
                    <ChevronDownIcon height={TORG_CHEVRON_SIZE} />
                  </span>

                ) : (
                  <span className={'sa-pa-3 sa-org-trigger-button'}
                    onClick={() => { triggerCollapse('contactinfo_row') }}
                  >
                    <ChevronUpIcon height={TORG_CHEVRON_SIZE} />
                  </span>
                )}


              </div>
              <div className={'sa-pa-3 sa-org-section-text'}>
                <div className='sa-org-section-label'>
                  Контактная информация
                </div>
                
                {itemId && (
                  <div className={'sa-org-row-header-id sa-text-phantom'}>
                    ({itemId})
                  </div>
                )}
    

              </div>
            </div>

          </div>
          <div className={'sa-org-collapse-body'}>
        <div className={'sa-org-collapse-content'}>
          <div>

             <TorgPageSectionRow
              
              edit_mode={editMode}
              inputs={[
              {
                edit_mode: editMode,
                label: 'Город',
                input:
                  <Select
                    showSearch
                    filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                }
                    key={'oaddress1_' + baseData?.id}
                    value={parseInt(baseData?.id8org_towns)}
                    onChange={(value)=>{ 
                      // Подстановка региона по городу
                        setBLUR_FLAG(dayjs().unix());
                       setBaseData(prev => ({
                          ...prev,
                          id8org_towns: value
                        }));

                        let ttown = selects?.towns.find((item)=> item.value === value);
                        if (ttown){
                          if (ttown.id_region !== form_id8org_regions){
                            // setFormId8org_regions(ttown.id_region);
                             setBaseData(prev => ({
                            ...prev,
                            id8org_regions: ttown.id_region
                          }));
                          }
                        }
                      }
                    }
                    // placeholder="Controlled autosize"
                    disabled={!editMode}
                    variant="borderless"
                    required={true}
                    options={selects?.towns ? selects?.towns.map((item)=>({
                      key: "twnitm_" + item.value,
                      value: parseInt(item.value),
                      label: item.name
                    })) : ([])}
                  />,
                  required: true,
                  value: form_id8org_towns
              },
                {
                edit_mode: editMode,
                label: 'Регион',
                input:
                  
                  <Select
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                    }
                    options={selects?.regions.map((item)=>({
                      key: "regitm_" + item.value,
                      value: parseInt(item.value),
                      label: item.name
                    }))}
                    disabled={!editMode}
                    key={'oaddress2_' + baseData?.id}
                    value={parseInt(baseData?.id8org_regions)}
                    type={'address'}
                    onChange={(value)=>{
                      setBLUR_FLAG(dayjs().unix());
                      setBaseData(prev => ({
                      ...prev,
                      id8org_regions: value
                    }));
                    }}
                    // placeholder="Controlled autosize"
     
                    variant="borderless"
                    maxLength={2500}
                    required={false}
                  />,
                  required: false,
                  value: form_id8org_regions
              },
            ]}
           action={
            <div></div>
           }
           
          />
          <div>
            {ORGLEGADDRESSES.map((item)=>(
              <OrgLegalAddressMicroSectionTorg
                key={'orlega_' + item.id + itemId}
                allow_delete={true}
                data={item}
                org_id={itemId}
                edit_mode={editMode}
                on_change={handleUpdateLegalUnit}
                on_collect={(payload)=>{props.on_change_legal_address(payload)}}
              />
            ))}
          </div>

          <div>
            {ORGADDRESSES.map((item)=>(
              <OrgAddressMicroSectionTorg
                key={'oraada_' + item.id + itemId}
                allow_delete={true}
                data={item}
                org_id={itemId}
                edit_mode={editMode}
                on_change={handleUpdateAddressUnit}
                on_collect={(payload)=>{props.on_change_address(payload)}}
              />
            ))}
          </div>

          <div>
            {ORGPHONES.map((item)=>(
              <OrgPhoneMicroSectionTorg
                key={'orgphona_' + item.id + itemId}
                allow_delete={true}
                data={item}
                org_id={itemId}
                edit_mode={editMode}
                on_change={handleUpdatePhoneUnit}
                on_collect={(payload)=>{props.on_change_phone(payload)}}
              />
            ))}
          </div>

          <div>
            {ORGEMAILS.map((item)=>(
              <OrgEmailMicroSectionTorg
                key={'orgema_' + item.id + itemId}
                allow_delete={true}
                data={item}
                org_id={itemId}
                edit_mode={editMode}
                on_change={handleUpdateEmailUnit}
                on_collect={(payload)=>{props.on_change_email(payload)}}
              />
            ))}
          </div>

          <div>
             <SiteBigSectionOrg
              data={baseData}
              on_blur={(value)=>{
                setBLUR_FLAG(dayjs().unix());
                setBaseData(prev => ({
                ...prev,
                site: value?.trim()
              }));
              }}
              on_change={(updatedFields)=>{
                const newData = JSON.parse(JSON.stringify(baseData));
                const mergedData = { ...newData, ...updatedFields };
                props.on_change_main_data(mergedData);
              }}
              edit_mode={editMode}
              org_id={itemId}
              />
          </div>

          {editMode && (
          <div className={'sk-omt-stack-control sa-flex-space'}>
          <div></div>
          <div>
            <div className={'sa-org-contactstack-addrow'}>
              Добавить
              <div>


                <Button
                  title='Добавить адрес'
                  size='small'
                  color="primary"
                  variant="outlined"
                  icon={<BuildingOfficeIcon height={'20px'}/>}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    handleAddAddress();
                  }}
                  >Адрес</Button>
                  {ORGLEGADDRESSES.length + ORGLEGADDRESSES < 1 && (
                    <Button
                    title='Добавить юр. адрес'
                    size='small'
                    icon={<BuildingLibraryIcon height={'20px'}/>}
                    color="primary"
                    variant="outlined"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      handleAddLegalad();
                    }}
                    >Юр. Адрес</Button>
                  )}

                <Button
                  title='Добавить контактный телефон'
                  size='small'
                  color="primary"
                  variant="outlined"
                  icon={<PhoneIcon height={'20px'}/>}
                  onClick={(ev) => {
                    console.log('ALOHA');
                    handleAddPhone();
                  }}
                  >Телефон</Button>
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

                  </div>
              </div>
          </div>
        </div>
      )}



        </div>
          </div>
          </div>
        </div>

        {/* ============================= COLLAPSE ITEM ================================ */}

        <div className={`sa-org-main-collapse-item sa-org-collapse-item ${collapsed_rows.includes('licenses_row') ? 'sa-collapsed-item' : 'sa-opened-item'}`}
          style={{boxShadow: "rgb(247, 171, 73) -9px 0px 0px -0.5px"}}
        >
          <div className={'sa-org-collpase-header sa-och-top sa-flex-space'}
            onClick={(ev) => {
              if (!ev.target.closest('.sa-click-ignore')){
                ev.preventDefault();
                ev.stopPropagation();
                triggerCollapse('licenses_row');
              }
            }}
          >
            <div className={"sa-flex"}>
              <div className={'sa-pa-3 sa-lh-chevron'}>
                {collapsed_rows.includes('licenses_row') ? (
                  <span className={'sa-pa-3 sa-org-trigger-button'}
                    onClick={() => { triggerCollapse('licenses_row') }}
                  >
                    <ChevronDownIcon height={TORG_CHEVRON_SIZE} />
                  </span>

                ) : (
                  <span className={'sa-pa-3 sa-org-trigger-button'}
                    onClick={() => { triggerCollapse('licenses_row') }}
                  >
                    <ChevronUpIcon height={TORG_CHEVRON_SIZE} />
                  </span>
                )}


              </div>
              <div className={'sa-pa-3 sa-org-section-text'}>
                <div className='sa-org-section-label'>
                  Лицензии/Допуски
                </div>
                
                <Badge
                  count={ANLICENSES?.length + ANTOLERANCES?.length + BOLICENSES?.length || 0}
                  color="blue"
                />
    

              </div>
            </div>

            <div className={'sa-org-collapse-buttons sa-flex-gap'}> 
              {editMode && (
                <Button
                  size="small"
                  color="primary"
                  variant="outlined"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    handleAddBoLicense(1);
                  }}
                  icon={<PlusCircleOutlined />}
                >
                  Добавить Лицензию
                </Button>
              )}
              {editMode && (
                <Button
                  size="small"
                  color="primary"
                  variant="outlined"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    handleAddBoLicense(2);
                  }}
                  icon={<PlusCircleOutlined />}
                >
                  Добавить Допуск
                </Button>
              )}
            </div>

          </div>
          <div className={'sa-org-collapse-body'}>
          <div className={'sa-org-collapse-content'}>
            <div className={'sa-org-contactstack-box'}>
          {(ANLICENSES.length > 0 ||
            ANTOLERANCES.length > 0 ||
            BOLICENSES.length > 0) ? (
              <div className='sa-org-contactstack-box'>
                <div className={'sa-tolerance-old-v'}>
                  {ANLICENSES.map((item)=>(
                  <AnLicenseMicroSectionTorg
                    key={'anlicensee_' + item.id + itemId}
                    data={item}
                    edit_mode={editMode}
                    on_change={handleUpdateAnLicenseUnit}
                    selects={selects}
                    id_orgs={itemId}
                    collapse={true}
                    allow_delete={true}
                    doc_type={1}
                    on_collect={(payload)=>{props.on_change_an_license(payload)}}
                    />
                ))}
                  {ANTOLERANCES.map((item)=>(
                  <AnLicenseMicroSectionTorg
                    key={'antolerancee_' + item.id + itemId}
                    data={item}
                    edit_mode={editMode}
                    on_change={handleUpdateAnToleranceUnit}
                    selects={selects}
                    id_orgs={itemId}
                    collapse={true}
                    allow_delete={true}
                    doc_type={2}
                    on_collect={(payload)=>{props.on_change_an_tolerance(payload)}}
                    />
                ))}
                </div>
                <div>
                {BOLICENSES.map((item)=>(
                  <BoLicenseMicroSectionTorg
                    key={'bolicensee_' + item.id + itemId}
                    data={item}
                    edit_mode={editMode}
                    on_change={handleUpdateBoLicenseUnit}
                    selects={selects}
                    id_orgs={itemId}
                    collapse={true}
                    allow_delete={true}
                    on_collect={(payload)=>{props.on_change_bo_license(payload)}}
                    />
                ))}
                </div>
              </div>
            ) : (<Empty />)}
          </div>
          </div>
          </div>
        </div>

        {/* ============================= COLLAPSE ITEM ================================ */}

        <div className={`sa-org-main-collapse-item sa-org-collapse-item ${!collapsed_rows.includes('contacts_row') ? 'sa-collapsed-item' : 'sa-opened-item'}`}
          style={{boxShadow: "rgb(202, 111, 126) -9px 0px 0px -0.5px"}}
        >
          <div className={'sa-org-collpase-header sa-och-top sa-flex-space'}
            onClick={(ev) => {
              if (!ev.target.closest('.sa-click-ignore')){
                ev.preventDefault();
                ev.stopPropagation();
                triggerCollapse('contacts_row');
              }
            }}
          >
            <div className={"sa-flex"}>
              <div className={'sa-pa-3 sa-lh-chevron'}>
                {!collapsed_rows.includes('contacts_row') ? (
                  <span className={'sa-pa-3 sa-org-trigger-button'}
                    onClick={() => { triggerCollapse('contacts_row') }}
                  >
                    <ChevronDownIcon height={TORG_CHEVRON_SIZE} />
                  </span>

                ) : (
                  <span className={'sa-pa-3 sa-org-trigger-button'}
                    onClick={() => { triggerCollapse('contacts_row') }}
                  >
                    <ChevronUpIcon height={TORG_CHEVRON_SIZE} />
                  </span>
                )}


              </div>
              <div className={'sa-pa-3 sa-org-section-text'}>
                <div className='sa-org-section-label'>
                  Контактные лица
                </div>
                
                <Badge
                  count={CONTACTS?.length}
                  color="blue"
                />
    

              </div>
            </div>

            <div className='sa-org-collapse-buttons'>
              {editMode && (
                <Button
                  size="small"
                  color="primary"
                  variant="outlined"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    handleAddContact();
                  }}
                  icon={<PlusCircleOutlined />}
                >
                  Добавить контакт
                </Button>
              )}
            </div>

          </div>
          <div className={'sa-org-collapse-body'}>
        <div className={'sa-org-collapse-content'}>
          <div className='sa-org-contactstack-box'>
          {CONTACTS.length > 0 ? (
            <div>
                {CONTACTS.map((item)=>(
                  <ContactMainSectionTorg
                    key={'contactsectionrow_' + item.id}
                    data={item}
                    edit_mode={editMode}
                    on_change={handleUpdateContacts}
                    selects={selects}
                    id_orgs={itemId}
                    collapse={true}
                    allow_delete={true}
                    on_collect={(payload)=>{props.on_change_contact(payload)}}
                    />

                ))}
              </div>

          ) : (<Empty />)}

        </div>
          </div>
          </div>
        </div>

        {/* ============================= COLLAPSE ITEM ================================ */}

        <div className={`sa-org-main-collapse-item sa-org-collapse-item ${collapsed_rows.includes('requisites_row') ? 'sa-collapsed-item' : 'sa-opened-item'}`}
          style={{boxShadow: "rgb(135, 193, 108) -9px 0px 0px -0.5px"}}
        >
          <div className={'sa-org-collpase-header sa-och-top sa-flex-space'}
            onClick={(ev) => {
              if (!ev.target.closest('.sa-click-ignore')){
                ev.preventDefault();
                ev.stopPropagation();
                triggerCollapse('requisites_row');
              }
            }}
          >
            <div className={"sa-flex"}>
              <div className={'sa-pa-3 sa-lh-chevron'}>
                {collapsed_rows.includes('requisites_row') ? (
                  <span className={'sa-pa-3 sa-org-trigger-button'}
                    onClick={() => { triggerCollapse('requisites_row') }}
                  >
                    <ChevronDownIcon height={TORG_CHEVRON_SIZE} />
                  </span>

                ) : (
                  <span className={'sa-pa-3 sa-org-trigger-button'}
                    onClick={() => { triggerCollapse('requisites_row') }}
                  >
                    <ChevronUpIcon height={TORG_CHEVRON_SIZE} />
                  </span>
                )}


              </div>
              <div className={'sa-pa-3 sa-org-section-text'}>
                <div className='sa-org-section-label'>
                  Фирмы/плательщики
                </div>
                
                <Badge
                  count={REQUISITES?.length}
                  color="blue"
                />
    

              </div>
            </div>

        <div className='sa-org-collapse-buttons'>
          {editMode && (
            <Button
              size="small"
              color="primary"
              variant="outlined"
              onClick={(ev) => {
                ev.stopPropagation();
                handleAddRequisite();
                // setTimeout(() => {
                //   setCallToAddRequisite(null);
                // }, 300);
              }}
              icon={<PlusCircleOutlined />}
            >
              Добавить плательщика
            </Button>
          )}
        </div>
            

          </div>
          <div className={'sa-org-collapse-body'}>
        <div className={'sa-org-collapse-content'}>
            <div className='sa-org-contactstack-box'>
          {REQUISITES.length > 0 ? (
            <div>
                {REQUISITES.map((item)=>(
                  <RequisiteMicroSectionTorg
                    key={'requisitsectionrow_' + item.id}
                    data={item}
                    edit_mode={editMode}
                    on_change={handleUpdateRuquisiteUnit}
                    selects={selects}
                    id_orgs={itemId}
                    collapse={true}
                    allow_delete={true}
                    on_collect={(payload)=>{props.on_change_requisite(payload)}}
                    />

                ))}
              </div>

          ) : (<Empty />)}
        </div>
          </div>
          </div>
        </div>

    {/* ============================= COLLAPSE ITEM ================================ */}

      <div style={{height: '40vh'}}
      ></div>
      </Spin>
      </div>



    </div>
  );
};

export default TabMainTorg;
