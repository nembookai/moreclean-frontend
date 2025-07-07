import { Auth } from "@/store/auth";

export default (to, from) => {
  const auth = Auth();

  if ( auth.check() ) {
    return { name: 'dashboard' };
  }
}