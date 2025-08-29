import { Affix, DatePicker, Input, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import TableHeadNameWithSort from '../../../components/template/TABLE/TableHeadNameWithSort';
import CuratorListRow from './CuratorListRow';


const CuratorListTable = (props) => {
  const [sortOrders, setSortOrders] = useState([]);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);




    const handleRowDblClick = (id) => {

    }

    const handlePreviewOpen = (item, state) => {
        console.log('HEllo');
        // setPreviewItem(item);
        // setIsPreviewOpen(true);
        if (props.on_preview_open){
            props.on_preview_open(item, state);
        }
    }

    /**
     * Обработчик сортировки колонок в таблице - триггер: клик на TableHeadNameWithSort
     * @param {name} key 
     * @param {int} order 
     */
    const handleActivateSorter = (key, order) => {
        let newSorts = [];
        for (let i = 0; i < sortOrders.length; i++) {
            const element = sortOrders[i];
            if (element.order !== 0){
                if (element.key !== key){
                    newSorts.push(element);
                }
            }
        };
        if (order === 0){
            
        } else {
            newSorts.push({key: key, order: order});
        }
        setSortOrders(newSorts);
    }

    useEffect(() => {
      console.log('sortOrders', sortOrders)
      if (props.on_set_sort_orders){
        props.on_set_sort_orders(sortOrders);
      }
    }, [sortOrders]);

  return (
    <div className={'sa-table-box'} style={{width:'80%', margin: "0 auto"}} >
            <div className={'sa-table-box-header'}>
                <div className={'sa-table-box-curators sa-table-box-row'}>
                    <div className={'sa-table-box-cell'}>
                        <div className={'sa-table-head-on'}>
                            Дата создания
                        </div>
                    </div>
                    <div className={'sa-table-box-cell'}>
                        <div className={'sa-table-head-on'}>
                            Инициатор
                        </div>
                    </div>
                    <div className={'sa-table-box-cell'}>
                        <div className={'sa-table-head-on'}>
                            Компания
                        </div>
                    </div>
                    <div className={'sa-table-box-cell'}>
                        <div className={'sa-table-head-on'}>
                            Действия
                        </div>
                    </div>
                </div>
            </div>

        <div className={'sa-table-box-stack'}>
            {props.companies.map((bid, index) => (
                <CuratorListRow
                    data={bid}
                    supervisor={props.supervisor}
                    approve={props.approve}
                    buttonLoading={props.buttonLoading}
                // is_active={isPreviewOpen && previewItem === bid.id}
                // on_double_click={handlePreviewOpen}
                // key={index}
                // company_color={props.base_companies?.find((item)=>item.id === bid.id_company)?.color}
                 />
              ))}
            </div>
          </div>
  );
};

export default CuratorListTable;