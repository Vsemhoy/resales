import { Affix, DatePicker, Input, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import TableHeadNameWithSort from '../../../components/template/TABLE/TableHeadNameWithSort';
import OrgListRow from './OrgListRow';


const OrgListTable = (props) => {
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
          <Affix >
            <div className={'sa-table-box-header'}>
              <div className={'sa-table-box-orgs sa-table-box-row'}>
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
                      <Input type={'number'} size={'small'} style={{ width: '100%' }} variant='filled' />
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <TableHeadNameWithSort 
                      sort_key={'name'}
                      on_sort_change={handleActivateSorter}
                      active_sort_items={sortOrders}
                      >Название организации
                      </TableHeadNameWithSort>
                    <div className={'sa-pa-3'}>
                      <Input size={'small'} style={{ width: '100%' }} variant='filled' />
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <TableHeadNameWithSort 
                      sort_key={'town'}
                      on_sort_change={handleActivateSorter}
                      active_sort_items={sortOrders}
                      >Город/регион
                      </TableHeadNameWithSort>
                    <div className={'sa-pa-3'}>
                      <DatePicker size={'small'} style={{ width: '100%' }} variant='filled' />
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <TableHeadNameWithSort 
                      sort_key={'comment'}
                      on_sort_change={handleActivateSorter}
                      active_sort_items={sortOrders}
                      >Комментарий
                      </TableHeadNameWithSort>
                    <div className={'sa-pa-3'}>
                      <Input size={'small'} style={{ width: '100%' }} variant='filled' />
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <div className={'sa-pa-3'}>Статус $</div>
                    <div className={'sa-pa-3'}>
                      <Select size={'small'} style={{ width: '100%' }} variant='filled' options={props.companies} allowClear />
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <div className={'sa-pa-3'}>Баланс</div>
                    <div className={'sa-pa-3'}>
                      <Input size={'small'} style={{ width: '100%' }} variant='filled' />
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <div className={'sa-pa-3'}>Профиль</div>
                    <div className={'sa-pa-3'}>
                      <Input size={'small'} style={{ width: '100%' }} variant='filled' />
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <div className={'sa-pa-3'}>Куратор</div>
                    <div className={'sa-pa-3'}>
                      <Input size={'small'} style={{ width: '100%' }} variant='filled' />
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <div className={'sa-pa-3'}>Свойства</div>
                    <div className={'sa-pa-3'}>
                      <Input size={'small'} style={{ width: '100%' }} variant='filled' />
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <div className={'sa-pa-3'}>Действия</div>
                    <div className={'sa-pa-3'}>
                      <Input size={'small'} style={{ width: '100%' }} variant='filled' />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Affix>

            <div className={'sa-table-box-stack'}>
              {props.base_orgs.map((borg, index) => (
                <OrgListRow
                data={borg}
                  is_active={isPreviewOpen && previewItem === borg}
                  on_double_click={handlePreviewOpen}
                  key={index}
                 />
              ))}
            </div>
          </div>
  );
};

export default OrgListTable;