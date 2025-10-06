import TextArea from 'antd/es/input/TextArea';
import React, { useState } from 'react';
import TorgPageSectionRow from './components/TorgPageSectionRow';
import { Button, Select } from 'antd';

const TOrgPage = (props) => {
  const [value, setValue] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [selValue, setSelValue] = useState(1);

  return (
    <div>
      <TorgPageSectionRow
        labels={['Gosha']}
        editmode={editMode}
        inputs={[
          {
            label: 'Gesha Pidaroq',
            input: 
           <TextArea
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Controlled autosize"
            autoSize={{ minRows: 3, maxRows: 25 }}
            readOnly={editMode}
            variant="underlined"
          />,



          }
        ]} />


      <TorgPageSectionRow
        labels={['Gosha']}
        editmode={editMode}
        inputs={[
          {
            label: 'Misha Pidaroq',
            input: 
           <Select
           disabled={editMode}
              showSearch
              style={{ width: 200 }}
              placeholder="Search to Select"
              optionFilterProp="label"
              onChange={setSelValue}
              filterSort={(optionA, optionB) =>
                (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
              }
              value={selValue}
              options={[
                {
                  value: '1',
                  label: 'Not Identified',
                },
                {
                  value: '2',
                  label: 'Closed',
                },
                {
                  value: '3',
                  label: 'Communicated',
                },
                {
                  value: '4',
                  label: 'Identified',
                },
                {
                  value: '5',
                  label: 'Resolved',
                },
                {
                  value: '6',
                  label: 'Cancelled',
                },
              ]}
            />,
          }
        ]} />


      <div style={{ margin: '24px 0' }} >
     

    </div>
    <Button 
      onClick={()=>{setEditMode(!editMode)}}>
        GayNyiy
      </Button>
        <p>{selValue}</p>

    <p>{value}</p>
    </div>
  );
};

export default TOrgPage;