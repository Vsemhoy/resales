import React, { useEffect, useState } from 'react';

import { PRODMODE } from '../../../../../../config/config';
import { OM_ORG_FILTERDATA } from '../../../../../ORG_LIST/components/mock/ORGLISTMOCK';
import OrgPageSectionRow, { OPS_TYPE } from '../../OrgPageSectionRow';
import dayjs from 'dayjs';
import { AutoComplete, Input } from 'antd';
import useToken from 'antd/es/theme/useToken';
import { FaceFrownIcon } from '@heroicons/react/24/solid';




const OrgCallEditorSectionBox = (props) => {
  const [editMode, seteditMode] = useState(props.edit_mode ? props.edit_mode : false);
  const [filterData, setFilterData] = useState([]);


  // DATA    // DATA      // DATA      // DATA  

  const [id, setId] = useState(null);
  const [org,         setOrg] = useState(0);
  const [theme,       setTheme] = useState("");
  const [note,        setNote] = useState("");
  const [date,        setDate] = useState(dayjs().format('DD-MM-YYYY HH:mm:ss'));
  const [creator,     setCreator] = useState(0); // id8staff_list
  const [deleted,     setDeleted] = useState(0);

  const [depart,      setDepart] = useState(5);
  const [subscriber, setSubscriber] = useState("");
  const [post,       setPost] = useState("");
  const [phone,      setPhone] = useState("");
  const [addPhone,      setAddPhone] = useState("");
  const [result,     setResult] = useState("");
  const [nexCallDate, setNextCallDate] = useState(null);
  const [nexType, setNextType] = useState(null);

  const [saveContact, setSaveContact] = useState(false);


  const [departList, setDepartList] = useState([]);

  const [objectResult, setObjectResult] = useState({});

  const [SKIPPER, setSKIPPER] = useState(1);

  const [orgUsers, setOrgUsers] = useState([]);
  const [orgPhones, setOrgPhones] = useState([]);

  const [targetOrgUserId, setTargetOrgUserId] = useState(0);

  const [trigger, setTrigger] = useState(0);
  const [prevPhone, setPrevPhone] = useState(null);
  // DATA    // DATA      // DATA      // DATA  

  const bracketSplitter = (number) => {
    let pho = '';
    let add = '';

    const splitter = "(";
    let result = number.split(splitter);

    if (result[0] && result[0].trim() !== "")
    {
      pho = result[0].trim();
      
      if (result[1] && result[1] !== ''){
        add = result[1].replace(')', '').trim();
      }

    } else {
      pho = number;
    }
    console.log('SPLITAK', {number: pho, add: add});
    return {number: pho, add: add};
  }

  useEffect(() => {
    if (props.data?.id) {
      setObjectResult(props.data);
      setId(props.data.id);
      // if (props.data.id_orgs !== org){
      setOrg(props.data.id_orgs);
      setTheme(props.data.theme);
      setNote(props.data.note);
      setDate(props.data.date);
      setCreator(props.data.id8staff_list);
      setDeleted(props.data.deleted);
      setDepart(props.data.id8ref_departaments);
      setSubscriber(props.data.subscriber);
      setPost(props.data.post);
      let phn = bracketSplitter(props.data.phone);

      let pho = phn.number;
      let add = phn.add;

      console.log(phn);

      setPhone(pho);
      setAddPhone(add);

      setResult(props.data.result);
      setNextCallDate(props.data?.next_call_date ? props.data?.next_call_date : null);
      setNextType(props.next_type?.next_type ? props.data?.next_type : null);
      setSaveContact(props.data?._savecontact ? props.data?._savecontact : false);
      setTimeout(() => {
        setPrevPhone(pho);
      }, 1000);
    }
  }, [props.data]);


  useEffect(() => {
    console.log('SET SAVE CONTACT', saveContact)
  }, [saveContact]);


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
     
      let usess = [];
      let uids = [];
      let fusers = props.org_users.filter((item)=>
        !(!item.lastname && !item.name && !item.middlename)
      );

      for (let i = 0; i < fusers.length; i++) {
        const element = fusers[i];
        if (!uids.includes(element.id)){
          let nm = `${(element.lastname ? element.lastname : "") + (element.lastname ? ' ' : '') +  (element.name ? element.name : "") + (element.name ? ' ' : '') + (element.middlename ? element.middlename : '') }`;
          usess.push({
            key: 'kjfealllo' + element.id,
            value: element.value,
            label: nm
          });
        }
      }
      setOrgUsers(usess);
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

  const nexVariants = [
    {
      key: 'Vareifa_5432',
      value: 'call',
      label: 'Звонок'
    },
        {
      key: 'Marofo_5432',
      value: 'meeting',
      label: 'Встреча'
    }
  ];


  /**
   * Этот злой стейт отвечает за поиск телефонов для выбранного гуся
   */
  useEffect(() => {
    let id = null;
    let of = [];
    setTargetOrgUserId(null);
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
      setTargetOrgUserId(id);
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
        console.log('contactstelephones', element);
        if (!of.includes(element.number) && element.number !== null){
          let ltlt = element.number + `${element.ext !== null && element.ext !== "" ? (" (" + element.ext + ")") : ""}`;
          // let vall = element.number + `${element.number !== null && element.number !== '' &&
          //    element.ext !== null && element.ext !== "" ? ("," + element.ext ) : ""}`;
          of.push({
            key: 'fofodfofof_' + element.id,
            value: ltlt,
            label:  ltlt,
          });
        }
      }
    }

    if (foundUser.contactmobiles.length){
      for (let index = 0; index < foundUser.contactmobiles.length; index++) {
        const element = foundUser.contactmobiles[index];
        if (!of.includes(element.number) && element.number !== null){
        of.push({
          key: 'fofofofof_' + element.id,
          value: element.number,
          label: element.number,
        });
        }
      }
    }
    setOrgPhones(of);
  }, [subscriber, props.org_users, id, trigger]);





  // useEffect(() => {
  //   console.log('orgUsers', orgUsers)
  // }, [orgUsers]);


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
      setPost(changed_data.post.trim());
      } else if (changed_data.date !== undefined) {
      setDate(changed_data.date);

    } else if (changed_data.result !== undefined) {
      setResult(changed_data.result);
    }  else if (changed_data._savecontact !== undefined) {
      setSaveContact(changed_data._savecontact);
    } else if (changed_data.phone !== undefined) {
      let splitak = bracketSplitter(changed_data.phone);
      console.log('splitak', splitak);
        setPhone(splitak.number);
      if (splitak.add){
         setAddPhone(splitak.add);
      }

    }  else if (changed_data.add_phone){
      setAddPhone(changed_data.add_phone);
    }


  }


  useEffect(() => {
    const timer = setTimeout(() => {
      if (objectResult.id == null) {
        // Объект ещё не смонтировался. воизбежание гонок
        return;
      };
      let resultObject = objectResult;
      resultObject.theme = theme;
      resultObject.post = post;
      resultObject.note = note;
      resultObject.subscriber = subscriber;
      resultObject.result = result;
      resultObject.id8ref_departaments = depart;
      resultObject._savecontact = saveContact;
      resultObject.next_call_date = nexCallDate;
      resultObject.next_type = nexType;
      resultObject.phone = phone;

      if (addPhone && addPhone.trim() !== '' && phone && phone.trim() !== ''){
        resultObject.phone = phone + ' (' + addPhone + ')';

      }
      

      if (props.on_change) {
        props.on_change(id, resultObject);
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [
      org,        
      theme,      
      note,       
      creator,    
      depart,     
      subscriber, 
      post,       
      phone,      
      result,     
      saveContact,
      nexCallDate,
      nexType,
      addPhone
  ]);


  const handleChangeNumbers = (ev)=> {
    console.log('ONCHANGER !!!!!!!!!!!', ev.phone);
    if (ev.phone){
      let splitak = bracketSplitter(ev.phone);
      console.log('splitak', splitak.number);
        setPrevPhone(splitak.number);
        setTimeout(() => {
          setPhone(splitak.number);
      }, 300);
      if (splitak.add){
         setAddPhone(splitak.add);
      }
    }
  }


  useEffect(() => {
    if (prevPhone !== null && prevPhone !== phone){
      setAddPhone('');
      setPrevPhone(phone);
    };
  }, [phone]);


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
            type: 'date',
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
            placeholder: 'Фамилия Имя Отчество',
            name: 'subscriber',
            // options: ['Maif', 'GALYA', 'ALINA', 'AVIA']
            options: orgUsers,
            onClick: ()=>{setTrigger(dayjs().unix())}
          },
          {
            type: 'text',
            value: post,
            max: 250,
            required: false,
            nullable: false,
            placeholder: '',
            name: 'post',
          },
        ]}
        // on_change={handleChangeData}
        on_change={(v)=>{setSubscriber(v.subscriber)}}
        on_blur={handleChangeData}
      />

      {/* <UserAutoComplete users={orgUsers}/> */}

      <OrgPageSectionRow
        key={'calmet7' + id + props.data._type}
        titles={['Телефон', "Добавочный"]}
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
            onClick: ()=>{setTrigger(dayjs().unix())}
          },
          {
            type: OPS_TYPE.STRING,
            value: addPhone,
            required: false,
            max: 12,
            allowClear: true,
            placeholder: '',
            name: 'add_phone',
          }
        ]}
        on_change={handleChangeNumbers}

        on_blur={handleChangeData}
      />

      {(editMode && subscriber.length > 3 && !targetOrgUserId && phone.length > 3) && (
        <OrgPageSectionRow
          key={'calmet33' + id + props.data._type}
          edit_mode={editMode}
          titles={['Сохранить новый контакт?']}
          datas={[
            {
              type: OPS_TYPE.CHECKBOX,
              value: saveContact,
              placeholder: '',
              name: '_savecontact',
            },
          ]}
          on_change={handleChangeData}
          // on_blur={handleChangeData}
        />
      )}

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
            name: 'note',
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
            required: false,
            nullable: false,
            placeholder: '',
            name: 'result',
            
          },
        ]}
        // on_change={handleChangeData}
        on_blur={handleChangeData}
      />

      <OrgPageSectionRow
        key={'calmet44' + id + props.data._type}
        edit_mode={editMode}
        titles={['Дата следующего контакта', 'Тип след. события']}
        datas={[
          {
            type: OPS_TYPE.DATE,
            value: nexCallDate,
            max: null,
            required: false,
            nullable: true,
            placeholder: '',
            name: 'next_call_date',
          },
          {
            type: OPS_TYPE.SELECT,
            value: nexType,
            required: false,
            allowClear: true,
            name: 'next_type',
            options: nexVariants
          }
        ]}
        on_change={(changed_data)=>{
          if (changed_data.next_call_date !== undefined) {
            setNextCallDate(changed_data.next_call_date);
          } 
          if (changed_data.next_type !== undefined){
            setNextType(changed_data.next_type);
          }
        }}
        // on_blur={handleChangeData}
      />

    </div>
  );
};

export default OrgCallEditorSectionBox;



