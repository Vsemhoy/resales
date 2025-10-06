import React, { useEffect, useState } from 'react';

const TorgPageSectionRow = (props) => {
  const [inputs, setInputs] = useState([]);

  useEffect(() => {
    if (props.inputs){
      setInputs(props.inputs);
    } else {
      setInputs([]);
    }
  }, [props.inputs]);

  return (
    <div className='torg-section'>
      {inputs.map((item)=>(
        <div>
          {item.label}
          <div>
        {item.input}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TorgPageSectionRow;