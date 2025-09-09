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
    const [org, setOrg] = useState(0);
    const [theme, setTheme] = useState("");
    const [notes, setNotes] = useState("");
    const [date, setDate] = useState(dayjs().format('DD-MM-YYYY HH:mm:ss'));
    const [creator, setCreator] = useState(0); // id8staff_list
    const [deleted, setDeleted] = useState(0);


    const [objectResult, setObjectResult] = useState({});

    // DATA    // DATA      // DATA      // DATA  

    useEffect(() => {
      if (props.data?.id){
        setObjectResult(props.data);

        setId(props.data.id);
        // if (props.data.id_orgs !== org){
        setOrg(props.data.id_orgs);
        setTheme(props.data.theme);
        setNotes(props.data.notes);
        setCreator(props.data.id8staff_list);
        setDeleted(props.data.deleted);
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
        
        if (changed_data.theme){
            setTheme(changed_data.theme);
        } else if (changed_data.notes){
            setNotes(changed_data.notes);
        };
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            let result = objectResult;
            result.theme = theme;
            result.notes = notes;

            console.log('result', result)

            if (props.on_change){
                props.on_change(id, result);
            }
      }, 250);
      return () => clearTimeout(timer);
    }, [theme, notes]);


  return (
    <div className={'sk-omt-stack'}
    style={{borderLeft: '4px solid #2196F3'}}
    >

      

        <OrgPageSectionRow
            key={'fklasdd1jl' + id}
            edit_mode={editMode}
            titles={['Тема']}
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
            ]}
            on_change={handleChangeData}
        />

        <OrgPageSectionRow
            key={'fkl43asdjl' + id}
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
            on_change={handleChangeData}
        />

        <OrgPageSectionRow
            key={'fklasddjl3' + id}
            edit_mode={editMode}
            titles={['Заметка']}
            datas={[
                {
                type: 'textarea',
                value: notes,
                max: 250,
                required: true,
                nullable: false,
                placeholder: '',
                name: 'notes',
                },
            ]}
            on_change={handleChangeData}
        />

        

    </div>
  );
};

export default OrgNoteEditorSectionBox;