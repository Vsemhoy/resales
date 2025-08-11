import { PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Affix, Button, DatePicker, Input, Select } from 'antd';
import React, { useEffect, useState } from 'react';


const OrgListSiderFilter = (props) => {
    const [filterPresetList, setFilterPresetList] = useState(props.filter_presets);




    const [filterCompany, setFilterCompany] = useState(null);
    const [filterName, setFilterName] = useState(null);
    const [filterRegion, setFilterRegion] = useState(null);
    const [filterTown, setFilterTown] = useState(null);

    const [filterAddress, setFilterAddress] = useState(null);
    const [filterProfile, setFilterProfile] = useState(null);
    const [filterContactFace,  setFilterContactFace] = useState(null);
    const [filterPriceStatus, setFilterPriceStatus] = useState(null);
    const [filterLists,        setFilterLists] = useState(null);
    const [filterStatus,       setFilterStatus] = useState(null);
    const [filterProfsound,    setFilterProfsound] = useState(null);
    const [filterPhone,        setFilterPhone] = useState(null);
    const [filterEmail,        setFilterEmail] = useState(null);
    const [filterWebsite,      setFilterWebsite] = useState(null);
    const [filterCreatedAt,    setFilterCreatedAt] = useState([null, null]);
    const [filterUpdatedAt,    setFilterupdatedAt] = useState([null, null]);


    useEffect(() => {
        console.log('filterCompany', filterCompany)
    }, [filterCompany]);

    useEffect(() => {
        // Создаём отложенную отправку через setTimeout
        const timer = setTimeout(() => {
            let filterBox = props.base_filters ?? {};
    
            filterBox.companies = toNullable(filterCompany);
            // filterBox.towns = toNullable(filterTown);
            // filterBox.id = toNullable(filterId);
            // filterBox.name = toNullable(filterName);
            // filterBox.inn = toNullable(filterInn);
            // filterBox.comment = toNullable(filterComment);
            // filterBox.curator = toNullable(filterCurator); // если нужен
    
            if (props.on_change_filters) {
                props.on_change_filters(filterBox);
            }
        }, 1000); // ⏱️ 1 секунда задержки
    
        // Очищаем таймер, если эффект пересоздаётся (чтобы не было утечек)
        return () => clearTimeout(timer);
        }, [
            filterCompany
        ]);


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
                    options={props.companies} allowClear
                    value={filterProfile}
                    onChange={setFilterProfile}
                 />
            </div>
        </div>

        <div className={'sider-unit'}>
            <div className='sider-unit-title'>Статус цен</div>
            <div className='sider-unit-control'>
                <Select  style={{ width: '100%' }}
                    options={props.companies} allowClear
                    value={filterPriceStatus}
                    onChange={setFilterPriceStatus}
                 />
            </div>
        </div>

        <div className={'sider-unit'}>
            <div className='sider-unit-title'>Списки</div>
            <div className='sider-unit-control'>
                <Select  style={{ width: '100%' }}
                    options={props.companies} allowClear
                    value={filterLists}
                    onChange={setFilterLists}
                 />
            </div>
        </div>

        <div className={'sider-unit'}>
            <div className='sider-unit-title'>Статус</div>
            <div className='sider-unit-control'>
                <Select  style={{ width: '100%' }}
                    options={props.companies} allowClear
                    value={filterStatus}
                    onChange={setFilterStatus}
                 />
            </div>
        </div>


        <div className={'sider-unit'}>
            <div className='sider-unit-title'>Профзвук</div>
            <div className='sider-unit-control'>
                <Select  style={{ width: '100%' }}
                    options={props.companies} allowClear
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
                    value={filterCreatedAt}
                    allowClear
                    onChange={setFilterCreatedAt}
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