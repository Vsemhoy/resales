import React, { useEffect, useState } from 'react';

import { Badge, Button, Collapse, Empty } from 'antd';
import {
  BuildingLibraryIcon,
  BuildingOfficeIcon,
	CameraIcon,
	DevicePhoneMobileIcon,
	EnvelopeIcon,
	PaperAirplaneIcon,
	PhoneIcon,
	TrashIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import { forIn } from 'lodash';

import { PlusCircleOutlined } from '@ant-design/icons';
import OrgPage_MainTab_Contacts_Section from '../components/sections/MainTabSections/OrgPage_MainTab_Contacts_Section';
import OrgPage_MainTab_Common_Section from '../components/sections/MainTabSections/OrgPage_MainTab_Common_Section';
import OrgPage_MainTab_Depart_Section from '../components/sections/MainTabSections/OrgPage_MainTab_Depart_Section';
import OrgPage_MainTab_Contactinfo_Section from '../components/sections/MainTabSections/OrgPage_MainTab_Contactinfo_Section';
import OrgPage_MainTab_Tolerance_Section from '../components/sections/MainTabSections/OrgPage_MainTab_Tolerance_Section';
import OrgPage_MainTab_Payers_Section from '../components/sections/MainTabSections/OrgPage_MainTab_Payers_Section';
import { FlushOrgData } from '../components/handlers/OrgPageDataHandler';
import ContactMainSectionTorg from '../../TORG_PAGE/components/sections/ContactMainSectionTorg';
import OrgLegalAddressMicroSectionTorg from '../../TORG_PAGE/components/sections/microsections/orgcontact/OrgLegalAddressMicroSectionTorg';
import OrgEmailMicroSectionTorg from '../../TORG_PAGE/components/sections/microsections/orgcontact/OrgEmailMicroSectionTorg';
import OrgPhoneMicroSectionTorg from '../../TORG_PAGE/components/sections/microsections/orgcontact/OrgPhoneMicroSectionTorg';
import OrgAddressMicroSectionTorg from '../../TORG_PAGE/components/sections/microsections/orgcontact/OrgAddressMicroSectionTorg';

// import { useNavigate, useSearchParams } from 'react-router-dom';

const MainTabPage = (props) => {
  const [editMode, seteditMode] = useState(props.edit_mode ? props.edit_mode : false);
  const [show, setShow] = useState(false);
  const [itemId, setItemId] = useState(props.item_id);

	const [loading, setLoading] = useState(false);

	const [newLoading, setNewLoading] = useState(false);


  // Структурированные в коллапсы юниты
  const [structureItems, setStructureItems] = useState([]);
  const [structureContacts, setStructureContacts] = useState([]);

  const [nostructContacts, setNostructContacts] = useState([]);
  const [baseData, setBaseData] = useState([]);
	const [editedContactIds, setEditedContactIds] = useState([]);

  const [dataModified, setDataModified] = useState(false);

  const [callToAddRequisite, setCallToAddRequisite] = useState(null);
  const [callToAddLicense, setCallToAddLicense] = useState(null);
  const [callToAddTolerance, setCallToAddTolerance] = useState(null);


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
    console.log('CONTACTS', CONTACTS)
  }, [CONTACTS]);

  useEffect(() => {

    setBaseData(props.base_data);
    // console.log('BASE_DATA ++++++++++++++++++++++',props.base_data);
    if (props.base_data?.contacts){
      setCONTACTS(JSON.parse(JSON.stringify(props.base_data?.contacts)));
    } else { setCONTACTS([])};

    if (props.base_data?.active_licenses_bo){
      setBOLICENSES(JSON.parse(JSON.stringify(props.base_data?.active_licenses_bo)));
    } else {setBOLICENSES([])};

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

      if (props.base_data?.active_licenses){
      setANLICENSES(JSON.parse(JSON.stringify(props.base_data?.active_licenses)));
    } else {setANLICENSES([])};

    if (props.base_data?.phones){
      setORGPHONES(JSON.parse(JSON.stringify(props.base_data?.phones)));
    } else {setORGPHONES([])};

    if (props.base_data?.requisites){
      setREQUISITES(JSON.parse(JSON.stringify(props.base_data?.requisites)));
    } else {setREQUISITES([])};

    let bdt = FlushOrgData(props.base_data, [
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
      "contacts"
    ]);

    setBaseData(bdt);
  }, [props.base_data]);

  useEffect(() => {
    setItemId(props.item_id);
  }, [props.item_id]);



  const updateCompanyData = (changed_data) => {
    setBaseData(prevData => {
      const updatedData = { ...prevData };

      for (let key in changed_data) {
        if (changed_data.hasOwnProperty(key) && prevData?.hasOwnProperty(key)) {
          updatedData[key] = changed_data[key];
          setDataModified(true);
        }
      }
      return updatedData;
    });
  };


  const updateCompanyObject = (key, changed_data) => {
    if (props.on_change_main_data_part) {
      props.on_change_main_data_part(key, changed_data);
    }
  };








  useEffect(() => {
    if (!show) { return; }
    let secids = [
      {
        key: 'mainorgsec_11',
        style: { boxShadow: '#6cc1c1ff -9px 0px 0px -0.5px' },
        label: <div className={`sa-flex-space`}><div>Общая информация</div><div></div></div>,
        children: <OrgPage_MainTab_Common_Section
          color={'#2196f3'}
          edit_mode={editMode}
          data={baseData}
          selects={selects}
          on_blur={updateCompanyData}
          item_id={itemId}
        />
      },
      {
        key: 'mainorgsec_12',
        style: { boxShadow: '#6c7cd4ff -9px 0px 0px -0.5px' },
        label: <div className={`sa-flex-space`}><div>Информация отдела</div><div></div></div>,
        children: <OrgPage_MainTab_Depart_Section
          color={'blueviolet'}
          edit_mode={editMode}
          data={baseData}
          selects={selects}
          on_blur={updateCompanyData}
          item_id={itemId}
        />
      },
      {
        key: 'mainorgsec_13',
        style: { boxShadow: '#8f5fbbff -9px 0px 0px -0.5px' },
        label: <div className={`sa-flex-space`}><div>Контактная информация</div><div></div>

        </div>,
        children: <div>
        {/* <OrgPage_MainTab_Contactinfo_Section
          color={'#799119ff'}
          edit_mode={editMode}
          data={baseData}
          selects={selects}
          // on_blur={(ee)=>(// console.log("BLUUUUUUUUUUURRRRRRR", ee))}
          // on_blur={props.on_change_main_data_part} // Изменение строк
          on_blur={updateCompanyData} // Изменение строк
          on_change={updateCompanyObject} // Изменение объектов
          // on_change={(ee)=>(// console.log("CCHHHHHHHHHHHHHHHAAAAAAAAAAA", ee))} // Изменение объектов
          item_id={itemId}
        /> */}
          <div>
            {ORGLEGADDRESSES.map((item)=>(
              <OrgLegalAddressMicroSectionTorg
                key={'orlega_' + item.id + itemId}
                allow_delete={true}
                data={item}
                org_id={itemId}
                edit_mode={editMode}
                on_change={handleUpdateLegalUnit}
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
              />
            ))}
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
      },
      {
        key: 'mainorgsec_131',
        style: { boxShadow: '#f7ab49ff -9px 0px 0px -0.5px' },
        label: <div className={`sa-flex-space`}><div className={`sa-flex`}>Лицензии/Допуски

          <Badge
            count={baseData?.active_licenses_bo?.length ? baseData?.active_licenses_bo?.length + baseData?.active_licenses?.length + baseData?.active_tolerance?.length : 0}
            color="blue"
          />
        </div><div className={'sa-flex-gap'}>
            {editMode && (
              <Button
                size="small"
                color="primary"
                variant="outlined"
                onClick={(ev) => {
                  ev.stopPropagation();
                  setCallToAddLicense(dayjs().unix());
                  setTimeout(() => {
                    setCallToAddLicense(null);
                  }, 300);
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
                  setCallToAddTolerance(dayjs().unix());
                  setTimeout(() => {
                    setCallToAddTolerance(null);
                  }, 300);
                }}
                icon={<PlusCircleOutlined />}
              >
                Добавить Допуск
              </Button>
            )}
          </div>

        </div>,
        children: baseData ? (<OrgPage_MainTab_Tolerance_Section
          color={'#30c97aff'}
          edit_mode={editMode}
          data={baseData}
          selects={selects}
          on_blur={props.on_change_main_data_part}
          on_add_license={callToAddLicense}
          on_add_tolerance={callToAddTolerance}
          item_id={itemId}
        />) : ("")
      },
      {
        key: 'mainorgsec_14',
        style: { boxShadow: '#ca6f7eff -9px 0px 0px -0.5px' },
        label: <div className={`sa-flex-space`}><div className={`sa-flex`}>Контактные лица
          <Badge
            count={CONTACTS?.length}
            color="blue"
          />
        </div><div></div>
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
        </div>,
        children: <div className='sa-org-contactstack-box'>
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
                    />

                ))}
              </div>

          ) : (<Empty />)}

        </div>
      },
      {
        key: 'mainorgsec_15',
        style: { boxShadow: '#87c16cff -9px 0px 0px -0.5px' },
        label: <div className={`sa-flex-space`}><div className={`sa-flex`}>Фирмы/плательщики
          <Badge
            count={baseData?.requisites?.length}
            color="blue"
          />
        </div><div></div>
          {editMode && (
            <Button
              size="small"
              color="primary"
              variant="outlined"
              onClick={(ev) => {
                ev.stopPropagation();
                setCallToAddRequisite(dayjs().unix());
                setTimeout(() => {
                  setCallToAddRequisite(null);
                }, 300);
              }}
              icon={<PlusCircleOutlined />}
            >
              Добавить плательщика
            </Button>
          )}
        </div>,
        children: <OrgPage_MainTab_Payers_Section
          color={'#f0f321ff'}
          edit_mode={editMode}
          data={baseData}
          selects={selects}
          on_add_requisites={callToAddRequisite}
          on_blur={props.on_change_main_data_part}
          item_id={itemId}
        />
      },
    ];

    setStructureItems(secids);
  }, [CONTACTS, ORGLEGADDRESSES, ORGADDRESSES, ORGEMAILS, ORGPHONES,
     show, editMode, selects, callToAddRequisite, callToAddRequisite, callToAddLicense, callToAddTolerance, structureContacts, itemId]);
  // },[show, editMode, structureContacts, selects, callToAddRequisite, callToAddRequisite, callToAddLicense, callToAddTolerance]);






//  ██████  ██████  ███    ██ ████████  █████   ██████ ████████ 
// ██      ██    ██ ████   ██    ██    ██   ██ ██         ██    
// ██      ██    ██ ██ ██  ██    ██    ███████ ██         ██    
// ██      ██    ██ ██  ██ ██    ██    ██   ██ ██         ██    
//  ██████  ██████  ██   ████    ██    ██   ██  ██████    ██    


  const handleUpdateContacts = (e,a,data)=>{
    if (props.on_change_contact){
      props.on_change_contact(e,a,data);
    }
    console.log('data', data)
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
            id: 'new_' + dayjs().unix() + '_' + ORGADDRESSES.length ,
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
      console.log('id,data', id,data)
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
  





  useEffect(() => {
    // console.log('DATA UPDATED');
    if (props.on_change_data){
      // console.log(baseData);
      props.on_change_data('main', baseData);
    };
  }, [baseData]);

  // useEffect(() => {
  //   if (props.on_change_data) {
  //     // console.log('CALL TO CHANGE BASEDATA ON 1 LEVEL', baseData);
  //     props.on_change_data('main', baseData);
  //   }
  // }, [baseData]);




  return (
    <div className={`${show ? '' : 'sa-orgpage-tab-hidder'}`}>
      {/* <div className={'sk-omt-stack'} style={{ borderLeft: '4px solid seagreen' }}>
				</div> */}

      <Collapse
        defaultActiveKey={['mainorgsec_11', 'mainorgsec_12', 'mainorgsec_14']}
        // activeKey={modalSectionsOpened}
        size={"small"}
        // onChange={handleSectionChange}
        // onMouseDown={handleSectionClick}
        items={structureItems}
      />

    </div>
  );
};

export default MainTabPage;
