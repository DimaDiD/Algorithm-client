import { useNavigate } from "react-router-dom";
import { useTable } from "../Store";
import { useEffect, useState } from "react";
import { Button, Drawer, Input, Menu, MenuProps, Modal, Select, Switch, Tooltip, theme } from "antd";
import MainService from "../services/mainService";
import { Page } from "../models/Page";
import "../Menu/menu.css";
import { SubPage } from "../models/SubPages";
import { ItemType, MenuItemGroupType, MenuItemType, SubMenuType } from "antd/es/menu/hooks/useItems";

const { Option } = Select;

type MenuItem = Required<MenuProps>['items'][number];

const truncateText = (text: any, maxLength: any) => {
  if (text.length > maxLength) {
    return `${text.substring(0, maxLength)}...`;
  }
  return text;
};

function getItem(
  label: React.ReactNode,
  key: React.Key ,
  icon?: React.ReactNode,
  children?: MenuItem[],
  onContextMenu?: (event: React.MouseEvent) => void
): MenuItem {
  return {
    key,
    icon,
    children,
    label: (
      <Tooltip title={label}>
        {truncateText(label, 20)}
      </Tooltip>
    ),
    onContextMenu
  } as MenuItem;
}

const MenuDrawer = () => {
  let api = new MainService();
  const [state, actions] = useTable();
  const navigate = useNavigate();

  const [items, setMenuItems] = useState<MenuItem[]>([]);
  const [fullInfoItems, setFullInfoItems] = useState<Page[]>([]);

  const [newSubMenuItemName, setNewSubMenuItemName] = useState('');
  const [newMenuItemName, setNewMenuItemName] = useState('');
  const [parentItem, setParentItem] = useState(null);
  const [isSubMenuItemModalVisible, setIsSubMenuItemModalVisible] = useState(false);
  const [isMenuItemModalVisible, setIsMenuItemModalVisible] = useState(false);  
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  useEffect(() => {  
    getMenuItems();    
  }, [])

  const getMenuItems = async () => {
    await api.getMenuItems().then((res) => {
      
      setFullInfoItems(res);

      let menuItems = res.map((menuItem:Page) => {      
        const handleRightClick = (event: any) => onRightClickMenuItem(event, menuItem.PageName);
        if(menuItem.SubPages.length == 0){
          return getItem(menuItem.PageName, menuItem.PageName, null, undefined, handleRightClick)
        }
        else{  
          return getItem(menuItem.PageName, menuItem.PageName, null, menuItem.SubPages.map((subMenu: SubPage) => {
            return getItem(subMenu.Name, subMenu.Name, null, undefined, (event) => onRightClickMenuItem(event, subMenu.Name))
          }), handleRightClick)
        }
      }) 

      setMenuItems(menuItems)
      actions.setSelectedMenuItem(menuItems[0]);
    })
  }

   const onClick = (menuOption: any) => {   
    menuOption.keyPath = menuOption.keyPath.reverse();    

    actions.setSelectedMenuItem(menuOption.key);
    let page = fullInfoItems.filter(x => x.PageName == menuOption.keyPath[0])[0];
    actions.setPage(page)
    
    if(menuOption.keyPath.length == 2){
      actions.setSubPage(page.SubPages.filter(x => x.Name == menuOption.keyPath[1])[0])
      navigate(`/${menuOption.keyPath[0]}/${menuOption.keyPath[1]}`);
    }
    else{
      actions.setSubPage(undefined)
      navigate(`/${menuOption.keyPath[0]}`);
      // if ("Головна" === menuOption.keyPath[0]) {
      //   navigate(`/`);
      // }
      // else{
      //   navigate(`/${menuOption.keyPath[0]}`);
      // }
    } 
   }

   function isMenuItemWithChildren(item: ItemType | null): item is SubMenuType<MenuItemType> | MenuItemGroupType<MenuItemType> {
    return item !== null && item !== undefined && 'children' in item;
}

const addSubMenuItem = async () => {
  setIsEditModalVisible(false);
  const newItem: ItemType = { key: newSubMenuItemName, label: newSubMenuItemName };

  if (parentItem) {
      const newItems = items.map(item => {
          if (item !== null && 'key' in item && item.key === parentItem && isMenuItemWithChildren(item)) {
              const newItemWithChildren = {
                  ...item,
                  children: [...(item.children || []), newItem]
              };
              return newItemWithChildren;
          }
          return item;
      });
      setMenuItems(newItems);

      await api.CreateSubPage(parentItem, newSubMenuItemName);
  } else {
      setMenuItems(prevItems => [...prevItems, newItem]);
      await api.CreatePage(newMenuItemName);
  }
  
    setParentItem(null);
    setIsSubMenuItemModalVisible(false);
    setNewSubMenuItemName('');
};

  const showModal = (isItemMenu: boolean) => {
    setIsEditModalVisible(false);
    if(isItemMenu){
      setIsMenuItemModalVisible(true);      
    }
    else{      
      setParentItem(null);
      setIsSubMenuItemModalVisible(true);
    }
  };

  const handleCancel = (isItemMenu: boolean) => {
    setIsEditModalVisible(true);
    if(isItemMenu){
      setIsMenuItemModalVisible(false);
    }
    else{
      setIsSubMenuItemModalVisible(false);
    }
  };

  const onChangeNewSubMenuItemName = (e:any) => {
    setNewSubMenuItemName(e.target.value);
  };

  const onChangeParentItem = (value: any) => {
    setParentItem(value);
  };

  const addMenuItem = async () => {
    setIsEditModalVisible(false);
    setMenuItems(prevItems => [...prevItems, getItem(newMenuItemName, newMenuItemName)]);
    await api.CreatePage(newMenuItemName).then(() => {
      setIsMenuItemModalVisible(false);
      setNewMenuItemName('');
    });
    
  };

  const onChangeNewMenuItemName = (e:any) => {
    setNewMenuItemName(e.target.value);
  };

  const handleEditMenuItem = async () => {
    console.log(state.selectedMenuItem, newMenuItemName)
    if (state.selectedMenuItem) {
      await api.UpdateMenuItem(state.selectedMenuItem, newMenuItemName);
      getMenuItems(); 
      setIsEditModalVisible(false);
      setNewMenuItemName('');
    }
  };
  
  const handleDeleteMenuItem = async () => {
    if (state.selectedMenuItem) {
      await api.DeleteMenuItem(state.selectedMenuItem);  
      getMenuItems();
      setIsEditModalVisible(false);
    }
  };
  
  const onRightClickMenuItem = (event:any, key: any) => {
    event.preventDefault();
    event.stopPropagation(); 
    actions.setSelectedMenuItem(key); 
    setIsEditModalVisible(true);
  };

  return (
    <>
    <div style={{display:"flex", flexDirection:"column"}}>
       <Menu
        className="menu"
        selectedKeys={[state.selectedMenuItem]}
        mode={"inline"}
        theme={'light'}
        items={items}
        onClick={onClick}
      /> 
      <Modal title="Додати новий пункт меню" open={isMenuItemModalVisible} onOk={addMenuItem} onCancel={() => handleCancel(true)}>
        <Input placeholder="Введіть назву" value={newMenuItemName} onChange={onChangeNewMenuItemName} />
      </Modal>
      <Modal title="Додати новий пункт меню" open={isSubMenuItemModalVisible} onOk={addSubMenuItem} onCancel={() => handleCancel(false)}>
        <Input placeholder="Введіть назву" value={newSubMenuItemName} onChange={onChangeNewSubMenuItemName} />
        <Select
          placeholder="Оберіть головне мен"
          style={{ width: '100%', marginTop: '10px' }}
          value={parentItem}
          onChange={onChangeParentItem}
          allowClear
        >
          {items.map(item => item !== null && 'key' in item && <Option key={item.key} value={item.key}>{item.key}</Option>)}
        </Select>
      </Modal>   

      <Modal
  title="Опції"
  open={isEditModalVisible}
  onCancel={() => setIsEditModalVisible(false)}
  footer={[
    <Button key="delete" type="primary" onClick={handleDeleteMenuItem} danger>
      Видалити
    </Button>,
    <Button key="save" type="primary" onClick={handleEditMenuItem}>
      Зберегти зміни
    </Button>,
    <Button type="primary" onClick={() => showModal(false)}>
      + Пункт 
    </Button>,
    <Button type="primary" onClick={() => showModal(true)}>
        + Підпункт 
    </Button>
  ]}
>
  <Input placeholder="Редагувати назву меню" defaultValue = {state.selectedMenuItem} value={newMenuItemName} onChange={(e) => setNewMenuItemName(e.target.value)} />
</Modal>   
      </div>
    </>
  );
};

export default MenuDrawer;
