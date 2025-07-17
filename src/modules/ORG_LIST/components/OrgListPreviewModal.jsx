import React, { useEffect, useState } from 'react';
import { Button, Flex, Modal } from 'antd'

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
    }

  return (
    <div>
            <Flex vertical gap="middle" align="flex-start">
        {/* Basic */}
        <Button type="primary" onClick={() => setOpen(true)}>
            Быстрый просмотр паспорта организации будет в модалке
        </Button>
        <Modal
            title="Modal 1000px width"
            centered
            open={open}
            onOk={() => setOpen(false)}
            onCancel={handleClose}
            width={1000}
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