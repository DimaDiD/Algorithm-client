import { Form, Layout } from "antd";
import { Header, Content, Footer } from "antd/es/layout/layout";
import MenuDrawer from "../Menu/menuDrawer";
import { useTable } from "../Store";
import MainService from "../services/mainService";

export const MainPageFilling = () => {
    let Api = new MainService();
    const [state, actions] = useTable();
    const [form] = Form.useForm();

    return (   
        
        <div>Головна</div>
        
    )
}

export default MainPageFilling;