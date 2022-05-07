import React from "react";

const Header = () => {
  return(
    <div className="relative bg-white">
      <div className="mx-auto">
        <div className="flex justify-between  items-center border-b-2 border-gray-100 py-4 md:justify-start md:space-x-10 px-4">
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <a href="#">
              <span className="font-bold font-sans tracking-widest uppercase">Asset Portfolio</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header