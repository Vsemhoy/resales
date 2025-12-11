import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import HighlightTextBreaker from '../../../../components/helpers/HighlightTextBreaker';
import HighlightText from '../../../../components/helpers/HighlightText';
import TextArea from 'antd/es/input/TextArea';
import { Select } from 'antd';
import { ShortName } from '../../../../components/helpers/TextHelpers';
import { CSRF_TOKEN, PRODMODE } from '../../../../config/config';
import { PROD_AXIOS_INSTANCE } from '../../../../config/Api';


const BugModalRow = ({ item, isAdmin, filterUserName, filterText, StatusBadge, statuses, userdata, filterConnment, filterResult }) => {
  // Если item не передан, рендерим пустой div или ничего
  const [editStatus, setEditStatus] = useState(false);
  const [editComment, setEditComment] = useState(false);
  const [editResult, setEditResult] = useState(false);

  const [comment, setComment] = useState('');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');

  const [rowOnSaveState, setRowOnSaveState] = useState(false);

  
useEffect(() => {
  setComment(item.comment || '');
  setResult(item.result || '');     // ← Правильно: состояние для значения
  setStatus(item.status_id);
  // НЕ трогаем editResult, comment, status — они инициализированы false
}, [item]);


  



  const mouseDoownResult = (ev) => {
    setResult(ev.target.value);
  }
  const keydownResult = (ev) => {
    if (ev.key === 'Escape'){
      setTimeout(() => {
          ev.preventDefault();
          setResult(item.result);
          setEditResult(false);
          return;
        
      }, 1000);
    }

    if (ev.ctrlKey && ev.key === "Enter"){
      let str = "\n" +  dayjs().format('DD.MM.YYYY  HH:MM') + " - " + ShortName( userdata?.user?.surname, userdata?.user?.name, userdata?.user?.secondname);
      setResult((result.trim() + str).trim() + " :\n");
    }
  }

  const mouseDoownComment = (ev) => {
    setComment(ev.target.value);
  }
  const keydownComment = (ev) => {
        if (ev.key === 'Escape'){
      setTimeout(() => {
          ev.preventDefault();
          setComment(item.result);
          setEditComment(false);
          return;
      }, 100);
    }
    if (ev.ctrlKey && ev.key === "Enter"){
      let str = "\n" +  dayjs().format('DD.MM.YYYY  HH:MM') + " - " + ShortName( userdata?.user?.surname, userdata?.user?.name, userdata?.user?.secondname);
      setComment((comment.trim() + str).trim() + " :\n");
    }
  }

  const onChangeStatus = (val) => {
    setStatus(val);
    setEditStatus(false);
    sendToServer('status_id', val);
  }


  const sendToServer = (fieldname, valueto) => {
    const datas = {
      field: fieldname,
      value: valueto,
      user_id: userdata?.user?.id
    }
    console.log(datas);
    send_to_server_action(datas);
  }

  const saveResult = () => {
    sendToServer('result', result);
    setEditResult(false);
  }
  const saveComment = () => {
    sendToServer('comment', comment);
    setEditComment(false)
  }


   const send_to_server_action = async (data) => {
    setRowOnSaveState(true);
    if (PRODMODE){
      try {
        const format_data = {
          data: {content: data},
          _token: CSRF_TOKEN,
        };
        let response = await PROD_AXIOS_INSTANCE.post('/api/sales/bugs/updatereport', format_data);
        if (response) {
            setRowOnSaveState(false)
        }
      } catch (e) {
        console.log(e);
        alert(e);
      }

    } else {
      setTimeout(() => {
        setRowOnSaveState(false)
      }, 1200);
    }
  }
  
  // const insertTimeIntoResult = () => {
    
  //   // let str = "\n" +  dayjs().format('DD.MM.YYYY  HH:MM') + " - " + userdata?.user?.surname + ' ' + userdata?.user?.name + ":\n";
  //   // setResult(result + str);
  // }

  if (!item) return null;

  return (
    <div className={`${isAdmin ? 'sa-bug-table-row-ext' : 'sa-bug-table-row'} ${rowOnSaveState ? 'sa-bug-table-row-on-save' : ''}`}>
      <div className={'sa-bug-table-cell'}>
        <div>
          {item.created_at && (
            <div>
              <div>{dayjs(item.created_at).format('DD.MM.YYYY')}</div>
              <div>{dayjs(item.created_at).format('HH:mm')}</div>
            </div>
          )}
        </div>
      </div>
      <div className={'sa-bug-table-cell'}>
        <div>
          <HighlightText text={item.username} highlight={filterUserName} />
        </div>
      </div>
      <div className={'sa-bug-table-cell sa-bug-table-cell-left'}>
        <div>
          <HighlightTextBreaker
            text={item.content}
            highlight={filterText}
            breakLines={true}
          />
        </div>
      </div>
      {isAdmin && (
        <div className={'sa-bug-table-cell sa-bug-table-cell-left'}>
          <div
            className={`${editComment ? 'edited-data-cell' : ''}`}
            onDoubleClick={ ()=>{if (!editComment){setEditComment(true);}}}
            onMouseLeave={()=>{if (editComment){ saveComment()}}}
          >
           {editComment ? (
            <TextArea 
              value={comment}
              onChange={mouseDoownComment}
              onKeyUp={keydownComment}
              />
          ) : (
            <HighlightTextBreaker
              text={comment}
              highlight={filterConnment}
              breakLines={true}
            />
           )} 
          </div>
        </div>
      )}
      <div className={'sa-bug-table-cell sa-bug-table-cell-left'}>
        <div
          className={`${editResult ? 'edited-data-cell' : ''}`}
          onDoubleClick={ ()=>{if (!editResult){setEditResult(true);}}}
          onMouseLeave={()=>{
            if (editResult){
              saveResult();
            }
          }}
        >
          {editResult ? (
            <TextArea 
              value={result}
              onChange={mouseDoownResult}
              onKeyUp={keydownResult}
              />
          ) : (
            <HighlightTextBreaker
              text={result}
              highlight={filterResult}
              breakLines={true}
            />

          )} 
        </div>
      </div>
      <div className={'sa-bug-table-cell'}>
        <div 
          onMouseLeave={()=>{setEditStatus(false)}}
        onDoubleClick={ ()=>{if (!editStatus){setEditStatus(true);}}}>
        {editStatus ? (
          <Select 
            value={status}
            onChange={(ev)=>{onChangeStatus(ev)}}
          
            style={{width: '100%'}}
            placeholder="Все статусы"
            options={statuses.map((opt, index) => ({
              value: opt.id,  // или opt.id если добавите в statusConfig
              label: opt.text,
            }))}
          />
        ): (
          <div>{StatusBadge && StatusBadge(status)}</div>

        )}

        </div>
      </div>
      <div className={'sa-bug-table-cell'}>
        <div>
          {item.finished_at && (
            <div>
              <div>{dayjs(item.finished_at).format('DD.MM.YYYY')}</div>
              <div>{dayjs(item.finished_at).format('HH:mm')}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BugModalRow;
