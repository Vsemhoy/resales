import React, { useEffect, useState } from 'react';
import OrgModalRow from './OrgModalRow';


const OrgModalContactsTab = (props) => {

    const [contactId, setcontactId] = useState(props.id);

    useEffect(() => {
      setcontactId(props.id);
    }, [props]);

 return (
    <div className={'sk-omt-stack'}>

        <OrgModalRow
            key={contactId + 'rowfla00722'}
            titles={['Имя', 'Отчество']}
            datas={['Юзернейм','Суворович']}
        />

        <OrgModalRow
            key={contactId + 'rowfla00723'}
            titles={['Фамилия','Должность']}
            datas={['Пряников','Большой человек']}
        />

        <OrgModalRow
            key={contactId + 'rowfla00724'}
            titles={['Комментарий']}
            datas={['Здесь данныз нет']}
        />

        <OrgModalRow
            key={contactId + 'rowfla00725'}
            titles={['Телефон','Комментарий']}
            datas={['5234234523', '']}
            comment={"Здесь будет длинный комментарий ли очень длинный"}
        />

        <OrgModalRow
            key={contactId + 'rowfla00726'}
            titles={['Мобильный телефон','Комментарий']}
            datas={['4356345', '']}
        />

        <OrgModalRow
            key={contactId + 'rowfla00727'}
            titles={['Электронная почта','Комментарий']}
            datas={['step@by.step', 'until blind']}
        />

        <OrgModalRow
            key={contactId + 'rowfla00728'}
            titles={['Мероприятия','Комментарий']}
            datas={['', '']}
        />

        <OrgModalRow
            key={contactId + 'rowfla00729'}
            titles={['Участие в рассылке']}
            datas={['Ничего не получает']}
        />

        <OrgModalRow
            key={contactId + 'rowfla00730'}
            titles={['Дата','Комментарий']}
            datas={['сегодня', '']}
        />

        <OrgModalRow
            key={contactId + 'rowfla00731'}
            titles={['Работает?','Ушел в организацию']}
            datas={['да', '']}
        />


    </div>
  );
};

export default OrgModalContactsTab;