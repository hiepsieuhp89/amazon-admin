'use client';

import { ArrowLeftOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, message } from 'antd';
import { useRouter } from 'next/navigation';
import { FormProps } from 'rc-field-form';
import { setCookies } from '@/helper';
import { useContext, useState } from 'react';
import Image from 'next/image';
import { useSignIn } from '@/hooks/authentication';
import { ISignIn } from '@/interface/request/authentication';
import MessageClientContext from '@/providers/MessageProvider';
import { useUser } from '@/context/useUserContext';

type FieldType = {
    username: string;
    password: string;
    otp?: string;
};

interface SignInResponse {
    requireOtp?: boolean;
    message?: string;
    accessToken?: string;
    user?: any;
    username?: string;
}

const SignInForm = () => {
    const router = useRouter();
    const { mutateAsync, isPending } = useSignIn()
    const { loginUser } = useUser()
    const { handleErrorMessage, handleSuccessMessage } = useContext(MessageClientContext);
    const [requireOtp, setRequireOtp] = useState(false);
    const [credentials, setCredentials] = useState<{ username: string; password: string }>({ username: '', password: '' });

    const onFinish: FormProps<FieldType>['onFinish'] = async (values: FieldType) => {
        try {
            const payload: ISignIn = {
                username: values.username,
                password: values.password,
            }

            setCredentials({ username: values.username, password: values.password });

            const response = await mutateAsync(payload);
            const responseData = response?.data as SignInResponse;
            
            if (responseData?.requireOtp) {
                setRequireOtp(true);
                handleSuccessMessage(responseData.message || 'Vui lòng nhập mã OTP');
            } else if (responseData?.accessToken) {
                setCookies(responseData.accessToken)
                loginUser(responseData, responseData.accessToken)
                handleSuccessMessage('Đăng nhập thành công!');
                router.push('/')
            }
        } catch (error: any) {
            handleErrorMessage(error?.response?.data?.message);
        }
    };

    const onOtpFinish: FormProps<FieldType>['onFinish'] = async (values: FieldType) => {
        try {
            const payload: ISignIn = {
                username: credentials.username,
                password: credentials.password,
                otp: values.otp,
            }

            const response = await mutateAsync(payload);
            const responseData = response?.data as SignInResponse;
            
            if (responseData?.accessToken) {
                setCookies(responseData.accessToken)
                loginUser(responseData, responseData.accessToken)
                handleSuccessMessage('Đăng nhập thành công!');
                router.push('/')
            } else if (responseData?.message) {
                handleSuccessMessage(responseData.message);
            }
        } catch (error: any) {
            handleErrorMessage(error?.response?.data?.message);
        }
    };

    const handleBack = () => {
        setRequireOtp(false);
    };

    return (
        <>
            <div className="w-full mb-2">
                <div className='flex justify-center pt-2'>
                    <Image src={'/images/logos/logo.png'} width={100} height={100} alt='logo' />
                </div>
            </div>
            
            {!requireOtp ? (
                <Form
                    name="normal_login"
                    className="login-form"
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            type="password"
                            placeholder="Mật khẩu"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="login-form-button bg-[#17A2B8] w-full uppercase font-bold h-[40px]"
                            loading={isPending}
                        >
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>
            ) : (
                <Form
                    name="otp_form"
                    className="otp-form"
                    onFinish={onOtpFinish}
                >
                    <div className="mb-4">
                        <p className="mb-4 text-sm font-semibold text-center text-white uppercase">Vui lòng nhập mã OTP của bạn</p>
                    </div>
                    
                    <Form.Item
                        name="otp"
                        rules={[{ required: true, message: 'Vui lòng nhập mã OTP!' }]}
                    >
                        <Input 
                            prefix={<LockOutlined />} 
                            placeholder="Mã OTP" 
                            autoFocus
                        />
                    </Form.Item>

                    <Form.Item className='w-full'>
                        <div className='grid w-full grid-cols-2 gap-2'>
                        <Button 
                            icon={<ArrowLeftOutlined />} 
                            type="primary" 
                            onClick={handleBack}
                            className="bg-[#17A2B8] uppercase font-medium h-[40px] text-white"
                        >
                            Quay lại
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="login-form-button bg-[#17A2B8] w-full uppercase font-medium h-[40px]"
                            loading={isPending}
                        >
                            Gửi
                        </Button>
                        </div>
                    </Form.Item>
                </Form>
            )}
        </>
    );
};

export default SignInForm;