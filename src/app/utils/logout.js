import { useRouter } from 'next/navigation';

export function useLogout() {
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const logout = async () => {
    const accessToken = localStorage.getItem('access-token');
    const client = localStorage.getItem('client');
    const uid = localStorage.getItem('uid');

    try {
      const response = await fetch(`${apiUrl}/auth/sign_out`, {
        method: 'DELETE',
        headers: {
          'access-token': accessToken,
          'client': client,
          'uid': uid,
        },
      });

      if (!response.ok) throw new Error('Error while logging out');

      localStorage.removeItem('access-token');
      localStorage.removeItem('client');
      localStorage.removeItem('uid');

      router.push('/sign_in');
    } catch (error) {
      console.error(error);
      alert('Error while logging out. Try again.');
    }
  };

  return logout;
}