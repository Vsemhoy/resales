import { Affix, DatePicker, Input, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import TableHeadNameWithSort from '../../../components/template/TABLE/TableHeadNameWithSort';
import BidListRow from './BidListRow';


const BidListTable = (props) => {
  const [sortOrders, setSortOrders] = useState([]);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  const [bidId, setBidId] = useState(null);
  const [companyName, setCompanyName] = useState(null);
  const [type, setType] = useState(null);
  const [protectStatus, setProtectStatus] = useState(null);
  const [stageStatus, setStageStatus] = useState(null);
  const [dates, setDates] = useState(null);
  const [manager, setManager] = useState(null);
  const [billNumber, setBillNumber] = useState(null);
  const [comment, setComment] = useState(null);
  const [objectName, setObjectName] = useState(null);

  useEffect(() => {
    if (props.filter_box.bid_id !== bidId) {
      setBidId(props.filter_box.bid_id);
    }
    if (props.filter_box.company_name !== companyName) {
      setCompanyName(props.filter_box.company_name);
    }
    if (props.filter_box.type !== type) {
      setType(props.filter_box.type);
    }
    if (props.filter_box.protect_status !== protectStatus) {
      setProtectStatus(props.filter_box.protect_status);
    }
    if (props.filter_box.stage_status !== stageStatus) {
      setStageStatus(props.filter_box.stage_status);
    }
    if (props.filter_box.dates !== dates) {
      setDates(props.filter_box.dates);
    }
    if (props.filter_box.manager !== manager) {
      setManager(props.filter_box.manager);
    }
    if (props.filter_box.bill_number !== billNumber) {
      setBillNumber(props.filter_box.bill_number);
    }
    if (props.filter_box.comment !== comment) {
      setComment(props.filter_box.comment);
    }
    if (props.filter_box.object_name !== objectName) {
      setObjectName(props.filter_box.object_name);
    }
  }, [props.filter_box]);

  useEffect(() => {
    const newFilterBox = {
      "bid_id": bidId ?? null,
      "company_name": companyName ?? null,
      "type": type ?? null,
      "protect_status": protectStatus ?? null,
      "stage_status": stageStatus ?? null,
      "dates": dates ?? null,
      "manager": manager ?? null,
      "bill_number": billNumber ?? null,
      "comment": comment ?? null,
      "object_name": objectName ?? null,
    };
    props.on_change_filter_box(newFilterBox);
  }, [
    bidId, companyName, type, protectStatus, stageStatus,
    dates, manager, billNumber, comment, objectName
  ]);

  useEffect(() => {
    if (props.my_bids && props.user_info) {
      setManager(props.user_info.id);
    } else if (!props.my_bids && props.user_info && +manager === +props.user_info.id) {
      setManager(null);
    }
  }, [props.my_bids]);

  useEffect(() => {
    console.log('sortOrders', sortOrders)
    if (props.on_set_sort_orders){
      props.on_set_sort_orders(sortOrders);
    }
  }, [sortOrders]);

  const handlePreviewOpen = (item, state) => {
      console.log('Hello');
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
      }
      if (order === 0){

      } else {
          newSorts.push({key: key, order: order});
      }
      setSortOrders(newSorts);
  }

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
                      <Input type={'number'}
                             size={'small'}
                             style={{width: '100%'}}
                             variant='filled'
                             value={bidId}
                             onChange={(val) => setBidId(val.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <TableHeadNameWithSort
                        sort_key={'company_name'}
                        on_sort_change={handleActivateSorter}
                        active_sort_items={sortOrders}
                    >Название организации
                    </TableHeadNameWithSort>
                    <div className={'sa-pa-3'}>
                      <Input size={'small'}
                             style={{width: '100%'}}
                             variant='filled'
                             value={companyName}
                             onChange={(val) => setCompanyName(val.target.value)}
                      />
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
                      <Select size={'small'}
                              style={{width: '100%'}}
                              variant='filled'
                              value={type}
                              options={props.filter_bid_types}
                              onChange={(val) => setType(val)}
                              allowClear
                      />
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
                      <Select size={'small'}
                              style={{width: '100%'}}
                              variant='filled'
                              value={protectStatus}
                              options={props.filter_protection_projects}
                              onChange={(val) => setProtectStatus(val)}
                              allowClear
                      />
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
                      <Select size={'small'}
                              style={{width: '100%'}}
                              variant='filled'
                              value={stageStatus}
                              options={props.filter_steps}
                              onChange={(val) => setStageStatus(val)}
                              allowClear
                      />
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
                      <DatePicker size={'small'}
                                  style={{width: '100%'}}
                                  variant='filled'
                                  value={dates}
                                  onChange={(val) => {
                                    if (val) {
                                      setDates([val.startOf('day').unix() * 1000, val.endOf('day').unix() * 1000]);
                                    } else {
                                      setDates(null);
                                    }
                                  }}
                      />
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
                      <Select size={'small'}
                              style={{width: '100%'}}
                              variant='filled'
                              value={manager}
                              options={props.filter_managers}
                              onChange={(val) => setManager(val)}
                              allowClear
                              showSearch
                              optionFilterProp="label"
                              filterOption={(input, option) =>
                                  option.label.toLowerCase().includes(input.toLowerCase())
                              }
                      />
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <div className={'sa-pa-3'}>Счета</div>
                    <div className={'sa-pa-3'}>
                      <Input size={'small'}
                             style={{width: '100%'}}
                             variant='filled'
                             value={billNumber}
                             onChange={(val) => setBillNumber(val.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <div className={'sa-pa-3'}>Комментарий</div>
                    <div className={'sa-pa-3'}>
                      <Input size={'small'}
                             style={{width: '100%'}}
                             variant='filled'
                             value={comment}
                             onChange={(val) => setComment(val.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <div className={'sa-pa-3'}>Объект</div>
                    <div className={'sa-pa-3'}>
                      <Input size={'small'}
                             style={{width: '100%'}}
                             variant='filled'
                             value={objectName}
                             onChange={(val) => setObjectName(val.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <div className={'sa-pa-3'}>Список</div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <div className={'sa-pa-3'}>Файлы</div>
                  </div>
                </div>
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
                company_color={props.base_companies?.find((item) => item.id === bid.id_company)?.color}
            />
        ))}
      </div>
    </div>
  );
};

export default BidListTable;
