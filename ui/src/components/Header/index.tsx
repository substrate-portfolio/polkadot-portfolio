import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useContext, useMemo } from "react";
import { AppContext } from "../../store";

const Header = () => {
  const {state: {loading}} = useContext(AppContext);

  const anyLoading = useMemo(() => Object.values(loading).reduce((sum, state) => state || sum, false), [loading])

  return(
    <div className="relative">
      <div className="mx-auto">
        <div className="flex justify-between  items-center border-b-2 border-gray-100 py-4 md:justify-start md:space-x-10 px-4">
          <div className="flex justify-between lg:w-0 lg:flex-1">
            <a href="#">
              <span className="font-bold font-sans tracking-widest uppercase">Asset Portfolio</span>
            </a>
            {
              anyLoading ? <span>
                <FontAwesomeIcon icon={faSpinner} spin={anyLoading} />
              </span>
                : null }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
