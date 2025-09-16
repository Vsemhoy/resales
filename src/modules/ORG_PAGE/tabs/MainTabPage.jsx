import React, { useEffect, useState } from 'react';
import OrgPageMainTabCommonSection from '../components/sections/MainTabSections/OrgPageMainTabCommonSection';
import OrgPageMainTabDepartSection from '../components/sections/MainTabSections/OrgPageMainTabDepartSection';
import OrgPageMainTabContactsSection from '../components/sections/MainTabSections/OrgPageMainTabContactsSection';
import OrgPageMainTabContactinfoSection from '../components/sections/MainTabSections/OrgPageMainTabContactinfoSection';
import OrgPageMainTabPayersSection from '../components/sections/MainTabSections/OrgPageMainTabPayersSection';
import { Button, Collapse } from 'antd';
import { CameraIcon, DevicePhoneMobileIcon, EnvelopeIcon, PaperAirplaneIcon, PhoneIcon, TrashIcon } from '@heroicons/react/24/outline';

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
    if (baseData?.contacts){
      contics = baseData.contacts.map((item)=>({
        key: "controw_org_" + item.id,
        label: <div className={`sa-flex-space`}><div>{item.lastname} {item.name} {item.middlename} <span style={{color: 'gray', fontWeight: 100}}>({item.id})</span></div>
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
            }}
            />
            </div>
        </div>)}
        
        </div>,
        children: <div> <OrgPageMainTabContactsSection
            color={'#f39821ff'}
            edit_mode={editMode}
            data={item}
          /> </div>
      }))
    }
    setStructureContacts(contics);
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
              // onClick={(ev) => {
              //   ev.stopPropagation();
              //   handleDeleteRealUnit(item.id, 1);
              // }}
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
