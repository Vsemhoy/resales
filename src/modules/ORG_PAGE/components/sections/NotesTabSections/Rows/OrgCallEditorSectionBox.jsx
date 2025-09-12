import React, { useEffect, useState } from 'react';

import { PRODMODE } from '../../../../../../config/config';
import { OM_ORG_FILTERDATA } from '../../../../../ORG_LIST/components/mock/ORGLISTMOCK';
import OrgPageSectionRow, { OPS_TYPE } from '../../OrgPageSectionRow';
import dayjs from 'dayjs';
import { AutoComplete, Input } from 'antd';
import useToken from 'antd/es/theme/useToken';




const OrgCallEditorSectionBox = (props) => {
  const [editMode, seteditMode] = useState(props.edit_mode ? props.edit_mode : false);
  const [filterData, setFilterData] = useState([]);


  // DATA    // DATA      // DATA      // DATA  

  const [id, setId] = useState(null);
  const [org, setOrg] = useState(0);
  const [theme, setTheme] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(dayjs().format('DD-MM-YYYY HH:mm:ss'));
  const [creator, setCreator] = useState(0); // id8staff_list
  const [deleted, setDeleted] = useState(0);

  const [depart, setDepart] = useState(5);
  const [subscriber, setSubscriber] = useState("");
  const [post, setPost] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState("");



  const [departList, setDepartList] = useState([]);

  const [objectResult, setObjectResult] = useState({});

  const [SKIPPER, setSKIPPER] = useState(1);

  const [orgUsers, setOrgUsers] = useState([]);
  const [orgPhones, setOrgPhones] = useState([]);

  const [targetOrgUserId, setTargetOrgUserId] = useState(0);

  // DATA    // DATA      // DATA      // DATA  

  useEffect(() => {
    if (props.data?.id) {
      setObjectResult(props.data);

      setId(props.data.id);
      // if (props.data.id_orgs !== org){
      setOrg(props.data.id_orgs);
      setTheme(props.data.theme);
      setNote(props.data.note);
      setCreator(props.data.id8staff_list);
      setDeleted(props.data.deleted);
      setDepart(props.data.id8ref_departaments);
      setSubscriber(props.data.subscriber);
      setPost(props.data.post);
      setPhone(props.data.phone);
      setResult(props.data.result);
    }
  }, [props.data]);


  useEffect(() => {
    seteditMode(props.edit_mode);
  }, [props.edit_mode]);


  useEffect(() => {
    if (PRODMODE) {


    } else {
      setFilterData(OM_ORG_FILTERDATA);
    }
  }, []);

  useEffect(() => {
    if (props.org_users) {
      setOrgUsers(props.org_users.map((item) => (
        `${item.lastname} ${item.name} ${item.middlename}`
      )));
    }
  }, [props.org_users]); // dependency is correct.


  useEffect(() => {
    if (props.departaments) {

      setDepartList(props.departaments.map((item) => ({
        key: `departa_${item.id}s`,
        value: item.id,
        label: item.name
      })));
    };

  }, [props.departaments]);



  /**
   * Этот злой стейт отвечает за поиск телефонов для выбранного гуся
   */
  useEffect(() => {
    let id = null;
    let of = [];
    if (!props.org_users || !subscriber.trim()) {
      setOrgPhones([]);
      return; // ничего не ищем, если нет данных или пустой ввод
    }

    const searchWords = subscriber
      .toLowerCase()
      .split(' ')
      .filter(word => word.length > 0); // убираем пустые строки

    if (searchWords.length === 0) return;

    const foundUser = props.org_users.find(user => {
      const fullName = `${user.lastname} ${user.name} ${user.middlename}`.toLowerCase();

      // Проверяем, что КАЖДОЕ слово из ввода есть в ФИО
      return searchWords.every(word => fullName.includes(word));
    });

    if (foundUser) {
      console.log('Найден пользователь:', foundUser);
      id = foundUser.id;
      // 👇 Тут можешь сохранить ID или весь объект
      // Например: setSelectedUserId(foundUser.id);
    } else {
      console.log('Пользователь не найден');
      setOrgPhones([]);
      return;
      // setSelectedUserId(null);
    }
    if (foundUser.occupy){
      setPost(foundUser.occupy.trim());
    }

    if (foundUser.contactstelephones.length){
      for (let index = 0; index < foundUser.contactstelephones.length; index++) {
        const element = foundUser.contactstelephones[index];
        of.push(element.number);
      }
    }

    if (foundUser.contactmobiles.length){
      for (let index = 0; index < foundUser.contactmobiles.length; index++) {
        const element = foundUser.contactmobiles[index];
        of.push(element.number);
      }
    }
    setOrgPhones(of);
  }, [subscriber, props.org_users]);





  useEffect(() => {
    console.log('orgUsers', orgUsers)
  }, [orgUsers]);


  const handleChangeData = (changed_data) => {
    console.log('changed_data', changed_data)
    if (changed_data.theme !== undefined) {
      setTheme(changed_data.theme);
    } else if (changed_data.note !== undefined) {
      setNote(changed_data.note);
    } else if (changed_data.id8staff_list !== undefined) {
      setCreator(changed_data.id8staff_list);
    } else if (changed_data.id8ref_departaments !== undefined) {
      setDepart(changed_data.id8ref_departaments);
    } else if (changed_data.subscriber !== undefined) {
      setSubscriber(changed_data.subscriber);
    } else if (changed_data.post !== undefined) {
      setPost(changed_data.post);
    } else if (changed_data.phone !== undefined) {
      setPhone(changed_data.phone);
    } else if (changed_data.result !== undefined) {
      setResult(changed_data.result);
    } 
  }


  useEffect(() => {
    const timer = setTimeout(() => {
      if (objectResult.id == null) {
        // Объект ещё не смонтировался. воизбежание гонок
        return;
      };
      let result = objectResult;
      result.theme = theme;
      result.note = note;

      console.log('result', result)

      if (props.on_change) {
        props.on_change(id, result);
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [theme, note]);


  return (
    <div className={'sk-omt-stack'}
      style={{ borderLeft: '4px solid ' + props.color }}
    >


      <OrgPageSectionRow
        key={'calmet2' + id + props.data._type}
        titles={['Автор', 'Дата']}

        datas={[
          {
            type: 'text',
            value: `${props.data.creator?.surname} ${props.data.creator?.name}  ${props.data.creator?.secondname}`,
            max: 250,
            required: true,
            nullable: false,
            placeholder: '',
            name: '_creator.name',
          },
          {
            type: 'datetime',
            value: date,
            max: 250,
            required: true,
            nullable: false,
            placeholder: '',
            name: '_date',
          },
        ]}
        // on_change={handleChangeData}
        on_blur={handleChangeData}
      />

      <OrgPageSectionRow
        key={'calmet1' + id + props.data._type}
        edit_mode={editMode}
        titles={['Тема', 'Отдел']}
        datas={[
          {
            type: 'text',
            value: theme,
            max: 250,
            required: true,
            nullable: false,
            placeholder: '',
            name: 'theme',
          },
          {
            type: OPS_TYPE.SELECT,
            value: depart ? parseInt(depart) : null,
            max: 9999,
            required: true,
            nullable: false,
            placeholder: '',
            name: 'id8ref_departaments',
            options: departList
          },
        ]}
        // on_change={handleChangeData}
        on_blur={handleChangeData}
      />


      <OrgPageSectionRow
        key={'calmet6' + id + props.data._type}
        titles={['Контактное лицо', 'Должность']}
        edit_mode={editMode}
        datas={[
          {
            type: OPS_TYPE.AUTOCOMPLETE,
            value: subscriber,
            max: 250,
            required: true,
            nullable: false,
            placeholder: '',
            name: 'subscriber',
            // options: ['Maif', 'GALYA', 'ALINA', 'AVIA']
            options: orgUsers,
          },
          {
            type: 'text',
            value: post,
            max: 250,
            required: true,
            nullable: false,
            placeholder: '',
            name: 'post',
          },
        ]}
        // on_change={handleChangeData}
        on_blur={handleChangeData}
      />

      {/* <UserAutoComplete users={orgUsers}/> */}

      <OrgPageSectionRow
        key={'calmet7' + id + props.data._type}
        titles={['Телефон']}
        edit_mode={editMode}
        datas={[
          {
            type: OPS_TYPE.AUTOCOMPLETE,
            value: phone,
            max: 150,
            required: true,
            nullable: false,
            placeholder: '',
            name: 'phone',
            options: orgPhones,
          }
        ]}
        // on_change={handleChangeData}
        on_blur={handleChangeData}
      />

      <OrgPageSectionRow
        key={'calmet3' + id + props.data._type}
        edit_mode={editMode}
        titles={['Заметка']}
        datas={[
          {
            type: OPS_TYPE.TEXTAREA,
            value: note,
            max: null,
            required: true,
            nullable: false,
            placeholder: '',
            name: 'notes',
          },
        ]}
        // on_change={handleChangeData}
        on_blur={handleChangeData}
      />

      <OrgPageSectionRow
        key={'calmet4' + id + props.data._type}
        edit_mode={editMode}
        titles={['Результат']}
        datas={[
          {
            type: OPS_TYPE.TEXTAREA,
            value: result,
            max: null,
            required: true,
            nullable: false,
            placeholder: '',
            name: 'result',
          },
        ]}
        // on_change={handleChangeData}
        on_blur={handleChangeData}
      />

    </div>
  );
};

export default OrgCallEditorSectionBox;




const UserAutoComplete = (props) => {
  const [options, setOptions] = useState([]);
  const [value, setValue] = useState('');

  // Ваш массив с именами пользователей
  // const userNames = ['Иван', 'Петр', 'Мария', 'Анна', 'Сергей'];
  const [userNames, setUserNames] = useState([]);

  useEffect(() => {
    console.log('props.users', props.users);
    if (props.users) {

      setUserNames(props.users.map((item) => (
        item.lastname + " " + item.name + " " + item.middlename
      )))

    }
  }, [props.users]);
  // const userNames = ['Иван', 'Петр', 'Мария', 'Анна', 'Сергей'];

  console.log(props.user);

  const handleSearch = (searchText, context) => {
    // Фильтруем имена по введенному тексту
    let filteredOptions = [];
    if (context) {
      console.log('HAS DATA', context)
      filteredOptions = context.filter(name =>
        name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Форматируем для AntD AutoComplete
    setOptions(
      filteredOptions.map(name => ({
        value: name,
        label: name,
      }))
    );
  };

  const handleChange = (data) => {
    setValue(data);
  };

  return (
    <AutoComplete
      options={options}
      style={{ width: 200 }}
      onSearch={(text) => { handleSearch(text, userNames) }}
      onChange={handleChange}
      value={value}
      placeholder="Введите имя"
      allowClear
      notFoundContent="Имя не найдено"
    >
      <Input />
    </AutoComplete>
  );
};