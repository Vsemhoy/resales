import React, { useEffect, useState } from 'react';
import OrgModalRow from './OrgModalRow';


const OrgModalPayersTab = (props) => {

  return (
    <div className={'sk-omt-stack'}>

        <OrgModalRow
            key={'sthpasdjl'}
            titles={['Название организации']}
            datas={['Тестовая карточка организации']}
            comment={"Здесь будет длинный комментарий ли очень длинный"}
        />

        <OrgModalRow
            key={'sthpasddjl'}
            titles={['Форма собственности', 'ИНН']}
            datas={['Тестовая карточка ', '']}
        />

        <OrgModalRow
        key={'sthp43asdjl'}
            titles={['Вид деятельности']}
            datas={['Тестовая  ']}
        />

        <OrgModalRow
            key={'sthpa3sddjl'}
            titles={['Второе название']}
            datas={['Тестова организации']}
        />

        <OrgModalRow
            key={'sthpa5sddjl'}
            titles={['Профиль компании', 'Проф звук']}
            datas={['Тестовая карточка организации','']}
        />

        <OrgModalRow
            key={'sthpasd6352djl'}
            titles={['Источник']}
            datas={['Тестовая  организации']}
        />

        <OrgModalRow
            key={'sthp452asddjl'}
            titles={['Комментарий']}
            datas={[' карточка организации']}
        />

        <OrgModalRow
            key={'sthpa6454sddjl'}
            titles={['Памятка']}
            datas={['Тестовая карточка ']}
        />
        

    </div>
  );
};

export default OrgModalPayersTab;