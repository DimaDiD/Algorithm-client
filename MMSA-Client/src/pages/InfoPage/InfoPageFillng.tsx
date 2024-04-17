import { Form } from "antd";
import MainService from "../../services/mainService";
import { useTable } from "../../Store";
import { useEffect } from "react";

export const InfoPageFilling = () => {
    let Api = new MainService();
    const [state, actions] = useTable();
    const [form] = Form.useForm();

    useEffect(() => {         
        
    }, [state.page, state.subPage])

    return (   
        
        <div>Інфо</div>
        
    )
}

export default InfoPageFilling;