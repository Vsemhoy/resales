import React, {useEffect, useState, useRef} from 'react';
import {Modal, Select} from "antd";


const BugModal = (props) => {
  const [visible, setVisible] = useState(false);

  
  

  useEffect(() => {
    setVisible(props.visible);
  }, [props.visible]);


  return (
    <div className="sa-bug-modal">

          <Modal
          title="Basic Modal"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width={'100%'}
        >
          <p>Hello bugs!</p>
        </Modal>

      
    </div>
  )
} 

export default BugModal;