import React, { useEffect, useState } from 'react';
import { Form, Input, DatePicker } from 'antd';
import dayjs from 'dayjs';



// Конфиг
const TEXTAREA_MIN_ROWS = 3;
const TEXTAREA_MAX_ROWS = 10;
const CHEVRON_SIZE = 16;

const CalendarModalFormProject = (props) => {
 const { TextArea } = Input;


  const [formTheme, setFormTheme] = useState("");
  const [formNotes, setFormNotes] = useState("");



  const [orgId, setOrgId] = useState(0);
  const [itemId, setItemId] = useState(null);
  const [projType, setProjType] = useState(0);
  const [deleted, setDeleted] = useState(0);
  const [name, setName] = useState('');
  const [equipment, setEquipment] = useState('');
  const [customer, setCustomer] = useState('');
  const [curator, setCurator] = useState('');
  const [address, setAddress] = useState('');
  const [stage, setStage] = useState('');
  const [contactperson, setContactperson] = useState('');
  // const [staffList,   setStaflist] = useState(0); // Создатель id8staff_list
  const [date, setDate] = useState(dayjs());
  const [cost, setCost] = useState('');
  const [bonus, setBonus] = useState('');
  const [comment, setComment] = useState('');
  const [typePeac, setTypePeac] = useState('');
  const [dateEnd, setDateEnd] = useState(null);
  const [erector, setErector] = useState('');
  // const [linkbidId,   setLinkbidId] = useState([]);
  const [bidsId, setBidsId] = useState([]);
  const [dateCreate, setDateCreate] = useState(dayjs().unix());
  const [idCompany, setIdCompany] = useState('');
  const [authorId, setAuthorId] = useState(null);
  const [author, setAuthor] = useState(null);

  const [searchErector, setSearchErector] = useState(props.data.erector_id);
  const [searchBid, setSearchBid] = useState('');




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
  }, [
    		orgId,
        projType,
        name,
        equipment,
        customer,
        address,
        stage,
        contactperson,
        date,
        cost,
        bonus,
        comment,
        typePeac,
        dateEnd,
        erector,
        bidsId,
        idCompany,
        authorId,
        author,
        deleted,
      ]);

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
};

export default CalendarModalFormProject;