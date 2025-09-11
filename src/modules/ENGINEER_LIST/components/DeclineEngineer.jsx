import {Modal} from "antd";
import React, {useEffect, useState} from "react";
import TextArea from "antd/es/input/TextArea";

const DeclineEngineer = (props) => {
    const [id, setId] = useState(0);
    const [text, setText] = useState("");
    const [openModal, setOpenModal] = useState(false);

    const handleChange = () => {
        props.handleSetText(text)
    }

    useEffect(() => {
        setId(props.orderID);
        setText(props.reason);
        setOpenModal(props.open);
    }, [props.orderID, props.reason, props.open]);
    return (
        <Modal
            title="Укажите причину отклонения"
            open={openModal}
            onOk={props.handleOk}
            onCancel={props.handleCancel}
        >
            <TextArea rows={4} value={text} onChange={(text) => setText(text.target.value)} onBlur={handleChange} />
            {/*<TextArea rows={4} value={text} onChange={(text) => console.log(text.target.value)} />*/}
        </Modal>
    );
}

export default DeclineEngineer;
