import React from "react";

interface ModalBoxProps {
  title: string;
  children: any[];
}

const ModalBox: React.FC<ModalBoxProps> = ({title, children}) => {
  return (
    <div className="py-2 px-2 bg-white rounded-md shadow-md shadow-gray-600 border-gray-400">
      <div className="pb-2 pt-1 px-2 mb-2 border-b border-gray-100">
        <h2 className="font-semibold">{title}</h2>
      </div>
      <>
        {children.map(
          (item,index) => <React.Fragment key={`item_${index}`}>{item}</React.Fragment>
        )}
      </>
    </div>
  )
}

export default ModalBox;
