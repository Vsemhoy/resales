import React, {useEffect, useState} from 'react';
import {Input} from "antd";

const CustomInput = (props) => {
    const [value, setValue] = useState('');
    const [id, setId] = useState(0);

    useEffect(() => {
        setValue(props.name);
    }, [props.name]);
    useEffect(() => {
        setId(props.id);
    }, [props.id]);
    useEffect(() => {
        if (value && value !== props.name) {
            const timer = setTimeout(() => {
                props.updateName(value);
            }, 200);

            return () => clearTimeout(timer);
        }
    }, [value]);


    return (
        <Input value={value}
               onChange={(e) => setValue(e.target.value)}
               readOnly={((id !== props?.editSelectedRegion) && (id !== props?.editSelectedTown))}
               onClick={(e) => {
                   if (props?.radioBtn) {
                       e.target.closest('.sa-regions-body-item').click();
                       e.stopPropagation()
                       e.target.focus();
                   }
               }}
        />
    );
};

export default CustomInput;
