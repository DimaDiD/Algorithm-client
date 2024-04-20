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
    const [insertPosition, setInsertPosition] = useState<number | null>(null);
    const [pageContent, setPageContent] = useState<PageContent[]>([]);

    useEffect(() => {         
        getPageContent();
    }, [state.page, state.subPage])

    const getPageContent = async () => {
        await api.GetPageContentByMenuStatus(state.page.Id, state.subPage?.Id).then(setPageContent);
    }

    const showModal = (index: number | null) => {
        setIsModalVisible(true);
        setInsertPosition(index); // Setting position to add content before or after
    };

    const handleAddContent = async (values: any) => {
        const newContent = {
            Id: 0,
            Text: values.text,
            SubPageId: state.subPage?.Id,
            TextType: values.type,
            CodeType: values.type === 'code' ? values.codeType : 'none',
            ContentLocation: insertPosition !== null ? insertPosition + 1 : pageContent.length + 1,
            PageId: state.page.Id
        };

        api.CreatePageContent(newContent).then(() => {
            const updatedContent = [
                ...pageContent.slice(0, insertPosition !== null ? insertPosition + 1 : pageContent.length),
                newContent,
                ...pageContent.slice(insertPosition !== null ? insertPosition + 1 : pageContent.length)
            ];
            setPageContent(updatedContent);
            setIsModalVisible(false);
            form.resetFields();
        });
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleDelete = (index: number) => {
        const item = pageContent[index];
        api.DeletePageContent(item).then(() => {
            const updatedContent = pageContent.filter((_, i) => i !== index);
            setPageContent(updatedContent);
        });
    };

    return (
        <>
            <Button type="dashed" onClick={() => showModal(-1)}>Add Content at Start</Button>
            {pageContent.map((content, index) => (
                <div key={content.Id} onMouseEnter={() => setInsertPosition(index)}>
                    {index === insertPosition && (
                        <Button type="dashed" onClick={() => showModal(index)}>Add Content Below</Button>
                    )}
                    <p>{content.Text}</p>
                    {/* <Button danger onClick={() => handleDelete(index)}>Delete</Button> */}
                </div>
            ))}
            <Button type="dashed" onClick={() => showModal(pageContent.length - 1)}>Add Content at End</Button>
            {isModalVisible && (
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
            )}
        </>
    );
}

export default InfoPageFilling;