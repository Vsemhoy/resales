import React, { useEffect, useState } from 'react';
import TorgPageSectionRow from '../TorgPageSectionRow';
import { Button, DatePicker, Input } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { TORG_CHEVRON_SIZE, TORG_MAX_ROWS_TEXTAREA, TORG_MIN_ROWS_TEXTAREA } from '../TorgConfig';
import { BriefcaseIcon, ChevronDownIcon, ChevronUpIcon, PhoneIcon, TrashIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import { getMonthName } from '../../../../components/helpers/TextHelpers';

const CallTabSectionTorg = (props) => {
  const [refreshMark, setRefreshMark] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [editMode, setEditMode] = useState(true); // true|false - режим редактирования

  const [baseData, setBaseData] = useState(null);

    const [itemId, setItemId] = useState(0);
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



  const [allowDelete, setAllowDelete] = useState(true);

  // Флаг для блюра — обновление в массиве уровнем ниже
  const [BLUR_FLAG, setBLUR_FLAG] = useState(null);
  // Флаг для действия — отправка в глобальный коллектор
  const [ACTION_FLAG, setACTION_FLAG] = useState(null);


  // ██    ██ ███████ ███████ 
  // ██    ██ ██      ██      
  // ██    ██ █████   █████   
  // ██    ██ ██      ██      
  //  ██████  ██      ██      
  useEffect(() => {
    setEditMode(props.edit_mode);
  }, [props.edit_mode]);


  useEffect(() => {
    setRefreshMark(props.refresh_mark);
  }, [props.refresh_mark]);

  useEffect(() => {
    setBaseData(props.data);

    if (props.data.id) {
      setItemId(props.data.id);

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
    setAllowDelete(props.allow_delete);
  }, [props.allow_delete]);

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
  }, [subscriber, props.org_users, itemId, trigger]);


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


    useEffect(() => {
    setAllowDelete(props.allow_delete);
  }, [props.allow_delete]);

  useEffect(() => {
    setCollapsed(props.collapsed);
  }, [props.collapsed]);

  

  // ██    ██ ███████ ███████       ██   ██ 
  // ██    ██ ██      ██             ██ ██  
  // ██    ██ █████   █████   █████   ███   
  // ██    ██ ██      ██             ██ ██  
  //  ██████  ██      ██            ██   ██ 


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


  const handleDeleteItem = () => {
    if (props.on_delete) {
      props.on_delete(itemId);
    };
    if (allowDelete) {
      setDeleted(!deleted);
    }
  }




      useEffect(() => {
        // При монтировании компонента форма не отправляется
        // Если не проверять deleted, то после монтирования формы и нажатии удалить - форма не отправится
        if (!BLUR_FLAG && (Boolean(deleted) === Boolean(props.data?.deleted))) return;
        if (editMode  && baseData && baseData.command === 'create' && deleted){
          // Лазейка для удаления созданных в обход таймаута - позволяет избежать гонок при очень быстром удалении
              if (props.on_change){
                baseData.deleted = deleted;
                props.on_change(itemId, baseData,'requisites');
                return;
              }
            }
    
          const timer = setTimeout(() => {
            // При сверх-быстром изменении полей в разных секциях могут быть гонки
          if (editMode  && baseData){
              if (props.on_change){
                // data.date = date ? date.format('DD.MM.YYYY HH:mm:ss') : null;
                
                baseData.theme = theme;
                baseData.post = post;
                baseData.date = date;
                baseData.note = note;
                baseData.subscriber = subscriber;
                baseData.result = result;
                baseData.id8ref_departaments = depart;
                baseData._savecontact = saveContact;
                baseData.next_call_date = nexCallDate;
                baseData.next_type = nexType;
                baseData.phone = phone;

                if (addPhone && addPhone.trim() !== '' && phone && phone.trim() !== ''){
                    baseData.phone = phone + ' (' + addPhone + ')';

                }
               
    
                if (baseData.command === undefined || baseData.command !== 'create'){
                  if (deleted){
                    baseData.command = 'delete';
                  } else {
                    baseData.command = 'update';
                  }
                }
                props.on_change( itemId, baseData, 'requisite');
              }
            }
              }, 500);
    
              return () => clearTimeout(timer);
    
      }, [
        BLUR_FLAG,
        deleted,
      ]);


  return (
    <div className={`sa-org-collapse-item
       ${collapsed ? 'sa-collapsed-item' : 'sa-opened-item'}
       ${deleted ? 'deleted' : ''}`}

    >
      <div className={'sa-org-collpase-header sa-flex-space'}
        onClick={(ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          setCollapsed(!collapsed)
        }
        }
      >
        <div className={'sa-flex'}>
          <div className={'sa-pa-6'}>
            {collapsed ? (
              <span className={'sa-pa-3 sa-org-trigger-button'}
                onClick={() => { setCollapsed(!collapsed) }}
              >
                <ChevronDownIcon height={TORG_CHEVRON_SIZE} />
              </span>

            ) : (
              <span className={'sa-pa-3 sa-org-trigger-button'}
                onClick={() => { setCollapsed(!collapsed) }}
              >
                <ChevronUpIcon height={TORG_CHEVRON_SIZE} />
              </span>
            )}


          </div>
          <div className={'sa-pa-6 sa-org-section-text'}>
            <div className='sa-org-section-label'>
                {baseData?._type === 'call' ? (
                    <span title="Звонок" style={{ paddingRight: '9px', marginBottom: '-12px', lineHeight: '12px' }}>
                        <PhoneIcon height={'22px'} />
                    </span>
                ) : (
                    <span title="Встреча" style={{ paddingRight: '9px', marginBottom: '-12px', lineHeight: '12px' }}>
                        <BriefcaseIcon height={'22px'} />
                    </span>
                )}

              {theme ? theme : "Без темы "}
            </div>
            <span className="sa-date-text">
              {(date !== null && false)
                ? ` - ` +
                  getMonthName(dayjs(date).month() + 1) +
                  ' ' +
                  dayjs(date).format('YYYY')
                : ''}
            </span>{' '}
            {itemId && (
              <div className={'sa-org-row-header-id sa-text-phantom'}>
                ({itemId})
              </div>
            )}
 

          </div>

        </div>
        <div className={'sa-flex'}>
          {allowDelete && editMode && (
            <span className={'sa-pa-3 sa-org-remove-button'}
              
            >
              <Button danger 
              size='small'
                onClick={handleDeleteItem}
                icon={<TrashIcon height={TORG_CHEVRON_SIZE} />}
              >

              </Button>
              
            </span>
          )}
        </div>
      </div>
      <div className={'sa-org-collapse-body'}>
        <div className={'sa-org-collapse-content'}>
          <TorgPageSectionRow
            labels={['Gosha']}
            edit_mode={editMode}
            inputs={[
              {
                edit_mode: editMode,
                label: 'Тема',
                input:
                  <Input
                    key={'tdextard_1_' + baseData?.id}
                    value={theme}
                    onChange={e => setTheme(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={250}
                    onBlur={()=>{setBLUR_FLAG(dayjs().unix())}}
                  />,
                  required: true,
                  value: theme
              },


            ]}
            extratext={[]}
          />


          <TorgPageSectionRow
            edit_mode={editMode}
            inputs={[
              {
                label: 'Автор',
                input:
                  <Input
                    key={'textard_2_' + baseData?.id}
                    value={
                      baseData?.creator
                      ? baseData.creator.surname +
                        ' ' +
                        baseData.creator.name +
                        ' ' +
                        baseData.creator.secondname
                      : ''
                    }
                    // onChange={e => setNote(e.target.value)}
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={true}
                    variant="borderless"
                  />,
              },
              {
                label: 'Дата',
                input:
                  <DatePicker
                    key={'textard_3_' + baseData?.id}
                    value={date ? dayjs(date) : null}
                    // onChange={e => setNote(e.target.value)}
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={true}
                    variant="borderless"
                    disabled={true}
                    format={'DD-MM-YYYY'}
                  />,
              },

            ]}
            extratext={[]}
          />


          <TorgPageSectionRow
            labels={['Gosha']}
            edit_mode={editMode}
            inputs={[
              {
                edit_mode: editMode,
                label: 'Заметка',
                input:
                  <TextArea
                    key={'textard_4_' + baseData?.id}
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={5000}
                    required={true}
                  />,
                  required: true,
                  value: note
              },


            ]}
            extratext={[]}
          />
        </div>
      </div>
    </div>
  );
};

export default CallTabSectionTorg;