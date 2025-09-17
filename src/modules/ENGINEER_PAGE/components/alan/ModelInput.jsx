import React, {useEffect, useState} from 'react';
import {Input} from "antd";

const ModelInput = (props) => {
    const [value, setValue] = useState(0);
    const [bidModelId, setBidModelId] = useState(0);
    const [bidModelSort, setBidModelSort] = useState(null);
    const [type, setType] = useState('');
    const [timeoutId, setTimeoutId] = useState(null);
    const [sort, setSort] = useState(0);

    useEffect(() => {
        if (props.value || props.value === 0) {
            setValue(props.value);
        }
    }, [props.value]);

    useEffect(() => {
        if (props.bidModelId || props.bidModelId === 0) {
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

    useEffect(() => {
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [timeoutId]);

    const handleChange = (newValue) => {
        setValue(newValue);
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        const newTimeoutId = setTimeout(() => {
            props.onChangeModel(type, newValue, bidModelId, bidModelSort);
        }, 300);
        setTimeoutId(newTimeoutId);
    };

    return (
        <Input style={{width: '100%'}}
               type="number"
               value={value}
               min={type === "model_count" ? 1 : undefined}
               onChange={(e) => handleChange(e.target.value)}
        />
    );
}

export default ModelInput;
