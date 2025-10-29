import React, { useEffect, useState } from 'react';
import TorgPageSectionRow from '../../TorgPageSectionRow';
import { Input, Select } from 'antd';
import dayjs from 'dayjs';
import TextArea from 'antd/es/input/TextArea';
import { TORG_MAX_ROWS_TEXTAREA, TORG_MIN_ROWS_TEXTAREA } from '../../TorgConfig';
import { prepareRowComponentToken } from 'antd/es/grid/style';

const MianBigSectionOrg = (props) => {
  const [editMode, setEditMode] = useState(false);

  const [selects, setSelects] = useState([]);

    const [name,           setName]             = useState('');
    const [id8an_profiles, setId8an_profiles]   = useState(null);
    const [middlename,     setMiddlename]       = useState('');
    const [id8an_fs,       setId8an_fs]         = useState(null);
    const [inn,            setInn]              = useState('');
    const [source,         setSource]           = useState('');
    const [comment,        setComment]          = useState('');
    const [commentinlist,  setCommentinlist]    = useState('');
    const [kindofactivity, setKindofactivity]   = useState('');
    const [subcompanies,   setSubcompanies]     = useState([]);
    const [profsound,      setProfsound]        = useState(null);



  const [itemId, setItemId] = useState(null);

    const [BLUR_FLAG, setBLUR_FLAG] = useState(null);
    const [ACTION_FLAG, setACTION_FLAG] = useState(null);

  useEffect(() => {
    setEditMode(props.edit_mode)
  }, [props.edit_mode]);

  useEffect(() => {
    setBLUR_FLAG(null);
    setACTION_FLAG(null);
   }, [props.data.id, props.org_id]);

  useEffect(() => {
    setItemId(props.data.id);
    
    setName(props.data.name);
    setMiddlename(props.data.middlename);
    setSource(props.data.source);
    setId8an_profiles(props.data.id8an_profiles ? props.data.id8an_profiles : null);
    setId8an_fs(props.data.id8an_fs ? props.data.id8an_fs  : null);
    setInn(props.data.inn);
    setComment(props.data.comment);
    setCommentinlist(props.data.commentinlist);
    setKindofactivity(props.data.kindofactivity);
    setSubcompanies(props.data.subcompanies ? props.data.subcompanies : []);
    setProfsound(props.data.profsound ? props.data.profsound : null);
  }, [props.data]);

  useEffect(() => {
    if (BLUR_FLAG === null){ return; }
      if (props.on_blur){
        props.on_blur(collectData());
      }
  }, [
    BLUR_FLAG,
  ]);


  useEffect(() => {
    setSelects(props.selects);
  }, [props.selects]);

  const collectData = () => ({
    name,
    middlename,
    id8an_profiles,
    id8an_fs,
    inn,
    source,
    comment,
    commentinlist,
    kindofactivity,
    profsound,
    subcompanies
  });

  // Для отправки прямо в коллектор по кейдауну
  useEffect(() => {
    if (ACTION_FLAG && props.on_change && editMode){
      const timer = setTimeout(() => {
        props.on_change(collectData());
    }, 500);
    return () => clearTimeout(timer);
    }
  }, [   
    name,
    middlename,
    id8an_profiles,
    id8an_fs,
    inn,
    source,
    comment,
    commentinlist,
    kindofactivity,
    subcompanies,
    profsound]);


  return (
    <div className={'sa-org-collapse-content'}>
            <TorgPageSectionRow
                edit_mode={editMode}
                inputs={[
                {
                  edit_mode: editMode,
                  label: 'Название организации',
                  input:
                    <Input
                      key={'namesfhasdfjdfkl asderow' + itemId}
                      value={name}
                      // onChange={e => setAddress(e.target.value)}
                      onBlur={()=>{setBLUR_FLAG(dayjs().unix());}}
                      onChange={e => {
                        setACTION_FLAG(1);
                        setName(e.target.value);
                      }
                      }
                      // placeholder="Controlled autosize"
                      disabled={!editMode}
                      variant="borderless"
                      maxLength={550}
                      required={true}
                    />,
                    required: true,
                    value: name
                },
              ]}
              action={<div></div>}
            />
            
            {/* ===================================================================================================== */}
            <TorgPageSectionRow
                
                edit_mode={editMode}
                inputs={[
                {
                  edit_mode: editMode,
                  label: 'Форма собственности',
                  input:
                    
                    <Select
                    filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                }
                    showSearch
                      key={'fsrow_' + itemId}
                      value={parseInt(id8an_fs)}
                      onChange={(ee)=>{
                        setId8an_fs(ee);
                        setACTION_FLAG(1);
                        setBLUR_FLAG(dayjs().unix());
                      }}
                      // placeholder="Controlled autosize"
                      // disabled={!editMode}
                      variant="borderless"
                      maxLength={2500}
                      required={true}
                      size={'small'}
                      options={selects?.fss?.map((item)=>({
                        key: "twnitdm_" + item.id,
                        value: parseInt(item.id),
                        label: item.name
                      }))}
                      disabled={!editMode}
                    />,
                    required: true,
                    value: id8an_fs
                },
                  {
                  edit_mode: editMode,
                  label: 'ИНН',
                  input:
                    
                    <Input
                      key={'ndameserow' + itemId}
                      value={inn}
                      // onChange={e => setAddress(e.target.value)}
                      onBlur={()=>{setBLUR_FLAG(dayjs().unix());}}
                      onChange={e => {
                        setACTION_FLAG(1);
                        setInn(e.target.value);
                      }}
                      // placeholder="Controlled autosize"
                      disabled={!editMode}
                      variant="borderless"
                      maxLength={66}
                      required={true}
                    />,
                    required: true,
                    value: inn
                },
              ]}
            action={
              <div></div>
            }
            
            />
            {/* ===================================================================================================== */}
              <TorgPageSectionRow
                edit_mode={editMode}
                inputs={[
                {
                  edit_mode: editMode,
                  label: 'Вид деятельности',
                  input:
                    <Input
                      key={'name4serddow' + itemId}
                      value={kindofactivity}
                      // onChange={e => setAddress(e.target.value)}
                      onBlur={()=>{setBLUR_FLAG(dayjs().unix());}}
                      onChange={e => {
                        setACTION_FLAG(1);
                        setKindofactivity(e.target.value);
                      }}
                      // placeholder="Controlled autosize"
                      disabled={!editMode}
                      variant="borderless"
                      maxLength={550}
                      required={true}
                    />,
                    required: true,
                    value: kindofactivity
                },
              ]}
              action={<div></div>}
            />
            
            {/* ===================================================================================================== */}

              <TorgPageSectionRow
                edit_mode={editMode}
                explabel={'СУБ'}
                inputs={[
                {
                  edit_mode: editMode,
                  label: 'Второе название',
                  input:
                    <Input
                      key={'names5erow' + itemId}
                      value={middlename}
                      // onChange={e => setAddress(e.target.value)}
                      onBlur={()=>{setBLUR_FLAG(dayjs().unix());}}
                      onChange={e => {
                        setACTION_FLAG(1);
                        setMiddlename(e.target.value);
                      }}
                      // placeholder="Controlled autosize"
                      disabled={!editMode}
                      variant="borderless"
                      maxLength={550}
                      required={true}
                    />,
                    required: true,
                    value: middlename
                },
              ]}
              action={<div></div>}
            />
            
            {/* ===================================================================================================== */}
            <TorgPageSectionRow
                
                edit_mode={editMode}
                inputs={[
                {
                  edit_mode: editMode,
                  label: 'Профиль компании',
                  input:
                    
                    <Select
                    showSearch
                                         filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                }
                      key={'fsr2ow_' + itemId}
                      value={parseInt(id8an_profiles)}
                      onChange={(ee)=>{
                        setId8an_profiles(ee);
                        setACTION_FLAG(1);
                        setBLUR_FLAG(dayjs().unix());
                      }}
                      
                      // placeholder="Controlled autosize"
                      // disabled={!editMode}
                      variant="borderless"
                      maxLength={2500}
                      required={true}
                      size={'small'}
                      options={selects?.profiles?.map((item)=>({
                        key: "fsprofle_" + item.key ? item.key : item.id  ,
                        value: item.key ? item.key : item.id,
                        label: item.label ? item.label : item.name,
                      }))}
                      disabled={!editMode}
                    />,
                    required: true,
                    value: id8an_profiles
                },
                  {
                  edit_mode: editMode,
                  label: 'Профзвук',
                  input:
                    
                    <Select
                    showSearch
                     filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                }
                      key={'fs54row_' + itemId}
                      value={profsound == 2 ? 2 : 1}
                      onChange={(ee)=> {
                        setProfsound(ee);
                        setACTION_FLAG(1);
                        setBLUR_FLAG(dayjs().unix());
                      }}
                      // placeholder="Controlled autosize"
                      // disabled={!editMode}
                      variant="borderless"
                      maxLength={2500}
                      required={true}
                      size={'small'}
                      options={selects?.profsound?.map((item)=>({
                        key: "fprofe_" + item.key ? item.key : item.id  ,
                        value: item.key ? item.key : item.id,
                        label: item.label ? item.label : item.name,
                      }))}
                      disabled={!editMode}
                    />,
                    required: false,
                    value: profsound
                },
              ]}
            action={
              <div></div>
            }
            
            />
            {/* ===================================================================================================== */}

            <TorgPageSectionRow
                edit_mode={editMode}
                inputs={[
                {
                  edit_mode: editMode,
                  label: 'Источник',
                  input:
                    <Input
                      key={'nameserow' + itemId}
                      value={source}
                      // onChange={e => setAddress(e.target.value)}
                      onBlur={()=>{setBLUR_FLAG(dayjs().unix());}}
                      onChange={e => {
                        setSource(e.target.value);
                      setACTION_FLAG(1);
                    }}
                      // placeholder="Controlled autosize"
                      disabled={!editMode}
                      variant="borderless"
                      maxLength={550}
                      required={false}
                    />,
                    required: false,
                    value: source
                },
              ]}
              action={<div></div>}
            />
            
            {/* ===================================================================================================== */}


            <TorgPageSectionRow
                edit_mode={editMode}
                inputs={[
                {
                  edit_mode: editMode,
                  label: 'Комментарий',
                  input:
                    <TextArea
                      key={'nameserow' + itemId}
                      value={comment}
                      // onChange={e => setAddress(e.target.value)}
                      onBlur={()=>{setBLUR_FLAG(dayjs().unix());}}
                      onChange={e => {
                        setACTION_FLAG(1);
                        setComment(e.target.value);
                      }}
                      // placeholder="Controlled autosize"
                      disabled={!editMode}
                      variant="borderless"
                      maxLength={5000}
                      required={false}
                      autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    />,
                    required: false,
                    value: name
                },
              ]}
              action={<div></div>}
            />
            
            {/* ===================================================================================================== */}

            <TorgPageSectionRow
                edit_mode={editMode}
                inputs={[
                {
                  edit_mode: editMode,
                  label: 'Памятка',
                  input:
                    <Input
                      key={'nameserow' + itemId}
                      value={commentinlist}
                      // onChange={e => setAddress(e.target.value)}
                      onBlur={()=>{setBLUR_FLAG(dayjs().unix());}}
                      onChange={e => {
                        setACTION_FLAG(1);
                        setCommentinlist(e.target.value);
                      }}
                      // placeholder="Controlled autosize"
                      disabled={!editMode}
                      variant="borderless"
                      maxLength={5550}
                      required={false}
                    />,
                    required: false,
                    value: commentinlist
                },
              ]}
              action={<div></div>}
            />

            <TorgPageSectionRow
                edit_mode={editMode}

                inputs={[
{
                  edit_mode: editMode,
                  label: 'Дочерние компании',
                  input:
                     <Select
                      mode="tags"
                      style={{ width: '100%' }}
                      variant="borderless"
                      size='small'
                      value={subcompanies?.map(item => item.name) || []} 
                      placeholder={'ООО "Новый Свет"'}
                      onChange={(names)=>{
                        const newTags  = names.map(tagName => {
                          const existing = subcompanies?.find(t => t.name === tagName);
                          if (existing) {
                            return existing;
                          } else {
                            let nn = {id: "new_" + dayjs().unix() + "_" + subcompanies.length,
                              name: tagName
                            };
                            return(nn);
                          };
                        });
                        setACTION_FLAG(1);
                        setSubcompanies(newTags);
                        setBLUR_FLAG(dayjs().unix());
                      }}
                      disabled={!editMode}
                      options={subcompanies?.map((item)=>({
                        key: "subcoming_" + item.id,
                        value: item.name,
                        label: item.name
                      }))}
                    />,
                    required: false,
                    value: subcompanies
                },
              ]}
              action={<div></div>}
            />
            
            {/* ===================================================================================================== */}
          </div>
  );
};

export default MianBigSectionOrg;