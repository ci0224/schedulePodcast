import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Doctor Schedule App" },
    { name: "description", content: "Doctor Schedule Management System" },
  ];
}

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login');
  }, [navigate]);

  return null;
}
