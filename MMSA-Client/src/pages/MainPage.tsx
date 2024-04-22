import { Layout, Button, Form, Input, Row } from 'antd';
import { useTable } from '../Store';
import { Footer } from 'antd/es/layout/layout';
import "./mainStyles.css";
import randomColor from "randomcolor";
import React from "react";
import MenuDrawer from "../Menu/menuDrawer";
import MainService from "../services/mainService";
import MainPageFilling from './MainPageFilling';

const { Header, Content } = Layout;

export const MainPage = () => {

    return (   
      <Layout style={{height: "100%"}}>
        
          <Header className='header'>  
            <div style={{height: "100%", justifyContent: "center"}}>Методи розробки алгоритмів</div>
          </Header> 
            <div style={{display:'flex', flexDirection:"row"}}>
              <MenuDrawer/>  
              <div style={{width:"100%"}}>
                <Content style={{background: "white", display: "flex", justifyContent:"center", flexDirection:"column"}}>
                  <MainPageFilling></MainPageFilling>
                </Content>
              </div>                                       
            </div>
          <Footer style={{paddingInline: "50px", lineHeight: "64px", background: "#001529"}}>
          </Footer>  
        
    </Layout>     
    );
};

export default MainPage;