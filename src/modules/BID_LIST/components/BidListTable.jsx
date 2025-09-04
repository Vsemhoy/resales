import { Affix, DatePicker, Input, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import TableHeadNameWithSort from '../../../components/template/TABLE/TableHeadNameWithSort';
import BidListRow from './BidListRow';
import dayjs from "dayjs";


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
    const timer = setTimeout((filterBox) => {
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
      console.log(newFilterBox)
      props.on_change_filter_box(newFilterBox);
    }, 700); // ⏱️ 1 секунда задержки
    return () => clearTimeout(timer);
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

  useEffect(() => {
    if (!arraysEqualIgnoreOrder(props.order_box, sortOrders)) {
      setSortOrders(props.order_box);
    }
  }, [props.order_box]);

  const arraysEqualIgnoreOrder = (arr1, arr2) => {
    if (arr1.length !== arr2.length) {
      return false;
    }

    // Создаем копии и сортируем по key для consistent comparison
    const sorted1 = [...arr1].sort((a, b) => a.key - b.key);
    const sorted2 = [...arr2].sort((a, b) => a.key - b.key);

    // Сравниваем каждый объект
    for (let i = 0; i < sorted1.length; i++) {
      if (sorted1[i].key !== sorted2[i].key || sorted1[i].order !== sorted2[i].order) {
        return false;
      }
    }

    return true;
  }

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
              <div className={'sa-table-box-bids sa-table-box-row'} style={{boxShadow: '-10px 0 0 -1px #b4c9e1'}}>
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
                             allowClear
                             value={bidId}
                             onChange={(val) => (val.target.value && +val.target.value !== 0) ? setBidId(val.target.value) : setBidId(null)}
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
                             allowClear
                             value={companyName}
                             onChange={(val) => (val.target.value && +val.target.value !== 0) ? setCompanyName(val.target.value) : setCompanyName(null)}
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
                                  allowClear
                                  value={dates ? dayjs.unix(dates) : null}
                                  onChange={(date, dateString) => {
                                    console.log(date)
                                    console.log(dateString)
                                    setDates(date ? date.unix() : null);
                                  }}
                                  format="DD.MM.YYYY"
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
                             allowClear
                             value={billNumber}
                             onChange={(val) => (val.target.value && +val.target.value !== 0) ? setBillNumber(val.target.value) : setBillNumber(null)}
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
                             allowClear
                             value={comment}
                             onChange={(val) => (val.target.value && +val.target.value !== 0) ? setComment(val.target.value) : setComment(null)}
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
                             allowClear
                             value={objectName}
                             onChange={(val) => (val.target.value && +val.target.value !== 0) ? setObjectName(val.target.value) : setObjectName(null)}
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
