import React, { useEffect, useState } from 'react';


const MeetingsTabPage = (props) => {
    const [show, setShow] = useState(false);
  
    useEffect(() => {
      setShow(props.show);
    }, [props.show]);

  return (
    <div>
      {show && (
        <h1>Hello Wolf from MeetingOutlet</h1>
      )}
    </div>
  );
};

export default MeetingsTabPage;