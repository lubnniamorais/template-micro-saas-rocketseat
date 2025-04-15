import { auth } from "@/app/lib/auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  // Estamos no lado do servidor
  const session = await auth();

  if(!session) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">Protected Dashboard</h1>

      <p>{session?.user?.email ? session?.user?.email : "Usuário não está logado!"}</p>
    </div>
  );
}


