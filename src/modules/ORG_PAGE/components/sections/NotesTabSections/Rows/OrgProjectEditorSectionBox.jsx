import React, { useEffect, useState } from 'react';

import { PRODMODE } from '../../../../../../config/config';
import { OM_ORG_FILTERDATA } from '../../../../../ORG_LIST/components/mock/ORGLISTMOCK';
import OrgPageSectionRow from '../../OrgPageSectionRow';
import dayjs from 'dayjs';




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
    const [linkbidId,   setLinkbidId] = useState(null);
    const [dateCreate,  setDateCreate] = useState( dayjs().unix() ); 
    const [idCompany,   setIdCompany] = useState('');
    const [authorId,    setAuthorId] = useState(null);
    const [author,    setAuthor] = useState(null);


    // const [projType, setProjType] = useState(dayjs().format('DD-MM-YYYY HH:mm:ss')); // id8an_projecttype







    const [objectResult, setObjectResult] = useState({});

    const [SKIPPER, setSKIPPER] = useState(1);

    // DATA    // DATA      // DATA      // DATA  

    useEffect(() => {
      if (props.data?.id){
        setObjectResult(props.data);

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
        setLinkbidId(props.data.linkbid_id);
        setDateCreate(props.data.date_create);
        setIdCompany(props.data.id_company);
        setDeleted(props.data.deleted);
        setAuthorId(props.data.author_id);
        setAuthor(props.data.author);

        
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
    } else if (changed_data.linkbid_id !== undefined) {
        setLinkbidId(changed_data.linkbid_id);
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

            console.log('result', result)

            if (props.on_change){
                props.on_change(id, result);
            }
      }, 120);
      return () => clearTimeout(timer);
    }, [orgId, projType, name, equipment, customer,
      address, stage, contactperson, date,
      cost, bonus, comment, typeEac,
      dateEnd, erector, linkbidId, idCompany,
      authorId, author
    ]);


  return (
    <div className={'sk-omt-stack'}
    style={{borderLeft: '4px solid ' + props.color}}
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
            key={'orpprow1_' + id}
            edit_mode={editMode}
            titles={['Объект']}
            datas={[
                {
                type: 'text',
                value: name,
                max: 250,
                required: true,
                nullable: false,
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
                nullable: false,
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
                nullable: false,
                placeholder: '',
                name: 'customer',
                },
                {
                type: 'text',
                value: stage,
                max: 250,
                required: true,
                nullable: false,
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
                required: true,
                nullable: false,
                placeholder: '',
                name: 'equipment',
                },
                {
                type: 'text',
                value: typeEac,
                max: 250,
                required: true,
                nullable: false,
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
            titles={['Контактное лицо','Состояние']}
            datas={[
                {
                type: 'text',
                value: contactperson,
                max: 250,
                required: true,
                nullable: false,
                placeholder: '',
                name: 'contactperson',
                },
                {
                type: 'text',
                value: projType,
                max: 250,
                required: true,
                nullable: false,
                placeholder: '',
                name: 'id8an_projecttype',
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
                max: 250,
                required: true,
                nullable: false,
                placeholder: '',
                name: 'cost',
                },
                {
                type: 'text',
                value: bonus,
                max: 250,
                required: true,
                nullable: false,
                placeholder: '',
                name: 'bonus',
                },
            ]}
            // on_change={handleChangeData}
            on_blur={handleChangeData}
        />


        <OrgPageSectionRow
            key={'orpprow7_' + id}
            edit_mode={editMode}
            titles={['Защита проекта/тип']}
            datas={[
                {
                type: 'text',
                value: name,
                max: 250,
                required: true,
                nullable: false,
                placeholder: '',
                name: 'name',
                },
            ]}
            // on_change={handleChangeData}
            on_blur={handleChangeData}
        />


        <OrgPageSectionRow
            key={'orpprow8_' + id}
            edit_mode={editMode}
            titles={['Монтажная организация']}
            datas={[
                {
                type: 'text',
                value: erector,
                max: 250,
                required: true,
                nullable: false,
                placeholder: '',
                name: 'erector_id',
                },
            ]}
            // on_change={handleChangeData}
            on_blur={handleChangeData}
        />

        <OrgPageSectionRow
            key={'orpprow9_' + id}
            edit_mode={editMode}
            titles={['Связанное КП']}
            datas={[
                {
                type: 'text',
                value: name,
                max: 250,
                required: true,
                nullable: false,
                placeholder: '',
                name: 'name',
                },
            ]}
            // on_change={handleChangeData}
            on_blur={handleChangeData}
        />

        <OrgPageSectionRow
            key={'orpprow10_' + id}
            edit_mode={editMode}
            titles={['Комментарий']}
            datas={[
                {
                type: 'text',
                value: name,
                max: 250,
                required: true,
                nullable: false,
                placeholder: '',
                name: 'name',
                },
            ]}
            // on_change={handleChangeData}
            on_blur={handleChangeData}
        />


        
        


    </div>
  );
};

export default OrgNoteEditorSectionBox;