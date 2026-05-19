import React from 'react'
import { Dropdown } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUtensils,
  faHome,
  faBuilding,
  faCheck,
} from '@fortawesome/free-solid-svg-icons'
import { useModule, MODULES } from '../../context/ModuleContext'

const ModuleSwitcher = () => {
  const { activeModule, switchModule, MODULE_CONFIG } = useModule()

  const modules = [
    {
      id: MODULES.RESTAURANT,
      ...MODULE_CONFIG[MODULES.RESTAURANT],
      icon: faUtensils,
    },
    {
      id: MODULES.HOTEL_ROOM,
      ...MODULE_CONFIG[MODULES.HOTEL_ROOM],
      icon: faHome,
    },
    {
      id: MODULES.BANQUET_HALL,
      ...MODULE_CONFIG[MODULES.BANQUET_HALL],
      icon: faBuilding,
    },
  ]

  const currentModule = modules.find((m) => m.id === activeModule) || modules[0]

  return (
    <Dropdown className="module-switcher">
      <Dropdown.Toggle
        variant="outline-light"
        className="d-flex align-items-center gap-2 px-3 py-2"
        style={{
          borderColor: currentModule.color,
          color: currentModule.color,
          backgroundColor: 'transparent',
        }}
      >
        <FontAwesomeIcon icon={currentModule.icon} />
        <span className="fw-semibold">{currentModule.name}</span>
      </Dropdown.Toggle>

      <Dropdown.Menu className="module-switcher-menu">
        {modules.map((module) => (
          <Dropdown.Item
            key={module.id}
            onClick={() => switchModule(module.id)}
            active={activeModule === module.id}
            className="d-flex align-items-center gap-2 px-3 py-2"
            style={{
              backgroundColor: activeModule === module.id ? `${module.color}15` : 'transparent',
            }}
          >
            <FontAwesomeIcon
              icon={module.icon}
              style={{ color: module.color, width: '18px' }}
            />
            <span className="flex-grow-1">{module.name}</span>
            {activeModule === module.id && (
              <FontAwesomeIcon
                icon={faCheck}
                style={{ color: module.color }}
                className="ms-auto"
              />
            )}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default ModuleSwitcher

