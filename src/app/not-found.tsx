// pages/404.tsx hoặc app/not-found.tsx
import { Button } from 'antd';
import Link from 'next/link';
import Layout from './(DashboardLayout)/layout';

export default function NotFound() {
  return (
    <Layout> {/* Sử dụng layout chung của ứng dụng */}
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center">

          {/* Nội dung */}
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Tính năng đang bảo trì
          </h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Chúng tôi đang nâng cấp tính năng này để mang lại trải nghiệm tốt hơn. 
            Vui lòng quay lại sau.
          </p>

          {/* Button quay về trang chủ */}
          <Link href="/">
            <Button 
              type="primary"
              size="large"
              className="bg-[#1677ff] hover:bg-[#4096ff]"
            >
              Quay về trang chủ
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
