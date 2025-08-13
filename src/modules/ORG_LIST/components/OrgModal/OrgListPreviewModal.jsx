import React, { useEffect, useState } from 'react';
import { Button, Collapse, Dropdown, Flex, Modal, Tooltip } from 'antd'
import { BorderOutlined, CloseOutlined, EllipsisOutlined } from '@ant-design/icons';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import Title from 'antd/es/skeleton/Title';
import { ArchiveBoxXMarkIcon, ArrowRightEndOnRectangleIcon, ArrowRightStartOnRectangleIcon, DocumentCurrencyDollarIcon, NewspaperIcon } from '@heroicons/react/24/outline';

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
import OrgListModalProjectsTab from './Tabs/MainTabSections/OrgListModalProjectsTab';
import { getOrgTabLink, getOrgTabName } from './Tabs/TabComponents/OrgTabUtils';

const OrgListPreviewModal = (props) => {
    const [open, setOpen] = useState(false);
//   const [openResponsive, setOpenResponsive] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [orgId, setOrgId] = useState(246);

  // m - main
  // b - bills
  // o - offers
  // p - projects
  // c - calls
  // n - notes
  // h - history
  const [activeTab, setActiveTab] = useState('m');



    useEffect(() => {
      setOpen(props.is_open);

      if (props.is_open){
        let t = searchParams.get('tab');
        if (t && ['m','b','o', 'p','c','n','h'].includes(t)) {
          setActiveTab(t);
        } else {
          searchParams.set('tab', "m");
          setSearchParams(searchParams);
          setActiveTab('m');
        }
      }

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

const itemsNest = [
  {
    key: '1',
    label: 'This is panel nest panel',
    children: <p>af sdfasdf asdfasdfasdf asd</p>,
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
      label: 'Контактные лица',
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



  const navigateToEditor = (ev) => {
    const url = '/orgs/' + orgId + '?mode=edit';
    var targetTab = getOrgTabLink(activeTab);
    

    if (ev.ctrlKey || ev.metaKey || ev.button === 1) {
      // Open in Blank page
       const fullUrl = window.location.origin + url + targetTab;
        window.open(fullUrl, '_blank');
      return; // не делаем переход внутри SPA
    };

    navigate('/orgs/' + orgId + targetTab + "?mode=edit", {
      state: { from: window.location.pathname + window.location.search }
    });
  }

  return (
    <div className={'sa-special-modal'}>
            <Flex vertical gap="middle" align="flex-start">
        {/* Basic */}

        <Modal
          
          title={<div className={'sa-flex-space'}>

                <div className={'spec-modal-title'}>
                    Паспорт организации
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
                Тестовая компания {activeTab && activeTab !== "m" && (
                  <span style={{opacity: '0.5'}}>/ {getOrgTabName(activeTab)}</span>
                )}
              </div>



              {activeTab === 'm' && (
                <OrgListMainTab structure={structureItems} 


                />
              )}

              {activeTab === 'b' && (
                <OrgListModalBillsTab


                />
              )}

              {activeTab === 'o' && (
                <OrgListModalOffersTab


                />
              )}

              {activeTab === 'p' && (
                <OrgListModalProjectsTab


                />
              )}

              {activeTab === 'c' && (
                <OrgListModalCallMeetingsTab


                />
              )}

              {activeTab === 'n' && (
                <OrgListModalNotesTab


                />
              )}

              {activeTab === 'h' && (
                <OrgListModalHistoryTab


                />
              )}
              
             
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