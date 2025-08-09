import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Flex, Modal, Tooltip } from 'antd'
import { BorderOutlined, CloseOutlined, EllipsisOutlined } from '@ant-design/icons';
import { NavLink } from 'react-router-dom';
import Title from 'antd/es/skeleton/Title';
import { ArchiveBoxXMarkIcon, ArrowRightEndOnRectangleIcon, ArrowRightStartOnRectangleIcon, DocumentCurrencyDollarIcon, NewspaperIcon } from '@heroicons/react/24/outline';

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



  return (
    <div>
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
            <p>Быстрый просмотр паспорта организации будет в модалке</p>
            <p>some contents...</p>
            <p>some contents...</p>
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