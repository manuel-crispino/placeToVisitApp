import { forwardRef, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const Modal = forwardRef(function Modal({ children,open },ref) {
  const dialog = useRef();

  useEffect(() => {
     if (open){
        dialog.current.showModal();
      }
      else{ 
        dialog.current.close();
      }
  },[open]);

  return createPortal(
    <dialog className="modal" ref={dialog}>
      {open? children:null}
    </dialog>,
    document.getElementById('modal')
  );
});

export default Modal;
