import React, { useCallback, useEffect } from "react";

const useClickOutside = (ref: React.MutableRefObject<any>, clickOutsideCallback: (event: Event) => void) => {
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target)) {
      clickOutsideCallback(event);
    }
  }, [clickOutsideCallback])

  useEffect(() => {
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}

export default useClickOutside
