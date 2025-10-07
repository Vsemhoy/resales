import React, { useEffect, useState } from 'react';

import { Badge, Button, Collapse, Empty } from 'antd';
import {
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
  const [baseData, setBaseData] = useState([]);
	const [editedContactIds, setEditedContactIds] = useState([]);

  const [dataModified, setDataModified] = useState(false);

  const [callToAddRequisite, setCallToAddRequisite] = useState(null);
  const [callToAddLicense, setCallToAddLicense] = useState(null);
  const [callToAddTolerance, setCallToAddTolerance] = useState(null);



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
    setBaseData(props.base_data);
  }, [props.base_data]);

  useEffect(() => {
    setItemId(props.item_id);
  }, [props.item_id]);

  useEffect(() => {
    let contics = [];
    // setOriginalData(JSON.parse(JSON.stringify(props.base_data)));
    if (baseData?.contacts) {
      contics = baseData.contacts.map((item) => ({
        key: "controw_org_" + item.id,
        classNames: 'super',
        style: {
          outline: item.deleted ? '2px solid #ff0000a2' : (
            item.command === 'create' ? '2px solid #2196f3' : '0px'
          ), marginBottom: item.deleted ? '3px ' : (
            item.command === 'create' ? '3px' : '0px'
          )
        },

        label: <div className={`sa-flex-space ${item.deleted ? 'sa-orgrow-deleted' : ''}`}>
          <div>{item.middlename ? item.middlename : ""}{item.name ? " " + item.name : ''}{item.lastname ? " " + item.lastname : ""} <span style={{ color: 'gray', fontWeight: 100 }}>({item.id})</span></div>
          {editMode && (
            <div className={'sa-flex-gap'}>

              <div className={'sa-org-contactstack-delrow'}>

                {editMode && (
                  <Button
                    size="small"
                    color="default"
                    variant="filled"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      handleAddContact();
                    }}
                    icon={<PlusCircleOutlined />}
                  >
                    Звонок
                  </Button>
                )}

                <Button
                  title='Удалить контакт'
                  size='small'
                  color="danger"
                  variant="outlined"
                  icon={<TrashIcon height={'20px'} />}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    handleDeleteContact(item.id);
                  }}
                />
              </div>
            </div>)}

        </div>,
        children: <div className={`${item.deleted ? 'ant-collapse-content-box-deleted' : ''}`}>
          <OrgPage_MainTab_Contacts_Section
            color={item.deleted ? '#e50000' : '#f39821ff'}
            edit_mode={editMode}
            data={item}
            on_change={handleUpdateContactData}
            selects={selects}
          /> </div>
      }))
    }
    setStructureContacts(contics);
  }, [show, editMode, baseData?.contacts]);



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
        children: <OrgPage_MainTab_Contactinfo_Section
          color={'#799119ff'}
          edit_mode={editMode}
          data={baseData}
          selects={selects}
          // on_blur={(ee)=>(console.log("BLUUUUUUUUUUURRRRRRR", ee))}
          // on_blur={props.on_change_main_data_part} // Изменение строк
          on_blur={updateCompanyData} // Изменение строк
          on_change={updateCompanyObject} // Изменение объектов
          // on_change={(ee)=>(console.log("CCHHHHHHHHHHHHHHHAAAAAAAAAAA", ee))} // Изменение объектов
          item_id={itemId}
        />
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
            count={baseData?.contacts?.length}
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
          {structureContacts.length > 0 ? (
            <Collapse
              defaultActiveKey={['mainorgsec_11', 'mainorgsec_12', 'mainorgsec_14']}
              // activeKey={modalSectionsOpened}
              size={"small"}
              // onChange={handleSectionChange}
              // onMouseDown={handleSectionClick}
              items={structureContacts}
            />

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
  }, [show, editMode, selects, callToAddRequisite, callToAddRequisite, callToAddLicense, callToAddTolerance, structureContacts, itemId]);
  // },[show, editMode, structureContacts, selects, callToAddRequisite, callToAddRequisite, callToAddLicense, callToAddTolerance]);





  const handleAddContact = () => {
    let newContact = {
      id: 'new_' + dayjs().unix() + '_' + baseData.contacts.length,
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
    let ndt = JSON.parse(JSON.stringify(baseData));
    let newContacts = [newContact, ...ndt.contacts];
    ndt.contacts = newContacts;
    setBaseData(ndt);
  }

  useEffect(() => {
    console.log('BASE DATA MODIFIED');

    console.log(baseData);
  }, [baseData]);

  const handleDeleteContact = (id) => {
    let contacts = baseData.contacts;
    let ordata = contacts.find((item) => item.id === id);

    if (ordata) {
      ordata.deleted = !ordata.deleted;
      if (ordata.deleted === true) {
        ordata.command = 'delete';
      } else {
        if (ordata.command === 'delete') {
          ordata.command = 'update';
        }
      }

      let ndt = JSON.parse(JSON.stringify(baseData)); // В ином случае не вызовется коллбэк
      let newContacts = [];
      if (ordata.id && String(ordata.id).startsWith('new')) {
        newContacts = contacts.filter((item) => item.id !== id);
      } else {
        newContacts = contacts.map((item) => (item.id === id ? ordata : item));
        if (!editedContactIds?.includes(id)) {
          setEditedContactIds([...editedContactIds, id]);
        }
      };

      ndt.contacts = newContacts;
      setBaseData(ndt);
    }
  }




  const handleUpdateContactData = (id, updata) => {
    let contacts = baseData.contacts;
    // let ordata = contacts.find((item)=> item.id === id);
    console.log('id, updata', id, updata)
    if (updata.command && updata.command === 'create') {

    } else {
      updata.command = 'update';
    };
    if (!editedContactIds?.includes(id)) {
      setEditedContactIds([...editedContactIds, id]);
    }

    // baseData.contacts = baseData.contacts.map((item) => (item.id === id ? updata : item));
    // setBaseData(baseData);

    setBaseData(prev => ({
      ...prev,
      contacts: prev.contacts.map(item => item.id === id ? updata : item)
    }));

  }



  useEffect(() => {
    console.log('DATA UPDATED');
    if (props.on_change_data){
      console.log(baseData);
      props.on_change_data('main', baseData);
    };
  }, [baseData]);

  // useEffect(() => {
  //   if (props.on_change_data) {
  //     console.log('CALL TO CHANGE BASEDATA ON 1 LEVEL', baseData);
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
