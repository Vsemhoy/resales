import React, { useEffect, useState } from 'react';

const TorgPageSectionRow = (props) => {
  const [inputs, setInputs] = useState([]);

  useEffect(() => {
    setInputs(props.inputs);
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