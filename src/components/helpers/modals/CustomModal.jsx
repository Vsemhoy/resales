import {useEffect, useState} from 'react';
import {Button, Modal} from "antd";

const CustomModal = (props) => {
    const [text, setText] = useState('');
    const [buttons, setButtons] = useState([]);
    const [type, setType] = useState('');
    const [title, setTitle] = useState('');
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setText(props.customText);
    }, [props.customText]);

    useEffect(() => {
        setButtons(props.customButtons);
    }, [props.customButtons]);

    useEffect(() => {
        setType(props.customType);
    }, [props.customType]);

    useEffect(() => {
        setTitle(props.customTitle);
    }, [props.customTitle]);

    useEffect(() => {
        setOpen(props.open);
    }, [props.open]);

    const handleClick = (button_id) => {
        props.customClick(button_id);
    }


    return (
        <Modal
            type={type}
            title={title}
            open={open}
            buttons={false}
            footer={buttons}
        >
            <h2> {text}</h2>
            <Button
            onClick={() => handleClick(1)}>
            hkfgbsdfhjkbsdh
            </Button>
        </Modal>
    );
}

export default CustomModal;
