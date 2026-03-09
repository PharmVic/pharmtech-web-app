import Topbar from "@/components/Topbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <Topbar />
            <main className="flex-1">{children}</main>
        </div>
    );
}
