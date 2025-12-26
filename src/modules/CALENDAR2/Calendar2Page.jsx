import { DatePicker } from 'antd';
import React, { useEffect, useState } from 'react';

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
    id: 0, name: 'Все', color: '#c2ccebff', title: 'Вывод всех типов событий', sort_order: 0
  },
  
  {
    id: 1, name: 'Встрача', color: '#f7ed59ff', title: 'Звонки клиентам', sort_order: 1
  },
  {
    id: 2, name: 'Звонок', color: '#faa781ff', title: 'Встречи и семинары', sort_order: 2
  },
  {
    id: 3, name: 'Запрос на кураторство', color: '#7997faff', title: 'Звонки клиентам', sort_order: 3
  },
  {
    id: 4, name: 'Взятие кураторства', color: '#59e5f7ff', title: 'Встречи и семинары', sort_order: 4
  },
  {
    id: 5, name: 'Добавление заметки', color: '#d38efcff', title: 'Встречи и семинары', sort_order: 4
  },
    {
    id: 6, name: 'Активность', color: '#e6a4c5ff', title: 'Любые действия', sort_order: 1
  },
]

  return (
    <div>
      <h1>Hello Wolf from Calendar2Page</h1>
      <div>
        <DatePicker.RangePicker picker='week' />
      </div>
    </div>

  );
};

export default Calendar2Page;