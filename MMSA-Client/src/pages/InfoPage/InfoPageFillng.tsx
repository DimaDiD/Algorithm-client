import { Button, Form, Input, Modal, Select } from "antd";
import MainService from "../../services/mainService";
import { useTable } from "../../Store";
import { useEffect, useState } from "react";
import { PageContent } from "../../models/PageContent";

export const InfoPageFilling = () => {
    let api = new MainService();
    const [state, actions] = useTable();
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [contentType, setContentType] = useState('');

    const [pageContent, setPageContent] = useState<PageContent[]>([]);

    useEffect(() => {         
        getPageContent();
    }, [state.page, state.subPage])

    const getPageContent =  async () => {
        console.log(state.page.Id, state.subPage?.Id)
        await api.GetPageContentByMenuStatus(state.page.Id, state.subPage?.Id).then((data) => {
            setPageContent(data);
        });
    }

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleAddContent = async (values:any) => {
        const newContent = {
            Id: 0, // Typically set by the backend upon creation
            Text: values.text,
            SubPageId: state.subPage?.Id,
            TextType: values.type,
            CodeType: values.type === 'code' ? values.codeType : 'none',
            ContentLocation: pageContent.length > 0 ? pageContent[pageContent.length - 1].ContentLocation + 1 : 1,
            PageId: state.page.Id
        };

        api.CreatePageContent(newContent).then(() => {
            setPageContent([...pageContent, newContent]);
            setIsModalVisible(false);
            form.resetFields();  // Reset form fields after submission
        });
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleDelete = (index: number) => {
        let item = pageContent.filter((_, i) => i == index)[0];
        api.DeletePageContent(item).then(() => {
            const newPageContent = pageContent.filter(x => x !== item);        
            setPageContent(newPageContent);
        })
    };

    return (
        <>
            {pageContent.map((content, index) => (
                <div key={content.Id}>
                    <p>{content.Text}</p>
                    <Button danger onClick={() => handleDelete(index)}>Delete</Button>
                </div>
            ))}
            <Button type="primary" onClick={showModal}>Add Content</Button>
            <Modal title="Add New Content" visible={isModalVisible} onCancel={handleCancel} footer={null}>
                <Form onFinish={handleAddContent}>
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
                            Add
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

export default InfoPageFilling;

//додати можливість додавати новий текст між наявними блоками тексиу, зробити едіт і дорробити делет 