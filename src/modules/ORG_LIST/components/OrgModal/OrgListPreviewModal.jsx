import React, { useEffect, useState } from 'react';
import { Button, Collapse, Dropdown, Flex, Modal, Tooltip } from 'antd'
import { BorderOutlined, CloseOutlined, EllipsisOutlined } from '@ant-design/icons';
import { NavLink } from 'react-router-dom';
import Title from 'antd/es/skeleton/Title';
import { ArchiveBoxXMarkIcon, ArrowRightEndOnRectangleIcon, ArrowRightStartOnRectangleIcon, DocumentCurrencyDollarIcon, NewspaperIcon } from '@heroicons/react/24/outline';

import '../style/orgmodal.css';
import OrgModalCommonTab from './Tabs/OrgModalCommonTab';
import OrgModalDepartTab from './Tabs/OrgModalDepartTab';
import OrgModalContactinfoTab from './Tabs/OrgModalContactinfoTab';

const OrgListPreviewModal = (props) => {
    const [open, setOpen] = useState(false);
//   const [openResponsive, setOpenResponsive] = useState(false);

    useEffect(() => {
      setOpen(props.is_open);
    }, [props.is_open]);

    const handleClose = ()=>{
        if (props.on_close){
            props.on_close();
        };
    };


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
    children: <Collapse defaultActiveKey="1" items={itemsNest} />,
    open: true,
  },
  {
    key: '2',
    label: <div className='sk-omt-sub-title'>Клименко Игорь Степаныч</div>,
    children: <p>df adfasdfasdf</p>,
  },
  {
    key: '3',
    label: <div className='sk-omt-sub-title'>Суворов Севчик Лютый</div>,
    children: <p>fasd fasdfas df asdfasdfasdf</p>,
  },
];

  const structureItems = [
    {
      key: 'st_commoninfo',
      label: 'Общая информация',
      children: <OrgModalCommonTab 

      />
    },
        {
      key: 'st_departinfo',
      label: 'Информация отдела',
      children: <OrgModalDepartTab

      />
    },
        {
      key: 'st_contactinfo',
      label: 'Контактная информация',
      children: <OrgModalContactinfoTab 

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
      children: (<div>Hello</div>)
    },
        {
      key: 'st_dogpost',
      label: 'Договор поставки',
      children: (<div>Hello</div>)
    },
  ]





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
                    <div className={'spec-modal-control-button active'}>
                        Основная информация
                    </div>
                    <div className={'spec-modal-control-button'}>
                        Счета
                    </div>
                    <div className={'spec-modal-control-button'}>
                        КП
                    </div>
                    <div className={'spec-modal-control-button'}>
                      Встречи/звонки  
                    </div>
                    <div className={'spec-modal-control-button'}>
                        Заметки
                    </div>
                    <div className={'spec-modal-control-button'}>
                        История
                    </div>
                    <Dropdown menu={{ items: menuItems }} placement="bottomRight">

                        <div className={'spec-modal-control-button expander'}
                            
                        >
                            <EllipsisOutlined /> 
                        </div>
                    </Dropdown>
                    <Tooltip title="Перейти в редактор">
                    <NavLink to="/orgs/234">
                    <div className={'spec-modal-control-button expander'}
                        // onClick={handleClose}
                    >
                        <BorderOutlined /> 
                    </div>
                    </NavLink>
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
            <div className={'sa-org-modal-body '}>
              <div className='sa-orgmodal-header'>
                Тестовая компания
              </div>

              <div>
                <Collapse
                  defaultActiveKey={['st_commoninfo', 'st_departinfo', 'st_contactinfo']}
                  size={'small'}
                  items={structureItems} />
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