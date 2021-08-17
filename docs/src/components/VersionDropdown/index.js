import "react-dropdown/style.css";
import React, { useState } from "react";
import { useHistory, useLocation } from "@docusaurus/router";
import { useActiveVersion, useVersions } from "@theme/hooks/useDocs";
import styles from "./styles.module.scss";

export const getSelectedVersionPath = (
  options,
  activeVersion,
  currentDocsPath,
  nextOptionName
) => {
  let activeVersionPath = activeVersion.path.endsWith("/")
    ? activeVersion.path.substring(0, activeVersion.path.length - 1)
    : activeVersion.path;
  const slugWithoutVersion = getSlugWithoutVersion(
    currentDocsPath,
    activeVersionPath
  );
  let selectedVersionDocsPath = options.find(
    (res) => res.name === nextOptionName
  ).path;
  selectedVersionDocsPath = selectedVersionDocsPath.endsWith("/")
    ? selectedVersionDocsPath.substring(0, selectedVersionDocsPath.length - 1)
    : selectedVersionDocsPath;

  /*
   * Across versions, docs might be added/deleted/moved(we cant always keep the same structure). Yet if the dropdown is always there,
   * it should lead somewhere. So if the path does not exist on the selected version it will redirect to the selected version's default path
   */

  const ifDocPresentInVersion = options
    .find((option) => option?.name === nextOptionName)
    .docs?.filter((current) => slugWithoutVersion.endsWith(current?.id));
  return `${selectedVersionDocsPath}${
    ifDocPresentInVersion.length ? slugWithoutVersion : "/"
  }`;
};

export const getSlugWithoutVersion = (slug, currentOptionPath) => {
  return slug.slice(currentOptionPath.length);
};

export const VersionDropdown = () => {
  const history = useHistory();
  const location = useLocation();
  const activeVersion = useActiveVersion();
  const options = useVersions();
  const [currentOption, setCurrentOption] = useState(activeVersion);
  const handleChange = (e, option) => {
    e.preventDefault();
    setCurrentOption(option);
    const selectedVersionPath = getSelectedVersionPath(
      options,
      activeVersion,
      location.pathname,
      option.name
    );
    history.push(selectedVersionPath);
  };

  return (
    <div className={styles.dropDownWrapper}>
      <div
        className={`dropdown dropdown--hoverable doc-button doc-button-outlined doc-button-secondary doc-button-secondary-light dropdown--right ${styles.dropdown}`}
      >
        <span className="navbar__link">{currentOption.label}</span>
        <ul className="dropdown__menu">
          {options?.map((option) => {
            return (
              <li key={option?.name}>
                <a
                  className={`dropdown__link ${
                    currentOption?.name === option?.name
                      ? "dropdown__link--active"
                      : ""
                  }`}
                  href="#"
                  onClick={(e) => handleChange(e, option)}
                >
                  {option.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
