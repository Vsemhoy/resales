import React, { useEffect, useState } from 'react';
import OrgPageMainTabCommonSection from '../components/sections/MainTabSections/OrgPageMainTabCommonSection';
import OrgPageMainTabDepartSection from '../components/sections/MainTabSections/OrgPageMainTabDepartSection';
import OrgPageMainTabContactsSection from '../components/sections/MainTabSections/OrgPageMainTabContactsSection';
import OrgPageMainTabContactinfoSection from '../components/sections/MainTabSections/OrgPageMainTabContactinfoSection';
import OrgPageMainTabPayersSection from '../components/sections/MainTabSections/OrgPageMainTabPayersSection';
import { Button, Collapse } from 'antd';
import { CameraIcon, DevicePhoneMobileIcon, EnvelopeIcon, PaperAirplaneIcon, PhoneIcon, TrashIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';

// import { useNavigate, useSearchParams } from 'react-router-dom';

const MainTabPage = (props) => {
	const [editMode, seteditMode] = useState(props.edit_mode ? props.edit_mode : false);
	const [show, setShow] = useState(false);

  const [loading, setLoading] = useState(false);

  const [newLoading, setNewLoading] = useState(false);

  // Структурированные в коллапсы юниты
  const [structureItems, setStructureItems] = useState([]);
  const [structureContacts, setStructureContacts] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [baseData, setBaseData] = useState([]);

  // Новые юниты
  const [temporaryUnits, setTemporaryUnits] = useState([]);
  const [newStructureItems, setNewStructureItems] = useState([]);

  const [editedItemsIds, setEditedItemsIds] = useState([]);
  const [openedNewSections, setOpenedNewSections] = useState([]);

  const [editedContactIds, setEditedContactIds] = useState([]);


	useEffect(() => {
		setShow(props.show);
	}, [props.show]);

	useEffect(() => {
		seteditMode(props.edit_mode);
	}, [props.edit_mode]);

  useEffect(() => {
		setBaseData(props.base_data);
	}, [props.base_data]);


  useEffect(() => {
    console.log('props.base_data', props.base_data)
    let contics = [];
    setOriginalData(JSON.parse(JSON.stringify(props.base_data)));
    if (baseData?.contacts){
      contics = baseData.contacts.map((item)=>({
        key: "controw_org_" + item.id,
        label: <div className={`sa-flex-space ${item.deleted ? 'sa-orgrow-deleted' : ''}`}><div>{item.lastname} {item.name} {item.middlename} <span style={{color: 'gray', fontWeight: 100}}>({item.id})</span></div>
        {editMode && (
        <div className={'sa-flex-gap'}>

            <div className={'sa-org-contactstack-delrow'}>
          <Button
            title='Удалить контакт'
            size='small'
            color="danger"
            variant="outlined"
            icon={<TrashIcon height={'20px'}/>}
            onClick={(ev) => {
              ev.stopPropagation();
              handleDeleteContact(item.id);
            }}
            />
            </div>
        </div>)}
        
        </div>,
        children: <div className={`${item.deleted ? 'ant-collapse-content-box-deleted' : ''}`}> <OrgPageMainTabContactsSection
            color={item.deleted ? '#e50000' : '#f39821ff' }
            edit_mode={editMode}
            data={item}
          /> </div>
      }))
    }
    setStructureContacts(contics);
    console.log('baseData CALLBACK')
  }, [show, editMode, baseData]);




  useEffect(() => {
    if (!show){ return; }
    let secids = [
      {
        key: 'mainorgsec_11',
        label: <div className={`sa-flex-space`}><div>Общая информация</div><div></div></div>,
        children: <OrgPageMainTabCommonSection
          color={'#2196f3'}
          edit_mode={editMode} />
      },
      {
        key: 'mainorgsec_12',
        label: <div className={`sa-flex-space`}><div>Контактная информация</div><div></div></div>,
        children: <OrgPageMainTabDepartSection
          color={'blueviolet'}
          edit_mode={editMode} />
      },
      {
        key: 'mainorgsec_13',
        label: <div className={`sa-flex-space`}><div>Лицензии/Допуски</div><div></div>
        {editMode && (
           <Button
              size="small"
              color="primary"
              variant="outlined"
              // onClick={(ev) => {
              //   ev.stopPropagation();
              //   handleDeleteRealUnit(item.id, 1);
              // }}
            >
              Добавить лдопуск
            </Button>
        )}
        </div>,
        children: <OrgPageMainTabContactinfoSection
          color={'#30c97aff'}
          edit_mode={editMode} />
      },
      {
        key: 'mainorgsec_14',
        label: <div className={`sa-flex-space`}><div>Контактные лица</div><div></div>
        {editMode && (
           <Button
              size="small"
              color="primary"
              variant="outlined"
              onClick={(ev) => {
                ev.stopPropagation();
                handleAddContact();
              }}
            >
              Добавить контакт
            </Button>
        )}
        </div>,
        children: <div className='sa-org-contactstack-box'>
          <Collapse
          defaultActiveKey={['mainorgsec_11', 'mainorgsec_12', 'mainorgsec_14']}
          // activeKey={modalSectionsOpened}
          size={"small"}
          // onChange={handleSectionChange}
          // onMouseDown={handleSectionClick}
          items={structureContacts}
        />
          
        </div> 
      },
      {
        key: 'mainorgsec_15',
        label: <div className={`sa-flex-space`}><div>Фирмы/плательщики</div><div></div>
        {editMode && (
           <Button
              size="small"
              color="primary"
              variant="outlined"
              // onClick={(ev) => {
              //   ev.stopPropagation();
              //   handleDeleteRealUnit(item.id, 1);
              // }}
            >
              Добавить плательщика
            </Button>
        )}
        </div>,
        children: <OrgPageMainTabPayersSection
          color={'#f0f321ff'}
          edit_mode={editMode} />
      },
    ];

    setStructureItems(secids);
  },[show, editMode, structureContacts]);





  const handleAddContact = () => {
    let newContact = {
      id: 'new_' + dayjs().unix() + '_' + baseData.contacts.length ,
			id_orgs: baseData.id,
			occupy: '',
			lastname: '',
			name: '',
			middlename:   '',
			comment:      '',
      deleted:      0,
      job:          1,
			exittoorg_id: 0,
      unsubscribe:  0,
      command: 'create',
      contactstelephones: [],
      contactmobiles:     [],
      contacthomephones:  [],
      contactemails:      [],
      contactmessangers:  [],
    }
    let ndt = JSON.parse(JSON.stringify(baseData));
    let newContacts = [newContact, ...ndt.contacts];
    ndt.contacts = newContacts;
    console.log('ndt', ndt)
    setBaseData(ndt);
  }

  const handleDeleteContact = (id) => {
    console.log('id', id)
    let contacts = baseData.contacts;
    let ordata = contacts.find((item)=> item.id === id);

    if (ordata){
      ordata.deleted = !ordata.deleted;
      if (ordata.deleted === true){
        ordata.command = 'delete';
      } else {
        if (ordata.command === 'delete'){
          ordata.command = 'update';
        }
      }

      let ndt = JSON.parse(JSON.stringify(baseData)); // В ином случае не вызовется коллбэк
      let newContacts = [];
      if (ordata.id &&  String(ordata.id).startsWith('new')){
        newContacts = contacts.filter((item)=> item.id !== id);
      } else {
        newContacts = contacts.map((item) => (item.id === id ? ordata : item));
      };
      
      ndt.contacts = newContacts;
      setBaseData(ndt);
      console.log('ndt', ndt)
    }


    // setContactemails((prevUnits) => {
    //   const exists = prevUnits.some((item) => item.id === id);
    //   if (!exists) {
    //     return [...prevUnits, data];
    //   } else {
    //     return prevUnits.map((item) => (item.id === id ? data : item));
    //   }
    // });
  }


	return (
		<div>
				{/* <div className={'sk-omt-stack'} style={{ borderLeft: '4px solid seagreen' }}>
				</div> */}
    {show && (
			
      <Collapse
          defaultActiveKey={['mainorgsec_11', 'mainorgsec_12', 'mainorgsec_14']}
          // activeKey={modalSectionsOpened}
          size={"small"}
          // onChange={handleSectionChange}
          // onMouseDown={handleSectionClick}
          items={structureItems}
        />
      )}
		</div>
	);
};

export default MainTabPage;
