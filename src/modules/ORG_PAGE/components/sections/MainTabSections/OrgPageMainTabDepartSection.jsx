import React, { useEffect, useState } from 'react';
import OrgPageSectionRow, { OPS_TYPE } from '../OrgPageSectionRow';
import { PRODMODE } from '../../../../../config/config';
import { OM_ORG_FILTERDATA } from '../../../../ORG_LIST/components/mock/ORGLISTMOCK';
import { ShortName } from '../../../../../components/helpers/TextHelpers';

const OrgPageMainTabDepartSection = (props) => {
	const [editMode, seteditMode] = useState(props.edit_mode ? props.edit_mode : false);
	const [filterData, setFilterData] = useState([]);

  const [itemId,         setItemId]           = useState(0);
  const [statusmoney, setStatusmoney]         = useState(0);
  const [conveyance, setConveyance]           = useState(0);

  const [author, setAuthor] = useState(''); //id8staff_list7author
  const [curator, setCurator] = useState('');


  const [selects, setSelects] = useState(null);

  useEffect(() => {
    console.log('props.selects', props.selects)
    if (props.selects){
      setSelects(props.selects);
    }
  }, [props.selects]);

  useEffect(() => {
    if (props.data?.id){
      setItemId(props.data?.id);
      // setObjectResult(props.data);
      if (props.data?.creator){
        setAuthor(ShortName(props.data?.creator.surname, props.data?.creator.name, props.data?.curator.secondname));
      } else {
        setAuthor('');
      };
      if (props.data?.curator){
        setCurator(ShortName(props.data?.curator.surname, props.data?.curator.name, props.data?.curator.secondname));
      } else {
        setCurator('');
      };

      setStatusmoney(props.data?.id8an_statusmoney);
      setConveyance(props.data?.id8an_conveyance);

      // setName(props.data?.name);
      // setSite(props.data?.site);
      // setMiddlename(props.data?.middlename);
      // setId8an_fs(props.data?.id8an_fs);
      // setId8an_profiles(props.data?.id8an_profiles);
      // setInn(props.data?.inn);
      // setSource(props.data?.source);
      // setComment(props.data?.comment);
      // setProfsound(props.data?.profsound);
      // setCommentinlist(props.data?.commentinlist);
      // setKindofactivity(props.data?.kindofactivity);


    }

  }, [props.data, selects]);


  useEffect(() => {
    console.log('props.selects', props.selects)
    if (props.selects){
      setSelects(props.selects);
    }
  }, [props.selects]);


	useEffect(() => {
		seteditMode(props.edit_mode);
	}, [props.edit_mode]);

	useEffect(() => {
		if (PRODMODE) {
		} else {
			setFilterData(OM_ORG_FILTERDATA);
		}
	}, []);

	return (
		<div className={'sk-omt-stack'} style={{ borderLeft: '4px solid ' + props.color }}>
			{/* <OrgPageSectionRow
            edit_mode={editMode}
            key={'fklasdjl'}
            titles={['Название организации']}
            datas={['Тестовая карточка организации']}
            comment={"Здесь будет длинный комментарий ли очень длинный"}
        /> */}

			<OrgPageSectionRow
        key={'opmadepas_001'}
				// edit_mode={editMode}
				columns={2}
				titles={['Автор', 'Куратор']}
				datas={[
					{
						type: OPS_TYPE.STRING,
						value: author,
						max: 50,
						required: true,
						nullable: false,
						placeholder: '',
						name: 'username',
					},
					{
						type: OPS_TYPE.STRING,
						value: curator,
						min: 0,
						max: 120,
						placeholder: '',
						name: 'userbirth',
					},
				]}
				
				// on_blur={(data)=>{
        //   if (props.on_blur){
        //     props.on_blur(data);
        //   }
        // }}
			/>

			<OrgPageSectionRow
				key={'opmadepas_002'}
				edit_mode={editMode}
				titles={['Статус $', 'Способ доставки']}
				datas={[
					{
						type: OPS_TYPE.SELECT,
						value: statusmoney,
						options: selects?.price_statuses?.map((item)=>({
              key: "fsseb_" + item.id,
              value: item.id,
              label: item.name,
            })),
						max: 150,
						required: true,
						nullable: false,
						placeholder: '',
						name: 'id8an_statusmoney',
					},
					{
						type: OPS_TYPE.SELECT,
						value: 25,
						min: 0,
						max: 120,
						placeholder: '',
            options: selects?.price_statuses?.map((item)=>({
              key: "fsseb_" + item.id,
              value: item.id,
              label: item.name,
            })),
						name: 'userbirth',
					},
				]}
        on_blur={(data)=>{
          if (props.on_blur){
            props.on_blur(data);
          }
        }}
			/>

			<OrgPageSectionRow
				key={'opmadepas_003'}
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
					},
				]}
        on_blur={(data)=>{
          if (props.on_blur){
            props.on_blur(data);
          }
        }}
			/>
		</div>
	);
};

export default OrgPageMainTabDepartSection;
