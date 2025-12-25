import { JoinSessionForm } from "./components/join-session-form";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { shotglasId } = await searchParams;

  return <JoinSessionForm shotglasId={shotglasId as string | undefined} />;
}
