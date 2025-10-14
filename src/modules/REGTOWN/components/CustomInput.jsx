import React, {useEffect, useState} from 'react';
import {Input, Tag, Tooltip} from "antd";

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

    const region = props.regions?.find(reg => reg.id === props.id_region);

    return (
        <Tooltip title={(!(props.selectedRegion) && props.type === 'town') ?
                            <Tag color={'purple'}
                                 onClick={() => props.selectRegionFromTown()}
                            >{region?.name}</Tag> : ''
                }
                 color="white"
                 styles={{
                     body: {
                         color: 'black',
                         border: '1px solid #d9d9d9',
                         cursor: 'pointer',
                     },
                     root: {
                         maxWidth: '400px'
                     }
                 }}
                 placement="leftTop"
        >
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
        </Tooltip>
    );
};

export default CustomInput;
