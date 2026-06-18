import { Navigate, useLocation } from "react-router";
import { session } from "@/utils";
import type { ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * 路由守卫 — 未登录用户重定向到 /login
 * 登录后自动跳回原来要访问的页面
 */
function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation();
  const auth = session.getSession();

  if (!auth) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}

export default AuthGuard;
