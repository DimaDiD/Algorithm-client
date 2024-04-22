import { Form, Layout } from "antd";
import { useTable } from "../../Store";
import MainService from "../../services/mainService";
import { Header, Content, Footer } from "antd/es/layout/layout";
import MenuDrawer from "../../Menu/menuDrawer";
import InfoPageFillng from "./InfoPageFillng";

export const InfoPage = () => {
    let Api = new MainService();
    const [state, actions] = useTable();
    const [form] = Form.useForm();
    // rgba(0, 173, 255, 1)
    // rgba(85, 190, 241, 1)
    return (   
      <Layout style={{background:"rgba(85, 190, 241, 1)"}}>
        <Header className='header'>  
          <div style={{height: "100%", justifyContent: "center"}}>Методи розробки алгоритмів</div>
        </Header> 

        <div style={{display:'flex', flexDirection:"row"}}>
              <MenuDrawer/>  
              <div style={{width:"100%"}}>
                <Content style={{background: "white", display: "flex", justifyContent:"center", flexDirection:"column", backgroundColor:"white", borderRadius: "30px", margin:"10px 20px 10px 20px"}}>
                  <InfoPageFillng></InfoPageFillng>
                </Content>
              </div>                                       
          </div>

        {/* <Button className='scroll-to-top-button' icon={<UpOutlined style={{color: "rgb(63, 96, 121)"}}/>} onClick={scrollToTop}/> */}
        
        <Footer style={{paddingInline: "50px", lineHeight: "64px", background: "#001529"}}>
        </Footer>  
    </Layout>     
    )
}