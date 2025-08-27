import { Auth } from "@/store/auth";
import { axiosClient } from "@/lib/axiosClient";

export default (requiredRole = null) => {
  return async (to, from) => {
    const auth = Auth();
    let userRole = null;

    if (!auth.check()) {
      return { name: 'login' };
    }

    if (requiredRole) {
      await axiosClient.get('user/role').then((response) => {
        if (response.role) {
          userRole = response.role;
        }
      });
  
      if (!requiredRole.includes(userRole)) {
        if (userRole === 'employee') {
          return { name: 'employee.dashboard' };
        }
        
        return { name: 'notFound' };
      }
    }

    if (to.meta?.title) {
      document.title = to.meta?.title
    }
  };
}