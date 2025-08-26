import { Affix, DatePicker, Input, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import TableHeadNameWithSort from '../../../components/template/TABLE/TableHeadNameWithSort';
import BidListRow from './BidListRow';


const BidListTable = (props) => {
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
    <div className={'sa-table-box'}>
          <Affix offsetTop={156}>
            <div className={'sa-table-box-header'}>
              <div className={'sa-table-box-bids sa-table-box-row'}>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <TableHeadNameWithSort
                        sort_key={'id'}
                        on_sort_change={handleActivateSorter}
                        active_sort_items={sortOrders}
                    >
                      id
                    </TableHeadNameWithSort>
                    <div className={'sa-pa-3'}>
                      <Input type={'number'} size={'small'} style={{width: '100%'}} variant='filled'/>
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <TableHeadNameWithSort
                        sort_key={'company_name'}
                        on_sort_change={handleActivateSorter}
                        active_sort_items={sortOrders}
                    >Название
                    </TableHeadNameWithSort>
                    <div className={'sa-pa-3'}>
                      <Input size={'small'} style={{width: '100%'}} variant='filled'/>
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <TableHeadNameWithSort
                        sort_key={'type_status'}
                        on_sort_change={handleActivateSorter}
                        active_sort_items={sortOrders}
                    >Тип
                    </TableHeadNameWithSort>
                    <div className={'sa-pa-3'}>
                      <Input size={'small'} style={{width: '100%'}} variant='filled'/>
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <TableHeadNameWithSort
                        sort_key={'protection_project'}
                        on_sort_change={handleActivateSorter}
                        active_sort_items={sortOrders}
                    >Защита
                    </TableHeadNameWithSort>
                    <div className={'sa-pa-3'}>
                      <Input size={'small'} style={{width: '100%'}} variant='filled'/>
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <TableHeadNameWithSort
                        sort_key={'stage_id'}
                        on_sort_change={handleActivateSorter}
                        active_sort_items={sortOrders}
                    >Этап
                    </TableHeadNameWithSort>
                    <div className={'sa-pa-3'}>
                      <Select size={'small'} style={{width: '100%'}} variant='filled' options={props.companies}
                              allowClear/>
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <TableHeadNameWithSort
                        sort_key={'date'}
                        on_sort_change={handleActivateSorter}
                        active_sort_items={sortOrders}
                    >Дата
                    </TableHeadNameWithSort>
                    <div className={'sa-pa-3'}>
                      <DatePicker size={'small'} style={{width: '100%'}} variant='filled'/>
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <TableHeadNameWithSort
                        sort_key={'username'}
                        on_sort_change={handleActivateSorter}
                        active_sort_items={sortOrders}
                    >Менеджер
                    </TableHeadNameWithSort>
                    <div className={'sa-pa-3'}>
                      <Input size={'small'} style={{width: '100%'}} variant='filled'/>
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <div className={'sa-pa-3'}>Счета</div>
                    <div className={'sa-pa-3'}>
                      <Input size={'small'} style={{width: '100%'}} variant='filled'/>
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <div className={'sa-pa-3'}>Комментарий</div>
                    <div className={'sa-pa-3'}>
                      <Input size={'small'} style={{width: '100%'}} variant='filled'/>
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <div className={'sa-pa-3'}>Объект</div>
                    <div className={'sa-pa-3'}>
                      <Input size={'small'} style={{width: '100%'}} variant='filled'/>
                    </div>
                  </div>
                </div>
                {/*<div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <div className={'sa-pa-3'}>Контактное лицо</div>
                    <div className={'sa-pa-3'}>
                      <Input size={'small'} style={{width: '100%'}} variant='filled'/>
                    </div>
                  </div>
                </div>*/}
              </div>
            </div>
          </Affix>

      <div className={'sa-table-box-stack'}>
        {props.bids.map((bid, index) => (
            <BidListRow
                data={bid}
                is_active={isPreviewOpen && previewItem === bid.id}
                on_double_click={handlePreviewOpen}
                key={index}
                company_color={props.base_companies?.find((item)=>item.id === bid.id_company)?.color}
                 />
              ))}
            </div>
          </div>
  );
};

export default BidListTable;