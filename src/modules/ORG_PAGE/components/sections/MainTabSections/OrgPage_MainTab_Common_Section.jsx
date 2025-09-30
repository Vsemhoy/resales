import React, { useEffect, useState } from 'react';
import OrgPageSectionRow, { OPS_TYPE } from '../OrgPageSectionRow';
import { PRODMODE } from '../../../../../config/config';
import { OM_ORG_FILTERDATA } from '../../../../ORG_LIST/components/mock/ORGLISTMOCK';

const OrgPage_MainTab_Common_Section = (props) => {
	const [editMode, seteditMode] = useState(props.edit_mode ? props.edit_mode : false);
	

  const [itemId,         setItemId]           = useState(0);
  const [name,           setName]             = useState('');
  // const [site,           setSite]             = useState('');
  const [id8an_profiles, setId8an_profiles]   = useState(0);
  const [middlename,     setMiddlename]       = useState('');
  const [id8an_fs,       setId8an_fs]         = useState(0);
  const [inn,            setInn]              = useState('');
  const [source,         setSource]           = useState('');
  const [comment,        setComment]          = useState('');
  const [commentinlist,  setCommentinlist]    = useState('');
  const [kindofactivity, setKindofactivity]  = useState('');

  
  const [profsound,      setProfsound]        = useState(null);

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

      setName(props.data?.name);
      // setSite(props.data?.site);
      setMiddlename(props.data?.middlename);
      setId8an_fs(props.data?.id8an_fs ? parseInt(props.data?.id8an_fs) : 0);
      setId8an_profiles(props.data?.id8an_profiles);
      setInn(props.data?.inn);
      setSource(props.data?.source);
      setComment(props.data?.comment);
      setProfsound(props.data?.profsound);
      setCommentinlist(props.data?.commentinlist);
      setKindofactivity(props.data?.kindofactivity);


    }

  }, [props.data, selects]);


	useEffect(() => {
		console.log(id8an_fs);
	}, [id8an_fs]);

	useEffect(() => {
		seteditMode(props.edit_mode);
	}, [props.edit_mode]);

	// useEffect(() => {
	// 	if (PRODMODE) {

	// 	} else {
	// 		setFilterData(OM_ORG_FILTERDATA);
	// 	}
	// }, []);

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
        key={'opmaincom_23'}
				edit_mode={editMode}
				titles={['Название организации']}
				datas={[
					{
						type: OPS_TYPE.STRING,
						value: name,
						max: 250,
						required: true,
						nullable: false,
						placeholder: '',
						name: 'name',
					}
				]}
        on_blur={(data)=>{
					if (data.name !== undefined){
						console.log('data CHANGE', data);
						setName(data.name);
					};

          if (props.on_blur){
            props.on_blur(data);
          }
        }}
			/>

			<OrgPageSectionRow
				key={'opmaincom_23g3'}
				edit_mode={editMode}
				titles={['Форма собственности', 'ИНН']}
				datas={[
					{
						type: OPS_TYPE.SELECT,
						value: id8an_fs,
						options: selects?.fss?.map((item)=>({
              key: "fsse_leu_" + item.id,
              value: item.id,
              label: item.name,
            })),
						max: 500,
						required: true,
						nullable: false,
						placeholder: '',
            showSearch: 'true',
						on_change: (data)=>{
							if (props.on_blur){
								if (data.id8an_fs !== undefined){
									console.log('data', data);
									setId8an_fs(data.id8an_fs);
								}
								props.on_blur(data);
							}
						},
						name: 'id8an_fs',
						
					},
					{
						type: OPS_TYPE.STRING,
						value: inn,
						min: 0,
						max: 30,
						placeholder: '',
						required: true,
						name: 'inn',
					},
				]}
				
        on_blur={(data)=>{
					if (data.id8an_fs !== undefined){
						console.log('data CHANGE', data);
						setId8an_fs(data.id8an_fs);
					};
					if (data.inn !== undefined){
						console.log('data CHANGE', data);
						setInn(data.inn);
					};

					console.log('data', data)
          if (props.on_blur){
            props.on_blur(data);
          }
        }}
				// on_change={(data)=>{
					//   if (data.id8an_fs !== undefined && props.on_blur){
						//     props.on_blur(data);
						//   }
						// }}

			/>

			<OrgPageSectionRow
        key={'opmaincom_223'}
				edit_mode={editMode}

				titles={['Вид деятельности']}
				datas={[
					{
						type: OPS_TYPE.STRING,
						value: kindofactivity,
						max: 250,
						required: true,
						nullable: false,
						placeholder: '',
						name: 'kindofactivity',
					}
				]}
        on_blur={(data)=>{
					if (data.kindofactivity !== undefined){
						console.log('data CHANGE', data);
						setKindofactivity(data.kindofactivity);
					};
					
          if (props.on_blur){
            props.on_blur(data);
          }
        }}
			/>

      <OrgPageSectionRow
        key={'opmaincom_213'}
				edit_mode={editMode}
				titles={['Второе название']}
				datas={[
					{
						type: OPS_TYPE.STRING,
						value: middlename,
						max: 550,
						required: false,
						nullable: true,
						placeholder: '',
						name: 'middlename',
					}
				]}
        on_blur={(data)=>{
					if (data.middlename !== undefined){
						console.log('data CHANGE', data);
						setMiddlename(data.middlename);
					};
          if (props.on_blur){
            props.on_blur(data);
          }
        }}
			/>

			<OrgPageSectionRow
				key={'opmaincom_2334'}
				edit_mode={editMode}
				titles={['Профиль компании', 'Профзвук']}
				datas={[
					{
						type: OPS_TYPE.SELECT,
						value: id8an_profiles,
						options: selects?.profiles?.map((item)=>({
              key: "fsprofle_" + item.key ? item.key : item.id  ,
              value: item.key ? item.key : item.id,
              label: item.label ? item.label : item.name,
            })),
						max: 500,
						required: true,
						nullable: false,
						placeholder: '',
						name: 'id8an_profiles',
            showSearch: 'true'
					},
					{
						type: OPS_TYPE.SELECT,
						value: profsound,
						min: 0,
						max: 30,
						placeholder: '',
						name: 'profsound',
            options: selects?.profsound?.map((item)=>({
              key: "fprofe_" + item.key ? item.key : item.id  ,
              value: item.key ? item.key : item.id,
              label: item.label ? item.label : item.name,
            })),
					},
				]}
        on_change={(data)=>{
					if (data.id8an_profiles !== undefined){
						console.log('data CHANGE', data);
						setId8an_profiles(data.id8an_profiles);
					};
					if (data.profsound !== undefined){
						console.log('data CHANGE', data);
						setProfsound(data.profsound);
					};
          if (props.on_blur){
            props.on_blur(data);
          }
        }}
			/>

      <OrgPageSectionRow
        key={'opmaincom_243'}
				edit_mode={editMode}
				titles={['Источник']}
				datas={[
					{
						type: OPS_TYPE.STRING,
						value: source,
						max: 550,
						required: false,
						nullable: true,
						placeholder: '',
						name: 'source',
					},
          // {
					// 	type: OPS_TYPE.STRING,
					// 	value: site,
					// 	max: 150,
					// 	required: false,
					// 	nullable: true,
					// 	placeholder: '',
					// 	name: 'site',
					// }
				]}
        
        on_blur={(data)=>{
					if (data.profsound !== undefined){
						setSource(data.source);
					};
          if (props.on_blur){
            props.on_blur(data);
          }
        }}
			/>

      <OrgPageSectionRow
        key={'opmaincom_253'}
				edit_mode={editMode}
				titles={['Комментарий']}
				datas={[
					{
						type: OPS_TYPE.TEXTAREA,
						value: comment,
						max: 9250,
						required: false,
						nullable: true,
						placeholder: '',
						name: 'comment',
					}
				]}
        on_blur={(data)=>{
					if (data.comment !== undefined){
						setComment(data.comment);
					};
          if (props.on_blur){
            props.on_blur(data);
          }
        }}
			/>

      <OrgPageSectionRow
        key={'opmaincom_263'}
				edit_mode={editMode}
				titles={['Памятка']}
				datas={[
					{
						type: OPS_TYPE.STRING,
						value: commentinlist,
						max: 9250,
						required: false,
						nullable: true,
						placeholder: '',
						name: 'commentinlist',
					}
				]}
        on_blur={(data)=>{
					if (data.commentinlist !== undefined){
						setCommentinlist(data.commentinlist);
					};
          if (props.on_blur){
            props.on_blur(data);
          }
        }}
			/>

			
		</div>
	);
};

export default OrgPage_MainTab_Common_Section;
