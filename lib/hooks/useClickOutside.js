const { useEffect, useRef } = require("react");

const useClickOutside = (handler) => {
  const domNodeRef = useRef();

  useEffect(() => {
    const mouseHandler = (e) => {
      if(domNodeRef.current && !domNodeRef.current.contains(e.target))
        handler();
    };

    window.addEventListener('mousedown', mouseHandler);
    return () => window.removeEventListener('mousedown', mouseHandler);
  }, [handler]);

  return domNodeRef;
};

export default useClickOutside;
