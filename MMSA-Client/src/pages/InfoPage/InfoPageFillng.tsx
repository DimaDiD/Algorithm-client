import { Button, Dropdown, Form, Input, Menu, Modal, Radio, RadioChangeEvent, Select, Switch } from "antd";
import MainService from "../../services/mainService";
import { useTable } from "../../Store";
import { useEffect, useState } from "react";
import { PageContent } from "../../models/PageContent";
import CodeContent from "../../PageContentTypes/CodeContent";
import TextContent from "../../PageContentTypes/TextContent";
import ReactQuill from "react-quill";
import "../InfoPage/InfoPage.css";
import 'react-quill/dist/quill.snow.css';
import { PlusOutlined } from "@ant-design/icons";
import notification from "../../notification/notificationMessage";

export const InfoPageFilling = () => {
    let api = new MainService();
    const [state, actions] = useTable();
    const [addForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [isEditPageMode, setIsEditPageMode] = useState(true);
    const [isAddModalVisible, setAddIsModalVisible] = useState(false);
    const [isEditModalVisible, setEditIsModalVisible] = useState(false);
    const [contentType, setContentType] = useState('');
    const [insertPosition, setInsertPosition] = useState<number | null>(null);
    const [pageContent, setPageContent] = useState<PageContent[]>([]);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
    const [currentPageContent, setCurrentPageContent] = useState<PageContent>();
    const [editOrAddText, setEditOrAddText] = useState("");

    const options = [
        { label: 'C#', value: 'csharp' },
        { label: 'C++', value: 'cpp' },
        { label: 'Pascal', value: 'pascal'},
      ];

    useEffect(() => {         
        getPageContent();
    }, [state.page, state.subPage, state.codeOption])

    const getPageContent = async () => {
        await api.GetPageContentByMenuStatus(state.page.Id, state.codeOption, state.subPage?.Id).then(setPageContent);
    }

    const showAddModal = (index: number | null) => {
        setAddIsModalVisible(true);
        setInsertPosition(index);
    };

    const handleRightClick = (event: any, index: any) => {
        event.preventDefault();
        setInsertPosition(index);
        setContextMenu({
            visible: true,
            x: event.pageX,
            y: event.pageY
        });
    };    

    const closeContextMenu = () => {
        setContextMenu({ visible: false, x: 0, y: 0 });
    };

    const handleAddContent = async (values: any) => {
        let newContentLocation = insertPosition == 0 ? 0 : pageContent[(insertPosition ?? 0) - 1].ContentLocation + 1
        const newContent = {
            Id: 0,
            Text: values.Text.replace("<span class=\"ql-cursor\">?</span>", ''),
            SubPageId: state.subPage?.Id,
            TextType: values.Type,
            CodeType: values.CodeType,
            ContentLocation: newContentLocation,
            PageId: state.page.Id
        };
        
        api.CreatePageContent(newContent).then(() => {
            const updatedContent = [
                ...pageContent.slice(0, insertPosition !== null ? insertPosition : pageContent.length),
                newContent,
                ...pageContent.slice(insertPosition !== null ? insertPosition : pageContent.length)
            ];
            setPageContent(updatedContent);
            setAddIsModalVisible(false);
            addForm.resetFields();
            notification('success', `Створено успішно!`);
        });
    };

    const handleDelete = () => {
        const item = pageContent[insertPosition ?? 0];
        api.DeletePageContent(item.Id).then(() => {
            const updatedContent = pageContent.filter((_, i) => i !== insertPosition);
            setPageContent(updatedContent);
            closeContextMenu();
            //notification('success', `Успішно видалено!`);
            notification('error', `Щось пішло не так...`);
        });
    };

    const handleEdit = () => {
        const item = pageContent[insertPosition ?? 0];
        setContentType(item.TextType);
        editForm.setFieldsValue({
            Type: item.TextType,
            Text: item.Text,
            CodeType: item.CodeType
        });
        setEditIsModalVisible(true);
        closeContextMenu();
        setCurrentPageContent(item)
    };

    const handleEditContent = (values: any) => {
        const newContent: PageContent = {
            Id: currentPageContent?.Id ?? 0,
            Text: values.Text.replace("<span class=\"ql-cursor\">?</span>", ''),
            SubPageId: currentPageContent?.SubPageId,
            TextType: values.Type,
            CodeType: values.CodeType,
            ContentLocation: currentPageContent?.ContentLocation ?? 0, 
            PageId: currentPageContent?.PageId ?? 0
        };   
    
        api.UpdatePageContent(newContent).then(() => {
            pageContent[insertPosition ?? 0] = newContent;
            setEditIsModalVisible(false);
            editForm.resetFields();
            notification('success', `Успішно оновлено!`);
        });
    }    

    const menu = (
        <Menu>
            <Menu.Item key="edit" onClick={handleEdit}>Редагувати</Menu.Item>
            <Menu.Item key="delete" onClick={handleDelete}>Видалити</Menu.Item>
        </Menu>
    );

    const toolbarModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{'script': 'sub'}, {'script': 'super'}], 
            [{'color': []}, {'background': []}],
            [{'font': []}],
            [{'size': ['small', false, 'large', 'huge']}], 
            [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}], 
            ['link', 'image', 'video'],
            ['clean'] 
        ]
    };
    
    const toolbarFormats = [
        'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'script',
    'color', 'background',
    'font',
    'size',
    'list', 'bullet', 'indent',
    'link', 'image', 'video'
    ];

    return (
        <>
            <div style={{margin: "30px 50px 30px 50px", display: "flex", alignItems:"center", justifyContent:"space-between"}}>
                <div>
                 <p><h3>Оберіть мову програмування</h3></p>
                 <Radio.Group options={options} onChange={(value) => actions.setCodeOption(value.target.value)} value={state.codeOption} optionType="button"  buttonStyle="solid"/>
                </div>
                <div style={{display: "flex", flexDirection:"row", justifyContent:"center", alignItems:"center"}}>
                    <h3>Режим редагування </h3> <Switch defaultChecked onChange={(value) => setIsEditPageMode(value)} style={{marginLeft:"5px"}}/>
                </div>
            </div>
            { isEditPageMode && <Button icon={<PlusOutlined />} type="primary" style={{width:"200px", margin:"10px 10px 20px 10px"}} onClick={() => showAddModal(0)}>Додати текст</Button> }
            {pageContent.map((content, index) => (
                <div key={content.Id} onMouseEnter={() => setInsertPosition(index)} onContextMenu={(event) => handleRightClick(event, index)} >
                    {index === insertPosition && isEditPageMode && index != 0 && (
                        <Button icon={<PlusOutlined />} type="primary" style={{width:"200px", margin:"10px 10px 20px 10px"}} onClick={() => showAddModal(index)}>Додати текст</Button>
                    )}
                    {content.TextType == "Code" ? <CodeContent code={content.Text} language={content.CodeType}/> : <TextContent text={content.Text}/>}                    
                </div>                            
            ))}
            { isEditPageMode && <Button icon={<PlusOutlined />} type="primary" onClick={() => showAddModal(pageContent.length)} style={{width:"200px", margin:"10px 10px 20px 10px"}}>Додати текст</Button>}
            <div style={{marginBottom:"20px"}}/>
            {contextMenu.visible && isEditPageMode && (
                <div style={{ position: 'absolute', top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}>
                    <Dropdown 
                        overlay={menu} 
                        open={true}
                        onOpenChange={closeContextMenu}
                    ><div></div>
                    </Dropdown>
                </div>
            )}

            {isAddModalVisible && isEditPageMode && (
                <Modal title="Додати" open={isAddModalVisible} footer={null} onCancel={() => setAddIsModalVisible(false)} style={{width: "600px"}}>
                    <Form form={addForm} onFinish={handleAddContent}>
                        <Form.Item name="Type" label="Тип тексту" rules={[{ required: true, message: "Поле є порожнім!"}]}>
                            <Select placeholder="Оберіть тип" onChange={setContentType}>
                                <Select.Option value="Text">Текст</Select.Option>
                                <Select.Option value="Code">Код</Select.Option>
                            </Select>
                        </Form.Item>
                        {contentType === 'Code' && (
                            <Form.Item name="CodeType" label="Мова програмування" rules={[{ required: true , message: "Поле є порожнім!"}]}>
                                <Select placeholder="Оберіть мову програмування">
                                    <Select.Option value="csharp">C#</Select.Option>
                                    <Select.Option value="cpp">C++</Select.Option>
                                    <Select.Option value="pascal">Pascal</Select.Option>
                                </Select>
                            </Form.Item>
                        )}
                        {contentType === 'Text' && (
                            <Form.Item name="CodeType" label="Доступ" rules={[{ required: true , message: "Поле є порожнім!"}]}>
                                <Select placeholder="Доступ">
                                    <Select.Option value="All">Усім</Select.Option>
                                    <Select.Option value="csharp">C#</Select.Option>
                                    <Select.Option value="cpp">C++</Select.Option>
                                    <Select.Option value="pascal">Pascal</Select.Option>
                                </Select>
                            </Form.Item>
                        )}
                        <Form.Item name="Text" label="Текст" rules={[{ required: true, message: "Поле є порожнім!" }]}>
                            {contentType === 'Code' ? <Input.TextArea style={{height: "300px", width:"100%"}}/> : <ReactQuill theme="snow" modules={toolbarModules}
                formats={toolbarFormats} value={editOrAddText} onChange={setEditOrAddText} className="react-quill-editor"/>}
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Створити
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            )} 

            {isEditModalVisible && isEditPageMode && (
                <Modal title="Редагування" open={isEditModalVisible} footer={null} onCancel={() => setEditIsModalVisible(false)}>
                    <Form form={editForm} onFinish={handleEditContent}>
                        <Form.Item name="Type" label="Тип тексту" rules={[{ required: true , message: "Поле є порожнім!"}]}>
                            <Select placeholder="Оберіть тип тексту" onChange={setContentType}>
                                <Select.Option value="Text">Текст</Select.Option>
                                <Select.Option value="Code">Код</Select.Option>
                            </Select>
                        </Form.Item>
                        {contentType === 'Code' && (
                            <Form.Item name="CodeType" label="Мова програмування" rules={[{ required: true , message: "Поле є порожнім!"}]}>
                                <Select placeholder="Оберіть мову програмування">
                                    <Select.Option value="csharp">C#</Select.Option>
                                    <Select.Option value="cpp">C++</Select.Option>
                                    <Select.Option value="pascal">Pascal</Select.Option>
                                </Select>
                            </Form.Item>
                        )}
                        {contentType === 'Text' && (
                            <Form.Item name="CodeType" label="Присвоїти текст" rules={[{ required: true , message: "Поле є порожнім!"}]}>
                                <Select placeholder="Оберіть тип тексту">
                                    <Select.Option value="All">Усім</Select.Option>
                                    <Select.Option value="csharp">C#</Select.Option>
                                    <Select.Option value="cpp">C++</Select.Option>
                                    <Select.Option value="pascal">Pascal</Select.Option>
                                </Select>
                            </Form.Item>
                        )}
                        <Form.Item name="Text" label="Текст" rules={[{ required: true , message: "Поле є порожнім!"}]}>
                            {contentType === 'Code' ? <Input.TextArea /> : <ReactQuill theme="snow" modules={toolbarModules}
                formats={toolbarFormats} value={editOrAddText} onChange={setEditOrAddText} />}
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Зберегти зміни
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            )}
        </>
    );
}

export default InfoPageFilling;