import React, { useEffect, useState } from 'react';
import { Button, Collapse, Dropdown, Flex, Modal, Tooltip } from 'antd'
import { BorderOutlined, CloseOutlined, EllipsisOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import Title from 'antd/es/skeleton/Title';
import { AdjustmentsVerticalIcon, ArchiveBoxXMarkIcon, ArrowRightEndOnRectangleIcon, ArrowRightStartOnRectangleIcon, DocumentCurrencyDollarIcon, NewspaperIcon } from '@heroicons/react/24/outline';

import '../style/orgmodal.css';
import OrgModalCommonSection from './Tabs/MainTabSections/OrgModalCommonSection';
import OrgModalDepartSection from './Tabs/MainTabSections/OrgModalDepartSection';
import OrgModalContactinfoSection from './Tabs/MainTabSections/OrgModalContactinfoSection';
import OrgModalPayersSection from './Tabs/MainTabSections/OrgModalPayersSection';
import OrgModalSupplyContractSection from './Tabs/MainTabSections/OrgModalSupplyContractSection';
import OrgModalContactsSection from './Tabs/MainTabSections/OrgModalContactsSection';
import OrgListMainTab from './Tabs/OrgListModalMainTab';
import OrgListModalBillsTab from './Tabs/OrgListModalBillsTab';
import OrgListModalOffersTab from './Tabs/OrgListModalOffersTab';
import OrgListModalCallMeetingsTab from './Tabs/OrgListModalCallMeetingsTab';
import OrgListModalNotesTab from './Tabs/OrgListModalNotesTab';
import OrgListModalHistoryTab from './Tabs/OrgListModalHistoryTab';

import { getOrgTabLink, getOrgTabName } from './Tabs/TabComponents/OrgTabUtils';
import { BarsArrowDownIcon } from '@heroicons/react/24/outline';
import { CSRF_TOKEN, PRODMODE } from '../../../../config/config';
import { PROD_AXIOS_INSTANCE } from '../../../../config/Api';
import OrgListModalProjectsTab from './Tabs/OrgListModalProjectsTab';




/**
 * Модальное окно просмотрщика компании
 * @param {*} props 
 * @returns 
 */
const OrgListPreviewModal = (props) => {
    const [open, setOpen] = useState(false);
    const [selectsData, setSelectsData] = useState([]);
//   const [openResponsive, setOpenResponsive] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  /** ID организации получает через пропсы */
  const [orgId, setOrgId] = useState(null);
  const [orgName, setOrgName] = useState(null);

    // // Это локалсторадж открытых секций
    // const [modalSectionsOpened, setModalSectionsOpened] = useState(['st_commoninfo','st_departinfo','st_contactinfo','st_contacts']);
    // // будут ли все юзеры раскрыты
    // const [modalUsersExpanded, setModalUsersExpanded] = useState(false);





  // m - main
  // b - bills
  // o - offers
  // p - projects
  // c - calls
  // n - notes
  // h - history
  const [activeTab, setActiveTab] = useState('m');

  // const [baseOrgData, setBaseOrgData] = useState(null);

  // const [mainOrgData,     setMainOrgData   ] = useState(null);
  // const [billsOrgData,    setBillsOrgData  ] = useState(null);
  // const [offersOrgData,   setOffersOrgData ] = useState(null);
  // const [callsOrgData,    setCallsOrgData  ] = useState(null);
  // const [notesOrgData,    setNotesOrgData  ] = useState(null);
  // const [mainHistoryData, setHistoryOrgData] = useState(null);

  // if(PRODMODE){

  // }

  useEffect(() => {
    if (props.data?.id){

      setOrgId(props.data?.id);
      setOrgName(props.data?.name);

    };
  }, [props.data]);


//   useEffect(() => {
//   if (props.data?.id !== orgId) {
//     const timer = setTimeout(() => {
//       setOrgId(props.data.id);
//       setOrgName(props.data.name);
//     }, 1500); // задержка 100 мс

//     return () => clearTimeout(timer); // очистка таймера при обновлении эффекта
//   }
// }, [props.data]);


  useEffect(() => {
    setSelectsData(props.selects_data);
  }, [props.selects_data]);

  //     useEffect(() => {
  //       // эффект
  //       console.log(props.selects_data);
  // }, [props.selects_data]);


      
      
  useEffect(() => {
      if (props.is_open !== open){
        let t = searchParams.get('tab');
        if (t && ['m','b','o', 'p','c','n','h'].includes(t)) {
          setActiveTab(t);
        } else {
          searchParams.set('tab', "m");
          setSearchParams(searchParams);
          setActiveTab('m');
        }
      }
      setOpen(props.is_open);

    }, [props.is_open]);

    const handleClose = ()=>{
        if (props.on_close){
            props.on_close();
        };
    };

    const handleChangeTab = (tabLit) => {
        setActiveTab(tabLit);
        searchParams.set('tab', tabLit);
        setSearchParams(searchParams);
    }


const menuItems = [
  {
    key: '41',
    label: (
      <div>Запросить кураторство</div>
    ),
    icon: <ArrowRightEndOnRectangleIcon  height={"18px"} />
  },
  {
    key: '42',
    label: (
      <div>Передать кураторство</div>
    ),
    icon: <ArrowRightStartOnRectangleIcon height={"18px"} />
  },
  {
    key: '43',
    label: (
      <div>Создать КП</div>
    ),
    icon: <NewspaperIcon height={"18px"} />
  },
    {
    key: '423',
    label: (
      <div>Создать Счёт</div>
    ),
    icon: <DocumentCurrencyDollarIcon height={"18px"} />
  },
    {
    key: '433',
    label: (
      <div>Удалить</div>
    ),
    icon: <ArchiveBoxXMarkIcon height={"18px"}/>
  },
];




  const contactItems = [
  {
    key: '1',
    label: <div className='sk-omt-sub-title'>Трастов Василий Петрович</div>,
    children: <OrgModalContactsSection
      id={4532}
    />,
    open: true,
  },
  {
    key: '2',
    label: <div className='sk-omt-sub-title'>Клименко Игорь Степаныч</div>,
    children: <OrgModalContactsSection
    id={453232}
    />,
  },
  {
    key: '3',
    label: <div className='sk-omt-sub-title'>Суворов Севчик Лютый</div>,
    children: <OrgModalContactsSection
    id={45532}
    />,
  },
    {
    key: '122',
    label: <div className='sk-omt-sub-title'>Клименко Игорь Виталич</div>,
    children: <OrgModalContactsSection
    id={455432}
    />,
  },
  {
    key: '1233',
    label: <div className='sk-omt-sub-title'>Дебонияр Руслан Сугран</div>,
    children: <OrgModalContactsSection
    id={4565432}
    />,
  },
];

  const structureItems = [
    {
      key: 'st_commoninfo',
      label: 'Общая информация',
      children: <OrgModalCommonSection 

      />
    },
        {
      key: 'st_departinfo',
      label: 'Информация отдела',
      children: <OrgModalDepartSection

      />
    },
        {
      key: 'st_contactinfo',
      label: 'Контактная информация',
      children: <OrgModalContactinfoSection 

      />
    },
      {
      key: 'st_contacts',
      label: <div className={'sa-flex-space'}><div>Контактные лица</div>
      <div className={'sa-flex-space'}>
        <Button 
          onClick={(ev)=>{
            ev.preventDefault();
            ev.stopPropagation();
          }}
        size={'small'} icon={<PlusCircleOutlined />}>Добавить контакт</Button>
        <BarsArrowDownIcon height={'24px'}/>
        </div>
      </div>,
      children: (<div className='sk-omt-subs'><Collapse
                  size={'small'}
                  items={contactItems} /></div>)
    },
        {
      key: 'st_firmspayers',
      label: 'Фирмы/плательщики',
      children: <OrgModalPayersSection 


      />
    },
        {
      key: 'st_dogpost',
      label: 'Договор поставки',
      children: <OrgModalSupplyContractSection />
    },
  ]



  /** ----------------------- FETCHES -------------------- */

  // const get_org_data_action = async (id) => {

  
  //     try {
  //         let response = await PROD_AXIOS_INSTANCE.post('/api/sales/v2/orglist/' + id + '/' + activeTab, {
  //           data: {},
  //           _token: CSRF_TOKEN
  //         });
  //         console.log('response', response);
  //         if (response.data){
  //             // if (props.changed_user_data){
  //             //     props.changed_user_data(response.data);
  //             // }
  //             setBaseOrgData(response.data.content);
  //         }
  //     } catch (e) {
  //         console.log(e)
  //     } finally {
  //         // setLoadingOrgs(false)

  //     }

  // }


  /** ----------------------- FETCHES -------------------- */



  /** Перелистывание табов стрелками + ALT */
  useEffect(() => {
    const handleKeyDown = (ev) => {
      if (!ev.altKey) return; // игнорировать если Ctrl не нажат

      if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') {
        ev.preventDefault();

        const baseTabs = ['m','b','o', 'p','c','n','h'];

        // const currentIndex = orgs.findIndex(item => item.id === selectedItem);
        // if (currentIndex === -1) return;

        let newTab = activeTab;
        let curIndex = baseTabs.indexOf(activeTab);

        if (ev.key === 'ArrowRight' && activeTab !== baseTabs[baseTabs.length - 1]) {
          newTab = baseTabs[curIndex + 1];
        } else if (ev.key === 'ArrowLeft' && activeTab !== baseTabs[0]) {
          newTab = baseTabs[curIndex - 1];
        }

        
        if (newTab !== activeTab) {
          handleChangeTab(newTab);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };

  }, [activeTab, orgId]);



  const navigateToEditor = (ev) => {
    const url = '/orgs/' + orgId + '?mode=edit';
    var targetTab = getOrgTabLink(activeTab);
    

    if (ev.ctrlKey || ev.metaKey || ev.button === 1) {
      // Open in Blank page
       const fullUrl = window.location.origin + url + "?tab=" + activeTab;
        window.open(fullUrl, '_blank');
      return; // не делаем переход внутри SPA
    };

    // Передача ссылки для возврата на предыдущую страницу (назад)
    navigate('/orgs/' + orgId + "?tab=" + activeTab + "&mode=edit", {
      state: { from: window.location.pathname + window.location.search }
    });
  }

  return (
    <div className={'sa-special-modal'}>
            <Flex vertical gap="middle" align="flex-start">
        {/* Basic */}

        <Modal
          style={{maxWidth: '1400px'}}
          title={<div className={'sa-flex-space'}>

                <div className={'spec-modal-title'}>
                    Паспорт организации ({orgId})
                </div>
                <div className={'spec-modal-control'}>
                    <div className={`spec-modal-control-button ${activeTab === 'm' ? 'active' : ''}`}
                      onClick={()=>{handleChangeTab('m')}}
                    >
                        Основная информация
                    </div>
                    <div className={`spec-modal-control-button ${activeTab === 'b' ? 'active' : ''}`}
                      onClick={()=>{handleChangeTab('b')}}
                    >
                        Счета
                    </div>
                    <div className={`spec-modal-control-button ${activeTab === 'o' ? 'active' : ''}`}
                      onClick={()=>{handleChangeTab('o')}}
                    >
                        КП
                    </div>
                    <div className={`spec-modal-control-button ${activeTab === 'p' ? 'active' : ''}`}
                      onClick={()=>{handleChangeTab('p')}}
                    >
                        Проекты
                    </div>
                    <div className={`spec-modal-control-button ${activeTab === 'c' ? 'active' : ''}`}
                      onClick={()=>{handleChangeTab('c')}}
                    >
                      Встречи/звонки  
                    </div>
                    <div className={`spec-modal-control-button ${activeTab === 'n' ? 'active' : ''}`}
                      onClick={()=>{handleChangeTab('n')}}
                    >
                        Заметки
                    </div>
                    <div className={`spec-modal-control-button ${activeTab === 'h' ? 'active' : ''}`}
                      onClick={()=>{handleChangeTab('h')}}
                    >
                        История
                    </div>
                    <Dropdown menu={{ items: menuItems }} placement="bottomRight">

                        <div className={'spec-modal-control-button expander'}
                            
                        >
                            <EllipsisOutlined /> 
                        </div>
                    </Dropdown>
                    <Tooltip title="Перейти в редактор">
                    <div onMouseDown={navigateToEditor}>
                    <div className={'spec-modal-control-button expander'}
                        // onClick={handleClose}
                    >
                        <BorderOutlined /> 
                    </div>
                    </div>
                    </Tooltip>
                    <Tooltip title="Закрыть">
                    <div className={'spec-modal-control-button closer'}
                        onClick={handleClose}
                    >
                        <CloseOutlined /> 
                    </div>
                    </Tooltip>
                </div>
            </div>}
            centered
            open={open}
            onOk={() => setOpen(false)}
            onCancel={handleClose}
            width={'100%'}
            className={'not-ant-modal'}
            closable={false}
            footer={null}
        >
            <div className={'sa-org-modal-body'} style={{minHeight: '600px'}}>
              <div className='sa-orgmodal-header'>
                {orgName} {activeTab && activeTab !== "m" && (
                  <span style={{opacity: '0.5'}}>/ {getOrgTabName(activeTab)}</span>
                )}
              </div>



              {activeTab === 'm' && (
                <OrgListMainTab
                  structure={structureItems} 
                  data={{id: orgId}}
                  selects_data={selectsData}
                />
              )}

              {activeTab === 'b' && (
                <OrgListModalBillsTab
                  data={{id: orgId}}
                  selects_data={selectsData}
                />
              )}

              {activeTab === 'o' && (
                <OrgListModalOffersTab
                  data={{id: orgId}}
                  selects_data={selectsData}
                />
              )}

              {activeTab === 'p' && (
                <OrgListModalProjectsTab
                  data={{id: orgId}}
                  selects_data={selectsData}
                />
              )}

              {activeTab === 'c' && (
                <OrgListModalCallMeetingsTab
                  data={{id: orgId}}
                  selects_data={selectsData}
                />
              )}

              {activeTab === 'n' && (
                <OrgListModalNotesTab
                  data={{id: orgId}}
                  selects_data={selectsData}
                />
              )}

              {activeTab === 'h' && (
                <OrgListModalHistoryTab
                  data={{id: orgId}}
                  selects_data={selectsData}
                />
              )}
              
              <div class={'sa-org-modal-after-filler'}>

              </div>
             
            </div>
        </Modal>

        {/* Responsive */}
        {/* <Button type="primary" onClick={() => setOpenResponsive(true)}>
            Open Modal of responsive width
        </Button>
        <Modal
            title="Modal responsive width"
            centered
            open={openResponsive}
            onOk={() => setOpenResponsive(false)}
            onCancel={() => setOpenResponsive(false)}
            width={{
            xs: '90%',
            sm: '80%',
            md: '70%',
            lg: '60%',
            xl: '50%',
            xxl: '40%',
            }}
        >
            <p>some contents...</p>
            <p>some contents...</p>
            <p>some contents...</p>
        </Modal> */}
        </Flex>
    </div>
  );
};

export default OrgListPreviewModal;