import React, { useEffect, useState } from 'react';
import OrgPageSectionRow, { OPS_TYPE } from '../OrgPageSectionRow';
import { PRODMODE } from '../../../../../config/config';
import { OM_ORG_FILTERDATA } from '../../../../ORG_LIST/components/mock/ORGLISTMOCK';
import { ShortName } from '../../../../../components/helpers/TextHelpers';

const OrgPage_MainTab_Depart_Section = (props) => {
	const [editMode, seteditMode] = useState(props.edit_mode ? props.edit_mode : false);
	const [filterData, setFilterData] = useState([]);

  const [itemId,         setItemId]           = useState(0);
  const [statusmoney, setStatusmoney]         = useState(0);
  const [conveyance, setConveyance]           = useState(0);
  const [typeList, setTypeList] = useState(0);
  const [listComment,       setListComment] = useState('');

  const [author, setAuthor] = useState(''); //id8staff_list7author
  const [curator, setCurator] = useState('');


  const [selects, setSelects] = useState(null);

  useEffect(() => {
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

			console.log('IIIIIIIIIIIIIIIIIIIIIIIIII');
			console.log(props.data);

      setStatusmoney(props.data?.id8an_statusmoney);
      setConveyance(props.data?.id8an_conveyance);
			
      setTypeList(props.data?.list?.id8an_typelist ? props.data?.list?.id8an_typelist : 0);
      setListComment(props.data?.list?.comment ? props.data?.list?.comment : '');

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
		if (props.on_blur){
			let obb = {};
			obb.list = 
			{
				id8an_typelist: typeList,
				comment: listComment,
				id_orgs: itemId,
			}
			console.log(obb);
			props.on_blur(obb);
		}
	}, [typeList, listComment]);


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
		<div className={'sk-omt-stack'} style={{ borderLeft: '0px solid ' + props.color }}>
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
						allowClear: false,
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
						max: 1150,
						required: false,
						placeholder: '',
						name: 'id8an_statusmoney',
					},
					{
						type: OPS_TYPE.SELECT,
						value: conveyance,
						min: 0,
						max: 1120,
						placeholder: '',
            options: selects?.conveyance?.map((item)=>({
              key: "fsseb_" + item.id,
              value: item.id,
              label: item.name,
            })),
						name: 'id8an_conveyance',
						 allowClear: true,
					},
				]}
        on_blur={(data)=>{
					console.log('COOOCOCO', data);
						if (data.id8an_statusmoney !== undefined){
							setStatusmoney(data.id8an_statusmoney);
						}
						if (data.id8an_conveyance !== undefined){
							setConveyance(data.id8an_conveyance);
						}

          if (props.on_blur){
            props.on_blur(data);
          }
        }}
			/>

			<OrgPageSectionRow
				key={'opmadepas_003'}
				edit_mode={editMode}
				titles={['Списки', 'Комментарий']}
				datas={[
					{
						type: 'select',
						value: typeList,
						options: selects?.rate_lists?.map((item)=>({
              key: "fssebli_" + item.id,
              value: item.id,
              label: item.name,
            })),
						max: 1150,
						required: false,
						allowClear: true,
						placeholder: '',
						name: 'id8an_typelist',
					},
					{
						type: OPS_TYPE.STRING,
						value: listComment,
						min: 0,
						max: 1200,
						placeholder: '',
						name: 'comment',
					},
				]}
        on_blur={(data)=>{
          if (props.on_blur){
						console.log(data);
						if (data.id8an_typelist !== undefined){
							setTypeList(data.id8an_typelist);
						}
						if (data.comment !== undefined){
							setListComment(data.comment);
						}
          }
        }}
			/>
		</div>
	);
};

export default OrgPage_MainTab_Depart_Section;
