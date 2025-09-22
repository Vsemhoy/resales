import React, { useEffect, useState } from 'react';
import OrgPageMainTabCommonSection from '../components/sections/MainTabSections/OrgPageMainTabCommonSection';
import OrgPageMainTabDepartSection from '../components/sections/MainTabSections/OrgPageMainTabDepartSection';
import OrgPageMainTabContactsSection from '../components/sections/MainTabSections/OrgPageMainTabContactsSection';
import OrgPageMainTabContactinfoSection from '../components/sections/MainTabSections/OrgPageMainTabContactinfoSection';
import OrgPageMainTabPayersSection from '../components/sections/MainTabSections/OrgPageMainTabPayersSection';
import { Button, Collapse } from 'antd';
import { CameraIcon, DevicePhoneMobileIcon, EnvelopeIcon, PaperAirplaneIcon, PhoneIcon, TrashIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import { forIn } from 'lodash';
import OrgPageMainTabToleranceSection from '../components/sections/MainTabSections/OrgPageMainTabToleranceSection';

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

  const [selects, setSelects] = useState(null);

  const [dataModified, setDataModified] = useState(false);

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
    console.log('props.selects 2', props.selects)
    setSelects(props.selects);
  }, [props.selects]);

  useEffect(() => {
    console.log('props.base_data', props.base_data)
    let contics = [];
    setOriginalData(JSON.parse(JSON.stringify(props.base_data)));
    if (baseData?.contacts){
      contics = baseData.contacts.map((item)=>({
        key: "controw_org_" + item.id,
        classNames : 'super',
        style: {border: item.deleted ? '2px solid #ff0000a2' : (
          item.command === 'create' ? '2px solid #2196f3' : '0px'
        ) , marginBottom: item.deleted ? '1px ' : (
          item.command === 'create' ? '2px' : '0px'
        )},
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
        children: <div className={`${item.deleted ? 'ant-collapse-content-box-deleted' : ''}`}> 
        <OrgPageMainTabContactsSection
            color={item.deleted ? '#e50000' : '#f39821ff' }
            edit_mode={editMode}
            data={item}
            on_change={handleUpdateContactData}
          /> </div>
      }))
    }
    setStructureContacts(contics);
    console.log('baseData CALLBACK')
  }, [show, editMode, baseData]);


  // const updateCompanyData = (changed_data) => {
  //   console.log('UCD', changed_data);
  //   for (let key in changed_data) {
  //       if (changed_data.hasOwnProperty(key)) {
  //         if (baseData.hasOwnProperty(key)){

  //           console.log(key, changed_data[key]); // Example of accessing key and value
  //         }
  //           // Perform operations with key or value
  //       }
  //   }
  // }

  const updateCompanyData = (changed_data) => {

    setBaseData(prevData => {
      const updatedData = { ...prevData };
      
      for (let key in changed_data) {
        if (changed_data.hasOwnProperty(key) && prevData.hasOwnProperty(key)) {
          updatedData[key] = changed_data[key];
          setDataModified(true);
        }
      }
      console.log('updatedData', updatedData)
      return updatedData;
    });
  };

  useEffect(() => {
    if (!show){ return; }
    let secids = [
      {
        key: 'mainorgsec_11',
        label: <div className={`sa-flex-space`}><div>Общая информация</div><div></div></div>,
        children: <OrgPageMainTabCommonSection
          color={'#2196f3'}
          edit_mode={editMode}
          data={baseData}
          selects={selects}
          on_blur={updateCompanyData}
          />
      },
      {
        key: 'mainorgsec_12',
        label: <div className={`sa-flex-space`}><div>Информация отдела</div><div></div></div>,
        children: <OrgPageMainTabDepartSection
          color={'blueviolet'}
          edit_mode={editMode}
          data={baseData}
          selects={selects}
          on_blur={updateCompanyData}
          />
      },
      {
        key: 'mainorgsec_13',
        label: <div className={`sa-flex-space`}><div>Контактная информация</div><div></div>
       
        </div>,
        children: <OrgPageMainTabContactinfoSection
          color={'#799119ff'}
          edit_mode={editMode} 
          data={baseData}
          selects={selects}
          on_blur={updateCompanyData}
          />
      },
      {
        key: 'mainorgsec_131',
        label: <div className={`sa-flex-space`}><div>Лицензии/Допуски</div><div></div>

        </div>,
        children: <OrgPageMainTabToleranceSection
          color={'#30c97aff'}
          edit_mode={editMode} 
          data={baseData}
          selects={selects}
          on_blur={updateCompanyData}
          />
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
          edit_mode={editMode} 
          data={baseData}
          selects={selects}
          />
      },
    ];

    setStructureItems(secids);
  },[show, editMode, structureContacts, selects]);





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
      contactstelephones: [],
      contactmobiles:     [],
      contacthomephones:  [],
      contactemails:      [],
      contactmessangers:  [],
      command: 'create',
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
        if (!editedContactIds?.includes(id)) {
          setEditedContactIds([...editedContactIds, id]);
        }
      };
      
      ndt.contacts = newContacts;
      setBaseData(ndt);
      console.log('ndt', ndt)
    }
  }

  const handleUpdateContactData = (id, updata) => {
    console.log('ON CHANGE', id, updata)
    let contacts = baseData.contacts;
    // let ordata = contacts.find((item)=> item.id === id);

    if (updata.command && updata.command === 'create'){

    } else {
      updata.command = 'update';
    };
    if (!editedContactIds?.includes(id)) {
      setEditedContactIds([...editedContactIds, id]);
    }

    let ndt = JSON.parse(JSON.stringify(baseData)); // В ином случае не вызовется коллбэк
    let newContacts = [];
    newContacts = contacts.map((item) => (item.id === id ? updata : item));

    ndt.contacts = newContacts;
    setBaseData(ndt);
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
