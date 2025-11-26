import React, {useEffect, useState} from 'react';
import {Input} from "antd";

const ModelInput = (props) => {
    const [value, setValue] = useState(1);
    const [bidModelId, setBidModelId] = useState(0);
    const [bidModelSort, setBidModelSort] = useState(null);
    const [type, setType] = useState('');
    const [timeoutId, setTimeoutId] = useState(null);

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
        if (props?.isOnlyPositive && +newValue.replace(/^0+/, '') < 1 && newValue !== '' && newValue === '-') return;
        setValue(newValue);
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        const newTimeoutId = setTimeout(() => {
            props.onChangeModel(type, newValue, bidModelId, bidModelSort);
        }, 300);
        setTimeoutId(newTimeoutId);
    };

    const handleBlur = (newValue) => {
        if (!props?.isOnlyPositive) return;
        let num = 1;
        if (+newValue.replace(/^0+/, '') < 1) {
            setValue(1);
        } else {
            setValue(+newValue.replace(/^0+/, ''));
            num = +newValue.replace(/^0+/, '');
        }
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        const newTimeoutId = setTimeout(() => {
            props.onChangeModel(type, num, bidModelId, bidModelSort);
        }, 300);
        setTimeoutId(newTimeoutId);
    };

    return (
        <Input style={{width: '100%'}}
               type="number"
               title={props?.title}
               value={value}
               onChange={(e) => {
                   handleChange(e.target.value);
                   props.onChange(e.target.value);
               }}
               onBlur={(e) => handleBlur(e.target.value)}
               disabled={props?.disabled}
               danger={props?.danger}
               status={props?.error ? 'error' : ''}
               min={props?.isOnlyPositive ? 1 : undefined}
        />
    );
}

export default ModelInput;
