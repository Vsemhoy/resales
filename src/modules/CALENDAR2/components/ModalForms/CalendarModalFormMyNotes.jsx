import React, { useEffect, useState } from 'react';
import { Form, Input, DatePicker } from 'antd';
import dayjs from 'dayjs';



// Конфиг
const TEXTAREA_MIN_ROWS = 3;
const TEXTAREA_MAX_ROWS = 10;
const CHEVRON_SIZE = 16;

const CalendarModalFormMyNotes = ({is_private, on_change, date}) => {
 const { TextArea } = Input;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');






  useEffect(() => {

    const timer = setTimeout(() => {
      if (on_change){
        on_change({
          title: title,
          content: content,
          is_private: is_private
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [title, content]);

  return (
    <div className='rsa-calendar-form-item'>
      <div className='rda-note-form-item'>

         <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          layout="vertical"
        >
   
            <p></p>
            <span>Тема</span>
            <Input value={title}
              onChange={(ev)=>{setTitle(ev.target.value)}}
              variant={'underlined'}
              />

            <p></p>
            <span>Заметка</span>
            <TextArea rows={8}
              value={content}
              onChange={(ev)=>{setContent(ev.target.value)}}
              autoSize={{ minRows: TEXTAREA_MIN_ROWS, maxRows: TEXTAREA_MAX_ROWS }}
              variant={'underlined'}
            />
            <p></p>
      
           
      
      </Form>
      </div>
    </div>
  );
};;

export default CalendarModalFormMyNotes;