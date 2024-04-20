import { Button, Dropdown, Form, Input, Menu, Modal, Select } from "antd";
import MainService from "../../services/mainService";
import { useTable } from "../../Store";
import { useEffect, useState } from "react";
import { PageContent } from "../../models/PageContent";

export const InfoPageFilling = () => {
    let api = new MainService();
    const [state, actions] = useTable();
    const [addForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [isAddModalVisible, setAddIsModalVisible] = useState(false);
    const [isEditModalVisible, setEditIsModalVisible] = useState(false);
    const [contentType, setContentType] = useState('');
    const [insertPosition, setInsertPosition] = useState<number | null>(null);
    const [pageContent, setPageContent] = useState<PageContent[]>([]);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
    const [currentPageContent, setCurrentPageContent] = useState<PageContent>();

    useEffect(() => {         
        getPageContent();
    }, [state.page, state.subPage])

    const getPageContent = async () => {
        await api.GetPageContentByMenuStatus(state.page.Id, state.subPage?.Id).then(setPageContent);
    }

    const showAddModal = (index: number | null) => {
        setAddIsModalVisible(true);
        setInsertPosition(index); // Setting position to add content before or after
    };

    const handleRightClick = (event: any, index: any) => {
        event.preventDefault();
        setInsertPosition(index);
        setContextMenu({
            visible: true,
            x: event.clientX,
            y: event.clientY
        });
    };

    const closeContextMenu = () => {
        setContextMenu({ visible: false, x: 0, y: 0 });
    };

    const handleAddContent = async (values: any) => {
        const newContent = {
            Id: 0,
            Text: values.text,
            SubPageId: state.subPage?.Id,
            TextType: values.type,
            CodeType: values.type === 'code' ? values.codeType : null,
            ContentLocation: insertPosition !== null ? insertPosition : pageContent.length + 1,
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
        });
    };

    const handleDelete = () => {
        const item = pageContent[insertPosition ?? 0];
        api.DeletePageContent(item.Id).then(() => {
            const updatedContent = pageContent.filter((_, i) => i !== insertPosition);
            setPageContent(updatedContent);
            closeContextMenu();
        });
    };

    const handleEdit = () => {
        const item = pageContent[insertPosition ?? 0];
        editForm.setFieldsValue({
            type: item.TextType,
            text: item.Text,
            codeType: item.CodeType
        });
        setEditIsModalVisible(true);
        closeContextMenu();
        setCurrentPageContent(item)
    };

    const handleEditContent = (values: any) => {
        const newContent: PageContent = {
            Id: currentPageContent?.Id ?? 0,
            Text: values.text,
            SubPageId: currentPageContent?.SubPageId,
            TextType: values.type,
            CodeType: values.type === 'code' ? values.codeType : null,
            ContentLocation: currentPageContent?.ContentLocation ?? 0, 
            PageId: currentPageContent?.PageId ?? 0
        };        
        api.UpdatePageContent(newContent).then(() => {
            pageContent[insertPosition ?? 0] = newContent;
            setEditIsModalVisible(false);
            editForm.resetFields();
        });
    }

    const menu = (
        <Menu>
            <Menu.Item key="edit" onClick={handleEdit}>Edit</Menu.Item>
            <Menu.Item key="delete" onClick={handleDelete}>Delete</Menu.Item>
        </Menu>
    );

    return (
        <>
            <Button type="dashed" onClick={() => showAddModal(0)}>Add Content at Start</Button>
            {pageContent.map((content, index) => (
                <div key={content.Id} onMouseEnter={() => setInsertPosition(index)} onContextMenu={(event) => handleRightClick(event, index)}>
                    {index === insertPosition && (
                        <Button type="dashed" onClick={() => showAddModal(index)}>Add Content</Button>
                    )}
                    <p>{content.Text}</p>
                </div>
            ))}
            <Button type="dashed" onClick={() => showAddModal(pageContent.length)}>Add Content at End</Button>
            {contextMenu.visible && (
                <div style={{ position: 'absolute', top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}>
                    <Dropdown overlay={menu} open={true} onOpenChange={closeContextMenu}>
                        <div></div>
                    </Dropdown>
                </div>
            )}
            {isAddModalVisible && (
                <Modal title="Add Content" open={isAddModalVisible} footer={null} onCancel={() => setAddIsModalVisible(false)}>
                    <Form form={addForm} onFinish={handleAddContent}>
                        <Form.Item name="type" label="Content Type" rules={[{ required: true }]}>
                            <Select placeholder="Select a content type" onChange={setContentType}>
                                <Select.Option value="text">Text</Select.Option>
                                <Select.Option value="code">Code</Select.Option>
                            </Select>
                        </Form.Item>
                        {contentType === 'code' && (
                            <Form.Item name="codeType" label="Code Language" rules={[{ required: true }]}>
                                <Select placeholder="Select a programming language">
                                    <Select.Option value="C#">C#</Select.Option>
                                    <Select.Option value="Python">Python</Select.Option>
                                    <Select.Option value="C++">C++</Select.Option>
                                </Select>
                            </Form.Item>
                        )}
                        <Form.Item name="text" label="Text" rules={[{ required: true }]}>
                            <Input.TextArea />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Save Changes
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            )}

{isEditModalVisible && (
                <Modal title="Edit Content" open={isEditModalVisible} footer={null} onCancel={() => setEditIsModalVisible(false)}>
                    <Form form={editForm} onFinish={handleEditContent}>
                        <Form.Item name="type" label="Content Type" rules={[{ required: true }]}>
                            <Select placeholder="Select a content type" onChange={setContentType}>
                                <Select.Option value="text">Text</Select.Option>
                                <Select.Option value="code">Code</Select.Option>
                            </Select>
                        </Form.Item>
                        {contentType === 'code' && (
                            <Form.Item name="codeType" label="Code Language" rules={[{ required: true }]}>
                                <Select placeholder="Select a programming language">
                                    <Select.Option value="C#">C#</Select.Option>
                                    <Select.Option value="Python">Python</Select.Option>
                                    <Select.Option value="C++">C++</Select.Option>
                                </Select>
                            </Form.Item>
                        )}
                        <Form.Item name="text" label="Text" rules={[{ required: true }]}>
                            <Input.TextArea />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Save Changes
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            )}
        </>
    );
}

export default InfoPageFilling;