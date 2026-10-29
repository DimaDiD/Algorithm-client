import { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Radio, Select } from "antd";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { LANGUAGE_OPTIONS } from "./LanguageSwitch";

export type ContentFormValues = {
  Type: "Text" | "Code";
  CodeType: string;
  Text: string;
};

type Props = {
  open: boolean;
  mode: "add" | "edit";
  initialValues?: Partial<ContentFormValues>;
  onCancel: () => void;
  onSubmit: (values: ContentFormValues) => Promise<void>;
};

const TEXT_VISIBILITY_OPTIONS = [{ label: "Усім мовам", value: "All" }, ...LANGUAGE_OPTIONS];

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ script: "sub" }, { script: "super" }],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    ["blockquote", "link", "image"],
    ["clean"],
  ],
};

const QUILL_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "script",
  "color",
  "background",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
];

const removeQuillCursor = (html: string) => html.replace(/<span class="ql-cursor">[\s\S]*?<\/span>/g, "");

const ContentEditorModal = ({ open, mode, initialValues, onCancel, onSubmit }: Props) => {
  const [form] = Form.useForm<ContentFormValues>();
  const type = Form.useWatch("Type", form);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue(initialValues ?? {});
    }
  }, [open, initialValues, form]);

  const handleFinish = async (values: ContentFormValues) => {
    setIsSaving(true);
    try {
      await onSubmit({ ...values, Text: removeQuillCursor(values.Text) });
    } catch {
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      title={mode === "add" ? "Новий блок" : "Редагування блоку"}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={820}
      forceRender
    >
      <Form
        form={form}
        layout="vertical"
        size="large"
        requiredMark={false}
        onFinish={handleFinish}
        onValuesChange={(changed: Partial<ContentFormValues>) => {
          if (!changed.Type) return;
          const options = changed.Type === "Code" ? LANGUAGE_OPTIONS : TEXT_VISIBILITY_OPTIONS;
          const current = form.getFieldValue("CodeType");
          if (!options.some((option) => option.value === current)) {
            form.setFieldValue("CodeType", options[0].value);
          }
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          <Form.Item name="Type" label="Тип блоку" rules={[{ required: true, message: "Оберіть тип" }]}>
            <Radio.Group optionType="button" buttonStyle="solid">
              <Radio.Button value="Text">Текст</Radio.Button>
              <Radio.Button value="Code">Код</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {type && (
            <Form.Item
              name="CodeType"
              label={type === "Code" ? "Мова програмування" : "Показувати для"}
              rules={[{ required: true, message: "Оберіть значення" }]}
              style={{ minWidth: 220 }}
            >
              <Select options={type === "Code" ? LANGUAGE_OPTIONS : TEXT_VISIBILITY_OPTIONS} />
            </Form.Item>
          )}
        </div>

        <Form.Item name="Text" label="Вміст" rules={[{ required: true, message: "Блок не може бути порожнім" }]}>
          {type === "Code" ? (
            <Input.TextArea className="code-textarea" autoSize={{ minRows: 10, maxRows: 24 }} spellCheck={false} />
          ) : (
            <ReactQuill theme="snow" modules={QUILL_MODULES} formats={QUILL_FORMATS} className="react-quill-editor" />
          )}
        </Form.Item>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <Button onClick={onCancel}>Скасувати</Button>
          <Button type="primary" htmlType="submit" loading={isSaving}>
            {mode === "add" ? "Додати блок" : "Зберегти зміни"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ContentEditorModal;
