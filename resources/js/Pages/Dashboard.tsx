import { useAuth } from '@/hooks';
import { ParentLayout } from '@/Layouts/MainLayout';

export default function Dashboard() {
    // Use auth hook instead of usePage
    const { user, isSuperadmin, isAdmin, isBPP, isPAKPA } = useAuth();

    return (
        <ParentLayout>
            {isSuperadmin() && (
                <div className="py-12">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900">
                                Role Superadmin - Welcome {user?.name}!
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isAdmin() && (
                <div className="py-12">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900">
                                Role Admin - Welcome {user?.name}!
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isBPP() && (
                <div className="py-12">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900">
                                Role BPP - Welcome {user?.name}!
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isPAKPA() && (
                <div className="py-12">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900">
                                Role PA KPA - Welcome {user?.name}!
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ParentLayout>
    );
}
