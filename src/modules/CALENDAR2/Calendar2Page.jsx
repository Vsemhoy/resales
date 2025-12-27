import { Affix, DatePicker } from 'antd';
import React, { useEffect, useState } from 'react';
import './components/style/calendarpage.css';

const Calendar2Page = (props) => {

  const [userdata, setuserdata] = useState(props?.userdata);
  const [userList, setYserList] = useState([]);




  useEffect(() => {
    if (props?.userdata){
      setuserdata(props.userdata);
    }
  }, [props.userdata]);

const tabNames = [
	{
		link: 'm',
		name: 'Основная информация',
	},
	{ link: 'b', name: 'Счета' },
	{ link: 'o', name: 'КП' },
	{ link: 'p', name: 'Проекты' },
	{ link: 'c', name: 'Встречи/Звонки' },
	{ link: 'n', name: 'Заметки' },
	{ link: 'h', name: 'История' },
];


const eventTypes = [
  {
    id: 0, name: 'Все', color: '#c2cceb', title: 'Вывод всех типов событий', sort_order: 0, real: 0, disabled: 0, noreport: 1,
  },
  {
    id: 1, name: 'КП', color: '#8eaaff', title: 'Создание коммерческого предложения', sort_order: 0, real: 1, disabled: 0,
  },
  {
    id: 2, name: 'Счет', color: '#85ffda', title: 'Создание счета', sort_order: 0, real: 1, disabled: 0,
  },
  {
    id: 3, name: 'Счет к администратору', color: '#52e6b9ff', title: 'Отправка счета к администратору', sort_order: 0, real: 1, disabled: 0,
  },
  {
    id: 4, name: 'Счет к бухгалтеру', color: '#33d1a2ff', title: 'Отправка счета от админа к бухгалтеру', sort_order: 0, real: 1, disabled: 0,
  },
  {
    id: 5, name: 'Счет к завершен', color: '#09af7dff', title: 'Завершение сделки', sort_order: 0, real: 1, disabled: 0,
  },
  {
    id: 6, name: 'Встрача', color: '#f7ed59ff', title: 'Звонки клиентам', sort_order: 1, real: 1, disabled: 0, disabled: 0,
  },
  {
    id: 7, name: 'Звонок', color: '#faa781ff', title: 'Созвон с представителями компании', sort_order: 2, real: 1, disabled: 0,
  },
  {
    id: 8, name: 'Запрос на кураторство', color: '#7997faff', title: 'Запрос на кураторство', sort_order: 3, real: 1, disabled: 0,
  },
  {
    id: 9, name: 'Взятие кураторства', color: '#59e5f7ff', title: 'Взял кураторство над компанией', sort_order: 4, real: 1, disabled: 0,
  },
  {
    id: 10, name: 'Заметка', color: '#d38efcff', title: 'Какая-то информация по компании', sort_order: 5, real: 1, disabled: 0, disabled: 0,
  },
    {
    id: 11, name: 'Добавление Контакта', color: '#ca6f7e', title: 'Добавил контакт в карточку клиента', sort_order: 6, real: 1, disabled: 0,
  },
    {
    id: 12, name: 'Обновление контакта', color: '#dfa4adff', title: 'Обновил данные в карточке клиента', sort_order: 7, real: 1, disabled: 0,
  },
    {
    id: 13, name: 'Проект', color: '#5554aaff', title: 'Внесение в базу проекта', sort_order: 8, real: 1, disabled: 0,
  },
  {
    id: 14, name: 'Мои заметки', color: '#7c636fff', title: 'Приватные заметки могу читать только я', sort_order: 8, real: 1, noreport: 1,  disabled: 0,
  },
    {
    id: 15, name: 'Публичные заметки', color: '#7c636fff', title: 'Заметки, которые видны всем', sort_order: 8, real: 1, disabled: 0,
  },
  {
    id: 16, name: 'Любая активность', color: '#ccf04aff', title: 'Сотрудник что-то делал', sort_order: 8, real: 0, disabled: 0, noreport: 1,
  },
];

  return (
    	<div className="app-page">
				<div className="sa-calendar-body sa-mw-1900">
        		<Affix offsetTop={0}>
					<div className="sa-orgpage-header" style={{ paddingTop: '4px', paddingBottom: '4px' }}>
						<div className={'sa-flex-space'}>
							<div className={'sa-flex-space'}>
							asdfa
							</div>
							<div></div>
							<div className={'sa-orp-menu'}>
							fasdfas

							</div>
							fasdf
						</div>
					</div>
          </Affix>

      <div className={'sa-calendar-page-columns'}>
        <div className={'sa-calendar-sider'}>
            <div>
              
            </div>
        </div>
        <div className={'sa-calendar-contenter'}>
          gsdkajfkls

        </div>


      </div>


      </div>




    </div>

  );
};

export default Calendar2Page;