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
            closeIcon={false}
            footer={buttons.map((button) => {
                const buttonProps = {
                    //key: button.id,
                    onClick: () => handleClick(button.id)
                };

                if (button.type) buttonProps.type = button.type;
                if (button.typePlus === 'danger') buttonProps.danger = true;

                return (
                    <Button key={button.id} {...buttonProps}>
                        {button.text}
                    </Button>
                );
            })}
        >
            <h2> {text}</h2>
        </Modal>
    );
}

export default CustomModal;
