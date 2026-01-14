import React, { useEffect, useState } from 'react';
import { Form, Input, DatePicker, Select, AutoComplete } from 'antd';
import dayjs from 'dayjs';



// Конфиг
const TEXTAREA_MIN_ROWS = 3;
const TEXTAREA_MAX_ROWS = 10;
const CHEVRON_SIZE = 16;

const CalendarModalFormProject = ({on_change, selects, companies}) => {
 const { TextArea } = Input;

 useEffect(() => {
  console.log('selects', selects);
 }, [selects]);

  const [formTheme, setFormTheme] = useState("");
  const [formNotes, setFormNotes] = useState("");



  const [orgId, setOrgId] = useState(0);
  const [itemId, setItemId] = useState(null);
  const [projType, setProjType] = useState(0);
  const [deleted, setDeleted] = useState(0);
  const [name, setName] = useState('');
  const [equipment, setEquipment] = useState('');
  const [customer, setCustomer] = useState('');
  const [curator, setCurator] = useState('');
  const [address, setAddress] = useState('');
  const [stage, setStage] = useState('');
  const [contactperson, setContactperson] = useState('');
  // const [staffList,   setStaflist] = useState(0); // Создатель id8staff_list
  const [date, setDate] = useState(dayjs());
  const [cost, setCost] = useState('');
  const [bonus, setBonus] = useState('');
  const [comment, setComment] = useState('');
  const [typePeac, setTypePeac] = useState('');
  const [dateEnd, setDateEnd] = useState(null);
  const [erector, setErector] = useState('');
  // const [linkbidId,   setLinkbidId] = useState([]);
  const [bidsId, setBidsId] = useState([]);
  const [dateCreate, setDateCreate] = useState(dayjs().unix());
  const [idCompany, setIdCompany] = useState('');
  const [authorId, setAuthorId] = useState(null);
  const [author, setAuthor] = useState(null);

  const [searchErector, setSearchErector] = useState(selects?.data?.erector_id);
  const [searchBid, setSearchBid] = useState('');

  const [mountOrgList, setMountOrgList] = useState([]);
  const [mountBidList, setMountBidList] = useState([]);

  const [transContainer, setTransContainer] = useState([]);
  const [orgContacts, setOrgContacts] = useState([]);

  useEffect(() => {

    const timer = setTimeout(() => {
      // if (props.on_change){
      //   props.on_change({
      //     theme: formTheme,
      //     notes: formNotes,
      //   });
      // }
    }, 500);

    return () => clearTimeout(timer);
  }, [
    		orgId,
        projType,
        name,
        equipment,
        customer,
        address,
        stage,
        contactperson,
        date,
        cost,
        bonus,
        comment,
        typePeac,
        dateEnd,
        erector,
        bidsId,
        idCompany,
        authorId,
        author,
        deleted,
      ]);


        // useEffect(() => {
        //   if (props.org_contacts) {
        //     let usess = [];
        //     let uids = [];
        //     let fusers = props.org_contacts.filter(
        //       (item) => !(!item.lastname && !item.name && !item.middlename)
        //     );
      
        //     for (let i = 0; i < fusers.length; i++) {
        //       const element = fusers[i];
        //       if (!uids.includes(element.id)) {
        //         let nm = `${
        //           (element.lastname ? element.lastname : '') +
        //           (element.lastname ? ' ' : '') +
        //           (element.name ? element.name : '') +
        //           (element.name ? ' ' : '') +
        //           (element.middlename ? element.middlename : '')
        //         }`;
        //         usess.push({
        //           key: 'kjfealllo' + element.id,
        //           value: element.value,
        //           label: nm,
        //         });
        //       }
        //     }
        //     setOrgContacts(usess);
        //   }
        // }, [props.org_contacts]);

  return (
    <div className='rsa-calendar-form-item'>
      <div className='rda-note-form-item'>
         <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          layout="vertical"
        >
   

            <p></p>
            <span>Заметка</span>
            <TextArea rows={4}
              value={formNotes}
              onChange={(ev)=>{setFormNotes(ev.target.value)}}
              autoSize={{ minRows: TEXTAREA_MIN_ROWS, maxRows: TEXTAREA_MAX_ROWS }}
            />




            <p></p>
            <span>Объект</span>
              <Input
                key={'texpard_4_obj'}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                // placeholder="Controlled autosize"
                variant={'underlined'}
                maxLength={200}
                required={false}
                />


            <p></p>
            <span>Адрес</span>
              <Input
                    key={'texpard_5_addr'}
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                    }}
                    // placeholder="Controlled autosize"
                    variant={'underlined'}
                    maxLength={200}
                    required={false}
                    />

            <p></p>
            <span>Заказчик</span>
              <Input
                    key={'texpard_6_zakazhi'}
                    value={customer}
                    onChange={(e) => {
                      setCustomer(e.target.value);
                    }}
                    variant={'underlined'}
                    maxLength={200}
                    required={false}
                    
                    />

            <p></p>
            <span>Этап</span>
            <Input
              key={'texpard_7_stage'}
              value={stage}
              variant={'underlined'}
              onChange={(e) => {
                setStage(e.target.value);
              }}
              maxLength={200}
              />

            <p></p>
            <span>Оборудование</span>
              <Input
                key={'texpard_8_oboroodo'}
                value={equipment}
                variant={'underlined'}
                onChange={(e) => {
                  setEquipment(e.target.value);
                }}
                maxLength={200}
                />

            <p></p>
            <span>Тип СОУЭ</span>
              <Input
                    key={'texpard_9_soviet'}
                    variant={'underlined'}
                    value={typePeac}
                    onChange={(e) => {
                      setTypePeac(e.target.value);
                    }}
                    // placeholder="Controlled autosize"
                    maxLength={200}
                    
                    />

            <p></p>
            <span>Контактное лицо</span>
            <AutoComplete
										key={'texpard_10_ac'}
										placeholder={'Фамилия Имя Отчество'}
										value={contactperson}
										size="small"
										variant="borderless"
										onChange={(e) => {
											console.log(e);
											setContactperson(e);
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
									/>

            <p></p>
            <span>Дата завершения</span>
              <DatePicker
                style={{width: '100%'}}
                    key={'texpard_11_dataza'}
                    value={dateEnd ? dayjs(dateEnd) : null}
                    variant={'underlined'}
                    onChange={(ee) => {
                      setDateEnd(ee ? ee.format('YYYY-MM-DD') : null);
                    }}
                    maxLength={200}
                    // format={'DD-MM-YYYY'}
                  />

            <p></p>
            <span>Стоимость</span>
              <Input
                    key={'texpard_12_cost'}
                    value={cost}
                    onChange={(e) => {
                      setCost(e.target.value);
                    }}
                    maxLength={200}
                    variant={'underlined'}
                    />

            <p></p>
            <span>Вознаграждение</span>
              <Input
                    key={'texpard_13_interest'}
                    value={bonus}
                    variant={'underlined'}
                    onChange={(e) => {
                      setBonus(e.target.value);
                    }}
                    maxLength={200}
                  />

            <p></p>
            <span>Состояния</span>
              <Select
                style={{width: '100%'}}
                allowClear
										key={'texpard_14_condi'}
										value={projType ? projType : null}
										onChange={(e) => {
											setProjType(e);
										}}
										// placeholder="Controlled autosize"
										options={selects?.projecttype?.map((item) => ({
											key: 'keyadflj' + item.id,
											value: item.id,
											label: item.name,
										}))}
										variant={'underlined'}
										maxLength={200}
									/>

            <p></p>
            <span>Монтажная организации</span>
              <Select
                    variant={'underlined'}
                    style={{width: '100%'}}
                    allowClear
                    showSearch={true}
                    optionFilterProp="children"
                    onSearch={(et) => {
                      setSearchErector(et);
                    }}
                    required={false}
                    value={erector}
                    placeholder={'Название организации'}
                    onChange={(ev) => {
                      setErector(ev);
                    }}
                  >
                    {mountOrgList &&
                      mountOrgList?.map((opt) => (
                        <Select.Option key={'olokm' + opt.value} value={opt.value}>
                          {opt.label}
                        </Select.Option>
                      ))}
                  </Select>

            <p></p>
            <span>Связанное КП</span>
                <Select
                    variant={'underlined'}
                    style={{width: '100%'}}
                    mode={'multiple'}
                    allowClear={true}
                    showSearch={true}
                    optionFilterProp="children"
                    onSearch={(et) => {
                      setSearchBid(et);
                    }}
                    // options={mountBidList}
                    required={false}
                    value={bidsId}
                    placeholder={'ID кп/счета'}
                    onChange={(ev) => {
                      setBidsId(ev);
                    }}
                  >
                    {mountBidList &&
                      mountBidList?.map((opt) => (
                        <Select.Option key={'olokhom' + opt.value} value={opt.value}>
                          {opt.label}
                        </Select.Option>
                      ))}
                  </Select>

            <p></p>
            <span>Заметка</span>
              <TextArea
                    variant={'underlined'}
                    style={{width: '100%'}}
										key={'texpard_45_f' }
										value={comment}
										onChange={(e) => {
											setComment(e.target.value);
										}}
										// placeholder="Controlled autosize"
										autoSize={{ minRows: TEXTAREA_MIN_ROWS, maxRows: TEXTAREA_MAX_ROWS }}
										maxLength={5000}
										required={false}
									/>
            <p></p>
      
           
      
      </Form>
      </div>
    </div>
  );
};

export default CalendarModalFormProject;