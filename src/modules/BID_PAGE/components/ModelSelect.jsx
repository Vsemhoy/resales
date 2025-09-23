import React, {useEffect, useState} from 'react';
import {Select} from "antd";

const ModelSelect = (props) => {
    const [options, setOptions] = useState([]);
    const [value, setValue] = useState(null);
    const [bidModelId, setBidModelId] = useState(0);
    const [bidModelSort, setBidModelSort] = useState(null);
    const [type, setType] = useState('');

    useEffect(() => {
        if (props.options) {
            setOptions(props.options);
        }
    }, [props.options]);

    useEffect(() => {
        setValue(props.value);
    }, [props.value]);

    useEffect(() => {
        if (props.bidModelId) {
            setBidModelId(props.bidModelId);
        }
    }, [props.bidModelId]);

    useEffect(() => {
        setBidModelSort(props.bidModelSort);
    }, [props.bidModelSort]);

    useEffect(() => {
        if (props.type) {
            setType(props.type);
        }
    }, [props.type]);

    const handleChangeSelect = (newValue) => {
        setValue(newValue);
        props.onChangeModel(type, newValue, bidModelId, bidModelSort);
    };

    return (
        <Select style={{width: '100%'}}
                value={value}
                options={options}
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                }
                onChange={(val) => handleChangeSelect(val)}
                disabled={props?.disabled}
        />
    );
}

export default ModelSelect;