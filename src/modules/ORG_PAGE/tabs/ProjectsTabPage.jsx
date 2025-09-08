import React, { useEffect, useState } from 'react';


const ProjectsTabPage = (props) => {
    const [show, setShow] = useState(false);
  
    useEffect(() => {
      setShow(props.show);
    }, [props.show]);


  return (
    <div>
      {show && (
        <div>HELLO PROJECTS</div>
      )}
    </div>
  );
};

export default ProjectsTabPage;