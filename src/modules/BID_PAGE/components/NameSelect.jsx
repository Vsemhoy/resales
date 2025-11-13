// import React, {useEffect, useState} from 'react';
// import {Input, Select} from "antd";
//
// const NameSelect = (props) => {
//     const [modelId, setModelId] = useState(null);
//     const [options, setOptions] = useState([]);
//     const [model, setModel] = useState({
//         id: 0,
//         model_id: 0,
//         sort: 0,
//     });
//
//     useEffect(() => {
//         if (props.model && props.model.model_id) {
//             setModelId(props.model.model_id);
//         }
//     }, [props.model]);
//
//     useEffect(() => {
//         if (props.options) {
//             setOptions(props.options);
//         }
//     }, [props.options]);
//
//     useEffect(() => {
//         if (props.model) {
//             setModel(props.model);
//         }
//     }, [props.model]);
//
//     const handleChangeModel = (newModelId, bidModelId, bidModelSort) => {
//         setModelId(newModelId);
//         props.onUpdateModelName(newModelId, bidModelId, bidModelSort);
//     };
//
//     return (
//         <Select style={{width: '100%'}}
//                 value={modelId}
//                 options={options.filter(option => !option.used)}
//                 showSearch
//                 optionFilterProp="label"
//                 filterOption={(input, option) =>
//                     option.label.toLowerCase().includes(input.toLowerCase())
//                 }
//                 onChange={(val) => handleChangeModel(val, model.id, model.sort)}
//                 disabled={props?.disabled}
//         />
//     );
// }
//
// export default NameSelect;
import {Select} from "antd";

const NameSelect = (props) => {
    const {model, options, disabled, onUpdateModelName} = props;

    const value = model?.model_id || null;

    console.log('Options:', options);
    console.log('Selected value:', value);

    const filteredOptions = (options || []).filter(option => !option.used);

    const handleChangeModel = (newModelId) => {
        onUpdateModelName(newModelId, model?.id, model?.sort);
    };

    return (
        <Select
            style={{width: '100%'}}
            value={value}
            options={filteredOptions}
            showSearch
            optionFilterProp="label"
            filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
            }
            onChange={handleChangeModel}
            disabled={disabled}
            placeholder="Выберите модель"
        />
    );
}

export default NameSelect;
