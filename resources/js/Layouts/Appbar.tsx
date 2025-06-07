import Dropdown from '@/Components/Dropdown';
import { usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';

interface AppbarProps {
    onToggleSidebar?: () => void;
    userName?: string;
}

export const Appbar = ({ onToggleSidebar }: AppbarProps) => {
    const { auth } = usePage().props;
    const user = auth?.user;
    return (
        <header className="flex h-16 w-full items-center justify-between bg-white px-4 shadow">
            <div className="flex items-center gap-3">
                {onToggleSidebar && (
                    <button
                        className="rounded p-2 hover:bg-gray-100 md:hidden"
                        onClick={onToggleSidebar}
                    >
                        <Menu size={20} />
                    </button>
                )}
                <span className="text-lg font-semibold text-gray-800">
                    My Application
                </span>
            </div>

            <div className="hidden sm:ms-6 sm:flex sm:items-center">
                <div className="relative ms-3">
                    <Dropdown>
                        <Dropdown.Trigger>
                            <span className="inline-flex rounded-md">
                                <button
                                    type="button"
                                    className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                >
                                    <span className="hidden text-sm text-gray-700 sm:block">
                                        Hello, {user.name}
                                    </span>
                                    <div className="h-8 w-8 rounded-full bg-gray-300 mx-1" />

                                    
                                </button>
                            </span>
                        </Dropdown.Trigger>

                        <Dropdown.Content>
                            {/* <Dropdown.Link href={route('profile.edit')}>
                                Profile
                            </Dropdown.Link> */}
                            <Dropdown.Link
                                href={route('logout')}
                                method="post"
                                as="button"
                            >
                                Log Out
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </div>
        </header>
    );
};
