import Navbar from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#2C2C2C] flex flex-col font-sans w-full">
      <Navbar />
      {children}
    </div>
  );
}
