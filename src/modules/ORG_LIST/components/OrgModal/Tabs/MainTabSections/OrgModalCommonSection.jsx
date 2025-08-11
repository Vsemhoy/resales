import React, { useEffect, useState } from 'react';
import OrgModalRow from './OrgModalRow';


const OrgModalCommonSection = (props) => {

  return (
    <div className={'sk-omt-stack'}
    style={{borderLeft: '4px solid seagreen'}}
    >

        <OrgModalRow
            key={'fklasdjl'}
            titles={['Название организации']}
            datas={['Тестовая карточка организации']}
            comment={"Здесь будет длинный комментарий ли очень длинный"}
        />

        <OrgModalRow
            key={'fklasddjl'}
            titles={['Форма собственности', 'ИНН']}
            datas={['Тестовая карточка ', '']}
        />

        <OrgModalRow
        key={'fkl43asdjl'}
            titles={['Вид деятельности']}
            datas={['Тестовая  ']}
        />

        <OrgModalRow
            key={'fkla3sddjl'}
            titles={['Второе название']}
            datas={['Тестова организации']}
        />

        <OrgModalRow
            key={'fkla5sddjl'}
            titles={['Профиль компании', 'Проф звук']}
            datas={['Тестовая карточка организации','']}
        />

        <OrgModalRow
            key={'fklasd6352djl'}
            titles={['Источник']}
            datas={['Тестовая  организации']}
        />

        <OrgModalRow
            key={'fkl452asddjl'}
            titles={['Комментарий']}
            datas={[' карточка организации']}
        />

        <OrgModalRow
            key={'fkla6454sddjl'}
            titles={['Памятка']}
            datas={['Тестовая карточка ']}
        />
        

    </div>
  );
};

export default OrgModalCommonSection;