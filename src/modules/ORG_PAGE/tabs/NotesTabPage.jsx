import React, { useEffect, useState } from 'react';


const NotesTabPage = (props) => {
    const [show, setShow] = useState(false);
  
    useEffect(() => {
      setShow(props.show);
    }, [props.show]);

  return (
    <div>
      {show && (

        <h1>Hello Wolf from NotesTabPage</h1>
      )}
    </div>
  );
};

export default NotesTabPage;