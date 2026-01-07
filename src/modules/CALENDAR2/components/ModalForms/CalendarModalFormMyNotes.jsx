import React, { useEffect, useState } from 'react';
import { Form, Input, DatePicker } from 'antd';
import dayjs from 'dayjs';



// Конфиг
const TEXTAREA_MIN_ROWS = 3;
const TEXTAREA_MAX_ROWS = 10;
const CHEVRON_SIZE = 16;

const CalendarModalFormMyNotes = (props) => {
 const { TextArea } = Input;


  const [formTheme, setFormTheme] = useState("");
  const [formNotes, setFormNotes] = useState("");


  const [dateDisabled, setDateDisabled] = useState(true);




  useEffect(() => {

    const timer = setTimeout(() => {
      if (props.on_change){
        props.on_change({
          theme: formTheme,
          notes: formNotes,
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formTheme, formNotes]);

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
            <Input value={formTheme}
              onChange={(ev)=>{setFormTheme(ev.target.value)}}
              />

            <p></p>
            <span>Заметка</span>
            <TextArea rows={4}
              value={formNotes}
              onChange={(ev)=>{setFormNotes(ev.target.value)}}
              autoSize={{ minRows: TEXTAREA_MIN_ROWS, maxRows: TEXTAREA_MAX_ROWS }}
            />
            <p></p>
      
           
      
      </Form>
      </div>
    </div>
  );
};;

export default CalendarModalFormMyNotes;