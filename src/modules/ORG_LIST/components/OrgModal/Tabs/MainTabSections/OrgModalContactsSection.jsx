import React, { useEffect, useState } from 'react';
import OrgModalRow from './OrgModalRow';

const OrgModalContactsSection = (props) => {
	const [contactId, setcontactId] = useState(props.id);

	const [contactData, setContactData] = useState({});

	const workString = (id) => {
		if (id < 1) {
			return 'Уволен';
		}
		if (id === 1) {
			return 'Работает';
		}
		return 'Перешел в другую компанию';
	};

	useEffect(() => {
		setcontactId(props.id);
		setContactData(props.data);
	}, [props]);

	return (
		<div className={'sk-omt-stack'} style={{ borderLeft: '4px solid orange' }}>
			<OrgModalRow
				key={contactId + 'rowfla00722'}
				titles={['Имя', 'Отчество']}
				datas={[contactData?.name, contactData?.middlename]}
			/>

			<OrgModalRow
				key={contactId + 'rowfla00723'}
				titles={['Фамилия', 'Должность']}
				datas={[contactData?.lastname, contactData?.occupy]}
			/>

			<OrgModalRow
				key={contactId + 'rowfla00724'}
				titles={['Комментарий']}
				datas={[contactData?.comment]}
			/>

			{contactData?.contactstelephones &&
				contactData?.contactstelephones.map((item) => (
					<OrgModalRow
						key={contactId + 'rowfla00725' + item.id}
						titles={['Телефон', 'Доб.']}
						datas={[item.number, item.ext]}
						comment={item.comment}
					/>
				))}

			{contactData?.contactmobiles &&
				contactData?.contactmobiles.map((item) => (
					<OrgModalRow
						key={contactId + 'rowfla00726' + item.id}
						titles={['Мобильный телефон', 'Комментарий']}
						datas={[item.number, item.comment]}
					/>
				))}

			{contactData?.contacthomephones &&
				contactData?.contacthomephones.map((item) => (
					<OrgModalRow
						key={contactId + 'rowfla007260' + item.id}
						titles={['Домашний телефон', 'Комментарий']}
						datas={[item.number, item.comment]}
					/>
				))}

			{contactData?.contactemails &&
				contactData?.contactemails.map((item) => (
					<OrgModalRow
						key={contactId + 'rowfla00727' + item.id}
						titles={['Электронная почта', 'Комментарий']}
						datas={[item.email, item.comment]}
					/>
				))}

			{contactData?.C &&
				contactData?.contactspls.map((item) => (
					<OrgModalRow
						key={contactId + 'rowfla00727' + item.id}
						titles={['Электронная почта', 'Комментарий']}
						datas={[item.email, item.comment]}
					/>
				))}

			{contactData?.C &&
				contactData?.contactspls.map((item) => (
					<OrgModalRow
						key={contactId + 'rowfla00727' + item.id}
						titles={['Электронная почта', 'Комментарий']}
						datas={[JSON.stringify(item)]}
					/>
				))}

			{/* 
        <OrgModalRow
            key={contactId + 'rowfla00728'}
            titles={['Мероприятия','Комментарий']}bbbbbbbbb
            datas={['', '']}
        /> */}

			<OrgModalRow
				key={contactId + 'rowfla00729'}
				titles={['Участие в рассылке']}
				datas={[contactData?.unsubscribe < 1 ? 'Разрешено' : 'Запрещено']}
			/>

			<OrgModalRow
				key={contactId + 'rowfla00730'}
				titles={['Дата', 'Комментарий']}
				datas={['сегодня', '']}
			/>

			<OrgModalRow
				key={contactId + 'rowfla00731'}
				titles={['Статус', 'Ушел в организацию']}
				datas={[workString(contactData?.job), contactData?.exittoorg]}
			/>
		</div>
	);
};

export default OrgModalContactsSection;
