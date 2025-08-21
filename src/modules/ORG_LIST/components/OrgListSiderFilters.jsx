import { PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Affix, Button, DatePicker, Input, Select } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';


const OrgListSiderFilter = (props) => {
    const [filterPresetList, setFilterPresetList] = useState(props.filter_presets);

    const [baseFilterList, setBaseFilterList] = useState(props.base_filters);
   

    const [filterCompany, setFilterCompany] = useState(null);
    const [filterName, setFilterName] = useState(null);
    const [filterRegion, setFilterRegion] = useState(null);
    // const [filterTown, setFilterTown] = useState(null);

    const [filterAddress,      setFilterAddress] = useState(null);
    const [filterProfile,      setFilterProfile] = useState(null);
    const [filterContactFace,  setFilterContactFace] = useState(null);
    const [filterPriceStatus,  setFilterPriceStatus] = useState(null);
    const [filterLists,        setFilterLists] = useState(null);
    const [filterStatus,       setFilterStatus] = useState(null);
    const [filterProfsound,    setFilterProfsound] = useState(null);
    const [filterPhone,        setFilterPhone] = useState(null);
    const [filterEmail,        setFilterEmail] = useState(null);
    const [filterWebsite,      setFilterWebsite] = useState(null);
    const [filterCreatedAt,    setFilterCreatedAt] = useState([null, null]);
    const [filterUpdatedAt,    setFilterupdatedAt] = useState([null, null]);

    const [listProfiles, setListProfiles] = useState([]);
    const [listStatuses, setListStatuses] = useState([]);
    const [listLists, setListLists] = useState([]);
    const [listProfSound, setListProfSound] = useState([]);
    const [listPrices, setListPrices] = useState([]);
    const [listRegions, setListRegions] = useState([]);
    const [listClientStatuses, setListClientStatuses] = useState([]);


    useEffect(() => {
        console.log('filterCompany', filterCompany)
    }, [filterCompany]);

    useEffect(() => {
        // Создаём отложенную отправку через setTimeout
        const timer = setTimeout(() => {
            let filterBox = props.filterBox ?? {};
    
            filterBox.companies       = toNullable(filterCompany);
            filterBox.address         = toNullable(filterAddress);
            filterBox.contact_user    = toNullable(filterContactFace);
            filterBox.email           = toNullable(filterEmail);
            filterBox.phone           = toNullable(filterPhone);
            filterBox.regions         = toNullable(filterRegion);
            filterBox.price_statuses  = toNullable(filterPriceStatus);
            filterBox.client_statuses = toNullable(filterStatus);
            filterBox.site            = toNullable(filterWebsite);
            filterBox.profiles        = toNullable(filterProfile);
            filterBox.profsound       = toNullable(filterProfsound);
            filterBox.created_date    = filterCreatedAt;
            filterBox.updated_date    = filterUpdatedAt;
            filterBox.rate_lists      = toNullable(filterLists)

    
            if (props.on_change_filters) {
                props.on_change_filters(filterBox);
            }
        }, 1000); // ⏱️ 1 секунда задержки
    
        // Очищаем таймер, если эффект пересоздаётся (чтобы не было утечек)
        return () => clearTimeout(timer);
        }, [ filterCompany,
            filterAddress,    
            filterProfile,    
            filterContactFace,
            filterPriceStatus,
            filterLists,      
            filterStatus,     
            filterProfsound,  
            filterPhone,      
            filterEmail,      
            filterWebsite,    
            filterCreatedAt,  
            filterUpdatedAt,
            filterRegion,
         ]);


        useEffect(() => {
            console.log('props.init_filters', props.init_filters)
            if (props.init_filters){
                if (props.init_filters.companies){
                    setFilterCompany(parseInt(props.init_filters.companies));
                };
                if (props.init_filters.regions){
                    setFilterRegion(parseInt(props.init_filters.regions));
                };
                if (props.init_filters.profsound){
                    setFilterProfsound(parseInt(props.init_filters.profsound));
                };
                if (props.init_filters.rate_lists){
                    setFilterLists(parseInt(props.init_filters.rate_lists));
                };
                if (props.init_filters.client_statuses){
                    setFilterStatus(parseInt(props.init_filters.client_statuses));
                };
                if (props.init_filters.profiles){
                    setFilterProfile(parseInt(props.init_filters.profiles));
                };
                if (props.init_filters.price_statuses){
                    setFilterPriceStatus(parseInt(props.init_filters.price_statuses));
                };

                if (props.init_filters.address){
                    setFilterAddress(props.init_filters.address);
                };
                if (props.init_filters.contact_user){
                    setFilterContactFace(props.init_filters.contact_user);
                };

                if (props.init_filters.email){
                    setFilterEmail(props.init_filters.email);
                };
                if (props.init_filters.phone){
                    setFilterPhone(props.init_filters.phone);
                };
                if (props.init_filters.name){
                    setFilterName(props.init_filters.name);
                };
                if (props.init_filters.site){
                    setFilterWebsite(props.init_filters.site);
                };

                if (props.init_filters.created_date){
                    setFilterCreatedAt([ dayjs(props.init_filters.created_date[0]), dayjs(props.init_filters.created_date[1])]);
                };
                if (props.init_filters.updated_date){
                    setFilterupdatedAt([ dayjs(props.init_filters.updated_date[0]), dayjs(props.init_filters.updated_date[1])]);
                };
            };
        }, [props.init_filters]);





        useEffect(() => {
            console.log('rops.base_filters', props.base_filters);
          if (props.base_filters === null || props.base_filters === undefined || props.base_filters.price_statuses === null){return;};
            setListPrices(props.base_filters.price_statuses.map((item)=>(
                {
                    key: `clistat_${item.id}`,
                    value: item.value,
                    label: item.name
                }
            )));

            setListRegions(props.base_filters.regions.map((item)=>(
                {
                    key: `clistat2_${item.id}`,
                    value: item.value,
                    label: item.name
                }
            )));
            
            setListPrices(props.base_filters.price_statuses.map((item)=>(
                {
                    key: `clistat3_${item.id}`,
                    value: item.value,
                    label: item.name
                }
            )));

            setListProfiles(props.base_filters.profiles.map((item)=>(
                {
                    key: `clistat4_${item.id}`,
                    value: item.value,
                    label: item.name
                }
            )));

            setListProfSound(props.base_filters.profsound.map((item)=>(
                {
                    key: `clistat5_${item.key}`,
                    value: item.value,
                    label: item.label
                }
            )));

            setListClientStatuses(props.base_filters.client_statuses.map((item)=>(
                {
                    key: `clistat6_${item.id}`,
                    value: item.value,
                    label: item.name
                }
            )));

            setListLists(props.base_filters.rate_lists.map((item)=>(
                {
                    key: `clistat6_${item.id}`,
                    value: item.value,
                    label: item.name
                }
            )));

        }, [props.base_filters]);




    // Утилита: если строка пустая — возвращаем null
    const toNullable = (value) => {
    return value === '' || value === null || value === undefined ? null : value;
    };

  return (
    <Affix offsetTop={0}>
    <div className='sider-body'>

        <div className={'sider-unit'}>
            <div className='sider-unit-title'>Компания</div>
            <div className='sider-unit-control'>
                <Select  style={{ width: '100%' }}
                    options={props.companies} allowClear
                    value={filterCompany}
                    onChange={setFilterCompany}
                 />

            </div>
        </div>

        <div className={'sider-unit'}>
            <div className='sider-unit-title'>Контактное лицо</div>
            <div className='sider-unit-control'>
                <Input placeholder='имя, телефон, заметка' 
                    allowClear
                    value={filterContactFace}
                    onChange={(ev)=> {setFilterContactFace(ev.target.value)}}
                />
            </div>
        </div>

        <div className={'sider-unit'}>
            <div className='sider-unit-title'>Регион</div>
            <div className='sider-unit-control'>
                <Select  style={{ width: '100%' }}
                    options={listRegions} 
                    allowClear
                    value={filterRegion}
                    onChange={setFilterRegion}
                 />
            </div>
        </div>

        <div className={'sider-unit'}>
            <div className='sider-unit-title'>Адрес</div>
            <div className='sider-unit-control'>
                <Input placeholder='имя, телефон, заметка' 
                    allowClear
                    value={filterAddress}
                    onChange={(ev)=> {setFilterAddress(ev.target.value)}}
                />
            </div>
        </div>

        <div className={'sider-unit'}>
            <div className='sider-unit-title'>Профиль</div>
            <div className='sider-unit-control'>
                <Select  style={{ width: '100%' }}
                    options={listProfiles}
                    allowClear
                    value={filterProfile}
                    onChange={setFilterProfile}
                 />
            </div>
        </div>

        <div className={'sider-unit'}>
            <div className='sider-unit-title'>Статус цен</div>
            <div className='sider-unit-control'>
                <Select style={{ width: '100%' }}
                    allowClear
                    value={filterPriceStatus}
                    onChange={setFilterPriceStatus}
                    options={listPrices}
                 />
            </div>
        </div>

        <div className={'sider-unit'}>
            <div className='sider-unit-title'>Списки</div>
            <div className='sider-unit-control'>
                <Select  style={{ width: '100%' }}
                    options={listLists} 
                    allowClear
                    value={filterLists}
                    onChange={setFilterLists}
                 />
            </div>
        </div>

        <div className={'sider-unit'}>
            <div className='sider-unit-title'>Статус</div>
            <div className='sider-unit-control'>
                <Select  style={{ width: '100%' }}
                    options={listClientStatuses}
                    allowClear
                    value={filterStatus}
                    onChange={setFilterStatus}
                 />
            </div>
        </div>


        <div className={'sider-unit'}>
            <div className='sider-unit-title'>Профзвук</div>
            <div className='sider-unit-control'>
                <Select  style={{ width: '100%' }}
                    options={listProfSound} 
                    allowClear
                    value={filterProfsound}
                    onChange={setFilterProfsound}
                 />
            </div>
        </div>

        <div className={'sider-unit'}>
            <div className='sider-unit-title'>Телефон</div>
            <div className='sider-unit-control'>
                <Input placeholder='имя, телефон, заметка' 
                    allowClear
                    value={filterPhone}
                    onChange={(ev)=> {setFilterPhone(ev.target.value)}}
                />
            </div>
        </div>

        <div className={'sider-unit'}>
            <div className='sider-unit-title'>Электронная почта</div>
            <div className='sider-unit-control'>
                <Input placeholder='имя, телефон, заметка' 
                    allowClear
                    value={filterEmail}
                    onChange={(ev)=> {setFilterEmail(ev.target.value)}}
                />
            </div>
        </div>

        <div className={'sider-unit'}>
            <div className='sider-unit-title'>Вебсайт</div>
            <div className='sider-unit-control'>
                <Input placeholder='имя, телефон, заметка' 
                    allowClear
                    value={filterWebsite}
                    onChange={(ev)=> {setFilterWebsite(ev.target.value)}}
                />
            </div>
        </div>

        <div className={'sider-unit'}>
            <div className='sider-unit-title'>Дата создания</div>
            <div className='sider-unit-control'>
                <DatePicker.RangePicker 
                    value={filterCreatedAt}
                    allowClear
                    onChange={setFilterCreatedAt}
                />
            </div>
        </div>

        <div className={'sider-unit'}>
            <div className='sider-unit-title'>Дата последнего обновления</div>
            <div className='sider-unit-control'>
                <DatePicker.RangePicker 
                    value={filterUpdatedAt}
                    allowClear
                    onChange={setFilterupdatedAt}
                />
            </div>
        </div>

       
        <br />
        <div className={'sider-unit-wrapper'} style={{display: 'none'}}>
            <div className='sider-unit-wrapper-title'><span>Кураторство</span></div>
            <div className={'sider-unit'}>
                <div className='sider-unit-title'>Дата снятия кураторства</div>
                <div className='sider-unit-control'>
                    <Input 
                        allowClear

                    />
                </div>
            </div>


            <div className={'sider-unit'}>
                <div className='sider-unit-title'>Name of the...</div>
                <div className='sider-unit-control'>
                    <Input 
                        allowClear

                    />
                </div>
            </div>

            <div className={'sider-unit'}>
                <div className='sider-unit-title'>Name of the...</div>
                <div className='sider-unit-control'>
                    <Input 
                        allowClear

                    />
                </div>
            </div>
        </div>

       


         <div className={'sider-unit-wrapper'}  style={{display: 'none'}}>
            <div className='sider-unit-wrapper-title'><span>Мои фильтры</span></div>
            <div className={'sider-unit'}>
                <div className='sider-unit-title'>Сохранить фильтр</div>
                <div className='sider-unit-control'>
                    <div className='sa-flex-space'>
                    <Input 
                        allowClear
                        placeholder='Мой регион'
                    />
                    <Button
                        icon={<PlusCircleIcon height={'18px'} />}
                    >

                    </Button>
                    </div>
                </div>

            </div>
            <div>
                {filterPresetList.map((item)=>(
                    <div className={'filter-preset-item sa-flex-space'}>
                        <div  className='filter-preset-item-label'>
                            {item.label}
                        </div>
                        <span className='filter-preset-item-remover'>
                            <TrashIcon height={'18px'} />
                        </span>
                    </div>
                ))}
            </div>

        </div>

    </div>
    </Affix>
  );
};

export default OrgListSiderFilter;