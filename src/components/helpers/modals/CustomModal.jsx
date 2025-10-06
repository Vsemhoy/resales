import {cloneElement, useEffect, useState} from 'react';
import {Button, Modal, Select} from "antd";

const CustomModal = (props) => {
    const [text, setText] = useState('');
    const [filling, setFilling] = useState([]);
    const [buttons, setButtons] = useState([]);
    const [type, setType] = useState('');
    const [title, setTitle] = useState('');
    const [open, setOpen] = useState(false);
    const [selectValue, setSelectValue] = useState(null);

    useEffect(() => {
        setText(props.customText);
    }, [props.customText]);

    useEffect(() => {
        if (props.customFilling) {
            setFilling(props.customFilling);
        }
    }, [props.customFilling]);

    useEffect(() => {
        if (props.customButtons) {
            setButtons(props.customButtons);
        }
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
        props.customClick(button_id, selectValue);
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

                if (button.color) buttonProps.color = button.color;
                if (button.variant) buttonProps.variant = button.variant;
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
            <br/>
            {filling && filling.length > 0 && filling.map((fill, index) => {
                if (fill.type === Select) {
                    return cloneElement(fill, {
                        key: index,
                        value: selectValue,
                        onChange: setSelectValue
                    });
                }
                return (
                    <div key={index} style={{width:'100%'}}>
                        {fill}
                    </div>
                );
            })}
        </Modal>
    );
}

export default CustomModal;
