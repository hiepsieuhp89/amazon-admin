'use client';

import { LockOutlined, UserOutlined } from '@ant-design/icons';
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
};

const SignInForm = () => {
    const router = useRouter();
    const { mutateAsync, isPending } = useSignIn()
    const { loginUser } = useUser()
    const { handleErrorMessage, handleSuccessMessage } = useContext(MessageClientContext);
    const onFinish: FormProps<FieldType>['onFinish'] = async (values: FieldType) => {
        try {
            const payload: ISignIn = {
                username: values.username,
                password: values.password,
            }

            const response = await mutateAsync(payload);
            if (response?.data?.accessToken) {
                setCookies(response?.data?.accessToken)
                loginUser(response?.data, response?.data?.accessToken)
                handleSuccessMessage('Đăng nhập thành công!');
                router.push('/')
            }
        } catch (error: any) {
            handleErrorMessage(error?.response?.data?.message);
        }
    };

    return (
        <>
            <div className="w-full mb-2">
                <div className='flex justify-center pt-2'>
                    <Image src={'/images/logos/logo.png'} width={100} height={100} alt='logo' />
                </div>
            </div>
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
        </>
    );
};

export default SignInForm;