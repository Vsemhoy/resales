import { Affix, DatePicker, Input, Select, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import TableHeadNameWithSort from '../../../components/template/TABLE/TableHeadNameWithSort';
import OrgListRow from './OrgListRow';


const OrgListTable = (props) => {
    const {userdata} = props;
  const [sortOrders, setSortOrders] = useState([]);

  const [curatorList, setCuratorList] = useState(props.curator_list);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

    const [filterInn, setFilterInn] = useState(null);
    const [filterName, setFilterName] = useState(null);
    const [filterRegion, setFilterRegion] = useState(null);
    const [filterTown, setFilterTown] = useState(null);
    const [filterComment, setFilterComment] = useState(null);
    const [filterId, setFilterId] = useState(null);
    // const [filterClaims, setFilterClaims] = useState(null);
    // const [filterMeetings, setFilterMeetings] = useState(null);
    // const [filterCalls, setFilterCalls] = useState(null);
    const [filterCurator, setFilterCurator] = useState(null);


    // Утилита: если строка пустая — возвращаем null
    const toNullable = (value) => {
    return value === '' || value === null || value === undefined ? null : value;
    };

    useEffect(() => {
        console.log('props.curator_list', props.curator_list)
        setCuratorList(props.curator_list);
    }, [props.curator_list]);

    useEffect(() => {
    // Создаём отложенную отправку через setTimeout
    const timer = setTimeout(() => {
        let filterBox = props.base_filters ?? {};

        filterBox.regions = toNullable(filterRegion);
        filterBox.towns = toNullable(filterTown);
        filterBox.id = toNullable(filterId);
        filterBox.name = toNullable(filterName);
        filterBox.inn = toNullable(filterInn);
        filterBox.comment = toNullable(filterComment);
        filterBox.curator = toNullable(filterCurator); 

        if (props.on_change_filters) {
            props.on_change_filters(filterBox);
        }
    }, 1000); // ⏱️ 1 секунда задержки

    // Очищаем таймер, если эффект пересоздаётся (чтобы не было утечек)
    return () => clearTimeout(timer);
    }, [
        filterRegion,
        filterTown,
        filterId,
        filterName,
        filterInn,
        filterComment,
        filterCurator, 
    ]);


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
                        <Input size={'small'} style={{ width: '100%' }}
                        variant='filled'
                        value={filterId}
                        onChange={(ev)=>{setFilterId(ev.target.value)}}
                        allowClear />
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
                        <Input size={'small'} style={{ width: '100%' }}
                        variant='filled'
                        value={filterName}
                        onChange={(ev)=>{setFilterName(ev.target.value)}}
                        allowClear />
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
                      <Tooltip placement='bottom'>
                    <div className={'sa-pa-3'}>
                        <Input size={'small'} style={{ width: '100%' }}
                            variant='filled'
                            value={filterRegion}
                            onChange={(ev)=>{setFilterRegion(ev.target.value)}}
                            allowClear />
                        </div>
                    </Tooltip>
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
                        <Input size={'small'} style={{ width: '100%' }}
                        variant='filled'
                        value={filterComment}
                        onChange={(ev)=>{setFilterComment(ev.target.value)}}
                        allowClear />
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <div className={'sa-pa-3'}>ИНН</div>
                    <div className={'sa-pa-3'}>
                      <Input size={'small'} style={{ width: '100%' }}
                        variant='filled'
                        value={filterInn}
                        onChange={(ev)=>{setFilterInn(ev.target.value)}}
                        allowClear />
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <TableHeadNameWithSort 
                      sort_key={'curator'}
                      on_sort_change={handleActivateSorter}
                      active_sort_items={sortOrders}
                      >Куратор
                      </TableHeadNameWithSort>
                    <div className={'sa-pa-3'}>
                      <Select size={'small'} 
                        showSearch
                        optionFilterProp="label"
                        style={{ width: '100%' }}
                        variant='filled' 
                        options={curatorList} allowClear
                        onChange={setFilterCurator}
                       />
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <div className={'sa-pa-3'}>Памятка</div>
                    <div className={'sa-pa-3'}>
                      {/* <Input size={'small'} style={{ width: '100%' }} variant='filled' /> */}
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <div className={'sa-pa-3'}>Профиль</div>
                    <div className={'sa-pa-3'}>
                      
                    </div>
                  </div>
                </div>

                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <div className={'sa-pa-3'}>Свойства</div>
                    <div className={'sa-pa-3'}>
                      
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <div className={'sa-pa-3'}>Заявки</div>
                    <div className={'sa-pa-3'}>
                      
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <div className={'sa-pa-3'}>Встречи</div>
                    <div className={'sa-pa-3'}>
                      
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <div className={'sa-pa-3'}>Звонки</div>
                    <div className={'sa-pa-3'}>
                      
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
                  is_active={isPreviewOpen && previewItem === borg.id}
                  on_double_click={handlePreviewOpen}
                  key={`borg_${borg.id}`}
                  userdata={userdata}
                    company_color={props.base_companies?.find((item)=>item.id === borg.id_company)?.color}
                 />
              ))}
            </div>
          </div>
  );
};

export default OrgListTable;