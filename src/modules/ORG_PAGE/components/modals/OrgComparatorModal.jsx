


import React, { useEffect, useState } from 'react';
import { Modal } from 'antd'; // Importing antd Modal component for use
const OrgComparatorModal = (props) => {
    const [originalNotes, setOriginalNotes] = useState([]);
    const [changedNotes, setChangedNotes]  = useState([]);

    const [visible, setVisible] = React.useState(true);

    useEffect(() => {
      if (props.data?.notes){
        setOriginalNotes(props.data.notes.orig || []);
        setChangedNotes(props.data.notes.chan || []);
      } else {
        setOriginalNotes([]);
        setChangedNotes([]);
      }
    }, [props.data]);


    useEffect(() => {
        if (props.open && visible){
            setVisible(false);
            setTimeout(() => {
                setVisible(true);
            }, 500);
        }
      setVisible(props.open);
    }, [props.open]);



  const showModal = () => {
    setVisible(true);
  };

  const handleOk = (e) => {
    console.log(e);
    setVisible(false);
  };

  const handleCancel = (e) => {
    console.log(e);
    setVisible(false);
  };

  

  return (
    <>
      <Modal
        title="Wolf Modal"
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={1200} // Setting the width of the modal
        style={{ height: 'calc(100vh - 160px)', overflowY: 'auto' }} // Setting max height and enabling scrolling for content inside modal
    
      >
        <p>Hello Wolf from OrgComparatorModal</p>
        {JSON.stringify(changedNotes)}
      </Modal>
    </>
  );
};

export default OrgComparatorModal;