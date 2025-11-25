import React, { useEffect, useState } from 'react';
import TorgPageSectionRow from '../TorgPageSectionRow';
import { AutoComplete, Button, Checkbox, DatePicker, Input, Select, TimePicker, Tooltip } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { TORG_CHEVRON_SIZE, TORG_MAX_ROWS_TEXTAREA, TORG_MIN_ROWS_TEXTAREA } from '../TorgConfig';
import { BriefcaseIcon, ChevronDownIcon, ChevronRightIcon, ChevronUpIcon, PhoneIcon, TrashIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import { FullNameText, getMonthName, ShortName } from '../../../../components/helpers/TextHelpers';
import { LockFilled } from '@ant-design/icons';

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
  const [nexType, setNextType] = useState('call');

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

  const [authorFullName, setAuthorFullName] = useState('');
  const [authorShortName, setAuthorShortName] = useState('');


    const [transContainer, setTransContainer] = useState([]);
    const [userdata, setUserdata] = useState(props.user_data);
    const [orgContacts, setOrgContacts] = useState([]);

  // ██    ██ ███████ ███████ 
  // ██    ██ ██      ██      
  // ██    ██ █████   █████   
  // ██    ██ ██      ██      
  //  ██████  ██      ██      
  useEffect(() => {
    setEditMode(props.edit_mode);
  }, [props.edit_mode]);

  useEffect(() => {
    setUserdata(props.user_data);
  }, [props.user_data]);


    useEffect(() => {
      setAuthorFullName(FullNameText(props.data?.creator));
      setAuthorShortName(
        ShortName(
          props.data?.creator?.surname,
          props.data?.creator?.name,
          props.data?.creator?.secondname
        )
      );
    }, [props.data?.creator]);


  useEffect(() => {
    if (!props.org_id){
      setACTION_FLAG(null);
      setBLUR_FLAG(null);
    }
  }, [props.org_id]);

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
    if (!props.org_contacts || !subscriber) {
      setOrgPhones([]);
      return; // ничего не ищем, если нет данных или пустой ввод
    }
    
    const searchWords = subscriber
    .toLowerCase()
    .split(' ')
      .filter(word => word.length > 0); // убираем пустые строки
      
    if (searchWords.length === 0) return;
    
    const foundUser = props.org_contacts.find(user => {
      const fullName = `${user.lastname} ${user.name} ${user.middlename}`.toLowerCase();

      // Проверяем, что КАЖДОЕ слово из ввода есть в ФИО
      return searchWords.every(word => fullName.includes(word));
    });

    if (foundUser) {
      id = foundUser.id;
      setTargetOrgUserId(id);
      // 👇 Тут можешь сохранить ID или весь объект
      // Например: setSelectedUserId(foundUser.id);
    } else {
      setOrgPhones([]);
      return;
      // setSelectedUserId(null);
    }
    if (foundUser.occupy){
      setPost(foundUser.occupy?.trim());
    }
    
    
    if (foundUser.contactstelephones.length){
      for (let index = 0; index < foundUser.contactstelephones.length; index++) {
        const element = foundUser.contactstelephones[index];
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
  }, [subscriber, props.org_contacts, itemId, trigger]);


  const handleChangeNumbers = (evphone)=> {
    if (evphone){
      const timer = setTimeout(() => {
      let splitak = bracketSplitter(evphone);
        setPrevPhone(splitak.number);


        if (splitak.add){
          setPhone(splitak.number);
            setAddPhone(splitak.add);
          } else {
            setAddPhone('');
          }
        }, 1500);
    
      return () => clearTimeout(timer);
    }
  }


  // useEffect(() => {
  //   if (prevPhone !== null && prevPhone !== phone){
  //     setAddPhone('');
  //     setPrevPhone(phone);
  //   };
  // }, [phone]);


    useEffect(() => {
    setAllowDelete(props.allow_delete);
  }, [props.allow_delete]);

  useEffect(() => {
    setCollapsed(props.collapsed);
  }, [props.collapsed]);

    useEffect(() => {
      if (props.org_contacts) {
        let usess = [];
        let uids = [];
        let fusers = props.org_contacts.filter(
          (item) => !(!item.lastname && !item.name && !item.middlename)
        );
  
        for (let i = 0; i < fusers.length; i++) {
          const element = fusers[i];
          if (!uids.includes(element.id)) {
            let nm = `${
              (element.lastname ? element.lastname : '') +
              (element.lastname ? ' ' : '') +
              (element.name ? element.name : '') +
              (element.name ? ' ' : '') +
              (element.middlename ? element.middlename : '')
            }`;
            usess.push({
              key: 'kjfealllo' + element.id,
              value: element.value,
              label: nm,
            });
          }
        }
        setOrgContacts(usess);
      }
    }, [props.org_contacts]);




  // ██    ██ ███████ ███████       ██   ██ 
  // ██    ██ ██      ██             ██ ██  
  // ██    ██ █████   █████   █████   ███   
  // ██    ██ ██      ██             ██ ██  
  //  ██████  ██      ██            ██   ██ 


 const bracketSplitter = (number) => {
    let pho = '';
    let add = '';

    const splitter = "(";
    let result = number?.split(splitter);

    if (result && result[0] && !result[0] && result[0]?.trim() !== "")
    {
      pho = result[0]?.trim();
      
      if (result[1] && result[1] !== ''){
        add = result[1].replace(')', '')?.trim();
      }

    } else {
      pho = number;
    }
    return {number: pho, add: add};
  }


  const handleDeleteItem = () => {
		if (allowDelete) {
			setDeleted(!deleted);
		}
		setTimeout(() => {
			setBLUR_FLAG();
			if (props.on_delete) {
				props.on_delete(itemId);
			}
		}, 1000);
    	};


  // useEffect(() => {
  //   if (prevPhone !== null && prevPhone !== phone){
  //     setAddPhone('');
  //     setPrevPhone(phone);
  //   };
  // }, [phone]);

  useEffect(() => {
    if (nexCallDate && !nexType){
      if (baseData?._type === 'call'){
        setNextType('call');
      } else {
        setNextType('meeting');
      }
    } 
    if (!nexCallDate){
      setNextType(null);
    }
  }, [nexCallDate]);


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
                baseData.post  = post;
                baseData.date  = date;
                baseData.note  = note;
                baseData.subscriber = subscriber;
                baseData.result = result;
                baseData.id8ref_departaments = depart;
                baseData._savecontact = saveContact;
                baseData.next_call_date = nexCallDate;
                baseData.next_type = nexType;
                baseData.phone = phone;

                if (addPhone && addPhone?.trim() !== '' && phone && phone?.trim() !== ''){
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
        BLUR_FLAG
      ]);


    useEffect(() => {
      if (!ACTION_FLAG) {
        return;
      }
        const timer = setTimeout(() => {
          // При сверх-быстром изменении полей в разных секциях могут быть гонки
        if (editMode  && baseData){
            if (props.on_collect){
              // data.date = date ? date.format('DD.MM.YYYY HH:mm:ss') : null;
              const newData = JSON.parse(JSON.stringify(baseData));
              newData.theme = theme;
              newData.post  = post;
              newData.date  = date;
              newData.note  = note;
              newData.subscriber = subscriber;
              newData.result = result;
              newData.id8ref_departaments = depart;
              newData._savecontact = saveContact;
              newData.next_call_date = nexCallDate;
              newData.next_type = nexType;
              newData.phone = phone;

              if (addPhone && addPhone?.trim() !== '' && phone && phone?.trim() !== ''){
                  newData.phone = phone + ' (' + addPhone + ')';
              }
              newData.deleted = deleted;

              if (newData.command === undefined || newData.command !== 'create'){
                if (deleted){
                  newData.command = 'delete';
                } else {
                  newData.command = 'update';
                }
              }
              props.on_collect(newData);
            }
          }
            }, 500);

            return () => clearTimeout(timer);

    }, [
      theme,
      deleted,
      date,
      note,
      subscriber,
      result,
      depart,
      saveContact,
      nexCallDate,
      nexType,
      phone,
      post,
      addPhone
    ]);


  return (
    <div className={`sa-org-collapse-item
      ${collapsed ? 'sa-collapsed-item' : 'sa-opened-item'}
       ${deleted ? 'deleted' : ''} 
       ${editMode ? 'sa-org-item-yesedit' : 'sa-org-item-notedit'} 
       ${
					userdata?.user?.id !== creator || userdata?.user?.id !== baseData?.curator?.id
						? 'sa-noedit-item'
						: ''
				}`}
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
                <span className={'sa-org-trigger-button'}
                 onClick={(e) => {
                    e.stopPropagation();
                    setCollapsed(!collapsed);
                  }}
                >
                <ChevronRightIcon height={TORG_CHEVRON_SIZE} />
                </span>
              ) : (
                <span className={'sa-org-trigger-button active'}
                onClick={(e) => {
                    e.stopPropagation();
                    setCollapsed(!collapsed);
                  }}
                >
                <ChevronRightIcon height={TORG_CHEVRON_SIZE} />
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
              {(date !== null)
                ? ` - ` +
                  getMonthName(dayjs(date).month() + 1) +
                  ' ' +
                  dayjs(date).format('YYYY')
                : ''}
            </span>{' '}
            
						<span className="sa-author-text">
							{authorShortName !== null ? ` - ` + authorShortName + ' ' : ''}
							{(userdata?.user?.id !== baseData?.creator?.id) && (
								<Tooltip
									placement={'right'}
									title={
										<div>
											<div>Этот звонок может редактировать только создатель записи </div>
										</div>
									}
									className={'sa-lock-mark'}
								>
									<LockFilled height={'22px'} />
								</Tooltip>
							)}
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
                onClick={()=>{
                  setACTION_FLAG(1); 
                  handleDeleteItem();
                }}
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
						key={`caloshaa_00_${itemId}`}
						edit_mode={editMode}
						inputs={[
							{
								label: 'Автор',
								input: (
									<Input
										key={'texpard_33_2_' + baseData?.id}
										value={authorFullName}
										// onChange={e => setNote(e.target.value)}
										readOnly={true}
										variant="borderless"
										disabled={true}
									/>
								),
							},
							{
								label: 'Дата',
								input: (
									<DatePicker
										key={'texpard_66_3_' + baseData?.id}
										value={date ? dayjs(date) : null}
										// onChange={e => setNote(e.target.value)}
										readOnly={true}
										variant="borderless"
										disabled={true}
										format={'DD-MM-YYYY'}
									/>
								),
							},
						]}
						extratext={[]}
					/>

          <TorgPageSectionRow
            key={`caloshaa_${itemId}`}
            edit_mode={editMode}
            inputs={[
              {
                edit_mode: editMode,
                label: 'Тема',
                input:
                  <Input
                    key={'tdextard_1_' + baseData?.id}
                    value={theme}
                    size={'small'}
                    onChange={(e) => {
											setTheme(e.target.value);
											setACTION_FLAG(1);
										}}
                    // placeholder="Controlled autosize"
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={250}
                    onBlur={() => {
                      setBLUR_FLAG(dayjs().unix());
                    }}
                  />,
                  required: true,
                  value: theme
              },
              {
                edit_mode: editMode,
                label: 'Отдел',
                input:
                  <Select
                    key={'tdextard_1_' + baseData?.id}
                    value={depart}
                    size={'small'}
                    onChange={(e) => {
											setDepart(e);
											setACTION_FLAG(1);
                      setBLUR_FLAG(dayjs().unix());
										}}
                    // placeholder="Controlled autosize"
                    readOnly={!editMode}
                    disabled={!editMode}
                    variant="borderless"
                    // onBlur={() => {
                    //   setBLUR_FLAG(dayjs().unix());
                    // }}
                    options={departList}
                  />,
                  required: true,
                  value: theme
              },
            ]}
            extratext={[]}
          />


          <TorgPageSectionRow
            edit_mode={editMode}
            key={'tdextdsard_1_' + baseData?.id}
            inputs={[
              {
                edit_mode: editMode,
                label: 'Контактное лицо*',
                input:
                <AutoComplete
										disabled={!editMode}
										key={'texpard_10_' + baseData?.id}
										placeholder={'Фамилия Имя Отчество'}
										value={subscriber}
										size="small"
										variant="borderless"
                    onClick={ ()=>{setTrigger(dayjs().unix())}}
										onChange={(e) => {
											setSubscriber(e);
											setBLUR_FLAG(dayjs().unix());
											setACTION_FLAG(1);
										}}
										options={transContainer['cpers'] ? transContainer['cpers'] : []}
										onSearch={(text) => {
											let filteredOptions = [];
											let cmod = transContainer;
											if (orgContacts && text !== null && text) {
												filteredOptions = orgContacts?.filter((item) =>
													item.label.toLowerCase().includes(text?.toLowerCase())
												);
												// Список подгоняется в зависимости от того, что введено пользователем
												cmod['cpers'] = filteredOptions?.map((obj) => ({
													key: obj.key,
													value: obj.label,
													label: obj.label,
												}));
												setTransContainer(cmod);
											} else {
												cmod['cpers'] = [];
												setTransContainer(cmod);
											}
										}}
									/>,
                  required: false,
                  value: subscriber
              },
              {
                edit_mode: editMode,
                label: 'Должность',
                input:
                  <Input
                    key={'textard_44_' + baseData?.id}
                    value={post}
                    onChange={(e) => {
											setPost(e.target.value);
											setACTION_FLAG(1);
										}}
                    // placeholder="Controlled autosize"
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={120}
                    required={false}
                    onBlur={() => {
                      setBLUR_FLAG(dayjs().unix());
                    }}
                  />,
                  required: false,
                  value: post
              },
            ]}
            extratext={[]}
          />


          <TorgPageSectionRow
            edit_mode={editMode}
            key={'tdextdtred_1_' + baseData?.id}
            inputs={[
              {
                edit_mode: editMode,
                label: 'Телефон*',
                input:
                  <AutoComplete
                    key={'textard_134_' + baseData?.id}
                    value={phone}
                    onChange={(e) => {
											setPhone(e);
											setACTION_FLAG(1);
                      handleChangeNumbers(e);
										}}
                    // placeholder="Controlled autosize"
                    readOnly={!editMode}
                    disabled={!editMode}
                    variant="borderless"
                    maxLength={120}
                    required={true}
                    options={orgPhones}
                     onClick={ ()=>{setTrigger(dayjs().unix())}}
                  />,
                  required: true,
                  value: phone
              },
              {
                edit_mode: editMode,
                label: 'Добавочный*',
                input:
                  <Input
                    key={'textard_144_' + baseData?.id}
                    value={addPhone}
                    onChange={(e) => {
											setAddPhone(e.target.value);
											setACTION_FLAG(1);
										}}
                    // placeholder="Controlled autosize"
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={22}
                    required={false}
                    onBlur={() => {
                      setBLUR_FLAG(dayjs().unix());
                    }}
                  />,
                  required: false,
                  value: addPhone
              },
            ]}
            extratext={[]}
          />


          {(editMode && subscriber?.length > 3 && !targetOrgUserId && phone.length > 3) && (
          <TorgPageSectionRow
            edit_mode={editMode}
            key={'tdexteeed_1_' + baseData?.id}
            inputs={[
              {
                edit_mode: editMode,
                label: 'Сохранить контакт',
                input:
                <div>
                  <Checkbox
                    key={'textarred_234_' + baseData?.id}
                    checked={saveContact}
                    onChange={(e) => {
											setSaveContact(e.target.checked);
											setACTION_FLAG(1);
                      setBLUR_FLAG(dayjs().unix());
										}}
                    // placeholder="Controlled autosize"
                    readOnly={!editMode}
                    variant="borderless"
                    required={false}
                  />
                  <span className={'sa-org-checkbox-legend'}>
                    {saveContact ? (
                      "* Контакт сохранится в список контактных лиц"
                    ) : ("* Установите галочку для создания контакта на основе указанных данных")}
                    </span>
                  </div>,
                  required: false,
                  value: saveContact
              },
              
            ]}
            extratext={[]}
          />
          )}


          <TorgPageSectionRow
            key={'tdexteeed_A_' + baseData?.id}
            edit_mode={editMode}
            inputs={[
              {
                edit_mode: editMode,
                label: 'Заметка',
                input:
                  <TextArea
                    key={'tex4tard_654_' + baseData?.id}
                    value={note}
                    onChange={(e) => {
                        setNote(e.target.value);
                        setACTION_FLAG(1);
                    }}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={9999}
                    required={true}
                    onBlur={() => {
                      setBLUR_FLAG(dayjs().unix());
                    }}
                  />,
                  required: true,
                  value: note
              },
            ]}
            extratext={[]}
          />


          <TorgPageSectionRow
            key={'tdex7546_1_' + baseData?.id}
            edit_mode={editMode}
            inputs={[
              {
                edit_mode: editMode,
                label: 'Результат',
                input:
                  <TextArea
                    key={'tex45ta34rd_654_' + baseData?.id}
                    value={result}
                    onChange={(e) => {
											setResult(e.target.value);
											setACTION_FLAG(1);
										}}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={9999}
                    required={false}
                    onBlur={() => {
                      setBLUR_FLAG(dayjs().unix());
                    }}
                  />,
                  required: false,
                  value: result
              },
            ]}
            extratext={[]}
          />

          {editMode ? (

            <TorgPageSectionRow
              key={'tdexteeedds_1_' + baseData?.id}
              edit_mode={editMode}
              inputs={[
                {
                  label: 'Дата',
                  input: (
                    <DatePicker
                      key={'texpd654s_3_' + baseData?.id}
                      size={'small'}
                      value={nexCallDate ? dayjs(nexCallDate) : null}
                      // onChange={e => setNote(e.target.value)}
                      readOnly={!editMode}
                      variant="borderless"
                      disabled={!editMode}
                      format={'DD-MM-YYYY'}
                      onChange={(val) => {
                        setNextCallDate(val ? val.format('YYYY-MM-DD') : null);
                        setACTION_FLAG(1);
                      setBLUR_FLAG(dayjs().unix());
                      }}
                    />
                  ),
                  required: false,
                  value: nexCallDate
                },
                // {
                //   label: 'Время',
                //   input: (
                //     <TimePicker
                //       key={'texdpds_3_' + baseData?.id}
                //       value={nexCallDate ? dayjs(nexCallDate) : null}
                //       // onChange={e => setNote(e.target.value)}
                //       readOnly={!editMode}
                //       variant="borderless"
                //       disabled={!editMode}
                //       format={'DD-MM-YYYY'}
                //     />
                //   ),
                // },
                {
                  label: 'Тип события',
                  input: (
                  <Select
                    key={'tdextard_1_' + baseData?.id}
                    value={nexType}
                    size={'small'}
                    onChange={(e) => {
											setNextType(e);
											setACTION_FLAG(1);
                      setBLUR_FLAG(dayjs().unix());
										}}
                    // placeholder="Controlled autosize"
                    readOnly={!editMode}
                    variant="borderless"
                    // onBlur={() => {
                    //   setBLUR_FLAG(dayjs().unix());
                    // }}
                    options={nexVariants}
                    required={nexCallDate ? true : false}
                  />
                  ),
                  required: nexCallDate ? true : false,
                  value: nexCallDate
                },
              ]}
              extratext={[]}
            />
          ):("")}


        </div>
      </div>
    </div>
  );
};

export default CallTabSectionTorg;