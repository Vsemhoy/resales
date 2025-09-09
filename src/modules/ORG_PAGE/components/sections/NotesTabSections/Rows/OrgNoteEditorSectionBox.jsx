import React, { useEffect, useState } from 'react';

import { PRODMODE } from '../../../../../../config/config';
import { OM_ORG_FILTERDATA } from '../../../../../ORG_LIST/components/mock/ORGLISTMOCK';
import OrgPageSectionRow from '../../OrgPageSectionRow';
import dayjs from 'dayjs';




const OrgNoteEditorSectionBox = (props) => {
    const [editMode, seteditMode] = useState(props.edit_mode ? props.edit_mode : false);
    const [filterData, setFilterData] = useState([]);


    useEffect(() => {
    seteditMode(props.edit_mode);
    }, [props.edit_mode]);


    useEffect(() => {
      if (PRODMODE){


      } else {
        setFilterData(OM_ORG_FILTERDATA);
      }
    }, []);


    useEffect(() => {
        console.log(props.data);
    }, [props.data]);;

  return (
    <div className={'sk-omt-stack'}
    style={{borderLeft: '4px solid #2196F3'}}
    >

        {/* <OrgPageSectionRow
            edit_mode={editMode}
            key={'fklasdjl'}
            titles={['Название организации']}
            datas={['Тестовая карточка организации']}
            comment={"Здесь будет длинный комментарий ли очень длинный"}
        /> */}

        {/* <OrgPageSectionRow
            edit_mode={editMode}
            columns={2}
            titles={['Имя', 'Возраст', 'Дата рождения']}
            datas={[
                {
                type: 'string',
                value: 'Иван',
                max: 50,
                required: true,
                nullable: false,
                placeholder: '',
                name: 'username',
                },
                {
                type: 'uinteger',
                value: 25,
                min: 0,
                max: 120,
                placeholder: '',
                name: 'userbirth',
                },
                {
                type: 'date',
                value: '1999-03-15',
                placeholder: '',
                name: 'userage',
                },
            ]}
            comment={{
                type: 'textarea',
                value: `Иван Это важный клиент
B ybjfkldsajklf fajsdlk fjlaksjdfklajs kdlfjaksljdfkasj dklfjas kldfa
asdklfjaskld jfkasjdfas dfkjaslkdfjklasjdfas
d
faskdjfklasj dkfljsdklfjsakl`,
                max: 500,
                required: false,
                nullable: true,
                placeholder: '',
                name: 'usercomment',
                }}
            on_change={(data) => console.log('Изменения:', data)}
        /> */}

        {/* <OrgPageSectionRow
            key={'fklasddjl'}
            edit_mode={editMode}
            titles={['Форма собственности', 'ИНН']}
            datas={[
                {
                type: 'select',
                value: 9,
                options: filterData.profiles,
                max: 50,
                required: true,
                nullable: false,
                placeholder: '',
                name: 'username',
                },
                {
                type: 'uinteger',
                value: 25,
                min: 0,
                max: 120,
                placeholder: '',
                name: 'userbirth',
                }
            ]}
        /> */}

        <OrgPageSectionRow
            key={'fklasdd1jl' + props.data.id}
            edit_mode={editMode}
            titles={['Тема']}
            datas={[
                {
                type: 'text',
                value: props.data.theme,
                max: 250,
                required: true,
                nullable: false,
                placeholder: '',
                name: 'theme',
                },
            ]}
        />

        <OrgPageSectionRow
            key={'fkl43asdjl' + props.data.id}
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
                value: props.data.date,
                max: 250,
                required: true,
                nullable: false,
                placeholder: '',
                name: '_date',
                },
            ]}
        />

        <OrgPageSectionRow
            key={'fklasddjl3' + props.data.id}
            edit_mode={editMode}
            titles={['Заметка']}
            datas={[
                {
                type: 'textarea',
                value: props.data.notes,
                max: 250,
                required: true,
                nullable: false,
                placeholder: '',
                name: 'notes',
                },
            ]}
        />

        

    </div>
  );
};

export default OrgNoteEditorSectionBox;