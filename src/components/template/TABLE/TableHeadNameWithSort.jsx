import { CaretDownFilled, CaretUpFilled } from '@ant-design/icons';
import React, { useEffect, useId, useState } from 'react';


const TableHeadNameWithSort = (props) => {
    const { children } = props;
    const [sortOrder, setSortOrder] = useState(0); // 0 - disabled // 1 - Desc // 2 - Ascend
    const k =  useId();
    const [key, setKey] = useState(props.sort_key ? props.sort_key : k);

    useEffect(() => {
        
      if (props.active_sort_items !== undefined && props.active_sort_items !== null){
    
            let found = false;
            // setSortOrder(props.active_sort_items);
            for (let i = 0; i < props.active_sort_items.length; i++) {
                const element = props.active_sort_items[i];
                if (element.key === key){
                    setSortOrder(element.order);
                    found = true;
                    break;
                }
            }
            if (!found){
                setSortOrder(0);
            }
       
      }
      
    }, [props?.active_sort_items]);



    const handleDblClick = () => {
        if (sortOrder === 0 ){
            setSortOrder(1);
            if (props.on_double_click){
                props.on_double_click(key, 1);
            }
        } else {
            setSortOrder(0);
            if (props.on_double_click){
                props.on_double_click(key, 0);
            }
        }
    }

    // useEffect(() => {
    //   if (props.on_double_click){
    //     props.on_double_click(key, sortOrder);
    //   }
    // }, [sortOrder]);

    const handleChangeDirection = () => {
        if (sortOrder !== 0){
            if (sortOrder === 1){
                setSortOrder(2);
                if (props.on_double_click){
                    props.on_double_click(key, 2);
                }
            } else {
                setSortOrder(1);
                if (props.on_double_click){
                    props.on_double_click(key, 1);
                }
            }
        }
    }

  return (
    <div className={'sa-pa-3 sa-table-sort-trigger'}
        onDoubleClick={handleDblClick}
    >
        <span className={`${sortOrder !== 0 ? "sa-table-sort-trigger-active" : ""}`}>
            {children}
        </span>
        <div className='sa-table-sort-bit'
            onClick={handleChangeDirection}
        >
            <div className={`${sortOrder === 2 ? "active" : ""}`}>
                <CaretUpFilled />
            </div>
            <div className={`${sortOrder === 1 ? "active" : ""}`}>
                <CaretDownFilled />
            </div>
        </div>
    </div>
  );
};

export default TableHeadNameWithSort;