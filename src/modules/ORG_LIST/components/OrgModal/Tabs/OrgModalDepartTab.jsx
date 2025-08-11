import React, { useEffect, useState } from 'react';
import OrgModalRow from './OrgModalRow';


const OrgModalDepartTab = (props) => {

  return (
    <div className={'sk-omt-stack'}>

        <OrgModalRow
            key={'rowfla00222'}
            titles={['Автор', 'Куратор']}
            datas={['Тестовая карточка организации','Bydfd']}
        />

        <OrgModalRow
            key={'rowfla00223'}
            titles={['Отдел']}
            datas={['Тестовая карточка организации']}
        />

        <OrgModalRow
            key={'rowfla00224'}
            titles={['Статус $', 'Способ доставки']}
            datas={['Тестовая карточка организации', 'fjsalkdj']}
        />

        <OrgModalRow
            key={'rowfla00225'}
            titles={['Комментарии']}
            datas={['Тестовая карточка организации']}
        />

        <OrgModalRow
            key={'rowfla00226'}
            titles={['Списки', 'Комментарий']}
            datas={['Тестовая карточка организации','fklajdskl']}
        />

        <OrgModalRow
            key={'rowfla00227'}
            titles={['Лицензия МЧС', 'Комментарий', '№ Дата']}
            datas={['монтаж','Бессрочная', '56345']}
            comment={"Здесь будет длинный комментарий ли очень длинный"}
        />

        <OrgModalRow
            key={'rowfla00228'}
            titles={['Допуски СРО','№ Дата']}
            datas={['Строительное...', 'dfkjas']}
            comment={"Здесь будет длинный комментарий ли очень длинный"}
        />


    </div>
  );
};

export default OrgModalDepartTab;