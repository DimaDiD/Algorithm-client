import { useNavigate } from "react-router-dom";
import { useTable } from "../Store";
import { useEffect, useState } from "react";
import { Button, Drawer, Input, Menu, MenuProps, Modal, Select, Switch, theme } from "antd";
import MainService from "../services/mainService";
import { Page } from "../models/Page";
import "../Menu/menu.css";
import { SubPage } from "../models/SubPages";
import { ItemType, MenuItemGroupType, MenuItemType, SubMenuType } from "antd/es/menu/hooks/useItems";

const { Option } = Select;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key ,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const MenuDrawer = () => {
  let api = new MainService();
  const [state, actions] = useTable();
  const navigate = useNavigate();

  const [items, setMenuItems] = useState<MenuItem[]>([]);
  const [newSubMenuItemName, setNewSubMenuItemName] = useState('');
  const [newMenuItemName, setNewMenuItemName] = useState('');
  const [parentItem, setParentItem] = useState(null);
  const [isSubMenuItemModalVisible, setIsSubMenuItemModalVisible] = useState(false);
  const [isMenuItemModalVisible, setIsMenuItemModalVisible] = useState(false);

  useEffect(() => {  
    getMenuItems();    
  }, [])

  const getMenuItems = async () => {
    await api.getMenuItems().then((res) => {
      let menuItems = res.map((menuItem:Page) => {      
        if(menuItem.SubPages.length == 0){
          return getItem(menuItem.PageName, menuItem.PageName, null)
        }
        else{  
          return getItem(menuItem.PageName, menuItem.PageName, null, menuItem.SubPages.map((subMenu: SubPage) => {
            return getItem(subMenu.Name, subMenu.Name, null)
          }))
        }
      }) 

      setMenuItems(menuItems)

      actions.setSelectedMenuItem(menuItems[0]);

      console.log(state.selectedMenuItem)
    })
  }

   const onClick = (menuOption: any) => {
    
    menuOption.keyPath = menuOption.keyPath.reverse();    

    actions.setSelectedMenuItem(menuOption.key);

    setIsEditModalVisible(true);

    actions.setPage(menuOption.keyPath[0])

    if(menuOption.keyPath.length == 2){
      actions.setSubPage(menuOption.keyPath[1])
      navigate(`/${menuOption.keyPath[0]}/${menuOption.keyPath[1]}`);
    }
    else{
      actions.setSubPage("")
      if ("Головна" === menuOption.keyPath[0]) {
        navigate(`/`);
      }
      else{
        navigate(`/${menuOption.keyPath[0]}`);
      }
    } 
   }

   function isMenuItemWithChildren(item: ItemType | null): item is SubMenuType<MenuItemType> | MenuItemGroupType<MenuItemType> {
    return item !== null && item !== undefined && 'children' in item;
}

const addSubMenuItem = async () => {
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
    if(isItemMenu){
      setIsMenuItemModalVisible(true);      
    }
    else{      
      setParentItem(null);
      setIsSubMenuItemModalVisible(true);
    }
  };

  const handleCancel = (isItemMenu: boolean) => {
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
    setMenuItems(prevItems => [...prevItems, getItem(newMenuItemName, newMenuItemName)]);
    await api.CreatePage(newMenuItemName).then(() => {
      setIsMenuItemModalVisible(false);
      setNewMenuItemName('');
    });
    
  };

  const onChangeNewMenuItemName = (e:any) => {
    setNewMenuItemName(e.target.value);
  };


  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const handleEditMenuItem = async () => {
    if (state.selectedMenuItem) {
      console.log(state.selectedMenuItem, newMenuItemName)
      //await api.UpdatePage(selectedMenuItem, newMenuItemName); // Assume UpdatePage API exists
      getMenuItems(); // Refresh the menu items
      setIsEditModalVisible(false);
      setNewMenuItemName('');
    }
  };
  
  const handleDeleteMenuItem = async () => {
    if (state.selectedMenuItem) {
      console.log(state.selectedMenuItem, newMenuItemName)
      //await api.DeletePage(selectedMenuItem); // Assume DeletePage API exists
      getMenuItems(); // Refresh the menu items
      setIsEditModalVisible(false);
    }
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
      <Button type="primary" onClick={() => showModal(true)} style={{ marginTop: '10px' }}>
        Add Menu Item
      </Button>
      <Modal title="Add New Menu Item" open={isMenuItemModalVisible} onOk={addMenuItem} onCancel={() => handleCancel(true)}>
        <Input placeholder="Enter menu item name" value={newMenuItemName} onChange={onChangeNewMenuItemName} />
      </Modal>

      <Button type="primary" onClick={() => showModal(false)} style={{ marginTop: '10px' }}>
        Add SubMenu Item
      </Button>
      <Modal title="Add New Menu Item" open={isSubMenuItemModalVisible} onOk={addSubMenuItem} onCancel={() => handleCancel(false)}>
        <Input placeholder="Enter menu item name" value={newSubMenuItemName} onChange={onChangeNewSubMenuItemName} />
        <Select
          placeholder="Select parent item (optional)"
          style={{ width: '100%', marginTop: '10px' }}
          value={parentItem}
          onChange={onChangeParentItem}
          allowClear
        >
          {items.map(item => item !== null && 'key' in item && <Option key={item.key} value={item.key}>{item.key}</Option>)}
        </Select>
      </Modal>   

      <Modal
  title="Edit or Delete Menu Item"
  open={isEditModalVisible}
  onCancel={() => setIsEditModalVisible(false)}
  footer={[
    <Button key="delete" type="dashed" onClick={handleDeleteMenuItem}>
      Delete
    </Button>,
    <Button key="save" type="primary" onClick={handleEditMenuItem}>
      Save Changes
    </Button>
  ]}
>
  <Input placeholder="Edit menu item name" value={newMenuItemName} onChange={(e) => setNewMenuItemName(e.target.value)} />
</Modal>   
      </div>
    </>
  );
};

export default MenuDrawer;
