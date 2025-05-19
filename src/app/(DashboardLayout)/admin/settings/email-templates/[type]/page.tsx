"use client";
import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  TextField,
  Button,
  Divider,
  Paper,
  Chip,
  Tooltip,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import { IconDeviceFloppy, IconArrowLeft, IconRefresh, IconCode, IconEye, IconHtml } from "@tabler/icons-react";
import PageContainer from "@/component/container/PageContainer";
import DashboardCard from "@/component/shared/DashboardCard";
import { useGetEmailTemplateByType, useUpdateEmailTemplate } from "@/hooks/emailTemplate";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

// Custom TabPanel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`editor-tabpanel-${index}`}
      aria-labelledby={`editor-tab-${index}`}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && (
        <Box sx={{ p: 0, height: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function EmailTemplateEditPage({ params }: { params: { type: string } }) {
  const router = useRouter();
  const { type } = params;

  const { data: response, isLoading } = useGetEmailTemplateByType(type);
  const { mutate: updateTemplate, isPending } = useUpdateEmailTemplate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [newVariable, setNewVariable] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [editorTab, setEditorTab] = useState(0);
  const [previewHtml, setPreviewHtml] = useState("");

  useEffect(() => {
    if (response?.data) {
      const template = response.data;
      setName(template.name || "");
      setDescription(template.description || "");
      setSubject(template.subject || "");
      setHtmlContent(template.htmlContent || "");
      setPreviewHtml(template.htmlContent || "");
      setVariables(template.variables || {});
    }
  }, [response]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    if (newValue === 1) {
      setPreviewHtml(htmlContent);
    }
    setEditorTab(newValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError("");

    try {
      updateTemplate(
        {
          type,
          payload: {
            name,
            description,
            subject,
            htmlContent,
            variables,
          },
        },
        {
          onSuccess: () => {
            setSuccess(true);
            toast.success("Cập nhật template email thành công!");
          },
          onError: (err: any) => {
            if (err.response?.data?.message && Array.isArray(err.response.data.message)) {
              const errorMessages = err.response.data.message.join(", ");
              setError(errorMessages);
              toast.error(errorMessages);
            } else {
              setError(err.message || "Có lỗi xảy ra khi cập nhật template email");
              toast.error(err.message || "Có lỗi xảy ra khi cập nhật template email");
            }
          },
        }
      );
    } catch (err: any) {
      if (err.response?.data?.message && Array.isArray(err.response.data.message)) {
        const errorMessages = err.response.data.message.join(", ");
        setError(errorMessages);
        toast.error(errorMessages);
      } else {
        setError(err.message || "Có lỗi xảy ra khi cập nhật template email");
        toast.error(err.message || "Có lỗi xảy ra khi cập nhật template email");
      }
    }
  };

  // Insert a variable into the HTML content
  const insertVariable = (variable: string) => {
    setHtmlContent((prev) => prev + `{{${variable}}}`);
  };

  // Insert a basic email template
  const insertBasicTemplate = () => {
    const basicTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 1px solid #eeeeee;
    }
    .content {
      padding: 20px 0;
    }
    .footer {
      padding-top: 20px;
      border-top: 1px solid #eeeeee;
      text-align: center;
      font-size: 12px;
      color: #1000;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #4CAF50;
      color: white;
      text-decoration: none;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Tiêu đề email</h2>
    </div>
    <div class="content">
      <p>Xin chào {{shopName}},</p>
      <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
      <p>Nội dung email ở đây...</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="#" class="button">Nút hành động</a>
      </div>
    </div>
    <div class="footer">
      <p>© 2024 Tên công ty. Tất cả các quyền được bảo lưu.</p>
      <p>Địa chỉ công ty, Số điện thoại, Email</p>
    </div>
  </div>
</body>
</html>
    `;

    if (htmlContent.trim() === '' || confirm('Bạn có chắc chắn muốn thay thế nội dung hiện tại bằng mẫu mới?')) {
      setHtmlContent(basicTemplate);
      setPreviewHtml(basicTemplate);
    }
  };

  // Thêm hàm để thêm biến mới vào danh sách
  const addVariable = () => {
    if (newVariable.trim() !== "") {
      setVariables((prev) => ({ ...prev, [newVariable]: "" }));
      setNewVariable("");
    }
  };

  return (
    <PageContainer
      title="Chỉnh sửa Template Email"
      description="Chỉnh sửa nội dung template email"
    >


      <DashboardCard
        title="Chỉnh sửa Template Email"
        action={
          <Chip
            label={type}
            color="primary"
            size="small"
          />
        }
      >
        <>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<IconArrowLeft size={18} />}
              onClick={() => router.push("/admin/settings/email-templates")}
            >
              Quay lại danh sách
            </Button>
          </Box>
          {isLoading ? (
            <Box sx={{ p: 5, textAlign: "center" }}>
              <CircularProgress />
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <Box className="space-y-4">
                <Box >
                  <TextField
                    label="Tên Template"
                    size="small"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Box>
                <Box >
                  <TextField
                    size="small"
                    label="Tiêu đề Email"
                    fullWidth
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </Box>
                <Box >
                  <TextField
                    size="small"
                    label="Mô tả"
                    fullWidth
                    multiline
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Box>
                <Box >
                  <Typography variant="subtitle1" gutterBottom>
                    Biến có thể sử dụng trong template
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                    {Object.entries(variables).map(([key, desc]) => (
                      <Tooltip key={key} title={desc}>
                        <Chip
                          label={`{{${key}}}`}
                          size="small"
                          onClick={() => insertVariable(key)}
                          color="primary"
                          variant="outlined"
                          sx={{ cursor: 'pointer' }}
                        />
                      </Tooltip>
                    ))}
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <TextField
                      size="small"
                      label="Thêm biến mới"
                      value={newVariable}
                      onChange={(e) => setNewVariable(e.target.value)}
                      fullWidth
                    />
                    <Button variant="contained" onClick={addVariable}>
                      Thêm
                    </Button>
                  </Box>

                  <Paper variant="outlined" sx={{ p: 0, minHeight: 400 }}>
                    <Box 
                    className="flex items-center justify-between"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}>
                      <Tabs 
                      className="w-fit h-fit"
                      value={editorTab} onChange={handleTabChange} aria-label="email template editor tabs">
                        <Tab
                          icon={<IconCode size="18" />}
                          iconPosition="start"
                          label="HTML"
                          id="editor-tab-0"
                          aria-controls="editor-tabpanel-0"
                        />
                        <Tab
                          icon={<IconEye size="18" />}
                          iconPosition="start"
                          label="Xem trước"
                          id="editor-tab-1"
                          aria-controls="editor-tabpanel-1"
                        />
                      </Tabs>
                      {editorTab === 0 && (
                          <Box className="flex items-center justify-end flex-1 w-full h-full gap-4 pr-4">
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => setPreviewHtml(htmlContent)}
                              startIcon={<IconEye size="16" />}
                            >
                              Cập nhật xem trước
                            </Button>
                            <Button
                            className="!text-white"
                              size="small"
                              color="secondary"
                              onClick={insertBasicTemplate}
                              variant="contained"
                              startIcon={<IconHtml size="16" />}
                            >
                              Chèn mẫu HTML cơ bản
                            </Button>
                          </Box>
                        )}
                    </Box>

                    <TabPanel value={editorTab} index={0}>

                      <TextField
                        fullWidth
                        multiline
                        rows={15}
                        value={htmlContent}
                        onChange={(e) => setHtmlContent(e.target.value)}
                        variant="outlined"
                        InputProps={{
                          sx: {
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                          }
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { border: 'none' },
                          }
                        }}
                      />
                    </TabPanel>

                    <TabPanel value={editorTab} index={1}>
                      <Box
                        sx={{
                          height: 'calc(15 * 1.5rem + 1rem)',
                          overflow: 'auto',
                          p: 2,
                          bgcolor: '#fff',
                          border: '1px solid #ddd',
                          borderTop: 'none',
                        }}
                      >
                        <div
                          dangerouslySetInnerHTML={{ __html: previewHtml }}
                          style={{ fontFamily: 'Arial, sans-serif' }}
                        />
                      </Box>
                    </TabPanel>
                  </Paper>
                </Box>
              </Box>

              <Divider sx={{ mt: 4, mb: 4 }} />

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<IconRefresh size={18} />}
                  onClick={() => {
                    if (response?.data) {
                      const template = response.data;
                      setName(template.name || "");
                      setDescription(template.description || "");
                      setSubject(template.subject || "");
                      setHtmlContent(template.htmlContent || "");
                      setPreviewHtml(template.htmlContent || "");
                      setVariables(template.variables || {});
                    }
                  }}
                >
                  Khôi phục
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<IconDeviceFloppy size={18} />}
                  disabled={isPending}
                >
                  {isPending ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </Box>
            </form>
          )}
        </>
      </DashboardCard>
    </PageContainer>
  );
} 