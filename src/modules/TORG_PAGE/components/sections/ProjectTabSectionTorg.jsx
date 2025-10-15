import React, { useEffect, useState } from 'react';
import TorgPageSectionRow from '../TorgPageSectionRow';
import { AutoComplete, DatePicker, Input } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { TORG_CHEVRON_SIZE, TORG_MAX_ROWS_TEXTAREA, TORG_MIN_ROWS_TEXTAREA } from '../TorgConfig';
import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import { getMonthName } from '../../../../components/helpers/TextHelpers';
import { after } from 'lodash';

const ProjectTabSectionTorg = (props) => {
  const [refreshMark, setRefreshMark] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [editMode, setEditMode] = useState(true); // true|false - режим редактирования

  const [data, setData] = useState(null);
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
    const [date,        setDate] = useState(dayjs());
    const [cost,        setCost] = useState('');
    const [bonus,       setBonus] = useState('');        
    const [comment,     setComment] = useState('');
    const [typeEac,     setTypeEac] = useState('');
    const [dateEnd,     setDateEnd] = useState(null);
    const [erector,     setErector] = useState('');
    // const [linkbidId,   setLinkbidId] = useState([]);
    const [bidsId,      setBidsId] = useState([]);
    const [dateCreate,  setDateCreate] = useState( dayjs().unix() ); 
    const [idCompany,   setIdCompany] = useState('');
    const [authorId,    setAuthorId] = useState(null);
    const [author,    setAuthor] = useState(null);

    const [searchErector, setSearchErector] = useState('');
    const [searchBid, setSearchBid]         = useState('');
 

    const [_type, set_type] = useState(null);

    const [allowDelete, setAllowDelete] = useState(true);

  const [selects, setSelects] = useState(null);
  const [orgUsers, setOrgUsers] = useState([]);

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
    setData(props.data);
    console.log('props.data', props.data)
    if (props.data.id) {
       setItemId(props.data.id);
        setProjType(props.data.id8an_projecttype);
        setName(props.data.name);
        setEquipment(props.data.equipment);
        setDeleted(props.data.deleted);
        setCustomer(props.data.customer);
        setAddress(props.data.address);
        setStage(props.data.stage);
        setContactperson(props.data.contactperson);
        setCurator(props.data.id8staff_list);
        setCost(props.data.cost);
        setBonus(props.data.bonus);
        setComment(props.data.comment);
        setTypeEac(props.data.typepaec);
        setDateEnd(props.data.date_end);
        setErector(props.data.erector_id);
        setSearchErector(props.data.erector_id);
        // setLinkbidId(props.data?.bidsId );
        setBidsId(props.data?.bidsId );
        setDateCreate(props.data.date_create);
        setIdCompany(props.data.id_company);
        setDeleted(props.data.deleted);
        setAuthorId(props.data.author_id);
        setAuthor(props.data.author);
        setDate(props.data?.date ? dayjs(props.data.date) : null);

        set_type(props.data.type);
    }
  }, [props.data]);

      useEffect(() => {
        setSelects(props.selects);
      }, [props.selects]);

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
  }, [props.org_users]);


  // ██    ██ ███████ ███████       ██   ██ 
  // ██    ██ ██      ██             ██ ██  
  // ██    ██ █████   █████   █████   ███   
  // ██    ██ ██      ██             ██ ██  
  //  ██████  ██      ██            ██   ██ 



  const handleDeleteItem = () => {
    if (props.on_delete) {
      props.on_delete(itemId);
    };
    if (allowDelete) {
      setDeleted(!deleted);
    }
  }

  useEffect(() => {
    setAllowDelete(props.allow_delete);
  }, [props.allow_delete]);

  useEffect(() => {
    setCollapsed(props.collapsed);
  }, [props.collapsed]);


  useEffect(() => {
    if (editMode && !collapsed && data && data.command === 'create' && deleted){
      // Лазейка для удаления созданных в обход таймаута - позволяет избежать гонок при очень быстром удалении
          if (props.on_change){
            data.deleted = deleted;
                data.command = 'delete';
                props.on_change('notes', itemId, data);
                return;
          }
        }

      const timer = setTimeout(() => {
        // При сверх-быстром изменении полей в разных секциях могут быть гонки
			  if (editMode && !collapsed && data){
          if (props.on_change){
            data.name = name;
            data.equipment = equipment;
            data.customer = customer;
            data.address = address;
            data.stage = stage;
            data.contactperson = contactperson;
            data.cost = cost;
            data.bonus = bonus;
            data.comment = comment;
            data.typeEac = typeEac;
            data.dateEnd = dateEnd;
            data.erector = erector;
            data.bidsId = bidsId;
            data.idCompany = idCompany;
            data.authorId = authorId;
            data.author = author;
            data.date = date ? date.format('DD.MM.YYYY HH:mm:ss') : null;

            data.deleted = deleted;

            if (data.command === undefined || data.command !== 'create'){
              if (deleted){
                data.command = 'delete';
              } else {
                data.command = 'update';
              }
            }

            props.on_change('projects', itemId, data);
          }
        }
			}, 500);

			return () => clearTimeout(timer);

  }, [
    orgId, projType, name, equipment, customer,
      address, stage, contactperson, date,
      cost, bonus, comment, typeEac,
      dateEnd, erector, bidsId, idCompany,
      authorId, author
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
              {name ? name : "Без темы "}
            </div>
            <span className="sa-date-text">
              {date !== null
                ? ` - ` +
                  (date ?  getMonthName(dayjs(date).month() + 1) : '') +
                  ' ' +
                  date?.format('YYYY')
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
              onClick={handleDeleteItem}
            >
              <TrashIcon height={TORG_CHEVRON_SIZE} />
            </span>
          )}
        </div>
      </div>
      <div className={'sa-org-collapse-body'}>
        <div className={'sa-org-collapse-content'}>


          <TorgPageSectionRow
            edit_mode={editMode}
            inputs={[
              {
                label: 'Автор',
                input:
                  <Input
                    key={'texpard_2_' + data?.id}
                    value={author}
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
                    key={'texpard_3_' + data?.id}
                    value={date}
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
            edit_mode={editMode}
            inputs={[
              {
                edit_mode: editMode,
                label: 'Объект',
                input:
                  <Input
                    key={'texpard_4_' + data?.id}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={200}
                    required={true}
                  />,
                  required: true,
                  value: name
              },


            ]}
            extratext={[]}
          />

          <TorgPageSectionRow
            edit_mode={editMode}
            inputs={[
              {
                edit_mode: editMode,
                label: 'Адрес',
                input:
                  <Input
                    key={'texpard_5_' + data?.id}
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={200}
                    required={true}
                  />,
                  required: true,
                  value: address
              },


            ]}
            extratext={[]}
          />

          <TorgPageSectionRow
            edit_mode={editMode}
            inputs={[
              {
                edit_mode: editMode,
                label: 'Заказчик',
                input:
                  <Input
                    key={'texpard_6_' + data?.id}
                    value={customer}
                    onChange={e => setCustomer(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={200}
                    required={true}
                  />,
                  required: true,
                  value: customer
              },
              {
                edit_mode: editMode,
                label: 'Этап',
                input:
                  <Input
                    key={'texpard_7_' + data?.id}
                    value={stage}
                    onChange={e => setStage(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={200}
                  />,
                  required: true,
                  value: stage
              },
            ]}
            extratext={[]}
          />

          <TorgPageSectionRow
            edit_mode={editMode}
            inputs={[
              {
                edit_mode: editMode,
                label: 'Оборудование',
                input:
                  <Input
                    key={'texpard_8_' + data?.id}
                    value={equipment}
                    onChange={e => setEquipment(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={200}
                  />,
                  required: false,
                  value: equipment
              },
              {
                edit_mode: editMode,
                label: 'Тип СОУЭ',
                input:
                  <Input
                    key={'texpard_9_' + data?.id}
                    value={typeEac}
                    onChange={e => setTypeEac(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={200}
                  />,
                  required: true,
                  value: typeEac
              },

            ]}
            extratext={[]}
          />


        <TorgPageSectionRow
            edit_mode={editMode}
            inputs={[
              {
                edit_mode: editMode,
                label: 'Контактное лицо',
                input:
                  // <Input
                  //   key={'texpard_10_' + data?.id}
                  //   value={contactperson}
                  //   onChange={e => setContactperson(e.target.value)}
                  //   // placeholder="Controlled autosize"
                  //   autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                  //   readOnly={!editMode}
                  //   variant="borderless"
                  //   maxLength={200}
                  // />
                  <AutoComplete
                  
                    key={'texpard_10_' + data?.id}
                    placeholder={'Фамилия Имя Отчество'}
                    value={contactperson}
                    onChange={e => setContactperson(e.target.value)}
                    options={orgUsers}
                    />
                  ,
                  required: true,
                  value: contactperson
              },
              {
                edit_mode: editMode,
                label: 'Дата завершения',
                input:
                  <Input
                    key={'texpard_11_' + data?.id}
                    value={dateEnd}
                    onChange={setDateEnd}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={200}
                  />,
                  required: false,
                  value: dateEnd
              },

            ]}
            extratext={[]}
          />


        <TorgPageSectionRow
            edit_mode={editMode}
            inputs={[
              {
                edit_mode: editMode,
                label: 'Стоимость',
                input:
                  <Input
                    key={'texpard_12_' + data?.id}
                    value={cost}
                    onChange={e => setCost(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={200}
                  />,
                  required: false,
                  value: cost
              },
              {
                edit_mode: editMode,
                label: 'Вознаграждение',
                input:
                  <Input
                    key={'texpard_13_' + data?.id}
                    value={bonus}
                    onChange={e => setBonus(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={200}
                  />,
                  required: false,
                  value: bonus
              },

            ]}
            extratext={[]}
          />




        <TorgPageSectionRow
            edit_mode={editMode}
            inputs={[
              {
                edit_mode: editMode,
                label: 'Тип проекта',
                input:
                  <Input
                    key={'texpard_14_' + data?.id}
                    value={erector}
                    onChange={e => setErector(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={200}
                  />,
                  required: true,
                  value: erector
              },


            ]}
            extratext={[]}
          />


          <TorgPageSectionRow
            edit_mode={editMode}
            inputs={[
              {
                edit_mode: editMode,
                label: 'Связанное КП',
                input:
                  <Input
                    key={'texpard_19_' + data?.id}
                    value={bidsId}
                    onChange={e => setBidsId(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={200}
                  />,
                  required: false,
                  value: bidsId
              },


            ]}
            extratext={[]}
          />


          <TorgPageSectionRow
            edit_mode={editMode}
            inputs={[
              {
                edit_mode: editMode,
                label: 'Заметка',
                input:
                  <TextArea
                    key={'texpard_45_' + data?.id}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={5000}
                    required={false}
                  />,
                  required: false,
                  value: comment
              },


            ]}
            extratext={[]}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectTabSectionTorg;