import React, { useEffect, useState } from 'react';

import { CSRF_TOKEN, PRODMODE } from '../../../../../../config/config';
import { OM_ORG_FILTERDATA } from '../../../../../ORG_LIST/components/mock/ORGLISTMOCK';
import OrgPageSectionRow, { OPS_TYPE } from '../../OrgPageSectionRow';
import dayjs from 'dayjs';
import { ORG_PROJECT_DEFENSES, ORG_PROJECT_STATES } from '../../../../../../components/definitions/SALESDEF';
import { PROD_AXIOS_INSTANCE } from '../../../../../../config/Api';
import { ORG_ERECTORS_MOCK, ORG_LINKBID_MOCK } from '../../../mock/ORGPAGEMOCK';




const OrgNoteEditorSectionBox = (props) => {
    const [editMode, seteditMode] = useState(props.edit_mode ? props.edit_mode : false);
    const [filterData, setFilterData] = useState([]);


    // DATA    // DATA      // DATA      // DATA  
    
    const [id, setId] = useState(null);
    const [orgId, setOrgId] = useState(0);
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
    const [date,        setDate] = useState(dayjs().format('DD-MM-YYYY HH:mm:ss'));
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

    const [erectorName, setErectorName] = useState(null);

  const [orgUsers, setOrgUsers] = useState([]);

  const [targetOrgUserId, setTargetOrgUserId] = useState(0);

  const [trigger, setTrigger] = useState(0);
    // const [projType, setProjType] = useState(dayjs().format('DD-MM-YYYY HH:mm:ss')); // id8an_projecttype


  const [mountOrgList, setMountOrgList] = useState([]);
  const [mountBidList, setMountBidList] = useState([]);




    const [objectResult, setObjectResult] = useState({});


      const [selects, setSelects] = useState(null);
      useEffect(() => {
        setSelects(props.selects);
      }, [props.selects]);

    // DATA    // DATA      // DATA      // DATA  

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
      if (props.data?.id){
        setObjectResult(props.data);

        console.log(props.data);

        setId(props.data.id);
        // if (props.data.id_orgs !== org){
        setOrgId(props.data.id_orgs);
        setProjType(props.data.id8an_projecttype);
        setName(props.data.name);
        setEquipment(props.data.equipment);
        setDeleted(props.data.deleted);
        setCustomer(props.data.customer);
        setAddress(props.data.address);
        setStage(props.data.stage);
        setContactperson(props.data.contactperson);
        setCurator(props.data.id8staff_list);
        setDate(props.data.date);
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

        set_type(props.data.type);
      }
    }, [props.data]);

    
    useEffect(() => {
    seteditMode(props.edit_mode);
    }, [props.edit_mode]);


    useEffect(() => {
      if (PRODMODE){


      } else {
        setFilterData(OM_ORG_FILTERDATA);
      }
    }, []);


    // useEffect(() => {
    //     console.log(props.data);
    // }, [props.data]);


const handleChangeData = (changed_data) => {
  console.log('CALL ON CHANGE', changed_data);
    if (changed_data.id_orgs !== undefined) {
        setOrgId(changed_data.id_orgs);
    } else if (changed_data.id8an_projecttype !== undefined) {
        setProjType(changed_data.id8an_projecttype);
    } else if (changed_data.name !== undefined) {
        setName(changed_data.name);
    } else if (changed_data.equipment !== undefined) {
        setEquipment(changed_data.equipment);
    } else if (changed_data.deleted !== undefined) {
        setDeleted(changed_data.deleted);
    } else if (changed_data.customer !== undefined) {
        setCustomer(changed_data.customer); // опечатка в сеттере, но оставил как есть
    } else if (changed_data.address !== undefined) {
        setAddress(changed_data.address);
    } else if (changed_data.stage !== undefined) {
        setStage(changed_data.stage);
    } else if (changed_data.contactperson !== undefined) {
        setContactperson(changed_data.contactperson);
    } else if (changed_data.id8staff_list !== undefined) {
        setCurator(changed_data.id8staff_list);
    } else if (changed_data.date !== undefined) {
        setDate(changed_data.date);
    } else if (changed_data.cost !== undefined) {
        setCost(changed_data.cost);
    } else if (changed_data.bonus !== undefined) {
        setBonus(changed_data.bonus);
    } else if (changed_data.comment !== undefined) {
        setComment(changed_data.comment);
    } else if (changed_data.typepaec !== undefined) {
        setTypeEac(changed_data.typepaec);
    } else if (changed_data.date_end !== undefined) {
        setDateEnd(changed_data.date_end);
    } else if (changed_data.erector_id !== undefined) {
        setErector(changed_data.erector_id);
    // } else if (changed_data.bidsId !== undefined) {
    //     setLinkbidId(changed_data.bidsId);
    } else if (changed_data.bidsId !== undefined) {
        setBidsId(changed_data.bidsId);
    } else if (changed_data.date_create !== undefined) {
        setDateCreate(changed_data.date_create);
    } else if (changed_data.id_company !== undefined) {
        setIdCompany(changed_data.id_company);
    } else if (changed_data.author_id !== undefined) {
        setAuthorId(changed_data.author_id);
    } else if (changed_data.author !== undefined) {
        setAuthor(changed_data.author);
    }
};


    useEffect(() => {
      const timer = setTimeout(() => {
          if (objectResult.id == null){
            // Объект ещё не смонтировался. воизбежание гонок
              return;
          };
            let result = objectResult;
            result.name = name;
            result.equipment = equipment;
            result.customer = customer;
            result.address = address;
            result.stage = stage;
            result.contactperson = contactperson;
            result.id8staff_list = curator; // id8staff_list → curator
            result.date = date;
            result.cost = cost;
            result.bonus = bonus;
            result.comment = comment;
            result.typepaec = typeEac; // typepaec → typeEac
            result.date_end = dateEnd;
            result.erector_id = erector; // erector_id → erector
            result.bidsId     = bidsId; // linkbid_id → linkbidId
            result.date_create = dateCreate;
            result.id_company = idCompany; // id_company → idCompany
            result.author_id = authorId; // author_id → authorId
            result.author = author;
            result.id8an_projecttype = projType;


            console.log('result', result)

            if (props.on_change){
                props.on_change(id, result);
            }
      }, 120);
      return () => clearTimeout(timer);
    }, [orgId, projType, name, equipment, customer,
      address, stage, contactperson, date,
      cost, bonus, comment, typeEac,
      dateEnd, erector, bidsId, idCompany,
      authorId, author
    ]);


    /** -------------------API------------------ */


    /**
     * Архитектура основы от Алана такова, 
     * что загружаются сразу все 35000 компаний в список без всякой фильтрации
     * @param {*} id 
     */
  const get_orgautofill_action = async (id) => {

    if (PRODMODE){
      try {
        let response = await PROD_AXIOS_INSTANCE.post('/api/sales/passportselects', {
          data: {
            erector: searchErector,
          },
          _token: CSRF_TOKEN,
        });
        console.log('response', response);
        if (response.data) {
          setMountOrgList(response.data.selects.erector);
          // if (props.changed_user_data){
          //     props.changed_user_data(response.data);
          // }
  
        }
      } catch (e) {
        console.log(e);
      } finally {
  
      }
    } else {
      setMountOrgList(ORG_ERECTORS_MOCK);
    }
  };


    const get_bidautofill_action = async (id) => {
      if (PRODMODE){
        try {
          let response = await PROD_AXIOS_INSTANCE.post('/api/sales/passportselects', {
            data: {linkbid: searchBid, org_id: orgId},
            _token: CSRF_TOKEN,
          });
          console.log('response', response);
          if (response.data) {
            setMountBidList(response.data.selects.linkbid);
          }
        } catch (e) {
          console.log(e);
        } finally {

        }
      } else {
        setMountBidList(ORG_LINKBID_MOCK);
      }
    };


    /** -------------------API------------------ */

    useEffect(() => {
      get_orgautofill_action();
      console.log('SET ERECTOR', searchErector);
    }, [searchErector, erector]);

    useEffect(() => {
        get_bidautofill_action();
    }, [searchBid]);


    
    useEffect(() => {
      console.log("OLX",mountOrgList);
      console.log("BMX", mountBidList);
    }, [mountOrgList, mountBidList]);

  return (
    <div className={'sk-omt-stack'}
    style={{borderLeft: '4px solid ' + props.color, width: '100%'}}
    >

          <OrgPageSectionRow
            key={'orpprow0_' + id}
            titles={['Автор', 'Дата']}

            datas={[
                {
                type: 'text',
                value: `${props.data.curator?.surname} ${props.data.curator?.name}  ${props.data.curator?.secondname}`,
                max: 250,
                required: true,
                allowClear: false,
                placeholder: '',
                name: '_creator.name',
                },
                {
                type: 'datetime',
                value: date,
                max: 250,
                required: true,
                allowClear: false,
                placeholder: '',
                name: '_date',
                },
            ]}
            // on_change={handleChangeData}
            on_blur={handleChangeData}
        />

        <OrgPageSectionRow
            key={'orpprow1_' + id}
            edit_mode={editMode}
            titles={['Объект']}
            datas={[
                {
                type: 'text',
                value: name,
                max: 250,
                required: true,
                allowClear: false,
                placeholder: '',
                name: 'name',
                },
            ]}
            // on_change={handleChangeData}
            on_blur={handleChangeData}
        />

        <OrgPageSectionRow
            key={'orpprow2_' + id}
            edit_mode={editMode}
            titles={['Адрес']}
            datas={[
                {
                type: 'text',
                value: address,
                max: 250,
                required: true,
                allowClear: false,
                placeholder: '',
                name: 'address',
                },
            ]}
            // on_change={handleChangeData}
            on_blur={handleChangeData}
        />

        <OrgPageSectionRow
            key={'orpprow3_' + id}
            edit_mode={editMode}
            titles={['Заказчик', 'Этап']}
            datas={[
                {
                type: 'text',
                value: customer,
                max: 250,
                required: true,
                allowClear: false,
                placeholder: '',
                name: 'customer',
                },
                {
                type: 'text',
                value: stage,
                max: 250,
                required: true,
                allowClear: false,
                placeholder: '',
                name: 'stage',
                },
            ]}
            // on_change={handleChangeData}
            on_blur={handleChangeData}
        />


        <OrgPageSectionRow
            key={'orpprow4_' + id}
            edit_mode={editMode}
            titles={['Оборудование','Тип СОУЭ']}
            datas={[
                {
                type: 'text',
                value: equipment,
                max: 250,
                required: false,
                allowClear: false,
                placeholder: '',
                name: 'equipment',
                },
                {
                type: 'text',
                value: typeEac,
                max: 250,
                required: false,
                allowClear: false,
                placeholder: '',
                name: 'typepaec',
                },
            ]}
            // on_change={handleChangeData}
            on_blur={handleChangeData}
        />


          <OrgPageSectionRow
            key={'orpprow5_' + id}
            edit_mode={editMode}
            titles={['Контактное лицо','Дата завершения']}
            datas={[
                {
                type: OPS_TYPE.AUTOCOMPLETE,
                value: contactperson,
                max: 250,
                required: true,
                allowClear: false,
                placeholder: 'Фамилия Имя Отчество',
                name: 'contactperson',
                options: orgUsers,
                onClick: ()=>{setTrigger(dayjs().unix())}
                },

                {
                type: OPS_TYPE.DATE,
                value: dateEnd,
                required: false,
                allowClear: true,
                placeholder: 'Когда реализован',
                name: 'date_end',
                },
            ]}
            // on_change={handleChangeData}
            on_blur={handleChangeData}
        />


          <OrgPageSectionRow
            key={'orpprow6_' + id}
            edit_mode={editMode}
            titles={['Стоимость', 'Вознаграждение']}
            datas={[
                {
                type: 'text',
                value: cost,
                max: 100,
                required: false,
                allowClear: false,
                placeholder: '',
                name: 'cost',
                },
                {
                type: 'text',
                value: bonus,
                max: 250,
                required: false,
                allowClear: false,
                placeholder: '',
                name: 'bonus',
                },
            ]}
            // on_change={handleChangeData}
            on_blur={handleChangeData}
        />






      {editMode ? (
        <OrgPageSectionRow
            key={'orpprow7_' + id}
            edit_mode={editMode}
            titles={['Тип проекта']}
            datas={[
                {
                type: OPS_TYPE.SELECT,
                value: projType, 
                max: 250,
                required: true,
                allowClear: false,
                placeholder: '',
                name: 'id8an_projecttype',
                options: selects?.projecttype?.map((item)=>({
                    key: 'keyadflj' + item.id,
                    value: item.id,
                    label: item.name
                }))
                },
            ]}
            on_change={handleChangeData}
            // on_blur={handleChangeData}
        />

          ) :  (
          <OrgPageSectionRow
            key={'orpprow10_7_' + id}
            titles={['Тип проекта']}
            datas={[
                {
                type: OPS_TYPE.STRING,
                value: _type?.name,
                max: null,
                required: true,
                allowClear: true,
                placeholder: '',
                name: 'id8an_projecttype',
                },
            ]}
        />
          )}



        <OrgPageSectionRow
            key={'orpprow8_' + id}
            edit_mode={editMode}
            titles={['Монтажная организация']}
            datas={[
                {
                type: OPS_TYPE.SELECT,
                value: erector,
                max: Number.MAX_SAFE_INTEGER,
                required: false,
                allowClear: true,
                placeholder: 'ID организации',
                name: 'erector_id',
                options: mountOrgList,
                  showSearch: true,
                link: '/orgs/',
                on_change: (ev)=>setErector(ev),
                on_search: (et)=>{setSearchErector(et)}
                },
            ]}
            on_change={handleChangeData}
            // on_blur={handleChangeData}
        />


        <OrgPageSectionRow
            key={'orpprow9_' + id}
            edit_mode={editMode}
            titles={['Связанное КП']}
            datas={[
                {
                  options: mountBidList,
                  type: OPS_TYPE.MSELECT,
                  value: bidsId,
                  max: Number.MAX_SAFE_INTEGER,
                  required: false,
                  allowClear: true,
                  placeholder: 'ID коммерческого предложения',
                  name: 'bidsId',
                  link: '/bids/',
                  blank: true,
                  showSearch: true,
                  on_search: (et)=>{setSearchBid(et)}
                },
            ]}
            // on_change={handleChangeData}
            on_blur={handleChangeData}
            // on_change={(data)=>{console.log(data)}}
            on_change={handleChangeData}
        />




        <OrgPageSectionRow
            key={'orpprow10_' + id}
            edit_mode={editMode}
            titles={['Комментарий']}
            datas={[
                {
                type: OPS_TYPE.TEXTAREA,
                value: comment,
                max: null,
                required: false,
                allowClear: true,
                placeholder: '',
                name: 'comment',
                },
            ]}
            // on_change={handleChangeData}
            on_blur={handleChangeData}
        />


        
        


    </div>
  );
};

export default OrgNoteEditorSectionBox;


