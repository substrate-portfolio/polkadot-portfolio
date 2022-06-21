import React from 'react'
import useClickOutside from '../../hooks/clickOutside'
interface ModalProps {
  state: boolean
  children: any
  closeFn: () => void
  onClose?: (modalState: boolean) => void
}

const Modal: React.FC<ModalProps> = (props) => {
  const {state, onClose, closeFn, children} = props

  const wrapperRef = React.useRef(null)
  
  const closeModal: (_: Event) => void = React.useCallback(() => {
    console.log("CLOSE MODAL CALLED")
    closeFn()
    onClose && onClose(state)
  }, [])

  useClickOutside(wrapperRef, closeModal)

  if (!state) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50'>
      <div className='w-2/5' ref={wrapperRef}>
        {children}
      </div>
    </div>
  )
}

export default Modal;