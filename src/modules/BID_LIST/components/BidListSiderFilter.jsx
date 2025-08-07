import { Input } from 'antd';
import React, { useEffect, useState } from 'react';


const BidListSiderFilter = (props) => {

  return (
    <div className='sider-body'>
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
        <br />
        <div className={'sider-unit-wrapper'}>
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
  );
};

export default BidListSiderFilter;