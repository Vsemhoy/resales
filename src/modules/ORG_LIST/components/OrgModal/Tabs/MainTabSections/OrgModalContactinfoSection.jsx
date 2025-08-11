import React, { useEffect, useState } from 'react';
import OrgModalRow from './OrgModalRow';


const OrgModalContactinfoSection = (props) => {

  return (
    <div className={'sk-omt-stack'}
        style={{borderLeft: '4px solid blueviolet'}}
    >

        <OrgModalRow
            key={'rowfla00322'}
            titles={['Город', 'Регион']}
            datas={['Тестовая карточка организации','Bydfd']}
        />

        <OrgModalRow
            key={'rowfla00323'}
            titles={['Факт адрес', 'Индекс']}
            datas={['Тестовая карточка организации','Bydfd']}
        />

        <OrgModalRow
            key={'rowfla00324'}
            titles={['Юр адрес', 'Комментарий', 'Индекс']}
            datas={['dfas','Bydfd', '']}
        />

        <OrgModalRow
            key={'rowfla00325'}
            titles={['Телефон', 'Добавочный']}
            datas={['Тестовнизации','Bydfd']}
        />

        <OrgModalRow
            key={'rowfla00326'}
            titles={['Электронная почта', 'Комментарий']}
            datas={['Тестганизации','Bydfd']}
        />

        <OrgModalRow
            key={'rowfla00328'}
            titles={['Сайт']}
            datas={['Тестовая карточка ']}
        />

    </div>
  );
};

export default OrgModalContactinfoSection;