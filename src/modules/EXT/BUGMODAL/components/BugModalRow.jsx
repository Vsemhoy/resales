import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import HighlightTextBreaker from '../../../../components/helpers/HighlightTextBreaker';
import HighlightText from '../../../../components/helpers/HighlightText';
import TextArea from 'antd/es/input/TextArea';
import { Select } from 'antd';
import { ShortName } from '../../../../components/helpers/TextHelpers';
import { CSRF_TOKEN, PRODMODE } from '../../../../config/config';
import { PROD_AXIOS_INSTANCE } from '../../../../config/Api';


const BugModalRow = ({ item, isAdmin, filterUserName, filterText, StatusBadge, statuses, userdata, filterConnment, filterResult, on_focus_field, call_to_unfocus }) => {
  // Если item не передан, рендерим пустой div или ничего
  const [editStatus, setEditStatus] = useState(false);
  const [editComment, setEditComment] = useState(false);
  const [editResult, setEditResult] = useState(false);

  const [comment, setComment] = useState('');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');

  const [rowOnSaveState, setRowOnSaveState] = useState(false);

  const [itemId, setItemId] = useState(null);

useEffect(() => {
  setItemId(item.id);
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
    if (ev.ctrlKey && (ev.key === "S" || ev.key === "s" || ev.key === "Ы" || ev.key === "ы")){
      ev.preventDefault();
      saveResult();
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
    if (ev.ctrlKey && (ev.key === "S" || ev.key === "s" || ev.key === "Ы" || ev.key === "ы")){
      ev.preventDefault();
      saveComment();
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
    if (result !== item.result){
      sendToServer('result', result);
    }
    setEditResult(false);
  }
  const saveComment = () => {
    if (comment !== item.comment){
      sendToServer('comment', comment);
    }
    setEditComment(false)
  }
  const saveStatus = () => {
    if (status !== item.status_id){
      sendToServer('status_id', status);
    }
    setEditStatus(false)
  }

  useEffect(() => {
    if (call_to_unfocus !== itemId + "_1"){
      if (editComment){
        saveComment();
        setEditComment(false);
      }
    }
    if (call_to_unfocus !== itemId + "_2"){
      if (editResult){
        saveResult();
        setEditResult(false);
      }
    }
    if (call_to_unfocus !== itemId + "_3"){
      if (editStatus){
        saveStatus();
        setEditStatus(false);
      }
      setEditStatus(false);
    }
  }, [call_to_unfocus]);




   const send_to_server_action = async (data) => {
    setRowOnSaveState(true);
    if (PRODMODE){
      try {
        const format_data = {
          data: {content: data},
          _token: CSRF_TOKEN,
        };
        let response = await PROD_AXIOS_INSTANCE.post('/api/sales/bugs/updatereport/' + itemId, format_data);
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
  
  const handleMousedownComment = (ev) => {
    if (!isAdmin || !editComment){ return;}
    if (ev.button === 1){
      saveComment();
    }
  }
  
  const handleMousedownResult = (ev) => {
    if (!isAdmin || !editResult){ return;}
    if (ev.button === 1){
      saveResult();
    }
  }



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
            onDoubleClick={ ()=>{if (isAdmin && !editComment){setEditComment(true);
              on_focus_field(itemId + "_1");
            }}}
            onMouseDown={handleMousedownComment}
            // onMouseLeave={()=>{if (isAdmin && editComment){ saveComment()}}}
          >
           {isAdmin && editComment ? (
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
          onDoubleClick={ ()=>{if (isAdmin && !editResult){setEditResult(true);
            on_focus_field(itemId + "_2");
          }}}
          onMouseDown={handleMousedownResult}
          // onMouseLeave={()=>{
          //   if (isAdmin && editResult){
          //     saveResult();
          //   }
          // }}
        >
          {isAdmin && editResult ? (
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
          // onMouseLeave={()=>{if (isAdmin && editStatus) {setEditStatus(false);}}}
          onDoubleClick={ ()=>{if (isAdmin && !editStatus){setEditStatus(true);
            on_focus_field(itemId + "_3");
          }}}>
        {isAdmin && editStatus ? (
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
