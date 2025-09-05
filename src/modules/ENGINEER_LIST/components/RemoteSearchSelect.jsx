import React, { useState, useRef } from 'react';
import { Select, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import debounce from 'lodash/debounce';

const RemoteSearchSelect = ({ fetchOptions, debounceTimeout = 800, ...props }) => {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const fetchRef = useRef(0);

    const debounceFetcher = debounce((value) => {
        fetchRef.current += 1;
        const fetchId = fetchRef.current;

        if (!value) {
            setOptions([]);
            return;
        }

        setLoading(true);
        fetchOptions(value).then((newOptions) => {
            if (fetchId !== fetchRef.current) return;

            setOptions(newOptions);
            setLoading(false);
        });
    }, debounceTimeout);

    return (
        <Select
            {...props}
            showSearch
            filterOption={false}
            onSearch={debounceFetcher}
            notFoundContent={loading ? <Spin size="small" /> : 'Ничего не найдено'}
            options={options}
            suffixIcon={loading ? <Spin size="small" /> : <SearchOutlined style={{color:'#8b8b8b',fontSize:'16px'}}/>}
        />
    );
};

export default RemoteSearchSelect;
