import { PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Affix, Button, Input } from 'antd';
import React, { useEffect, useState } from 'react';


const BidListSiderFilters = (props) => {

  return (
    <Affix offsetTop={115}>
        <div className='sider-body sider-body-filters'>
            <div className={'sider-unit'}>
                <div className='sider-unit-title'>Контактное лицо</div>
                <div className='sider-unit-control'>
                    <Input placeholder='имя, телефон, заметка'
                        allowClear

                    />
                </div>
            </div>

            <div className={'sider-unit'}>
                <div className='sider-unit-title'>Источник</div>
                <div className='sider-unit-control'>
                    <Input
                        allowClear

                    />
                </div>
            </div>

            <div className={'sider-unit'}>
                <div className='sider-unit-title'>Лицензии и допуски</div>
                <div className='sider-unit-control'>
                    <Input
                        allowClear

                    />
                </div>
            </div>
            <div className={'sider-unit'}>
                <div className='sider-unit-title'>Дата снятия кураторства</div>
                <div className='sider-unit-control'>
                    <Input
                        allowClear

                    />
                </div>
            </div>
        </div>
    </Affix>
  );
};

export default BidListSiderFilters;