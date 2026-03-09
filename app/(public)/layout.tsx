
import Topbar from "@/components/Topbar";
import Footer from "@/components/Footer";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <Topbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}
