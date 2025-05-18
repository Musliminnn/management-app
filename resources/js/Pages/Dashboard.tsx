import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { RoleEnum } from '@/types/enums';
import { usePage } from '@inertiajs/react';

export default function Dashboard() {
    const { auth } = usePage().props;
    const user = auth?.user;
    console.log(user);
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            {user?.role?.name === RoleEnum.Superadmin && (
                <div className="py-12">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900">
                                Role Superadmin
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {user?.role?.name === RoleEnum.Admin && (
                <div className="py-12">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900">Role Admin</div>
                        </div>
                    </div>
                </div>
            )}

            {user?.role?.name === RoleEnum.BPP && (
                <div className="py-12">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900">Role BPP</div>
                        </div>
                    </div>
                </div>
            )}

            {user?.role?.name === RoleEnum.PAKPA && (
                <div className="py-12">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900">Role PA KPA</div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
