import { useState, useEffect } from 'react';

type ApiResponse = {
  message: string;
}


export default function DataTest() {

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/employees');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiResponse = await response.json();
        console.log(result);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occured');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [])

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <p>api data here:</p>
      {data.message.map(item => <div key={item.id}>{item.first_name}</div>)}
    </>
  )
}

